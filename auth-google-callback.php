<?php
require_once __DIR__ . '/auth.php';

function google_fail(string $message): void {
    http_response_code(400);
    echo '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Painel Max</title></head>'
        . '<body style="font-family:sans-serif;background:#000;color:#EDEDED;display:flex;align-items:center;justify-content:center;min-height:100vh;">'
        . '<div><p>' . htmlspecialchars($message, ENT_QUOTES, 'UTF-8') . '</p><p><a href="login.php" style="color:#3B82F6;">Voltar pro login</a></p></div>'
        . '</body></html>';
    exit;
}

if (!defined('GOOGLE_CLIENT_ID') || GOOGLE_CLIENT_ID === '' || !defined('GOOGLE_CLIENT_SECRET') || GOOGLE_CLIENT_SECRET === '') {
    google_fail('Login com Google ainda não foi configurado neste servidor.');
}

$state = (string)($_GET['state'] ?? '');
$expectedState = $_SESSION['google_oauth_state'] ?? '';
unset($_SESSION['google_oauth_state']);
if ($state === '' || !hash_equals($expectedState, $state)) {
    google_fail('Sessão de login com Google expirada ou inválida. Tente de novo.');
}

$code = (string)($_GET['code'] ?? '');
if ($code === '') {
    google_fail('Login com Google cancelado.');
}

$redirectUri = (!empty($_SERVER['HTTPS']) ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . '/auth-google-callback.php';

$ch = curl_init('https://oauth2.googleapis.com/token');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query([
        'code' => $code,
        'client_id' => GOOGLE_CLIENT_ID,
        'client_secret' => GOOGLE_CLIENT_SECRET,
        'redirect_uri' => $redirectUri,
        'grant_type' => 'authorization_code',
    ]),
    CURLOPT_TIMEOUT => 10,
]);
$tokenResponse = curl_exec($ch);
curl_close($ch);
$tokenData = json_decode((string)$tokenResponse, true);

if (!is_array($tokenData) || empty($tokenData['access_token'])) {
    google_fail('Não consegui confirmar o login com o Google.');
}

$ch = curl_init('https://www.googleapis.com/oauth2/v3/userinfo');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $tokenData['access_token']],
    CURLOPT_TIMEOUT => 10,
]);
$userInfoResponse = curl_exec($ch);
curl_close($ch);
$userInfo = json_decode((string)$userInfoResponse, true);

if (!is_array($userInfo) || empty($userInfo['sub']) || empty($userInfo['email'])) {
    google_fail('Não consegui obter seus dados do Google.');
}

$googleId = (string)$userInfo['sub'];
$email = (string)$userInfo['email'];
$picture = isset($userInfo['picture']) && preg_match('#^https://lh3\.googleusercontent\.com/#', (string)$userInfo['picture'])
    ? (string)$userInfo['picture'] : null;

$db = get_db();
$stmt = $db->prepare('SELECT id, totp_enabled FROM users WHERE google_id = ?');
$stmt->execute([$googleId]);
$user = $stmt->fetch();

if (!$user) {
    $stmt = $db->prepare('SELECT id, totp_enabled FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if ($user) {
        $db->prepare('UPDATE users SET google_id = ? WHERE id = ?')->execute([$googleId, $user['id']]);
    }
}

if (!$user) {
    $baseUsername = preg_replace('/[^a-z0-9_]/', '', strtolower(explode('@', $email)[0])) ?: 'usuario';
    $username = $baseUsername;
    $suffix = 0;
    $check = $db->prepare('SELECT id FROM users WHERE username = ?');
    do {
        $check->execute([$username]);
        if (!$check->fetch()) break;
        $suffix++;
        $username = $baseUsername . $suffix;
    } while (true);

    $stmt = $db->prepare('INSERT INTO users (username, email, google_id, email_verified_at, avatar) VALUES (?, ?, ?, NOW(), ?)');
    $stmt->execute([$username, $email, $googleId, $picture]);
    $userId = (int)$db->lastInsertId();
    $totpEnabled = false;
} else {
    $userId = (int)$user['id'];
    $totpEnabled = (int)$user['totp_enabled'] === 1;
    // preenche a foto do Google se o usuário ainda não tem nenhuma
    if ($picture) {
        $db->prepare('UPDATE users SET avatar = ? WHERE id = ? AND avatar IS NULL')->execute([$picture, $userId]);
    }
}

if ($totpEnabled) {
    session_regenerate_id(true);
    $_SESSION['pending_2fa_user_id'] = $userId;
    header('Location: login.php');
} else {
    complete_login($userId);
    header('Location: index.php');
}
exit;
