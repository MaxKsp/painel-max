<?php
// Copie este arquivo para config.php e preencha com as credenciais reais
// do banco MySQL criado no hPanel da Hostinger.
//
// config.php NUNCA deve ser commitado no git (já está no .gitignore).

define('DB_HOST', 'localhost');
define('DB_NAME', 'seu_banco');
define('DB_USER', 'seu_usuario');
define('DB_PASS', 'sua_senha');

// Login com Google (opcional). Deixe como está se não for usar — o botão
// "Entrar com Google" simplesmente não vai funcionar até isso ser
// preenchido. Veja o README pra criar as credenciais no Google Cloud Console.
define('GOOGLE_CLIENT_ID', '');
define('GOOGLE_CLIENT_SECRET', '');
