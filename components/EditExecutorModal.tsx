import React, { useState, useEffect } from 'react';
import { X, Cpu, Globe, Image as ImageIcon, Loader2, ArrowRight } from 'lucide-react';
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Cpu className="text-indigo-500" />
                        Edit Executor
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
                    <form id="edit-executor-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase">Name</label>
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase">Image</label>
                                <div className="relative group">
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="edit-executor-image-upload" />
                                    <label htmlFor="edit-executor-image-upload" className="h-[50px] w-full flex items-center justify-center border border-dashed border-slate-700 bg-slate-950 rounded-lg cursor-pointer hover:border-indigo-500 transition-all text-slate-400 hover:text-indigo-400">
                                        <ImageIcon size={16} className="mr-2" />
                                        <span className="text-sm truncate max-w-[150px]">{imageFile ? imageFile.name : 'Change Image'}</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase">Download URL</label>
                                <input required value={formData.downloadUrl} onChange={e => setFormData({ ...formData, downloadUrl: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase">Platform</label>
                                <select value={formData.platform} onChange={e => setFormData({ ...formData, platform: e.target.value as any })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none">
                                    <option value="Windows">Windows</option>
                                    <option value="Android">Android</option>
                                    <option value="iOS">iOS</option>
                                    <option value="Mac">Mac</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase">Status</label>
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none">
                                    <option value="Working">Working</option>
                                    <option value="Updating">Updating</option>
                                    <option value="Patched">Patched</option>
                                    <option value="Detected">Detected</option>
                                </select>
                            </div>

                            <div className="md:col-span-2 space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase">Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none h-24 resize-none" placeholder="Description..." />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-400 hover:text-white font-medium">Cancel</button>
                    <button type="submit" form="edit-executor-form" disabled={isSubmitting} className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50">
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Update Executor'}
                        {!isSubmitting && <ArrowRight size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditExecutorModal;
