import React, { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { Script, Executor } from '../types';
import { supabase } from '../lib/supabase';

type Report = { id: string; script_id: string | null; executor_id: string | null; reason: string; created_at: string; status: string };

const AdminReports: React.FC<{ scripts: Script[]; executors: Executor[]; setScripts: React.Dispatch<React.SetStateAction<Script[]>>; setExecutors: React.Dispatch<React.SetStateAction<Executor[]>> }> = ({ scripts, executors, setScripts, setExecutors }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase.from('link_reports').select('id,script_id,executor_id,reason,created_at,status').eq('status', 'open').order('created_at', { ascending: false }).limit(100);
    setLoading(false);
    if (fetchError) setError(fetchError.message);
    else { setReports((data || []) as Report[]); setError(''); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const review = async (report: Report, status: 'resolved' | 'dismissed') => {
    setBusyId(report.id);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in again.');
      if (status === 'resolved') {
        const now = new Date().toISOString();
        const target = report.script_id ? 'scripts' : 'executors';
        const targetId = report.script_id || report.executor_id;
        const { error: verificationError } = await supabase.from(target).update({ last_verified_at: now }).eq('id', targetId);
        if (verificationError) throw verificationError;
        if (report.script_id) setScripts(previous => previous.map(script => script.id === targetId ? { ...script, lastVerifiedAt: Date.parse(now) } : script));
        else setExecutors(previous => previous.map(executor => executor.id === targetId ? { ...executor, lastVerifiedAt: Date.parse(now) } : executor));
      }
      const { error: updateError } = await supabase.from('link_reports').update({ status, reviewed_at: new Date().toISOString(), reviewed_by: user.id }).eq('id', report.id);
      if (updateError) throw updateError;
      setReports(previous => previous.filter(item => item.id !== report.id));
    } catch (caught: any) { setError(caught.message || 'Could not review the report.'); }
    finally { setBusyId(null); }
  };

  return <section className="space-y-5 px-4">
    <div className="flex items-center justify-between gap-4"><div><h3 className="text-2xl font-bold text-white">Broken link reports</h3><p className="text-sm text-slate-400">Check the target link before marking it resolved.</p></div><button onClick={refresh} className="rounded-lg border border-white/20 px-4 py-2 text-sm">Refresh</button></div>
    {error && <p role="alert" className="text-rose-400">{error}</p>}
    {loading ? <p className="text-slate-400">Loading reports...</p> : reports.length === 0 ? <p className="rounded-xl border border-white/10 p-6 text-slate-400">No open reports.</p> :
      <div className="space-y-3">{reports.map(report => {
        const title = report.script_id ? scripts.find(script => script.id === report.script_id)?.title || `Script ${report.script_id}` : executors.find(executor => executor.id === report.executor_id)?.name || `Executor ${report.executor_id}`;
        return <article key={report.id} className="rounded-xl border border-white/10 bg-slate-900/50 p-5">
          <div className="flex flex-wrap justify-between gap-2"><h4 className="font-semibold text-white">{title}</h4><time className="text-xs text-slate-500">{new Date(report.created_at).toLocaleString()}</time></div>
          <p className="my-3 whitespace-pre-wrap text-sm text-slate-300">{report.reason}</p>
          <div className="flex flex-wrap gap-2"><button disabled={busyId === report.id} onClick={() => review(report, 'resolved')} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white disabled:opacity-50">{busyId === report.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Checked and resolved</button><button disabled={busyId === report.id} onClick={() => review(report, 'dismissed')} className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm disabled:opacity-50"><X size={14} /> Dismiss</button></div>
        </article>;
      })}</div>}
  </section>;
};

export default AdminReports;
