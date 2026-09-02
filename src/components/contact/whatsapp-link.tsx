"use client"

import { type ReactNode, type MouseEvent } from "react"
import { getWhatsAppUrl, trackWhatsappClick } from "@/lib/whatsapp"

interface WhatsAppLinkProps {
  /** Texto pré-formatado enviado ao WhatsApp (ex: "Olá! Gostaria de...") */
  message?: string
  /** Nome do produto (passado para getWhatsAppUrl se message não fornecido) */
  productName?: string
  /** Origem do clique (rastreamento) */
  source: string
  /** className passada ao <a> */
  className?: string
  /** Props extras (data-*, aria-*, etc.) passadas ao <a> */
  extraProps?: Record<string, unknown>
  children: ReactNode
}

/**
 * Wrapper Client Component para links WhatsApp com tracking automático.
 * Substitui <a href="https://wa.me/..."> para disparar evento whatsapp_click
 * no dataLayer/gtag ANTES de abrir o WhatsApp.
 */
export function WhatsAppLink({ message, productName, source, className, extraProps = {}, children }: WhatsAppLinkProps) {
  const href = getWhatsAppUrl(message, productName)
  const handleClick = () => {
    trackWhatsappClick(source, extraProps)
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick} className={className} {...extraProps}>
      {children}
    </a>
  )
}