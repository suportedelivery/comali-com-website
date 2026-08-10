import json
import subprocess
import os

with open("da_sanity_image_patches.json", "r", encoding="utf-8") as f:
    mapping = json.load(f)

print(f"Preparing document replace file for {len(mapping)} items...")

# Read the original D&A products import JSON if available or construct replace docs
with open("import_da_products.json", "r", encoding="utf-8") as f:
    orig_docs = json.load(f)

doc_map = {d["_id"]: d for d in orig_docs}

updated_docs = []
for doc_id, img_url in mapping.items():
    if doc_id in doc_map:
        d = doc_map[doc_id]
        d["externalImages"] = [
            {
                "_type": "image",
                "_key": f"img_{doc_id}",
                "url": img_url,
                "alt": f"Imagem do produto {d.get('title', 'D&A Química')}"
            }
        ]
        updated_docs.append(d)

with open("da_products_with_images.json", "w", encoding="utf-8") as f:
    json.dump(updated_docs, f, ensure_ascii=False, indent=2)

print(f"Saved {len(updated_docs)} updated product documents to da_products_with_images.json")
