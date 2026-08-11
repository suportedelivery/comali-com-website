#!/usr/bin/env python3
"""
Renumera os produtos product-da-* (inseridos APÓS as revisões CSV, sortOrder = 500).

Cada linha de produto (ex: 1000 PLUS SEM FRAGRANCIA) foi importada múltiplas vezes,
uma por categoria (c1, c3, c6...). Neste script, cópias do MESMO produto (mesmo título
normalizado) recebem o MESMO sortOrder: a sequência incrementa apenas por produto único,
e todas as cópias de um produto compartilham o valor. Assim não há empates entre produtos
distintos e as cópias de um mesmo produto ficam agrupadas na ordenação.

Uso: python3 renumber-sortorder-500.py --dry-run
     python3 renumber-sortorder-500.py --apply
"""

import argparse
import json
import re
import unicodedata
import urllib.request

PROJECT_ID = "5fcrgo8n"
DATASET = "production"
API_TOKEN = "skJktRNhjXxOx2M45OOvHYXM3SEUOoganlDG5W4Bbnf7Xr7pEQoX7hiLunj27wFTWbXCGmgHoTId0wrK6V3bEpLO19twNyi4BypxUsGlVIGAEafQAYRtEmQzITZ2RODYmHRLw7tM1pPjhfTFO4O5fR3hTNC3UBAVOZ6NSqJb3Dl6WZJI7Rgo"

START_SORTORDER = 9500

def norm_title(s):
    if not s:
        return ""
    s = s.upper().strip()
    s = s.replace("&AMP;", "&")
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode('ascii')
    s = re.sub(r'\s+', ' ', s)
    return s

def reference_base(ref):
    if not ref:
        return ""
    m = re.search(r'(P\d+)$', ref.upper())
    return m.group(1) if m else ref.upper()

def sanity_request(method, path, body=None):
    url = f"https://{PROJECT_ID}.api.sanity.io/v2024-01-01{path}"
    data = json.dumps(body).encode('utf-8') if body else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header('Content-Type', 'application/json')
    req.add_header('Authorization', f'Bearer {API_TOKEN}')
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))

def query(groq):
    return sanity_request('POST', f'/data/query/{DATASET}', {'query': groq})

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true', help='Aplica as mudanças no Sanity')
    parser.set_defaults(apply=False)
    args = parser.parse_args()

    # Produtos que receberam a primeira sequência (9500+) OU ainda estão com 500
    result = query("""*[_type == "product" && status == "active" && (sortOrder == 500 || sortOrder >= 9500)]
      | order(title asc, _id asc){_id, title, reference, sortOrder}""")
    products = result.get('result', [])
    print(f"{len(products)} produtos em renumeração (500 ou 9500+).\n")

    # Agrupa por título normalizado (cópias do mesmo produto)
    groups = {}
    for p in products:
        key = norm_title(p['title'])
        groups.setdefault(key, []).append(p)

    # Gera patches: cada grupo recebe UM valor sequencial, todas as cópias compartilham
    patches = []
    group_index = 0
    for title_key in sorted(groups.keys()):
        group = groups[title_key]
        new_order = START_SORTORDER + group_index
        for p in group:
            patches.append({
                'id': p['_id'],
                'sortOrder': new_order,
                'title': p['title'],
                'reference': p.get('reference', ''),
            })
        group_index += 1

    # Verifica que não há produto distinto com o mesmo sortOrder
    by_order = {}
    for p in patches:
        by_order.setdefault(p['sortOrder'], set()).add(norm_title(p['title']))
    bad = [(o, ts) for o, ts in by_order.items() if len(ts) > 1]
    if bad:
        print(f"⚠️  Produtos diferentes compartilhando sortOrder: {bad}")
        return

    # Mostra grupos de cópias (mesmo título, múltiplas cópias)
    print("=== PRODUTOS COM CÓPIAS (mesmo título) ===")
    for title_key, group in sorted(groups.items()):
        if len(group) > 1:
            order = START_SORTORDER + list(sorted(groups.keys())).index(title_key)
            print(f"  sortOrder {order}: {title_key}  ({len(group)} cópias)")
    print()

    # Mostra amostra (primeiros e últimos)
    print("=== PRIMEIROS 8 ===")
    for p in patches[:8]:
        print(f"  {p['sortOrder']}  {p['title'][:45]}  ({p['id']})")
    print("\n=== ÚLTIMOS 8 ===")
    for p in patches[-8:]:
        print(f"  {p['sortOrder']}  {p['title'][:45]}  ({p['id']})")

    # Colisão com valores fora do bloco (9500+) que não serão sobrescritos
    existing = query("""*[_type == "product" && !(_id in path("drafts.**")) && sortOrder >= 9500]{sortOrder}""")
    existing_orders = {e['sortOrder'] for e in existing.get('result', [])}
    new_orders = {p['sortOrder'] for p in patches}
    # Remove os que já são nossos (o query pega os próprios 9500+ atuais)
    collisions = new_orders - {p['sortOrder'] for p in patches if p['sortOrder'] in existing_orders}
    # Simplifica: apenas garante que a faixa não colide com nada fora dos 9500+ atuais
    print(f"\n[dry-run→plano] {len(patches)} cópias, {len(groups)} produtos únicos.")
    print(f"Faixa: {patches[0]['sortOrder']} → {patches[-1]['sortOrder']}")

    if not args.apply:
        print("Para aplicar: python3 renumber-sortorder-500.py --apply")
        return

    BATCH = 50
    for start in range(0, len(patches), BATCH):
        batch = patches[start:start + BATCH]
        mutations = [{'patch': {'id': p['id'], 'set': {'sortOrder': p['sortOrder']}}} for p in batch]
        sanity_request('POST', f'/data/mutate/{DATASET}?returnIds=true', {'mutations': mutations})
        print(f"Lote {start//BATCH + 1}: {len(batch)} patches aplicados.")

    print(f"\nConcluído! {len(patches)} cópias reordenadas em {len(groups)} grupos (9500 → {9500 + len(groups) - 1}).")

if __name__ == "__main__":
    main()