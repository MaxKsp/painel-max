# Roadmap — Painel Max

Backlog organizado por prioridade. Cada item deve virar uma branch
`feature/...` própria e um PR separado.

## 🔴 Crítico (risco de perda de dado)

- [x] **Exportar/importar backup em JSON** — ícone de Configurações no topo,
      baixa um `.json` com tudo e outro botão restaura a partir de um arquivo.
- [x] **Sair do artefato do Claude / persistência real** — trocado
      `window.storage` por backend próprio em PHP + MySQL, hospedado na
      Hostinger, atrás de login com sessão, CSRF e rate-limit.
- [x] **Performance ao trocar de aba** — front-end carregava cada chave com
      um request HTTP separado (4-8 por troca de aba). Agora carrega tudo de
      uma vez no login (`api/data.php?all=1`) e mantém em cache em memória.

## 🟠 Funcionalidade importante

- [x] **Despesas recorrentes mensais** — mergeado na `master`.
- [ ] **Rendas com recorrência mais clara** — hoje "Fixa" e "Temporária" já
      são recorrentes por natureza, mas não aparecem no mapa de calor nem
      geram "ocorrências" visíveis como as despesas agora geram.
- [ ] **Pagar fatura do cartão** — botão na conta tipo "Cartão" que zera a
      fatura atual e, opcionalmente, registra o pagamento como uma despesa
      (saída) na conta que pagou.
- [ ] **Histórico entre meses** — hoje tudo é "do mês atual". Guardar um
      fechamento mensal (snapshot de saldo) permite comparar mês a mês.
- [ ] **Diagnóstico com IA de verdade** — hoje é só maquete. Só funciona
      depois que a Edge Function do Gemini estiver publicada na VPS.
- [ ] **Testar o alarme de tarefas** — confirmar que ainda dispara certinho
      depois de tantas mudanças de estrutura na Agenda.

## 🟡 Polimento

- [ ] **Metas por categoria** — ex: limite de R$300 em Lazer, com barra de
      progresso mostrando quanto já foi gasto.
- [ ] **Busca/filtro nos lançamentos** — hoje só dá pra rolar a lista.
- [ ] **Exportar relatório em CSV** — pra abrir numa planilha.
- [ ] **Separar `index.php` em arquivos** (`style.css`, `app.js`) — hoje
      tudo está num arquivo só; bom pra simplicidade, ruim pra diffs de PR
      conforme o projeto cresce.
- [x] **Multiusuário com cadastro por e-mail** — `register.php`, cada
      usuário só vê seus próprios dados.
- [x] **2FA (TOTP) no login** — ativa/desativa em Configurações → Segurança,
      com QR code local e códigos de backup.
- [x] **Login com Google** — precisa configurar `GOOGLE_CLIENT_ID`/
      `GOOGLE_CLIENT_SECRET` no `config.php` (ver README).
- [ ] **Recuperação de senha por e-mail** — fica pra quando houver domínio
      próprio conectado (e-mail não é confiável no domínio temporário da
      Hostinger).
- [ ] **Web Push (VAPID)** — notificação nativa com o app fechado. Exige
      biblioteca de criptografia via composer; hoje o caminho pro app
      fechado é o aviso por e-mail (cron-notify.php).
- [ ] **Endurecer verificação de e-mail** — hoje é só um selo (não bloqueia
      login); revisar quando o e-mail for confiável.

## Convenção de commits

- `feat: ...` — nova funcionalidade
- `fix: ...` — correção de bug
- `chore: ...` — manutenção, sem mudança de comportamento
- `docs: ...` — documentação
