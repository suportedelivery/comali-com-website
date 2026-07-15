#!/usr/bin/env python3
"""Corrige categorias no REVISÃO baseado no NOME do produto.
- Vazios → Variedades
- Nome tem plástico e em Dispenser → + Dispenser Plástico
- Nome tem inox/aço e é Lixeira → + Lixeiras Inox
- Nome tem inox/aço e é Dispenser → + Dispenser Inox
- Ordem invertida → corrige (pai primeiro)
- Sub sem pai → adiciona pai"""
import csv, unicodedata
from pathlib import Path

INPUT = Path("REVISÃO produtos_746334_cfdc6490-1c25-4be0-9cda-6e6993d81d36.csv")
OUTPUT = Path("REVISÃO_CORRIGIDO.csv")

def norm(s):
    s = s.lower()
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode('ascii')
    return s.strip()

# Que categorias são "sub" que precisam de um pai
SUB_PARENT_MAP = {
    'Com Pedal': 'Lixeiras e Contentores',
    'Sem Pedal': 'Lixeiras e Contentores',
    'Coleta Seletiva': 'Lixeiras e Contentores',
    'Lixeira para Copos': 'Lixeiras e Contentores',
    'Lixeiras Inox': 'Lixeiras e Contentores',
    'Lixeiras Plástico': 'Lixeiras e Contentores',
    'Tampas': 'Acessórios',
    'Secador de Mãos': 'Dispensers',
    'Sabonete Líquido': 'Dispensers',
    'Sabonete Espuma': 'Dispensers',
    'Papel Toalha Interfolhado': 'Dispensers',
    'Papel Higiênico Rolão': 'Dispensers',
    'Papel Toalha Bobina': 'Dispensers',
    'Dispenser Copos': 'Dispensers',
    'Dispenser Plástico': 'Dispensers',
    'Dispenser Inox': 'Dispensers',
}

fixes = []

with open(INPUT, "r", encoding="utf-8") as f:
    reader = csv.reader(f, delimiter=",", quotechar='"')
    header = next(reader)
    rows = list(reader)

