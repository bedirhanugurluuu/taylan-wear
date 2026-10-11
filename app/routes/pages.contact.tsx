import {type FormEvent, useState} from 'react';
import {Link} from 'react-router';
import {CONTACT_PAGE} from '~/lib/site-content';

export const meta = () => {
  return [
    {title: 'Taylan Wear | İletişim'},
    {name: 'description', content: CONTACT_PAGE.intro},
  ];
};

export default function ContactPage() {
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
      <header className="contact-page__hero">
        <p className="contact-page__eyebrow">{page.eyebrow}</p>
        <h1 className="contact-page__title">{page.title}</h1>
        <p className="contact-page__intro">{page.intro}</p>
      </header>

      <div className="contact-page__grid">
        <section className="contact-page__info" aria-label="İletişim bilgileri">
          <div className="contact-page__block">
            <h2 className="contact-page__heading">Bize ulaş</h2>
            <ul className="contact-page__list">
              <li>
                <span className="contact-page__label">E-posta</span>
                <a href={`mailto:${page.email}`}>{page.email}</a>
              </li>
              <li>
                <span className="contact-page__label">Telefon</span>
                <a href={`tel:${page.phone.replace(/\s/g, '')}`}>{page.phone}</a>
              </li>
              <li>
                <span className="contact-page__label">Adres</span>
                <span>{page.address}</span>
              </li>
            </ul>
          </div>

          <div className="contact-page__block">
            <h2 className="contact-page__heading">Çalışma saatleri</h2>
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
            <h2 className="contact-page__heading">{page.social.title}</h2>
            <div className="contact-page__social">
              {page.social.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <p className="contact-page__note">
            Sipariş ve iade süreçleri için{' '}
            <Link to="/policies/shipping-policy">Kargo</Link> ve{' '}
            <Link to="/policies/refund-policy">İade & Değişim</Link>{' '}
            politikalarına da bakabilirsin.
          </p>
        </section>

        <section className="contact-page__form-panel" aria-label="İletişim formu">
          <h2 className="contact-page__heading">{page.form.title}</h2>
          <p className="contact-page__form-text">{page.form.text}</p>

          <form className="contact-form" onSubmit={onSubmit}>
            <label className="contact-form__field">
              <span>{page.form.nameLabel}</span>
              <input name="name" type="text" autoComplete="name" required />
            </label>

            <label className="contact-form__field">
              <span>{page.form.emailLabel}</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </label>

            <label className="contact-form__field">
              <span>{page.form.subjectLabel}</span>
              <select name="subject" required defaultValue={page.form.subjects[0]}>
                {page.form.subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </label>

            <label className="contact-form__field">
              <span>{page.form.messageLabel}</span>
              <textarea name="message" rows={6} required />
            </label>

            <button type="submit" className="contact-form__submit">
              {page.form.submitLabel}
            </button>

            {sentHint ? (
              <p className="contact-form__hint" role="status">
                E-posta uygulaman açılıyor…
              </p>
            ) : null}
          </form>
        </section>
      </div>
    </div>
  );
}
