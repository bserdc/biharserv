import React from 'react';
import {
  Bell,
  FileCheck2,
  MapPinned,
  Trophy,
  ArrowRight,
  Users,
  CalendarDays,
  BookOpenText,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { AnalyticsSummary, FormConfig, School, Student } from '../types';

interface StudentZoneDashboardProps {
  forms: FormConfig[];
  students: Student[];
  schools: School[];
  analytics: AnalyticsSummary | null;
  onNavigateToTab: (tab: string) => void;
}

export const StudentZoneDashboard: React.FC<StudentZoneDashboardProps> = ({
  forms,
  students,
  schools,
  analytics,
  onNavigateToTab,
}) => {
  const notifications = [
    {
      title: 'Admit Card Release',
      detail: 'Medha Scholarship & Talent Search Examination 2026 admit cards live for download.',
      meta: '2026-08-25',
      tone: 'amber',
    },
    {
      title: 'Result Declaration',
      detail: 'Council result dashboard activated for all registered candidates and toppers.',
      meta: '2026-08-30',
      tone: 'emerald',
    },
    {
      title: 'Scholarship Update',
      detail: 'New scholarship and fee reimbursement schedules released for 2026-27.',
      meta: '2026-09-01',
      tone: 'sky',
    },
  ];

  const recentStudents = students.slice(0, 4);
  const districtCounts: Record<string, number> = {};

  students.forEach((student) => {
    const district = student.school_data.district || 'Unknown';
    districtCounts[district] = (districtCounts[district] || 0) + 1;
  });

  const topDistricts = Object.entries(districtCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const quickStats = [
    {
      label: 'Total Students',
      value: analytics?.total_students ?? students.length,
      icon: Users,
      tint: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    {
      label: 'Paid Registrations',
      value: analytics?.total_paid ?? students.filter((s) => s.payment_info.status === 'PAID').length,
      icon: ShieldCheck,
      tint: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    {
      label: 'Active Forms',
      value: forms.filter((form) => form.is_active).length,
      icon: BookOpenText,
      tint: 'bg-sky-100 text-sky-700 border-sky-200',
    },
    {
      label: 'School Network',
      value: schools.length,
      icon: MapPinned,
      tint: 'bg-violet-100 text-violet-700 border-violet-200',
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
              Student Zone
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Bihar student ecosystem dashboard
            </h1>
            <p className="mt-3 max-w-xl text-sm text-slate-300 sm:text-base">
              Registration, admit cards, results, notices and merit updates — sab kuch ek hi dashboard me.
            </p>
          </div>

        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <FileCheck2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-amber-700">Candidate services</p>
              <h2 className="mt-1 text-xl font-black text-slate-900">Registration, Admit Card &amp; Result</h2>
              <p className="mt-1 text-sm text-slate-600">Apply for an active form or access your admit card and result from one place.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              id="student-zone-registration-card"
              onClick={() => onNavigateToTab('student-register')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
            >
              <FileCheck2 className="h-4 w-4" />
              Registration
            </button>
            <button
              id="student-zone-admit-result-card"
              onClick={() => onNavigateToTab('student-track')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-100"
            >
              <UserCheck className="h-4 w-4 text-amber-600" />
              Admit Card &amp; Result
            </button>
            <button
              id="student-zone-correction-card"
              onClick={() => onNavigateToTab('helpdesk')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
            >
              <Sparkles className="h-4 w-4" />
              Online Correction Portal
            </button>
            <button
              id="student-zone-verification-card"
              onClick={() => onNavigateToTab('verify-doc')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Document Verification
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((stat) => (
          <div key={stat.label} className={`rounded-2xl border p-4 ${stat.tint}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-70">{stat.label}</p>
                <p className="mt-3 text-3xl font-black tracking-tight">{stat.value}</p>
              </div>
              <div className="rounded-xl bg-white/60 p-2.5 shadow-sm">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr,0.7fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Live Notifications</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">Important updates</h2>
            </div>
            <Bell className="h-5 w-5 text-amber-500" />
          </div>

          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.title}
                className={`rounded-2xl border p-4 ${
                  item.tone === 'amber'
                    ? 'border-amber-200 bg-amber-50'
                    : item.tone === 'emerald'
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-sky-200 bg-sky-50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                  </div>
                  <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                    {item.meta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Quick links</p>
              <h3 className="mt-1 text-xl font-black text-slate-900">Student actions</h3>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { label: 'Apply for form', tab: 'student-register' },
              { label: 'Track admit card/result', tab: 'student-track' },
              { label: 'View notices & circulars', tab: 'notices' },
              { label: 'View merit gazette', tab: 'merit-gazette' },
            ].map((link) => (
              <button
                key={link.label}
                onClick={() => onNavigateToTab(link.tab)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <span>{link.label}</span>
                <ArrowRight className="h-4 w-4 text-slate-500" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Latest registrations</p>
              <h3 className="mt-1 text-xl font-black text-slate-900">Recent student portal entries</h3>
            </div>
            <Users className="h-5 w-5 text-slate-500" />
          </div>

          <div className="space-y-3">
            {recentStudents.map((student) => (
              <div key={student.registration_id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 text-sm font-black text-amber-700">
                    {student.personal_data.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{student.personal_data.name}</p>
                    <p className="text-[11px] text-slate-500">{student.registration_id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{student.school_data.district}</p>
                  <p className="text-xs font-bold text-emerald-600">{student.payment_info.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Exam schedule</p>
              <h3 className="mt-1 text-xl font-black text-slate-900">Upcoming programmes</h3>
            </div>
            <CalendarDays className="h-5 w-5 text-slate-500" />
          </div>

          <div className="space-y-3">
            {forms.map((form) => (
              <div key={form.form_id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{form.title}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{form.exam_date} • {form.exam_time}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                    form.admit_card_status.is_released ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {form.admit_card_status.is_released ? 'Live' : 'Scheduled'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">District coverage</p>
            <h3 className="mt-1 text-xl font-black text-slate-900">Registration footprint</h3>
          </div>
          <Trophy className="h-5 w-5 text-amber-500" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {topDistricts.map(([district, count]) => (
            <div key={district} className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{district}</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{count}</p>
              <p className="text-xs text-slate-500">students registered</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
