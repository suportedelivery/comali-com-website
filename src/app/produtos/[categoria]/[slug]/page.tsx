import { getProductBySlug, getAllProducts } from "@/lib/products"

export const revalidate = 60
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getWhatsAppUrl } from "@/lib/whatsapp"
import { MessageCircle } from "lucide-react"
import { ProductDetailClient } from "@/components/product/product-detail-client"

interface ProductPageProps {
  params: Promise<{ categoria: string; slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: "Produto não encontrado" }
  return {
    title: product.meta.title,
    description: product.meta.description,
  }
}

export async function generateStaticParams() {
  const products = await getAllProducts()
  return products.map((product) => ({
    categoria: product.categories[0]?.slug || "produtos",
    slug: product.slug,
  }))
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) notFound()

  const mainCategory = product.categories[0]
  const whatsappMessage = `Olá! Gostaria de solicitar um orçamento para: ${product.reference ? `${product.reference}: ` : ""}${product.title}`

  return (
    <div className="container mx-auto px-4 py-12 bg-gray-50 min-h-screen">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/produtos" />}>
              Produtos
            </BreadcrumbLink>
          </BreadcrumbItem>
          {mainCategory && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href={`/produtos/${mainCategory.slug}`} />}>
                  {mainCategory.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ProductDetailClient product={product} />

      {product.description && (
        <div className="mt-12">
          <div className="bg-gray-900 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-white">Descrição</h2>
            <div
              className="max-w-none text-white space-y-2 [&_*]:!text-white [&_*]:!bg-transparent [&_*]:!font-sans [&_*]:!text-[15px] [&_*]:!leading-normal [&_*]:!not-italic [&_strong]:!font-bold [&_b]:!font-bold [&_a]:!text-cyan-400 [&_ul]:!list-disc [&_ul]:!pl-5 [&_ol]:!list-decimal [&_ol]:!pl-5"
              dangerouslySetInnerHTML={{ __html: product.descriptionHTML || product.description }}
            />
          </div>
        </div>
      )}

      <div className="mt-12 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 shadow-lg">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-white">
            Precisa de mais informações?
          </h2>
          <p className="text-gray-300">
            Nossa equipe está pronta para atender sua empresa
          </p>
          <Button
            render={
              <a href={getWhatsAppUrl(whatsappMessage)} target="_blank" />
            }
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Falar com Consultor
          </Button>
        </div>
      </div>
    </div>
  )
}
