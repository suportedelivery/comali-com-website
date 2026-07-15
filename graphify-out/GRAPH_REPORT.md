# Graph Report - .  (2026-07-09)

## Corpus Check
- 146 files · ~366,820 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 464 nodes · 655 edges · 66 communities (25 shown, 41 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.85)
- Token cost: 4,242 input · 1,237 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Utilities & UI Components|Utilities & UI Components]]
- [[_COMMUNITY_Page Components|Page Components]]
- [[_COMMUNITY_Layout & Metadata|Layout & Metadata]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Catalog & Category|Catalog & Category]]
- [[_COMMUNITY_Component Aliases|Component Aliases]]
- [[_COMMUNITY_Category Page|Category Page]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Banner Ads|Banner Ads]]
- [[_COMMUNITY_Import Scripts|Import Scripts]]
- [[_COMMUNITY_Product Images - Contentor|Product Images - Contentor]]
- [[_COMMUNITY_Product Images - Accessory|Product Images - Accessory]]
- [[_COMMUNITY_Sanity CMS Schema|Sanity CMS Schema]]
- [[_COMMUNITY_Vercel Config|Vercel Config]]
- [[_COMMUNITY_Brand Logos|Brand Logos]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 82 edges
2. `getWhatsAppUrl()` - 16 edges
3. `compilerOptions` - 16 edges
4. `Button()` - 15 edges
5. `siteConfig` - 12 edges
6. `Comali Coleta Seletiva Banner` - 9 edges
7. `Contentor 240L - Waste Container` - 8 edges
8. `ProductCard()` - 7 edges
9. `getAllCategories()` - 7 edges
10. `tailwind` - 6 edges

## Surprising Connections (you probably didn't know these)
- `ProductPage()` --calls--> `getWhatsAppUrl()`  [INFERRED]
  src/app/produtos/[categoria]/[slug]/page.tsx → src/lib/whatsapp.ts
- `BreadcrumbEllipsis()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/breadcrumb.tsx → src/lib/utils.ts
- `CardHeader()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/card.tsx → src/lib/utils.ts
- `CardTitle()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/card.tsx → src/lib/utils.ts
- `CardDescription()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/card.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Logo Brand Elements** — public__logo, public__suporte_delivery, public__power_button_icon [EXTRACTED 1.00]

## Communities (66 total, 41 thin omitted)

### Community 0 - "Utilities & UI Components"
Cohesion: 0.05
Nodes (48): cn(), Badge(), badgeVariants, Checkbox(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader() (+40 more)

### Community 1 - "Page Components"
Cohesion: 0.07
Nodes (37): Home(), BuscaPage(), BuscaPageProps, ContactForm(), WhatsAppButton(), ContatoPage(), metadata, filterProductsByCategory() (+29 more)

### Community 2 - "Layout & Metadata"
Cohesion: 0.08
Nodes (20): inter, metadata, Footer(), Header(), CategoryProduct, MegaMenu(), MegaMenuProps, NavCategory (+12 more)

### Community 3 - "Package Dependencies"
Cohesion: 0.06
Nodes (35): dependencies, @base-ui/react, class-variance-authority, clsx, lucide-react, next, next-sanity, react (+27 more)

### Community 4 - "Catalog & Category"
Cohesion: 0.11
Nodes (20): CategoryGrid(), iconMap, environments, EnvironmentsSection(), getAllBrands(), getAllCategories(), getAllProducts(), getProductBySlug() (+12 more)

### Community 5 - "Component Aliases"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 6 - "Category Page"
Cohesion: 0.18
Nodes (16): NotFound(), CategoryPage(), CategoryPageProps, generateMetadata(), generateStaticParams(), getAllCategories(), getProductsByCategory(), ProductPage() (+8 more)

### Community 7 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 8 - "Banner Ads"
Cohesion: 0.20
Nodes (10): Comali Coleta Seletiva Banner, Comali brand logo, White General Waste Bin (Lixo), Yellow Metal Recycling Bin, Brown Organic Waste Recycling Bin (stainless steel), Blue Paper Recycling Bin, Red Plastic Recycling Bin (rectangular), Red Dome-Lid Plastic Recycling Bin (stainless steel) (+2 more)

### Community 9 - "Import Scripts"
Cohesion: 0.24
Nodes (6): fs, generateSlug(), importProducts(), mapCategory(), parseCSV(), path

### Community 10 - "Product Images - Contentor"
Cohesion: 0.22
Nodes (9): Contentor 240L Product Image, 240 Liters Capacity, Waste Container Category, Green Color Option, Multiple Color Options, Contentor 240L - Waste Container, Lidded Design, Wheeled Design (+1 more)

### Community 11 - "Product Images - Accessory"
Cohesion: 0.29
Nodes (7): Porta-Rolão Inox, Bralimpia, Bathroom Accessories, Key Lock Mechanism, Paper Level Window, Stainless Steel, Toilet Paper Roll Dispenser

### Community 13 - "Vercel Config"
Cohesion: 0.33
Nodes (5): buildCommand, devCommand, framework, installCommand, $schema

### Community 14 - "Brand Logos"
Cohesion: 0.40
Nodes (5): Comali, Lixeiras em Inox banner image showing Comali brand stainless steel trash bins in various sizes against marble background, Comali Logo 192px, Comali Logo, Logo2 - Blue swoosh design element

### Community 15 - "Community 15"
Cohesion: 0.40
Nodes (4): instructions, $schema, skills, paths

### Community 16 - "Community 16"
Cohesion: 0.67
Nodes (4): Biovis Stainless Steel Hand Dryer, Biovis, Dispensers / Hand Dryers, Secador de Mãos Inox

### Community 18 - "Community 18"
Cohesion: 0.50
Nodes (4): Suporte Delivery Logo, Modern Tech Design Style, Power Button Icon, Suporte Delivery Brand

### Community 19 - "Community 19"
Cohesion: 0.50
Nodes (4): Dark Theme Design, Flow Diagram Image, Process Flow Diagram, Website Visual Asset

### Community 20 - "Community 20"
Cohesion: 0.67
Nodes (3): CSVRow, main(), parseCSV()

### Community 23 - "Community 23"
Cohesion: 0.50
Nodes (3): BlogPost, Category, Product

### Community 26 - "Community 26"
Cohesion: 1.00
Nodes (3): Suporte Delivery, Suporte Delivery Logo, Delivery Support Service

### Community 27 - "Community 27"
Cohesion: 1.00
Nodes (3): dispenser-sabonete.jpg — Product image of a Vellax Classic wall-mounted liquid soap dispenser, Vellax, Vellax Classic Wall-Mounted Liquid Soap Dispenser

### Community 30 - "Community 30"
Cohesion: 0.67
Nodes (3): Comali Logo, Blue Wave Graphic Element, Comali Wordmark

## Knowledge Gaps
- **187 isolated node(s):** `@opencode-ai/plugin`, `$schema`, `style`, `rsc`, `tsx` (+182 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Utilities & UI Components` to `Page Components`, `Layout & Metadata`, `Catalog & Category`, `Category Page`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Why does `Button()` connect `Page Components` to `Utilities & UI Components`, `Layout & Metadata`, `Category Page`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `siteConfig` connect `Layout & Metadata` to `Utilities & UI Components`, `Page Components`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `@opencode-ai/plugin`, `$schema`, `style` to the rest of the system?**
  _187 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Utilities & UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.0528169014084507 - nodes in this community are weakly interconnected._
- **Should `Page Components` be split into smaller, more focused modules?**
  _Cohesion score 0.07477288609364081 - nodes in this community are weakly interconnected._
- **Should `Layout & Metadata` be split into smaller, more focused modules?**
  _Cohesion score 0.08412698412698413 - nodes in this community are weakly interconnected._