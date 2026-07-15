#!/usr/bin/env python3
"""
Exporta todos os produtos do Sanity para CSV completo.
Usado para revisão e correções.

Uso: python3 export-products.py
Saída: PRODUTOS_COMPLETO.csv
"""

import csv
import json
import urllib.request
import re

PROJECT_ID = "5fcrgo8n"
DATASET = "production"
API_TOKEN = "skJktRNhjXxOx2M45OOvHYXM3SEUOoganlDG5W4Bbnf7Xr7pEQoX7hiLunj27wFTWbXCGmgHoTId0wrK6V3bEpLO19twNyi4BypxUsGlVIGAEafQAYRtEmQzITZ2RODYmHRLw7tM1pPjhfTFO4O5fR3hTNC3UBAVOZ6NSqJb3Dl6WZJI7Rgo"

OUTPUT_FILE = "PRODUTOS_COMPLETO.csv"

def sanity_request(method, path, body=None):
    url = f"https://{PROJECT_ID}.api.sanity.io/v2024-01-01{path}"
    data = json.dumps(body).encode('utf-8') if body else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header('Content-Type', 'application/json')
    req.add_header('Authorization', f'Bearer {API_TOKEN}')
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))

def query(groq):
    return sanity_request('POST', f'/data/query/{DATASET}', {'query': groq})

def sanitize_text(text, brand=None):
    """Remove marca do texto (exceto para campos SEO)"""
    if not text:
        return ""
    
    # Remove Bralimpia
    text = re.sub(r'Bralimpia', '', text, flags=re.IGNORECASE)
    
    # Remove marca específica
    if brand and brand.strip():
        safe_brand = re.escape(brand)
        text = re.sub(rf'\b{safe_brand}\b', '', text, flags=re.IGNORECASE)
    
    # Remove espaços duplos
    text = re.sub(r'  +', ' ', text).strip()
    
    return text

def main():
    print("Buscando produtos do Sanity...", flush=True)
    
    # Query todos os produtos
    result = query("""*[_type == "product" && !(_id in path("drafts.**"))] | order(sortOrder asc, title asc){
        _id,
        title,
        slug,
        status,
        sortOrder,
        reference,
        brand,
        "categories": categories[]->{
            title,
            "parent": parentCategory->title
        },
        description,
        price,
        stock,
        availability,
        weight,
        dimensions,
        featured,
        new,
        whatsappMessage,
        meta,
        ean,
        warranty,
        "images": images[]{url, alt},
        "externalImages": externalImages[]{url, alt}
    }""")
    
    products = result.get('result', [])
    print(f"{len(products)} produtos encontrados", flush=True)
    
    # Headers do CSV
    headers = [
        'id', 'title', 'slug', 'status', 'sortOrder',
        'reference', 'brand', 'categories', 'description',
        'price', 'stock', 'availability', 'weight', 'dimensions',
        'featured', 'new', 'whatsappMessage',
        'meta_title', 'meta_description', 'meta_keywords',
        'images', 'ean', 'warranty'
    ]
    
    # Gerar CSV
    print(f"Gerando {OUTPUT_FILE}...", flush=True)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        
        for product in products:
            # Montar categorias ( Pai > Filho)
            cats = []
            for cat in product.get('categories', []):
                cat_title = cat.get('title', '')
                parent_title = cat.get('parent', '')
                if parent_title:
                    cats.append(f"{parent_title} / {cat_title}")
                else:
                    cats.append(cat_title)
            
            # Montar imagens
            images = []
            for img in (product.get('images') or []):
                if img.get('url'):
                    images.append(img['url'])
            for img in (product.get('externalImages') or []):
                if img.get('url'):
                    images.append(img['url'])
            
            # Montar dimensões
            dims = product.get('dimensions', {})
            dimensions_str = ""
            if dims and dims.get('length') and dims.get('width') and dims.get('height'):
                dimensions_str = f"{dims['length']}x{dims['width']}x{dims['height']}"
            
            # Meta SEO
            meta = product.get('meta', {}) or {}
            
            row = {
                'id': product.get('_id', ''),
                'title': sanitize_text(product.get('title', ''), product.get('brand')),
                'slug': product.get('slug', {}).get('current', '') if isinstance(product.get('slug'), dict) else product.get('slug', ''),
                'status': product.get('status', ''),
                'sortOrder': product.get('sortOrder', 0),
                'reference': sanitize_text(product.get('reference', ''), product.get('brand')),
                'brand': product.get('brand', ''),
                'categories': ' | '.join(cats),
                'description': sanitize_text(product.get('description', ''), product.get('brand')),
                'price': product.get('price', ''),
                'stock': product.get('stock', 0),
                'availability': product.get('availability', ''),
                'weight': product.get('weight', ''),
                'dimensions': dimensions_str,
                'featured': product.get('featured', False),
                'new': product.get('new', False),
                'whatsappMessage': product.get('whatsappMessage', ''),
                'meta_title': meta.get('title', ''),
                'meta_description': meta.get('description', ''),
                'meta_keywords': meta.get('keywords', ''),
                'images': ' | '.join(images),
                'ean': product.get('ean', ''),
                'warranty': product.get('warranty', ''),
            }
            
            writer.writerow(row)
    
    print(f"Concluído! {len(products)} produtos exportados para {OUTPUT_FILE}", flush=True)

if __name__ == "__main__":
    main()
