import React, { useState, useEffect } from 'react';
import { Search, Plus, Terminal, Code2, Cpu, LogIn, LayoutDashboard, User, LogOut, Settings, ChevronDown, Flame, Menu, X, Sparkles, ShieldCheck, Zap, Bell, Globe } from 'lucide-react';
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
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (currentView === 'admin' || currentView === 'settings') setCurrentView('scripts');
    setIsUserDropdownOpen(false);
    setIsMenuOpen(false);
  };

  const navItems = [
    { id: 'scripts', label: 'Index', icon: Code2 },
    { id: 'slenderhub', label: 'SlenderHub', icon: Flame },
    { id: 'executors', label: 'Modules', icon: Cpu },
    { id: 'about', label: 'Network', icon: Globe },
  ];

  return (
    <header className={`sticky top-0 z-[60] w-full transition-all duration-500 ${scrolled ? 'py-2' : 'py-4'}`}>
      <div className="container mx-auto px-4">
        <div className={`relative glass-premium rounded-[2rem] border border-white/[0.05] shadow-2xl transition-all duration-500 ${scrolled ? 'bg-slate-950/80 backdrop-blur-2xl' : 'bg-slate-950/40 backdrop-blur-xl'}`}>

          {/* Subtle Glow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-indigo-500/5 rounded-[2rem] pointer-events-none opacity-50"></div>

          <div className="relative h-16 md:h-20 flex items-center justify-between px-6 md:px-10 gap-6">

            {/* Logo Area */}
            <div
              className="flex items-center gap-4 cursor-pointer group"
              onClick={() => {
                setCurrentView('scripts');
                const url = new URL(window.location.href);
                url.searchParams.delete('view');
                url.searchParams.delete('id');
                window.history.pushState({}, '', url.toString());
              }}
            >
              <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-950 border border-white/[0.05] shadow-2xl group-hover:border-emerald-500/40 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Terminal size={22} className="text-emerald-400 group-hover:scale-110 transition-transform duration-500 relative z-10" strokeWidth={2.5} />
              </div>
              <div className="hidden sm:flex flex-col justify-center">
                <span className="text-2xl font-black tracking-tight text-white leading-none">
                  Script<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Hub</span>
                </span>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex gap-0.5">
                    <div className="w-1 h-3 rounded-full bg-emerald-500/40"></div>
                    <div className="w-1 h-3 rounded-full bg-emerald-500 animate-pulse transition-all"></div>
                    <div className="w-1 h-3 rounded-full bg-emerald-500/40"></div>
                  </div>
                  <span className="text-[8px] text-slate-500 font-black tracking-[0.2em] uppercase">Status: Optimal</span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/20 border border-white/[0.03] backdrop-blur-md">
              {navItems.map((item) => {
                const isActive = currentView === item.id || (item.id === 'scripts' && ['details', 'profile'].includes(currentView));
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`relative px-5 py-2.5 text-xs font-black uppercase tracking-[0.1em] rounded-xl transition-all duration-500 flex items-center gap-2.5 overflow-hidden group ${isActive
                      ? 'text-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                      }`}
                  >
                    <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} className={`transition-colors duration-500 ${isActive ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                    {item.label}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500/40"></div>
                    )}
                  </button>
                );
              })}

              {isAdmin && <div className="w-px h-6 bg-white/[0.05] mx-2"></div>}

              {isAdmin && (
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`relative px-5 py-2.5 text-xs font-black uppercase tracking-[0.1em] rounded-xl transition-all duration-500 flex items-center gap-2.5 overflow-hidden group ${currentView === 'admin'
                    ? 'text-rose-400 bg-rose-500/10 shadow-lg shadow-rose-500/10'
                    : 'text-slate-500 hover:text-rose-300 hover:bg-rose-500/5'
                    }`}
                >
                  <LayoutDashboard size={16} strokeWidth={2.5} className={currentView === 'admin' ? "text-rose-400" : "text-slate-600"} />
                  Admin
                </button>
              )}
            </nav>

            {/* Search Bar - Premium Integrated */}
            {['scripts', 'details', 'profile'].includes(currentView) && (
              <div className="hidden xl:flex flex-1 max-w-[320px] relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search size={16} className="text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-12 pr-12 py-3 rounded-2xl bg-black/20 border border-white/[0.05] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/40 focus:bg-black/40 text-xs font-medium tracking-tight transition-all shadow-inner backdrop-blur-md"
                  placeholder="Query global repository..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <span className="text-[10px] font-black text-slate-700 border border-white/5 px-2 py-0.5 rounded-lg bg-black/40 uppercase tracking-tighter">Enter</span>
                </div>
              </div>
            )}

            {/* Actions Area */}
            <div className="flex items-center gap-4">
              <button
                onClick={onOpenPublish}
                className="hidden md:flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:scale-95"
              >
                <Plus size={18} strokeWidth={3} />
                Deploy
              </button>

              {!user ? (
                <button
                  onClick={onLoginClick}
                  className="flex items-center gap-3 px-6 py-3 rounded-2xl border border-white/[0.05] hover:border-emerald-500/30 bg-white/[0.02] hover:bg-emerald-500/5 text-slate-400 hover:text-emerald-400 text-xs font-black uppercase tracking-widest transition-all duration-300 backdrop-blur-md"
                >
                  <LogIn size={18} />
                  <span>Join</span>
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className={`flex items-center gap-4 p-1.5 pr-4 rounded-2xl border border-white/[0.05] bg-black/20 hover:bg-black/40 transition-all duration-300 group select-none ${isUserDropdownOpen ? 'border-emerald-500/40 bg-black/40' : ''}`}
                  >
                    <div className="relative w-10 h-10 rounded-xl bg-slate-900 border border-white/[0.05] flex items-center justify-center overflow-hidden group-hover:border-emerald-500/40 transition-colors">
                      <User size={18} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <div className="hidden md:flex flex-col items-start truncate max-w-[120px]">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Identity</span>
                      <span className="text-sm font-black text-white truncate w-full">{user.email?.split('@')[0]}</span>
                    </div>
                    <ChevronDown size={14} className={`text-slate-600 transition-transform duration-300 hidden md:block ${isUserDropdownOpen ? 'rotate-180 text-emerald-500' : ''}`} />
                  </button>

                  {/* Dropdown Menu - High-End Glass */}
                  {isUserDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsUserDropdownOpen(false)}></div>
                      <div className="absolute right-0 mt-4 w-64 glass-premium rounded-[2rem] border border-white/[0.05] shadow-2xl z-50 overflow-hidden transform origin-top-right animate-fade-in-up md:animate-in md:zoom-in-95 duration-300">
                        <div className="px-6 py-6 border-b border-white/[0.03] bg-white/[0.02] flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
                            <ShieldCheck size={24} strokeWidth={2.5} />
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5 whitespace-nowrap">Authorized User</span>
                            <span className="text-xs font-black text-white truncate w-full">{user.email}</span>
                          </div>
                        </div>

                        <div className="p-3">
                          <button
                            onClick={() => { setCurrentView('settings'); setIsUserDropdownOpen(false); }}
                            className="w-full px-5 py-3.5 text-xs font-black uppercase tracking-widest rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white flex items-center gap-4 transition-all"
                          >
                            <Settings size={18} className="text-slate-600" /> Settings
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => { setCurrentView('admin'); setIsUserDropdownOpen(false); }}
                              className="w-full px-5 py-3.5 text-xs font-black uppercase tracking-widest rounded-2xl text-rose-500 hover:bg-rose-500/10 flex items-center gap-4 transition-all mt-1"
                            >
                              <LayoutDashboard size={18} strokeWidth={2.5} /> Admin Console
                            </button>
                          )}

                          <div className="h-px bg-white/[0.03] my-2 mx-5"></div>

                          <button
                            onClick={handleLogout}
                            className="w-full px-5 py-3.5 text-xs font-black uppercase tracking-widest rounded-2xl text-slate-500 hover:bg-rose-500/5 hover:text-rose-400 flex items-center gap-4 transition-all"
                          >
                            <LogOut size={18} /> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden p-3 rounded-2xl text-slate-400 border border-white/[0.05] bg-black/20 hover:bg-black/40 transition-all duration-300 backdrop-blur-md"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${isMenuOpen ? 'max-h-[500px] border-t border-white/[0.03] opacity-100 py-6' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-col px-6 gap-3">
              {navItems.map(item => {
                const isActive = currentView === item.id || (item.id === 'scripts' && ['details', 'profile'].includes(currentView));
                return (
                  <button
                    key={item.id}
                    onClick={() => { setCurrentView(item.id); setIsMenuOpen(false); }}
                    className={`flex items-center justify-between px-6 py-4 rounded-[1.25rem] font-black uppercase text-xs tracking-widest transition-all duration-300 ${isActive
                      ? 'bg-emerald-500/10 text-emerald-400 shadow-inner'
                      : 'bg-white/5 text-slate-500 hover:text-slate-200'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon size={20} strokeWidth={2.5} className={isActive ? 'text-emerald-400' : 'text-slate-600'} />
                      {item.label}
                    </div>
                    {isActive && <Zap size={14} className="text-emerald-500 animate-pulse" />}
                  </button>
                )
              })}

              {isAdmin && (
                <>
                  <div className="h-px bg-white/[0.03] my-2"></div>
                  <button
                    onClick={() => { setCurrentView('admin'); setIsMenuOpen(false); }}
                    className={`flex items-center justify-between px-6 py-4 rounded-[1.25rem] font-black uppercase text-xs tracking-widest transition-all duration-300 ${currentView === 'admin'
                      ? 'bg-rose-500/10 text-rose-400 shadow-inner'
                      : 'bg-white/5 text-slate-500 hover:text-rose-300'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <LayoutDashboard size={20} strokeWidth={2.5} className={currentView === 'admin' ? 'text-rose-400' : 'text-slate-600'} />
                      Master Control
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;