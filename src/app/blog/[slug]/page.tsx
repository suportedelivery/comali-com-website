interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-lg border border-dashed p-12 text-center space-y-4">
          <h1 className="text-2xl font-bold">Post do Blog</h1>
          <p className="text-muted-foreground">
            Blog em construção. Configure o Sanity CMS para exibir os posts.
          </p>
          <p className="text-sm text-muted-foreground">Slug: {slug}</p>
        </div>
      </div>
    </div>
  )
}
