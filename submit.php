<?php
/**
 * submit.php — Premium vacancy form backend
 * Bihar State Educational Development & Research Council
 *
 * - Validates and sanitizes all inputs
 * - Stores the application (and resume path) in MySQL
 * - Sends email notifications to admin and applicant
 * - Returns JSON consumed by script.js
 *
 * Requires: PHP 7.4+, MySQL, and a mail-capable server (uses PHPMailer if available, else mail()).
 */

declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

// ---------- CONFIG ----------
const DB_HOST = 'localhost';
const DB_NAME = 'bserv_council';
const DB_USER = 'root';
const DB_PASS = '';

const ADMIN_EMAIL = 'adarshbiharsiksha@gmail.com';
const FROM_EMAIL  = 'no-reply@bservcouncil.in';
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_MIME = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const DEFAULT_MESSAGE = 'Your application has been received and is now under review.';

function json_out(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function field(array $src, string $key): string {
    $v = $src[$key] ?? '';
    return is_string($v) ? trim($v) : '';
}

// ---------- INPUT VALIDATION ----------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(['success' => false, 'message' => 'Method not allowed.'], 405);
}

$fullName = field($_POST, 'full_name');
$dob      = field($_POST, 'dob');
$phone    = field($_POST, 'phone');
$email    = field($_POST, 'email');
$position = field($_POST, 'position');
$address  = field($_POST, 'address');
$qualification = field($_POST, 'qualification');
$experience    = field($_POST, 'experience');
$motivation    = field($_POST, 'motivation');

$errors = [];
if ($fullName === '' || mb_strlen($fullName) < 3 || mb_strlen($fullName) > 120) {
    $errors[] = 'Full name must be between 3 and 120 characters.';
}
if ($dob === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $dob)) {
    $errors[] = 'A valid date of birth is required.';
}
if ($phone === '' || !preg_match('/^[+0-9][0-9\s\-()]{6,19}$/', $phone)) {
    $errors[] = 'A valid mobile number is required.';
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'A valid email address is required.';
}
if ($position === '') {
    $errors[] = 'Please select the position you are applying for.';
}
if (mb_strlen($address) > 500 || mb_strlen($qualification) > 200 ||
    mb_strlen($experience) > 200 || mb_strlen($motivation) > 2000) {
    $errors[] = 'One or more fields exceed the allowed length.';
}
if ($errors) {
    json_out(['success' => false, 'message' => implode(' ', $errors)], 422);
}

// ---------- RESUME UPLOAD ----------
$resumePath = null;
$originalName = null;

