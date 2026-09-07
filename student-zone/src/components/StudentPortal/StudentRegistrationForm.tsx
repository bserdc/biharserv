import React, { useState, useEffect } from 'react';
import {
  User,
  School as SchoolIcon,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Camera,
  Upload,
  Calendar,
  Phone,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  Sparkles,
  HelpCircle,
  Type,
  AlignLeft,
  Hash,
  ListOrdered,
  Radio,
  Mail,
  FileText
} from 'lucide-react';
import { FormConfig, School, Student, StudentUser, CustomField } from '../../types';
import { api } from '../../services/api';
import { PaymentModal } from './PaymentModal';

interface StudentRegistrationFormProps {
  forms: FormConfig[];
  studentUser?: StudentUser | null;
  onRegistrationComplete: (newStudent: Student) => void;
  onNavigateToTracker: (regId: string) => void;
}

export const StudentRegistrationForm: React.FC<StudentRegistrationFormProps> = ({
  forms,
  studentUser,
  onRegistrationComplete,
  onNavigateToTracker,
}) => {
  const [selectedFormId, setSelectedFormId] = useState<string>(forms[0]?.form_id || 'EXAM_2026_01');
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Cascading School Selection States
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [blocks, setBlocks] = useState<string[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string>('');
  const [schoolsInBlock, setSchoolsInBlock] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  // Personal Form Fields
  const [formData, setFormData] = useState({
    name: studentUser?.name || '',
    father_name: '',
    dob: '',
    mobile: studentUser?.mobile || '',
    email: '',
    gender: 'Male',
    category: 'OBC',
    address: '',
    current_class: '10th',
    previous_year_percentage: '85',
    photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&crop=faces',
    custom_responses: {} as Record<string, any>,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [registeredStudent, setRegisteredStudent] = useState<Student | null>(null);

  const activeForm = forms.find((f) => f.form_id === selectedFormId) || forms[0];

  // Auto fill if studentUser changes or logs in
  useEffect(() => {
    if (studentUser) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || studentUser.name || '',
        mobile: prev.mobile || studentUser.mobile || '',
      }));
    }
  }, [studentUser]);

  // Load Initial Districts
  useEffect(() => {
    api.getDistricts().then((res) => {
      if (res.success && res.districts) {
        setDistricts(res.districts);
        if (res.districts.length > 0) {
          setSelectedDistrict(res.districts[0]);
        }
      }
    });
  }, []);

  // Load Blocks on District Change
  useEffect(() => {
    if (selectedDistrict) {
      api.getBlocks(selectedDistrict).then((res) => {
        if (res.success && res.blocks) {
          setBlocks(res.blocks);
          if (res.blocks.length > 0) {
            setSelectedBlock(res.blocks[0]);
          } else {
            setSelectedBlock('');
            setSchoolsInBlock([]);
            setSelectedSchool(null);
          }
        }
      });
    }
  }, [selectedDistrict]);

  // Load Schools on Block Change
  useEffect(() => {
    if (selectedDistrict && selectedBlock) {
      api.getSchoolsByBlock(selectedDistrict, selectedBlock).then((res) => {
        if (res.success && res.schools) {
          setSchoolsInBlock(res.schools);
          if (res.schools.length > 0) {
            setSelectedSchool(res.schools[0]);
          } else {
            setSelectedSchool(null);
          }
        }
      });
    }
  }, [selectedDistrict, selectedBlock]);

  // Handle Photo upload simulation
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle generic file upload for custom fields
  const handleCustomFileUpload = (fieldKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          custom_responses: {
            ...prev.custom_responses,
            [fieldKey]: `[Uploaded Document: ${file.name}]`,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckboxToggle = (fieldKey: string, optionValue: string) => {
    const currentList: string[] = Array.isArray(formData.custom_responses[fieldKey])
      ? formData.custom_responses[fieldKey]
      : formData.custom_responses[fieldKey]
      ? [String(formData.custom_responses[fieldKey])]
      : [];

    const updated = currentList.includes(optionValue)
      ? currentList.filter((v) => v !== optionValue)
      : [...currentList, optionValue];

    setFormData((prev) => ({
      ...prev,
      custom_responses: {
        ...prev.custom_responses,
        [fieldKey]: updated,
      },
    }));
  };

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Student ka pura naam likhna zaroori hai';
    if (!formData.father_name.trim()) errors.father_name = 'Pita ji ka naam likhna zaroori hai';
    if (!formData.dob) errors.dob = 'Janam tithi (DOB) select karein';
    if (!formData.mobile.trim() || formData.mobile.length < 10) errors.mobile = 'Sahi 10-digit mobile number dalein';

    // Custom fields validation (step 1 / personal / custom)
    activeForm?.custom_fields?.forEach((field) => {
      const key = field.field_key || field.label;
      const val = formData.custom_responses[key] || formData.custom_responses[field.label];
      if (field.required && (!val || (Array.isArray(val) && val.length === 0))) {
        errors[field.label] = `${field.label} anivarya (required) hai`;
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!selectedDistrict) errors.district = 'Kripya apna jila (District) chunein';
    if (!selectedBlock) errors.block = 'Kripya apna prakhand (Block) chunein';
    if (!selectedSchool) errors.school = 'Kripya apna school select karein';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    }
  };

  const handlePaymentSuccess = async (paymentDetails: any) => {
    setIsPaymentOpen(false);

    try {
      const payload = {
        form_id: activeForm.form_id,
        personal_data: {
          name: formData.name,
          father_name: formData.father_name,
          dob: formData.dob,
          mobile: formData.mobile,
          email: formData.email,
          photo_url: formData.photo_url,
          gender: formData.gender,
          category: formData.category,
          address: formData.address,
          custom_responses: formData.custom_responses,
        },
        school_data: {
          udise_code: selectedSchool?.udise_code || '10020100101',
          school_name: selectedSchool?.school_name || 'Govt High School',
          district: selectedDistrict,
          block: selectedBlock,
          panchayat: selectedSchool?.panchayat || '',
          current_class: formData.current_class,
          previous_year_percentage: Number(formData.previous_year_percentage) || 80,
        },
        payment_mode: paymentDetails.payment_mode,
        amount: activeForm.fee_amount,
        txn_id: paymentDetails.txn_id,
        order_id: paymentDetails.order_id,
      };

      const res = await api.verifyAndRegisterStudent(payload);
      if (res.success && res.student) {
        setRegisteredStudent(res.student);
        onRegistrationComplete(res.student);
        setCurrentStep(4);
      } else {
        alert(res.error || 'Registration pura karne me dikkat aayi');
      }
    } catch (e) {
      alert('Network issue: Registration submit nahi ho paya');
    }
  };

  // Helper to render individual dynamic custom fields
  const renderDynamicField = (field: CustomField) => {
    const key = field.field_key || field.label;
    const value = formData.custom_responses[key] ?? formData.custom_responses[field.label] ?? '';
    const error = formErrors[field.label];

    if (field.type === 'section') {
      return (
        <div key={field.label} className="col-span-full pt-4 pb-2 border-b border-slate-200">
          <h4 className="text-sm font-extrabold text-slate-900">{field.label}</h4>
          {field.helper_text && <p className="text-xs text-slate-500">{field.helper_text}</p>}
        </div>
      );
    }

    return (
      <div key={field.label} className={field.type === 'textarea' ? 'col-span-full' : ''}>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-bold text-slate-700">
            {field.label} {field.required && <span className="text-red-500 font-bold">*</span>}
          </label>
        </div>

        {/* Text / Phone / Email */}
        {(field.type === 'text' || field.type === 'phone' || field.type === 'email') && (
          <input
            type={field.type === 'phone' ? 'tel' : field.type === 'email' ? 'email' : 'text'}
            value={value}
            onChange={(e) =>
              setFormData({
                ...formData,
                custom_responses: { ...formData.custom_responses, [key]: e.target.value, [field.label]: e.target.value },
              })
            }
            placeholder={field.placeholder || `${field.label} likhein`}
            className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
              error ? 'border-red-500 bg-red-50/50' : 'border-slate-300 bg-white'
            } focus:ring-2 focus:ring-amber-500 focus:outline-hidden`}
          />
        )}

        {/* Number */}
        {field.type === 'number' && (
          <input
            type="number"
            value={value}
            onChange={(e) =>
              setFormData({
                ...formData,
                custom_responses: { ...formData.custom_responses, [key]: e.target.value, [field.label]: e.target.value },
              })
            }
            placeholder={field.placeholder || '0'}
            className={`w-full px-3.5 py-2.5 text-xs rounded-xl font-mono border ${
              error ? 'border-red-500 bg-red-50/50' : 'border-slate-300 bg-white'
            } focus:ring-2 focus:ring-amber-500 focus:outline-hidden`}
          />
        )}

        {/* Date */}
        {field.type === 'date' && (
          <input
            type="date"
            value={value}
            onChange={(e) =>
              setFormData({
                ...formData,
                custom_responses: { ...formData.custom_responses, [key]: e.target.value, [field.label]: e.target.value },
              })
            }
            className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
              error ? 'border-red-500 bg-red-50/50' : 'border-slate-300 bg-white'
            } focus:ring-2 focus:ring-amber-500 focus:outline-hidden`}
          />
        )}

        {/* Textarea */}
        {field.type === 'textarea' && (
          <textarea
            rows={3}
            value={value}
            onChange={(e) =>
              setFormData({
                ...formData,
                custom_responses: { ...formData.custom_responses, [key]: e.target.value, [field.label]: e.target.value },
              })
            }
            placeholder={field.placeholder || `${field.label} ka pura vivaran dalein...`}
            className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
              error ? 'border-red-500 bg-red-50/50' : 'border-slate-300 bg-white'
            } focus:ring-2 focus:ring-amber-500 focus:outline-hidden`}
          />
        )}

        {/* Dropdown Select */}
        {field.type === 'select' && (
          <select
            value={value}
            onChange={(e) =>
              setFormData({
                ...formData,
                custom_responses: { ...formData.custom_responses, [key]: e.target.value, [field.label]: e.target.value },
              })
            }
            className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
              error ? 'border-red-500 bg-red-50/50' : 'border-slate-300 bg-white'
            }`}
          >
            <option value="">Option Chunein</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}

        {/* Radio Multiple Choice */}
        {field.type === 'radio' && (
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
            {field.options?.map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
                <input
                  type="radio"
                  name={`radio_${field.label}`}
                  value={opt}
                  checked={value === opt}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      custom_responses: { ...formData.custom_responses, [key]: e.target.value, [field.label]: e.target.value },
                    })
                  }
                  className="text-amber-500 focus:ring-amber-400"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        )}

        {/* Checkbox Multi-Select */}
        {field.type === 'checkbox' && (
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
            {field.options?.map((opt) => {
              const currentArray: string[] = Array.isArray(value) ? value : [];
              const isChecked = currentArray.includes(opt);
              return (
                <label key={opt} className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCheckboxToggle(key, opt)}
                    className="text-amber-500 rounded focus:ring-amber-400"
                  />
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* File Upload */}
        {field.type === 'file' && (
          <div className="p-3.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-800 block">
                {value ? String(value) : 'Document / Photo Upload Karein'}
              </span>
              <span className="text-[10px] text-slate-400">Supported: PDF, JPG, PNG (Max 2MB)</span>
            </div>
            <label className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Upload</span>
              <input
                type="file"
                onChange={(e) => handleCustomFileUpload(key, e)}
                className="hidden"
              />
            </label>
          </div>
        )}

        {field.helper_text && <p className="text-[10px] text-slate-500 mt-1 italic">{field.helper_text}</p>}
        {error && <p className="text-[11px] text-red-600 mt-1 font-medium">{error}</p>}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Logged in student banner */}
      {studentUser && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Aap Candidate ke roop me logged in hain: <strong>{studentUser.name}</strong> (Reg ID:{' '}
              <span className="font-mono font-bold">{studentUser.registration_id}</span>)
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTracker(studentUser.registration_id)}
            className="text-[11px] font-bold text-emerald-800 underline hover:text-emerald-900"
          >
            My Application Record
          </button>
        </div>
      )}

      {/* Banner Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 mb-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Rajya Stariya Pratibha Khoj Pariksha
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Student Admission & Exam Online Registration
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Online aavedan bharein, auto U-DISE verification ke sath school select karein, aur turant Registration ID va Admit Card prapt karein.
            </p>
          </div>

          {/* Exam Selection Dropdown */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 w-full sm:w-auto">
            <label className="block text-[11px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">
              Pariksha Form Chunein
            </label>
            <select
              id="exam-form-selector"
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="bg-slate-900 text-amber-400 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 outline-none w-full sm:min-w-[240px]"
            >
              {forms.map((f) => (
                <option key={f.form_id} value={f.form_id}>
                  {f.title} (Fees: ₹{f.fee_amount})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div
            className={`p-2.5 rounded-xl transition-all ${
              currentStep === 1
                ? 'bg-amber-500 text-slate-950 font-bold'
                : currentStep > 1
                ? 'bg-slate-800 text-amber-400'
                : 'text-slate-500 bg-slate-900/50'
            }`}
          >
            <span className="block text-[10px] opacity-80 font-mono font-bold">STEP 1</span>
            <span className="truncate block font-medium">1. Personal Jankari</span>
          </div>
          <div
            className={`p-2.5 rounded-xl transition-all ${
              currentStep === 2
                ? 'bg-amber-500 text-slate-950 font-bold'
                : currentStep > 2
                ? 'bg-slate-800 text-amber-400'
                : 'text-slate-500 bg-slate-900/50'
            }`}
          >
            <span className="block text-[10px] opacity-80 font-mono font-bold">STEP 2</span>
            <span className="truncate block font-medium">2. School & U-DISE</span>
          </div>
          <div
            className={`p-2.5 rounded-xl transition-all ${
              currentStep === 3
                ? 'bg-amber-500 text-slate-950 font-bold'
                : currentStep > 3
                ? 'bg-slate-800 text-amber-400'
                : 'text-slate-500 bg-slate-900/50'
            }`}
          >
            <span className="block text-[10px] opacity-80 font-mono font-bold">STEP 3</span>
            <span className="truncate block font-medium">3. Review & Payment</span>
          </div>
          <div
            className={`p-2.5 rounded-xl transition-all ${
              currentStep === 4 ? 'bg-emerald-600 text-white font-bold' : 'text-slate-500 bg-slate-900/50'
            }`}
          >
            <span className="block text-[10px] opacity-80 font-mono font-bold">STEP 4</span>
            <span className="truncate block font-medium">4. Reg ID & Receipt</span>
          </div>
        </div>
      </div>

      {/* STEP 1: PERSONAL INFORMATION & DYNAMIC CUSTOM FIELDS */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm animate-in fade-in duration-200 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Student Identity Jankari</h3>
              <p className="text-xs text-slate-500">School certificate ya Aadhaar Card ke anusar sahi vivaran bharein</p>
            </div>
          </div>

          {/* Photo upload row */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-24 h-28 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-white flex items-center justify-center relative shadow-xs shrink-0">
              {formData.photo_url ? (
                <img src={formData.photo_url} alt="Student" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <label className="text-xs font-bold text-slate-800 block">Candidate Passport Size Photo</label>
              <p className="text-[11px] text-slate-500">Saaf front-facing passport photo upload karein (JPEG/PNG up to 2MB)</p>
              <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Nayi Photo Upload Karein</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student ka Pura Naam <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="student-name-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jaise: Rohan Kumar"
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                  formErrors.name ? 'border-red-500 bg-red-50/50' : 'border-slate-300 bg-white'
                } focus:ring-2 focus:ring-amber-500 focus:outline-hidden`}
              />
              {formErrors.name && <p className="text-[11px] text-red-600 mt-1">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pita ji ka Naam (Father's Name) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="father-name-input"
                value={formData.father_name}
                onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                placeholder="Jaise: Suresh Kumar"
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                  formErrors.father_name ? 'border-red-500 bg-red-50/50' : 'border-slate-300 bg-white'
                } focus:ring-2 focus:ring-amber-500 focus:outline-hidden`}
              />
              {formErrors.father_name && <p className="text-[11px] text-red-600 mt-1">{formErrors.father_name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Janam Tithi (Date of Birth) <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dob-input"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                  formErrors.dob ? 'border-red-500 bg-red-50/50' : 'border-slate-300 bg-white'
                } focus:ring-2 focus:ring-amber-500 focus:outline-hidden`}
              />
              {formErrors.dob && <p className="text-[11px] text-red-600 mt-1">{formErrors.dob}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number (SMS / WhatsApp) <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="mobile-input"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="Jaise: 9876543210"
                maxLength={10}
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl font-mono border ${
                  formErrors.mobile ? 'border-red-500 bg-red-50/50' : 'border-slate-300 bg-white'
                } focus:ring-2 focus:ring-amber-500 focus:outline-hidden`}
              />
              {formErrors.mobile && <p className="text-[11px] text-red-600 mt-1">{formErrors.mobile}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ling (Gender)</label>
              <select
                id="gender-select"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="Male">Purush (Male)</option>
                <option value="Female">Mahila (Female)</option>
                <option value="Other">Anya (Other)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Koti / Category</label>
              <select
                id="category-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="General">Samanya (General)</option>
                <option value="OBC">OBC (Pichhada Varg)</option>
                <option value="EBC">EBC (Atyant Pichhada Varg)</option>
                <option value="SC">SC (Anusuchit Jati)</option>
                <option value="ST">ST (Anusuchit Janjati)</option>
                <option value="EWS">EWS</option>
              </select>
            </div>
          </div>

          {/* DYNAMIC GOOGLE FORMS CUSTOM COLUMNS / FIELDS */}
          {activeForm?.custom_fields && activeForm.custom_fields.length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Admin Dwara Nirdharit Anya Fields ({activeForm.custom_fields.length} Columns)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeForm.custom_fields.map((field) => renderDynamicField(field))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ghar ka Pata / Gram / Ward</label>
            <textarea
              id="address-input"
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Jaise: Gram/Mohalla, Post, Prakhand, Jila, Bihar - PIN Code"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              id="step1-next-btn"
              type="button"
              onClick={handleNext}
              className="w-full sm:w-auto justify-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-7 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <span>Aage Badhein: School & U-DISE Code</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CASCADING SCHOOL SEARCH & U-DISE VERIFICATION */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm animate-in fade-in duration-200 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">School & Shaikshanik Jankari</h3>
              <p className="text-xs text-slate-500">Apna Jila aur Prakhand chunein, jisse aapka School aur U-DISE code auto-load ho jaye</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. JILA (DISTRICT) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                1. Jila (District) Chunein <span className="text-red-500">*</span>
              </label>
              <select
                id="district-select"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. PRAKHAND (BLOCK) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                2. Prakhand (Block) Chunein <span className="text-red-500">*</span>
              </label>
              <select
                id="block-select"
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                {blocks.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. SCHOOL SELECTION */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                3. Apna School Select Karein <span className="text-red-500">*</span>
              </label>
              <select
                id="school-select"
                value={selectedSchool?.udise_code || ''}
                onChange={(e) => {
                  const s = schoolsInBlock.find((x) => x.udise_code === e.target.value);
                  setSelectedSchool(s || null);
                }}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                {schoolsInBlock.map((s) => (
                  <option key={s.udise_code} value={s.udise_code}>
                    {s.school_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* AUTO-FILLED U-DISE DETAILS CARD */}
          {selectedSchool && (
            <div className="bg-emerald-50/80 border border-emerald-300/80 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase text-emerald-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Verified Master School Record Mil Gaya
                </span>
                <span className="font-mono text-xs bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-lg font-bold border border-emerald-300">
                  U-DISE: {selectedSchool.udise_code}
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">{selectedSchool.school_name}</h4>
              <p className="text-xs text-slate-600 mt-1">
                Panchayat / Ward: <strong className="text-slate-800">{selectedSchool.panchayat || 'Main'}</strong> • Block: <strong className="text-slate-800">{selectedSchool.block}</strong> • Jila: <strong className="text-slate-800">{selectedSchool.district}</strong>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Abhi Kis Class me Padh Rahe Hain?</label>
              <select
                id="current-class-select"
                value={formData.current_class}
                onChange={(e) => setFormData({ ...formData, current_class: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="8th">Kaksha 8th</option>
                <option value="9th">Kaksha 9th</option>
                <option value="10th">Kaksha 10th (Matriculation)</option>
                <option value="11th">Kaksha 11th</option>
                <option value="12th">Kaksha 12th (Intermediate)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pichhli Class ka Score (%)</label>
              <input
                type="number"
                id="prev-percentage-input"
                value={formData.previous_year_percentage}
                onChange={(e) => setFormData({ ...formData, previous_year_percentage: e.target.value })}
                placeholder="Jaise: 84.5"
                min="30"
                max="100"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t border-slate-200">
            <button
              id="step2-back-btn"
              type="button"
              onClick={() => setCurrentStep(1)}
              className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Piche Jayein</span>
            </button>

            <button
              id="step2-next-btn"
              type="button"
              onClick={handleNext}
              className="w-full sm:w-auto justify-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-7 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <span>Aage Badhein: Review Aur Fees Bharein</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: APPLICATION REVIEW & FEE PAYMENT */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm animate-in fade-in duration-200 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Aavedan ki Jankari & Pariksha Shulk (Fee)</h3>
              <p className="text-xs text-slate-500">Payment karne se pehle apni sabhi details dhyan se check kar lein</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Chuna Gaya Pariksha Form</span>
                <h4 className="font-extrabold text-sm text-slate-900">{activeForm.title}</h4>
              </div>
              <span className="px-3 py-1.5 bg-amber-100 text-amber-900 rounded-xl font-bold text-xs">
                Registration Fees: ₹{activeForm.fee_amount.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-500 block text-[10px]">Student ka Naam</span>
                <strong className="text-slate-900 text-xs">{formData.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Pita ji ka Naam</span>
                <strong className="text-slate-900 text-xs">{formData.father_name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Janam Tithi (DOB)</span>
                <strong className="text-slate-900 text-xs font-mono">{formData.dob}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Mobile Number</span>
                <strong className="text-slate-900 text-xs font-mono">{formData.mobile}</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-slate-500 block text-[10px]">School & U-DISE Code</span>
              <strong className="text-slate-900 text-xs">
                {selectedSchool?.school_name} (UDISE: {selectedSchool?.udise_code})
              </strong>
              <p className="text-[11px] text-slate-500">
                Prakhand: {selectedBlock} • Jila: {selectedDistrict} • Kaksha: {formData.current_class}
              </p>
            </div>

            {/* Custom Field Responses Review Table */}
            {activeForm?.custom_fields && activeForm.custom_fields.length > 0 && (
              <div className="pt-3 border-t border-slate-200">
                <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider mb-2">
                  Anya Custom Columns & Answers
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-3 rounded-xl border border-slate-200">
                  {activeForm.custom_fields.map((f, i) => {
                    const k = f.field_key || f.label;
                    const ans = formData.custom_responses[k] ?? formData.custom_responses[f.label];
                    return (
                      <div key={i} className="text-xs">
                        <span className="text-slate-500 block text-[10px]">{f.label}:</span>
                        <strong className="text-slate-900">
                          {Array.isArray(ans) ? ans.join(', ') : ans ? String(ans) : 'N/A'}
                        </strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-amber-900">Turant Registration ID Generate Hoga</p>
              <p className="text-slate-600 text-[11px]">
                Safal payment ke turant baad council ki official ID (jaise: <code>BSEDRC-2026-XXXX</code>) jari ho jayegi.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Kul Shulk</span>
              <span className="text-xl font-black text-slate-900">₹{activeForm.fee_amount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t border-slate-200">
            <button
              id="step3-back-btn"
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Piche Jayein</span>
            </button>

            <button
              id="open-payment-btn"
              type="button"
              onClick={() => setIsPaymentOpen(true)}
              className="w-full sm:w-auto justify-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 px-6 rounded-2xl text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer text-center"
            >
              <span>₹{activeForm.fee_amount.toFixed(2)} Payment & Form Submit</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SUCCESS CONFIRMATION & REGISTRATION ID */}
      {currentStep === 4 && registeredStudent && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl text-center animate-in zoom-in-95 duration-200 space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 inline-block">
            Aavedan Aur Fees Safal Ho Gayi!
          </span>

          <h3 className="text-2xl font-black text-slate-900">Registration Safal Raha!</h3>
          <p className="text-slate-600 text-xs max-w-md mx-auto">
            Badhai ho, <strong>{registeredStudent.personal_data.name}</strong>. Aapka aavedan Council ke central database me darj ho chuka hai.
          </p>

          {/* Prominent Registration ID Display */}
          <div className="my-6 p-5 bg-slate-900 text-white rounded-3xl max-w-md mx-auto border border-slate-800 shadow-lg">
            <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider block mb-1">
              Aapki Official Student Registration ID
            </span>
            <div className="font-mono text-2xl sm:text-3xl font-black tracking-wider text-white select-all">
              {registeredStudent.registration_id}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
              <span>Txn ID: {registeredStudent.payment_info.txn_id}</span>
              <span>Payment: ₹{registeredStudent.payment_info.amount}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            <button
              id="view-status-after-reg-btn"
              type="button"
              onClick={() => onNavigateToTracker(registeredStudent.registration_id)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Aavedan Status & Admit Card Kholein</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentStep(1);
                setFormData({
                  name: '',
                  father_name: '',
                  dob: '',
                  mobile: '',
                  email: '',
                  gender: 'Male',
                  category: 'OBC',
                  address: '',
                  current_class: '10th',
                  previous_year_percentage: '85',
                  photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&crop=faces',
                  custom_responses: {},
                });
              }}
              className="border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs px-6 py-3 rounded-xl"
            >
              Naya Dusra Form Bharein
            </button>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        amount={activeForm.fee_amount}
        studentName={formData.name}
        mobile={formData.mobile}
        examTitle={activeForm.title}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
