# MANUAL DE OPERAÇÃO — Catálogo COMALI

> Fonte: HISTORICO-COMALI.md, COMANDOS.md, scripts/ (sync-sheet.ts), logs de sync e lições da homologação de 2026-09-23.

---

## 1. Fluxo completo (pedido webapp → aprovação menu COMALI → sync → site ≤30min)

1. **Pedido no webapp** (Sandra/comercial): busca ou cadastra → "+ Pedir produto novo" (nome, marca, categoria, link, foto, descrição) → grava na aba **PEDIDOS** + e-mail (consultoria@suportedelivery.com).
2. **Aprovação no menu COMALI** (Apps Script): Edmar revisa o pedido e preenche a linha na aba **CATÁLOGO** com todos os campos. A **categoria principal é obrigatória** (dropdown de categorias no pedido evita erro humano). Nome oficial do fabricante (copiar da página, não resumir).
3. **Download do CSV**: baixar CSV novo da aba **CATÁLOGO** antes de **cada** sync — o script lê o arquivo local (`scripts/sheet-input.csv`), não a aba ao vivo.
4. **Sync dry-run**: `npx tsx scripts/sync-sheet.ts` → conferir relatório (CRIAR / ATUALIZAR / STATUS / AVISOS). STATUS>0 ou ATUALIZAR>0 exige conferência; aba **MUDANÇAS** é a fonte da verdade (direção antigo→novo do status).
5. **Sync apply**: só `--apply` com relatório revisado. Log salvo em `scripts/sync-log-YYYY-MM-DD.txt`.
6. **Site em ≤30min**: `revalidate = 1800` (30 min). Deploy de código: `git push origin master` → Vercel build (~2–4 min). Sem deploy de código, o dado já está no Sanity e a página revalida sozinha.

---

## 2. Regras de ouro

1. **Sanity = produção.** Dataset compartilhado: qualquer escrita afeta comali.com.br. Links de homologação que precisem diferir vivem no CÓDIGO, não no CMS.
2. **Status**: `active | draft | discontinued` (não existe "inactive"). Site só lista `status == "active"`.
3. **`revalidate = 1800s` (30 min)** — não reduzir sem motivo (cota Vercel).
4. **Equipe não edita Sanity direto**: fluxo é planilha → sync. Produtos novos e inativações só pela planilha/webapp.
5. **Deploys**: preview = branch; produção = **master**. Push dispara build automático.
6. **Nunca commitar sem** `npm run typecheck`. Merge sempre `--no-ff` com backup prévio.
7. **`_id` é chave primária**: linha **sem** `_id` = produto novo; **com** `_id` = existente. **Nunca re-aprovar pedido de produto que já tem `_id`** (duplica / colisão "already exists").
8. **Atualizar foto de produto existente**: menu COMALI → **"Re-extrair imagem do fabricante"** (não re-aprovar o pedido).
9. **Delete é SEMPRE manual e nos DOIS lados**: remover no Sanity (curl/Studio) **E** excluir a linha da planilha. **Sync nunca deleta** (proteção contra acidentes).
10. **Redirect de descontinuados é TEMPORÁRIO** (302/307), nunca 301 — Comercial reativa produtos; destino = 1ª categoria, fallback `/produtos`. Protege ADS de 404.
11. **Baixar CSV novo da aba CATÁLOGO antes de CADA sync.**
12. **`--apply` só com relatório revisado.**
13. **Apps Script** = colar arquivo inteiro + **Implantar nova versão**; **OpenCode** = `git push`. **Nunca editar Apps Script às cegas.**

---

## 3. Comandos úteis

```bash
# Site local (dados Sanity em tempo real, sem cache)
npm run dev

# Antes de enviar
npm run typecheck
npm run lint
npm run build

# Deploy produção (Vercel auto-build ~2–4 min)
git add -A && git commit -m "feat: ..." && git push origin master

# Status git
git status -sb
git log --oneline -5

# Sync planilha → Sanity (CSV baixado da aba CATÁLOGO em scripts/sheet-input.csv)
npx tsx scripts/sync-sheet.ts            # dry-run / relatório
npx tsx scripts/sync-sheet.ts --apply    # aplicar (só após revisar)

# Export CSV mestre
npx tsx scripts/export-products-csv.ts

# Scripts utilitários (padrão)
set -a && source .env.local && set +a && npx tsx scripts/<nome>.ts
```

**URLs**

| Ambiente | URL |
|---|---|
| Produção | https://comali.com.br |
| Staging/preview | https://comali-com-br.vercel.app |
| Local | http://localhost:3000 |
| Sanity Studio | https://comali-com-br.sanity.studio |

**Último sync registrado** (`scripts/sync-log-2026-09-23.txt`): Planilha 454 linhas · Sanity 456 ativos · CRIAR 0 · ATUALIZAR 5 · STATUS 0 · AVISOS 0.

---

## 4. Troubleshooting

### Mudanças no Sanity não aparecem no site
1. Campo foi **Publicado** no Studio? (não só salvo)
2. Push feito? (`git status -sb` → `ahead 0`)
3. Aguardou ~30 min (ISR 1800s) ou hard refresh **Ctrl+Shift+R**
4. Produto draft aparecendo? Status do **campo** `status` → `draft` + Publish ("Move to draft" do menu ⋮ **não** altera `status`)

### Colisão "already exists" / duplicatas
- Nome igual gera `_id` igual → erro. **Diferenciar com medida/gramatura** (28g vs 24g, 20x20 vs 22x20).
- Nome oficial do fabricante: **copiar da página** do fabricante, não resumir.
  - Certo: `Papel Toalha Rolo Ripz 200m com 6 Rolos de 28G`
  - Errado: `Papel Toalha Bobina`
