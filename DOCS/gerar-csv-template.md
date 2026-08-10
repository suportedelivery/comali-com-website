# Gerador de CSV para Google Ads Editor

## Visão Geral

Script Python que gera **3 arquivos CSV** separados para importação no Google Ads Editor, otimizados para a Comali.com.br.

### Arquivos gerados

| Arquivo | Conteúdo | Colunas | Formato GAE |
|---------|----------|---------|-------------|
| `campanhas-anuncios-gads.csv` | Campanhas, Grupos de Anúncios, Palavras-chave, Anúncios RSA | 47 | Formato completo (campaigns/ads/keywords) |
| `negativas-gads.csv` | Palavras-chave negativas (campanha e grupo) | 4 | Campaign, Ad Group, Keyword, Type |
| `ativos-gads.csv` | Sitelinks e Callouts | 8 | Campaign, Ad Group, Sitelink text, Description 1/2, Final URL, Callout text, Status |

### Como executar

```bash
python3 gerar-csv-template.py
```

### Pré-requisitos

- Python 3.x
- `keyword-url-map.csv` no mesmo diretório (38 mapeamentos keyword → URL de produto)

## Estrutura do Script

### 1. Campanhas (3)

| Campanha | Orçamento | Grupos |
|----------|-----------|--------|
| Comali-Search-Jul26 | R$40/dia | Contentores, Lixeiras Inox, Lixeiras Plástico, Coleta Seletiva |
| Comali-Dispensers-Jul26 | R$30/dia | Saboneteiras, Toalheiros e Papeleiras, Secadores, Papel Higiênico |
| Comali-Equipamentos-Jul26 | R$25/dia | Carrinhos de Limpeza, Copos Descartáveis |

**Total**: R$95/dia (R$2.850/mês)

### 2. Especificações RSA

- **Headlines**: até 15, cada ≤30 caracteres
- **Descriptions**: até 4, cada ≤90 caracteres
- **Paths**: 2 campos, cada ≤15 caracteres
- **Estratégia de lances**: Maximizar cliques
- **Lance Max CPC**: R$8,00
- **Segmentação**: Seg-Sex 9h-17h
- **Rede**: Google Search (sem parceiros)

### 3. Palavras-chave

- **Match type**: Phrase (aspas duplas)
- **Mapeamento**: `keyword-url-map.csv` mapeia 38 keywords para URLs de produtos específicos
- **Fallback**: URL da categoria quando keyword não está no mapa

### 4. Palavras-chave Negativas

**Campanha** (13 termos, aplicadas a todas as campanhas):
- `grátis`, `usado`, `mercado livre`, `olx`, `como fazer`
- `caseiro`, `diy`, `tutorial`, `receita`, `plano de aula`
- `pdf`, `youtube`, `segunda mão`

**Grupo de anúncios** (8-9 termos por grupo):
- Excluem categorias irrelevantes (ex: lixeiras não precisam de "saboneteira")

### 5. Ativos

**Sitelinks** (5):
| Texto | Descrição 1 | Descrição 2 |
|-------|-------------|-------------|
| Lixeiras e Contentores | De 120L a 1000L com pedal | Para escolas e condomínios |
| Dispensers para Banheiro | Saboneteiras, toalheiros e mais | Inox e plástico profissional |
| Sobre a Comali | Representante autorizado há anos | Garantia de fábrica em todos |
| Todos os Produtos | +340 produtos disponíveis | Veja o catálogo completo |
| Fale Conosco no WhatsApp | Orçamento rápido e sem compromisso | Atendimento para todo o Brasil |

**Callouts** (7, cada ≤25 caracteres):
- `Entrega SP, PR, SC e RS`
- `Representante autorizado`
- `Garantia de fábrica`
- `+340 produtos disponíveis`
- `Atendimento via WhatsApp`
- `Preço justo e qualidade`
- `Condições p/ quantidades`

## Formato de Saída

- **Codificação**: UTF-16LE com BOM (`FF FE`)
- **Quebras de linha**: CRLF (`0D 0A`)
- **Delimitador**: Vírgula (,)
- **Escape**: Aspas duplas para campos com vírgulas

## Validação

O script roda uma validação automática ao final:

```
SUCCESS: All generated rows passed Google Ads validations successfully!
```

### Regras validadas

**Arquivo 1 (47 colunas)**:
- Header com exatamente 47 colunas
- Cada linha com 47 colunas
- Headlines ≤30 caracteres
- Descriptions ≤90 caracteres
- Paths ≤15 caracteres
- Linhas de anúncio não podem ter keyword ao mesmo tempo

**Arquivo 2 (4 colunas)**:
- Header com exatamente 4 colunas
- Tipo deve ser "Negative" ou "Campaign negative"

**Arquivo 3 (8 colunas)**:
- Header com exatamente 8 colunas

## Importação no Google Ads Editor

1. Abrir Google Ads Editor
2. Vá em **Conta > Importar > Do arquivo...**
3. Para cada arquivo, na ordem:
   - Primeiro: `campanhas-anuncios-gads.csv` (cria campanhas, grupos, keywords, anúncios)
   - Segundo: `negativas-gads.csv` (adiciona palavras-chave negativas)
   - Terceiro: `ativos-gads.csv` (adiciona sitelinks e callouts)
4. Revisar mudanças no painel esquerdo
5. Clicar **Manter** para publicar

### Solução de problemas

Se houver erro "Tipo de linha ambíguo":
- Verifique se está importando o arquivo correto para cada etapa
- O arquivo principal (`campanhas-anuncios-gads.csv`) NÃO contém negativas, sitelinks ou callouts
- Se necessário, selecione as campanhas com erro, clique com botão direito > **Reverter** para limpar cache local, e re-importe

## Configuração de Keywords

### keyword-url-map.csv

Mapeia 38 palavras-chave para URLs de produtos específicos:

```csv
keyword,url
lixeira inox,/produtos/lixeiras-e-contentores/lixeiras-inox
saboneteira,/produtos/dispensers/saboneteiras
```

**Decisão de design**: URLs de produtos são mais relevantes que URLs de categorias, melhorando Quality Score e taxa de conversão.

### Regras de mapeamento

- **Match type**: `Phrase` (pesquisa exata com variações)
- **Prioridade**: keyword-url-map.csv → URL da categoria (fallback)
- **Negativas**: 13 termos globais + 8-9 por grupo de anúncios

## Decisões Técnicas

1. **3 arquivos separados**: Formatos diferentes para cada tipo de entidade (GAE não mistura tipos de linha)
2. **UTF-16LE**: Codificação nativa do Google Ads Editor
3. **Phrase match**: Equilíbrio entre alcance e relevância
4. **Maximize clicks**: Estratégia inicial para coleta de dados
5. **R$8 Max CPC**: Limite para controlar custos em fase inicial
6. **Segmentação horária**: Seg-Sex 9h-17h (horário comercial B2B)
7. **Sem parceiros de pesquisa**: Foco em tráfego direto do Google
