import Link from "next/link"
import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

const environments = [
  {
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
    title: "Banheiros Corporativos",
    description: "Dispensers e acessórios para banheiros profissionais",
    href: "/produtos/dispensers",
  },
  {
    image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&h=600&fit=crop",
    title: "Escritórios Modernos",
    description: "Lixeiras e contentores que combinam com seu espaço",
    href: "/produtos/lixeiras-e-contentores",
  },
  {
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop",
    title: "Equipes de Limpeza",
    description: "Equipamentos completos para manutenção profissional",
    href: "/produtos/equipamentos-de-limpeza",
  },
  {
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
    title: "Ambientes Corporativos",
    description: "Soluções completas para sua empresa",
    href: "/produtos",
  },
]

export function EnvironmentsSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight">
          Soluções para Cada Ambiente
        </h2>
        <p className="mt-2 text-muted-foreground">
          Produtos profissionais para todos os espaços da sua empresa
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {environments.map((env, index) => (
          <Link key={index} href={env.href}>
            <Card className="group overflow-hidden transition-all hover:shadow-xl">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={env.image}
                  alt={env.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">{env.title}</h3>
                  <p className="text-sm text-white/90 mb-3">{env.description}</p>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span>Ver produtos</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
