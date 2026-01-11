import React, { useEffect, useState } from 'react';
import { Script, UserProfile } from '../types';
import ScriptCard from './ScriptCard';
import { User, MessageCircle, Youtube, Calendar, Loader2 } from 'lucide-react';
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
        // In a real app, 'scripts' table should have 'author_id'. 
        // We will try to find a profile where username matches the authorName
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="text-slate-400 hover:text-white mb-6">
        &larr; Back to Hub
      </button>
      
      {/* Profile Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-10 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-indigo-500/20 flex items-center justify-center text-indigo-500 overflow-hidden">
           {profile?.avatar_url ? (
               <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
           ) : (
               <User size={64} />
           )}
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
             <h1 className="text-4xl font-bold text-white mb-1">{profile?.username}</h1>
             <p className="text-slate-400 text-sm">Script Developer</p>
          </div>

          <p className="text-slate-300 max-w-2xl">
            {profile?.bio || "This user hasn't added a bio yet."}
          </p>

          <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap">
             {profile?.youtube_url && (
                <a href={profile.youtube_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-red-600/10 text-red-500 rounded-lg hover:bg-red-600/20 transition-colors border border-red-600/20">
                    <Youtube size={18} /> YouTube
                </a>
             )}
             {profile?.discord_url && (
                <a href={profile.discord_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 text-indigo-500 rounded-lg hover:bg-indigo-600/20 transition-colors border border-indigo-600/20">
                    <MessageCircle size={18} /> Discord
                </a>
             )}
             <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg text-slate-400 border border-slate-700">
                <Calendar size={18} /> Joined Recently
             </div>
          </div>
        </div>
        
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 min-w-[200px] text-center">
            <div className="text-3xl font-bold text-white mb-1">{scripts.length}</div>
            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Scripts Published</div>
        </div>
      </div>

      {/* User Scripts Grid */}
      <h2 className="text-2xl font-bold text-white mb-6 pl-2 border-l-4 border-indigo-500">
         Published Scripts
      </h2>
      
      {scripts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {scripts.map(script => (
                <ScriptCard key={script.id} script={script} onClick={onScriptClick} />
            ))}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
            User has not published any scripts yet.
        </div>
      )}
    </div>
  );
};

export default ProfileView;