# Comali.com.br - Project Context

## Decision Log (2026-06-19)

### Project Background
- **Previous platform**: Tray e-commerce (deactivated)
- **Business**: B2B cleaning products reseller
- **Products**: Dispensers (liquid soap, hand sanitizer), trash bins (all sizes), cleaning carts, accessories
- **Target clients**: Schools, shopping malls, gyms, clinics, hospitals, retail chains, restaurants

### Tech Stack Decisions
- **Framework**: Next.js 16 (App Router, React Server Components)
- **Styling**: Tailwind CSS 4 + shadcn/ui (base-ui)
- **CMS**: Sanity (free tier) - client configured, awaiting project ID
- **Deployment**: Vercel (free tier) or VPS
- **Images**: Next/Image + Cloudinary (free tier)
- **Analytics**: Plausible or Umami (privacy-first)
- **WhatsApp**: Direct API link (wa.me)
- **Auth**: NextAuth.js / Auth.js
- **Database**: PostgreSQL (Supabase free tier or self-hosted)

### Key Requirements
- Product showcase (NOT e-commerce, no cart/checkout)
- WhatsApp as primary conversion channel
- Product catalog with filters
- Blog/content system
- Client area (login, favorites, inquiry history)
- High performance (Lighthouse 95+)
- SEO optimized (JSON-LD, sitemap, Open Graph)
- Mobile-first responsive design
- B2B-focused UX

### Page Structure
```
/                          Home
/produtos                  Product catalog
/produtos/[categoria]      Category page
/produtos/[categoria]/[slug]  Product detail
/sobre                     About
/blog                      Blog listing
/blog/[slug]               Blog post
/contato                   Contact + WhatsApp
/area-do-cliente           Client area
```

## Session Log (2026-06-27) — Menu, URLs, Variações, Domínio, Marcas, Slugs, Google Ads

### Changes Made
1. **Voltou header/footer/sitemap a usar `config.ts`** (removeu Sanity query pro menu)
2. **Removeu URLs das descrições** de 309 produtos via script Sanity API
3. **Importou variações de cor** do JSON-legado pro Sanity (86 produtos com variações, imagens por cor)
4. **Configurou domínio `comali.com.br`** no Vercel + Apontamento A `76.76.21.21` no registro.br
5. **Footer**: só categorias principais (não mais todas as subcategorias)
6. **Category-grid**: corrigido slug `produtos-quimicos-concentrados`
7. **Removeu marcas** (Bralimpia, Biovis, Contemar, etc.) de títulos (94), descrições (211) e referências (156)
8. **Adicionou prefixo CMI** nas referências de 156 produtos
9. **Gerou slugs limpos** para 320 produtos (sem marcas nas URLs)
10. **Criou estrutura Google Ads** em `google-ads-campanhas.csv` e `CAMPANHAS-GOOGLE-ADS.md`
11. **Baixou 11 imagens** de produtos em `public/images-ads/`

### Deploy
- Vercel: `comali/comali-com-br` → auto-deploy on push to `master`
- Domínio: `comali.com.br` apontando pra Vercel (A `76.76.21.21`), SSL ativo
- Staging: `https://comali-com-br.vercel.app`

### Known Issues
- Variações de cor: imagens vieram do Tray CDN (podem deixar de funcionar se Tray remover)
- Nenhuma categoria tem `parentCategory` no Sanity (exceto Variedades, Disp Inox, Disp Plástico, Disp Copos)
- Slugs de produtos foram alterados — URLs antigas (com marcas) não funcionam mais

### Google Ads Structure
- **Campanha 1**: Lixeiras e Contentores (R$50/dia)
- **Campanha 2**: Dispensers Banheiros (R$40/dia)
- **Total**: R$90/dia (R$1.800/mês)
- **Segmentação**: SP, PR, SC, RS — Seg-Sex 9h-17h
- **CSV**: `google-ads-campanhas.csv` (pra importar no Google Ads Editor)
- **Detalhes**: `CAMPANHAS-GOOGLE-ADS.md`

### Commands
```bash
npm run dev          # Dev server
npm run build        # Build
npm run typecheck    # TSC
```

## Session Log (2027-07-07) — Caching, ISR, Sanity CDN

### Problema
Produtos colocados como "draft" no Sanity Studio continuavam aparecendo no site. Produtos que tiveram categorias alteradas no Sanity continuavam na categoria antiga. Mudanças no Sanity não refletiam no site da Vercel.

### Causa Raiz (3 camadas de cache)

1. **Cache em memória no servidor** (`src/lib/products.ts`):
   - Variáveis `cachedProducts` e `productsLoaded` faziam cache global em módulo
   - Na Vercel, a instância da função serverless ficava viva por ~30s-5min
   - Toda requisição dentro desse período retornava dados antigos
   - **Afetava**: `getAllProducts()` e `getAllCategories()` (home, catálogo)

2. **Sanity CDN** (`src/lib/sanity.ts`):
   - `useCdn: true` ativava cache do Sanity CDN (60s+)
   - Mesmo com dados frescos no Sanity, o client buscava versão cacheada

3. **Sem ISR** (nenhuma página):
   - Nenhuma página tinha `export const revalidate`
   - Páginas com `generateStaticParams()` eram estáticas para sempre
   - Dados só atualizavam no próximo `next build` (deploy)

### Diferença Crítica: localhost vs Produção
- **`npm run dev` (localhost)**: busca dados do Sanity em tempo real, sem cache
- **Vercel (produção)**: páginas são HTML estático gerado no build, com cache
- Mudanças no Sanity refletiam em `localhost` mas NÃO na Vercel

### Commits
1. `6967c8c` — removeu cache em memória + adicionou `export const revalidate = 60` em 5 páginas
2. `5aa4b1d` — desabilitou Sanity CDN (`useCdn: false`)

### Arquivos Alterados
- `src/lib/products.ts` — removido `cachedProducts` / `productsLoaded`
- `src/lib/sanity.ts` — `useCdn: true` → `useCdn: false`
- `src/app/page.tsx` — adicionado `export const revalidate = 60`
- `src/app/produtos/page.tsx` — adicionado `export const revalidate = 60`
- `src/app/produtos/[categoria]/page.tsx` — adicionado `export const revalidate = 60`
- `src/app/produtos/[categoria]/[slug]/page.tsx` — adicionado `export const revalidate = 60`

### Regra para o Futuro
- Quando mudar dados no Sanity (categorias, status, etc.), esperar até 60 segundos
- Fazer **Ctrl+Shift+R** (hard refresh) no navegador para limpar cache local
- Se não refletir, verificar se o push foi feito (`git status` → `ahead 0`)
- **NUNCA** usar cache em módulo (`let cached = ...`) em Server Components Next.js

### Queries GROQ (referência)
- `productQuery`: filtra `status == "active"` — rascunhos NÃO aparecem
- `productsByCategoryQuery`: filtra `status == "active"` + slug da categoria
- `productBySlugQuery`: NÃO filtra por status (acesso direto por slug funciona para qualquer status)
