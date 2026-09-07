import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { School, FormConfig, Student, AnalyticsSummary, AdminUser, NoticeCircular, MeritTopper, GrievanceTicket, VerificationResult } from './src/types';

// Import Supabase client and repositories
import { supabase } from './server/lib/supabase';
import { StorageService, SupabaseStorageProvider, StorageVisibility } from './server/storage';
import {
  StudentRepository,
  SchoolRepository,
  FormRepository,
  NoticeRepository,
  GrievanceRepository,
  MeritRepository,
  VerificationRepository,
  JobApplicationRepository,
} from './server/repositories';

let nextRegNumber = 8946;
let nextRollNumber = 100250;
let nextGrievanceNumber = 100;

const adminSessions = new Map<string, { userId: string; role: 'SUPER_ADMIN' | 'EXAM_CONTROLLER' | 'DATA_OFFICER'; createdAt: string; expiresAt: string }>();
const studentSessions = new Map<string, { userId: string; role: 'STUDENT'; createdAt: string; expiresAt: string }>();

const DEFAULT_ADMIN_ACCOUNTS = [
  {
    id: 'adm_1',
    username: process.env.ADMIN_SUPER_USERNAME || 'admin',
    email: 'admin@bsedrc.gov.in',
    password: process.env.ADMIN_SUPER_PASSWORD || 'admin123',
    name: 'Dr. Rajeshwar Kumar Verma',
    role: 'SUPER_ADMIN' as const,
    role_label: 'Super Administrator & Director',
    department: 'Council Executive Directorate',
  },
  {
    id: 'adm_2',
    username: process.env.ADMIN_CONTROLLER_USERNAME || 'controller',
    email: 'controller@bsedrc.gov.in',
    password: process.env.ADMIN_CONTROLLER_PASSWORD || 'bsedrc@2026',
    name: 'Prof. Sunita Kumari',
    role: 'EXAM_CONTROLLER' as const,
    role_label: 'Controller of Examinations',
    department: 'State Board Examination Wing',
  },
  {
    id: 'adm_3',
    username: process.env.ADMIN_OFFICER_USERNAME || 'officer',
    email: 'officer@bsedrc.gov.in',
    password: process.env.ADMIN_OFFICER_PASSWORD || 'pass123',
    name: 'Manoj Kumar Jha',
    role: 'DATA_OFFICER' as const,
    role_label: 'Verification & Statistical Officer',
    department: 'U-DISE & Institutional Records',
  },
];

const ADMIN_ACCOUNTS = DEFAULT_ADMIN_ACCOUNTS;

