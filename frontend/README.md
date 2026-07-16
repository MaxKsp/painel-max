# Frontend Orby

Frontend modular em React 19, TypeScript, Vite e Tailwind CSS v4. O backend PHP e as APIs ficam na mesma origem.

## Desenvolvimento

```bash
npm ci
npm run dev
```

O desenvolvimento sem sessão PHP pode usar dados isolados:

```env
VITE_USE_MOCKS=true
```

Mocks nunca são ativados como fallback de erro. Com a variável ausente ou diferente de `true`, o aplicativo usa exclusivamente `/api/*.php`.

## Validação

```bash
npm run validate
```

Esse comando executa TypeScript, Vitest e o build de produção.

## Integração PHP e CSRF

O build executa `scripts/build-php-shell.mjs`, converte o HTML do Vite em `dist/index.php` e injeta:

- `require_login_page()` para proteger o aplicativo;
- `window.CSRF_TOKEN`, gerado por `csrf_token()`;
- os assets versionados do Vite.

As mutations são bloqueadas quando o token não existe. Todas as chamadas usam `credentials: "same-origin"`.

## Rotas

- `/` — Visão Geral
- `/agenda`
- `/financeiro`
- `/treinos`
- `/perfil`

O `.htaccess` envia somente essas rotas inexistentes para `index.php`. Arquivos, páginas PHP e APIs reais não são interceptados.

## Deploy

O workflow da Hostinger executa `npm ci`, testes e build. Primeiro publica o backend PHP e depois publica `frontend/dist/`, substituindo o `index.php` legado pelo shell React autenticado. Não envie `frontend/src` para a hospedagem.
