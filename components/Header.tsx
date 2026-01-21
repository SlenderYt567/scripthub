import React, { useState } from 'react';
import { Search, Plus, Terminal, Code2, Cpu, LogIn, LayoutDashboard, User, LogOut, Settings, ChevronDown, Flame, FileCode, Bot } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenPublish: () => void;
  currentView: 'scripts' | 'executors' | 'details' | 'admin' | 'profile' | 'settings' | 'about' | 'slenderhub' | 'ai-generator';
  setCurrentView: (view: any) => void; // Using any to simplify TS for custom views
  isAdmin: boolean;
  user: any; // Supabase user object
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
    if (currentView === 'admin' || currentView === 'settings' || currentView === 'ai-generator') setCurrentView('scripts');
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div
          className="flex items-center gap-2 text-indigo-500 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
            setCurrentView('scripts');
            const url = new URL(window.location.href);
            url.searchParams.delete('view');
            url.searchParams.delete('id');
            window.history.pushState({}, '', url.toString());
          }}
        >
          <Terminal size={28} strokeWidth={2.5} />
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
            SCRIPT<span className="text-indigo-500">HUB</span>
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="hidden md:flex items-center bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
          <button
            onClick={() => setCurrentView('scripts')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${['scripts', 'details', 'profile'].includes(currentView)
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
          >
            <Code2 size={16} />
            Scripts
          </button>
          <button
            onClick={() => setCurrentView('slenderhub')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'slenderhub'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
          >
            <Flame size={16} />
            SlenderHub
          </button>
          <button
            onClick={() => setCurrentView('executors')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'executors'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
          >
            <Cpu size={16} />
            Executors
          </button>
          <button
            onClick={() => setCurrentView('about')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'about'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
          >
            <User size={16} />
            About
          </button>
          {isAdmin && (
            <button
              onClick={() => setCurrentView('admin')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'admin'
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
            >
              <LayoutDashboard size={16} />
              Panel
            </button>
          )}
          {isAdmin && (
            <button
              // Specific launch button for admins (direct publish modal)
              onClick={onOpenPublish}
              className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20"
            >
              <Plus size={16} />
              Launch Script
            </button>
          )}
        </div>

        {/* Search Bar */}
        {['scripts', 'details', 'profile'].includes(currentView) ? (
          <div className="flex-1 max-w-xs md:max-w-sm relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-1.5 border border-slate-700 rounded-lg leading-5 bg-slate-800/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
              placeholder="Search scripts, games, or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        ) : (
          <div className="flex-1"></div>
        )}

        {/* Right Side Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPublish}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-indigo-500/20 active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Submit</span>
          </button>

          {!user ? (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              title="Sign In"
            >
              <LogIn size={20} />
              <span className="hidden sm:inline text-sm">Login</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 p-1 pr-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                <div className="w-8 h-8 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <User size={18} />
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-xs text-white font-medium max-w-[80px] truncate">{user.email?.split('@')[0]}</span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-20 animate-fade-in-up">
                    <button
                      onClick={() => { setCurrentView('settings'); setIsMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                    >
                      <Settings size={16} /> Account Settings
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => { setCurrentView('admin'); setIsMenuOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/10 flex items-center gap-2"
                        >
                          <LayoutDashboard size={16} /> Admin Panel
                        </button>
                        <button
                          onClick={() => { setCurrentView('ai-generator'); setIsMenuOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-indigo-400 hover:bg-indigo-900/10 flex items-center gap-2"
                        >
                          <Bot size={16} /> AI Generator
                        </button>
                      </>
                    )}
                    <div className="h-px bg-slate-800 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex border-t border-slate-800">
        <button
          onClick={() => setCurrentView('scripts')}
          className={`flex-1 py-2 text-xs font-medium text-center ${['scripts', 'details', 'profile'].includes(currentView) ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-500'
            }`}
        >
          Scripts
        </button>
        <button
          onClick={() => setCurrentView('slenderhub')}
          className={`flex-1 py-2 text-xs font-medium text-center ${currentView === 'slenderhub' ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-500'
            }`}
        >
          SlenderHub
        </button>
        <button
          onClick={() => setCurrentView('executors')}
          className={`flex-1 py-2 text-xs font-medium text-center ${currentView === 'executors' ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-500'
            }`}
        >
          Executors
        </button>
        <button
          onClick={() => setCurrentView('about')}
          className={`flex-1 py-2 text-xs font-medium text-center ${currentView === 'about' ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-500'
            }`}
        >
          About
        </button>
        {isAdmin && (
          <button
            onClick={() => setCurrentView('admin')}
            className={`flex-1 py-2 text-xs font-medium text-center ${currentView === 'admin' ? 'text-red-400 bg-red-500/5' : 'text-slate-500'
              }`}
          >
            Admin
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;