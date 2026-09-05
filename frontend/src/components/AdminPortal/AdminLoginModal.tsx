import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
  Building2,
  GraduationCap,
  ShieldAlert,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { AdminUser, AdminRole } from '../../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminRole>('SUPER_ADMIN');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Math Captcha
  const [num1, setNum1] = useState(7);
  const [num2, setNum2] = useState(5);
  const [captchaInput, setCaptchaInput] = useState('12');

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 8) + 2;
    const n2 = Math.floor(Math.random() * 8) + 1;
    setNum1(n1);
    setNum2(n2);
    setCaptchaInput('');
  };

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Captcha validation
    if (parseInt(captchaInput, 10) !== num1 + num2) {
      setErrorMessage('Security calculation galat hai. Kripya sahi math captcha solve karein.');
      generateCaptcha();
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.adminLogin({
        username: username.trim(),
        password: password,
        role: role,
      });

      if (res.success && res.admin) {
        setSuccessMessage(res.message || 'Authentication safal raha! Dashboard khol rahe hain...');
        setTimeout(() => {
          setIsLoading(false);
          onLoginSuccess(res.admin!);
          onClose();
        }, 600);
      } else {
        setIsLoading(false);
        setErrorMessage(res.error || 'Galat username ya password! Kripya sahi credentials dalein.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage('Supabase Auth se connect nahi ho saka.');
    }
  };

  return (
    <div
      id="admin-login-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="admin-login-card"
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Government Style Header Banner */}
        <div className="bg-slate-950 text-white p-6 relative border-b border-slate-800">
          <button
            id="close-admin-login-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Student Portal par wapas jayein"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4 pr-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-0.5 shadow-xl shadow-amber-500/20 shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                <Lock className="w-3 h-3" />
                SURAKSHIT COUNCIL ADHIKARI LOGIN
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-tight">
                Bihar State Educational Development and Research Council
              </h2>
              <p className="text-xs text-amber-200/80 font-medium">
                बिहार राज्य शैक्षिक विकास एवं अनुसंधान परिषद (BSEDRC)
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Central Pariksha & Institutional Prashasan Portal
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-6 sm:p-8 space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 text-xs animate-shake">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-700 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="font-medium">{successMessage}</div>
            </div>
          )}

          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            Sign in with the Supabase Auth administrator account configured for this council.
          </div>
          {/* Username / Officer ID */}
          {/*
              <button
                type="button"
                id="fill-super-admin-btn"
                onClick={() => handleFillDemo('', '', 'SUPER_ADMIN')}
                className={`p-2 rounded-xl border text-[11px] font-medium transition-all ${
                  role === 'SUPER_ADMIN' && username.includes('admin')
                    ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold flex items-center gap-1 truncate">
                  <span>👑</span> Super Admin
                </div>
                <div className="text-[10px] opacity-80 truncate">Supabase Auth account</div>
              </button>

              <button
                type="button"
                id="fill-controller-btn"
                onClick={() => handleFillDemo('', '', 'EXAM_CONTROLLER')}
                className={`p-2 rounded-xl border text-[11px] font-medium transition-all ${
                  role === 'EXAM_CONTROLLER'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold flex items-center gap-1 truncate">
                  <span>🎓</span> Exam Controller
                </div>
                <div className="text-[10px] opacity-80 truncate">Supabase Auth account</div>
              </button>

              <button
                type="button"
                id="fill-officer-btn"
                onClick={() => handleFillDemo('', '', 'DATA_OFFICER')}
                className={`p-2 rounded-xl border text-[11px] font-medium transition-all ${
                  role === 'DATA_OFFICER'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold flex items-center gap-1 truncate">
                  <span>📊</span> Data Adhikari
                </div>
                <div className="text-[10px] opacity-80 truncate">Supabase Auth account</div>
              </button>
            </div> */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Adhikari Email / Login ID <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="admin-username-input"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Official Password <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-amber-700 font-medium">Council Encrypted</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Apna password dalein"
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              />
              <button
                type="button"
                id="toggle-password-visibility-btn"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role Designation Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Pad Aur Vibhag Authority
            </label>
            <select
              id="admin-role-select"
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            >
              <option value="SUPER_ADMIN">👑 Super Administrator (Council Nideshak)</option>
              <option value="EXAM_CONTROLLER">🎓 Pariksha Niyantrak (State Board Wing)</option>
              <option value="DATA_OFFICER">📊 Satyaapan & Sankhyiki Adhikari (U-DISE Data)</option>
            </select>
          </div>

          {/* Math Captcha Verification */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Suraksha Check:</span>
              <span className="font-mono font-bold text-sm bg-white px-2.5 py-1 rounded-lg border border-amber-300 text-amber-900">
                {num1} + {num2} = ?
              </span>
              <button
                type="button"
                onClick={generateCaptcha}
                className="p-1 text-slate-400 hover:text-slate-700"
                title="Naya calculation banayein"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              id="captcha-input"
              type="text"
              required
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              placeholder="Uttar"
              className="w-20 px-2.5 py-1.5 text-center bg-white border border-amber-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* Options: Remember Me & Security Notice */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
              <input
                id="remember-me-checkbox"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
              />
              <span className="font-medium">Session login rakhein</span>
            </label>
            <span className="text-[11px] text-slate-400">IP Audit ke liye Record ho raha hai</span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              id="cancel-login-btn"
              onClick={onClose}
              className="w-full sm:w-1/3 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors"
            >
              Radd Karein
            </button>
            <button
              type="submit"
              id="submit-admin-login-btn"
              disabled={isLoading}
              className="w-full sm:w-2/3 py-3 px-6 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs shadow-lg shadow-slate-950/20 hover:shadow-slate-950/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Credentials Check Ho Rahe Hain...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Surakshit Admin Login</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Security Notice */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center text-[10px] text-slate-500 flex items-center justify-center gap-2">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>Kewal Authorized Adhikariyon ke Liye • BSEDRC Directorate Security Protocol v4.2</span>
        </div>
      </div>
    </div>
  );
};
