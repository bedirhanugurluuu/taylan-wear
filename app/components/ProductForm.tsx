import {useState} from 'react';
import {Link, useNavigate} from 'react-router';
import {Image, type MappedProductOptions} from '@shopify/hydrogen';
import type {ProductFragment} from 'storefrontapi.generated';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import type {ProductInfoTabId} from '~/components/product/ProductInfoModal';
import {PRODUCT_PAGE} from '~/lib/site-content';

const COLOR_OPTION_NAMES = ['renk', 'color', 'colour'];
const SIZE_OPTION_NAMES = ['beden', 'size', 'ölçü', 'olcu'];

export function ProductForm({
  productOptions,
  selectedVariant,
  onOpenInfo,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  onOpenInfo?: (tab: ProductInfoTabId) => void;
}) {
  const navigate = useNavigate();
  const {open} = useAside();

  const colorOption = productOptions.find((option) =>
    COLOR_OPTION_NAMES.includes(option.name.trim().toLowerCase()),
  );
  const sizeOption = productOptions.find((option) =>
    SIZE_OPTION_NAMES.includes(option.name.trim().toLowerCase()),
  );
  const otherOptions = productOptions.filter(
    (option) => option !== colorOption && option !== sizeOption,
  );

  const selectedColorName =
    colorOption?.optionValues.find((value) => value.selected)?.name ?? '';
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const colorTitle = hoveredColor ?? selectedColorName;

  const selectOption = (
    value: MappedProductOptions['optionValues'][number],
  ) => {
    if (value.selected || !value.exists) return;

    if (value.isDifferentProduct) {
      void navigate(`/products/${value.handle}?${value.variantUriQuery}`, {
        replace: true,
        preventScrollReset: true,
      });
      return;
    }

    void navigate(`?${value.variantUriQuery}`, {
      replace: true,
      preventScrollReset: true,
    });
  };

  return (
    <div className="product-form">
      {colorOption && colorOption.optionValues.length > 1 ? (
        <div className="product-colors">
          <p className="product-colors__title">
            {colorTitle ? (
              <>
                <span className="product-colors__label">Renk:</span>{' '}
                {colorTitle}
              </>
            ) : (
              colorOption.name
            )}
          </p>
          <div className="product-colors__grid">
            {colorOption.optionValues.map((value) => {
              const image = value.firstSelectableVariant?.image;
              const available = value.available;

              const content = (
                <>
                  {image ? (
                    <Image
                      alt={value.name}
                      data={image}
                      aspectRatio="4/5"
                      sizes="80px"
                      className="product-colors__img"
                    />
                  ) : (
                    <span className="product-colors__fallback">{value.name}</span>
                  )}
                </>
              );

              const className = `product-colors__swatch${
                value.selected ? ' is-selected' : ''
              }${!available ? ' is-unavailable' : ''}`;

              if (value.isDifferentProduct) {
                return (
                  <Link
                    key={`${colorOption.name}-${value.name}`}
                    to={`/products/${value.handle}?${value.variantUriQuery}`}
                    prefetch="intent"
                    preventScrollReset
                    replace
                    className={className}
                    aria-label={value.name}
                    aria-current={value.selected ? 'true' : undefined}
                    onMouseEnter={() => setHoveredColor(value.name)}
                    onMouseLeave={() => setHoveredColor(null)}
                    onFocus={() => setHoveredColor(value.name)}
                    onBlur={() => setHoveredColor(null)}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={`${colorOption.name}-${value.name}`}
                  type="button"
                  className={className}
                  aria-label={value.name}
                  aria-pressed={value.selected}
                  disabled={!value.exists}
                  onMouseEnter={() => setHoveredColor(value.name)}
                  onMouseLeave={() => setHoveredColor(null)}
                  onFocus={() => setHoveredColor(value.name)}
                  onBlur={() => setHoveredColor(null)}
                  onClick={() => selectOption(value)}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {sizeOption && sizeOption.optionValues.length > 0 ? (
        <div className="product-sizes">
          <div className="product-sizes__header">
            <p className="product-sizes__title">Beden</p>
            <button
              type="button"
              className="product-sizes__guide"
              onClick={() => onOpenInfo?.('measure')}
            >
              Nasıl ölçülür?
            </button>
          </div>
          <div className="product-sizes__grid">
            {sizeOption.optionValues.map((value) => (
              <button
                key={`${sizeOption.name}-${value.name}`}
                type="button"
                className={`product-sizes__btn${
                  value.selected ? ' is-selected' : ''
                }${!value.available ? ' is-unavailable' : ''}`}
                disabled={!value.exists}
                aria-pressed={value.selected}
                onClick={() => selectOption(value)}
              >
                {value.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {otherOptions.map((option) => {
        if (option.optionValues.length <= 1) return null;

        return (
          <div className="product-option" key={option.name}>
            <p className="product-option__title">{option.name}</p>
            <div className="product-sizes__grid">
              {option.optionValues.map((value) => (
                <button
                  key={`${option.name}-${value.name}`}
                  type="button"
                  className={`product-sizes__btn${
                    value.selected ? ' is-selected' : ''
                  }${!value.available ? ' is-unavailable' : ''}`}
                  disabled={!value.exists}
                  onClick={() => selectOption(value)}
                >
                  {value.name}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <AddToCartButton
        className="product-atc"
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        onClick={() => {
          open('cart');
        }}
        lines={
          selectedVariant
            ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity: 1,
                  selectedVariant,
                },
              ]
            : []
        }
      >
        {selectedVariant?.availableForSale ? 'Sepete ekle' : 'Tükendi'}
      </AddToCartButton>

      <p className="product-shipping-note">{PRODUCT_PAGE.freeShippingNote}</p>
    </div>
  );
}
