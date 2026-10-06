import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import type {Route} from './+types/account';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export function shouldRevalidate() {
  return true;
}

export const meta: Route.MetaFunction = () => {
  return [{title: 'Taylan Wear | Hesabım'}];
};

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Müşteri bulunamadı');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>();

  const heading = customer?.firstName
    ? `Merhaba, ${customer.firstName}`
    : 'Hesabım';

  return (
    <div className="account">
      <div className="account__header">
        <p className="account__eyebrow">Hesap</p>
        <h1 className="account__title">{heading}</h1>
      </div>
      <AccountMenu />
      <div className="account__content">
        <Outlet context={{customer}} />
      </div>
    </div>
  );
}

function AccountMenu() {
  return (
    <nav className="account-nav" aria-label="Hesap menüsü">
      <NavLink
        to="/account/orders"
        className={({isActive}) =>
          `account-nav__link${isActive ? ' is-active' : ''}`
        }
      >
        Siparişler
      </NavLink>
      <NavLink
        to="/account/profile"
        className={({isActive}) =>
          `account-nav__link${isActive ? ' is-active' : ''}`
        }
      >
        Profil
      </NavLink>
      <NavLink
        to="/account/addresses"
        className={({isActive}) =>
          `account-nav__link${isActive ? ' is-active' : ''}`
        }
      >
        Adresler
      </NavLink>
      <Logout />
    </nav>
  );
}

function Logout() {
  return (
    <Form className="account-logout" method="POST" action="/account/logout">
      <button type="submit" className="account-nav__link account-nav__logout">
        Çıkış yap
      </button>
    </Form>
  );
}