- Nunca re-aprovar pedido de produto que **já tem `_id`** na planilha.

### URLs duplicadas `/produtos/produtos` / hierarquia
- Categorias no formato **`Raiz | Sub | Sub-sub`** (pipe). **1º item define a URL**; demais definem listagens. Ex.: `Dispensers | Papel Toalha Interfolhado`.

### Categoria não encontrada no sync
- Ex.: `⚠️ Categoria 'papel-toalha-interfolhado' não encontrada` — criar/corrigir a categoria no Sanity ou ajustar a string na planilha antes do `--apply`.

### Linhas com `_id` undefined no log antigo
- CSV incompleto ou sem coluna `_id`. Rebaixar CSV completo da aba CATÁLOGO; linha sem `_id` só é válida para produto **novo** (ainda assim validar unicidade de nome).

### Erro no webapp (Apps Script)
- Ver **Execuções** (ícone relógio) no editor Apps Script. **Console do navegador NÃO mostra erros do servidor.**

### Divergência de status planilha × Sanity
- Conferir aba **MUDANÇAS** (antigo → novo) antes do `--apply` quando STATUS>0.

### Produtos descontinuados / ADS 404
- Redirect **307** automático para 1ª categoria ou `/produtos`. Se o produto for reativo, status volta a `active` e a URL original volta a funcionar (por isso nunca 301).

### localhost ≠ site
- `npm run dev` = tempo real; Vercel = HTML estático + revalidação 30 min.

---

## 5. Webapp Apps Script (atualizar / implantar / logs)

- **Planilha**: Google Sheets "COMALI — Catálogo Mestre" (aba CATÁLOGO + MUDANÇAS + PEDIDOS).
- **Webapp**: Apps Script vinculado (URL `/exec`); e-mail de alertas: consultoria@suportedelivery.com.
- **Le colunas pelo NOME do cabeçalho** (imune a reordenação de colunas). Fotos via `externalImages` (URLs externas); campo `images` quase sempre vazio.
- **Atualizar código**: colar o arquivo **inteiro** no editor → **Implantar → Nova versão** (nunca editar às cegas; nunca só salvar sem implantar).
- **Logs de erro**: editor Apps Script → ícone **relógio (Execuções)** → detalhe da execução. O console do navegador não mostra falhas do servidor.
- **Menu COMALI**: ATIVAR/DESCONTINUAR (grava MUDANÇAS + e-mail) · pedido de produto novo · **Re-extrair imagem do fabricante** (foto de produto existente — heurística anti-thumbnail, checagem ≥800px).
- **Operação da equipe**: Sandra usa o webapp; Edmar revisa PEDIDOS → completa CATÁLOGO (sem `_id` se for novo) → roda sync → site ≤30 min.

---

## 6. Sanity Studio

- Studio: https://comali-com-br.sanity.studio · painel: sanity.io/manage (projeto `5fcrgo8n`).
- **Não** é o fluxo normal da equipe (use planilha/sync). Escrita direta só para correções pontuais de Edmar/técnico.
- Status do campo: `active | draft | discontinued`. Sempre **Publicar** após editar.
- Schema deploy (mudança de schema): `npx sanity@latest schema deploy`.
- Studio local: `npx sanity@latest dev` (porta 3333).
- Queries GROQ filtram `status == "active"` em listagens; acesso por slug (`productBySlugQuery`) não filtra status (redirect interno cuida de draft/discontinued).

---

## 7. Regras finais (lições da homologação 2026-09-23)

| # | Lição |
|---|---|
| 1 | **Nome oficial do fabricante**: copiar da página do fabricante, nunca resumir. Certo: "Papel Toalha Rolo Ripz 200m com 6 Rolos de 28G". Errado: "Papel Toalha Bobina". |
| 2 | **Nomes iguais = `_id` igual = colisão "already exists"**. Diferenciar com medida/gramatura (28g vs 24g, 20x20 vs 22x20). |
| 3 | **Categorias no formato `Raiz \| Sub \| Sub-sub`** (pipe). 1º item define a URL; demais definem listagens. Ex.: `Dispensers \| Papel Toalha Interfolhado`. |
| 4 | **Dropdown de categorias** no pedido (webapp) evita erro humano; **categoria principal obrigatória**. |
| 5 | **`_id` é chave primária**: sem `_id` = novo; com `_id` = existente. **Nunca re-aprovar pedido de produto que já tem `_id`** (duplica). |
| 6 | **Foto de produto existente**: menu COMALI → "Re-extrair imagem do fabricante" (nunca re-aprovar). |
| 7 | **Delete manual nos DOIS lados** (Sanity + linha da planilha). Sync **nunca** deleta. |
| 8 | **Aba MUDANÇAS** = fonte da verdade para divergências de STATUS no dry-run (antigo→novo). |
| 9 | **Redirect de descontinuados temporário (302/307)**, não 301; destino 1ª categoria, fallback `/produtos`; protege ADS. |
| 10 | **Baixar CSV da aba CATÁLOGO antes de cada sync** (sync lê o arquivo, não a aba ao vivo). |
| 11 | **`--apply` só com relatório revisado**; STATUS>0 ou ATUALIZAR>0 exige conferência. |
| 12 | **Apps Script = colar inteiro + Implantar nova versão; OpenCode = git push.** Nunca editar Apps Script às cegas. |
| 13 | **Erro no webapp**: ver Execuções (relógio) no editor Apps Script; console do navegador não mostra erros do servidor. |

---

*Homologação completa: 2026-09-23. Ver também HISTORICO-COMALI.md e COMANDOS.md.*
