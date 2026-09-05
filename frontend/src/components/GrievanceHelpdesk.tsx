import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  FileEdit,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Send,
  Sparkles,
  ShieldCheck,
  User,
  Phone,
  Calendar,
  Building2,
  RefreshCw,
  Check
} from 'lucide-react';
import { GrievanceTicket, Language, Student, AdminUser } from '../types';
import { api } from '../services/api';
import { INITIAL_GRIEVANCES } from '../data/initialData';

interface GrievanceHelpdeskProps {
  lang?: Language;
  adminUser?: AdminUser | null;
  onRefreshData?: () => void;
}

export const GrievanceHelpdesk: React.FC<GrievanceHelpdeskProps> = ({
  lang = 'hi',
  adminUser,
  onRefreshData,
}) => {
  const [grievances, setGrievances] = useState<GrievanceTicket[]>(INITIAL_GRIEVANCES);
  const [activeTab, setActiveTab] = useState<'submit' | 'track' | 'admin'>('submit');
  const [trackQuery, setTrackQuery] = useState('');
  const [trackedTickets, setTrackedTickets] = useState<GrievanceTicket[]>([]);

  // Form State
  const [regId, setRegId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [mobile, setMobile] = useState('');
  const [issueCategory, setIssueCategory] = useState<GrievanceTicket['issue_category']>('NAME_CORRECTION');
  const [description, setDescription] = useState('');
  const [requestedChanges, setRequestedChanges] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<GrievanceTicket | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    try {
      const res = await api.getGrievances();
      if (res.success && res.grievances) {
        setGrievances(res.grievances);
      }
    } catch (e) {
      console.warn('Grievance fetch error', e);
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;

    try {
      const res = await api.getGrievances({ reg_id: trackQuery.trim() });
      if (res.success && res.grievances) {
        setTrackedTickets(res.grievances);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSubmitGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regId || !studentName || !description) {
      setSubmitError(lang === 'hi' ? 'कृपया सभी अनिवार्य विवरण भरें।' : 'Please fill all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      const res = await api.submitGrievance({
        registration_id: regId.trim().toUpperCase(),
        student_name: studentName.trim(),
        father_name: fatherName.trim(),
        mobile: mobile.trim(),
        issue_category: issueCategory,
        description: description.trim(),
        requested_changes: requestedChanges.trim() || description.trim(),
      });

      if (res.success && res.ticket) {
        setSubmissionSuccess(res.ticket);
        setGrievances((prev) => [res.ticket!, ...prev]);
        // Reset form
        setRegId('');
        setStudentName('');
        setFatherName('');
        setMobile('');
        setDescription('');
        setRequestedChanges('');
      } else {
        setSubmitError(res.error || 'Submission failed');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminUpdateStatus = async (ticketId: string, newStatus: GrievanceTicket['status']) => {
    const remarks = prompt(
      lang === 'hi' ? 'सत्यापन अधिकारी की टिप्पणी (Officer Remarks) दर्ज करें:' : 'Enter officer remarks for this ticket:',
      newStatus === 'APPROVED' ? 'Approved after Aadhaar & school records verification.' : 'Reviewed by council officer.'
    );
    if (remarks === null) return;

    try {
      const res = await api.updateGrievance(ticketId, {
        status: newStatus,
        admin_remarks: remarks,
      });

      if (res.success) {
        fetchGrievances();
        if (onRefreshData) onRefreshData();
      }
    } catch (e) {
      alert('Failed to update ticket');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <HelpCircle className="w-3.5 h-3.5" />
              {lang === 'hi' ? 'छात्र सहायता एवं त्रुटि सुधार प्रकोष्ठ' : 'Online Correction Window & Helpdesk'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {lang === 'hi' ? 'ऑनलाइन आवेदन सुधार एवं ग्रीवांस पोर्टल' : 'Student Correction & Grievance Redressal'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              {lang === 'hi'
                ? 'नाम की वर्तनी, जन्म तिथि, विद्यालय नाम अथवा फोटो में संशोधन हेतु 24x7 ऑनलाइन टोकन दर्ज करें।'
                : 'Raise official rectification requests for candidate details, spelling corrections, DOB adjustments, or admit card inquiries.'}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              id="tab-submit-grievance"
              onClick={() => setActiveTab('submit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'submit' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {lang === 'hi' ? 'नया सुधार अनुरोध दर्ज करें' : 'Raise New Request'}
            </button>
            <button
              id="tab-track-grievance"
              onClick={() => setActiveTab('track')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'track' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {lang === 'hi' ? 'स्थिति ट्रैक करें' : 'Track Status'}
            </button>
            {adminUser && (
              <button
                id="tab-admin-grievance"
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'admin' ? 'bg-emerald-500 text-slate-950 shadow' : 'bg-slate-800 text-emerald-300 hover:text-white'
                }`}
              >
                {lang === 'hi' ? 'अधिकारी निवारण पंजिका' : 'Officer Redressal Queue'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {submissionSuccess && (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-6 shadow-lg animate-in zoom-in-95 duration-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-base font-black text-emerald-950">
                {lang === 'hi' ? 'सुधार अनुरोध सफलतापूर्वक दर्ज कर लिया गया है!' : 'Correction Request Submitted Successfully!'}
              </h3>
              <p className="text-xs text-emerald-800">
                {lang === 'hi'
                  ? 'आपका टोकन संख्या' : 'Your Grievance Token ID is'}:{' '}
                <strong className="font-mono text-sm bg-emerald-100 px-2 py-0.5 rounded text-emerald-950">{submissionSuccess.ticket_id}</strong>
              </p>
              <p className="text-xs text-slate-600 mt-2">
                {lang === 'hi'
                  ? 'परिषद के सत्यापन अधिकारी द्वारा 24-48 कार्य घंटों के भीतर अभिलेखों का सत्यापन कर संशोधन लागू कर दिया जाएगा।'
                  : 'The Verification Officer will review the request and apply required changes within 24-48 working hours.'}
              </p>
            </div>
            <button
              onClick={() => setSubmissionSuccess(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: SUBMIT NEW GRIEVANCE */}
      {activeTab === 'submit' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-3xl mx-auto">
          <div className="border-b border-slate-200 pb-4 mb-6">
            <h2 className="text-lg font-black text-slate-900">
              {lang === 'hi' ? 'ऑनलाइन आवेदन पत्र संशोधन प्रपत्र' : 'Online Candidate Rectification Form'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'hi'
                ? 'कृपया अपने फॉर्म का रजिस्ट्रेशन नंबर और सही विवरण सावधानीपूर्वक दर्ज करें।'
                : 'Enter your registration details and specify the exact corrections required.'}
            </p>
          </div>

          <form onSubmit={handleSubmitGrievance} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? 'रजिस्ट्रेशन नंबर *' : 'Registration ID *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BSEDRC-2026-8941"
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 uppercase focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? 'संशोधन की श्रेणी *' : 'Correction Category *'}
                </label>
                <select
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="NAME_CORRECTION">📝 नाम / वर्तनी सुधार (Candidate / Father Name)</option>
                  <option value="DOB_CORRECTION">📅 जन्म तिथि संशोधन (Date of Birth)</option>
                  <option value="PHOTO_UPDATE">🖼️ फोटो / हस्ताक्षर पुनः अपलोड (Photo Re-sync)</option>
                  <option value="SCHOOL_CHANGE">🏫 विद्यालय / U-DISE कोड परिवर्तन</option>
                  <option value="PAYMENT_ISSUE">💳 पेमेंट या शुल्क रसीद संबंधी समस्या</option>
                  <option value="ADMIT_CARD_ISSUE">🎫 प्रवेश पत्र / परीक्षा केंद्र संबंधी विषय</option>
                  <option value="OTHER">❓ अन्य पूछताछ / सहायता</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? 'परीक्षार्थी का नाम *' : 'Student Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Student Name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? 'पिता का नाम' : 'Father Name'}
                </label>
                <input
                  type="text"
                  placeholder="Father Name"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? 'मोबाइल नंबर *' : 'Mobile No *'}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit Mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'hi' ? 'क्या सुधार करवाना चाहते हैं? (सटीक विवरण लिखें) *' : 'Exact Requested Corrections *'}
              </label>
              <textarea
                required
                rows={3}
                placeholder={lang === 'hi' ? 'जैसे: मेरे पिता जी का नाम मनोज शर्मा के स्थान पर मनोज कुमार शर्मा किया जाए।' : 'Specify the exact corrected text or changes required...'}
                value={requestedChanges}
                onChange={(e) => setRequestedChanges(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'hi' ? 'समस्या का कारण / विवरण' : 'Description / Reason'}
              </label>
              <textarea
                rows={2}
                placeholder={lang === 'hi' ? 'आवेदन भरते समय टाइपिंग त्रुटि हो गई थी।' : 'Provide any additional context or reference details...'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {submitError && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
                {submitError}
              </p>
            )}

            <button
              id="submit-grievance-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? (lang === 'hi' ? 'अनुरोध भेजा जा रहा है...' : 'Submitting Request...') : (lang === 'hi' ? 'सुधार टोकन सबमिट करें' : 'Submit Correction Ticket')}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: TRACK STATUS */}
      {activeTab === 'track' && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <form onSubmit={handleTrackSubmit} className="flex gap-3">
              <input
                type="text"
                required
                placeholder="Registration ID (e.g. BSEDRC-2026-8941)"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-slate-950 hover:bg-slate-900 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'खोजें' : 'Track'}</span>
              </button>
            </form>
          </div>

          {/* Ticket list */}
          <div className="space-y-3">
            {(trackedTickets.length > 0 ? trackedTickets : grievances).map((t) => (
              <div key={t.ticket_id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {t.ticket_id}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900 mt-1">{t.student_name}</h4>
                    <p className="text-xs text-slate-500 font-mono">Reg: {t.registration_id}</p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      t.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : t.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : t.status === 'UNDER_REVIEW'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <p className="font-semibold text-slate-800">Requested Correction:</p>
                  <p className="text-slate-600 font-medium">{t.requested_changes}</p>
                </div>

                {t.admin_remarks && (
                  <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 text-xs">
                    <span className="font-bold text-emerald-900">Council Officer Remarks: </span>
                    <span className="text-emerald-800">{t.admin_remarks}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ADMIN QUEUE */}
      {activeTab === 'admin' && adminUser && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-950 text-white flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase tracking-wider text-amber-300">
              Council Officer Grievance Redressal Queue ({grievances.length} Active Tickets)
            </h3>
            <button
              onClick={fetchGrievances}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {grievances.map((ticket) => (
              <div key={ticket.ticket_id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {ticket.ticket_id}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[11px] font-semibold">
                      {ticket.issue_category}
                    </span>
                    <span className="text-xs text-slate-400">{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">
                    {ticket.student_name} (Reg: {ticket.registration_id})
                  </h4>

                  <p className="text-xs text-slate-700">
                    <strong>Changes:</strong> {ticket.requested_changes}
                  </p>

                  {ticket.admin_remarks && (
                    <p className="text-[11px] text-emerald-800 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                      <strong>Remarks:</strong> {ticket.admin_remarks}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleAdminUpdateStatus(ticket.ticket_id, 'APPROVED')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleAdminUpdateStatus(ticket.ticket_id, 'UNDER_REVIEW')}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Review</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
