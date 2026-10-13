import {useEffect, useRef, useState, type FormEvent} from 'react';
import {JudgemeReviewWidget} from '@judgeme/shopify-hydrogen';
import {createPortal} from 'react-dom';

const SUCCESS_MESSAGE =
  'Yorumun gönderildi. Onaylandıktan sonra burada görünecek.';

function hydrateJudgemeStars(root: HTMLElement) {
  root.querySelectorAll('.jdgm-star').forEach((node) => {
    const el = node as HTMLElement;
    if (el.textContent?.trim()) return;
    el.textContent = '★';
  });
}

function hydrateJudgemeWidget(root: HTMLElement) {
  root
    .querySelectorAll('.jdgm-write-rev-link, .jdgm-widget-actions')
    .forEach((node) => {
      (node as HTMLElement).style.display = 'none';
    });

  hydrateJudgemeStars(root);

  root.querySelectorAll('time.jdgm-rev__timestamp').forEach((node) => {
    const el = node as HTMLTimeElement;
    const raw = el.getAttribute('datetime') || el.dataset.content;
    if (!raw) return;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return;
    el.textContent = date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    el.classList.remove('jdgm-spinner');
  });
}

export function ProductReviewBadge({
  html,
}: {
  productId?: string;
  html?: string | null;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current || !html) return;
    hydrateJudgemeStars(rootRef.current);
  }, [html]);

  if (!html) return null;

  return (
    <div
      ref={rootRef}
      className="product-page__review-badge"
      dangerouslySetInnerHTML={{__html: html}}
    />
  );
}

export function ProductReviewPanel({
  productId,
  productHandle,
  html,
  reviewCount = 0,
  canWriteReview = false,
}: {
  productId: string;
  productHandle: string;
  html?: string | null;
  reviewCount?: number;
  canWriteReview?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const startedAtRef = useRef(Date.now());
  const [widgetHtml, setWidgetHtml] = useState(html || '');
  const [page, setPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  );
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    setWidgetHtml(html || '');
    setPage(1);
  }, [html, productId]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    hydrateJudgemeWidget(root);
  }, [widgetHtml, productId]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !productHandle) return;

    const onClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest?.(
        '.jdgm-paginate__page',
      ) as HTMLElement | null;
      if (!link || !root.contains(link)) return;

      event.preventDefault();
      event.stopPropagation();

      const nextPage = Number(link.getAttribute('data-page') || 0);
      if (!nextPage || nextPage === page || pageLoading) return;

      setPageLoading(true);
      try {
        const response = await fetch(
          `/api/judgeme/widget?handle=${encodeURIComponent(
            productHandle,
          )}&page=${nextPage}`,
        );
        const data = (await response.json()) as {
          ok?: boolean;
          html?: string;
        };
        if (!response.ok || !data.ok || !data.html) return;
        setWidgetHtml(data.html);
        setPage(nextPage);
        root.scrollIntoView({block: 'nearest', behavior: 'smooth'});
      } finally {
        setPageLoading(false);
      }
    };

    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [productHandle, page, pageLoading]);

  const openCompose = () => {
    setComposeOpen(true);
    setStatus('idle');
    setMessage('');
    setRating(5);
    startedAtRef.current = Date.now();
  };

  const closeCompose = () => {
    if (status === 'loading') return;
    setComposeOpen(false);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'loading') return;

    // Retain form node before any await — React nulls event.currentTarget.
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    form.set('productId', productId);
    form.set('rating', String(rating));
    form.set('startedAt', String(startedAtRef.current));

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/judgeme/review', {
        method: 'POST',
        body: form,
        headers: {Accept: 'application/json'},
      });

      const raw = await response.text();
      let data: {
        ok?: boolean;
        error?: string;
        message?: string;
      } = {};

      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        data = {};
      }

      const succeeded =
        data.ok === true ||
        (response.ok && /gönderildi|alındı/i.test(raw));

      if (!succeeded) {
        setStatus('error');
        setMessage(data.error || 'Yorum gönderilemedi.');
        return;
      }

      setStatus('success');
      setMessage(data.message || SUCCESS_MESSAGE);
      formElement.reset();
      setRating(5);
      startedAtRef.current = Date.now();
    } catch {
      setStatus('error');
      setMessage('Yorum gönderilemedi. Lütfen tekrar dene.');
    }
  };

  return (
    <div
      ref={rootRef}
      className={`product-reviews-panel${pageLoading ? ' is-loading' : ''}`}
    >
      {widgetHtml ? (
        <div
          className="jdgm-widget jdgm-review-widget"
          data-id={productId.replace('gid://shopify/Product/', '')}
          dangerouslySetInnerHTML={{__html: widgetHtml}}
        />
      ) : (
        <JudgemeReviewWidget id={productId} />
      )}

      {canWriteReview ? (
        <div className="review-compose">
          <button
            type="button"
            className="review-compose__open"
            onClick={openCompose}
          >
            Yorum yaz
          </button>
          {reviewCount > 0 ? (
            <p className="review-compose__hint">
              Onaylanan yorumlar burada listelenir.
            </p>
          ) : null}
        </div>
      ) : null}

      {canWriteReview && composeOpen ? (
        <ReviewComposePopup
          rating={rating}
          status={status}
          message={message}
          onRatingChange={setRating}
          onClose={closeCompose}
          onSubmit={onSubmit}
        />
      ) : null}
    </div>
  );
}

