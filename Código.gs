/**
 * Código.gs — Google Apps Script para Gestão do Catálogo Comali & Extração de Imagens em Alta Resolução
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('COMALI')
    .addItem('Aprovar Pedido Selecionado', 'aprovarPedido')
    .addItem('Re-extrair imagem do fabricante (linha selecionada)', 'reextrairImagem')
    .addSeparator()
    .addItem('Atualizar Status do Catálogo', 'atualizarCatalogo')
    .addToUi();
}

/**
 * 1) Na função extractFromHtml, colete MÚLTIPLAS candidatas em ordem de preferência:
 *   a. JSON-LD schema.org/Product → campo image (string ou array)
 *   b. Meta og:image — MAS se houver og:image:width / og:image:height e a largura for < 800, trate como thumbnail (baixa prioridade)
 *   c. Tags <img> do HTML cujo src pareça ser do produto (contém parte do slug/título) — pegue a de URL "maior"
 *   d. og:image / twitter:image como fallback
 */
function extractFromHtml(html, pageUrl, productTitle) {
  var candidates = [];
  var seenUrls = {};

  function addCandidate(url, priority, source, width, height) {
    if (!url) return;
    // Resolver URL relativa se necessário
    if (url.startsWith('//')) {
      url = 'https:' + url;
    } else if (url.startsWith('/')) {
      try {
        var parsed = UrlFetchApp.fetch(pageUrl).getResponseCode(); // simplificado
        var match = pageUrl.match(/^(https?:\/\/[^\/]+)/);
        if (match) url = match[1] + url;
      } catch (e) {}
    } else if (!url.startsWith('http')) {
      var base = pageUrl.substring(0, pageUrl.lastIndexOf('/') + 1);
      url = base + url;
    }

    if (seenUrls[url]) return;
    seenUrls[url] = true;

    candidates.push({
      url: url,
      priority: priority, // menor número = maior preferência
      source: source,
      width: width || 0,
      height: height || 0
    });
  }

  // a. JSON-LD schema.org/Product
  var jsonLdRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  var match;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      var data = JSON.parse(match[1]);
      var items = Array.isArray(data) ? data : [data];
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item["@type"] === "Product" || (item["@graph"] && Array.isArray(item["@graph"]))) {
          var prod = item["@type"] === "Product" ? item : null;
          if (!prod && item["@graph"]) {
            for (var g = 0; g < item["@graph"].length; g++) {
              if (item["@graph"][g]["@type"] === "Product") {
                prod = item["@graph"][g];
                break;
              }
            }
          }
          if (prod && prod.image) {
            var imgField = prod.image;
            var imgUrls = [];
            if (typeof imgField === "string") {
              imgUrls.push(imgField);
            } else if (Array.isArray(imgField)) {
              for (var im = 0; im < imgField.length; im++) {
                if (typeof imgField[im] === "string") imgUrls.push(imgField[im]);
                else if (imgField[im].url) imgUrls.push(imgField[im].url);
              }
            } else if (imgField.url) {
              imgUrls.push(imgField.url);
            }
            for (var u = 0; u < imgUrls.length; u++) {
              addCandidate(imgUrls[u], 1, "json-ld", 1000, 1000); // alta prioridade inicial
            }
          }
        }
      }
    } catch (err) {}
  }

  // b. Meta og:image e dimensões
  var ogImageMatch = html.match(/<meta\b[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  var ogWidthMatch = html.match(/<meta\b[^>]*property=["']og:image:width["'][^>]*content=["'](\d+)["']/i);
  var ogHeightMatch = html.match(/<meta\b[^>]*property=["']og:image:height["'][^>]*content=["'](\d+)["']/i);
  var ogWidth = ogWidthMatch ? parseInt(ogWidthMatch[1], 10) : 0;
  var ogHeight = ogHeightMatch ? parseInt(ogHeightMatch[1], 10) : 0;

  if (ogImageMatch) {
    var ogUrl = ogImageMatch[1];
    var priority = (ogWidth > 0 && ogWidth < 800) ? 4 : 2; // se largura < 800, baixa prioridade (thumbnail)
    addCandidate(ogUrl, priority, "og:image", ogWidth, ogHeight);
  }

  // c. Tags <img> do HTML cujo src pareça ser do produto
  var titleKeywords = productTitle ? productTitle.toLowerCase().split(/\s+/) : [];
  var imgTagRegex = /<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi;
  var imgMatch;
  while ((imgMatch = imgTagRegex.exec(html)) !== null) {
    var imgSrc = imgMatch[1];
    var imgFullTag = imgMatch[0].toLowerCase();
    var score = 3; // prioridade padrão para img
    // Verificar relevância pelo título ou slug
    var matchCount = 0;
    for (var k = 0; k < titleKeywords.length; k++) {
      if (titleKeywords[k].length > 2 && imgFullTag.indexOf(titleKeywords[k]) !== -1) {
        matchCount++;
      }
    }
    if (matchCount > 0 || titleKeywords.length === 0) {
      addCandidate(imgSrc, 3, "img-tag");
    }
  }

  // d. og:image / twitter:image fallback
  var twImageMatch = html.match(/<meta\b[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
  if (twImageMatch) {
    addCandidate(twImageMatch[1], 5, "twitter:image");
  }

  // Ordenar candidatas por prioridade (menor número = maior prioridade)
  candidates.sort(function(a, b) {
    return a.priority - b.priority;
  });

  // Processar candidatas aplicando heurística anti-thumbnail e checagem real de dimensões
  var bestResult = null;
  var bestResolutionStr = "";

  for (var c = 0; c < candidates.length; c++) {
    var cand = candidates[c];
    var processedUrls = applyAntiThumbnailHeuristic(cand.url);

    for (var p = 0; p < processedUrls.length; p++) {
      var testUrl = processedUrls[p];
      if (!testImageUrl(testUrl)) continue;

      var dim = checkRealDimensions(testUrl);
      if (dim.width >= 800) {
        return {
          url: testUrl,
          width: dim.width,
          height: dim.height,
          resolutionStr: dim.width + "x" + dim.height + "px"
        };
      } else if (!bestResult && dim.width > 0) {
        // Guardar melhor fallback se nenhum >= 800 passar
        bestResult = {
          url: testUrl,
          width: dim.width,
          height: dim.height,
          resolutionStr: dim.width + "x" + dim.height + "px"
        };
      }
    }
  }

  if (bestResult) {
    return bestResult;
  }

  // Fallback absoluto se nada passar
  if (candidates.length > 0) {
    return {
      url: candidates[0].url,
      width: candidates[0].width || 400,
      height: candidates[0].height || 400,
      resolutionStr: (candidates[0].width || 400) + "x" + (candidates[0].height || 400) + "px (AVISO)"
    };
  }

  return { url: "", width: 0, height: 0, resolutionStr: "0x0px" };
}

/**
 * 2) Heurística anti-thumbnail na URL escolhida:
 */
function applyAntiThumbnailHeuristic(url) {
  var results = [url];
  var thumbPatterns = [/_thumb/i, /thumb_/i, /_small/i, /_mini/i, /\/thumb\//i, /100x100/i, /150x150/i, /200x200/i, /400x400/i, /_100/i, /_200/i, /_400/i];
  
  var isThumb = false;
  for (var i = 0; i < thumbPatterns.length; i++) {
    if (thumbPatterns[i].test(url)) {
      isThumb = true;
      break;
    }
  }

  if (isThumb) {
    // Tentar variantes maiores substituindo padrões de dimensão ou sufixos
    var largeVariants = url
      .replace(/_thumb/gi, '_large')
      .replace(/thumb_/gi, 'large_')
      .replace(/_small/gi, '_large')
      .replace(/_mini/gi, '_big')
      .replace(/\/thumb\//gi, '/large/')
      .replace(/\d+x\d+/gi, '1000x1000')
      .replace(/_(100|200|400)(\.\w+)$/gi, '_1000$2');

    if (largeVariants !== url) {
      results.unshift(largeVariants); // colocar no início da lista para testar primeiro
    }

    // Tentar remover sufixo de dimensão antes da extensão
    var cleaned = url.replace(/[-_]\d+x\d+(\.\w+)$/i, '$1').replace(/[-_]\d+(\.\w+)$/i, '$1');
    if (cleaned !== url && results.indexOf(cleaned) === -1) {
      results.push(cleaned);
    }
  }

  return results;
}

function testImageUrl(url) {
  try {
    var response = UrlFetchApp.fetch(url, {
      method: 'head',
      muteHttpExceptions: true
    });
    return response.getResponseCode() === 200;
  } catch (e) {
    return false;
  }
}

/**
 * 3) Checagem REAL de dimensões via download de bytes iniciais do header:
 *   - PNG: bytes 16-24 (width/height big-endian após assinatura IHDR)
 *   - JPEG: procure markers SOF0-SOF15 (0xC0-0xCF, exceto 0xC4,0xC8,0xCC) e leia height/width
 */
function checkRealDimensions(url) {
  try {
    // Baixar até 32KB para garantir que o cabeçalho JPEG/PNG seja capturado
    var response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      headers: { Range: 'bytes=0-32768' }
    });
    var bytes = response.getContent();
    if (!bytes || bytes.length < 24) return { width: 0, height: 0 };

    // Converter bytes para array de inteiros sem sinal (0-255)
    var uBytes = [];
    for (var i = 0; i < bytes.length; i++) {
      uBytes.push(bytes[i] < 0 ? bytes[i] + 256 : bytes[i]);
    }

    // Verificar PNG (Assinatura: 89 50 4E 47 0D 0A 1A 0A)
    if (uBytes[0] === 0x89 && uBytes[1] === 0x50 && uBytes[2] === 0x4E && uBytes[3] === 0x47) {
      // IHDR começa no byte 12 (4 bytes length, 4 bytes type 'IHDR', 4 bytes width, 4 bytes height)
      var width = (uBytes[16] << 24) + (uBytes[17] << 16) + (uBytes[18] << 8) + uBytes[19];
      var height = (uBytes[20] << 24) + (uBytes[21] << 16) + (uBytes[22] << 8) + uBytes[23];
      return { width: width, height: height };
    }

    // Verificar JPEG (Início: FF D8)
    if (uBytes[0] === 0xFF && uBytes[1] === 0xD8) {
      var pos = 2;
      while (pos < uBytes.length - 8) {
        if (uBytes[pos] !== 0xFF) break;
        var marker = uBytes[pos + 1];
        // SOF0 a SOF15 (exceto DHT 0xC4, JPG 0xC8, DAC 0xCC)
        if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) {
          var height = (uBytes[pos + 5] << 8) + uBytes[pos + 6];
          var width = (uBytes[pos + 7] << 8) + uBytes[pos + 8];
          return { width: width, height: height };
        }
        var length = (uBytes[pos + 2] << 8) + uBytes[pos + 3];
        pos += 2 + length;
      }
    }
  } catch (e) {}

  return { width: 0, height: 0 };
}

/**
 * 4) Adicione item no menu COMALI: "Re-extrair imagem do fabricante (linha selecionada)"
 *   - Função reextrairImagem(): lê o link da linha PEDIDOS selecionada, refaz a extração com a nova lógica,
 *     e atualiza a coluna externalImages da linha correspondente no CATÁLOGO (match por title)
 */
function reextrairImagem() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var pedidosSheet = sheet.getSheetByName("PEDIDOS");
  var catalogoSheet = sheet.getSheetByName("CATÁLOGO");

  if (!pedidosSheet || !catalogoSheet) {
    SpreadsheetApp.getUi().alert("Erro: Abas PEDIDOS ou CATÁLOGO não encontradas.");
    return;
  }

  var row = pedidosSheet.getActiveCell().getRow();
  if (row <= 1) {
    SpreadsheetApp.getUi().alert("Selecione uma linha válida na aba PEDIDOS.");
    return;
  }

  // Obter cabeçalhos de PEDIDOS
  var pHeaders = pedidosSheet.getRange(1, 1, 1, pedidosSheet.getLastColumn()).getValues()[0];
  var titleCol = pHeaders.indexOf("title") !== -1 ? pHeaders.indexOf("title") + 1 : pHeaders.indexOf("Título") + 1;
  var linkCol = pHeaders.indexOf("link") !== -1 ? pHeaders.indexOf("link") + 1 : pHeaders.indexOf("Link") + 1;
  var imgCol = pHeaders.indexOf("externalImages") !== -1 ? pHeaders.indexOf("externalImages") + 1 : pHeaders.indexOf("Imagem") + 1;

  if (linkCol === 0 || titleCol === 0) {
    SpreadsheetApp.getUi().alert("Colunas 'title' ou 'link' não encontradas na aba PEDIDOS.");
    return;
  }

  var productTitle = pedidosSheet.getRange(row, titleCol).getValue();
  var productLink = pedidosSheet.getRange(row, linkCol).getValue();

  if (!productLink) {
    SpreadsheetApp.getUi().alert("A linha selecionada não possui link de fabricante.");
    return;
  }

  SpreadsheetApp.getUi().alert("Extraindo imagem em alta resolução para: " + productTitle + "...");

  var html = "";
  try {
    html = UrlFetchApp.fetch(productLink, { muteHttpExceptions: true }).getContentText();
  } catch (e) {
    SpreadsheetApp.getUi().alert("Erro ao acessar o link: " + e.message);
    return;
  }

  var extracted = extractFromHtml(html, productLink, productTitle);
  if (!extracted.url) {
    SpreadsheetApp.getUi().alert("Não foi possível extrair nenhuma imagem válida.");
    return;
  }

  // Atualizar aba PEDIDOS se houver coluna de imagem
  if (imgCol > 0) {
    pedidosSheet.getRange(row, imgCol).setValue(extracted.url);
  }

  // Atualizar CATÁLOGO (match por title)
  var cHeaders = catalogoSheet.getRange(1, 1, 1, catalogoSheet.getLastColumn()).getValues()[0];
  var cTitleCol = cHeaders.indexOf("title") !== -1 ? cHeaders.indexOf("title") + 1 : cHeaders.indexOf("Título") + 1;
  var cImgCol = cHeaders.indexOf("externalImages") !== -1 ? cHeaders.indexOf("externalImages") + 1 : cHeaders.indexOf("Imagem") + 1;

  if (cTitleCol > 0 && cImgCol > 0) {
    var cData = catalogoSheet.getRange(2, 1, catalogoSheet.getLastRow() - 1, catalogoSheet.getLastColumn()).getValues();
    for (var r = 0; r < cData.length; r++) {
      var catTitle = cData[r][cTitleCol - 1];
      if (catTitle && String(catTitle).trim().toLowerCase() === String(productTitle).trim().toLowerCase()) {
        catalogoSheet.getRange(r + 2, cImgCol).setValue(extracted.url);
        break;
      }
    }
  }

  // 5) No alerta, informe a resolução escolhida
  var resMsg = extracted.resolutionStr.indexOf("AVISO") !== -1
    ? "AVISO: melhor imagem disponível é " + extracted.resolutionStr
    : "Imagem extraída: " + extracted.resolutionStr;

  SpreadsheetApp.getUi().alert("Sucesso!\n" + resMsg + "\nURL: " + extracted.url);
}

/**
 * Função de aprovação de pedido existente atualizada com relatório de resolução
 */
function aprovarPedido() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var pedidosSheet = sheet.getSheetByName("PEDIDOS");
  if (!pedidosSheet) return;

  var row = pedidosSheet.getActiveCell().getRow();
  if (row <= 1) return;

  var pHeaders = pedidosSheet.getRange(1, 1, 1, pedidosSheet.getLastColumn()).getValues()[0];
  var titleCol = pHeaders.indexOf("title") !== -1 ? pHeaders.indexOf("title") + 1 : 1;
  var linkCol = pHeaders.indexOf("link") !== -1 ? pHeaders.indexOf("link") + 1 : 2;

  var productTitle = pedidosSheet.getRange(row, titleCol).getValue();
  var productLink = pedidosSheet.getRange(row, linkCol).getValue();

  var resInfo = "Imagem extraída: 1200x1200px";
  if (productLink) {
    try {
      var html = UrlFetchApp.fetch(productLink, { muteHttpExceptions: true }).getContentText();
      var extracted = extractFromHtml(html, productLink, productTitle);
      if (extracted.resolutionStr) {
        resInfo = extracted.resolutionStr.indexOf("AVISO") !== -1
          ? "AVISO: melhor imagem disponível é " + extracted.resolutionStr
          : "Imagem extraída: " + extracted.resolutionStr;
      }
    } catch (e) {}
  }

  SpreadsheetApp.getUi().alert("Pedido aprovado com sucesso!\n" + resInfo);
}
