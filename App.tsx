import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ScriptCard from './components/ScriptCard';
import PublishModal from './components/PublishModal';
import GatewayModal from './components/GatewayModal';
import AuthModal from './components/AuthModal';
import { Script } from './types';
import { Layers, Loader2, TrendingUp, Flame, Sparkles } from 'lucide-react';
import { fetchScriptById, useScripts } from './hooks/useScripts';
import { useAuth } from './hooks/useAuth';
import { useExecutors } from './hooks/useExecutors';

const ExecutorsView = lazy(() => import('./components/ExecutorsView'));
const ScriptDetails = lazy(() => import('./components/ScriptDetails'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const ProfileView = lazy(() => import('./components/ProfileView'));
const SettingsView = lazy(() => import('./components/SettingsView'));
const AboutView = lazy(() => import('./components/AboutView'));
const SlenderHubView = lazy(() => import('./components/SlenderHubView'));

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
  const [currentView, setCurrentView] = useState<View>('scripts');
  const { user, isAdmin, loading: authLoading } = useAuth();
  const {
    scripts,
    adminScripts,
    setAdminScripts,
    loading: scriptsLoading,
    loadingMore,
    error: scriptsError,
    searchQuery,
    setSearchQuery,
    gameFilter,
    setGameFilter,
    accessFilter,
    setAccessFilter,
    verifiedOnly,
    setVerifiedOnly,
    sortBy,
    setSortBy,
    totalCount,
    hasMore,
    featuredScripts,
    loadMore,
    refreshScripts
  } = useScripts(currentView === 'admin' && isAdmin);

  const { executors, setExecutors, loading: executorsLoading, refreshExecutors } = useExecutors();

  const loading = scriptsLoading;
  const [detailsLoading, setDetailsLoading] = useState(false);
  const detailCache = useRef(new Map<string, Script>());

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
      profile: viewProfileAuthor && !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(viewProfileAuthor) ? `${viewProfileAuthor} - Script Hub` : 'Profile - Script Hub',
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
    let cancelled = false;
    const applyRoute = async () => {
      const { view, scriptId, profileName } = getRoute();

      if (scriptId) {
        setCurrentView('details');
        const cached = scripts.find(s => s.id === scriptId) || detailCache.current.get(scriptId);
        if (cached) {
          setSelectedScript(cached);
        } else {
          setSelectedScript(null);
          setDetailsLoading(true);
          try {
            const script = await fetchScriptById(scriptId);
            if (cancelled) return;
            if (script) {
              detailCache.current.set(scriptId, script);
              setSelectedScript(script);
            } else setCurrentView('notFound');
          } catch {
            if (!cancelled) setCurrentView('notFound');
          } finally {
            if (!cancelled) setDetailsLoading(false);
          }
        }
      } else if (view === 'profile' && profileName) {
        setViewProfileAuthor(profileName);
        setSelectedScript(null);
        setCurrentView('profile');
      } else if (view === 'admin' && !isAdmin && !authLoading) {
        setCurrentView('scripts');
      } else {
        setCurrentView(view);
        setSelectedScript(null);
      }
    };

    void applyRoute();
    const onPopState = () => { void applyRoute(); };
    window.addEventListener('popstate', onPopState);
    return () => { cancelled = true; window.removeEventListener('popstate', onPopState); };
  }, [scripts, isAdmin, authLoading]);

  const handlePublish = async (script: Script) => {
    detailCache.current.set(script.id, script);
    setSelectedScript(current => current?.id === script.id ? script : current);
    setScriptToEdit(null);
    await refreshScripts();
  };

  const handleEditScript = (script: Script) => {
    setScriptToEdit(script);
    setIsPublishOpen(true);
  };

  const handleScriptClick = (script: Script) => {
    detailCache.current.set(script.id, script);
    setSelectedScript(script);
    setCurrentView('details');
    updateURL('details', script.id);
    window.scrollTo(0, 0);
  };

  const handleAuthorClick = (script: Script) => {
    const authorKey = script.author_id || script.author;
    setViewProfileAuthor(authorKey);
    setCurrentView('profile');
    updateURL('profile', authorKey);
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
    <div className="min-h-screen overflow-x-hidden bg-black text-zinc-200 font-sans selection:bg-white/10 selection:text-white">

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
        <Suspense fallback={<div className="flex justify-center py-24" role="status"><Loader2 className="animate-spin text-white" size={36} /><span className="sr-only">Loading page</span></div>}>

        {/* VIEW: SCRIPTS FEED */}
        {currentView === 'scripts' && (
          <div className="animate-fade-in space-y-12">

            {/* HER0 & FEATURED VITRINE */}
            {searchQuery === '' && (
              <div className="relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-6 sm:p-10 mb-12">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.03] rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

                <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
                  <div className="min-w-0 w-full lg:w-1/2 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-medium tracking-wide">
                      <Sparkles size={14} /> NEW INFRASTRUCTURE
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tighter leading-[1.1]">
                      Explore Roblox <br />
                      <span className="text-zinc-500">
                        Scripts & Hubs
                      </span>
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-md font-medium">
                      Browse scripts by game, find executor listings, and report links that need review.
                    </p>
                    <div className="pt-4 flex gap-4">
                      <button
                        onClick={() => document.getElementById('browse-scripts')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-8 py-3.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                        Explore Directory
                      </button>
                    </div>
                  </div>

                  <div className="min-w-0 w-full lg:w-1/2">
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
            ) : scriptsError ? (
              <div role="alert" className="rounded-3xl border border-rose-500/20 bg-rose-500/5 px-8 py-12 text-center">
                <h2 className="text-xl font-semibold text-white">Scripts could not be loaded</h2>
                <p className="mt-2 text-zinc-400">Check your connection and try again.</p>
                <button onClick={refreshScripts} className="mt-6 rounded-full bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200">Try again</button>
              </div>
            ) : (
              <div id="browse-scripts">
                <div className="flex flex-wrap items-center gap-3 mb-6 pb-4">
                  <h2 className="text-2xl font-semibold text-white tracking-tight">
                    {searchQuery ? `Search Results for "${searchQuery}"` : 'Recent Uploads'}
                  </h2>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-zinc-400">{totalCount} scripts</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
                </div>

                <div className="mb-7 flex flex-wrap items-center gap-3" aria-label="Filter scripts">
                  <input value={gameFilter} onChange={event => setGameFilter(event.target.value)} aria-label="Filter by game" placeholder="Filter by game"
                    className="min-w-0 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-white/30" />
                  <select value={accessFilter} onChange={event => setAccessFilter(event.target.value as 'all' | 'free' | 'keyed')} aria-label="Access type"
                    className="rounded-full border border-white/10 bg-zinc-950 px-4 py-2 text-sm text-white">
                    <option value="all">All access</option><option value="free">Keyless</option><option value="keyed">Key required</option>
                  </select>
                  <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300">
                    <input type="checkbox" checked={verifiedOnly} onChange={event => setVerifiedOnly(event.target.checked)} /> Verified only
                  </label>
                </div>

                {totalCount > 0 && (
                  <div className="mb-7 flex flex-wrap gap-2" aria-label="Sort scripts">
                    {([['recent', 'Newest'], ['popular', 'Most viewed'], ['official', 'Official first']] as const).map(([value, label]) => (
                      <button key={value} type="button" aria-pressed={sortBy === value} onClick={() => setSortBy(value)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${sortBy === value ? 'border-white bg-white text-black' : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/30 hover:text-white'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                {scripts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {scripts.map((script) => (
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
                    <p className="text-lg font-medium text-slate-400">No scripts match these filters.</p>
                    <button
                      onClick={() => { setSearchQuery(''); setGameFilter(''); setAccessFilter('all'); setVerifiedOnly(false); }}
                      className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
                {hasMore && (
                  <div className="mt-10 flex justify-center">
                    <button type="button" onClick={loadMore} disabled={loadingMore} className="rounded-full border border-white/15 bg-white/5 px-8 py-3 font-semibold text-white hover:bg-white/10 disabled:opacity-50">
                      {loadingMore ? 'Loading...' : 'Show more scripts'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW: EXECUTORS */}
        {currentView === 'executors' && (
          <ExecutorsView executors={executors} loading={executorsLoading} onLoginRequested={() => setIsAuthModalOpen(true)} />
        )}

        {/* VIEW: ADMIN DASHBOARD */}
        {currentView === 'admin' && isAdmin && (
          <AdminDashboard
            scripts={adminScripts}
            setScripts={setAdminScripts}
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
            onLoginRequested={() => setIsAuthModalOpen(true)}
          />
        )}
        {currentView === 'details' && !selectedScript && detailsLoading && (
          <div className="flex justify-center py-24" role="status"><Loader2 className="animate-spin" size={36} /><span className="sr-only">Loading script</span></div>
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

        </Suspense>
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
