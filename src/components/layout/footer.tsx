import Link from "next/link"
import { siteConfig } from "@/lib/config"
import { Separator } from "@/components/ui/separator"
import { Phone, Mail, MapPin, Clock } from "lucide-react"

export async function Footer() {
  const categories = siteConfig.categories.map((cat) => ({
    name: cat.name,
    slug: cat.slug,
  }))

  return (
    <footer className="border-t bg-slate-900 text-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white">
              {siteConfig.name}
            </h3>
            <p className="text-sm text-slate-400">
              {siteConfig.description}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Produtos</h4>
            <nav className="flex flex-col gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/produtos/${cat.slug}`}
                  className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Links</h4>
            <nav className="flex flex-col gap-2">
              {siteConfig.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  {item.title}
                </Link>
              ))}
              <Link
                href="/parceiros"
                className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
              >
                Parceiros
              </Link>
              <Link
                href="/politica-de-privacidade"
                className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
              >
                Política de Privacidade
              </Link>
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Contato</h4>
            <div className="flex flex-col gap-2">
              {siteConfig.whatsapp.number && (
                <a
                  href={`https://wa.me/${siteConfig.whatsapp.number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <Mail className="h-4 w-4" />
                {siteConfig.email}
              </a>
              {siteConfig.address && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {siteConfig.address}
                </div>
              )}
              <div className="flex items-start gap-2 text-sm text-slate-400">
                <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                <span>De segunda a sexta-feira, das 09:00h às 17:00h</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-slate-700" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} {siteConfig.name}. Todos os
            direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/ComaliEquipamentosParaLimpeza/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition-colors"
              aria-label="Facebook"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-facebook"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/comali_limpeza"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition-colors"
              aria-label="Instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-instagram"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@ComaliBr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition-colors"
              aria-label="YouTube"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-youtube"
              >
                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                <path d="m10 15 5-3-5-3z" />
              </svg>
            </a>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Desenvolvido por</span>
            <a
              href="https://suportedelivery.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img
                src="/suportedelivery-logo.png"
                alt="SuporteDelivery.com"
                className="h-6 w-auto"
              />
              <span className="text-cyan-400 font-semibold">SuporteDelivery.com</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
