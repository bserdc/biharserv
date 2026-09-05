import { School, FormConfig, Student, AnalyticsSummary, AdminUser, StudentUser, NoticeCircular, MeritTopper, GrievanceTicket, VerificationResult } from '../types';
import { supabase } from './supabase';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const { data } = await supabase.auth.getSession();
  const headers = new Headers(init?.headers);
  if (data.session?.access_token) headers.set('Authorization', `Bearer ${data.session.access_token}`);
  const target = typeof input === 'string' && input.startsWith('/') ? `${API_BASE_URL}${input}` : input;
  return globalThis.fetch(target, { ...init, headers });
};

export const api = {
  async registerStaff(payload: { role: 'principal' | 'examiner'; name: string; email: string; password: string; mobile?: string; school_name?: string; udise_code?: string }) { const res = await fetch('/api/staff/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); return res.json(); },
  async verifyStaffSession() { const res = await fetch('/api/staff/session'); return res.json(); },
  async getAdminAccounts() { const res = await fetch('/api/admin/accounts'); return res.json(); },
  async createExaminer(payload: { name: string; email: string; mobile?: string; approved?: boolean; active?: boolean }) { const res = await fetch('/api/admin/accounts/examiner', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); return res.json(); },
  async createPrincipal(payload: { name: string; email: string; mobile: string; school_name: string; udise_code: string; approved?: boolean; active?: boolean }) { const res = await fetch('/api/admin/accounts/principal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); return res.json(); },
  async updateAdminAccountStatus(id: string, payload: { approved?: boolean; active?: boolean }) { const res = await fetch(`/api/admin/accounts/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); return res.json(); },
  async assignPrincipalSchool(id: string, school_name: string, udise_code: string) { const res = await fetch(`/api/admin/accounts/${id}/principal-school`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ school_name, udise_code }) }); return res.json(); },
  async getHealth() {
    const res = await fetch('/api/health');
    return res.json();
  },

  async adminLogin(credentials: { username: string; password: string; role?: string }): Promise<{
    success: boolean;
    message?: string;
    admin?: AdminUser;
    token?: string;
    error?: string;
  }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email: credentials.username, password: credentials.password });
    if (error || !data.user || !data.session) return { success: false, error: error?.message || 'Supabase Auth sign-in failed.' };
    if (data.user.app_metadata?.role !== 'admin') { await supabase.auth.signOut(); return { success: false, error: 'Administrator access is not enabled for this account.' }; }
    const admin: AdminUser = { id: data.user.id, username: data.user.email || credentials.username, name: data.user.user_metadata?.name || data.user.email || 'Administrator', email: data.user.email || credentials.username, role: 'SUPER_ADMIN', role_label: 'Supabase Administrator', department: 'Council Administration', token: data.session.access_token, last_login: new Date().toISOString() };
    return { success: true, message: 'Authentication successful.', admin, token: data.session.access_token };
  },

  async adminVerify(token?: string): Promise<{ success: boolean; admin?: AdminUser }> {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return res.json();
  },

  async adminLogout(_token?: string): Promise<{ success: boolean }> {
    const { error } = await supabase.auth.signOut();
    return { success: !error };
  },

  async studentLogin(payload: { registration_id?: string; mobile?: string; dob?: string; otp?: string }): Promise<{
    success: boolean;
    message?: string;
    student?: StudentUser;
    studentRecord?: Student;
    token?: string;
    error?: string;
  }> {
    const res = await fetch('/api/student/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async studentVerify(token: string): Promise<{ success: boolean; student?: StudentUser; studentRecord?: Student; error?: string }> {
    const res = await fetch('/api/student/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  },

  async getDistricts(): Promise<{ success: boolean; districts: string[] }> {
    const res = await fetch('/api/schools/districts');
    return res.json();
  },

  async getBlocks(district: string): Promise<{ success: boolean; blocks: string[] }> {
    const res = await fetch(`/api/schools/blocks?district=${encodeURIComponent(district)}`);
    return res.json();
  },

  async getSchoolsByBlock(district: string, block: string): Promise<{ success: boolean; schools: School[] }> {
    const res = await fetch(`/api/schools/by-block?district=${encodeURIComponent(district)}&block=${encodeURIComponent(block)}`);
    return res.json();
  },

  async getSchools(params?: { district?: string; block?: string; q?: string; udise?: string }): Promise<{ success: boolean; count: number; schools: School[] }> {
    const query = new URLSearchParams();
    if (params?.district) query.set('district', params.district);
    if (params?.block) query.set('block', params.block);
    if (params?.q) query.set('q', params.q);
    if (params?.udise) query.set('udise', params.udise);

    const res = await fetch(`/api/schools?${query.toString()}`);
    return res.json();
  },

  async addSchool(school: Partial<School>): Promise<{ success: boolean; message: string; school?: School; error?: string }> {
    const res = await fetch('/api/schools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(school),
    });
    return res.json();
  },

  async bulkAddSchools(schools: Partial<School>[]): Promise<{ success: boolean; message: string; addedCount?: number; updatedCount?: number }> {
    const res = await fetch('/api/schools/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schools }),
    });
    return res.json();
  },

  async getForms(): Promise<{ success: boolean; forms: FormConfig[] }> {
    const res = await fetch('/api/forms');
    return res.json();
  },

  async getFormById(id: string): Promise<{ success: boolean; form: FormConfig }> {
    const res = await fetch(`/api/forms/${id}`);
    return res.json();
  },

  async createForm(formData: Partial<FormConfig>): Promise<{ success: boolean; message: string; form: FormConfig }> {
    const res = await fetch('/api/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    return res.json();
  },

  async updateForm(id: string, formData: Partial<FormConfig>): Promise<{ success: boolean; message: string; form: FormConfig }> {
    const res = await fetch(`/api/forms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    return res.json();
  },

  async createPaymentOrder(data: { form_id: string; amount: number; student_name: string }) {
    const res = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async verifyAndRegisterStudent(payload: {
    form_id: string;
    personal_data: any;
    school_data: any;
    payment_mode: string;
    amount: number;
    txn_id?: string;
    order_id?: string;
  }): Promise<{ success: boolean; message: string; student?: Student; registration_id?: string; error?: string }> {
    const res = await fetch('/api/payment/verify-and-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getStudentStatus(regId: string, dob?: string): Promise<{
    success: boolean;
    student?: Student;
    form?: FormConfig;
    lifecycle_access?: {
      form_download: boolean;
      admit_card_available: boolean;
      result_available: boolean;
      admit_card_release_date?: string | null;
      result_declare_date?: string | null;
    };
    message?: string;
  }> {
    const query = new URLSearchParams();
    query.set('reg_id', regId);
    query.set('dob', dob || '');

    const res = await fetch(`/api/student/status?${query.toString()}`);
    return res.json();
  },

  async getStudents(params?: {
    form_id?: string;
    udise_code?: string;
    district?: string;
    block?: string;
    payment_status?: string;
    result_status?: string;
    q?: string;
  }): Promise<{ success: boolean; count: number; students: Student[] }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val) query.set(key, val);
      });
    }
    const res = await fetch(`/api/students?${query.toString()}`);
    return res.json();
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<{ success: boolean; message: string; student: Student }> {
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async bulkGenerateAdmitCards(form_id?: string, default_center?: string): Promise<{ success: boolean; message: string; count: number }> {
    const res = await fetch('/api/students/bulk-admit-cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ form_id, default_center }),
    });
    return res.json();
  },

  async bulkUploadResults(results: Array<{ registration_id?: string; roll_no?: string; marks_obtained: number; total_marks?: number }>): Promise<{ success: boolean; message: string; updatedCount: number }> {
    const res = await fetch('/api/students/bulk-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results }),
    });
    return res.json();
  },

  async searchInstitution(payload: { udise_code?: string; district?: string; block?: string; school_name?: string }): Promise<{
    success: boolean;
    institution: any;
    stats: {
      total_students: number;
      paid_students: number;
      passed_students: number;
      pass_percentage: number;
    };
    students: Student[];
  }> {
    const res = await fetch('/api/institution/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getAnalytics(): Promise<{ success: boolean; analytics: AnalyticsSummary }> {
    const res = await fetch('/api/analytics');
    return res.json();
  },

  async getNotices(params?: { category?: string; q?: string }): Promise<{ success: boolean; count: number; notices: NoticeCircular[] }> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.q) query.set('q', params.q);
    const res = await fetch(`/api/notices?${query.toString()}`);
    return res.json();
  },

  async createNotice(data: Partial<NoticeCircular>): Promise<{ success: boolean; message: string; notice: NoticeCircular }> {
    const res = await fetch('/api/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteNotice(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/notices/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async getMeritGazette(params?: { district?: string; class_name?: string; category?: string }): Promise<{
    success: boolean;
    total_qualifiers: number;
    toppers_count: number;
    toppers: MeritTopper[];
    cutoffs: Array<{ category: string; qualifying_marks: number; merit_cutoff: number; highest_marks: number }>;
    gazette_published_date: string;
    gazette_notification_no: string;
  }> {
    const query = new URLSearchParams();
    if (params?.district) query.set('district', params.district);
    if (params?.class_name) query.set('class_name', params.class_name);
    if (params?.category) query.set('category', params.category);
    const res = await fetch(`/api/merit-gazette?${query.toString()}`);
    return res.json();
  },

  async verifyDocumentLookup(queryStr: string, type?: string): Promise<{
    success: boolean;
    is_valid?: boolean;
    verification?: VerificationResult;
    error?: string;
  }> {
    const query = new URLSearchParams();
    query.set('query', queryStr);
    if (type) query.set('type', type);
    const res = await fetch(`/api/verify/lookup?${query.toString()}`);
    return res.json();
  },

  async getGrievances(params?: { reg_id?: string; status?: string }): Promise<{ success: boolean; count: number; grievances: GrievanceTicket[] }> {
    const query = new URLSearchParams();
    if (params?.reg_id) query.set('reg_id', params.reg_id);
    if (params?.status) query.set('status', params.status);
    const res = await fetch(`/api/grievances?${query.toString()}`);
    return res.json();
  },

  async submitGrievance(data: Partial<GrievanceTicket>): Promise<{ success: boolean; message: string; ticket?: GrievanceTicket; error?: string }> {
    const res = await fetch('/api/grievances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateGrievance(id: string, updates: { status?: string; admin_remarks?: string; apply_correction_to_student?: any }): Promise<{ success: boolean; message: string; ticket?: GrievanceTicket }> {
    const res = await fetch(`/api/grievances/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async getExamAttendanceSheet(params?: { center_name?: string; room_no?: string; district?: string }): Promise<{
    success: boolean;
    exam_title: string;
    exam_date: string;
    exam_time: string;
    center_name: string;
    total_candidates: number;
    candidates: Array<{
      serial_no: number;
      registration_id: string;
      roll_no: string;
      student_name: string;
      father_name: string;
      dob: string;
      school_name: string;
      district: string;
      room_no: string;
      photo_url?: string;
      omr_barcode: string;
    }>;
  }> {
    const query = new URLSearchParams();
    if (params?.center_name) query.set('center_name', params.center_name);
    if (params?.room_no) query.set('room_no', params.room_no);
    if (params?.district) query.set('district', params.district);
    const res = await fetch(`/api/exam-center/attendance-sheet?${query.toString()}`);
    return res.json();
  },
};
