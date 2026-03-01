import React from 'react';
import { ArrowLeft, Play, Calendar, User, Eye, ShieldCheck, Gamepad2, AlertTriangle, Link, Pencil, Terminal, Hash, FileCode, Sparkles, Clock, Globe } from 'lucide-react';
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
    <div className="animate-fade-in-up font-sans max-w-6xl mx-auto">
      {/* Navigation & Actions Top Bar */}
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2.5 text-slate-400 hover:text-emerald-400 transition-all duration-300 font-bold text-sm group"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-emerald-500/50 group-hover:bg-slate-800 transition-all">
            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          Back to Browse
        </button>

        {canEdit && (
          <button
            onClick={() => onEdit(script)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 font-bold text-sm transition-all shadow-lg shadow-indigo-500/5"
          >
            <Pencil size={16} />
            Edit Source
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Left Column: Visuals & Stats (lg:4) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Main Visual Card */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl group">
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={script.imageUrl}
                alt={script.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${script.id}/800/450`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-700/50 text-[11px] font-bold text-emerald-400 shadow-xl">
                <ShieldCheck size={14} className="text-emerald-500" />
                {script.verified ? 'VERIFIED' : 'UNVERIFIED'}
              </div>
              {script.isOfficial && (
                <div className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xl shadow-emerald-500/20">
                  OFFICIAL <Sparkles size={12} />
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 backdrop-blur-sm">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Hits</p>
              <p className="text-xl font-black text-white">{script.views.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 backdrop-blur-sm">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Published</p>
              <p className="text-xl font-black text-white">{new Date(script.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            </div>
          </div>

          {/* Detailed Metadata */}
          <div className="rounded-2xl bg-slate-900/40 border border-slate-800/60 p-6 space-y-5 backdrop-blur-md">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
              <Terminal size={14} className="text-emerald-500" />
              Technical Specs
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-slate-400 text-sm">
                  <User size={16} className="text-slate-500" /> Author
                </div>
                <span className="text-emerald-400 font-bold text-sm">@{script.author}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-slate-400 text-sm">
                  <Gamepad2 size={16} className="text-slate-500" /> Game
                </div>
                <span className="text-slate-100 font-bold text-sm">{script.gameName}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-slate-400 text-sm">
                  <Clock size={16} className="text-slate-500" /> Compiled
                </div>
                <span className="text-slate-300 font-mono text-xs">{new Date(script.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-slate-400 text-sm">
                  <Globe size={16} className="text-slate-500" /> Language
                </div>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-black text-slate-300 border border-slate-700">LUA / LUAU</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Info & Execution (lg:8) */}
        <div className="lg:col-span-8 space-y-10">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              {script.keySystem ? (
                <span className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold text-amber-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  KEY SYSTEM ACTIVE
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  OPEN SOURCE / FREE
                </span>
              )}
              <span className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-400">
                STABLE RELEASE
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[0.9] uppercase">
              {script.title}
            </h1>

            <div className="relative">
              <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-transparent rounded-full opacity-50" />
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium">
                {script.description}
              </p>
            </div>
          </div>

          {/* Safety Warnings */}
          <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20 backdrop-blur-md">
            <h3 className="text-rose-400 font-black mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <AlertTriangle size={18} />
              Pre-Execution Checklist
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-rose-300/70 font-medium">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50" />
                Latest executor version required
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50" />
                Check 'Detected' status in dashboard
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50" />
                Account safety guidelines apply
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50" />
                Anti-cheat measures may vary
              </li>
            </ul>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-5">
            <button
              onClick={onGetScript}
              className="flex-1 group relative flex items-center justify-center gap-3.5 px-10 py-5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 text-xl font-black rounded-2xl transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:-translate-y-1 active:translate-y-0"
            >
              <FileCode size={24} className="group-hover:rotate-12 transition-transform duration-300" />
              LOAD SCRIPT
            </button>

            <button
              onClick={() => {
                const url = new URL(window.location.origin);
                url.searchParams.set('id', script.id);
                navigator.clipboard.writeText(url.toString());
                alert('Script link copied to clipboard!');
              }}
              className="flex items-center justify-center gap-3 px-8 py-5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-2xl text-slate-100 font-bold text-lg transition-all duration-300 hover:border-slate-500 backdrop-blur-sm shadow-xl"
            >
              <Link size={20} className="text-slate-400" />
              Share Link
            </button>
          </div>

          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-900/30 border border-slate-800/50 w-fit">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center`}>
                  <User size={10} className="text-slate-500" />
                </div>
              ))}
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Join 1.2k+ users executing this module
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptDetails;