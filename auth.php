<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/totp.php';

ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

$__secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => '',
    'secure' => $__secure,
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function current_user_id(): ?int {
    return $_SESSION['user_id'] ?? null;
}

function require_login(): int {
    $uid = current_user_id();
    if ($uid === null) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'unauthorized']);
        exit;
    }
    return $uid;
}

function require_login_page(): int {
    $uid = current_user_id();
    if ($uid === null) {
        header('Location: login.php');
        exit;
    }
    return $uid;
}

function csrf_token(): string {
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function require_csrf(): void {
    $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (empty($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], $sent)) {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'invalid csrf token']);
        exit;
    }
}

function client_ip(): string {
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

function is_locked_out(): bool {
    $stmt = get_db()->prepare('SELECT locked_until FROM login_attempts WHERE ip = ?');
    $stmt->execute([client_ip()]);
    $row = $stmt->fetch();
    return $row && $row['locked_until'] && strtotime($row['locked_until']) > time();
}

function record_failed_attempt(): void {
    $db = get_db();
    $ip = client_ip();
    $stmt = $db->prepare('SELECT attempts FROM login_attempts WHERE ip = ?');
    $stmt->execute([$ip]);
    $row = $stmt->fetch();
    $attempts = $row ? (int)$row['attempts'] + 1 : 1;
    $lockedUntil = null;
    if ($attempts >= MAX_LOGIN_ATTEMPTS) {
        $lockedUntil = date('Y-m-d H:i:s', time() + LOCKOUT_MINUTES * 60);
        $attempts = 0;
    }
    $stmt = $db->prepare('INSERT INTO login_attempts (ip, attempts, locked_until) VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE attempts = VALUES(attempts), locked_until = VALUES(locked_until)');
    $stmt->execute([$ip, $attempts, $lockedUntil]);
}

function reset_attempts(): void {
    $stmt = get_db()->prepare('DELETE FROM login_attempts WHERE ip = ?');
    $stmt->execute([client_ip()]);
}

/** Retorna 'ok' | '2fa_required' | 'locked' | 'invalid'. */
function attempt_login(string $username, string $password): string {
    if (is_locked_out()) {
        return 'locked';
    }
    $stmt = get_db()->prepare('SELECT id, password_hash, totp_enabled FROM users WHERE username = ?');
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    if (!$user || $user['password_hash'] === null || !password_verify($password, $user['password_hash'])) {
        record_failed_attempt();
        return 'invalid';
    }
    reset_attempts();
    if ((int)$user['totp_enabled'] === 1) {
        session_regenerate_id(true);
        $_SESSION['pending_2fa_user_id'] = (int)$user['id'];
        return '2fa_required';
    }
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int)$user['id'];
    return 'ok';
}

/** Confere o codigo TOTP (ou um codigo de backup) pra concluir um login pendente de 2FA. */
function attempt_2fa(string $code): bool {
    $uid = $_SESSION['pending_2fa_user_id'] ?? null;
    if ($uid === null) return false;

    $db = get_db();
    $stmt = $db->prepare('SELECT totp_secret FROM users WHERE id = ?');
    $stmt->execute([$uid]);
    $user = $stmt->fetch();
    if (!$user || !$user['totp_secret']) return false;

    if (totp_verify_code($user['totp_secret'], $code)) {
        unset($_SESSION['pending_2fa_user_id']);
        session_regenerate_id(true);
        $_SESSION['user_id'] = (int)$uid;
        return true;
    }

    $stmt = $db->prepare('SELECT id, code_hash FROM totp_backup_codes WHERE user_id = ? AND used_at IS NULL');
    $stmt->execute([$uid]);
    foreach ($stmt->fetchAll() as $row) {
        if (password_verify(trim($code), $row['code_hash'])) {
            $db->prepare('UPDATE totp_backup_codes SET used_at = NOW() WHERE id = ?')->execute([$row['id']]);
            unset($_SESSION['pending_2fa_user_id']);
            session_regenerate_id(true);
            $_SESSION['user_id'] = (int)$uid;
            return true;
        }
    }
    return false;
}

function is_register_locked_out(): bool {
    $stmt = get_db()->prepare('SELECT locked_until FROM register_attempts WHERE ip = ?');
    $stmt->execute([client_ip()]);
    $row = $stmt->fetch();
    return $row && $row['locked_until'] && strtotime($row['locked_until']) > time();
}

function record_register_attempt(): void {
    $db = get_db();
    $ip = client_ip();
    $stmt = $db->prepare('SELECT attempts FROM register_attempts WHERE ip = ?');
    $stmt->execute([$ip]);
    $row = $stmt->fetch();
    $attempts = $row ? (int)$row['attempts'] + 1 : 1;
    $lockedUntil = null;
    if ($attempts >= 5) {
        $lockedUntil = date('Y-m-d H:i:s', time() + 60 * 60);
        $attempts = 0;
    }
    $stmt = $db->prepare('INSERT INTO register_attempts (ip, attempts, locked_until) VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE attempts = VALUES(attempts), locked_until = VALUES(locked_until)');
    $stmt->execute([$ip, $attempts, $lockedUntil]);
}
