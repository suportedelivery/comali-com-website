import json
import subprocess
import os

with open("da_sanity_image_patches.json", "r", encoding="utf-8") as f:
    mapping = json.load(f)

items = list(mapping.items())
# We already processed the first 16 items
remaining = items[16:]
print(f"Remaining items to process: {len(remaining)}")

chunk_size = 20
batches = []
for i in range(0, len(remaining), chunk_size):
    batches.append(remaining[i:i+chunk_size])

print(f"Total remaining batches: {len(batches)}")

# Write each batch as a standalone python script that calls mcp or sanity CLI
for idx, chunk in enumerate(batches):
    patch_obj = {}
    draft_ids = []
    for doc_id, img_url in chunk:
        patch_obj[doc_id] = {
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
    
    with open(f"batch_payload_{idx}.json", "w", encoding="utf-8") as f:
        json.dump(patch_obj, f, ensure_ascii=False)
    with open(f"batch_drafts_{idx}.json", "w", encoding="utf-8") as f:
        json.dump(draft_ids, f, ensure_ascii=False)

print("Batch payload files created successfully.")
