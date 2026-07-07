# Comandos — Comali.com.br

Referência rápida de todos os comandos do projeto.

---

## 1. Next.js (npm run)

```bash
npm run dev          # Servidor de desenvolvimento (localhost:3000)
npm run build        # Build de produção
npm run start        # Inicia servidor de produção (após build)
npm run lint         # ESLint
npm run typecheck    # Verificação TypeScript (tsc --noEmit)
```

---

## 2. Git

```bash
git status                # Ver arquivos modificados
git diff                  # Ver alterações pendentes
git log --oneline -10     # Últimos 10 commits
git add .                 # Adiciona todos os arquivos
git add <arquivo>         # Adiciona arquivo específico
git commit -m "msg"       # Cria commit
git push origin master    # Envia para GitHub (dispara deploy na Vercel)
git pull origin master    # Puxa alterações do repositório
```

**Fluxo padrão (deploy):**
```bash
git add . && git commit -m "feat: descrição" && git push origin master
```

**Verificar se há commits não enviados:**
```bash
git status -sb   # Mostra "ahead N" se houver commits pendentes
```

---

## 3. Scripts de Migração Sanity

Todos ficam em `scripts/`. Executar com:
```bash
set -a && source .env.local && set +a && npx tsx scripts/<nome>.ts
```

| Script | Função |
|---|---|
| `migrate-products-to-sanity.ts` | Importa produtos do CSV legado para Sanity |
| `migrate-remaining-products.ts` | Importa produtos restantes não migrados |
| `migrate-categories-to-sanity.ts` | Importa categorias do CSV para Sanity |
| `migrate-html-descriptions.ts` | Migra descrições HTML para Sanity |
| `fix-product-categories.ts` | Corrige categorias de produtos no Sanity |
| `fix-description-colors.ts` | Corrige cores nas descrições |
| `add-image-urls.ts` | Adiciona URLs de imagens externas |
| `clear-prices.ts` | Limpa preços (define como null) |

---

## 4. Sanity Studio

```bash
npx sanity@latest dev              # Abre Studio local (localhost:3333)
npx sanity@latest schema deploy    # Deploy schema alterado
npx sanity@latest dataset create   # Cria novo dataset
```

**Variáveis necessárias (já no `.env.local`):**
```
NEXT_PUBLIC_SANITY_PROJECT_ID=5fcrgo8n
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=sk...
```

---

## 5. Vercel / Deploy

### Deploy Automático
- Toda alteração em `master` (push) dispara build automático na Vercel
- Build leva ~2-4 minutos
- Staging: `https://comali-com-br.vercel.app`
- Produção: `https://comali.com.br`

### Variáveis de Ambiente (Vercel)
```
NEXT_PUBLIC_SANITY_PROJECT_ID=5fcrgo8n
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=sk...
```

### ISR (Incremental Static Regeneration)
Páginas com `export const revalidate = 60` re-buscam dados do Sanity a cada 60 segundos.

```typescript
// Em qualquer page.tsx:
export const revalidate = 60
```

### Domínio
- Domínio: `comali.com.br` (registro.br)
- Apontamento: A `76.76.21.21` (Vercel)
- Redirect: `www.comali.com.br` → `comali.com.br` (301)

### Sanity Client Config
```typescript
// src/lib/sanity.ts
useCdn: false  // Dados sempre frescos (sem cache do Sanity CDN)
```

---

## 6. Troubleshooting

### Mudanças no Sanity não aparecem no site

**Checklist:**
1. Verificar se o campo foi **Publicado** no Sanity Studio (não só salvo)
2. Rodar `git status` — se mostrar `ahead > 0`, fazer push
3. Aguardar ~2-4 min para build da Vercel
4. Fazer **Ctrl+Shift+R** no navegador (hard refresh)
5. Verificar build: `npm run build` local deve passar sem erros

### Produtos "draft" aparecem no site

As queries GROQ filtram `status == "active"`. Se um produto draft aparece:
- Verificar se o campo `Status` está realmente como "Rascunho" (não "Ativo")
- No Sanity Studio, abrir o produto → campo Status → selecionar "Rascunho" → **Publish**
- "Move to draft" (menu ⋮) **NÃO** altera o campo `status` — só move pra draft do Studio

### Cache em memória (NUNCA fazer)

```typescript
// ERRADO — cache global em módulo Server Component
let cachedData = null
let loaded = false
async function getData() {
  if (loaded) return cachedData  // ← DADOS ANTIGOS!
  cachedData = await fetch(...)
  loaded = true
  return cachedData
}

// CORRETO — sempre buscar dados frescos
async function getData() {
  return await fetch(...)
}
```

### Diferença localhost vs Produção

| Ambiente | Fonte dos dados | Cache |
|---|---|---|
| `npm run dev` (localhost) | Sanity API (tempo real) | Nenhum |
| Vercel (produção) | Sanity API via build + ISR | HTML estático + revalidate=60s |

### Sanity CDN vs API direta

| Config | Comportamento |
|---|---|
| `useCdn: true` | Cache do Sanity CDN (~60s+) — pode servir dados antigos |
| `useCdn: false` | API direta — dados sempre frescos (recomendado) |

### Build local falha

```bash
npm run typecheck    # Verificar erros TypeScript
npm run lint         # Verificar erros ESLint
npm run build        # Build completo
```

### Vercel não deploya

1. Verificar se o push foi feito: `git status -sb`
2. Verificar se há erros de build no dashboard da Vercel
3. Verificar se as variáveis de ambiente estão configuradas na Vercel
