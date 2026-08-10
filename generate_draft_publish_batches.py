import json

with open("da_sanity_image_patches.json", "r", encoding="utf-8") as f:
    mapping = json.load(f)

# Generate list of draft IDs to publish
all_draft_ids = [f"drafts.{doc_id}" for doc_id in mapping.keys()]

print("Total draft IDs:", len(all_draft_ids))

chunk_size = 20
draft_batches = [all_draft_ids[i:i+chunk_size] for i in range(0, len(all_draft_ids), chunk_size)]

for idx, batch in enumerate(draft_batches):
    with open(f"drafts_to_publish_{idx}.json", "w", encoding="utf-8") as f:
        json.dump(batch, f, ensure_ascii=False)

print(f"Saved {len(draft_batches)} draft batch files.")
