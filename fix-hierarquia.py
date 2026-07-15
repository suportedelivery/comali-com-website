#!/usr/bin/env python3
"""Corrige APENAS hierarquia: subcategoria SEM seu pai = adiciona o pai.
Baseado no ARQUIVO ORIGINAL. NÃO mexe em categorias existentes.
"""
import csv
from pathlib import Path

INPUT = Path("categorias_produtos_746334_15814f68-c98f-4e3e-ad52-f60b6a103a75.csv")
OUTPUT = Path("categorias_produtos_CORRIGIDO_hierarquia.csv")

PARENT_MAP = {
    "67": "63",   # Com Pedal → Lixeiras e Contentores
    "69": "63",   # Sem Pedal → Lixeiras e Contentores
    "65": "63",   # Coleta Seletiva → Lixeiras e Contentores
    "73": "63",   # Lixeira para Copos → Lixeiras e Contentores
    "159": "63",  # Lixeiras Inox → Lixeiras e Contentores
    "155": "25",  # Tampas → Acessórios/Diversos
    "9": "1",     # Secador de Mãos → Dispenser
    "51": "1",    # Sabonete Líquido → Dispenser
    "59": "1",    # Papel Toalha Interfolhado → Dispenser
    "57": "1",    # Papel Higiênico Rolão → Dispenser
    "11": "1",    # Dispenser Copos → Dispenser
    "163": "1",   # Dispenser Plástico → Dispenser
}

CAT_NAMES = {
    "1": "Dispenser", "25": "Acessórios/Diversos", "63": "Lixeiras e Contentores",
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

    current_cats = set()
    for i in [2, 4, 5, 6, 7, 8]:
        if i < len(row) and row[i].strip():
            current_cats.add(row[i].strip())

    for subcat, parent in PARENT_MAP.items():
        if subcat in current_cats and parent not in current_cats:
            # Add parent to first empty slot
            added = False
            for ci in [4, 5, 6, 7, 8]:
                if ci < len(row) and row[ci].strip() == "":
                    row[ci] = parent
                    fixes.append(f"{cod}: {row[1][:55]} | +{parent}({CAT_NAMES.get(parent,'?')}) p/ sub {subcat}")
                    added = True
                    break
            if not added:
                fixes.append(f"{cod}: ERRO sem espaço! | {row[1][:55]}")

with open(OUTPUT, "w", encoding="iso-8859-1", newline="") as f:
    writer = csv.writer(f, delimiter=";", quotechar='"')
    writer.writerow(header)
    writer.writerows(data)

with open(OUTPUT.with_name(OUTPUT.name.replace(".csv", "_UTF8.csv")), "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f, delimiter=";", quotechar='"')
    writer.writerow(header)
    writer.writerows(data)

print(f"CSV: {OUTPUT}")
print(f"Correções: {len(fixes)}")
for f in fixes:
    print(f"  {f}")