# HISTÓRICO DO PROJETO COMALI — comali.com.br
Última atualização: 23/09/2026 · Mantido por Edmar + Qwen

> **Novo:** [MANUAL-OPERACAO.md](MANUAL-OPERACAO.md) — operação consolidada do catálogo + lições da homologação.

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

---

## 9. 2026-09-23: Homologação completa

### O que foi homologado
- Fluxo ponta a ponta: pedido webapp → aprovação menu COMALI → download CSV → `sync-sheet.ts` (dry-run → `--apply`) → site ≤30 min (ISR 1800s).
- Criação de produtos novos e atualização de status/ATIVAR-DESCONTINUAR pela planilha.
- Extração de imagem em alta resolução via menu COMALI ("Re-extrair imagem do fabricante").
- Redirect temporário de descontinuados (307) para proteger campanhas ADS.
- Relatório de sync detalhado + comparador normalizado (`scripts/sync-log-2026-09-23.txt`: 454 linhas / 456 ativos / CRIAR 0 / ATUALIZAR 5 / STATUS 0 / AVISOS 0).
- Manual de operação consolidado: `MANUAL-OPERACAO.md`.

### Lições (não estavam documentadas antes)
1. Nome oficial do fabricante: copiar da página, não resumir. Certo: "Papel Toalha Rolo Ripz 200m com 6 Rolos de 28G". Errado: "Papel Toalha Bobina".
2. Nomes iguais = `_id` igual = colisão "already exists". Diferenciar com medida/gramatura (28g vs 24g, 20x20 vs 22x20).
3. Categorias no formato "Raiz | Sub | Sub-sub" (pipe). 1º item define a URL; demais listagens. Ex.: "Dispensers | Papel Toalha Interfolhado".
4. Dropdown de categorias no pedido (webapp) evita erro humano; categoria principal obrigatória.
5. `_id` é chave primária: sem `_id` = novo; com `_id` = existente. Nunca re-aprovar pedido de produto que já tem `_id` (duplica).
6. Atualizar foto de existente: menu COMALI → "Re-extrair imagem do fabricante" (não re-aprovar).
7. Delete é sempre manual e nos DOIS lados (Sanity + planilha). Sync nunca deleta.
8. Aba MUDANÇAS = fonte da verdade para divergências de STATUS no dry-run (antigo→novo).
9. Redirect de descontinuados é temporário (302/307), não 301; destino = 1ª categoria, fallback `/produtos`; protege ADS de 404.
10. Baixar CSV novo da aba CATÁLOGO antes de cada sync (sync lê o arquivo, não a aba ao vivo).
11. `--apply` só com relatório revisado; STATUS>0 ou ATUALIZAR>0 exige conferência.
12. Apps Script = colar arquivo inteiro + Implantar nova versão; OpenCode = git push. Nunca editar Apps Script às cegas.
13. Erro no webapp: ver Execuções (relógio) no editor Apps Script; console do navegador não mostra erros do servidor.

### Problemas resolvidos
- URLs duplicadas `/produtos/produtos` (corrigido em `3cdc637` — slugs + hierarquia de categoria).
- Thumbnails em baixa resolução (extração prioriza ≥800px / heurística anti-thumbnail; commit `fbe47ea`).
- Categoria `/outros` indevida / strings de categoria mal formadas no sync.
- Colisões de `_id` por nomes genéricos iguais.
- Lixo de teste "Teste Avancado" removido do catálogo.
- Redirect 307 de descontinuados para não quebrar anúncios (`dca7da7`).

### Pendências — fase 2
1. Categorias faltantes no dropdown/planilha (ex.: **Caicai**).
2. Auto-sugestão de nome oficial do produto a partir do link do fabricante no webapp.
3. Sync: resolver linhas **sem** `_id` por nome/slug canônico (evitar "already exists" quando o produto já existe com outro `_id`).