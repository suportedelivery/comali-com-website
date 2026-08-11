#!/usr/bin/env python3
"""
Corrige descrições dos produtos D&A (product-da-*) no Sanity.

Problema: a seção "Indicação" do descriptionHTML contém bullets extras vindos
de um placeholder comentado no HTML do site D&A (ex: "Todos tipos de superfícies
e pisos laváveis", "Panelas", "Vidros", "Talheres"). Em alguns produtos faltam
bullets legítimos. A seção "Apresentação" deve ser removida (decisão comercial).

Correção: substitui a lista de Indicação pelos bullets canônicos extraídos do
site D&A (da_produtos_canonico.json) e remove a seção Apresentação, preservando
Fragrância/Cor/Diluição e Documentos Técnicos.

Uso:
  python3 fix-da-descriptions.py --dry-run   # mostra o plano
  python3 fix-da-descriptions.py --apply     # aplica no Sanity
"""

import argparse
import html
import json
import re
import sys
import urllib.request

PROJECT_ID = "5fcrgo8n"
DATASET = "production"
API_TOKEN = "skJktRNhjXxOx2M45OOvHYXM3SEUOoganlDG5W4Bbnf7Xr7pEQoX7hiLunj27wFTWbXCGmgHoTId0wrK6V3bEpLO19twNyi4BypxUsGlVIGAEafQAYRtEmQzITZ2RODYmHRLw7tM1pPjhfTFO4O5fR3hTNC3UBAVOZ6NSqJb3Dl6WZJI7Rgo"

CANONICO_FILE = "da_produtos_canonico.json"
SANITY_ATUAL_FILE = "da_sanity_atuais.json"


def sanity_request(method, path, body=None):
    url = f"https://{PROJECT_ID}.api.sanity.io/v2024-01-01{path}"
    data = json.dumps(body).encode("utf-8") if body else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    req.add_header("Authorization", f"Bearer {API_TOKEN}")
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode("utf-8"))


def query(groq):
    return sanity_request("POST", f"/data/query/{DATASET}", {"query": groq})


def fetch_products():
    result = query(
        """*[_type == "product" && _id match "product-da-*" && !(_id in path("drafts.**"))]{_id, title, description, descriptionHTML}"""
    )
    return result.get("result", [])


def rebuild_description_html(current_html, canon_bullets):
    """Substitui a lista de Indicação pelos bullets canônicos e remove a seção Apresentação."""
    if not current_html:
        return current_html

    # 1) Substitui os bullets da seção Indicação
    ind_pat = re.compile(r"(<h3[^>]*>Indicação</h3>\s*<ul[^>]*>)(.*?)(</ul>)", re.DOTALL)
    new_bullets = "\n".join(
        f'<li style="color: #fff;">{html.escape(b, quote=False)}</li>' for b in canon_bullets
    )
    html_out, n = ind_pat.subn(lambda m: f"{m.group(1)}\n{new_bullets}\n{m.group(3)}", current_html)

    if n == 0:
        return None  # Indicação não encontrada — não mexe

    # 2) Remove a seção Apresentação (h3 + ul)
    ap_pat = re.compile(
        r"\s*<h3[^>]*>Apresentação</h3>\s*<ul[^>]*>.*?</ul>", re.DOTALL
    )
    html_out, n2 = ap_pat.subn("", html_out)

    if n2 == 0:
        return None  # Apresentação não encontrada — não mexe (evita quebrar)

    html_out = re.sub(r"\n{3,}", "\n\n", html_out).rstrip()
    return html_out


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="mostra o plano sem aplicar")
    parser.add_argument("--apply", action="store_true", help="aplica as correções no Sanity")
    args = parser.parse_args()

    if not args.dry_run and not args.apply:
        print("Use --dry-run para ver o plano ou --apply para aplicar.")
        sys.exit(1)

    with open(CANONICO_FILE, encoding="utf-8") as f:
        canonical = json.load(f)
    products = fetch_products()
    print(f"{len(products)} produtos product-da-* encontrados", flush=True)

    patches = []
    skipped = []
    for p in products:
        sid = p["_id"].replace("product-da-", "")
        canon = canonical.get(sid)
        if not canon:
            skipped.append((p["_id"], "sem canônico"))
            continue
        canon_bullets = canon["properties"].get("Indicação")
        if not canon_bullets:
            skipped.append((p["_id"], "sem Indicação no canônico"))
            continue

        new_html = rebuild_description_html(p.get("descriptionHTML") or "", canon_bullets)
        if new_html is None:
            skipped.append((p["_id"], "estrutura inesperada no descriptionHTML"))
            continue
        if new_html == p.get("descriptionHTML"):
            continue  # nada a mudar

        patches.append({"_id": p["_id"], "title": p.get("title"), "newHTML": new_html})

    print(f"Patches a aplicar: {len(patches)}")
    print(f"Pulados ({len(skipped)}):")
    for s, reason in skipped[:30]:
        print(f"  {s}: {reason}")

    if patches:
        print("\nExemplo de patch (primeiro produto):")
        ex = patches[0]
        print(f"  {ex['_id']} {ex['title']}")
        print("  ...patches gerados com Indicação corrigida e Apresentação removida")

    if args.dry_run:
        with open("da_description_patches.json", "w", encoding="utf-8") as f:
            json.dump(patches, f, ensure_ascii=False, indent=1)
        print("\nPlano salvo em da_description_patches.json")
        return

    # Aplica
    mutations = []
    for p in patches:
        doc_id = p["_id"]
        mutations.append({"patch": {"id": doc_id, "set": {"descriptionHTML": p["newHTML"]}}})

    url = f"https://{PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/{DATASET}"
    chunk_size = 25
    total = len(mutations)
    print(f"\nAplicando {total} patches em lotes de {chunk_size}...", flush=True)
    for i in range(0, total, chunk_size):
        chunk = mutations[i : i + chunk_size]
        payload = json.dumps({"mutations": chunk}).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=payload,
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {API_TOKEN}"},
        )
        try:
            res = urllib.request.urlopen(req)
            body = json.loads(res.read().decode("utf-8"))
            results = body.get("results", [])
            ok = sum(1 for r in results if r.get("operation") != "error")
            print(f"  Batch {i // chunk_size + 1}: {ok}/{len(chunk)} ok")
        except Exception as e:
            print(f"  Batch {i // chunk_size + 1} erro: {e}")

    print("Concluído!")


if __name__ == "__main__":
    main()