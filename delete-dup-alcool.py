#!/usr/bin/env python3
"""
Deleta produtos duplicados de álcool que estão em categorias ATIVAS.

Contexto: a categoria "Álcool 70" foi desativada (active=false), ocultando seus
produtos do site. Porém, cópias duplicadas desses mesmos produtos existem em
categorias ativas (Food Service, Ind. Alimentos, Ind. em Geral) e continuavam
aparecendo na busca.

Manter:   product-da-c11p7557, product-da-c11p781  (categoria Álcool 70, oculta)
Deletar:  5 cópias duplicadas em categorias ativas.

Uso:
  python3 delete-dup-alcool.py --dry-run   # mostra o plano
  python3 delete-dup-alcool.py --apply     # deleta no Sanity
"""

import argparse
import json
import os
import sys
import urllib.request

PROJECT_ID = "5fcrgo8n"
DATASET = "production"

# Lê o token do ambiente (evita credencial hardcoded)
API_TOKEN = os.environ.get("SANITY_API_TOKEN") or os.environ.get("NEXT_PUBLIC_SANITY_TOKEN") or ""

TO_DELETE = [
    "product-da-c12p7557",  # Indústrias em geral
    "product-da-c1p7557",   # Ind. alimentos e bebidas
    "product-da-c1p781",    # Ind. alimentos e bebidas
    "product-da-c3p7557",   # Food service
    "product-da-c3p781",    # Food service
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


def delete_document(doc_id):
    url = f"https://{PROJECT_ID}.api.sanity.io/v1/data/project/{DATASET}/documents/{doc_id}?mutateMissing=true"
    req = urllib.request.Request(url, method="DELETE")
    req.add_header("Authorization", f"Bearer {API_TOKEN}")
    try:
        with urllib.request.urlopen(req) as resp:
            body = json.loads(resp.read())
            if "deleted" in body:
                return f"OK: {body['deleted']}"
            return f"ERRO inesperado: {body}"
    except urllib.error.HTTPError as e:
        detail = e.read().decode()
        return f"HTTP {e.code}: {detail}"


def main():
    global API_TOKEN
    API_TOKEN = load_token_from_env_local()
    if not API_TOKEN:
        print("ERRO: SANITY_API_TOKEN não encontrado (use .env.local ou env).")
        sys.exit(1)

    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="mostra o plano sem deletar")
    parser.add_argument("--apply", action="store_true", help="aplica a exclusão no Sanity")
    args = parser.parse_args()

    print(f"Vou deletar {len(TO_DELETE)} produtos duplicados de álcool (categorias ativas):")
    for doc_id in TO_DELETE:
        print(f"  - {doc_id}")

    if args.dry_run:
        print("\n[DRY-RUN] Nada foi alterado.")
        return

    if not args.apply:
        print("\nUse --apply para efetivar ou --dry-run para simular.")
        return

    print("\nDeletando...")
    for doc_id in TO_DELETE:
        result = delete_document(doc_id)
        print(f"  {result}")


if __name__ == "__main__":
    main()
