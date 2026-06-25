export interface Product {
  _id: string
  title: string
  slug: { current: string }
  category: Category
  description: string
  specifications: { key: string; value: string }[]
  images: {
    _type: "image"
    asset: { _ref: string; _type: "reference" }
    alt?: string
  }[]
  featured: boolean
  whatsappMessage: string
  status: "active" | "draft"
}

export interface Category {
  _id: string
  name: string
  slug: { current: string }
  description: string
  image?: {
    _type: "image"
    asset: { _ref: string; _type: "reference" }
    alt?: string
  }
  icon?: string
  order: number
  parentCategory?: Category
}

export interface BlogPost {
  _id: string
  title: string
  slug: { current: string }
  excerpt: string
  content: unknown
  coverImage: {
    _type: "image"
    asset: { _ref: string; _type: "reference" }
    alt?: string
  }
  author: string
  publishedAt: string
  tags: { name: string; slug: { current: string } }[]
  status: "published" | "draft"
}
