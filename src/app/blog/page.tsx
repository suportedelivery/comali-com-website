export const metadata = {
  title: "Blog",
  description:
    "Dicas e novidades sobre limpeza profissional, higiene e manutenção empresarial.",
}

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-2 mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
        <p className="text-muted-foreground">
          Dicas e novidades sobre limpeza profissional
        </p>
      </div>

      <div className="rounded-lg border border-dashed p-12 text-center space-y-4">
        <p className="text-muted-foreground">
          Blog em construção. Em breve publicaremos conteúdos sobre limpeza
          profissional, higiene e manutenção empresarial.
        </p>
      </div>
    </div>
  )
}
