#!/usr/bin/env python3
"""Gera CSV de categorias corrigido v2 — todas as correções de hierarquia."""
import csv
from pathlib import Path

INPUT = Path("categorias_produtos_CORRIGIDO.csv")
OUTPUT = Path("categorias_produtos_CORRIGIDO_v2.csv")

# Mapeamento: subcategoria → categoria pai necessária
PARENT_MAP = {
    "67": "63",   # Com Pedal → Lixeiras e Contentores
    "69": "63",   # Sem Pedal → Lixeiras e Contentores
    "65": "63",   # Coleta Seletiva → Lixeiras e Contentores
    "163": "1",   # Dispenser Plástico → Dispenser
    "159": "63",  # Lixeiras Inox → Lixeiras e Contentores
    "155": "25",  # Tampas → Acessórios/Diversos
    "9": "1",     # Secador de Mãos → Dispenser
    "51": "1",    # Sabonete Líquido → Dispenser
    "59": "1",    # Papel Toalha Interfolhado → Dispenser
    "57": "1",    # Papel Higiênico Rolão → Dispenser
    "11": "1",    # Dispenser Copos → Dispenser
    "73": "63",   # Lixeira para Copos → Lixeiras e Contentores
}

# Regras especiais por código de produto (override do PARENT_MAP)
PRODUCT_OVERRIDE = {
    "1329": {"141": "1"},     # Dispenser Fio Dental → Dispenser
    "1445": {"141": "117"},   # Refil Fio Dental → Acessórios para Reposição
    "1639": {"141": "117"},   # Refil Enxaguante → Acessórios para Reposição
    "2143": {"141": "117"},   # Refil Enxaguante → Acessórios para Reposição
    "1623": {"141": "25"},    # Porta Luvas Plástico → Acessórios
    "2047": {"141": "25"},    # Porta Luvas Inox → Acessórios
    "2061": {"141": "25"},    # Tapete Higienizador → Acessórios
    "2063": {"141": "25"},    # Tapete Higienizador → Acessórios
    "2065": {"141": "25"},    # Tapete Higienizador → Acessórios
    "2067": {"141": "25"},    # Tapete Higienizador → Acessórios
    "2069": {"141": "25"},    # Tapete Higienizador → Acessórios
    "2121": {"141": "25"},    # Tapete Higienizador → Acessórios
    "2123": {"141": "25"},    # Tapete Higienizador → Acessórios
}

CAT_NAMES = {
    "1": "Dispenser", "25": "Acessórios/Diversos", "63": "Lixeiras e Contentores",
    "117": "Acessórios para Reposição",
}

with open(INPUT, "r", encoding="iso-8859-1") as f:
    reader = csv.reader(f, delimiter=";", quotechar='"')
    rows = list(reader)

header = rows[0]
data = rows[1:]
fixes = []

for row in data:
    if len(row) < 9:
        continue
    cod = row[0].strip()

    # Coletar todas as categorias atuais
    all_cats = set()
    for i in [2, 4, 5, 6, 7, 8]:
        if i < len(row) and row[i].strip():
            all_cats.add(row[i].strip())

    # 1) Aplicar overrides especiais por produto
    if cod in PRODUCT_OVERRIDE:
        for old_cat, new_parent in PRODUCT_OVERRIDE[cod].items():
            if old_cat in all_cats and new_parent not in all_cats:
                for ci in [4, 5, 6, 7, 8]:
                    if ci < len(row) and row[ci].strip() == "":
                        row[ci] = new_parent
                        fixes.append(f"{cod}: {row[1][:50]} | +{new_parent}({CAT_NAMES.get(new_parent,'?')}) para {old_cat}")
                        break

    # 2) Aplicar regras gerais de hierarquia
    all_cats = set()
    for i in [2, 4, 5, 6, 7, 8]:
        if i < len(row) and row[i].strip():
            all_cats.add(row[i].strip())

    for subcat, parent in PARENT_MAP.items():
        if subcat in all_cats and parent not in all_cats:
            for ci in [4, 5, 6, 7, 8]:
                if ci < len(row) and row[ci].strip() == "":
                    row[ci] = parent
                    fixes.append(f"{cod}: {row[1][:50]} | +{parent}({CAT_NAMES.get(parent,'?')}) para {subcat}")
                    break

with open(OUTPUT, "w", encoding="iso-8859-1", newline="") as f:
    writer = csv.writer(f, delimiter=";", quotechar='"')
    writer.writerow(header)
    writer.writerows(data)

# Also generate UTF-8 version
with open(OUTPUT.with_name(OUTPUT.name.replace(".csv", "_UTF8.csv")), "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f, delimiter=";", quotechar='"')
    writer.writerow(header)
    writer.writerows(data)

print(f"CSV v2 salvo: {OUTPUT}")
print(f"Total correções nesta rodada: {len(fixes)}")
print()
for fx in fixes:
    print(f"  {fx}")
