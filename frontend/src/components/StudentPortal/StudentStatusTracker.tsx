import React, { useState, useEffect } from 'react';
import {
  Search,
  UserCheck,
  CheckCircle2,
  Lock,
  Download,
  Calendar,
  Award,
  FileText,
  Clock,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Printer,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Student, FormConfig } from '../../types';
import { api } from '../../services/api';
import { DocumentViewerModal } from './DocumentViewerModal';

interface StudentStatusTrackerProps {
  initialRegId?: string;
  forms: FormConfig[];
}

export const StudentStatusTracker: React.FC<StudentStatusTrackerProps> = ({
  initialRegId = '',
  forms,
}) => {
  const [regId, setRegId] = useState(initialRegId || 'BSEDRC-2026-8941');
  const [dob, setDob] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [lifecycleAccess, setLifecycleAccess] = useState<{
    form_download: boolean;
    admit_card_available: boolean;
    result_available: boolean;
    admit_card_release_date?: string | null;
    result_declare_date?: string | null;
  } | null>(null);

  // Document modal states
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [activeDocType, setActiveDocType] = useState<'admit_card' | 'application_form' | 'marksheet'>('admit_card');

  useEffect(() => {
    if (initialRegId) {
      setRegId(initialRegId);
      setDob('');
    }
  }, [initialRegId]);

  const performSearch = async (targetId: string, targetDob: string) => {
    if (!targetId.trim()) {
      setErrorMessage('Kripya apna Registration ID likhein');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await api.getStudentStatus(targetId.trim(), targetDob || undefined);
      if (res.success && res.student) {
        setStudentData(res.student);
        setFormConfig(res.form || null);
        setLifecycleAccess(res.lifecycle_access || null);
      } else {
        setStudentData(null);
        setErrorMessage(res.message || 'Iss Registration ID ka koi record nahi mila.');
      }
    } catch (e) {
      setErrorMessage('Server se connect karne me dikkat aayi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(regId, dob);
  };

  const openDocument = (type: 'admit_card' | 'application_form' | 'marksheet') => {
    setActiveDocType(type);
    setIsDocModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-6">
      {/* Search Header Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-8 border border-slate-200 shadow-sm mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-1">
              Student Status & Pariksha Portal
            </span>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900">
              Student Status, Admit Card Aur Result Tracker
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Apna Registration ID (jaise <code>BSEDRC-2026-8941</code>) aur Janam Tithi (DOB) daalkar status check karein.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              id="sample-reg-btn-1"
              type="button"
              onClick={() => {
                setRegId('BSEDRC-2026-8941');
                setDob('2008-08-15');
                performSearch('BSEDRC-2026-8941', '2008-08-15');
              }}
              className="flex-1 sm:flex-initial text-[11px] px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-center"
            >
              Demo: Rohan (Pass)
            </button>
            <button
              id="sample-reg-btn-2"
              type="button"
              onClick={() => {
                setRegId('BSEDRC-2026-8942');
                setDob('2008-04-12');
                performSearch('BSEDRC-2026-8942', '2008-04-12');
              }}
              className="flex-1 sm:flex-initial text-[11px] px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-center"
            >
              Demo: Pooja (Rank 1)
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Registration ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="search-reg-id-input"
                value={regId}
                onChange={(e) => setRegId(e.target.value)}
                placeholder="Jaise: BSEDRC-2026-8941"
                className="w-full pl-9 pr-3 py-2.5 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Janam Tithi / DOB <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="search-dob-input"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              id="submit-status-search-btn"
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 h-[40px]"
            >
              {isLoading ? (
                <span>Dhoondh rahe hain...</span>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Status Dekhein</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* STUDENT PROFILE & LIFECYCLE TIMELINE */}
      {studentData && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Top Profile Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <img
                src={studentData.personal_data.photo_url}
                alt={studentData.personal_data.name}
                className="w-16 h-20 object-cover rounded-xl border-2 border-slate-900 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">{studentData.personal_data.name}</h3>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300">
                    ADMITTED / SWEEKRIT
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Pita ji: <strong className="text-slate-800">{studentData.personal_data.father_name}</strong> • DOB: <span className="font-mono">{studentData.personal_data.dob}</span>
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {studentData.school_data.school_name} <span className="font-mono text-slate-500">({studentData.school_data.udise_code})</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-right w-full sm:w-auto">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Registration ID
              </span>
              <span className="font-mono text-base font-black text-slate-900 block">
                {studentData.registration_id}
              </span>
              <span className="text-[11px] text-slate-600 block mt-0.5">
                Roll No: <strong className="font-mono text-blue-800">{studentData.exam_details.roll_no || 'Jald jari hoga'}</strong>
              </span>
            </div>
          </div>

          {/* 4-STAGE LIFECYCLE VISUAL TIMELINE */}
          <div className="bg-white rounded-2xl p-4 sm:p-8 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Student Pariksha & Lifecycle Status Tracker
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* STAGE 1: Form Registration */}
              <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Stage 1</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">Form Jama Ho Gaya</h4>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Student profile aur U-DISE safalta-purvak map ho chuki hai.
                  </p>
                </div>
                <button
                  id="view-app-form-btn"
                  type="button"
                  onClick={() => openDocument('application_form')}
                  className="mt-4 w-full bg-white hover:bg-slate-50 text-slate-900 font-bold py-1.5 px-3 rounded-lg text-[11px] border border-slate-300 flex items-center justify-center gap-1 shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-700" />
                  <span>Aavedan Form Dekhein</span>
                </button>
              </div>

              {/* STAGE 2: Fee Payment */}
              <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Stage 2</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">Fee Payment Status</h4>
                  <p className="text-[11px] text-slate-600 mt-1 font-mono">
                    {studentData.payment_info.status}
                  </p>
                </div>
                <div className="mt-4 text-[10px] font-semibold text-emerald-800 bg-emerald-100/60 py-1.5 px-2 rounded text-center">
                  Payment Satyaapit (Verified)
                </div>
              </div>

              {/* STAGE 3: Admit Card Release */}
              <div className={`p-4 rounded-xl border-2 flex flex-col justify-between ${
                lifecycleAccess?.admit_card_available
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-300 bg-slate-50/80'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      lifecycleAccess?.admit_card_available ? 'text-emerald-800' : 'text-slate-500'
                    }`}>Stage 3</span>
                    {lifecycleAccess?.admit_card_available ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">E-Admit Card (Pravesh Patra)</h4>
                  <p className="text-[11px] text-slate-600 mt-1">
                    {lifecycleAccess?.admit_card_available
                      ? `Admit Card jari ho chuka hai (Roll: ${studentData.exam_details.roll_no})`
                      : 'Admin dwaara admit card release hona baki hai.'}
                  </p>
                </div>

                {lifecycleAccess?.admit_card_available ? (
                  <button
                    id="download-admit-card-btn"
                    type="button"
                    onClick={() => openDocument('admit_card')}
                    className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-1.5 px-3 rounded-lg text-[11px] flex items-center justify-center gap-1 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Admit Card Download Karein</span>
                  </button>
                ) : (
                  <div className="mt-4 text-[10px] text-slate-500 text-center py-1.5 bg-slate-200/60 rounded">
                    Abhi Jari Nahi Hua
                  </div>
                )}
              </div>

              {/* STAGE 4: Result & Marksheet */}
              <div className={`p-4 rounded-xl border-2 flex flex-col justify-between ${
                lifecycleAccess?.result_available
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-300 bg-slate-50/80'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      lifecycleAccess?.result_available ? 'text-emerald-800' : 'text-slate-500'
                    }`}>Stage 4</span>
                    {lifecycleAccess?.result_available ? (
                      <Award className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">Result & Marksheet (Parikshaphal)</h4>
                  <p className="text-[11px] text-slate-600 mt-1">
                    {lifecycleAccess?.result_available
                      ? `Result ghoshit: ${studentData.result_details.marks_obtained}/${studentData.result_details.total_marks} (${studentData.result_details.grade})`
                      : 'Parikshaphal ghoshna baki hai.'}
                  </p>
                </div>

                {lifecycleAccess?.result_available ? (
                  <button
                    id="view-marksheet-btn"
                    type="button"
                    onClick={() => openDocument('marksheet')}
                    className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-3 rounded-lg text-[11px] flex items-center justify-center gap-1 shadow-xs"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Marksheet Dekhein</span>
                  </button>
                ) : (
                  <div className="mt-4 text-[10px] text-slate-500 text-center py-1.5 bg-slate-200/60 rounded">
                    Result Ghoshit Hona Baki Hai
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Quick Exam Center & Venue Reminder */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  Pariksha Kendra (Exam Center) Jankari
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">
                  {studentData.exam_details.exam_center || 'Govt High School Central Hall'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span>Room No: <strong>{studentData.exam_details.room_no || 'Hall A'}</strong></span>
                  <span>•</span>
                  <span>Reporting Time: <strong className="text-amber-300">{studentData.exam_details.reporting_time || '09:15 AM'}</strong></span>
                </p>
              </div>

              <button
                id="view-all-docs-btn"
                type="button"
                onClick={() => openDocument('admit_card')}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print & Preview Kholein</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Document Viewer Modal */}
      {studentData && (
        <DocumentViewerModal
          isOpen={isDocModalOpen}
          onClose={() => setIsDocModalOpen(false)}
          student={studentData}
          form={formConfig || undefined}
          initialDocType={activeDocType}
        />
      )}
    </div>
  );
};
