# Relatório de Auditoria e Diagnóstico Google Ads — Comali.com.br
*Metodologia Baseada em Marketingskills (Corey Haines) & Google Search B2B Playbook*
*Data: 03/09/2026*

---

## 1. Alinhamento com Contexto de Produto (`.agents/product-marketing.md`)

Conforme estabelecido pela metodologia `marketingskills`, a análise deve ser direcionada ao público B2B e aos diferenciais específicos do produto:
- **Público Target**: Gestores de compras, facilities, hospitais, clínicas, restaurantes e empresas.
- **Canal de Conversão**: Clique para mensagem WhatsApp (`{reference}: {title}`).
- **Marcas Distribuídas (Crucial)**: Bralimpia, Biovis, Contemar, D&A (Linha CMI). **Regra rigorosa**: Nenhuma dessas marcas pode ser negativada nas campanhas.

---

## 2. Diagnóstico das Campanhas (Visão Estrutural & Lances)

### A. Diagnóstico de Estratégias de Lance (Discrepância Detectada)

* **Campanha 1: Lixeiras e Contentores** → Configurada como **Maximizar Cliques** (Teto CPC / Orçamento R$ 35/dia).
* **Campanha 2: Equipamentos de Limpeza** → Configurada como **Maximizar Cliques** (Teto CPC / Orçamento R$ 25/dia).
* **Campanha 3: Dispensers e Acessórios** → Configurada como **Maximizar Conversões** (Sem teto / Orçamento R$ 30/dia).

> ⚠️ **Inconsistência Identificada**:
> Pelo *Google Search B2B Playbook* (Seção *Bidding by conversion volume*):
> - Campanhas com **0 a 15 conversões/mês** DEVEM usar **Manual CPC** ou **Maximizar Cliques** (sem target/sem Maximizar Conversões puro).
> - Deixar a campanha de Dispensers em "Maximizar Conversões" sem histórico prévio faz o algoritmo do Google buscar lances aleatórios para tentar gerar qualquer conversão, inflando o CPC individual e gastando o orçamento rapidamente sem otimização real.

### B. Gestão de Orçamento & Limites Diários

* **Total de Orçamento Configurado**: R$ 35 + R$ 30 + R$ 25 = **R$ 90,00/dia**.
* **Comportamento do Google Ads**: O algoritmo do Google Ads pode gastar até **2x o orçamento diário** de uma campanha em um único dia (ex: até R$ 180,00 no total), compensando ao longo do mês.
* **Solução Recomendada pelo Playbook**:
  - Criar um **Orçamento Compartilhado (Shared Budget)** de R$ 90,00/dia no nível da conta para as 3 campanhas.
  - Fixar um **Teto Máximo de CPC (Max CPC Limit)** em R$ 3,50 a R$ 4,00 por palavra-chave/grupo de anúncios. Isso impede que um único clique consuma R$ 15,00 a R$ 20,00.

---

## 3. Revisão de Palavras-Chave Negativas

Com base na regra de **"Não Negativar Marcas Distribuídas"** e purificar termos irrelevantes (B2C / doméstico / locação / concorrência regional):

### Termos Mantidos (NÃO Negativar):
- `contemar` (Marca vendida de contentores/lixeiras)
- `bralimpia` (Marca vendida de baldes/carrinhos/dispensers)
- `biovis` (Marca vendida de dispensers)

### Termos Negativos Recomendados (Apenas Termos de Baixa Intenção B2B / Concorrência de Serviços):
1. `aluguel`
2. `locação`
3. `usado`
4. `segunda mão`
5. `olx`
6. `mercadolivre`
7. `doméstico`
8. `residencial`
9. `caseiro`
10. `brinquedo`
11. `curso` / `treinamento` / `vagas` / `emprego`

---

## 4. Plano de Ação Recomendado (Próximos Passos Decididos em Conjunto)

1. **Padronizar Bidding**: Ajustar a campanha *Dispensers e Acessórios* de "Maximizar Conversões" para "Maximizar Cliques" com teto CPC de R$ 4,00.
2. **Orçamento Compartilhado**: Avaliar a criação do Orçamento Compartilhado de R$ 90/dia.
3. **Monitoramento via GTM**: Acompanhar os primeiros cliques no botão do WhatsApp (`whatsapp_click`) capturados via GTM até acumular 30+ conversões para então avaliar Smart Bidding (Target CPA).
