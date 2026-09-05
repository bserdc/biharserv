import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Users, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../services/supabase';
import { api } from '../services/api';

export function StaffAdminLogin({ onClose }: { onClose: () => void; onAdminLoginSuccess?: (user: any) => void }) {
  const [role, setRole] = useState<'principal' | 'examiner'>('principal');
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [school, setSchool] = useState('');
  const [udise, setUdise] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (register) {
      if (password !== confirm) return setError('Passwords do not match.');
      const result = await api.registerStaff({ role, name, email, password, mobile, ...(role === 'principal' ? { school_name: school, udise_code: udise } : {}) });
      if (!result.success) return setError(result.error || 'Registration failed.');
      setMessage(result.message || 'Registration submitted. Your account will be activated after Council Admin approval.');
      setRegister(false);
      return;
    }
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) return setError(result.error.message);
    const verified = await api.verifyStaffSession();
    if (!verified.success) {
      await supabase.auth.signOut();
      return setError(verified.error || 'Your account is pending approval or disabled.');
    }
    setMessage('Login successful.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-3 sm:p-6">
      <div className="relative mx-auto max-w-2xl rounded-2xl border bg-white shadow-2xl">
        <header className="border-b p-5 text-center">
          <div className="text-lg font-black text-slate-900">Bihar State Educational Development and Research Council</div>
          <div className="text-sm text-slate-500">बिहार राज्य शैक्षिक विकास एवं अनुसंधान परिषद</div>
          <div className="mt-1 text-xs font-bold text-slate-700">Central Unified Portal</div>
        </header>
        <section className="m-5 rounded-xl border border-blue-200 bg-blue-50/30 p-5 sm:m-8">
          <div className="mb-5 flex items-center gap-3">
            <Users className="rounded-full bg-blue-100 p-3 text-blue-700" size={48} />
            <div><h2 className="text-lg font-black">Principal / Examiner Login</h2><p className="text-xs text-slate-500">Login to access your account</p></div>
          </div>
          <div className="mb-4 grid grid-cols-2 rounded-lg border bg-white p-1">
            <button type="button" onClick={() => setRole('principal')} className={`rounded-md p-2 text-xs font-bold ${role === 'principal' ? 'bg-blue-900 text-white' : ''}`}>Principal Login</button>
            <button type="button" onClick={() => setRole('examiner')} className={`rounded-md p-2 text-xs font-bold ${role === 'examiner' ? 'bg-blue-900 text-white' : ''}`}>Examiner Login</button>
          </div>
          {error && <p className="mb-3 rounded bg-red-50 p-2 text-xs text-red-700">{error}</p>}
          {message && <p className="mb-3 rounded bg-emerald-50 p-2 text-xs text-emerald-700">{message}</p>}
          <form onSubmit={submit} className="space-y-3">
            {register && <input required placeholder={`${role === 'principal' ? 'Principal' : 'Examiner'} Name`} value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border p-3 text-sm" />}
            <div className="relative"><Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input required type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-lg border p-3 pl-10 text-sm" /></div>
            <div className="relative"><Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input required type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg border p-3 pl-10 pr-10 text-sm" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
            {register && <><input required type="password" placeholder="Confirm Password" value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full rounded-lg border p-3 text-sm" />{role === 'principal' && <><input required placeholder="School Name" value={school} onChange={e => setSchool(e.target.value)} className="w-full rounded-lg border p-3 text-sm" /><input required placeholder="UDISE Code" value={udise} onChange={e => setUdise(e.target.value)} className="w-full rounded-lg border p-3 text-sm" /></>}</>}
            <div className="flex justify-between text-xs"><label><input type="checkbox" /> Remember me</label><button type="button" className="text-blue-700">Forgot Password?</button></div>
            <button className="flex w-full justify-center gap-2 rounded-lg bg-blue-700 p-3 text-sm font-bold text-white"><LogIn size={17} /> {register ? 'SUBMIT REGISTRATION' : 'LOGIN'}</button>
            {!register && <button type="button" onClick={() => setRegister(true)} className="flex w-full justify-center gap-2 rounded-lg border p-3 text-sm font-bold text-blue-700"><UserPlus size={17} /> REGISTER</button>}
            {!register && <p className="text-center text-xs text-slate-500">New here? Register to create your account.</p>}
            {register && <p className="text-xs text-slate-500">Registration requires Council Admin approval before access.</p>}
          </form>
        </section>
        <footer className="border-t p-4 text-center text-xs text-slate-500">Secure &amp; Encrypted · Authorized Access Only · 24/7 Support</footer>
        <button onClick={onClose} className="absolute right-5 top-4 text-xl text-slate-500" aria-label="Close login">×</button>
      </div>
    </div>
  );
}
