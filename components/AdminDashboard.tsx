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
    <div className="animate-fade-in space-y-8 font-sans">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-rose-500 mb-1">
            <ShieldAlert size={16} />
            <span className="text-xs font-mono uppercase tracking-widest">Administrator_Access</span>
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">Command Center</h2>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-950 border border-slate-800 p-1">
          <button
            onClick={() => setActiveTab('scripts')}
            className={`px-6 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all ${activeTab === 'scripts' ? 'bg-slate-800 text-white border border-slate-600' : 'text-slate-500 hover:text-white'
              }`}
          >
            DB_SCRIPTS
          </button>
          <button
            onClick={() => setActiveTab('executors')}
            className={`px-6 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all ${activeTab === 'executors' ? 'bg-slate-800 text-white border border-slate-600' : 'text-slate-500 hover:text-white'
              }`}
          >
            EXEC_MODULES
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all ${activeTab === 'users' ? 'bg-slate-800 text-white border border-slate-600' : 'text-slate-500 hover:text-white'
              }`}
          >
            USER_PERMS
          </button>
        </div>
      </div>

      {/* --- SCRIPTS TAB --- */}
      {activeTab === 'scripts' && (
        <div className="border border-slate-800 bg-slate-900/50">
          <div className="p-3 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
            <h3 className="font-bold text-slate-300 font-mono text-xs uppercase flex items-center gap-2">
              <Database size={14} className="text-emerald-500" />
              Query_Results
            </h3>
            <span className="text-[10px] font-mono text-slate-500">{scripts.length} RECORDS FOUND</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-900 text-slate-500 uppercase text-[10px] font-mono font-bold tracking-wider">
                <tr>
                  <th className="p-4 border-r border-slate-800">Title_ID</th>
                  <th className="p-4 border-r border-slate-800">Target</th>
                  <th className="p-4 border-r border-slate-800">State</th>
                  <th className="p-4 border-r border-slate-800">Link</th>
                  <th className="p-4 text-right">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {scripts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-mono text-xs">
                      &gt; NO_DATA_AVAILABLE
                    </td>
                  </tr>
                ) : (
                  scripts.map(script => (
                    <tr key={script.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="p-4 font-bold text-white font-mono border-r border-slate-800/50 group-hover:border-slate-800">{script.title}</td>
                      <td className="p-4 border-r border-slate-800/50 group-hover:border-slate-800">{script.gameName}</td>
                      <td className="p-4 border-r border-slate-800/50 group-hover:border-slate-800">
                        {script.verified ? (
                          <span className="text-emerald-400 text-[10px] font-mono uppercase font-bold">
                            VERIFIED
                          </span>
                        ) : (
                          <span className="text-amber-500 text-[10px] font-mono uppercase font-bold">
                            UNVERIFIED
                          </span>
                        )}
                      </td>
                      <td className="p-4 border-r border-slate-800/50 group-hover:border-slate-800">
                        <a
                          href={`/?id=${script.id}`}
                          target="_blank"
                          className="text-xs text-indigo-400 hover:underline font-mono"
                        >
                          EXTERNAL_LINK
                        </a>
                      </td>
                      <td className="p-4 text-right space-x-2 flex items-center justify-end">
                        <button
                          onClick={() => toggleVerifyScript(script.id)}
                          className={`p-1.5 border hover:bg-slate-800 transition-colors ${script.verified ? 'text-emerald-400 border-emerald-500/30' : 'text-slate-600 border-slate-700'
                            }`}
                          title="Verify Hash"
                        >
                          <ShieldCheck size={14} />
                        </button>
                        <button
                          onClick={() => toggleOfficialScript(script.id)}
                          className={`p-1.5 border hover:bg-slate-800 transition-colors ${script.isOfficial ? 'text-indigo-400 border-indigo-500/30' : 'text-slate-600 border-slate-700'
                            }`}
                          title="Official Mark"
                        >
                          <Star size={14} fill={script.isOfficial ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={() => onEditScript(script)}
                          className="p-1.5 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deleteScript(script.id)}
                          className="p-1.5 border border-slate-700 text-slate-600 hover:text-rose-400 hover:border-rose-900 transition-colors"
                          title="Purge"
                        >
                          <Trash2 size={14} />
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
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-700 hover:border-emerald-500 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider transition-all"
            >
              {showAddExecutor ? <X size={16} /> : <Plus size={16} />}
              {showAddExecutor ? 'ABORT_SEQUENCE' : 'INITIATE_NEW_MODULE'}
            </button>
          </div>

          {showAddExecutor && (
            <div className="bg-slate-950 border border-slate-700 p-6 animate-fade-in-up">
              <h3 className="text-sm font-bold text-white mb-4 font-mono uppercase border-b border-slate-800 pb-2">Module_Configuration_Panel</h3>
              <form onSubmit={handleAddExecutor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="MODULE_NAME" value={newExecutor.name} onChange={e => setNewExecutor({ ...newExecutor, name: e.target.value })} className="bg-slate-900 border border-slate-700 p-3 text-white focus:border-emerald-500 outline-none font-mono text-xs" />

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
                    className={`h-[150px] w-full flex items-center justify-center border border-dashed cursor-pointer transition-all overflow-hidden relative ${executorImagePreview
                      ? 'border-emerald-500 bg-slate-900'
                      : 'border-slate-700 bg-slate-900 text-slate-500 hover:border-emerald-500'
                      }`}
                  >
                    {executorImagePreview ? (
                      <>
                        <img
                          src={executorImagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover opacity-50 grayscale"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 hover:opacity-100 transition-opacity">
                          <span className="font-mono text-xs text-emerald-400">REPLACE_ASSET</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon size={24} className="opacity-50" />
                        <span className="text-xs font-mono uppercase">UPLOAD_TEXTURE</span>
                      </div>
                    )}
                  </label>
                </div>

                <input required placeholder="DOWNLOAD_ENDPOINT_URI" value={newExecutor.downloadUrl} onChange={e => setNewExecutor({ ...newExecutor, downloadUrl: e.target.value })} className="bg-slate-900 border border-slate-700 p-3 text-white focus:border-emerald-500 outline-none font-mono text-xs" />
                <select value={newExecutor.platform} onChange={e => setNewExecutor({ ...newExecutor, platform: e.target.value as any })} className="bg-slate-900 border border-slate-700 p-3 text-white focus:border-emerald-500 outline-none font-mono text-xs uppercase">
                  <option value="Windows">Windows</option>
                  <option value="Android">Android</option>
                  <option value="iOS">iOS</option>
                  <option value="Mac">Mac</option>
                </select>
                <select value={newExecutor.status} onChange={e => setNewExecutor({ ...newExecutor, status: e.target.value as any })} className="bg-slate-900 border border-slate-700 p-3 text-white focus:border-emerald-500 outline-none font-mono text-xs uppercase">
                  <option value="Working">Working</option>
                  <option value="Updating">Updating</option>
                  <option value="Patched">Patched</option>
                  <option value="Detected">Detected</option>
                </select>
                <div className="md:col-span-2">
                  <textarea placeholder="MODULE_DESCRIPTION" value={newExecutor.description} onChange={e => setNewExecutor({ ...newExecutor, description: e.target.value })} className="w-full bg-slate-900 border border-slate-700 p-3 text-white focus:border-emerald-500 outline-none h-20 resize-none font-mono text-xs" />
                </div>
                <button type="submit" disabled={isSubmittingExecutor} className="md:col-span-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-xs uppercase transition-colors flex items-center justify-center gap-2">
                  {isSubmittingExecutor ? <Loader2 className="animate-spin" /> : 'DEPLOY_MODULE'}
                </button>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {executors.map(exec => (
              <div key={exec.id} className="bg-slate-900 border border-slate-800 p-4 flex gap-4 group hover:border-slate-600 transition-colors">
                <img src={exec.imageUrl} className="w-20 h-20 object-cover bg-slate-950 grayscale group-hover:grayscale-0 transition-all border border-slate-800" alt={exec.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white text-lg font-mono uppercase">{exec.name}</h4>
                    <div className="flex gap-1">
                      <button onClick={() => setExecutorToEdit(exec)} className="text-slate-600 hover:text-indigo-400 p-1"><Pencil size={14} /></button>
                      <button onClick={() => deleteExecutor(exec.id)} className="text-slate-600 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <select
                      value={exec.status}
                      onChange={(e) => updateExecutorStatus(exec.id, e.target.value as any)}
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-1 border outline-none cursor-pointer bg-slate-950 w-full max-w-[100px] ${exec.status === 'Working' ? 'text-emerald-400 border-emerald-900' :
                        exec.status === 'Detected' ? 'text-rose-500 border-rose-900' :
                          'text-amber-400 border-amber-900'
                        }`}
                    >
                      <option value="Working">Working</option>
                      <option value="Updating">Updating</option>
                      <option value="Patched">Patched</option>
                      <option value="Detected">Detected</option>
                    </select>
                    <span className="text-[10px] text-slate-500 bg-slate-950 border border-slate-800 px-2 py-1 uppercase font-mono">{exec.platform}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- USERS TAB --- */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 p-6">
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center border-r border-slate-700 bg-slate-800">
                <Mail size={14} className="text-slate-400" />
              </div>
              <input
                value={newAdminEmail}
                type="email"
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="USER_EMAIL_ADDRESS"
                className="w-full bg-slate-950 border border-slate-700 pl-12 pr-3 py-3 text-white focus:border-indigo-500 outline-none font-mono text-xs"
              />
            </div>
            <button onClick={handleAddAdmin} className="px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold uppercase rounded-none border border-indigo-400">
              GRANT_PERMISSION
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 font-mono">Permission_Table</h3>

            {loadingAdmins ? (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin text-indigo-500" />
              </div>
            ) : (
              adminUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 hover:border-slate-600 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-900/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Shield size={14} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-300 font-mono text-xs">{user.email}</p>
                      <p className="text-[10px] text-slate-600 uppercase tracking-wider">{user.role}</p>
                    </div>
                  </div>
                  {user.role !== 'Owner' && (
                    <button onClick={() => handleDeleteAdmin(user.id, user.role)} className="text-slate-600 hover:text-rose-500 p-2">
                      <Trash2 size={14} />
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