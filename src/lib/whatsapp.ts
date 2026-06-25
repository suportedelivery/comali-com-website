import { siteConfig } from "./config"

export function getWhatsAppUrl(message?: string, productName?: string) {
  const text =
    message ||
    (productName
      ? `Olá! Gostaria de solicitar um orçamento para o produto: ${productName}`
      : siteConfig.whatsapp.defaultMessage)
  return `https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(text)}`
}
