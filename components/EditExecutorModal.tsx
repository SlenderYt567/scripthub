import React, { useState, useEffect } from 'react';
import { X, Cpu, Globe, Image as ImageIcon, Loader2, ArrowRight, Zap } from 'lucide-react';
import { Executor } from '../types';
import { supabase } from '../lib/supabase';

interface EditExecutorModalProps {
    isOpen: boolean;
    onClose: () => void;
    executor: Executor;
    onUpdate: (executor: Executor) => void;
}

const EditExecutorModal: React.FC<EditExecutorModalProps> = ({ isOpen, onClose, executor, onUpdate }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: executor.name,
        description: executor.description || '',
        downloadUrl: executor.downloadUrl,
        platform: executor.platform,
        status: executor.status
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(executor.imageUrl);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: executor.name,
                description: executor.description || '',
                downloadUrl: executor.downloadUrl,
                platform: executor.platform,
                status: executor.status
            });
            setImagePreview(executor.imageUrl);
            setImageFile(null);
        }
    }, [isOpen, executor]);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let publicUrl = executor.imageUrl;

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `executors/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(fileName, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl: newUrl } } = supabase.storage
                    .from('images')
                    .getPublicUrl(fileName);

                publicUrl = newUrl;
            }

            const payload = {
                name: formData.name,
                description: formData.description,
                image_url: publicUrl,
                download_url: formData.downloadUrl,
                platform: formData.platform as any,
                status: formData.status as any
            };

            const { data, error } = await supabase
                .from('executors')
                .update(payload)
                .eq('id', executor.id)
                .select()
                .single();

            if (error) throw error;

            if (data) {
                onUpdate({
                    id: data.id,
                    name: data.name,
                    description: data.description,
                    imageUrl: data.image_url,
                    downloadUrl: data.download_url,
                    platform: data.platform,
                    status: data.status
                });
            }
            onClose();
        } catch (err: any) {
            alert("Error updating executor: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl animate-fade-in" onClick={onClose}></div>

            <div className="relative w-full max-w-2xl glass-premium rounded-[2.5rem] border border-white/[0.1] shadow-2xl flex flex-col max-h-[90vh] animate-fade-in-up overflow-hidden">
                {/* Header Decoration */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full"></div>

                <div className="flex items-center justify-between px-10 py-8 relative z-10 border-b border-white/[0.05]">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-10 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Mod_Module_Config</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Authorized Modification Protocol</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 text-slate-500 hover:text-white transition-all rounded-2xl active:scale-90"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="overflow-y-auto px-10 py-8 flex-1 custom-scrollbar relative z-10">
                    <form id="edit-executor-form" onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Module Name</label>
                                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-black/20 border border-white/[0.05] px-6 py-4 rounded-2xl text-white focus:outline-none focus:border-indigo-500/40 focus:bg-black/40 transition-all font-medium" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Download Endpoint</label>
                                    <input required value={formData.downloadUrl} onChange={e => setFormData({ ...formData, downloadUrl: e.target.value })} className="w-full bg-black/20 border border-white/[0.05] px-6 py-4 rounded-2xl text-white focus:outline-none focus:border-indigo-500/40 focus:bg-black/40 transition-all font-medium" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Platform</label>
                                        <select value={formData.platform} onChange={e => setFormData({ ...formData, platform: e.target.value as any })} className="w-full bg-black/20 border border-white/[0.05] px-6 py-4 rounded-2xl text-white focus:outline-none focus:border-indigo-500/40 focus:bg-black/40 transition-all font-bold uppercase tracking-widest text-[10px]">
                                            <option value="Windows">Windows</option>
                                            <option value="Android">Android</option>
                                            <option value="iOS">iOS</option>
                                            <option value="Mac">Mac</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Registry State</label>
                                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="w-full bg-black/20 border border-white/[0.05] px-6 py-4 rounded-2xl text-white focus:outline-none focus:border-indigo-500/40 focus:bg-black/40 transition-all font-bold uppercase tracking-widest text-[10px]">
                                            <option value="Working">Working</option>
                                            <option value="Updating">Updating</option>
                                            <option value="Patched">Patched</option>
                                            <option value="Detected">Detected</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Asset Identification (Cover Image)</label>
                                    <div className="relative group/asset">
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="edit-executor-image-upload" />
                                        <label htmlFor="edit-executor-image-upload" className={`h-[200px] w-full flex items-center justify-center border-2 border-dashed rounded-3xl cursor-pointer transition-all overflow-hidden relative ${imagePreview
                                            ? 'border-indigo-500/40 bg-black/40'
                                            : 'border-white/5 bg-black/20 text-slate-600 hover:border-indigo-500/40'
                                            }`}>
                                            {imagePreview ? (
                                                <>
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover group-hover/asset:scale-110 transition-transform duration-700"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 group-hover/asset:opacity-100 transition-opacity">
                                                        <div className="flex flex-col items-center gap-2 text-white px-4 py-2 rounded-2xl bg-black/40 border border-white/10">
                                                            <ImageIcon size={24} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Swap_Asset</span>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center gap-3">
                                                    <ImageIcon size={40} className="opacity-20" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Connect Asset</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Core Operational Briefing</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-black/20 border border-white/[0.05] px-6 py-4 rounded-2xl text-white focus:outline-none focus:border-indigo-500/40 focus:bg-black/40 transition-all h-32 resize-none font-medium" placeholder="Breakdown of module capabilities..." />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="px-10 py-8 border-t border-white/[0.05] flex justify-end gap-4 bg-black/20 backdrop-blur-md relative z-10">
                    <button type="button" onClick={onClose} className="px-8 py-4 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all">Abort_Changes</button>
                    <button type="submit" form="edit-executor-form" disabled={isSubmitting} className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-3 disabled:opacity-50 active:scale-95">
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (
                            <>
                                <Zap size={18} strokeWidth={3} />
                                Update Registry
                            </>
                        )}
                        {!isSubmitting && <ArrowRight size={18} strokeWidth={2.5} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditExecutorModal;
