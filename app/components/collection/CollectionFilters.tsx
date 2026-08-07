import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import {Link, useLocation, useNavigate, useSearchParams} from 'react-router';
import {
  clearFilterParams,
  getActiveFilterCount,
  isFilterValueActive,
  setPriceFilterParam,
  SORT_OPTIONS,
  toggleFilterParam,
  type CollectionFilter,
} from '~/lib/collection-filters';

type CollectionControlsProps = {
  filters: CollectionFilter[];
  productCountLabel: string;
  children?: ReactNode;
};

export function CollectionControls({
  filters,
  productCountLabel,
  children,
}: CollectionControlsProps) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeCount = getActiveFilterCount(searchParams);

  const applyParams = (next: URLSearchParams) => {
    const query = next.toString();
    void navigate(`${location.pathname}${query ? `?${query}` : ''}`, {
      preventScrollReset: true,
      replace: true,
    });
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia('(max-width: 767px)');
    if (!mq.matches) return;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="collection-page__controls" ref={rootRef}>
      <div className="collection-page__toolbar">
        {filters.length > 0 ? (
          <button
            type="button"
            className={`collection-filters__toggle${open ? ' is-open' : ''}`}
            aria-expanded={open}
            aria-controls="collection-filters-panel"
            onClick={() => setOpen((value) => !value)}
          >
            Filtreler{activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
        ) : (
          <span />
        )}
        {children}
      </div>

      <div className="collection-page__meta">
        <p className="collection-page__count">{productCountLabel}</p>
        <CollectionActiveFilters filters={filters} />
      </div>

      {open && filters.length > 0 ? (
        <div
          id="collection-filters-panel"
          className="collection-filters__panel"
          role="dialog"
          aria-modal="true"
          aria-label="Filtreler"
        >
          <div className="collection-filters__panel-top">
            <span className="collection-filters__panel-title">
              Filtreler{activeCount > 0 ? ` (${activeCount})` : ''}
            </span>
            <div className="collection-filters__panel-actions">
              {activeCount > 0 ? (
                <button
                  type="button"
                  className="collection-filters__clear"
                  onClick={() => applyParams(clearFilterParams(searchParams))}
                >
                  Temizle
                </button>
              ) : null}
              <button
                type="button"
                className="collection-filters__close"
                onClick={() => setOpen(false)}
              >
                Kapat
              </button>
            </div>
          </div>

          <div className="collection-filters__groups">
            {filters.map((filter) => (
              <FilterGroup
                key={filter.id}
                filter={filter}
                searchParams={searchParams}
                onToggle={(value) =>
                  applyParams(toggleFilterParam(searchParams, value))
                }
                onPriceApply={(min, max) =>
                  applyParams(setPriceFilterParam(searchParams, min, max))
                }
              />
            ))}
          </div>

          <button
            type="button"
            className="collection-filters__apply"
            onClick={() => setOpen(false)}
          >
            Sonuçları göster
          </button>
        </div>
      ) : null}
    </div>
  );
}

function FilterGroup({
  filter,
  searchParams,
  onToggle,
  onPriceApply,
}: {
  filter: CollectionFilter;
  searchParams: URLSearchParams;
  onToggle: (value: CollectionFilter['values'][number]) => void;
  onPriceApply: (min: string, max: string) => void;
}) {
  if (filter.type === 'PRICE_RANGE') {
    return (
      <PriceFilter
        filter={filter}
        searchParams={searchParams}
        onApply={onPriceApply}
      />
    );
  }

  return (
    <div className="collection-filter-group">
      <h3 className="collection-filter-group__label">{filter.label}</h3>
      <ul className="collection-filter-group__list">
        {filter.values.map((value) => {
          const checked = isFilterValueActive(searchParams, value.id);
          const disabled = value.count === 0 && !checked;

          return (
            <li key={value.id}>
              <label
                className={`collection-filter-option${
                  disabled ? ' is-disabled' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onToggle(value)}
                />
                <span>{value.label}</span>
                <span className="collection-filter-option__count">
                  {value.count}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PriceFilter({
  filter,
  searchParams,
  onApply,
}: {
  filter: CollectionFilter;
  searchParams: URLSearchParams;
  onApply: (min: string, max: string) => void;
}) {
  const [min, setMin] = useState(searchParams.get('filter.v.price.gte') || '');
  const [max, setMax] = useState(searchParams.get('filter.v.price.lte') || '');

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    onApply(min, max);
  };

  return (
    <div className="collection-filter-group">
      <h3 className="collection-filter-group__label">{filter.label}</h3>
      <form className="collection-price-filter" onSubmit={onSubmit}>
        <input
          type="number"
          inputMode="numeric"
          min="0"
          placeholder="Min"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          aria-label="Minimum fiyat"
        />
        <span aria-hidden="true">–</span>
        <input
          type="number"
          inputMode="numeric"
          min="0"
          placeholder="Max"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          aria-label="Maksimum fiyat"
        />
        <button type="submit">Uygula</button>
      </form>
    </div>
  );
}

export function CollectionSort() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const current = searchParams.get('sort') || 'manual';

  return (
    <label className="collection-sort">
      <span className="sr-only">Sırala</span>
      <select
        value={current}
        onChange={(e) => {
          const next = new URLSearchParams(searchParams);
          next.delete('cursor');
          next.delete('direction');
          if (e.target.value === 'manual') next.delete('sort');
          else next.set('sort', e.target.value);
          const query = next.toString();
          void navigate(`${location.pathname}${query ? `?${query}` : ''}`, {
            preventScrollReset: true,
            replace: true,
          });
        }}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CollectionActiveFilters({
  filters,
}: {
  filters: CollectionFilter[];
}) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const active = filters.flatMap((filter) =>
    filter.values
      .filter((value) => isFilterValueActive(searchParams, value.id))
      .map((value) => ({filterLabel: filter.label, value})),
  );

  const hasPrice =
    searchParams.has('filter.v.price.gte') ||
    searchParams.has('filter.v.price.lte');

  if (active.length === 0 && !hasPrice) return null;

  return (
    <div className="collection-active-filters">
      {active.map(({value}) => (
        <button
          key={value.id}
          type="button"
          className="collection-active-filters__chip"
          onClick={() => {
            void navigate(
              `${location.pathname}?${toggleFilterParam(searchParams, value)}`,
              {preventScrollReset: true, replace: true},
            );
          }}
        >
          {value.label} ×
        </button>
      ))}
      {hasPrice ? (
        <button
          type="button"
          className="collection-active-filters__chip"
          onClick={() => {
            void navigate(
              `${location.pathname}?${setPriceFilterParam(searchParams, '', '')}`,
              {preventScrollReset: true, replace: true},
            );
          }}
        >
          Fiyat ×
        </button>
      ) : null}
      <Link
        to={location.pathname}
        className="collection-active-filters__reset"
        preventScrollReset
      >
        Tümünü temizle
      </Link>
    </div>
  );
}
