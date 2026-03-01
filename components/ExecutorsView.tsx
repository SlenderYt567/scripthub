import React from 'react';
import { Executor } from '../types';
import ExecutorCard from './ExecutorCard';
import { Terminal, Shield, Activity, Cpu, Database, Zap, Sparkles } from 'lucide-react';

interface ExecutorsViewProps {
  executors: Executor[];
  loading: boolean;
}

const ExecutorsView: React.FC<ExecutorsViewProps> = ({ executors, loading }) => {
  return (
    <div className="animate-fade-in space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section: High-End Cyber Terminal */}
      <div className="relative group">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/5 blur-[60px] rounded-full group-hover:bg-emerald-500/10 transition-all duration-1000"></div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-10 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
              <div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Exploit Nexus</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Verified Executor Repository</span>
                  <Sparkles size={12} className="text-emerald-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 px-6 py-4 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-md shadow-xl">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Active Modules</span>
              <div className="text-xl font-black text-emerald-400 tabular-nums leading-none flex items-center gap-2">
                <Zap size={16} /> {executors.length}
              </div>
            </div>
            <div className="w-px h-8 bg-slate-800"></div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Global Latency</span>
              <div className="text-xl font-black text-indigo-400 tabular-nums leading-none flex items-center gap-2">
                <Activity size={16} /> 14ms
              </div>
            </div>
          </div>
        </div>
      </div>


      {loading ? (
        <div className="relative overflow-hidden rounded-[3rem] bg-slate-900/40 border-2 border-dashed border-slate-800 py-32 flex flex-col items-center justify-center gap-6 group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-50"></div>

          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Database size={32} className="text-emerald-500/50" />
            </div>
          </div>

          <div className="text-center space-y-2 relative z-10">
            <p className="text-emerald-500 font-black uppercase text-xs tracking-[0.4em] animate-pulse">Syncing Payload Data</p>
            <p className="text-slate-600 font-mono text-[9px] uppercase tracking-widest">Bridging secure connection to tool-server-01...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {executors.map(executor => (
            <div key={executor.id} className="animate-fade-in-up">
              <ExecutorCard executor={executor} />
            </div>
          ))}
        </div>
      )}

      {/* Footer Info */}
      {!loading && executors.length > 0 && (
        <div className="pt-10 flex flex-col items-center gap-4 border-t border-white/[0.03]">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/50 border border-slate-900 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] shadow-inner">
            <Shield size={12} className="text-emerald-500" /> All modules verified against latest security protocols
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutorsView;
