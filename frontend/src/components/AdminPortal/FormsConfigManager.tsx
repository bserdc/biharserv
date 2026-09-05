import React, { useState } from 'react';
import {
  FileText,
  Plus,
  ToggleLeft,
  ToggleRight,
  Calendar,
  IndianRupee,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  Save,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  Sparkles,
  Eye,
  Settings,
  Send,
  HelpCircle,
  Type,
  AlignLeft,
  Hash,
  ListOrdered,
  CheckSquare,
  Radio,
  Upload,
  Phone,
  Mail,
  FolderPlus,
  FileCheck2,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { FormConfig, CustomField } from '../../types';
import { api } from '../../services/api';

interface FormsConfigManagerProps {
  forms: FormConfig[];
  onRefreshForms: () => void;
  onNavigateToFrontendForm?: (formId: string) => void;
}

export const FormsConfigManager: React.FC<FormsConfigManagerProps> = ({
  forms,
  onRefreshForms,
  onNavigateToFrontendForm,
}) => {
  const [selectedFormId, setSelectedFormId] = useState<string>(forms[0]?.form_id || 'EXAM_2026_01');
  const [activeSubTab, setActiveSubTab] = useState<'builder' | 'preview' | 'lifecycle'>('builder');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Active form being edited
  const currentForm = forms.find((f) => f.form_id === selectedFormId) || forms[0];

  // Editable local state for the active form
  const [formTitle, setFormTitle] = useState(currentForm?.title || '');
  const [formDescription, setFormDescription] = useState(currentForm?.description || '');
  const [academicYear, setAcademicYear] = useState(currentForm?.academic_year || '2026-2027');
  const [feeAmount, setFeeAmount] = useState<number>(currentForm?.fee_amount ?? 50);
  const [examDate, setExamDate] = useState(currentForm?.exam_date || '2026-09-15');
  const [examTime, setExamTime] = useState(currentForm?.exam_time || '10:00 AM - 12:30 PM');
  const [examCenter, setExamCenter] = useState(currentForm?.exam_center_default || 'District Model Examination Hall');
  const [totalMarks, setTotalMarks] = useState<number>(currentForm?.total_marks ?? 100);
  const [passingMarks, setPassingMarks] = useState<number>(currentForm?.passing_marks ?? 40);
  const [customFields, setCustomFields] = useState<CustomField[]>(currentForm?.custom_fields || []);

  // Update local state when switching active form
  React.useEffect(() => {
    if (currentForm) {
      setFormTitle(currentForm.title);
      setFormDescription(currentForm.description || '');
      setAcademicYear(currentForm.academic_year);
      setFeeAmount(currentForm.fee_amount);
      setExamDate(currentForm.exam_date);
      setExamTime(currentForm.exam_time);
      setExamCenter(currentForm.exam_center_default);
      setTotalMarks(currentForm.total_marks || 100);
      setPassingMarks(currentForm.passing_marks || 40);
      setCustomFields(currentForm.custom_fields ? [...currentForm.custom_fields] : []);
      setSaveSuccessMessage('');
    }
  }, [selectedFormId, forms]);

  // Handle Adding a new blank question/column
  const handleAddBlankColumn = () => {
    const newField: CustomField = {
      id: `f_${Date.now()}`,
      label: `Naya Sawal / Column ${customFields.length + 1}`,
      type: 'text',
      required: false,
      placeholder: 'Apna uttar yaha likhein',
      section: 'custom',
    };
    setCustomFields([...customFields, newField]);
  };

  // Pre-configured Quick Column Injectors
  const handleInjectPredefinedColumn = (presetType: string) => {
    let presetField: CustomField;
    const uid = `f_${Date.now()}`;

    switch (presetType) {
      case 'mother_name':
        presetField = {
          id: uid,
          label: "Mata Ji Ka Naam (Mother's Name)",
          field_key: 'mother_name',
          type: 'text',
          required: true,
          placeholder: 'Mata ka pura naam likhein',
          section: 'personal',
        };
        break;
      case 'aadhaar':
        presetField = {
          id: uid,
          label: 'Aadhaar Card Number (12 Digits)',
          field_key: 'aadhaar_number',
          type: 'text',
          required: true,
          placeholder: '1234-5678-9012',
          helper_text: 'Sahi 12 anko ka aadhaar number likhein',
          section: 'personal',
        };
        break;
      case 'category':
        presetField = {
          id: uid,
          label: 'Caste / Varg Category',
          field_key: 'caste_category',
          type: 'select',
          required: true,
          options: ['General (Samanya)', 'OBC (Pichhada Varg)', 'EBC (Atyant Pichhada)', 'SC (Anusuchit Jati)', 'ST (Anusuchit Janjati)', 'EWS'],
          section: 'personal',
        };
        break;
      case 'gender':
        presetField = {
          id: uid,
          label: 'Ling (Gender)',
          field_key: 'gender',
          type: 'radio',
          required: true,
          options: ['Purush (Male)', 'Mahila (Female)', 'Anya (Other)'],
          section: 'personal',
        };
        break;
      case 'address':
        presetField = {
          id: uid,
          label: 'Sthai Pata (Permanent Full Address)',
          field_key: 'permanent_address',
          type: 'textarea',
          required: true,
          placeholder: 'Ghar ka pata, Gaon/Mohalla, Post, Thana, District, PIN Code',
          section: 'contact',
        };
        break;
      case 'signature_upload':
        presetField = {
          id: uid,
          label: 'Candidate Signature Upload (Hastakshar)',
          field_key: 'signature_file',
          type: 'file',
          required: true,
          helper_text: 'White paper par blue/black ink se hastakshar karke photo upload karein (Max 2MB)',
          section: 'document',
        };
        break;
      case 'medium':
        presetField = {
          id: uid,
          label: 'Pariksha Ka Madhyam (Exam Medium)',
          field_key: 'exam_medium',
          type: 'select',
          required: true,
          options: ['Hindi (हिंदी)', 'English (अंग्रेजी)'],
          section: 'academic',
        };
        break;
      case 'stream':
        presetField = {
          id: uid,
          label: 'Shaikshanik Stream / Subject Group',
          field_key: 'stream_choice',
          type: 'select',
          required: true,
          options: ['Science (PCM)', 'Science (PCB)', 'Arts / Humanities', 'Commerce'],
          section: 'academic',
        };
        break;
      case 'bank_details':
        presetField = {
          id: uid,
          label: 'Bank Account Number & IFSC Code',
          field_key: 'bank_account_info',
          type: 'text',
          required: false,
          placeholder: 'A/C: 123456789012, IFSC: SBIN0001234',
          helper_text: 'Scholarship rashi DBT ke madhyam se transfer karne hetu',
          section: 'custom',
        };
        break;
      case 'annual_income':
        presetField = {
          id: uid,
          label: 'Parivarik Varshik Aay (Annual Family Income)',
          field_key: 'annual_income',
          type: 'select',
          required: false,
          options: ['₹50,000 Se Kam', '₹50,000 - ₹1,50,000', '₹1,50,000 - ₹3,00,000', '₹3,00,000 Se Adhik'],
          section: 'personal',
        };
        break;
      default:
        presetField = {
          id: uid,
          label: 'Custom Column',
          type: 'text',
          required: false,
          section: 'custom',
        };
    }

    setCustomFields([...customFields, presetField]);
  };

  // Field Updates
  const handleUpdateField = (index: number, updates: Partial<CustomField>) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], ...updates };
    setCustomFields(updated);
  };

  const handleRemoveField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleDuplicateField = (index: number) => {
    const original = customFields[index];
    const duplicated: CustomField = {
      ...original,
      id: `f_${Date.now()}`,
      label: `${original.label} (Copy)`,
    };
    const updated = [...customFields];
    updated.splice(index + 1, 0, duplicated);
    setCustomFields(updated);
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === customFields.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...customFields];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setCustomFields(updated);
  };

  // Add option to select / radio / checkbox field
  const handleAddOptionToField = (fieldIndex: number) => {
    const field = customFields[fieldIndex];
    const currentOptions = field.options || [];
    const newOptions = [...currentOptions, `Option ${currentOptions.length + 1}`];
    handleUpdateField(fieldIndex, { options: newOptions });
  };

  const handleUpdateOptionInField = (fieldIndex: number, optionIndex: number, newVal: string) => {
    const field = customFields[fieldIndex];
    const currentOptions = field.options ? [...field.options] : [];
    currentOptions[optionIndex] = newVal;
    handleUpdateField(fieldIndex, { options: currentOptions });
  };

  const handleRemoveOptionFromField = (fieldIndex: number, optionIndex: number) => {
    const field = customFields[fieldIndex];
    const currentOptions = field.options ? field.options.filter((_, i) => i !== optionIndex) : [];
    handleUpdateField(fieldIndex, { options: currentOptions });
  };

  // Save and Publish Form to Frontend
  const handlePublishFormToFrontend = async () => {
    if (!formTitle.trim()) {
      alert('Form ka title likhna anivarya hai.');
      return;
    }

    setIsSaving(true);
    setSaveSuccessMessage('');

    try {
      const payload: Partial<FormConfig> = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        academic_year: academicYear.trim(),
        fee_amount: Number(feeAmount) || 0,
        exam_date: examDate,
        exam_time: examTime,
        exam_center_default: examCenter,
        total_marks: Number(totalMarks) || 100,
        passing_marks: Number(passingMarks) || 40,
        custom_fields: customFields,
        is_active: true,
      };

      const res = await api.updateForm(currentForm._id, payload);

      if (res.success) {
        setIsSaving(false);
        setSaveSuccessMessage('Form Schema safalta-purvak Frontend me Send kar diya gaya hai! Naye aavedan me yeh columns ab live show ho rahe hain.');
        onRefreshForms();
        setTimeout(() => {
          setSaveSuccessMessage('');
        }, 6000);
      } else {
        setIsSaving(false);
        alert(res.message || 'Form update nahi ho paya.');
      }
    } catch (e) {
      setIsSaving(false);
      alert('Server error: Form save nahi ho saka.');
    }
  };

  // Toggle Admit Card / Result statuses
  const handleToggleAdmitCard = async () => {
    const updatedStatus = !currentForm.admit_card_status.is_released;
    const releaseDate = updatedStatus ? new Date().toISOString().slice(0, 10) : null;
    try {
      await api.updateForm(currentForm._id, {
        admit_card_status: { is_released: updatedStatus, release_date: releaseDate },
      });
      onRefreshForms();
    } catch (e) {
      alert('Failed to toggle admit card status');
    }
  };

  const handleToggleResult = async () => {
    const updatedStatus = !currentForm.result_status.is_declared;
    const declareDate = updatedStatus ? new Date().toISOString().slice(0, 10) : null;
    try {
      await api.updateForm(currentForm._id, {
        result_status: { is_declared: updatedStatus, declare_date: declareDate },
      });
      onRefreshForms();
    } catch (e) {
      alert('Failed to toggle result status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Google Forms Style Schema Customizer
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-[11px] font-mono font-bold">
                Frontend Sync Active
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Dynamic Pariksha Form Builder & Column Editor
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Google Forms ki tarah manually columns/questions jodein, fees aur rules set karein, aur 1-click me frontend par live send karein.
            </p>
          </div>

          {/* Right Action: Publish to Frontend Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              id="publish-to-frontend-btn"
              onClick={handlePublishFormToFrontend}
              disabled={isSaving}
              className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSaving ? (
                <>
                  <Save className="w-4 h-4 animate-spin" />
                  <span>Frontend Par Bhej Rahe Hain...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-slate-950" />
                  <span>Frontend Me Live Bhejein (Publish)</span>
                </>
              )}
            </button>

            {onNavigateToFrontendForm && (
              <button
                type="button"
                onClick={() => onNavigateToFrontendForm(currentForm.form_id)}
                className="px-4 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-amber-400" />
                <span>Candidate View Kholein</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Scheme Selector & Sub-tabs */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-400 whitespace-nowrap">Active Scheme:</label>
            <select
              id="active-form-picker"
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="bg-slate-950 text-amber-400 font-mono font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-700 outline-none w-full sm:w-auto"
            >
              {forms.map((f) => (
                <option key={f.form_id} value={f.form_id}>
                  {f.title} ({f.form_id}) - ₹{f.fee_amount}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 self-start md:self-auto">
            <button
              id="subtab-builder"
              onClick={() => setActiveSubTab('builder')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                activeSubTab === 'builder'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Google Form Builder ({customFields.length} Columns)</span>
            </button>

            <button
              id="subtab-preview"
              onClick={() => setActiveSubTab('preview')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                activeSubTab === 'preview'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Frontend Preview</span>
            </button>

            <button
              id="subtab-lifecycle"
              onClick={() => setActiveSubTab('lifecycle')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                activeSubTab === 'lifecycle'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Admit Card & Result Controls</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccessMessage && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-emerald-950">
                Form Frontend Par Live Ho Gaya Hai!
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">{saveSuccessMessage}</p>
            </div>
          </div>
          {onNavigateToFrontendForm && (
            <button
              onClick={() => onNavigateToFrontendForm(currentForm.form_id)}
              className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition-colors shrink-0 flex items-center gap-1.5"
            >
              <span>Check Karein</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 1: GOOGLE FORM BUILDER */}
      {/* ========================================================= */}
      {activeSubTab === 'builder' && (
        <div className="space-y-6">
          {/* Form Header Card (Google Forms Top Card Style) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-t-8 border-t-amber-500 border-x border-b border-slate-200 shadow-md">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Pariksha / Scheme Ka Pura Title (Form Title)
                </label>
                <input
                  type="text"
                  id="builder-form-title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Medha Scholarship & Talent Search Examination 2026"
                  className="w-full text-lg sm:text-xl font-black text-slate-900 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-300 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Form Description / Disha Nirdesh (Description)
                </label>
                <textarea
                  id="builder-form-description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  placeholder="Form bharnewale vidyarthiyo ke liye jaruri jankari..."
                  className="w-full text-xs text-slate-800 px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-300 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Exam Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Aavedan Fees (₹)
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      value={feeAmount}
                      onChange={(e) => setFeeAmount(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Shaikshanik Satra
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Pariksha Tithi (Date)
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Exam Timing
                  </label>
                  <input
                    type="text"
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Pre-Configured Column Injector Chips Bar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Quick Column Injector (1-Click Me Common Fields Jodein)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Click karke sidhe form me add karein
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                id="preset-mother-name"
                onClick={() => handleInjectPredefinedColumn('mother_name')}
                className="px-3 py-1.5 bg-slate-50 hover:bg-amber-100 hover:text-slate-950 border border-slate-300 hover:border-amber-300 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                <span>Mata Ji Ka Naam</span>
              </button>

              <button
                type="button"
                id="preset-aadhaar"
                onClick={() => handleInjectPredefinedColumn('aadhaar')}
                className="px-3 py-1.5 bg-slate-50 hover:bg-amber-100 hover:text-slate-950 border border-slate-300 hover:border-amber-300 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                <span>Aadhaar Card No.</span>
              </button>

              <button
                type="button"
                id="preset-category"
                onClick={() => handleInjectPredefinedColumn('category')}
                className="px-3 py-1.5 bg-slate-50 hover:bg-amber-100 hover:text-slate-950 border border-slate-300 hover:border-amber-300 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                <span>Caste / Category Dropdown</span>
              </button>

              <button
                type="button"
                id="preset-address"
                onClick={() => handleInjectPredefinedColumn('address')}
                className="px-3 py-1.5 bg-slate-50 hover:bg-amber-100 hover:text-slate-950 border border-slate-300 hover:border-amber-300 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                <span>Sthai Pata (Address Box)</span>
              </button>

              <button
                type="button"
                id="preset-signature"
                onClick={() => handleInjectPredefinedColumn('signature_upload')}
                className="px-3 py-1.5 bg-slate-50 hover:bg-amber-100 hover:text-slate-950 border border-slate-300 hover:border-amber-300 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                <span>Signature Upload File</span>
              </button>

              <button
                type="button"
                id="preset-medium"
                onClick={() => handleInjectPredefinedColumn('medium')}
                className="px-3 py-1.5 bg-slate-50 hover:bg-amber-100 hover:text-slate-950 border border-slate-300 hover:border-amber-300 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                <span>Exam Medium (Hindi/Eng)</span>
              </button>

              <button
                type="button"
                id="preset-stream"
                onClick={() => handleInjectPredefinedColumn('stream')}
                className="px-3 py-1.5 bg-slate-50 hover:bg-amber-100 hover:text-slate-950 border border-slate-300 hover:border-amber-300 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                <span>Stream / Subject Choice</span>
              </button>

              <button
                type="button"
                id="preset-bank"
                onClick={() => handleInjectPredefinedColumn('bank_details')}
                className="px-3 py-1.5 bg-slate-50 hover:bg-amber-100 hover:text-slate-950 border border-slate-300 hover:border-amber-300 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                <span>Bank Account / IFSC</span>
              </button>

              <button
                type="button"
                id="preset-income"
                onClick={() => handleInjectPredefinedColumn('annual_income')}
                className="px-3 py-1.5 bg-slate-50 hover:bg-amber-100 hover:text-slate-950 border border-slate-300 hover:border-amber-300 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                <span>Annual Family Income</span>
              </button>

              <button
                type="button"
                id="add-blank-field-btn"
                onClick={handleAddBlankColumn}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Naya Custom Sawal (Blank Field)</span>
              </button>
            </div>
          </div>

          {/* Form Questions & Columns List (Google Forms Card Stack) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>Form Ke Sabhi Columns / Questions ({customFields.length})</span>
              </h3>
              <span className="text-xs text-slate-500">
                Upar/Neeche arrange karein, mandatory switch karein aur Frontend me bhejein
              </span>
            </div>

            {customFields.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-300">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4 font-bold">
                  <Type className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Abhi koi custom column nahi joda gaya hai</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Upar diye gaye <strong>Quick Column Injector</strong> se fields select karein ya <strong>+ Naya Custom Sawal</strong> par click karein.
                </p>
                <button
                  type="button"
                  onClick={handleAddBlankColumn}
                  className="mt-5 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Pehla Question Jodein</span>
                </button>
              </div>
            ) : (
              customFields.map((field, idx) => (
                <div
                  key={field.id || idx}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 group relative"
                >
                  {/* Top Bar of Field Card */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Column #{idx + 1}
                      </span>
                    </div>

                    {/* Field Type Selector */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <label className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Type:</label>
                      <select
                        value={field.type}
                        onChange={(e) => handleUpdateField(idx, { type: e.target.value as any })}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-white text-xs font-bold text-slate-900 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-auto"
                      >
                        <option value="text">📝 Short Answer (Chhota Text)</option>
                        <option value="textarea">📄 Paragraph (Bada Text / Pata)</option>
                        <option value="number">🔢 Number (Ank)</option>
                        <option value="date">📅 Date Picker (Tithi)</option>
                        <option value="select">🔽 Dropdown (Single Select Menu)</option>
                        <option value="radio">🔘 Multiple Choice (Radio Buttons)</option>
                        <option value="checkbox">☑️ Checkboxes (Bahu-vikalpi Multi-select)</option>
                        <option value="file">📎 File Upload (Photo / Signature / PDF)</option>
                        <option value="phone">📞 Phone (10 Digit Mobile)</option>
                        <option value="email">✉️ Email Address</option>
                      </select>
                    </div>
                  </div>

                  {/* Main Inputs of the Question */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Question / Field Ka Naam (Label) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleUpdateField(idx, { label: e.target.value })}
                        placeholder="e.g. Mata Ji Ka Naam"
                        className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Category / Section Group
                      </label>
                      <select
                        value={field.section || 'custom'}
                        onChange={(e) => handleUpdateField(idx, { section: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="personal">Personal Jankari (Step 1)</option>
                        <option value="academic">Academic & School (Step 2)</option>
                        <option value="contact">Contact & Address</option>
                        <option value="document">Document & Uploads</option>
                        <option value="custom">Anya Vibhag (Custom Section)</option>
                      </select>
                    </div>
                  </div>

                  {/* Helper description / placeholder */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Placeholder (Example Text)
                      </label>
                      <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={(e) => handleUpdateField(idx, { placeholder: e.target.value })}
                        placeholder="Jaise: 12 digit number dalein"
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Helper Text / Nirdesh (Optional)
                      </label>
                      <input
                        type="text"
                        value={field.helper_text || ''}
                        onChange={(e) => handleUpdateField(idx, { helper_text: e.target.value })}
                        placeholder="Chhoti guideline jo field ke neeche dikhegi"
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  {/* OPTIONS EDITOR (for Select, Radio, Checkbox) */}
                  {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <ListOrdered className="w-3.5 h-3.5 text-amber-600" />
                          <span>Vikalp / Options List:</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddOptionToField(idx)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ Option Jodein</span>
                        </button>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {(!field.options || field.options.length === 0) && (
                          <p className="text-[11px] text-slate-400 italic">
                            Koi option nahi hai. "+ Option Jodein" par click karke options add karein.
                          </p>
                        )}
                        {field.options?.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-mono w-5 text-right">
                              {optIdx + 1}.
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleUpdateOptionInField(idx, optIdx, e.target.value)}
                              placeholder={`Option ${optIdx + 1}`}
                              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveOptionFromField(idx, optIdx)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Option"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Card Bottom Toolbar */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {/* Left Actions: Reordering */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveField(idx, 'up')}
                        disabled={idx === 0}
                        className={`p-1.5 rounded-lg border flex items-center gap-1 font-bold ${
                          idx === 0
                            ? 'opacity-30 border-slate-200 text-slate-400 cursor-not-allowed'
                            : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                        title="Upar Karein"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Upar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveField(idx, 'down')}
                        disabled={idx === customFields.length - 1}
                        className={`p-1.5 rounded-lg border flex items-center gap-1 font-bold ${
                          idx === customFields.length - 1
                            ? 'opacity-30 border-slate-200 text-slate-400 cursor-not-allowed'
                            : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                        title="Neeche Karein"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Neeche</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicateField(idx)}
                        className="p-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center gap-1 font-bold ml-1"
                        title="Duplicate Column"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Copy</span>
                      </button>
                    </div>

                    {/* Right Actions: Required Toggle & Delete */}
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <span className="text-xs font-bold text-slate-700">
                          {field.required ? (
                            <span className="text-rose-600 font-black">★ Anivarya (Required)</span>
                          ) : (
                            <span className="text-slate-500">Optional</span>
                          )}
                        </span>
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => handleUpdateField(idx, { required: e.target.checked })}
                          className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400 cursor-pointer"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveField(idx)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1 font-bold"
                        title="Hataiyein"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Hataiyein</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Floating/Fixed Save Bar */}
          <div className="sticky bottom-4 z-30 bg-slate-950/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-2xl flex flex-col sm:flex-row justify-between items-center gap-4 text-white">
            <div className="flex items-center gap-3 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>
                Kul Columns: <strong className="text-amber-400 font-mono">{customFields.length}</strong> | Fees: <strong className="text-white font-mono">₹{feeAmount}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleAddBlankColumn}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>+ Column Jodein</span>
              </button>

              <button
                type="button"
                id="bottom-publish-btn"
                onClick={handlePublishFormToFrontend}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Save className="w-4 h-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Frontend Par Live Bhejein</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 2: LIVE FRONTEND PREVIEW */}
      {/* ========================================================= */}
      {activeSubTab === 'preview' && (
        <div className="bg-slate-100 rounded-3xl p-6 sm:p-8 border border-slate-200">
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-300 shadow-xl space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs uppercase tracking-wider inline-block mb-1">
                Candidate Interactive Preview
              </span>
              <h2 className="text-xl font-black text-slate-900">{formTitle || 'BSEDRC Form'}</h2>
              <p className="text-xs text-slate-500 mt-1">{formDescription || 'Shaikshanik Aavedan'}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3 font-mono text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border">
                <span>Fees: <strong>₹{feeAmount}</strong></span>
                <span>•</span>
                <span>Session: <strong>{academicYear}</strong></span>
                <span>•</span>
                <span>Exam: <strong>{examDate}</strong></span>
              </div>
            </div>

            {/* Render dynamically created custom fields */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b pb-1">
                Dynamic Questions Preview
              </h3>

              {customFields.map((f, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </label>

                  {f.type === 'textarea' ? (
                    <textarea
                      rows={2}
                      placeholder={f.placeholder || 'Type address/paragraph here...'}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                    />
                  ) : f.type === 'select' ? (
                    <select className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white">
                      <option value="">Select option</option>
                      {f.options?.map((opt, oIdx) => (
                        <option key={oIdx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : f.type === 'radio' ? (
                    <div className="space-y-1.5 pt-1">
                      {f.options?.map((opt, oIdx) => (
                        <label key={oIdx} className="flex items-center gap-2 text-xs text-slate-700">
                          <input type="radio" name={`preview_${i}`} className="text-amber-500" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : f.type === 'checkbox' ? (
                    <div className="space-y-1.5 pt-1">
                      {f.options?.map((opt, oIdx) => (
                        <label key={oIdx} className="flex items-center gap-2 text-xs text-slate-700">
                          <input type="checkbox" className="text-amber-500 rounded" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : f.type === 'file' ? (
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-white">
                      <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                      <p className="text-xs font-bold text-slate-700">{f.label} Upload Karein</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{f.helper_text || 'Max file size 2MB'}</p>
                    </div>
                  ) : (
                    <input
                      type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                      placeholder={f.placeholder || `Enter ${f.label}`}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                    />
                  )}

                  {f.helper_text && (
                    <p className="text-[10px] text-slate-500 italic">{f.helper_text}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 3: ADMIT CARD & RESULT CONTROLS */}
      {/* ========================================================= */}
      {activeSubTab === 'lifecycle' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admit Card Controller */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Admit Card Release Controller</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Rajya-stariya pariksha ke liye sabhi candidates ke Hall Tickets aur QR Code admit cards ko download ke liye active karein.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Current Download Status</span>
                <span className="text-[11px] text-slate-500">
                  {currentForm.admit_card_status.is_released
                    ? `Active & Jari Hai (Date: ${currentForm.admit_card_status.release_date || 'Live'})`
                    : 'Abhi download band hai'}
                </span>
              </div>

              <button
                type="button"
                id="toggle-admit-card-release"
                onClick={handleToggleAdmitCard}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  currentForm.admit_card_status.is_released
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {currentForm.admit_card_status.is_released ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>JARI HAI (ACTIVE)</span>
                  </>
                ) : (
                  <span>LOCKED (Jari Karein)</span>
                )}
              </button>
            </div>
          </div>

          {/* Result Declaration Controller */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Result & Marksheet Publication</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluate kiye gaye marksheet, division, rank aur scorecards ko Candidate Portal aur Notice Gazette par publish karein.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Publication Status</span>
                <span className="text-[11px] text-slate-500">
                  {currentForm.result_status.is_declared
                    ? `Declared & Ghoshit (Date: ${currentForm.result_status.declare_date || 'Live'})`
                    : 'Result abhi band hai'}
                </span>
              </div>

              <button
                type="button"
                id="toggle-result-declare"
                onClick={handleToggleResult}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  currentForm.result_status.is_declared
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {currentForm.result_status.is_declared ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>GHOSHIT HAI (DECLARED)</span>
                  </>
                ) : (
                  <span>BAND HAI (Ghoshit Karein)</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
