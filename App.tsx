import React, { useState, useMemo, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import Header from './components/Header';
import ScriptCard from './components/ScriptCard';
import PublishModal from './components/PublishModal';
import GatewayModal from './components/GatewayModal';
import ExecutorCard from './components/ExecutorCard';
import ScriptDetails from './components/ScriptDetails';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import AboutView from './components/AboutView';
import { Script, Executor } from './types';
import { Layers, Loader2, TrendingUp, Flame } from 'lucide-react';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [executors, setExecutors] = useState<Executor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Navigation State
  const [currentView, setCurrentView] = useState<'scripts' | 'executors' | 'details' | 'admin' | 'profile' | 'settings' | 'about' | 'slenderhub'>('scripts');

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync state to URL - defined before useEffect to avoid TDZ if used there, though currently just called from events
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
  }, [scripts.length > 0, isAdmin]); // Only re-run when scripts are actually loaded or admin changes

  // Modal & Selection States
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [scriptToEdit, setScriptToEdit] = useState<Script | null>(null);
  const [viewProfileAuthor, setViewProfileAuthor] = useState('');

  // 1. Initial Data Load & Auth Check
  useEffect(() => {
    fetchData();
    checkUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        checkAdminStatus(currentUser.email);
      } else {
        setIsAdmin(false);
        if (currentView === 'admin' || currentView === 'settings') setCurrentView('scripts');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user?.email) {
      checkAdminStatus(user.email);
    }
  };

  const checkAdminStatus = async (email: string | undefined) => {
    if (!email) return;

    try {
      const { data } = await supabase
        .from('admin_users')
        .select('role')
        .ilike('email', email)
        .maybeSingle();

      if (data) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("Admin check failed:", error);

    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Scripts
      const { data: scriptsData } = await supabase
        .from('scripts')
        .select(`*, tasks (*)`)
        .order('created_at', { ascending: false });

      if (scriptsData) {
        const mappedScripts: Script[] = scriptsData.map((s: any) => ({
          id: s.id,
          title: s.title,
          gameName: s.game_name,
          description: s.description,
          imageUrl: s.image_url,
          author: s.author,
          views: s.views,
          rawLink: s.raw_link,
          shortenerLink: s.shortener_link,
          verified: s.verified,
          isOfficial: s.is_official,
          keySystem: s.key_system || false,
          createdAt: new Date(s.created_at).getTime(),
          tasks: s.tasks || []
        }));
        setScripts(mappedScripts);
      }

      // Fetch Executors
      const { data: execData } = await supabase
        .from('executors')
        .select('*')
        .order('created_at', { ascending: false });

      if (execData) {
        const mappedExecutors: Executor[] = execData.map((e: any) => ({
          id: e.id,
          name: e.name,
          description: e.description,
          imageUrl: e.image_url,
          downloadUrl: e.download_url,
          status: e.status,
          platform: e.platform
        }));
        setExecutors(mappedExecutors);
      }

    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter scripts based on search (Title, Game, or Author)
  const filteredScripts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return scripts.filter(script =>
      script.title.toLowerCase().includes(q) ||
      script.gameName.toLowerCase().includes(q) ||
      script.author.toLowerCase().includes(q)
    ).sort((a, b) => {
      // Sort by Official first
      if (a.isOfficial && !b.isOfficial) return -1;
      if (!a.isOfficial && b.isOfficial) return 1;
      return 0; // Maintain existing logic (implied create_at since scripts are already sorted by fetch)
    });
  }, [scripts, searchQuery]);

  // Trending Scripts (Top 4 by views)
  const trendingScripts = useMemo(() => {
    return [...scripts].sort((a, b) => b.views - a.views).slice(0, 4);
  }, [scripts]);

  const handlePublish = async (newScript: Script) => {
    setScriptToEdit(null);
    await fetchData();
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
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">

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
          <div className="animate-fade-in space-y-10">
            {/* Banner / Intro */}
            <div className="text-center space-y-4">
              <h1 className="text-3xl md:text-6xl font-extrabold text-white tracking-tight">
                Script <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Hub</span>
              </h1>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                The ultimate destination for Roblox scripts and executors.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={48} className="animate-spin text-indigo-500" />
              </div>
            ) : (
              <>
                {/* TRENDING SECTION (Only if no search active) */}
                {searchQuery === '' && trendingScripts.length > 0 && (
                  <div className="animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-4">
                      <Flame className="text-orange-500" fill="currentColor" />
                      <h2 className="text-xl font-bold text-white">Trending Now</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {trendingScripts.map(script => (
                        <ScriptCard
                          key={`trending-${script.id}`}
                          script={script}
                          onClick={handleScriptClick}
                          onAuthorClick={handleAuthorClick}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* ALL SCRIPTS GRID */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="text-indigo-400" />
                    <h2 className="text-xl font-bold text-white">
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
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                      <Layers size={48} className="mb-4 opacity-50" />
                      <p className="text-lg">No scripts found matching "{searchQuery}"</p>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="mt-4 text-indigo-400 hover:underline"
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* VIEW: EXECUTORS */}
        {currentView === 'executors' && (
          <div className="animate-fade-in">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-white mb-2">Executors</h2>
              <p className="text-slate-400">Essential software required to run .lua scripts on Roblox.</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={48} className="animate-spin text-indigo-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {executors.map(executor => (
                  <ExecutorCard key={executor.id} executor={executor} />
                ))}
              </div>
            )}
          </div>
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
                <Flame className="text-indigo-400" size={32} />
                <h1 className="text-3xl font-bold text-white">SlenderHub Official</h1>
              </div>
              <p className="text-slate-400">Verified and official scripts from the SlenderHub team</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scripts.filter(s => s.isOfficial).length === 0 ? (
                  <div className="col-span-full text-center py-20">
                    <Layers className="mx-auto text-slate-700 mb-4" size={64} />
                    <p className="text-slate-500">No official scripts yet</p>
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
      <footer className="border-t border-slate-800 bg-slate-900 mt-auto py-8">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; 2024 Script Hub. All rights reserved.</p>
          <p className="mt-2 text-xs">Disclaimer: This platform is for educational purposes only.</p>
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