import json
import urllib.request
import os

token = os.environ.get("SANITY_API_TOKEN")

with open("da_sanity_image_patches.json", "r", encoding="utf-8") as f:
    mapping = json.load(f)

print(f"Total products to mutate: {len(mapping)}")

mutations = []
draft_ids = []

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
    # Also mutate draft document if exists
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

url = "https://5fcrgo8n.api.sanity.io/v2024-01-01/data/mutate/production"

# Split mutations into chunks of 100
chunk_size = 60
for i in range(0, len(mutations), chunk_size):
    chunk = mutations[i:i+chunk_size]
    payload = json.dumps({"mutations": chunk}).encode("utf-8")
    
    # Check if SANITY_API_TOKEN is available or try without if user token saved in env
    req = urllib.request.Request(url, data=payload, headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}" if token else ""
    })
    try:
        res = urllib.request.urlopen(req)
        print(f"Batch {i//chunk_size + 1} status: {res.status}")
    except Exception as e:
        print(f"Batch {i//chunk_size + 1} error: {e}")
