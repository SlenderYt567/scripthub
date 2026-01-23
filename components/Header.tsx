import React, { useState } from 'react';
import { Search, Plus, Terminal, Code2, Cpu, LogIn, LayoutDashboard, User, LogOut, Settings, ChevronDown, Flame, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenPublish: () => void;
  currentView: 'scripts' | 'executors' | 'details' | 'admin' | 'profile' | 'settings' | 'about' | 'slenderhub';
  setCurrentView: (view: any) => void;
  isAdmin: boolean;
  user: any;
  onLoginClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenPublish,
  currentView,
  setCurrentView,
  isAdmin,
  user,
  onLoginClick
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (currentView === 'admin' || currentView === 'settings') setCurrentView('scripts');
    setIsMenuOpen(false);
  };

  const navItems = [
    { id: 'scripts', label: 'SCRIPTS_DB', icon: Code2 },
    { id: 'slenderhub', label: 'OFFICIAL_HUB', icon: Flame },
    { id: 'executors', label: 'EXEC_MODULES', icon: Cpu },
    { id: 'about', label: 'SYS_INFO', icon: Terminal },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-6">

        {/* Logo Area */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => {
            setCurrentView('scripts');
            const url = new URL(window.location.href);
            url.searchParams.delete('view');
            url.searchParams.delete('id');
            window.history.pushState({}, '', url.toString());
          }}
        >
          <div className="bg-emerald-500/10 border border-emerald-500/50 p-1.5 group-hover:bg-emerald-500/20 transition-colors">
            <Terminal size={24} className="text-emerald-500" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tighter text-white leading-none font-mono">
              SCRIPT<span className="text-emerald-500">_HUB</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
              v2.0.4 [STABLE]
            </span>
          </div>
        </div>

        {/* Desktop Navigation - Command Bar */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id || (item.id === 'scripts' && ['details', 'profile'].includes(currentView));
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`relative px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider transition-all border-b-2 ${isActive
                    ? 'text-emerald-400 border-emerald-500 bg-emerald-950/10'
                    : 'text-slate-400 border-transparent hover:text-white hover:border-slate-700'
                  }`}
              >
                {item.label}
              </button>
            );
          })}

          {isAdmin && (
            <button
              onClick={() => setCurrentView('admin')}
              className={`relative px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider transition-all border-b-2 ${currentView === 'admin'
                  ? 'text-rose-400 border-rose-500 bg-rose-950/10'
                  : 'text-slate-400 border-transparent hover:text-rose-300 hover:border-rose-900'
                }`}
            >
              ADMIN_PANEL
            </button>
          )}
        </div>

        {/* Search Bar */}
        {['scripts', 'details', 'profile'].includes(currentView) ? (
          <div className="hidden md:flex flex-1 max-w-xs relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-800 bg-slate-900 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-xs font-mono transition-all uppercase placeholder:normal-case"
              placeholder="SEARCH_DATABASE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        ) : (
          <div className="flex-1"></div>
        )}

        {/* Actions Area */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenPublish}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold font-mono uppercase transition-all hover:translate-x-[2px] hover:translate-y-[2px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          >
            <Plus size={16} strokeWidth={3} />
            <span>Submit_Script</span>
          </button>

          {!user ? (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-2 px-4 py-2 border border-slate-700 hover:border-emerald-500 text-slate-300 hover:text-emerald-400 text-xs font-bold font-mono uppercase transition-all"
            >
              <LogIn size={16} />
              <span>Login</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 pl-3 pr-2 py-1.5 border border-slate-800 hover:border-slate-600 bg-slate-900 transition-colors"
              >
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">USER_ID</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">{user.email?.split('@')[0]}</span>
                </div>
                <div className="w-8 h-8 bg-slate-800 flex items-center justify-center border border-slate-700">
                  <User size={16} className="text-slate-400" />
                </div>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 bg-slate-950 border border-slate-700 shadow-2xl py-1 z-20">
                    <div className="px-4 py-2 border-b border-slate-800 mb-1">
                      <p className="text-[10px] text-slate-500 uppercase font-mono">Session Active</p>
                    </div>
                    <button
                      onClick={() => { setCurrentView('settings'); setIsMenuOpen(false); }}
                      className="w-full text-left px-4 py-3 text-xs font-mono text-slate-300 hover:bg-slate-900 hover:text-emerald-400 flex items-center gap-2"
                    >
                      <Settings size={14} /> ACCOUNT_CONFIG
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => { setCurrentView('admin'); setIsMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 text-xs font-mono text-rose-400 hover:bg-rose-950/30 flex items-center gap-2"
                      >
                        <LayoutDashboard size={14} /> ADMIN_CONTROLS
                      </button>
                    )}
                    <div className="h-px bg-slate-800 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-xs font-mono text-slate-400 hover:bg-rose-950/20 hover:text-rose-400 flex items-center gap-2"
                    >
                      <LogOut size={14} /> TERMINATE_SESSION
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-slate-300 border border-slate-700 hover:bg-slate-800"
            onClick={() => setIsMenuOpen(!isMenuOpen)} // Reuse existing state for now or add new one
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer (simplified reuse of logic) */}
      <div className={`md:hidden border-t border-slate-800 bg-slate-950 overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="flex flex-col p-4 gap-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setCurrentView(item.id); setIsMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-mono border ${currentView === item.id
                  ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400'
                  : 'border-slate-800 text-slate-400'
                }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;