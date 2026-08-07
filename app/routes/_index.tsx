import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {MockShopNotice} from '~/components/MockShopNotice';
import {HomeHero} from '~/components/home/HomeHero';
import {CategorySlider} from '~/components/home/CategorySlider';
import {DepartmentBanners} from '~/components/home/DepartmentBanners';
import {FullBanner} from '~/components/home/FullBanner';
import {NewProducts} from '~/components/home/NewProducts';
import {NEW_PRODUCTS_QUERY} from '~/lib/product-queries';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Taylan Wear'}];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);

  return {
    isShopLinked: Boolean(args.context.env.PUBLIC_STORE_DOMAIN),
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
      {data.isShopLinked ? null : <MockShopNotice />}
      <HomeHero />
      <CategorySlider />
      <DepartmentBanners />
      <NewProducts products={data.newProducts} />
      <FullBanner />
    </div>
  );
}
