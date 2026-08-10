import urllib.request
import re
import json

url = "https://www.deaquimica.com.br/"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"})
html = urllib.request.urlopen(req).read().decode("utf-8")

# Pattern to find product modal or blocks in HTML
# In D&A HTML, each product block usually has an img tag with https://api.deaquimica.ind.br/imagens/produtos/... and a heading or title
blocks = re.findall(r'<div[^>]*class=["\'][^"\']*produto[^"\']*["\'][^>]*>(.*?)</div>', html, re.DOTALL | re.IGNORECASE)

print("Product blocks found:", len(blocks))

# Let's search all img tags and nearby text
img_title_pairs = []

# Pattern matching img src with api.deaquimica.ind.br/imagens/produtos/...
matches = re.findall(r'(https://api\.deaquimica\.ind\.br/imagens/produtos/[^\s"\']+)', html)
unique_imgs = list(set(matches))
print("Unique product image URLs:", len(unique_imgs))

# Let's inspect HTML snippet around each image URL
image_mapping = {}

for img_url in unique_imgs:
    pos = html.find(img_url)
    if pos != -1:
        # Search surrounding 500 chars for title
        snippet = html[max(0, pos-400):min(len(html), pos+400)]
        # Look for headers or titles in snippet
        titles = re.findall(r'<h[1-6][^>]*>(.*?)</h[1-6]>', snippet, re.IGNORECASE | re.DOTALL)
        if not titles:
            titles = re.findall(r'class=["\'][^"\']*titulo[^"\']*["\'][^>]*>(.*?)<', snippet, re.IGNORECASE | re.DOTALL)
        if not titles:
            # Try finding capitalized text lines
            clean_snippet = re.sub(r'<[^>]+>', ' ', snippet)
            lines = [l.strip() for l in clean_snippet.split('\n') if l.strip()]
            for l in lines:
                if len(l) > 3 and l.isupper():
                    titles.append(l)
                    break
        
        title = titles[0].strip() if titles else "Unknown"
        image_mapping[img_url] = title

with open("da_image_mapping.json", "w", encoding="utf-8") as f:
    json.dump(image_mapping, f, ensure_ascii=False, indent=2)

print("Saved image mapping count:", len(image_mapping))
print("Sample mapping:", list(image_mapping.items())[:5])
