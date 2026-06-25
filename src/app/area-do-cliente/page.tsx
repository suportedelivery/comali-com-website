export const metadata = {
  title: "Área do Cliente",
  description: "Acesse sua área exclusiva na Comali.",
}

export default function AreaDoClientePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Área do Cliente</h1>
          <p className="text-muted-foreground">
            Acesse sua conta para ver favoritos e histórico de consultas
          </p>
        </div>

        <div className="rounded-lg border border-dashed p-12 text-center space-y-4">
          <p className="text-muted-foreground">
            Área do cliente em desenvolvimento. Em breve você poderá fazer login
            e acessar seus favoritos e histórico.
          </p>
        </div>
      </div>
    </div>
  )
}
