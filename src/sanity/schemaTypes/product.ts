import { defineField, defineType } from "sanity"

export default defineType({
  name: "product",
  title: "Produto",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Nome do Produto",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Ativo", value: "active" },
          { title: "Rascunho", value: "draft" },
          { title: "Descontinuado", value: "discontinued" },
        ],
      },
      initialValue: "active",
    }),
    defineField({
      name: "featured",
      title: "Destaque na Home",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "new",
      title: "Produto Novo",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "categories",
      title: "Categorias",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "category" }],
        },
      ],
    }),
    defineField({
      name: "brand",
      title: "Marca",
      type: "string",
    }),
    defineField({
      name: "reference",
      title: "Referência / Código",
      type: "string",
    }),
    defineField({
      name: "ean",
      title: "EAN / Código de Barras",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Descrição Curta",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "detailedDescription",
      title: "Descrição Detalhada",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "price",
      title: "Preço (R$)",
      type: "number",
      description: "Deixe em branco para 'Sob Consulta'",
    }),
    defineField({
      name: "images",
      title: "Imagens do Produto",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: "alt",
              title: "Texto Alternativo (Alt)",
              type: "string",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "stock",
      title: "Quantidade em Estoque",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "availability",
      title: "Disponibilidade",
      type: "string",
      options: {
        list: [
          { title: "Em estoque", value: "in_stock" },
          { title: "Sob encomenda", value: "pre_order" },
          { title: "Esgotado", value: "out_of_stock" },
        ],
      },
    }),
    defineField({
      name: "warranty",
      title: "Garantia",
      type: "string",
    }),
    defineField({
      name: "dimensions",
      title: "Dimensões (cm)",
      type: "object",
      fields: [
        { name: "length", title: "Comprimento", type: "number" },
        { name: "width", title: "Largura", type: "number" },
        { name: "height", title: "Altura", type: "number" },
      ],
    }),
    defineField({
      name: "weight",
      title: "Peso (kg)",
      type: "number",
    }),
    defineField({
      name: "specifications",
      title: "Especificações Técnicas",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "key", title: "Propriedade", type: "string" },
            { name: "value", title: "Valor", type: "string" },
          ],
        },
      ],
    }),
    defineField({
      name: "variations",
      title: "Variações",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "type", title: "Tipo", type: "string" },
            { name: "value", title: "Valor", type: "string" },
            { name: "sku", title: "SKU", type: "string" },
            { name: "price", title: "Preço", type: "number" },
            { name: "stock", title: "Estoque", type: "number" },
          ],
        },
      ],
    }),
    defineField({
      name: "whatsappMessage",
      title: "Mensagem WhatsApp",
      type: "string",
      description: "Texto pré-preenchido para o WhatsApp",
    }),
    defineField({
      name: "meta",
      title: "SEO",
      type: "object",
      fields: [
        { name: "title", title: "Título SEO", type: "string" },
        { name: "description", title: "Descrição SEO", type: "text", rows: 2 },
        { name: "keywords", title: "Palavras-chave", type: "string" },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "images.0",
      price: "price",
    },
    prepare({ title, media, price }) {
      return {
        title: title || "Sem título",
        media,
        subtitle: price ? `R$ ${price.toFixed(2).replace(".", ",")}` : "Sob Consulta",
      }
    },
  },
})
