#!/usr/bin/env python3
"""
Consolida produtos duplicados no Sanity.

Estratégia aprovada pelo usuário (2026-08-11):
- 33 grupos de químicos consistentes (product-da-*): manter 1 doc, mesclar
  todas as categorias, renomear ref para o padrão único CMIP### (ex:
  CMI-DA-C1P573 -> CMIP573), deletar as demais cópias.
- 4 grupos Tray divergentes: deletar a versão perdedora, manter a escolhida.

Deteccao de grupos:
- Agrupa por titulo normalizado (uppercase, sem espacos duplos).
- Ref canonica quimica = CMIP + <num produto> (ultimo numero da ref).
- Categorias mescladas = uniao das categorias de todas as copias (por _ref).

Uso:
  python3 consolidate-duplicates.py --dry-run   # mostra o plano
  python3 consolidate-duplicates.py --apply     # executa no Sanity
"""

import argparse
import json
import os
import re
import sys
import urllib.request
import urllib.parse

PROJECT_ID = "5fcrgo8n"
DATASET = "production"
API_TOKEN = os.environ.get("SANITY_API_TOKEN") or ""

# Documentos que devem ser MANTIDOS (escolhidos manualmente) nos grupos divergentes
KEEP_TRAY = {
    "contentor-de-lixo-120-litros-com-pedal": "product-2017",
    "contentor-de-lixo-240-litros-com-pedal": "product-2019",
    "embalador-de-guarda-chuva-em-inox": "product-2193",
    "conjunto-3-lixeiras-coleta-seletiva-base-tampa": "product-2093",
}

# Documentos que devem ser DELETADOS nos grupos divergentes (as perdedoras)
DELETE_TRAY = [
    "product-121",
    "product-123",
    "product-1765",
    "product-1789",
]


def load_token_from_env_local():
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
    t = (title or "").upper()
    t = re.sub(r"[^A-Z0-9]+", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def chem_base_ref(reference):
    m = re.match(r"^CMI-DA-C\d+P(\d+)$", reference or "")
    if m:
        return f"CMIP{m.group(1)}"
    return None


def mutate(mutations):
    url = f"https://{PROJECT_ID}.api.sanity.io/v2023-01-01/data/mutate/{DATASET}?returnIds=true"
    data = json.dumps({"mutations": mutations}).encode()
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Authorization", f"Bearer {API_TOKEN}")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        detail = e.read().decode()
        return {"error": e.code, "detail": detail[:500]}


def main():
    global API_TOKEN
    API_TOKEN = load_token_from_env_local()
    if not API_TOKEN:
        print("ERRO: SANITY_API_TOKEN não encontrado (use .env.local ou env).")
        sys.exit(1)

    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    groq = """*[_type == "product" && status == "active"]{_id, title, reference, "cats": categories[]->{_id, title}}"""
    products = query_groq(groq)
    products = [p for p in products if not p["_id"].startswith(("drafts.", "versions."))]

    groups = {}
    for p in products:
        groups.setdefault(norm(p["title"]), []).append(p)
    groups = {k: v for k, v in groups.items() if len(v) >= 2}

    plan = []  # list of (action, doc_id, detail)
    for key, items in sorted(groups.items(), key=lambda kv: -len(kv[1])):
        ids = [it["_id"] for it in items]
        refs = [it["reference"] for it in items]

        # Grupo Tray divergente: deleta as perdedoras definidas
        perdedoras = [d for d in ids if d in DELETE_TRAY]
        if perdedoras:
            for doc_id in perdedoras:
                plan.append(("delete", doc_id, f"Tray divergente (perdedora): {items[0]['title']}"))
            continue

        # Grupo quimico: todas as copias seguem CMI-DA-C<p>P<num>
        if all(chem_base_ref(r) for r in refs):
            canonical = sorted(ids)[0]
            base_ref = chem_base_ref(refs[0])
            # categorias unicas de todas as copias, preservando ordem de _ref
            cat_refs = []
            for it in items:
                for c in (it["cats"] or []):
                    if c and c["_id"] not in cat_refs:
                        cat_refs.append(c["_id"])
            to_delete = [d for d in ids if d != canonical]
            plan.append(("patch", canonical, f"ref {refs[0]} -> {base_ref}; mesclar {len(cat_refs)} categorias"))
            for cat in cat_refs:
                plan.append(("addcat", f"{canonical}<-{cat}", ""))
            for doc_id in to_delete:
                plan.append(("delete", doc_id, f"cópia de {items[0]['title']}"))
            continue

        # Outros casos (nao previstos) — apenas informa
        plan.append(("warn", key, f"grupo não classificado: {refs}"))

    # Contadores
    deletes = [p for p in plan if p[0] == "delete"]
    patches = [p for p in plan if p[0] == "patch"]
    warnings = [p for p in plan if p[0] == "warn"]

    print(f"Grupos com duplicatas: {len(groups)}")
    print(f"  Documentos a DELETAR: {len(deletes)}")
    print(f"  Documentos a PATCHAR (canônicos): {len(patches)}")
    print(f"  Avisos (não classificados): {len(warnings)}")
    print()

    if args.dry_run:
        for p in plan:
            if p[0] == "delete":
                print(f"  DEL  {p[1]:32} {p[2]}")
            elif p[0] == "patch":
                print(f"  PATCH {p[1]:32} {p[2]}")
            elif p[0] == "addcat":
                print(f"    +cat {p[1]}")
            else:
                print(f"  WARN {p[1]}: {p[2]}")
        print("\n[DRY-RUN] Nada foi alterado.")
        return

    if not args.apply:
        print("Use --dry-run para simular ou --apply para efetivar.")
        return

    # Executa
    cat_changes = {}  # doc_id -> [refs]
    for p in plan:
        if p[0] == "addcat":
            doc_id, _, _ = p[1].partition("<-")
            cat_ref = p[1].split("<-")[1]
            cat_changes.setdefault(doc_id, []).append(cat_ref)

    # 1) Patches: renomeia ref + mescla categorias
    for p in plan:
        if p[0] != "patch":
            continue
        doc_id = p[1]
        m = re.search(r"ref .* -> (CMIP\d+)", p[2])
        new_ref = m.group(1) if m else None
        muts = []
        if new_ref:
            muts.append({"patch": {"id": doc_id, "set": {"reference": new_ref}}})
        if doc_id in cat_changes:
            cats = [{"_type": "reference", "_ref": ref} for ref in cat_changes[doc_id]]
            muts.append({"patch": {"id": doc_id, "set": {"categories": cats}}})
        for m in muts:
            result = mutate([m])
            print(f"  PATCH {doc_id}: {result.get('error', 'ok')} {str(result.get('detail', ''))[:80]}")

    # 2) Deletes
    for p in plan:
        if p[0] != "delete":
            continue
        result = mutate([{"delete": {"id": p[1]}}])
        print(f"  DEL  {p[1]}: {result.get('error', 'ok')} {str(result.get('detail', ''))[:80]}")

    print("\nConcluído.")


if __name__ == "__main__":
    main()
