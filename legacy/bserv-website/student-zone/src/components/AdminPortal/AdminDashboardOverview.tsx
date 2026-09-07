import React from 'react';
import {
  Users,
  IndianRupee,
  Building2,
  FileCheck,
  Award,
  TrendingUp,
  Zap,
  Download,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { AnalyticsSummary, Student, FormConfig } from '../../types';

interface AdminDashboardOverviewProps {
  analytics: AnalyticsSummary | null;
  students: Student[];
  forms: FormConfig[];
  onReleaseAllAdmitCards: () => void;
  onDeclareAllResults: () => void;
  onSelectStudent: (student: Student) => void;
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  analytics,
  students,
  forms,
  onReleaseAllAdmitCards,
  onDeclareAllResults,
  onSelectStudent,
  onNavigateTab,
}) => {
  const exportAllStudentsToExcel = () => {
    if (!students || students.length === 0) return;

    const data = students.map((s) => ({
      'Registration ID': s.registration_id,
      'Student Name': s.personal_data.name,
      'Father Name': s.personal_data.father_name,
      'Date of Birth': s.personal_data.dob,
      'Mobile Number': s.personal_data.mobile,
      'Category': s.personal_data.category,
      'School Name': s.school_data.school_name,
      'UDISE Code': s.school_data.udise_code,
      'District': s.school_data.district,
      'Block': s.school_data.block,
      'Class': s.school_data.current_class,
      'Payment Status': s.payment_info.status,
      'Amount (INR)': s.payment_info.amount,
      'Txn ID': s.payment_info.txn_id,
      'Roll Number': s.exam_details.roll_no || 'Pending',
      'Exam Center': s.exam_details.exam_center || 'Not Assigned',
      'Marks Obtained': s.result_details.marks_obtained ?? 'N/A',
      'Total Marks': s.result_details.total_marks || 100,
      'Result Status': s.result_details.status || 'PENDING',
      'Grade': s.result_details.grade || 'N/A',
      'State Rank': s.result_details.rank ?? 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'All_Students_Master');
    XLSX.writeFile(workbook, `BSEDRC_Candidates_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const activeForm = forms[0];

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Lifecycle Master Actions */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/30">
            <Zap className="w-3.5 h-3.5" /> BSEDRC Directorate Command Center
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Admissions, Admit Card Aur Results Engine
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Bihar State Educational Development and Research Council (BSEDRC) pariksha portal. Yahan se candidate registration track karein, batch roll number jari karein, aur rajyastariya result ghoshit karein.
          </p>
        </div>

        {/* Global Quick Actions Bar */}
        <div className="flex flex-wrap gap-2.5 w-full lg:w-auto">
          <button
            id="release-all-admit-btn"
            onClick={onReleaseAllAdmitCards}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
          >
            <FileCheck className="w-4 h-4" />
            <span>Sabhi Admit Cards Jari Karein</span>
          </button>

          <button
            id="declare-all-results-btn"
            onClick={onDeclareAllResults}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
          >
            <Award className="w-4 h-4" />
            <span>Results Ghoshit / Publish Karein</span>
          </button>

          <button
            id="export-excel-btn"
            onClick={exportAllStudentsToExcel}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Excel Export (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Kul Students</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {analytics?.total_students ?? students.length}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1">
            <TrendingUp className="w-3 h-3" /> 100% Satyaapit Aavedan
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Kul Fees Jama</span>
            <IndianRupee className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ₹{analytics?.total_revenue ?? 250}
          </div>
          <span className="text-[10px] text-slate-500 font-medium mt-1 block">
            {analytics?.total_paid ?? students.length} Safal Payments
          </span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Shamil Schools</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {analytics?.total_schools ?? 12}
          </div>
          <span className="text-[10px] text-slate-500 font-medium mt-1 block">
            Kul {analytics?.districts_count ?? 5} Jilo Se
          </span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Admit Cards</span>
            <FileCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {analytics?.admit_cards_issued ?? students.length}
          </div>
          <span className={`text-[10px] font-semibold mt-1 block ${
            activeForm?.admit_card_status?.is_released ? 'text-emerald-600' : 'text-amber-600'
          }`}>
            {activeForm?.admit_card_status?.is_released ? '● Portal Par Live' : '○ Locked (Band)'}
          </span>
        </div>

        {/* Metric 5 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Results Ghoshit</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {analytics?.results_declared ?? students.length}
          </div>
          <span className={`text-[10px] font-semibold mt-1 block ${
            activeForm?.result_status?.is_declared ? 'text-emerald-600' : 'text-slate-500'
          }`}>
            {activeForm?.result_status?.is_declared ? '● Online Ghoshit' : '○ Pending'}
          </span>
        </div>

        {/* Metric 6 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pass Pratishat</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-700 font-mono">
            {analytics?.pass_percentage ?? 100}%
          </div>
          <span className="text-[10px] text-slate-500 font-medium mt-1 block">
            {analytics?.pass_count ?? students.length} Uttirna (Qualified)
          </span>
        </div>

      </div>

      {/* Two Column Layout: District Analytics + Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* District & School Coverage */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Jilawar Bhaagidari (Districts)
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {analytics?.district_distribution?.length || 4} Jile
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {analytics?.district_distribution?.map((dist) => {
              const maxCount = Math.max(...(analytics.district_distribution?.map((d) => d.count) || [1]));
              const pct = (dist.count / maxCount) * 100;
              return (
                <div key={dist.district} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">{dist.district}</span>
                    <span className="text-slate-500 font-mono">{dist.count} candidates</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick shortcuts */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => onNavigateTab('forms')}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-left border border-slate-200 text-slate-800 font-semibold"
            >
              Forms & Fees Settings →
            </button>
            <button
              onClick={() => onNavigateTab('schools')}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-left border border-slate-200 text-slate-800 font-semibold"
            >
              School U-DISE Directory →
            </button>
          </div>
        </div>

        {/* Recent Registrations Table */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Haal Hi Ke Registrations (Recent)
            </h3>
            <button
              onClick={() => onNavigateTab('students')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>Sabhi Dekhein ({students.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Umeedwaar</th>
                  <th className="py-2.5 px-3 font-bold">Reg ID / Roll</th>
                  <th className="py-2.5 px-3 font-bold">School & Jila</th>
                  <th className="py-2.5 px-3 font-bold">Result</th>
                  <th className="py-2.5 px-3 text-right font-bold">Karyawahi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.slice(0, 5).map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-extrabold text-slate-900">{s.personal_data.name}</div>
                      <span className="text-[11px] text-slate-500 font-mono">{s.personal_data.mobile}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-slate-800">{s.registration_id}</div>
                      <span className="text-[11px] font-mono text-blue-700">Roll: {s.exam_details.roll_no || 'Pending'}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="truncate max-w-[150px] font-medium text-slate-800">{s.school_data.school_name}</div>
                      <span className="text-[10px] text-slate-500">{s.school_data.district}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.result_details.status === 'PASS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.result_details.status === 'FAIL'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {s.result_details.marks_obtained !== undefined
                          ? `${s.result_details.marks_obtained} (${s.result_details.grade})`
                          : 'Baki Hai'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onSelectStudent(s)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-[11px]"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
