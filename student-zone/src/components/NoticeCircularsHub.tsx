import React, { useState, useEffect } from 'react';
import {
  Bell,
  FileText,
  Download,
  Search,
  Calendar,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Award,
  BookOpen,
  Printer,
  Building2,
  CheckCircle2,
  X
} from 'lucide-react';
import { NoticeCircular, Language } from '../types';
import { api } from '../services/api';
import { INITIAL_NOTICES } from '../data/initialData';

interface NoticeCircularsHubProps {
  lang?: Language;
  onNavigateToTab?: (tab: string) => void;
}

export const NoticeCircularsHub: React.FC<NoticeCircularsHubProps> = ({
  lang = 'hi',
  onNavigateToTab
}) => {
  const [notices, setNotices] = useState<NoticeCircular[]>(INITIAL_NOTICES);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNotice, setSelectedNotice] = useState<NoticeCircular | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, [selectedCategory]);

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      const res = await api.getNotices({
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        q: searchQuery || undefined
      });
      if (res.success && res.notices) {
        setNotices(res.notices);
      }
    } catch (e) {
      console.warn('Using local notices fallback', e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotices = notices.filter(n => {
    if (selectedCategory !== 'ALL' && n.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        n.title_hi.toLowerCase().includes(q) ||
        n.title_en.toLowerCase().includes(q) ||
        n.notice_no.toLowerCase().includes(q) ||
        n.summary_hi.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories = [
    { key: 'ALL', label_hi: 'सभी सूचनाएं (All)', label_en: 'All Notices', count: notices.length },
    { key: 'EXAM', label_hi: 'परीक्षा एवं प्रवेश पत्र', label_en: 'Exam & Admit Card', icon: Calendar },
    { key: 'SCHOLARSHIP', label_hi: 'छात्रवृत्ति एवं मेधा', label_en: 'Scholarship Grants', icon: Award },
    { key: 'AFFILIATION', label_hi: 'U-DISE एवं मान्यता', label_en: 'School Affiliation', icon: Building2 },
    { key: 'GUIDELINES', label_hi: 'दिशानिर्देश व सुधार', label_en: 'Rules & Grievance', icon: BookOpen },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              {lang === 'hi' ? 'राजकीय अधिसूचना एवं प्रेस विज्ञप्ति प्रकोष्ठ' : 'Official Council Circulars & Press Desk'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {lang === 'hi' ? 'परिषद आधिकारिक सूचना पट्ट व सर्कुलर' : 'BSEDRC Official Notice Board & Notifications'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              {lang === 'hi'
                ? 'बिहार राज्य शैक्षिक विकास एवं अनुसंधान परिषद द्वारा जारी नवीनतम परीक्षा कार्यक्रम, छात्रवृत्ति नियमावली, प्रवेश पत्र सूचना एवं विभागीय आदेश।'
                : 'Latest exam schedules, scholarship allocation directives, admit card releases, and departmental gazette circulars published by BSEDRC.'}
            </p>
          </div>

          <div className="hidden">
            <button
              id="notice-hero-correction-btn"
              onClick={() => onNavigateToTab && onNavigateToTab('helpdesk')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{lang === 'hi' ? 'ऑनलाइन सुधार पोर्टल' : 'Correction Window'}</span>
            </button>
            <button
              id="notice-hero-verify-btn"
              onClick={() => onNavigateToTab && onNavigateToTab('verify-doc')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'hi' ? 'दस्तावेज सत्यापन' : 'Verify Certificate'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Category filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.key}
              id={`notice-cat-${cat.key.toLowerCase()}`}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-slate-950 text-amber-300 font-bold shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.icon && <cat.icon className="w-3.5 h-3.5" />}
              <span>{lang === 'hi' ? cat.label_hi : cat.label_en}</span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="notice-search-input"
            type="text"
            placeholder={lang === 'hi' ? 'सूचना संख्या या शीर्षक से खोजें...' : 'Search circulars by keyword or number...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Notices Feed */}
      <div className="grid grid-cols-1 gap-4">
        {filteredNotices.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700">
              {lang === 'hi' ? 'कोई सूचना उपलब्ध नहीं मिली' : 'No Circulars Found'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'hi' ? 'कृपया अपनी खोज अथवा श्रेणी बदल कर पुनः प्रयास करें।' : 'Try clearing your search query or selecting a different category.'}
            </p>
          </div>
        ) : (
          filteredNotices.map((notice) => (
            <div
              key={notice.id}
              id={`notice-card-${notice.id}`}
              className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${
                notice.is_urgent ? 'border-amber-400 bg-amber-50/20 shadow-sm' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {notice.is_urgent && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        {lang === 'hi' ? 'अति महत्वपूर्ण / URGENT' : 'URGENT CIRCULAR'}
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px] font-bold">
                      {notice.notice_no}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {notice.publish_date}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {lang === 'hi' ? notice.title_hi : notice.title_en}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {lang === 'hi' ? notice.summary_hi : notice.summary_en}
                  </p>

                  <div className="pt-1 flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {notice.signed_by}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    id={`view-notice-btn-${notice.id}`}
                    onClick={() => setSelectedNotice(notice)}
                    className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'hi' ? 'पूर्ण विज्ञप्ति देखें' : 'Read Full Notice'}</span>
                  </button>
                  <button
                    id={`download-notice-pdf-${notice.id}`}
                    onClick={() => setSelectedNotice(notice)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                    title={lang === 'hi' ? 'पीडीएफ प्रिंट करें' : 'Print Notice PDF'}
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Official Circular View Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="bg-slate-950 text-white p-4 sm:p-5 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    {lang === 'hi' ? 'आधिकारिक परिषद अधिसूचना पत्र' : 'Official Council Notification Letter'}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">{selectedNotice.notice_no}</p>
                </div>
              </div>
              <button
                id="close-notice-modal-btn"
                onClick={() => setSelectedNotice(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Gazette Layout Body */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Council Official Letterhead */}
              <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                <div className="inline-block px-3 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                  GOVERNMENT OF BIHAR • STATE STATUTORY COUNCIL
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
                  बिहार राज्य शैक्षिक विकास एवं अनुसंधान परिषद
                </h2>
                <h3 className="text-xs sm:text-sm font-bold text-slate-700 tracking-wide">
                  BIHAR STATE EDUCATIONAL DEVELOPMENT & RESEARCH COUNCIL (BSEDRC)
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  केन्द्रीय परीक्षा भवन, बेली रोड, पटना - 800001 • ईमेल: circulars@bsedrc.gov.in
                </p>
                <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-800 pt-3 border-t border-dashed border-slate-300 mt-2">
                  <span>पत्रांक / Ref: {selectedNotice.notice_no}</span>
                  <span>दिनांक / Date: {selectedNotice.publish_date}</span>
                </div>
              </div>

              {/* Title & Subject */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">
                  विषय / SUBJECT:
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                  {lang === 'hi' ? selectedNotice.title_hi : selectedNotice.title_en}
                </h4>
              </div>

              {/* Gazette Body Text */}
              <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-serif">
                <p className="text-justify">
                  {lang === 'hi' ? selectedNotice.content_hi : selectedNotice.content_en}
                </p>
                <p className="text-justify">
                  {lang === 'hi'
                    ? 'उक्त निर्णय परिषद के कार्यकारी बोर्ड की बैठक में लिए गए संकल्प के आधार पर जनहित एवं छात्र कल्याण हेतु तत्काल प्रभाव से लागू किया जाता है। सभी संबंधित पदाधिकारी एवं विद्यालय प्रधान इसका अनुपालन सुनिश्चित करें।'
                    : 'The above decision is implemented with immediate effect in accordance with the executive council resolution. All concerned institutional heads must ensure strict compliance.'}
                </p>
              </div>

              {/* Council Signature & Stamp Block */}
              <div className="pt-8 border-t border-slate-200 flex justify-between items-end">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-600/60 flex items-center justify-center p-1 bg-emerald-50/40 text-[9px] font-bold text-emerald-800 uppercase tracking-tighter">
                    ★ BSEDRC ★<br />OFFICIAL SEAL<br />PATNA
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="font-serif italic font-bold text-slate-800 text-sm">
                    {selectedNotice.signed_by}
                  </div>
                  <p className="text-[11px] font-mono text-slate-500">
                    आदेशानुसार / By Order of Secretary
                  </p>
                  <p className="text-[10px] text-slate-400">
                    BSEDRC Central Directorate, Bihar
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[11px] text-slate-500 font-mono">
                Document Hash: SHA256:BSEDRC-NOT-{selectedNotice.id}
              </span>
              <div className="flex items-center gap-2">
                <button
                  id="print-notice-window-btn"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-950 text-white font-bold text-xs flex items-center gap-2 hover:bg-slate-900 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'hi' ? 'प्रिंट / पीडीएफ' : 'Print Official Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
