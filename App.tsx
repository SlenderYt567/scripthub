import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ScriptCard from './components/ScriptCard';
import PublishModal from './components/PublishModal';
import GatewayModal from './components/GatewayModal';
import ExecutorsView from './components/ExecutorsView';
import ScriptDetails from './components/ScriptDetails';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import AboutView from './components/AboutView';
import SlenderHubView from './components/SlenderHubView';
import { Script } from './types';
import { Layers, Loader2, TrendingUp, Flame, Sparkles } from 'lucide-react';
import { useScripts } from './hooks/useScripts';
import { useAuth } from './hooks/useAuth';
import { useExecutors } from './hooks/useExecutors';

type View = 'scripts' | 'executors' | 'details' | 'admin' | 'profile' | 'settings' | 'about' | 'slenderhub' | 'notFound';

const viewPaths: Record<Exclude<View, 'details' | 'notFound'>, string> = {
  scripts: '/',
  executors: '/executors',
  admin: '/admin',
  profile: '/profile',
  settings: '/settings',
  about: '/about',
  slenderhub: '/slenderhub',
};

const validViews = Object.keys(viewPaths) as Exclude<View, 'details' | 'notFound'>[];

const getRoute = (): { view: View; scriptId?: string; profileName?: string } => {
  const params = new URLSearchParams(window.location.search);
  const legacyScriptId = params.get('id');
  const legacyView = params.get('view');
  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  if (legacyScriptId) return { view: 'details', scriptId: legacyScriptId };
  if (legacyView && validViews.includes(legacyView as Exclude<View, 'details' | 'notFound'>)) {
    return { view: legacyView as Exclude<View, 'details' | 'notFound'> };
  }
  if (path.startsWith('/script/')) {
    return { view: 'details', scriptId: decodeURIComponent(path.slice('/script/'.length)) };
  }
  if (path.startsWith('/profile/')) {
    return { view: 'profile', profileName: decodeURIComponent(path.slice('/profile/'.length)) };
  }

  const view = validViews.find((candidate) => viewPaths[candidate] === path);
  return { view: view ?? 'notFound' };
};

const getPath = (view: View, scriptId?: string) => {
  if (view === 'details') return scriptId ? `/script/${encodeURIComponent(scriptId)}` : '/';
  if (view === 'profile') return scriptId ? `/profile/${encodeURIComponent(scriptId)}` : '/';
  if (view === 'notFound') return '/';
  return viewPaths[view];
};

