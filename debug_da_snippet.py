import urllib.request
import re

url = "https://www.deaquimica.com.br/"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"})
html = urllib.request.urlopen(req).read().decode("utf-8")

pos = html.find("1000 PLUS TRADICIONAL")
if pos != -1:
    print("Snippet around 1000 PLUS TRADICIONAL:")
    print(html[pos-100:pos+800])
