import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { WhatsAppButton } from "@/components/contact/whatsapp-button"
import { GoogleTagManager } from "@/components/analytics/google-tag-manager"
import { siteConfig } from "@/lib/config"

const GTM_ID = "GTM-M9HHG8"
/**
 * GA4 — propriedade "Comali" (fluxo Web "Comali").
 * Instalado direto no código porque o container GTM-M9HHG8 não tem tag de GA4.
 * Os eventos whatsapp_click / form_submitted de src/lib/whatsapp.ts já empurram
 * para o dataLayer e chamam window.gtag, então são capturados por este snippet.
 */
const GA4_ID = "G-MYC4NDN968"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} - Produtos de Limpeza Profissional`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "produtos de limpeza",
    "dispensers",
    "lixeiras",
    "carrinhos de limpeza",
    "limpeza profissional",
    "B2B",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} - Produtos de Limpeza Profissional`,
    description: siteConfig.description,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen flex flex-col antialiased">
        <GoogleTagManager gtmId={GTM_ID} />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=window.gtag||gtag;gtag('js',new Date());gtag('config','${GA4_ID}');`}
        </Script>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  )
}
