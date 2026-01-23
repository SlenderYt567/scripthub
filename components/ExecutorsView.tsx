import React from 'react';
import { Executor } from '../types';
import ExecutorCard from './ExecutorCard';
import { Terminal, Shield, Activity, Cpu } from 'lucide-react';

interface ExecutorsViewProps {
  executors: Executor[];
  loading: boolean;
}

const ExecutorsView: React.FC<ExecutorsViewProps> = ({ executors, loading }) => {
  return (
    <div className="animate-fade-in space-y-8">
      {/* Header Section: Cyber/Terminal Style */}
      <div className="mb-4">
        <h2 className="text-3xl font-black text-white tracking-widest uppercase font-mono border-l-4 border-emerald-500 pl-4">
          Executors
        </h2>
        <p className="text-slate-400 mt-2 font-mono text-sm pl-5">
          &gt; AVAIABLE_MODULES: {executors.length}
        </p>
      </div>


      {loading ? (
        <div className="flex items-center justify-center py-20 border border-dashed border-slate-800 bg-slate-900/30">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            <span className="font-mono text-emerald-500 animate-pulse">&gt; FETCHING_DATA...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {executors.map(executor => (
            <ExecutorCard key={executor.id} executor={executor} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExecutorsView;
