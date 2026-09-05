/**
 * Foundation Admin Portal & Student Lifecycle System
 * Data Models and API Types matching Roadmap Specification
 */

export interface School {
  _id: string;
  udise_code: string;
  school_name: string;
  district: string;
  block: string;
  panchayat: string;
  created_at?: string;
}

export interface CustomField {
  id?: string;
  label: string;
  field_key?: string;
  type: 'text' | 'textarea' | 'date' | 'number' | 'select' | 'radio' | 'checkbox' | 'file' | 'email' | 'phone' | 'section';
  required: boolean;
  options?: string[];
  placeholder?: string;
  helper_text?: string;
  section?: 'personal' | 'academic' | 'contact' | 'custom' | 'document';
  default_value?: string;
  is_core?: boolean;
}

export interface FormConfig {
  _id: string;
  form_id: string;
  title: string;
  description?: string;
  academic_year: string;
  fee_amount: number;
  is_active: boolean;
  custom_fields: CustomField[];
  admit_card_status: {
    is_released: boolean;
    release_date: string | null;
  };
  result_status: {
    is_declared: boolean;
    declare_date: string | null;
  };
  exam_date: string;
  exam_time: string;
  exam_center_default: string;
  total_marks: number;
  passing_marks: number;
  instructions: string[];
}

export interface StudentPersonalData {
  name: string;
  father_name: string;
  dob: string;
  mobile: string;
  email?: string;
  photo_url: string;
  gender: string;
  category: string;
  address: string;
  custom_responses?: Record<string, any>;
}

export interface StudentSchoolData {
  udise_code: string;
  school_name: string;
  district: string;
  block: string;
  panchayat?: string;
  current_class: string;
  previous_year_percentage?: number;
}

export interface StudentPaymentInfo {
  status: 'PAID' | 'PENDING' | 'FAILED';
  amount: number;
  txn_id: string;
  order_id: string;
  paid_at: string;
  payment_mode?: 'UPI' | 'QR_SCAN' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'NET_BANKING';
}

export interface StudentDocuments {
  application_form_pdf?: string;
  admit_card_pdf?: string;
  marksheet_pdf?: string;
}

export interface StudentExamDetails {
  roll_no?: string;
  exam_center?: string;
  exam_datetime?: string;
  reporting_time?: string;
  room_no?: string;
}

export interface SubjectMarks {
  subject: string;
  marks: number;
  max_marks: number;
}

export interface StudentResultDetails {
  marks_obtained?: number;
  total_marks?: number;
  percentage?: number;
  status?: 'PASS' | 'FAIL' | 'PENDING';
  grade?: string;
  rank?: number;
  subject_breakup?: SubjectMarks[];
}

export interface Student {
  _id: string;
  registration_id: string;
  form_id: string;
  personal_data: StudentPersonalData;
  school_data: StudentSchoolData;
  payment_info: StudentPaymentInfo;
  documents: StudentDocuments;
  exam_details: StudentExamDetails;
  result_details: StudentResultDetails;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsSummary {
  total_students: number;
  total_paid: number;
  total_revenue: number;
  total_schools: number;
  admit_cards_issued: number;
  results_declared: number;
  pass_count: number;
  fail_count: number;
  pass_percentage: number;
  districts_count: number;
  district_distribution: { district: string; count: number }[];
  class_distribution: { class_name: string; count: number }[];
}

export interface BackendCodeTemplate {
  title: string;
  language: 'php' | 'sql' | 'java' | 'html' | 'javascript' | 'env';
  filename: string;
  description: string;
  code: string;
}

export type AdminRole = 'SUPER_ADMIN' | 'EXAM_CONTROLLER' | 'DATA_OFFICER';

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: AdminRole;
  role_label: string;
  department: string;
  token?: string;
  last_login?: string;
}

export interface StudentUser {
  role: 'STUDENT';
  registration_id: string;
  name: string;
  father_name: string;
  mobile: string;
  dob: string;
  photo_url?: string;
  school_name?: string;
  current_class?: string;
  district?: string;
  form_id?: string;
  token?: string;
  last_login?: string;
}

export type PortalAuthUser =
  | { type: 'admin'; user: AdminUser }
  | { type: 'student'; user: StudentUser };

export type Language = 'hi' | 'en';

export interface NoticeCircular {
  id: string;
  notice_no: string;
  title_hi: string;
  title_en: string;
  category: 'EXAM' | 'ADMIT_CARD' | 'RESULT' | 'SCHOLARSHIP' | 'AFFILIATION' | 'GUIDELINES';
  publish_date: string;
  is_urgent?: boolean;
  summary_hi: string;
  summary_en: string;
  content_hi: string;
  content_en: string;
  pdf_filename?: string;
  signed_by: string;
}

export interface MeritTopper {
  rank: number;
  registration_id: string;
  roll_no: string;
  name: string;
  father_name: string;
  school_name: string;
  district: string;
  current_class: string;
  category: string;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  award_scholarship: string;
  photo_url?: string;
}

export interface GrievanceTicket {
  ticket_id: string;
  registration_id: string;
  student_name: string;
  father_name: string;
  mobile: string;
  issue_category: 'NAME_CORRECTION' | 'DOB_CORRECTION' | 'PHOTO_UPDATE' | 'SCHOOL_CHANGE' | 'PAYMENT_ISSUE' | 'ADMIT_CARD_ISSUE' | 'OTHER';
  description: string;
  requested_changes: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  admin_remarks?: string;
  created_at: string;
  updated_at?: string;
}

export interface VerificationResult {
  is_valid: boolean;
  type: 'ADMIT_CARD' | 'MARKSHEET' | 'MERIT_CERTIFICATE' | 'REGISTRATION';
  verification_code: string;
  student?: Student;
  verified_at: string;
  council_signature_hash: string;
  remarks: string;
}



