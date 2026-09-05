import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

type Account = { id: string; role: 'examiner' | 'principal'; principal_name: string; email: string; mobile?: string; school_name?: string; udise_code?: string; approved: boolean; active: boolean };

export const AccountManagement: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ role: 'examiner', name: '', email: '', mobile: '', school_name: '', udise_code: '' });
  const load = async () => { const result = await api.getAdminAccounts(); if (result.success) setAccounts(result.accounts || []); else setMessage(result.error || 'Unable to load accounts.'); };
  useEffect(() => { load(); }, []);
  const create = async (event: React.FormEvent) => {
    event.preventDefault(); setMessage('');
    const result = form.role === 'examiner'
      ? await api.createExaminer({ name: form.name, email: form.email, mobile: form.mobile })
      : await api.createPrincipal({ name: form.name, email: form.email, mobile: form.mobile, school_name: form.school_name, udise_code: form.udise_code });
    if (!result.success) { setMessage(result.error || 'Account creation failed.'); return; }
    setMessage('Account created in pending approval state.'); setForm({ role: form.role, name: '', email: '', mobile: '', school_name: '', udise_code: '' }); load();
  };
  const setStatus = async (account: Account, active: boolean, approved = account.approved) => { const result = await api.updateAdminAccountStatus(account.id, { active, approved }); if (!result.success) setMessage(result.error || 'Status update failed.'); else load(); };
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="text-xl font-black text-slate-900">Examiner &amp; Principal Accounts</h2>
    <p className="mt-1 text-sm text-slate-500">Council Admin only. New accounts remain inactive until approved.</p>
    <p className="mt-2 rounded-lg bg-amber-50 p-3 text-xs font-semibold text-amber-900">School Name and UDISE Code must be verified by Admin before approval.</p>
    {message && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">{message}</p>}
    <form onSubmit={create} className="mt-5 grid gap-3 sm:grid-cols-2">
      <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="rounded-lg border p-2"><option value="examiner">Examiner</option><option value="principal">Principal</option></select>
      <input required placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="rounded-lg border p-2" />
      <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="rounded-lg border p-2" />
      <input placeholder="Mobile" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} className="rounded-lg border p-2" />
      {form.role === 'principal' && <><input required placeholder="School name (manual)" value={form.school_name} onChange={e => setForm({ ...form, school_name: e.target.value })} className="rounded-lg border p-2" /><input required placeholder="UDISE code (manual)" value={form.udise_code} onChange={e => setForm({ ...form, udise_code: e.target.value })} className="rounded-lg border p-2" /></>}
      <button className="rounded-lg bg-slate-950 px-4 py-2 font-bold text-white sm:col-span-2">Create {form.role}</button>
    </form>
    <div className="mt-6 space-y-2">{accounts.map(account => <div key={account.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm"><div><b>{account.principal_name}</b> <span className="ml-2 rounded bg-slate-100 px-2 py-1 text-xs uppercase">{account.role}</span><div className="text-slate-500">{account.email}{account.udise_code ? ` · UDISE ${account.udise_code}` : ''}</div></div><button onClick={() => setStatus(account, !account.active, !account.approved)} className="rounded-lg border px-3 py-1.5 font-semibold">{account.active ? 'Disable' : 'Approve & activate'}</button></div>)}</div>
  </section>;
};
