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
  GraduationCap,
  ArrowRight,
  RefreshCw,
  Phone,
  Calendar,
  FileCheck2,
  School,
  Building2,
  Users
} from 'lucide-react';
import { api } from '../services/api';
import { AdminUser, AdminRole, StudentUser, Student } from '../types';
import { StaffAdminLogin } from './StaffAdminLogin';

interface UniversalAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminLoginSuccess: (user: AdminUser) => void;
  onStudentLoginSuccess: (student: StudentUser, studentRecord?: Student) => void;
  initialTab?: 'student' | 'admin' | 'staff';
}

export const UniversalAuthModal: React.FC<UniversalAuthModalProps> = ({
  isOpen,
  onClose,
  onAdminLoginSuccess,
  onStudentLoginSuccess,
  initialTab = 'student',
}) => {
  const [authRole, setAuthRole] = useState<'student' | 'admin'>(initialTab === 'staff' ? 'admin' : initialTab);

  // Admin Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminRole, setAdminRole] = useState<AdminRole>('SUPER_ADMIN');
  const [showPassword, setShowPassword] = useState(false);

  // Student Form States
  const [studentLoginType, setStudentLoginType] = useState<'reg_id' | 'mobile'>('reg_id');
  const [regId, setRegId] = useState('BSEDRC-2026-8941');
  const [dob, setDob] = useState('2008-08-15');
  const [mobile, setMobile] = useState('9876543210');
  const [otp, setOtp] = useState('123456');

  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Math Captcha for Admin
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
      setAuthRole(initialTab === 'staff' ? 'admin' : initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;
  if (initialTab === 'staff') return <StaffAdminLogin onClose={onClose} onAdminLoginSuccess={onAdminLoginSuccess} />;

  // Demo autofill for Student
  const handleFillStudentDemo = (demoReg: string, demoDob: string, demoMobile: string) => {
    setRegId(demoReg);
    setDob(demoDob);
    setMobile(demoMobile);
    setErrorMessage('');
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

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
        role: adminRole,
      });

      if (res.success && res.admin) {
        setSuccessMessage(res.message || 'Authentication safal raha! Admin Control Panel open ho raha hai...');
        setTimeout(() => {
          setIsLoading(false);
          onAdminLoginSuccess(res.admin!);
        }, 600);
      } else {
        setIsLoading(false);
        setErrorMessage(res.error || 'Amanaya (Invalid) login credentials. Kripya dobara jaanchein.');
        generateCaptcha();
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Central auth server se connect nahi ho saka.');
      generateCaptcha();
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    setIsLoading(true);

    try {
      const payload =
        studentLoginType === 'reg_id'
          ? { registration_id: regId.trim(), dob: dob.trim() }
          : { mobile: mobile.trim(), otp: otp.trim() };

      const res = await api.studentLogin(payload);

      if (res.success && res.student) {
        setSuccessMessage(res.message || 'Candidate authentication safal! Profile load ho rahi hai...');
        if (rememberMe && res.token) {
          localStorage.setItem('bsedrc_student_token', res.token);
          localStorage.setItem('bsedrc_student_user', JSON.stringify(res.student));
        }
        setTimeout(() => {
          setIsLoading(false);
          onStudentLoginSuccess(res.student!, res.studentRecord);
        }, 600);
      } else {
        setIsLoading(false);
        setErrorMessage(res.error || 'Candidate record nahi mila. Registration ID ya Mobile Number check karein.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Server verification request fail ho gayi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Close Button */}
        <button
          id="close-auth-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Council Security Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                Bihar State Educational Development and Research Council
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              बिहार राज्य शैक्षिक विकास एवं अनुसंधान परिषद • Central Unified Portal Login
            </p>
          </div>
        </div>

        {/* Dual Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6 border border-slate-200">
          <button
            type="button"
            id="tab-student-login"
            onClick={() => {
              setAuthRole('student');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 rounded-xl text-[11px] sm:text-xs font-extrabold transition-all text-center ${
              authRole === 'student'
                ? 'bg-white text-slate-950 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${authRole === 'student' ? 'text-amber-500' : 'text-slate-400'}`} />
            <span className="truncate">Student Login</span>
          </button>

          <button
            type="button"
            id="tab-admin-login"
            onClick={() => {
              setAuthRole('admin');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 rounded-xl text-[11px] sm:text-xs font-extrabold transition-all text-center ${
              authRole === 'admin'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${authRole === 'admin' ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className="truncate">Council Admin</span>
          </button>
        </div>

        {/* Error / Success Alerts */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-bold">{successMessage}</div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STUDENT LOGIN VIEW */}
        {/* ---------------------------------------------------- */}
        {authRole === 'student' && (
          <div>
            {/* Quick Demo Student Pills */}
            <div className="mb-4 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 mb-1.5">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Quick Demo Student Accounts (1-Click Fill)
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleFillStudentDemo('BSEDRC-2026-8941', '2008-08-15', '9876543210')}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg text-[11px] font-bold text-slate-800 transition-colors shadow-xs"
                >
                  Rohan Kumar (8941)
                </button>
                <button
                  type="button"
                  onClick={() => handleFillStudentDemo('BSEDRC-2026-8942', '2008-11-20', '9876543211')}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg text-[11px] font-bold text-slate-800 transition-colors shadow-xs"
                >
                  Ananya Kumari (8942)
                </button>
                <button
                  type="button"
                  onClick={() => handleFillStudentDemo('BSEDRC-2026-8943', '2007-05-10', '9876543212')}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg text-[11px] font-bold text-slate-800 transition-colors shadow-xs"
                >
                  Amit Kumar (8943)
                </button>
              </div>
            </div>

            {/* Sub-toggle: Reg ID vs Mobile */}
            <div className="flex gap-4 mb-4 text-xs font-semibold">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="studentLoginType"
                  checked={studentLoginType === 'reg_id'}
                  onChange={() => setStudentLoginType('reg_id')}
                  className="text-amber-500 focus:ring-amber-400"
                />
                <span>Registration ID & DOB Se Login</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="studentLoginType"
                  checked={studentLoginType === 'mobile'}
                  onChange={() => setStudentLoginType('mobile')}
                  className="text-amber-500 focus:ring-amber-400"
                />
                <span>Mobile Number (OTP) Se Login</span>
              </label>
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-4">
              {studentLoginType === 'reg_id' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Registration ID (पंजीकरण संख्या) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FileCheck2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        id="student-reg-id-input"
                        value={regId}
                        onChange={(e) => setRegId(e.target.value)}
                        placeholder="Jaise: BSEDRC-2026-8941"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Janam Tithi (Date of Birth) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="date"
                        id="student-dob-input"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Registered Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        id="student-mobile-input"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="10 digit mobile number"
                        maxLength={10}
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      OTP Code (Demo: 123456) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="student-otp-input"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="6-digit OTP"
                      maxLength={6}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-mono font-bold tracking-widest text-center"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                id="student-login-submit-btn"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Candidate Records...</span>
                  </>
                ) : (
                  <>
                    <span>Candidate Profile Open Karein</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* ADMIN LOGIN VIEW */}
        {/* ---------------------------------------------------- */}
        {authRole === 'admin' && (
          <div>
            <form onSubmit={handleAdminSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Council Email / Officer ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    id="admin-username-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin@bsedrc.gov.in"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Secret Passkey / Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="admin-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter passkey"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Math Security Captcha */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Security Math:</span>
                  <span className="font-mono font-bold bg-slate-200 px-2.5 py-1 rounded text-slate-900 text-xs">
                    {num1} + {num2} = ?
                  </span>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="text-slate-400 hover:text-slate-700 p-1"
                    title="Naya Captcha Generate Karein"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  id="admin-captcha-input"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Answer"
                  required
                  className="w-20 px-2.5 py-1.5 text-xs text-center font-mono font-bold border border-slate-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                id="admin-login-submit-btn"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Verifying Officer Security Token...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>Council Officer Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-5 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Council Data Protection & Security Policy • Central SSL Encrypted Gateway
        </div>
      </div>
    </div>
  );
};
