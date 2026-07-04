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
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root{--bg:#000000;--surface:#161616;--line:#242424;--text:#EDEDED;--muted:#8A93A6;--accent:#3B82F6;--sage:#4FB07A;--brick:#E15C56;}
  *{box-sizing:border-box;}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);color:var(--text);font-family:'Archivo',Arial,sans-serif;}
  .card{width:100%;max-width:380px;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:32px;text-align:center;}
  h1{font-size:20px;margin:0 0 12px;}
  p{color:var(--muted);font-size:14px;}
  a{color:var(--accent);text-decoration:none;}
  .ok{color:var(--sage);}
  .fail{color:var(--brick);}
</style>
</head>
<body>
  <div class="card">
    <?php if ($ok): ?>
      <h1 class="ok">E-mail confirmado!</h1>
      <p>Sua conta já pode usar o e-mail pra recuperação futura.</p>
    <?php else: ?>
      <h1 class="fail">Link inválido ou já usado</h1>
      <p>Esse link de confirmação não é mais válido.</p>
    <?php endif; ?>
    <p><a href="login.php">Voltar pro login</a></p>
  </div>
</body>
</html>
