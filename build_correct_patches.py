import json

with open("da_sanity_image_patches.json", "r", encoding="utf-8") as f:
    mapping = json.load(f)

items = list(mapping.items())
batch_size = 20
batches = []

for i in range(0, len(items), batch_size):
    batch_items = items[i:i+batch_size]
    patch_doc = {}
    for doc_id, img_url in batch_items:
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
    batches.append(patch_doc)

print(f"Generated {len(batches)} corrected patch batch files.")

for idx, b in enumerate(batches):
    with open(f"final_img_patch_{idx}.json", "w", encoding="utf-8") as f:
        json.dump(b, f, ensure_ascii=False, indent=2)

print("Saved final_img_patch_0..9.json files.")
