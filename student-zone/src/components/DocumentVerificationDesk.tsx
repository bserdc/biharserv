import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  QrCode,
  Printer,
  Calendar,
  Building2,
  User,
  GraduationCap,
  Sparkles,
  FileCheck2,
  Lock,
  ExternalLink,
  Award
} from 'lucide-react';
import { VerificationResult, Language } from '../types';
import { api } from '../services/api';

interface DocumentVerificationDeskProps {
  lang?: Language;
}

export const DocumentVerificationDesk: React.FC<DocumentVerificationDeskProps> = ({ lang = 'hi' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setErrorMsg(lang === 'hi' ? 'कृपया रजिस्ट्रेशन आईडी अथवा रोल नंबर दर्ज करें' : 'Please enter Registration ID or Roll Number');
      return;
    }

    try {
      setIsSearching(true);
      setErrorMsg(null);
      setVerificationResult(null);

      const res = await api.verifyDocumentLookup(searchQuery.trim());
      if (res.success && res.verification) {
        setVerificationResult(res.verification);
      } else {
        setErrorMsg(res.error || (lang === 'hi' ? 'कोई प्रामाणिक परिषद रिकॉर्ड नहीं मिला।' : 'No authentic council record found for this identifier.'));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification lookup failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickLookup = (id: string) => {
    setSearchQuery(id);
    api.verifyDocumentLookup(id).then((res) => {
      if (res.success && res.verification) {
        setVerificationResult(res.verification);
        setErrorMsg(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {lang === 'hi' ? 'परिषद केंद्रीय दस्तावेज प्रमाणीकरण प्रकोष्ठ' : 'BSEDRC Central Document & QR Verification'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {lang === 'hi' ? 'ऑनलाइन अंकपत्र, प्रवेश पत्र व प्रमाण-पत्र सत्यापन' : 'Digital Marksheet, Admit Card & Certificate Validator'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              {lang === 'hi'
                ? 'नियोक्ताओं, शिक्षण संस्थानों एवं अभिभावकों हेतु आधिकारिक परिषद रिकॉर्ड से तुरंत सुरक्षित एवं क्रिप्टोग्राफिक सत्यापन।'
                : 'Instantly verify the genuineness of BSEDRC Admit Cards, Results, and Merit Certificates against the master state register.'}
            </p>
          </div>
        </div>
      </div>

      {/* Verification Search Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
        <form onSubmit={handleVerify} className="max-w-2xl mx-auto space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 text-center">
            {lang === 'hi' ? 'रजिस्ट्रेशन नंबर / रोल नंबर / सर्टिफिकेट कोड दर्ज करें:' : 'Enter Registration ID, Roll No, or Certificate Hash:'}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <QrCode className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="doc-verify-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. BSEDRC-2026-8941 or 100245"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
              />
            </div>
            <button
              id="doc-verify-submit-btn"
              type="submit"
              disabled={isSearching}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{isSearching ? (lang === 'hi' ? 'सत्यापन जारी...' : 'Verifying...') : (lang === 'hi' ? 'सत्यापित करें' : 'Verify Authenticity')}</span>
            </button>
          </div>

          {/* Quick Demo Test Chips */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span className="font-semibold">{lang === 'hi' ? 'त्वरित टेस्ट कोड:' : 'Quick Sample IDs:'}</span>
            <button
              type="button"
              onClick={() => handleQuickLookup('BSEDRC-2026-8941')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] font-bold border border-slate-200"
            >
              BSEDRC-2026-8941 (Topper)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLookup('100246')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] font-bold border border-slate-200"
            >
              Roll: 100246
            </button>
            <button
              type="button"
              onClick={() => handleQuickLookup('BSEDRC-2026-8944')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] font-bold border border-slate-200"
            >
              BSEDRC-2026-8944
            </button>
          </div>
        </form>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-5 text-center flex items-center justify-center gap-3 animate-in fade-in">
          <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
          <div className="text-left">
            <h4 className="font-bold text-sm">{lang === 'hi' ? 'सत्यापन विफल (Unverified)' : 'Verification Failed'}</h4>
            <p className="text-xs text-rose-700">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Successful Verification Result Card */}
      {verificationResult && verificationResult.student && (
        <div className="bg-white rounded-3xl border-2 border-emerald-500 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Authentic Banner */}
          <div className="bg-emerald-600 text-white p-4 px-6 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-wide">
                  {lang === 'hi' ? 'प्रामाणिक परिषद दस्तावेज (AUTHENTIC RECORD)' : 'OFFICIALLY VERIFIED & AUTHENTIC'}
                </h3>
                <p className="text-[11px] text-emerald-100 font-mono">
                  Verification Code: {verificationResult.verification_code} • Verified at {new Date(verificationResult.verified_at).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'hi' ? 'सत्यापन पर्ची प्रिंट करें' : 'Print Verification Slip'}</span>
            </button>
          </div>

          {/* Verification Details */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Student & Council Match Grid */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-200">
              <div className="w-28 h-32 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-300 shadow-sm shrink-0">
                <img
                  src={verificationResult.student.personal_data.photo_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'}
                  alt={verificationResult.student.personal_data.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2 flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    Official Record Match: 100%
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono text-[11px] font-bold">
                    Reg: {verificationResult.student.registration_id}
                  </span>
                  {verificationResult.student.exam_details.roll_no && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[11px] font-bold">
                      Roll: {verificationResult.student.exam_details.roll_no}
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                  {verificationResult.student.personal_data.name}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  <div>
                    <span className="text-slate-500">{lang === 'hi' ? 'पिता का नाम:' : 'Father:'} </span>
                    <strong className="text-slate-900">{verificationResult.student.personal_data.father_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">{lang === 'hi' ? 'जन्म तिथि:' : 'DOB:'} </span>
                    <strong className="text-slate-900 font-mono">{verificationResult.student.personal_data.dob}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">{lang === 'hi' ? 'विद्यालय:' : 'School:'} </span>
                    <strong className="text-slate-900">{verificationResult.student.school_data.school_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">{lang === 'hi' ? 'जिला:' : 'District:'} </span>
                    <strong className="text-slate-900">{verificationResult.student.school_data.district}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic & Examination Result Details */}
            {verificationResult.student.result_details.marks_obtained !== undefined ? (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                    {lang === 'hi' ? 'प्रामाणिक परीक्षा परिणाम एवं रैंक' : 'Official Verified Exam Score & Rank'}
                  </h4>
                  <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs">
                    RESULT: {verificationResult.student.result_details.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Marks Scored</span>
                    <p className="text-lg font-black text-slate-950">{verificationResult.student.result_details.marks_obtained}/100</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Percentage</span>
                    <p className="text-lg font-black text-emerald-700">{verificationResult.student.result_details.percentage}%</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">State Rank</span>
                    <p className="text-lg font-black text-amber-600">#{verificationResult.student.result_details.rank || 1}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Grade</span>
                    <p className="text-lg font-black text-slate-900">{verificationResult.student.result_details.grade || 'A+'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-amber-900">
                    {lang === 'hi' ? 'प्रवेश पत्र (Hall Ticket) सत्यापित' : 'Hall Ticket / Admit Card Verified'}
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Exam Center: {verificationResult.student.exam_details.exam_center || 'Govt High School Central Hall'} • Room {verificationResult.student.exam_details.room_no || '101'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs">
                  Active Admit Card
                </span>
              </div>
            )}

            {/* Cryptographic Seal */}
            <div className="bg-slate-950 text-slate-300 p-4 rounded-2xl border border-slate-800 text-xs font-mono flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="text-amber-400 font-bold">Council Integrity Hash:</span>
                <p className="text-[11px] text-slate-400 truncate max-w-xl">{verificationResult.council_signature_hash}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  BSEDRC Tamper-Proof Seal
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
