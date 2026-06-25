import { siteConfig } from "@/lib/config"
import { getWhatsAppUrl } from "@/lib/whatsapp"
import { Button } from "@/components/ui/button"
import { MessageCircle, Phone, Mail, MapPin } from "lucide-react"
import { ContactForm } from "@/components/contact/contact-form"

export const metadata = {
  title: "Contato",
  description: `Entre em contato com a ${siteConfig.name}. Solicite um orçamento ou tire suas dúvidas.`,
}

export default function ContatoPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Contato</h1>
          <p className="text-muted-foreground">
            Entre em contato conosco. Estamos prontos para atender sua empresa.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Informações</h2>
              <div className="space-y-3">
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  <span>{siteConfig.email}</span>
                </a>
                {siteConfig.address && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-5 w-5 shrink-0" />
                    <span>{siteConfig.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-green-50 border border-green-200 p-6 space-y-3">
              <h3 className="font-semibold text-green-800 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Atendimento rápido via WhatsApp
              </h3>
              <p className="text-sm text-green-700">
                Para orçamentos e dúvidas urgentes, fale diretamente conosco pelo
                WhatsApp.
              </p>
              <Button className="bg-green-600 hover:bg-green-700">
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Abrir WhatsApp
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Envie uma mensagem</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
