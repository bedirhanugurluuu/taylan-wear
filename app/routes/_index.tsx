import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {MockShopNotice} from '~/components/MockShopNotice';
import {HomeHero} from '~/components/home/HomeHero';
import {CategorySlider} from '~/components/home/CategorySlider';
import {DepartmentBanners} from '~/components/home/DepartmentBanners';
import {FullBanner} from '~/components/home/FullBanner';
import {NewProducts} from '~/components/home/NewProducts';
import {JsonLd} from '~/components/seo/JsonLd';
import {NEW_PRODUCTS_QUERY} from '~/lib/product-queries';
import {
  buildBreadcrumbJsonLd,
  buildSeoMeta,
  originFromRequest,
} from '~/lib/seo';
import {HOME_HERO, SITE_SEO} from '~/lib/site-content';

export const meta: Route.MetaFunction = ({data}) => {
  return buildSeoMeta(data?.seo);
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const origin = originFromRequest(args.request);

  return {
    isShopLinked: Boolean(args.context.env.PUBLIC_STORE_DOMAIN),
    seo: {
      origin,
      path: '/',
      title: SITE_SEO.name,
      description: SITE_SEO.defaultDescription,
      image: HOME_HERO.image.src,
      imageAlt: HOME_HERO.image.alt,
      titleTemplate: false,
    },
    jsonLd: [
      buildBreadcrumbJsonLd(origin, [{name: 'Ana sayfa', path: '/'}]),
    ].filter(Boolean),
    ...deferredData,
  };
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const newProducts = context.storefront
    .query(NEW_PRODUCTS_QUERY)
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {
    newProducts,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="home">
      <JsonLd data={data.jsonLd} />
      {data.isShopLinked ? null : <MockShopNotice />}
      <HomeHero />
      <CategorySlider />
      <DepartmentBanners />
      <NewProducts products={data.newProducts} />
      <FullBanner />
    </div>
  );
}
