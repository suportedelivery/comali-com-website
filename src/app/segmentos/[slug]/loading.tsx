export default function SegmentLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden bg-slate-200 animate-pulse">
        <div className="flex h-full items-center">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-4">
              <div className="h-12 w-16 rounded bg-slate-300" />
              <div className="h-12 w-3/4 rounded bg-slate-300" />
              <div className="h-6 w-1/2 rounded bg-slate-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Description skeleton */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <div className="h-5 w-full rounded bg-slate-200 animate-pulse" />
            <div className="h-5 w-full rounded bg-slate-200 animate-pulse" />
            <div className="h-5 w-2/3 rounded bg-slate-200 animate-pulse" />
          </div>
        </div>
      </section>

      {/* CTA skeleton */}
      <section className="pb-12 md:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-14 w-72 rounded-lg bg-slate-200 animate-pulse" />
        </div>
      </section>

      {/* Products skeleton */}
      <section className="pb-16 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 h-8 w-48 rounded bg-slate-200 animate-pulse" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white"
              >
                <div className="aspect-[4/3] bg-slate-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-3 w-16 rounded bg-slate-200 animate-pulse" />
                  <div className="h-5 w-3/4 rounded bg-slate-200 animate-pulse" />
                </div>
                <div className="px-4 pb-4">
                  <div className="h-9 w-full rounded bg-slate-200 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
