#!/usr/bin/env python3
"""
Verifica a consistência dos dados entre cópias duplicadas do mesmo grupo.

Compara, para cada grupo de títulos duplicados:
  - descrição (description + descriptionHTML)
  - número de imagens
  - variações (hasVariations / count)
  - preço
  - stock

Se todas as cópias forem idênticas nesses campos, a consolidação (manter 1 +
deletar resto) é segura. Se divergirem, o relatório aponta quais campos diferem.

Uso:
  python3 check-dup-consistency.py
"""

import json
import os
import urllib.request
import urllib.parse
import re

PROJECT_ID = "5fcrgo8n"
DATASET = "production"
API_TOKEN = os.environ.get("SANITY_API_TOKEN") or ""


def load_token():
    if API_TOKEN:
        return API_TOKEN
    try:
        with open(".env.local") as f:
            for line in f:
                line = line.strip()
                if line.startswith("SANITY_API_TOKEN="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    return API_TOKEN


def query_groq(groq):
    url = f"https://{PROJECT_ID}.api.sanity.io/v2023-01-01/data/query/{DATASET}?query={urllib.parse.quote(groq)}"
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {API_TOKEN}")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())["result"]


def norm(title):
    t = title.upper()
    t = re.sub(r"[^A-Z0-9]+", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def main():
    global API_TOKEN
    API_TOKEN = load_token()
    if not API_TOKEN:
        print("ERRO: SANITY_API_TOKEN não encontrado.")
        return

    groq = """*[_type == "product" && status == "active"]{_id, title, reference, description, descriptionHTML, price, stock, hasVariations, "nimg": count(images), "nvar": count(variations), "cats": categories[]->{title, "slug": slug.current}}"""
    products = query_groq(groq)
    products = [p for p in products if not p["_id"].startswith(("drafts.", "versions."))]

    groups = {}
    for p in products:
        groups.setdefault(norm(p["title"]), []).append(p)

    groups = {k: v for k, v in groups.items() if len(v) >= 2}

    consistent = 0
    divergent = 0
    for key, items in sorted(groups.items(), key=lambda kv: -len(kv[1])):
        issues = []
        # compara cada campo contra o primeiro item do grupo
        ref = items[0]
        for field in ["description", "descriptionHTML", "price", "stock", "hasVariations", "nimg", "nvar"]:
            vals = {it.get(field) for it in items}
            if len(vals) > 1:
                issues.append(field)
        if issues:
            divergent += 1
            print(f"[DIVERGE] {items[0]['title'][:60]} ({len(items)} cópias) campos: {', '.join(issues)}")
            for it in items:
                print(f"    {it['_id']} ref={it['reference']} desc={str(it.get('description'))[:40]!r} img={it.get('nimg')} var={it.get('nvar')} price={it.get('price')} stock={it.get('stock')}")
            print()
        else:
            consistent += 1

    print(f"\nGrupos CONSISTENTES (merge seguro): {consistent}")
    print(f"Grupos DIVERGENTES (precisam revisão): {divergent}")


if __name__ == "__main__":
    main()
