import {Link} from 'react-router';
import {HOME_DEPARTMENTS} from '~/lib/site-content';

export function DepartmentBanners() {
  return (
    <section className="department-banners" aria-label="Koleksiyonlar">
      <div className="department-banners__grid">
        {HOME_DEPARTMENTS.map((item) => (
          <article key={item.href} className="department-banner">
            <div className="department-banner__media">
              <img
                src={item.image}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                width={1200}
                height={1500}
              />
              <div className="department-banner__overlay" aria-hidden="true" />
            </div>

            <div className="department-banner__content">
              <h2 className="department-banner__title">{item.title}</h2>
              <p className="department-banner__text">{item.text}</p>
              <Link to={item.href} className="department-banner__cta">
                <span className="department-banner__cta-label">İncele</span>
                <span className="department-banner__cta-line" aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
