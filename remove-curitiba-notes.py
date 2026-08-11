#!/usr/bin/env python3
"""
Remove menções à restrição regional ("Curitiba e Região Metropolitana") do
descriptionHTML de produtos legados da Tray.

Duas variações:
  1. "Produto vendido apenas para Curitiba e Região Metropolitana"
     (produtos químicos) — pode estar em <strong> ou parágrafo próprio,
     com acento "ã" em texto puro ou entidade &atilde;.
  2. "SOMENTE PARA CURITIBA E REGIÃO METROPOLITANA" (tapetes higienizadores)
     — linha em destaque dentro de <p><span>...</span></p>.

A remoção limpa os resíduos: tags <strong> vazias, <br /> no fim de <p>,
e parágrafos vazios.

Uso:
  python3 remove-curitiba-notes.py --dry-run   # mostra o plano
  python3 remove-curitiba-notes.py --apply     # aplica no Sanity
"""

import argparse
import json
import re
import sys
import urllib.request

PROJECT_ID = "5fcrgo8n"
DATASET = "production"
API_TOKEN = "skJktRNhjXxOx2M45OOvHYXM3SEUOoganlDG5W4Bbnf7Xr7pEQoX7hiLunj27wFTWbXCGmgHoTId0wrK6V3bEpLO19twNyi4BypxUsGlVIGAEafQAYRtEmQzITZ2RODYmHRLw7tM1pPjhfTFO4O5fR3hTNC3UBAVOZ6NSqJb3Dl6WZJI7Rgo"

# 1) Parágrafos inteiros com "SOMENTE PARA CURITIBA ..." (tapetes)
RE_SOMENTE_P = re.compile(
    r'<p[^>]*>(?:(?!</p>).)*?SOMENTE PARA CURITIBA(?:(?!</p>).)*?</p>',
    re.S | re.I,
)

# 2) Texto "Produto vendido apenas para Curitiba e Região Metropolitana"
#    com "ã" em texto puro ou entidades &atilde; / &Atilde;
RE_FRASE = re.compile(
    r'Produto vendido apenas para Curitiba e Regi(?:&[aA]tilde;|ã|a)o Metropolitana',
    re.I,
)

# 3) Variação em TEXTO PLANO (campo description, meta keywords/description):
#    "SOMENTE PARA CURITIBA E REGI&Atilde;O METROPOLITANA" (tapetes)
RE_SOMENTE_PLAIN = re.compile(
    r'SOMENTE PARA CURITIBA E REGI(?:&[aA]tilde;|ã|a)o METROPOLITANA',
    re.I,
)

# Limpeza de resíduos
RE_EMPTY_STRONG = re.compile(r'<strong[^>]*>\s*</strong>')
RE_TRAILING_BR = re.compile(r'<br\s*/?>\s*</p>')
RE_EMPTY_P = re.compile(r'<p[^>]*>\s*</p>')


def clean(html):
    if not html:
        return html
    out = RE_SOMENTE_P.sub('', html)
    out = RE_FRASE.sub('', out)
    out = RE_EMPTY_STRONG.sub('', out)
    out = RE_TRAILING_BR.sub('</p>', out)
    out = RE_EMPTY_P.sub('', out)
    return out


def clean_plain(text):
    """Remove as menções regionais de um texto plano (campo description)."""
    if not text:
        return text
    out = RE_SOMENTE_PLAIN.sub('', text)
    out = RE_FRASE.sub('', out)
    # limpa espaços duplicados deixados pela remoção
    out = re.sub(r'\s{2,}', ' ', out)
    return out.strip()


def fetch_products():
    url = f"https://{PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/{DATASET}"
    groq = """*[_type == "product" && (descriptionHTML match "*Curitiba*" || description match "*Curitiba*")]{_id, title, description, descriptionHTML}"""
    req = urllib.request.Request(url, data=json.dumps({"query": groq}).encode(), headers={
        "Content-Type": "application/json", "Authorization": f"Bearer {API_TOKEN}"})
    res = json.loads(urllib.request.urlopen(req).read().decode())
    return res.get("result", [])


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    if not args.dry_run and not args.apply:
        print("Use --dry-run para ver o plano ou --apply para aplicar.")
        sys.exit(1)

    products = fetch_products()
    print(f"{len(products)} produtos com 'Curitiba' em description ou descriptionHTML")

    patches = []
    for p in products:
        changes = {}
        old_html = p.get("descriptionHTML") or ""
        new_html = clean(old_html)
        if new_html != old_html:
            changes["descriptionHTML"] = new_html
        old_desc = p.get("description") or ""
        new_desc = clean_plain(old_desc)
        if new_desc != old_desc:
            changes["description"] = new_desc
        if not changes:
            print(f"  SEM MUDANÇA: {p['_id']} {p.get('title')[:50]}")
            continue
        patches.append({"_id": p["_id"], "title": p.get("title"), "old_html": old_html, "new_html": new_html, "old_desc": old_desc, "new_desc": new_desc, "changes": changes})

    print(f"\nProdutos a corrigir: {len(patches)}")
    for p in patches:
        campos = "+".join(k.replace("description", "desc").replace("HTML", "HTML") for k in p["changes"])
        print(f"  {p['_id']} {p['title'][:60]}  [{campos}]")
        # confirma que os textos sumiram nos campos alterados
        for campo, old, new in (("descriptionHTML", p["old_html"], p["new_html"]), ("description", p["old_desc"], p["new_desc"])):
            if campo not in p["changes"]:
                continue
            restante_somente = "SOMENTE PARA CURITIBA" in new.upper()
            restante_frase = "Curitiba e Regi" in new
            if restante_somente or restante_frase:
                print(f"    ⚠ {campo} AINDA CONTÉM referência: somente={restante_somente} frase={restante_frase}")

    if args.dry_run:
        return

    mutations = [{"patch": {"id": p["_id"], "set": p["changes"]}} for p in patches]
    url = f"https://{PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/{DATASET}"
    payload = json.dumps({"mutations": mutations}).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={
        "Content-Type": "application/json", "Authorization": f"Bearer {API_TOKEN}"})
    try:
        res = urllib.request.urlopen(req)
        body = json.loads(res.read().decode("utf-8"))
        results = body.get("results", [])
        ok = sum(1 for r in results if r.get("operation") != "error")
        print(f"\nAplicado: {ok}/{len(mutations)} patches ok")
    except Exception as e:
        print(f"Erro: {e}")


if __name__ == "__main__":
    main()
