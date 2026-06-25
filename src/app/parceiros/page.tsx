import Image from "next/image"
import Link from "next/link"

interface Partner {
  name: string
  logo: string
  url: string
}

const partners: Partner[] = [
  { name: "Madero", logo: "/madero.webp", url: "https://www.madero.com.br" },
  { name: "Colégio Bom Jesus", logo: "/colegiobomjesus.webp", url: "https://www.bomjesus.br" },
  { name: "Unimed", logo: "/unimed.webp", url: "https://www.unimed.coop.br" },
  { name: "Trombini", logo: "/trombini.webp", url: "https://www.trombini.com.br" },
  { name: "FAE", logo: "/fae.webp", url: "https://www.fae.edu" },
  { name: "Shopping Crystal", logo: "/crystal.webp", url: "https://www.shoppingcrystal.com.br" },
  { name: "Shopping CIDADE", logo: "/cidade.webp", url: "https://www.shoppingcidade.com.br" },
  { name: "Mueller", logo: "/mueller.webp", url: "https://www.mueller.com.br" },
  { name: "Catuai", logo: "/catuai.webp", url: "https://www.catuai.com.br" },
  { name: "Pátio Batel", logo: "/patiobatel.webp", url: "https://www.patiobatel.com.br" },
  { name: "MASP", logo: "/masp.webp", url: "https://www.masp.org.br" },
  { name: "Cataratas do Iguaçu", logo: "/cataratas.webp", url: "https://www.cataratasdoiguacu.com.br" },
  { name: "Jasmine", logo: "/jasmine.webp", url: "https://www.jasminealimentos.com.br" },
  { name: "Triunfo", logo: "/triunfo.webp", url: "https://www.triunfodobrasil.com.br" },
  { name: "Flow Open Mall", logo: "/flow.webp", url: "https://www.flowopenmall.com.br" },
]

export default function ParceirosPage() {
  return (
    <div className="container mx-auto px-4 py-12 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">
            Nossos Parceiros
          </h1>
          <p className="text-lg text-slate-600">
            Conheça algumas empresas, instituições e marcas que fazem parte da nossa trajetória.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {partners.map((partner) => (
            <a
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center justify-center bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 hover:border-cyan-400"
            >
              <div className="relative w-full aspect-square flex items-center justify-center">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill
                  className="object-contain p-2 group-hover:scale-105 transition-transform"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-700 group-hover:text-cyan-600 transition-colors text-center">
                {partner.name}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
