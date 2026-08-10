import urllib.request
import re
import json

url = "https://www.deaquimica.com.br/"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"})
html = urllib.request.urlopen(req).read().decode("utf-8")

# In D&A HTML:
# The pattern for a product link is: href="https://www.deaquimica.com.br/#produtos/{cluster}/{code}"
# Inside that link or right after it, there is: <img src="https://api.deaquimica.ind.br/imagens/produtos/{uuid}_{filename}" ...>

# Let's find all product links and their corresponding image URLs
product_matches = re.findall(r'href=["\']https://www\.deaquimica\.com\.br/#produtos/[^/]+/([^"\']+)["\'].*?<img[^>]+src=["\'](https://api\.deaquimica\.ind\.br/imagens/produtos/[^"\']+)["\']', html, re.DOTALL | re.IGNORECASE)

print("Direct link-to-img matches:", len(product_matches))

mapping = {}
for code, img_url in product_matches:
    code = code.strip().lower()
    # Normalize product ID to match our Sanity _id format: "product-da-" + code
    sanity_id = f"product-da-{code}"
    mapping[sanity_id] = img_url

print("Mapped Sanity product IDs:", len(mapping))
print("Sample mapped IDs:", list(mapping.items())[:5])

with open("da_sanity_image_patches.json", "w", encoding="utf-8") as f:
    json.dump(mapping, f, ensure_ascii=False, indent=2)
