# Guia Rápido - Ações no Google Ads (Conta COMALI - ID 822-541-7886)

## ⚡ Passo 1: Resolver Erro no GTM (Urgente)
*Sem isso, nenhuma campanha coleta dados.*

1. Acesse https://tagmanager.google.com/
2. Selecione container `comali.com.br` (ID: 2412603)
3. Clique em **Tags** no menu lateral esquerdo
4. Procure a tag com ícone de alerta ✖️ (geralmente é o antigo Analytics ou tag duplicada)
5. Clique nela → **Excluir** → **Salvar**
6. Clique em **Enviar** (canto direito superior) → **Publicar**

## 🛡️ Passo 2: Proteger Orçamento da Campanha "Dispensers"
*Evita gastos excessivos sem conversões medidas.*

1. Acesse https://ads.google.com/home
2. No menu lateral → **Campanhas**
3. Clique em **Dispensers e Acessórios**
4. Aba **Configurações** → Seção **Lances**
5. Mude de "Maximizar Conversões" para **"Maximizar Cliques"**
6. Marque a caixa **"Definir um limite de lance máximo por clique"**
7. Digite: **4.00**
8. Clique em **Salvar**

## 📊 Passo 3: Criar Conversão Manual (WhatsApp)
*Se a importação automática do GA4 travar na nova interface:*

1. Menu lateral → **Objetivos** → **Conversões** → **+ Nova ação de conversão**
2. Selecione **"Importar"** (4ª opção) > **Google Analytics 4** > **Web**
3. Se o evento `whatsapp_click` aparecer na lista, importe-o como categoria **"Contato"**
4. Se NÃO aparecer, escolha **"Criar manualmente"** > Tipo: **"Clique em link"** > URL: `/contato`

## ✅ Passo 4: Verificar Deploy no Site
*Confirmar que o site já está com as tags instaladas.*

1. Acesse https://comali.com.br/
2. Aperte **F12** (DevTools)
3. Abra aba **Console**
4. Digite: `dataLayer` e pressione Enter
5. Se aparecer um array `[]` ou com eventos, o rastreamento está ativo.

---
*Gerado em 04/09/2026 - Conta COMALI*
