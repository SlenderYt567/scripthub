import React, { useState } from 'react';
import { Copy, Check, Server, Users, Star, Flame, Code2, Gamepad2, Loader2, Sparkles, ShoppingBag, Zap, Crown } from 'lucide-react';
import { useSupportedGames } from '../hooks/useSupportedGames';

const SlenderHubView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'script' | 'games'>('script');
  const [copied, setCopied] = useState(false);
  const { games, loading } = useSupportedGames();

  const scriptCode = `loadstring(game:HttpGet("https://www.slenderhub.shop/api/exec"))()`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl mt-4">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.03] rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

      <div className="relative z-10 px-6 py-12 md:py-20 flex flex-col items-center">
        
        {/* Navigation Tabs */}
        <div className="flex bg-black/60 p-1.5 rounded-2xl border border-white/10 mb-12 shadow-inner">
          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'script' 
                ? 'bg-white text-black shadow-lg shadow-white/10' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Code2 size={18} /> Premium Script
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'games' 
                ? 'bg-white text-black shadow-lg shadow-white/10' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Gamepad2 size={18} /> Supported Games
          </button>
        </div>

        {activeTab === 'script' ? (
          <div className="w-full max-w-4xl text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-medium tracking-wide mb-6">
              <Sparkles size={14} /> THE ULTIMATE EXPERIENCE
            </div>
            
            <h1 className="text-5xl md:text-7xl font-semibold text-white mb-6 tracking-tighter leading-[1.1]">
              Premium <span className="text-zinc-500">Roblox</span> Script
            </h1>
            
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
              Dominate your favorite games with our high-performance tools. Clean interface, fast execution, and continuous support for top titles. Join +10K users today.
            </p>

            <div className="flex flex-col items-center gap-6 mb-16">
              <button 
                onClick={handleCopy}
                className="group relative flex items-center justify-center gap-3 bg-white hover:bg-zinc-200 text-black px-10 py-4 rounded-full font-semibold text-base transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95"
              >
                {copied ? <Check size={20} strokeWidth={2.5} /> : <Copy size={20} strokeWidth={2.5} />}
                {copied ? 'Copied to Clipboard!' : 'Copy Script'}
              </button>

              <div className="w-full max-w-2xl glass-premium rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/40">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                    <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                    <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                    <span className="ml-2 text-zinc-500 font-mono text-xs tracking-wider">slenderhub.lua</span>
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="text-zinc-500 hover:text-white transition-colors p-1"
                    title="Copy script"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="p-6 text-left bg-black/20 overflow-x-auto">
                  <pre className="font-mono text-sm">
                    <span className="text-blue-400">loadstring</span>(<span className="text-white">game</span>:HttpGet(<span className="text-emerald-300">"https://www.slenderhub.shop/api/exec"</span>))()
                  </pre>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center transition-transform hover:-translate-y-1">
                <Server className="text-zinc-300 mb-4" size={24} />
                <h3 className="text-3xl font-semibold text-white mb-1 tracking-tight">99.99%</h3>
                <p className="text-sm font-medium text-zinc-500 tracking-wide">Uptime</p>
              </div>
              
              <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center transition-transform hover:-translate-y-1">
                <Users className="text-zinc-300 mb-4" size={24} />
                <h3 className="text-3xl font-semibold text-white mb-1 tracking-tight">+10K</h3>
                <p className="text-sm font-medium text-zinc-500 tracking-wide">Active Users</p>
              </div>
              
              <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center transition-transform hover:-translate-y-1">
                <Star className="text-zinc-300 mb-4" size={24} />
                <h3 className="text-3xl font-semibold text-white mb-1 tracking-tight">4.8/5</h3>
                <p className="text-sm font-medium text-zinc-500 tracking-wide">Average Rating</p>
              </div>
            </div>

            {/* Store CTA Banner */}
            <div className="mt-12 w-full max-w-4xl">
              <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-black/40 to-amber-900/10 p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-amber-500/5">
                {/* Background glow */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none"></div>

                {/* Icon */}
                <div className="relative shrink-0 w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <ShoppingBag size={36} className="text-amber-400" strokeWidth={1.5} />
                </div>

                {/* Text */}
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide mb-3">
                    <Crown size={12} /> SLENDERHUB STORE
                  </div>
                  <h3 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
                    Get Premium Access & <span className="text-amber-400">In-Game Items</span>
                  </h3>
                  <p className="text-zinc-400 text-sm md:text-base font-medium leading-relaxed">
                    Unlock the full SlenderHub experience — purchase <span className="text-white font-semibold">Premium Script Access</span>, exclusive <span className="text-white font-semibold">Game Items</span>, and <span className="text-white font-semibold">Gamepasses</span> for top Roblox titles. All in one place.
                  </p>
                  <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start text-xs text-zinc-400 font-medium">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"><Zap size={12} className="text-amber-400" /> Premium Scripts</span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"><Gamepad2 size={12} className="text-amber-400" /> Game Items</span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"><Star size={12} className="text-amber-400" /> Gamepasses</span>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="shrink-0">
                  <a
                    href="https://www.slenderhub.shop/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-full transition-all duration-300 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-105 active:scale-95 whitespace-nowrap"
                  >
                    <ShoppingBag size={18} strokeWidth={2.5} />
                    Visit Store
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl animate-fade-in-up text-center">
             <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <Gamepad2 className="text-white" size={32} />
             </div>
             <h2 className="text-4xl font-semibold text-white tracking-tight mb-4">Supported Games List</h2>
             <p className="text-zinc-400 mb-12 max-w-lg mx-auto font-medium text-lg">SlenderHub currently supports all major Roblox experiences. Here are some of the most popular titles our community dominates.</p>
             
             {loading ? (
                <div className="flex justify-center items-center py-12">
                   <Loader2 className="animate-spin text-zinc-500" size={32} />
                </div>
             ) : (
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
                  {games.map(game => (
                    <div key={game.id} className="glass-card border border-white/5 rounded-xl p-5 flex items-center gap-4 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
                      <span className="font-semibold text-white">{game.name}</span>
                    </div>
                  ))}
               </div>
             )}
             
             <div className="mt-12 p-6 glass-card rounded-2xl inline-block">
                <p className="text-sm font-medium text-zinc-300">And 1000+ more games instantly supported by our universal core.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlenderHubView;
