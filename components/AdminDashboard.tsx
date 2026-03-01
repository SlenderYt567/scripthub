import React, { useState, useEffect } from 'react';
import {
  Users, FileCode, Cpu, Shield, Trash2, CheckCircle,
  AlertTriangle, Plus, X, Search, ShieldCheck, Download, Loader2, Mail, Image as ImageIcon, Star, ExternalLink, Link, Pencil, Database, Terminal, Settings, ShieldAlert
} from 'lucide-react';
import { Script, Executor, AdminUser } from '../types';
import { supabase } from '../lib/supabase';
import EditExecutorModal from './EditExecutorModal';

interface AdminDashboardProps {
  scripts: Script[];
  setScripts: React.Dispatch<React.SetStateAction<Script[]>>;
  executors: Executor[];
  setExecutors: React.Dispatch<React.SetStateAction<Executor[]>>;
  onEditScript: (script: Script) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  scripts, setScripts, executors, setExecutors, onEditScript
}) => {
  const [activeTab, setActiveTab] = useState<'scripts' | 'executors' | 'users'>('scripts');
  const [showAddExecutor, setShowAddExecutor] = useState(false);
  const [executorToEdit, setExecutorToEdit] = useState<Executor | null>(null);

  // Admin Users State
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  // Executor Form State
  const [newExecutor, setNewExecutor] = useState<Partial<Executor>>({
    name: '',
    description: '',
    downloadUrl: '',
    platform: 'Windows',
    status: 'Working'
  });

  // Executor Image File State
  const [executorImageFile, setExecutorImageFile] = useState<File | null>(null);
  const [executorImagePreview, setExecutorImagePreview] = useState<string | null>(null);
  const [isSubmittingExecutor, setIsSubmittingExecutor] = useState(false);

  // Load Admin Users on mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: true });

    if (data && !error) {
      setAdminUsers(data as AdminUser[]);
    }
    setLoadingAdmins(false);
  };

  const handleExecutorFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setExecutorImageFile(file);
      setExecutorImagePreview(URL.createObjectURL(file));
    }
  };

  // --- Actions ---

  const deleteScript = async (id: string) => {
    if (confirm('Are you sure you want to delete this script?')) {
      const { error } = await supabase.from('scripts').delete().eq('id', id);
      if (!error) {
        setScripts(prev => prev.filter(s => s.id !== id));
      } else {
        console.error("Failed to default", error);
        alert("Delete failed: " + error.message);
      }
    }
  };

  const toggleVerifyScript = async (id: string) => {
    const script = scripts.find(s => s.id === id);
    if (!script) return;

    const newStatus = !script.verified;
    const { error } = await supabase
      .from('scripts')
      .update({ verified: newStatus })
      .eq('id', id);

    if (!error) {
      setScripts(prev => prev.map(s =>
        s.id === id ? { ...s, verified: newStatus } : s
      ));
    } else {
      console.error("Failed to verify", error);
      alert("Verify failed: " + error.message);
    }
  };

  const toggleOfficialScript = async (id: string) => {
    const script = scripts.find(s => s.id === id);
    if (!script) return;

    const newStatus = !script.isOfficial;
    const { error } = await supabase
      .from('scripts')
      .update({ is_official: newStatus })
      .eq('id', id);

    if (!error) {
      setScripts(prev => prev.map(s =>
        s.id === id ? { ...s, isOfficial: newStatus } : s
      ));
    } else {
      console.error("Failed to toggle official", error);
      alert("Toggle failed: " + error.message);
    }
  };


  const deleteExecutor = async (id: string) => {
    if (confirm('Delete this executor?')) {
      const { error } = await supabase.from('executors').delete().eq('id', id);
      if (!error) {
        setExecutors(prev => prev.filter(e => e.id !== id));
      } else {
        console.error("Failed to delete", error);
        alert("Delete failed: " + error.message);
      }
    }
  };

  const updateExecutorStatus = async (id: string, status: Executor['status']) => {
    const { error } = await supabase
      .from('executors')
      .update({ status: status })
      .eq('id', id);

    if (!error) {
      setExecutors(prev => prev.map(e =>
        e.id === id ? { ...e, status } : e
      ));
    }
  };

  const handleAddExecutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!executorImageFile) {
      alert("Please upload an image for the executor");
      return;
    }

    setIsSubmittingExecutor(true);

    try {
      // 1. Upload Image
      const fileExt = executorImageFile.name.split('.').pop();
      const fileName = `executors/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, executorImageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      // 2. Insert Data
      const payload = {
        name: newExecutor.name!,
        description: newExecutor.description || '',
        image_url: publicUrl,
        download_url: newExecutor.downloadUrl!,
        platform: newExecutor.platform as any,
        status: newExecutor.status as any
      };

      const { data, error } = await supabase.from('executors').insert([payload]).select().single();

      if (!error && data) {
        const executor: Executor = {
          id: data.id,
          name: data.name,
          description: data.description,
          imageUrl: data.image_url,
          downloadUrl: data.download_url,
          platform: data.platform,
          status: data.status
        };
        setExecutors([executor, ...executors]);
        setShowAddExecutor(false);
        setNewExecutor({
          name: '', description: '', downloadUrl: '', platform: 'Windows', status: 'Working'
        });
        setExecutorImageFile(null);
        setExecutorImagePreview(null);
      } else {
        console.error("Failed to add executor", error);
        alert("Failed to add executor");
      }
    } catch (err: any) {
      alert("Error adding executor: " + err.message);
    } finally {
      setIsSubmittingExecutor(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;

    const { data, error } = await supabase
      .from('admin_users')
      .insert([{ email: newAdminEmail, role: 'Admin' }])
      .select()
      .single();

    if (data && !error) {
      setAdminUsers([...adminUsers, data as AdminUser]);
      setNewAdminEmail('');
    } else {
      console.error(error);
      alert("Error adding admin. Ensure email is unique.");
    }
  };

  const handleDeleteAdmin = async (id: string, role: string) => {
    if (role === 'Owner') return alert("Cannot remove Owner");
    if (confirm('Remove this admin access?')) {
      const { error } = await supabase.from('admin_users').delete().eq('id', id);
      if (!error) {
        setAdminUsers(prev => prev.filter(u => u.id !== id));
      } else {
        alert("Action failed. Only the Owner can manage admins.");
      }
    }
  };

  return (
    <div className="animate-fade-in space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Header - Premium High-Control UI */}
      <div className="relative group">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-rose-500/5 blur-[60px] rounded-full group-hover:bg-rose-500/10 transition-all duration-1000"></div>

        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 px-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-10 bg-rose-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.5)]"></div>
              <div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Master Control</h2>
                <div className="flex items-center gap-2 mt-1">
                  <ShieldAlert size={14} className="text-rose-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Authorized Administrator Command Center</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Controls - Premium Switcher */}
          <div className="flex bg-slate-900/40 border border-white/[0.05] p-1.5 rounded-2xl backdrop-blur-xl shadow-2xl">
            <button
              onClick={() => setActiveTab('scripts')}
              className={`flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all duration-500 rounded-xl ${activeTab === 'scripts' ? 'bg-rose-500/10 text-rose-400 shadow-lg shadow-rose-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
            >
              <FileCode size={14} />
              Module_Index
            </button>
            <button
              onClick={() => setActiveTab('executors')}
              className={`flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all duration-500 rounded-xl ${activeTab === 'executors' ? 'bg-rose-500/10 text-rose-400 shadow-lg shadow-rose-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
            >
              <Cpu size={14} />
              Tool_Registry
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all duration-500 rounded-xl ${activeTab === 'users' ? 'bg-rose-500/10 text-rose-400 shadow-lg shadow-rose-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
            >
              <Users size={14} />
              Access_Grid
            </button>
          </div>
        </div>
      </div>

      {/* --- SCRIPTS TAB --- */}
      {activeTab === 'scripts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-12 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Active Repositories</h3>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">{scripts.length} Total Records Indexed</span>
              </div>
            </div>

            {/* Search within Admin (Optional enhancement) */}
            <div className="relative group hidden sm:block">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={14} className="text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Filter local records..."
                className="bg-slate-900/40 border border-white/[0.05] rounded-xl pl-10 pr-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 focus:outline-none focus:border-emerald-500/40 w-64 transition-all"
              />
            </div>
          </div>

          <div className="glass-premium rounded-[2rem] border border-white/[0.05] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.03] bg-white/[0.02]">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Module_Identification</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Platform_Target</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Validation_State</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">System_Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {scripts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-50">
                          <Database size={40} className="text-slate-700" />
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No local records decrypted</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    scripts.map(script => (
                      <tr key={script.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors">{script.title}</span>
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-0.5">ID: {script.id.slice(0, 8)}...</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 rounded-lg bg-slate-950 border border-white/[0.05] text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {script.gameName}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          {script.verified ? (
                            <div className="flex items-center gap-2 text-emerald-400">
                              <ShieldCheck size={14} strokeWidth={2.5} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-amber-500">
                              <ShieldAlert size={14} strokeWidth={2.5} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Unfiltered</span>
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-2 text-right">
                            <button
                              onClick={() => toggleVerifyScript(script.id)}
                              className={`p-2.5 rounded-xl border transition-all ${script.verified ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10' : 'bg-white/5 border-white/5 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/40'}`}
                              title="Shield_Verification"
                            >
                              <ShieldCheck size={16} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => toggleOfficialScript(script.id)}
                              className={`p-2.5 rounded-xl border transition-all ${script.isOfficial ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 shadow-lg shadow-indigo-500/10' : 'bg-white/5 border-white/5 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/40'}`}
                              title="Nexus_Priority"
                            >
                              <Star size={16} fill={script.isOfficial ? "currentColor" : "none"} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => onEditScript(script)}
                              className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:border-white/20 transition-all"
                              title="Modify_Protocol"
                            >
                              <Pencil size={16} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => deleteScript(script.id)}
                              className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/5 text-slate-600 hover:text-rose-400 hover:border-rose-500/40 transition-all"
                              title="Purge_Sequence"
                            >
                              <Trash2 size={16} strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- EXECUTORS TAB --- */}
      {activeTab === 'executors' && (
        <div className="space-y-10 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-12 bg-rose-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.5)]"></div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Tool Registry</h3>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Configure and optimize executor distributions</span>
              </div>
            </div>

            <button
              onClick={() => setShowAddExecutor(!showAddExecutor)}
              className="flex items-center gap-3 px-8 py-4 bg-slate-900/40 border border-white/[0.05] hover:border-emerald-500/40 text-emerald-400 font-black text-xs uppercase tracking-widest transition-all rounded-[1.25rem] backdrop-blur-md shadow-2xl group active:scale-95"
            >
              {showAddExecutor ? <X size={18} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-500" />}
              {showAddExecutor ? 'Abort Protocol' : 'Deploy Module'}
            </button>
          </div>

          {showAddExecutor && (
            <div className="glass-premium rounded-[2.5rem] p-10 border border-white/[0.05] animate-fade-in-up relative overflow-hidden group shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-50"></div>

              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-3 mb-2">
                  <Settings size={18} className="text-emerald-500" />
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Initialize_New_Payload</h3>
                </div>

                <form onSubmit={handleAddExecutor} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Module Name</label>
                      <input required placeholder="E.g. Synapse Z" value={newExecutor.name} onChange={e => setNewExecutor({ ...newExecutor, name: e.target.value })} className="w-full bg-black/20 border border-white/[0.05] px-6 py-4 rounded-2xl text-white focus:outline-none focus:border-emerald-500/40 focus:bg-black/40 transition-all font-medium" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Endpoint URI</label>
                      <input required placeholder="https://download.endpoint..." value={newExecutor.downloadUrl} onChange={e => setNewExecutor({ ...newExecutor, downloadUrl: e.target.value })} className="w-full bg-black/20 border border-white/[0.05] px-6 py-4 rounded-2xl text-white focus:outline-none focus:border-emerald-500/40 focus:bg-black/40 transition-all font-medium" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Platform</label>
                        <select value={newExecutor.platform} onChange={e => setNewExecutor({ ...newExecutor, platform: e.target.value as any })} className="w-full bg-black/20 border border-white/[0.05] px-6 py-4 rounded-2xl text-white focus:outline-none focus:border-emerald-500/40 focus:bg-black/40 transition-all font-bold uppercase tracking-widest text-[10px]">
                          <option value="Windows">Windows</option>
                          <option value="Android">Android</option>
                          <option value="iOS">iOS</option>
                          <option value="Mac">Mac</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Operational Status</label>
                        <select value={newExecutor.status} onChange={e => setNewExecutor({ ...newExecutor, status: e.target.value as any })} className="w-full bg-black/20 border border-white/[0.05] px-6 py-4 rounded-2xl text-white focus:outline-none focus:border-emerald-500/40 focus:bg-black/40 transition-all font-bold uppercase tracking-widest text-[10px]">
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
                      <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Asset Texture (Thumbnail)</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleExecutorFileChange}
                          className="hidden"
                          id="executor-image-upload"
                        />
                        <label
                          htmlFor="executor-image-upload"
                          className={`h-[160px] w-full flex items-center justify-center border-2 border-dashed rounded-3xl cursor-pointer transition-all overflow-hidden relative group/upload ${executorImagePreview
                            ? 'border-emerald-500/40 bg-black/40'
                            : 'border-white/5 bg-black/20 text-slate-600 hover:border-emerald-500/40 hover:bg-black/40'
                            }`}
                        >
                          {executorImagePreview ? (
                            <>
                              <img
                                src={executorImagePreview}
                                alt="Preview"
                                className="w-full h-full object-cover group-hover/upload:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/upload:opacity-100 transition-opacity">
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-4 py-2 rounded-xl bg-black/50 border border-emerald-500/20 backdrop-blur-md">Modify_Asset</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                              <ImageIcon size={32} className="opacity-30" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Map Module Asset</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Core Briefing</label>
                      <textarea placeholder="Functionality breakdown..." value={newExecutor.description} onChange={e => setNewExecutor({ ...newExecutor, description: e.target.value })} className="w-full bg-black/20 border border-white/[0.05] px-6 py-4 rounded-2xl text-white focus:outline-none focus:border-emerald-500/40 focus:bg-black/40 transition-all h-[100px] resize-none font-medium" />
                    </div>
                  </div>

                  <button type="submit" disabled={isSubmittingExecutor} className="md:col-span-2 py-5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-[0.3em] transition-all rounded-3xl shadow-xl shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-4">
                    {isSubmittingExecutor ? <Loader2 className="animate-spin" /> : (
                      <>
                        <Zap size={18} strokeWidth={3} />
                        Execute Deployment
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {executors.map(exec => (
              <div key={exec.id} className="glass-premium rounded-[2rem] border border-white/[0.05] p-6 flex items-center gap-6 group hover:border-white/[0.15] transition-all relative overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative shrink-0 w-24 h-24 rounded-2xl bg-slate-950 border border-white/[0.05] overflow-hidden group-hover:border-white/[0.15] transition-all shadow-inner">
                  <img src={exec.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={exec.name} />
                </div>

                <div className="flex-1 min-w-0 relative z-10 flex flex-col justify-between h-full py-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-black text-white text-lg tracking-tight truncate pr-2 group-hover:text-emerald-400 transition-colors uppercase">{exec.name}</h4>
                    <div className="flex gap-2">
                      <button onClick={() => setExecutorToEdit(exec)} className="text-slate-600 hover:text-indigo-400 transition-colors"><Pencil size={14} strokeWidth={2.5} /></button>
                      <button onClick={() => deleteExecutor(exec.id)} className="text-slate-600 hover:text-rose-500 transition-colors"><Trash2 size={14} strokeWidth={2.5} /></button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <div className="relative group/status flex-1">
                      <select
                        value={exec.status}
                        onChange={(e) => updateExecutorStatus(exec.id, e.target.value as any)}
                        className={`w-full text-[9px] font-black uppercase tracking-widest px-4 py-2 border-2 rounded-xl outline-none cursor-pointer bg-slate-950 transition-all ${exec.status === 'Working' ? 'text-emerald-400 border-emerald-500/20' :
                          exec.status === 'Detected' ? 'text-rose-500 border-rose-500/20' :
                            'text-amber-400 border-amber-500/20'}`}
                      >
                        <option value="Working">Working</option>
                        <option value="Updating">Updating</option>
                        <option value="Patched">Patched</option>
                        <option value="Detected">Detected</option>
                      </select>
                    </div>
                    <span className="text-[9px] font-black text-slate-500 px-3 py-2 rounded-xl bg-white/5 border border-white/5 uppercase tracking-widest">{exec.platform}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- USERS TAB --- */}
      {activeTab === 'users' && (
        <div className="space-y-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-12 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Access Grid</h3>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Manage authorized administrator accounts</span>
            </div>
          </div>

          <div className="glass-premium rounded-[2.5rem] p-10 border border-white/[0.05] shadow-2xl">
            <div className="flex flex-col md:flex-row gap-6 mb-12">
              <div className="relative flex-1 group">
                <div className="absolute left-6 top-0 bottom-0 flex items-center pointer-events-none">
                  <Mail size={16} className="text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  value={newAdminEmail}
                  type="email"
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="Identify target email for clearance..."
                  className="w-full bg-black/20 border border-white/[0.05] pl-16 pr-6 py-5 rounded-3xl text-white focus:outline-none focus:border-indigo-500/40 focus:bg-black/40 transition-all font-medium"
                />
              </div>
              <button onClick={handleAddAdmin} className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-3xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                <ShieldCheck size={18} strokeWidth={2.5} />
                Authorize Agent
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-6 mb-2">
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Permission_Matrix</h4>
                <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest leading-none">Status: Active Repositories</span>
              </div>

              {loadingAdmins ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                  <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Querying Clearances...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {adminUsers.map(user => (
                    <div key={user.id} className="relative group/user p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-indigo-500/30 transition-all flex items-center justify-between overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover/user:opacity-100 transition-opacity"></div>

                      <div className="flex items-center gap-5 relative z-10">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border transition-colors ${user.role === 'Owner' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
                          {user.role === 'Owner' ? <Star size={24} fill="currentColor" /> : <Shield size={24} strokeWidth={2} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-white text-sm tracking-tight">{user.email}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${user.role === 'Owner' ? 'bg-amber-500' : 'bg-indigo-500'} animate-pulse`}></div>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{user.role}</span>
                          </div>
                        </div>
                      </div>

                      {user.role !== 'Owner' && (
                        <button onClick={() => handleDeleteAdmin(user.id, user.role)} className="relative z-10 p-3 rounded-xl bg-white/5 border border-white/5 text-slate-600 hover:text-rose-500 hover:border-rose-500/30 transition-all active:scale-90 shadow-2xl">
                          <Trash2 size={18} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {executorToEdit && (
        <EditExecutorModal
          isOpen={!!executorToEdit}
          onClose={() => setExecutorToEdit(null)}
          executor={executorToEdit}
          onUpdate={(updated) => {
            setExecutors(prev => prev.map(e => e.id === updated.id ? updated : e));
          }}
        />
      )}

    </div>
  );
};

export default AdminDashboard;