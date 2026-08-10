import json
import os

# We will read all batch_payload_X.json and batch_drafts_X.json files
# and output single python script that invokes mcp commands or generates commands.

with open("da_sanity_image_patches.json", "r", encoding="utf-8") as f:
    mapping = json.load(f)

print(f"Total entries: {len(mapping)}")

# Create batches of 20 items
items = list(mapping.items())
chunk_size = 20

all_chunks = []
for i in range(0, len(items), chunk_size):
    chunk = items[i:i+chunk_size]
    patch_doc = {}
    draft_ids = []
    for doc_id, img_url in chunk:
        patch_doc[doc_id] = {
            "patches": [
                {
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
            ]
        }
        draft_ids.append(f"drafts.{doc_id}")
    all_chunks.append((patch_doc, draft_ids))

print(f"Total chunks created: {len(all_chunks)}")

# Print chunk index list for easy loop execution
for idx, (p, d) in enumerate(all_chunks):
    print(f"Chunk {idx}: {len(p)} docs")