function ReviewComposePopup({
  rating,
  status,
  message,
  onRatingChange,
  onClose,
  onSubmit,
}: {
  rating: number;
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
  onRatingChange: (value: number) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="review-compose-popup"
      role="dialog"
      aria-modal="true"
      aria-label="Yorum yaz"
    >
      <button
        type="button"
        className="review-compose-popup__backdrop"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div className="review-compose-popup__panel">
        <div className="review-compose-popup__header">
          <h3 className="review-compose-popup__title">Yorum yaz</h3>
          <button
            type="button"
            className="review-compose-popup__close"
            onClick={onClose}
            aria-label="Kapat"
          >
            ×
          </button>
        </div>

        {status === 'success' ? (
          <div className="review-compose-popup__success" role="status">
            <p>{message || SUCCESS_MESSAGE}</p>
            <button
              type="button"
              className="review-compose__submit"
              onClick={onClose}
            >
              Tamam
            </button>
          </div>
        ) : (
          <form className="review-compose__form" onSubmit={onSubmit}>
            <label className="review-compose__hp" aria-hidden="true">
              <span>Website</span>
              <input
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </label>

            <fieldset className="review-compose__rating">
              <legend>Puan</legend>
              <div className="review-compose__stars">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`review-compose__star${
                      value <= rating ? ' is-active' : ''
                    }`}
                    aria-label={`${value} yıldız`}
                    aria-pressed={value <= rating}
                    onClick={() => onRatingChange(value)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="review-compose__field">
              <span>Ad Soyad</span>
              <input
                name="name"
                type="text"
                autoComplete="name"
                maxLength={80}
                required
              />
            </label>

            <label className="review-compose__field">
              <span>E-posta</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                maxLength={120}
                required
              />
            </label>

            <label className="review-compose__field">
              <span>Başlık (opsiyonel)</span>
              <input name="title" type="text" maxLength={120} />
            </label>

            <label className="review-compose__field">
              <span>Yorum</span>
              <textarea
                name="body"
                rows={5}
                minLength={10}
                maxLength={2000}
                required
              />
            </label>

            <button
              type="submit"
              className="review-compose__submit"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Gönderiliyor…' : 'Gönder'}
            </button>

            {message && status === 'error' ? (
              <p
                className="review-compose__status review-compose__status--error"
                role="status"
              >
                {message}
              </p>
            ) : null}
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}

/** @deprecated Use ProductReviewPanel */
export function ProductReviewWidget(props: {
  productId: string;
  productHandle: string;
  html?: string | null;
  reviewCount?: number;
  canWriteReview?: boolean;
}) {
  return <ProductReviewPanel {...props} />;
}
