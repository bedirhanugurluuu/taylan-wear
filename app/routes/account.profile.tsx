import type {CustomerFragment} from 'customer-accountapi.generated';
import type {CustomerUpdateInput} from '@shopify/hydrogen/customer-account-api-types';
import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';
import type {Route} from './+types/account.profile';

export type ActionResponse = {
  error: string | null;
  customer: CustomerFragment | null;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Taylan Wear | Profil'}];
};

export async function loader({context}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;

  if (request.method !== 'PUT') {
    return data({error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();

  try {
    const customer: CustomerUpdateInput = {};
    const validInputKeys = ['firstName', 'lastName'] as const;
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key as any)) {
        continue;
      }
      if (typeof value === 'string' && value.length) {
        customer[key as (typeof validInputKeys)[number]] = value;
      }
    }

    const {data, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
          language: customerAccount.i18n.language,
        },
      },
    );

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    if (!data?.customerUpdate?.customer) {
      throw new Error('Profil güncellenemedi.');
    }

    return {
      error: null,
      customer: data?.customerUpdate?.customer,
    };
  } catch (error: any) {
    return data(
      {error: error.message, customer: null},
      {
        status: 400,
      },
    );
  }
}

export default function AccountProfile() {
  const account = useOutletContext<{customer: CustomerFragment}>();
  const {state} = useNavigation();
  const action = useActionData<ActionResponse>();
  const customer = action?.customer ?? account?.customer;

  return (
    <div className="account-profile">
      <h2 className="account-section__title">Profilim</h2>
      <Form method="PUT" className="account-form">
        <fieldset className="account-form__fieldset">
          <legend className="account-form__legend">Kişisel bilgiler</legend>
          <div className="account-form__grid">
            <label className="account-field" htmlFor="firstName">
              <span>Ad</span>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Adınız"
                aria-label="Ad"
                defaultValue={customer.firstName ?? ''}
                minLength={2}
              />
            </label>
            <label className="account-field" htmlFor="lastName">
              <span>Soyad</span>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Soyadınız"
                aria-label="Soyad"
                defaultValue={customer.lastName ?? ''}
                minLength={2}
              />
            </label>
          </div>
        </fieldset>
        {action?.error ? (
          <p className="account-form__error" role="alert">
            {action.error}
          </p>
        ) : null}
        <button type="submit" className="account-btn" disabled={state !== 'idle'}>
          {state !== 'idle' ? 'Kaydediliyor…' : 'Kaydet'}
        </button>
      </Form>
    </div>
  );
}
