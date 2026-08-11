#!/usr/bin/env python3
"""
Corrige estilos inline problemáticos no descriptionHTML de produtos legados
da Tray que quebram o dark theme da página de produto.

O descriptionHTML herdado da Tray contém estilos inline que forçam:
  - background-color branco (#ffffff)
  - color preto (#000000 / #000 / rgb(40, 40, 40))
sobrepondo a caixa `bg-slate-900 text-white` do componente de produto.

A correção:
  - Remove decorator branco (background-color: #ffffff)
  - Substitui cores de texto escuras (#000000, #000, rgb(40,40,40)) por #fff
  - PRESERVA background-color de cores não-brancas (tabela de cores da coleta seletiva)

Uso:
  python3 fix-tray-description-colors.py --dry-run   # mostra o plano
  python3 fix-tray-description-colors.py --apply     # aplica no Sanity
"""

import argparse
import json
import re
import sys
import urllib.request

PROJECT_ID = "5fcrgo8n"
DATASET = "production"
API_TOKEN = "skJktRNhjXxOx2M45OOvHYXM3SEUOoganlDG5W4Bbnf7Xr7pEQoX7hiLunj27wFTWbXCGmgHoTId0wrK6V3bEpLO19twNyi4BypxUsGlVIGAEafQAYRtEmQzITZ2RODYmHRLw7tM1pPjhfTFO4O5fR3hTNC3UBAVOZ6NSqJb3Dl6WZJI7Rgo"

# Padrões problemáticos a corrigir
PATTERNS = [
    # Remover fundo branco
    (re.compile(r'background-color:\s*#?[fF][fF][fF][fF]?[fF]?\s*;?\s*'), ""),
    # Cor de texto preta -> branca (nunca background-color, ex: #000000
    # legítimo na tabela de cores da coleta seletiva)
    (re.compile(r'(?<!background-)color:\s*#000000\b'), "color: #fff"),
    (re.compile(r'(?<!background-)color:\s*#000\b'), "color: #fff"),
    (re.compile(r'(?<!background-)color:\s*rgb\(\s*40,\s*40,\s*40\s*\)'), "color: #fff"),
    (re.compile(r'(?<!background-)color:\s*rgb\(\s*0,\s*0,\s*0\s*\)'), "color: #fff"),
]


def sanitize_style(style):
    """Remove fundos brancos e converte texto preto para branco dentro do style.

    Substitui apenas os valores-alvo inline, preservando o restante do style
    intacto (não remova ';' finais nem outro tipo de declaração)."""
    out = style
    # 1) Remove somente a declaração background-color branco
    # Exato (#fff/#ffffff), com lookahead que impede danificar cores
    # como #FFFF00 (coleta seletiva) ao casar parcial.
    out = re.sub(r'background-color\s*:\s*(?:#[fF]{6}|#[fF]{3}|[fF]{6}|[fF]{3})(?![0-9a-fA-F])\s*[;]?', "", out)
    # 2) Converte cores de texto escuras para branco
    #    (nunca background-color, ex: #000000 legítimo na coleta seletiva)
    out = re.sub(r'(?<!background-)color\s*:\s*#000000\b', "color: #fff", out)
    out = re.sub(r'(?<!background-)color\s*:\s*#000\b', "color: #fff", out)
    out = re.sub(r'(?<!background-)color\s*:\s*rgb\(\s*40,\s*40,\s*40\s*\)', "color: #fff", out)
    out = re.sub(r'(?<!background-)color\s*:\s*rgb\(\s*0,\s*0,\s*0\s*\)', "color: #fff", out)
    # 3) Limpa espaços redundantes e ';;'
    out = re.sub(r';\s*;', ';', out)
    out = re.sub(r'\s{2,}', ' ', out)
    return out.strip()


def fix_html(html):
    """Processa todas as tags com atributo style no HTML."""
    if not html:
        return html, 0

    def repl(m):
        tag = m.group(0)
        if 'style="' not in tag:
            return tag
        new_tag, n = re.subn(
            r'style="([^"]*)"',
            lambda mm: f'style="{sanitize_style(mm.group(1))}"',
            tag,
        )
        return new_tag

    new_html, n = re.subn(r'<[^>]+>', repl, html)
    return new_html, n


def fetch_products():
    url = f"https://{PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/{DATASET}"
    groq = """*[_type == "product" && !(_id in path("drafts.**")) && descriptionHTML != null]{_id, title, descriptionHTML}"""
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
    print(f"{len(products)} produtos com descriptionHTML")

    patches = []
    for p in products:
        old_html = p.get("descriptionHTML") or ""
        new_html, n = fix_html(old_html)
        if n == 0 or new_html == old_html:
            continue
        patches.append({"_id": p["_id"], "title": p.get("title"), "old": old_html, "new": new_html})

    print(f"Produtos com correções: {len(patches)}")
    for p in patches:
        print(f"  {p['_id']} {p['title'][:60]}")

    if not patches:
        return

    # Amostra do diff do ESPUMA CLOR
    for p in patches:
        if "Espuma Clor" in p["title"] and "1L" in p["title"]:
            print("\n=== Exemplo ESPUMA CLOR 1L ===")
            print("ANTES:", p["old"][:400])
            print("\nDEPOIS:", p["new"][:400])
            break

    if args.dry_run:
        return

    # Aplica
    mutations = [{"patch": {"id": p["_id"], "set": {"descriptionHTML": p["new"]}}} for p in patches]
    url = f"https://{PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/{DATASET}"
    chunk = mutations
    payload = json.dumps({"mutations": chunk}).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={
        "Content-Type": "application/json", "Authorization": f"Bearer {API_TOKEN}"})
    try:
        res = urllib.request.urlopen(req)
        body = json.loads(res.read().decode("utf-8"))
        results = body.get("results", [])
        ok = sum(1 for r in results if r.get("operation") != "error")
        print(f"\nAplicado: {ok}/{len(chunk)} patches ok")
    except Exception as e:
        print(f"Erro: {e}")


if __name__ == "__main__":
    main()