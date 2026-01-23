import React from 'react';
import { Download, Monitor, Smartphone, Apple, AlertCircle, CheckCircle, Loader2, AlertTriangle, ShieldCheck, Terminal } from 'lucide-react';
import { Executor } from '../types';

interface ExecutorCardProps {
  executor: Executor;
}

const ExecutorCard: React.FC<ExecutorCardProps> = ({ executor }) => {

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Working':
        return { color: 'text-emerald-400', bg: 'bg-emerald-950/50', border: 'border-emerald-500/50', icon: <CheckCircle size={14} /> };
      case 'Patched':
        return { color: 'text-rose-400', bg: 'bg-rose-950/50', border: 'border-rose-500/50', icon: <AlertCircle size={14} /> };
      case 'Updating':
        return { color: 'text-amber-400', bg: 'bg-amber-950/50', border: 'border-amber-500/50', icon: <Loader2 size={14} className="animate-spin" /> };
      case 'Detected':
        return { color: 'text-rose-600', bg: 'bg-rose-950/80', border: 'border-rose-600', icon: <AlertTriangle size={14} /> };
      default:
        return { color: 'text-slate-400', bg: 'bg-slate-900', border: 'border-slate-700', icon: <CheckCircle size={14} /> };
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
    <div className={`group relative bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden flex flex-col h-full`}>

      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-8 h-8 bg-slate-900 border-l border-b border-slate-800 group-hover:bg-emerald-500/10 transition-colors z-20"></div>

      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-slate-900 border-b border-slate-800">
        <div className="absolute inset-0 bg-slate-950/40 z-10 group-hover:bg-transparent transition-colors duration-500" />

        <img
          src={executor.imageUrl}
          alt={executor.name}
          className="w-full h-full object-cover filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
        />

        {/* Scanline Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20 z-10"></div>

        {/* Status Badge - Top Left */}
        <div className="absolute top-3 left-3 z-20">
          <div className={`flex items-center gap-2 px-3 py-1 text-xs font-mono uppercase tracking-wider border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color} backdrop-blur-sm`}>
            {statusConfig.icon}
            <span>{executor.status}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1 relative">
        {/* Grid Background */}
        <div className="absolute inset-0 ml-5 mt-5 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>

        <div className="flex items-start justify-between mb-4 relative z-10">
          <div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter group-hover:text-emerald-400 transition-colors">
              {executor.name}
            </h3>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-mono mt-1">
              {getPlatformIcon(executor.platform)}
              <span>PLATFORM: {executor.platform.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <p className="text-slate-400 text-sm mb-6 font-sans leading-relaxed flex-1 border-l border-slate-800 pl-3 group-hover:border-emerald-500/30 transition-colors">
          {executor.description}
        </p>

        {/* Technical Footer */}
        <div className="mt-auto space-y-3 relative z-10">

          <div className="flex justify-between items-center text-[10px] text-slate-600 font-mono uppercase border-t border-slate-900 pt-3">
            <div className="flex items-center gap-1">
              <Terminal size={10} />
              <span>v.LATEST</span>
            </div>
            <div className="flex items-center gap-1">
              <ShieldCheck size={10} />
              <span>VERIFIED_HASH</span>
            </div>
          </div>

          {executor.status === 'Detected' ? (
            <button
              disabled
              className="w-full h-10 flex items-center justify-center gap-2 bg-rose-950/30 border border-rose-900 text-rose-500 font-mono text-sm uppercase cursor-not-allowed"
            >
              <AlertTriangle size={14} />
              <span>DETECTED // UNSAFE</span>
            </button>
          ) : (
            <a
              href={executor.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn w-full h-10 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-black font-bold font-mono text-sm uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              <Download size={14} />
              <span>Initialize_Download</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutorCard;