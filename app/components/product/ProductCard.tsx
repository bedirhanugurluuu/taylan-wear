import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {WishlistToggleButton} from '~/components/Wishlist';

const NEW_TAGS = ['yeni', 'new'];

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

        <WishlistToggleButton
          className="product-card__save"
          size={14}
          stopPropagation
          product={{
            id: product.id,
            handle: product.handle,
            title: product.title,
            image: primaryImage
              ? {url: primaryImage.url, altText: primaryImage.altText}
              : null,
            price: product.priceRange.minVariantPrice,
          }}
        />
      </div>

      <div className="product-card__info">
        <span className="product-card__name">{product.title}</span>
        <span className="product-card__price">
          <Money data={product.priceRange.minVariantPrice} />
        </span>
      </div>
    </Link>
  );
}
