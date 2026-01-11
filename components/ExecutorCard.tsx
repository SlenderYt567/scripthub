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
    <div className={`flex flex-col bg-slate-800 border rounded-xl overflow-hidden hover:border-slate-600 transition-all shadow-lg ${
        executor.status === 'Detected' ? 'border-red-500/30' : 'border-slate-700'
    }`}>
      <div className="h-32 bg-slate-900 relative">
        <img 
          src={executor.imageUrl} 
          alt={executor.name} 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800 to-transparent"></div>
        <div className="absolute bottom-4 left-4">
          <h3 className="text-xl font-bold text-white">{executor.name}</h3>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex gap-2 mb-4">
          <span className={`px-2.5 py-0.5 rounded text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(executor.status)}`}>
            {getStatusIcon(executor.status)}
            {executor.status}
          </span>
          <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-slate-700 border border-slate-600 text-slate-300 flex items-center gap-1.5">
            {getPlatformIcon(executor.platform)}
            {executor.platform}
          </span>
        </div>

        <p className="text-slate-400 text-sm mb-6 flex-1">{executor.description}</p>

        {executor.status === 'Detected' ? (
           <button 
             disabled
             className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-900/50 text-red-200 font-bold rounded-lg cursor-not-allowed border border-red-500/20"
           >
             <AlertTriangle size={18} />
             Unsafe to Download
           </button>
        ) : (
          <a 
            href={executor.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all active:scale-95 shadow-lg shadow-indigo-900/20"
          >
            <Download size={18} />
            Download
          </a>
        )}
      </div>
    </div>
  );
};

export default ExecutorCard;