import React, { useState, useEffect } from 'react';
import {
  Users, FileCode, Cpu, Shield, Trash2, CheckCircle,
  AlertTriangle, Plus, X, Search, ShieldCheck, Download, Loader2, Mail, Image as ImageIcon, Star, ExternalLink, Link, Pencil
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
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Admin Dashboard</h2>
          <p className="text-slate-400">Manage content, verification, and system status.</p>
        </div>
        <div className="flex bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('scripts')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'scripts' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Scripts
          </button>
          <button
            onClick={() => setActiveTab('executors')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'executors' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Executors
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Admins
          </button>
        </div>
      </div>

      {/* --- SCRIPTS TAB --- */}
      {activeTab === 'scripts' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2"><FileCode size={18} /> Manage Scripts</h3>
            <span className="text-xs text-slate-500">{scripts.length} Total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950 text-slate-200 uppercase text-xs font-semibold">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Game</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">External</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {scripts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      No scripts found. Use the "Submit" button to add one.
                    </td>
                  </tr>
                ) : (
                  scripts.map(script => (
                    <tr key={script.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-medium text-white">{script.title}</td>
                      <td className="p-4">{script.gameName}</td>
                      <td className="p-4">
                        {script.verified ? (
                          <span className="inline-flex items-center gap-1 text-green-400 bg-green-500/10 px-2 py-0.5 rounded text-xs font-bold border border-green-500/20">
                            <ShieldCheck size={10} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-500/10 px-2 py-0.5 rounded text-xs font-bold border border-slate-500/20">
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            const url = new URL(window.location.origin);
                            url.searchParams.set('id', script.id);
                            window.open(url.toString(), '_blank');
                          }}
                          className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          <ExternalLink size={14} /> View
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-1 flex items-center justify-end">
                        <button
                          onClick={() => toggleVerifyScript(script.id)}
                          className={`p-2 rounded hover:bg-slate-700 transition-colors ${script.verified ? 'text-green-400' : 'text-slate-500'}`}
                          title="Toggle Verification"
                        >
                          <ShieldCheck size={16} />
                        </button>
                        <button
                          onClick={() => deleteScript(script.id)}
                          className="p-2 rounded text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete Script"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={() => toggleOfficialScript(script.id)}
                          className={`p-2 rounded hover:bg-slate-700 transition-colors ${script.isOfficial ? 'text-indigo-400' : 'text-slate-600'}`}
                          title="Toggle Official Status"
                        >
                          <Star size={16} fill={script.isOfficial ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={() => {
                            const url = new URL(window.location.origin);
                            url.searchParams.set('id', script.id);
                            navigator.clipboard.writeText(url.toString());
                            alert('Copied link: ' + url.toString());
                          }}
                          className="p-2 rounded text-slate-500 hover:bg-slate-700 transition-colors"
                          title="Copy Link"
                        >
                          <Link size={16} />
                        </button>
                        <button
                          onClick={() => onEditScript(script)}
                          className="p-2 rounded text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                          title="Edit Script"
                        >
                          <Pencil size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- EXECUTORS TAB --- */}
      {activeTab === 'executors' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddExecutor(!showAddExecutor)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all"
            >
              {showAddExecutor ? <X size={18} /> : <Plus size={18} />}
              {showAddExecutor ? 'Cancel' : 'Add Executor'}
            </button>
          </div>

          {showAddExecutor && (
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 animate-fade-in-up">
              <h3 className="text-lg font-bold text-white mb-4">Launch New Executor</h3>
              <form onSubmit={handleAddExecutor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Executor Name" value={newExecutor.name} onChange={e => setNewExecutor({ ...newExecutor, name: e.target.value })} className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" />

                {/* Image Upload for Executor */}
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleExecutorFileChange}
                    className="hidden"
                    id="executor-image-upload"
                  />
                  <label
                    htmlFor="executor-image-upload"
                    className={`h-[150px] w-full flex items-center justify-center border border-dashed rounded-lg cursor-pointer transition-all overflow-hidden relative ${executorImagePreview
                      ? 'border-indigo-500 bg-slate-900'
                      : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-indigo-500 hover:bg-slate-900'
                      }`}
                  >
                    {executorImagePreview ? (
                      <>
                        <img
                          src={executorImagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-2 text-white font-bold">
                            <ImageIcon size={20} />
                            <span>Change Image</span>
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs text-white truncate text-center">
                          {executorImageFile?.name}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon size={32} className="opacity-50" />
                        <span className="text-sm font-bold">Upload Cover Image</span>
                        <span className="text-xs text-slate-500">1920x1080 Recommended</span>
                      </div>
                    )}
                  </label>
                </div>

                <input required placeholder="Download URL (Direct Link)" value={newExecutor.downloadUrl} onChange={e => setNewExecutor({ ...newExecutor, downloadUrl: e.target.value })} className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" />
                <select value={newExecutor.platform} onChange={e => setNewExecutor({ ...newExecutor, platform: e.target.value as any })} className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none">
                  <option value="Windows">Windows</option>
                  <option value="Android">Android</option>
                  <option value="iOS">iOS</option>
                  <option value="Mac">Mac</option>
                </select>
                <select value={newExecutor.status} onChange={e => setNewExecutor({ ...newExecutor, status: e.target.value as any })} className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none">
                  <option value="Working">Working</option>
                  <option value="Updating">Updating</option>
                  <option value="Patched">Patched</option>
                  <option value="Detected">Detected</option>
                </select>
                <div className="md:col-span-2">
                  <textarea placeholder="Description (Optional)" value={newExecutor.description} onChange={e => setNewExecutor({ ...newExecutor, description: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none h-20 resize-none" />
                </div>
                <button type="submit" disabled={isSubmittingExecutor} className="md:col-span-2 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                  {isSubmittingExecutor ? <Loader2 className="animate-spin" /> : 'Launch Executor'}
                </button>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {executors.map(exec => (
              <div key={exec.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-4">
                <img src={exec.imageUrl} className="w-20 h-20 object-cover rounded-lg bg-slate-800" alt={exec.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white text-lg">{exec.name}</h4>
                    <div className="flex gap-1">
                      <button onClick={() => setExecutorToEdit(exec)} className="text-slate-600 hover:text-indigo-400 p-1"><Pencil size={16} /></button>
                      <button onClick={() => deleteExecutor(exec.id)} className="text-slate-600 hover:text-red-400 p-1"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <select
                      value={exec.status}
                      onChange={(e) => updateExecutorStatus(exec.id, e.target.value as any)}
                      className={`text-xs font-bold rounded px-2 py-1 border outline-none cursor-pointer bg-slate-950 ${exec.status === 'Working' ? 'text-green-400 border-green-500/30' :
                        exec.status === 'Detected' ? 'text-red-500 border-red-500/30' :
                          exec.status === 'Patched' ? 'text-orange-400 border-orange-500/30' :
                            'text-yellow-400 border-yellow-500/30'
                        }`}
                    >
                      <option value="Working">Working</option>
                      <option value="Updating">Updating</option>
                      <option value="Patched">Patched</option>
                      <option value="Detected">Detected</option>
                    </select>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">{exec.platform}</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500 truncate">{exec.downloadUrl}</div>
                </div>
              </div>
            ))}
            {executors.length === 0 && (
              <div className="col-span-full py-10 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No executors found. Click "Add Executor" to create one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- USERS TAB --- */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-6">
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-3.5 text-slate-500" size={16} />
              <input
                value={newAdminEmail}
                type="email"
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="New Admin Email (User must sign up first)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-3 py-3 text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <button onClick={handleAddAdmin} className="px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg whitespace-nowrap">
              Grant Access
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Authorized Personnel</h3>

            {loadingAdmins ? (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin text-indigo-500" />
              </div>
            ) : (
              adminUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-white">{user.email}</p>
                      <p className="text-xs text-slate-400">{user.role}</p>
                    </div>
                  </div>
                  {user.role !== 'Owner' && (
                    <button onClick={() => handleDeleteAdmin(user.id, user.role)} className="text-slate-500 hover:text-red-400 p-2">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))
            )}
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