<?php
declare(strict_types=1);

require_once __DIR__ . '/../auth.php';

header('Content-Type: application/json; charset=utf-8');
$uid = require_login();
$db = get_db();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $key = (string)($_GET['key'] ?? '');
    if ($key === '') {
        http_response_code(400);
        echo json_encode(['error' => 'missing key']);
        exit;
    }
    $stmt = $db->prepare('SELECT data_value FROM kv_store WHERE user_id = ? AND data_key = ?');
    $stmt->execute([$uid, $key]);
    $row = $stmt->fetch();
    echo json_encode(['value' => $row ? json_decode($row['data_value']) : null]);
    exit;
}

if ($method === 'POST') {
    require_csrf();
    $body = json_decode(file_get_contents('php://input'), true);
    $key = is_array($body) ? (string)($body['key'] ?? '') : '';
    if ($key === '' || !is_array($body) || !array_key_exists('value', $body)) {
        http_response_code(400);
        echo json_encode(['error' => 'invalid payload']);
        exit;
    }
    $stmt = $db->prepare('INSERT INTO kv_store (user_id, data_key, data_value) VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE data_value = VALUES(data_value)');
    $stmt->execute([$uid, $key, json_encode($body['value'])]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'method not allowed']);
