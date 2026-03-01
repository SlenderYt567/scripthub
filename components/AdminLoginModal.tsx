import React, { useState } from 'react';
import { Shield, Lock, X, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'teste1' && password === 'teste1') {
      onLogin();
      onClose();
      setUsername('');
      setPassword('');
      setError('');
    } else {
      setError('Module authentication failed');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl animate-fade-in" onClick={onClose}></div>

      <div className="relative w-full max-w-md glass-premium rounded-[2.5rem] border border-white/[0.1] shadow-2xl p-10 animate-fade-in-up overflow-hidden">
        {/* Background Glow */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-rose-500/5 blur-[100px] rounded-full"></div>

        <button onClick={onClose} className="absolute top-8 right-8 p-2.5 bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 text-slate-500 hover:text-white transition-all rounded-xl active:scale-90 relative z-20">
          <X size={18} strokeWidth={2.5} />
        </button>

        <div className="relative z-10 flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center text-indigo-500 mb-6 shadow-lg shadow-indigo-500/5 rotate-12 group hover:rotate-0 transition-transform duration-500">
            <Shield size={36} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Access Terminal</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Encrypted Handshake Protocol</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Authorized User</label>
            <div className="relative group">
              <div className="absolute left-6 top-0 bottom-0 flex items-center pointer-events-none">
                <Shield size={16} className="text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/20 border border-white/[0.05] pl-16 pr-6 py-4 rounded-2xl text-white focus:outline-none focus:border-indigo-500/40 focus:bg-black/40 transition-all font-medium"
                placeholder="Terminal ID"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Access Key</label>
            <div className="relative group">
              <div className="absolute left-6 top-0 bottom-0 flex items-center pointer-events-none">
                <Lock size={16} className="text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/[0.05] pl-16 pr-6 py-4 rounded-2xl text-white focus:outline-none focus:border-indigo-500/40 focus:bg-black/40 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 text-rose-400 text-[10px] font-black uppercase tracking-widest bg-rose-500/10 border border-rose-500/10 p-4 rounded-2xl animate-shake">
              <AlertCircle size={16} strokeWidth={2.5} />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <Lock size={16} strokeWidth={2.5} />
            Authorize Session
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginModal;