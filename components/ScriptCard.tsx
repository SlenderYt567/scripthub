import React from 'react';
import { Eye, Gamepad2, ChevronRight, User, Key, LockOpen } from 'lucide-react';
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
      className="group cursor-pointer relative flex flex-col bg-slate-800 border border-slate-700/50 rounded-xl overflow-hidden hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 h-full"
    >

      {/* Thumbnail */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
        <img
          src={script.imageUrl}
          alt={script.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${script.id}/400/200`;
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>

        {/* Official Tag */}
        {script.isOfficial && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-indigo-500 text-white backdrop-blur-md border border-indigo-400 shadow-lg shadow-indigo-500/50">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              SLENDERHUB
            </span>
          </div>
        )}

        {/* Game Tag */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-slate-950/60 text-indigo-400 backdrop-blur-md border border-slate-700/50 shadow-lg">
            <Gamepad2 size={12} />
            {script.gameName}
          </span>
        </div>

        {/* Key System Badge */}
        <div className={`absolute ${script.isOfficial ? 'top-12' : 'top-3'} right-3 transition-all`}>
          {script.keySystem ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-amber-500/20 text-amber-400 backdrop-blur-md border border-amber-500/30 shadow-lg">
              <Key size={12} />
              Key System
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-emerald-500/20 text-emerald-400 backdrop-blur-md border border-emerald-500/30 shadow-lg">
              <LockOpen size={12} />
              No Key
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-lg font-bold text-white line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors mb-2">
          {script.title}
        </h3>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/50">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
              onClick={handleAuthorClick}
              title="View Profile"
            >
              <User size={14} className="text-slate-500" />
              <span className="truncate max-w-[80px]">{script.author}</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1.5">
              <Eye size={14} className="text-slate-500" />
              <span>{script.views.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const url = new URL(window.location.origin);
                url.searchParams.set('id', script.id);
                navigator.clipboard.writeText(url.toString());
                alert('Script link copied to clipboard!');
              }}
              className="p-2 rounded-full bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
              title="Copy Link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            </button>
            <button className="p-2 rounded-full bg-slate-700/50 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptCard;