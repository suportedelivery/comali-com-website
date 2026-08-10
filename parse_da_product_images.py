import urllib.request
import re
import json

url = "https://www.deaquimica.com.br/"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"})
html = urllib.request.urlopen(req).read().decode("utf-8")

# In D&A HTML, links to product modals look like:
# href="https://www.deaquimica.com.br/#produtos/.../c1p534"
# or we have elements containing the product name and img tag together.

# Let's extract all product modal blocks or product links with their img and titles
# Split html by modal / product container
items = re.findall(r'<a[^>]+href=["\'][^"\']*#produtos/[^"\']+["\'][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)

product_image_map = {}

# Also regex to match: title... img_url
pattern = r'href=["\'][^"\']*#produtos/[^/]+/[^/]+/([^"\']+)["\'].*?src=["\'](https://api\.deaquimica\.ind\.br/imagens/produtos/[^"\']+)["\']'
matches = re.findall(pattern, html, re.DOTALL)
print("Matches found (ref_code -> img_url):", len(matches))

for code, img_url in matches:
    product_image_map[code.strip()] = img_url

# Alternative regex if order is reversed (img_url then ref_code)
pattern2 = r'src=["\'](https://api\.deaquimica\.ind\.br/imagens/produtos/[^"\']+)["\'].*?href=["\'][^"\']*#produtos/[^/]+/[^/]+/([^"\']+)["\']'
matches2 = re.findall(pattern2, html, re.DOTALL)
print("Matches2 found (img_url -> ref_code):", len(matches2))

for img_url, code in matches2:
    product_image_map[code.strip()] = img_url

# Also match code from image filename if available (e.g. _8321.jpg -> c9p8321)
img_matches = re.findall(r'https://api\.deaquimica\.ind\.br/imagens/produtos/[a-f0-9\-]+_(.*?)\.(?:png|jpg|jpeg|webp)', html)

with open("da_products_images.json", "w", encoding="utf-8") as f:
    json.dump(product_image_map, f, ensure_ascii=False, indent=2)

print("Total mapped product images:", len(product_image_map))
print("Sample:", list(product_image_map.items())[:10])
