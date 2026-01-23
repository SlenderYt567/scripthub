import React, { useState, useEffect } from 'react';
import { X, Youtube, MessageCircle, Link as LinkIcon, Lock, CheckCircle, Copy, Code, Globe, ArrowRight, ExternalLink, Terminal, ShieldAlert, ChevronRight } from 'lucide-react';
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
      case 'youtube_like': return <Youtube size={16} />;
      case 'discord_join': return <MessageCircle size={16} />;
      case 'visit_url': return <Globe size={16} />;
    }
  };

  const getTaskColorClass = (type: TaskType, isCompleted: boolean) => {
    if (isCompleted) return 'bg-emerald-950/20 border-emerald-500/50 text-emerald-400';
    switch (type) {
      case 'youtube_subscribe':
      case 'youtube_like': return 'hover:border-red-500 hover:text-red-400';
      case 'discord_join': return 'hover:border-indigo-500 hover:text-indigo-400';
      case 'visit_url': return 'hover:border-emerald-500 hover:text-emerald-400';
    }
    return '';
  };

  const getTaskLabel = (task: Task) => {
    switch (task.type) {
      case 'youtube_subscribe': return 'CONFIRM_SUBSCRIPTION';
      case 'youtube_like': return 'VERIFY_LIKE';
      case 'discord_join': return 'JOIN_SERVER';
      case 'visit_url': return 'PING_WEBSITE';
      default: return task.text?.toUpperCase() || 'COMPLETE_STEP';
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case GatewayStep.TASKS:
        return (
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 border border-slate-800 font-mono text-xs">
              <div className="text-slate-500 mb-2"># SECURITY_CHECK</div>
              <div className="text-emerald-500 mb-1">&gt; INITIATING HANDSHAKE...</div>
              <div className="text-slate-400">&gt; PENDING VERIFICATION OF {script.tasks.length} PROTOCOLS</div>
            </div>

            <div className="space-y-2">
              {script.tasks.map((task, index) => {
                const isCompleted = completedTaskIds.has(task.id);
                const isLoading = loadingTask === task.id;

                return (
                  <button
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    disabled={isCompleted || isLoading}
                    className={`w-full flex items-center justify-between p-4 border border-slate-700 bg-slate-900 hover:bg-slate-800 transition-all group ${getTaskColorClass(task.type, isCompleted)}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="font-mono text-xs text-slate-600">0{index + 1}</div>
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent animate-spin"></div>
                      ) : (
                        <div className={`transition-colors`}>
                          {getTaskIcon(task.type)}
                        </div>
                      )}
                      <span className="font-mono text-xs tracking-wider uppercase">{getTaskLabel(task)}</span>
                    </div>

                    {isCompleted ? (
                      <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-mono uppercase">
                        <span>VERIFIED</span>
                        <CheckCircle size={14} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-600 group-hover:text-slate-400 text-[10px] font-mono uppercase">
                        <span>LOCKED</span>
                        <Lock size={14} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-800 pt-2">
              <span>SECURE_CONNECTION: TLS_1.3</span>
              <span>PROGRESS: {completedTaskIds.size}/{script.tasks.length}</span>
            </div>
          </div>
        );

      case GatewayStep.MONETIZATION:
        return (
          <div className="space-y-6 text-center animate-fade-in py-4">
            <div className="w-16 h-16 bg-slate-800 border-2 border-slate-700 mx-auto flex items-center justify-center">
              <ShieldAlert size={32} className="text-amber-500" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white font-mono uppercase tracking-widest">External_Redirect</h3>
              <p className="text-slate-400 text-xs font-mono mt-2 max-w-xs mx-auto">
                &gt; PROTOCOL REQUIRES THIRD-PARTY VERIFICATION.<br />
                &gt; REDIRECTING TO SECURE SHORTENER...
              </p>
            </div>

            <button
              onClick={handleShortenerClick}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono uppercase tracking-wider transition-all hover:translate-x-1 flex items-center justify-center gap-2"
            >
              PROCEED_TO_DESTINATION
              <ChevronRight size={18} />
            </button>
          </div>
        );

      case GatewayStep.RESULT:
        if (!script.rawLink) return <div className="text-center text-slate-500 font-mono">ERROR: NO_SOURCE_FOUND</div>;

        return (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 flex items-center gap-4">
              <Terminal size={24} className="text-emerald-500" />
              <div>
                <h3 className="text-lg font-bold text-emerald-400 font-mono uppercase tracking-widest">Access_Granted</h3>
                <p className="text-emerald-600/70 text-[10px] font-mono">DECRYPTION SUCCESSFUL</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-0 relative group">
              <div className="flex items-center justify-between bg-slate-900 p-2 border-b border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono uppercase">source_code.lua</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-rose-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
                </div>
              </div>
              <div className="p-4">
                <code className="block text-indigo-300 font-mono text-sm break-all leading-relaxed">
                  {generatedCode}
                </code>
              </div>
            </div>

            <button
              onClick={copyToClipboard}
              className={`w-full py-4 font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${copied
                  ? 'bg-emerald-600 text-slate-950 border-emerald-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600'
                }`}
            >
              {copied ? 'COPIED_TO_CLIPBOARD' : 'COPY_TO_CLIPBOARD'}
              {!copied && <Copy size={16} />}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-[linear-gradient(transparent_2px,rgba(0,0,0,0.5)_2px)] bg-[length:100%_4px] opacity-20 pointer-events-none"></div>
      </div>

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 shadow-2xl animate-fade-in-up flex flex-col">
        {/* Title Bar */}
        <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldAlert size={14} />
            <span className="text-xs font-mono uppercase tracking-widest">GATEWAY_PROTOCOL_V2</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-rose-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default GatewayModal;