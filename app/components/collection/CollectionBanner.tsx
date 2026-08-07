import {Link} from 'react-router';
import {COLLECTION_BANNER} from '~/lib/site-content';

export function CollectionBanner() {
  const banner = COLLECTION_BANNER;

  return (
    <section className="collection-banner" aria-label="Kampanya">
      <div className="collection-banner__media">
        <img
          src={banner.image}
          alt={banner.alt}
          loading="eager"
          decoding="async"
          width={2400}
          height={900}
        />
        <div className="collection-banner__overlay" aria-hidden="true" />
      </div>

      <div className="collection-banner__content">
        <h2 className="collection-banner__title">{banner.title}</h2>
        {banner.text ? (
          <p className="collection-banner__text">{banner.text}</p>
        ) : null}
        <Link to={banner.href} className="collection-banner__cta">
          <span className="collection-banner__cta-label">{banner.ctaLabel}</span>
          <span className="collection-banner__cta-line" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
