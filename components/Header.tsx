import React, { useState, useEffect } from 'react';
import { Search, Plus, Terminal, Code2, Cpu, LogIn, LayoutDashboard, User, LogOut, Settings, ChevronDown, Flame, Menu, X, Sparkles, ShieldCheck, Zap, Bell, Globe, ShoppingBag } from 'lucide-react';
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
    { id: 'executors', label: 'Executors', icon: Cpu },
    { id: 'about', label: 'Network', icon: Globe },
  ];

  return (
    <header className={`sticky top-0 z-[60] w-full transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`}>
      <div className="container mx-auto px-4">
        <div className={`relative glass-premium rounded-2xl border border-white/5 transition-all duration-500 ${scrolled ? 'bg-black/80 backdrop-blur-2xl' : 'bg-black/40 backdrop-blur-xl'}`}>

          <div className="relative h-14 md:h-16 flex items-center justify-between px-6 md:px-8 gap-6">

            {/* Logo Area */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => {
                setCurrentView('scripts');
              }}
            >
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 shadow-sm group-hover:border-white/30 transition-all duration-300">
                <Terminal size={16} className="text-white" strokeWidth={2} />
              </div>
              <div className="hidden sm:flex flex-col justify-center">
                <span className="text-lg font-semibold tracking-tight text-white leading-none">
                  Slender<span className="text-zinc-500">Hub</span>
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = currentView === item.id || (item.id === 'scripts' && ['details', 'profile'].includes(currentView));
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-2 ${isActive
                      ? 'text-white bg-white/10'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {item.label}
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

              {/* Divider before Store */}
              <div className="w-px h-6 bg-white/[0.05] mx-1"></div>

              {/* Store Button */}
              <a
                href="https://www.slenderhub.shop/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 flex items-center gap-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40"
              >
                <ShoppingBag size={15} strokeWidth={2} />
                Store
              </a>
            </nav>

            {/* Search Bar - Premium Integrated */}
            {['scripts', 'details', 'profile'].includes(currentView) && (
              <div className="hidden xl:flex flex-1 max-w-[280px] relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search size={14} className="text-zinc-500 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/5 text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 focus:bg-white/10 text-sm font-medium transition-all"
                  placeholder="Search repository..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}

            {/* Actions Area */}
            <div className="flex items-center gap-4">
              <button
                onClick={onOpenPublish}
                className="hidden md:flex items-center justify-center gap-2 px-5 py-2 bg-white hover:bg-zinc-200 text-black text-sm font-semibold rounded-full transition-all duration-300"
              >
                <Plus size={16} strokeWidth={2.5} />
                Deploy
              </button>

              {!user ? (
                <button
                  onClick={onLoginClick}
                  className="flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all duration-300"
                >
                  <LogIn size={16} />
                  <span>Log in</span>
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
          <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${isMenuOpen ? 'max-h-[500px] border-t border-white/5 opacity-100 py-4' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-col px-4 gap-1">
              {navItems.map(item => {
                const isActive = currentView === item.id || (item.id === 'scripts' && ['details', 'profile'].includes(currentView));
                return (
                  <button
                    key={item.id}
                    onClick={() => { setCurrentView(item.id); setIsMenuOpen(false); }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${isActive
                      ? 'bg-white/10 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} strokeWidth={2} className={isActive ? 'text-white' : 'text-zinc-500'} />
                      {item.label}
                    </div>
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

              {/* Mobile Store Button */}
              <div className="h-px bg-white/[0.03] my-2"></div>
              <a
                href="https://www.slenderhub.shop/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-amber-400 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300"
              >
                <ShoppingBag size={18} strokeWidth={2} className="text-amber-500" />
                Store — Premium Access & Items
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
