import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Award,
  FileCheck,
  Edit,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Printer,
  ChevronDown,
  Upload
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, FormConfig } from '../../types';
import { api } from '../../services/api';
import { DocumentViewerModal } from '../StudentPortal/DocumentViewerModal';

interface StudentsManagerProps {
  students: Student[];
  forms: FormConfig[];
  onRefreshStudents: () => void;
  selectedStudentFromParent?: Student | null;
}

export const StudentsManager: React.FC<StudentsManagerProps> = ({
  students,
  forms,
  onRefreshStudents,
  selectedStudentFromParent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [selectedResultStatus, setSelectedResultStatus] = useState('all');

  // Edit Single Student Modal
  const [editingStudent, setEditingStudent] = useState<Student | null>(selectedStudentFromParent || null);
  const [editMarks, setEditMarks] = useState<number | ''>('');
  const [editRollNo, setEditRollNo] = useState('');
  const [editExamCenter, setEditExamCenter] = useState('');
  const [editRoomNo, setEditRoomNo] = useState('');

  // Bulk Results Modal
  const [isBulkResultsOpen, setIsBulkResultsOpen] = useState(false);
  const [bulkInputText, setBulkInputText] = useState('');

  // Document modal
  const [viewingDocStudent, setViewingDocStudent] = useState<Student | null>(null);
  const [docModalType, setDocModalType] = useState<'admit_card' | 'application_form' | 'marksheet'>('admit_card');

  const districts = Array.from(new Set(students.map((s) => s.school_data.district))).sort();

  // Filter logic
  const filteredStudents = students.filter((s) => {
    if (selectedDistrict !== 'all' && s.school_data.district !== selectedDistrict) return false;
    if (selectedPaymentStatus !== 'all' && s.payment_info.status !== selectedPaymentStatus) return false;
    if (selectedResultStatus !== 'all' && s.result_details.status !== selectedResultStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.registration_id.toLowerCase().includes(q) ||
        s.personal_data.name.toLowerCase().includes(q) ||
        s.personal_data.father_name.toLowerCase().includes(q) ||
        s.personal_data.mobile.includes(q) ||
        s.school_data.school_name.toLowerCase().includes(q) ||
        s.school_data.udise_code.includes(q) ||
        (s.exam_details.roll_no && s.exam_details.roll_no.includes(q))
      );
    }
    return true;
  });

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setEditMarks(student.result_details.marks_obtained ?? '');
    setEditRollNo(student.exam_details.roll_no || '');
    setEditExamCenter(student.exam_details.exam_center || '');
    setEditRoomNo(student.exam_details.room_no || '');
  };

  const handleSaveStudentEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      const updates: any = {
        exam_details: {
          ...editingStudent.exam_details,
          roll_no: editRollNo,
          exam_center: editExamCenter,
          room_no: editRoomNo,
        },
      };

      if (editMarks !== '') {
        updates.result_details = {
          ...editingStudent.result_details,
          marks_obtained: Number(editMarks),
        };
      }

      const res = await api.updateStudent(editingStudent._id, updates);
      if (res.success) {
        setEditingStudent(null);
        onRefreshStudents();
      }
    } catch (e) {
      alert('Failed to update student details');
    }
  };

  const handleBulkAdmitCards = async () => {
    if (!confirm('Auto-generate Roll Numbers and Examination Centers for all registered applicants?')) return;
    try {
      const res = await api.bulkGenerateAdmitCards();
      if (res.success) {
        alert(res.message);
        onRefreshStudents();
      }
    } catch (e) {
      alert('Failed to execute bulk admit cards generator');
    }
  };

  const handleBulkResultsSubmit = async () => {
    try {
      // Parse CSV / JSON / Lines
      const lines = bulkInputText.trim().split('\n');
      const results: Array<{ registration_id: string; marks_obtained: number }> = [];

      lines.forEach((line) => {
        const parts = line.split(/[,\t\s]+/);
        if (parts.length >= 2) {
          const reg = parts[0].trim();
          const marks = parseFloat(parts[1].trim());
          if (reg && !isNaN(marks)) {
            results.push({ registration_id: reg, marks_obtained: marks });
          }
        }
      });

      if (results.length === 0) {
        alert('No valid student marks entries found. Format: RegistrationID Marks (e.g. MLF-2026-8941 88)');
        return;
      }

      const res = await api.bulkUploadResults(results);
      if (res.success) {
        alert(res.message);
        setIsBulkResultsOpen(false);
        setBulkInputText('');
        onRefreshStudents();
      }
    } catch (e) {
      alert('Error updating bulk results');
    }
  };

  const exportFilteredExcel = () => {
    const data = filteredStudents.map((s) => ({
      'Registration ID': s.registration_id,
      'Student Name': s.personal_data.name,
      'Father Name': s.personal_data.father_name,
      'DOB': s.personal_data.dob,
      'Mobile': s.personal_data.mobile,
      'School': s.school_data.school_name,
      'UDISE': s.school_data.udise_code,
      'District': s.school_data.district,
      'Block': s.school_data.block,
      'Roll No': s.exam_details.roll_no || 'N/A',
      'Exam Center': s.exam_details.exam_center || 'N/A',
      'Marks': s.result_details.marks_obtained ?? 'Pending',
      'Status': s.result_details.status || 'PENDING',
      'Grade': s.result_details.grade || 'N/A',
      'Rank': s.result_details.rank ?? 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Filtered_Students');
    XLSX.writeFile(workbook, `MLF_Students_Filtered_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Control Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-1">
            Student Roster & Pariksha Prabandhan
          </span>
          <h2 className="text-xl font-black text-slate-900">
            Student Lifecycle Aur Marks Allocation Master
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Kul {students.length} aavedako ki soochi dekhein, Roll Number allot karein, evaluation marks dalein, aur documents preview karein.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            id="bulk-admit-btn"
            onClick={handleBulkAdmitCards}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
          >
            <FileCheck className="w-4 h-4" />
            <span>Roll No & Centers Allot Karein</span>
          </button>

          <button
            id="bulk-results-btn"
            onClick={() => setIsBulkResultsOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Bulk Marks Uploader</span>
          </button>

          <button
            id="export-filtered-btn"
            onClick={exportFilteredExcel}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-300"
          >
            <Download className="w-4 h-4" />
            <span>Excel Export (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
        <div className="sm:col-span-4 relative">
          <input
            type="text"
            id="student-filter-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Naam, Reg ID, Mobile, School, Roll No se khojein..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="sm:col-span-3">
          <select
            id="district-filter-select"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
          >
            <option value="all">Sabhi Jile ({districts.length})</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            id="result-filter-select"
            value={selectedResultStatus}
            onChange={(e) => setSelectedResultStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
          >
            <option value="all">Sabhi Result Status</option>
            <option value="PASS">PASS / Uttirna</option>
            <option value="FAIL">FAIL / Anuttirna</option>
            <option value="PENDING">PENDING (Baki Hai)</option>
          </select>
        </div>

        <div className="sm:col-span-2 flex items-center justify-end font-mono text-slate-500 font-bold">
          Kul: {filteredStudents.length} / {students.length}
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="py-3 px-4 font-bold">Student Ki Jankari</th>
                <th className="py-3 px-4 font-bold">Registration Aur Roll</th>
                <th className="py-3 px-4 font-bold">School Aur Jila</th>
                <th className="py-3 px-4 font-bold">Fees Status</th>
                <th className="py-3 px-4 font-bold">Pariksha Kendra</th>
                <th className="py-3 px-4 font-bold">Marks Aur Result</th>
                <th className="py-3 px-4 text-right font-bold">Karyawahi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={s.personal_data.photo_url}
                        alt={s.personal_data.name}
                        className="w-9 h-11 object-cover rounded border border-slate-300"
                      />
                      <div>
                        <div className="font-extrabold text-slate-900 text-xs uppercase">
                          {s.personal_data.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Pita: {s.personal_data.father_name} • DOB: {s.personal_data.dob}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{s.personal_data.mobile}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-slate-900">{s.registration_id}</div>
                    <div className="text-[11px] font-mono text-blue-700 font-semibold">
                      Roll: {s.exam_details.roll_no || 'Baki Hai'}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 max-w-[180px] truncate">
                      {s.school_data.school_name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      UDISE: <span className="font-mono">{s.school_data.udise_code}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {s.school_data.block}, {s.school_data.district}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                      ₹{s.payment_info.amount} JAMA HO GAYA
                    </span>
                    <span className="block text-[9px] text-slate-400 font-mono mt-0.5 truncate max-w-[100px]">
                      {s.payment_info.txn_id}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-slate-800 font-medium max-w-[140px] truncate">
                      {s.exam_details.exam_center || 'Kendra Allot Nahi Hua'}
                    </div>
                    <div className="text-[10px] text-slate-500">{s.exam_details.room_no || 'Hall A'}</div>
                  </td>

                  <td className="py-3 px-4">
                    {s.result_details.marks_obtained !== undefined ? (
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.result_details.status === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {s.result_details.marks_obtained} / {s.result_details.total_marks || 100} ({s.result_details.grade})
                        </span>
                        {s.result_details.rank && (
                          <span className="block text-[10px] font-bold text-amber-800 mt-0.5">
                            Rank #{s.result_details.rank}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 font-semibold text-[11px]">Evaluation Baki Hai</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        title="Marks Aur Roll Edit Karein"
                        onClick={() => handleOpenEdit(s)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Documents Dekhein Aur Print Karein"
                        onClick={() => {
                          setViewingDocStudent(s);
                          setDocModalType('admit_card');
                        }}
                        className="p-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg font-bold"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SINGLE STUDENT EDIT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Student Exam & Marks Edit: {editingStudent.personal_data.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-mono">{editingStudent.registration_id}</p>

            <form onSubmit={handleSaveStudentEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pariksha Roll Number</label>
                  <input
                    type="text"
                    value={editRollNo}
                    onChange={(e) => setEditRollNo(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kamra / Hall Number</label>
                  <input
                    type="text"
                    value={editRoomNo}
                    onChange={(e) => setEditRoomNo(e.target.value)}
                    placeholder="e.g. Hall 102"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nirdharit Pariksha Kendra (Exam Center)</label>
                <input
                  type="text"
                  value={editExamCenter}
                  onChange={(e) => setEditExamCenter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-200">
                <label className="block font-bold text-slate-700 mb-1">
                  Praptank / Marks Obtained ({editingStudent.result_details.total_marks || 100} me se)
                </label>
                <input
                  type="number"
                  value={editMarks}
                  onChange={(e) => setEditMarks(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 85"
                  min="0"
                  max={editingStudent.result_details.total_marks || 100}
                  className="w-full px-3 py-2 border rounded-xl font-mono font-bold text-sm"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Passing marks: 40. Pass/Fail aur Grade automatic calculate ho jayega.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Radd Karein (Cancel)
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-xl shadow-md"
                >
                  Save Karein
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK MARKS UPLOADER MODAL */}
      {isBulkResultsOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Bulk Marks & Result Evaluation Importer</h3>
            <p className="text-xs text-slate-500 mb-4">
              Student Registration ID / Roll number aur unke praptank yahan paste karein.
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border text-[11px] font-mono text-slate-600 mb-3">
              Format: <code>Registration_ID Marks</code> (Pratyek line me ek)
              <br />
              Udaharan (Example):
              <br />
              BSEDRC-2026-8941 88
              <br />
              BSEDRC-2026-8942 94
              <br />
              BSEDRC-2026-8943 72
            </div>

            <textarea
              rows={8}
              value={bulkInputText}
              onChange={(e) => setBulkInputText(e.target.value)}
              placeholder="BSEDRC-2026-8941 88&#10;BSEDRC-2026-8942 94&#10;BSEDRC-2026-8943 72"
              className="w-full p-3 border border-slate-300 rounded-xl font-mono text-xs mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBulkResultsOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              >
                Radd Karein (Cancel)
              </button>
              <button
                type="button"
                onClick={handleBulkResultsSubmit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md"
              >
                Process & Save Karein
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDocStudent && (
        <DocumentViewerModal
          isOpen={Boolean(viewingDocStudent)}
          onClose={() => setViewingDocStudent(null)}
          student={viewingDocStudent}
          form={forms.find((f) => f.form_id === viewingDocStudent.form_id)}
          initialDocType={docModalType}
        />
      )}
    </div>
  );
};
