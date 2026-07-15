#!/usr/bin/env python3
"""Categoriza produtos analisando o NOME do produto."""
import csv
from pathlib import Path

INPUT = Path("categorias_produtos_CORRIGIDO_v2.csv")
OUTPUT = Path("categorias_produtos_CORRIGIDO_v3.csv")

# Categorias alvo
CAT = {
    "lix":   "63",  # Lixeiras e Contentores
    "disp":  "1",   # Dispenser
    "acc":   "25",  # Acessórios/Diversos
    "rep":   "117", # Acessórios para Reposição
    "equip": "17",  # Equipamentos de Limpeza
}

# Subcategorias
SUB = {
    "pedal":     "67",  # Com Pedal
    "sempedal":  "69",  # Sem Pedal
    "coleta":    "65",  # Coleta Seletiva
    "inox":      "159", # Lixeiras Inox
    "plastico":  "163", # Dispenser Plástico
    "copos":     "11",  # Dispenser Copos
    "sabonete":  "51",  # Sabonete Líquido
    "papeltoalha": "59", # Papel Toalha Interfolhado
    "papelhirolao": "57", # Papel Higiênico Rolão
    "secador":   "9",   # Secador de Mãos
    "tampa":     "155", # Tampas
}

def classify(name):
    """Retorna (categoria_pai, subcategorias) baseado no nome."""
    n = name.lower()
    parents = set()
    subs = set()

    # === LIXEIRAS / CONTENTORES / RECIPIENTES ===
    lix_kw = ["lixeira", "lixo", "contentor", "container", "recipiente"]
    if any(k in n for k in lix_kw):
        parents.add(CAT["lix"])

    # === DISPENSERS / SABONETEIRAS / TOALHEIROS / SECADORES ===
    disp_kw = ["dispenser", "saboneteira", "toalheiro", "porta papel",
                "secador de mãos", "secador mao", "dispensador"]
    if any(k in n for k in disp_kw):
        parents.add(CAT["disp"])

    # === ACESSÓRIOS ===
    acc_kw = ["tampa", "tampas", "aro", "porta luvas", "tapete",
              "cinzeiro", "bituqueira", "placa", "sinali"]
    if any(k in n for k in acc_kw):
        parents.add(CAT["acc"])

    # === REPOSIÇÃO ===
    rep_kw = ["refil"]
    if any(k in n for k in rep_kw):
        parents.add(CAT["rep"])

    # === EQUIPAMENTOS DE LIMPEZA ===
    equip_kw = ["carro", "carro_extra", "mop", " espanador", "vassoura",
                "bac", "esfregão", "pano", "rodo"]
    if any(k in n for k in equip_kw):
        parents.add(CAT["equip"])

    # === SUBCATEGORIAS ===
    if "pedal" in n and "sem pedal" not in n and "sem pedal" not in n:
        subs.add(SUB["pedal"])
    if "sem pedal" in n or "s/ pedal" in n:
        subs.add(SUB["sempedal"])
    if "coleta seletiva" in n or "seletiva" in n:
        subs.add(SUB["coleta"])
    if "inox" in n or "aço inox" in n or "aço inox" in n:
        subs.add(SUB["inox"])
    if "plástico" in n or "plastico" in n:
        subs.add(SUB["plastico"])
    if "copo" in n or "copos" in n or "papacopo" in n:
        subs.add(SUB["copos"])
    if "sabonete" in n or "saboneteira" in n:
        subs.add(SUB["sabonete"])
    if "papel toalha" in n or "toalheiro" in n or "interfolhado" in n or "interfolhado" in n:
        subs.add(SUB["papeltoalha"])
    if "papel higiênico" in n or "papel higienico" in n or "higiênico rolão" in n or "higienico rolo" in n:
        subs.add(SUB["papelhirolao"])
    if "secador" in n:
        subs.add(SUB["secador"])

    return parents, subs


with open(INPUT, "r", encoding="iso-8859-1") as f:
    reader = csv.reader(f, delimiter=";", quotechar='"')
    rows = list(reader)

header = rows[0]
data = rows[1:]
changes = []

for row in data:
    if len(row) < 9:
        continue
    nome = row[1]
    cod = row[0].strip()

    # Categorias atuais
    current = set()
    for i in [2, 4, 5, 6, 7, 8]:
        if i < len(row) and row[i].strip():
            current.add(row[i].strip())

    # Classificar por nome
    new_parents, new_subs = classify(nome)

    # O que precisa adicionar?
    to_add = set()
    for p in new_parents:
        if p not in current:
            to_add.add(p)
    for s in new_subs:
        if s not in current:
            # Só adiciona sub se o pai também está presente (ou será adicionado)
            parent_of_sub = None
            for pp, ss in SUB.items():
                if ss == s:
                    # Verificar se o pai correspondente está em new_parents ou current
                    if pp in ["pedal", "sempedal", "coleta", "inox"]:
                        parent_of_sub = CAT["lix"]
                    elif pp in ["plastico", "copos", "sabonete", "papeltoalha", "papelhirolao", "secador"]:
                        parent_of_sub = CAT["disp"]
                    elif pp == "tampa":
                        parent_of_sub = CAT["acc"]
            if parent_of_sub and (parent_of_sub in current or parent_of_sub in new_parents):
                to_add.add(s)

    # Apicionar na primeira coluna vazia
    for cat in to_add:
        added = False
        for ci in [4, 5, 6, 7, 8]:
            if ci < len(row) and row[ci].strip() == "":
                row[ci] = cat
                changes.append(f"{cod}: +{cat} | {nome[:55]}")
                added = True
                break
        if not added:
            changes.append(f"{cod}: ERRO sem espaço! +{cat} | {nome[:55]}")

# Salvar
with open(OUTPUT, "w", encoding="iso-8859-1", newline="") as f:
    writer = csv.writer(f, delimiter=";", quotechar='"')
    writer.writerow(header)
    writer.writerows(data)

# UTF-8
with open(OUTPUT.with_name(OUTPUT.name.replace(".csv", "_UTF8.csv")), "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f, delimiter=";", quotechar='"')
    writer.writerow(header)
    writer.writerows(data)

print(f"CSV v3 salvo: {OUTPUT}")
print(f"Alterações: {len(changes)}")
print()
for c in changes:
    print(f"  {c}")
