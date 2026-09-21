# HISTÓRICO DO PROJETO COMALI — comali.com.br
Última atualização: 21/09/2026 · Mantido por Edmar + Qwen

## 1. ESTADO ATUAL (RESUMO)
- Site de PRODUÇÃO (comali.com.br) rodando o MODELO 1 (branch master), merge feito em 08/09/2026.
- Plano Vercel: PRO (US$ 20/mês) desde 08/09/2026 (antes: Hobby pausado por estouro de cota).
- Sistema de gestão de catálogo ativo: Google Sheet "COMALI — Catálogo Mestre" (aba CATÁLOGO, 445 produtos) + Webapp Apps Script (cards com foto, busca, ATIVAR/DESCONTINUAR, pedido de produto novo com foto/link) + abas MUDANÇAS (auditoria) e PEDIDOS (fila de triagem).
- PENDENTE: Comando 3 (script sync-sheet.ts: planilha → Sanity), revisar 8 rascunhos no Sanity, treinar equipe no webapp.

## 2. MAPA DE AMBIENTES
- Pasta produção/modelos: /media/sdcloud/AppleSSD/Opencode/comali.com.br (Cópia 2)
- Pasta principal (merge): /media/sdcloud/AppleSSD/Opencode/comali.com.br (backup pré-merge: comali.com.br-backup-antes-merge)
- Git/GitHub: suportedelivery/comali-com-website · Branches: master (produção), modelo1-reestruturacao, modelo2-segmentos
- Vercel: projeto comali (comali-com-br) · Deploy de produção = master
- CMS: Sanity (dataset compartilhado! mudança no Sanity afeta produção)
- Planilha: Google Sheets "COMALI — Catálogo Mestre" · Webapp: Apps Script vinculado a ela (URL /exec)
- E-mail de alertas do webapp: consultoria@suportedelivery.com

## 3. REGRAS DE OURO
1. NUNCA alterar conteúdo do Sanity sem lembrar que a PRODUÇÃO lê o mesmo dataset (links de homologação que precisem diferir devem viver no CÓDIGO, não no CMS).
2. Status de produto no Sanity: active | draft | discontinued (NÃO existe "inactive"). Site só mostra status == "active".
3. revalidate = 1800s (30 min) nas páginas — não reduzir sem motivo (cota Vercel).
4. Produtos novos/inativações: fluxo planilha → sync (quando existir) — nunca edição direta no Sanity pela equipe.
5. Deploys Vercel: preview = branch; produção = master. Push dispara build.

## 4. LINHA DO TEMPO
- 11/08: início; branches de modelo; import D&A (453 docs); schemas segment/product no Sanity.
- 26-28/08: Modelo 1 e 2 completos (segmentos, soluções food-service/nutricionistas, mega menu com botão teal "SOLUÇÕES POR SEGMENTO", químicos primeiro, heroes fotográficos, mosaico home); erros de TS em scripts/ corrigidos (tipagem client.create).
- 29/08: aviso "Exceeded free resources" (Hobby); apresentação à diretoria (Wilson) → MODELO 1 APROVADO.
- 02/09: GTM (GTM-M9HHHGB) entra na master (preservado no merge).
- 08/09: CRISE: projeto PAUSADO por cota (site fora do ar em plena campanha ADS) → upgrade Pro → site restaurado.
- 08/09: merge modelo1 → master (stash prévio de arquivos de ferramentas locais: .claude-flow, .swarm, ruvector.db); site novo no ar.
- 08-09/09: export CSV mestre (445 publicados; 8 drafts excluídos; escape CSV corrigido); Google Sheet CATÁLOGO; Webapp Apps Script v1 no ar; descoberta dos valores de status (active/draft/discontinued); formulário de pedido com upload de foto + link.
- 21/09: extração de imagem em alta resolução em `Código.gs` (JSON-LD, og:image, img tags, heurística anti-thumbnail, checagem binária PNG/JPEG >= 800px, menu Apps Script reextrairImagem) + melhorias no `scripts/sync-sheet.ts` (relatório detalhado de status/updates e comparador normalizado).

## 5. DECISÕES TÉCNICAS IMPORTANTES
- Menu superior: Modelo 1 = Sanity siteNavigation + 2 links hardcoded (Food Service, Nutricionistas); produção preservada com 4 itens originais até o merge.
- Filtro de status ativo em TODAS as queries GROQ (auditoria feita pré-merge).
- Scripts utilitários em scripts/ (seed, tag, export-products-csv.ts) — rodar com npx tsx.
- Webapp Apps Script: lê colunas pelo NOME do cabeçalho (imune a reordenação de colunas); fotos via externalImages (URLs externas D&A/fabricantes), campo images quase sempre vazio.

## 6. FLUXO OPERACIONAL DA EQUIPE
Sandra/comercial: webapp → busca produto → DESCONTINUAR/ATIVAR (grava MUDANÇAS + e-mail) · "+ Pedir produto novo" (nome, marca, categoria, link, foto, descrição → aba PEDIDOS + e-mail).
Edmar: revisa PEDIDOS → completa linha nova na aba CATÁLOGO (sem _id) → roda sync (a criar) → site atualiza em até 30 min.

## 7. PRÓXIMOS PASSOS (FILA)
1. Comando 3: scripts/sync-sheet.ts (lê CSV baixado da planilha; cria linhas sem _id; aplica status; log; modo dry-run).
2. Revisar 8 rascunhos (drafts.) no Sanity: publicar ou descartar.
3. Treinar equipe no webapp; aposentar pedidos por WhatsApp.
4. Monitorar Usage Vercel semanalmente (alertas configurados pós-Pro).
5. Cadastro da 1ª leva nova: papéis Ripz (105, 101, 102, 191, 197, 281, 361, 362), dispensers Premisse (Puxa e Corta, linhas Velox/INVOQ/Urban) — origem: WhatsApp Sandra 09/09 + ripz.com.br.

## 8. PARA SESSÕES DE IA (Qwen/OpenCode/ruflo)
Ao retomar: leia este arquivo + git status + git branch. Comandos úteis: npx tsx scripts/export-products-csv.ts (regenera CSV mestre). Nunca commitar sem typecheck. Merge sempre com --no-ff e backup prévio.