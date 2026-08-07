import type {ProductFilter} from '@shopify/hydrogen/storefront-api-types';

export type CollectionFilterValue = {
  id: string;
  label: string;
  count: number;
  input: string | Record<string, unknown>;
};

export type CollectionFilter = {
  id: string;
  label: string;
  type: string;
  values: CollectionFilterValue[];
};

export const SORT_OPTIONS = [
  {label: 'Öne çıkanlar', value: 'manual'},
  {label: 'En yeni', value: 'created-desc'},
  {label: 'Fiyat: düşükten yükseğe', value: 'price-asc'},
  {label: 'Fiyat: yüksekten düşüğe', value: 'price-desc'},
  {label: 'A–Z', value: 'title-asc'},
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]['value'];

/**
 * Active filters are stored as URL params using the Shopify filter value id
 * as the key and the filter `input` JSON string as the value.
 * Example: ?filter.v.option.size.medium={"variantOption":{"name":"Size","value":"Medium"}}
 */
export function getAppliedFilters(
  searchParams: URLSearchParams,
): ProductFilter[] {
  const filters: ProductFilter[] = [];

  for (const [key, value] of searchParams.entries()) {
    if (!key.startsWith('filter.') || key === 'filter.v.price') continue;
    try {
      filters.push(JSON.parse(value) as ProductFilter);
    } catch {
      // ignore malformed filter params
    }
  }

  const priceMin = searchParams.get('filter.v.price.gte');
  const priceMax = searchParams.get('filter.v.price.lte');
  if (priceMin || priceMax) {
    filters.push({
      price: {
        min: priceMin ? Number(priceMin) : undefined,
        max: priceMax ? Number(priceMax) : undefined,
      },
    });
  }

  return filters;
}

export function getSortFromParam(searchParams: URLSearchParams): {
  sortKey:
    | 'COLLECTION_DEFAULT'
    | 'BEST_SELLING'
    | 'CREATED'
    | 'PRICE'
    | 'TITLE'
    | 'MANUAL';
  reverse: boolean;
  sortValue: SortValue;
} {
  const sortValue = (searchParams.get('sort') || 'manual') as SortValue;

  switch (sortValue) {
    case 'created-desc':
      return {sortKey: 'CREATED', reverse: true, sortValue};
    case 'price-asc':
      return {sortKey: 'PRICE', reverse: false, sortValue};
    case 'price-desc':
      return {sortKey: 'PRICE', reverse: true, sortValue};
    case 'title-asc':
      return {sortKey: 'TITLE', reverse: false, sortValue};
    case 'manual':
    default:
      return {sortKey: 'MANUAL', reverse: false, sortValue: 'manual'};
  }
}

export function isFilterValueActive(
  searchParams: URLSearchParams,
  valueId: string,
) {
  return searchParams.has(valueId);
}

export function getActiveFilterCount(searchParams: URLSearchParams) {
  let count = 0;
  for (const key of searchParams.keys()) {
    if (key.startsWith('filter.')) count += 1;
  }
  return count;
}

export function toggleFilterParam(
  searchParams: URLSearchParams,
  value: CollectionFilterValue,
) {
  const next = new URLSearchParams(searchParams);

  // Changing filters resets pagination cursors
  next.delete('cursor');
  next.delete('direction');

  if (next.has(value.id)) {
    next.delete(value.id);
  } else {
    const input =
      typeof value.input === 'string'
        ? value.input
        : JSON.stringify(value.input);
    next.set(value.id, input);
  }

  return next;
}

export function setPriceFilterParam(
  searchParams: URLSearchParams,
  min: string,
  max: string,
) {
  const next = new URLSearchParams(searchParams);
  next.delete('cursor');
  next.delete('direction');

  if (min) next.set('filter.v.price.gte', min);
  else next.delete('filter.v.price.gte');

  if (max) next.set('filter.v.price.lte', max);
  else next.delete('filter.v.price.lte');

  return next;
}

export function clearFilterParams(searchParams: URLSearchParams) {
  const next = new URLSearchParams(searchParams);
  for (const key of [...next.keys()]) {
    if (key.startsWith('filter.')) next.delete(key);
  }
  next.delete('cursor');
  next.delete('direction');
  return next;
}
