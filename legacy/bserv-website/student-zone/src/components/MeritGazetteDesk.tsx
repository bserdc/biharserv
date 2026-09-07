import React, { useState, useEffect } from 'react';
import {
  Award,
  Trophy,
  Medal,
  Download,
  Filter,
  Search,
  Printer,
  Sparkles,
  CheckCircle2,
  Building2,
  QrCode,
  ShieldCheck,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  User,
  Star
} from 'lucide-react';
import { MeritTopper, Language, Student } from '../types';
import { api } from '../services/api';
import { INITIAL_TOPPERS } from '../data/initialData';

interface MeritGazetteDeskProps {
  lang?: Language;
  students?: Student[];
  onNavigateToStudent?: (regId: string) => void;
}

export const MeritGazetteDesk: React.FC<MeritGazetteDeskProps> = ({
  lang = 'hi',
  students = [],
  onNavigateToStudent,
}) => {
  const [toppers, setToppers] = useState<MeritTopper[]>(INITIAL_TOPPERS);
  const [cutoffs, setCutoffs] = useState<Array<{ category: string; qualifying_marks: number; merit_cutoff: number; highest_marks: number }>>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCertificateTopper, setSelectedCertificateTopper] = useState<MeritTopper | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchGazette();
  }, [selectedDistrict, selectedClass]);

  const fetchGazette = async () => {
    try {
      setIsLoading(true);
      const res = await api.getMeritGazette({
        district: selectedDistrict !== 'ALL' ? selectedDistrict : undefined,
        class_name: selectedClass !== 'ALL' ? selectedClass : undefined,
      });
      if (res.success && res.toppers) {
        setToppers(res.toppers);
        if (res.cutoffs) setCutoffs(res.cutoffs);
      }
    } catch (e) {
      console.warn('Fallback to local toppers', e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredToppers = toppers.filter((t) => {
    if (selectedDistrict !== 'ALL' && t.district.toLowerCase() !== selectedDistrict.toLowerCase()) return false;
    if (selectedClass !== 'ALL' && t.current_class !== selectedClass) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.roll_no.toLowerCase().includes(q) ||
        t.registration_id.toLowerCase().includes(q) ||
        t.school_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const districts = ['ALL', 'Patna', 'Madhepura', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga', 'Purnea', 'Saharsa'];
  const classes = ['ALL', '8th', '9th', '10th', '11th', '12th'];

  const handleExportCSV = () => {
    const headers = ['Rank,Registration ID,Roll No,Student Name,Father Name,School Name,District,Class,Category,Marks,Percentage,Award'];
    const rows = filteredToppers.map((t) =>
      `"${t.rank}","${t.registration_id}","${t.roll_no}","${t.name}","${t.father_name}","${t.school_name}","${t.district}","${t.current_class}","${t.category}","${t.marks_obtained}","${t.percentage}%","${t.award_scholarship}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BSEDRC_Merit_Gazette_${selectedDistrict}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-amber-500/40 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-20 pointer-events-none">
          <Trophy className="w-80 h-80 text-yellow-300" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-300/40 text-yellow-200 text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <Trophy className="w-3.5 h-3.5 text-yellow-300" />
              {lang === 'hi' ? 'राज्य स्तरीय मेधा अंक तालिका एवं मेरिट बोर्ड' : 'State Official Merit Board & Rank Gazette'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {lang === 'hi' ? 'BSEDRC 2026 मेधावी छात्र मेरिट सूची व राजपत्र' : 'BSEDRC 2026 Official Merit Gazette & Toppers List'}
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm mt-1 max-w-2xl">
              {lang === 'hi'
                ? 'राज्य के सभी 38 जिलों के उत्कृष्ट छात्र-छात्राओं की प्रामाणिक सूची, छात्रवृत्ति अनुदान श्रेणी एवं डिजिटल मेरिट प्रमाण पत्र।'
                : 'Statewide toppers directory, category-wise qualifying thresholds, DBT scholarship allocations, and verifiable merit certificates.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              id="export-gazette-csv-btn"
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-bold text-xs flex items-center gap-2 border border-amber-500/40 shadow-lg transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'hi' ? 'मेरिट गैजेट CSV डाउनलोड' : 'Download Gazette Register'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 State Podium Visual */}
      {filteredToppers.length >= 3 && selectedDistrict === 'ALL' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rank 2 */}
          <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-sm flex flex-col justify-between order-2 md:order-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-slate-200 text-slate-700 px-3 py-1 rounded-bl-xl font-black text-xs">
              RANK #2
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-300 shrink-0">
                <img
                  src={filteredToppers[1]?.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={filteredToppers[1]?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">State Silver Medalist</span>
                <h4 className="font-extrabold text-sm text-slate-900 leading-tight">{filteredToppers[1]?.name}</h4>
                <p className="text-[11px] text-slate-500 font-medium">{filteredToppers[1]?.district}</p>
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between items-center text-xs font-mono mb-3">
              <span className="text-slate-600 font-semibold">Marks: <strong className="text-slate-900 font-bold">{filteredToppers[1]?.marks_obtained}/100</strong></span>
              <span className="text-slate-600 font-semibold">{filteredToppers[1]?.percentage}%</span>
            </div>
            <button
              onClick={() => setSelectedCertificateTopper(filteredToppers[1])}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-slate-600" />
              <span>{lang === 'hi' ? 'सर्टिफिकेट देखें' : 'View Certificate'}</span>
            </button>
          </div>

          {/* Rank 1 Gold */}
          <div className="bg-gradient-to-b from-amber-500/10 to-yellow-500/5 rounded-2xl p-5 border-2 border-amber-400 shadow-md flex flex-col justify-between order-1 md:order-2 relative overflow-hidden transform md:-translate-y-2">
            <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 px-3.5 py-1 rounded-bl-xl font-black text-xs shadow">
              👑 STATE TOPPER #1
            </div>
            <div className="flex items-center gap-3.5 mb-3">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-amber-100 border-2 border-amber-500 shadow-md shrink-0">
                <img
                  src={filteredToppers[0]?.photo_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
                  alt={filteredToppers[0]?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">State Gold Medalist</span>
                <h4 className="font-black text-base text-slate-950 leading-tight">{filteredToppers[0]?.name}</h4>
                <p className="text-xs text-slate-600 font-medium">{filteredToppers[0]?.school_name}</p>
                <p className="text-[11px] text-amber-800 font-bold">{filteredToppers[0]?.district} • Class {filteredToppers[0]?.current_class}</p>
              </div>
            </div>
            <div className="bg-amber-500/20 p-2.5 rounded-xl border border-amber-500/40 flex justify-between items-center text-xs font-mono mb-3">
              <span className="text-slate-800 font-bold">Marks: <strong className="text-amber-900 font-black text-sm">{filteredToppers[0]?.marks_obtained}/100</strong></span>
              <span className="text-amber-900 font-black text-sm">{filteredToppers[0]?.percentage}% (A+)</span>
            </div>
            <button
              onClick={() => setSelectedCertificateTopper(filteredToppers[0])}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>{lang === 'hi' ? 'गोल्ड मेरिट सर्टिफिकेट देखें' : 'View Gold Merit Certificate'}</span>
            </button>
          </div>

          {/* Rank 3 Bronze */}
          <div className="bg-white rounded-2xl p-5 border-2 border-amber-700/30 shadow-sm flex flex-col justify-between order-3 md:order-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-700/20 text-amber-900 px-3 py-1 rounded-bl-xl font-black text-xs">
              RANK #3
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-amber-50 border-2 border-amber-700/40 shrink-0">
                <img
                  src={filteredToppers[2]?.photo_url || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'}
                  alt={filteredToppers[2]?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">State Bronze Medalist</span>
                <h4 className="font-extrabold text-sm text-slate-900 leading-tight">{filteredToppers[2]?.name}</h4>
                <p className="text-[11px] text-slate-500 font-medium">{filteredToppers[2]?.district}</p>
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between items-center text-xs font-mono mb-3">
              <span className="text-slate-600 font-semibold">Marks: <strong className="text-slate-900 font-bold">{filteredToppers[2]?.marks_obtained}/100</strong></span>
              <span className="text-slate-600 font-semibold">{filteredToppers[2]?.percentage}%</span>
            </div>
            <button
              onClick={() => setSelectedCertificateTopper(filteredToppers[2])}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-amber-800" />
              <span>{lang === 'hi' ? 'सर्टिफिकेट देखें' : 'View Certificate'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Controls Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* District Select */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-amber-600" />
            <span>{lang === 'hi' ? 'जिला:' : 'District:'}</span>
            <select
              id="merit-district-filter"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d === 'ALL' ? (lang === 'hi' ? 'समस्त बिहार (All 38 Districts)' : 'All Districts') : d}
                </option>
              ))}
            </select>
          </div>

          {/* Class Select */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <span>{lang === 'hi' ? 'कक्षा:' : 'Class:'}</span>
            <select
              id="merit-class-filter"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
            >
              {classes.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? (lang === 'hi' ? 'सभी कक्षाएं (All Classes)' : 'All Classes') : `Class ${c}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="merit-search-input"
            type="text"
            placeholder={lang === 'hi' ? 'छात्र नाम या रोल नंबर खोजें...' : 'Search student by name or roll...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Main Tabular Gazette Register */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-950 text-white flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
              {lang === 'hi' ? 'मेधावी परीक्षार्थी प्राप्तांक एवं रैंक पंजिका' : 'Council Official Gazette Tabulation Sheet'}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-amber-300 font-bold">
            {filteredToppers.length} {lang === 'hi' ? 'छात्र सूचीबद्ध' : 'Ranked Candidates'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Candidate & Roll</th>
                <th className="py-3 px-4">School & District</th>
                <th className="py-3 px-4">Class & Cat</th>
                <th className="py-3 px-4 text-right">Marks & %</th>
                <th className="py-3 px-4">Scholarship Status</th>
                <th className="py-3 px-4 text-center">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredToppers.map((topper) => (
                <tr key={topper.registration_id} className="hover:bg-amber-50/30 transition-colors">
                  {/* Rank */}
                  <td className="py-3 px-4 font-mono font-bold">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs ${
                        topper.rank === 1
                          ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-300'
                          : topper.rank === 2
                          ? 'bg-slate-300 text-slate-900 font-bold'
                          : topper.rank === 3
                          ? 'bg-amber-800/30 text-amber-900 font-bold'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {topper.rank}
                    </span>
                  </td>

                  {/* Candidate Info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        <img
                          src={topper.photo_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
                          alt={topper.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{topper.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          Roll: <strong>{topper.roll_no}</strong> • Reg: {topper.registration_id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* School */}
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800 max-w-xs truncate">{topper.school_name}</div>
                    <div className="text-[11px] text-slate-500">{topper.district}, Bihar</div>
                  </td>

                  {/* Class & Category */}
                  <td className="py-3 px-4 font-mono text-[11px]">
                    <span className="font-bold text-slate-800">Class {topper.current_class}</span>
                    <div className="text-slate-500">{topper.category}</div>
                  </td>

                  {/* Marks */}
                  <td className="py-3 px-4 text-right font-mono">
                    <span className="font-black text-slate-950 text-sm">{topper.marks_obtained}/{topper.total_marks}</span>
                    <div className="text-[11px] font-bold text-emerald-700">{topper.percentage}%</div>
                  </td>

                  {/* Scholarship */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {topper.award_scholarship}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-center">
                    <button
                      id={`view-cert-btn-${topper.registration_id}`}
                      onClick={() => setSelectedCertificateTopper(topper)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-slate-950 font-bold text-[11px] border border-amber-500/40 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Award className="w-3 h-3" />
                      <span>Certificate</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Verifiable State Merit Certificate Modal */}
      {selectedCertificateTopper && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-amber-400 shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            {/* Action ribbon */}
            <div className="bg-slate-950 text-white p-3.5 px-6 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>BSEDRC Official State Talent Search Certificate • Authenticity Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="print-certificate-btn"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button
                  id="close-certificate-modal-btn"
                  onClick={() => setSelectedCertificateTopper(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Certificate Print Area */}
            <div className="p-8 sm:p-12 bg-amber-50/30 relative border-[12px] border-double border-amber-600/40 m-4 rounded-2xl space-y-6 text-center">
              {/* Top Seal & Heading */}
              <div className="space-y-1 border-b-2 border-amber-600/30 pb-4">
                <div className="inline-block px-4 py-1 rounded-full bg-slate-950 text-amber-300 text-[11px] font-mono font-bold uppercase tracking-widest mb-1 shadow">
                  BIHAR STATE EDUCATIONAL DEVELOPMENT & RESEARCH COUNCIL
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight font-serif">
                  बिहार राज्य प्रतिभा खोज एवं मेधा प्रमाण-पत्र
                </h2>
                <h3 className="text-xs sm:text-sm font-bold text-amber-900 tracking-wider uppercase font-sans">
                  STATE TALENT SEARCH SCHOLARSHIP CERTIFICATE OF MERIT 2026
                </h3>
              </div>

              {/* Awarded To Paragraph */}
              <div className="space-y-3 max-w-xl mx-auto py-2">
                <p className="text-xs sm:text-sm text-slate-600 font-serif italic">
                  This is to proudly certify that meritorious candidate
                </p>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 underline decoration-amber-500 decoration-2 underline-offset-8">
                  {selectedCertificateTopper.name}
                </h1>

                <p className="text-xs sm:text-sm text-slate-700 font-serif">
                  Son / Daughter of <strong className="text-slate-900">{selectedCertificateTopper.father_name}</strong>
                  <br />
                  Student of <strong className="text-slate-900">{selectedCertificateTopper.school_name}</strong>, District <strong>{selectedCertificateTopper.district}</strong>
                </p>

                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-serif">
                  has demonstrated exceptional academic brilliance and secured <strong>STATE RANK #{selectedCertificateTopper.rank}</strong> in the Bihar State Talent & Scholarship Examination 2026 with a score of <strong>{selectedCertificateTopper.marks_obtained}/100 ({selectedCertificateTopper.percentage}%)</strong>.
                </p>

                <div className="inline-block px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500 text-amber-950 font-bold text-xs font-mono mt-2">
                  Awarded: {selectedCertificateTopper.award_scholarship}
                </div>
              </div>

              {/* Bottom Verification & Signatures */}
              <div className="pt-6 border-t-2 border-amber-600/30 grid grid-cols-3 items-end text-center text-xs">
                {/* QR Verification */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-300 shadow-sm flex items-center justify-center">
                    <QrCode className="w-14 h-14 text-slate-900" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 mt-1 font-bold">
                    ID: {selectedCertificateTopper.registration_id}
                  </span>
                </div>

                {/* Official Gold Seal */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 border-4 border-amber-700 shadow-lg flex items-center justify-center text-slate-950 font-black text-[9px] uppercase tracking-tighter leading-tight text-center p-1">
                    ★ BSEDRC ★<br />GOLD SEAL<br />2026 MERIT
                  </div>
                </div>

                {/* Secretary Signature */}
                <div className="space-y-1">
                  <div className="font-serif italic font-bold text-slate-900 text-sm">
                    Dr. Rajeshwar K. Verma
                  </div>
                  <p className="text-[10px] font-mono font-bold text-slate-600 uppercase">
                    Director & Exam Controller
                  </p>
                  <p className="text-[9px] text-slate-400">
                    BSEDRC Directorate, Bihar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