const App: React.FC = () => {
  const {
    scripts,
    setScripts,
    loading: scriptsLoading,
    searchQuery,
    setSearchQuery,
    filteredScripts,
    trendingScripts,
    featuredScripts,
    refreshScripts
  } = useScripts();

  const { user, isAdmin, loading: authLoading } = useAuth();
  const { executors, setExecutors, loading: executorsLoading, refreshExecutors } = useExecutors();

  const loading = scriptsLoading || authLoading || executorsLoading;

  // Navigation State
  const [currentView, setCurrentView] = useState<View>('scripts');

  // Modal & Selection States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [scriptToEdit, setScriptToEdit] = useState<Script | null>(null);
  const [viewProfileAuthor, setViewProfileAuthor] = useState('');

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#')) {
      const cleanHash = hash.replace(/^#\/?/, '');
      if (cleanHash && validViews.includes(cleanHash as Exclude<View, 'details' | 'notFound'>)) {
        window.history.replaceState({}, '', getPath(cleanHash as Exclude<View, 'details' | 'notFound'>));
        return;
      }
    }

    if (window.location.search) {
      const route = getRoute();
      window.history.replaceState({}, '', getPath(route.view, route.scriptId ?? route.profileName));
    }
  }, []);

  const updateURL = (view: string, id?: string) => {
    try {
      window.history.pushState({}, '', getPath(view as View, id));
    } catch (e) {
      console.error('URL update failed', e);
    }
  };

  useEffect(() => {
    const titleByView: Record<View, string> = {
      scripts: 'Script Hub - Roblox Scripts',
      executors: 'Executors - Script Hub',
      details: selectedScript ? `${selectedScript.title} - Script Hub` : 'Script Details - Script Hub',
      admin: 'Admin - Script Hub',
      profile: viewProfileAuthor ? `${viewProfileAuthor} - Script Hub` : 'Profile - Script Hub',
      settings: 'Settings - Script Hub',
      about: 'Network - Script Hub',
      slenderhub: 'SlenderHub - Premium Roblox Script',
      notFound: 'Page Not Found - Script Hub',
    };
    const pageUrl = `${window.location.origin}${window.location.pathname}`;

    document.title = titleByView[currentView];
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', pageUrl);
    document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', pageUrl);
    document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', titleByView[currentView]);
  }, [currentView, selectedScript, viewProfileAuthor]);


  useEffect(() => {
    const applyRoute = () => {
      const { view, scriptId, profileName } = getRoute();

      if (scriptId && scripts.length > 0) {
        const script = scripts.find(s => s.id === scriptId);
        if (script) {
          setSelectedScript(script);
          setCurrentView('details');
        } else {
          setSelectedScript(null);
          setCurrentView('notFound');
        }
      } else if (view === 'profile' && profileName) {
        setViewProfileAuthor(profileName);
        setSelectedScript(null);
        setCurrentView('profile');
      } else if (view === 'admin' && !isAdmin) {
        setCurrentView('scripts');
      } else {
        setCurrentView(view);
        setSelectedScript(null);
      }
    };

    applyRoute();
    window.addEventListener('popstate', applyRoute);
    return () => window.removeEventListener('popstate', applyRoute);
  }, [scripts.length > 0, isAdmin]);

  const handlePublish = async () => {
    setScriptToEdit(null);
    await refreshScripts();
  };

  const handleEditScript = (script: Script) => {
    setScriptToEdit(script);
    setIsPublishOpen(true);
  };

  const handleScriptClick = (script: Script) => {
    setSelectedScript(script);
    setCurrentView('details');
    updateURL('details', script.id);
    window.scrollTo(0, 0);
  };

  const handleAuthorClick = (authorName: string) => {
    setViewProfileAuthor(authorName);
    setCurrentView('profile');
    updateURL('profile', authorName);
    window.scrollTo(0, 0);
  };

  const handleGetScriptFromDetails = () => {
    setIsGatewayOpen(true);
  };

  const handleBackToHub = () => {
    setCurrentView('scripts');
    setSelectedScript(null);
    updateURL('scripts');
  };

  const handleChangeView = (view: any) => {
    if (view === 'admin' && !isAdmin) return;
    setCurrentView(view);
    if (view === 'scripts' || view === 'executors') {
      setSelectedScript(null);
      updateURL(view);
    } else {
      updateURL(view);
    }
  };

  const handleOpenPublish = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setIsPublishOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-sans selection:bg-white/10 selection:text-white">

      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenPublish={handleOpenPublish}
        currentView={currentView}
        setCurrentView={handleChangeView}
        isAdmin={isAdmin}
        user={user}
        onLoginClick={() => setIsAuthModalOpen(true)}
      />

      <main className="container mx-auto px-4 py-8">

        {/* VIEW: SCRIPTS FEED */}
        {currentView === 'scripts' && (
          <div className="animate-fade-in space-y-12">

            {/* HER0 & FEATURED VITRINE */}
            {searchQuery === '' && (
              <div className="relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-10 mb-12">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.03] rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

                <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
                  <div className="w-full lg:w-1/2 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-medium tracking-wide">
                      <Sparkles size={14} /> NEW INFRASTRUCTURE
                    </div>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tighter leading-[1.1]">
                      Deploy Secure <br />
                      <span className="text-zinc-500">
                        Scripts & Hubs
                      </span>
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-md font-medium">
                      The premier database for execution tools. High performance, keyless infrastructure, and verified releases.
                    </p>
                    <div className="pt-4 flex gap-4">
                      <button
                        onClick={() => document.getElementById('browse-scripts')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-8 py-3.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                        Explore Directory
                      </button>
                    </div>
                  </div>

                  <div className="w-full lg:w-1/2">
                    <div className="flex items-center gap-2 mb-6">
                      <Layers className="text-zinc-400" size={20} />
                      <h2 className="text-sm font-semibold text-zinc-400 tracking-[0.2em] uppercase">Featured Vitrine</h2>
                    </div>

                    {loading ? (
                      <div className="h-48 flex items-center justify-center">
                        <Loader2 className="animate-spin text-emerald-500" size={32} />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {featuredScripts.slice(0, 3).map(script => (
                          <div key={`featured-${script.id}`} className="transform hover:-translate-y-1 transition-transform duration-300">
                            <ScriptCard
                              script={script}
                              onClick={handleScriptClick}
                              onAuthorClick={handleAuthorClick}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SEARCH RESULTS OR ALL SCRIPTS */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={48} className="animate-spin text-emerald-500" />
              </div>
            ) : (
              <div id="browse-scripts">
                <div className="flex items-center gap-3 mb-8 pb-4">
                  <h2 className="text-2xl font-semibold text-white tracking-tight">
                    {searchQuery ? `Search Results for "${searchQuery}"` : 'Recent Uploads'}
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
                </div>

                {filteredScripts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredScripts.map((script) => (
                      <ScriptCard
                        key={script.id}
                        script={script}
                        onClick={handleScriptClick}
                        onAuthorClick={handleAuthorClick}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                    <Layers size={48} className="mb-4 opacity-50 text-indigo-400" />
                    <p className="text-lg font-medium text-slate-400">No scripts found matching "{searchQuery}"</p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                    >
                      Clear Search Flags
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW: EXECUTORS */}
        {currentView === 'executors' && (
          <ExecutorsView executors={executors} loading={loading} />
        )}

        {/* VIEW: ADMIN DASHBOARD */}
        {currentView === 'admin' && isAdmin && (
          <AdminDashboard
            scripts={scripts}
            setScripts={setScripts}
            executors={executors}
            setExecutors={setExecutors}
            onEditScript={handleEditScript}
          />
        )}

        {/* VIEW: SCRIPT DETAILS */}
        {currentView === 'details' && selectedScript && (
          <ScriptDetails
            script={selectedScript}
            onBack={handleBackToHub}
            onGetScript={handleGetScriptFromDetails}
            isAdmin={isAdmin}
            user={user}
            onEdit={handleEditScript}
          />
        )}

        {/* VIEW: PUBLIC PROFILE */}
        {currentView === 'profile' && viewProfileAuthor && (
          <ProfileView
            authorName={viewProfileAuthor}
            onScriptClick={handleScriptClick}
            onBack={handleBackToHub}
          />
        )}

        {/* VIEW: NOT FOUND */}
        {currentView === 'notFound' && (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Page not found</h1>
            <p className="mt-4 max-w-md text-zinc-500 font-medium">This route does not exist or the script is no longer available.</p>
            <button
              onClick={handleBackToHub}
              className="mt-8 px-8 py-3.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-full transition-all active:scale-95"
            >
              Back to Index
            </button>
          </div>
        )}

        {/* VIEW: SETTINGS */}
        {currentView === 'settings' && user && (
          <SettingsView user={user} />
        )}

        {/* VIEW: ABOUT */}
        {currentView === 'about' && (
          <AboutView onBack={handleBackToHub} />
        )}

        {/* VIEW: SLENDERHUB (Official Scripts Only) */}
        {currentView === 'slenderhub' && (
          <SlenderHubView />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black mt-auto py-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="container mx-auto px-4 flex flex-col items-center text-zinc-500 text-sm">
          <div className="flex items-center gap-2 mb-6 font-semibold text-xl tracking-tight text-white">
            <Layers className="text-white" size={24} />
            SlenderHub
          </div>
          <p>&copy; {new Date().getFullYear()} Script Hub. All rights reserved.</p>
          <p className="mt-2 text-xs text-slate-600 max-w-md text-center">Disclaimer: This platform is for educational purposes only. Users are responsible for their own actions.</p>
        </div>
      </footer>

      {/* Modals */}
      <PublishModal
        isOpen={isPublishOpen}
        onClose={() => {
          setIsPublishOpen(false);
          setScriptToEdit(null);
        }}
        onPublish={handlePublish}
        isAdmin={isAdmin}
        scriptToEdit={scriptToEdit}
      />

      <GatewayModal
        script={selectedScript}
        isOpen={isGatewayOpen}
        onClose={() => setIsGatewayOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default App;
