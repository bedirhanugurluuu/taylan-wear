import {useRef} from 'react';
import {Link} from 'react-router';
import {HOME_CATEGORIES} from '~/lib/site-content';

/**
 * Lightweight category slider: native CSS scroll-snap, no library.
 * Shows ~4.5 slides on desktop, arrows appear on hover.
 */
export function CategorySlider() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBySlides = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;

    const slide = track.querySelector<HTMLElement>('.category-slider__slide');
    if (!slide) return;

    const gap = 8;
    track.scrollBy({
      left: direction * (slide.offsetWidth + gap) * 2,
      behavior: 'smooth',
    });
  };

  return (
    <section className="category-slider" aria-label={HOME_CATEGORIES.title}>
      <h2 className="category-slider__title">{HOME_CATEGORIES.title}</h2>

      <div className="category-slider__viewport">
        <div className="category-slider__track" ref={trackRef}>
          {HOME_CATEGORIES.items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="category-slider__slide"
              prefetch="intent"
            >
              <div className="category-slider__media">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  decoding="async"
                  width={800}
                  height={1000}
                />
              </div>
              <span className="category-slider__name">{item.name}</span>
            </Link>
          ))}
        </div>

        <button
          type="button"
          className="category-slider__nav category-slider__nav--prev"
          onClick={() => scrollBySlides(-1)}
          aria-label="Önceki kategoriler"
        >
          <ArrowIcon direction="left" />
        </button>
        <button
          type="button"
          className="category-slider__nav category-slider__nav--next"
          onClick={() => scrollBySlides(1)}
          aria-label="Sonraki kategoriler"
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
