import React from 'react';
import { ArrowLeft, Play, Calendar, User, Eye, ShieldCheck, Gamepad2, AlertTriangle, Link, Pencil, Terminal, Hash, FileCode } from 'lucide-react';
import { Script } from '../types';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface ScriptDetailsProps {
  script: Script;
  onBack: () => void;
  onGetScript: () => void;
  isAdmin: boolean;
  user: SupabaseUser | null;
  onEdit: (script: Script) => void;
}

const ScriptDetails: React.FC<ScriptDetailsProps> = ({ script, onBack, onGetScript, isAdmin, user, onEdit }) => {
  const isAuthor = user?.email?.split('@')[0] === script.author;
  const canEdit = isAdmin || isAuthor;

  return (
    <div className="animate-fade-in font-sans">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors uppercase font-mono text-xs font-bold tracking-wider group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          RETURN_TO_INDEX
        </button>

        {canEdit && (
          <button
            onClick={() => onEdit(script)}
            className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 border border-slate-700 hover:border-indigo-500 text-indigo-400 hover:text-indigo-300 font-mono text-xs uppercase transition-all"
          >
            <Pencil size={12} />
            EDIT_SOURCE
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Visuals & Data */}
        <div className="space-y-6">
          {/* Image Container */}
          <div className="relative border border-slate-700 bg-slate-950 overflow-hidden group">
            <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-all z-10" />
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30 z-20" />

            <img
              src={script.imageUrl}
              alt={script.title}
              className="w-full h-auto object-cover aspect-video filter grayscale group-hover:grayscale-0 transition-all duration-700"
            />

            {/* Overlay Tags */}
            <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-slate-950 to-transparent z-30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <ShieldCheck size={14} />
                <span>{script.verified ? 'VERIFIED_HASH' : 'UNVERIFIED'}</span>
              </div>
              {script.isOfficial && (
                <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 font-bold uppercase tracking-wider">
                  Official
                </span>
              )}
            </div>
          </div>

          {/* Data Grid */}
          <div className="border border-slate-800 bg-slate-900/50">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
              <Terminal size={14} className="text-emerald-500" />
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">Module_Data</h3>
            </div>

            <div className="divide-y divide-slate-800 text-sm">
              <div className="grid grid-cols-2 p-3 hover:bg-slate-800/30 transition-colors">
                <span className="text-slate-500 font-mono text-xs uppercase">Author_ID</span>
                <div className="text-right font-mono text-slate-300 flex items-center justify-end gap-2">
                  <span className="text-emerald-500">@</span>{script.author}
                </div>
              </div>

              <div className="grid grid-cols-2 p-3 hover:bg-slate-800/30 transition-colors">
                <span className="text-slate-500 font-mono text-xs uppercase">Target_App</span>
                <div className="text-right text-slate-200 font-bold flex items-center justify-end gap-2">
                  <Gamepad2 size={12} className="text-indigo-400" />
                  {script.gameName}
                </div>
              </div>

              <div className="grid grid-cols-2 p-3 hover:bg-slate-800/30 transition-colors">
                <span className="text-slate-500 font-mono text-xs uppercase">Total_Hits</span>
                <div className="text-right font-mono text-slate-300">
                  {script.views.toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-2 p-3 hover:bg-slate-800/30 transition-colors">
                <span className="text-slate-500 font-mono text-xs uppercase">Compile_Date</span>
                <div className="text-right font-mono text-slate-300">
                  {new Date(script.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Descriptions & Controls */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="px-2 py-1 bg-slate-800 border border-slate-700 text-[10px] font-mono uppercase text-indigo-400">
                LUA_SOURCE
              </div>
              {script.keySystem ? (
                <div className="px-2 py-1 bg-amber-950/30 border border-amber-900/50 text-[10px] font-mono uppercase text-amber-500">
                  KEY_SYSTEM_ACTIVE
                </div>
              ) : (
                <div className="px-2 py-1 bg-emerald-950/30 border border-emerald-900/50 text-[10px] font-mono uppercase text-emerald-500">
                  NO_KEY_REQUIRED
                </div>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight mb-6 uppercase">
              {script.title}
            </h1>

            <div className="prose prose-invert border-l-2 border-slate-700 pl-6 py-2">
              <p className="text-slate-400 leading-relaxed text-lg">
                {script.description}
              </p>
            </div>
          </div>

          <div className="bg-rose-950/10 border border-rose-900/30 p-4 mb-8">
            <h3 className="text-rose-400 font-bold mb-2 flex items-center gap-2 text-xs font-mono uppercase tracking-wider">
              <AlertTriangle size={14} />
              Execution_Warnings
            </h3>
            <ul className="space-y-1 text-xs text-rose-300/80 font-mono list-disc list-inside">
              <li>Requires compliant executor environment (Fluxus, Delta, etc.)</li>
              <li>Unauthorized usage may result in account termination.</li>
              <li>Always check for 'Patched' status before injection.</li>
            </ul>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={onGetScript}
              className="group relative flex items-center justify-center gap-4 px-8 py-5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-lg font-bold font-mono tracking-wider uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
            >
              <FileCode className="group-hover:rotate-12 transition-transform" />
              INITIATE_SCRIPT
            </button>

            <button
              onClick={() => {
                const url = new URL(window.location.origin);
                url.searchParams.set('id', script.id);
                navigator.clipboard.writeText(url.toString());
                alert('Script link copied to clipboard!');
              }}
              className="flex items-center justify-center gap-3 px-6 py-5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-white font-mono uppercase text-sm transition-all"
            >
              <Link size={18} />
              COPY_DIRECT_LINK
            </button>
          </div>

          <div className="mt-3 flex items-center justify-center md:justify-start gap-2 text-[10px] text-slate-600 font-mono uppercase">
            <div className="w-2 h-2 bg-emerald-500 rounded-none animate-pulse" />
            SECURE_GATEWAY_READY
          </div>
        </div>

      </div>
    </div>
  );
};

export default ScriptDetails;