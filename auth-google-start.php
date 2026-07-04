<?php
require_once __DIR__ . '/auth.php';

if (!defined('GOOGLE_CLIENT_ID') || GOOGLE_CLIENT_ID === '') {
    http_response_code(500);
    die('Login com Google ainda não foi configurado neste servidor.');
}

$state = bin2hex(random_bytes(16));
$_SESSION['google_oauth_state'] = $state;

$redirectUri = (!empty($_SERVER['HTTPS']) ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . '/auth-google-callback.php';

$params = [
    'client_id' => GOOGLE_CLIENT_ID,
    'redirect_uri' => $redirectUri,
    'response_type' => 'code',
    'scope' => 'openid email profile',
    'state' => $state,
    'prompt' => 'select_account',
];

header('Location: https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params));
exit;
