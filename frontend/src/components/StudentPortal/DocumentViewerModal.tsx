import React, { useRef } from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Award,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  ShieldAlert,
  FileText
} from 'lucide-react';
import { Student, FormConfig } from '../../types';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  form?: FormConfig;
  initialDocType?: 'admit_card' | 'application_form' | 'marksheet';
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  student,
  form,
  initialDocType = 'admit_card',
}) => {
  const [docType, setDocType] = React.useState<'admit_card' | 'application_form' | 'marksheet'>(initialDocType);
  const printRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setDocType(initialDocType);
  }, [initialDocType]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isAdmitAvailable = Boolean(form?.admit_card_status?.is_released && student.exam_details?.roll_no);
  const isResultAvailable = Boolean(form?.result_status?.is_declared && student.result_details?.marks_obtained !== undefined);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-300 print:border-none print:shadow-none print:max-h-none print:rounded-none">
        
        {/* Modal Top Control Bar (Hidden on Print) */}
        <div className="bg-slate-900 text-white px-3 sm:px-5 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 hidden sm:inline">Doc:</span>
            <div className="flex bg-slate-800 p-0.5 rounded-lg text-xs shrink-0">
              <button
                type="button"
                id="doc-tab-application"
                onClick={() => setDocType('application_form')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap ${
                  docType === 'application_form' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                Aavedan Form
              </button>
              <button
                type="button"
                id="doc-tab-admit"
                onClick={() => setDocType('admit_card')}
                disabled={!isAdmitAvailable}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap ${
                  docType === 'admit_card'
                    ? 'bg-amber-500 text-slate-950'
                    : isAdmitAvailable
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                Admit Card {!isAdmitAvailable && '(Band)'}
              </button>
              <button
                type="button"
                id="doc-tab-marksheet"
                onClick={() => setDocType('marksheet')}
                disabled={!isResultAvailable}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap ${
                  docType === 'marksheet'
                    ? 'bg-amber-500 text-slate-950'
                    : isResultAvailable
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                Marksheet {!isResultAvailable && '(Band)'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <button
              id="print-document-btn"
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial justify-center bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              id="close-doc-modal-btn"
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet Container */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-slate-100/60 print:p-0 print:bg-white flex-1" ref={printRef}>
          <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 border-2 border-slate-900 shadow-lg print:shadow-none print:border-2 print:border-black rounded-lg print:rounded-none relative">
            
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <span className="text-8xl font-black text-slate-900 transform -rotate-45 font-sans">
                BSEDRC 2026
              </span>
            </div>

            {/* Official Header */}
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-20 text-left">
                  <span className="text-[10px] font-bold text-slate-500 font-mono">ESTD. 2018</span>
                  <p className="text-[9px] text-slate-400 font-mono">COUNCIL CODE: BSEDRC-2026</p>
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                    Bihar State Educational Development and Research Council
                  </h1>
                  <p className="text-xs font-bold text-slate-700 tracking-wide">
                    बिहार राज्य शैक्षिक विकास एवं अनुसंधान परिषद (BSEDRC)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    State Level Examination & Research Directorate • Patna, Bihar
                  </p>
                </div>
                <div className="w-20 text-right">
                  <span className="inline-block px-2 py-0.5 bg-slate-900 text-amber-400 text-[10px] font-mono font-bold rounded">
                    GOVT RECORD
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 text-white py-1 px-4 inline-block rounded-sm mt-1">
                <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                  {docType === 'admit_card' && 'E-Admit Card / Pravesh Patra'}
                  {docType === 'application_form' && 'Aavedan Form & Admission Summary'}
                  {docType === 'marksheet' && 'Official Statement of Marks & Rank Certificate (Marksheet)'}
                </h2>
              </div>
              <p className="text-xs font-bold text-amber-800 mt-1">
                {form?.title || 'Scholarship & Talent Search Examination 2026'}
              </p>
            </div>

            {/* 1. ADMIT CARD VIEW */}
            {docType === 'admit_card' && (
              <div>
                {/* Candidate Credentials Top Bar */}
                <div className="grid grid-cols-3 gap-3 bg-amber-50/80 p-3 rounded-lg border border-amber-300/80 mb-6 text-xs font-sans">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Registration ID</span>
                    <strong className="text-sm font-black text-slate-900 font-mono">{student.registration_id}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Pariksha Roll Number</span>
                    <strong className="text-sm font-black text-blue-900 font-mono">
                      {student.exam_details.roll_no || '100245'}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Academic Session</span>
                    <strong className="text-xs font-bold text-slate-900">{form?.academic_year || '2026-2027'}</strong>
                  </div>
                </div>

                {/* Candidate Bio & Photo Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
                  <div className="sm:col-span-3">
                    <table className="w-full text-xs text-left border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="py-2 font-bold text-slate-600 w-36">Student Ka Naam:</td>
                          <td className="py-2 font-extrabold text-slate-900 uppercase text-sm">{student.personal_data.name}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-2 font-bold text-slate-600">Pita Ka Naam:</td>
                          <td className="py-2 font-bold text-slate-900">{student.personal_data.father_name}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-2 font-bold text-slate-600">Janam Tithi (DOB):</td>
                          <td className="py-2 font-semibold text-slate-900 font-mono">{student.personal_data.dob}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-2 font-bold text-slate-600">Gender / Category:</td>
                          <td className="py-2 text-slate-900 font-medium">{student.personal_data.gender} / {student.personal_data.category}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-2 font-bold text-slate-600">School / U-DISE:</td>
                          <td className="py-2 text-slate-900 font-semibold">
                            {student.school_data.school_name}
                            <span className="ml-1 text-[11px] font-mono text-slate-500">({student.school_data.udise_code})</span>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-2 font-bold text-slate-600">Kaksha Aur Jila:</td>
                          <td className="py-2 text-slate-900">
                            Class {student.school_data.current_class} • {student.school_data.block}, {student.school_data.district}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Photo & Verified Stamp Box */}
                  <div className="sm:col-span-1 flex flex-col items-center justify-center">
                    <div className="w-28 h-36 border-2 border-slate-900 p-1 bg-white rounded shadow-xs relative">
                      <img
                        src={student.personal_data.photo_url}
                        alt="Candidate Photo"
                        className="w-full h-full object-cover rounded-xs"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white rounded-full p-1 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-500 mt-2 font-semibold text-center uppercase tracking-wider">
                      Verified Applicant
                    </span>
                  </div>
                </div>

                {/* Exam Schedule & Venue Box */}
                <div className="border-2 border-slate-900 rounded-lg p-4 bg-slate-50 mb-6">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b border-slate-300 pb-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    Pariksha Kendra Aur Samay Jankari
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-slate-500 text-[11px] font-semibold">Pariksha Kendra (Exam Center):</p>
                      <p className="font-extrabold text-slate-900 mt-0.5 text-sm">
                        {student.exam_details.exam_center || 'Govt High School Central Hall'}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" /> {student.school_data.district} District Center
                      </p>
                    </div>
                    <div className="sm:border-l sm:border-slate-300 sm:pl-4 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Pariksha Tithi:</span>
                        <strong className="text-slate-900 font-mono">{form?.exam_date || '2026-09-15'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Pariksha Samay:</span>
                        <strong className="text-slate-900 font-mono">{form?.exam_time || '10:00 AM - 12:30 PM'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Reporting Time:</span>
                        <strong className="text-amber-800 font-mono font-black">{student.exam_details.reporting_time || '09:15 AM'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Hall / Room No:</span>
                        <strong className="text-slate-900 font-mono">{student.exam_details.room_no || 'Hall 102'}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions to Candidate */}
                <div className="border border-slate-300 rounded-lg p-3 bg-amber-50/40 text-[11px] text-slate-800 mb-6">
                  <h4 className="font-bold text-amber-900 uppercase text-[10px] mb-1.5 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-amber-700" />
                    Pariksha Hetu Zaroori Nirdesh (Instructions):
                  </h4>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {form?.instructions?.slice(0, 4).map((inst, idx) => (
                      <li key={idx}>{inst}</li>
                    )) || (
                      <>
                        <li>Pariksharthi ko yeh Admit Card aur School ID ya Aadhaar Card lana anivarya hai.</li>
                        <li>Calculator, mobile phone aur electronic devices pariksha hall me le jana sakht mana hai.</li>
                        <li>OMR sheet bharne ke liye kewal Black ya Blue ballpoint pen ka prayog karein.</li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Signatures & Barcode footer */}
                <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-end text-xs">
                  <div className="text-center w-36">
                    <div className="h-10 flex items-center justify-center font-mono text-[10px] text-slate-400 italic">
                      [ Student Hastakshar ]
                    </div>
                    <div className="border-t border-slate-400 pt-1 font-bold text-slate-700 text-[10px]">
                      Student Ke Hastakshar
                    </div>
                  </div>

                  {/* Barcode & Verification */}
                  <div className="text-center">
                    <div className="font-mono text-xs tracking-widest bg-slate-100 px-3 py-1 border border-slate-300 rounded">
                      ||| | |||| || | ||||| |||| ||
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 block mt-0.5">
                      {student.registration_id} • {student.exam_details.roll_no}
                    </span>
                  </div>

                  <div className="text-center w-36">
                    <div className="h-10 flex items-center justify-center font-serif text-amber-900 font-bold text-xs italic">
                      Controller of Exams
                    </div>
                    <div className="border-t border-slate-400 pt-1 font-bold text-slate-700 text-[10px]">
                      Exam Controller (BSEDRC)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. APPLICATION FORM VIEW */}
            {docType === 'application_form' && (
              <div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-300 mb-6 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">Registration Ref</span>
                    <strong className="text-sm font-black text-slate-900 font-mono">{student.registration_id}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">Payment Status</span>
                    <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[11px]">
                      {student.payment_info.status === 'PAID' ? 'PAID / JAMA HO GAYA' : student.payment_info.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
                  <div className="sm:col-span-3">
                    <table className="w-full text-xs text-left border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="py-2 font-bold text-slate-600 w-36">Student Ka Naam:</td>
                          <td className="py-2 font-extrabold text-slate-900 uppercase">{student.personal_data.name}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-2 font-bold text-slate-600">Pita Ji Ka Naam:</td>
                          <td className="py-2 font-semibold text-slate-900">{student.personal_data.father_name}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-2 font-bold text-slate-600">Janam Tithi (DOB):</td>
                          <td className="py-2 text-slate-900 font-mono">{student.personal_data.dob}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-2 font-bold text-slate-600">Mobile / Sampark:</td>
                          <td className="py-2 text-slate-900">Contact details are not displayed in status lookup.</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-2 font-bold text-slate-600">School Ka Naam:</td>
                          <td className="py-2 text-slate-900 font-semibold">{student.school_data.school_name}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-2 font-bold text-slate-600">School U-DISE Code:</td>
                          <td className="py-2 text-slate-900 font-mono">{student.school_data.udise_code}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-2 font-bold text-slate-600">Jila Aur Block:</td>
                          <td className="py-2 text-slate-900">{student.school_data.block}, {student.school_data.district}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-2 font-bold text-slate-600">Pata (Address):</td>
                          <td className="py-2 text-slate-800">Address is not displayed in status lookup.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="sm:col-span-1 flex flex-col items-center">
                    <img
                      src={student.personal_data.photo_url}
                      alt="Student"
                      className="w-28 h-36 object-cover border-2 border-slate-900 rounded p-1"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 font-mono">Verified applicant</span>
                  </div>
                </div>

                {/* Custom Responses */}
                {student.personal_data.custom_responses && Object.keys(student.personal_data.custom_responses).length > 0 && (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 text-xs">
                    <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-2">Aavedan ke Any Javab (Custom Fields)</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(student.personal_data.custom_responses).map(([key, val]) => (
                        <div key={key} className="bg-white p-2 border rounded">
                          <span className="text-[10px] text-slate-500 block">{key}</span>
                          <strong className="text-slate-900">{String(val)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3 bg-emerald-50 rounded border border-emerald-300 text-xs text-emerald-900 flex items-center justify-between mb-6">
                  <div>
                    <span className="font-bold block">Fees Bhugtan Raseed (Payment Receipt):</span>
                    <span>Payment status: {student.payment_info.status}</span>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-800">Status lookup</span>
                </div>
              </div>
            )}

            {/* 3. MARKSHEET & CERTIFICATE VIEW */}
            {docType === 'marksheet' && (
              <div>
                <div className="bg-gradient-to-r from-amber-50 to-amber-100/60 p-4 rounded-lg border border-amber-300 mb-6 text-xs">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-amber-900 font-black text-sm uppercase tracking-wider block">
                        Official Parikshaphal Card (Marksheet)
                      </span>
                      <p className="text-slate-600 text-[11px]">
                        Roll No: <strong className="text-slate-900 font-mono">{student.exam_details.roll_no}</strong> • Reg ID: <strong className="text-slate-900 font-mono">{student.registration_id}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full font-black text-xs ${
                        student.result_details.status === 'PASS' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {student.result_details.status === 'PASS' ? 'QUALIFIED / UTTIRNA' : 'NEEDS IMPROVEMENT / PUNAH PRAYAS'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Candidate info snippet */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-6 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Student Ka Naam</span>
                    <strong className="text-slate-900 uppercase font-bold">{student.personal_data.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Pita Ka Naam</span>
                    <strong className="text-slate-900">{student.personal_data.father_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">School & UDISE</span>
                    <strong className="text-slate-900 truncate block">{student.school_data.school_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Kaksha / Category</span>
                    <strong className="text-slate-900">Class {student.school_data.current_class} ({student.personal_data.category})</strong>
                  </div>
                </div>

                {/* Subject Mark Breakdown Table */}
                <table className="w-full text-xs border border-slate-300 rounded mb-6">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      <th className="py-2 px-3 text-left">Vishay / Subject</th>
                      <th className="py-2 px-3 text-center">Kul Ank (Max)</th>
                      <th className="py-2 px-3 text-center">Praptank (Obtained)</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {student.result_details.subject_breakup?.map((subj, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-800">{subj.subject}</td>
                        <td className="py-2 px-3 text-center font-mono">{subj.max_marks}</td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">{subj.marks}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="text-emerald-700 font-semibold text-[11px]">Pass</span>
                        </td>
                      </tr>
                    )) || (
                      <>
                        <tr className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-semibold text-slate-800">Ganit (Mathematics & Quantitative)</td>
                          <td className="py-2 px-3 text-center font-mono">30</td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">28</td>
                          <td className="py-2 px-3 text-center text-emerald-700 font-semibold">Pass</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-semibold text-slate-800">Vigyan (General Science)</td>
                          <td className="py-2 px-3 text-center font-mono">30</td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">27</td>
                          <td className="py-2 px-3 text-center text-emerald-700 font-semibold">Pass</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-semibold text-slate-800">Mansik Yogyata (Mental Ability & Reasoning)</td>
                          <td className="py-2 px-3 text-center font-mono">20</td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">19</td>
                          <td className="py-2 px-3 text-center text-emerald-700 font-semibold">Pass</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-semibold text-slate-800">Samanya Gyan (GK & Current Affairs)</td>
                          <td className="py-2 px-3 text-center font-mono">20</td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">14</td>
                          <td className="py-2 px-3 text-center text-emerald-700 font-semibold">Pass</td>
                        </tr>
                      </>
                    )}
                    <tr className="bg-amber-50/80 font-black border-t-2 border-slate-900">
                      <td className="py-2 px-3 text-slate-900 uppercase">Kul Praptank (Grand Total)</td>
                      <td className="py-2 px-3 text-center font-mono">100</td>
                      <td className="py-2 px-3 text-center font-mono text-amber-900 text-sm">
                        {student.result_details.marks_obtained || 88}
                      </td>
                      <td className="py-2 px-3 text-center text-emerald-800 font-bold">
                        Grade: {student.result_details.grade || 'A+'}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Score Summary Metrics */}
                <div className="grid grid-cols-3 gap-3 bg-slate-900 text-white p-3 rounded-lg text-center mb-6">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Kul Pratishat (Percentage)</span>
                    <strong className="text-lg font-black text-amber-400 font-mono">
                      {student.result_details.percentage || '88.0'}%
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Nirdharit Grade</span>
                    <strong className="text-lg font-black text-white">
                      {student.result_details.grade || 'A+'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Rajya / Jila Rank</span>
                    <strong className="text-lg font-black text-emerald-400 font-mono">
                      #{student.result_details.rank || 4}
                    </strong>
                  </div>
                </div>

                {/* Authority Signature */}
                <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-end text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono">Result Ghoshit Tithi: {form?.result_status?.declare_date || '2026-08-30'}</span>
                    <p className="text-[9px] text-slate-400">Authenticity verification key: BSEDRC-RESULT-{student.registration_id}</p>
                  </div>
                  <div className="text-center w-36">
                    <div className="h-8 flex items-center justify-center font-serif text-slate-900 font-bold text-xs italic">
                      M. Prasad (IAS Retd.)
                    </div>
                    <div className="border-t border-slate-400 pt-1 font-bold text-slate-700 text-[10px]">
                      Director of Evaluation
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Print Footer Note */}
            <div className="mt-6 pt-3 border-t border-dashed border-slate-300 text-center text-[10px] text-slate-400 font-mono">
              Bihar State Educational Development and Research Council (BSEDRC) • Official State Examination Copy • Issued on {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
