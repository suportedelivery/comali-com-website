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
 * Empurra um evento para o dataLayer (GTM) e para o gtag (GA4), se existir.
 * Seguro chamar no SSR — só executa no browser.
 *
 * IMPORTANTE: nunca passe dados pessoais (nome, e-mail, telefone) em `params`.
 * Use apenas metadados de contexto (origem, tipo de formulário, quantidade).
 */
export function trackEvent(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return
  const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void }

  // dataLayer push (GTM)
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push({ event, ...params })

  // gtag (GA4 import no Google Ads)
  if (typeof w.gtag === "function") {
    w.gtag("event", event, params)
  }
}

/**
 * Normaliza props extras para nomes de parâmetros limpos no dataLayer.
 * - descarta atributos de acessibilidade (aria-*) que não são métrica
 * - "data-product-reference" → "product_reference"
 */
function normalizeParams(extra: Record<string, unknown> = {}) {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(extra)) {
    if (key.startsWith("aria-")) continue
    out[key.replace(/^data-/, "").replace(/-/g, "_")] = value
  }
  return out
}

/**
 * Dispara evento de conversão WhatsApp no GTM/GA4.
 * @param source origem do clique (ex: "product_card", "contato_form")
 */
export function trackWhatsappClick(source: string, extra?: Record<string, unknown>) {
  trackEvent("whatsapp_click", { whatsapp_source: source, ...normalizeParams(extra) })
}
