import React from 'react';
import { Download, Monitor, Smartphone, Apple, AlertCircle, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Executor } from '../types';

interface ExecutorCardProps {
  executor: Executor;
}

const ExecutorCard: React.FC<ExecutorCardProps> = ({ executor }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Working': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'Patched': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'Updating': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'Detected': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Working': return <CheckCircle size={12} />;
      case 'Patched': return <AlertCircle size={12} />;
      case 'Updating': return <Loader2 size={12} className="animate-spin" />;
      case 'Detected': return <AlertTriangle size={12} />;
      default: return <CheckCircle size={12} />;
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

  return (
    <div className={`group relative flex flex-col bg-slate-900 border transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1 ${executor.status === 'Detected'
        ? 'border-red-500/30 hover:border-red-500/50'
        : 'border-slate-800 hover:border-indigo-500/50'
      }`}>

      {/* Image Banner */}
      <div className="h-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/20 z-10 group-hover:bg-slate-900/0 transition-colors duration-500" />
        <img
          src={executor.imageUrl}
          alt={executor.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-20"></div>

        {/* Float Badges */}
        <div className="absolute top-3 right-3 z-30 flex gap-2">
          <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/50 backdrop-blur-md border border-white/10 text-white shadow-lg flex items-center gap-1.5">
            {getPlatformIcon(executor.platform)}
            {executor.platform}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 z-30">
          <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-lg group-hover:text-indigo-400 transition-colors">
            {executor.name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col relative z-20 bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 shadow-sm ${getStatusColor(executor.status)}`}>
            {getStatusIcon(executor.status)}
            {executor.status}
          </span>
        </div>

        <p className="text-slate-400 text-sm mb-6 flex-1 leading-relaxed border-l-2 border-slate-800 pl-3">
          {executor.description}
        </p>

        {/* Action Button */}
        <div className="mt-auto">
          {executor.status === 'Detected' ? (
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 font-bold rounded-xl cursor-not-allowed border border-red-500/20 opacity-80"
            >
              <AlertTriangle size={18} />
              <span>Unsafe to Use</span>
            </button>
          ) : (
            <a
              href={executor.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn w-full relative flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
              <Download size={18} className="relative z-10 transition-transform group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1" />
              <span className="relative z-10">Download Now</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutorCard;