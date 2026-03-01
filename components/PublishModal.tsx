import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Link as LinkIcon, Youtube, MessageCircle, Globe, Plus, Trash2, ArrowRight, Loader2, Image as ImageIcon, Key, Star, Sparkles, CheckCircle2, ExternalLink } from 'lucide-react';
import { Script, Task, TaskType } from '../types';
import { supabase } from '../lib/supabase';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (script: Script) => void;
  isAdmin?: boolean;
  scriptToEdit?: Script | null;
}

const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose, onPublish, isAdmin = false, scriptToEdit = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('Guest');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    gameName: '',
    description: '',
    rawLink: '',
    shortenerLink: '',
    keySystem: false,
    isOfficial: false
  });

  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Task Builder State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskType, setActiveTaskType] = useState<TaskType | null>(null);
  const [tempTaskUrl, setTempTaskUrl] = useState('');

  // Fetch current user on open or handle edit data
  useEffect(() => {
    if (isOpen) {
      if (scriptToEdit) {
        setFormData({
          title: scriptToEdit.title,
          gameName: scriptToEdit.gameName,
          description: scriptToEdit.description || '',
          rawLink: scriptToEdit.rawLink || '',
          shortenerLink: scriptToEdit.shortenerLink || '',
          keySystem: scriptToEdit.keySystem,
          isOfficial: scriptToEdit.isOfficial || false
        });
        setTasks(scriptToEdit.tasks || []);
        setImagePreview(scriptToEdit.imageUrl);
      } else {
        // Reset fields when opening for new script
        setFormData({
          title: '',
          gameName: '',
          description: '',
          rawLink: '',
          shortenerLink: '',
          keySystem: false,
          isOfficial: false
        });
        setImagePreview(null);
        setTasks([]);
      }

      supabase.auth.getUser().then(({ data }) => {
        if (data.user?.email) {
          setCurrentUserEmail(data.user.email.split('@')[0]);
        }
      });
    } else {
      // Reset fields when closed
      setFormData({ title: '', gameName: '', description: '', rawLink: '', shortenerLink: '', keySystem: false, isOfficial: false });
      setImageFile(null);
      setImagePreview(null);
      setTasks([]);
    }
  }, [isOpen, scriptToEdit]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddTask = () => {
    if (!activeTaskType || !tempTaskUrl) return;

    let defaultText = '';
    switch (activeTaskType) {
      case 'youtube_subscribe': defaultText = 'Subscribe to channel'; break;
      case 'youtube_like': defaultText = 'Like video'; break;
      case 'discord_join': defaultText = 'Join Discord server'; break;
      case 'visit_url': defaultText = 'Visit page'; break;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      type: activeTaskType,
      url: tempTaskUrl,
      text: defaultText
    };

    setTasks([...tasks, newTask]);
    setActiveTaskType(null);
    setTempTaskUrl('');
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Require Image if NOT editing
    if (!imageFile && !scriptToEdit) {
      alert("Please select a thumbnail image.");
      return;
    }

    // Validation: Require either Raw Link OR Shortener Link
    if (!formData.rawLink && !formData.shortenerLink) {
      alert("You must provide either a 'Raw Script URL' (for direct code) OR a 'Monetization Link' (for external download).");
      return;
    }

    setIsSubmitting(true);

    try {
      let publicUrl = scriptToEdit?.imageUrl || '';

      // 1. Upload Image to Supabase Storage (Only if new file selected)
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `thumbnails/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl: newUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        publicUrl = newUrl;
      }

      // 2. Insert or Update Script
      let scriptData, scriptError;

      const payload = {
        title: formData.title,
        game_name: formData.gameName,
        description: formData.description,
        image_url: publicUrl,
        author: scriptToEdit ? scriptToEdit.author : currentUserEmail,
        raw_link: formData.rawLink || null,
        shortener_link: formData.shortenerLink || null,
        verified: scriptToEdit ? scriptToEdit.verified : (isAdmin ? true : false),
        is_official: isAdmin && formData.isOfficial ? true : false,
        key_system: formData.keySystem
      };

      if (scriptToEdit) {
        const { data, error } = await supabase
          .from('scripts')
          .update(payload)
          .eq('id', scriptToEdit.id)
          .select()
          .single();
        scriptData = data;
        scriptError = error;
      } else {
        const { data, error } = await supabase
          .from('scripts')
          .insert([payload])
          .select()
          .single();
        scriptData = data;
        scriptError = error;
      }

      if (scriptError) throw scriptError;

      // 3. Handle Tasks (Delete and Re-insert if editing)
      if (scriptToEdit) {
        const { error: deleteError } = await supabase
          .from('tasks')
          .delete()
          .eq('script_id', scriptToEdit.id);
        if (deleteError) throw deleteError;
      }

      // 3. Insert Tasks if any
      if (tasks.length > 0 && scriptData) {
        const tasksPayload = tasks.map(t => ({
          script_id: scriptData.id,
          type: t.type,
          url: t.url,
          text: t.text
        }));

        const { error: tasksError } = await supabase
          .from('tasks')
          .insert(tasksPayload);

        if (tasksError) throw tasksError;
      }

      // 4. Update UI
      if (scriptData) {
        const newScript: Script = {
          id: scriptData.id,
          title: scriptData.title,
          gameName: scriptData.game_name,
          description: scriptData.description,
          imageUrl: scriptData.image_url,
          author: scriptData.author,
          views: scriptData.views || 0,
          rawLink: scriptData.raw_link,
          shortenerLink: scriptData.shortener_link,
          tasks: tasks,
          createdAt: Date.now(),
          verified: isAdmin || (scriptToEdit ? scriptToEdit.verified : false),
          isOfficial: isAdmin && formData.isOfficial,
          keySystem: formData.keySystem
        };
        onPublish(newScript);
      }

      onClose();

    } catch (error: any) {
      console.error('Error publishing:', error);
      alert(`Failed to publish: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case 'youtube_subscribe':
      case 'youtube_like': return <Youtube size={18} />;
      case 'discord_join': return <MessageCircle size={18} />;
      case 'visit_url': return <Globe size={18} />;
    }
  };

  const getTaskColor = (type: TaskType) => {
    switch (type) {
      case 'youtube_subscribe': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'youtube_like': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'discord_join': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'visit_url': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-5xl bg-slate-900/90 border border-slate-800/80 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl flex flex-col max-h-[92vh] overflow-hidden animate-fade-in-up">

        {/* Dynamic Background Effects */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/5 blur-[100px] rounded-full pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800/60 relative z-10 bg-slate-900/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UploadCloud size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                {scriptToEdit ? 'Module Configuration' : 'Script Deployment'}
              </h2>
              <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">System_Protocol_v2.4</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-2xl text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-8 md:p-10 flex-1 relative z-10 custom-scrollbar">
          <form id="publish-form" onSubmit={handleSubmit} className="flex flex-col lg:grid lg:grid-cols-2 gap-12">

            {/* Step 1: Core Configuration */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-xs font-black text-emerald-400 shadow-inner">01</div>
                <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest">Base Identity</h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Script_Identifier</label>
                  <input required name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 focus:outline-none transition-all placeholder:text-slate-600 font-bold" placeholder="E.g., Silent Aim V3" />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Target_Environment</label>
                  <input required name="gameName" value={formData.gameName} onChange={handleChange} className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 focus:outline-none transition-all placeholder:text-slate-600 font-bold" placeholder="E.g., BedWars" />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Functional_Documentation</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 focus:outline-none h-32 resize-none transition-all placeholder:text-slate-600 font-medium leading-relaxed" placeholder="Summarize internal logic & features..." />
                </div>

                {/* Aesthetic Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="relative flex items-center gap-3 p-4 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-emerald-500/30 transition-all cursor-pointer group">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.keySystem ? 'bg-emerald-500 border-emerald-500 rotate-0' : 'border-slate-700 bg-slate-900 rotate-45 group-hover:rotate-0'}`}>
                      {formData.keySystem && <CheckCircle2 size={14} className="text-slate-950" strokeWidth={3} />}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.keySystem}
                      onChange={(e) => setFormData({ ...formData, keySystem: e.target.checked })}
                    />
                    <div>
                      <span className="block text-sm font-bold text-slate-200">Key System</span>
                      <span className="text-[10px] text-slate-500 font-mono uppercase">Monetization_Active</span>
                    </div>
                  </label>

                  {isAdmin && (
                    <label className="relative flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer group">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.isOfficial ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'border-emerald-500/30 bg-slate-900'}`}>
                        {formData.isOfficial && <Sparkles size={14} className="text-slate-950" strokeWidth={3} />}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={formData.isOfficial}
                        onChange={(e) => setFormData({ ...formData, isOfficial: e.target.checked })}
                      />
                      <div>
                        <span className="block text-sm font-black text-emerald-400">Official Hub</span>
                        <span className="text-[10px] text-emerald-600/70 font-mono uppercase">Verified_Status</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Content & Visuals */}
            <div className="space-y-10">
              {/* Image Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-xs font-black text-emerald-400 shadow-inner">02</div>
                  <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest">Visual Assets</h3>
                </div>

                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="script-image-upload"
                  />
                  <label
                    htmlFor="script-image-upload"
                    className={`w-full h-48 flex flex-col items-center justify-center border-2 border-dashed rounded-[2rem] cursor-pointer transition-all overflow-hidden relative ${imagePreview
                      ? 'border-emerald-500/50 bg-slate-950/50'
                      : 'border-slate-800 bg-slate-950/30 hover:border-emerald-500/50 hover:bg-slate-950/50'
                      }`}
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-full group">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <div className="p-3 bg-emerald-500 rounded-full text-slate-950 shadow-xl scale-90 group-hover:scale-100 transition-transform">
                            <Plus size={20} strokeWidth={3} />
                          </div>
                          <span className="text-xs font-black text-white uppercase tracking-wider">Replace Assets</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 text-slate-500 shadow-inner group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all">
                          <ImageIcon size={32} />
                        </div>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">Initialize_Thumbnail_Protocol</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Unlock Steps / Tasks */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-xs font-black text-emerald-400 shadow-inner">03</div>
                    <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest">Unlock Sequence</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{tasks.length} SECURE_STEPS</span>
                </div>

                <div className="p-6 rounded-[2rem] bg-slate-950/50 border border-slate-800/80 space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { type: 'youtube_subscribe', label: 'YouTube Sub', icon: Youtube },
                      { type: 'youtube_like', label: 'YouTube Like', icon: Youtube },
                      { type: 'discord_join', label: 'Discord Join', icon: MessageCircle },
                      { type: 'visit_url', label: 'External URL', icon: Globe },
                    ].map((btn) => (
                      <button
                        key={btn.type}
                        type="button"
                        onClick={() => setActiveTaskType(btn.type as TaskType)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-xs font-bold uppercase tracking-tight ${activeTaskType === btn.type ? 'bg-emerald-500 text-slate-950 border-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-emerald-500/50 hover:text-slate-200'}`}
                      >
                        <btn.icon size={16} /> {btn.label}
                      </button>
                    ))}
                  </div>

                  {activeTaskType && (
                    <div className="p-5 bg-slate-900 rounded-2xl border border-emerald-500/20 animate-in fade-in slide-in-from-top-4 duration-300">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Target_Endpoint_URI</label>
                      <div className="flex gap-2">
                        <input
                          autoFocus
                          type="url"
                          value={tempTaskUrl}
                          onChange={(e) => setTempTaskUrl(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 font-medium"
                          placeholder="https://scripthub.net/endpoint"
                        />
                        <button
                          type="button"
                          onClick={handleAddTask}
                          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-sm font-black uppercase transition-all shadow-lg shadow-emerald-500/20"
                        >
                          Push
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {tasks.map((task, index) => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl ${getTaskColor(task.type)} border`}>
                            {getTaskIcon(task.type)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white leading-tight">{task.text}</p>
                            <p className="text-[10px] text-slate-500 truncate max-w-[150px] sm:max-w-none font-mono mt-0.5">{task.url}</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => removeTask(task.id)} className="p-2.5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-800/60">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <LinkIcon size={14} className="text-emerald-500" /> Source_Code_Endpoint
                    </label>
                    <input
                      required={!formData.shortenerLink}
                      name="rawLink"
                      value={formData.rawLink}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-emerald-400 font-bold text-sm focus:border-emerald-500/50 focus:outline-none transition-all placeholder:text-slate-700"
                      placeholder="loadstring(game:HttpGet('...'))()"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <ExternalLink size={14} className="text-slate-500" /> Monetization_Redirect
                    </label>
                    <input
                      name="shortenerLink"
                      value={formData.shortenerLink}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-300 font-medium text-sm focus:border-indigo-500/50 focus:outline-none transition-all placeholder:text-slate-700"
                      placeholder="e.g., LootLabs, Linkvertise..."
                    />
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-10 py-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-900/60 relative z-10">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono tracking-widest uppercase items-center order-2 sm:order-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Direct_Deployment_Secure
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto order-1 sm:order-2">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest"
            >
              Abort
            </button>
            <button
              disabled={isSubmitting}
              type="submit"
              form="publish-form"
              className="flex-1 sm:flex-none px-12 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  INITIALIZING
                </>
              ) : (
                <>
                  {scriptToEdit ? 'SYNC CHANGES' : 'DEPLOY SCRIPT'}
                  <ArrowRight size={20} strokeWidth={3} />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PublishModal;