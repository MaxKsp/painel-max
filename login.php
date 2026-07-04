<?php
require_once __DIR__ . '/auth.php';

if (current_user_id() !== null) {
    header('Location: index.php');
    exit;
}

if (isset($_GET['cancel'])) {
    unset($_SESSION['pending_2fa_user_id']);
    header('Location: login.php');
    exit;
}

$error = '';
$show2fa = !empty($_SESSION['pending_2fa_user_id']);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['code'])) {
        if (attempt_2fa((string)$_POST['code'])) {
            header('Location: index.php');
            exit;
        }
        $error = 'Código inválido.';
        $show2fa = true;
    } else {
        $username = trim((string)($_POST['username'] ?? ''));
        $password = (string)($_POST['password'] ?? '');
        $result = attempt_login($username, $password);
        if ($result === 'ok') {
            header('Location: index.php');
            exit;
        } elseif ($result === '2fa_required') {
            $show2fa = true;
        } elseif ($result === 'locked') {
            $error = 'Muitas tentativas erradas. Tente novamente em alguns minutos.';
        } else {
            $error = 'Usuário ou senha inválidos.';
        }
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
  .btn-google{display:flex;align-items:center;justify-content:center;gap:8px;background:#fff;color:#1f1f1f;margin-top:10px;}
  .divider{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:12px;margin:16px 0;}
  .divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--line);}
  .error{background:rgba(225,92,86,.12);color:var(--brick);border:1px solid rgba(225,92,86,.3);padding:10px 12px;border-radius:10px;font-size:13px;margin-bottom:16px;}
  .footer{text-align:center;margin-top:16px;font-size:13px;color:var(--muted);}
  .footer a{color:var(--accent);text-decoration:none;}
</style>
</head>
<body>
<?php if ($show2fa): ?>
  <form class="card" method="POST" autocomplete="off">
    <h1>Verificação em duas etapas</h1>
    <p class="sub">Digite o código do seu app autenticador (ou um código de backup).</p>
    <?php if ($error): ?><div class="error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div><?php endif; ?>
    <label for="code">Código</label>
    <input type="text" id="code" name="code" inputmode="numeric" autocomplete="one-time-code" required autofocus>
    <button type="submit">Confirmar</button>
    <div class="footer"><a href="login.php?cancel=1">Cancelar</a></div>
  </form>
<?php else: ?>
  <form class="card" method="POST" autocomplete="off">
    <h1>Painel Max</h1>
    <p class="sub">Entre com suas credenciais para continuar.</p>
    <?php if ($error): ?><div class="error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div><?php endif; ?>
    <label for="username">Usuário</label>
    <input type="text" id="username" name="username" required autofocus>
    <label for="password">Senha</label>
    <input type="password" id="password" name="password" required>
    <button type="submit">Entrar</button>
    <div class="divider">ou</div>
    <a href="auth-google-start.php" class="btn-google" style="text-decoration:none;padding:12px;border-radius:10px;font-weight:600;font-size:14px;">
      <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.85 2.09-1.8 2.73v2.27h2.92c1.7-1.57 2.68-3.88 2.68-6.64z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.17l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.34C2.44 15.98 5.48 18 9 18z"/><path fill="#FBBC05" d="M3.97 10.71c-.18-.54-.28-1.11-.28-1.71s.1-1.17.28-1.71V4.95H.96A8.996 8.996 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.34z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.95l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"/></svg>
      Entrar com Google
    </a>
    <div class="footer"><a href="register.php">Criar conta</a></div>
  </form>
<?php endif; ?>
</body>
</html>
