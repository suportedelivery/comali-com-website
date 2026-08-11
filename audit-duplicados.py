#!/usr/bin/env python3
"""
Audita produtos duplicados no Sanity: agrupa produtos ATIVOS por título
normalizado e lista os grupos com mais de uma ocorrência (mesmo produto
importado em categorias diferentes).

Uso:
  python3 audit-duplicados.py            # lista grupos duplicados
  python3 audit-duplicados.py --json     # saída JSON completa
"""

import argparse
import json
import os
import urllib.request

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
    import re
    t = title.upper()
    t = re.sub(r"[^A-Z0-9]+", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def main():
    global API_TOKEN
    import urllib.parse
    API_TOKEN = load_token()
    if not API_TOKEN:
        print("ERRO: SANITY_API_TOKEN não encontrado (use .env.local ou env).")
        return

    parser = argparse.ArgumentParser()
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--min", type=int, default=2, help="mínimo de ocorrências (default 2)")
    args = parser.parse_args()

    groq = """*[_type == "product" && status == "active"]{_id, title, reference, "cats": categories[]->{title, "slug": slug.current}}"""
    products = query_groq(groq)
    # Descarta drafts/versions (mesmo documento em estado draft não é duplicata real)
    products = [p for p in products if not p["_id"].startswith(("drafts.", "versions."))]
    print(f"Produtos ativos (published): {len(products)}\n")

    groups = {}
    for p in products:
        key = norm(p["title"])
        groups.setdefault(key, []).append(p)

    dups = {k: v for k, v in groups.items() if len(v) >= args.min}

    print(f"Grupos com {args.min}+ ocorrências (mesmo título): {len(dups)}")
    print(f"Produtos envolvidos em duplicatas: {sum(len(v) for v in dups.values())}")
    print(f"Excesso de cópias a consolidar/deletar: {sum(len(v) - 1 for v in dups.values())}\n")

    for key, items in sorted(dups.items(), key=lambda kv: -len(kv[1])):
        print(f"=== {items[0]['title'][:80]}  ({len(items)} cópias) ===")
        for it in items:
            cats = ", ".join(c["title"] for c in (it["cats"] or [])) or "(sem categoria)"
            print(f"   {it['_id']}  ref={it['reference']}  -> {cats}")
        print()

    if args.json:
        print(json.dumps(dups, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
