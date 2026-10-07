import {useEffect, useRef, useState, type PointerEvent} from 'react';
import {
  ProductCard,
  type ProductCardProduct,
} from '~/components/product/ProductCard';

const NEW_TAGS = ['yeni', 'new'];
const DRAG_THRESHOLD = 6;

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
  const dragRef = useRef({
    active: false,
    moved: false,
    capturing: false,
    startX: 0,
    startScroll: 0,
  });
  const suppressClickRef = useRef(false);
  const [edges, setEdges] = useState({start: true, end: false});

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateEdges = () => {
      const max = track.scrollWidth - track.clientWidth;
      setEdges({
        start: track.scrollLeft <= 2,
        end: max <= 2 || track.scrollLeft >= max - 2,
      });
    };

    const onWheel = (event: WheelEvent) => {
      if (track.scrollWidth <= track.clientWidth + 1) return;
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      if (!delta) return;
      const max = track.scrollWidth - track.clientWidth;
      const next = Math.min(max, Math.max(0, track.scrollLeft + delta));
      if (next === track.scrollLeft) return;
      event.preventDefault();
      track.scrollLeft = next;
    };

    updateEdges();
    track.addEventListener('scroll', updateEdges, {passive: true});
    track.addEventListener('wheel', onWheel, {passive: false});
    const observer = new ResizeObserver(updateEdges);
    observer.observe(track);

    return () => {
      track.removeEventListener('scroll', updateEdges);
      track.removeEventListener('wheel', onWheel);
      observer.disconnect();
    };
  }, [products]);

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

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || event.button !== 0) return;
    const track = trackRef.current;
    if (!track || track.scrollWidth <= track.clientWidth) return;
    dragRef.current = {
      active: true,
      moved: false,
      capturing: false,
      startX: event.clientX,
      startScroll: track.scrollLeft,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const track = trackRef.current;
    if (!track) return;
    const dx = event.clientX - dragRef.current.startX;
    if (Math.abs(dx) <= DRAG_THRESHOLD) return;

    if (!dragRef.current.moved) {
      dragRef.current.moved = true;
      track.classList.add('is-dragging');
      track.style.scrollSnapType = 'none';
      track.setPointerCapture(event.pointerId);
      dragRef.current.capturing = true;
    }

    track.scrollLeft = dragRef.current.startScroll - dx;
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const track = trackRef.current;
    if (dragRef.current.moved) suppressClickRef.current = true;
    const wasCapturing = dragRef.current.capturing;
    dragRef.current.active = false;
    dragRef.current.moved = false;
    dragRef.current.capturing = false;
    if (track) {
      track.classList.remove('is-dragging');
      track.style.scrollSnapType = '';
      if (wasCapturing && track.hasPointerCapture(event.pointerId)) {
        track.releasePointerCapture(event.pointerId);
      }
    }
  };

  return (
    <section
      className={`product-slider${variant === 'aside' ? ' product-slider--aside' : ''}`}
      aria-label={title}
    >
      <h2 className="product-slider__title">{title}</h2>
      <div className="product-slider__viewport">
        <div
          className="product-slider__track"
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={(event) => {
            if (suppressClickRef.current) {
              event.preventDefault();
              event.stopPropagation();
              suppressClickRef.current = false;
              return;
            }
            // Close after Link handles navigation in this same click.
            if (onProductClick) {
              queuePromise.resolve().then(onProductClick);
            }
          }}
        >
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
          disabled={edges.start}
        >
          <ArrowIcon direction="left" />
        </button>
        <button
          type="button"
          className="product-slider__nav product-slider__nav--next"
          onClick={() => scrollBySlides(1)}
          aria-label="Sonraki ürünler"
          disabled={edges.end}
        >
          <ArrowIcon direction="right" />
        </button>
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
