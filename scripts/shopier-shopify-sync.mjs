/**
 * Shopier stok → Shopify envanter (günde 1 kez çalıştırmaya uygun, ücretsiz).
 *
 * Gereken .env:
 *   SHOPIER_PAT
 *   SHOPIFY_CLIENT_ID
 *   SHOPIFY_CLIENT_SECRET
 *   PUBLIC_STORE_DOMAIN
 *
 * Shopify üründe metafield: custom.shopier_product_id = Shopier ürün id
 *
 * Önizleme:  npm run shopier:sync
 * Uygula:    npm run shopier:sync:apply
 */

import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APPLY = process.argv.includes('--apply');
const API_VERSION = '2025-01';

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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Shopify S/M/L ↔ Shopier Small/Medıum/Large */
function normalizeSize(raw) {
  const s = String(raw || '')
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/[^a-z0-9]/g, '')
    .trim();

  const map = {
    s: 's',
    small: 's',
    m: 'm',
    medium: 'm',
    medum: 'm', // Medıum → medium → stripped ı issues
    l: 'l',
    large: 'l',
    xl: 'xl',
    xlarge: 'xl',
    extralarge: 'xl',
    xxl: 'xxl',
    xxlarge: 'xxl',
    '2xl': 'xxl',
    xxxl: 'xxxl',
    '3xl': 'xxxl',
  };
  return map[s] || s;
}

function shopierSizeLabel(variant) {
  const parts = [
    ...(variant.selectionTitle || []),
    ...(variant.variationTitle || []),
  ].filter(Boolean);
  // "Beden" etiketini at, asıl beden adını al
  const sizePart =
    parts.find((p) => normalizeSize(p) && !/^beden$/i.test(p)) ||
    parts[parts.length - 1] ||
    '';
  return sizePart;
}

async function getShopifyToken(shop, clientId, clientSecret) {
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  const json = await response.json();
  if (!response.ok || !json.access_token) {
    throw new Error(
      `Shopify token alınamadı: ${json.error || json.error_description || response.status}`,
    );
  }
  return json.access_token;
}

function createAdminClient(shop, token) {
  return async function adminGraphql(query, variables = {}) {
    const response = await fetch(
      `https://${shop}/admin/api/${API_VERSION}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'X-Shopify-Access-Token': token,
        },
        body: JSON.stringify({query, variables}),
      },
    );
    const json = await response.json();
    if (json.errors?.length) {
      throw new Error(json.errors.map((e) => e.message).join('; '));
    }
    return json.data;
  };
}

async function fetchShopierProduct(pat, id) {
  const response = await fetch(`https://api.shopier.com/v1/products/${id}`, {
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${pat}`,
    },
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Shopier ${id}: ${response.status} ${body.slice(0, 200)}`);
  }
  return response.json();
}

async function getPrimaryLocationId(admin) {
  const data = await admin(`{
    locations(first: 10) {
      nodes { id name isActive fulfillsOnlineOrders }
    }
  }`);
  const nodes = data.locations?.nodes || [];
  const preferred =
    nodes.find((l) => l.isActive && l.fulfillsOnlineOrders) ||
    nodes.find((l) => l.isActive) ||
    nodes[0];
  if (!preferred) throw new Error('Shopify location bulunamadı');
  return preferred;
}

async function fetchLinkedShopifyProducts(admin) {
  const products = [];
  let cursor = null;
  while (true) {
    const data = await admin(
      `query ($cursor: String) {
        products(first: 50, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id
            title
            metafield(namespace: "custom", key: "shopier_product_id") { value }
            variants(first: 50) {
              nodes {
                id
                title
                selectedOptions { name value }
                inventoryItem { id tracked }
              }
            }
          }
        }
      }`,
      {cursor},
    );
    for (const node of data.products.nodes) {
      const shopierId = node.metafield?.value?.trim();
      if (!shopierId) continue;
      products.push({
        id: node.id,
        title: node.title,
        shopierId,
        variants: node.variants.nodes,
      });
    }
    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }
  return products;
}

