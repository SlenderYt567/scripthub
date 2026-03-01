import React, { useState } from 'react';
import { X, Mail, Lock, LogIn, UserPlus, Loader2, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onClose();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Access granted! Verification email sent (if applicable).');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Dynamic Background Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-slate-900/80 border border-slate-800/80 rounded-[2rem] shadow-2xl backdrop-blur-2xl p-8 md:p-10 animate-fade-in-up overflow-hidden group">

        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[80px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-700"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700"></div>

        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center mb-10 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-2xl border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 shadow-inner">
            {isLogin ? <LogIn size={28} /> : <UserPlus size={28} />}
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">
            {isLogin ? 'Authentication' : 'Registration'}
          </h2>
          <p className="text-slate-400 text-sm font-medium text-center">
            {isLogin ? 'Access the centralized management console' : 'Initialize a new developer profile'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Terminal_Email</label>
            <div className="relative group/input">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-emerald-400 transition-colors" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 focus:outline-none transition-all placeholder:text-slate-600 font-medium"
                placeholder="developer@scripthub.sys"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Secure_Hash_Password</label>
            <div className="relative group/input">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-emerald-400 transition-colors" size={18} />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 focus:outline-none transition-all placeholder:text-slate-600 font-medium"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 text-rose-400 text-xs font-bold bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          {message && (
            <div className="flex items-center gap-3 text-emerald-400 text-xs font-bold bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 size={18} className="shrink-0" />
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                {isLogin ? (
                  <>
                    <LogIn size={20} />
                    SIGN IN NOW
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    CREATE PROFILE
                  </>
                )}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center relative z-10 border-t border-slate-800/60 pt-6">
          <p className="text-slate-500 text-sm font-medium">
            {isLogin ? "New to the hub?" : "Already part of the network?"}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }}
              className="ml-2 text-emerald-400 hover:text-emerald-300 font-black uppercase tracking-wider text-xs transition-colors"
            >
              {isLogin ? 'Initialize Setup' : 'Connect Account'}
            </button>
          </p>
        </div>

        {/* Footer info */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-600 font-mono uppercase tracking-widest relative z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
          End-to-End Encryption Enabled
        </div>
      </div>
    </div>
  );
};

export default AuthModal;