for row in rows:
    if len(row) < 3:
        continue
    nome = row[1]
    cats_str = row[2].strip()
    refer = row[3].strip() if len(row) > 3 else ""

    parts = [p.strip() for p in cats_str.split("/")] if cats_str else []
    norm_parts = [norm(p) for p in parts]
    norm_cats = norm(cats_str)
    nomenorm = norm(nome)

    # === 1. CATEGORIA VAZIA ===
    if not cats_str:
        row[2] = "Variedades"
        fixes.append(f"{refer}: VAZIO → Variedades | {nome[:40]}")
        continue

    # === 2. ORDEM INVERTIDA: sub como primeiro elemento sem pai no string ===
    # Se a primeira parte é uma sub e o pai não está em lugar nenhum
    need_reorder = False
    new_parts = list(parts)
    
    if len(parts) >= 1:
        np0 = norm_parts[0]
        for sub, parent in SUB_PARENT_MAP.items():
            nsub = norm(sub)
            nparent = norm(parent)
            if np0 == nsub and nparent not in norm_cats:
                # Pai está faltando → colocar no início
                new_parts = [parent] + parts
                need_reorder = True
                break
            elif np0 == nsub and nparent in norm_cats:
                # Pai existe em alguma posição → reordenar: pai primeiro, depois sub
                # Remove pai da posição atual, coloca no início
                new_parts = [p for p in parts if norm(p) != nparent]
                new_parts = [parent] + new_parts
                need_reorder = True
                break
    
    if need_reorder:
        old = cats_str
        new = " / ".join(new_parts)
        if new != old:
            row[2] = new
            fixes.append(f"{refer}: ORDEM \"{old}\" → \"{new}\" | {nome[:35]}")
            # Atualiza para continuação
            parts = new_parts
            norm_parts = [norm(p) for p in parts]
            norm_cats = norm(new)

    # === 3. ADICIONAR SUBCATEGORIAS FALTANTES BASEADO NO NOME ===
    additions = []
    norm_parts = [norm(p) for p in parts]
    norm_cats = norm(" ".join(parts))

    # Verificar cada parte existente e se o nome sugere algo faltando
    has_lixeiras = any('lixeir' in np or np == 'lixeiras e contentores' for np in norm_parts)
    has_dispensers = any('dispenser' in np or 'dispensers' in np for np in norm_parts)

    # === Para produtos em Lixeiras ===
    # Só adiciona subcategoria se o CONTEXTO do nome confirmar
    if has_lixeiras:
        is_lixeira = any(kw in nomenorm for kw in ['lixeira', 'lixo', 'contentor'])
        if is_lixeira and ('inox' in nomenorm or 'aco inox' in nomenorm):
            if 'lixeiras inox' not in norm_parts:
                additions.append('Lixeiras Inox')
        if is_lixeira and ('plastico' in nomenorm or 'plástico' in norm(nome)):
            if 'lixeiras plástico' not in norm_cats and 'lixeiras plastico' not in norm_cats:
                additions.append('Lixeiras Plástico')
        if 'pedal' in nomenorm and 'sem pedal' not in nomenorm:
            if 'com pedal' not in norm_parts:
                additions.append('Com Pedal')
        if 'sem pedal' in nomenorm:
            if 'sem pedal' not in norm_parts:
                additions.append('Sem Pedal')
        if 'copo' in nomenorm or 'descartavel' in nomenorm:
            if 'lixeira para copos' not in norm_cats:
                additions.append('Lixeira para Copos')

    # === Para produtos em Dispensers ===
    # Só adiciona sub se o nome contém a palavra dispenser + material
    if has_dispensers:
        is_dispenser = any(kw in nomenorm for kw in ['dispenser', 'saboneteira', 'toalheiro', 'porta papel', 'porta copos', 'embalador'])
        if is_dispenser and ('plastico' in nomenorm or 'plástico' in norm(nome)):
            if 'dispenser plástico' not in norm_cats and 'dispenser plastico' not in norm_cats:
                additions.append('Dispenser Plástico')
        if is_dispenser and ('inox' in nomenorm or 'aco inox' in nomenorm):
            if 'dispenser inox' not in norm_cats:
                additions.append('Dispenser Inox')
        if is_dispenser and ('copo' in nomenorm):
            if 'dispenser copos' not in norm_parts:
                additions.append('Dispenser Copos')
        if 'sabonete' in nomenorm and any(kw in nomenorm for kw in ['saboneteira', 'sabonete', 'reservatório', 'reservatorio']):
            if 'sabonete líquido' not in norm_cats and 'sabonete liquido' not in norm_cats:
                if 'espuma' in nomenorm:
                    if 'sabonete espuma' not in norm_cats:
                        additions.append('Sabonete Espuma')
                else:
                    additions.append('Sabonete Líquido')
        if 'papel toalha' in nomenorm or 'toalheiro' in nomenorm or 'interfolhado' in nomenorm:
            if 'papel toalha interfolhado' not in norm_cats and 'papel toalha bobina' not in norm_cats:
                if 'bobina' in nomenorm:
                    additions.append('Papel Toalha Bobina')
                else:
                    additions.append('Papel Toalha Interfolhado')
        if 'papel higiênico' in nomenorm or 'papel higienico' in nomenorm or 'rolão' in nomenorm or 'rolao' in nomenorm:
            if 'papel higiênico rolão' not in norm_cats and 'papel higienico rolao' not in norm_cats:
                additions.append('Papel Higiênico Rolão')
        if 'secador de mãos' in nomenorm or 'secador de maos' in nomenorm or 'secador mao' in nomenorm:
            if 'secador de mãos' not in norm_cats and 'secador de maos' not in norm_cats:
                additions.append('Secador de Mãos')

    if additions:
        for a in additions:
            na = norm(a)
            if na not in norm_parts:
                parts.append(a)
        new = " / ".join(parts)
        if new != cats_str:
            row[2] = new
            fixes.append(f"{refer}: +{', '.join(additions)} | {nome[:35]}")

with open(OUTPUT, "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f, delimiter=",", quotechar='"')
    writer.writerow(header)
    writer.writerows(rows)

print(f"Correções: {len(fixes)}")
print()
for f in fixes:
    print(f"  {f}")
print(f"\nSalvo: {OUTPUT}")
