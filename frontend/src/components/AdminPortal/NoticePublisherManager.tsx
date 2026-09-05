import React, { useState, useEffect } from 'react';
import {
  Bell,
  PlusCircle,
  FileText,
  Trash2,
  Eye,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Award,
  Building2,
  BookOpen,
  Sparkles,
  Send,
  X,
  Printer,
  Search,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Copy,
  Clock,
  Layers
} from 'lucide-react';
import { NoticeCircular, AdminUser } from '../../types';
import { api } from '../../services/api';
import { INITIAL_NOTICES } from '../../data/initialData';

interface NoticePublisherManagerProps {
  adminUser: AdminUser | null;
  onNavigateToPublicNotices?: () => void;
}

export const NoticePublisherManager: React.FC<NoticePublisherManagerProps> = ({
  adminUser,
  onNavigateToPublicNotices
}) => {
  const [notices, setNotices] = useState<NoticeCircular[]>(INITIAL_NOTICES);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isComposing, setIsComposing] = useState(false);
  const [selectedNoticeForPreview, setSelectedNoticeForPreview] = useState<NoticeCircular | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Notice Form State
  const defaultNoticeNo = `BSEDRC/NOTICE/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`;
  const [formData, setFormData] = useState<Partial<NoticeCircular>>({
    notice_no: defaultNoticeNo,
    category: 'EXAM',
    publish_date: new Date().toISOString().slice(0, 10),
    is_urgent: true,
    title_hi: '',
    title_en: '',
    summary_hi: '',
    summary_en: '',
    content_hi: '',
    content_en: '',
    signed_by: 'परीक्षा नियंत्रक (Controller of Examinations), BSEDRC, पटना',
    pdf_filename: `BSEDRC_Circular_${new Date().getFullYear()}_${Math.floor(100 + Math.random() * 900)}.pdf`
  });

  const [previewTab, setPreviewTab] = useState<'form' | 'gazette_preview'>('form');

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      const res = await api.getNotices();
      if (res.success && res.notices) {
        setNotices(res.notices);
      }
    } catch (e) {
      console.warn('Fallback to local notices list', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Official Templates
  const applyTemplate = (templateType: 'EXAM_ADMIT' | 'RESULT_MERIT' | 'SCHOLARSHIP' | 'CORRECTION') => {
    const year = new Date().getFullYear();
    if (templateType === 'EXAM_ADMIT') {
      setFormData({
        notice_no: `BSEDRC/EXAM/${year}/${Math.floor(100 + Math.random() * 900)}`,
        category: 'EXAM',
        publish_date: new Date().toISOString().slice(0, 10),
        is_urgent: true,
        title_hi: `वार्षिक राज्य स्तरीय मेधा छात्रवृत्ति परीक्षा ${year}: परीक्षा कार्यक्रम एवं प्रवेश पत्र (Admit Card) जारी`,
        title_en: `Annual State Merit Talent Scholarship Exam ${year}: Schedule & Admit Card Released`,
        summary_hi: `परिषद द्वारा परीक्षा 15 सितंबर को राज्य के सभी जिला केंद्रों पर आयोजित होगी। अभ्यर्थी अपने रजिस्ट्रेशन नंबर और जन्म तिथि से तुरंत प्रवेश पत्र डाउनलोड करें।`,
        summary_en: `Council will conduct the statewide scholarship exam on 15 September. Candidates can download authenticated admit cards online using Reg ID and DOB.`,
        content_hi: `सर्वसाधारण एवं पंजीकृत छात्र-छात्राओं को सूचित किया जाता है कि बिहार राज्य शैक्षिक विकास एवं अनुसंधान परिषद (BSEDRC) द्वारा सत्र ${year} की राज्य प्रतिभा खोज छात्रवृत्ति परीक्षा 15 सितंबर ${year} (रविवार) को पूर्व-निर्धारित जिला परीक्षा केंद्रों पर पूर्वाहन 10:00 बजे से मध्याह्न 12:30 बजे तक आयोजित की जाएगी। सभी अभ्यर्थी पोर्टल के 'Track Status / Admit Card' विकल्प से अपना कलरफुल प्रवेश पत्र डाउनलोड कर प्रिंट निकाल लें। परीक्षा केंद्र पर प्रवेश पत्र के साथ आधार कार्ड लाना अनिवार्य है।`,
        content_en: `Notice is hereby given that the Bihar State Talent Search Scholarship Exam will be held on 15 September across all district nodal centers. Candidates must download their verified Hall Ticket from the official portal.`,
        signed_by: 'परीक्षा नियंत्रक (Controller of Examinations), BSEDRC, पटना',
        pdf_filename: `BSEDRC_Circular_AdmitCard_Schedule_${year}.pdf`
      });
    } else if (templateType === 'RESULT_MERIT') {
      setFormData({
        notice_no: `BSEDRC/RESULT/${year}/${Math.floor(100 + Math.random() * 900)}`,
        category: 'RESULT',
        publish_date: new Date().toISOString().slice(0, 10),
        is_urgent: true,
        title_hi: `राज्य स्तरीय प्रतिभा खोज परीक्षा ${year} का परीक्षा परिणाम एवं मेरिट गजट राजपत्र घोषित`,
        title_en: `State Talent Search Exam ${year} Official Result & Merit Gazette Declared`,
        summary_hi: `राज्य के समस्त जिलों का मेरिट लिस्ट एवं मार्कशीट पोर्टल पर लाइव कर दिया गया है। छात्र अपनी अंकतालिका डिजिटल सत्यापन क्यूआर के साथ डाउनलोड कर सकते हैं।`,
        summary_en: `Statewide merit list and verified marksheets are now live. Students can verify scores and download official digitally signed marksheets with QR.`,
        content_hi: `बिहार राज्य शैक्षिक विकास एवं अनुसंधान परिषद द्वारा आयोजित परीक्षा का आधिकारिक परिणाम जारी कर दिया गया है। कुल 94% उत्तीर्ण अभ्यर्थियों को राज्य मेधा प्रमाण पत्र प्रदान किया जा रहा है। शीर्ष 500 रैंक धारकों को छात्रवृत्ति योजना के अंतर्गत सीधे बैंक खाते में वार्षिक अनुदान राशि प्रदान की जाएगी। छात्र पोर्टल पर अपना स्कोरकार्ड एवं अनंतिम प्रमाणपत्र डाउनलोड कर सकते हैं।`,
        content_en: `The official examination results and state ranking gazette have been published. Top qualifiers are eligible for the council annual merit disbursement.`,
        signed_by: 'निदेशक एवं परीक्षा बोर्ड (Director & Examination Board), BSEDRC',
        pdf_filename: `BSEDRC_Merit_Gazette_Result_${year}.pdf`
      });
    } else if (templateType === 'SCHOLARSHIP') {
      setFormData({
        notice_no: `BSEDRC/SCH/${year}/${Math.floor(100 + Math.random() * 900)}`,
        category: 'SCHOLARSHIP',
        publish_date: new Date().toISOString().slice(0, 10),
        is_urgent: false,
        title_hi: `मेधावी छात्र-छात्राओं हेतु वार्षिक छात्रवृत्ति राशि (₹12,000/वर्ष) एवं डीबीटी (DBT) बैंक खाता सत्यापन`,
        title_en: `Merit Scholarship Grant (₹12,000/yr) & Aadhaar DBT Bank Account Linking Directive`,
        summary_hi: `मेधा परीक्षा में सफल छात्रवृत्ति प्राप्तकर्ताओं को आधार लिंक बैंक खाते का विवरण परिषद पोर्टल पर 25 सितंबर तक अपलोड करने का निर्देश।`,
        summary_en: `Qualified scholarship beneficiaries must upload verified Aadhaar-linked bank account credentials by 25 September for grant transfer.`,
        content_hi: `परिषद के संकल्प पत्र के अंतर्गत सफल टॉप 500 विद्यार्थियों को अग्रिम अध्ययन हेतु प्रति माह ₹1,000 की दर से वार्षिक ₹12,000 छात्रवृत्ति सीधे उनके बैंक खाते में अंतरित की जाएगी। सभी छात्र अपने विद्यालय प्रधानाध्यापक से सत्यापित कराकर बैंक पासबुक की प्रति ऑनलाइन पोर्टल पर अपलोड करना सुनिश्चित करें।`,
        content_en: `Top rankers in the talent examination will receive monthly ₹1,000 direct bank transfer. Eligible students must update bank passbook copy through portal.`,
        signed_by: 'अपर सचिव (Scholarship & Welfare Cell), BSEDRC',
        pdf_filename: `BSEDRC_Scholarship_DBT_Guidelines_${year}.pdf`
      });
    } else if (templateType === 'CORRECTION') {
      setFormData({
        notice_no: `BSEDRC/GRIEVANCE/${year}/${Math.floor(100 + Math.random() * 900)}`,
        category: 'GUIDELINES',
        publish_date: new Date().toISOString().slice(0, 10),
        is_urgent: true,
        title_hi: `ऑनलाइन छात्र विवरण त्रुटि सुधार (Correction Window) की अंतिम तिथि विस्तार सूचना`,
        title_en: `Online Application Data Correction Window Deadline Extended Notice`,
        summary_hi: `अभ्यर्थियों के अनुरोध पर नाम, जन्म तिथि, विद्यालय एवं फोटो में संशोधन हेतु हेल्पडेस्क सुधार खिड़की 10 सितंबर तक खुली रहेगी।`,
        summary_en: `Online rectification window for spelling errors in Name, Father Name, DOB and Photo extended till 10th September.`,
        content_hi: `जिन अभ्यर्थियों के पंजीकरण प्रपत्र अथवा प्रवेश पत्र में नाम, पिता का नाम, लिंग, जाति श्रेणी अथवा जन्म तिथि में लिपिकीय त्रुटि रह गई है, वे परिषद के ऑनलाइन 'Helpdesk & Grievance' सेक्शन में टोकन दर्ज कर अपना सुधार करवा सकते हैं। सभी आवेदनों का निष्पादन 48 घंटे के भीतर परिषद के जांच दल द्वारा किया जाएगा।`,
        content_en: `Students with discrepancies in personal or school data can submit a support ticket via the Helpdesk module. Revisions are verified within 48 hours.`,
        signed_by: 'उप-परीक्षा नियंत्रक (Grievance Cell), BSEDRC',
        pdf_filename: `BSEDRC_Correction_Extension_Order_${year}.pdf`
      });
    }
    setIsComposing(true);
    setStatusMessage({ type: 'success', text: 'Template load ho gaya! Aap isme zaroori badlaav karke Publish kar sakte hain.' });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title_hi || !formData.notice_no) {
      setStatusMessage({ type: 'error', text: 'Kripya Notification Number aur Hindi Title zaroor bharein.' });
      return;
    }

    try {
      setIsLoading(true);
      const payload: Partial<NoticeCircular> = {
        ...formData,
        title_en: formData.title_en || formData.title_hi,
        summary_en: formData.summary_en || formData.summary_hi,
        content_en: formData.content_en || formData.content_hi,
        publish_date: formData.publish_date || new Date().toISOString().slice(0, 10),
      };

      const res = await api.createNotice(payload);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `बधाई! अधिसूचना क्रमांक '${payload.notice_no}' सफलतापूर्वक पोर्टल पर प्रकाशित (Publish) हो गई है। यह तुरंत सार्वजनिक नोटिस बोर्ड पर लाइव दिख रही है।`
        });
        setIsComposing(false);
        // Reset form
        setFormData({
          notice_no: `BSEDRC/NOTICE/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
          category: 'EXAM',
          publish_date: new Date().toISOString().slice(0, 10),
          is_urgent: false,
          title_hi: '',
          title_en: '',
          summary_hi: '',
          summary_en: '',
          content_hi: '',
          content_en: '',
          signed_by: 'परीक्षा नियंत्रक (Controller of Examinations), BSEDRC, पटना',
          pdf_filename: `BSEDRC_Circular_${new Date().getFullYear()}_${Math.floor(100 + Math.random() * 900)}.pdf`
        });
        await fetchNotices();
      } else {
        setStatusMessage({ type: 'error', text: 'Notification publish karne me truti hui.' });
      }
    } catch (e: any) {
      console.error(e);
      setStatusMessage({ type: 'error', text: 'Server error: Notification publish nahi ho saki.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNotice = async (id: string, noticeNo: string) => {
    const confirm = window.confirm(`Kya aap sach me notification '${noticeNo}' ko unpublish / delete karna chahte hain?`);
    if (!confirm) return;

    try {
      setIsLoading(true);
      const res = await api.deleteNotice(id);
      if (res.success) {
        setStatusMessage({ type: 'success', text: `Notification '${noticeNo}' safaltapoorvak hata di gayi.` });
        await fetchNotices();
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: 'Delete karne me truti hui.' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotices = notices.filter((n) => {
    if (categoryFilter !== 'ALL' && n.category !== categoryFilter) return false;
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

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'EXAM':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">परीक्षा (Exam)</span>;
      case 'ADMIT_CARD':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">प्रवेश पत्र (Admit Card)</span>;
      case 'RESULT':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">परिणाम (Result)</span>;
      case 'SCHOLARSHIP':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">छात्रवृत्ति (Scholarship)</span>;
      case 'AFFILIATION':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">मान्यता (U-DISE)</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">दिशानिर्देश (Guidelines)</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Officer Details & Stats */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/30">
            <Bell className="w-3.5 h-3.5" />
            <span>राजकीय अधिसूचना एवं सर्कुलर प्रकाशन प्रकोष्ठ (Notice Publisher)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            आधिकारिक अधिसूचना व प्रेस विज्ञप्ति प्रबंधन
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            यहाँ से परिषद के सभी आधिकारिक सर्कुलर, परीक्षा तिथि, प्रवेश पत्र, रिजल्ट विज्ञप्ति व दिशा-निर्देश तैयार करके तुरंत प्रकाशित (Publish) करें। प्रकाशित अधिसूचनाएँ तुरंत छात्र पोर्टल और मुख्य नोटिस बोर्ड पर लाइव हो जाती हैं।
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap gap-2.5 w-full lg:w-auto">
          <button
            id="create-new-notice-toggle-btn"
            onClick={() => {
              setIsComposing(!isComposing);
              setPreviewTab('form');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              isComposing
                ? 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
            }`}
          >
            {isComposing ? (
              <>
                <X className="w-4 h-4" />
                <span>Form Band Karein</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Nayi Notification Banayein (+ Create Notice)</span>
              </>
            )}
          </button>

          {onNavigateToPublicNotices && (
            <button
              id="view-public-notices-board-btn"
              onClick={onNavigateToPublicNotices}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
              title="Public Notice Board Dekhein"
            >
              <ExternalLink className="w-4 h-4 text-amber-400" />
              <span>Public Notice Board Dekhein</span>
            </button>
          )}
        </div>
      </div>

      {/* Status / Alert Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 border animate-in fade-in duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* QUICK PRESET TEMPLATES BAR (When Composing or closed) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">
              त्वरित आधिकारिक ड्राफ्ट टेम्पलेट्स (1-Click Notice Templates)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">टेम्पलेट चुनें और सीधे कस्टमाइज़ करें</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => applyTemplate('EXAM_ADMIT')}
            className="p-3 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-amber-900 mb-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Exam & Admit Card</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">परीक्षा तिथि व प्रवेश पत्र जारी करने का सर्कुलर</p>
          </button>

          <button
            type="button"
            onClick={() => applyTemplate('RESULT_MERIT')}
            className="p-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-emerald-900 mb-1">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>2. Results & Merit Gazette</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">परीक्षा परिणाम व राज्य मेधा सूची की घोषणा</p>
          </button>

          <button
            type="button"
            onClick={() => applyTemplate('SCHOLARSHIP')}
            className="p-3 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-purple-900 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>3. Scholarship & DBT</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">₹12,000/वर्ष छात्रवृत्ति अनुदान व बैंक लिंकिंग</p>
          </button>

          <button
            type="button"
            onClick={() => applyTemplate('CORRECTION')}
            className="p-3 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 border border-slate-200 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-sky-900 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-sky-600" />
              <span>4. Helpdesk Correction</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">नाम व जन्मतिथि त्रुटि सुधार हेतु खिड़की</p>
          </button>
        </div>
      </div>

      {/* COMPOSING / EDITING FORM ACCORDION */}
      {isComposing && (
        <div className="bg-white rounded-2xl border-2 border-amber-400/80 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
          
          {/* Header Bar with Preview Switch */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-850 px-6 py-4 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-black text-sm text-white">नया राजपत्र / अधिसूचना ड्राफ्ट तैयार करें</h3>
                <span className="text-[11px] text-slate-400">Bihar State Educational Development and Research Council Gazette Desk</span>
              </div>
            </div>

            {/* Toggle Form / Gazette Letterhead Preview */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setPreviewTab('form')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  previewTab === 'form' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                1. Edit Form Data
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('gazette_preview')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  previewTab === 'gazette_preview' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>2. Official Letterhead Preview</span>
              </button>
            </div>
          </div>

          {previewTab === 'form' ? (
            <form onSubmit={handlePublishNotice} className="p-6 sm:p-8 space-y-6">
              
              {/* Row 1: Notice No, Category, Date, Urgent Flag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    अधिसूचना क्रमांक (Notice No.) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.notice_no || ''}
                    onChange={(e) => setFormData({ ...formData, notice_no: e.target.value })}
                    placeholder="BSEDRC/EXAM/2026/08-101"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    श्रेणी (Category) *
                  </label>
                  <select
                    value={formData.category || 'EXAM'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  >
                    <option value="EXAM">परीक्षा एवं समय-सारणी (Exam Schedule)</option>
                    <option value="ADMIT_CARD">प्रवेश पत्र (Admit Card Release)</option>
                    <option value="RESULT">परीक्षा परिणाम (Result & Merit)</option>
                    <option value="SCHOLARSHIP">छात्रवृत्ति एवं अनुदान (Scholarship)</option>
                    <option value="AFFILIATION">मान्यता व U-DISE (School Affiliation)</option>
                    <option value="GUIDELINES">दिशानिर्देश व सुधार (Rules & Grievance)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    प्रकाशन तिथि (Publish Date) *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.publish_date || ''}
                    onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    फ्लैश / मुख्य सूचना (Urgent Flash)
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_urgent || false}
                        onChange={(e) => setFormData({ ...formData, is_urgent: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                    <span className="text-xs font-semibold text-slate-700">
                      {formData.is_urgent ? '🔥 Urgent Flash News' : 'Normal Notice'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2: Title in Hindi & English */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    मुख्य शीर्षक (Hindi Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title_hi || ''}
                    onChange={(e) => setFormData({ ...formData, title_hi: e.target.value })}
                    placeholder="उदा. राज्य प्रतिभा खोज परीक्षा 2026: परीक्षा तिथि एवं प्रवेश पत्र निर्गमन सूचना"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    शीर्षक (English Title - Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.title_en || ''}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    placeholder="e.g. State Talent Search Examination 2026: Exam Schedule & Hall Ticket Issuance"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Row 3: Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    संक्षिप्त सारांश (Brief Summary in Hindi) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.summary_hi || ''}
                    onChange={(e) => setFormData({ ...formData, summary_hi: e.target.value })}
                    placeholder="सूचना पट्ट पर प्रदर्शित होने वाला संक्षिप्त विवरण..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Brief Summary (English)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.summary_en || ''}
                    onChange={(e) => setFormData({ ...formData, summary_en: e.target.value })}
                    placeholder="Brief highlights shown on cards..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Row 4: Full Official Content Body */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    विस्तृत अधिसूचना आदेश / आदेश पत्र (Detailed Official Order in Hindi) *
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={formData.content_hi || ''}
                    onChange={(e) => setFormData({ ...formData, content_hi: e.target.value })}
                    placeholder="परिषद द्वारा जारी पूर्ण शासकीय आदेश, नियम, निर्देश, आवश्यक तिथियां एवं दिशानिर्देश यहाँ लिखें..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-xs sm:text-sm text-slate-900 leading-relaxed font-sans focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Content (English - Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.content_en || ''}
                    onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                    placeholder="Official English translation / notification body..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Row 5: Signatory Authority & PDF attachment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    हस्ताक्षरकर्ता अधिकारी (Signatory Authority) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.signed_by || ''}
                    onChange={(e) => setFormData({ ...formData, signed_by: e.target.value })}
                    placeholder="परीक्षा नियंत्रक (Controller of Examinations), BSEDRC"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    संलग्नक पीडीएफ नाम (PDF Filename Reference)
                  </label>
                  <input
                    type="text"
                    value={formData.pdf_filename || ''}
                    onChange={(e) => setFormData({ ...formData, pdf_filename: e.target.value })}
                    placeholder="BSEDRC_Circular_Official.pdf"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewTab('gazette_preview')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4 text-slate-600" />
                  <span>Official Letterhead Preview Dekhein</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsComposing(false)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    id="submit-publish-notice-btn"
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isLoading ? 'Publish Ho Raha Hai...' : 'अधिसूचना तुरंत प्रकाशित करें (Publish Now)'}</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* OFFICIAL GAZETTE LETTERHEAD PREVIEW */
            <div className="p-6 sm:p-8 bg-slate-100">
              <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-lg border border-slate-300 text-slate-900 font-serif relative">
                
                {/* Official Letterhead Top Header */}
                <div className="text-center pb-6 border-b-2 border-double border-slate-900">
                  <div className="w-14 h-14 mx-auto mb-2 rounded-full border-2 border-slate-900 flex items-center justify-center bg-amber-50">
                    <ShieldCheck className="w-8 h-8 text-slate-900" />
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-950 uppercase tracking-wide">
                    बिहार राज्य शैक्षिक विकास एवं अनुसंधान परिषद
                  </h1>
                  <h2 className="text-xs sm:text-sm font-semibold text-slate-800">
                    BIHAR STATE EDUCATIONAL DEVELOPMENT AND RESEARCH COUNCIL (BSEDRC)
                  </h2>
                  <p className="text-[11px] text-slate-600 font-sans mt-0.5">
                    (शिक्षा विभाग, बिहार सरकार द्वारा मान्यता प्राप्त स्वायत्त परिषद) • विकास भवन, बेली रोड, पटना - 800001
                  </p>
                </div>

                {/* Ref No & Date */}
                <div className="flex justify-between items-center py-4 font-sans text-xs border-b border-slate-200">
                  <div>
                    <span className="font-bold text-slate-700">ज्ञापांक / पत्रांक: </span>
                    <span className="font-mono font-bold text-slate-950">{formData.notice_no || 'BSEDRC/EXAM/2026/DRAFT'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">दिनांक: </span>
                    <span className="font-bold text-slate-950">{formData.publish_date || new Date().toISOString().slice(0, 10)}</span>
                  </div>
                </div>

                {/* Circular Title Banner */}
                <div className="my-6 text-center">
                  <span className="inline-block px-3 py-1 bg-amber-100 border border-amber-300 text-amber-950 rounded-md font-sans text-xs font-bold uppercase tracking-wider mb-2">
                    -- आधिकारिक अधिसूचना / PRESS NOTIFICATION --
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-950 leading-snug">
                    {formData.title_hi || 'अधिसूचना का मुख्य शीर्षक यहाँ दिखेगा'}
                  </h3>
                  {formData.title_en && (
                    <p className="text-xs text-slate-600 font-sans italic mt-1">
                      {formData.title_en}
                    </p>
                  )}
                </div>

                {/* Body Content */}
                <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800 text-justify">
                  <p className="font-medium">
                    {formData.content_hi || formData.summary_hi || 'यहाँ पर विस्तृत आदेश एवं दिशा-निर्देश का विवरण प्रदर्शित होगा...'}
                  </p>
                  {formData.content_en && (
                    <p className="text-slate-600 font-sans text-xs pt-2 border-t border-slate-100">
                      {formData.content_en}
                    </p>
                  )}
                </div>

                {/* Official Stamp & Signatory */}
                <div className="mt-12 pt-8 flex justify-between items-end font-sans">
                  <div className="text-center">
                    <div className="w-20 h-20 border border-dashed border-slate-400 rounded-full flex flex-col items-center justify-center text-[9px] text-slate-400 uppercase leading-tight p-1 mb-1">
                      <span>BSEDRC</span>
                      <span className="font-bold">OFFICIAL SEAL</span>
                      <span>PATNA</span>
                    </div>
                    <span className="text-[10px] text-slate-500">परिषद आधिकारिक मुहर</span>
                  </div>

                  <div className="text-right">
                    <div className="h-10 flex items-end justify-end mb-1">
                      <span className="font-serif italic text-sm text-slate-700 font-bold">Sd/-</span>
                    </div>
                    <p className="font-bold text-xs text-slate-900">
                      {formData.signed_by || 'परीक्षा नियंत्रक, BSEDRC, पटना'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      बिहार राज्य शैक्षिक विकास एवं अनुसंधान परिषद
                    </p>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] font-sans text-slate-500 flex justify-between items-center">
                  <span>सत्यापित प्रतिलिपि • BSEDRC Central Portal</span>
                  <span>ई-हस्ताक्षरित राजपत्र (Digitally Authenticated)</span>
                </div>
              </div>

              {/* Bottom Preview Controls */}
              <div className="max-w-3xl mx-auto mt-6 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setPreviewTab('form')}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  ← Wapas Form Par Jayein
                </button>

                <button
                  type="button"
                  onClick={handlePublishNotice}
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Sabhi Jankari Sahi Hai, Abhi Publish Karein</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PUBLISHED NOTICES MASTER LIST & TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Search & Filter Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              <span>प्रकाशित अधिसूचनाओं की सूची ({filteredNotices.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              परिषद द्वारा अब तक जारी किए गए समस्त सर्कुलर एवं प्रेस विज्ञप्तियाँ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Title, Notice No..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-hidden"
            >
              <option value="ALL">सभी श्रेणियां (All Categories)</option>
              <option value="EXAM">परीक्षा (Exam)</option>
              <option value="ADMIT_CARD">प्रवेश पत्र (Admit Card)</option>
              <option value="RESULT">परिणाम (Result)</option>
              <option value="SCHOLARSHIP">छात्रवृत्ति (Scholarship)</option>
              <option value="AFFILIATION">मान्यता (U-DISE)</option>
              <option value="GUIDELINES">दिशानिर्देश (Guidelines)</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
              <tr>
                <th className="py-3 px-3.5 font-bold">अधिसूचना क्रमांक / श्रेणी</th>
                <th className="py-3 px-3.5 font-bold">शीर्षक व विवरण</th>
                <th className="py-3 px-3.5 font-bold">प्रकाशन तिथि</th>
                <th className="py-3 px-3.5 font-bold">हस्ताक्षरकर्ता</th>
                <th className="py-3 px-3.5 font-bold text-right">कार्रवाई (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNotices.length > 0 ? (
                filteredNotices.map((notice) => (
                  <tr key={notice.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3.5 align-top">
                      <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{notice.notice_no}</span>
                        {notice.is_urgent && (
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" title="Urgent Notice"></span>
                        )}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {getCategoryBadge(notice.category)}
                        {notice.is_urgent && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-red-100 text-red-700">
                            URGENT
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3.5 align-top max-w-md">
                      <h4 className="font-extrabold text-slate-900 leading-snug mb-1">
                        {notice.title_hi}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {notice.summary_hi}
                      </p>
                      {notice.pdf_filename && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-slate-400">
                          <FileText className="w-3 h-3 text-amber-500" />
                          <span>{notice.pdf_filename}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3.5 align-top whitespace-nowrap">
                      <div className="flex items-center gap-1 text-slate-700 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{notice.publish_date}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">● Live on Portal</span>
                    </td>

                    <td className="py-3.5 px-3.5 align-top">
                      <span className="text-[11px] text-slate-700 font-medium leading-tight block">
                        {notice.signed_by}
                      </span>
                    </td>

                    <td className="py-3.5 px-3.5 align-top text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedNoticeForPreview(notice)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                          title="Gazette Letterhead Dekhein & Print Karein"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-700" />
                          <span>View Gazette</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteNotice(notice.id, notice.notice_no)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete / Unpublish Notice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Koi notification nahi mili. Aap upar diye gaye button se nayi notification publish kar sakte hain.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW GAZETTE / PRINT MODAL */}
      {selectedNoticeForPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-300">
            
            {/* Modal Bar */}
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between gap-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  BSEDRC Official Gazette Order • {selectedNoticeForPreview.notice_no}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Gazette</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedNoticeForPreview(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Letterhead Container */}
            <div className="p-6 sm:p-10 overflow-y-auto font-serif text-slate-900 leading-relaxed">
              {/* Header */}
              <div className="text-center pb-6 border-b-2 border-double border-slate-900">
                <div className="w-14 h-14 mx-auto mb-2 rounded-full border-2 border-slate-900 flex items-center justify-center bg-amber-50">
                  <ShieldCheck className="w-8 h-8 text-slate-900" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-950 uppercase tracking-wide">
                  बिहार राज्य शैक्षिक विकास एवं अनुसंधान परिषद
                </h1>
                <h2 className="text-xs sm:text-sm font-semibold text-slate-800">
                  BIHAR STATE EDUCATIONAL DEVELOPMENT AND RESEARCH COUNCIL (BSEDRC)
                </h2>
                <p className="text-[11px] text-slate-600 font-sans mt-0.5">
                  (शिक्षा विभाग, बिहार सरकार द्वारा मान्यता प्राप्त) • विकास भवन, बेली रोड, पटना - 800001
                </p>
              </div>

              {/* Reference Details */}
              <div className="flex justify-between items-center py-4 font-sans text-xs border-b border-slate-200">
                <div>
                  <span className="font-bold text-slate-700">ज्ञापांक / पत्रांक: </span>
                  <span className="font-mono font-bold text-slate-950">{selectedNoticeForPreview.notice_no}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">दिनांक: </span>
                  <span className="font-bold text-slate-950">{selectedNoticeForPreview.publish_date}</span>
                </div>
              </div>

              {/* Title */}
              <div className="my-6 text-center">
                <span className="inline-block px-3 py-1 bg-amber-100 border border-amber-300 text-amber-950 rounded-md font-sans text-xs font-bold uppercase tracking-wider mb-2">
                  -- आधिकारिक अधिसूचना / OFFICIAL GAZETTE --
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-950 leading-snug">
                  {selectedNoticeForPreview.title_hi}
                </h3>
                {selectedNoticeForPreview.title_en && (
                  <p className="text-xs text-slate-600 font-sans italic mt-1">
                    {selectedNoticeForPreview.title_en}
                  </p>
                )}
              </div>

              {/* Body */}
              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800 text-justify">
                <p>{selectedNoticeForPreview.content_hi || selectedNoticeForPreview.summary_hi}</p>
                {selectedNoticeForPreview.content_en && (
                  <p className="text-slate-600 font-sans text-xs pt-3 border-t border-slate-100">
                    {selectedNoticeForPreview.content_en}
                  </p>
                )}
              </div>

              {/* Signature Block */}
              <div className="mt-12 pt-8 flex justify-between items-end font-sans">
                <div className="text-center">
                  <div className="w-20 h-20 border border-dashed border-slate-400 rounded-full flex flex-col items-center justify-center text-[9px] text-slate-400 uppercase leading-tight p-1 mb-1">
                    <span>BSEDRC</span>
                    <span className="font-bold">OFFICIAL SEAL</span>
                    <span>PATNA</span>
                  </div>
                  <span className="text-[10px] text-slate-500">परिषद आधिकारिक मुहर</span>
                </div>

                <div className="text-right">
                  <div className="h-10 flex items-end justify-end mb-1">
                    <span className="font-serif italic text-sm text-slate-700 font-bold">Sd/-</span>
                  </div>
                  <p className="font-bold text-xs text-slate-900">{selectedNoticeForPreview.signed_by}</p>
                  <p className="text-[10px] text-slate-500">बिहार राज्य शैक्षिक विकास एवं अनुसंधान परिषद</p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] font-sans text-slate-500 flex justify-between items-center">
                <span>सत्यापित प्रतिलिपि • BSEDRC Directorate</span>
                <span>e-Gazette Digital Record</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
