const fs = require('fs');
const path = require('path');

// CSV files
const PRODUTOS_FILE = 'produtos_746334_68ff2756-2d18-4a44-9838-2c4aabbfd8e9.csv';
const CATEGORIAS_FILE = 'categorias_produtos_746334_15814f68-c98f-4e3e-ad52-f60b6a103a75.csv';
const VARIACOES_FILE = 'variacao_746334_f43f5c9c-8267-4c63-97d5-daca1da85020.csv';

// Parse CSV with proper quote handling
function parseCSV(content) {
  const lines = content.split('\r\n').filter(l => l.trim());
  const header = lines[0].split(';').map(c => c.replace(/"/g, ''));
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const vals = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < lines[i].length; j++) {
      const ch = lines[i][j];
      if (ch === '"') {
        if (inQuotes && lines[i][j+1] === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ';' && !inQuotes) {
        vals.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    vals.push(current);
    
    const row = {};
    header.forEach((col, idx) => {
      row[col] = vals[idx] || '';
    });
    rows.push(row);
  }
  
  return rows;
}

// Clean HTML to plain text
function cleanHTML(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Generate slug from string
function generateSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

// Parse price (Brazilian format: 1.234,56)
function parsePrice(priceStr) {
  if (!priceStr || priceStr === '0,00') return null;
  const cleaned = priceStr.replace(/\./g, '').replace(',', '.');
  const value = parseFloat(cleaned);
  return value > 0 ? value : null;
}

// Parse dimensions
function parseDimension(value) {
  if (!value || value === '0') return null;
  const num = parseFloat(value);
  return num > 0 ? num : null;
}

// Map Tray category IDs to new category structure
function mapCategory(trayCategoryId, trayCategoryName) {
  const categoryMap = {
    // Dispensers
    '1': { name: 'Dispensers', slug: 'dispensers' },
    '51': { name: 'Sabonete Líquido', slug: 'sabonete-liquido', parent: 'dispensers' },
    '53': { name: 'Sabonete Espuma', slug: 'sabonete-espuma', parent: 'dispensers' },
    '55': { name: 'Álcool Gel', slug: 'alcool-gel', parent: 'dispensers' },
    '57': { name: 'Papel Higiênico Rolão', slug: 'papel-higienico-rolao', parent: 'dispensers' },
    '59': { name: 'Papel Toalha Interfolhado', slug: 'papel-toalha-interfolhado', parent: 'dispensers' },
    '157': { name: 'Papel Toalha Bobina', slug: 'papel-toalha-bobina', parent: 'dispensers' },
    '163': { name: 'Dispenser Plástico', slug: 'dispenser-plastico', parent: 'dispensers' },
    '167': { name: 'Dispenser Inox', slug: 'dispenser-inox', parent: 'dispensers' },
    '171': { name: 'Secador de Mãos', slug: 'secador-de-maos', parent: 'dispensers' },
    
    // Lixeiras e Contentores
    '63': { name: 'Lixeiras e Contentores', slug: 'lixeiras-e-contentores' },
    '65': { name: 'Lixeiras Plástico', slug: 'lixeiras-plastico', parent: 'lixeiras-e-contentores' },
    '67': { name: 'Com Pedal', slug: 'com-pedal', parent: 'lixeiras-e-contentores' },
    '69': { name: 'Sem Pedal', slug: 'sem-pedal', parent: 'lixeiras-e-contentores' },
    '71': { name: 'Cinzeiros e Bituqueiras', slug: 'cinzeiros-e-bituqueiras', parent: 'lixeiras-e-contentores' },
    '155': { name: 'Tampas', slug: 'tampas', parent: 'lixeiras-e-contentores' },
    '169': { name: 'Coleta Seletiva', slug: 'coleta-seletiva', parent: 'lixeiras-e-contentores' },
    
    // Equipamentos de Limpeza
    '17': { name: 'Equipamentos de Limpeza', slug: 'equipamentos-de-limpeza' },
    '19': { name: 'Baldes', slug: 'baldes', parent: 'equipamentos-de-limpeza' },
    '23': { name: 'MOP', slug: 'mop', parent: 'equipamentos-de-limpeza' },
    '25': { name: 'Acessórios', slug: 'acessorios', parent: 'equipamentos-de-limpeza' },
    '27': { name: 'Carro Cuba', slug: 'carro-cuba', parent: 'equipamentos-de-limpeza' },
    '29': { name: 'Carro Prateleira', slug: 'carro-prateleira', parent: 'equipamentos-de-limpeza' },
    '31': { name: 'Carro Funcional', slug: 'carro-funcional', parent: 'equipamentos-de-limpeza' },
    '35': { name: 'MOP Pó', slug: 'mop-po', parent: 'equipamentos-de-limpeza' },
    '37': { name: 'MOP Úmido', slug: 'mop-umido', parent: 'equipamentos-de-limpeza' },
    '39': { name: 'Cabos', slug: 'cabos', parent: 'equipamentos-de-limpeza' },
    '41': { name: 'Limpa Vidros', slug: 'limpa-vidros', parent: 'equipamentos-de-limpeza' },
    '43': { name: 'Placas de Sinalização', slug: 'placas-de-sinalizacao', parent: 'equipamentos-de-limpeza' },
    
    // Produtos de Higiene e Limpeza
    '175': { name: 'Produtos de Higiene e Limpeza', slug: 'produtos-de-higiene-e-limpeza' },
  };
  
  return categoryMap[trayCategoryId] || { name: trayCategoryName, slug: generateSlug(trayCategoryName) };
}

// Main import function
function importProducts() {
  console.log('=== IMPORTAÇÃO DE PRODUTOS TRAY ===\n');
  
  // Read CSV files
  console.log('Lendo arquivos CSV...');
  const produtosContent = fs.readFileSync(PRODUTOS_FILE, 'latin1');
  const categoriasContent = fs.readFileSync(CATEGORIAS_FILE, 'latin1');
  const variacoesContent = fs.readFileSync(VARIACOES_FILE, 'latin1');
  
  const produtos = parseCSV(produtosContent);
  const categorias = parseCSV(categoriasContent);
  const variacoes = parseCSV(variacoesContent);
  
  console.log(`✓ ${produtos.length} produtos`);
  console.log(`✓ ${categorias.length} mapeamentos de categorias`);
  console.log(`✓ ${variacoes.length} variações\n`);
  
  // Create category lookup
  const categoryLookup = {};
  categorias.forEach(cat => {
    categoryLookup[cat['Código produto']] = cat;
  });
  
  // Create variations lookup
  const variationsLookup = {};
  variacoes.forEach(variacao => {
    const productId = variacao['Código produto'];
    if (!variationsLookup[productId]) {
      variationsLookup[productId] = [];
    }
    variationsLookup[productId].push(variacao);
  });
  
  // Process products
  console.log('Processando produtos...\n');
  const importedProducts = [];
  const skippedProducts = [];
  
  produtos.forEach((produto, index) => {
    const productId = produto['Código produto'];
    const productName = produto['Nome produto'];
    
    // Skip test products
    if (productName.includes('PRODUTO DE TESTE') || productName.includes('INATIVO')) {
      skippedProducts.push({ id: productId, name: productName, reason: 'Produto de teste/inativo' });
      return;
    }
    
    // Get category info
    const categoryInfo = categoryLookup[productId];
    const mainCategoryId = produto['Código categoria'];
    const mainCategoryName = produto['Nome categoria'];
    
    // Map categories
    const categories = [];
    if (categoryInfo) {
      // Main category
      const mainCat = mapCategory(categoryInfo['Código categoria'], categoryInfo['Nome categoria']);
      categories.push(mainCat);
      
      // Additional categories
      for (let i = 1; i <= 5; i++) {
        const addCatId = categoryInfo[`CÓDIGO CATEGORIA ADICIONAL ${i}`];
        if (addCatId && addCatId.trim()) {
          const addCat = mapCategory(addCatId, '');
          if (addCat.name && !categories.find(c => c.slug === addCat.slug)) {
            categories.push(addCat);
          }
        }
      }
    } else {
      const mainCat = mapCategory(mainCategoryId, mainCategoryName);
      categories.push(mainCat);
    }
    
    // Parse images
    const images = [];
    const mainImage = produto['Imagem principal'];
    if (mainImage && mainImage.trim()) {
      images.push({ url: mainImage, alt: productName });
    }
    
    for (let i = 2; i <= 4; i++) {
      const img = produto[`Imagem ${i}`];
      if (img && img.trim()) {
        images.push({ url: img, alt: `${productName} - Imagem ${i}` });
      }
    }
    
    const additionalImages = produto['Imagens adicionais'];
    if (additionalImages && additionalImages.trim()) {
      additionalImages.split(',').forEach(img => {
        const url = img.trim();
        if (url && !images.find(i => i.url === url)) {
          images.push({ url, alt: `${productName} - Imagem adicional` });
        }
      });
    }
    
    // Parse variations
    const productVariations = variationsLookup[productId] || [];
    const variations = productVariations.map(v => ({
      id: v['Código variação'],
      name: v['Valor variação principal'],
      type: v['Variação principal'],
      value: v['Valor variação principal'],
      type2: v['Variação 2'] || null,
      value2: v['Valor variação 2'] || null,
      sku: v['Referência'],
      ean: v['EAN'] || null,
      price: parsePrice(v['Preço venda']),
      stock: parseInt(v['Estoque']) || 0,
      weight: parseDimension(v['Peso']),
      dimensions: {
        length: parseDimension(v['Comprimento']),
        width: parseDimension(v['Largura']),
        height: parseDimension(v['Altura']),
      },
      image: v['Imagem'] || null,
      availability: v['Prazo de disponibilidade'] || null,
    }));
    
    // Build product object
    const product = {
      id: productId,
      title: productName,
      slug: generateSlug(productName),
      description: cleanHTML(produto['Descrição grande']),
      descriptionHTML: produto['Descrição grande'],
      brand: produto['Marca'] || null,
      model: produto['Modelo'] || null,
      reference: produto['Referência'] || null,
      ean: produto['EAN'] || null,
      categories: categories,
      images: images,
      price: parsePrice(produto['Preço venda']),
      weight: parseDimension(produto['Peso']),
      dimensions: {
        length: parseDimension(produto['Comprimento']),
        width: parseDimension(produto['Largura']),
        height: parseDimension(produto['Altura']),
      },
      stock: parseInt(produto['Estoque atual']) || 0,
      availability: produto['Disponibilidade'] || null,
      warranty: produto['Garantia'] || null,
      featured: produto['Selo destaque'] === 'Sim',
      new: produto['Selo lançamento'] === 'Sim',
      active: produto['Exibir na loja'] === 'Sim',
      variations: variations,
      hasVariations: variations.length > 0,
      meta: {
        title: produto['SEO Título'] || productName,
        description: produto['SEO descrição simplificada'] || cleanHTML(produto['Descrição grande']).substring(0, 160),
        keywords: produto['SEO palavra chave'] || null,
      },
      trayUrl: produto['Endereço do Produto (URL Tray)'] || null,
      createdAt: produto['Data cadastro'] || null,
    };
    
    importedProducts.push(product);
    
    if ((index + 1) % 50 === 0) {
      console.log(`  Processados ${index + 1}/${produtos.length} produtos...`);
    }
  });
  
  console.log(`\n✓ ${importedProducts.length} produtos importados`);
  console.log(`✗ ${skippedProducts.length} produtos ignorados\n`);
  
  // Statistics
  const withVariations = importedProducts.filter(p => p.hasVariations).length;
  const withPrice = importedProducts.filter(p => p.price !== null).length;
  const withStock = importedProducts.filter(p => p.stock > 0).length;
  const withImages = importedProducts.filter(p => p.images.length > 0).length;
  
  console.log('=== ESTATÍSTICAS ===');
  console.log(`Total de produtos: ${importedProducts.length}`);
  console.log(`Com variações: ${withVariations} (${Math.round(withVariations/importedProducts.length*100)}%)`);
  console.log(`Com preço: ${withPrice} (${Math.round(withPrice/importedProducts.length*100)}%)`);
  console.log(`Com estoque: ${withStock} (${Math.round(withStock/importedProducts.length*100)}%)`);
  console.log(`Com imagens: ${withImages} (${Math.round(withImages/importedProducts.length*100)}%)`);
  
  // Category distribution
  const categoryCount = {};
  importedProducts.forEach(p => {
    p.categories.forEach(cat => {
      categoryCount[cat.name] = (categoryCount[cat.name] || 0) + 1;
    });
  });
  
  console.log('\n=== CATEGORIAS (top 15) ===');
  Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([name, count]) => {
      console.log(`  ${name}: ${count} produtos`);
    });
  
  // Brand distribution
  const brandCount = {};
  importedProducts.forEach(p => {
    const brand = p.brand || 'Sem marca';
    brandCount[brand] = (brandCount[brand] || 0) + 1;
  });
  
  console.log('\n=== MARCAS (top 10) ===');
  Object.entries(brandCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([name, count]) => {
      console.log(`  ${name}: ${count} produtos`);
    });
  
  // Save to JSON
  const output = {
    importedAt: new Date().toISOString(),
    source: 'Tray e-commerce',
    totalProducts: importedProducts.length,
    totalVariations: variacoes.length,
    products: importedProducts,
  };
  
  const outputFile = 'data/tray-products-imported.json';
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log(`\n✓ Dados salvos em: ${outputFile}`);
  
  // Save skipped products
  if (skippedProducts.length > 0) {
    const skippedFile = 'data/tray-products-skipped.json';
    fs.writeFileSync(skippedFile, JSON.stringify(skippedProducts, null, 2));
    console.log(`✓ Produtos ignorados salvos em: ${skippedFile}`);
  }
  
  console.log('\n=== IMPORTAÇÃO CONCLUÍDA ===');
}

// Run import
importProducts();
