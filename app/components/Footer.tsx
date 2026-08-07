import {type FormEvent} from 'react';
import {Link} from 'react-router';
import {FOOTER} from '~/lib/site-content';

export function Footer() {
  const onNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__cols">
          <div className="footer__col">
            <h3 className="footer__heading">{FOOTER.brand.title}</h3>
            <ul className="footer__list">
              {FOOTER.brand.links.map((item) => (
                <li key={item.href}>
                  <Link to={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h3 className="footer__heading">{FOOTER.help.title}</h3>
            <ul className="footer__list">
              {FOOTER.help.links.map((item) => (
                <li key={item.href}>
                  <Link to={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__newsletter">
          <h3 className="footer__heading footer__heading--light">
            {FOOTER.newsletter.title}
          </h3>
          <p className="footer__newsletter-text">{FOOTER.newsletter.text}</p>

          <form className="footer__form" onSubmit={onNewsletterSubmit}>
            <label className="sr-only" htmlFor="footer-email">
              E-mail
            </label>
            <input
              id="footer-email"
              className="footer__input"
              type="email"
              name="email"
              placeholder={FOOTER.newsletter.placeholder}
              autoComplete="email"
              required
            />
            <button type="submit" className="footer__submit">
              Gönder
            </button>
          </form>

          <p className="footer__contact footer__contact--muted">
            {FOOTER.contact.address}
          </p>
          <a
            className="footer__contact"
            href={`tel:${FOOTER.contact.phone.replace(/\s/g, '')}`}
          >
            {FOOTER.contact.phone}
          </a>

          <div className="footer__social">
            <a
              href={FOOTER.social.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <IconInstagram />
            </a>
            <a
              href={FOOTER.social.shopier}
              target="_blank"
              rel="noreferrer"
              aria-label="Shopier"
            >
              <IconShopier />
            </a>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="footer__legal">
          {FOOTER.bottom.links.map((item, index) => (
            <span key={item.href} className="footer__legal-item">
              {index > 0 ? (
                <span className="footer__legal-sep" aria-hidden="true">
                  |
                </span>
              ) : null}
              <Link to={item.href}>{item.label}</Link>
            </span>
          ))}
        </div>
        <p className="footer__copyright">{FOOTER.bottom.copyright}</p>
      </div>
    </footer>
  );
}

function IconInstagram() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconShopier() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 9h16l-1.2 10.2A2 2 0 0 1 16.8 21H7.2a2 2 0 0 1-2-1.8L4 9z" />
      <path d="M8 9V7a4 4 0 0 1 8 0v2" />
    </svg>
  );
}
