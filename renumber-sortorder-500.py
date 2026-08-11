#!/usr/bin/env python3
"""
Renumera os produtos com sortOrder == 500 (produtos product-da-* inseridos
antes das revisões de CSV, sem catalogação de sortOrder).

Estratégia: atribui uma sequência única (START, START+1, ...) ordenada por título,
começando acima do maior sortOrder atual do dataset (9430) para não colidir com
nenhum valor existente (ativos, drafts ou discontinued).

Uso: python3 renumber-sortorder-500.py --dry-run
     python3 renumber-sortorder-500.py --apply
"""

import argparse
import json
import urllib.request

PROJECT_ID = "5fcrgo8n"
DATASET = "production"
API_TOKEN = "skJktRNhjXxOx2M45OOvHYXM3SEUOoganlDG5W4Bbnf7Xr7pEQoX7hiLunj27wFTWbXCGmgHoTId0wrK6V3bEpLO19twNyi4BypxUsGlVIGAEafQAYRtEmQzITZ2RODYmHRLw7tM1pPjhfTFO4O5fR3hTNC3UBAVOZ6NSqJb3Dl6WZJI7Rgo"

# Começa acima do maior sortOrder atual (9430 em drafts descontinuados)
START_SORTORDER = 9500

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
    parser.add_argument('--dry-run', dest='apply', action='store_false', help='Apenas mostra o plano')
    parser.set_defaults(apply=False)
    args = parser.parse_args()

    # Busca produtos ativos com sortOrder 500, ordenado por título
    result = query("""*[_type == "product" && status == "active" && sortOrder == 500]
      | order(title asc, _id asc){_id, title, reference, sortOrder}""")
    products = result.get('result', [])
    print(f"{len(products)} produtos com sortOrder == 500 encontrados.\n")

    # Monta a sequência
    patches = []
    for i, p in enumerate(products):
        new_order = START_SORTORDER + i
        patches.append({
            'id': p['_id'],
            'sortOrder': new_order,
            'title': p['title'],
            'reference': p.get('reference', ''),
        })

    # Mostra amostra (primeiros e últimos)
    print("=== PRIMEIROS 5 ===")
    for p in patches[:5]:
        print(f"  {p['sortOrder']}  {p['title'][:45]}  ({p['id']})")
    print("\n=== ÚLTIMOS 5 ===")
    for p in patches[-5:]:
        print(f"  {p['sortOrder']}  {p['title'][:45]}  ({p['id']})")

    # Verifica que não há colisão
    existing = query("""*[_type == "product" && sortOrder >= 9500]{sortOrder}""")
    existing_orders = {e['sortOrder'] for e in existing.get('result', [])}
    collisions = [p['sortOrder'] for p in patches if p['sortOrder'] in existing_orders]
    if collisions:
        print(f"\n⚠️  COLISÃO com valores existentes: {collisions}")
        return

    if not args.apply:
        print(f"\n[dry-run] Nenhuma mudança aplicada. Total: {len(patches)} patches.")
        print(f"Faixa: {patches[0]['sortOrder']} → {patches[-1]['sortOrder']}")
        print("Para aplicar: python3 renumber-sortorder-500.py --apply")
        return

    # Aplica em lotes de 50 (mutações atomizadas por lote)
    BATCH = 50
    for start in range(0, len(patches), BATCH):
        batch = patches[start:start + BATCH]
        mutations = [{'patch': {'id': p['id'], 'set': {'sortOrder': p['sortOrder']}}} for p in batch]
        resp = sanity_request('POST', f'/data/mutate/{DATASET}?returnIds=true', {'mutations': mutations})
        print(f"Lote {start//BATCH + 1}: {len(batch)} patches aplicados.")

    print(f"\nConcluído! {len(patches)} produtos reordenados ({patches[0]['sortOrder']} → {patches[-1]['sortOrder']}).")

if __name__ == "__main__":
    main()