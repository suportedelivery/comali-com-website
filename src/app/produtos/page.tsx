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

export default async function ProdutosPage() {
  const products = await getAllProducts()
  const categories = await getAllCategories()

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
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 20).map((cat) => (
            <Link key={cat.slug.current} href={`/produtos/${cat.slug.current}`}>
              <Button variant="outline" size="sm">
                {cat.title}
              </Button>
            </Link>
          ))}
        </div>
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
