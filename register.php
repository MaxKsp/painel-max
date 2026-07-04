<?php
require_once __DIR__ . '/auth.php';

if (current_user_id() !== null) {
    header('Location: index.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (is_register_locked_out()) {
        $error = 'Muitos cadastros a partir do seu IP. Tente novamente mais tarde.';
    } else {
        $username = trim((string)($_POST['username'] ?? ''));
        $email = trim((string)($_POST['email'] ?? ''));
        $password = (string)($_POST['password'] ?? '');
        $confirm = (string)($_POST['confirm'] ?? '');

        if ($username === '' || mb_strlen($username) < 3 || mb_strlen($username) > 64) {
            $error = 'Usuário precisa ter entre 3 e 64 caracteres.';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $error = 'E-mail inválido.';
        } elseif (mb_strlen($password) < 8) {
            $error = 'Senha precisa ter pelo menos 8 caracteres.';
        } elseif ($password !== $confirm) {
            $error = 'As senhas não coincidem.';
        } else {
            $db = get_db();
            $stmt = $db->prepare('SELECT id FROM users WHERE username = ? OR email = ?');
            $stmt->execute([$username, $email]);
            if ($stmt->fetch()) {
                record_register_attempt();
                $error = 'Já existe uma conta com esse usuário ou e-mail.';
            } else {
                $hash = password_hash($password, PASSWORD_DEFAULT);
                $token = bin2hex(random_bytes(32));
                $stmt = $db->prepare('INSERT INTO users (username, password_hash, email, email_verify_token) VALUES (?, ?, ?, ?)');
                $stmt->execute([$username, $hash, $email, $token]);
                $userId = (int)$db->lastInsertId();

                $verifyUrl = (!empty($_SERVER['HTTPS']) ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . '/verify-email.php?token=' . $token;
                @mail($email, 'Confirme seu e-mail — Painel Max', "Clique para confirmar seu e-mail:\n\n$verifyUrl\n\nSe você não criou essa conta, ignore este e-mail.");

                reset_attempts();
                session_regenerate_id(true);
                $_SESSION['user_id'] = $userId;
                header('Location: index.php');
                exit;
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Painel Max — Criar conta</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root{--bg:#000000;--surface:#161616;--line:#242424;--text:#EDEDED;--muted:#8A93A6;--accent:#3B82F6;--brick:#E15C56;}
  *{box-sizing:border-box;}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);color:var(--text);font-family:'Archivo',Arial,sans-serif;}
  .card{width:100%;max-width:380px;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:32px;}
  h1{font-size:20px;margin:0 0 4px;}
  p.sub{color:var(--muted);font-size:13px;margin:0 0 24px;}
  label{display:block;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);margin-bottom:6px;}
  input{width:100%;padding:12px;border-radius:10px;border:1px solid var(--line);background:#0d0d0d;color:var(--text);font-size:14px;margin-bottom:16px;font-family:inherit;}
  input:focus{outline:none;border-color:var(--accent);}
  button{width:100%;padding:12px;border-radius:10px;border:none;background:var(--accent);color:#fff;font-weight:600;cursor:pointer;font-size:14px;font-family:inherit;}
  button:hover{opacity:.9;}
  .error{background:rgba(225,92,86,.12);color:var(--brick);border:1px solid rgba(225,92,86,.3);padding:10px 12px;border-radius:10px;font-size:13px;margin-bottom:16px;}
  .footer{text-align:center;margin-top:16px;font-size:13px;color:var(--muted);}
  .footer a{color:var(--accent);text-decoration:none;}
</style>
</head>
<body>
  <form class="card" method="POST" autocomplete="off">
    <h1>Criar conta</h1>
    <p class="sub">Cadastre-se pra usar o Painel Max.</p>
    <?php if ($error): ?><div class="error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div><?php endif; ?>
    <label for="username">Usuário</label>
    <input type="text" id="username" name="username" required autofocus value="<?= htmlspecialchars($_POST['username'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
    <label for="email">E-mail</label>
    <input type="email" id="email" name="email" required value="<?= htmlspecialchars($_POST['email'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
    <label for="password">Senha</label>
    <input type="password" id="password" name="password" required minlength="8">
    <label for="confirm">Confirmar senha</label>
    <input type="password" id="confirm" name="confirm" required minlength="8">
    <button type="submit">Criar conta</button>
    <div class="footer"><a href="login.php">Já tenho conta, entrar</a></div>
  </form>
</body>
</html>
