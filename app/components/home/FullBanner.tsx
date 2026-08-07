import {Link} from 'react-router';
import {HOME_FULL_BANNER} from '~/lib/site-content';

export function FullBanner() {
  const {title, text, href, ctaLabel, image, alt} = HOME_FULL_BANNER;

  return (
    <section className="full-banner" aria-label={title}>
      <div className="full-banner__media">
        <img
          src={image}
          alt={alt}
          loading="lazy"
          decoding="async"
          width={2400}
          height={600}
        />
        <div className="full-banner__overlay" aria-hidden="true" />
      </div>

      <div className="full-banner__content">
        <h2 className="full-banner__title">{title}</h2>
        <p className="full-banner__text">{text}</p>
        <Link to={href} className="full-banner__cta">
          <span className="full-banner__cta-label">{ctaLabel}</span>
          <span className="full-banner__cta-line" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