function shopifyVariantSize(variant) {
  const beden = variant.selectedOptions?.find((o) =>
    /beden|size/i.test(o.name),
  );
  return normalizeSize(beden?.value || variant.title?.split('/')[0]);
}

async function setInventory(admin, {inventoryItemId, locationId, quantity}) {
  const data = await admin(
    `mutation ($input: InventorySetQuantitiesInput!) {
      inventorySetQuantities(input: $input) {
        userErrors { field message code }
      }
    }`,
    {
      input: {
        name: 'available',
        reason: 'correction',
        ignoreCompareQuantity: true,
        quantities: [
          {
            inventoryItemId,
            locationId,
            quantity,
          },
        ],
      },
    },
  );
  const errors = data.inventorySetQuantities?.userErrors || [];
  if (errors.length) {
    throw new Error(errors.map((e) => e.message).join('; '));
  }
}

async function main() {
  const shop = process.env.PUBLIC_STORE_DOMAIN;
  const pat = process.env.SHOPIER_PAT;
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  if (!shop || !pat || !clientId || !clientSecret) {
    throw new Error(
      'Eksik env: PUBLIC_STORE_DOMAIN, SHOPIER_PAT, SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET',
    );
  }

  process.stderr.write(
    APPLY
      ? 'Mod: UYGULA (Shopify stokları güncellenecek)\n'
      : 'Mod: ÖNİZLEME (değişiklik yok). Uygulamak için: npm run shopier:sync:apply\n',
  );

  const token = await getShopifyToken(shop, clientId, clientSecret);
  const admin = createAdminClient(shop, token);
  const location = await getPrimaryLocationId(admin);
  process.stderr.write(`Lokasyon: ${location.name}\n`);

  const linked = await fetchLinkedShopifyProducts(admin);
  process.stderr.write(`Shopier ID’li Shopify ürün: ${linked.length}\n`);

  let updated = 0;
  let skipped = 0;
  let missingShopier = 0;
  let unmatchedSizes = 0;

  for (const product of linked) {
    let shopier;
    try {
      shopier = await fetchShopierProduct(pat, product.shopierId);
    } catch (error) {
      process.stderr.write(`! ${product.title}: ${error.message}\n`);
      skipped += 1;
      continue;
    }

    if (!shopier) {
      process.stderr.write(
        `! ${product.title}: Shopier'de yok (${product.shopierId})\n`,
      );
      missingShopier += 1;
      continue;
    }

    const stockBySize = new Map();
    for (const variant of shopier.variants || []) {
      const size = normalizeSize(shopierSizeLabel(variant));
      if (!size) continue;
      const qty = Number(variant.stockQuantity || 0);
      stockBySize.set(size, (stockBySize.get(size) || 0) + qty);
    }

    process.stderr.write(`\n${product.title} ← Shopier ${product.shopierId}\n`);

    for (const variant of product.variants) {
      const size = shopifyVariantSize(variant);
      if (!stockBySize.has(size)) {
        process.stderr.write(
          `  - ${variant.title}: beden eşleşmedi (${size})\n`,
        );
        unmatchedSizes += 1;
        continue;
      }
      if (!variant.inventoryItem?.id) {
        process.stderr.write(`  - ${variant.title}: inventoryItem yok\n`);
        skipped += 1;
        continue;
      }
      if (variant.inventoryItem.tracked === false) {
        process.stderr.write(`  - ${variant.title}: stok takibi kapalı\n`);
        skipped += 1;
        continue;
      }

      const quantity = stockBySize.get(size);
      process.stderr.write(
        `  - ${variant.title}: → ${quantity}${APPLY ? '' : ' (önizleme)'}\n`,
      );

      if (APPLY) {
        await setInventory(admin, {
          inventoryItemId: variant.inventoryItem.id,
          locationId: location.id,
          quantity,
        });
        await sleep(150);
      }
      updated += 1;
    }

    await sleep(80);
  }

  process.stderr.write(
    `\nÖzet: güncellenen/planlanan beden=${updated}, atlanan=${skipped}, shopier yok=${missingShopier}, beden eşleşmedi=${unmatchedSizes}\n`,
  );
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
