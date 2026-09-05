import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StudentZoneDashboard } from './components/StudentZoneDashboard';
import { StudentRegistrationForm } from './components/StudentPortal/StudentRegistrationForm';
import { StudentStatusTracker } from './components/StudentPortal/StudentStatusTracker';
import { AdminDashboardOverview } from './components/AdminPortal/AdminDashboardOverview';
import { FormsConfigManager } from './components/AdminPortal/FormsConfigManager';
import { StudentsManager } from './components/AdminPortal/StudentsManager';
import { SchoolMasterManager } from './components/AdminPortal/SchoolMasterManager';
import { InstitutionalSearch } from './components/AdminPortal/InstitutionalSearch';
import { BackendCodeHub } from './components/AdminPortal/BackendCodeHub';
import { AccountManagement } from './components/AdminPortal/AccountManagement';
import { NoticeCircularsHub } from './components/NoticeCircularsHub';
import { MeritGazetteDesk } from './components/MeritGazetteDesk';
import { DocumentVerificationDesk } from './components/DocumentVerificationDesk';
import { GrievanceHelpdesk } from './components/GrievanceHelpdesk';
import { UniversalAuthModal } from './components/UniversalAuthModal';
import { api } from './services/api';
import { supabase } from './services/supabase';
import { FormConfig, Student, School, AnalyticsSummary, AdminUser, StudentUser } from './types';
import { INITIAL_FORMS, INITIAL_SCHOOLS, INITIAL_STUDENTS } from './data/initialData';
import { Lock, ShieldCheck, KeyRound, Sparkles, Building2, UserCheck, ShieldAlert, User, ArrowRight, FileCheck2, Bell, Trophy, LayoutDashboard, Sliders } from 'lucide-react';

