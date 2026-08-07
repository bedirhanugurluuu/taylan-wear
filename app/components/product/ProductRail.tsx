import {useRef} from 'react';
import {
  ProductCard,
  type ProductCardProduct,
} from '~/components/product/ProductCard';

const NEW_TAGS = ['yeni', 'new'];

export function filterNewTaggedProducts(
  products: ProductCardProduct[],
): ProductCardProduct[] {
  const tagged = products.filter((product) =>
    product.tags.some((tag) => NEW_TAGS.includes(tag.trim().toLowerCase())),
  );
  return tagged.length > 0 ? tagged : products;
}

/**
 * Compact product rail — homepage style track with optional aside density (2.5 cards).
 */
export function ProductRail({
  products,
  title,
  variant = 'default',
  onProductClick,
}: {
  products: ProductCardProduct[];
  title: string;
  variant?: 'default' | 'aside';
  onProductClick?: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (!products.length) return null;

  const scrollBySlides = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.querySelector<HTMLElement>('.product-slider__slide');
    if (!slide) return;
    const gap = 8;
    track.scrollBy({
      left: direction * (slide.offsetWidth + gap) * (variant === 'aside' ? 1 : 2),
      behavior: 'smooth',
    });
  };

  return (
    <section
      className={`product-slider${variant === 'aside' ? ' product-slider--aside' : ''}`}
      aria-label={title}
    >
      <h2 className="product-slider__title">{title}</h2>
      <div className="product-slider__viewport">
        <div className="product-slider__track" ref={trackRef}>
          {products.map((product) => (
            <div
              key={product.id}
              className="product-slider__slide"
              onClickCapture={onProductClick}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {variant === 'default' ? (
          <>
            <button
              type="button"
              className="product-slider__nav product-slider__nav--prev"
              onClick={() => scrollBySlides(-1)}
              aria-label="Önceki ürünler"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              className="product-slider__nav product-slider__nav--next"
              onClick={() => scrollBySlides(1)}
              aria-label="Sonraki ürünler"
            >
              <ArrowIcon direction="right" />
            </button>
          </>
        ) : null}
      </div>
    </section>
  );
}

function ArrowIcon({direction}: {direction: 'left' | 'right'}) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={direction === 'left' ? {transform: 'scaleX(-1)'} : undefined}
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}
