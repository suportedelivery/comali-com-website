import json

with open("da_sanity_image_patches.json", "r", encoding="utf-8") as f:
    mapping = json.load(f)

print("Total documents to patch:", len(mapping))

# Format patches for MCP Sanity patch_documents tool
# The tool accepts: documents: { [id]: { set: { externalImages: [...] } } }
items = list(mapping.items())
batch_size = 25
batches = []

for i in range(0, len(items), batch_size):
    batch_items = items[i:i+batch_size]
    patch_doc = {}
    for doc_id, img_url in batch_items:
        # Patch both published ID and draft ID
        patch_doc[doc_id] = {
            "set": {
                "externalImages": [
                    {
                        "_type": "image",
                        "_key": "da_img_1",
                        "url": img_url,
                        "alt": "Imagem do produto D&A Química"
                    }
                ]
            }
        }
    batches.append(patch_doc)

print(f"Created {len(batches)} batches for patching.")

for idx, b in enumerate(batches):
    with open(f"img_patch_batch_{idx}.json", "w", encoding="utf-8") as f:
        json.dump(b, f, ensure_ascii=False, indent=2)

print("Saved batch files img_patch_batch_0..N.json")
