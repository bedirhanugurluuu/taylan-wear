/**
 * Site copy managed in code (not Shopify Admin).
 * Edit here when you need text changes.
 */

export const TOP_BAR = {
  left: {
    text: 'Koleksiyonumuza bak',
    href: '/collections/all',
  },
  right: {
    text: '1500₺ üzeri ücretsiz kargo',
    href: null as string | null,
  },
} as const;

export const PRODUCT_PAGE = {
  freeShippingNote: '1500₺ ve üzeri siparişlerde ücretsiz kargo',
  /** Shared across all products (edit here) */
  sizeGuide: {
    title: 'Nasıl ölçülür?',
    intro:
      'En doğru bedeni seçmek için aşağıdaki ölçü tablosunu kullanabilirsin.',
    rows: [
      {size: 'XS', chest: '86–90', waist: '70–74', hip: '88–92'},
      {size: 'S', chest: '90–94', waist: '74–78', hip: '92–96'},
      {size: 'M', chest: '94–98', waist: '78–82', hip: '96–100'},
      {size: 'L', chest: '98–102', waist: '82–86', hip: '100–104'},
      {size: 'XL', chest: '102–106', waist: '86–90', hip: '104–108'},
    ],
    note: 'Ölçüler cm cinsindendir. Şüphen varsa bir beden büyük tercih edebilirsin.',
  },
  /** Shared across all products (edit here) */
  returns: {
    title: 'İade & Değişim',
    body: `Ürünü teslim aldığın tarihten itibaren 14 gün içinde iade veya değişim talep edebilirsin.

Ürün kullanılmamış, etiketli ve orijinal ambalajında olmalıdır.

İade sürecini başlatmak için hesabındaki siparişlerden ilgili siparişi seçebilir veya bizimle iletişime geçebilirsin.`,
  },
  /** Fallback when product metafields are empty */
  defaults: {
    details: 'Bu ürün için henüz detay girilmedi.',
    quality: 'Bu ürün için henüz kalite bilgisi girilmedi.',
    fit: 'Bu ürün için henüz fit bilgisi girilmedi.',
  },
} as const;

/** Core shop categories (Shopify collection handles). */
export const CATEGORIES = [
  {
    name: 'Hırka',
    href: '/collections/hirka',
    image:
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Tişört',
    href: '/collections/tisort',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Triko',
    href: '/collections/triko',
    image:
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Ceket',
    href: '/collections/ceket',
    image: '/hero.jpg',
  },
] as const;

export const HOME_CATEGORIES = {
  title: 'Kategorilerimiz',
  items: [
    ...CATEGORIES,
    {
      name: 'Aksesuar',
      href: '/collections/aksesuar',
      image:
        'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    },
  ],
} as const;

/**
 * Fallback header nav when Shopify `main-menu` is empty / unreachable.
 * Prefer editing Online Store → Navigation → Main menu in Admin.
 */
export const HEADER_NAV = [
  {
    title: 'Koleksiyon',
    href: '/collections/all',
    image: CATEGORIES[0].image,
    links: CATEGORIES.map((item) => ({
      label: item.name,
      href: item.href,
    })),
  },
  {
    title: 'İletişim',
    href: '/pages/contact',
    image: null as string | null,
    links: null as {label: string; href: string}[] | null,
  },
] as const;

export const HOME_DEPARTMENTS = [
  {
    title: 'Klasik',
    text: 'Zamansız kesimler ve günlük gardırobun temel parçaları.',
    href: '/collections/klasik',
    image:
      '/hero-2.jpg',
    alt: 'Klasik koleksiyon',
  },
  {
    title: 'Rahat Giyim',
    text: 'Hareket özgürlüğü sunan, şehir temposuna uygun parçalar.',
    href: '/collections/spor-giyim',
    image:
      '/hero-3.jpg',
    alt: 'Spor giyim koleksiyonu',
  },
] as const;

export const HOME_FULL_BANNER = {
  title: 'Sezonun favorileri',
  text: 'Şehirden hafta sonuna, her güne uyum sağlayan seçili parçalar.',
  href: '/collections/all',
  ctaLabel: 'İncele',
  image:
    'https://images.unsplash.com/photo-1441984904996-e0b6921e2e3e?auto=format&fit=crop&w=2400&q=80',
  alt: 'Sezonun favorileri',
} as const;

/** Same promo banner on every collection / category page */
export const COLLECTION_BANNER = {
  title: 'Tişörtlerde 3 al 2 öde',
  text: 'Seçili tişörtlerde kampanya devam ediyor. Fırsatı kaçırma.',
  ctaLabel: 'Keşfet',
  href: '/collections/all',
  image:
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=2400&q=80',
  alt: 'Koleksiyon kampanyası',
} as const;

export const FOOTER = {
  brand: {
    title: 'Taylan Wear',
    links: CATEGORIES.map((item) => ({
      label: item.name,
      href: item.href,
    })),
  },
  help: {
    title: 'Yardım',
    links: [
      {label: 'İletişim', href: '/pages/contact'},
      {label: 'İade & Değişim', href: '/policies/refund-policy'},
      {label: 'Kargo', href: '/policies/shipping-policy'},
      {label: 'KVKK', href: '/policies/privacy-policy'},
      {label: 'Mesafeli Satış', href: '/policies/terms-of-service'},
    ],
  },
  newsletter: {
    title: 'Bülten',
    text: 'Yeni sezon ve kampanyalardan ilk sen haberdar ol.',
    placeholder: 'E-posta adresiniz',
  },
  contact: {
    address: 'İstanbul, Türkiye',
    phone: '+90 555 000 00 00',
  },
  social: {
    instagram: 'https://instagram.com/',
    shopier: 'https://www.shopier.com/',
  },
  bottom: {
    links: [
      {label: 'Mesafeli Satış', href: '/policies/terms-of-service'},
      {label: 'KVKK', href: '/policies/privacy-policy'},
    ],
    copyright: '© 2026 Taylan Wear. Tüm hakları saklıdır.',
  },
} as const;

export const HOME_HERO = {
  /** Replace with `/hero.jpg` when you add a file to /public */
  image: {
    src: '/hero.jpg',
    alt: 'Taylan Wear — yaz koleksiyonu',
  },
  title: 'Ceketler & Dış Giyim',
  text: 'Sezonun favorileri, sade kesimler ve günlük ritmine uyan parçalar.',
  cta: {
    label: 'Alışverişe başla',
    href: '/collections/all',
  },
} as const;
