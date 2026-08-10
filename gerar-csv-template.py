#!/usr/bin/env python3
"""
Generate Google Ads CSVs for Comali.com.br.
Outputs 3 separate CSV files for Google Ads Editor import:
  1. campanhas-anuncios-gads.csv  — Campaigns, Ad Groups, Keywords, RSAs
  2. negativas-gads.csv           — Campaign & Ad Group negative keywords
  3. ativos-gads.csv              — Sitelinks & Callouts
Reads keyword-url-map.csv for product-specific URL mapping.
"""
import os
import csv

BASE_URL = "https://comali.com.br"

# Load keyword → URL map
KEYWORD_URL_MAP = {}
map_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "keyword-url-map.csv")
if os.path.exists(map_path):
    with open(map_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            KEYWORD_URL_MAP[row["keyword"].strip().lower()] = BASE_URL + row["url"].strip()

def resolve_url(keyword, fallback_url):
    """Resolve product-specific URL from map, fallback to category URL."""
    return KEYWORD_URL_MAP.get(keyword.lower().strip(), fallback_url)

# Campaign definitions
CAMPAIGNS = [
    {
        "name": "Comali-Search-Jul26",
        "budget": "40.00",
        "groups": [
            {
                "name": "Contentores",
                "headlines": ["Contentores de Lixo", "De 120L a 1000L com Pedal", "Para Escolas e Condomínios", "Alta Resistência", "Com Pedal ou Sem Pedal", "", "", "", "", "", "", "", "", "", ""],
                "descs": ["Contentores para lixo resistentes para condomínios escolas e indústrias de 120L a 1000L.", "Pedal evita contato direto com resíduos. Entrega para SP, PR, SC e RS.", "", ""],
                "url": BASE_URL + "/produtos/lixeiras-e-contentores",
                "path1": "lixeiras",
                "path2": "contentores",
                "keywords": ["contentor lixo", "contentor com pedal", "contentor 700 litros", "contentor 1000 litros", "contentor para escola"]
            },
            {
                "name": "Lixeiras Inox",
                "headlines": ["Lixeiras em Aço Inox", "Com Pedal - 4L a 100L", "Para Banheiros Comerciais", "Acabamento Espelhado", "Linha Profissional", "", "", "", "", "", "", "", "", "", ""],
                "descs": ["Lixeira com Pedal evita contato direto com o lixo em todos ambientes.", "Aço inox de alta qualidade. Para shoppings e hospitais. Solicite orçamento.", "", ""],
                "url": BASE_URL + "/produtos/lixeiras-e-contentores",
                "path1": "lixeiras",
                "path2": "inox",
                "keywords": ["lixeira inox", "lixeira inox com pedal", "lixeira aço inox", "lixeira inox banheiro", "lixeira inox quadrada"]
            },
            {
                "name": "Lixeiras Plástico",
                "headlines": ["Lixeiras Plásticas Comali", "De 15L a 150L com Pedal", "Escritórios e Áreas Comuns", "Linha Completa de Cores", "Resistência e Durabilidade", "", "", "", "", "", "", "", "", "", ""],
                "descs": ["Lixeiras plásticas resistentes para escritórios e escolas. Diversas cores de 15L a 150L.", "Acabamento profissional com tampa e pedal. Entrega para SP, PR, SC e RS.", "", ""],
                "url": BASE_URL + "/produtos/lixeiras-e-contentores",
                "path1": "lixeiras",
                "path2": "plastico",
                "keywords": ["lixeira plastica", "lixeira plastica com pedal", "lixeira plastica 50 litros", "lixeira plastica para escritorio", "lixeira plastica branca"]
            },
            {
                "name": "Coleta Seletiva",
                "headlines": ["Lixeiras Coleta Seletiva", "Separação de Recicláveis", "Para Escolas e Empresas", "Cores Padronizadas por Tipo", "Capacidade de 30L a 120L", "", "", "", "", "", "", "", "", "", ""],
                "descs": ["Lixeiras para coleta seletiva com cores padronizadas para escolas e empresas.", "Separação eficiente de recicláveis com identificação visual. Entrega SP, PR, SC, RS.", "", ""],
                "url": BASE_URL + "/produtos/lixeiras-e-contentores",
                "path1": "lixeiras",
                "path2": "coleta-seletiva",
                "keywords": ["lixeira coleta seletiva", "lixeira reciclagem", "lixeira separacao lixo"]
            },
        ]
    },
    {
        "name": "Comali-Dispensers-Jul26",
        "budget": "30.00",
        "groups": [
            {
                "name": "Saboneteiras",
                "headlines": ["Saboneteiras para Banheiro", "Parede - Inox e Plástico", "Automáticas e Manuais", "Para Áreas Comerciais", "Linha Completa e Preços", "", "", "", "", "", "", "", "", "", ""],
                "descs": ["Saboneteiras para banheiros comerciais em inox e plástico automáticas e manuais.", "Para escolas e shoppings. Instalação simples. Solicite orçamento agora.", "", ""],
                "url": BASE_URL + "/produtos/dispensers",
                "path1": "dispensers",
                "path2": "saboneteiras",
                "keywords": ["saboneteira", "saboneteira parede", "saboneteira automática", "saboneteira inox", "dispensador sabonete"]
            },
            {
                "name": "Toalheiros e Papeleiras",
                "headlines": ["Toalheiros e Papeleiras", "Para Banheiros Comerciais", "Em Aço Inox e Plástico", "Capacidade Profissional", "Acabamento Premium", "", "", "", "", "", "", "", "", "", ""],
                "descs": ["Toalheiros e papeleiras para banheiros comerciais em aço inox e plástico.", "Para empresas e escolas. Design moderno e resistente. Entrega para SP, PR, SC e RS.", "", ""],
                "url": BASE_URL + "/produtos/dispensers",
                "path1": "dispensers",
                "path2": "toalheiros",
                "keywords": ["toalheiro", "papeleira", "toalheiro parede", "papeleira inox", "toalheiro papel"]
            },
            {
                "name": "Secadores",
                "headlines": ["Secadores de Mãos", "Para Banheiros Comerciais", "Potência Profissional", "Economia de Papel", "Entrega Imediata", "", "", "", "", "", "", "", "", "", ""],
                "descs": ["Secadores de mãos para banheiros comerciais com alta potência e baixo consumo.", "Elimine o uso de papel toalha. Para escolas e empresas. Solicite orçamento.", "", ""],
                "url": BASE_URL + "/produtos/dispensers",
                "path1": "dispensers",
                "path2": "secadores",
                "keywords": ["secador de mãos", "secador mãos", "secador parede", "secador comercial", "hand dryer"]
            },
            {
                "name": "Papel Higiênico",
                "headlines": ["Papel Higiênico Rolão", "Para Dispensers Profissionais", "Folha Dupla e Tripla", "Alta Rendimento", "Para Escolas e Empresas", "", "", "", "", "", "", "", "", "", ""],
                "descs": ["Papel higiênico rolão para dispensers profissionais. Folha dupla e tripla.", "Alta rendimento e economia. Para escolas, shoppings e empresas. Solicite orçamento.", "", ""],
                "url": BASE_URL + "/produtos/dispensers",
                "path1": "dispensers",
                "path2": "papel-higienico",
                "keywords": ["papel higienico rolão", "papel higienico dispensador", "papel higienico comercial", "papel higienico folha dupla", "papel higienico empresa"]
            },
        ]
    },
    {
        "name": "Comali-Equipamentos-Jul26",
        "budget": "25.00",
        "groups": [
            {
                "name": "Carrinhos de Limpeza",
                "headlines": ["Carrinhos de Limpeza", "Para Equipes de Limpeza", "Com Sacola e Equipamentos", "Modelo Profissional", "Linha Completa Comali", "", "", "", "", "", "", "", "", "", ""],
                "descs": ["Carrinhos de limpeza profissionais para hotéis, shoppings e condomínios.", "Equipados com sacola, suporte para rodos e baldes. Solicite orçamento.", "", ""],
                "url": BASE_URL + "/produtos/equipamentos-de-limpeza",
                "path1": "equipamentos",
                "path2": "carrinhos",
                "keywords": ["carrinho de limpeza", "carrinho limpeza profissional", "carrinho para limpeza", "carrinho maid cart", "carrinho hotel"]
            },
            {
                "name": "Copos Descartáveis",
                "headlines": ["Copos Descartáveis", "Para Água e Refrigerante", "Plástico e Papel", "Capacidade 180ml a 350ml", "Venda para Empresas", "", "", "", "", "", "", "", "", "", ""],
                "descs": ["Copos descartáveis para água e refrigerante em plástico e papel.", "Para empresas, eventos e refeitórios. Preços especiais para quantidades.", "", ""],
                "url": BASE_URL + "/produtos/dispensers",
                "path1": "equipamentos",
                "path2": "copos",
                "keywords": ["copo descartavel", "copo plastico descartavel", "copo descartavel 300ml", "copo descartavel empresa", "copo papel"]
            },
        ]
    },
]

# Campaign-level negative keywords
CAMPAIGN_NEGATIVES = [
    "grátis", "usado", "mercado livre", "olx", "como fazer",
    "caseiro", "diy", "tutorial", "receita", "plano de aula",
    "pdf", "youtube", "segunda mão",
]

# Ad-group-level negative keywords
AD_GROUP_NEGATIVES = {
    "Contentores":         ["sacola", "fio", "sabonete", "toalheiro", "copo", "papel higiênico", "secador", "carrinho"],
    "Lixeiras Inox":       ["sacola", "fio", "sabonete", "toalheiro", "copo", "papel higiênico", "secador", "carrinho"],
    "Lixeiras Plástico":   ["sacola", "fio", "sabonete", "toalheiro", "copo", "papel higiênico", "secador", "carrinho"],
    "Coleta Seletiva":     ["sacola", "fio", "sabonete", "toalheiro", "copo", "papel higiênico", "secador", "carrinho"],
    "Saboneteiras":        ["lixeira", "contentor", "lixão", "coleta", "reciclagem", "carrinho", "copo", "papel higiênico", "secador"],
    "Toalheiros e Papeleiras": ["lixeira", "contentor", "lixão", "coleta", "reciclagem", "carrinho", "copo", "papel higiênico", "secador"],
    "Secadores":           ["lixeira", "contentor", "lixão", "coleta", "reciclagem", "carrinho", "copo", "papel higiênico", "saboneteira"],
    "Papel Higiênico":     ["lixeira", "contentor", "lixão", "coleta", "reciclagem", "carrinho", "copo", "secador", "saboneteira"],
    "Carrinhos de Limpeza":["lixeira", "contentor", "lixão", "coleta", "reciclagem", "copo", "papel higiênico", "secador", "saboneteira"],
    "Copos Descartáveis":  ["lixeira", "contentor", "lixão", "coleta", "reciclagem", "carrinho", "papel higiênico", "secador", "saboneteira"],
}

# Sitelinks
SITELINKS = [
    {
        "text": "Lixeiras e Contentores",
        "desc1": "De 120L a 1000L com pedal",
        "desc2": "Para escolas e condomínios",
        "url": BASE_URL + "/produtos/lixeiras-e-contentores",
    },
    {
        "text": "Dispensers para Banheiro",
        "desc1": "Saboneteiras, toalheiros e mais",
        "desc2": "Inox e plástico profissional",
        "url": BASE_URL + "/produtos/dispensers",
    },
    {
        "text": "Sobre a Comali",
        "desc1": "Representante autorizado há anos",
        "desc2": "Garantia de fábrica em todos",
        "url": BASE_URL + "/sobre",
    },
    {
        "text": "Todos os Produtos",
        "desc1": "+340 produtos disponíveis",
        "desc2": "Veja o catálogo completo",
        "url": BASE_URL + "/produtos",
    },
    {
        "text": "Fale Conosco no WhatsApp",
        "desc1": "Orçamento rápido e sem compromisso",
        "desc2": "Atendimento para todo o Brasil",
        "url": BASE_URL + "/contato",
    },
]

# Callouts (each ≤25 chars)
CALLOUTS = [
    "Entrega SP, PR, SC e RS",
    "Representante autorizado",
    "Garantia de fábrica",
    "+340 produtos disponíveis",
    "Atendimento via WhatsApp",
    "Preço justo e qualidade",
    "Condições p/ quantidades",
]

# Template row values
TEMPLATE = {
    "campaign_type": "Search",
    "status": "Enabled",
    "networks": "Google search",
    "budget_type": "Daily",
    "eu_political": "Doesn't have EU political ads",
    "languages": "pt",
    "bid_strategy": "Maximize clicks",
    "enhanced_cpc": "Disabled",
    "max_cpc_limit": "8.00",
    "schedule": "(Monday[09:00-17:00]);(Tuesday[09:00-17:00]);(Wednesday[09:00-17:00]);(Thursday[09:00-17:00]);(Friday[09:00-17:00])",
    "ad_rotation": "Optimize for clicks",
    "targeting": "Location of presence or Area of interest",
    "exclusion": "Location of presence",
    "group_type": "Standard",
    "ad_type": "Responsive search ad",
    "ad_status": "Enabled",
    "kw_match": "Phrase",
    "kw_max_cpc": "8.00",
    "kw_status": "Enabled",
}

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

def esc(s):
    """CSV-escape a field."""
    if ',' in s or '"' in s or '\n' in s:
        return '"' + s.replace('"', '""') + '"'
    return s

def write_utf16le_csv(path, header, rows):
    """Write a CSV file in UTF-16LE with BOM and CRLF line endings."""
    with open(path, "wb") as f:
        f.write(b'\xff\xfe')  # BOM
        f.write(header.encode("utf-16-le"))
        f.write(b'\x0d\x00\x0a\x00')
        for row in rows:
            f.write(row.encode("utf-16-le"))
            f.write(b'\x0d\x00\x0a\x00')

# ══════════════════════════════════════════════════════════════════════
# FILE 1: Campaigns, Ad Groups, Keywords, RSAs
# ══════════════════════════════════════════════════════════════════════

def make_base_cols(campaign_name, group_name=""):
    return [
        esc(campaign_name),       # 0  Campaign
        "",                        # 1  Campaign Type
        "",                        # 2  Campaign Status
        "",                        # 3  Networks
        "",                        # 4  Budget
        "",                        # 5  Budget type
        "",                        # 6  EU political ads
        "",                        # 7  Languages
        "",                        # 8  Bid Strategy Type
        "",                        # 9  Enhanced CPC
        "",                        # 10 Maximum CPC bid limit
        "",                        # 11 Ad Schedule
        "",                        # 12 Ad rotation
        "",                        # 13 Targeting method
        "",                        # 14 Exclusion method
        esc(group_name),           # 15 Ad Group
        "",                        # 16 Ad Group Type
        "",                        # 17 Ad type
        "",                        # 18 Ad Group Status
        "",                        # 19 Final URL
        "",                        # 20 Path 1
        "",                        # 21 Path 2
    ]

def make_tail_cols(keyword="", match_type="", max_cpc="", status=""):
    return [
        esc(keyword),              # 41 Keyword
        match_type,                # 42 Match Type
        max_cpc,                   # 43 Max CPC
        status,                    # 44 Status
        "",                        # 45 Location
        "",                        # 46 Shared set type
    ]

def make_campaign_row(campaign):
    cols = make_base_cols(campaign["name"])
    cols[1]  = TEMPLATE["campaign_type"]
    cols[2]  = TEMPLATE["status"]
    cols[3]  = TEMPLATE["networks"]
    cols[4]  = campaign["budget"]
    cols[5]  = TEMPLATE["budget_type"]
    cols[6]  = TEMPLATE["eu_political"]
    cols[7]  = TEMPLATE["languages"]
    cols[8]  = TEMPLATE["bid_strategy"]
    cols[9]  = TEMPLATE["enhanced_cpc"]
    cols[10] = TEMPLATE["max_cpc_limit"]
    cols[11] = TEMPLATE["schedule"]
    cols[12] = TEMPLATE["ad_rotation"]
    cols[13] = TEMPLATE["targeting"]
    cols[14] = TEMPLATE["exclusion"]
    cols += [""] * 15             # Headlines 1-15
    cols += [""] * 4              # Descriptions 1-4
    cols += make_tail_cols()
    return ",".join(cols)

def make_ad_group_row(campaign, group):
    cols = make_base_cols(campaign["name"], group["name"])
    cols[16] = TEMPLATE["group_type"]
    cols[18] = TEMPLATE["status"]
    cols += [""] * 15
    cols += [""] * 4
    cols += make_tail_cols(max_cpc=TEMPLATE["kw_max_cpc"])
    return ",".join(cols)

def make_keyword_row(campaign, group, keyword):
    cols = make_base_cols(campaign["name"], group["name"])
    final_url = resolve_url(keyword, group["url"])
    cols[19] = esc(final_url)
    cols += [""] * 15
    cols += [""] * 4
    cols += make_tail_cols(
        keyword=keyword,
        match_type=TEMPLATE["kw_match"],
        status=TEMPLATE["kw_status"],
    )
    return ",".join(cols)

def make_ad_row(campaign, group):
    headlines = group["headlines"] + [""] * (15 - len(group["headlines"]))
    descs = group["descs"] + [""] * (4 - len(group["descs"]))
    cols = make_base_cols(campaign["name"], group["name"])
    cols[17] = TEMPLATE["ad_type"]
    cols[19] = esc(group["url"])
    cols[20] = esc(group["path1"])
    cols[21] = esc(group["path2"])
    cols += [esc(h) for h in headlines]
    cols += [esc(d) for d in descs]
    cols += make_tail_cols(status=TEMPLATE["ad_status"])
    return ",".join(cols)

# Build file 1 rows
rows1 = []
kw_map_hits = 0
kw_map_misses = 0

for campaign in CAMPAIGNS:
    rows1.append(make_campaign_row(campaign))
    for group in campaign["groups"]:
        rows1.append(make_ad_group_row(campaign, group))
        for kw in group["keywords"]:
            if kw.lower().strip() in KEYWORD_URL_MAP:
                kw_map_hits += 1
            else:
                kw_map_misses += 1
            rows1.append(make_keyword_row(campaign, group, kw))
        rows1.append(make_ad_row(campaign, group))

HEADER1 = "Campaign,Campaign Type,Campaign Status,Networks,Budget,Budget type,EU political ads,Languages,Bid Strategy Type,Enhanced CPC,Maximum CPC bid limit,Ad Schedule,Ad rotation,Targeting method,Exclusion method,Ad Group,Ad Group Type,Ad type,Ad Group Status,Final URL,Path 1,Path 2,Headline 1,Headline 2,Headline 3,Headline 4,Headline 5,Headline 6,Headline 7,Headline 8,Headline 9,Headline 10,Headline 11,Headline 12,Headline 13,Headline 14,Headline 15,Description 1,Description 2,Description 3,Description 4,Keyword,Match Type,Max CPC,Status,Location,Shared set type"

path1 = os.path.join(SCRIPT_DIR, "campanhas-anuncios-gads.csv")
write_utf16le_csv(path1, HEADER1, rows1)

# ══════════════════════════════════════════════════════════════════════
# FILE 2: Negative Keywords
# Format: Campaign, Ad Group, Keyword, Type
# Type = "Campaign negative" (campaign-level) or "Negative" (ad-group-level)
# ══════════════════════════════════════════════════════════════════════

rows2 = []
HEADER2 = "Campaign,Ad Group,Keyword,Type"

for campaign in CAMPAIGNS:
    for neg_kw in CAMPAIGN_NEGATIVES:
        rows2.append(f'{esc(campaign["name"])},,{esc(neg_kw)},Campaign negative')

    for group in campaign["groups"]:
        negatives = AD_GROUP_NEGATIVES.get(group["name"], [])
        for neg_kw in negatives:
            rows2.append(f'{esc(campaign["name"])},{esc(group["name"])},{esc(neg_kw)},Negative')

path2 = os.path.join(SCRIPT_DIR, "negativas-gads.csv")
write_utf16le_csv(path2, HEADER2, rows2)

# ══════════════════════════════════════════════════════════════════════
# FILE 3: Sitelinks & Callouts (Assets)
# Sitelinks: Campaign, Sitelink text, Description line 1, Description line 2, Final URL, Status
# Callouts:  Campaign, Callout text, Status
# ══════════════════════════════════════════════════════════════════════

rows3 = []
HEADER3 = "Campaign,Ad Group,Sitelink text,Description line 1,Description line 2,Final URL,Callout text,Status"

for campaign in CAMPAIGNS:
    for sl in SITELINKS:
        rows3.append(
            f'{esc(campaign["name"])},,{esc(sl["text"])},{esc(sl["desc1"])},{esc(sl["desc2"])},{esc(sl["url"])},,Enabled'
        )
    for co in CALLOUTS:
        rows3.append(
            f'{esc(campaign["name"])},,,,,,{esc(co)},Enabled'
        )

path3 = os.path.join(SCRIPT_DIR, "ativos-gads.csv")
write_utf16le_csv(path3, HEADER3, rows3)

# ══════════════════════════════════════════════════════════════════════
# Summary & Validation
# ══════════════════════════════════════════════════════════════════════

total_campaigns = len(CAMPAIGNS)
total_groups = sum(len(c["groups"]) for c in CAMPAIGNS)
total_keywords = sum(len(g["keywords"]) for c in CAMPAIGNS for g in c["groups"])

print(f"=== Generated 3 CSV files ===")
print(f"\n1. {path1}")
print(f"   {len(rows1)} rows (1 campaign row + {total_groups} ad groups + {total_keywords} keywords + {total_campaigns} RSAs)")
print(f"   File size: {os.path.getsize(path1)} bytes")

print(f"\n2. {path2}")
print(f"   {len(rows2)} rows ({len(CAMPAIGN_NEGATIVES)} negatives x {total_campaigns} campaigns + ad-group negatives)")
print(f"   File size: {os.path.getsize(path2)} bytes")

print(f"\n3. {path3}")
print(f"   {len(rows3)} rows ({len(SITELINKS)} sitelinks + {len(CALLOUTS)} callouts) x {total_campaigns} campaigns")
print(f"   File size: {os.path.getsize(path3)} bytes")

print(f"\nKeyword URL map: {kw_map_hits} hits, {kw_map_misses} misses (using category fallback)")

# ── Validation ───────────────────────────────────────────────────────
print("\n--- Running Validation ---")
errors = 0

# Validate file 1 (47 columns)
print(f"\n[File 1] campanhas-anuncios-gads.csv")
with open(path1, "r", encoding="utf-16") as f:
    reader = csv.reader(f)
    header_row = next(reader)
    if len(header_row) != 47:
        print(f"  ERROR: Header has {len(header_row)} columns instead of 47.")
        errors += 1

    for row_idx, row in enumerate(reader, start=2):
        if len(row) != 47:
            print(f"  Row {row_idx}: ERROR - {len(row)} columns instead of 47.")
            errors += 1
            continue

        campaign = row[0]
        ad_group = row[15]
        ad_type = row[17]
        keyword = row[41]

        if ad_type and keyword:
            print(f"  Row {row_idx} ({campaign} -> {ad_group}): ERROR - contains both Ad and Keyword.")
            errors += 1

        for h_idx in range(22, 37):
            if len(row[h_idx]) > 30:
                print(f"  Row {row_idx}: ERROR - Headline {h_idx-21} '{row[h_idx]}' exceeds 30 chars ({len(row[h_idx])}).")
                errors += 1

        for d_idx in range(37, 41):
            if len(row[d_idx]) > 90:
                print(f"  Row {row_idx}: ERROR - Description {d_idx-36} '{row[d_idx]}' exceeds 90 chars ({len(row[d_idx])}).")
                errors += 1

        for p_idx in [20, 21]:
            if len(row[p_idx]) > 15:
                print(f"  Row {row_idx}: ERROR - Path {p_idx-19} '{row[p_idx]}' exceeds 15 chars ({len(row[p_idx])}).")
                errors += 1

# Validate file 2 (4 columns)
print(f"\n[File 2] negativas-gads.csv")
with open(path2, "r", encoding="utf-16") as f:
    reader = csv.reader(f)
    header_row = next(reader)
    if len(header_row) != 4:
        print(f"  ERROR: Header has {len(header_row)} columns instead of 4.")
        errors += 1

    valid_types = {"Negative", "Campaign negative"}
    for row_idx, row in enumerate(reader, start=2):
        if len(row) != 4:
            print(f"  Row {row_idx}: ERROR - {len(row)} columns instead of 4.")
            errors += 1
            continue
        if row[3] not in valid_types:
            print(f"  Row {row_idx}: ERROR - Invalid Type '{row[3]}'.")
            errors += 1

# Validate file 3 (8 columns)
print(f"\n[File 3] ativos-gads.csv")
with open(path3, "r", encoding="utf-16") as f:
    reader = csv.reader(f)
    header_row = next(reader)
    if len(header_row) != 8:
        print(f"  ERROR: Header has {len(header_row)} columns instead of 8.")
        errors += 1

    for row_idx, row in enumerate(reader, start=2):
        if len(row) != 8:
            print(f"  Row {row_idx}: ERROR - {len(row)} columns instead of 8.")
            errors += 1

if errors == 0:
    print("\nSUCCESS: All generated rows passed Google Ads validations successfully!")
else:
    print(f"\nFAILURE: Found {errors} validation errors.")
