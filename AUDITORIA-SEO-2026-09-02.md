# SEO Audit — comali.com.br

**Data:** 2026-09-02  
**URL:** https://comali.com.br  
**Tipo:** E-commerce B2B (catálogo de produtos de limpeza profissional, conversão via WhatsApp)  
**Páginas no site:** ~449 (404 produtos + 12 categorias + 28 subcategorias + páginas estáticas)  
**Páginas no sitemap:** **43** ← gap enorme  
**Stack:** Next.js 16 (App Router, RSC) + Sanity CMS + Tailwind 4 + shadcn/ui

---

## Resumo Executivo

| Categoria | Score | Comentário |
|---|---|---|
| **Crawlability** | 🟡 Médio | Sitemap com 43 URLs vs 449 existentes — Google não enxerga ~90% do conteúdo |
| **Indexação** | 🟡 Médio | Robots OK, mas canonical ausente em todas as páginas |
| **Performance** | 🟢 Bom | TTFB 10ms, Load 1.9s — Vercel edge funcionando |
| **Mobile-First** | 🟢 Bom | Viewport correto, lang=pt-BR |
| **On-Page Tags** | 🔴 Crítico | OG tags globais em TODAS as páginas (deveriam ser per-page); titles sem otimização |
| **Structured Data** | 🔴 Crítico | **0 JSON-LD** — sem Product, Organization, BreadcrumbList, FAQPage |
| **Acessibilidade** | 🟡 Médio | Imagens com alt, mas heading hierarchy irregular |
| **Conteúdo** | 🟡 Médio | Title do produto "Lixeira 15 litros com pedal em inox ESCOVADO - Marca" tem "Marca" herdado da Tray |

---

## 🚨 Problemas Críticos (bloqueiam ranking)

### 1. Sitemap não inclui 90% do site (449 → 43 URLs)
- **Arquivo:** `src/app/sitemap.ts`
- **Impacto:** Google pode indexar as URLs por descoberta de link interno, mas perde o sinal de "prioridade + changeFrequency" para todas as 400+ páginas de produto.
- **Fix:** Adicionar `getAllProducts()` (ou paginação) ao sitemap e gerar uma URL por produto:
  ```tsx
  const products = await getAllProducts()
  const productPages = products.map(p => ({
    url: `${siteConfig.url}/produtos/${p.categorySlug}/${p.slug}`,
    lastModified: p._updatedAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))
  return [...staticPages, ...categoryPages, ...productPages]
  ```
- **Status:** Não corrigido nesta sessão (escopo era só GTM)

### 2. Zero Schema.org (JSON-LD)
- **Impacto:** Sem rich snippets no Google — perde estrelas, preço, FAQ accordion, breadcrumb visual. Clicagem cai 5-15%.
- **Fix (por página):**
 - **Home + Sobre:** `Organization` schema (logo, contato, redes sociais)
 - **Página de produto:** `Product` schema (name, image, description, sku, brand)
 - **Página de produto:** `BreadcrumbList` schema
 - **Todas as páginas com FAQ:** `FAQPage` schema
- **Status:** Não corrigido. Plugin Next.js recomendado: `next-seo` ou Schema manual via `<script type="application/ld+json">`

### 3. Open Graph tags globais (não per-page)
- **Evidência:** página `/produtos/lixeiras-e-contentores/lixeira-15-litros...` mostra:
  - `og:title = "Comali - Produtos de Limpeza Profissional"` (deveria ser o nome do produto)
  - `og:description = "Produtos de higienização comercial..."` (deveria ser descrição do produto)
  - `og:url = "https://comali.com.br"` (deveria ser URL específica)
  - `og:type = "website"` (deveria ser `product` em páginas de produto)
  - `og:image = (vazio)` ← grave para WhatsApp/Facebook shares
- **Causa:** `src/app/layout.tsx` define OG globalmente no `metadata` — não é sobrescrito pelas páginas filhas.
- **Fix:** Cada `page.tsx` deve exportar `metadata` próprio com `openGraph` específico. Ver `src/app/produtos/[...slug]/page.tsx` — provavelmente só define `title`/`description`.
- **Status:** Não corrigido

### 4. Canonical ausente em TODAS as páginas
- **Evidência:** curl retornou `canonical: ''` para todas as 9 páginas testadas.
- **Impacto:** Google pode indexar URLs com parâmetros (?utm_source=...) como duplicatas, diluindo PageRank.
- **Fix:** Adicionar `metadataBase` no root `layout.tsx` + `alternates: { canonical: '/' }` por página.
- **Status:** Não corrigido

---

## ⚠️ Problemas de Importância Média

### 5. Meta description >160 chars em páginas de produto
- **Evidência:** Página de produto: **748 caracteres** (Google corta em ~160).
- **Fix:** Truncar para 155-160 chars no Sanity ou via `description.slice(0, 155) + '...'`.

### 6. Título da política de privacidade duplica marca
- **Evidência:** `<title>Política de Privacidade | Comali | Comali</title>`
- **Causa:** Provavelmente template `%s | ${siteConfig.name}` está sendo aplicado sobre um metadata que já tem `siteConfig.name`.
- **Fix:** No `src/app/politica-de-privacidade/page.tsx`, mudar `title` para `'Política de Privacidade'` (sem "Comali") e deixar o template adicionar.

### 7. Título "Marca" no final de produtos herdados da Tray
- **Evidência:** `Lixeira 15 litros com pedal em inox ESCOVADO - **Marca**` (era "Marca BIOVIS", removido mas sobrou "Marca").
- **Fix:** Atualizar títulos no Sanity (regex: `- Marca$` → `''`).

