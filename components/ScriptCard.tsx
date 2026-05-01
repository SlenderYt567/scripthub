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
      className="group cursor-pointer relative flex flex-col bg-white/[0.02] backdrop-blur-md border border-white/5 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300 h-full overflow-hidden rounded-[2rem] shadow-lg hover:-translate-y-1"
    >
      {/* Visual Header / Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden bg-black/50">
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
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

        {/* Action Badge - Top Left */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-medium text-white shadow-sm">
            <Gamepad2 size={14} strokeWidth={2} />
            <span className="truncate max-w-[100px]">{script.gameName}</span>
          </div>

          {script.isOfficial && (
            <div className="w-fit bg-white text-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold shadow-sm">
              <ShieldCheck size={14} strokeWidth={2.5} />
              Verified
            </div>
          )}
        </div>

        {/* Access Badge - Top Right */}
        <div className="absolute top-4 right-4 z-20">
          {script.keySystem ? (
            <div className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-medium text-zinc-300 shadow-sm">
              <Key size={14} strokeWidth={2} />
              <span>Keyed</span>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-medium text-white shadow-sm">
              <LockOpen size={14} strokeWidth={2} />
              <span>Free Access</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 p-6 relative z-10">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white line-clamp-2 leading-tight group-hover:text-zinc-300 transition-colors tracking-tight">
            {script.title}
          </h3>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-xs font-medium text-zinc-400">
              <Zap size={12} className="text-zinc-300" /> High Performance
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/5">
          <div
            className="flex items-center gap-3 hover:bg-white/5 p-2 -m-2 rounded-xl transition-all group/author"
            onClick={handleAuthorClick}
          >
            <div className="relative w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden group-hover/author:border-white/30 transition-colors">
              <User size={14} className="text-zinc-400 group-hover/author:text-white transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider leading-none mb-1">Developer</span>
              <span className="text-sm font-medium text-zinc-200 group-hover/author:text-white transition-colors leading-none">{script.author}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
            <Eye size={14} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
            <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors tabular-nums">
              {typeof (script.views) === 'number' ? script.views.toLocaleString() : '0'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptCard;