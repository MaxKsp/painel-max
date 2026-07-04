<?php
declare(strict_types=1);

require_once __DIR__ . '/../auth.php';

header('Content-Type: application/json; charset=utf-8');
$uid = require_login();
session_write_close();

$stmt = get_db()->prepare('SELECT username, email, totp_enabled, password_hash IS NOT NULL AS has_password FROM users WHERE id = ?');
$stmt->execute([$uid]);
$user = $stmt->fetch();

echo json_encode([
    'username' => $user['username'],
    'email' => $user['email'],
    'totp_enabled' => (int)$user['totp_enabled'] === 1,
    'has_password' => (int)$user['has_password'] === 1,
]);
