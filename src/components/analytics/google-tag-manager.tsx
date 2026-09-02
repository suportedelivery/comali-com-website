import Script from "next/script"

interface GoogleTagManagerProps {
  gtmId: string
}

/**
 * Snippet oficial do Google Tag Manager.
 * - <head>: GTM script (assíncrono, não bloqueia render)
 * - <body>: noscript iframe (fallback para browsers sem JS)
 *
 * Carregado via next/script com strategy="afterInteractive" para evitar
 * impacto no LCP. O iframe noscript é renderizado direto no body.
 */
export function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
  return (
    <>
      <Script id="gtm-script" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}</Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
    </>
  )
}