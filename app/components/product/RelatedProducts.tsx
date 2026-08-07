import {Suspense, useRef} from 'react';
import {Await, Link} from 'react-router';
import {
  ProductCard,
  type ProductCardProduct,
} from '~/components/product/ProductCard';

type RelatedProductsData = {
  productRecommendations: ProductCardProduct[] | null;
} | null;

export function RelatedProducts({
  products,
  viewAllHref = '/collections/all',
}: {
  products: Promise<RelatedProductsData>;
  viewAllHref?: string;
}) {
  return (
    <section
      className="product-slider product-slider--related"
      aria-label="İlgini çekebilecek ürünler"
    >
      <div className="product-slider__header">
        <h2 className="product-slider__title">İlgini çekebilecek ürünler</h2>
        <Link to={viewAllHref} className="product-slider__view-all">
          Tümünü gör
        </Link>
      </div>

      <Suspense fallback={<div className="product-slider__loading" />}>
        <Await resolve={products}>
          {(response) => {
            const nodes = response?.productRecommendations ?? [];
            if (nodes.length === 0) return null;
            return <RelatedProductsTrack products={nodes} />;
          }}
        </Await>
      </Suspense>
    </section>
  );
}

function RelatedProductsTrack({products}: {products: ProductCardProduct[]}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBySlides = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;

    const slide = track.querySelector<HTMLElement>('.product-slider__slide');
    if (!slide) return;

    const gap = 8;
    track.scrollBy({
      left: direction * (slide.offsetWidth + gap) * 2,
      behavior: 'smooth',
    });
  };

  return (
    <div className="product-slider__viewport">
      <div className="product-slider__track" ref={trackRef}>
        {products.map((product) => (
          <div key={product.id} className="product-slider__slide">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

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
    </div>
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
