import {useEffect, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {Splide, SplideSlide} from '@splidejs/react-splide';
import '@splidejs/react-splide/css/core';

type GalleryImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

/**
 * Desktop 2×2 grid is always in the HTML and shown via CSS media queries,
 * so it never flashes as a single column while JS hydrates.
 * Mobile Splide mounts only after we know the viewport is < 1024px.
 */
export function ProductGallery({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  if (images.length === 0) {
    return <div className="product-gallery product-gallery--empty" />;
  }

  return (
    <div className="product-gallery-wrap">
      <div className="product-gallery product-gallery--grid product-gallery--desktop">
        {images.map((image, index) => (
          <div
            key={image.id ?? `${image.url}-${index}`}
            className="product-gallery__item"
          >
            <Image
              alt={image.altText || title}
              data={image}
              aspectRatio="4/5"
              sizes="33vw"
              loading={index < 2 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {isDesktop !== true ? (
        <div className="product-gallery-mobile">
          {isDesktop === false ? (
            <div className="product-gallery-slider">
              <Splide
                className="product-gallery-splide"
                options={{
                  type: 'slide',
                  perPage: 1,
                  perMove: 1,
                  gap: '4px',
                  pagination: true,
                  arrows: false,
                  drag: true,
                  speed: 450,
                  mediaQuery: 'min',
                  breakpoints: {
                    768: {
                      perPage: 2,
                    },
                  },
                }}
                aria-label={`${title} görselleri`}
              >
                {images.map((image, index) => (
                  <SplideSlide key={image.id ?? `${image.url}-${index}`}>
                    <div className="product-gallery__item">
                      <Image
                        alt={image.altText || title}
                        data={image}
                        aspectRatio="4/5"
                        sizes="(max-width: 767px) 100vw, 50vw"
                        loading={index < 1 ? 'eager' : 'lazy'}
                      />
                    </div>
                  </SplideSlide>
                ))}
              </Splide>
            </div>
          ) : (
            <div className="product-gallery product-gallery--fallback">
              {images.slice(0, 1).map((image, index) => (
                <div
                  key={image.id ?? `${image.url}-${index}`}
                  className="product-gallery__item"
                >
                  <Image
                    alt={image.altText || title}
                    data={image}
                    aspectRatio="4/5"
                    sizes="100vw"
                    loading="eager"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
