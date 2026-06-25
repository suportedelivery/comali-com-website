---
name: comali-migration
description: Use when working on the Comali.com.br project - migrating from Tray e-commerce platform to Next.js + Headless CMS. Covers catalog, blog, WhatsApp contact, client area, B2B focus on cleaning products (dispensers, trash bins, cleaning carts). Use for architecture decisions, component development, CMS integration, SEO, and performance optimization.
---

# Comali.com.br - Migration Skill

## Project Overview

**Comali** is a B2B cleaning products reseller migrating from the Tray e-commerce platform (deactivated) to a modern, high-performance website.

- **Segment**: Professional cleaning products (B2B)
- **Products**: Dispensers (liquid soap, hand sanitizer), trash bins (all sizes/models), cleaning carts, accessories
- **Target clients**: Schools, shopping malls, gyms, clinics, hospitals, retail chains, restaurants
- **Goal**: Product showcase (NOT e-commerce), professional catalog, lead generation via WhatsApp

## Tech Stack

```
Framework:       Next.js 15+ (App Router, React Server Components)
Styling:         Tailwind CSS 4 + shadcn/ui components
CMS:             Strapi (self-hosted) or Sanity (free tier)
Deployment:      Vercel (free tier) or VPS
Images:          Next/Image + Cloudinary (free tier)
Analytics:       Plausible or Umami (self-hosted, privacy-first)
WhatsApp:        Direct API link (wa.me)
Auth (client):   NextAuth.js / Auth.js
Database:        PostgreSQL (Supabase free tier or self-hosted)
```

## Architecture Principles

1. **Performance First**: SSG/ISR for catalog pages, minimal JS, Core Web Vitals optimized
2. **SEO**: Semantic HTML, structured data (JSON-LD), sitemap, meta tags
3. **Mobile First**: Responsive design, touch-friendly, fast on 3G
4. **B2B UX**: Quick product search, category navigation, bulk inquiry via WhatsApp
5. **No e-commerce**: Product showcase only - no cart, no checkout, no payment

## Page Structure

```
/                          Home (hero, categories, featured products, CTA)
/produtos                  Product catalog (grid, filters by category)
/produtos/[categoria]      Category page (dispensers, lixeiras, carrinhos...)
/produtos/[categoria]/[slug]  Product detail page (photos, specs, WhatsApp CTA)
/sobre                     About / institutional
/blog                      Blog listing
/blog/[slug]               Blog post
/contato                   Contact page (form + WhatsApp)
/area-do-cliente           Client area (login, history, saved products)
```

## Component Architecture

```
components/
  layout/          Header, Footer, Navigation, MobileMenu
  product/         ProductCard, ProductGrid, ProductFilters, ProductGallery
  catalog/         CategoryNav, CategoryCard, Breadcrumb
  contact/         WhatsAppButton, ContactForm, FloatingCTA
  blog/            BlogCard, BlogList, BlogContent
  client/          LoginForm, ClientDashboard, SavedProducts
  ui/              shadcn/ui components (Button, Card, Dialog, etc.)
  seo/             StructuredData, MetaTags, OpenGraph
```

## CMS Content Models

### Product
```
- title (string)
- slug (uid)
- category (relation -> Category)
- description (richtext)
- specifications (component: key-value pairs)
- images (media, multiple)
- featured (boolean)
- whatsapp_message (string, default inquiry text)
- status (enum: active, draft)
```

### Category
```
- name (string)
- slug (uid)
- description (text)
- image (media)
- icon (media, optional)
- order (integer)
- parent_category (relation -> Category, optional)
```

### Blog Post
```
- title (string)
- slug (uid)
- excerpt (text)
- content (richtext)
- cover_image (media)
- author (string)
- published_at (datetime)
- tags (relation -> Tag, multiple)
- status (enum: published, draft)
```

## Key Features

### WhatsApp Integration
- Floating button (bottom-right, always visible)
- "Solicitar Orcamento" CTA on every product page
- Pre-filled message with product name/code
- Link format: `https://wa.me/55XXXXXXXXXXX?text=Mensagem`

### Product Catalog
- Grid/list view toggle
- Filter by category, subcategory
- Search by name/code
- Image zoom on hover
- Specifications table
- Related products section

### Client Area
- Login with email/password
- Save favorite products
- Inquiry history
- Download catalogs (PDF)

## Performance Targets

- Lighthouse: 95+ Performance, 100 SEO
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1
- First Byte: < 200ms (ISR/SSG)

## SEO Checklist

- [ ] JSON-LD structured data (Product, Organization, BreadcrumbList)
- [ ] Dynamic sitemap.xml
- [ ] robots.txt
- [ ] Open Graph + Twitter Cards
- [ ] Canonical URLs
- [ ] Alt text on all images
- [ ] Semantic headings (h1-h6 hierarchy)
- [ ] Internal linking strategy

## Design Guidelines

- **Colors**: Professional, clean - blues/greens for trust + brand colors from current site
- **Typography**: Inter or similar sans-serif, high readability
- **Spacing**: Generous whitespace, clear visual hierarchy
- **CTAs**: High contrast, clear action verbs ("Solicitar Orcamento", "Fale Conosco")
- **Trust signals**: Client logos, years in market, certifications

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm run test         # Run tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
```

## Migration Checklist

- [ ] Setup Next.js project with TypeScript + Tailwind
- [ ] Configure CMS (Strapi/Sanity) with content models
- [ ] Migrate product data from Tray export
- [ ] Build layout components (Header, Footer, Nav)
- [ ] Build product catalog pages
- [ ] Build product detail pages
- [ ] Implement WhatsApp integration
- [ ] Build blog system
- [ ] Build client area
- [ ] SEO optimization
- [ ] Performance optimization
- [ ] Testing (unit + e2e)
- [ ] Deploy to production
- [ ] DNS migration
- [ ] Monitor + iterate
