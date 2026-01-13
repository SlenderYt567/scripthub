import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Link as LinkIcon, Youtube, MessageCircle, Globe, Plus, Trash2, ArrowRight, Loader2, Image as ImageIcon, Key } from 'lucide-react';
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
          verified: isAdmin,
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
      case 'youtube_subscribe': return 'bg-red-600 hover:bg-red-500 border-red-500';
      case 'youtube_like': return 'bg-red-600 hover:bg-red-500 border-red-500';
      case 'discord_join': return 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500';
      case 'visit_url': return 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <UploadCloud className="text-indigo-500" />
            {scriptToEdit ? 'Edit Script Link' : 'Create Script Link'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
          <form id="publish-form" onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">

            {/* Left Column: Basic Info */}
            <div className="flex-1 space-y-5">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">1</span>
                Script Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase">Title</label>
                  <input required name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none" placeholder="Script Name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase">Game</label>
                  <input required name="gameName" value={formData.gameName} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none" placeholder="Roblox Game Name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none h-24 resize-none" placeholder="What does this script do?" />
                </div>

                {/* Image File Upload */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase">Thumbnail Image</label>
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
                      className={`w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all ${imagePreview
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-700 bg-slate-950 hover:border-indigo-500 hover:bg-slate-900'
                        }`}
                    >
                      {imagePreview ? (
                        <div className="relative w-full h-32">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-md" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                            <span className="text-white text-xs font-bold">Change Image</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 text-slate-500 mb-2 group-hover:text-indigo-400" />
                          <span className="text-sm text-slate-400 group-hover:text-white">Click to upload thumbnail</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-700 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors flex-1">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.keySystem ? 'bg-indigo-600 border-indigo-600' : 'border-slate-500'}`}>
                      {formData.keySystem && <Key size={12} className="text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.keySystem}
                      onChange={(e) => setFormData({ ...formData, keySystem: e.target.checked })}
                    />
                    <div>
                      <span className="block text-sm font-medium text-white">Requires Key System?</span>
                    </div>
                  </label>

                  {isAdmin && (
                    <label className="flex items-center gap-3 p-3 bg-indigo-900/20 border border-indigo-500/30 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors flex-1">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isOfficial ? 'bg-indigo-500 border-indigo-500' : 'border-indigo-500/50'}`}>
                        {formData.isOfficial && <Key size={12} className="text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={formData.isOfficial}
                        onChange={(e) => setFormData({ ...formData, isOfficial: e.target.checked })}
                      />
                      <div>
                        <span className="block text-sm font-bold text-indigo-400">Official SlenderHub Script?</span>
                      </div>
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase">Raw Script URL (Source)</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3.5 text-slate-500" size={16} />
                    <input
                      type="url"
                      name="rawLink"
                      value={formData.rawLink}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-3 py-3 text-indigo-300 font-mono text-sm focus:border-indigo-500 focus:outline-none"
                      placeholder="Optional if Monetization Link is provided..."
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Leave empty if you only want to provide the Monetization Link below.</p>
                </div>
              </div>
            </div>

            {/* Right Column: Tasks/Actions */}
            <div className="flex-1 space-y-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">2</span>
                Unlock Actions
              </h3>

              {/* Action Builder */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="text-sm text-slate-300 font-medium mb-2">Add a required step:</div>

                {/* Action Buttons Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setActiveTaskType('youtube_subscribe')} className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-red-500/50 hover:bg-red-500/10 transition-all text-slate-300 hover:text-red-400 text-sm font-medium">
                    <Youtube size={16} /> Subscribe
                  </button>
                  <button type="button" onClick={() => setActiveTaskType('youtube_like')} className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-red-500/50 hover:bg-red-500/10 transition-all text-slate-300 hover:text-red-400 text-sm font-medium">
                    <Youtube size={16} /> Like Video
                  </button>
                  <button type="button" onClick={() => setActiveTaskType('discord_join')} className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all text-slate-300 hover:text-indigo-400 text-sm font-medium">
                    <MessageCircle size={16} /> Join Discord
                  </button>
                  <button type="button" onClick={() => setActiveTaskType('visit_url')} className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all text-slate-300 hover:text-emerald-400 text-sm font-medium">
                    <Globe size={16} /> Visit URL
                  </button>
                </div>

                {/* Input for Selected Action */}
                {activeTaskType && (
                  <div className="animate-fade-in mt-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase">
                      Target URL for {activeTaskType.replace('_', ' ')}
                    </label>
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        type="url"
                        value={tempTaskUrl}
                        onChange={(e) => setTempTaskUrl(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        placeholder="https://..."
                      />
                      <button
                        type="button"
                        onClick={handleAddTask}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-bold"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tasks List (Preview) */}
              <div className="space-y-3">
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Preview Unlock Steps</div>
                {tasks.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl text-slate-600 text-sm">
                    No actions added yet.
                  </div>
                ) : (
                  tasks.map((task, index) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg group">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md text-white ${getTaskColor(task.type).split(' ')[0]}`}>
                          {getTaskIcon(task.type)}
                        </div>
                        <div className="text-sm text-slate-300">
                          <span className="font-medium text-white mr-2">{index + 1}.</span>
                          {task.text}
                        </div>
                      </div>
                      <button type="button" onClick={() => removeTask(task.id)} className="text-slate-600 hover:text-red-400 p-2">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}

                {/* Optional Monetization at the end */}
                <div className="pt-4 border-t border-slate-800/50 mt-4">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase flex items-center gap-2">
                    <LinkIcon size={12} /> Monetization / Download Link
                  </label>
                  <input
                    name="shortenerLink"
                    value={formData.shortenerLink}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="e.g., Linkvertise, LootLabs, or direct MediaFire..."
                  />
                  <p className="text-[10px] text-slate-500 mt-1">If filled, users will be directed here after tasks. If empty, the Raw Code is shown.</p>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-slate-400 hover:text-white font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={isSubmitting}
            type="submit"
            form="publish-form"
            className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (scriptToEdit ? 'Update Link' : 'Create Link')}
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </div>

      </div>
    </div>
  );
};

export default PublishModal;