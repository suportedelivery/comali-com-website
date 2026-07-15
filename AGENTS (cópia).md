<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Contexto: Campanha Google Ads SuporteDelivery

**Conta:** AW-18223873086
**Investimento:** R$ 150/semana (R$ 75 por campanha)
**Status:** Campanhas publicadas, pendentes aprovação Google

### Campanhas
- **SD_Search_Avulso_Curitiba** → `/servicos/manutencao` (emergência TI presencial)
- **SD_Search_Contratos_Curitiba** → `/planos` (contratos mensais)

### Sitelinks (para adicionar via Google Ads web)
1. Chamado Avulso → `/servicos/manutencao`
2. Contratos de Suporte → `/planos`
3. Suporte de TI Hoje → `/servicos`
4. Falar no WhatsApp → `/contato`
5. Virtualização Proxmox → `/servicos/proxmox`
6. Firewall pfSense → `/servicos/pfsense`

### Callouts
Atendimento mesmo dia | SLA garantido em 4h | Suporte 7 dias por semana | Suporte remoto e presencial | Curitiba e Região Metropolitana | 25 anos de experiência | Economia com Open Source | Custo fixo e previsível

### Checklist Pendente
- [x] Sitelinks — importados e vinculados (09/07/2026)
- [x] Callouts — importados (09/07/2026)
- [x] Negativas — importadas (09/07/2026)
- [x] Ruflo Memory — instalado e funcionando (09/07/2026)
- [x] Graphify — instalado e configurado (09/07/2026)
- [x] Session restore/end — funcionando (09/07/2026)
- [ ] Vincular Callouts à campanha Contratos
- [ ] Snippets Estruturados (opcional)

### Template de Importação
- `TODOS_COMPLETE_utf16.csv` — CSV consolidado UTF-16LE com BOM
- Funcionou para importação de campanhas (validado 09/07/2026)
- Usar como base para futuras campanhas de clientes

---

## Sessão e Memória

### Ao iniciar sessão (primeira coisa):
```
ruflo hooks session-restore
```
Isso restaura o estado da última sessão.

### Ao encerrar sessão (antes de /exit):
```
ruflo hooks session-end
```
Isso salva o estado para a próxima sessão.

### Para salvar dados pontuais durante a sessão:
```
ruflo memory store -k "chave" --value "conteúdo"
```

### Para buscar dados salvos:
```
ruflo memory search -q "busca"
```

### Dados salvos na memória:
- `campanha_suportedelivery` — contexto da campanha
- `template_importacao_ads` — template de importação UTF-16LE
- `sessao_atual` — estado da sessão 09/07/2026

---

## Template para novos clientes

**Arquivo:** `TEMPLATE_CLIENTE_utf16.csv`

### Campos obrigatórios para preencher:
1. **Campaign** — Nome da campanha
2. **Budget** — Orçamento diário (R$)
3. **Maximum CPC bid limit** — Lance máximo CPC
4. **Ad Group** — Nome do grupo de anúncios
5. **Final URL** — URL da página de destino
6. **Headline 1-15** — Títulos (max 30 chars)
7. **Description 1-4** — Descrições (max 35 chars)
8. **Keyword** — Palavras-chave entre aspas
9. **Location** — Cidades alvo

### Regras importantes:
- **Encoding:** UTF-16LE com BOM
- **Descrições:** máx. 35 caracteres
- **Títulos:** máx. 30 caracteres
- **Keywords:** usar aspas para phrase match
- **Sitelinks:** vincular depois via Editor

**Arquivo completo:** `CAMPANHA_GOOGLE_ADS_EDITOR.md`
