# Comandos — Comali.com.br

---

## Como o deploy funciona (resumo rápido)

```
Você edita código → git push → Vercel faz build automático → site atualiza
```

**Você não precisa fazer nada na Vercel.** É só dar `git push` e a Vercel faz tudo sozinha (~2-4 min).

---

## Comandos do dia a dia

### 1. Rodar o site localmente

```bash
npm run dev
```

Abre `http://localhost:3000` — dados do Sanity em tempo real, sem cache.

### 2. Enviar alterações pro site (deploy)

```bash
git add .
git commit -m "feat: o que foi feito"
git push origin master
```

Pronto. A Vercel detecta o push e faz o build automaticamente.

### 3. Verificar o que mudou

```bash
git status          # Quais arquivos foram alterados
git diff            # O que mudou dentro dos arquivos
git log --oneline -5 # Últimos 5 commits
```

### 4. Verificar se há commits não enviados

```bash
git status -sb
```

Se mostrar `ahead 3` → tem 3 commits esperando pra ser enviados. Faça `git push`.

---

## Checar antes de enviar

```bash
npm run typecheck    # Verifica erros de TypeScript
npm run lint         # Verifica erros de estilo (ESLint)
npm run build        # Build completo (mesmo que a Vercel faz)
```

Se `npm run build` passar sem erros, o deploy na Vercel vai funcionar.

---

## Sanity Studio (gerenciar produtos)

### Abrir o Studio local

```bash
npx sanity@latest dev
```

Abre `http://localhost:3333` — interface visual pra editar produtos, categorias, etc.

### Deploy do schema (quando o schema é alterado)

```bash
npx sanity@latest schema deploy
```

Precisa estar logado no Sanity. Roda uma vez quando o schema muda.

---

## Scripts de migração (uso raro)

Todos ficam em `scripts/`. Rodar com:

```bash
set -a && source .env.local && set +a && npx tsx scripts/<nome>.ts
```

| Script | Quando usar |
|---|---|
| `init-product-order.ts` | Ordenar produtos alfabeticamente |
| `migrate-products-to-sanity.ts` | Importar produtos do CSV legado |
| `fix-product-categories.ts` | Corrigir categorias de produtos |

---

## Referência rápida

### Variáveis de ambiente (`.env.local`)

```
NEXT_PUBLIC_SANITY_PROJECT_ID=5fcrgo8n
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=sk...
```

### URLs

| Ambiente | URL |
|---|---|
| Local | `http://localhost:3000` |
| Produção | `https://comali.com.br` |
| Staging | `https://comali-com-br.vercel.app` |
| Sanity Studio | `http://localhost:3333` |

### Fluxo de deploy

```
git push origin master
        ↓
Vercel detecta o push
        ↓
Build (~2-4 min)
        ↓
Site atualizado em comali.com.br
```

**Não existe botão de deploy na Vercel.** É automático.

---

## Troubleshooting

### Mudanças no Sanity não aparecem no site

1. Campo foi **Publicado** no Studio? (não só salvo)
2. Push foi feito? (`git status -sb` → `ahead 0`)
3. Aguardou ~2-4 min?
4. Ctrl+Shift+R no navegador?

### Produto "draft" aparece no site

- Abrir o produto no Studio
- Campo **Status** → selecionar "Rascunho"
- Clicar em **Publish**
- "Move to draft" (menu ⋮) NÃO altera o campo `status`

### localhost mostra coisa diferente do site

| Ambiente | Comportamento |
|---|---|
| `npm run dev` | Dados do Sanity em tempo real |
| Site (Vercel) | HTML estático + revalida a cada 60s |

### Build local falha

```bash
npm run typecheck    # Erros TypeScript
npm run lint         # Erros ESLint
```
