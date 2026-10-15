import {type FormEvent, useState} from 'react';
import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/pages.contact';
import {JsonLd} from '~/components/seo/JsonLd';
import {
  buildBreadcrumbJsonLd,
  buildSeoMeta,
  originFromRequest,
} from '~/lib/seo';
import {CONTACT_PAGE, SITE_SEO} from '~/lib/site-content';

export const meta: Route.MetaFunction = ({data}) => {
  return buildSeoMeta(data?.seo);
};

export async function loader({request}: Route.LoaderArgs) {
  const origin = originFromRequest(request);
  const path = '/pages/contact';

  return {
    seo: {
      origin,
      path,
      title: CONTACT_PAGE.title,
      description: CONTACT_PAGE.intro,
    },
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: CONTACT_PAGE.title,
        description: CONTACT_PAGE.intro,
        url: `${origin}${path}`,
        mainEntity: {
          '@type': 'Organization',
          name: SITE_SEO.name,
          email: CONTACT_PAGE.email,
          telephone: CONTACT_PAGE.phone,
          address: {
            '@type': 'PostalAddress',
            streetAddress: CONTACT_PAGE.address,
            addressCountry: 'TR',
          },
        },
      },
      buildBreadcrumbJsonLd(origin, [
        {name: 'Ana sayfa', path: '/'},
        {name: CONTACT_PAGE.title, path},
      ]),
    ].filter(Boolean),
  };
}

export default function ContactPage() {
  const {jsonLd} = useLoaderData<typeof loader>();
  const page = CONTACT_PAGE;
  const [sentHint, setSentHint] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim();
    const subject = String(form.get('subject') || '').trim();
    const message = String(form.get('message') || '').trim();

    const mailSubject = encodeURIComponent(`[Taylan Wear] ${subject}`);
    const mailBody = encodeURIComponent(
      `Ad Soyad: ${name}\nE-posta: ${email}\n\n${message}`,
    );

    setSentHint(true);
    window.location.href = `mailto:${page.email}?subject=${mailSubject}&body=${mailBody}`;
  };

  return (
    <div className="contact-page">
      <JsonLd data={jsonLd} />
      <header className="contact-page__hero">
        <p className="contact-page__eyebrow">{page.eyebrow}</p>
        <h1 className="contact-page__title">{page.title}</h1>
        <p className="contact-page__intro">{page.intro}</p>
      </header>

      <div className="contact-page__grid">
        <section className="contact-page__details" aria-label="İletişim bilgileri">
          <div className="contact-page__block">
            <h2 className="contact-page__block-title">Adres</h2>
            <p className="contact-page__block-text">{page.address}</p>
          </div>
          <div className="contact-page__block">
            <h2 className="contact-page__block-title">Telefon</h2>
            <p className="contact-page__block-text">
              <a href={`tel:${page.phone.replace(/\s/g, '')}`}>{page.phone}</a>
            </p>
          </div>
          <div className="contact-page__block">
            <h2 className="contact-page__block-title">E-posta</h2>
            <p className="contact-page__block-text">
              <a href={`mailto:${page.email}`}>{page.email}</a>
            </p>
          </div>
          <div className="contact-page__block">
            <h2 className="contact-page__block-title">Çalışma saatleri</h2>
            <ul className="contact-page__hours">
              {page.hours.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="contact-page__block">
            <h2 className="contact-page__block-title">{page.social.title}</h2>
            <ul className="contact-page__social">
              {page.social.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} target="_blank" rel="noreferrer">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="contact-page__form-wrap" aria-labelledby="contact-form-title">
          <h2 id="contact-form-title" className="contact-page__form-title">
            {page.form.title}
          </h2>
          <p className="contact-page__form-text">{page.form.text}</p>
          <form className="contact-page__form" onSubmit={onSubmit}>
            <label className="contact-page__field">
              <span>{page.form.nameLabel}</span>
              <input name="name" type="text" required autoComplete="name" />
            </label>
            <label className="contact-page__field">
              <span>{page.form.emailLabel}</span>
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label className="contact-page__field">
              <span>{page.form.subjectLabel}</span>
              <select name="subject" required defaultValue={page.form.subjects[0]}>
                {page.form.subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </label>
            <label className="contact-page__field">
              <span>{page.form.messageLabel}</span>
              <textarea name="message" rows={6} required />
            </label>
            <button type="submit" className="contact-page__submit">
              {page.form.submitLabel}
            </button>
            {sentHint ? (
              <p className="contact-page__hint">
                E-posta uygulaman açılmazsa{' '}
                <a href={`mailto:${page.email}`}>{page.email}</a> adresine yaz.
              </p>
            ) : null}
          </form>
        </section>
      </div>
    </div>
  );
}
