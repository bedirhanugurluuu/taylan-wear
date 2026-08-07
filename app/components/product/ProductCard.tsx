import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {IconHeart} from '~/components/icons/HeaderIcons';

const NEW_TAGS = ['yeni', 'new'];
const COLOR_OPTION_NAMES = ['renk', 'color', 'colour'];
const MAX_SWATCHES = 3;

/** Fallback colors when no swatch is defined in Shopify admin */
const COLOR_MAP: Record<string, string> = {
  siyah: '#000000',
  beyaz: '#ffffff',
  gri: '#8a8a8a',
  antrasit: '#3a3a3a',
  lacivert: '#001f54',
  mavi: '#1e6fd9',
  kırmızı: '#d32f2f',
  kirmizi: '#d32f2f',
  bordo: '#7b1e2b',
  yeşil: '#2e7d32',
  yesil: '#2e7d32',
  haki: '#6b6b47',
  bej: '#d9c7a7',
  krem: '#f1e9dd',
  kahverengi: '#6d4c41',
  pembe: '#e91e63',
  mor: '#7b1fa2',
  turuncu: '#f57c00',
  sarı: '#fbc02d',
  sari: '#fbc02d',
};

type ProductCardImage = {
  id: string | null;
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type ProductCardProduct = {
  id: string;
  title: string;
  handle: string;
  tags: string[];
  priceRange: {minVariantPrice: MoneyV2};
  images: {nodes: ProductCardImage[]};
  options: Array<{
    name: string;
    optionValues: Array<{
      name: string;
      swatch?: {color: string | null} | null;
    }>;
  }>;
};

export function ProductCard({
  product,
  loading = 'lazy',
}: {
  product: ProductCardProduct;
  loading?: 'eager' | 'lazy';
}) {
  const [primaryImage, secondaryImage] = product.images.nodes;

  const isNew = product.tags.some((tag) =>
    NEW_TAGS.includes(tag.trim().toLowerCase()),
  );

  const colorOption = product.options.find((option) =>
    COLOR_OPTION_NAMES.includes(option.name.trim().toLowerCase()),
  );
  const colorValues = colorOption?.optionValues ?? [];
  const visibleColors = colorValues.slice(0, MAX_SWATCHES);
  const remainingColors = colorValues.length - visibleColors.length;

  return (
    <Link
      to={`/products/${product.handle}`}
      className="product-card"
      prefetch="intent"
    >
      <div className="product-card__media">
        {primaryImage ? (
          <Image
            className="product-card__img product-card__img--primary"
            data={primaryImage}
            alt={primaryImage.altText || product.title}
            aspectRatio="4/5"
            loading={loading}
            sizes="(min-width: 768px) 22vw, 45vw"
          />
        ) : null}
        {secondaryImage ? (
          <Image
            className="product-card__img product-card__img--secondary"
            data={secondaryImage}
            alt={secondaryImage.altText || product.title}
            aspectRatio="4/5"
            loading="lazy"
            sizes="(min-width: 768px) 22vw, 45vw"
          />
        ) : null}

        {isNew ? <span className="product-card__badge">Yeni</span> : null}

        <button
          type="button"
          className="product-card__save"
          aria-label="Kaydet"
          title="Yakında"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <IconHeart size={16} />
        </button>
      </div>

      <div className="product-card__info">
        <span className="product-card__name">{product.title}</span>
        <span className="product-card__price">
          <Money data={product.priceRange.minVariantPrice} />
        </span>
      </div>

      {visibleColors.length > 0 ? (
        <div className="product-card__swatches" aria-label="Renk seçenekleri">
          {visibleColors.map((value) => (
            <span
              key={value.name}
              className="product-card__swatch"
              title={value.name}
              style={{
                backgroundColor:
                  value.swatch?.color ||
                  COLOR_MAP[value.name.trim().toLowerCase()] ||
                  '#d9d9d9',
              }}
            />
          ))}
          {remainingColors > 0 ? (
            <span className="product-card__swatch-more">
              +{remainingColors}
            </span>
          ) : null}
        </div>
      ) : null}
    </Link>
  );
}
