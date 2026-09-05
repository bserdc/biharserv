import React, { useState } from 'react';
import {
  Search,
  Building2,
  Download,
  Printer,
  Users,
  Award,
  TrendingUp,
  MapPin,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { School, Student } from '../../types';
import { api } from '../../services/api';

interface InstitutionalSearchProps {
  schools: School[];
  allStudents: Student[];
}

export const InstitutionalSearch: React.FC<InstitutionalSearchProps> = ({
  schools,
  allStudents,
}) => {
  const [selectedUdise, setSelectedUdise] = useState<string>(schools[0]?.udise_code || '10020100101');
  const [reportData, setReportData] = useState<{
    school: School | null;
    students: Student[];
    stats: {
      total_students: number;
      paid_students: number;
      passed_students: number;
      pass_percentage: number;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrintNoticeOpen, setIsPrintNoticeOpen] = useState(false);

  const fetchSchoolReport = async (udise: string) => {
    setIsLoading(true);
    try {
      const res = await api.searchInstitution({ udise_code: udise });
      if (res.success) {
        setReportData({
          school: res.institution || null,
          students: res.students || [],
          stats: res.stats || { total_students: 0, paid_students: 0, passed_students: 0, pass_percentage: 0 },
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  React.useEffect(() => {
    if (selectedUdise) {
      fetchSchoolReport(selectedUdise);
    }
  }, [selectedUdise]);

  const exportSchoolRoster = () => {
    if (!reportData || reportData.students.length === 0) return;

    const data = reportData.students.map((s) => ({
      'Registration ID': s.registration_id,
      'Roll Number': s.exam_details.roll_no || 'Pending',
      'Student Name': s.personal_data.name,
      'Father Name': s.personal_data.father_name,
      'Date of Birth': s.personal_data.dob,
      'Mobile': s.personal_data.mobile,
      'Class': s.school_data.current_class,
      'Exam Center': s.exam_details.exam_center,
      'Marks Obtained': s.result_details.marks_obtained ?? 'Pending',
      'Total Marks': s.result_details.total_marks || 100,
      'Result Status': s.result_details.status || 'PENDING',
      'Grade': s.result_details.grade || 'N/A',
      'State Rank': s.result_details.rank ?? 'N/A',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'School_Notice_Board');
    XLSX.writeFile(
      wb,
      `BSEDRC_School_${reportData.school?.udise_code || 'Report'}_Roster.xlsx`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-1">
            School Analytics & Notice Board Gazette
          </span>
          <h2 className="text-xl font-black text-slate-900">
            School-Wise Reporting & Notice Board Gazette
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            U-DISE code se khojein, school performance report dekhein aur Headmaster ke liye print karne yogya Notice Board Gazette generate karein.
          </p>
        </div>

        {reportData && (
          <div className="flex gap-2">
            <button
              id="export-school-excel-btn"
              onClick={exportSchoolRoster}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>Roster Export (.xlsx)</span>
            </button>

            <button
              id="print-notice-board-btn"
              onClick={() => setIsPrintNoticeOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>Notice Gazette Print Karein</span>
            </button>
          </div>
        )}
      </div>

      {/* School Selector Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-lg flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <label className="block text-[11px] text-amber-400 font-bold uppercase tracking-wider mb-1">
            U-DISE Code Ya School Ke Naam Se Chunein
          </label>
          <select
            id="report-school-select"
            value={selectedUdise}
            onChange={(e) => setSelectedUdise(e.target.value)}
            className="w-full bg-slate-950 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-hidden focus:border-amber-500"
          >
            {schools.map((s) => (
              <option key={s.udise_code} value={s.udise_code}>
                {s.school_name} (UDISE: {s.udise_code}) — {s.block}, {s.district}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => fetchSchoolReport(selectedUdise)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs whitespace-nowrap shadow-md mt-auto w-full sm:w-auto"
        >
          {isLoading ? 'Load Ho Raha Hai...' : 'Report Refresh Karein'}
        </button>
      </div>

      {/* Institutional Statistics & Overview */}
      {reportData && reportData.school && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Institutional Info Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">{reportData.school.school_name}</h3>
                <span className="font-mono text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold border border-slate-200">
                  U-DISE: {reportData.school.udise_code}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Jila: <strong>{reportData.school.district}</strong> • Block: <strong>{reportData.school.block}</strong> • Panchayat: <strong>{reportData.school.panchayat || 'Main'}</strong>
              </p>
            </div>

            <div className="flex gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Kul Namankit Students</span>
                <span className="text-xl font-black text-slate-900 font-mono">{reportData.stats.total_students}</span>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Pass Pratishat (Rate)</span>
                <span className="text-xl font-black text-emerald-700 font-mono">{reportData.stats.pass_percentage}%</span>
              </div>
            </div>
          </div>

          {/* Student Roster for this School */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Iss School Se Namankit Students ({reportData.students.length})
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">Student Name</th>
                    <th className="py-2.5 px-3 font-bold">Registration ID</th>
                    <th className="py-2.5 px-3 font-bold">Roll Number</th>
                    <th className="py-2.5 px-3 font-bold">Kaksha (Class)</th>
                    <th className="py-2.5 px-3 font-bold">Fees Status</th>
                    <th className="py-2.5 px-3 font-bold">Praptank (Marks)</th>
                    <th className="py-2.5 px-3 font-bold">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.students.map((st) => (
                    <tr key={st._id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {st.personal_data.name}
                        <span className="block text-[10px] font-normal text-slate-500">
                          Pita: {st.personal_data.father_name}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                        {st.registration_id}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                        {st.exam_details.roll_no || 'Baki Hai'}
                      </td>
                      <td className="py-2.5 px-3">{st.school_data.current_class}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                          JAMA HO GAYA
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        {st.result_details.marks_obtained !== undefined ? `${st.result_details.marks_obtained}/100` : 'Baki Hai'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          st.result_details.status === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {st.result_details.status === 'PASS' ? 'PASS' : st.result_details.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE NOTICE BOARD GAZETTE MODAL */}
      {isPrintNoticeOpen && reportData && reportData.school && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Header with Print Controls */}
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-200 print:hidden">
              <div>
                <h3 className="text-base font-bold text-slate-900">Official Notice Board Gazette Preview</h3>
                <p className="text-xs text-slate-500">School Notice Board par lagane ke liye A4 size me formatted</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Document Print Karein</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintNoticeOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Band Karein (Close)
                </button>
              </div>
            </div>

            {/* Printable Gazette Sheet */}
            <div className="border-4 border-slate-900 p-6 bg-white text-slate-900 space-y-4">
              <div className="text-center border-b-2 border-slate-900 pb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600">
                  BIHAR STATE EDUCATIONAL DEVELOPMENT AND RESEARCH COUNCIL (BSEDRC) • EXAMINATION CONTROLLER
                </span>
                <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  Institutional Candidate Notice Board Gazette 2026
                </h2>
                <div className="font-bold text-xs mt-1">
                  School: {reportData.school.school_name} | U-DISE: {reportData.school.udise_code}
                </div>
                <div className="text-[11px] text-slate-600">
                  Block: {reportData.school.block} • District: {reportData.school.district}
                </div>
              </div>

              <div className="flex justify-between text-xs py-1 font-semibold border-b border-slate-200">
                <span>Kul Candidates: {reportData.stats.total_students}</span>
                <span>Uttirna (Qualified): {reportData.stats.passed_students}</span>
                <span>Pass Rate: {reportData.stats.pass_percentage}%</span>
              </div>

              <table className="w-full text-xs text-left border border-slate-900">
                <thead className="bg-slate-200 text-slate-900 border-b border-slate-900 font-bold">
                  <tr>
                    <th className="p-2 border-r border-slate-900">Kram</th>
                    <th className="p-2 border-r border-slate-900">Roll No</th>
                    <th className="p-2 border-r border-slate-900">Reg ID</th>
                    <th className="p-2 border-r border-slate-900">Student Ka Naam</th>
                    <th className="p-2 border-r border-slate-900">Pita Ka Naam</th>
                    <th className="p-2 border-r border-slate-900">Praptank</th>
                    <th className="p-2 border-r border-slate-900">Grade</th>
                    <th className="p-2">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {reportData.students.map((st, idx) => (
                    <tr key={st._id}>
                      <td className="p-2 border-r border-slate-300 font-mono">{idx + 1}</td>
                      <td className="p-2 border-r border-slate-300 font-mono font-bold text-blue-900">{st.exam_details.roll_no || '—'}</td>
                      <td className="p-2 border-r border-slate-300 font-mono">{st.registration_id}</td>
                      <td className="p-2 border-r border-slate-300 font-bold uppercase">{st.personal_data.name}</td>
                      <td className="p-2 border-r border-slate-300">{st.personal_data.father_name}</td>
                      <td className="p-2 border-r border-slate-300 font-mono">{st.result_details.marks_obtained ?? '—'}</td>
                      <td className="p-2 border-r border-slate-300 font-bold">{st.result_details.grade || '—'}</td>
                      <td className="p-2 font-bold">{st.result_details.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-8 flex justify-between text-xs text-slate-700 font-semibold">
                <div className="text-center">
                  <div className="w-32 border-b border-slate-800 mb-1"></div>
                  <span>Pradhanadhyapak (Headmaster) Signature</span>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-800 mb-1"></div>
                  <span>BSEDRC Exam Controller Signature</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
