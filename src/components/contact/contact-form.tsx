"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { siteConfig } from "@/lib/config"

export function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [message, setMessage] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const text = [
`*Contato via Site - ${siteConfig.name}*`,
`*Nome:* ${name || "Não informado"}`,
`*E-mail:* ${email || "Não informado"}`,
`*Empresa:* ${company || "Não informado"}`,
`*Mensagem:* ${message || "Não informado"}`,
    ].join("%0A")

    window.open(`https://wa.me/${siteConfig.whatsapp.number}?text=${text}`, "_blank")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company">Empresa</Label>
        <Input id="company" placeholder="Nome da empresa" value={company} onChange={(e) => setCompany(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Mensagem</Label>
        <Textarea id="message" placeholder="Descreva o que precisa..." rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <Button type="submit" className="w-full">
        Enviar Mensagem
      </Button>
    </form>
  )
}
