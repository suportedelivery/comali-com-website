import json

# Output instructions / summary of batches to patch
for i in range(10):
    with open(f"batch_payload_{i}.json", "r", encoding="utf-8") as f:
        payload = json.load(f)
    print(f"Batch {i}: {len(payload)} products")
