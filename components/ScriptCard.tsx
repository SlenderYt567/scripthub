import React from 'react';
import { Eye, Gamepad2, ChevronRight, User, Key, LockOpen, Hash, Copy } from 'lucide-react';
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
      className="group cursor-pointer relative flex flex-col bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 h-full overflow-hidden"
    >

      {/* Decorative Corner */}
      <div className="absolute top-0 left-0 w-2 h-2 bg-emerald-500/50 opacity-0 group-hover:opacity-100 transition-opacity z-20"></div>

      {/* Thumbnail Section */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900 border-b border-slate-800">
        <div className="absolute inset-0 bg-slate-950/30 z-10 group-hover:bg-transparent transition-colors duration-500" />

        <img
          src={script.imageUrl}
          alt={script.title}
          className="w-full h-full object-cover filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${script.id}/400/200`;
          }}
        />

        {/* Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20 z-10"></div>

        {/* Game Tag - Top Left */}
        <div className="absolute top-0 left-0 z-20 p-2">
          <div className="bg-black/70 backdrop-blur-sm border border-slate-700 px-2 py-1 flex items-center gap-1.5 text-[10px] font-mono uppercase text-emerald-400">
            <Gamepad2 size={10} />
            <span className="truncate max-w-[120px]">{script.gameName}</span>
          </div>
        </div>

        {/* Key System Badge - Top Right */}
        <div className="absolute top-0 right-0 z-20 p-2">
          {script.keySystem ? (
            <div className="bg-amber-950/80 border border-amber-500/50 px-2 py-1 flex items-center gap-1.5 text-[10px] font-mono uppercase text-amber-400">
              <Key size={10} />
              <span>KEY_REQ</span>
            </div>
          ) : (
            <div className="bg-emerald-950/80 border border-emerald-500/50 px-2 py-1 flex items-center gap-1.5 text-[10px] font-mono uppercase text-emerald-400">
              <LockOpen size={10} />
              <span>FREE</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 relative">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '8px 8px' }}></div>

        {script.isOfficial && (
          <div className="absolute -top-3 left-4 px-2 py-0.5 bg-emerald-600 text-[10px] font-bold text-slate-900 tracking-wider uppercase shadow-lg">
            Official_Verified
          </div>
        )}

        <h3 className="text-base font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors mb-3 mt-1 font-sans tracking-tight">
          {script.title}
        </h3>

        <div className="mt-auto space-y-3 pt-3 border-t border-slate-800/50">

          {/* Metadata Row */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
            <div
              className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
              onClick={handleAuthorClick}
            >
              <User size={12} />
              <span className="uppercase">{script.author}</span>
            </div>

            <div className="flex items-center gap-1">
              <Eye size={12} />
              <span>{typeof (script.views) === 'number' ? script.views.toLocaleString() : '0'}</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-[10px] text-slate-600 font-mono">
              <Hash size={10} />
              <span className="truncate w-16">ID_{script.id.slice(0, 6)}</span>
            </div>

            <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-emerald-500 text-xs text-slate-300 hover:text-emerald-400 font-mono transition-all group/btn">
              <span>VIEW_SOURCE</span>
              <ChevronRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptCard;