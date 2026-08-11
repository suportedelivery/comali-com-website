# Comali.com.br - Project Context

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

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

---

## Session Log (2026-07-14) — SortOrder, WhatsApp, Export CSV

### Mudanças Feitas
1. **SortOrder importado** de `REVISÃO_CORRIGIDO - REVISÃO_CORRIGIDO.csv` (fonte canônica)
2. **Produtos draft/discontinued** receberam sortOrder 9000-9430
3. **Sanity Studio structure** criada em `src/sanity/structure.ts` — ordena produtos por `sortOrder asc`
4. **Categorias duplicadas removidas** — Papel Higiênico Rolão (20 produtos) e Teste Categoria
5. **Formato WhatsApp** alterado para rastreamento de anúncios:
   - Antes: `{title} (Ref: {reference})`
   - Agora: `{reference}: {title}`
   - Arquivos: `page.tsx:48`, `product-detail-client.tsx:50`, `product-card.tsx:80`
6. **Script export-products.py** criado — exporta 347 produtos com todos os campos
7. **PRODUTOS_COMPLETO.csv** gerado (23 colunas) — pronto para revisão/correções
8. **Marcas removidas** de WhatsApp, meta.title, meta.description em Sanity (293 produtos)
9. **Formato WhatsApp atualizado** em Sanity para `{reference}: {title}` (345 produtos)

### Arquivos Importantes
| Arquivo | Descrição |
|---------|-----------|
| `REVISÃO_CORRIGIDO - REVISÃO_CORRIGIDO.csv` | **Fonte canônica do sortOrder** |
| `REVISÃO_CORRIGIDO.csv` | Categorias corrigidas (sortOrder vazio) |
| `ordem-produtos.csv` | **NÃO USAR** — valores errados |
| `export-products.py` | Script de export CSV completo (filtra drafts) |
| `PRODUTOS_COMPLETO.csv` | Export com 347 produtos |

### Comandos
```bash
python3 export-products.py           # Gerar PRODUTOS_COMPLETO.csv
python3 -m http.server 8000          # Visualizar CSV no navegador
```

---

## Session Log (2026-08-10) — SEO URLs Hierárquicas, Slug Categoria

### Problema
Produtos listados em subcategorias (ex: `hotelaria`, `hospitalar`) geravam links com URL incorreta. Ao clicar num produto na subcategoria, a URL levava para `/produtos/produtos-quimicos-concentrados/produto` em vez de `/produtos/produtos-quimicos-concentrados/hotelaria/produto`.

Além disso, a página `/produtos/produtos-quimicos-concentrados/frigorifico-abastecimento` retornava 404.

### Causa Raiz — Bug ProductCard

Em `src/components/product/product-card.tsx`, o código tentava acessar `c.parentCategory?.slug?.current`, mas na projeção GROQ de `sanity-products.ts`, o campo `parentCategory.slug` já é uma **string plana** (`"slug": slug.current`), não um objeto `{ current: string }`. Logo, `.current` retornava `undefined` e o `parentSlug` nunca resolvia.

### Causa Raiz — Slug com Duplo Hífen

A categoria "Frigorífico / abastecimento" teve a barra `/` convertida em `--` na geração automática do slug → `frigorifico--abastecimento`. A URL acessada usava hífen simples (`frigorifico-abastecimento`) que não existia.

### Correções Feitas

1. **`src/components/product/product-card.tsx`** — adicionados helpers `getCatSlug()` e `getParentSlug()` que lidam com `slug` tanto como string plana quanto como objeto `{ current }`:
   ```ts
   const getCatSlug = (c) => c?.slug?.current || c?.slug || ""
   const getParentSlug = (c) => {
     const pc = c?.parentCategory
     if (!pc) return undefined
     return typeof pc.slug === "string" ? pc.slug : pc.slug?.current
   }
   ```

2. **Sanity — categoria `frigorifico--abastecimento`** — slug corrigido para `frigorifico-abastecimento` via MCP patch + publish.

### Regra para o Futuro

- Projeções GROQ com `"campo": referencia->campo.current` retornam **string plana**, não objeto
- Nunca acessar `.current` em campo já projetado como string
- Slugs com caracteres especiais (`/`, `&`, etc.) no título geram `--` no slug automático — revisar manualmente após importação

### Arquivos Alterados
- `src/components/product/product-card.tsx` — corrigida resolução de `parentSlug`

### Comandos de Deploy
```bash
# Verificar tipos antes de enviar
npm run typecheck

# Enviar para produção (Vercel auto-deploy via master)
git add -A && git commit -m "mensagem" && git push origin master

# Acompanhar o deploy
# https://vercel.com/comali/comali-com-br
```

---

## Session Log (2026-08-11) — Fix Product Duplication in Subcategories

### Problema
Ao passar o mouse sobre produtos na categoria "produtos-quimicos-concentrados", os produtos estavam sendo duplicados visualmente. Ao navegar entre categorias (ex: Lixeiras e Contentores), os produtos duplicados apareciam também nas outras categorias. O problema ocorria apenas com hover (sem clicar), e cada vez que passava o mouse, duplicava ainda mais.

