/**
 * Shopify vitrin ürünleri ↔ Shopier stok CSV eşleştirme.
 *
 * Önce: npm run shopier:stock:csv
 * Sonra: npm run shopier:match
 *
 * Çıktı: shopier-shopify-match.csv
 *   - eslesme = eslesti | sadece_shopify | sadece_shopier
 */

import {readFileSync} from 'node:fs';
import {writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function loadDotEnv() {
  try {
    const text = readFileSync(resolve(ROOT, '.env'), 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // ignore
  }
}

loadDotEnv();

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cur);
      cur = '';
    } else if (ch === '\n') {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = '';
    } else if (ch !== '\r') {
      cur += ch;
    }
  }
  if (cur.length || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

function normalizeTitle(title) {
  return String(title || '')
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenSet(normalized) {
  return new Set(normalized.split(' ').filter((t) => t.length > 1));
}

function similarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) {
    const shorter = Math.min(a.length, b.length);
    const longer = Math.max(a.length, b.length);
    return shorter / longer;
  }
  const ta = tokenSet(a);
  const tb = tokenSet(b);
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter += 1;
  const union = new Set([...ta, ...tb]).size;
  return inter / union;
}

async function fetchShopifyProducts() {
  const domain = process.env.PUBLIC_STORE_DOMAIN;
  const token = process.env.PUBLIC_STOREFRONT_API_TOKEN;
  if (!domain || !token) {
    throw new Error('PUBLIC_STORE_DOMAIN / PUBLIC_STOREFRONT_API_TOKEN eksik');
  }

  const endpoint = `https://${domain}/api/2025-01/graphql.json`;
  const products = [];
  let cursor = null;

  while (true) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({
        query: `
          query Products($cursor: String) {
            products(first: 50, after: $cursor) {
              pageInfo { hasNextPage endCursor }
              nodes {
                id
                title
                handle
                onlineStoreUrl
                featuredImage { url }
              }
            }
          }
        `,
        variables: {cursor},
      }),
    });

    const json = await response.json();
    if (json.errors?.length) {
      throw new Error(JSON.stringify(json.errors[0]));
    }

    const conn = json.data?.products;
    for (const node of conn?.nodes || []) {
      products.push({
        title: node.title,
        handle: node.handle,
        url: node.onlineStoreUrl || `https://${domain}/products/${node.handle}`,
        image: node.featuredImage?.url || '',
        norm: normalizeTitle(node.title),
      });
    }

    if (!conn?.pageInfo?.hasNextPage) break;
    cursor = conn.pageInfo.endCursor;
  }

  return products;
}

function loadShopierFromCsv() {
  const path = resolve(ROOT, 'shopier-stock.csv');
  const rows = parseCsv(readFileSync(path, 'utf8'));
  const header = rows[0] || [];
  const nameIdx = header.indexOf('Ürün Adı');
  const sizesIdx = header.indexOf('Beden / Stok');
  const linkIdx = header.indexOf('Link');
  const imageIdx = header.indexOf('Görsel URL');
  if (nameIdx < 0) throw new Error('shopier-stock.csv bulunamadı veya format bozuk');

  return rows.slice(1).filter((r) => r[nameIdx]).map((r) => ({
    title: r[nameIdx],
    sizes: r[sizesIdx] || '',
    url: r[linkIdx] || '',
    image: r[imageIdx] || '',
    norm: normalizeTitle(r[nameIdx]),
  }));
}

async function main() {
  const shopify = await fetchShopifyProducts();
  const shopier = loadShopierFromCsv();
  process.stderr.write(
    `Shopify: ${shopify.length} | Shopier (CSV): ${shopier.length}\n`,
  );

  const THRESHOLD = 0.55;
  const usedShopier = new Set();
  const out = [];

  for (const s of shopify) {
    let best = null;
    let bestScore = 0;
    for (let i = 0; i < shopier.length; i += 1) {
      if (usedShopier.has(i)) continue;
      const score = similarity(s.norm, shopier[i].norm);
      if (score > bestScore) {
        bestScore = score;
        best = {index: i, item: shopier[i]};
      }
    }

    if (best && bestScore >= THRESHOLD) {
      usedShopier.add(best.index);
      out.push({
        status: 'eslesti',
        score: bestScore.toFixed(2),
        shopifyTitle: s.title,
        shopierTitle: best.item.title,
        sizes: best.item.sizes,
        shopifyUrl: s.url,
        shopierUrl: best.item.url,
        shopierImage: best.item.image,
      });
    } else {
      out.push({
        status: 'sadece_shopify',
        score: bestScore ? bestScore.toFixed(2) : '',
        shopifyTitle: s.title,
        shopierTitle: best?.item?.title || '',
        sizes: '',
        shopifyUrl: s.url,
        shopierUrl: '',
        shopierImage: '',
      });
    }
  }

  for (let i = 0; i < shopier.length; i += 1) {
    if (usedShopier.has(i)) continue;
    const item = shopier[i];
    out.push({
      status: 'sadece_shopier',
      score: '',
      shopifyTitle: '',
      shopierTitle: item.title,
      sizes: item.sizes,
      shopifyUrl: '',
      shopierUrl: item.url,
      shopierImage: item.image,
    });
  }

  const header = [
    'Durum',
    'Skor',
    'Shopify Ürün',
    'Shopier Ürün',
    'Beden / Stok',
    'Shopify Link',
    'Shopier Link',
    'Görsel URL',
  ];
  const lines = [
    header.join(','),
    ...out.map((r) =>
      [
        r.status,
        r.score,
        r.shopifyTitle,
        r.shopierTitle,
        r.sizes,
        r.shopifyUrl,
        r.shopierUrl,
        r.shopierImage,
      ]
        .map(csvEscape)
        .join(','),
    ),
  ];

  const outPath = resolve(ROOT, 'shopier-shopify-match.csv');
  await writeFile(outPath, `${lines.join('\n')}\n`, 'utf8');

  const counts = out.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  process.stderr.write(
    `Yazıldı: shopier-shopify-match.csv\n` +
      `  eslesti: ${counts.eslesti || 0}\n` +
      `  sadece_shopify: ${counts.sadece_shopify || 0}\n` +
      `  sadece_shopier: ${counts.sadece_shopier || 0}\n`,
  );
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
