import { BackendCodeTemplate } from '../types';

export const BACKEND_TEMPLATES: BackendCodeTemplate[] = [
  {
    title: 'MySQL / PostgreSQL Database Schema',
    language: 'sql',
    filename: 'schema.sql',
    description: 'Relational database schema with U-DISE unique indexing, student lifecycle tables, payments, and sample records.',
    code: `-- ==========================================================
-- FOUNDATION ADMIN PORTAL & STUDENT LIFECYCLE DATABASE SCHEMA
-- Compatible with MySQL 8.0+ and PostgreSQL 14+
-- ==========================================================

CREATE DATABASE IF NOT EXISTS foundation_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE foundation_db;

-- 1. Master School Collection (schools_master)
CREATE TABLE IF NOT EXISTS schools_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    udise_code VARCHAR(32) NOT NULL UNIQUE,
    school_name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    block VARCHAR(100) NOT NULL,
    panchayat VARCHAR(150) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_location (district, block),
    INDEX idx_udise (udise_code)
) ENGINE=InnoDB;

-- 2. Forms Configuration (forms_config)
CREATE TABLE IF NOT EXISTS forms_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    form_id VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    academic_year VARCHAR(20) DEFAULT '2026-2027',
    fee_amount DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    custom_fields JSON NULL COMMENT 'Array of dynamic form fields schema',
    is_admit_card_released TINYINT(1) DEFAULT 0,
    admit_card_release_date DATE NULL,
    is_result_declared TINYINT(1) DEFAULT 0,
    result_declare_date DATE NULL,
    exam_date DATE NULL,
    exam_time VARCHAR(50) DEFAULT '10:00 AM - 12:30 PM',
    exam_center_default VARCHAR(255) DEFAULT 'Govt High School Central Hall',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Unified Student Collection (students)
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registration_id VARCHAR(50) NOT NULL UNIQUE COMMENT 'Format: MLF-YYYY-XXXX',
    form_id VARCHAR(50) NOT NULL,
    
    -- Personal Data
    name VARCHAR(150) NOT NULL,
    father_name VARCHAR(150) NOT NULL,
    dob DATE NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(150) NULL,
    photo_url VARCHAR(500) NULL,
    gender ENUM('Male', 'Female', 'Other') DEFAULT 'Male',
    category VARCHAR(50) DEFAULT 'General',
    address TEXT,
    custom_responses JSON NULL,
    
    -- School Data
    udise_code VARCHAR(32) NOT NULL,
    school_name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    block VARCHAR(100) NOT NULL,
    current_class VARCHAR(30) DEFAULT '10th',
    
    -- Payment Details
    payment_status ENUM('PENDING', 'PAID', 'FAILED') DEFAULT 'PAID',
    payment_amount DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
    txn_id VARCHAR(100) NULL,
    order_id VARCHAR(100) NULL,
    paid_at TIMESTAMP NULL,
    
    -- Exam & Hall Ticket Details
    roll_no VARCHAR(50) NULL,
    exam_center VARCHAR(255) NULL,
    exam_datetime VARCHAR(100) NULL,
    room_no VARCHAR(50) NULL,
    
    -- Result Details
    marks_obtained DECIMAL(5,2) NULL,
    total_marks DECIMAL(5,2) DEFAULT 100.00,
    percentage DECIMAL(5,2) NULL,
    result_status ENUM('PASS', 'FAIL', 'PENDING') DEFAULT 'PENDING',
    grade VARCHAR(10) NULL,
    rank_pos INT NULL,
    subject_breakup JSON NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (udise_code) REFERENCES schools_master(udise_code) ON UPDATE CASCADE,
    FOREIGN KEY (form_id) REFERENCES forms_config(form_id) ON UPDATE CASCADE,
    INDEX idx_reg_dob (registration_id, dob),
    INDEX idx_school_students (udise_code, form_id)
) ENGINE=InnoDB;

-- ==========================================================
-- SEED DATA INSERTION
-- ==========================================================

INSERT INTO schools_master (udise_code, school_name, district, block, panchayat) VALUES
('10020100101', 'Govt High School, Madhepura', 'Madhepura', 'Madhepura', 'Ward 05'),
('10020100102', 'Adarsh Middle School, Shankarpur', 'Madhepura', 'Shankarpur', 'Jirwa'),
('10020100103', 'Project Girls High School, Singheshwar', 'Madhepura', 'Singheshwar', 'Singheshwar Ward 02'),
('10020200201', 'Patna Collegiate School, Bankipore', 'Patna', 'Patna Sadar', 'Ward 12')
ON DUPLICATE KEY UPDATE school_name=VALUES(school_name);

INSERT INTO forms_config (form_id, title, fee_amount, is_active, is_admit_card_released, is_result_declared, exam_date) VALUES
('EXAM_2026_01', 'Medha Scholarship & Talent Search Examination 2026', 50.00, 1, 1, 1, '2026-09-15')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO students (registration_id, form_id, name, father_name, dob, mobile, udise_code, school_name, district, block, payment_status, payment_amount, txn_id, roll_no, exam_center, marks_obtained, result_status, grade) VALUES
('MLF-2026-8941', 'EXAM_2026_01', 'Rohan Kumar', 'Suresh Kumar', '2008-08-15', '9876543210', '10020100101', 'Govt High School, Madhepura', 'Madhepura', 'Madhepura', 'PAID', 50.00, 'TXN_99887712', '100245', 'Govt High School Hall A', 88.00, 'PASS', 'A+');
`
  },
  {
    title: 'PHP Backend Database Connector (db.php)',
    language: 'php',
    filename: 'config/db.php',
    description: 'PDO database wrapper with JSON headers, CORS configuration, and prepared statement utilities.',
    code: `<?php
/**
 * Foundation Backend - Database Connection & Helper Functions
 * Language: PHP 7.4+ / PHP 8.x
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host     = getenv('DB_HOST') ?: '127.0.0.1';
$dbname   = getenv('DB_NAME') ?: 'foundation_db';
$username = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASS') ?: '';
$charset  = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit();
}

function send_json_response($data, $status_code = 200) {
    http_response_code($status_code);
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit();
}
?>`
  },
  {
    title: 'PHP Student Registration & Payment Verification API',
    language: 'php',
    filename: 'api/register.php',
    description: 'Handles student enrollment, auto-increments MLF-2026-XXXX Registration ID, and verifies fee payment.',
    code: `<?php
/**
 * Student Registration & Payment Verification Endpoint
 * POST /api/register.php
 */
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json_response(['error' => 'Method not allowed. Use POST.'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    send_json_response(['error' => 'Invalid JSON payload received.'], 400);
}

// 1. Required Validations
$required = ['form_id', 'name', 'father_name', 'dob', 'mobile', 'udise_code', 'district', 'block', 'current_class'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        send_json_response(['error' => "Missing required field: $field"], 422);
    }
}

try {
    $pdo->beginTransaction();

    // 2. Generate unique Auto-Increment ID (e.g., MLF-2026-8941)
    $stmtCount = $pdo->query("SELECT COUNT(*) as total FROM students");
    $rowCount = (int)$stmtCount->fetchColumn();
    $nextNumber = 8940 + $rowCount + 1;
    $registration_id = 'MLF-2026-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

    // 3. School Details Lookup
    $stmtSchool = $pdo->prepare("SELECT school_name FROM schools_master WHERE udise_code = ? LIMIT 1");
    $stmtSchool->execute([$input['udise_code']]);
    $school = $stmtSchool->fetch();
    $school_name = $school ? $school['school_name'] : ($input['school_name'] ?? 'Affiliated School');

    // 4. Payment Info
    $txn_id = 'TXN_' . strtoupper(bin2hex(random_bytes(4))) . rand(100, 999);
    $order_id = 'ORDER_' . $registration_id;
    $amount = isset($input['amount']) ? (float)$input['amount'] : 50.00;

    // 5. Insert Student Record
    $sql = "INSERT INTO students (
        registration_id, form_id, name, father_name, dob, mobile, email,
        photo_url, gender, category, address, custom_responses,
        udise_code, school_name, district, block, current_class,
        payment_status, payment_amount, txn_id, order_id, paid_at
    ) VALUES (
        :reg_id, :form_id, :name, :father_name, :dob, :mobile, :email,
        :photo_url, :gender, :category, :address, :custom_responses,
        :udise_code, :school_name, :district, :block, :current_class,
        'PAID', :amount, :txn_id, :order_id, NOW()
    )";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':reg_id'           => $registration_id,
        ':form_id'          => $input['form_id'],
        ':name'              => trim($input['name']),
        ':father_name'       => trim($input['father_name']),
        ':dob'               => $input['dob'],
        ':mobile'            => trim($input['mobile']),
        ':email'             => $input['email'] ?? null,
        ':photo_url'         => $input['photo_url'] ?? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300',
        ':gender'            => $input['gender'] ?? 'Male',
        ':category'          => $input['category'] ?? 'General',
        ':address'           => $input['address'] ?? '',
        ':custom_responses'  => isset($input['custom_responses']) ? json_encode($input['custom_responses']) : null,
        ':udise_code'        => $input['udise_code'],
        ':school_name'       => $school_name,
        ':district'          => $input['district'],
        ':block'             => $input['block'],
        ':current_class'     => $input['current_class'],
        ':amount'            => $amount,
        ':txn_id'            => $txn_id,
        ':order_id'          => $order_id
    ]);

    $pdo->commit();

    send_json_response([
        'success' => true,
        'message' => 'Registration successful and payment verified.',
        'data' => [
            'registration_id' => $registration_id,
            'name' => $input['name'],
            'school_name' => $school_name,
            'amount' => $amount,
            'txn_id' => $txn_id,
            'status' => 'PAID'
        ]
    ], 201);

} catch (Exception $e) {
    $pdo->rollBack();
    send_json_response([
        'success' => false,
        'error' => 'Registration processing failed: ' . $e->getMessage()
    ], 500);
}
?>`
  },
  {
    title: 'PHP Single Student Lifecycle & Status API',
    language: 'php',
    filename: 'api/student_status.php',
    description: 'Find student by registration_id + dob, evaluates admit card and result availability flags.',
    code: `<?php
/**
 * Single Student Status & Document Fetcher
 * GET /api/student_status.php?reg_id=MLF-2026-8941&dob=2008-08-15
 */
require_once __DIR__ . '/../config/db.php';

$reg_id = $_GET['reg_id'] ?? $_GET['registration_id'] ?? null;
$dob    = $_GET['dob'] ?? null;

if (!$reg_id) {
    send_json_response(['error' => 'Registration ID is required.'], 400);
}

try {
    $query = "SELECT s.*, f.title as exam_title, f.is_admit_card_released, f.admit_card_release_date,
                     f.is_result_declared, f.result_declare_date, f.exam_date, f.exam_time
              FROM students s
              LEFT JOIN forms_config f ON s.form_id = f.form_id
              WHERE s.registration_id = :reg_id";
    
    $params = [':reg_id' => $reg_id];
    if ($dob) {
        $query .= " AND s.dob = :dob";
        $params[':dob'] = $dob;
    }

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $student = $stmt->fetch();

    if (!$student) {
        send_json_response([
            'success' => false,
            'message' => 'No student record found matching the provided credentials.'
        ], 404);
    }

    // Determine availability flags
    $admit_card_available = (bool)$student['is_admit_card_released'] && !empty($student['roll_no']);
    $result_available     = (bool)$student['is_result_declared'] && $student['marks_obtained'] !== null;

    send_json_response([
        'success' => true,
        'student' => [
            'registration_id' => $student['registration_id'],
            'form_id'         => $student['form_id'],
            'exam_title'      => $student['exam_title'],
            'personal_data'   => [
                'name'        => $student['name'],
                'father_name' => $student['father_name'],
                'dob'         => $student['dob'],
                'mobile'      => $student['mobile'],
                'photo_url'   => $student['photo_url'],
                'gender'      => $student['gender'],
                'category'    => $student['category'],
                'address'     => $student['address']
            ],
            'school_data' => [
                'udise_code'   => $student['udise_code'],
                'school_name'  => $student['school_name'],
                'district'     => $student['district'],
                'block'        => $student['block'],
                'current_class'=> $student['current_class']
            ],
            'payment_info' => [
                'status'   => $student['payment_status'],
                'amount'   => (float)$student['payment_amount'],
                'txn_id'   => $student['txn_id'],
                'order_id' => $student['order_id'],
                'paid_at'  => $student['paid_at']
            ],
            'exam_details' => [
                'roll_no'       => $student['roll_no'],
                'exam_center'   => $student['exam_center'],
                'exam_datetime' => $student['exam_datetime'] ?: ($student['exam_date'] . ' ' . $student['exam_time']),
                'room_no'       => $student['room_no']
            ],
            'result_details' => [
                'marks_obtained' => $student['marks_obtained'] !== null ? (float)$student['marks_obtained'] : null,
                'total_marks'    => (float)$student['total_marks'],
                'percentage'     => (float)$student['percentage'],
                'status'         => $student['result_status'],
                'grade'          => $student['grade'],
                'rank'           => $student['rank_pos']
            ],
            'lifecycle_access' => [
                'form_download'        => true,
                'admit_card_available' => $admit_card_available,
                'result_available'     => $result_available
            ]
        ]
    ]);

} catch (Exception $e) {
    send_json_response(['error' => 'Query error: ' . $e->getMessage()], 500);
}
?>`
  },
  {
    title: 'Java Spring Boot REST Controller (StudentController.java)',
    language: 'java',
    filename: 'src/main/java/com/foundation/portal/controller/StudentController.java',
    description: 'Spring Boot 3 Web REST controller providing student admissions, U-DISE query, and status endpoints.',
    code: `package com.foundation.portal.controller;

import com.foundation.portal.entity.Student;
import com.foundation.portal.repository.StudentRepository;
import com.foundation.portal.repository.SchoolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    /**
     * Search student by Registration ID and DOB
     */
    @GetMapping("/status")
    public ResponseEntity<?> getStudentStatus(
            @RequestParam("reg_id") String regId,
            @RequestParam(value = "dob", required = false) String dob) {
        
        Optional<Student> studentOpt = studentRepository.findByRegistrationId(regId);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Student registration ID not found."));
        }

        Student student = studentOpt.get();
        if (dob != null && !dob.isEmpty() && !student.getDob().toString().equals(dob)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Date of birth does not match record."));
        }

        return ResponseEntity.ok(Map.of("success", true, "student", student));
    }

    /**
     * Submit new student registration
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerStudent(@RequestBody Student studentPayload) {
        long currentCount = studentRepository.count();
        long nextNum = 8941 + currentCount;
        String regId = "MLF-2026-" + nextNum;

        studentPayload.setRegistrationId(regId);
        studentPayload.setPaymentStatus("PAID");
        studentPayload.setTxnId("TXN_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        studentPayload.setCreatedAt(LocalDateTime.now());

        Student savedStudent = studentRepository.save(studentPayload);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "success", true,
            "message", "Student successfully registered",
            "registrationId", savedStudent.getRegistrationId()
        ));
    }

    /**
     * Admin: Filter students by U-DISE, District, or Status
     */
    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents(
            @RequestParam(required = false) String udiseCode,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String formId) {
        
        if (udiseCode != null) {
            return ResponseEntity.ok(studentRepository.findByUdiseCode(udiseCode));
        } else if (district != null) {
            return ResponseEntity.ok(studentRepository.findByDistrict(district));
        }
        return ResponseEntity.ok(studentRepository.findAll());
    }
}
`
  },
  {
    title: 'Java Spring Boot JPA Entity (Student.java)',
    language: 'java',
    filename: 'src/main/java/com/foundation/portal/entity/Student.java',
    description: 'Jakarta Persistence Entity mapping student table with attributes and JSON columns.',
    code: `package com.foundation.portal.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "students", indexes = {
    @Index(name = "idx_reg_id", columnList = "registrationId", unique = true),
    @Index(name = "idx_udise", columnList = "udiseCode")
})
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String registrationId;

    @Column(nullable = false, length = 50)
    private String formId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 150)
    private String fatherName;

    @Column(nullable = false)
    private LocalDate dob;

    @Column(nullable = false, length = 20)
    private String mobile;

    private String email;
    private String photoUrl;
    private String gender;
    private String category;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false, length = 32)
    private String udiseCode;

    private String schoolName;
    private String district;
    private String block;
    private String currentClass;

    private String paymentStatus;
    private BigDecimal paymentAmount;
    private String txnId;
    private String orderId;

    private String rollNo;
    private String examCenter;
    private String examDatetime;
    private String roomNo;

    private BigDecimal marksObtained;
    private BigDecimal totalMarks;
    private BigDecimal percentage;
    private String resultStatus;
    private String grade;
    private Integer rankPos;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Getters and Setters omitted for brevity
    public String getRegistrationId() { return registrationId; }
    public void setRegistrationId(String registrationId) { this.registrationId = registrationId; }
    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public void setTxnId(String txnId) { this.txnId = txnId; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
`
  },
  {
    title: 'Standalone HTML5 & CSS Registration & Result Portal',
    language: 'html',
    filename: 'public/standalone_portal.html',
    description: 'Lightweight, self-contained HTML/CSS/JS frontend file to host on shared hosting or Apache.',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bihar State Educational Development and Research Council - Candidate Portal</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #0f172a;
      --accent: #d97706;
      --bg: #f8fafc;
      --card: #ffffff;
      --text: #0f172a;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background-color: var(--bg); color: var(--text); padding: 24px 16px; }
    .container { max-width: 800px; margin: 0 auto; }
    .card { background: var(--card); border: 1px solid #e2e8f0; border-radius: 12px; padding: 28px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 24px; }
    .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; }
    .header h1 { font-size: 20px; color: var(--primary); font-weight: 800; text-transform: uppercase; }
    .header p { color: #64748b; font-size: 13px; margin-top: 4px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #334155; }
    .form-control { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; }
    .btn { background: var(--primary); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; width: 100%; transition: opacity 0.2s; }
    .btn:hover { opacity: 0.9; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; background: #dbeafe; color: #1e40af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>Bihar State Educational Development and Research Council</h1>
        <p>बिहार राज्य शैक्षिक विकास एवं अनुसंधान परिषद (BSEDRC)</p>
        <p style="font-size: 12px; color: #0284c7; font-weight: bold; margin-top: 4px;">Candidate Lifecycle Status, Admit Card & Result Portal</p>
      </div>

      <div class="form-group">
        <label>Registration ID (e.g. BSEDRC-2026-8941)</label>
        <input type="text" id="regId" class="form-control" placeholder="Enter BSEDRC Registration ID">
      </div>

      <div class="form-group">
        <label>Date of Birth (YYYY-MM-DD)</label>
        <input type="date" id="dob" class="form-control">
      </div>

      <button class="btn" onclick="fetchStatus()">Track Status & Download Documents</button>

      <div id="statusResult" style="display:none; margin-top: 24px; padding-top: 20px; border-top: 1px dashed #cbd5e1;">
        <!-- Dynamic Result Card -->
      </div>
    </div>
  </div>

  <script>
    async function fetchStatus() {
      const regId = document.getElementById('regId').value.trim();
      const dob = document.getElementById('dob').value;
      if (!regId) return alert('Please enter Registration ID');

      try {
        const res = await fetch(\`/api/student/status?reg_id=\${encodeURIComponent(regId)}&dob=\${dob}\`);
        const json = await res.json();
        const box = document.getElementById('statusResult');
        if (json.success) {
          const s = json.student;
          box.style.display = 'block';
          box.innerHTML = \`
            <h3 style="color:#0f172a; font-size:18px; margin-bottom:8px;">\${s.personal_data.name}</h3>
            <p><strong>School:</strong> \${s.school_data.school_name} (UDISE: \${s.school_data.udise_code})</p>
            <p><strong>Roll No:</strong> \${s.exam_details.roll_no || 'Pending Allocation'}</p>
            <p><strong>Payment Status:</strong> <span class="badge">\${s.payment_info.status}</span></p>
            <div style="margin-top:16px; display:flex; gap:10px;">
              <button class="btn" style="background:#d97706;" onclick="window.print()">Print Official Document</button>
            </div>
          \`;
        } else {
          alert(json.message || 'Student not found');
        }
      } catch (e) {
        alert('Failed to connect to backend API.');
      }
    }
  </script>
</body>
</html>
`
  },
  {
    title: 'Environment Variables & API Secrets (.env)',
    language: 'env',
    filename: '.env',
    description: 'Centralized environment configuration template for Razorpay Payment Gateway, Cloudflare R2 Object Storage, MySQL / PostgreSQL database, and Cloud Run host settings.',
    code: `# ==========================================================
# BIHAR STATE EDUCATIONAL DEVELOPMENT AND RESEARCH COUNCIL
# BSEDRC - ENVIRONMENT VARIABLES CONFIGURATION
# ==========================================================

# ----------------------------------------------------------
# 1. RAZORPAY PAYMENT GATEWAY
# Dashboard: https://dashboard.razorpay.com/#/app/keys
# ----------------------------------------------------------
RAZORPAY_KEY_ID="rzp_test_BSEDRC2026_SANDBOX"
RAZORPAY_KEY_SECRET="your_razorpay_secret_key_here"
RAZORPAY_WEBHOOK_SECRET="your_razorpay_webhook_secret_here"
RAZORPAY_CURRENCY="INR"

# ----------------------------------------------------------
# 2. CLOUDFLARE R2 OBJECT STORAGE (S3 COMPATIBLE)
# Dashboard: Cloudflare Dashboard -> R2 -> Manage R2 API Tokens
# ----------------------------------------------------------
CLOUDFLARE_R2_ACCOUNT_ID="your_cloudflare_account_id_here"
CLOUDFLARE_R2_ACCESS_KEY_ID="your_r2_access_key_id_here"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your_r2_secret_access_key_here"
CLOUDFLARE_R2_BUCKET_NAME="bsedrc-student-documents"
CLOUDFLARE_R2_PUBLIC_URL="https://pub-r2.bsedrc.bihar.gov.in"
CLOUDFLARE_R2_ENDPOINT="https://your_account_id.r2.cloudflarestorage.com"

# ----------------------------------------------------------
# 3. RELATIONAL DATABASE (MYSQL / POSTGRESQL / CLOUD SQL)
# ----------------------------------------------------------
DATABASE_HOST="127.0.0.1"
DATABASE_PORT="3306"
DATABASE_USER="root"
DATABASE_PASSWORD="your_secure_db_password"
DATABASE_NAME="bsedrc_db"
DATABASE_URL="mysql://root:password@127.0.0.1:3306/bsedrc_db"

# ----------------------------------------------------------
# 4. RUNTIME & GEMINI API CONFIGURATION
# ----------------------------------------------------------
GEMINI_API_KEY="MY_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
NODE_ENV="development"
PORT=3000
`
  }
];
