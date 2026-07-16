<h1 align="center">Orby</h1>

<p align="center">
  <b>Rotina, financas pessoais e organizacao diaria em um unico painel.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PHP-777BB4?style=flat&logo=php&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=flat&logo=pwa&logoColor=white" />
  <img src="https://img.shields.io/badge/2FA-TOTP-informational?style=flat" />
  <img src="https://img.shields.io/badge/Backup-Encrypted-success?style=flat" />
  <img src="https://img.shields.io/badge/Self--Hosted-000000?style=flat" />
</p>

---

O **Orby** e um painel pessoal self-hosted para centralizar rotina, financas, treinos e preferencias em uma unica aplicacao.

A ideia e simples: abrir uma tela e entender o que precisa ser feito, como esta o dinheiro, quais compromissos existem e quais habitos estao evoluindo. O projeto foi construido para rodar em hospedagem compartilhada comum, usando **PHP + MySQL**, sem depender de framework pesado ou servicos pagos obrigatorios.

Tambem serve como base tecnica de produto: multiusuario, autenticacao, 2FA, API propria, PWA, deploy automatizado, testes e backup/restauracao criptografados.

---

## Funcionalidades

**Financeiro**

- Visao consolidada de saldo, patrimonio, faturas e credito disponivel.
- Cadastro de contas, cartoes, bancos, receitas e despesas.
- Despesas avulsas, recorrentes e parceladas.
- Transferencia entre contas e pagamento de fatura.
- Cofrinhos/metas de guardar dinheiro por conta.
- Cheque especial, limite de cartao, vencimento e melhor dia de compra.
- Importacao e conciliacao por extrato bancario OFX.
- Relatorios, graficos, mapa de calor e resumo anual para IR.
- Busca, filtros e agrupamento por conta, banco e categoria.

**Rotina**

- Agenda semanal.
- Checklist diario.
- Sequencia de dias concluidos.
- Graficos de progresso.
- Lembretes e notificacoes.

**Treinos**

- Cadastro de treinos e exercicios.
- Checklist do treino do dia.
- Registro de carga e progressao.
- Medidas corporais, peso e IMC.

**Plataforma**

- Multiusuario com dados isolados por conta.
- Login com senha e Google OAuth.
- Verificacao em duas etapas com TOTP.
- Codigos de backup para 2FA.
- Preferencias sincronizadas por usuario.
- PWA instalavel.
- Deploy automatizado via GitHub Actions.

---

## Backup e Restauracao Criptografados

O Orby possui uma rotina de backup e restore voltada para operacao segura.

O backup usa:

- container versionado;
- criptografia com `libsodium secretstream`;
- chave obrigatoria via variavel de ambiente `ORBY_BACKUP_KEY`;
- contrato de tabelas persistentes e efemeras;
- validacao do schema antes de gerar ou restaurar;
- restore em duas passagens: validacao do artefato e restauracao transacional;
- protecao contra restaurar no banco da aplicacao por engano;
- teste automatizado cobrindo corrupcao, chave errada, rollback e isolamento.

Arquivos principais:

```text
app/Core/BackupCrypto.php
app/Core/DatabaseBackup.php
app/Core/DatabaseRestore.php
app/Core/SchemaAuditor.php
config/backup-contract.php
config/schema-contract.php
scripts/backup.php
scripts/restore.php
tests/cases/backup_recovery_test.php
```

---

## Stack

| Camada | Escolha |
|---|---|
| Front-end | HTML, CSS e JavaScript vanilla |
| Graficos | Chart.js |
| Back-end | PHP 8+ |
| Banco | MySQL |
| Auth | Sessao PHP, bcrypt, TOTP |
| PWA | Manifest + Service Worker |
| Deploy | GitHub Actions + FTPS |
| Testes | PHP e JavaScript sem framework pesado |
| Backup | PHP + libsodium |

**Seguranca:** CSRF, rate limit, 2FA, isolamento por usuario, headers de protecao, `config.php` fora do versionamento e backup criptografado com chave fora do repositorio.

**Operacao:** deploy automatizado, scripts de backup/restore, contratos de schema e testes automatizados no CI.

---

## Rodando Localmente

Requisitos:

- PHP 8+
- MySQL
- extensoes PHP: `pdo_mysql`, `mbstring`, `json`
- para backup criptografado: `sodium`

```bash
cp config.example.php config.php
php -S localhost:8080
```

Depois:

1. Crie um banco MySQL.
2. Rode o `schema.sql`.
3. Ajuste as credenciais em `config.php`.
4. Acesse `http://localhost:8080`.

---

## Variaveis de Backup

O backup criptografado nao usa a senha do banco como chave. Gere uma chave propria:

```bash
php -r "echo base64_encode(random_bytes(SODIUM_CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_KEYBYTES)), PHP_EOL;"
```

| Variavel | Uso |
|---|---|
| `ORBY_BACKUP_KEY` | chave base64 de 32 bytes para criptografar/decriptar backups |
| `ORBY_RESTORE_DB_HOST` | host do banco isolado de restauracao |
| `ORBY_RESTORE_DB_NAME` | nome do banco isolado de restauracao |
| `ORBY_RESTORE_DB_USER` | usuario do banco de restauracao |
| `ORBY_RESTORE_DB_PASS` | senha do banco de restauracao |
| `ORBY_RESTORE_CONFIRM_NAME` | confirmacao exata do banco alvo |

---

## Testes

Rodar a suite PHP:

```bash
php tests/run.php
```

O workflow `.github/workflows/tests.yml` valida PHP e JavaScript nos PRs.

---

## Deploy

O deploy e feito por GitHub Actions via FTPS para hospedagem compartilhada.

Secrets esperados:

| Secret | Valor |
|---|---|
| `FTP_SERVER` | servidor FTP/FTPS |
| `FTP_USERNAME` | usuario FTP |
| `FTP_PASSWORD` | senha FTP |
| `FTP_SERVER_DIR` | diretorio remoto, geralmente `/public_html/` |

Configuracao unica no servidor:

1. Criar o banco e rodar `schema.sql`.
2. Criar `config.php` a partir do `config.example.php`.
3. Definir variaveis de ambiente de backup quando for usar `scripts/backup.php` ou `scripts/restore.php`.
4. Ativar SSL da hospedagem.

---

## Estrutura

```text
api/                     endpoints da aplicacao
app/Core/                componentes centrais reutilizaveis
assets/                  CSS, JS e imagens
config/                  contratos de backup e schema
docs/                    documentacao tecnica
migrations/              migracoes de banco
scripts/                 scripts operacionais
tests/                   testes automatizados
index.php                aplicacao principal
auth.php                 sessao, CSRF, login e 2FA
db.php                   conexao PDO
finance.php              regras do modulo financeiro
schema.sql               schema inicial
config.example.php       exemplo de configuracao local
```

---

## Roadmap

O backlog priorizado vive no [ROADMAP.md](ROADMAP.md).

Frentes principais:

- evoluir o financeiro como experiencia de banking app;
- melhorar cobertura de testes;
- fortalecer auditoria e seguranca;
- amadurecer modelo de assinatura;
- modularizar cada vez mais a arquitetura;
- melhorar operacao, backup e deploy.

---

## Contribuindo

Uma branch por melhoria, PR contra a `master` e testes antes do merge.

Convencao de commits:

`feat:` nova funcionalidade · `fix:` correcao · `sec:` seguranca · `ci:` pipeline · `docs:` documentacao · `refactor:` reorganizacao.

---

<p align="center">
  Feito por <a href="https://github.com/MaxKsp">Max Keller</a>
</p>
