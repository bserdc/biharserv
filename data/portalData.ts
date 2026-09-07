import { School, FormConfig, Student, NoticeCircular, MeritTopper, GrievanceTicket } from '../student-zone/src/types';

export const INITIAL_SCHOOLS: School[] = [
  {
    _id: 'sch_1',
    udise_code: '10020100101',
    school_name: 'Govt High School, Madhepura',
    district: 'Madhepura',
    block: 'Madhepura',
    panchayat: 'Ward 05',
  },
  {
    _id: 'sch_2',
    udise_code: '10020100102',
    school_name: 'Adarsh Middle School, Shankarpur',
    district: 'Madhepura',
    block: 'Shankarpur',
    panchayat: 'Jirwa',
  },
  {
    _id: 'sch_3',
    udise_code: '10020100103',
    school_name: 'Project Girls High School, Singheshwar',
    district: 'Madhepura',
    block: 'Singheshwar',
    panchayat: 'Singheshwar Ward 02',
  },
  {
    _id: 'sch_4',
    udise_code: '10020100104',
    school_name: 'Govt Model Inter College, Murliganj',
    district: 'Madhepura',
    block: 'Murliganj',
    panchayat: 'Kolhai',
  },
  {
    _id: 'sch_5',
    udise_code: '10020200201',
    school_name: 'Patna Collegiate School, Bankipore',
    district: 'Patna',
    block: 'Patna Sadar',
    panchayat: 'Ward 12',
  },
  {
    _id: 'sch_6',
    udise_code: '10020200202',
    school_name: 'Ram Mohan Roy Seminary High School',
    district: 'Patna',
    block: 'Patna Sadar',
    panchayat: 'Ward 18',
  },
  {
    _id: 'sch_7',
    udise_code: '10020200203',
    school_name: 'Govt High School, Danapur Cantt',
    district: 'Patna',
    block: 'Danapur',
    panchayat: 'Saguna More',
  },
  {
    _id: 'sch_8',
    udise_code: '10020300301',
    school_name: 'Zila School, Saharsa',
    district: 'Saharsa',
    block: 'Saharsa Sadar',
    panchayat: 'Kahalgaon',
  },
  {
    _id: 'sch_9',
    udise_code: '10020300302',
    school_name: 'Girls High School, Simri Bakhtiarpur',
    district: 'Saharsa',
    block: 'Simri Bakhtiarpur',
    panchayat: 'Rani Bagh',
  },
  {
    _id: 'sch_10',
    udise_code: '10020400401',
    school_name: 'Marwari High School, Bhagalpur',
    district: 'Bhagalpur',
    block: 'Jagdishpur',
    panchayat: 'Nayabazar',
  },
  {
    _id: 'sch_11',
    udise_code: '10020400402',
    school_name: 'Mokama High School',
    district: 'Bhagalpur',
    block: 'Naugachia',
    panchayat: 'Makandpur',
  },
  {
    _id: 'sch_12',
    udise_code: '10020500501',
    school_name: 'Rajendra Memorial High School, Gaya',
    district: 'Gaya',
    block: 'Town Block',
    panchayat: 'Civil Lines',
  }
];

