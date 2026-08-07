import {Link} from 'react-router';
import {HOME_HERO} from '~/lib/site-content';

export function HomeHero() {
  const {image, title, text, cta} = HOME_HERO;

  return (
    <section className="home-hero" aria-label="Hero">
      <div className="home-hero__media">
        <img
          className="home-hero__image"
          src={image.src}
          alt={image.alt}
          width={2400}
          height={1600}
          fetchPriority="high"
          decoding="async"
        />
        <div className="home-hero__overlay" aria-hidden="true" />
      </div>

      <div className="home-hero__content">
        <h1 className="home-hero__title">{title}</h1>
        <p className="home-hero__text">{text}</p>
        <Link to={cta.href} className="home-hero__cta">
          <span className="home-hero__cta-label">{cta.label}</span>
          <span className="home-hero__cta-line" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
