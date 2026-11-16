/**
 * Shopier stok listesi — Products API (SHOPIER_PAT).
 *
 * .env: SHOPIER_PAT=...
 *   npm run shopier:stock
 *   npm run shopier:stock:csv
 *
 * CSV: görsel ürün başına bir kez; ID ve toplam stok yok.
 */

import {readFileSync} from 'node:fs';
import {writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://api.shopier.com/v1/products';
const LIMIT = 50;
const asCsv = process.argv.includes('--csv');

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

function getPat() {
  const fromArg = process.argv.find((arg) => arg.startsWith('--token='));
  if (fromArg) return fromArg.slice('--token='.length).trim();
  return (process.env.SHOPIER_PAT || '').trim();
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function primaryImage(product) {
  const media = Array.isArray(product.media) ? product.media : [];
  const sorted = [...media].sort(
    (a, b) => (a.placement || 99) - (b.placement || 99),
  );
  return sorted.find((m) => m?.url)?.url || '';
}

function formatPrice(product) {
  const raw =
    product.priceData?.discountedPrice || product.priceData?.price || '';
  const num = Number(raw);
  if (!Number.isFinite(num)) return String(raw);
  return new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: 0,
  }).format(num);
}

function variantRows(product) {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  // Bedensiz ürünler ve stoğu 0 olan bedenler elenir
  return variants
    .map((variant) => {
      const labels = [
        ...(variant.variationTitle ?? []),
        ...(variant.selectionTitle ?? []),
      ].filter(Boolean);
      const stock = Number(variant.stockQuantity ?? 0);
      return {
        variant: labels.join(': '),
        stock,
      };
    })
    .filter((row) => row.variant && row.stock > 0);
}

async function fetchPage(pat, page) {
  const url = new URL(API);
  url.searchParams.set('limit', String(LIMIT));
  url.searchParams.set('page', String(page));
  url.searchParams.set('sort', 'dateDesc');

  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${pat}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Shopier API ${response.status}: ${body.slice(0, 400)}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data?.products ?? data?.data ?? [];
}

async function main() {
  const pat = getPat();
  if (!pat) {
    console.error(
      'SHOPIER_PAT yok. .env içine SHOPIER_PAT=token ekle,\n' +
        'sonra: npm run shopier:stock:csv',
    );
    process.exit(1);
  }

  const products = [];
  let page = 1;
  while (true) {
    const batch = await fetchPage(pat, page);
    if (!batch.length) break;
    products.push(...batch);
    process.stderr.write(`\rÜrün: ${products.length}`);
    if (batch.length < LIMIT) break;
    page += 1;
  }
  process.stderr.write('\n');

  // Ürün başına 1 satır; bedenler aynı hücrede alt alta (Small:1)
  const rows = [];
  for (const product of products) {
    const variants = variantRows(product);
    if (!variants.length) continue;

    const sizes = variants
      .map((v) => {
        const label = v.variant.replace(/^Beden:\s*/i, '').trim() || v.variant;
        return `${label}:${v.stock}`;
      })
      .join('\n');

    rows.push({
      name: (product.title || '').trim(),
      sizes,
      price: formatPrice(product),
      url: product.url || '',
      image: primaryImage(product),
    });
  }

  const header = [
    'Görsel',
    'Ürün Adı',
    'Beden / Stok',
    'Fiyat',
    'Link',
    'Görsel URL',
  ];
  const lines = [
    header.join(','),
    ...rows.map((row) =>
      ['', row.name, row.sizes, row.price, row.url, row.image]
        .map(csvEscape)
        .join(','),
    ),
  ];
  const output = `${lines.join('\n')}\n`;

  if (asCsv) {
    await writeFile(resolve(ROOT, 'shopier-stock.csv'), output, 'utf8');
    process.stderr.write(
      `Yazıldı: shopier-stock.csv (${rows.length} ürün; API toplam ${products.length})\n`,
    );
    process.stderr.write(
      'Sheets: A2 →  =IF(F2="";"";IMAGE(F2))  sonra alta sürükle; C sütununda satır kaydırmayı aç\n',
    );
  } else {
    process.stdout.write(output);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
