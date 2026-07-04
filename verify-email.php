<?php
require_once __DIR__ . '/auth.php';

$token = (string)($_GET['token'] ?? '');
$ok = false;

if ($token !== '') {
    $db = get_db();
    $stmt = $db->prepare('SELECT id FROM users WHERE email_verify_token = ?');
    $stmt->execute([$token]);
    $user = $stmt->fetch();
    if ($user) {
        $stmt = $db->prepare('UPDATE users SET email_verified_at = NOW(), email_verify_token = NULL WHERE id = ?');
        $stmt->execute([$user['id']]);
        $ok = true;
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Painel Max — Confirmação de e-mail</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/auth.css">
</head>
<body>
  <div class="brand">
    <div class="brandmark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5l8 9 8-9v14"/></svg></div>
    <div class="brandname"><b>Painel</b> Max</div>
  </div>
  <div class="card" style="text-align:center;">
    <?php if ($ok): ?>
      <h1 class="ok-badge">E-mail confirmado!</h1>
      <p class="sub">Sua conta já pode usar o e-mail pra recuperação futura.</p>
    <?php else: ?>
      <h1 class="fail-badge">Link inválido ou já usado</h1>
      <p class="sub">Esse link de confirmação não é mais válido.</p>
    <?php endif; ?>
    <div class="footer"><a href="login.php">Voltar pro login</a></div>
  </div>
</body>
</html>
