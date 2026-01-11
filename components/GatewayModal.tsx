import React, { useState, useEffect } from 'react';
import { X, Youtube, MessageCircle, Link as LinkIcon, Lock, CheckCircle, Copy, Code, Globe, ArrowRight, ExternalLink } from 'lucide-react';
import { Script, Task, TaskType } from '../types';

interface GatewayModalProps {
  script: Script | null;
  isOpen: boolean;
  onClose: () => void;
}

enum GatewayStep {
  TASKS = 0,
  MONETIZATION = 1,
  RESULT = 2
}

const GatewayModal: React.FC<GatewayModalProps> = ({ script, isOpen, onClose }) => {
  const [step, setStep] = useState<GatewayStep>(GatewayStep.TASKS);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [loadingTask, setLoadingTask] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && script) {
      setCompletedTaskIds(new Set());
      setCopied(false);
      setLoadingTask(null);
      
      const hasTasks = script.tasks && script.tasks.length > 0;
      
      if (hasTasks) {
        setStep(GatewayStep.TASKS);
      } else {
        // No tasks: Skip directly to Monetization or Result
        if (script.shortenerLink) {
          setStep(GatewayStep.MONETIZATION);
        } else {
          setStep(GatewayStep.RESULT);
        }
      }
    }
  }, [isOpen, script]);

  if (!isOpen || !script) return null;

  const handleTaskClick = (task: Task) => {
    if (completedTaskIds.has(task.id)) return;
    
    // Open link
    window.open(task.url, '_blank');
    setLoadingTask(task.id);
    
    // Simulate verification (1.5s delay)
    setTimeout(() => {
      setLoadingTask(null);
      setCompletedTaskIds(prev => {
        const newSet = new Set(prev);
        newSet.add(task.id);
        
        // Check if all tasks are done
        const allTasksDone = script.tasks.every(t => newSet.has(t.id));
        
        if (allTasksDone) {
          setTimeout(() => {
            if (script.shortenerLink) {
              setStep(GatewayStep.MONETIZATION);
            } else {
              setStep(GatewayStep.RESULT);
            }
          }, 600);
        }
        
        return newSet;
      });
    }, 1500); 
  };

  const handleShortenerClick = () => {
    if (script.shortenerLink) {
        window.open(script.shortenerLink, '_blank');
        onClose(); // Close modal as user is taken away
    }
  };

  const generatedCode = script.rawLink ? `loadstring(game:HttpGet("${script.rawLink}"))()` : '';

  const copyToClipboard = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case 'youtube_subscribe': 
      case 'youtube_like': return <Youtube size={20} />;
      case 'discord_join': return <MessageCircle size={20} />;
      case 'visit_url': return <Globe size={20} />;
    }
  };

  const getTaskColorClass = (type: TaskType, isCompleted: boolean) => {
    if (isCompleted) return 'bg-green-500/10 border-green-500/50 text-green-400';
    switch (type) {
      case 'youtube_subscribe': 
      case 'youtube_like': return 'bg-slate-800 border-slate-700 hover:border-red-500/50 hover:bg-slate-750 text-white hover:text-red-400';
      case 'discord_join': return 'bg-slate-800 border-slate-700 hover:border-indigo-500/50 hover:bg-slate-750 text-white hover:text-indigo-400';
      case 'visit_url': return 'bg-slate-800 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-750 text-white hover:text-emerald-400';
    }
  };

  const getTaskLabel = (task: Task) => {
    switch (task.type) {
      case 'youtube_subscribe': return 'Subscribe to Channel';
      case 'youtube_like': return 'Like Video';
      case 'discord_join': return 'Join Discord Server';
      case 'visit_url': return 'Visit Website';
      default: return task.text || 'Complete Step';
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case GatewayStep.TASKS:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white text-center mb-1">Unlock Script</h3>
            <p className="text-slate-400 text-center text-sm mb-6">
              Complete the actions below to access the script.
            </p>
            
            <div className="space-y-3">
              {script.tasks.map((task) => {
                const isCompleted = completedTaskIds.has(task.id);
                const isLoading = loadingTask === task.id;

                return (
                  <button
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    disabled={isCompleted || isLoading}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group ${getTaskColorClass(task.type, isCompleted)}`}
                  >
                    <div className="flex items-center gap-4">
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <div className={`transition-colors ${isCompleted ? 'text-green-400' : ''}`}>
                          {getTaskIcon(task.type)}
                        </div>
                      )}
                      <span className="font-medium text-sm sm:text-base">{getTaskLabel(task)}</span>
                    </div>
                    
                    {isCompleted ? (
                      <CheckCircle size={20} className="text-green-400 animate-scale-in" />
                    ) : (
                      <Lock size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-4 text-center">
               <p className="text-xs text-slate-500">
                 Progress: {completedTaskIds.size}/{script.tasks.length}
               </p>
            </div>
          </div>
        );

      case GatewayStep.MONETIZATION:
        return (
          <div className="space-y-6 text-center animate-fade-in">
            <div className="mx-auto w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500 mb-4 animate-bounce-slow">
              <ExternalLink size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Access Script</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
                You have completed the steps. Click below to go to the script destination.
              </p>
            </div>
            <button
              onClick={handleShortenerClick}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
            >
              Access Script Link
              <ArrowRight size={18} />
            </button>
            <p className="text-xs text-slate-500">Link provided by {script.author}</p>
          </div>
        );

      case GatewayStep.RESULT:
        // Only show if there is a raw link. If we somehow got here without one, show error.
        if (!script.rawLink) return <div className="text-center text-slate-500">No script source available.</div>;

        return (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
              <CheckCircle size={28} />
              <h3 className="text-2xl font-bold text-white">Unlocked!</h3>
            </div>
            
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 relative group shadow-inner">
              <div className="flex items-center justify-between text-slate-500 text-xs font-mono mb-3 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Code size={12} />
                  <span>LUA SOURCE</span>
                </div>
                <span>{script.gameName}</span>
              </div>
              <code className="block text-indigo-300 font-mono text-sm break-all leading-relaxed">
                {generatedCode}
              </code>
            </div>

            <button
              onClick={copyToClipboard}
              className={`w-full py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg ${
                copied 
                  ? 'bg-green-600 text-white shadow-green-900/20 scale-95' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20 hover:scale-[1.02]'
              }`}
            >
              {copied ? 'Copied to Clipboard!' : 'Copy Script'}
              {!copied && <Copy size={18} />}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 animate-fade-in-up">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header Preview */}
        <div className="mb-8 flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <img 
            src={script.imageUrl} 
            className="w-14 h-14 rounded-lg object-cover border border-slate-600 shadow-sm"
            alt="mini thumb" 
          />
          <div>
            <h4 className="font-bold text-white line-clamp-1">{script.title}</h4>
            <p className="text-xs text-slate-400 font-medium">{script.gameName} • {script.author}</p>
          </div>
        </div>

        {renderStepContent()}

        {/* Progress Dots - Hide if only 1 step (e.g. direct result) */}
        {(script.tasks.length > 0 || (script.shortenerLink && script.tasks.length > 0)) && (
            <div className="flex justify-center gap-2 mt-8">
            {[0, 1].map((i) => (
                <div 
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                    step >= i ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-800'
                }`}
                ></div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default GatewayModal;