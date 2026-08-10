import json
import urllib.request
import urllib.parse
import os

with open("da_sanity_image_patches.json", "r", encoding="utf-8") as f:
    mapping = json.load(f)

# Sanity endpoint
url = "https://5fcrgo8n.api.sanity.io/v2024-01-01/data/mutate/production"

# Build list of mutations
mutations = []

for doc_id, img_url in mapping.items():
    # Mutate published document
    mutations.append({
        "patch": {
            "id": doc_id,
            "set": {
                "externalImages": [
                    {
                        "_type": "image",
                        "_key": f"img_{doc_id}",
                        "url": img_url,
                        "alt": "Imagem do produto D&A Química"
                    }
                ]
            }
        }
    })
    # Mutate draft document if exists
    mutations.append({
        "patch": {
            "id": f"drafts.{doc_id}",
            "set": {
                "externalImages": [
                    {
                        "_type": "image",
                        "_key": f"img_{doc_id}",
                        "url": img_url,
                        "alt": "Imagem do produto D&A Química"
                    }
                ]
            }
        }
    })

print(f"Total mutations generated: {len(mutations)}")

# Save to file so we can run it or inspect
with open("all_sanity_mutations.json", "w", encoding="utf-8") as f:
    json.dump({"mutations": mutations}, f, ensure_ascii=False)

print("Saved all_sanity_mutations.json")