### 8. Heading hierarchy irregular
- Home tem 3 H1s (`Lixeiras em Inox`, `Coleta Seletiva`, `Nossa Linha Completa`). Deveria ser **1 só H1** + demais H2.
- Fix: Trocar `<h1>` por `<h2>` ou `<h3>` nas seções secundárias.

### 9. Categoria "sobre" sem H1
- **Evidência:** `<H1: []>` na página /sobre
- **Impacto:** SEO menor, mas acessibilidade ruim (leitor de tela fica perdido).
- **Fix:** Adicionar `<h1>` na primeira seção.

### 10. Blog sem posts?
- **Evidência:** Página `/blog` retorna 200, mas só 1 H3 e 2 imagens — pode estar vazio.
- **Verificar:** se blog é categoria vazia, desabilitar link ou popular com conteúdo.

---

## 🟢 O que está BOM (manter)

- ✅ **HTTPS** com SSL válido (Vercel automático)
- ✅ **TTFB 10ms** (Vercel edge)
- ✅ **Load 1.9s** — abaixo do limite de 2.5s do Google
- ✅ **lang="pt-BR"** correto
- ✅ **Viewport** configurado
- ✅ **Mobile responsive** (Tailwind 4)
- ✅ **Open Graph base** presente (site_name, locale, og:type website)
- ✅ **Twitter card** configurado
- ✅ **Imagens com alt text** em 100% das imagens verificadas
- ✅ **Robots.txt** correto (allow / + disallow /area-do-cliente)
- ✅ **sitemap.xml** válido e referenciado no robots.txt
- ✅ **Política de privacidade** presente
- ✅ **Meta keywords** declarado (sinal fraco mas OK)

---

## Plano de Ação Priorizado

### P0 — Fazer AGORA (impacto alto, esforço baixo)
1. **Adicionar produtos ao sitemap** (1h de trabalho) — gera 400+ URLs indexáveis
2. **Adicionar JSON-LD Organization no layout** (30 min) — mínimo de structured data
3. **Adicionar canonical por página** (1h) — declarar `metadataBase` no layout + per-page

### P1 — Fazer essa semana (impacto médio, esforço médio)
4. **OG tags per-page** — reescrever `metadata` em `[...slug]/page.tsx` com og:title/description/image específicos
5. **JSON-LD Product em páginas de produto** — gera rich snippets
6. **JSON-LD BreadcrumbList** — navegação aparece em SERP
7. **Corrigir "Marca" nos títulos de produtos** (regex no Sanity)

### P2 — Fazer nas próximas sprints
8. **Heading hierarchy** (1 H1 por página)
9. **Truncar meta descriptions** para 160 chars
10. **FAQPage schema** se houver FAQ
11. **Testar PageSpeed Insights** quando quota resetar (Core Web Vitals formais)

---

## Métricas para monitorar pós-fix

| Métrica | Onde medir | Meta |
|---|---|---|
| URLs indexadas | `site:comali.com.br` no Google | >400 (atual estimado <50) |
| Cobertura sitemap | Search Console → Sitemaps | 100% submitted, <5% errors |
| Rich snippets | Google Search (visual) | Estrelas em produtos |
| CTR orgânico | Search Console → Performance | >3% (média B2B: 2-4%) |
| Position média | Search Console → Performance | <20 para top keywords |
| Core Web Vitals | Search Console → Experience | 75% URLs "Good" |

---

## Detalhes técnicos medidos

### Performance (home, mobile, Vercel edge)
- TTFB: **10 ms**
- DOMContentLoaded: **689 ms**
- Load: **1916 ms** (1.9s)
- DOM nodes: 1152

### Por página (curl, sem cache)

| Página | Title (chars) | Meta desc (chars) | H1 | JSON-LD | Canonical | OG title per-page? |
|---|---|---|---|---|---|---|
| `/` | 41 ✅ | 167 ⚠️ | 3 ❌ | 0 ❌ | ❌ | N/A |
| `/produtos` | 17 ⚠️ | 102 ✅ | 1 ✅ | 0 ❌ | ❌ | N/A |
| `/produtos/lixeiras-e-contentores` | 31 ✅ | 44 ❌ | 1 ✅ | 0 ❌ | ❌ | N/A |
| `/produtos/dispensers` | 19 ⚠️ | 32 ❌ | 1 ✅ | 0 ❌ | ❌ | N/A |
| `/produtos/lixeiras.../lixeira-15...` | 61 ✅ | **748** ❌❌ | 1 ✅ | 0 ❌ | ❌ | ❌ (mostra global) |
| `/contato` | 16 ⚠️ | 74 ⚠️ | 1 ✅ | 0 ❌ | ❌ | N/A |
| `/sobre` | 14 ⚠️ | 82 ✅ | **0** ❌ | 0 ❌ | ❌ | N/A |
| `/blog` | 13 ⚠️ | 79 ✅ | 1 ✅ | 0 ❌ | ❌ | N/A |
| `/politica-de-privacidade` | **41** ❌ (duas marcas) | 127 ✅ | 1 ✅ | 0 ❌ | ❌ | N/A |

### Palavras-chave encontradas na página de produto (corpus)
- `lixeira`: 98x
- `dispenser`: 36x
- `comali`: 26x
- `aço inox`: 12x
- `comercial`: 6x
- `profissional`: 6x
- `coleta seletiva`: 2x
- `hospitalar`: 2x
- `carrinho`: 2x
- `orçamento`: 3x

**Densidade alta de "lixeira"** mas densidade baixa de long-tails comerciais ("lixeira inox hospitalar 15L", "dispenser sabonete comercial"). Falta keyword targeting por produto.

---

**Gerado por:** Hermes Agent + skill seo-audit  
**Próxima ação recomendada:** começar por P0 (sitemap + JSON-LD Organization + canonical)