if (isset($_FILES['resume']) && is_array($_FILES['resume']) && ($_FILES['resume']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
    $f = $_FILES['resume'];
    if ($f['error'] !== UPLOAD_ERR_OK) {
        json_out(['success' => false, 'message' => 'Resume upload failed. Please try again.'], 400);
    }
    if ($f['size'] > MAX_UPLOAD_BYTES) {
        json_out(['success' => false, 'message' => 'The selected resume exceeds the 2 MB limit.'], 400);
    }
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = (string)$finfo->file($f['tmp_name']);
    if (!in_array($mime, ALLOWED_MIME, true)) {
        json_out(['success' => false, 'message' => 'Unsupported resume file type. Please upload a PDF, DOC or DOCX file.'], 400);
    }

    $ext = ['application/pdf' => '.pdf', 'application/msword' => '.doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => '.docx'][$mime];
    $dir = __DIR__ . '/uploads';
    if (!is_dir($dir)) { mkdir($dir, 0755, true); }

    $slug = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', $fullName), '-')) ?: 'applicant';
    $storedName = $slug . '-' . bin2hex(random_bytes(8)) . $ext;
    $resumePath = 'uploads/' . $storedName;
    $originalName = basename($f['name']);

    if (!move_uploaded_file($f['tmp_name'], $dir . '/' . $storedName)) {
        json_out(['success' => false, 'message' => 'Could not save the resume file. Please try again.'], 500);
    }
}

// ---------- DATABASE ----------
try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );

    // Idempotent schema creation (safe to leave in for a simple deployment).
    $pdo->exec(<<<SQL
        CREATE TABLE IF NOT EXISTS applications (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(120) NOT NULL,
            dob DATE NOT NULL,
            phone VARCHAR(20) NOT NULL,
            email VARCHAR(255) NOT NULL,
            position VARCHAR(120) NOT NULL,
            address VARCHAR(500) DEFAULT NULL,
            qualification VARCHAR(200) DEFAULT NULL,
            experience VARCHAR(200) DEFAULT NULL,
            motivation TEXT DEFAULT NULL,
            resume_path VARCHAR(255) DEFAULT NULL,
            resume_original_name VARCHAR(255) DEFAULT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    SQL);

    $stmt = $pdo->prepare(
        'INSERT INTO applications
            (full_name, dob, phone, email, position, address, qualification, experience, motivation, resume_path, resume_original_name)
         VALUES (:full_name, :dob, :phone, :email, :position, :address, :qualification, :experience, :motivation, :resume_path, :resume_original_name)'
    );
    $stmt->execute([
        ':full_name' => $fullName, ':dob' => $dob, ':phone' => $phone, ':email' => $email,
        ':position' => $position, ':address' => $address, ':qualification' => $qualification,
        ':experience' => $experience, ':motivation' => $motivation,
        ':resume_path' => $resumePath, ':resume_original_name' => $originalName,
    ]);
    $applicationId = (int)$pdo->lastInsertId();
} catch (PDOException $e) {
    if ($resumePath && file_exists(__DIR__ . '/' . $resumePath)) { @unlink(__DIR__ . '/' . $resumePath); }
    json_out(['success' => false, 'message' => 'Could not save your application. Please try again later.'], 500);
}

// ---------- EMAIL NOTIFICATIONS ----------
function send_mail(string $to, string $subject, string $htmlBody): bool {
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=utf-8\r\n";
    $headers .= "From: BSERV Council <" . FROM_EMAIL . ">\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    // Swap for PHPMailer (SMTP) in production for better deliverability.
    return @mail($to, $subject, $htmlBody, $headers);
}

$receiptNo = 'BSERV-' . str_pad((string)$applicationId, 6, '0', STR_PAD_LEFT);

$adminBody = "
  <h2>New vacancy application</h2>
  <table cellpadding='6' border='1' style='border-collapse:collapse'>
    <tr><td><b>Receipt No</b></td><td>{$receiptNo}</td></tr>
    <tr><td><b>Name</b></td><td>{$fullName}</td></tr>
    <tr><td><b>DOB</b></td><td>{$dob}</td></tr>
    <tr><td><b>Mobile</b></td><td>{$phone}</td></tr>
    <tr><td><b>Email</b></td><td>{$email}</td></tr>
    <tr><td><b>Position</b></td><td>{$position}</td></tr>
    <tr><td><b>Qualification</b></td><td>{$qualification}</td></tr>
    <tr><td><b>Experience</b></td><td>{$experience}</td></tr>
    <tr><td><b>Address</b></td><td>" . nl2br(htmlspecialchars($address)) . "</td></tr>
    <tr><td><b>Motivation</b></td><td>" . nl2br(htmlspecialchars($motivation)) . "</td></tr>
    <tr><td><b>Resume</b></td><td>{$originalName}</td></tr>
  </table>";

$applicantBody = "
  <div style='font-family:Arial;padding:24px'>
    <h2 style='color:#8b2d2d'>Bihar State Educational Development &amp; Research Council</h2>
    <h3>Acknowledgement of Application</h3>
    <p>Thank you, " . htmlspecialchars($fullName) . ", for submitting your application.</p>
    <table cellpadding='6' border='1' style='border-collapse:collapse'>
      <tr><td><b>Receipt No</b></td><td>{$receiptNo}</td></tr>
      <tr><td><b>Applied For</b></td><td>{$position}</td></tr>
      <tr><td><b>Email</b></td><td>{$email}</td></tr>
      <tr><td><b>Submitted On</b></td><td>" . date('d M Y, h:i A') . " IST</td></tr>
    </table>
    <p>" . DEFAULT_MESSAGE . "</p>
  </div>";

$adminSent  = send_mail(ADMIN_EMAIL, "New application {$receiptNo} — {$position}", $adminBody);
$userSent   = send_mail($email, "Application received — {$receiptNo}", $applicantBody);

// ---------- RESPONSE ----------
json_out([
    'success'  => true,
    'message'  => DEFAULT_MESSAGE,
    'receipt'  => $receiptNo,
    'notified' => ['admin' => $adminSent, 'applicant' => $userSent],
]);