export const INITIAL_FORMS: FormConfig[] = [
  {
    _id: 'form_1',
    form_id: 'EXAM_2026_01',
    title: 'Medha Scholarship & Talent Search Examination 2026',
    description: 'Statewide scholarship test for Class 8th, 9th, 10th & 11th students by Bihar State Educational Development and Research Council.',
    academic_year: '2026-2027',
    fee_amount: 50,
    is_active: true,
    custom_fields: [
      { label: 'Aadhaar Number', type: 'text', required: true, placeholder: '12-digit Aadhaar' },
      { label: 'Mother Name', type: 'text', required: true, placeholder: 'Mother Full Name' },
      { label: 'Medium of Examination', type: 'select', required: true, options: ['Hindi', 'English'] }
    ],
    admit_card_status: {
      is_released: true,
      release_date: '2026-08-25',
    },
    result_status: {
      is_declared: true,
      declare_date: '2026-08-30',
    },
    exam_date: '2026-09-15',
    exam_time: '10:00 AM - 12:30 PM',
    exam_center_default: 'Govt High School Central Hall, District HQ',
    total_marks: 100,
    passing_marks: 40,
    instructions: [
      'Bring original printed Admit Card along with School ID or Aadhaar Card.',
      'Electronic gadgets, smartwatches, and calculators are strictly prohibited in the exam hall.',
      'Reach the exam venue 45 minutes prior to the reporting time (09:15 AM).',
      'Use only Blue or Black Ballpoint Pen for filling the OMR response sheet.',
      'Tampering with the barcode/QR code on the admit card will lead to disqualification.'
    ]
  },
  {
    _id: 'form_2',
    form_id: 'EXAM_2026_02',
    title: 'Science & Maths Olympiad Championship 2026',
    description: 'Annual Council STEM & Research test for high school innovators with scholarship & awards.',
    academic_year: '2026-2027',
    fee_amount: 100,
    is_active: true,
    custom_fields: [
      { label: 'Favorite Science Subject', type: 'select', required: true, options: ['Physics', 'Mathematics', 'Biology', 'Chemistry'] },
      { label: 'Parent WhatsApp No', type: 'text', required: true, placeholder: '10-digit mobile' }
    ],
    admit_card_status: {
      is_released: false,
      release_date: null,
    },
    result_status: {
      is_declared: false,
      declare_date: null,
    },
    exam_date: '2026-10-20',
    exam_time: '11:00 AM - 01:00 PM',
    exam_center_default: 'Patna Collegiate Examination Complex',
    total_marks: 120,
    passing_marks: 50,
    instructions: [
      'Admit cards will be available for download 10 days before the exam.',
      'Check reporting time printed on admit card once generated.'
    ]
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    _id: 'std_1',
    registration_id: 'BSEDRC-2026-8941',
    form_id: 'EXAM_2026_01',
    personal_data: {
      name: 'Rohan Kumar',
      father_name: 'Suresh Kumar',
      dob: '2008-08-15',
      mobile: '9876543210',
      email: 'rohan.kumar@example.com',
      photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&crop=faces',
      gender: 'Male',
      category: 'OBC',
      address: 'Near Kali Mandir, Ward No. 05, Madhepura, Bihar - 852113',
      custom_responses: {
        'Aadhaar Number': '8942-5561-2231',
        'Mother Name': 'Sunita Devi',
        'Medium of Examination': 'Hindi'
      }
    },
    school_data: {
      udise_code: '10020100101',
      school_name: 'Govt High School, Madhepura',
      district: 'Madhepura',
      block: 'Madhepura',
      panchayat: 'Ward 05',
      current_class: '10th',
      previous_year_percentage: 84.5
    },
    payment_info: {
      status: 'PAID',
      amount: 50,
      txn_id: 'TXN_99887712',
      order_id: 'ORDER_BSEDRC_8941',
      paid_at: '2026-08-10 14:32:00',
      payment_mode: 'UPI'
    },
    documents: {
      application_form_pdf: '/docs/form_BSEDRC-2026-8941.pdf',
      admit_card_pdf: '/docs/admit_BSEDRC-2026-8941.pdf',
      marksheet_pdf: '/docs/result_BSEDRC-2026-8941.pdf'
    },
    exam_details: {
      roll_no: '100245',
      exam_center: 'Govt High School Hall A, Main Road Madhepura',
      exam_datetime: '2026-09-15 10:00 AM',
      reporting_time: '09:15 AM',
      room_no: 'Room 104'
    },
    result_details: {
      marks_obtained: 88,
      total_marks: 100,
      percentage: 88.0,
      status: 'PASS',
      grade: 'A',
      rank: 4,
      subject_breakup: [
        { subject: 'Mathematics', marks: 28, max_marks: 30 },
        { subject: 'General Science', marks: 27, max_marks: 30 },
        { subject: 'Mental Ability & Reasoning', marks: 18, max_marks: 20 },
        { subject: 'General Knowledge & Current Affairs', marks: 15, max_marks: 20 }
      ]
    },
    created_at: '2026-08-11T14:32:00.000Z',
    updated_at: '2026-08-30T10:00:00.000Z'
  }
];