### Causa Raiz (2 problemas encontrados)

1. **Client Component desnecessário** (tentativa inicial de correção)
   - O componente `ProductCard` estava marcado como `"use client"` sem necessidade
   - Havia manipulação direta do DOM no handler `onError` da tag `<img>`
   - Isso foi corrigido mas NÃO resolveu o problema principal

2. **Produtos duplicados no Sanity** (causa real)
   - Existem produtos com **mesmo título mas IDs diferentes** no Sanity
   - Exemplos encontrados:
     - "1000 PLUS SEM FRAGRANCIA" → 3 IDs diferentes (c1p537, c3p537, c6p537)
     - "1000 PLUS TRADICIONAL" → 3 IDs diferentes (c1p534, c6p534, c7p534)
     - "ALCOOL GEL 70% BB" → 4 IDs diferentes
   - Todos com `sortOrder: 500` (valor padrão)
   - Cada produto está em 2 categorias simultaneamente:
     - Categoria PAI: "Produtos Químicos Concentrados"
     - Subcategoria: "Hotelaria", "Food Service", etc.
   - O código deduplicava por `_id`, mas não por `título`
   - Resultado: múltiplas versões do mesmo produto apareciam na página

### Correções Feitas

1. **Removido `"use client"` do ProductCard** (`src/components/product/product-card.tsx`)
   - Commit `3f197c6`
   - Não resolveu o problema principal, mas melhora a performance

2. **Adicionada deduplicação por título** (`src/app/produtos/[...slug]/page.tsx`)
   - Commit `89f9bdd`
   - Antes: `if (seenIds.has(p._id)) return false`
   - Agora: deduplica por ID **E** por título (normalizado em lowercase)
   - Cria `seenTitles = new Set<string>()` para rastrear títulos já vistos
   - Remove produtos com mesmo título, mesmo que tenham IDs diferentes

### Arquivos Alterados
- `src/components/product/product-card.tsx` — removido `"use client"` e `onError`
- `src/app/produtos/[...slug]/page.tsx` — deduplicação por título

### Commits
- `3f197c6` — "Fix: Remove 'use client' e onError do ProductCard para evitar duplicação de produtos no hover"
- `89f9bdd` — "Fix: Deduplicação por título além de ID para evitar produtos duplicados"

### Deploy
- Push para `master` → Vercel auto-deploy
- URL: https://comali.com.br e https://comali-com-br.vercel.app

### Problema de Dados no Sanity
**IMPORTANTE:** O Sanity contém produtos duplicados que precisam ser limpos:
- Buscar todos os produtos com `sortOrder: 500` que têm títulos duplicados
- Decidir qual versão manter (provavelmente a com referência correta)
- Deletar as duplicatas
- Atualizar `sortOrder` dos produtos restantes conforme `REVISÃO_CORRIGIDO.csv`

### Regra para o Futuro
- Deduplicar por título + ID ao listar produtos (proteção contra duplicatas)
- Limpar produtos duplicados no Sanity antes de importar novos lotes
- Validar `sortOrder` ao importar (nunca deixar todos em 500)
- Só usar `"use client"` quando realmente necessário

### Problema Resolvido — Renumeração sortOrder dos product-da-*
Os 183 produtos `product-da-*` (inseridos APÓS as revisões CSV, sem catalogação de sortOrder) estavam todos com `sortOrder: 500`, o que causava empate na ordenação (`order(sortOrder asc, title asc)` não tinha critério de desempate entre eles).

**Solução:** script `renumber-sortorder-500.py` atribuiu sequência única (9500 → 9682) ordenada por título, começando acima do maior sortOrder existente (9430 dos drafts) para não colidir.

```bash
python3 renumber-sortorder-500.py --dry-run   # ver plano
python3 renumber-sortorder-500.py --apply     # aplicar no Sanity
```

**Resultado:** 0 produtos ativos com `sortOrder: 500`; 183 renumerados (9500–9682).

### Regra Adicional
- Ao importar novos lotes de produtos fora do fluxo das revisões CSV, sempre atribuir `sortOrder` (ou renumeração sequencial no final) — nunca deixar em 500 (default)
- `product-da-*` = produtos químicos concentrados importados depois das revisões CSV

---

## Google Ads — Workflow de Importação

### Estrutura do Gerador (`gerar-csv-template.py`)
Para evitar erros e avisos de validação no Google Ads Editor (como problemas de idioma pai ou ausência de lances padrão), o gerador cria o CSV em um formato **hierárquico por linhas**:
1. **Linhas de Campanha**: Definem os campos da campanha (nome, orçamento, redes, idioma `pt`, etc.). Todos os campos de grupos de anúncios, palavras-chave e anúncios ficam vazios nestas linhas.
2. **Linhas de Grupo de Anúncios**: Definem o grupo de anúncios e o lance padrão `Max CPC` (definido como `8.00`). Os campos de campanhas e anúncios ficam vazios nestas linhas.
3. **Linhas de Palavras-Chave**: Definem os termos das palavras-chave e o tipo de correspondência.
4. **Linhas de Anúncio**: Definem os anúncios Responsivos de Pesquisa (títulos, descrições, URL final e caminhos).

