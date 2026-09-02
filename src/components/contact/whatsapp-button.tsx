import { MessageCircle } from "lucide-react"
import { WhatsAppLink } from "@/components/contact/whatsapp-link"

export function WhatsAppButton() {
  return (
    <WhatsAppLink
      source="floating_button"
      extraProps={{ "aria-label": "Fale conosco pelo WhatsApp" }}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all hover:bg-green-600 hover:scale-110"
    >
      <MessageCircle className="h-7 w-7" />
    </WhatsAppLink>
  )
}
