import { siteConfig } from "./config"

export function getWhatsAppUrl(message?: string, productName?: string) {
  const text =
    message ||
    (productName
      ? `Olá! Gostaria de solicitar um orçamento para o produto: ${productName}`
      : siteConfig.whatsapp.defaultMessage)
  return `https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(text)}`
}

/**
 * Dispara evento de conversão WhatsApp no Google Tag Manager.
 * Dispara tanto dataLayer.push (para GTM) quanto gtag (para GA4).
 * Seguro chamar no SSR — só executa no browser.
 */
export function trackWhatsappClick(source: string, extra?: Record<string, unknown>) {
  if (typeof window === "undefined") return
  const eventData = { event: "whatsapp_click", whatsapp_source: source, ...extra }
  // dataLayer push (GTM)
  ;(window as unknown as { dataLayer: unknown[] }).dataLayer = (window as unknown as { dataLayer: unknown[] }).dataLayer || []
  ;(window as unknown as { dataLayer: unknown[] }).dataLayer.push(eventData)
  // gtag (GA4 import no Google Ads)
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
  if (typeof gtag === "function") {
    gtag("event", "whatsapp_click", { source, ...extra })
  }
}