### Regras de Validação e Limites
- **Títulos (Headlines)**: Máximo de 30 caracteres.
- **Descrições (Descriptions)**: Máximo de 90 caracteres.
- **Caminhos (Paths)**: Máximo de 15 caracteres.
- **Estratégia de Lances**: "Maximize clicks" (Maximizar cliques) para suportar limites de lances.
- **Campos Duplicados**: Não incluir a coluna `Keyword Type` para evitar duplicidade de mapeamento com `Match Type`.

### Como Gerar e Importar
1. **Gerar o arquivo**:
   ```bash
   python3 gerar-csv-template.py
   ```
2. **Verificar a saída**:
   O script roda um validador automático no final. Certifique-se de ver a mensagem:
   `SUCCESS: All generated rows passed Google Ads validations successfully!`
3. **Subir no Google Ads Editor**:
   - Vá em **Conta > Importar > Do arquivo...** (`Account > Import > From File...`).
   - Selecione o arquivo gerado: `campanhas-novas-gads.csv`.
   - Se houver algum erro de importação residual por conta de importações anteriores quebradas salvas na memória local, selecione as campanhas com erro no menu esquerdo, clique com o botão direito, escolha **Reverter** para limpar o cache local, e re-importe o arquivo.
4. **Resultado**: O arquivo é gerado em codificação `UTF-16LE` com `BOM` e quebras de linha `CRLF` (padrão nativo do Google Ads Editor).

---

## Session Log (2026-08-11) — Fix Descrições Produtos Químicos D&A

### Problema
Os 183 produtos `product-da-*` (químicos D&A) tinham a seção "Indicação" do `descriptionHTML` com bullets extras incorretos ("Todos tipos de superfícies e pisos laváveis", "Limpeza manual de utensílios", "Panelas", "Vidros", "Talheres") que vinham de um **placeholder comentado** no HTML do site D&A (`<!-- <ul>... -->`). Em 16 produtos faltavam bullets legítimos (ex: INTER PLUS, SANYX, ALUMEX). Além disso, a seção "Apresentação" deveria ser removida (decisão comercial).

### Causa Raiz
O site `deaquimica.com.br` carrega cada produto em um `<div class="modal">` com duas listas de indicação: a **ul real** (correta) e uma **ul comentada** (placeholder do template Thymeleaf). O scraper anterior capturou o conteúdo do comentário como indicação real, adicionando bullets genéricos em todos os produtos.

### Correção Feita
1. **Baixado HTML completo** de `https://www.deaquimica.com.br/` (777KB, 183 modals)
2. **Extraído canônico** com BeautifulSoup (`da_produtos_canonico.json`): descrição, Indicação, Fragrância, Cor, Diluição, Apresentação, Documentos Técnicos
3. **Script `fix-da-descriptions.py`**:
   - Substitui a lista de Indicação **inteira** pelos bullets canônicos (corrige tanto os extras quanto os faltantes)
   - Remove a seção Apresentação (`<h3>Apresentação</h3>` + `<ul>`)
   - Preserva parágrafo, Fragrância/Cor/Diluição e Documentos Técnicos
4. **Aplicado** 183 patches no Sanity (8 lotes de 25) — 183/183 ok
5. **Verificado** no Sanity: BLOCK 50, FLASH COMBAT, INTER PLUS com indicações corretas

### Regras para o Futuro
- HTML comentado (`<!-- ... -->`) **nunca** deve ser usado como fonte de dados — remover comentários antes de parsear (`re.sub(r'<!--.*?-->', '', html)`)
- Usar BeautifulSoup em vez de regex para extrair seções de HTML malformado (o site D&A fecha `<p>` com `</div>`)
- Ao scraper produtos, sempre comparar com fonte canônica antes de aplicar em lote

### Arquivos
- `fix-da-descriptions.py` — script de correção (--dry-run / --apply)
- `da_produtos_canonico.json` — dados canônicos extraídos do site D&A
- `da_sanity_atuais.json` — snapshot dos dados antes da correção

### Comandos
```bash
python3 fix-da-descriptions.py --dry-run   # ver plano
python3 fix-da-descriptions.py --apply     # aplicar no Sanity
```

---

## Sessão e Memória

### Inicializar ruflo (primeira vez no projeto):
```
ruflo init
ruflo memory init
```

### Ao iniciar sessão:
```
ruflo hooks session-restore
```

### Ao encerrar sessão:
```
ruflo hooks session-end
```

### Para salvar dados pontuais:
```
ruflo memory store -k "chave" --value "conteúdo"
```

### Para buscar dados salvos:
```
ruflo memory search -q "busca"
```

### Alias rápido (colocar no ~/.bashrc):
```bash
alias comali='cd /media/sdcloud/AppleSSD/Opencode/comali.com.br && ruflo hooks session-restore'
```

Depois de adicionar ao `~/.bashrc`, use `source ~/.bashrc` e pronto — só digitar `comali` no terminal.
