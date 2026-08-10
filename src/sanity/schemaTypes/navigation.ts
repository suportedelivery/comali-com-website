import { defineType, defineField } from "sanity"

export default defineType({
  name: "navigation",
  title: "Navegação & Menus",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Identificador do Menu",
      type: "string",
      description: "Ex: Menu Principal, Links do Footer",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "items",
      title: "Itens de Navegação Superior (Header)",
      type: "array",
      of: [
        {
          type: "object",
          name: "navItem",
          title: "Item de Menu",
          fields: [
            defineField({
              name: "title",
              title: "Título de Exibição",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "href",
              title: "Link de Destino",
              type: "string",
              description: "Ex: / (Home), /produtos, /sobre, /contato",
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "categories",
      title: "Categorias e Subcategorias (Mega Menu)",
      type: "array",
      of: [
        {
          type: "object",
          name: "categoryItem",
          title: "Categoria do Menu",
          fields: [
            defineField({
              name: "name",
              title: "Nome da Categoria",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "slug",
              title: "Slug URL",
              type: "string",
              description: "Ex: dispensers, lixeiras-e-contentores",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "icon",
              title: "Ícone (opcional)",
              type: "string",
              description: "Ex: spray-can, trash-2, cart, flask-conical",
            }),
            defineField({
              name: "subcategories",
              title: "Subcategorias",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "subcatItem",
                  title: "Subcategoria",
                  fields: [
                    defineField({
                      name: "name",
                      title: "Nome da Subcategoria",
                      type: "string",
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: "slug",
                      title: "Slug URL",
                      type: "string",
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                },
              ],
            }),
          ],
        },
      ],
    }),
  ],
})
