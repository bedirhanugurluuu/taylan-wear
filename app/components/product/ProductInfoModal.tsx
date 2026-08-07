import {useEffect, useState} from 'react';
import {PRODUCT_PAGE} from '~/lib/site-content';

export type ProductInfoTabId =
  | 'details'
  | 'quality'
  | 'measure'
  | 'fit'
  | 'returns';

export type ProductInfoContent = {
  details: string;
  quality: string;
  fit: string;
};

const TABS: Array<{id: ProductInfoTabId; label: string}> = [
  {id: 'details', label: 'Detaylar'},
  {id: 'quality', label: 'Kalite'},
  {id: 'measure', label: 'Nasıl ölçülür'},
  {id: 'fit', label: 'Fit'},
  {id: 'returns', label: 'İade'},
];

export function ProductInfoAccordion({
  onOpen,
}: {
  onOpen: (tab: ProductInfoTabId) => void;
}) {
  return (
    <div className="product-info-accordion">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className="product-info-accordion__row"
          onClick={() => onOpen(tab.id)}
        >
          <span>{tab.label}</span>
          <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" className="product-info-accordion__plus" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2.5C10.1658 2.5 10.3247 2.56585 10.4419 2.68306C10.5592 2.80027 10.625 2.95924 10.625 3.125V9.375H16.875C17.0408 9.375 17.1997 9.44085 17.3169 9.55806C17.4342 9.67527 17.5 9.83424 17.5 10C17.5 10.1658 17.4342 10.3247 17.3169 10.4419C17.1997 10.5592 17.0408 10.625 16.875 10.625H10.625V16.875C10.625 17.0408 10.5592 17.1997 10.4419 17.3169C10.3247 17.4342 10.1658 17.5 10 17.5C9.83424 17.5 9.67527 17.4342 9.55806 17.3169C9.44085 17.1997 9.375 17.0408 9.375 16.875V10.625H3.125C2.95924 10.625 2.80027 10.5592 2.68306 10.4419C2.56585 10.3247 2.5 10.1658 2.5 10C2.5 9.83424 2.56585 9.67527 2.68306 9.55806C2.80027 9.44085 2.95924 9.375 3.125 9.375H9.375V3.125C9.375 2.95924 9.44085 2.80027 9.55806 2.68306C9.67527 2.56585 9.83424 2.5 10 2.5Z" fill="currentColor"></path>
          </svg>
        </button>
      ))}
    </div>
  );
}

export function ProductInfoModal({
  open,
  initialTab,
  title,
  content,
  onClose,
}: {
  open: boolean;
  initialTab: ProductInfoTabId;
  title: string;
  content: ProductInfoContent;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<ProductInfoTabId>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const guide = PRODUCT_PAGE.sizeGuide;
  const returns = PRODUCT_PAGE.returns;

  return (
    <div
      className="product-info-modal"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="product-info-modal__backdrop"
        aria-label="Kapat"
        onClick={onClose}
      />

      <div className="product-info-modal__panel">
        <div className="product-info-modal__header">
          <h2 className="product-info-modal__title">{title}</h2>
          <button
            type="button"
            className="product-info-modal__close"
            onClick={onClose}
            aria-label="Kapat"
          >
            ×
          </button>
        </div>

        <div className="product-info-modal__tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`product-info-modal__tab${
                activeTab === tab.id ? ' is-active' : ''
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="product-info-modal__body" role="tabpanel">
          {activeTab === 'details' ? (
            <div className="product-info-modal__rich">
              {looksLikeHtml(content.details) ? (
                <div dangerouslySetInnerHTML={{__html: content.details}} />
              ) : (
                <p className="product-info-modal__text">{content.details}</p>
              )}
            </div>
          ) : null}

          {activeTab === 'quality' ? (
            <p className="product-info-modal__text">{content.quality}</p>
          ) : null}

          {activeTab === 'measure' ? (
            <>
              <p className="product-info-modal__text">{guide.intro}</p>
              <div className="product-info-modal__table-wrap">
                <table className="product-info-modal__table">
                  <thead>
                    <tr>
                      <th>Beden</th>
                      <th>Göğüs</th>
                      <th>Bel</th>
                      <th>Kalça</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guide.rows.map((row) => (
                      <tr key={row.size}>
                        <td>{row.size}</td>
                        <td>{row.chest}</td>
                        <td>{row.waist}</td>
                        <td>{row.hip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="product-info-modal__note">{guide.note}</p>
            </>
          ) : null}

          {activeTab === 'fit' ? (
            <p className="product-info-modal__text">{content.fit}</p>
          ) : null}

          {activeTab === 'returns' ? (
            <p className="product-info-modal__text">{returns.body}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}
