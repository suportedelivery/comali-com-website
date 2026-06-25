import { searchProducts } from "@/lib/sanity-products"
import { ProductCard } from "@/components/product/product-card"
import { Search } from "lucide-react"

interface BuscaPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function BuscaPage({ searchParams }: BuscaPageProps) {
  const { q } = await searchParams
  const query = q?.trim() || ""

  const results = query ? await searchProducts(query) : []

  return (
    <div className="container mx-auto px-4 py-12 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Buscar Produtos</h1>
          <form action="/busca" method="GET" className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Digite o nome do produto, marca ou referência..."
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>

        {query && (
          <div className="mb-4">
            <p className="text-slate-600">
              {results.length > 0
                ? `${results.length} resultado(s) para "${query}"`
                : `Nenhum resultado encontrado para "${query}"`}
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {results.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {!query && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">
              Digite algo para buscar produtos
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
