import urllib.request
import re
import json

url = "https://www.deaquimica.com.br/"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"})
html = urllib.request.urlopen(req).read().decode("utf-8")

# Pattern matching: href=".../#produtos/{cluster}/{code}" ... <img ... src="{img_url}"
pattern = r'href=["\'][^"\']*#produtos/[^/]+/([^"\']+)["\'][^>]*>\s*<img[^>]+src=["\'](https://api\.deaquimica\.ind\.br/imagens/produtos/[^"\']+)["\']'

matches = re.findall(pattern, html, re.IGNORECASE | re.DOTALL)
print("Extracted pairs (code, img_url):", len(matches))

code_to_img = {}
for code, img_url in matches:
    code = code.strip().lower()
    doc_id = f"product-da-{code}"
    code_to_img[doc_id] = img_url

print("Unique mapped Sanity product IDs:", len(code_to_img))
print("Sample pairs:", list(code_to_img.items())[:5])

with open("da_sanity_image_patches.json", "w", encoding="utf-8") as f:
    json.dump(code_to_img, f, ensure_ascii=False, indent=2)
