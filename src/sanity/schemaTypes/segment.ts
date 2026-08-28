import { defineField, defineType } from "sanity"

export default defineType({
  name: "segment",
  title: "Segmento de Público",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Nome do Segmento",
      type: "string",
      description: 'Ex: "Construtoras e Obras", "Panificadoras e Confeitarias"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "illustrativeImage",
      title: "Imagem Ilustrativa do Segmento (Capa)",
      type: "image",
      description:
        "Imagem que mostra o produto/solução sendo usado no ambiente do segmento (ex: carrinho de limpeza em escritório, crianças em escola). Será usada no topo da página.",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          title: "Texto Alternativo (SEO)",
          type: "string",
        },
      ],
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
      name: "subtitle",
      title: "Subtítulo",
      type: "string",
      description: 'Descrição curta exibida no card. Ex: "Soluções para canteiros, áreas administrativas e empreendimentos"',
    }),
    defineField({
      name: "description",
      title: "Descrição Completa",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "icon",
      title: "Ícone / Emoji",
      type: "string",
      description: 'Emoji representativo do segmento. Ex: "🏗", "🥐", "🍽"',
    }),
    defineField({
      name: "heroImage",
      title: "Imagem Principal",
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
    }),
    defineField({
      name: "products",
      title: "Produtos do Segmento",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "product" }],
        },
      ],
    }),
    defineField({
      name: "featuredProductsCurated",
      title: "Produtos em Destaque (ordem personalizada)",
      type: "array",
      description:
        "Selecione e ordene os produtos que aparecerão primeiro no segmento. Se vazio, o sistema mostra todos os produtos do segmento automaticamente.",
      of: [
        {
          type: "reference",
          to: [{ type: "product" }],
        },
      ],
    }),
    defineField({
      name: "featuredProducts",
      title: "Produtos em Destaque",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "product" }],
        },
      ],
    }),
    defineField({
      name: "phases",
      title: "Fases",
      type: "array",
      description:
        "Para segmentos como Construtoras — exibe fases como 'Durante a obra', 'Na entrega', 'Após a entrega'. Deixe vazio se não aplicável.",
      of: [
        {
          type: "object",
          name: "phase",
          title: "Fase",
          fields: [
            defineField({
              name: "title",
              title: "Nome da Fase",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              title: "Descrição da Fase",
              type: "text",
              rows: 3,
            }),
            defineField({
              name: "products",
              title: "Produtos desta Fase",
              type: "array",
              of: [
                {
                  type: "reference",
                  to: [{ type: "product" }],
                },
              ],
            }),
          ],
          preview: {
            select: {
              title: "title",
            },
          },
        },
      ],
    }),
    defineField({
      name: "whatsappMessage",
      title: "Mensagem WhatsApp",
      type: "string",
      description: 'Texto pré-preenchido. Ex: "Quero uma solução para minha obra"',
    }),
    defineField({
      name: "order",
      title: "Ordem de Exibição",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Ativo", value: "active" },
          { title: "Inativo", value: "inactive" },
        ],
      },
      initialValue: "active",
    }),
    defineField({
      name: "meta",
      title: "SEO",
      type: "object",
      fields: [
        { name: "title", title: "Título SEO (metaTitle)", type: "string" },
        {
          name: "description",
          title: "Descrição SEO (metaDescription)",
          type: "text",
          rows: 2,
        },
        { name: "keywords", title: "Palavras-chave", type: "string" },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "subtitle",
      icon: "icon",
      media: "heroImage",
    },
    prepare({ title, subtitle, icon, media }) {
      return {
        title: `${icon || ""} ${title || "Sem título"}`.trim(),
        subtitle: subtitle || undefined,
        media,
      }
    },
  },
})
