#!/usr/bin/env python3
"""Gera CSV de categorias corrigido — adiciona categoria pai onde falta."""
import csv
import sys
from pathlib import Path

INPUT = Path("categorias_produtos_746334_15814f68-c98f-4e3e-ad52-f60b6a103a75.csv")
OUTPUT = Path("categorias_produtos_CORRIGIDO.csv")

# Mapeamento: subcategoria → categoria pai necessária
PARENT_MAP = {
    "67": "63",   # Com Pedal → Lixeiras e Contentores
    "69": "63",   # Sem Pedal → Lixeiras e Contentores
    "65": "63",   # Coleta Seletiva → Lixeiras e Contentores
    "163": "1",   # Dispenser Plástico → Dispenser
}

# Nomes das categorias para referência no CSV corrigido
CAT_NAMES = {
    "1": "Dispenser",
    "63": "Lixeiras e Contentores",
    "67": "Com Pedal",
    "69": "Sem Pedal",
    "65": "Coleta Seletiva",
    "163": "Dispenser Plástico",
}

# Índices das colunas de categoria adicional (0-based)
# Colunas: 0=cód produto, 1=nome, 2=cód categoria, 3=nome categoria, 4-8=categ adicional 1-5
CAT_COLS = [4, 5, 6, 7, 8]

with open(INPUT, "r", encoding="iso-8859-1") as f:
    reader = csv.reader(f, delimiter=";", quotechar='"')
    rows = list(reader)

header = rows[0]
data = rows[1:]

fixes = []

for row in data:
    if len(row) < 9:
        continue

    # Coletar todas as categorias do produto
    all_cats = set()
    for i in [2] + CAT_COLS:  # categoria principal + adicionais
        if i < len(row) and row[i].strip():
            all_cats.add(row[i].strip())

    # Verificar cada subcategoria que precisa de pai
    for subcat, parent in PARENT_MAP.items():
        if subcat in all_cats and parent not in all_cats:
            # Encontrar primeira coluna vazia nas adicionais
            added = False
            for ci in CAT_COLS:
                if ci < len(row) and row[ci].strip() == "":
                    row[ci] = parent
                    fixes.append({
                        "cod": row[0],
                        "nome": row[1][:60],
                        "adicionou": f"{parent} ({CAT_NAMES.get(parent, '?')})",
                        "faltava_para": f"{subcat} ({CAT_NAMES.get(subcat, '?')})",
                    })
                    added = True
                    break
            if not added:
                fixes.append({
                    "cod": row[0],
                    "nome": row[1][:60],
                    "adicionou": "ERRO: sem coluna vazia!",
                    "faltava_para": f"{subcat} ({CAT_NAMES.get(subcat, '?')})",
                })

with open(OUTPUT, "w", encoding="iso-8859-1", newline="") as f:
    writer = csv.writer(f, delimiter=";", quotechar='"')
    writer.writerow(header)
    writer.writerows(data)

print(f"CSV corrigido salvo em: {OUTPUT}")
print(f"Total de correções: {len(fixes)}")
print()
print(f"{'Cód':<6} {'Produto':<62} {'Adicionou':<30} {'Porque faltava'}")
print("-" * 130)
for fx in fixes:
    print(f"{fx['cod']:<6} {fx['nome']:<62} {fx['adicionou']:<30} {fx['faltava_para']}")
