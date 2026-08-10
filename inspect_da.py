import urllib.request
import re
import json

url = "https://www.deaquimica.com.br/"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"})

try:
    html = urllib.request.urlopen(req).read().decode("utf-8")
    print("HTML length:", len(html))
    
    # Extract scripts
    script_urls = re.findall(r'src=["\']([^"\']+\.js[^"\']*)["\']', html)
    print("Script URLs:", script_urls)

    # Extract images
    img_urls = re.findall(r'src=["\']([^"\']+\.(?:png|jpg|jpeg|webp|svg)[^"\']*)["\']', html, re.IGNORECASE)
    print("Image URLs count:", len(img_urls))
    for img in img_urls[:20]:
        print("Image:", img)

except Exception as e:
    print("Error:", e)
