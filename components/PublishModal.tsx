import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Link as LinkIcon, Youtube, MessageCircle, Globe, Plus, Trash2, ArrowRight, Loader2, Image as ImageIcon, Key, Star, Sparkles, CheckCircle2, ExternalLink } from 'lucide-react';
import { Script, Task, TaskType } from '../types';
import { supabase } from '../lib/supabase';
import { isSafeExternalUrl } from '../utils/url';
import { mapScript } from '../utils/mapScript';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (script: Script) => Promise<void>;
  isAdmin?: boolean;
  scriptToEdit?: Script | null;
}

const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose, onPublish, isAdmin = false, scriptToEdit = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [formError, setFormError] = useState('');
  const [saveState, setSaveState] = useState('');
  const [publishedId, setPublishedId] = useState<string | null>(null);

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

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  // Task Builder State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskType, setActiveTaskType] = useState<TaskType | null>(null);
  const [tempTaskUrl, setTempTaskUrl] = useState('');

  // Fetch current user on open or handle edit data
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setFormError('');
      setSaveState('');
      setPublishedId(null);
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
        if (data.user) {
          setCurrentUser(data.user);
          if (!scriptToEdit) {
            try {
              const draft = localStorage.getItem(`script-draft:${data.user.id}`);
              if (draft) {
                const parsed = JSON.parse(draft);
                if (parsed.formData) setFormData(parsed.formData);
                if (Array.isArray(parsed.tasks)) setTasks(parsed.tasks);
                setSaveState('Draft restored. Choose a thumbnail again before publishing.');
              }
            } catch { /* Ignore damaged local drafts. */ }
          }
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
      if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
        setFormError('Choose an image smaller than 5 MB.');
        e.target.value = '';
        return;
      }
      setImageFile(file);
      setFormError('');
    }
  };

  const handleAddTask = () => {
    if (!activeTaskType || !tempTaskUrl) return;
    if (!isSafeExternalUrl(tempTaskUrl)) {
      setFormError('Task URLs must use HTTPS.');
      return;
    }

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

  const validateStep = (currentStep: number) => {
    if (currentStep === 0) {
      if (!formData.title.trim() || !formData.gameName.trim()) return 'Add a title and game name.';
    }
    if (currentStep === 1) {
      if (!imageFile && !scriptToEdit) return 'Choose a thumbnail image.';
      if (!formData.rawLink && !formData.shortenerLink) return 'Add a source URL or monetization link.';
      if ((formData.rawLink && !isSafeExternalUrl(formData.rawLink)) || (formData.shortenerLink && !isSafeExternalUrl(formData.shortenerLink))) return 'Script URLs must use HTTPS.';
    }
    return '';
  };

  const nextStep = () => {
    const error = validateStep(step);
    if (error) return setFormError(error);
    setFormError('');
    setStep(previous => Math.min(previous + 1, 2));
  };

  const saveDraft = () => {
    if (!currentUser?.id) return setFormError('Sign in to save a draft.');
    localStorage.setItem(`script-draft:${currentUser.id}`, JSON.stringify({ formData, tasks }));
    setSaveState('Draft saved on this device. Image files are not saved.');
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateStep(0) || validateStep(1);
    if (validationError) { setFormError(validationError); return; }

    setIsSubmitting(true);
    setSaveState(imageFile ? 'Uploading thumbnail...' : 'Saving script...');

    let uploadedPath: string | null = null;
    try {
      let publicUrl = scriptToEdit?.imageUrl || '';

      // 1. Upload Image to Supabase Storage (Only if new file selected)
      if (imageFile) {
        if (!currentUser?.id) throw new Error('You must be signed in to upload an image.');
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${currentUser.id}/thumbnails/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;
        uploadedPath = filePath;

        const { data: { publicUrl: newUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        publicUrl = newUrl;
        setSaveState('Saving script and tasks...');
      }

      // Save the script and its tasks in one database transaction.
      const payload = {
        title: formData.title,
        game_name: formData.gameName,
        description: formData.description,
        image_url: publicUrl,
        raw_link: formData.rawLink || null,
        shortener_link: formData.shortenerLink || null,
        verified: scriptToEdit ? scriptToEdit.verified : (isAdmin ? true : false),
        is_official: isAdmin && formData.isOfficial ? true : false,
        key_system: formData.keySystem
      };

      const { data: scriptData, error: saveError } = await supabase.rpc('save_script', {
        p_script_id: scriptToEdit?.id ?? null,
        p_payload: payload,
        p_tasks: tasks.map(({ type, url, text }) => ({ type, url, text }))
      });
      if (saveError) throw saveError;
      uploadedPath = null;
      await onPublish(mapScript({ ...scriptData, tasks }));
      if (currentUser?.id && !scriptToEdit) localStorage.removeItem(`script-draft:${currentUser.id}`);
      setPublishedId(scriptData.id);
      setSaveState('Published successfully.');

    } catch (error: any) {
      if (uploadedPath) await supabase.storage.from('images').remove([uploadedPath]);
      console.error('Error publishing:', error);
      setFormError(`Failed to publish: ${error.message}`);
      setSaveState('');
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

      <div className="relative w-full max-w-5xl bg-zinc-950/90 border border-white/10 rounded-[2rem] shadow-2xl backdrop-blur-3xl flex flex-col max-h-[92vh] overflow-hidden animate-fade-in-up">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 relative z-10 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <UploadCloud size={24} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                {scriptToEdit ? 'Module Configuration' : 'Script Deployment'}
              </h2>
              <p className="text-sm text-zinc-500 font-medium tracking-wide">{publishedId ? 'Ready to share' : `Step ${step + 1} of 3`}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-2xl text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {!publishedId && <div className="flex gap-2 px-8 pt-5" aria-label="Publishing steps">{['Details', 'Links & image', 'Preview'].map((label, index) => <div key={label} className={`flex-1 rounded-lg px-3 py-2 text-center text-xs font-semibold ${step === index ? 'bg-white text-black' : 'bg-white/5 text-zinc-400'}`}>{label}</div>)}</div>}

        {/* Content */}
        <div className="overflow-y-auto p-8 md:p-10 flex-1 relative z-10 custom-scrollbar">
          {publishedId ? <div className="mx-auto max-w-lg space-y-5 text-center py-10"><CheckCircle2 size={52} className="mx-auto text-emerald-400" /><h3 className="text-2xl font-semibold text-white">Script published</h3><p className="text-zinc-400">Your script is available at its public page.</p><a href={`/script/${encodeURIComponent(publishedId)}`} className="inline-flex rounded-xl bg-white px-6 py-3 font-semibold text-black">View script</a><div><button type="button" onClick={() => navigator.clipboard.writeText(new URL(`/script/${encodeURIComponent(publishedId)}`, window.location.origin).toString()).then(() => setSaveState('Link copied.')).catch(() => setFormError('Could not copy the link.'))} className="text-sm text-zinc-300 underline">Copy link</button></div>{saveState && <p role="status" className="text-sm text-zinc-400">{saveState}</p>}{formError && <p role="alert" className="text-sm text-rose-400">{formError}</p>}</div> : <form id="publish-form" onSubmit={handleSubmit} className="space-y-8">

            {formError && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{formError}</p>}
            {saveState && <p role="status" className="text-sm text-zinc-400">{saveState}</p>}

            {/* Step 1: Core Configuration */}
            <div className={step === 0 ? 'space-y-8 max-w-2xl' : 'hidden'}>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/5 text-xs font-semibold text-white shadow-inner">01</div>
                <h3 className="text-sm font-semibold text-white tracking-wide">Base Identity</h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-400 ml-1">Script Identifier</label>
                  <input required name="title" value={formData.title} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-white/30 focus:outline-none transition-all placeholder:text-zinc-600 font-medium" placeholder="E.g., Silent Aim V3" />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-400 ml-1">Target Environment</label>
                  <input required name="gameName" value={formData.gameName} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-white/30 focus:outline-none transition-all placeholder:text-zinc-600 font-medium" placeholder="E.g., BedWars" />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-400 ml-1">Functional Documentation</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-white/30 focus:outline-none h-32 resize-none transition-all placeholder:text-zinc-600 font-medium leading-relaxed" placeholder="Summarize internal logic & features..." />
                </div>

                {/* Aesthetic Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="relative flex items-center gap-3 p-4 rounded-xl bg-black/40 border border-white/10 hover:border-white/30 transition-all cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.keySystem ? 'bg-white border-white text-black' : 'border-zinc-700 bg-black'}`}>
                      {formData.keySystem && <CheckCircle2 size={14} strokeWidth={3} />}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.keySystem}
                      onChange={(e) => setFormData({ ...formData, keySystem: e.target.checked })}
                    />
                    <div>
                      <span className="block text-sm font-semibold text-white">Key System</span>
                      <span className="text-xs text-zinc-500 font-medium">Monetization Active</span>
                    </div>
                  </label>

                  {isAdmin && (
                    <label className="relative flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-all cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.isOfficial ? 'bg-white border-white text-black' : 'border-zinc-700 bg-black'}`}>
                        {formData.isOfficial && <Sparkles size={14} strokeWidth={3} />}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={formData.isOfficial}
                        onChange={(e) => setFormData({ ...formData, isOfficial: e.target.checked })}
                      />
                      <div>
                        <span className="block text-sm font-semibold text-white">Official Hub</span>
                        <span className="text-xs text-zinc-400 font-medium">Verified Status</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Content & Visuals */}
            <div className={step === 1 ? 'space-y-10 max-w-2xl' : 'hidden'}>
              {/* Image Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/5 text-xs font-semibold text-white shadow-inner">02</div>
                  <h3 className="text-sm font-semibold text-white tracking-wide">Visual Assets</h3>
                </div>

                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                    id="script-image-upload"
                  />
                  <label
                    htmlFor="script-image-upload"
                    className={`w-full h-48 flex flex-col items-center justify-center border-2 border-dashed rounded-[2rem] cursor-pointer transition-all overflow-hidden relative ${imagePreview
                      ? 'border-white/30 bg-black/40'
                      : 'border-white/10 bg-black/20 hover:border-white/30 hover:bg-black/40'
                      }`}
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-full group">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <div className="p-3 bg-white rounded-full text-black shadow-xl scale-90 group-hover:scale-100 transition-transform">
                            <Plus size={20} strokeWidth={3} />
                          </div>
                          <span className="text-xs font-bold text-white tracking-wide">Replace Assets</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-5 bg-white/5 rounded-3xl border border-white/10 text-zinc-400 shadow-inner group-hover:text-white transition-all">
                          <ImageIcon size={32} />
                        </div>
                        <span className="text-xs font-semibold text-zinc-400 tracking-wide group-hover:text-white transition-colors">Initialize Thumbnail Protocol</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Unlock Steps / Tasks */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/5 text-xs font-semibold text-white shadow-inner">03</div>
                    <h3 className="text-sm font-semibold text-white tracking-wide">Unlock Sequence</h3>
                  </div>
                  <span className="text-xs font-medium text-zinc-500">{tasks.length} Secure Steps</span>
                </div>

                <div className="p-6 rounded-[2rem] bg-black/40 border border-white/10 space-y-6">
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
                        className={`flex items-center gap-3 p-3.5 rounded-xl transition-all text-xs font-semibold ${activeTaskType === btn.type ? 'bg-white text-black' : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'}`}
                      >
                        <btn.icon size={16} /> {btn.label}
                      </button>
                    ))}
                  </div>

                  {activeTaskType && (
                    <div className="p-5 bg-black/40 rounded-2xl border border-white/10 animate-in fade-in duration-300">
                      <label className="block text-xs font-medium text-zinc-400 tracking-wide mb-3">Target Endpoint URI</label>
                      <div className="flex gap-2">
                        <input
                          autoFocus
                          type="url"
                          value={tempTaskUrl}
                          onChange={(e) => setTempTaskUrl(e.target.value)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 font-medium"
                          placeholder="https://scripthub.net/endpoint"
                        />
                        <button
                          type="button"
                          onClick={handleAddTask}
                          className="px-6 py-3 bg-white hover:bg-zinc-200 text-black rounded-xl text-sm font-semibold transition-all"
                        >
                          Push
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {tasks.map((task, index) => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl ${getTaskColor(task.type)} border`}>
                            {getTaskIcon(task.type)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white leading-tight">{task.text}</p>
                            <p className="text-[10px] text-zinc-500 truncate max-w-[150px] sm:max-w-none mt-0.5">{task.url}</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => removeTask(task.id)} className="p-2.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                      <LinkIcon size={16} className="text-zinc-500" /> Source Code Endpoint
                    </label>
                    <input
                      required={!formData.shortenerLink}
                      name="rawLink"
                      value={formData.rawLink}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-medium text-sm focus:border-white/30 focus:outline-none transition-all placeholder:text-zinc-600"
                      placeholder="https://example.com/script.lua"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                      <ExternalLink size={16} className="text-zinc-500" /> Monetization Redirect
                    </label>
                    <input
                      name="shortenerLink"
                      value={formData.shortenerLink}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-medium text-sm focus:border-white/30 focus:outline-none transition-all placeholder:text-zinc-600"
                      placeholder="e.g., LootLabs, Linkvertise..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {step === 2 && <div className="max-w-2xl space-y-5"><h3 className="text-xl font-semibold text-white">Review before publishing</h3><div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">{imagePreview && <img src={imagePreview} alt="Selected thumbnail" className="h-48 w-full object-cover" />}<div className="space-y-3 p-5"><h4 className="text-xl font-bold text-white">{formData.title}</h4><p className="text-sm text-zinc-400">{formData.gameName}</p><p className="whitespace-pre-wrap text-sm text-zinc-300">{formData.description || 'No description.'}</p><p className="text-xs text-zinc-500">{tasks.length} unlock tasks · {formData.rawLink ? 'Source URL' : 'Monetization link'} · {formData.keySystem ? 'Key required' : 'No key required'}</p></div></div><p className="text-xs text-zinc-500">External links are provided by the publisher. Review them before opening.</p></div>}

          </form>}
        </div>

        {/* Footer */}
        <div className="px-10 py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/[0.02] relative z-10">
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium items-center order-2 sm:order-1">
            <div className="w-2 h-2 rounded-full bg-white"></div>
            {publishedId ? 'Published' : 'Review all details before publishing'}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto order-1 sm:order-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              {publishedId ? 'Close' : 'Cancel'}
            </button>
            {!publishedId && !scriptToEdit && <button type="button" onClick={saveDraft} className="px-4 py-3 text-sm text-zinc-300 hover:text-white">Save draft</button>}
            {step > 0 && !publishedId && <button type="button" onClick={() => { setStep(previous => previous - 1); setFormError(''); }} className="px-4 py-3 text-sm text-zinc-300 hover:text-white">Back</button>}
            {!publishedId && <button
              disabled={isSubmitting}
              type={step === 2 ? 'submit' : 'button'}
              form={step === 2 ? 'publish-form' : undefined}
              onClick={step === 2 ? undefined : nextStep}
              className="flex-1 sm:flex-none px-8 py-3 bg-white hover:bg-zinc-200 text-black font-semibold rounded-full shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  {saveState || 'Publishing...'}
                </>
              ) : (
                <>
                  {step === 2 ? (scriptToEdit ? 'Save changes' : 'Publish script') : 'Next'}
                  <ArrowRight size={18} strokeWidth={2.5} />
                </>
              )}
            </button>}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PublishModal;
