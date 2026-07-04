# Painel Max

App pessoal de rotina (Agenda) e finanças (Financeiro). Front-end de página
única (`index.php`, HTML + CSS + JS) com um backend PHP + MySQL simples por
trás, pensado pra rodar em hospedagem compartilhada (Hostinger).

## Rodando localmente

Requer PHP (8.x) e um MySQL acessível.

```bash
cp config.example.php config.php   # preencha com as credenciais do seu MySQL local
# rode schema.sql no seu banco e insira o usuário (veja comentários no arquivo)
php -S localhost:8080
```

Depois abra `http://localhost:8080` — vai cair na tela de login.

Para os logos dos bancos aparecerem, a pasta `assets/bancos/` precisa estar
ao lado do `index.php` (já vem inclusa neste repositório).

## Estrutura

```
index.php            – app inteiro (HTML + CSS + JS em um arquivo só, atrás de login)
login.php/logout.php – autenticação por sessão
auth.php              – helpers de sessão, CSRF e rate-limit de login
db.php/config.php     – conexão MySQL (config.php não vai pro git)
schema.sql            – criação das tabelas (rodar uma vez no phpMyAdmin)
api/data.php          – get/set de chave-valor usado pelo front-end
api/export.php        – gera o backup em JSON
api/import.php        – restaura um backup em JSON
assets/bancos/*.svg    – logos dos bancos usados no seletor de conta/despesa
ROADMAP.md             – backlog priorizado de melhorias
```

## Stack

- Vanilla JS, sem framework, + [Chart.js](https://www.chartjs.org/) via CDN
- Backend: PHP + MySQL (PDO, prepared statements)
- Sessão com senha com hash, CSRF token e rate-limit de login
- Persistência: tabela `kv_store` no MySQL, uma linha por chave usada pelo front-end

## Deploy na Hostinger

### Passo único (manual, feito uma vez)

1. Crie o banco MySQL pelo hPanel e rode `schema.sql` no phpMyAdmin.
2. Gere o hash da sua senha: `php -r "echo password_hash('SUA_SENHA', PASSWORD_DEFAULT), PHP_EOL;"`
   e insira o usuário na tabela `users` (exemplo comentado no `schema.sql`).
3. Crie `config.php` **direto no servidor** (File Manager do hPanel) com as
   credenciais reais do banco — copie o conteúdo de `config.example.php` e
   preencha. Esse arquivo nunca é commitado nem enviado pelo deploy
   automático, então essa etapa só precisa ser feita uma vez.
4. Confirme que o SSL grátis da Hostinger está ativo — o `.htaccess` força HTTPS.

### Deploy automático (a cada push na `master`)

O workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) sobe
o conteúdo do repositório pro `public_html` via FTPS a cada push na `master`
(ou manualmente pela aba Actions do GitHub). Ele **não** sobe `config.php`
nem `README.md`/`ROADMAP.md`/`.github`/`.claude` — o `config.php` do servidor
(criado no passo manual acima) nunca é sobrescrito nem apagado.

Configure em **Settings → Secrets and variables → Actions** do repositório
no GitHub:

| Secret            | Valor                                                    |
|-------------------|-----------------------------------------------------------|
| `FTP_SERVER`      | Host de FTP da Hostinger (hPanel → Arquivos → Contas FTP) |
| `FTP_USERNAME`    | Usuário FTP                                                |
| `FTP_PASSWORD`    | Senha FTP                                                  |
| `FTP_SERVER_DIR`  | Pasta de destino, normalmente `/public_html/`              |

Depois disso, `git push` na `master` já publica direto no site.

## Backup

Dentro do app, o ícone de engrenagem no topo abre "Configurações", com botões
pra baixar um backup completo em `.json` e restaurar a partir de um arquivo.
Vale rodar o backup antes de qualquer mudança grande nos dados.

## Fluxo de contribuição

1. Crie uma branch a partir de `master`: `git checkout -b feature/nome-da-melhoria`
2. Faça as alterações em `index.php` (ou nos arquivos do backend)
3. Teste localmente (veja seção acima)
4. Commit e push da branch
5. Abra um Pull Request pra `master` no GitHub

Cada melhoria do `ROADMAP.md` deve virar uma branch/PR separada — evita
misturar mudanças não relacionadas num commit só e facilita reverter algo
específico se der problema.
