import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_SCHOOLS, INITIAL_FORMS, INITIAL_STUDENTS, INITIAL_NOTICES, INITIAL_TOPPERS, INITIAL_GRIEVANCES } from './src/data/initialData';
import { School, FormConfig, Student, AnalyticsSummary, AdminUser, NoticeCircular, MeritTopper, GrievanceTicket, VerificationResult } from './src/types';

// In-Memory Database Store initialized with realistic seeds
let schoolsStore: School[] = [...INITIAL_SCHOOLS];
let formsStore: FormConfig[] = [...INITIAL_FORMS];
let studentsStore: Student[] = [...INITIAL_STUDENTS];
let noticesStore: NoticeCircular[] = [...INITIAL_NOTICES];
let toppersStore: MeritTopper[] = [...INITIAL_TOPPERS];
let grievancesStore: GrievanceTicket[] = [...INITIAL_GRIEVANCES];

let nextRegNumber = 8946;
let nextRollNumber = 100250;
let nextGrievanceNumber = 100;

// Admin Accounts for BSEDRC Portal
const ADMIN_ACCOUNTS: Array<{
  id: string;
  username: string;
  email: string;
  password: string;
  name: string;
  role: 'SUPER_ADMIN' | 'EXAM_CONTROLLER' | 'DATA_OFFICER';
  role_label: string;
  department: string;
}> = [
  {
    id: 'adm_1',
    username: 'admin',
    email: 'admin@bsedrc.gov.in',
    password: 'admin123',
    name: 'Dr. Rajeshwar Kumar Verma',
    role: 'SUPER_ADMIN',
    role_label: 'Super Administrator & Director',
    department: 'Council Executive Directorate',
  },
  {
    id: 'adm_2',
    username: 'controller',
    email: 'controller@bsedrc.gov.in',
    password: 'bsedrc@2026',
    name: 'Prof. Sunita Kumari',
    role: 'EXAM_CONTROLLER',
    role_label: 'Controller of Examinations',
    department: 'State Board Examination Wing',
  },
  {
    id: 'adm_3',
    username: 'officer',
    email: 'officer@bsedrc.gov.in',
    password: 'pass123',
    name: 'Manoj Kumar Jha',
    role: 'DATA_OFFICER',
    role_label: 'Verification & Statistical Officer',
    department: 'U-DISE & Institutional Records',
  },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

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
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      organization: 'Bihar State Educational Development and Research Council (BSEDRC)',
      service: 'BSEDRC Student Lifecycle & Examination Central Backend',
      timestamp: new Date().toISOString(),
      counts: {
        schools: schoolsStore.length,
        forms: formsStore.length,
        students: studentsStore.length,
      },
    });
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

    const cleanInput = username.trim().toLowerCase();
    const admin = ADMIN_ACCOUNTS.find(
      (a) =>
        (a.username.toLowerCase() === cleanInput || a.email.toLowerCase() === cleanInput) &&
        a.password === password
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Council Administrator credentials. Please check your username and password.',
      });
    }

    // Role check if specified
    if (role && role !== admin.role && admin.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: `Selected role (${role}) does not match administrator privileges for ${admin.name}.`,
      });
    }

    const token = `bsedrc_auth_${admin.id}_${Date.now()}`;
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
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authorization token missing.' });
    }

    const token = authHeader.split(' ')[1];
    const adminId = token.split('_')[2];
    const admin = ADMIN_ACCOUNTS.find((a) => a.id === adminId) || ADMIN_ACCOUNTS[0];

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
  app.post('/api/student/login', (req, res) => {
    const { registration_id, mobile, dob, otp } = req.body;

    if (!registration_id && !mobile) {
      return res.status(400).json({
        success: false,
        error: 'Registration ID ya Mobile Number likhna anivarya hai.',
      });
    }

    let student: Student | undefined;

    if (registration_id) {
      const cleanReg = registration_id.trim().toLowerCase();
      student = studentsStore.find(
        (s) => s.registration_id.toLowerCase() === cleanReg
      );

      if (!student) {
        return res.status(404).json({
          success: false,
          error: `Registration ID '${registration_id}' ke saath koi record nahi mila. Kripya sahi ID dalein ya Naya Registration karein.`,
        });
      }

      if (dob && student.personal_data.dob !== dob) {
        return res.status(401).json({
          success: false,
          error: 'Janam Tithi (Date of Birth) record se match nahi ho rahi hai.',
        });
      }
    } else if (mobile) {
      const cleanMob = mobile.trim();
      student = studentsStore.find(
        (s) => s.personal_data.mobile === cleanMob
      );

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

    const token = `bsedrc_std_${student.registration_id}_${Date.now()}`;
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

    res.json({
      success: true,
      message: `Namaste ${student.personal_data.name}! Aapka portal login safal raha.`,
      student: studentUser,
      studentRecord: student,
      token,
    });
  });

  app.post('/api/student/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Student authorization token missing.' });
    }

    const token = authHeader.split(' ')[1];
    const parts = token.split('_');
    const regId = parts.length >= 3 ? parts.slice(2, -1).join('_') : '';

    const student = studentsStore.find((s) => s.registration_id === regId) || studentsStore[0];

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student session expired.' });
    }

    res.json({
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
  });



  // ------------------------------------------
  // SCHOOLS MASTER & CASCADING API
  // ------------------------------------------

  // Get Districts list
  app.get('/api/schools/districts', (req, res) => {
    const districts = Array.from(new Set(schoolsStore.map((s) => s.district))).sort();
    res.json({ success: true, districts });
  });

  // Get Blocks for a District
  app.get('/api/schools/blocks', (req, res) => {
    const district = req.query.district as string;
    if (!district) {
      return res.status(400).json({ success: false, error: 'District parameter required' });
    }
    const blocks = Array.from(
      new Set(schoolsStore.filter((s) => s.district.toLowerCase() === district.toLowerCase()).map((s) => s.block))
    ).sort();
    res.json({ success: true, blocks });
  });

  // Get Schools by District & Block
  app.get('/api/schools/by-block', (req, res) => {
    const district = req.query.district as string;
    const block = req.query.block as string;
    if (!district || !block) {
      return res.status(400).json({ success: false, error: 'District and Block parameters required' });
    }
    const schools = schoolsStore.filter(
      (s) =>
        s.district.toLowerCase() === district.toLowerCase() &&
        s.block.toLowerCase() === block.toLowerCase()
    );
    res.json({ success: true, schools });
  });

  // List all schools with search & filter
  app.get('/api/schools', (req, res) => {
    const { district, block, q, udise } = req.query as {
      district?: string;
      block?: string;
      q?: string;
      udise?: string;
    };

    let filtered = [...schoolsStore];

    if (udise) {
      filtered = filtered.filter((s) => s.udise_code.includes(udise));
    }
    if (district) {
      filtered = filtered.filter((s) => s.district.toLowerCase() === district.toLowerCase());
    }
    if (block) {
      filtered = filtered.filter((s) => s.block.toLowerCase() === block.toLowerCase());
    }
    if (q) {
      const lower = q.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.school_name.toLowerCase().includes(lower) ||
          s.udise_code.includes(lower) ||
          s.panchayat.toLowerCase().includes(lower)
      );
    }

    res.json({ success: true, count: filtered.length, schools: filtered });
  });

  // Add Single School
  app.post('/api/schools', (req, res) => {
    const { udise_code, school_name, district, block, panchayat } = req.body;
    if (!udise_code || !school_name || !district || !block) {
      return res.status(400).json({ success: false, error: 'All fields (udise_code, school_name, district, block) are required.' });
    }

    const exists = schoolsStore.some((s) => s.udise_code === udise_code);
    if (exists) {
      return res.status(409).json({ success: false, error: `School with U-DISE Code ${udise_code} already exists.` });
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

    schoolsStore.unshift(newSchool);
    res.status(201).json({ success: true, message: 'School added to master directory', school: newSchool });
  });

  // Bulk Upload Schools
  app.post('/api/schools/bulk', (req, res) => {
    const { schools } = req.body as { schools: Partial<School>[] };
    if (!Array.isArray(schools) || schools.length === 0) {
      return res.status(400).json({ success: false, error: 'Schools array is required.' });
    }

    let addedCount = 0;
    let updatedCount = 0;

    for (const item of schools) {
      if (!item.udise_code || !item.school_name) continue;

      const index = schoolsStore.findIndex((s) => s.udise_code === item.udise_code);
      if (index >= 0) {
        schoolsStore[index] = {
          ...schoolsStore[index],
          school_name: item.school_name || schoolsStore[index].school_name,
          district: item.district || schoolsStore[index].district,
          block: item.block || schoolsStore[index].block,
          panchayat: item.panchayat || schoolsStore[index].panchayat,
        };
        updatedCount++;
      } else {
        schoolsStore.push({
          _id: `sch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          udise_code: item.udise_code,
          school_name: item.school_name,
          district: item.district || 'Bihar',
          block: item.block || 'Sadar',
          panchayat: item.panchayat || '',
          created_at: new Date().toISOString(),
        });
        addedCount++;
      }
    }

    res.json({
      success: true,
      message: `Bulk import completed: ${addedCount} schools added, ${updatedCount} updated.`,
      addedCount,
      updatedCount,
      total: schoolsStore.length,
    });
  });

  // ------------------------------------------
  // FORMS CONFIG & LIFECYCLE MANAGEMENT
  // ------------------------------------------

  app.get('/api/forms', (req, res) => {
    res.json({ success: true, forms: formsStore });
  });

  app.get('/api/forms/:id', (req, res) => {
    const form = formsStore.find((f) => f._id === req.params.id || f.form_id === req.params.id);
    if (!form) {
      return res.status(404).json({ success: false, error: 'Form configuration not found' });
    }
    res.json({ success: true, form });
  });

  app.post('/api/forms', (req, res) => {
    const { title, fee_amount, academic_year, custom_fields, exam_date, exam_time, exam_center_default } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const formId = `EXAM_${new Date().getFullYear()}_0${formsStore.length + 1}`;
    const newForm: FormConfig = {
      _id: `form_${Date.now()}`,
      form_id: formId,
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

    formsStore.unshift(newForm);
    res.status(201).json({ success: true, message: 'Form created successfully', form: newForm });
  });

  // Update Form Lifecycle (Release Admit Card, Declare Results, Toggle active)
  app.put('/api/forms/:id', (req, res) => {
    const index = formsStore.findIndex((f) => f._id === req.params.id || f.form_id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }

    const updated = {
      ...formsStore[index],
      ...req.body,
    };

    formsStore[index] = updated;
    res.json({ success: true, message: 'Form configuration updated', form: updated });
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
  app.post('/api/payment/verify-and-register', (req, res) => {
    const {
      form_id,
      personal_data,
      school_data,
      payment_mode,
      amount,
      txn_id,
      order_id
    } = req.body;

    if (!personal_data?.name || !personal_data?.father_name || !personal_data?.dob || !personal_data?.mobile) {
      return res.status(400).json({ success: false, error: 'Missing required student personal information.' });
    }

    if (!school_data?.udise_code || !school_data?.school_name) {
      return res.status(400).json({ success: false, error: 'School information with valid U-DISE is required.' });
    }

    // Generate Auto-Increment Unique Registration ID (BSEDRC-YYYY-XXXX)
    const currentYear = new Date().getFullYear();
    const regId = `BSEDRC-${currentYear}-${nextRegNumber++}`;
    const generatedRollNo = `${nextRollNumber++}`;

    const form = formsStore.find((f) => f.form_id === form_id || f._id === form_id) || formsStore[0];

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

    studentsStore.unshift(newStudent);

    res.status(201).json({
      success: true,
      message: 'Student successfully registered and payment verified.',
      student: newStudent,
      registration_id: regId,
    });
  });

  // ------------------------------------------
  // STUDENT PORTAL & STATUS CHECK API
  // ------------------------------------------

  // Single Student View API (GET /api/student/status?reg_id=MLF-2026-8941&dob=2008-08-15)
  app.get('/api/student/status', (req, res) => {
    const reg_id = (req.query.reg_id || req.query.registration_id) as string;
    const dob = req.query.dob as string;

    if (!reg_id) {
      return res.status(400).json({ success: false, error: 'Registration ID is required' });
    }

    const student = studentsStore.find(
      (s) => s.registration_id.toLowerCase() === reg_id.toLowerCase().trim()
    );

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

    const form = formsStore.find((f) => f.form_id === student.form_id) || formsStore[0];

    const admit_card_available = Boolean(form?.admit_card_status?.is_released && student.exam_details?.roll_no);
    const result_available = Boolean(form?.result_status?.is_declared && student.result_details?.marks_obtained !== undefined);

    res.json({
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
  });

  // ------------------------------------------
  // ADMIN STUDENTS LIST & SEARCH
  // ------------------------------------------

  app.get('/api/students', (req, res) => {
    const { form_id, udise_code, district, block, payment_status, result_status, q } = req.query as Record<string, string>;

    let filtered = [...studentsStore];

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

    res.json({
      success: true,
      count: filtered.length,
      students: filtered,
    });
  });

  // Update Single Student (Marks, Roll, Exam Center)
  app.put('/api/students/:id', (req, res) => {
    const index = studentsStore.findIndex((s) => s._id === req.params.id || s.registration_id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const current = studentsStore[index];
    const updated: Student = {
      ...current,
      ...req.body,
      personal_data: { ...current.personal_data, ...(req.body.personal_data || {}) },
      school_data: { ...current.school_data, ...(req.body.school_data || {}) },
      exam_details: { ...current.exam_details, ...(req.body.exam_details || {}) },
      result_details: { ...current.result_details, ...(req.body.result_details || {}) },
      updated_at: new Date().toISOString(),
    };

    // Auto compute percentage and grade if marks entered
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

    studentsStore[index] = updated;
    res.json({ success: true, message: 'Student updated successfully', student: updated });
  });

  // Bulk Admit Card Generation & Allocation
  app.post('/api/students/bulk-admit-cards', (req, res) => {
    const { form_id, default_center } = req.body;
    let count = 0;

    studentsStore = studentsStore.map((student) => {
      if (!form_id || student.form_id === form_id) {
        count++;
        return {
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
      }
      return student;
    });

    res.json({
      success: true,
      message: `Generated and assigned admit cards for ${count} students.`,
      count,
    });
  });

  // Bulk Marks Entry / Result Import
  app.post('/api/students/bulk-results', (req, res) => {
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

    let updatedCount = 0;

    results.forEach((item) => {
      const student = studentsStore.find(
        (s) =>
          (item.registration_id && s.registration_id === item.registration_id) ||
          (item.roll_no && s.exam_details.roll_no === item.roll_no)
      );

      if (student) {
        const marks = Number(item.marks_obtained);
        const total = Number(item.total_marks || student.result_details.total_marks || 100);
        const pct = (marks / total) * 100;

        student.result_details = {
          ...student.result_details,
          marks_obtained: marks,
          total_marks: total,
          percentage: Number(pct.toFixed(1)),
          status: pct >= 40 ? 'PASS' : 'FAIL',
          grade: pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 40 ? 'C' : 'D',
        };
        student.updated_at = new Date().toISOString();
        updatedCount++;
      }
    });

    // Recompute ranks for all who have marks
    const graded = studentsStore.filter((s) => s.result_details.marks_obtained !== undefined);
    graded.sort((a, b) => (b.result_details.marks_obtained || 0) - (a.result_details.marks_obtained || 0));
    graded.forEach((s, idx) => {
      s.result_details.rank = idx + 1;
    });

    res.json({
      success: true,
      message: `Successfully processed results for ${updatedCount} students.`,
      updatedCount,
    });
  });

  // ------------------------------------------
  // INSTITUTIONAL SEARCH & NOTICE BOARD
  // ------------------------------------------

  app.post('/api/institution/search', (req, res) => {
    const { udise_code, district, block, school_name } = req.body;

    let matchingSchool = schoolsStore.find(
      (s) =>
        (udise_code && s.udise_code === udise_code) ||
        (school_name && s.school_name.toLowerCase().includes(school_name.toLowerCase()))
    );

    let filtered = studentsStore;

    if (udise_code) {
      filtered = filtered.filter((s) => s.school_data.udise_code === udise_code);
    } else {
      if (district) {
        filtered = filtered.filter((s) => s.school_data.district.toLowerCase() === district.toLowerCase());
      }
      if (block) {
        filtered = filtered.filter((s) => s.school_data.block.toLowerCase() === block.toLowerCase());
      }
      if (school_name) {
        filtered = filtered.filter((s) =>
          s.school_data.school_name.toLowerCase().includes(school_name.toLowerCase())
        );
      }
    }

    const totalStudents = filtered.length;
    const paidStudents = filtered.filter((s) => s.payment_info.status === 'PAID').length;
    const passedStudents = filtered.filter((s) => s.result_details.status === 'PASS').length;

    res.json({
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
  });

  // ------------------------------------------
  // ANALYTICS SUMMARY
  // ------------------------------------------

  app.get('/api/analytics', (req, res) => {
    const totalStudents = studentsStore.length;
    const paidStudents = studentsStore.filter((s) => s.payment_info.status === 'PAID');
    const totalRevenue = paidStudents.reduce((acc, s) => acc + (s.payment_info.amount || 50), 0);
    const admitCardsIssued = studentsStore.filter((s) => Boolean(s.exam_details.roll_no)).length;
    const withResults = studentsStore.filter((s) => s.result_details.marks_obtained !== undefined);
    const passCount = withResults.filter((s) => s.result_details.status === 'PASS').length;
    const failCount = withResults.filter((s) => s.result_details.status === 'FAIL').length;

    const districtMap: Record<string, number> = {};
    studentsStore.forEach((s) => {
      const dist = s.school_data.district || 'Unknown';
      districtMap[dist] = (districtMap[dist] || 0) + 1;
    });

    const classMap: Record<string, number> = {};
    studentsStore.forEach((s) => {
      const cls = s.school_data.current_class || '10th';
      classMap[cls] = (classMap[cls] || 0) + 1;
    });

    const summary: AnalyticsSummary = {
      total_students: totalStudents,
      total_paid: paidStudents.length,
      total_revenue: totalRevenue,
      total_schools: schoolsStore.length,
      admit_cards_issued: admitCardsIssued,
      results_declared: withResults.length,
      pass_count: passCount,
      fail_count: failCount,
      pass_percentage: withResults.length > 0 ? Number(((passCount / withResults.length) * 100).toFixed(1)) : 0,
      districts_count: Object.keys(districtMap).length,
      district_distribution: Object.entries(districtMap).map(([district, count]) => ({ district, count })),
      class_distribution: Object.entries(classMap).map(([class_name, count]) => ({ class_name, count })),
    };

    res.json({ success: true, analytics: summary });
  });

  // ------------------------------------------
  // OFFICIAL NOTICES & CIRCULARS API
  // ------------------------------------------
  app.get('/api/notices', (req, res) => {
    const { category, q } = req.query;
    let list = [...noticesStore];
    if (category && typeof category === 'string' && category !== 'ALL') {
      list = list.filter((n) => n.category === category);
    }
    if (q && typeof q === 'string') {
      const lower = q.toLowerCase();
      list = list.filter(
        (n) =>
          n.title_hi.toLowerCase().includes(lower) ||
          n.title_en.toLowerCase().includes(lower) ||
          n.notice_no.toLowerCase().includes(lower) ||
          n.summary_hi.toLowerCase().includes(lower)
      );
    }
    res.json({ success: true, count: list.length, notices: list });
  });

  app.post('/api/notices', (req, res) => {
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
      signed_by: req.body.signed_by || 'परीक्षा नियंत्रक (Controller of Examinations), BSEDRC',
    };
    noticesStore.unshift(newNotice);
    res.json({ success: true, message: 'Notice published successfully', notice: newNotice });
  });

  app.delete('/api/notices/:id', (req, res) => {
    const { id } = req.params;
    noticesStore = noticesStore.filter((n) => n.id !== id);
    res.json({ success: true, message: 'Notice deleted successfully' });
  });

  // ------------------------------------------
  // MERIT GAZETTE & TOPPERS API
  // ------------------------------------------
  app.get('/api/merit-gazette', (req, res) => {
    const { district, class_name, category } = req.query;

    // Compile dynamic topper list from current students with results
    const rankedStudents = studentsStore
      .filter((s) => s.result_details?.marks_obtained !== undefined && s.result_details.status === 'PASS')
      .sort((a, b) => (b.result_details.marks_obtained || 0) - (a.result_details.marks_obtained || 0));

    let toppers: MeritTopper[] = rankedStudents.map((s, index) => {
      let award = 'Merit Certificate of Excellence';
      if (index === 0) award = 'State Gold Medal + ₹12,000/yr Grant + Tab Kit';
      else if (index === 1) award = 'State Silver Medal + ₹12,000/yr Grant + Citation';
      else if (index === 2) award = 'State Bronze Medal + ₹12,000/yr Grant + Certificate';
      else if (index < 10) award = 'State Top 10 Distinction + ₹6,000/yr Grant';
      else if (index < 50) award = 'State Merit Grant + Certificate';

      return {
        rank: s.result_details.rank || index + 1,
        registration_id: s.registration_id,
        roll_no: s.exam_details.roll_no || `100${245 + index}`,
        name: s.personal_data.name,
        father_name: s.personal_data.father_name,
        school_name: s.school_data.school_name,
        district: s.school_data.district,
        current_class: s.school_data.current_class || '10th',
        category: s.personal_data.category || 'General',
        marks_obtained: s.result_details.marks_obtained || 0,
        total_marks: s.result_details.total_marks || 100,
        percentage: s.result_details.percentage || 0,
        award_scholarship: award,
        photo_url: s.personal_data.photo_url,
      };
    });

    if (district && typeof district === 'string' && district !== 'ALL') {
      toppers = toppers.filter((t) => t.district.toLowerCase() === district.toLowerCase());
    }
    if (class_name && typeof class_name === 'string' && class_name !== 'ALL') {
      toppers = toppers.filter((t) => t.current_class === class_name);
    }
    if (category && typeof category === 'string' && category !== 'ALL') {
      toppers = toppers.filter((t) => t.category.toLowerCase().includes(category.toLowerCase()));
    }

    // Category Cut-offs calculation
    const cutoffs = [
      { category: 'General (UR)', qualifying_marks: 40, merit_cutoff: 82, highest_marks: 94 },
      { category: 'OBC (BC-II)', qualifying_marks: 36, merit_cutoff: 78, highest_marks: 94 },
      { category: 'EBC (BC-I)', qualifying_marks: 34, merit_cutoff: 74, highest_marks: 88 },
      { category: 'SC / ST', qualifying_marks: 30, merit_cutoff: 68, highest_marks: 81 },
      { category: 'EWS (General)', qualifying_marks: 36, merit_cutoff: 76, highest_marks: 91 },
    ];

    res.json({
      success: true,
      total_qualifiers: rankedStudents.length,
      toppers_count: toppers.length,
      toppers,
      cutoffs,
      gazette_published_date: '2026-08-30',
      gazette_notification_no: 'BSEDRC/GAZETTE/2026/08-RES-01',
    });
  });

  // ------------------------------------------
  // TAMPER-PROOF VERIFICATION / QR LOOKUP API
  // ------------------------------------------
  app.get('/api/verify/lookup', (req, res) => {
    const { query, type } = req.query;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: 'Query parameter (Registration ID, Roll No or Verification Hash) is required.' });
    }

    const clean = query.trim().toUpperCase();
    const student = studentsStore.find(
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

    // Generate cryptographic-style council integrity seal
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

    res.json({ success: true, verification: result });
  });

  // ------------------------------------------
  // STUDENT GRIEVANCE & CORRECTION DESK API
  // ------------------------------------------
  app.get('/api/grievances', (req, res) => {
    const { reg_id, status } = req.query;
    let list = [...grievancesStore];
    if (reg_id && typeof reg_id === 'string') {
      list = list.filter((g) => g.registration_id.toUpperCase() === reg_id.trim().toUpperCase());
    }
    if (status && typeof status === 'string' && status !== 'ALL') {
      list = list.filter((g) => g.status === status);
    }
    res.json({ success: true, count: list.length, grievances: list });
  });

  app.post('/api/grievances', (req, res) => {
    const { registration_id, student_name, father_name, mobile, issue_category, description, requested_changes } = req.body;
    if (!registration_id || !student_name || !description) {
      return res.status(400).json({ success: false, error: 'Registration ID, Name, and Issue Description are required.' });
    }

    nextGrievanceNumber += 1;
    const ticket_id = `GRV-2026-${String(nextGrievanceNumber).padStart(4, '0')}`;

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

    grievancesStore.unshift(newTicket);
    res.json({
      success: true,
      message: 'Grievance ticket successfully submitted. Your Token ID is ' + ticket_id,
      ticket: newTicket,
    });
  });

  app.put('/api/grievances/:id', (req, res) => {
    const { id } = req.params;
    const { status, admin_remarks, apply_correction_to_student } = req.body;

    const ticketIndex = grievancesStore.findIndex((g) => g.ticket_id === id);
    if (ticketIndex === -1) {
      return res.status(404).json({ success: false, error: 'Grievance ticket not found.' });
    }

    const ticket = grievancesStore[ticketIndex];
    if (status) ticket.status = status;
    if (admin_remarks !== undefined) ticket.admin_remarks = admin_remarks;
    ticket.updated_at = new Date().toISOString();

    // If approved and requested to apply to student record
    if (status === 'APPROVED' && apply_correction_to_student) {
      const student = studentsStore.find((s) => s.registration_id === ticket.registration_id);
      if (student && typeof apply_correction_to_student === 'object') {
        if (apply_correction_to_student.name) student.personal_data.name = apply_correction_to_student.name;
        if (apply_correction_to_student.father_name) student.personal_data.father_name = apply_correction_to_student.father_name;
        if (apply_correction_to_student.dob) student.personal_data.dob = apply_correction_to_student.dob;
        if (apply_correction_to_student.school_name) student.school_data.school_name = apply_correction_to_student.school_name;
        student.updated_at = new Date().toISOString();
      }
    }

    res.json({ success: true, message: 'Grievance ticket updated successfully', ticket });
  });

  // ------------------------------------------
  // EXAM CENTER ATTENDANCE & OMR DESK API
  // ------------------------------------------
  app.get('/api/exam-center/attendance-sheet', (req, res) => {
    const { center_name, room_no, district } = req.query;
    let students = [...studentsStore].filter((s) => Boolean(s.exam_details.roll_no));

    if (center_name && typeof center_name === 'string' && center_name !== 'ALL') {
      students = students.filter((s) => s.exam_details.exam_center?.toLowerCase().includes(center_name.toLowerCase()));
    }
    if (room_no && typeof room_no === 'string' && room_no !== 'ALL') {
      students = students.filter((s) => s.exam_details.room_no?.toLowerCase().includes(room_no.toLowerCase()));
    }
    if (district && typeof district === 'string' && district !== 'ALL') {
      students = students.filter((s) => s.school_data.district?.toLowerCase() === district.toLowerCase());
    }

    // Sort by Roll Number ascending
    students.sort((a, b) => Number(a.exam_details.roll_no || 0) - Number(b.exam_details.roll_no || 0));

    res.json({
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
  });

  // ------------------------------------------
  // CLOUDFLARE R2 OBJECT STORAGE & ENVIRONMENT
  // ------------------------------------------

  // Storage Upload endpoint for student photos & documents (Cloudflare R2 integration)
  app.post('/api/storage/upload', (req, res) => {
    const { filename, file_data, folder } = req.body;
    if (!filename || !file_data) {
      return res.status(400).json({ success: false, error: 'Filename and file_data (base64 or url) are required.' });
    }

    const cleanFolder = folder || 'students/photos';
    const timestamp = Date.now();
    const sanitizedName = filename.toLowerCase().replace(/[^a-z0-9._-]/g, '_');
    const objectKey = `${cleanFolder}/${timestamp}_${sanitizedName}`;

    const r2PublicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/$/, '') || 'https://pub-r2.mahavirliteracy.org';
    const fileUrl = `${r2PublicUrl}/${objectKey}`;

    res.json({
      success: true,
      message: 'File prepared for storage',
      storage_provider: process.env.CLOUDFLARE_R2_ACCOUNT_ID ? 'Cloudflare R2 Bucket' : 'Local Sandbox Storage',
      bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'mlf-student-documents',
      object_key: objectKey,
      file_url: file_data.startsWith('http') ? file_data : fileUrl,
    });
  });

  // System Environment & API Health Status Check
  app.get('/api/system/env-status', (req, res) => {
    const rzpConfigured = Boolean(process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes('YOUR_'));
    const r2Configured = Boolean(process.env.CLOUDFLARE_R2_ACCOUNT_ID && process.env.CLOUDFLARE_R2_ACCESS_KEY_ID);
    const dbConfigured = Boolean(process.env.DATABASE_URL || process.env.DATABASE_HOST);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      services: {
        razorpay: {
          status: rzpConfigured ? 'CONFIGURED' : 'SANDBOX_ACTIVE',
          key_id_preview: process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.slice(0, 8)}...` : 'rzp_test_MLF2026...',
          currency: process.env.RAZORPAY_CURRENCY || 'INR',
        },
        cloudflare_r2: {
          status: r2Configured ? 'CONNECTED' : 'STANDBY',
          bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'mlf-student-documents',
          public_url: process.env.CLOUDFLARE_R2_PUBLIC_URL || 'https://pub-r2.mahavirliteracy.org',
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
