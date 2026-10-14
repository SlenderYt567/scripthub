import React, { useState } from 'react';
import { Flag, Loader2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  scriptId?: string;
  executorId?: string;
  onLoginRequested: () => void;
}

const ReportLinkButton: React.FC<Props> = ({ scriptId, executorId, onLoginRequested }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const showForm = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return onLoginRequested();
    setOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = reason.trim();
    if (trimmed.length < 10 || trimmed.length > 500) {
      setError('Describe the issue in 10 to 500 characters.');
      return;
    }
    setSubmitting(true);
    setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      setOpen(false);
      onLoginRequested();
      return;
    }
    const { error: insertError } = await supabase.from('link_reports').insert({
      script_id: scriptId || null,
      executor_id: executorId || null,
      reporter_id: user.id,
      reason: trimmed
    });
    setSubmitting(false);
    if (insertError) {
      setError(insertError.code === '23505' ? 'You already have an open report for this link.' : insertError.message);
      return;
    }
    setDone(true);
  };

  return <>
    <button type="button" onClick={showForm} className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-rose-400 transition-colors">
      <Flag size={14} /> Report broken link
    </button>
    {open && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl" role="dialog" aria-modal="true" aria-label="Report broken link">
        <div className="flex items-center justify-between gap-4"><h2 className="text-lg font-semibold text-white">Report a broken link</h2><button type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={20} /></button></div>
        {done ? <div className="mt-5 space-y-4"><p className="text-sm text-zinc-300">Thanks. The report is now in the review queue.</p><button type="button" onClick={() => setOpen(false)} className="rounded-xl bg-white px-5 py-2 text-black">Close</button></div> :
          <form onSubmit={submit} className="mt-5 space-y-4">
            <label htmlFor="report-reason" className="block text-sm text-zinc-300">What happened?</label>
            <textarea id="report-reason" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} rows={4} className="w-full rounded-xl border border-white/20 bg-black p-3 text-white" placeholder="The download page no longer opens..." />
            <p className="text-xs text-zinc-500">{reason.length}/500 characters</p>
            {error && <p className="text-sm text-rose-400" role="alert">{error}</p>}
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2 text-black disabled:opacity-50">{submitting && <Loader2 size={16} className="animate-spin" />} Send report</button>
          </form>}
      </div>
    </div>}
  </>;
};

export default ReportLinkButton;
