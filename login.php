<?php
require_once __DIR__ . '/auth.php';

if (current_user_id() !== null) {
    header('Location: index.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim((string)($_POST['username'] ?? ''));
    $password = (string)($_POST['password'] ?? '');
    $result = attempt_login($username, $password);
    if ($result === 'ok') {
        header('Location: index.php');
        exit;
    } elseif ($result === 'locked') {
        $error = 'Muitas tentativas erradas. Tente novamente em alguns minutos.';
    } else {
        $error = 'Usuário ou senha inválidos.';
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Painel Max — Login</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root{--bg:#000000;--surface:#161616;--line:#242424;--text:#EDEDED;--muted:#8A93A6;--accent:#3B82F6;--brick:#E15C56;}
  *{box-sizing:border-box;}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);color:var(--text);font-family:'Archivo',Arial,sans-serif;}
  .card{width:100%;max-width:360px;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:32px;}
  h1{font-size:20px;margin:0 0 4px;}
  p.sub{color:var(--muted);font-size:13px;margin:0 0 24px;}
  label{display:block;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);margin-bottom:6px;}
  input{width:100%;padding:12px;border-radius:10px;border:1px solid var(--line);background:#0d0d0d;color:var(--text);font-size:14px;margin-bottom:16px;font-family:inherit;}
  input:focus{outline:none;border-color:var(--accent);}
  button{width:100%;padding:12px;border-radius:10px;border:none;background:var(--accent);color:#fff;font-weight:600;cursor:pointer;font-size:14px;font-family:inherit;}
  button:hover{opacity:.9;}
  .error{background:rgba(225,92,86,.12);color:var(--brick);border:1px solid rgba(225,92,86,.3);padding:10px 12px;border-radius:10px;font-size:13px;margin-bottom:16px;}
</style>
</head>
<body>
  <form class="card" method="POST" autocomplete="off">
    <h1>Painel Max</h1>
    <p class="sub">Entre com suas credenciais para continuar.</p>
    <?php if ($error): ?><div class="error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div><?php endif; ?>
    <label for="username">Usuário</label>
    <input type="text" id="username" name="username" required autofocus>
    <label for="password">Senha</label>
    <input type="password" id="password" name="password" required>
    <button type="submit">Entrar</button>
  </form>
</body>
</html>
