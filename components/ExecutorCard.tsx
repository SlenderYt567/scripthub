import React from 'react';
import { Download, Monitor, Smartphone, Apple, AlertCircle, CheckCircle, Loader2, AlertTriangle, ShieldCheck, Terminal, Sparkles, Cpu } from 'lucide-react';
import { Executor } from '../types';

interface ExecutorCardProps {
  executor: Executor;
}

const ExecutorCard: React.FC<ExecutorCardProps> = ({ executor }) => {

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Working':
        return {
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          icon: <CheckCircle size={14} />,
          pulse: 'bg-emerald-500'
        };
      case 'Patched':
        return {
          color: 'text-rose-400',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/20',
          icon: <AlertCircle size={14} />,
          pulse: 'bg-rose-500'
        };
      case 'Updating':
        return {
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          icon: <Loader2 size={14} className="animate-spin" />,
          pulse: 'bg-amber-500'
        };
      case 'Detected':
        return {
          color: 'text-rose-500',
          bg: 'bg-rose-500/20',
          border: 'border-rose-500/40',
          icon: <AlertTriangle size={14} />,
          pulse: 'bg-rose-600'
        };
      default:
        return {
          color: 'text-slate-400',
          bg: 'bg-slate-800/50',
          border: 'border-slate-700/50',
          icon: <CheckCircle size={14} />,
          pulse: 'bg-slate-500'
        };
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Windows': return <Monitor size={16} />;
      case 'Android': return <Smartphone size={16} />;
      case 'iOS': case 'Mac': return <Apple size={16} />;
      default: return <Monitor size={16} />;
    }
  };

  const statusConfig = getStatusConfig(executor.status);

  return (
    <div className="group relative rounded-3xl overflow-hidden bg-slate-900/40 border border-slate-800/60 backdrop-blur-md hover:border-emerald-500/30 transition-all duration-500 flex flex-col h-full hover:-translate-y-1 shadow-2xl">

      {/* Visual Header */}
      <div className="relative h-44 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />

        <img
          src={executor.imageUrl}
          alt={executor.name}
          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
        />

        {/* Global Glow */}
        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />

        {/* Status Badge */}
        <div className="absolute top-4 left-4 z-20">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border backdrop-blur-md shadow-xl ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusConfig.pulse}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${statusConfig.pulse}`}></span>
            </span>
            {executor.status}
          </div>
        </div>

        {/* Platform Badge */}
        <div className="absolute top-4 right-4 z-20">
          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 backdrop-blur-md">
            {getPlatformIcon(executor.platform)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1 relative">
        <div className="mb-4">
          <h3 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors flex items-center gap-2">
            {executor.name}
            {executor.status === 'Working' && <Sparkles size={16} className="text-emerald-500" />}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-700">
              {executor.platform} Native
            </span>
          </div>
        </div>

        <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium flex-1 line-clamp-3">
          {executor.description}
        </p>

        {/* Technical Info */}
        <div className="mt-auto space-y-4">
          <div className="flex items-center justify-between py-3 border-y border-slate-800/50">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">
              <Cpu size={12} /> Optimization: High
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">
              <ShieldCheck size={12} className="text-emerald-500" /> Secure
            </div>
          </div>

          {executor.status === 'Detected' ? (
            <div className="w-full py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest cursor-not-allowed">
              <AlertTriangle size={16} />
              Protocol Terminated - Unsafe
            </div>
          ) : (
            <a
              href={executor.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/30 active:scale-[0.98]"
            >
              <Download size={16} strokeWidth={3} className="group-hover/btn:-translate-y-0.5 transition-transform" />
              Initialize Retrieval
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutorCard;