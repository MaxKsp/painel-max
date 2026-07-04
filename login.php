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
    if (!csrf_form_ok()) {
        $error = 'Sessão expirada. Tente de novo.';
    } elseif (isset($_POST['code'])) {
        $result = attempt_2fa((string)$_POST['code']);
        if ($result === 'ok') {
            header('Location: index.php');
            exit;
        }
        $error = $result === 'locked'
            ? 'Muitas tentativas erradas. Tente novamente em alguns minutos.'
            : 'Código inválido.';
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
<title>Painel Max — Entrar</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/auth.css">
</head>
<body>
  <div class="brand">
    <div class="brandmark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5l8 9 8-9v14"/></svg></div>
    <div class="brandname"><b>Painel</b> Max</div>
  </div>
<?php if ($show2fa): ?>
  <form class="card" method="POST" autocomplete="off">
    <?= csrf_field() ?>
    <h1>Verificação em duas etapas</h1>
    <p class="sub">Sua conta está protegida. Digite o código do app autenticador ou um dos códigos de backup.</p>
    <?php if ($error): ?><div class="error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div><?php endif; ?>
    <label for="code">Código de verificação</label>
    <input type="text" id="code" name="code" inputmode="numeric" autocomplete="one-time-code" placeholder="000000" required autofocus>
    <button type="submit">Confirmar e entrar</button>
    <div class="footer"><a href="login.php?cancel=1">Voltar</a></div>
  </form>
<?php else: ?>
  <form class="card" method="POST" autocomplete="off">
    <?= csrf_field() ?>
    <h1>Bem-vindo de volta</h1>
    <p class="sub">Sua rotina e suas finanças, num painel só.</p>
    <?php if ($error): ?><div class="error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div><?php endif; ?>
    <label for="username">Usuário</label>
    <input type="text" id="username" name="username" placeholder="seu.usuario" required autofocus>
    <label for="password">Senha</label>
    <input type="password" id="password" name="password" placeholder="••••••••" required>
    <button type="submit">Entrar</button>
    <div class="divider">ou</div>
    <a href="auth-google-start.php" class="btn-google">
      <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.85 2.09-1.8 2.73v2.27h2.92c1.7-1.57 2.68-3.88 2.68-6.64z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.17l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.34C2.44 15.98 5.48 18 9 18z"/><path fill="#FBBC05" d="M3.97 10.71c-.18-.54-.28-1.11-.28-1.71s.1-1.17.28-1.71V4.95H.96A8.996 8.996 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.34z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.95l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"/></svg>
      Entrar com Google
    </a>
    <div class="footer">Primeira vez aqui? <a href="register.php">Criar conta</a></div>
  </form>
  <div class="finePrint">Protegido com criptografia e verificação em duas etapas</div>
<?php endif; ?>
</body>
</html>