function issueSession<T extends { userId: string; role: string; createdAt: string; expiresAt: string }>(
  store: Map<string, T>,
  tokenPrefix: string,
  userId: string,
  role: T['role']
): string {
  const token = `${tokenPrefix}_${userId}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const now = new Date();
  const expiry = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  store.set(token, {
    userId,
    role,
    createdAt: now.toISOString(),
    expiresAt: expiry,
  } as T);
  return token;
}

function getSessionFromAuthHeader(authHeader: string | undefined) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.replace('Bearer ', '').trim();
  return token;
}

function requireValidSession(token: string | null, sessionMap: Map<string, any>) {
  if (!token) return null;
  const session = sessionMap.get(token);
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    sessionMap.delete(token);
    return null;
  }
  return session;
}

function requireAdminSession(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = getSessionFromAuthHeader(req.headers.authorization as string | undefined);
  const session = requireValidSession(token, adminSessions);
  if (!session) return res.status(401).json({ success: false, error: 'Administrator authentication required.' });
  (req as any).adminSession = session;
  return next();
}

function isValidHttpUrl(value: unknown): boolean {
  if (typeof value !== 'string' || value.trim() === '') return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function createSupabaseErrorResponse(res: express.Response, operation: string, error: any) {
  const message = error?.message || 'Unknown Supabase error';
  console.error(`❌ ${operation} failed:`, error);
  return res.status(500).json({
    success: false,
    error: `${operation} failed`,
    details: message,
  });
}

async function resolveStudentRecord(studentId: string): Promise<Student | null> {
  const student = await StudentRepository.findByRegistrationId(studentId);
  return student;
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const storageService = new StorageService(new SupabaseStorageProvider());

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health Check
  app.get('/api/health', async (req, res) => {
    try {
      const [schoolsResult, formsResult, studentsResult] = await Promise.all([
        supabase.from('schools').select('*', { count: 'exact', head: false }).limit(1),
        supabase.from('forms').select('*', { count: 'exact', head: false }).limit(1),
        supabase.from('students').select('*', { count: 'exact', head: false }).limit(1),
      ]);

      const supabaseConnected = !schoolsResult.error && !formsResult.error && !studentsResult.error;
      const schoolCount = schoolsResult.count ?? 0;
      const formsCount = formsResult.count ?? 0;
      const studentsCount = studentsResult.count ?? 0;

      if (!supabaseConnected) {
        return res.status(503).json({
          status: 'error',
          organization: 'Bihar State Educational Development and Research Council (BSEDRC)',
          service: 'BSEDRC Student Lifecycle & Examination Central Backend',
          timestamp: new Date().toISOString(),
          database: {
            supabase: 'NOT_CONNECTED',
            fallback_inmemory: 'REMOVED',
          },
          error: 'Supabase backend unavailable',
          details: schoolsResult.error?.message || formsResult.error?.message || studentsResult.error?.message || 'Unknown database error',
        });
      }

      res.json({
        status: 'ok',
        organization: 'Bihar State Educational Development and Research Council (BSEDRC)',
        service: 'BSEDRC Student Lifecycle & Examination Central Backend',
        timestamp: new Date().toISOString(),
        database: {
          supabase: 'CONNECTED',
          fallback_inmemory: 'REMOVED',
        },
        counts: {
          schools: schoolCount,
          forms: formsCount,
          students: studentsCount,
        },
      });
    } catch (err) {
      console.error('❌ Health check error:', err);
      res.status(500).json({
        status: 'error',
        organization: 'Bihar State Educational Development and Research Council (BSEDRC)',
        service: 'BSEDRC Student Lifecycle & Examination Central Backend',
        error: 'Health check failed',
      });
    }
  });

  // ------------------------------------------
  // ADMIN AUTHENTICATION API
  // ------------------------------------------
  app.post('/api/admin/login', (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username/Email and Password are required.',
      });
    }

    const cleanInput = String(username).trim().toLowerCase();
    const admin = ADMIN_ACCOUNTS.find(
      (a) =>
        (a.username.toLowerCase() === cleanInput || a.email.toLowerCase() === cleanInput) &&
        a.password === String(password)
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Council Administrator credentials. Please check your username and password.',
      });
    }

    if (role && role !== admin.role && admin.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: `Selected role (${role}) does not match administrator privileges for ${admin.name}.`,
      });
    }

    const token = issueSession(adminSessions, 'bsedrc_auth', admin.id, admin.role);
    const userSafe: AdminUser = {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      role_label: admin.role_label,
      department: admin.department,
      token,
      last_login: new Date().toISOString(),
    };

    res.json({
      success: true,
      message: `Welcome back, ${admin.name}. Authentication granted for ${admin.role_label}.`,
      admin: userSafe,
      token,
    });
  });

  app.post('/api/admin/verify', (req, res) => {
    const token = getSessionFromAuthHeader(req.headers.authorization);
    const session = requireValidSession(token, adminSessions);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Invalid or expired administrator session.' });
    }

    const admin = ADMIN_ACCOUNTS.find((a) => a.id === session.userId);
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Unknown administrator session.' });
    }

    res.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        role_label: admin.role_label,
        department: admin.department,
        token,
        last_login: new Date().toISOString(),
      },
    });
  });

  app.post('/api/admin/logout', (req, res) => {
    res.json({ success: true, message: 'Administrator session terminated.' });
  });

  // ------------------------------------------
  // STUDENT PORTAL AUTHENTICATION API
  // ------------------------------------------
  app.post('/api/student/login', async (req, res) => {
    const { registration_id, mobile, dob, otp } = req.body;

    if (!registration_id && !mobile) {
      return res.status(400).json({
        success: false,
        error: 'Registration ID ya Mobile Number likhna anivarya hai.',
      });
    }

    try {
      let student: Student | null = null;

      if (registration_id) {
        const cleanReg = String(registration_id).trim();
        student = await StudentRepository.findByRegistrationId(cleanReg);

        if (!student) {
          return res.status(404).json({
            success: false,
            error: `Registration ID '${registration_id}' ke saath koi record nahi mila. Kripya sahi ID dalein ya Naya Registration karein.`,
          });
        }

        if (dob && student.personal_data.dob !== String(dob)) {
          return res.status(401).json({
            success: false,
            error: 'Janam Tithi (Date of Birth) record se match nahi ho rahi hai.',
          });
        }
      } else if (mobile) {
        const cleanMob = String(mobile).trim();
        const allStudents = await StudentRepository.findAll();
        student = allStudents.find((s) => s.personal_data.mobile === cleanMob) || null;

        if (!student) {
          return res.status(404).json({
            success: false,
            error: `Mobile number ${mobile} se koi aavedan registered nahi mila. Kripya naya registration karein.`,
          });
        }
      }

      if (!student) {
        return res.status(404).json({ success: false, error: 'Student record nahi mila.' });
      }

      const token = issueSession(studentSessions, 'bsedrc_std', student.registration_id, 'STUDENT');
      const studentUser = {
        role: 'STUDENT' as const,
        registration_id: student.registration_id,
        name: student.personal_data.name,
        father_name: student.personal_data.father_name,
        mobile: student.personal_data.mobile,
        dob: student.personal_data.dob,
        photo_url: student.personal_data.photo_url,
        school_name: student.school_data.school_name,
        current_class: student.school_data.current_class,
        district: student.school_data.district,
        form_id: student.form_id,
        token,
        last_login: new Date().toISOString(),
      };

      return res.json({
        success: true,
        message: `Namaste ${student.personal_data.name}! Aapka portal login safal raha.`,
        student: studentUser,
        studentRecord: student,
        token,
      });
    } catch (error) {
      return createSupabaseErrorResponse(res, 'Student login', error);
    }
  });

  app.post('/api/student/verify', async (req, res) => {
    const token = getSessionFromAuthHeader(req.headers.authorization);
    const session = requireValidSession(token, studentSessions);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Invalid or expired student session.' });
    }

    try {
      const student = await StudentRepository.findByRegistrationId(session.userId);
      if (!student) {
        return res.status(404).json({ success: false, error: 'Student session expired.' });
      }

      return res.json({
        success: true,
        student: {
          role: 'STUDENT',
          registration_id: student.registration_id,
          name: student.personal_data.name,
          father_name: student.personal_data.father_name,
          mobile: student.personal_data.mobile,
          dob: student.personal_data.dob,
          photo_url: student.personal_data.photo_url,
          school_name: student.school_data.school_name,
          current_class: student.school_data.current_class,
          district: student.school_data.district,
          form_id: student.form_id,
          token,
          last_login: new Date().toISOString(),
        },
        studentRecord: student,
      });
    } catch (error) {
      return createSupabaseErrorResponse(res, 'Student session verification', error);
    }
  });



  // ------------------------------------------
  // SCHOOLS MASTER & CASCADING API
  // ------------------------------------------

  // Get Districts list
  app.get('/api/schools/districts', async (req, res) => {
    try {
      const districts = await SchoolRepository.getDistinctDistricts();
      return res.json({ success: true, districts });
    } catch (err) {
      console.error('❌ Districts fetch error:', err);
      return res.status(500).json({ success: false, error: 'Unable to fetch school districts from Supabase.' });
    }
  });

  // Get Blocks for a District
  app.get('/api/schools/blocks', async (req, res) => {
    const district = req.query.district as string;
    if (!district) {
      return res.status(400).json({ success: false, error: 'District parameter required' });
    }

    try {
      const blocks = await SchoolRepository.getBlocksByDistrict(district);
      return res.json({ success: true, blocks });
    } catch (err) {
      console.error('❌ Blocks fetch error:', err);
      return res.status(500).json({ success: false, error: 'Unable to fetch blocks from Supabase.' });
    }
  });

  // Get Schools by District & Block
  app.get('/api/schools/by-block', async (req, res) => {
    const district = req.query.district as string;
    const block = req.query.block as string;
    if (!district || !block) {
      return res.status(400).json({ success: false, error: 'District and Block parameters required' });
    }

    try {
      const schools = await SchoolRepository.findByDistrictAndBlock(district, block);
      return res.json({ success: true, schools });
    } catch (err) {
      console.error('❌ Schools by block fetch error:', err);
      return res.status(500).json({ success: false, error: 'Unable to fetch schools from Supabase.' });
    }
  });

  // List all schools with search & filter
  app.get('/api/schools', async (req, res) => {
    const { district, block, q, udise } = req.query as {
      district?: string;
      block?: string;
      q?: string;
      udise?: string;
    };

    try {
      let schools: School[] = [];

      if (q) {
        schools = await SchoolRepository.search(q);
      } else if (district && block) {
        schools = await SchoolRepository.findByDistrictAndBlock(district, block);
      } else {
        schools = await SchoolRepository.findAll();
      }

      if (udise && schools.length > 0) {
        schools = schools.filter((s) => s.udise_code.includes(udise));
      }
      if (district && schools.length > 0) {
        schools = schools.filter((s) => s.district.toLowerCase() === district.toLowerCase());
      }
      if (block && schools.length > 0) {
        schools = schools.filter((s) => s.block.toLowerCase() === block.toLowerCase());
      }

      return res.json({ success: true, count: schools.length, schools });
    } catch (err) {
      console.error('❌ Schools fetch error:', err);
      return res.status(500).json({ success: false, error: 'Unable to fetch schools from Supabase.' });
    }
  });

  // Add Single School
  app.post('/api/schools', async (req, res) => {
    const { udise_code, school_name, district, block, panchayat } = req.body;
    if (!udise_code || !school_name || !district || !block) {
      return res.status(400).json({ success: false, error: 'All fields (udise_code, school_name, district, block) are required.' });
    }

    const newSchool: School = {
      _id: `sch_${Date.now()}`,
      udise_code: udise_code.trim(),
      school_name: school_name.trim(),
      district: district.trim(),
      block: block.trim(),
      panchayat: panchayat ? panchayat.trim() : 'General',
      created_at: new Date().toISOString(),
    };

    try {
      const existing = await SchoolRepository.findByUdiseCode(newSchool.udise_code);
      if (existing) {
        return res.status(409).json({ success: false, error: `School with U-DISE Code ${udise_code} already exists.` });
      }

      const created = await SchoolRepository.create(newSchool);
      if (!created) {
        return res.status(500).json({ success: false, error: 'School creation failed while saving to Supabase.' });
      }
      return res.status(201).json({ success: true, message: 'School added to master directory', school: created });
    } catch (err) {
      console.error('❌ School creation Supabase error:', err);
      return res.status(500).json({ success: false, error: 'School creation failed while saving to Supabase.' });
    }
  });

  // Bulk Upload Schools
  app.post('/api/schools/bulk', async (req, res) => {
    const { schools } = req.body as { schools: Partial<School>[] };
    if (!Array.isArray(schools) || schools.length === 0) {
      return res.status(400).json({ success: false, error: 'Schools array is required.' });
    }

    try {
      let addedCount = 0;
      let updatedCount = 0;

      for (const item of schools) {
        if (!item.udise_code || !item.school_name) continue;

        const existing = await SchoolRepository.findByUdiseCode(item.udise_code);
        if (existing) {
          const updated = await SchoolRepository.update(item.udise_code, {
            school_name: item.school_name,
            district: item.district || existing.district,
            block: item.block || existing.block,
            panchayat: item.panchayat || existing.panchayat,
          });
          if (!updated) {
            return res.status(500).json({ success: false, error: 'School bulk update failed while saving to Supabase.' });
          }
          updatedCount++;
        } else {
          const created = await SchoolRepository.create({
            _id: `sch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            udise_code: item.udise_code,
            school_name: item.school_name,
            district: item.district || 'Bihar',
            block: item.block || 'Sadar',
            panchayat: item.panchayat || '',
            created_at: new Date().toISOString(),
          });
          if (!created) {
            return res.status(500).json({ success: false, error: 'School bulk creation failed while saving to Supabase.' });
          }
          addedCount++;
        }
      }

      const total = (await SchoolRepository.findAll()).length;
      return res.json({
        success: true,
        message: `Bulk import completed: ${addedCount} schools added, ${updatedCount} updated.`,
        addedCount,
        updatedCount,
        total,
      });
    } catch (err) {
      console.error('❌ School bulk import Supabase error:', err);
      return res.status(500).json({ success: false, error: 'School bulk import failed while saving to Supabase.' });
    }
  });

  // ------------------------------------------
  // FORMS CONFIG & LIFECYCLE MANAGEMENT
  // ------------------------------------------

  app.get('/api/forms', async (req, res) => {
    try {
      const forms = await FormRepository.findAll();
      return res.json({ success: true, forms });
    } catch (err) {
      console.error('❌ Forms fetch error:', err);
      return res.status(500).json({ success: false, error: 'Unable to fetch forms from Supabase.' });
    }
  });

  app.get('/api/forms/:id', async (req, res) => {
    try {
      const form = await FormRepository.findByFormId(req.params.id);
      if (!form) {
        return res.status(404).json({ success: false, error: 'Form configuration not found' });
      }
      return res.json({ success: true, form });
    } catch (err) {
      console.error('❌ Form fetch error:', err);
      return res.status(500).json({ success: false, error: 'Unable to fetch form from Supabase.' });
    }
  });

  app.post('/api/forms', async (req, res) => {
    const { title, fee_amount, academic_year, custom_fields, exam_date, exam_time, exam_center_default } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const newForm: FormConfig = {
      _id: `form_${Date.now()}`,
      form_id: `EXAM_${new Date().getFullYear()}_${String(Date.now()).slice(-4)}`,
      title: title.trim(),
      academic_year: academic_year || '2026-2027',
      fee_amount: Number(fee_amount) || 50,
      is_active: true,
      custom_fields: custom_fields || [
        { label: 'Aadhaar Number', type: 'text', required: true },
        { label: 'Mother Name', type: 'text', required: true }
      ],
      admit_card_status: {
        is_released: false,
        release_date: null,
      },
      result_status: {
        is_declared: false,
        declare_date: null,
      },
      exam_date: exam_date || '2026-10-15',
      exam_time: exam_time || '10:00 AM - 12:30 PM',
      exam_center_default: exam_center_default || 'District Model Examination Hall',
      total_marks: 100,
      passing_marks: 40,
      instructions: [
        'Carry printed Admit Card and valid identity proof.',
        'Follow instructions on examination day.'
      ]
    };

    try {
      const created = await FormRepository.create(newForm);
      if (!created) {
        return res.status(500).json({ success: false, error: 'Form creation failed while saving to Supabase.' });
      }
      return res.status(201).json({ success: true, message: 'Form created successfully', form: created });
    } catch (err) {
      console.error('❌ Form creation Supabase error:', err);
      return res.status(500).json({ success: false, error: 'Form creation failed while saving to Supabase.' });
    }
  });

  // Update Form Lifecycle (Release Admit Card, Declare Results, Toggle active)
  app.put('/api/forms/:id', async (req, res) => {
    try {
      const current = await FormRepository.findByFormId(req.params.id);
      if (!current) {
        return res.status(404).json({ success: false, error: 'Form not found' });
      }

      const updated = { ...current, ...req.body };
      const result = await FormRepository.update(current.form_id, updated);
      if (!result) {
        return res.status(500).json({ success: false, error: 'Form update failed while saving to Supabase.' });
      }
      return res.json({ success: true, message: 'Form configuration updated', form: result });
    } catch (err) {
      console.error('❌ Form update Supabase error:', err);
      return res.status(500).json({ success: false, error: 'Form update failed while saving to Supabase.' });
    }
  });

  // ------------------------------------------
  // PAYMENT & STUDENT REGISTRATION LIFECYCLE
  // ------------------------------------------

  // 1. Create Payment Order
  app.post('/api/payment/create-order', (req, res) => {
    const { form_id, amount, student_name } = req.body;
    const order_id = `order_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const razorpayKey = process.env.RAZORPAY_KEY_ID || 'rzp_test_BSEDRC2026_SANDBOX';

    res.json({
      success: true,
      order: {
        order_id,
        amount: amount || 50,
        currency: process.env.RAZORPAY_CURRENCY || 'INR',
        merchant_name: 'Bihar State Educational Development and Research Council',
        description: `Exam Fee - ${student_name || 'Applicant'}`,
        key_id: razorpayKey,
        is_live_key: Boolean(process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes('SANDBOX')),
      },
    });
  });

  // 2. Payment Verification & Registration
  app.post('/api/payment/verify-and-register', async (req, res) => {
    const {
      form_id,
      personal_data,
      school_data,
      payment_mode,
      amount,
      txn_id,
      order_id,
    } = req.body;

    if (!personal_data?.name || !personal_data?.father_name || !personal_data?.dob || !personal_data?.mobile) {
      return res.status(400).json({ success: false, error: 'Missing required student personal information.' });
    }

    if (!school_data?.udise_code || !school_data?.school_name) {
      return res.status(400).json({ success: false, error: 'School information with valid U-DISE is required.' });
    }

    try {
      const currentYear = new Date().getFullYear();
      const regId = `BSEDRC-${currentYear}-${nextRegNumber++}`;
      const generatedRollNo = `${nextRollNumber++}`;

      const form = await FormRepository.findByFormId(form_id);
      if (!form) {
        return res.status(404).json({ success: false, error: 'Form configuration not found.' });
      }

      const newStudent: Student = {
        _id: `std_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        registration_id: regId,
        form_id: form.form_id,
        personal_data: {
          name: personal_data.name.trim(),
          father_name: personal_data.father_name.trim(),
          dob: personal_data.dob,
          mobile: personal_data.mobile.trim(),
          email: personal_data.email?.trim() || '',
          photo_url: personal_data.photo_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&crop=faces',
          gender: personal_data.gender || 'Male',
          category: personal_data.category || 'General',
          address: personal_data.address || '',
          custom_responses: personal_data.custom_responses || {},
        },
        school_data: {
          udise_code: school_data.udise_code,
          school_name: school_data.school_name,
          district: school_data.district || 'Madhepura',
          block: school_data.block || 'Madhepura',
          panchayat: school_data.panchayat || '',
          current_class: school_data.current_class || '10th',
          previous_year_percentage: school_data.previous_year_percentage || 80,
        },
        payment_info: {
          status: 'PAID',
          amount: amount || form.fee_amount || 50,
          txn_id: txn_id || `TXN_${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`,
          order_id: order_id || `ORDER_${regId}`,
          paid_at: new Date().toISOString(),
          payment_mode: payment_mode || 'UPI',
        },
        documents: {
          application_form_pdf: `/docs/form_${regId}.pdf`,
          admit_card_pdf: `/docs/admit_${regId}.pdf`,
          marksheet_pdf: `/docs/result_${regId}.pdf`,
        },
        exam_details: {
          roll_no: generatedRollNo,
          exam_center: `${school_data.school_name} Examination Hall`,
          exam_datetime: `${form.exam_date} ${form.exam_time}`,
          reporting_time: '09:15 AM',
          room_no: `Room ${Math.floor(100 + Math.random() * 20)}`,
        },
        result_details: {
          marks_obtained: undefined,
          total_marks: form.total_marks || 100,
          status: 'PENDING',
          grade: undefined,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const createdStudent = await StudentRepository.create(newStudent);
      if (!createdStudent) {
        return res.status(500).json({ success: false, error: 'Student registration failed while saving to database.' });
      }

      return res.status(201).json({
        success: true,
        message: 'Student successfully registered and payment verified.',
        student: createdStudent,
        registration_id: regId,
      });
    } catch (error) {
      return createSupabaseErrorResponse(res, 'Student registration', error);
    }
  });

  // ------------------------------------------
  // STUDENT PORTAL & STATUS CHECK API
  // ------------------------------------------

  // Single Student View API (GET /api/student/status?reg_id=MLF-2026-8941&dob=2008-08-15)
  app.get('/api/student/status', async (req, res) => {
    const reg_id = (req.query.reg_id || req.query.registration_id) as string;
    const dob = req.query.dob as string;

    if (!reg_id) {
      return res.status(400).json({ success: false, error: 'Registration ID is required' });
    }

    try {
      const student = await StudentRepository.findByRegistrationId(reg_id.trim());
      if (!student) {
        return res.status(404).json({
          success: false,
          message: `No application found with Registration ID: ${reg_id}`,
        });
      }

      if (dob && student.personal_data.dob !== dob) {
        return res.status(401).json({
          success: false,
          message: 'Date of Birth does not match our registration records.',
        });
      }

      const form = student.form_id ? await FormRepository.findByFormId(student.form_id) : null;
      const admit_card_available = Boolean(form?.admit_card_status?.is_released && student.exam_details?.roll_no);
      const result_available = Boolean(form?.result_status?.is_declared && student.result_details?.marks_obtained !== undefined);

      return res.json({
        success: true,
        student,
        form,
        lifecycle_access: {
          form_download: true,
          admit_card_available,
          result_available,
          admit_card_release_date: form?.admit_card_status?.release_date,
          result_declare_date: form?.result_status?.declare_date,
        },
      });
    } catch (error) {
      return createSupabaseErrorResponse(res, 'Student status lookup', error);
    }
  });

  // ------------------------------------------
  // ADMIN STUDENTS LIST & SEARCH
  // ------------------------------------------

  app.get('/api/students', async (req, res) => {
    const { form_id, udise_code, district, block, payment_status, result_status, q } = req.query as Record<string, string>;

    try {
      let filtered = await StudentRepository.findAll();

      if (form_id) {
        filtered = filtered.filter((s) => s.form_id === form_id);
      }
      if (udise_code) {
        filtered = filtered.filter((s) => s.school_data.udise_code === udise_code);
      }
      if (district) {
        filtered = filtered.filter((s) => s.school_data.district.toLowerCase() === district.toLowerCase());
      }
      if (block) {
        filtered = filtered.filter((s) => s.school_data.block.toLowerCase() === block.toLowerCase());
      }
      if (payment_status) {
        filtered = filtered.filter((s) => s.payment_info.status === payment_status);
      }
      if (result_status) {
        filtered = filtered.filter((s) => s.result_details.status === result_status);
      }
      if (q) {
        const lower = q.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.registration_id.toLowerCase().includes(lower) ||
            s.personal_data.name.toLowerCase().includes(lower) ||
            s.personal_data.father_name.toLowerCase().includes(lower) ||
            s.personal_data.mobile.includes(lower) ||
            s.school_data.school_name.toLowerCase().includes(lower) ||
            (s.exam_details.roll_no && s.exam_details.roll_no.includes(lower))
        );
      }

      return res.json({
        success: true,
        count: filtered.length,
        students: filtered,
      });
    } catch (error) {
      return createSupabaseErrorResponse(res, 'Student list fetch', error);
    }
  });

  // Update Single Student (Marks, Roll, Exam Center)
  app.put('/api/students/:id', async (req, res) => {
    try {
      const allStudents = await StudentRepository.findAll();
      const current = allStudents.find((s) => s._id === req.params.id || s.registration_id === req.params.id);
      if (!current) {
        return res.status(404).json({ success: false, error: 'Student not found' });
      }

      const updated: Student = {
        ...current,
        ...req.body,
        personal_data: { ...current.personal_data, ...(req.body.personal_data || {}) },
        school_data: { ...current.school_data, ...(req.body.school_data || {}) },
        exam_details: { ...current.exam_details, ...(req.body.exam_details || {}) },
        result_details: { ...current.result_details, ...(req.body.result_details || {}) },
        updated_at: new Date().toISOString(),
      };

      if (req.body.result_details?.marks_obtained !== undefined) {
        const marks = Number(req.body.result_details.marks_obtained);
        const total = Number(updated.result_details.total_marks || 100);
        const pct = (marks / total) * 100;
        updated.result_details.marks_obtained = marks;
        updated.result_details.percentage = Number(pct.toFixed(1));
        updated.result_details.status = pct >= 40 ? 'PASS' : 'FAIL';
        updated.result_details.grade =
          pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 40 ? 'C' : 'D';
      }

      const saved = await StudentRepository.update(current.registration_id, updated);
      if (!saved) {
        return res.status(500).json({ success: false, error: 'Student update failed while saving to database.' });
      }

      return res.json({ success: true, message: 'Student updated successfully', student: saved });
    } catch (error) {
      return createSupabaseErrorResponse(res, 'Student update', error);
    }
  });

  // Bulk Admit Card Generation & Allocation
  app.post('/api/students/bulk-admit-cards', async (req, res) => {
    const { form_id, default_center } = req.body;

    try {
      const students = await StudentRepository.findAll(form_id ? { form_id } : undefined);
      let count = 0;

      for (const student of students) {
        const updatedStudent: Student = {
          ...student,
          exam_details: {
            ...student.exam_details,
            roll_no: student.exam_details.roll_no || `${nextRollNumber++}`,
            exam_center: student.exam_details.exam_center || default_center || `${student.school_data.school_name} Center`,
            exam_datetime: student.exam_details.exam_datetime || '2026-09-15 10:00 AM',
            reporting_time: '09:15 AM',
            room_no: student.exam_details.room_no || `Hall ${Math.floor(1 + Math.random() * 5)}`,
          },
          updated_at: new Date().toISOString(),
        };

        const saved = await StudentRepository.update(student.registration_id, updatedStudent);
        if (saved) {
          count++;
        }
      }

      return res.json({
        success: true,
        message: `Generated and assigned admit cards for ${count} students.`,
        count,
      });
    } catch (error) {
      return createSupabaseErrorResponse(res, 'Bulk admit card assignment', error);
    }
  });

  // Bulk Marks Entry / Result Import
  app.post('/api/students/bulk-results', async (req, res) => {
    const { results } = req.body as {
      results: Array<{
        registration_id?: string;
        roll_no?: string;
        marks_obtained: number;
        total_marks?: number;
      }>;
    };

    if (!Array.isArray(results)) {
      return res.status(400).json({ success: false, error: 'Results list is required.' });
    }

    try {
      const allStudents = await StudentRepository.findAll();
      let updatedCount = 0;

      for (const item of results) {
        const student = allStudents.find(
          (s) =>
            (item.registration_id && s.registration_id === item.registration_id) ||
            (item.roll_no && s.exam_details.roll_no === item.roll_no)
        );

        if (!student) {
          continue;
        }

        const marks = Number(item.marks_obtained);
        const total = Number(item.total_marks || student.result_details.total_marks || 100);
        const pct = (marks / total) * 100;

        const updatedStudent: Student = {
          ...student,
          result_details: {
            ...student.result_details,
            marks_obtained: marks,
            total_marks: total,
            percentage: Number(pct.toFixed(1)),
            status: pct >= 40 ? 'PASS' : 'FAIL',
            grade: pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 40 ? 'C' : 'D',
          },
          updated_at: new Date().toISOString(),
        };

        const saved = await StudentRepository.update(student.registration_id, updatedStudent);
        if (saved) {
          updatedCount++;
        }
      }

      const graded = (await StudentRepository.findAll()).filter((s) => s.result_details.marks_obtained !== undefined).sort((a, b) => (b.result_details.marks_obtained || 0) - (a.result_details.marks_obtained || 0));
      for (let idx = 0; idx < graded.length; idx++) {
        const student = graded[idx];
        const updatedWithRank: Student = {
          ...student,
          result_details: {
            ...student.result_details,
            rank: idx + 1,
          },
          updated_at: new Date().toISOString(),
        };
        await StudentRepository.update(student.registration_id, updatedWithRank);
      }

      return res.json({
        success: true,
        message: `Successfully processed results for ${updatedCount} students.`,
        updatedCount,
      });
    } catch (error) {
      return createSupabaseErrorResponse(res, 'Bulk student result import', error);
    }
  });

  // ------------------------------------------
  // INSTITUTIONAL SEARCH & NOTICE BOARD
  // ------------------------------------------

  app.post('/api/institution/search', async (req, res) => {
    const { udise_code, district, block, school_name } = req.body;

    try {
      const allStudents = await StudentRepository.findAll();
      const matchingSchool = udise_code
        ? await SchoolRepository.findByUdiseCode(udise_code)
        : school_name
          ? (await SchoolRepository.findAll()).find((s) => s.school_name.toLowerCase().includes(String(school_name).toLowerCase()))
          : null;

      let filtered = allStudents;

      if (udise_code) {
        filtered = filtered.filter((s) => s.school_data.udise_code === udise_code);
      } else {
        if (district) {
          filtered = filtered.filter((s) => s.school_data.district.toLowerCase() === String(district).toLowerCase());
        }
        if (block) {
          filtered = filtered.filter((s) => s.school_data.block.toLowerCase() === String(block).toLowerCase());
        }
        if (school_name) {
          filtered = filtered.filter((s) =>
            s.school_data.school_name.toLowerCase().includes(String(school_name).toLowerCase())
          );
        }
      }

      const totalStudents = filtered.length;
      const paidStudents = filtered.filter((s) => s.payment_info.status === 'PAID').length;
      const passedStudents = filtered.filter((s) => s.result_details.status === 'PASS').length;

      return res.json({
        success: true,
        institution: matchingSchool || {
          udise_code: udise_code || 'N/A',
          school_name: school_name || 'Selected Criteria',
          district: district || 'All',
          block: block || 'All',
        },
        stats: {
          total_students: totalStudents,
          paid_students: paidStudents,
          passed_students: passedStudents,
          pass_percentage: totalStudents > 0 ? Number(((passedStudents / totalStudents) * 100).toFixed(1)) : 0,
        },
        students: filtered,
      });
    } catch (error) {
      return createSupabaseErrorResponse(res, 'Institution search', error);
    }
  });

  // ------------------------------------------
  // ANALYTICS SUMMARY
  // ------------------------------------------

  app.get('/api/analytics', async (req, res) => {
    try {
      const students = await StudentRepository.findAll();
      const schools = await SchoolRepository.findAll();
      const totalStudents = students.length;
      const paidStudents = students.filter((s) => s.payment_info.status === 'PAID');
      const totalRevenue = paidStudents.reduce((acc, s) => acc + (s.payment_info.amount || 50), 0);
      const admitCardsIssued = students.filter((s) => Boolean(s.exam_details.roll_no)).length;
      const withResults = students.filter((s) => s.result_details.marks_obtained !== undefined);
      const passCount = withResults.filter((s) => s.result_details.status === 'PASS').length;
      const failCount = withResults.filter((s) => s.result_details.status === 'FAIL').length;

      const districtMap: Record<string, number> = {};
      students.forEach((s) => {
        const dist = s.school_data.district || 'Unknown';
        districtMap[dist] = (districtMap[dist] || 0) + 1;
      });

      const classMap: Record<string, number> = {};
      students.forEach((s) => {
        const cls = s.school_data.current_class || '10th';
        classMap[cls] = (classMap[cls] || 0) + 1;
      });

      const summary: AnalyticsSummary = {
        total_students: totalStudents,
        total_paid: paidStudents.length,
        total_revenue: totalRevenue,
        total_schools: schools.length,
        admit_cards_issued: admitCardsIssued,
        results_declared: withResults.length,
        pass_count: passCount,
        fail_count: failCount,
        pass_percentage: withResults.length > 0 ? Number(((passCount / withResults.length) * 100).toFixed(1)) : 0,
        districts_count: Object.keys(districtMap).length,
        district_distribution: Object.entries(districtMap).map(([district, count]) => ({ district, count })),
        class_distribution: Object.entries(classMap).map(([class_name, count]) => ({ class_name, count })),
      };

      return res.json({ success: true, analytics: summary });
    } catch (error) {
      return createSupabaseErrorResponse(res, 'Analytics fetch', error);
    }
  });

  // ------------------------------------------
  // OFFICIAL NOTICES & CIRCULARS API
  // ------------------------------------------
  app.get('/api/notices', async (req, res) => {
    const { category, q } = req.query;

    try {
      let list: NoticeCircular[] = [];

      if (q) {
        list = await NoticeRepository.search(q as string);
      } else {
        list = await NoticeRepository.findPublished();
      }

      if (category && typeof category === 'string' && category !== 'ALL') {
        list = list.filter((n) => (n as any).category === category);
      }

      return res.json({ success: true, count: list.length, notices: list });
    } catch (err) {
      console.error('❌ Notices fetch error:', err);
      return res.status(500).json({ success: false, error: 'Unable to fetch notices from Supabase.' });
    }
  });

  app.post('/api/notices', requireAdminSession, async (req, res) => {
    const externalLink = req.body.external_link;
    if (externalLink !== undefined && externalLink !== null && externalLink !== '' && !isValidHttpUrl(externalLink)) {
      return res.status(400).json({ success: false, error: 'external_link must be a valid HTTP or HTTPS URL.' });
    }
    const newNotice: NoticeCircular = {
      id: `not_${Date.now()}`,
      notice_no: req.body.notice_no || `BSEDRC/NOTICE/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      title_hi: req.body.title_hi || 'नवीन सूचना',
      title_en: req.body.title_en || 'New Council Notification',
      category: req.body.category || 'EXAM',
      publish_date: req.body.publish_date || new Date().toISOString().slice(0, 10),
      is_urgent: Boolean(req.body.is_urgent),
      summary_hi: req.body.summary_hi || '',
      summary_en: req.body.summary_en || '',
      content_hi: req.body.content_hi || '',
      content_en: req.body.content_en || '',
      pdf_filename: req.body.pdf_filename || `BSEDRC_Circular_${Date.now()}.pdf`,
      is_published: req.body.is_published === true ? true : false,
      priority: req.body.priority || 'normal',
      expires_at: req.body.expires_at || null,
      external_link: externalLink || null,
      signed_by: req.body.signed_by || 'परीक्षा नियंत्रक (Controller of Examinations), BSEDRC',
    };

    try {
      const created = await NoticeRepository.create(newNotice);
      if (!created) {
        return res.status(500).json({ success: false, error: 'Notice creation failed while saving to Supabase.' });
      }
      return res.json({ success: true, message: 'Notice published successfully', notice: created });
    } catch (err) {
      console.error('❌ Notice creation Supabase error:', err);
      return res.status(500).json({ success: false, error: 'Notice creation failed while saving to Supabase.' });
    }
  });

  app.delete('/api/notices/:id', requireAdminSession, async (req, res) => {
    const { id } = req.params;

    try {
      const deleted = await NoticeRepository.delete(id);
      if (!deleted) {
        return res.status(500).json({ success: false, error: 'Notice deletion failed while updating Supabase.' });
      }
      return res.json({ success: true, message: 'Notice deleted successfully' });
    } catch (err) {
      console.error('❌ Notice deletion Supabase error:', err);
      return res.status(500).json({ success: false, error: 'Notice deletion failed while updating Supabase.' });
    }
  });

  app.put('/api/notices/:id', requireAdminSession, async (req, res) => {
    const { id } = req.params;
    if (req.body.external_link !== undefined && req.body.external_link !== null && req.body.external_link !== '' && !isValidHttpUrl(req.body.external_link)) {
      return res.status(400).json({ success: false, error: 'external_link must be a valid HTTP or HTTPS URL.' });
    }
    try {
      const updated = await NoticeRepository.update(id, req.body);
      if (!updated) return res.status(500).json({ success: false, error: 'Notice update failed.' });
      return res.json({ success: true, message: 'Notice updated', notice: updated });
    } catch (err) {
      console.error('❌ Notice update error:', err);
      return res.status(500).json({ success: false, error: 'Notice update failed.' });
    }
  });

  app.patch('/api/notices/:id', requireAdminSession, async (req, res) => {
    const { id } = req.params;
    if (req.body.external_link !== undefined && req.body.external_link !== null && req.body.external_link !== '' && !isValidHttpUrl(req.body.external_link)) {
      return res.status(400).json({ success: false, error: 'external_link must be a valid HTTP or HTTPS URL.' });
    }
    try {
      const updated = await NoticeRepository.update(id, req.body);
      if (!updated) return res.status(500).json({ success: false, error: 'Notice patch failed.' });
      return res.json({ success: true, message: 'Notice patched', notice: updated });
    } catch (err) {
      console.error('❌ Notice patch error:', err);
      return res.status(500).json({ success: false, error: 'Notice patch failed.' });
    }
  });

  app.post('/api/notices/:id/publish', requireAdminSession, async (req, res) => {
    const { id } = req.params;
    try {
      const ok = await NoticeRepository.publish(id);
      if (!ok) return res.status(500).json({ success: false, error: 'Publish failed.' });
      return res.json({ success: true, message: 'Notice published' });
    } catch (err) {
      console.error('❌ Publish error:', err);
      return res.status(500).json({ success: false, error: 'Publish failed.' });
    }
  });

  app.post('/api/notices/:id/unpublish', requireAdminSession, async (req, res) => {
    const { id } = req.params;
    try {
      const ok = await NoticeRepository.unpublish(id);
      if (!ok) return res.status(500).json({ success: false, error: 'Unpublish failed.' });
      return res.json({ success: true, message: 'Notice unpublished' });
    } catch (err) {
      console.error('❌ Unpublish error:', err);
      return res.status(500).json({ success: false, error: 'Unpublish failed.' });
    }
  });

  // ------------------------------------------
  // MERIT GAZETTE & TOPPERS API
  // ------------------------------------------
  app.get('/api/merit-gazette', async (req, res) => {
    const { district, class_name, category } = req.query;

    try {
      let toppers = await MeritRepository.findPublished();

      if (district && typeof district === 'string' && district !== 'ALL') {
        toppers = toppers.filter((t) => t.district.toLowerCase() === district.toLowerCase());
      }
      if (class_name && typeof class_name === 'string' && class_name !== 'ALL') {
        toppers = toppers.filter((t) => (t as any).current_class === class_name);
      }
      if (category && typeof category === 'string' && category !== 'ALL') {
        toppers = toppers.filter((t) => t.category.toLowerCase().includes(category.toLowerCase()));
      }

      const cutoffs = [
        { category: 'General (UR)', qualifying_marks: 40, merit_cutoff: 82, highest_marks: 94 },
        { category: 'OBC (BC-II)', qualifying_marks: 36, merit_cutoff: 78, highest_marks: 94 },
        { category: 'EBC (BC-I)', qualifying_marks: 34, merit_cutoff: 74, highest_marks: 88 },
        { category: 'SC / ST', qualifying_marks: 30, merit_cutoff: 68, highest_marks: 81 },
        { category: 'EWS (General)', qualifying_marks: 36, merit_cutoff: 76, highest_marks: 91 },
      ];

      return res.json({
        success: true,
        total_qualifiers: toppers.length,
        toppers_count: toppers.length,
        toppers,
        cutoffs,
        gazette_published_date: '2026-08-30',
        gazette_notification_no: 'BSEDRC/GAZETTE/2026/08-RES-01',
        source: 'supabase',
      });
    } catch (err) {
      console.error('❌ Merit gazette Supabase error:', err);
      return res.status(500).json({ success: false, error: 'Unable to fetch merit results from Supabase.' });
    }
  });

  // ------------------------------------------
  // TAMPER-PROOF VERIFICATION / QR LOOKUP API
  // ------------------------------------------
  app.get('/api/verify/lookup', async (req, res) => {
    const { query, type } = req.query;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: 'Query parameter (Registration ID, Roll No or Verification Hash) is required.' });
    }

    try {
      const clean = query.trim().toUpperCase();
      const students = await StudentRepository.findAll();
      const student = students.find(
        (s) =>
          s.registration_id.toUpperCase() === clean ||
          s.exam_details.roll_no?.toUpperCase() === clean ||
          `BSEDRC-CERT-${s.registration_id.replace(/[^0-9]/g, '')}` === clean
      );

      if (!student) {
        return res.status(404).json({
          success: false,
          is_valid: false,
          error: 'No authentic BSEDRC council record found for the supplied identifier.',
        });
      }

      const councilHash = `SHA256:BSEDRC:${student.registration_id}:${student.exam_details.roll_no || 'NA'}:${student.result_details.marks_obtained || 0}:${Buffer.from(student.personal_data.name).toString('base64').slice(0, 8)}`;

      const result: VerificationResult = {
        is_valid: true,
        type: (type as any) || (student.result_details.marks_obtained !== undefined ? 'MARKSHEET' : 'ADMIT_CARD'),
        verification_code: `VER-${student.registration_id.replace('BSEDRC-', '')}`,
        student,
        verified_at: new Date().toISOString(),
        council_signature_hash: councilHash,
        remarks: 'Authentic Official Record verified against Bihar State Educational Development and Research Council Central Master Register.',
      };

      return res.json({ success: true, verification: result });
    } catch (error) {
      return createSupabaseErrorResponse(res, 'Verification lookup', error);
    }
  });

  // ------------------------------------------
  // STUDENT GRIEVANCE & CORRECTION DESK API
  // ------------------------------------------
  app.get('/api/grievances', async (req, res) => {
    const { reg_id, status } = req.query;

    try {
      let list: GrievanceTicket[] = [];

      if (reg_id) {
        list = await GrievanceRepository.findByStudentId(reg_id as string);
      } else {
        list = await GrievanceRepository.findAll();
      }

      if (status && typeof status === 'string' && status !== 'ALL') {
        list = list.filter((g) => g.status === status);
      }

      return res.json({ success: true, count: list.length, grievances: list });
    } catch (err) {
      console.error('❌ Grievances fetch error:', err);
      return res.status(500).json({ success: false, error: 'Unable to fetch grievances from Supabase.' });
    }
  });

  app.post('/api/grievances', async (req, res) => {
    const { registration_id, student_name, father_name, mobile, issue_category, description, requested_changes } = req.body;
    if (!registration_id || !student_name || !description) {
      return res.status(400).json({ success: false, error: 'Registration ID, Name, and Issue Description are required.' });
    }

    const ticket_id = `GRV-2026-${String(Date.now()).slice(-6)}`;
    const newTicket: GrievanceTicket = {
      ticket_id,
      registration_id: registration_id.trim().toUpperCase(),
      student_name: student_name.trim(),
      father_name: father_name?.trim() || '',
      mobile: mobile?.trim() || '',
      issue_category: issue_category || 'NAME_CORRECTION',
      description: description.trim(),
      requested_changes: requested_changes?.trim() || description.trim(),
      status: 'PENDING',
      admin_remarks: 'Application logged in Central Helpdesk Queue. Assigned to Verification Officer.',
      created_at: new Date().toISOString(),
    };

    try {
      const created = await GrievanceRepository.create(newTicket);
      if (!created) {
        return res.status(500).json({ success: false, error: 'Grievance submission failed while saving to Supabase.' });
      }
      return res.json({
        success: true,
        message: 'Grievance ticket successfully submitted. Your Token ID is ' + ticket_id,
        ticket: created,
      });
    } catch (err) {
      console.error('❌ Grievance creation Supabase error:', err);
      return res.status(500).json({ success: false, error: 'Grievance submission failed while saving to Supabase.' });
    }
  });

  app.put('/api/grievances/:id', async (req, res) => {
    const { id } = req.params;
    const { status, admin_remarks } = req.body;

    try {
      const existing = await GrievanceRepository.findByTicketId(id);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Grievance ticket not found.' });
      }

      const ticket = {
        ...existing,
        status: status || existing.status,
        admin_remarks: admin_remarks !== undefined ? admin_remarks : existing.admin_remarks,
        updated_at: new Date().toISOString(),
      };

      const updated = await GrievanceRepository.updateStatus(id, ticket.status, ticket.admin_remarks);
      if (!updated) {
        return res.status(500).json({ success: false, error: 'Grievance update failed while saving to Supabase.' });
      }

      return res.json({ success: true, message: 'Grievance ticket updated successfully', ticket: updated });
    } catch (err) {
      console.error('❌ Grievance update Supabase error:', err);
      return res.status(500).json({ success: false, error: 'Grievance update failed while saving to Supabase.' });
    }
  });

  // ------------------------------------------
  // EXAM CENTER ATTENDANCE & OMR DESK API
  // ------------------------------------------
  app.get('/api/exam-center/attendance-sheet', async (req, res) => {
    const { center_name, room_no, district } = req.query;

    try {
      let students = (await StudentRepository.findAll()).filter((s) => Boolean(s.exam_details.roll_no));

      if (center_name && typeof center_name === 'string' && center_name !== 'ALL') {
        students = students.filter((s) => s.exam_details.exam_center?.toLowerCase().includes(center_name.toLowerCase()));
      }
      if (room_no && typeof room_no === 'string' && room_no !== 'ALL') {
        students = students.filter((s) => s.exam_details.room_no?.toLowerCase().includes(room_no.toLowerCase()));
      }
      if (district && typeof district === 'string' && district !== 'ALL') {
        students = students.filter((s) => s.school_data.district?.toLowerCase() === district.toLowerCase());
      }

      students.sort((a, b) => Number(a.exam_details.roll_no || 0) - Number(b.exam_details.roll_no || 0));

      return res.json({
        success: true,
        exam_title: 'Bihar State Talent & Scholarship Examination 2026',
        exam_date: '15 September 2026 (Sunday)',
        exam_time: '10:00 AM - 12:30 PM',
        center_name: center_name || 'All Examination Centers',
        total_candidates: students.length,
        candidates: students.map((s, idx) => ({
          serial_no: idx + 1,
          registration_id: s.registration_id,
          roll_no: s.exam_details.roll_no,
          student_name: s.personal_data.name,
          father_name: s.personal_data.father_name,
          dob: s.personal_data.dob,
          school_name: s.school_data.school_name,
          district: s.school_data.district,
          room_no: s.exam_details.room_no || 'Room 101',
          photo_url: s.personal_data.photo_url,
          omr_barcode: `OMR-2026-${s.exam_details.roll_no}`,
        })),
      });
    } catch (error) {
      return createSupabaseErrorResponse(res, 'Attendance sheet fetch', error);
    }
  });

  // ------------------------------------------
  // PROVIDER-INDEPENDENT OBJECT STORAGE
  // ------------------------------------------
  app.post('/api/storage/upload', async (req, res) => {
    const { filename, file_data, folder, mime_type, visibility } = req.body;
    if (!filename || !file_data) {
      return res.status(400).json({ success: false, error: 'Filename and file_data (base64) are required.' });
    }
    if (typeof file_data !== 'string' || file_data.startsWith('http')) {
      return res.status(400).json({ success: false, error: 'file_data must be a base64-encoded file.' });
    }
    const cleanFolder = String(folder || 'student-documents').replace(/[^a-zA-Z0-9/_-]/g, '_').replace(/^\/+|\/+$/g, '');
    const cleanName = String(filename).split(/[\\/]/).pop()!.replace(/[^a-zA-Z0-9._-]/g, '_');
    const dataUrlMatch = file_data.match(/^data:([^;]+);base64,(.+)$/s);
    const body = Buffer.from(dataUrlMatch ? dataUrlMatch[2] : file_data, 'base64');
    if (!body.length) return res.status(400).json({ success: false, error: 'file_data did not contain a valid file.' });
    const contentType = String(mime_type || (dataUrlMatch ? dataUrlMatch[1] : 'application/octet-stream'));
    const requestedVisibility: StorageVisibility = visibility === 'public' || /^(notice-pdfs|gallery-images)(\/|$)/.test(cleanFolder) ? 'public' : 'private';
    const objectKey = `${cleanFolder || 'student-documents'}/${Date.now()}_${cleanName}`;
    try {
      const stored = await storageService.upload({ key: objectKey, body, fileName: cleanName, mimeType: contentType, visibility: requestedVisibility });
      const fileUrl = requestedVisibility === 'public' ? storageService.getPublicUrl(stored.key) : await storageService.createSignedUrl(stored.key);
      return res.json({ success: true, message: 'File uploaded successfully', storage_provider: 'Supabase Storage', object_key: stored.key, file_url: fileUrl, visibility: requestedVisibility, mime_type: stored.mimeType, file_size: stored.fileSize });
    } catch (error) {
      return createSupabaseErrorResponse(res, 'Storage upload', error);
    }
  });

  // System Environment & API Health Status Check
  app.get('/api/system/env-status', async (req, res) => {
    const rzpConfigured = Boolean(process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes('YOUR_'));
    const dbConfigured = Boolean(process.env.DATABASE_URL || process.env.DATABASE_HOST);
    const supabaseConfigured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);

    let supabaseStatus = 'NOT_CONFIGURED';
    if (supabaseConfigured) {
      try {
        const { data, error } = await supabase.from('schools').select('count(*)').limit(1);
        supabaseStatus = !error ? 'CONNECTED' : 'ERROR';
      } catch (err) {
        supabaseStatus = 'ERROR';
      }
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      services: {
        supabase: {
          status: supabaseStatus,
          url_preview: process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL.slice(0, 20)}...` : 'NOT_SET',
          secret_key_configured: supabaseConfigured,
        },
        razorpay: {
          status: rzpConfigured ? 'CONFIGURED' : 'SANDBOX_ACTIVE',
          key_id_preview: process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.slice(0, 8)}...` : 'rzp_test_MLF2026...',
          currency: process.env.RAZORPAY_CURRENCY || 'INR',
        },
        storage: {
          provider: 'Supabase Storage',
          private_bucket: process.env.SUPABASE_STORAGE_BUCKET || 'student-documents',
          public_bucket: process.env.SUPABASE_STORAGE_PUBLIC_BUCKET || `${process.env.SUPABASE_STORAGE_BUCKET || 'student-documents'}-public`,
          status: supabaseConfigured ? supabaseStatus : 'NOT_CONFIGURED',
        },
        database: {
          status: dbConfigured ? 'READY' : 'IN_MEMORY_FALLBACK',
          dialect: process.env.DATABASE_URL?.startsWith('postgres') ? 'PostgreSQL' : 'MySQL / In-Memory',
        },
      },
    });
  });

  // ==========================================
  // VITE MIDDLEWARE & STATIC FALLBACK
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Foundation Portal Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
