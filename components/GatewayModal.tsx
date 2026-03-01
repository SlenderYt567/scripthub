import React, { useState, useEffect } from 'react';
import { X, Youtube, MessageCircle, Link as LinkIcon, Lock, CheckCircle, Copy, Code, Globe, ArrowRight, ExternalLink, Terminal, ShieldAlert, ChevronRight, Loader2, Sparkles, ShieldCheck, Zap } from 'lucide-react';
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
      case 'youtube_like': return <Youtube size={18} />;
      case 'discord_join': return <MessageCircle size={18} />;
      case 'visit_url': return <Globe size={18} />;
    }
  };

  const getTaskColorClass = (type: TaskType, isCompleted: boolean) => {
    if (isCompleted) return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    switch (type) {
      case 'youtube_subscribe':
      case 'youtube_like': return 'hover:border-rose-500/50 hover:bg-rose-500/5 hover:text-rose-400';
      case 'discord_join': return 'hover:border-indigo-500/50 hover:bg-indigo-500/5 hover:text-indigo-400';
      case 'visit_url': return 'hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:text-emerald-400';
    }
    return '';
  };

  const getTaskLabel = (task: Task) => {
    switch (task.type) {
      case 'youtube_subscribe': return 'SYNC_SUBSCRIPTION';
      case 'youtube_like': return 'VERIFY_INTERACTION';
      case 'discord_join': return 'CONNECT_IDENTITY';
      case 'visit_url': return 'LINK_DECRYPTION';
      default: return task.text?.toUpperCase() || 'INITIALIZE_STEP';
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case GatewayStep.TASKS:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl bg-slate-950/50 border border-slate-800/80 p-5 font-mono text-xs relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-20">
                <Terminal size={40} className="text-emerald-500" />
              </div>
              <div className="text-slate-500 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                CORE_GATEWAY_HANDSHAKE
              </div>
              <div className="text-emerald-400 font-bold mb-1">&gt; STATUS: {completedTaskIds.size === script.tasks.length ? 'AUTHORIZED' : 'PENDING_VALIDATION'}</div>
              <div className="text-slate-400">&gt; CLEARANCE: {completedTaskIds.size}/{script.tasks.length} PROTOCOLS_RESOLVED</div>
            </div>

            <div className="space-y-3">
              {script.tasks.map((task, index) => {
                const isCompleted = completedTaskIds.has(task.id);
                const isLoading = loadingTask === task.id;

                return (
                  <button
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    disabled={isCompleted || isLoading}
                    className={`w-full flex items-center justify-between p-5 rounded-[1.25rem] border border-slate-800/60 bg-slate-900/40 hover:bg-slate-800/60 transition-all duration-300 group relative overflow-hidden ${getTaskColorClass(task.type, isCompleted)} shadow-lg shadow-black/20`}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-8 h-8 rounded-lg bg-slate-950/50 border border-slate-800 flex items-center justify-center text-[10px] font-black font-mono text-slate-500 group-hover:border-current transition-colors">
                        0{index + 1}
                      </div>

                      <div className="flex items-center gap-3">
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full"></div>
                        ) : (
                          <div className="transition-transform group-hover:scale-110 duration-300">
                            {getTaskIcon(task.type)}
                          </div>
                        )}
                        <span className="font-sans font-black text-sm tracking-tight uppercase">{getTaskLabel(task)}</span>
                      </div>
                    </div>

                    <div className="relative z-10">
                      {isCompleted ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase">
                          <CheckCircle size={14} />
                          <span>SYNCED</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/50 text-slate-500 group-hover:text-slate-300 transition-colors border border-slate-800 text-[10px] font-black uppercase">
                          <Lock size={14} />
                          <span>LOCKED</span>
                        </div>
                      )}
                    </div>

                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-600 font-mono py-2 border-t border-slate-800/50">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-500" /> AES_256_ACTIVE
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <div className="flex items-center gap-1.5">
                <Zap size={12} className="text-amber-500" /> BYPASS_PREVENTION
              </div>
            </div>
          </div>
        );

      case GatewayStep.MONETIZATION:
        return (
          <div className="space-y-8 text-center animate-fade-in py-6">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-amber-500/20 blur-[30px] rounded-full animate-pulse"></div>
              <div className="relative w-24 h-24 rounded-3xl bg-slate-900 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-2xl">
                <ShieldAlert size={48} strokeWidth={1.5} />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-3xl font-black text-white tracking-tight uppercase">External Link</h3>
              <p className="text-slate-400 text-sm font-medium max-w-[280px] mx-auto leading-relaxed">
                Clearance granted. Redirecting to final destination for retrieval.
              </p>
            </div>

            <button
              onClick={handleShortenerClick}
              className="w-full py-5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black rounded-2xl tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-4 group shadow-xl shadow-amber-500/10 hover:shadow-amber-500/30"
            >
              INITIALIZE REDIRECT
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
              Bypassing unauthorized access controls...
            </div>
          </div>
        );

      case GatewayStep.RESULT:
        if (!script.rawLink) return <div className="text-center text-rose-500 font-black py-10 uppercase tracking-widest">ERROR: NO_SOURCE_FOUND</div>;

        return (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 p-6 flex items-center gap-5 backdrop-blur-md">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <Code size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-black text-emerald-400 uppercase tracking-tight">Access Granted</h3>
                <p className="text-emerald-600/70 text-xs font-mono font-bold">DECRYPTION SUCCESSFUL_V4</p>
              </div>
              <div className="ml-auto opacity-20">
                <Sparkles size={24} className="text-emerald-500" />
              </div>
            </div>

            <div className="rounded-[2.5rem] bg-slate-950/80 border border-slate-800/60 overflow-hidden relative group shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-white/[0.03]">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500/40"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40"></div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-2">source.lua</span>
                </div>
                <Terminal size={12} className="text-slate-700" />
              </div>
              <div className="p-8 max-h-48 overflow-y-auto custom-scrollbar">
                <code className="block text-emerald-400 font-mono text-sm break-all leading-relaxed font-bold">
                  {generatedCode}
                </code>
              </div>
            </div>

            <button
              onClick={copyToClipboard}
              className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.15em] transition-all duration-500 flex items-center justify-center gap-4 text-sm shadow-xl ${copied
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-black/20'
                }`}
            >
              {copied ? (
                <>
                  <CheckCircle size={20} strokeWidth={3} />
                  COPIED_RETRIVEL_KEY
                </>
              ) : (
                <>
                  <Copy size={20} strokeWidth={2.5} />
                  RETRIEVE MODULE DATA
                </>
              )}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl transition-all duration-500"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-indigo-500/10 opacity-30 pointer-events-none"></div>
      </div>

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-slate-900/80 border border-slate-800/80 rounded-[3rem] shadow-2xl animate-fade-in-up flex flex-col overflow-hidden backdrop-blur-3xl group">

        {/* Decorative corner accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full group-hover:bg-emerald-500/10 transition-all duration-1000"></div>

        {/* Title Bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/[0.03] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck size={14} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gateway_Terminal_v4.0</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 md:p-10 flex-1">
          {renderStepContent()}
        </div>

        {/* Dynamic Footer Info */}
        <div className="px-8 py-4 bg-slate-950/40 border-t border-white/[0.03] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            <span className="text-[8px] font-black text-slate-600 uppercase font-mono tracking-widest">EncryptedSession_Active</span>
          </div>
          <span className="text-[8px] font-black text-slate-700 uppercase font-mono tracking-widest">ID: {script.id.substring(0, 8)}</span>
        </div>
      </div>
    </div>
  );
};

export default GatewayModal;