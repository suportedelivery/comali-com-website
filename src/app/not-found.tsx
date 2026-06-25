import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-20 text-center space-y-6">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="text-2xl font-semibold">Página não encontrada</h2>
      <p className="text-muted-foreground max-w-md mx-auto">
        A página que você está procurando não existe ou foi movida.
      </p>
      <div className="flex gap-3 justify-center">
        <Button render={<Link href="/" />}>Voltar ao Início</Button>
        <Button render={<Link href="/produtos" />} variant="outline">
          Ver Produtos
        </Button>
      </div>
    </div>
  )
}
