import { createClient } from '@sanity/client';
import { writeFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const esc = (v: any): string => {
  const s = String(v ?? '');
  return /[;"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

const fmt = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) {
    if (val.length === 0) return '';
    if (typeof val[0] === 'string') return val.join(' | ');
    return val.map((v: any) => v?.title ? v.title : v?.slug?.current ? v.slug.current : v?.url ? v.url : v?._ref ? v._ref : JSON.stringify(v)).join(' | ');
  }
  if (typeof val === 'object') return val.asset?.url ? val.asset.url : JSON.stringify(val);
  return String(val);
};

async function main() {
  const products: any[] = await client.fetch(`
    *[_type == "product" && !(_id in path("drafts.**"))] {
      ...,
      categories[]-> { title, slug },
      segments[]-> { title, slug },
      images[] { ..., asset-> { url } }
    }
  `);

  const keys = new Set<string>();
  products.forEach((p) => Object.keys(p).forEach((k) => keys.add(k)));
  const headers = Array.from(keys);

  const lines = [headers.map(esc).join(';')];
  for (const p of products) lines.push(headers.map((h) => esc(fmt(p[h]))).join(';'));

  writeFileSync('scripts/produtos-mestre.csv', '\ufeff' + lines.join('\n'));
  writeFileSync('scripts/produtos-mestre.json', JSON.stringify(products, null, 2));
  const counts = { active: 0, discontinued: 0, draft: 0, other: 0 };
  for (const p of products) {
    const st = p.status || 'active';
    if (counts[st as keyof typeof counts] !== undefined) {
      counts[st as keyof typeof counts]++;
    } else {
      counts.other++;
    }
  }

  console.log(`Contagem por status: ativos=${counts.active}, descontinuados=${counts.discontinued}, rascunhos=${counts.draft}${counts.other > 0 ? `, outros=${counts.other}` : ''}`);
  console.log('Total de produtos exportados:', products.length);
  console.log('Linhas do CSV (com cabecalho):', lines.length);
}

main().catch(console.error);