import React, { useState, useEffect } from 'react';
import { User, Save, Lock, Youtube, MessageCircle, Link as LinkIcon, Loader2, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

interface SettingsViewProps {
  user: any;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user }) => {
  const [profile, setProfile] = useState<UserProfile>({
    id: user?.id,
    username: user?.email?.split('@')[0] || '',
    bio: '',
    youtube_url: '',
    discord_url: '',
    avatar_url: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Password Reset State
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile(data);
    } else {
      // Init profile if doesn't exist (handled via triggers usually, but explicit here for safety)
      const initialProfile = {
        id: user.id,
        username: user.email.split('@')[0],
        bio: '',
        youtube_url: '',
        discord_url: ''
      };
      // Attempt to create it silently
      await supabase.from('profiles').insert([initialProfile]);
      setProfile(initialProfile);
    }
    setLoading(false);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username: profile.username, // In a real app, handle uniqueness
        bio: profile.bio,
        youtube_url: profile.youtube_url,
        discord_url: profile.discord_url,
        avatar_url: profile.avatar_url,
        updated_at: new Date()
      });

    if (error) {
      setMessage('Error updating registry.');
      console.error(error);
    } else {
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
    setSaving(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMessage('Access key must be at least 6 characters.');
      return;
    }

    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordMessage('Error updating access key.');
    } else {
      setPasswordMessage('Access key updated successfully!');
      setNewPassword('');
    }
    setPasswordLoading(false);
  };

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-6 opacity-50">
      <Loader2 className="animate-spin text-indigo-500 w-12 h-12" />
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Decrypting User Config...</span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-12 pb-20">
      <div className="flex items-center gap-6 px-4">
        <div className="w-1.5 h-12 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Client_Config</h1>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1 block px-1">Manage global identity and security</span>
        </div>
      </div>

      {/* Profile Section */}
      <div className="glass-premium border border-white/[0.05] rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full group-hover:bg-indigo-500/10 transition-all duration-1000"></div>

        <h2 className="text-2xl font-black text-white mb-10 flex items-center gap-4 relative z-10">
          <User className="text-indigo-500" strokeWidth={2.5} /> Identity_Matrix
        </h2>

        <form onSubmit={handleProfileUpdate} className="space-y-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Authorized Codename</label>
              <input
                type="text"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                className="w-full bg-black/20 border border-white/[0.05] px-6 py-4 rounded-2xl text-white focus:outline-none focus:border-indigo-500/40 focus:bg-black/40 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Avatar Identifier (URL)</label>
              <div className="relative group/input">
                <div className="absolute left-6 top-0 bottom-0 flex items-center pointer-events-none">
                  <ImageIcon className="text-slate-600 group-focus-within/input:text-indigo-500 transition-colors" size={16} />
                </div>
                <input
                  type="url"
                  value={profile.avatar_url || ''}
                  onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                  placeholder="https://assets.nexus..."
                  className="w-full bg-black/20 border border-white/[0.05] pl-16 pr-6 py-4 rounded-2xl text-white focus:outline-none focus:border-indigo-500/40 focus:bg-black/40 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Identity Briefing (Bio)</label>
            <textarea
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full bg-black/20 border border-white/[0.05] px-6 py-4 rounded-2xl text-white focus:outline-none focus:border-indigo-500/40 focus:bg-black/40 transition-all h-32 resize-none font-medium"
              placeholder="Declare your affiliation..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Comm_Link YouTube</label>
              <div className="relative group/input">
                <div className="absolute left-6 top-0 bottom-0 flex items-center pointer-events-none">
                  <Youtube className="text-slate-600 group-focus-within/input:text-rose-500 transition-colors" size={16} />
                </div>
                <input
                  type="url"
                  value={profile.youtube_url || ''}
                  onChange={(e) => setProfile({ ...profile, youtube_url: e.target.value })}
                  className="w-full bg-black/20 border border-white/[0.05] pl-16 pr-6 py-4 rounded-2xl text-white focus:outline-none focus:border-indigo-500/40 focus:bg-black/40 transition-all font-medium"
                  placeholder="https://youtube.com/@..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Comm_Link Discord</label>
              <div className="relative group/input">
                <div className="absolute left-6 top-0 bottom-0 flex items-center pointer-events-none">
                  <MessageCircle className="text-slate-600 group-focus-within/input:text-indigo-400 transition-colors" size={16} />
                </div>
                <input
                  type="url"
                  value={profile.discord_url || ''}
                  onChange={(e) => setProfile({ ...profile, discord_url: e.target.value })}
                  className="w-full bg-black/20 border border-white/[0.05] pl-16 pr-6 py-4 rounded-2xl text-white focus:outline-none focus:border-indigo-500/40 focus:bg-black/40 transition-all font-medium"
                  placeholder="https://discord.gg/..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-10 border-t border-white/[0.05]">
            <span className={`text-[10px] font-black uppercase tracking-widest ${message.includes('Error') ? 'text-rose-400' : 'text-emerald-400'}`}>
              {message}
            </span>
            <button
              type="submit"
              disabled={saving}
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} strokeWidth={2.5} />}
              Override Config
            </button>
          </div>
        </form>
      </div>

      {/* Security Section */}
      <div className="glass-premium border border-white/[0.05] rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden group">
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-rose-500/5 blur-[100px] rounded-full group-hover:bg-rose-500/10 transition-all duration-1000"></div>

        <h2 className="text-2xl font-black text-white mb-10 flex items-center gap-4 relative z-10">
          <Lock className="text-rose-500" strokeWidth={2.5} /> Security_Protocol
        </h2>

        <form onSubmit={handlePasswordChange} className="max-w-xl relative z-10 space-y-8">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">New Access Key</label>
            <div className="relative group/input">
              <div className="absolute left-6 top-0 bottom-0 flex items-center pointer-events-none">
                <Lock className="text-slate-600 group-focus-within/input:text-rose-500 transition-colors" size={16} />
              </div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Identification token (Min. 6 chars)"
                className="w-full bg-black/20 border border-white/[0.05] pl-16 pr-6 py-4 rounded-2xl text-white focus:outline-none focus:border-rose-500/40 focus:bg-black/40 transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <button
              type="submit"
              disabled={passwordLoading || !newPassword}
              className="w-full md:w-auto px-10 py-4 bg-white/5 border border-white/5 hover:border-rose-500/40 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl transition-all active:scale-95 disabled:opacity-50"
            >
              {passwordLoading ? <Loader2 className="animate-spin" size={18} /> : 'Update Access Token'}
            </button>
            {passwordMessage && (
              <p className={`text-[10px] font-black uppercase tracking-widest ${passwordMessage.includes('Error') ? 'text-rose-400' : 'text-emerald-400'}`}>
                {passwordMessage}
              </p>
            )}
          </div>
        </form>
      </div>

    </div>
  );
};

export default SettingsView;