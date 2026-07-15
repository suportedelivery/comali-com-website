# Contexto da Sessão - Campanha SuporteDelivery

**Atualizado:** 09/07/2026

---

## ✅ SOLUÇÃO ENCONTRADA — 09/07/2026

### Problema raiz identificado
1. **Encoding UTF-8 sem BOM** causava erros de acentos
2. **Campos faltando no CSV** — o Editor espera MUITAS colunas que não tínhamos
3. **Descrições > 35 chars** — Google Ads rejeitava ou truncava

### Solução aplicada
1. **CSV consolidado em UTF-16LE com BOM** (formato que o Editor gera)
2. **Todas as colunas que o Editor espera** — Campaign Type, Networks, Budget type, Bid Strategy, Ad Schedule, Targeting method, etc.
3. **Descrições validadas ≤35 caracteres**

### Arquivo funcional
- `TODOS_COMPLETE_utf16.csv` — 31 linhas, tudo em um arquivo único
- Funcionou na importação — todas as campanhas publicadas

### Para futuras campanhas de clientes
- Usar este CSV como **template**
- Trocar Campaign, Ad Group, URLs, keywords
- Manter formato UTF-16LE com BOM
- Validar comprimento das descrições (≤35 chars)

---

## Arquivos atuais

| Arquivo | Status |
|---------|--------|
| `TODOS_COMPLETE_utf16.csv` | ✅ Template funcional — importa todas as configurações corretas |
| `CAMPANHA_GOOGLE_ADS_EDITOR.md` | ✅ Referência completa da campanha |
| `CONTEXTO_CAMPANHA.md` | ✅ Este arquivo |

---

## Status atual da conta (atualizado 09/07/2026 23:50)

- **SD_Search_Avulso_Curitiba** — ✅ Ativa e qualificada
- **SD_Search_Contratos_Curitiba** — ✅ Ativa e qualificada
- **Campaign #1 (Performance Max)** — ✅ Ativa
- **Sitelinks** — ✅ Importados e vinculados a ambas as campanhas
- **Callouts** — ✅ Importados (pendente vincular a Contratos)
- **Negativas** — ✅ Importadas
- **Ruflo Memory** — ✅ Instalado e funcionando
- **Graphify** — ✅ Instalado e configurado
- **Session restore/end** — ✅ Funcionando

---

## Sitelinks (validados ≤35 caracteres)

| Title | Desc1 | Desc2 | URL |
|-------|-------|-------|-----|
| Chamado Avulso | TI emergencial resolvida hoje | Atendimento Presencial Curitiba | /servicos/manutencao |
| Contratos de Suporte | Planos de TI com SLA garantido | A partir de R$ 897/mês | /planos |
| Suporte de TI Hoje | Atendimento Presencial Mesmo Dia | Técnico Especializado Curitiba | /servicos |
| Falar no WhatsApp | Resposta em minutos sem burocracia | Tire suas dúvidas agora | /contato |
| Virtualização Proxmox | Enterprise sem custo de licença | Servidores alta disponibilidade | /servicos/proxmox |
| Firewall pfSense | Segurança de rede corporativa | VPN, filtragem e balanceamento | /servicos/pfsense |

## Callouts (≤25 caracteres)
Atendimento mesmo dia | SLA garantido em 4h | Suporte 7 dias por semana | Suporte remoto e presencial | Curitiba e Região Metropolitana | 25 anos de experiência | Economia com Open Source | Custo fixo e previsível

---

## Regras para importação futura

1. **Formato:** UTF-16LE com BOM (nunca UTF-8 sem BOM)
2. **Descrições:** máx. 35 caracteres
3. **Títulos:** máx. 25 caracteres
4. **Arquivo consolidado** — tudo num único CSV
5. **Validar** sempre antes de importar

---

## Template para novos clientes

**Arquivo:** `TEMPLATE_CLIENTE_utf16.csv`

### Campos para preencher:
1. Campaign — Nome da campanha
2. Budget — Orçamento diário (R$)
3. Maximum CPC bid limit — Lance máximo CPC
4. Ad Group — Nome do grupo de anúncios
5. Final URL — URL da página de destino
6. Headline 1-15 — Títulos (max 30 chars)
7. Description 1-4 — Descrições (max 35 chars)
8. Keyword — Palavras-chave entre aspas
9. Location — Cidades alvo

### Regras:
- Encoding: UTF-16LE com BOM
- Descrições: máx. 35 caracteres
- Títulos: máx. 30 caracteres
- Keywords: usar aspas para phrase match
- Sitelinks: vincular depois via Editor
