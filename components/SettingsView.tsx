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
      setMessage('Error saving profile.');
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
      setPasswordMessage('Password must be at least 6 characters.');
      return;
    }
    
    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      setPasswordMessage('Error updating password.');
    } else {
      setPasswordMessage('Password updated successfully!');
      setNewPassword('');
    }
    setPasswordLoading(false);
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-indigo-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
      <h1 className="text-3xl font-bold text-white mb-6">Account Settings</h1>

      {/* Profile Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <User className="text-indigo-500" /> Public Profile
        </h2>

        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Display Name</label>
              <input 
                type="text" 
                value={profile.username}
                onChange={(e) => setProfile({...profile, username: e.target.value})}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Avatar URL (Image Link)</label>
              <div className="relative">
                  <ImageIcon className="absolute left-3 top-3.5 text-slate-500" size={16} />
                  <input 
                    type="url" 
                    value={profile.avatar_url || ''}
                    onChange={(e) => setProfile({...profile, avatar_url: e.target.value})}
                    placeholder="https://imgur.com/..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-3 py-3 text-white focus:border-indigo-500 outline-none" 
                  />
              </div>
            </div>
          </div>

          <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Bio / About Me</label>
              <textarea 
                value={profile.bio || ''}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none h-24 resize-none" 
                placeholder="Tell the community about yourself..."
              />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">YouTube Channel</label>
                <div className="relative">
                    <Youtube className="absolute left-3 top-3.5 text-slate-500" size={16} />
                    <input 
                        type="url" 
                        value={profile.youtube_url || ''}
                        onChange={(e) => setProfile({...profile, youtube_url: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-3 py-3 text-white focus:border-indigo-500 outline-none" 
                        placeholder="https://youtube.com/@..."
                    />
                </div>
             </div>
             <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Discord Invite</label>
                <div className="relative">
                    <MessageCircle className="absolute left-3 top-3.5 text-slate-500" size={16} />
                    <input 
                        type="url" 
                        value={profile.discord_url || ''}
                        onChange={(e) => setProfile({...profile, discord_url: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-3 py-3 text-white focus:border-indigo-500 outline-none" 
                        placeholder="https://discord.gg/..."
                    />
                </div>
             </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
             <span className={`text-sm font-medium ${message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                {message}
             </span>
             <button 
               type="submit" 
               disabled={saving}
               className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
             >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Save Profile
             </button>
          </div>
        </form>
      </div>

      {/* Security Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Lock className="text-indigo-500" /> Security
        </h2>
        <form onSubmit={handlePasswordChange} className="max-w-md">
            <div className="mb-4">
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">New Password</label>
                <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" 
                />
            </div>
            <button 
               type="submit" 
               disabled={passwordLoading || !newPassword}
               className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
             >
                {passwordLoading ? <Loader2 className="animate-spin" size={18} /> : 'Update Password'}
             </button>
             {passwordMessage && (
                 <p className={`mt-3 text-sm ${passwordMessage.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                     {passwordMessage}
                 </p>
             )}
        </form>
      </div>

    </div>
  );
};

export default SettingsView;