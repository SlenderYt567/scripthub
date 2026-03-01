import React from 'react';
import { Eye, Gamepad2, ChevronRight, User, Key, LockOpen, Hash, Copy, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Script } from '../types';

interface ScriptCardProps {
  script: Script;
  onClick: (script: Script) => void;
  onAuthorClick?: (authorName: string) => void;
}

const ScriptCard: React.FC<ScriptCardProps> = ({ script, onClick, onAuthorClick }) => {

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAuthorClick) {
      onAuthorClick(script.author);
    }
  };

  return (
    <div
      onClick={() => onClick(script)}
      className="group cursor-pointer relative flex flex-col bg-slate-900/40 backdrop-blur-md border border-slate-800/60 hover:border-emerald-500/40 transition-all duration-500 h-full overflow-hidden rounded-[2rem] shadow-2xl hover:-translate-y-1.5"
    >
      {/* Visual Header / Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />

        <img
          src={script.imageUrl}
          alt={script.title}
          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${script.id}/400/200`;
          }}
        />

        {/* Global Glow */}
        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />

        {/* Action Badge - Top Left */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] text-emerald-400 shadow-xl">
            <Gamepad2 size={14} strokeWidth={2.5} />
            <span className="truncate max-w-[100px]">{script.gameName}</span>
          </div>

          {script.isOfficial && (
            <div className="w-fit bg-emerald-500 text-slate-950 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <ShieldCheck size={12} strokeWidth={3} />
              Verified
            </div>
          )}
        </div>

        {/* Access Badge - Top Right */}
        <div className="absolute top-4 right-4 z-20">
          {script.keySystem ? (
            <div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-amber-500 shadow-xl">
              <Key size={14} strokeWidth={2.5} />
              <span>Key Required</span>
            </div>
          ) : (
            <div className="bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-500 shadow-xl">
              <LockOpen size={14} strokeWidth={2.5} />
              <span>Universal</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 p-6 relative z-10">
        <div className="mb-4">
          <h3 className="text-xl font-black text-white line-clamp-2 leading-tight group-hover:text-emerald-400 transition-colors font-sans tracking-tight">
            {script.title}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-[9px] font-black text-slate-500 uppercase tracking-widest">
              <Zap size={10} className="text-amber-500" /> High Performance
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/[0.03]">
          <div
            className="flex items-center gap-3 hover:bg-white/[0.05] p-2 -m-2 rounded-2xl transition-all group/author"
            onClick={handleAuthorClick}
          >
            <div className="relative w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden group-hover/author:border-emerald-500/50 transition-colors">
              <User size={16} className="text-slate-400 group-hover/author:text-emerald-400 transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Developer</span>
              <span className="text-xs font-black text-slate-200 group-hover/author:text-emerald-400 transition-colors leading-none">{script.author}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/[0.02] border border-white/[0.03] shadow-inner">
            <Eye size={14} className="text-slate-500 group-hover:text-emerald-500 transition-colors" />
            <span className="text-xs font-black text-slate-300 group-hover:text-emerald-400 transition-colors tabular-nums">
              {typeof (script.views) === 'number' ? script.views.toLocaleString() : '0'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptCard;