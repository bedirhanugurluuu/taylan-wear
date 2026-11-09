/** Upper-body collections → recommend lower wear, and the reverse. */
export const UPPER_WEAR_HANDLES = [
  'ust-giyim',
  'sweatshirt',
  'hirka',
  'kazak',
  'triko',
  'dis-giyim',
  'ceket',
] as const;

export const LOWER_WEAR_HANDLES = [
  'alt-giyim',
  'pantolon',
  'kot-pantolon',
  'esofman',
  'jogger',
] as const;

const UPPER = new Set<string>(UPPER_WEAR_HANDLES);
const LOWER = new Set<string>(LOWER_WEAR_HANDLES);

export type ComplementaryCollectionHandle = 'ust-giyim' | 'alt-giyim';

export function complementaryCollectionHandle(
  collectionHandles: Array<string | null | undefined>,
): ComplementaryCollectionHandle | null {
  const handles = collectionHandles
    .filter((handle): handle is string => Boolean(handle))
    .map((handle) => handle.toLowerCase());

  const isLower = handles.some((handle) => LOWER.has(handle));
  const isUpper = handles.some((handle) => UPPER.has(handle));

  if (isLower && !isUpper) return 'ust-giyim';
  if (isUpper) return 'alt-giyim';
  if (isLower) return 'ust-giyim';
  return null;
}

/** Prefer a leaf category over parent group collections for breadcrumbs. */
export function primaryCollection<T extends {handle: string}>(
  collections: T[],
): T | undefined {
  const parents = new Set(['ust-giyim', 'alt-giyim', 'dis-giyim', 'all']);
  return (
    collections.find((item) => !parents.has(item.handle.toLowerCase())) ??
    collections[0]
  );
}
