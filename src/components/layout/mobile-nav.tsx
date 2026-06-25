"use client"

import { useState } from "react"
import Link from "next/link"
import { siteConfig } from "@/lib/config"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Search, Phone } from "lucide-react"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        render={<button className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground" />}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Menu</span>
      </SheetTrigger>
      <SheetContent side="right">
        <nav className="flex flex-col gap-4 mt-8">
          <form action="/busca" method="GET" onSubmit={() => setIsOpen(false)} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              name="q"
              placeholder="Buscar produtos..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent bg-slate-50/50"
            />
          </form>

          <a
            href="tel:+554130295678"
            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 rounded-md text-sm font-semibold text-slate-700 hover:text-primary bg-slate-50/50"
          >
            <Phone className="h-4 w-4 text-primary" />
            <span>(41) 3029-5678</span>
          </a>

          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {item.title}
            </Link>
          ))}
          <Link
            href="/contato"
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-4"
          >
            Solicitar Orçamento
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
