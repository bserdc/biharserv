import React, { useState } from 'react';
import {
  Bell,
  FileCheck2,
  GraduationCap,
  LogOut,
  Menu,
  Trophy,
  UserCheck,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { AdminUser, StudentUser } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  adminUser: AdminUser | null;
  studentUser: StudentUser | null;
  onOpenAuthModal: (initialTab?: 'student' | 'admin' | 'staff') => void;
  onAdminLogout: () => void;
  onStudentLogout: () => void;
  stats?: {
    total_students: number;
    total_paid: number;
    total_schools: number;
  };
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, adminUser, onAdminLogout, onOpenAuthModal }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm">
      {/* Main council header from the public website */}
      <div className="border-b border-stone-200 bg-[#f3f0ec]">
        <div className="mx-auto flex min-h-[98px] w-full max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
          <a href="../../index.html" className="shrink-0" aria-label="BSEDRC home">
            <img src="./assets/logo.png" alt="BSEDRC logo" className="h-16 w-16 object-contain sm:h-20 sm:w-20" />
          </a>
          <div className="min-w-0 flex-1 text-center">
            <h1 className="font-['Noto_Sans_Devanagari'] text-xl font-bold leading-tight text-[#a74a2d] sm:text-3xl">
              बिहार राज्य शैक्षणिक विकास एवं अनुसंधान परिषद
            </h1>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.09em] text-[#a74a2d] sm:text-xs">
              Bihar State Educational Development &amp; Research Council
            </p>
          </div>
          <div className="hidden items-center gap-2 sm:flex" aria-label="Social media links">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-blue-500 text-xs font-bold text-white">f</span>
            <span className="grid h-7 w-7 place-items-center rounded-md bg-red-500 text-[10px] font-bold text-white">▶</span>
            <span className="grid h-7 w-7 place-items-center rounded-md bg-pink-500 text-xs font-bold text-white">◎</span>
          </div>
        </div>
      </div>

      <nav className="bg-[#8b2d2d] text-white" aria-label="Main website navigation">
        <div className="mx-auto hidden min-h-12 max-w-7xl items-center justify-center gap-5 px-6 text-sm font-bold uppercase sm:flex">
          <a href="../../index.html" className="hover:text-[#f7d4c7]">Home</a>
          <button onClick={() => navigate('student-zone')} className="cursor-pointer hover:text-[#f7d4c7]">Student Zone</button>
          <a href="../../about.html" className="hover:text-[#f7d4c7]">About Us</a>
          <a href="../../index.html#initiatives" className="hover:text-[#f7d4c7]">Our Work</a>
          <a href="../../awards.html" className="hover:text-[#f7d4c7]">Awards &amp; Recognition</a>
          <a href="../../gallery.html" className="hover:text-[#f7d4c7]">Gallery</a>
          <a href="../../contact.html" className="hover:text-[#f7d4c7]">Contact</a>
        </div>
        <div className="flex min-h-11 items-center justify-between px-4 sm:hidden">
          <button onClick={() => navigate('student-zone')} className="text-sm font-bold uppercase">Student Zone</button>
          <button onClick={() => setIsMobileMenuOpen((open) => !open)} className="rounded p-1.5" aria-label="Toggle portal menu">
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Secondary Student Zone navigation */}
      <nav className="border-b border-slate-700 bg-slate-950 text-white" aria-label="Student Zone navigation">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-3 py-2 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('student-zone')}
            className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
              activeTab === 'student-zone' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="h-4 w-4" /> Student Zone
          </button>
          <button
            onClick={() => navigate('merit-gazette')}
            className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
              activeTab === 'merit-gazette' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Trophy className="h-4 w-4 text-amber-400" /> Merit Gazette
          </button>
          <button
            onClick={() => navigate('student-register')}
            className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
              activeTab === 'student-register' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileCheck2 className="h-4 w-4" /> Registration
          </button>
          <button
            onClick={() => navigate('student-track')}
            className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
              activeTab === 'student-track' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-slate-800'
            }`}
          >
            <UserCheck className="h-4 w-4" /> Admit Card &amp; Result
          </button>
          <button
            onClick={() => navigate('verify-doc')}
            className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
              activeTab === 'verify-doc' ? 'border border-emerald-300 bg-emerald-50 text-emerald-800' : 'text-emerald-200 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="h-4 w-4" /> Document Verification
          </button>
          {!adminUser && (
            <button
              onClick={() => onOpenAuthModal('staff')}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-600"
            >
              <Users className="h-4 w-4" /> Principal / Examiner Login
            </button>
          )}
          {adminUser && (
            <>
              <button onClick={() => navigate('admin-accounts')} className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-slate-800">Account Management</button>
              <button onClick={onAdminLogout} className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-lg border border-amber-400/40 px-3 py-2 text-xs font-bold text-amber-300 transition hover:bg-slate-800" aria-label="Sign out of administrator account"><LogOut className="h-4 w-4" />Sign out</button>
            </>
          )}
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white p-3 sm:hidden">
          <div className="grid gap-2">
            <a href="../../index.html" className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">Home</a>
            <button onClick={() => navigate('student-zone')} className="rounded-lg bg-slate-100 px-3 py-2 text-left text-sm font-bold text-slate-700">Student Zone</button>
            <button onClick={() => navigate('student-register')} className="rounded-lg bg-slate-100 px-3 py-2 text-left text-sm font-bold text-slate-700">Registration</button>
            <button onClick={() => navigate('student-track')} className="rounded-lg bg-slate-100 px-3 py-2 text-left text-sm font-bold text-slate-700">Admit Card &amp; Result</button>
            <button onClick={() => navigate('merit-gazette')} className="rounded-lg bg-slate-100 px-3 py-2 text-left text-sm font-bold text-slate-700">Merit Gazette</button>
            <button onClick={() => navigate('verify-doc')} className="rounded-lg bg-slate-100 px-3 py-2 text-left text-sm font-bold text-slate-700">Document Verification</button>
            <button onClick={() => navigate('helpdesk')} className="rounded-lg bg-slate-100 px-3 py-2 text-left text-sm font-bold text-slate-700">Correction Helpdesk</button>
            {!adminUser && <button onClick={() => onOpenAuthModal('staff')} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-left text-sm font-bold text-white"><Users className="h-4 w-4" /> Principal / Examiner Login</button>}
            {adminUser && (
              <button onClick={onAdminLogout} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-left text-sm font-bold text-amber-300">
                <LogOut className="h-4 w-4" /> Sign out of administrator account
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
