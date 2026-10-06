import type {CustomerAddressInput} from '@shopify/hydrogen/customer-account-api-types';
import type {
  AddressFragment,
  CustomerFragment,
} from 'customer-accountapi.generated';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
  type Fetcher,
} from 'react-router';
import type {Route} from './+types/account.addresses';
import {
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  CREATE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';

export type ActionResponse = {
  addressId?: string | null;
  createdAddress?: AddressFragment;
  defaultAddress?: string | null;
  deletedAddress?: string | null;
  error: Record<AddressFragment['id'], string> | null;
  updatedAddress?: AddressFragment;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Taylan Wear | Adreslerim'}];
};

export async function loader({context}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;

  try {
    const form = await request.formData();

    const addressId = form.has('addressId')
      ? String(form.get('addressId'))
      : null;
    if (!addressId) {
      throw new Error('Adres kimliği gerekli.');
    }

    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return data(
        {error: {[addressId]: 'Oturum açmanız gerekiyor.'}},
        {
          status: 401,
        },
      );
    }

    const defaultAddress = form.has('defaultAddress')
      ? String(form.get('defaultAddress')) === 'on'
      : false;
    const address: CustomerAddressInput = {};
    const keys: (keyof CustomerAddressInput)[] = [
      'address1',
      'address2',
      'city',
      'company',
      'territoryCode',
      'firstName',
      'lastName',
      'phoneNumber',
      'zoneCode',
      'zip',
    ];

    for (const key of keys) {
      const value = form.get(key);
      if (typeof value === 'string') {
        address[key] = value;
      }
    }

    switch (request.method) {
      case 'POST': {
        try {
          const {data, errors} = await customerAccount.mutate(
            CREATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressCreate?.userErrors?.length) {
            throw new Error(data?.customerAddressCreate?.userErrors[0].message);
          }

          if (!data?.customerAddressCreate?.customerAddress) {
            throw new Error('Adres oluşturulamadı.');
          }

          return {
            error: null,
            createdAddress: data?.customerAddressCreate?.customerAddress,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'PUT': {
        try {
          const {data, errors} = await customerAccount.mutate(
            UPDATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                addressId: decodeURIComponent(addressId),
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressUpdate?.userErrors?.length) {
            throw new Error(data?.customerAddressUpdate?.userErrors[0].message);
          }

          if (!data?.customerAddressUpdate?.customerAddress) {
            throw new Error('Adres güncellenemedi.');
          }

          return {
            error: null,
            updatedAddress: address,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'DELETE': {
        try {
          const {data, errors} = await customerAccount.mutate(
            DELETE_ADDRESS_MUTATION,
            {
              variables: {
                addressId: decodeURIComponent(addressId),
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressDelete?.userErrors?.length) {
            throw new Error(data?.customerAddressDelete?.userErrors[0].message);
          }

          if (!data?.customerAddressDelete?.deletedAddressId) {
            throw new Error('Adres silinemedi.');
          }

          return {error: null, deletedAddress: addressId};
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      default: {
        return data(
          {error: {[addressId]: 'Method not allowed'}},
          {
            status: 405,
          },
        );
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return data(
        {error: error.message},
        {
          status: 400,
        },
      );
    }
    return data(
      {error},
      {
        status: 400,
      },
    );
  }
}

export default function Addresses() {
  const {customer} = useOutletContext<{customer: CustomerFragment}>();
  const {defaultAddress, addresses} = customer;

  return (
    <div className="account-addresses">
      <h2 className="account-section__title">Adreslerim</h2>

      <section className="account-address-block">
        <h3 className="account-address-block__title">Yeni adres ekle</h3>
        <NewAddressForm key={addresses.nodes.length} />
      </section>

      <section className="account-address-block">
        <h3 className="account-address-block__title">Kayıtlı adresler</h3>
        {!addresses.nodes.length ? (
          <p className="account-empty__text">Kayıtlı adresiniz yok.</p>
        ) : (
          <ExistingAddresses
            addresses={addresses}
            defaultAddress={defaultAddress}
          />
        )}
      </section>
    </div>
  );
}

function NewAddressForm() {
  const newAddress = {
    address1: '',
    address2: '',
    city: '',
    company: '',
    territoryCode: 'TR',
    firstName: '',
    id: 'new',
    lastName: '',
    phoneNumber: '',
    zoneCode: '',
    zip: '',
  } as CustomerAddressInput;

  return (
    <AddressForm
      addressId={'NEW_ADDRESS_ID'}
      address={newAddress}
      defaultAddress={null}
    >
      {({stateForMethod}) => (
        <div className="account-form__actions">
          <button
            className="account-btn"
            disabled={stateForMethod('POST') !== 'idle'}
            formMethod="POST"
            type="submit"
          >
            {stateForMethod('POST') !== 'idle' ? 'Ekleniyor…' : 'Adres ekle'}
          </button>
        </div>
      )}
    </AddressForm>
  );
}

function ExistingAddresses({
  addresses,
  defaultAddress,
}: Pick<CustomerFragment, 'addresses' | 'defaultAddress'>) {
  return (
    <div className="account-address-list">
      {addresses.nodes.map((address) => (
        <AddressForm
          key={address.id}
          addressId={address.id}
          address={address}
          defaultAddress={defaultAddress}
        >
          {({stateForMethod}) => (
            <div className="account-form__actions">
              <button
                className="account-btn"
                disabled={stateForMethod('PUT') !== 'idle'}
                formMethod="PUT"
                type="submit"
              >
                {stateForMethod('PUT') !== 'idle' ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
              <button
                className="account-btn account-btn--ghost"
                disabled={stateForMethod('DELETE') !== 'idle'}
                formMethod="DELETE"
                type="submit"
              >
                {stateForMethod('DELETE') !== 'idle' ? 'Siliniyor…' : 'Sil'}
              </button>
            </div>
          )}
        </AddressForm>
      ))}
    </div>
  );
}

export function AddressForm({
  addressId,
  address,
  defaultAddress,
  children,
}: {
  addressId: AddressFragment['id'];
  address: CustomerAddressInput;
  defaultAddress: CustomerFragment['defaultAddress'];
  children: (props: {
    stateForMethod: (method: 'PUT' | 'POST' | 'DELETE') => Fetcher['state'];
  }) => React.ReactNode;
}) {
  const {state, formMethod} = useNavigation();
  const action = useActionData<ActionResponse>();
  const error = action?.error?.[addressId];
  const isDefaultAddress = defaultAddress?.id === addressId;

  return (
    <Form id={addressId} className="account-form account-form--address">
      <fieldset className="account-form__fieldset">
        <input type="hidden" name="addressId" defaultValue={addressId} />
        <div className="account-form__grid">
          <label className="account-field" htmlFor={`${addressId}-firstName`}>
            <span>Ad*</span>
            <input
              aria-label="Ad"
              autoComplete="given-name"
              defaultValue={address?.firstName ?? ''}
              id={`${addressId}-firstName`}
              name="firstName"
              placeholder="Ad"
              required
              type="text"
            />
          </label>
          <label className="account-field" htmlFor={`${addressId}-lastName`}>
            <span>Soyad*</span>
            <input
              aria-label="Soyad"
              autoComplete="family-name"
              defaultValue={address?.lastName ?? ''}
              id={`${addressId}-lastName`}
              name="lastName"
              placeholder="Soyad"
              required
              type="text"
            />
          </label>
          <label className="account-field" htmlFor={`${addressId}-company`}>
            <span>Firma</span>
            <input
              aria-label="Firma"
              autoComplete="organization"
              defaultValue={address?.company ?? ''}
              id={`${addressId}-company`}
              name="company"
              placeholder="Firma (opsiyonel)"
              type="text"
            />
          </label>
          <label className="account-field account-field--full" htmlFor={`${addressId}-address1`}>
            <span>Adres*</span>
            <input
              aria-label="Adres satırı 1"
              autoComplete="address-line1"
              defaultValue={address?.address1 ?? ''}
              id={`${addressId}-address1`}
              name="address1"
              placeholder="Sokak, mahalle, bina no"
              required
              type="text"
            />
          </label>
          <label className="account-field account-field--full" htmlFor={`${addressId}-address2`}>
            <span>Adres satırı 2</span>
            <input
              aria-label="Adres satırı 2"
              autoComplete="address-line2"
              defaultValue={address?.address2 ?? ''}
              id={`${addressId}-address2`}
              name="address2"
              placeholder="Daire, kat (opsiyonel)"
              type="text"
            />
          </label>
          <label className="account-field" htmlFor={`${addressId}-city`}>
            <span>İlçe / Şehir*</span>
            <input
              aria-label="Şehir"
              autoComplete="address-level2"
              defaultValue={address?.city ?? ''}
              id={`${addressId}-city`}
              name="city"
              placeholder="İstanbul"
              required
              type="text"
            />
          </label>
          <label className="account-field" htmlFor={`${addressId}-zoneCode`}>
            <span>İl*</span>
            <input
              aria-label="İl"
              autoComplete="address-level1"
              defaultValue={address?.zoneCode ?? ''}
              id={`${addressId}-zoneCode`}
              name="zoneCode"
              placeholder="34 veya İstanbul"
              required
              type="text"
            />
          </label>
          <label className="account-field" htmlFor={`${addressId}-zip`}>
            <span>Posta kodu*</span>
            <input
              aria-label="Posta kodu"
              autoComplete="postal-code"
              defaultValue={address?.zip ?? ''}
              id={`${addressId}-zip`}
              name="zip"
              placeholder="34000"
              required
              type="text"
            />
          </label>
          <label className="account-field" htmlFor={`${addressId}-territoryCode`}>
            <span>Ülke kodu*</span>
            <input
              aria-label="Ülke kodu"
              autoComplete="country"
              defaultValue={address?.territoryCode ?? 'TR'}
              id={`${addressId}-territoryCode`}
              name="territoryCode"
              placeholder="TR"
              required
              type="text"
              maxLength={2}
            />
          </label>
          <label className="account-field" htmlFor={`${addressId}-phoneNumber`}>
            <span>Telefon</span>
            <input
              aria-label="Telefon"
              autoComplete="tel"
              defaultValue={address?.phoneNumber ?? ''}
              id={`${addressId}-phoneNumber`}
              name="phoneNumber"
              placeholder="+905551112233"
              pattern="^\+?[1-9]\d{3,14}$"
              type="tel"
            />
          </label>
        </div>

        <label className="account-checkbox" htmlFor={`${addressId}-defaultAddress`}>
          <input
            defaultChecked={isDefaultAddress}
            id={`${addressId}-defaultAddress`}
            name="defaultAddress"
            type="checkbox"
          />
          <span>Varsayılan adres olarak ayarla</span>
        </label>

        {error ? (
          <p className="account-form__error" role="alert">
            {error}
          </p>
        ) : null}

        {children({
          stateForMethod: (method) => (formMethod === method ? state : 'idle'),
        })}
      </fieldset>
    </Form>
  );
}
