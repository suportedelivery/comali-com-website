import { type SchemaTypeDefinition } from "sanity"
import product from "./product"
import category from "./category"
import navigation from "./navigation"
import segment from "./segment"

export const schemaTypes: SchemaTypeDefinition[] = [
  product,
  category,
  navigation,
  segment,
]

