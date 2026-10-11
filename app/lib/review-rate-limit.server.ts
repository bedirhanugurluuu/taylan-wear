const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const MIN_INTERVAL_MS = 45 * 1000;

type Bucket = {
  timestamps: number[];
  lastAt: number;
};

const buckets = new Map<string, Bucket>();

function prune(bucket: Bucket, now: number) {
  bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < WINDOW_MS);
}

export function getReviewClientKey(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function assertReviewRateLimit(clientKey: string): {
  ok: true;
} | {
  ok: false;
  error: string;
} {
  const now = Date.now();
  const bucket = buckets.get(clientKey) || {timestamps: [], lastAt: 0};
  prune(bucket, now);

  if (bucket.lastAt && now - bucket.lastAt < MIN_INTERVAL_MS) {
    return {
      ok: false,
      error: 'Çok hızlı gönderim yaptın. Lütfen bir süre sonra tekrar dene.',
    };
  }

  if (bucket.timestamps.length >= MAX_PER_WINDOW) {
    return {
      ok: false,
      error: 'Saatlik yorum sınırına ulaştın. Daha sonra tekrar dene.',
    };
  }

  bucket.timestamps.push(now);
  bucket.lastAt = now;
  buckets.set(clientKey, bucket);
  return {ok: true};
}