export default function App() {
  const requestedTab = new URLSearchParams(window.location.search).get('tab');
  const isEmbeddedNoticeView = window.location.search.includes('embed=1');
  // Open the Student Zone dashboard first; registration is available from its
  // dashboard actions and should not be the default landing view.
  const [activeTab, setActiveTab] = useState<string>(isEmbeddedNoticeView || requestedTab === 'notices' ? 'notices' : 'student-zone');
  const [forms, setForms] = useState<FormConfig[]>(INITIAL_FORMS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [schools, setSchools] = useState<School[]>(INITIAL_SCHOOLS);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [trackedRegId, setTrackedRegId] = useState<string>('');
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<Student | null>(null);

  // Universal Authentication State (Admin + Student)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [adminAuthLoading, setAdminAuthLoading] = useState(true);
  const [studentUser, setStudentUser] = useState<StudentUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'student' | 'admin' | 'staff'>('student');

  // Supabase Auth owns the admin session lifecycle.
  useEffect(() => {
    let disposed = false;
    let revision = 0;
    const applyAdminSession = async () => {
      const currentRevision = ++revision;
      const { data } = await supabase.auth.getSession();
      if (disposed || currentRevision !== revision) return;
      const session = data.session;
      const isAdmin = session?.user?.app_metadata?.role === 'admin';
      if (!session || !isAdmin) {
        setAdminUser(null);
        setAdminAuthLoading(false);
        return;
      }

      // Establish UI state from the current session before the backend round-trip.
      // The backend remains the authorization boundary for every protected API.
      const sessionAdmin: AdminUser = {
        id: session.user.id,
        username: session.user.email || session.user.id,
        name: session.user.user_metadata?.name || session.user.email || 'Administrator',
        email: session.user.email,
        role: 'SUPER_ADMIN',
        role_label: 'Supabase Administrator',
        department: 'Council Administration',
        token: session.access_token,
        last_login: new Date().toISOString(),
      };
      setAdminUser(sessionAdmin);
      setAdminAuthLoading(false);

      const verified = await api.adminVerify(session.access_token);
      if (!disposed && currentRevision === revision && verified.success && verified.admin) {
        setAdminUser({ ...verified.admin, token: session.access_token });
      }
    };
    applyAdminSession().catch(() => { if (!disposed) setAdminAuthLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      // Defer Supabase reads until the auth event has finished propagating.
      window.setTimeout(() => applyAdminSession().catch(() => { if (!disposed) setAdminAuthLoading(false); }), 0);
    });
    try {
      // Student compatibility session remains unchanged until its controlled migration.
      const savedStudentToken = localStorage.getItem('bsedrc_student_token');
      const savedStudentUserStr = localStorage.getItem('bsedrc_student_user');
      if (savedStudentToken && savedStudentUserStr) {
        const parsed = JSON.parse(savedStudentUserStr);
        setStudentUser(parsed);
        api.studentVerify(savedStudentToken).then((res) => {
          if (res.success && res.student) {
            setStudentUser(res.student);
          }
        });
      }
    } catch (e) { console.warn('Session retrieval warning:', e); }
    return () => { disposed = true; listener.subscription.unsubscribe(); };
  }, []);

  // Fetch data from backend
  const loadData = async () => {
    try {
      const [formsRes, studentsRes, schoolsRes, analyticsRes] = await Promise.all([
        api.getForms(),
        api.getStudents(),
        api.getSchools(),
        api.getAnalytics(),
      ]);

      if (formsRes.success && formsRes.forms) setForms(formsRes.forms);
      if (studentsRes.success && studentsRes.students) setStudents(studentsRes.students);
      if (schoolsRes.success && schoolsRes.schools) setSchools(schoolsRes.schools);
      if (analyticsRes.success && analyticsRes.analytics) setAnalytics(analyticsRes.analytics);
    } catch (err) {
      console.warn('Using client-side fallback store while connecting to server...', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdminLogout = async () => {
    try {
      if (adminUser?.token) {
        await api.adminLogout(adminUser.token);
      }
    } catch (e) {
      // ignore
    }
    setAdminUser(null);
    if (activeTab.startsWith('admin-') && activeTab !== 'admin-institutional' && activeTab !== 'admin-backend') {
      setActiveTab('student-register');
    }
  };

  const handleStudentLogout = () => {
    localStorage.removeItem('bsedrc_student_token');
    localStorage.removeItem('bsedrc_student_user');
    setStudentUser(null);
  };

  const handleOpenAuthModal = (initialTab: 'student' | 'admin' | 'staff' = 'student') => {
    setAuthModalInitialTab(initialTab);
    setIsAuthModalOpen(true);
  };

  const handleRegistrationComplete = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);
    loadData();
  };

  const handleNavigateToTracker = (regId: string) => {
    setTrackedRegId(regId);
    setActiveTab('student-track');
  };

  const handleReleaseAllAdmitCards = async () => {
    try {
      const form = forms[0];
      if (form) {
        await api.updateForm(form._id, {
          admit_card_status: {
            is_released: true,
            release_date: new Date().toISOString().slice(0, 10),
          },
        });
      }
      await api.bulkGenerateAdmitCards();
      await loadData();
      alert('BSEDRC Admit Cards jari ho chuke hain! Sabhi candidates ke Hall Tickets download ke liye active hain.');
    } catch (e) {
      alert('Error updating admit cards');
    }
  };

  const handleDeclareAllResults = async () => {
    try {
      const form = forms[0];
      if (form) {
        await api.updateForm(form._id, {
          result_status: {
            is_declared: true,
            declare_date: new Date().toISOString().slice(0, 10),
          },
        });
      }
      await loadData();
      alert('BSEDRC Pariksha Result ghoshit ho chuka hai! Online scorecards & rank active hain.');
    } catch (e) {
      alert('Error publishing results');
    }
  };

  const handleSelectStudentForManage = (st: Student) => {
    setSelectedStudentForEdit(st);
    setActiveTab('admin-students');
  };

  // Guard for protected admin tabs
  const isProtectedAdminTab =
    activeTab.startsWith('admin-') &&
    activeTab !== 'admin-backend';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Universal Top Navigation */}
      {!isEmbeddedNoticeView && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          adminUser={adminUser}
          studentUser={studentUser}
          onOpenAuthModal={handleOpenAuthModal}
          onAdminLogout={handleAdminLogout}
          onStudentLogout={handleStudentLogout}
          stats={
            analytics
              ? {
                  total_students: analytics.total_students,
                  total_paid: analytics.total_paid,
                  total_schools: analytics.total_schools,
                }
              : undefined
          }
        />
      )}

      {/* Main Content Area */}
      <main className={isEmbeddedNoticeView ? 'flex-1 w-full p-3 sm:p-6 lg:p-8' : 'flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 pb-24 lg:pb-8'}>
        {activeTab === 'student-zone' && (
          <StudentZoneDashboard
            forms={forms}
            students={students}
            schools={schools}
            analytics={analytics}
            onNavigateToTab={setActiveTab}
          />
        )}

        {/* STUDENT PORTAL VIEWS */}
        {activeTab === 'student-register' && (
          <StudentRegistrationForm
            forms={forms}
            studentUser={studentUser}
            onRegistrationComplete={handleRegistrationComplete}
            onNavigateToTracker={handleNavigateToTracker}
          />
        )}

        {activeTab === 'student-track' && (
          <StudentStatusTracker
            initialRegId={trackedRegId || studentUser?.registration_id || ''}
            forms={forms}
          />
        )}

        {/* OFFICIAL NOTICES & CIRCULARS */}
        {activeTab === 'notices' && (
          <NoticeCircularsHub
            lang="hi"
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* MERIT GAZETTE & TOPPERS BOARD */}
        {activeTab === 'merit-gazette' && (
          <MeritGazetteDesk
            lang="hi"
            students={students}
            onNavigateToStudent={(regId) => {
              setTrackedRegId(regId);
              setActiveTab('student-track');
            }}
          />
        )}

        {/* TAMPER-PROOF DOCUMENT & QR VERIFICATION */}
        {activeTab === 'verify-doc' && (
          <DocumentVerificationDesk lang="hi" />
        )}

        {/* CORRECTION HELPDESK & GRIEVANCE REDRESSAL */}
        {activeTab === 'helpdesk' && (
          <GrievanceHelpdesk
            lang="hi"
            adminUser={adminUser}
            onRefreshData={loadData}
          />
        )}

        {activeTab === 'admin-institutional' && (
          <InstitutionalSearch schools={schools} allStudents={students} />
        )}

        {activeTab === 'admin-backend' && <BackendCodeHub />}
        {activeTab === 'admin-accounts' && adminUser && <AccountManagement />}

        {/* PROTECTED ADMIN PORTAL VIEWS */}
        {isProtectedAdminTab && adminAuthLoading && (
          <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center">
            <div className="text-sm font-semibold text-slate-600">Restoring administrator session…</div>
          </div>
        )}

        {isProtectedAdminTab && !adminAuthLoading && !adminUser && (
          <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 text-amber-600">
              <Lock className="w-8 h-8" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-amber-300 text-xs font-bold font-mono uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              BSEDRC Directorate Security
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              Administrator Authentication Required
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-8">
              Access to the Examination Command Center, Candidate Roll Allocation, and Form Customizer is restricted to authorized Council Officers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                id="open-login-screen-btn"
                onClick={() => handleOpenAuthModal('admin')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-950/20 transition-all cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Council Officer Login</span>
              </button>
              <button
                id="back-to-student-portal-btn"
                onClick={() => setActiveTab('student-register')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-colors cursor-pointer"
              >
                Return to Candidate Portal
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-500">
              Sign in with your Supabase Auth administrator account.
            </div>
          </div>
        )}

        {isProtectedAdminTab && adminUser && (
          <>
            {activeTab === 'admin-dashboard' && (
              <AdminDashboardOverview
                analytics={analytics}
                students={students}
                forms={forms}
                onReleaseAllAdmitCards={handleReleaseAllAdmitCards}
                onDeclareAllResults={handleDeclareAllResults}
                onSelectStudent={handleSelectStudentForManage}
                onNavigateTab={(tab) => {
                  if (tab === 'forms') setActiveTab('admin-forms');
                  else if (tab === 'schools') setActiveTab('admin-schools');
                  else if (tab === 'students') setActiveTab('admin-students');
                }}
              />
            )}

            {activeTab === 'admin-forms' && (
              <FormsConfigManager
                forms={forms}
                onRefreshForms={loadData}
                onNavigateToFrontendForm={() => setActiveTab('student-register')}
              />
            )}

            {activeTab === 'admin-students' && (
              <StudentsManager
                students={students}
                forms={forms}
                onRefreshStudents={loadData}
                selectedStudentFromParent={selectedStudentForEdit}
              />
            )}

            {activeTab === 'admin-schools' && (
              <SchoolMasterManager schools={schools} onRefreshSchools={loadData} />
            )}
          </>
        )}
      </main>

      {/* Universal Auth Modal (Student + Admin) */}
      <UniversalAuthModal
        isOpen={isAuthModalOpen}
        initialTab={authModalInitialTab}
        onClose={() => setIsAuthModalOpen(false)}
        onAdminLoginSuccess={(user) => {
          setAdminUser(user);
          setIsAuthModalOpen(false);
          setActiveTab('admin-dashboard');
        }}
        onStudentLoginSuccess={(student, studentRecord) => {
          setStudentUser(student);
          setIsAuthModalOpen(false);
          if (studentRecord?.registration_id) {
            setTrackedRegId(studentRecord.registration_id);
            setActiveTab('student-track');
          }
        }}
      />

      {/* Official Government / Council Footer */}
      {!isEmbeddedNoticeView && <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 mt-auto mb-16 lg:mb-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-left">
            <p className="font-bold text-slate-800">
              Bihar State Educational Development and Research Council (BSEDRC)
            </p>
            <p className="text-[11px] text-slate-500">
              बिहार राज्य शैक्षिक विकास एवं अनुसंधान परिषद • Central Examination & U-DISE Student Lifecycle Directorate
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-slate-500">
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
              Dynamic Google Form Engine Active
            </span>
            <span>•</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
              Universal Auth: Student + Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="footer-admin-portal-btn"
              onClick={() => adminUser ? setActiveTab('admin-dashboard') : handleOpenAuthModal('admin')}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-[11px] font-bold text-amber-300 transition hover:bg-slate-800"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Portal
            </button>
            <button
              id="footer-code-hub-btn"
              onClick={() => setActiveTab('admin-backend')}
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-100"
            >
              Code Hub
            </button>
          </div>
        </div>
      </footer>}

      {/* MOBILE BOTTOM QUICK NAVIGATION BAR (Fixed at bottom for smartphones) */}
      {!isEmbeddedNoticeView && <nav aria-label="Mobile Quick Nav" className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 text-white lg:hidden shadow-2xl">
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
          {/* 1. Registration */}
          <button
            id="mobile-bottom-nav-register"
            onClick={() => setActiveTab('student-register')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'student-register'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className={`w-5 h-5 ${activeTab === 'student-register' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] leading-tight">Apply</span>
          </button>

          {/* 2. Admit / Result Tracker */}
          <button
            id="mobile-bottom-nav-tracker"
            onClick={() => setActiveTab('student-track')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'student-track'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className={`w-5 h-5 ${activeTab === 'student-track' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] leading-tight">Admit/Result</span>
          </button>

          {/* 3. Notices */}
          <button
            id="mobile-bottom-nav-notices"
            onClick={() => setActiveTab('notices')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'notices'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className={`w-5 h-5 ${activeTab === 'notices' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] leading-tight">Notices</span>
          </button>

          {/* 4. Merit List */}
          <button
            id="mobile-bottom-nav-merit"
            onClick={() => setActiveTab('merit-gazette')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'merit-gazette'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className={`w-5 h-5 ${activeTab === 'merit-gazette' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] leading-tight">Merit</span>
          </button>

          {/* 5. Services / Admin */}
          <button
            id="mobile-bottom-nav-admin"
            onClick={() => {
              if (adminUser) {
                setActiveTab('admin-dashboard');
              } else {
                handleOpenAuthModal('admin');
              }
            }}
            className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeTab.startsWith('admin-') || activeTab === 'verify-doc' || activeTab === 'helpdesk'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${activeTab.startsWith('admin-') ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] leading-tight">{adminUser ? 'Admin' : 'Login'}</span>
          </button>
        </div>
      </nav>}
    </div>
  );
}
