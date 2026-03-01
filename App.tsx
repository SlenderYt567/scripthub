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
import { Script } from './types';
import { Layers, Loader2, TrendingUp, Flame, Sparkles } from 'lucide-react';
import { useScripts } from './hooks/useScripts';
import { useAuth } from './hooks/useAuth';
import { useExecutors } from './hooks/useExecutors';

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
  const [currentView, setCurrentView] = useState<'scripts' | 'executors' | 'details' | 'admin' | 'profile' | 'settings' | 'about' | 'slenderhub'>('scripts');

  // Modal & Selection States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [scriptToEdit, setScriptToEdit] = useState<Script | null>(null);
  const [viewProfileAuthor, setViewProfileAuthor] = useState('');

  // Sync state to URL 
  const updateURL = (view: string, id?: string) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      url.searchParams.delete('id');

      if (id) {
        url.searchParams.set('id', id);
      } else if (view !== 'scripts') {
        url.searchParams.set('view', view);
      }

      window.history.pushState({}, '', url.toString());
    } catch (e) {
      console.error('URL update failed', e);
    }
  };

  // URL Parameter Handling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') as any;
    const scriptId = params.get('id');

    if (scriptId && scripts.length > 0) {
      const script = scripts.find(s => s.id === scriptId);
      if (script) {
        setSelectedScript(script);
        setCurrentView('details');
      }
    } else if (view && ['scripts', 'executors', 'admin', 'profile', 'settings', 'about', 'slenderhub'].includes(view)) {
      if (view === 'admin' && !isAdmin) {
        setCurrentView('scripts');
      } else {
        setCurrentView(view);
      }
    }

    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search);
      const v = p.get('view') || 'scripts';
      const sid = p.get('id');

      if (sid && scripts.length > 0) {
        const script = scripts.find(s => s.id === sid);
        if (script) {
          setSelectedScript(script);
          setCurrentView('details');
        }
      } else {
        setCurrentView(v as any);
        setSelectedScript(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">

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
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-8 mb-12">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-full md:w-1/3 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
                      <Sparkles size={14} /> NOVO LAYOUT V2
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                      Find The Ultimate <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">
                        Scripts & Exploits
                      </span>
                    </h1>
                    <p className="text-slate-400 text-sm max-w-sm">
                      Explore the premier database for Roblox scripts. High performance, keyless options, and verified official releases.
                    </p>
                    <div className="pt-4 flex gap-3">
                      <button
                        onClick={() => document.getElementById('browse-scripts')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        Browse All
                      </button>
                    </div>
                  </div>

                  <div className="w-full md:w-2/3">
                    <div className="flex items-center gap-2 mb-4">
                      <Flame className="text-orange-500" fill="currentColor" size={20} />
                      <h2 className="text-lg font-bold text-white tracking-wide uppercase font-mono">Featured Vitrine</h2>
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
                <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
                  <Layers className={searchQuery ? "text-indigo-400" : "text-emerald-400"} />
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {searchQuery ? `Search Results for "${searchQuery}"` : 'Recent Uploads'}
                  </h2>
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
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Flame className="text-emerald-400" size={32} />
                <h1 className="text-3xl font-black text-white tracking-tight">SlenderHub Official</h1>
              </div>
              <p className="text-slate-400">Verified and official scripts curated by the SlenderHub team</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-emerald-500" size={40} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {scripts.filter(s => s.isOfficial).length === 0 ? (
                  <div className="col-span-full text-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                    <Layers className="mx-auto text-slate-700 mb-4" size={64} />
                    <p className="text-slate-500 font-medium">No official scripts yet</p>
                  </div>
                ) : (
                  scripts.filter(s => s.isOfficial).map(script => (
                    <ScriptCard
                      key={script.id}
                      script={script}
                      onClick={() => handleScriptClick(script)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 mt-auto py-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
        <div className="container mx-auto px-4 flex flex-col items-center text-slate-500 text-sm">
          <div className="flex items-center gap-2 mb-4 font-black text-xl tracking-tighter text-white">
            <Layers className="text-emerald-500" size={24} />
            Slender<span className="text-emerald-500">Hub</span>
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