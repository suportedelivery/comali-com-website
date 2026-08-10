import urllib.request
import re
import json
import subprocess

# 1. Fetch D&A site
url = "https://www.deaquimica.com.br/"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"})
html = urllib.request.urlopen(req).read().decode("utf-8")

# 2. Extract image mapping
pattern = r'href=["\'][^"\']*#produtos/[^/]+/([^"\']+)["\'][^>]*>\s*<img[^>]+src=["\'](https://api\.deaquimica\.ind\.br/imagens/produtos/[^"\']+)["\']'
matches = re.findall(pattern, html, re.IGNORECASE | re.DOTALL)

code_to_img = {}
for code, img_url in matches:
    code_to_img[code.strip().lower()] = img_url

print("Extracted D&A images count:", len(code_to_img))

# Read original D&A products data structure from da_chunks.json
with open("da_chunks.json", "r", encoding="utf-8") as f:
    chunks = json.load(f)

all_docs = []
for chunk in chunks:
    for doc in chunk:
        doc_id = doc.get("_id", "").replace("product-da-", "")
        if doc_id in code_to_img:
            img_url = code_to_img[doc_id]
            doc["externalImages"] = [
                {
                    "_type": "image",
                    "_key": f"img_{doc['_id']}",
                    "url": img_url,
                    "alt": f"Imagem do produto {doc.get('title', 'D&A Química')}"
                }
            ]
        all_docs.append(doc)

print("Total documents formatted for import:", len(all_docs))

with open("da_products_imported_images.ndjson", "w", encoding="utf-8") as f:
    for doc in all_docs:
        f.write(json.dumps(doc, ensure_ascii=False) + "\n")

print("Created da_products_imported_images.ndjson")
