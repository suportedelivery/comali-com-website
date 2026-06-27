"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronDown, ChevronRight } from "lucide-react"

interface CategoryProduct {
  title: string
  slug: string
  image: string | null
}

interface NavCategory {
  name: string
  slug: string
  icon: string
  subcategories: Array<{ name: string; slug: string }>
}

interface MegaMenuProps {
  categories: ReadonlyArray<{
    readonly name: string
    readonly slug: string
    readonly icon: string
    readonly subcategories: ReadonlyArray<{ readonly name: string; readonly slug: string }>
  }>
  productsByCategory: Record<string, ReadonlyArray<{ readonly title: string; readonly slug: string; readonly image: string | null }>>
}

export function MegaMenu({ categories, productsByCategory }: MegaMenuProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [hoverTimeout, setHoverTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    setActiveCategory(null)
  }, [pathname])

  const handleMouseEnter = (slug: string) => {
    if (hoverTimeout) clearTimeout(hoverTimeout)
    setActiveCategory(slug)
  }

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveCategory(null)
    }, 150)
    setHoverTimeout(timeout)
  }

  const activeCat = categories.find((c) => c.slug === activeCategory)
  const activeProducts = activeCategory ? productsByCategory[activeCategory] || [] : []

  return (
    <div className="relative" onMouseLeave={handleMouseLeave}>
      <nav className="flex items-center gap-0 bg-slate-200">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/produtos/${category.slug}`}
            className={`flex items-center gap-1 px-4 py-3 text-base font-extrabold uppercase tracking-wide transition-colors ${
              activeCategory === category.slug
                ? "text-white bg-slate-900"
                : "text-slate-900 hover:bg-slate-900 hover:text-white"
            }`}
            onMouseEnter={() => handleMouseEnter(category.slug)}
          >
            {category.name}
            {category.subcategories.length > 0 && (
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  activeCategory === category.slug ? "rotate-180" : ""
                }`}
              />
            )}
          </Link>
        ))}
      </nav>

      {activeCat && (
        <div
          className="absolute top-full left-0 w-full bg-cyan-50 shadow-xl border-t border-cyan-200 z-50"
          onMouseEnter={() => {
            if (hoverTimeout) clearTimeout(hoverTimeout)
          }}
        >
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Subcategories list */}
              <div className="md:col-span-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Categorias
                  </h3>
                  <Link
                    href={`/produtos/${activeCat.slug}`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Ver todos
                  </Link>
                </div>
                {activeCat.subcategories.length > 0 ? (
                  <ul className="space-y-1">
                    {activeCat.subcategories.map((sub) => (
                      <li key={sub.slug}>
                        <Link
                          href={`/produtos/${sub.slug}`}
                          className="flex items-center gap-2 py-1.5 text-sm text-foreground hover:text-primary transition-colors group"
                        >
                          <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Todas as subcategorias
                  </p>
                )}
              </div>

              {/* Featured products for this category */}
              <div className="md:col-span-3">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
                  Produtos em {activeCat.name}
                </h3>
                {activeProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {activeProducts.map((product) => (
                      <Link
                        key={product.slug}
                        href={`/produtos/${activeCat.slug}/${product.slug}`}
                        className="group"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted mb-2">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.title}
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                              Sem imagem
                            </div>
                          )}
                        </div>
                        <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {product.title}
                        </h4>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Nenhum produto disponível nesta categoria
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
