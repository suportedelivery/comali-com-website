#!/usr/bin/env python3
"""Corrige: se a CATEGORIA PRINCIPAL for uma subcategoria, 
troca: coloca o PAI como principal, move a sub para adicional."""
import csv
from pathlib import Path

INPUT = Path("categorias_produtos_746334_15814f68-c98f-4e3e-ad52-f60b6a103a75.csv")
OUTPUT = Path("categorias_produtos_CORRIGIDO_FINAL.csv")

# Mapa: sub → (pai, nome_pai)
SUB_TO_PARENT = {
    "67": ("63", "Lixeiras e Contentores"),   # Com Pedal → Lixeiras
    "69": ("63", "Lixeiras e Contentores"),   # Sem Pedal → Lixeiras
    "65": ("63", "Lixeiras e Contentores"),   # Coleta Seletiva → Lixeiras
    "73": ("63", "Lixeiras e Contentores"),   # Lixeira para Copos → Lixeiras
    "159": ("63", "Lixeiras e Contentores"),  # Lixeiras Inox → Lixeiras
    "155": ("25", "Acessórios/ Diversos"),    # Tampas → Acessórios
    "9": ("1", "Dispenser"),                  # Secador → Dispenser
    "51": ("1", "Dispenser"),                 # Sabonete → Dispenser
    "59": ("1", "Dispenser"),                 # Papel Toalha → Dispenser
    "57": ("1", "Dispenser"),                 # Papel Hig Rolão → Dispenser
    "11": ("1", "Dispenser"),                 # Dispenser Copos → Dispenser
    "163": ("1", "Dispenser"),                # Dispenser Plástico → Dispenser
}

with open(INPUT, "r", encoding="iso-8859-1") as f:
    reader = csv.reader(f, delimiter=";", quotechar='"')
    rows = list(reader)

header = rows[0]
data = rows[1:]
fixes = []

for row in data:
    if len(row) < 4:
        continue
    cod = row[0].strip()
    nome = row[1]
    main_cat = row[2].strip()
    main_name = row[3].strip()

    # Todas as categorias atuais (incluindo col 3)
    all_cats = set()
    for i in range(2, 9):
        if i < len(row) and row[i].strip():
            all_cats.add(row[i].strip())

    # A categoria principal é uma sub que precisa de pai?
    if main_cat in SUB_TO_PARENT:
        parent, parent_name = SUB_TO_PARENT[main_cat]
        
        # Se o pai já está em alguma coluna, só garante que a principal está certa
        if parent in all_cats:
            # Pai já existe, mas vamos ver se ele está na coluna principal
            # Se o pai já está em algum adicional, mas a principal é a sub, precisamos trocar
            if row[2].strip() != parent:
                # Troca: pai vai para principal, sub vai para adicional
                old_main = row[2]
                old_main_name = row[3]
                
                # Encontra onde o pai está e remove
                parent_col = None
                for i in [5, 6, 7, 8]:
                    if i < len(row) and row[i].strip() == parent:
                        parent_col = i
                        break
                
                # Coloca pai como principal
                row[2] = parent
                row[3] = parent_name
                
                # Coloca sub em um slot vazio ou onde pai estava
                if parent_col:
                    row[parent_col] = old_main
                    # Se tiver col 9 (Nome do adicionai5) também precisa
                else:
                    # Põe num slot vazio
                    for i in [5, 6, 7, 8]:
                        if i < len(row) and row[i].strip() == "":
                            row[i] = old_main
                            break
                
                fixes.append(f"{cod}: TROCA principal {main_name}({main_cat}) → {parent_name}({parent}), sub vira adicional")
        else:
            # Pai NÃO existe — adiciona como principal, sub vira adicional
            old_main = row[2]
            old_main_name = row[3]
            
            row[2] = parent
            row[3] = parent_name
            
            # Sub vai para primeiro adicional vazio (col 4 = Adicional 1)
            for i in [4, 5, 6, 7, 8]:
                if i < len(row) and row[i].strip() == "":
                    row[i] = old_main
                    break
            
            fixes.append(f"{cod}: CRIA principal {parent_name}({parent}) + sub {old_main_name}({old_main}) vira adicional")
    
    # Agora verifica se falta algum pai para subs que estão em adicionais
    all_cats = set()
    for i in range(2, 9):
        if i < len(row) and row[i].strip():
            all_cats.add(row[i].strip())
    
    for sub, (parent, parent_name) in SUB_TO_PARENT.items():
        if sub in all_cats and parent not in all_cats:
            # Adiciona pai no primeiro slot vazio
            added = False
            for i in [5, 6, 7, 8]:
                if i < len(row) and row[i].strip() == "":
                    row[i] = parent
                    fixes.append(f"{cod}: +{parent_name}({parent}) faltante para sub {sub}")
                    added = True
                    break
            if not added:
                # Tenta col 4 também
                if len(row) < 5 or row[4].strip() == "":
                    row[4] = parent
                    fixes.append(f"{cod}: +{parent_name}({parent}) faltante para sub {sub} (col 4)")
                    added = True
    
    # Remove duplicatas (se tiver códigos iguais em colunas diferentes)
    seen_codes = set()
    for i in [2, 5, 6, 7, 8]:
        if i < len(row):
            c = row[i].strip()
            if c and c in seen_codes:
                row[i] = ""
            elif c:
                seen_codes.add(c)

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
print()
for f in fixes:
    print(f"  {f}")

# Verificação
print("\n=== VERIFICAÇÃO ===")
with open(OUTPUT, "r", encoding="iso-8859-1") as f:
    verif = list(csv.reader(f, delimiter=";", quotechar='"'))[1:]

still_missing = 0
single_main_sub = 0
for row in verif:
    if len(row) < 4: continue
    main_cat = row[2].strip()
    if main_cat in SUB_TO_PARENT:
        parent, _ = SUB_TO_PARENT[main_cat]
        all_cats = set()
        for i in range(2, 9):
            if i < len(row) and row[i].strip():
                all_cats.add(row[i].strip())
        if parent not in all_cats:
            still_missing += 1
            print(f"  ERR: {row[0]:>6} main={main_cat} sem pai={parent}")
    # Verificar sub sem pai
    all_cats = set()
    for i in range(2, 9):
        if i < len(row) and row[i].strip():
            all_cats.add(row[i].strip())
    for sub, (parent, pn) in SUB_TO_PARENT.items():
        if sub in all_cats and parent not in all_cats:
            still_missing += 1
            print(f"  MISS: {row[0]:>6} sub {sub} sem pai {parent}")

if still_missing == 0:
    print("  TUDO OK — nenhuma sub sem pai e nenhuma sub como principal sem pai!")
    
# Amostra
print()
print("=== AMOSTRA (prod 27, 51, 71, 365) ===")
for row in verif:
    if row[0].strip() in ['27','51','71','365','115']:
        print(f'  {row[0]:>6}: cols={";".join(row[:9])}')