import React from 'react';
import { ArrowLeft, Play, Calendar, User, Eye, ShieldCheck, Gamepad2, AlertTriangle, Link } from 'lucide-react';
import { Script } from '../types';

interface ScriptDetailsProps {
  script: Script;
  onBack: () => void;
  onGetScript: () => void;
}

const ScriptDetails: React.FC<ScriptDetailsProps> = ({ script, onBack, onGetScript }) => {
  return (
    <div className="animate-fade-in">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Hub
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Image & Stats */}
        <div className="space-y-6">
          <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-800">
            <img
              src={script.imageUrl}
              alt={script.title}
              className="w-full h-auto object-cover aspect-video"
            />
          </div>

          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Script Info</h3>

            <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
              <span className="flex items-center gap-2 text-slate-300 text-sm">
                <User size={16} className="text-indigo-500" /> Author
              </span>
              <span className="text-white font-medium">{script.author}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
              <span className="flex items-center gap-2 text-slate-300 text-sm">
                <Gamepad2 size={16} className="text-indigo-500" /> Game
              </span>
              <span className="text-white font-medium">{script.gameName}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
              <span className="flex items-center gap-2 text-slate-300 text-sm">
                <Eye size={16} className="text-indigo-500" /> Views
              </span>
              <span className="text-white font-medium">{script.views.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="flex items-center gap-2 text-slate-300 text-sm">
                <Calendar size={16} className="text-indigo-500" /> Posted
              </span>
              <span className="text-white font-medium">
                {new Date(script.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Title, Desc, Actions */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
                Lua Script
              </span>
              <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={12} /> Verified
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
              {script.title}
            </h1>
            <p className="text-slate-400 leading-relaxed text-lg">
              {script.description}
            </p>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-8">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <AlertTriangle size={18} className="text-yellow-500" />
              Before you execute
            </h3>
            <ul className="space-y-2 text-sm text-slate-400 list-disc list-inside">
              <li>Ensure you have a compatible executor (Fluxus, Delta, Wave, etc.)</li>
              <li>Use this script at your own risk. Nexus is not responsible for bans.</li>
              <li>If the script is patched, please wait for an update.</li>
            </ul>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-800 flex flex-col md:flex-row gap-4">
            <button
              onClick={onGetScript}
              className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-bold rounded-xl transition-all shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95"
            >
              <Play size={24} fill="currentColor" />
              Get Script
            </button>
            <button
              onClick={() => {
                const url = new URL(window.location.origin);
                url.searchParams.set('id', script.id);
                navigator.clipboard.writeText(url.toString());
                alert('Script link copied to clipboard!');
              }}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700 active:scale-95"
            >
              <Link size={20} />
              Share
            </button>
          </div>
          <p className="text-center md:text-left mt-3 text-xs text-slate-500">
            Clicking this will open the secure gateway to generate the loadstring.
          </p>
        </div>

      </div>
    </div>
  );
};

export default ScriptDetails;