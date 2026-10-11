import {useEffect, useRef, useState, type FormEvent} from 'react';
import {
  JudgemePreviewBadge,
  JudgemeReviewWidget,
} from '@judgeme/shopify-hydrogen';

export function ProductReviewBadge({
  productId,
  html,
}: {
  productId: string;
  html?: string | null;
}) {
  if (html) {
    return (
      <div
        className="product-page__review-badge"
        dangerouslySetInnerHTML={{__html: html}}
      />
    );
  }

  return (
    <div className="product-page__review-badge">
      <JudgemePreviewBadge id={productId} />
    </div>
  );
}

export function ProductReviewPanel({
  productId,
  html,
}: {
  productId: string;
  html?: string | null;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const startedAtRef = useRef(Date.now());
  const [composeOpen, setComposeOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  );
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root
      .querySelectorAll('.jdgm-write-rev-link, .jdgm-widget-actions')
      .forEach((node) => {
        (node as HTMLElement).style.display = 'none';
      });
  }, [html, productId]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    const form = new FormData(event.currentTarget);
    form.set('productId', productId);
    form.set('rating', String(rating));
    form.set('startedAt', String(startedAtRef.current));

    try {
      const response = await fetch('/api/judgeme/review', {
        method: 'POST',
        body: form,
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };

      if (!response.ok || !data.ok) {
        setStatus('error');
        setMessage(data.error || 'Yorum gönderilemedi.');
        return;
      }

      setStatus('success');
      setMessage(
        data.message ||
          'Yorumun alındı. Onaylandıktan sonra burada görünecek.',
      );
      event.currentTarget.reset();
      setRating(5);
      startedAtRef.current = Date.now();
    } catch {
      setStatus('error');
      setMessage('Yorum gönderilemedi. Lütfen tekrar dene.');
    }
  };

  return (
    <div ref={rootRef} className="product-reviews-panel">
      {html ? (
        <div
          className="jdgm-widget jdgm-review-widget"
          data-id={productId.replace('gid://shopify/Product/', '')}
          dangerouslySetInnerHTML={{__html: html}}
        />
      ) : (
        <JudgemeReviewWidget id={productId} />
      )}

      <div className="review-compose">
        {!composeOpen ? (
          <button
            type="button"
            className="review-compose__open"
            onClick={() => {
              setComposeOpen(true);
              setStatus('idle');
              setMessage('');
              startedAtRef.current = Date.now();
            }}
          >
            Yorum yaz
          </button>
        ) : (
          <form className="review-compose__form" onSubmit={onSubmit}>
            <div className="review-compose__top">
              <h3 className="review-compose__title">Yorum yaz</h3>
              <button
                type="button"
                className="review-compose__cancel"
                onClick={() => setComposeOpen(false)}
              >
                Kapat
              </button>
            </div>

            {/* Honeypot — bots fill this; humans never see it */}
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
                    onClick={() => setRating(value)}
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

            {message ? (
              <p
                className={`review-compose__status review-compose__status--${status}`}
                role="status"
              >
                {message}
              </p>
            ) : null}
          </form>
        )}
      </div>
    </div>
  );
}

/** @deprecated Use ProductReviewPanel */
export function ProductReviewWidget(props: {
  productId: string;
  html?: string | null;
}) {
  return <ProductReviewPanel {...props} />;
}
