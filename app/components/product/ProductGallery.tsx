import {useEffect, useId, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {Splide, SplideSlide} from '@splidejs/react-splide';
import '@splidejs/react-splide/css/core';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

type GalleryImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

function lightboxUrl(url: string, width?: number | null) {
  const targetWidth = Math.min(Math.max(width ?? 2048, 1200), 2500);
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('width', String(targetWidth));
    return parsed.toString();
  } catch {
    return url;
  }
}

function lightboxSize(image: GalleryImage) {
  const width = image.width && image.width > 0 ? image.width : 1600;
  const height =
    image.height && image.height > 0
      ? image.height
      : Math.round((width * 5) / 4);
  return {width, height};
}

/**
 * Desktop 2×2 grid is always in the HTML and shown via CSS media queries,
 * so it never flashes as a single column while JS hydrates.
 * Mobile Splide mounts only after we know the viewport is < 1024px.
 * PhotoSwipe lightbox (pinch-zoom) is wired to the mobile gallery only.
 */
export function ProductGallery({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const galleryId = useId().replace(/:/g, '');

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (isDesktop !== false || images.length === 0) return;

    const lightbox = new PhotoSwipeLightbox({
      gallery: `#pswp-gallery-${galleryId}`,
      children: 'a',
      pswpModule: () => import('photoswipe'),
      padding: {top: 20, bottom: 20, left: 12, right: 12},
      bgOpacity: 0.92,
      wheelToZoom: true,
    });
    lightbox.init();

    return () => {
      lightbox.destroy();
    };
  }, [galleryId, images, isDesktop]);

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
            <div
              className="product-gallery-slider pswp-gallery"
              id={`pswp-gallery-${galleryId}`}
            >
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
                {images.map((image, index) => {
                  const {width, height} = lightboxSize(image);

                  return (
                    <SplideSlide key={image.id ?? `${image.url}-${index}`}>
                      <div className="product-gallery__item">
                        <a
                          href={lightboxUrl(image.url, image.width)}
                          data-pswp-width={width}
                          data-pswp-height={height}
                          data-cropped="true"
                          className="product-gallery__zoom-link"
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${title} görselini büyüt`}
                        >
                          <Image
                            alt={image.altText || title}
                            data={image}
                            aspectRatio="4/5"
                            sizes="(max-width: 767px) 100vw, 50vw"
                            loading={index < 1 ? 'eager' : 'lazy'}
                          />
                        </a>
                      </div>
                    </SplideSlide>
                  );
                })}
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
