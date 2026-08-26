import Link from "next/link"

export default function SegmentNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="mb-6 text-6xl">🔍</span>
      <h1 className="mb-3 text-3xl font-bold text-slate-900">
        Segmento não encontrado
      </h1>
      <p className="mb-8 max-w-md text-lg text-slate-500">
        O segmento que você procura não existe ou foi desativado. Confira
        nossos segmentos disponíveis na página inicial.
      </p>
      <Link
        href="/"
        className="inline-flex items-center rounded-lg bg-blue-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
      >
        ← Voltar para a página inicial
      </Link>
    </div>
  )
}
