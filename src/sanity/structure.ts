import { type StructureResolver } from "sanity/structure"

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Comali Studio")
    .items([
      S.listItem()
        .title("Produtos")
        .child(
          S.documentTypeList("product")
            .title("Produtos")
            .defaultOrdering([{ field: "sortOrder", direction: "asc" }])
        ),
      S.divider(),
      S.listItem()
        .title("Categorias")
        .child(S.documentTypeList("category").title("Categorias")),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) =>
          item.getId() && !["product", "category"].includes(item.getId()!)
      ),
    ])
