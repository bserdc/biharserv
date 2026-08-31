<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function field(array $src, string $key): string {
    $v = $src[$key] ?? '';
    return is_string($v) ? trim($v) : '';
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed in offline mode.']);
    exit;
}

$fullName = field($_POST, 'full_name');
$position = field($_POST, 'position');
$email = field($_POST, 'email');

if ($fullName === '' || $position === '' || $email === '') {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Please complete the required form details.']);
    exit;
}

$receipt = 'BSEDRC-LOCAL-' . date('Y') . '-' . str_pad((string)random_int(1000, 9999), 4, '0', STR_PAD_LEFT);

echo json_encode([
    'success' => true,
    'message' => 'Your application has been recorded locally. No server or backend connection is used in this static mode.',
    'receipt' => $receipt,
    'notified' => ['admin' => false, 'applicant' => false],
]);