export const INITIAL_NOTICES: NoticeCircular[] = [
  {
    id: 'not_1',
    notice_no: 'BSEDRC/EXAM/2026/08-101',
    title_hi: 'बिहार राज्य मेधा छात्रवृत्ति एवं प्रतिभा खोज परीक्षा 2026: परीक्षा तिथि एवं प्रवेश पत्र निर्गमन सूचना',
    title_en: 'Bihar State Talent & Scholarship Examination 2026: Official Exam Schedule & Hall Ticket Issuance',
    category: 'EXAM',
    publish_date: '2026-08-28',
    is_urgent: true,
    summary_hi: 'परिषद द्वारा आयोजित वार्षिक मेधा परीक्षा 15 सितंबर 2026 को राज्य के सभी 38 जिलों में आयोजित की जाएगी। छात्र ऑनलाइन पोर्टल से प्रवेश पत्र डाउनलोड कर सकते हैं।',
    summary_en: 'Annual State Talent Scholarship exam will be conducted across all 38 districts of Bihar on 15th September 2026. Hall tickets available for download.',
    content_hi: 'बिहार राज्य शैक्षिक विकास एवं अनुसंधान परिषद (BSEDRC) द्वारा सूचित किया जाता है कि राज्य प्रतिभा खोज छात्रवृत्ति परीक्षा 2026 का आयोजन 15 सितंबर 2026 (रविवार) को पूर्व-निर्धारित जिला परीक्षा केंद्रों पर पूर्वाहन 10:00 बजे से मध्याह्न 12:30 बजे तक किया जाएगा। सभी पंजीकृत अभ्यर्थी अपने रजिस्ट्रेशन नंबर और जन्म तिथि के माध्यम से पोर्टल से अधिकृत एडमिट कार्ड डाउनलोड कर प्रिंट निकाल लें। परीक्षा केंद्र पर रंगीन एडमिट कार्ड, आधार कार्ड तथा 2 पासपोर्ट साइज फोटो लाना अनिवार्य है।',
    content_en: 'Notice is hereby given that the Bihar State Talent Search Examination 2026 will be held on 15 September 2026 (Sunday) from 10:00 AM to 12:30 PM. Candidates must download their verified Hall Ticket from the online portal.',
    pdf_filename: 'BSEDRC_Circular_Exam_Schedule_2026.pdf',
    signed_by: 'परीक्षा नियंत्रक (Controller of Examinations), BSEDRC'
  },
  {
    id: 'not_2',
    notice_no: 'BSEDRC/SCH/2026/08-095',
    title_hi: 'मेधावी छात्रों हेतु वार्षिक छात्रवृत्ति राशि (₹12,000/वर्ष) एवं प्रमाण पत्र वितरण दिशानिर्देश',
    title_en: 'Annual State Talent Scholarship Grant (₹12,000/year) Disbursement & Certificate Norms',
    category: 'SCHOLARSHIP',
    publish_date: '2026-08-25',
    is_urgent: false,
    summary_hi: 'राज्य स्तर पर शीर्ष 500 एवं जिला स्तर पर शीर्ष 25 विद्यार्थियों को मासिक ₹1,000 (वार्षिक ₹12,000) प्रत्यक्ष बैंक अंतरण (DBT) के माध्यम से प्रदान की जाएगी।',
    summary_en: 'Top 500 state toppers and Top 25 district toppers will receive ₹1,000/month (₹12,000/year) scholarship grant directly in their bank accounts.',
    content_hi: 'परिषद के संकल्प पत्र सं. 84/2026 के अंतर्गत मेधा परीक्षा में सफल टॉप 500 विद्यार्थियों को अग्रिम माध्यमिक एवं उच्च माध्यमिक अध्ययन हेतु प्रति माह ₹1,000 की दर से वार्षिक ₹12,000 छात्रवृत्ति सीधे उनके आधार लिंक बैंक खाते में अंतरित की जाएगी। सभी सफल छात्र अपने बैंक पासबुक की प्रति एवं विद्यालय प्रमाण पत्र ऑनलाइन पोर्टल पर अपलोड करें।',
    content_en: 'Under Resolution 84/2026, top 500 meritorious students will receive direct cash grant into their Aadhaar linked bank accounts for secondary & higher secondary education.',
    pdf_filename: 'BSEDRC_Scholarship_Scheme_Norms_2026.pdf',
    signed_by: 'निदेशक (Director), BSEDRC'
  },
  {
    id: 'not_3',
    notice_no: 'BSEDRC/UDISE/2026/08-088',
    title_hi: 'राज्य के सभी मान्यता प्राप्त एवं वित्तपोषित विद्यालयों का यू-डायस (U-DISE) मैपिंग अनिवार्य',
    title_en: 'Mandatory U-DISE Mapping & Institutional Registration for All Recognized Schools',
    category: 'AFFILIATION',
    publish_date: '2026-08-20',
    is_urgent: false,
    summary_hi: 'बिहार के सभी सरकारी, अनुदानित एवं निजी विद्यालयों को परिषद पोर्टल पर 11 अंकों के U-DISE कोड के साथ पंजीकृत होना अनिवार्य है ताकि छात्रों का सत्यापन सुगमता से हो सके।',
    summary_en: 'All Bihar govt and recognized schools must register on the central council registry with valid 11-digit U-DISE codes for student validation.',
    content_hi: 'समस्त जिला शिक्षा पदाधिकारी एवं विद्यालय प्रधानाचार्यों को निर्देश दिया जाता है कि अपने संस्थान का विवरण, मान्यता क्रम संख्या, प्रधानाध्यापक का संपर्क एवं विद्यालय का भौतिक पता BSEDRC विद्यालय निर्देशिका पोर्टल पर अनिवार्य रूप से अपडेट करें।',
    content_en: 'All District Education Officers & Headmasters are instructed to keep institutional data updated on the central council portal.',
    pdf_filename: 'BSEDRC_UDISE_Institutional_Directive.pdf',
    signed_by: 'उप-निदेशक (U-DISE Cell), BSEDRC'
  },
  {
    id: 'not_4',
    notice_no: 'BSEDRC/GRIEVANCE/2026/08-079',
    title_hi: 'ऑनलाइन त्रुटि सुधार (Correction Window) एवं छात्र सहायता हेल्पलाइन सक्रियण',
    title_en: 'Online Correction Window & Student Grievance Helpdesk Portal Activated',
    category: 'GUIDELINES',
    publish_date: '2026-08-18',
    is_urgent: true,
    summary_hi: 'नाम की वर्तनी, जन्म तिथि, विद्यालय नाम या फोटो में किसी भी संशोधन हेतु छात्र पोर्टल के "सहायता एवं सुधार प्रकोष्ठ" में ऑनलाइन टोकन दर्ज कर सकते हैं।',
    summary_en: 'Candidates can raise correction requests for spelling mistakes, DOB, school name or photo updates via the central grievance window.',
    content_hi: 'यदि किसी अभ्यर्थी के आवेदन पत्र अथवा प्रवेश पत्र में नाम, पिता का नाम, जन्म तिथि, अथवा विद्यालय नाम में कोई त्रुटि हो, तो वे अविलंब ऑनलाइन ग्रिवांस पोर्टल पर रिक्वेस्ट सबमिट कर सकते हैं। 48 घंटे के भीतर परिषद के सत्यापन अधिकारी द्वारा संशोधन कर दिया जाएगा।',
    content_en: 'Candidates with incorrect names or DOB can lodge an online rectification ticket. Correction is processed within 48 hours by the verification officer.',
    pdf_filename: 'BSEDRC_Correction_Policy_Manual.pdf',
    signed_by: 'सहायक परीक्षा नियंत्रक (Grievance Head), BSEDRC'
  }
];

