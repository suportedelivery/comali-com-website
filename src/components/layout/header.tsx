import Link from "next/link"
import { siteConfig } from "@/lib/config"
import { getProductsByCategory } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { Search, Phone } from "lucide-react"
import { MegaMenu } from "./mega-menu"
import { MobileNav } from "./mobile-nav"

export async function Header() {
  // Load products for mega menu on the server
  const productsByCategory: Record<string, Array<{ title: string; slug: string; image: string | null }>> = {}
  
  for (const cat of siteConfig.categories) {
    const products = (await getProductsByCategory(cat.slug))
      .slice(0, 4)
      .map((p) => ({
        title: p.title,
        slug: p.slug,
        image: p.images[0]?.url || null,
      }))
    productsByCategory[cat.slug] = products
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top bar with logo and actions */}
      <div className="container mx-auto flex h-24 items-center justify-between px-4">
    <Link href="/" className="flex items-center gap-3">
      {siteConfig.logo ? (
        <img
          src={siteConfig.logo}
          alt={siteConfig.name}
          className="h-20 w-auto object-contain"
        />
      ) : (
        <span className="text-3xl font-bold text-primary">
          {siteConfig.name}
        </span>
      )}
      <div className="hidden md:flex flex-col justify-center border-l border-slate-300 pl-3">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Seu Parceiro em</span>
        <span className="text-sm font-semibold text-slate-800">Produtos Profissionais para Limpeza</span>
      </div>
    </Link>

        <div className="hidden md:flex items-center gap-4">
          <form action="/busca" method="GET" className="relative w-48 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              name="q"
              placeholder="Buscar produtos..."
              className="w-full pl-9 pr-3 py-1.5 text-xs lg:text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent bg-slate-50/50"
            />
          </form>
          
          <a
            href="tel:+554130295678"
            className="text-xs lg:text-sm font-semibold text-slate-700 hover:text-primary transition-colors flex items-center gap-1.5 border border-slate-200 rounded-md px-3 py-1.5 bg-slate-50/50 shrink-0 shadow-sm"
          >
            <Phone className="h-4 w-4 text-primary" />
            <span>(41) 3029-5678</span>
          </a>

          <Link
            href="/contato"
            className="inline-flex items-center justify-center rounded-md text-xs lg:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-3 lg:px-4 py-2 shrink-0"
          >
            Solicitar Orçamento
          </Link>
        </div>

        <MobileNav />
      </div>

      {/* Navigation bar with mega menu */}
      <div className="hidden md:block border-t bg-white">
        <div className="container mx-auto px-4">
          <MegaMenu categories={siteConfig.categories} productsByCategory={productsByCategory} />
        </div>
      </div>
    </header>
  )
}
