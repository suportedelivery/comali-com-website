import { siteConfig } from "@/lib/config"

export const metadata = {
  title: "Sobre",
  description: `Conheça a ${siteConfig.name} - Especialista em produtos de limpeza profissional para empresas.`,
}

export default function SobrePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Sobre a {siteConfig.name}
        </h1>

        <div className="prose prose-neutral max-w-none space-y-4">
          <p className="text-lg text-muted-foreground">
            Somos especialistas em produtos de limpeza profissional, atendendo
            empresas de diversos segmentos como escolas, shoppings, academias,
            clínicas, hospitais e redes varejistas.
          </p>

          <p className="text-muted-foreground">
            Nossa missão é oferecer soluções completas em higiene e limpeza, com
            produtos de qualidade e atendimento personalizado para cada cliente.
          </p>

          <h2 className="text-2xl font-semibold mt-8">Nossos Diferenciais</h2>

          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Produtos de marcas reconhecidas no mercado profissional</li>
            <li>Atendimento consultivo e personalizado</li>
            <li>Condições especiais para compras em volume</li>
            <li>Logística eficiente para todo o Brasil</li>
            <li>Equipe técnica especializada</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8">Segmentos Atendidos</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {[
              "Escolas",
              "Shoppings",
              "Academias",
              "Clínicas",
              "Hospitais",
              "Redes Varejistas",
              "Restaurantes",
              "Escritórios",
              "Indústrias",
            ].map((segment) => (
              <div
                key={segment}
                className="rounded-lg border p-4 text-center text-sm font-medium"
              >
                {segment}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
