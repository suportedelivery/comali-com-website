import { getAllProducts, getAllCategories } from "@/lib/sanity-products"

export const revalidate = 60
import { ProductCard } from "@/components/product/product-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "Produtos",
  description:
    "Catálogo de produtos de limpeza profissional: dispensers, lixeiras, carrinhos de limpeza e acessórios.",
}

const MAIN_PARENTS = [
  "Produtos Químicos Concentrados",
  "Dispensers",
  "Equipamentos de Limpeza",
  "Lixeiras e Contentores",
]

export default async function ProdutosPage() {
  const products = await getAllProducts()
  const allCategories = await getAllCategories()

  const roots = allCategories.filter((c) => !c.parentCategory)

  const seenSlugs = new Set<string>()
  const mainRoots = roots.filter((c) => {
    if (!MAIN_PARENTS.includes(c.title)) return false
    if (seenSlugs.has(c.slug.current)) return false
    seenSlugs.add(c.slug.current)
    return true
  })

  const otherRoots = roots
    .filter((c) => !seenSlugs.has(c.slug.current))
    .sort((a, b) => a.title.localeCompare(b.title))

  return (
    <div className="container mx-auto px-4 py-12 bg-slate-50 min-h-screen">
      <div className="space-y-2 mb-10">
        <h1 className="text-3xl font-bold tracking-tight">
          Catálogo de Produtos
        </h1>
        <p className="text-muted-foreground">
          {products.length} produtos disponíveis para sua empresa
        </p>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Categorias</h2>

        {mainRoots.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {mainRoots.map((cat) => (
              <Link key={cat.slug.current} href={`/produtos/${cat.slug.current}`}>
                <Button variant="default" size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                  {cat.title}
                </Button>
              </Link>
            ))}
          </div>
        )}

        {otherRoots.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {otherRoots.map((cat) => (
              <Link key={cat.slug.current} href={`/produtos/${cat.slug.current}`}>
                <Button variant="outline" size="sm">
                  {cat.title}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, 40).map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {products.length > 40 && (
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Mostrando 40 de {products.length} produtos
          </p>
          <Button render={<Link href="/contato" />}>
            Ver todos os produtos via WhatsApp
          </Button>
        </div>
      )}
    </div>
  )
}
