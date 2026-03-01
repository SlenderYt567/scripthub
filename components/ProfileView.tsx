import React, { useEffect, useState } from 'react';
import { Script, UserProfile } from '../types';
import ScriptCard from './ScriptCard';
import { User, MessageCircle, Youtube, Calendar, Loader2, ArrowLeft, Trophy, ExternalLink, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProfileViewProps {
  authorName: string; // We use username/author for now as the key
  onScriptClick: (script: Script) => void;
  onBack: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ authorName, onScriptClick, onBack }) => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // 1. Fetch user's scripts
        const { data: scriptsData } = await supabase
          .from('scripts')
          .select(`*, tasks (*)`)
          .eq('author', authorName) // Filtering by author name
          .order('created_at', { ascending: false });

        if (scriptsData) {
          const mappedScripts: Script[] = scriptsData.map((s: any) => ({
            id: s.id,
            title: s.title,
            gameName: s.game_name,
            description: s.description,
            imageUrl: s.image_url,
            author: s.author,
            views: s.views,
            rawLink: s.raw_link,
            shortenerLink: s.shortener_link,
            verified: s.verified,
            keySystem: s.key_system || false,
            createdAt: new Date(s.created_at).getTime(),
            tasks: s.tasks || []
          }));
          setScripts(mappedScripts);
        }

        // 2. Fetch Profile Info (Mocked lookup since we don't have direct linkage in this version easily without user ID)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', authorName)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData);
        } else {
          // Partial fallback if no custom profile created yet
          setProfile({
            id: 'unknown',
            username: authorName
          });
        }

      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [authorName]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <User size={24} className="text-emerald-500/50" />
          </div>
        </div>
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">Syncing User Profile</p>
      </div>
    );
  }

  const totalViews = scripts.reduce((acc, s) => acc + (s.views || 0), 0);

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="group flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all mb-10 backdrop-blur-md"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-black uppercase tracking-widest">Return to Nexus</span>
      </button>

      {/* Profile Header */}
      <div className="relative mb-16 px-4">
        {/* Abstract Background Elements */}
        <div className="absolute -top-20 -left-10 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full"></div>
        <div className="absolute -bottom-20 -right-10 w-96 h-96 bg-indigo-500/5 blur-[100px] rounded-full"></div>

        <div className="relative glass-premium rounded-[3rem] p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-10 shadow-2xl overflow-hidden group">

          {/* Avatar Section */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-emerald-500/20 blur-[30px] rounded-full transition-opacity group-hover:opacity-40 animate-pulse"></div>
            <div className="relative w-40 h-40 rounded-[2.5rem] bg-slate-950 border-2 border-emerald-500/20 flex items-center justify-center text-emerald-500 overflow-hidden shadow-2xl group-hover:border-emerald-500/40 transition-all duration-500">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              ) : (
                <User size={80} strokeWidth={1} />
              )}
            </div>

            {/* Badge */}
            <div className="absolute -bottom-2 -right-2 p-2 rounded-2xl bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/40 border-4 border-slate-900 group-hover:scale-110 transition-transform">
              <ShieldCheck size={20} strokeWidth={3} />
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 text-center md:text-left space-y-6">
            <div className="space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                <h1 className="text-5xl font-black text-white tracking-tight leading-none">{profile?.username}</h1>
                <span className="w-fit px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                  Top Developer
                </span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest">
                <Calendar size={12} className="text-emerald-500" /> Active since Q1 2026
              </div>
            </div>

            <p className="text-slate-400 text-lg font-medium max-w-2xl leading-relaxed">
              {profile?.bio || "This expert developer hasn't disclosed their bio yet. Specialized in advanced exploitation frameworks."}
            </p>

            <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap pt-2">
              {profile?.youtube_url && (
                <a href={profile.youtube_url} target="_blank" rel="noopener noreferrer" className="group/social flex items-center gap-3 px-6 py-3 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-2xl transition-all border border-red-500/10 hover:border-red-500/30 font-black uppercase text-xs tracking-widest">
                  <Youtube size={18} strokeWidth={2.5} /> Dev Channel
                </a>
              )}
              {profile?.discord_url && (
                <a href={profile.discord_url} target="_blank" rel="noopener noreferrer" className="group/social flex items-center gap-3 px-6 py-3 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-500 rounded-2xl transition-all border border-indigo-500/10 hover:border-indigo-500/30 font-black uppercase text-xs tracking-widest">
                  <MessageCircle size={18} strokeWidth={2.5} /> Discord Lab
                </a>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="shrink-0 flex flex-col gap-4 min-w-[220px]">
            <div className="glass-premium bg-emerald-500/5 p-6 rounded-[2rem] border border-emerald-500/10 text-center group/stat hover:border-emerald-500/30 transition-all">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Zap size={16} className="text-amber-500" />
                <div className="text-4xl font-black text-white tracking-tighter">{scripts.length}</div>
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Deployments</div>
            </div>

            <div className="glass-premium bg-indigo-500/5 p-6 rounded-[2rem] border border-indigo-500/10 text-center group/stat hover:border-indigo-500/30 transition-all">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Trophy size={16} className="text-indigo-500" />
                <div className="text-3xl font-black text-white tracking-tighter">{totalViews.toLocaleString()}</div>
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Social Impact</div>
            </div>
          </div>
        </div>
      </div>

      {/* User Scripts Grid */}
      <div className="space-y-10">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-12 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">Deployment Vault</h2>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Authorized Module List</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950/50 border border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Filtered by Latest
          </div>
        </div>

        {scripts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {scripts.map(script => (
              <div key={script.id} className="animate-fade-in-up">
                <ScriptCard script={script} onClick={onScriptClick} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 rounded-[3rem] bg-slate-900/40 border-2 border-dashed border-slate-800 flex flex-col items-center gap-4">
            <div className="p-4 rounded-3xl bg-slate-950 text-slate-700">
              <Sparkles size={40} />
            </div>
            <div className="space-y-1">
              <p className="text-slate-500 font-black uppercase text-sm tracking-widest">Vault is Currently Empty</p>
              <p className="text-slate-600 text-[10px] font-medium uppercase tracking-[0.2em]">Awaiting new module deployments</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;