# Plano de Implantação e Controle - Comali

Gerado em: 2026-10-15
Status: Em Execução

## 1. Etapa SEO & Auditoria Técnica
- **Status:** Concluído mapeamento de URLs (`produtos-links.txt` com 388 URLs indexadas).
- **Ações:** Otimização de títulos, meta tags e validação de schema em andamento para as páginas principais de produtos (Lixeiras Inox, Coleta Seletiva, Carrinhos de Limpeza).

## 2. Etapa Google Ads (Performance & Limpeza)
- **Status:** Mapeadas 81 palavras-chave ativas e 132 palavras-chave negativas.
- **Ações:** 
  - Exclusão de termos de baixo desempenho / lixo de busca (`mercado livre`, `pdf`, `youtube`, `como fazer`).
  - Direcionamento de orçamento para termos transacionais B2B de alta conversão.

## 3. Etapa Rastreamento & Tags (GTM / GA4)
- **Status:** Código instrumentado (2026-10-20) — falta criar as tags no painel GTM.
- **Container ativo:** `GTM-M9HHG8` (há um container Web duplicado sem uso: `GTM-MWX97NSJ`).
- **Ações concluídas:**
  - Helper genérico `trackEvent` em `src/lib/whatsapp.ts` (dataLayer + gtag).
  - Formulário de contato agora dispara `form_submitted` e `whatsapp_click` (antes era invisível).
  - Parâmetros normalizados: `product_reference`, `category` (sem prefixo `data-`, sem `aria-*`).
  - Sem PII no dataLayer (nome/e-mail não são enviados).
  - `typecheck` e `build` passando.
- **Pendente (painel):** criar 5 tags, marcar eventos principais no GA4, importar conversões no Ads, validar no Preview e publicar.
- **Referência:** `reports/tracking-matrix.md`

## 4. Etapa Relatórios Executivos
- **Status:** Automatização configurada na pasta `reports/`.
