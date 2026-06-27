import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { getAllCategories } from "@/lib/products"
import {
  SprayCan,
  Trash2,
  ShoppingCart,
  Wrench,
  FlaskConical,
  Package,
} from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  dispensers: <SprayCan className="h-8 w-8" />,
  "lixeiras-e-contentores": <Trash2 className="h-8 w-8" />,
  "equipamentos-de-limpeza": <ShoppingCart className="h-8 w-8" />,
  "produtos-de-higiene-e-limpeza": <FlaskConical className="h-8 w-8" />,
}

export async function CategoryGrid() {
  const allCategories = await getAllCategories()
  const mainCategories = allCategories.filter(
    (cat) =>
      cat.slug === "dispensers" ||
      cat.slug === "lixeiras-e-contentores" ||
      cat.slug === "equipamentos-de-limpeza" ||
      cat.slug === "produtos-de-higiene-e-limpeza"
  )

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {mainCategories.map((category) => (
        <Link key={category.slug} href={`/produtos/${category.slug}`}>
          <Card className="group text-center transition-all hover:shadow-lg hover:border-primary/50">
            <CardContent className="flex flex-col items-center gap-3 p-6">
              <div className="text-primary transition-transform group-hover:scale-110">
                {iconMap[category.slug] || (
                  <Package className="h-8 w-8" />
                )}
              </div>
              <h3 className="font-semibold">{category.name}</h3>
              <p className="text-xs text-muted-foreground">
                {category.count} produtos
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
