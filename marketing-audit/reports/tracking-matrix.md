# Matriz de Rastreamento — Comali

Última atualização: 2026-10-20
Container em uso: **GTM-M9HHG8**

## Containers na conta "Comali - Site"

| Container | Tipo | ID | Status |
|---|---|---|---|
| comali.com.br | Web | `GTM-M9HHG8` | **Em uso** (código) |
| comali.com.br \| Server | Server-side | `GTM-W98C6ZSL` | Não utilizado |
| comali.com.br \| Web | Web | `GTM-MWX97NSJ` | **Sem uso — candidato a exclusão** |

> Dois containers Web na mesma conta geram confusão: publicar tag no container errado
> não surte efeito. Confirmar sempre o ID `GTM-M9HHG8` no topo do painel.

---

## Eventos disponíveis no dataLayer (após deploy)

| Evento | Disparo | Parâmetros |
|---|---|---|
| `whatsapp_click` | Clique em qualquer botão WhatsApp/orçamento | `whatsapp_source`, `product_reference`, `category`, `form_type` |
| `form_submitted` | Envio do formulário de contato | `form_type`, `has_company`, `message_length` |
| `gtm.js` | Automático (page view) | — |

### Origens (`whatsapp_source`) instrumentadas

| Origem | Local |
|---|---|
| `floating_button` | Botão flutuante |
| `product_card` | Botão nos cards do catálogo |
| `product_detail` | Página de produto |
| `contato_info` / `contato_cta` | Página de contato |
| `contato_form` | Formulário de contato (novo) |
| `footer` | Rodapé |

> Conferir se todos constam em `src/` após o deploy: a origem retornada no evento
> indica onde o lead nasceu — é o que permite cortar o que não converte.

---

## Tags a criar no GTM-M9HHG8

| # | Tag | Tipo | Gatilho |
|---|---|---|---|
| 1 | GA4 — Configuração | Google Tag (GA4), com o ID `G-XXXXXXX` | All Pages |
| 2 | GA4 — Evento whatsapp_click | GA4 Event, nome `whatsapp_click`, parâmetros da tabela acima | Custom Event = `whatsapp_click` |
| 3 | GA4 — Evento form_submitted | GA4 Event, nome `form_submitted` | Custom Event = `form_submitted` |
| 4 | Google Ads — Conversão WhatsApp | Google Ads Conversion Tracking (`AW-XXXXXXXXX` + label) | Custom Event = `whatsapp_click` |
| 5 | Google Ads — Conversão Formulário | Google Ads Conversion Tracking | Custom Event = `form_submitted` |

### Gatilhos

- `whatsapp_click` → Tipo: **Evento personalizado**, nome do evento: `whatsapp_click`
- `form_submitted` → Tipo: **Evento personalizado**, nome do evento: `form_submitted`
- All Pages → Tipo: **Inicialização da página**

### Variáveis da camada de dados

| Variável | Nome da variável na camada de dados |
|---|---|
| Origem WhatsApp | `whatsapp_source` |
| Referência do produto | `product_reference` |
| Categoria | `category` |
| Tipo de formulário | `form_type` |

---

## Marcar como conversão (GA4 → Google Ads)

1. GA4 → Admin → **Eventos**: marcar `whatsapp_click` e `form_submitted` como **eventos principais**.
2. Google Ads → **Metas → Conversões → Importar → GA4**: importar os dois eventos.
3. Preferir a importação via GA4 a tags duplicadas de Ads — evita conversão contada duas vezes.

Vantagem: permite atribuição por `whatsapp_source`/`product_reference` direto no relatório do Ads.

---

## Validação obrigatória antes de publicar

1. `npm run dev` e abrir o site.
2. GTM → **Visualizar** → conectar ao `localhost`.
3. Clicar em: botão flutuante, card de produto, página de produto, formulário de contato.
4. Conferir na aba **Eventos** do Preview cada `whatsapp_click` com o parâmetro correto.
5. Alternativa rápida no Console do navegador: `window.dataLayer` após cada clique.
6. Só então **Publicar** a versão no GTM.

---

## Checklist

- [x] Snippet GTM no layout (`src/app/layout.tsx` — `GTM-M9HHG8`)
- [x] Fallback `<noscript>` iframe
- [x] Tracking em botão flutuante, cards, detalhe do produto, contato e rodapé
- [x] Tracking no formulário de contato (`form_submitted` + `whatsapp_click`)
- [x] Parâmetros normalizados (`product_reference`, sem `data-`/`aria-`)
- [x] Sem PII no dataLayer
- [ ] Criar as 5 tags no painel do GTM
- [ ] Marcar eventos principais no GA4
- [ ] Importar conversões no Google Ads
- [ ] Validar no Preview e publicar
- [ ] Excluir/arquivar container Web duplicado `GTM-MWX97NSJ`
