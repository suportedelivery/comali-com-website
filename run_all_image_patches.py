import urllib.request
import json
import os

PROJECT_ID = "5fcrgo8n"
DATASET = "production"

# Read image mapping
with open("da_sanity_image_patches.json", "r", encoding="utf-8") as f:
    mapping = json.load(f)

print(f"Loaded {len(mapping)} product image mappings.")

# We will apply mutations using Sanity API patch/mutate via Python script or MCP calls
# Since we have Sanity MCP tool mcp_Sanity_patch_documents and mcp_Sanity_publish_documents,
# let's generate python helper that splits into chunks of 20 for MCP invocation or direct call.

items = list(mapping.items())
chunk_size = 15

batches = []
for i in range(0, len(items), chunk_size):
    batches.append(items[i:i+chunk_size])

print(f"Split into {len(batches)} batches.")

for idx, b in enumerate(batches):
    patch_dict = {}
    draft_ids = []
    for doc_id, img_url in b:
        patch_dict[doc_id] = {
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
    
    with open(f"mcp_img_patch_{idx}.json", "w", encoding="utf-8") as f:
        json.dump({"patch": patch_dict, "drafts": draft_ids}, f, ensure_ascii=False, indent=2)

print("Saved mcp_img_patch_0..N.json files successfully.")
