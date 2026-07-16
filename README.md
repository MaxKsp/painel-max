# Orby

**Rotina, financas pessoais e organizacao diaria em um painel self-hosted.**

Orby e um projeto web feito para centralizar vida financeira, agenda, treinos e preferencias pessoais em uma unica aplicacao. A proposta e ter uma ferramenta pratica para uso real no dia a dia, mas tambem com base tecnica solida: autenticacao, 2FA, multiusuario, API em PHP, banco MySQL, PWA, testes automatizados e rotinas de backup criptografado.

> Projeto pessoal mantido por [Max Keller](https://github.com/MaxKsp).

## Visao Geral

O Orby nasceu para resolver um problema simples: acompanhar dinheiro, rotina e metas sem depender de varias planilhas ou aplicativos separados.

Hoje o projeto combina:

- controle financeiro pessoal;
- agenda e rotina diaria;
- acompanhamento de treinos e medidas;
- area de perfil, preferencias e temas;
- autenticacao com senha, Google e 2FA;
- backup e restauracao criptografados;
- base preparada para evoluir como produto SaaS self-hosted.

## Principais Recursos

### Financeiro

- Visao consolidada de saldo, patrimonio, faturas e credito disponivel.
- Cadastro de contas, cartoes, bancos, receitas e despesas.
- Despesas avulsas, recorrentes e parceladas.
- Transferencia entre contas e pagamento de fatura.
- Cofrinhos/metas por conta.
- Cheque especial, limite de cartao, vencimento e melhor dia de compra.
- Importacao e conciliacao por OFX.
- Relatorios, graficos, mapa de calor e resumo anual para IR.
- Busca, filtros e agrupamento por conta/banco/categoria.

### Rotina

- Agenda semanal.
- Checklist diario.
- Sequencia de dias concluidos.
- Graficos de progresso.
- Notificacoes e lembretes.

### Treinos

- Cadastro de treinos e exercicios.
- Checklist do treino do dia.
- Registro de carga e progresso.
- Medidas corporais, peso e IMC.

### Plataforma

- Multiusuario com isolamento de dados.
- Login com senha e Google OAuth.
- 2FA com TOTP e codigos de backup.
- Protecao CSRF.
- Rate limit em pontos sensiveis.
- PWA instalavel.
- Preferencias sincronizadas por usuario.
- Deploy automatizado via GitHub Actions.

## Backup e Restauracao Criptografados

O Orby possui uma rotina de backup e restore pensada para operacao segura.

O artefato de backup usa:

- magic/versionamento de container;
- criptografia com `libsodium secretstream`;
- chave obrigatoria via variavel de ambiente `ORBY_BACKUP_KEY`;
- contrato de tabelas persistentes e efemeras;
- validacao do schema antes de gerar/restaurar;
- restore em duas passagens: validacao do artefato e restauracao transacional;
- protecao contra restaurar no banco da aplicacao por engano;
- teste automatizado cobrindo corrupcao, chave errada, rollback e isolamento.

Arquivos principais:

- `app/Core/BackupCrypto.php`
- `app/Core/DatabaseBackup.php`
- `app/Core/DatabaseRestore.php`
- `config/backup-contract.php`
- `config/schema-contract.php`
- `scripts/backup.php`
- `scripts/restore.php`
- `tests/cases/backup_recovery_test.php`

## Stack

| Camada | Tecnologia |
|---|---|
| Front-end | HTML, CSS, JavaScript vanilla |
| Graficos | Chart.js |
| Back-end | PHP 8+ |
| Banco | MySQL |
| Auth | Sessao PHP, bcrypt, TOTP |
| PWA | Manifest + Service Worker |
| Deploy | GitHub Actions + FTPS |
| Testes | Testes PHP e JavaScript sem framework pesado |
| Backup | PHP + libsodium |

## Estrutura do Projeto

```text
.
|-- api/                    Endpoints da aplicacao
|-- app/Core/               Componentes centrais reutilizaveis
|-- assets/                 CSS, JS e imagens
|-- automation/             Arquivos auxiliares de automacao
|-- config/                 Contratos de backup/schema
|-- docs/                   Documentacao tecnica e relatorios
|-- migrations/             Migracoes de banco
|-- scripts/                Scripts operacionais
|-- tests/                  Testes automatizados
|-- index.php               Aplicacao principal
|-- auth.php                Sessao, CSRF, login e 2FA
|-- db.php                  Conexao PDO
|-- finance.php             Regras do modulo financeiro
|-- schema.sql              Schema inicial
|-- config.example.php      Exemplo de configuracao local
```

## Rodando Localmente

Requisitos:

- PHP 8+
- MySQL
- extensoes PHP: `pdo_mysql`, `mbstring`, `json`
- para backup criptografado: `sodium`

Passos:

```bash
cp config.example.php config.php
php -S localhost:8080
```

Depois:

1. Crie um banco MySQL.
2. Rode o `schema.sql`.
3. Ajuste as credenciais em `config.php`.
4. Acesse `http://localhost:8080`.

## Variaveis de Backup

O backup criptografado nao usa senha do banco como chave. Defina uma chave propria:

```bash
php -r "echo base64_encode(random_bytes(SODIUM_CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_KEYBYTES)), PHP_EOL;"
```

Variaveis esperadas:

| Variavel | Uso |
|---|---|
| `ORBY_BACKUP_KEY` | chave base64 de 32 bytes para criptografar/decriptar backups |
| `ORBY_RESTORE_DB_HOST` | host do banco isolado de restauracao |
| `ORBY_RESTORE_DB_NAME` | nome do banco isolado de restauracao |
| `ORBY_RESTORE_DB_USER` | usuario do banco de restauracao |
| `ORBY_RESTORE_DB_PASS` | senha do banco de restauracao |
| `ORBY_RESTORE_CONFIRM_NAME` | confirmacao exata do banco alvo |

## Testes

Rodar a suite PHP:

```bash
php tests/run.php
```

Validar sintaxe dos arquivos PHP:

```bash
php -l arquivo.php
```

O workflow `.github/workflows/tests.yml` roda validacoes de PHP e JavaScript nos PRs.

## Deploy

O deploy e feito por GitHub Actions via FTPS para hospedagem compartilhada.

Secrets esperados:

| Secret | Descricao |
|---|---|
| `FTP_SERVER` | servidor FTP/FTPS |
| `FTP_USERNAME` | usuario FTP |
| `FTP_PASSWORD` | senha FTP |
| `FTP_SERVER_DIR` | diretorio remoto, geralmente `/public_html/` |

O arquivo `config.php` nao deve ser versionado. Ele precisa ser criado diretamente no servidor a partir do `config.example.php`.

## Seguranca

Pontos ja tratados ou em evolucao:

- senha com hash seguro;
- CSRF nos formularios e chamadas sensiveis;
- 2FA por TOTP;
- codigos de backup para 2FA;
- isolamento por usuario;
- rate limit em fluxos sensiveis;
- headers de seguranca via `.htaccess`;
- backup criptografado com chave fora do repositorio;
- restore protegido contra alvo incorreto.

## Roadmap

O backlog e as proximas entregas ficam no [ROADMAP.md](ROADMAP.md).

Linhas principais:

- evoluir modulo financeiro como experiencia de banking app;
- melhorar qualidade dos testes;
- fortalecer trilha de auditoria;
- amadurecer modelo de assinatura;
- separar cada vez mais a arquitetura em modulos;
- melhorar operacao, backup e deploy.

## Contribuicao

Fluxo sugerido:

1. Crie uma branch por mudanca.
2. Abra PR contra `master`.
3. Rode os testes antes do merge.
4. Mantenha commits objetivos.

Convencao usada:

- `feat:` nova funcionalidade;
- `fix:` correcao;
- `sec:` seguranca;
- `ci:` pipeline/automacao;
- `docs:` documentacao;
- `refactor:` reorganizacao sem mudar comportamento.

## Autor

Feito por [Max Keller](https://github.com/MaxKsp).
