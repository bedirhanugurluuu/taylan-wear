import {Link} from 'react-router';
import {Splide, SplideSlide} from '@splidejs/react-splide';
import '@splidejs/react-splide/css/core';
import {HOME_CATEGORIES} from '~/lib/site-content';

/**
 * Category rail: Splide free-drag + snap, with leading/trailing gutter
 * so the first slide aligns with the section title.
 */
export function CategorySlider() {
  return (
    <section className="category-slider" aria-label={HOME_CATEGORIES.title}>
      <h2 className="category-slider__title">{HOME_CATEGORIES.title}</h2>

      <div className="category-slider__viewport">
        <Splide
          className="category-slider-splide"
          options={{
            type: 'slide',
            perPage: 2.2,
            perMove: 1,
            focus: 0,
            gap: '8px',
            padding: {left: '12px', right: '12px'},
            arrows: true,
            pagination: false,
            drag: 'free',
            snap: true,
            omitEnd: true,
            speed: 450,
            mediaQuery: 'min',
            breakpoints: {
              768: {
                perPage: 4.2,
                padding: {left: '24px', right: '24px'},
              },
            },
          }}
          aria-label={HOME_CATEGORIES.title}
        >
          {HOME_CATEGORIES.items.map((item) => (
            <SplideSlide key={item.href}>
              <Link
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
            </SplideSlide>
          ))}
        </Splide>
      </div>
    </section>
  );
}
