export const siteConfig = {
  name: "Comali",
  logo: "/logo.jpeg", // Path to logo image in public directory
  description:
    "Produtos de higienização comercial e especializada. Mais de 20 anos no mercado, referência em lixeiras, dispensers, equipamentos de limpeza e acessórios profissionais.",
  url: "https://comali.com.br",
  whatsapp: {
    number: "5541987560649",
    defaultMessage: "Olá! Gostaria de solicitar um orçamento.",
  },
  phone: "(41) 3029-5678",
  email: "atendimento@comali.com.br",
  address: "",
  hours: "Segunda a sexta-feira, das 09:00h às 17:00h",
  social: {
    instagram: "",
    linkedin: "",
  },
  trayStoreId: "746334",
  nav: [
    { title: "Início", href: "/" },
    { title: "Produtos", href: "/produtos" },
    { title: "Sobre", href: "/sobre" },
    { title: "Contato", href: "/contato" },
  ],
  categories: [
    {
      name: "Dispensers",
      slug: "dispensers",
      icon: "spray-can",
      subcategories: [
        { name: "Dispenser Inox", slug: "dispenser-inox" },
        { name: "Dispenser Plástico", slug: "dispenser-plastico" },
        { name: "Secador de Mãos", slug: "secador-de-maos" },
        { name: "Papel Toalha Interfolhado", slug: "papel-toalha-interfolhado" },
        { name: "Papel Toalha Bobina", slug: "papel-toalha-bobina" },
        { name: "Papel Higiênico Rolão", slug: "papel-higienico-rolao" },
        { name: "Sabonete Líquido", slug: "sabonete-liquido" },
        { name: "Sabonete Espuma", slug: "sabonete-espuma" },
      ],
    },
    {
      name: "Lixeiras e Contentores",
      slug: "lixeiras-e-contentores",
      icon: "trash-2",
      subcategories: [
        { name: "Lixeiras Inox", slug: "lixeiras-inox" },
        { name: "Lixeiras Plástico", slug: "lixeiras-plastico" },
        { name: "Coleta Seletiva", slug: "coleta-seletiva" },
        { name: "Com Pedal", slug: "com-pedal" },
        { name: "Sem Pedal", slug: "sem-pedal" },
        { name: "Cinzeiros e Bituqueiras", slug: "cinzeiros-e-bituqueiras" },
        { name: "Lixeira para Copos", slug: "lixeira-para-copos" },
      ],
    },
    {
      name: "Equipamentos de Limpeza",
      slug: "equipamentos-de-limpeza",
      icon: "cart",
      subcategories: [
        { name: "Carro Prateleira", slug: "carro-prateleira" },
        { name: "Carro Funcional", slug: "carro-funcional" },
        { name: "Carro Cuba", slug: "carro-cuba" },
        { name: "Baldes", slug: "baldes" },
        { name: "Rodo Limpa Vidros", slug: "rodo-limpa-vidros" },
        { name: "Placas de Sinalização", slug: "placas-de-sinalizacao" },
      ],
    },
    {
      name: "Produtos Químicos Concentrados",
      slug: "produtos-quimicos-concentrados",
      icon: "flask-conical",
      subcategories: [],
    },
  ],
} as const
