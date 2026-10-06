import type {ProductFragment} from 'storefrontapi.generated';

export type ColorSiblingSwatch = {
  handle: string;
  colorName: string;
  availableForSale: boolean;
  image: ProductFragment['images']['nodes'][number] | null;
  selected: boolean;
};

type SiblingProduct = {
  id?: string;
  handle: string;
  title?: string | null;
  availableForSale?: boolean | null;
  featuredImage?: ColorSiblingSwatch['image'];
  colorName?: {value?: string | null} | null;
};

/**
 * Builds color swatches from custom metafields:
 * - custom.color_name → this product's color label
 * - custom.color_siblings → linked color product(s)
 *   supports both single product_reference and list.product_reference
 *
 * Each color is a separate Shopify product (own URL / SEO).
 * Swatch images use each product's featured image.
 * Order is stable across sibling pages (by color name, then handle).
 */
export function getColorSiblingSwatches(
  product: ProductFragment,
): ColorSiblingSwatch[] {
  const field = product.colorSiblings;
  const fromList = (field?.references?.nodes ?? []).filter(
    Boolean,
  ) as SiblingProduct[];
  const fromSingle = field?.reference
    ? ([field.reference] as SiblingProduct[])
    : [];

  const siblingsByHandle = new Map<string, SiblingProduct>();
  for (const node of [...fromList, ...fromSingle]) {
    if (node?.handle) siblingsByHandle.set(node.handle, node);
  }
  const siblings = [...siblingsByHandle.values()];

  if (siblings.length === 0) return [];

  const currentImage = product.images?.nodes?.[0] ?? null;
  const current: ColorSiblingSwatch = {
    handle: product.handle,
    colorName: product.colorName?.value?.trim() || 'Seçili',
    availableForSale: Boolean(
      product.selectedOrFirstAvailableVariant?.availableForSale,
    ),
    image: currentImage,
    selected: true,
  };

  const others: ColorSiblingSwatch[] = siblings
    .filter((node) => node.handle !== product.handle)
    .map((node) => ({
      handle: node.handle,
      colorName: node.colorName?.value?.trim() || node.title || node.handle,
      availableForSale: Boolean(node.availableForSale),
      image: node.featuredImage ?? null,
      selected: false,
    }));

  if (others.length === 0) return [];

  // Keep swatch order identical on every sibling PDP (selected is a flag, not position)
  return [current, ...others].sort((a, b) => {
    const byName = a.colorName.localeCompare(b.colorName, 'tr', {
      sensitivity: 'base',
    });
    return byName !== 0 ? byName : a.handle.localeCompare(b.handle);
  });
}
