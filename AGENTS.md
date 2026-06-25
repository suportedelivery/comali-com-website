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

### Pending Items
- [ ] User has screenshots of current Tray layout for reference
- [x] Choose between Strapi vs Sanity for CMS -> **Sanity**
- [ ] Get WhatsApp business number (currently placeholder in config)
- [ ] Get product data export from Tray
- [ ] Define brand colors from current site (currently blue/green defaults)
- [ ] Create Sanity project and get project ID
- [ ] Setup Sanity Studio schema (Product, Category, BlogPost)

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run typecheck    # TypeScript check
```

### Project Status (2026-06-19)
- [x] Scaffold Next.js project with TypeScript + Tailwind + shadcn/ui
- [x] Setup project structure (components, pages, lib)
- [x] Build layout components (Header, Footer, WhatsApp button)
- [x] Build Home page with hero, categories, features, CTA
- [x] Build product catalog pages (list, category, detail placeholders)
- [x] Build blog pages (list, post placeholders)
- [x] Build contact page with form + WhatsApp
- [x] Build about page
- [x] Build client area placeholder
- [x] SEO: sitemap.xml, robots.txt, structured data, Open Graph
- [x] WhatsApp floating button + integration
- [ ] Configure Sanity CMS with schemas
- [ ] Populate product data
- [ ] Add real images and branding