export const INITIAL_TOPPERS: MeritTopper[] = [
  {
    rank: 1,
    registration_id: 'BSEDRC-2026-8941',
    roll_no: '100245',
    name: 'Aarav Kumar Sharma',
    father_name: 'Shri Manoj Sharma',
    school_name: 'Govt High School, Madhepura',
    district: 'Madhepura',
    current_class: '10th',
    category: 'OBC (BC-II)',
    marks_obtained: 94,
    total_marks: 100,
    percentage: 94.0,
    award_scholarship: 'State Gold Medal + ₹12,000/yr Grant + Tab Kit',
    photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  },
  {
    rank: 2,
    registration_id: 'BSEDRC-2026-8942',
    roll_no: '100246',
    name: 'Pooja Kumari',
    father_name: 'Shri Rameshwar Prasad',
    school_name: 'Patna Collegiate School, Bankipore',
    district: 'Patna',
    current_class: '10th',
    category: 'General (EWS)',
    marks_obtained: 91,
    total_marks: 100,
    percentage: 91.0,
    award_scholarship: 'State Silver Medal + ₹12,000/yr Grant + Citation',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    rank: 3,
    registration_id: 'BSEDRC-2026-8944',
    roll_no: '100248',
    name: 'Sneha Kumari',
    father_name: 'Shri Ratan Kumar Mandal',
    school_name: 'Project Girls High School, Singheshwar',
    district: 'Madhepura',
    current_class: '9th',
    category: 'EBC (BC-I)',
    marks_obtained: 88,
    total_marks: 100,
    percentage: 88.0,
    award_scholarship: 'State Bronze Medal + ₹12,000/yr Grant + Certificate',
    photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
  },
  {
    rank: 4,
    registration_id: 'BSEDRC-2026-8945',
    roll_no: '100249',
    name: 'Rohan Kumar',
    father_name: 'Shri Jagdish Prasad Yadav',
    school_name: 'Adarsh Middle School, Shankarpur',
    district: 'Madhepura',
    current_class: '8th',
    category: 'OBC (BC-II)',
    marks_obtained: 64,
    total_marks: 100,
    percentage: 64.0,
    award_scholarship: 'District Merit Certificate & Book Grant',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_GRIEVANCES: GrievanceTicket[] = [
  {
    ticket_id: 'GRV-2026-0042',
    registration_id: 'BSEDRC-2026-8941',
    student_name: 'Aarav Kumar Sharma',
    father_name: 'Shri Manoj Sharma',
    mobile: '9876543210',
    issue_category: 'NAME_CORRECTION',
    description: 'Father name spelling was entered as Manoj Sharma instead of Manoj Kumar Sharma.',
    requested_changes: 'Update Father Name to: Shri Manoj Kumar Sharma',
    status: 'APPROVED',
    admin_remarks: 'Verified with Aadhaar card copy. Name updated in central master database.',
    created_at: '2026-08-20T10:30:00.000Z',
    updated_at: '2026-08-21T15:00:00.000Z'
  },
  {
    ticket_id: 'GRV-2026-0089',
    registration_id: 'BSEDRC-2026-8944',
    student_name: 'Sneha Kumari',
    father_name: 'Shri Ratan Kumar Mandal',
    mobile: '9835012345',
    issue_category: 'PHOTO_UPDATE',
    description: 'Candidate uploaded low resolution passport photo, requesting council to re-sync hd passport photo.',
    requested_changes: 'Sync updated official studio passport photo in admit card system.',
    status: 'UNDER_REVIEW',
    admin_remarks: 'Document verification under examination cell officer queue.',
    created_at: '2026-08-26T14:15:00.000Z'
  }
];
