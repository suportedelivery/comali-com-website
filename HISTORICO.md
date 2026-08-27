# COMALI — Histórico do Projeto e Guia de Retomada
Última atualização: 27/08/2026

## 1) Contexto
- Site real: comali.com.br (Next.js + Sanity + Vercel), rodando com campanhas de ADS — NÃO TOCAR.
- Objetivo: criar 2 modelos de homologação com base no PDF do diretor (Wilson) e apresentar em links temporários.
- REGRA DE OURO: nunca rodar `git push` estando na branch `main`. O original só muda após aprovação do diretor.

## 2) Branches
- `main` → site original (produção).
- `modelo1-reestruturacao` → Modelo 1: home nova com mosaico de fotos, menu com segmentos, páginas de segmento com foto de fundo.
- `modelo2-segmentos` → Modelo 2: site atual + páginas /segmentos + link "Soluções por Segmento" no menu.

## 3) Ambiente e acessos
- Pasta local: /media/sdcloud/AppleSSD/Opencode/comali.com.br (Cópia 2)
- .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID=5fcrgo8n | NEXT_PUBLIC_SANITY_DATASET=production | SANITY_API_TOKEN=(token de escrita)
- Sanity Studio: https://comali-com-br.sanity.studio | painel: sanity.io/manage (projeto 5fcrgo8n)
- Vercel: projeto COMALI → aba Deployments (links de preview por branch)
- Fluxo de trabalho: Qwen escreve os prompts → OpenCode executa → Edmar não edita código manualmente.

## 4) Comandos úteis
- cd "/media/sdcloud/AppleSSD/Opencode/comali.com.br (Cópia 2)"
- git branch | git checkout modelo1-reestruturacao | git checkout modelo2-segmentos | git checkout main
- npm run dev (site local, porta 3001)
- npx sanity deploy (publica alterações de schema no Studio)
- npx tsx scripts/seed-segments.ts
- npx tsx scripts/import-segment-images.ts

## 5) Scripts em /scripts
- seed-segments.ts: cria os 7 segmentos no Sanity (JÁ EXECUTADO — 7 criados)
- import-segment-images.ts: importa imagens, envia ao Sanity e vincula aos segmentos (JÁ EXECUTADO)

## 6) Feito (cronologia)
1. Schema `segment` no Sanity (illustrativeImage, whatsappMessage, meta, etc.)
2. Páginas /segmentos e /segmentos/[slug] (+ loading/not-found)
3. Seed dos 7 segmentos (Construtoras, Panificadoras, Restaurantes, Açougues, Hospitais, Empresas, Escolas)
4. Imagens contextuais por segmento geradas e enviadas ao Sanity
5. Modelo 1: home com mosaico full-bleed, fotos vivas, título com destaque cyan, animação sutil
6. Menu "Soluções por Segmento" nos dois modelos
7. Push das duas branches e previews gerados na Vercel

## 7) A FAZER (agenda)
1. [EM CURSO] Campo "Segmentos de Público" no product.ts (1 produto → N segmentos)
2. Ajustar /segmentos/[slug] para buscar produtos pelo novo campo automaticamente
3. Script de marcação automática de produtos por segmento (por categoria/palavra-chave)
4. Exibir descrição curta nos cards de produtos (estilo site D&A) + script para preencher descrições (químicos por nome; demais genéricas por categoria)
5. Página "Produtos Químicos para Food Service" (por necessidade: Limpeza Diária, Gordura, Pesada, Inox, Higienização, Desinfecção)
6. Página "Soluções para Nutricionistas" (posicionamento de influenciador, textos do PDF)
7. Replicar mudanças no modelo2-segmentos (copiar arquivos do modelo1 via git checkout)
8. npx sanity deploy após mudanças de schema
9. Apresentar links ao diretor; só após aprovação levar o modelo escolhido à main

## 8) Descrições-base dos químicos (fonte: site D&A e PDF)
- 1000 PLUS: Detergente concentrado para limpeza diária de superfícies laváveis.
- ALL CLEAR: Desengordurante e desengraxante alcalino para gorduras pesadas.
- ESPUMA CLOR: Detergente alcalino clorado para limpeza pesada e desincrustação.
- ALUMEX: Limpador ácido e abrilhantador de inox e alumínio.
- BACTER PLUS: À base de hipoclorito de sódio para higienização.
- SANYX: Limpador, desinfetante e desodorizante para manutenção de ambientes.

## 9) Decisões importantes
- Produtos pertencem a segmentos por campo múltiplo no próprio produto (mesmo padrão do campo categories).
- Fotos novas do mosaico: colocar em public/imagens/mosaico/.
- WhatsApp com mensagem específica por segmento (rastrear origem do lead).
