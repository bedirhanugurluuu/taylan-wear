import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/pages.hakkimizda';
import {JsonLd} from '~/components/seo/JsonLd';
import {
  buildBreadcrumbJsonLd,
  buildSeoMeta,
  originFromRequest,
} from '~/lib/seo';
import {ABOUT_PAGE, SITE_SEO} from '~/lib/site-content';

export const meta: Route.MetaFunction = ({data}) => {
  return buildSeoMeta(data?.seo);
};

export async function loader({request}: Route.LoaderArgs) {
  const origin = originFromRequest(request);
  const path = '/pages/hakkimizda';

  return {
    seo: {
      origin,
      path,
      title: ABOUT_PAGE.title,
      description: ABOUT_PAGE.intro,
    },
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: ABOUT_PAGE.title,
        description: ABOUT_PAGE.intro,
        url: `${origin}${path}`,
        mainEntity: {
          '@type': 'Organization',
          name: SITE_SEO.name,
          email: SITE_SEO.email,
          telephone: SITE_SEO.phone,
          address: {
            '@type': 'PostalAddress',
            streetAddress: SITE_SEO.address,
            addressCountry: 'TR',
          },
        },
      },
      buildBreadcrumbJsonLd(origin, [
        {name: 'Ana sayfa', path: '/'},
        {name: ABOUT_PAGE.title, path},
      ]),
    ].filter(Boolean),
  };
}

export default function AboutPage() {
  const {jsonLd} = useLoaderData<typeof loader>();
  const page = ABOUT_PAGE;

  return (
    <div className="about-page">
      <JsonLd data={jsonLd} />
      <header className="about-page__hero">
        <p className="about-page__eyebrow">{page.eyebrow}</p>
        <h1 className="about-page__title">{page.title}</h1>
        <p className="about-page__intro">{page.intro}</p>
      </header>

      <div className="about-page__sections">
        {page.sections.map((section) => (
          <section className="about-page__section" key={section.title}>
            <h2 className="about-page__section-title">{section.title}</h2>
            <p className="about-page__section-text">{section.body}</p>
          </section>
        ))}
      </div>

      <div className="about-page__actions">
        <Link className="about-page__cta" to={page.collectionCta.href}>
          {page.collectionCta.label}
        </Link>
        <Link className="about-page__link" to={page.contactCta.href}>
          {page.contactCta.label}
        </Link>
      </div>
    </div>
  );
}
