/**
 * Site copy managed in code (not Shopify Admin).
 * Edit here when you need text changes.
 */

export const SITE_SEO = {
  name: 'Taylan Wear',
  locale: 'tr_TR',
  defaultDescription:
    'Taylan Wear — sade kesimler, günlük ritmine uyan parçalar. Hırka, pantolon, sweatshirt, triko ve ceket koleksiyonlarını keşfet.',
  defaultOgImage: '/hero.jpg',
  logo: '/favicon.svg',
  email: 'taylanwear@gmail.com',
  phone: '+90 536 722 27 93',
  address: 'Akşemsettin, Selimpaşa Sk. 17A, Eyüpsultan/İstanbul',
  sameAs: [
    'https://instagram.com/taylanwear/',
    'https://www.shopier.com/Taylanwear_',
  ] as string[],
  /** Short LLM/SEO copy under category pages (handle → content). */
  collectionCopy: {
    hirka: {
      heading: 'Hırka modelleri',
      body: 'Taylan Wear hırka koleksiyonu; katmanlı kombinler ve günlük kullanım için dengeli kalınlıkta parçalar sunar. Sade renkler ve rahat kesimler ile ofisten hafta sonuna kolayca geçiş yapabilirsin.',
    },
    pantolon: {
      heading: 'Pantolon modelleri',
      body: 'Taylan Wear pantolon koleksiyonu; günlük kullanıma uygun sade kesimler ve rahat kalıplarla gardırobunun temel parçalarını sunar.',
    },
    sweatshirt: {
      heading: 'Sweatshirt modelleri',
      body: 'Sweatshirt koleksiyonumuz; yumuşak doku, rahat kalıp ve şehir temposuna uygun parçalarla öne çıkar. Tek başına veya katmanlı kombinlerde kullanıma hazırdır.',
    },
    triko: {
      heading: 'Triko modelleri',
      body: 'Triko seçkimiz; mevsim geçişlerinde sıcak tutan, sade ve zamansız kesimleri bir araya getirir. Günlük kombinlere kolay eklenen parçalar bulabilirsin.',
    },
    ceket: {
      heading: 'Ceket modelleri',
      body: 'Ceket ve dış giyim koleksiyonu; net silüetler ve fonksiyonel detaylarla tamamlanır. Katmansız veya katmanlı kombinlerde öne çıkan parçalar sunar.',
    },
    all: {
      heading: 'Tüm ürünler',
      body: 'Taylan Wear’ın tüm koleksiyonunu tek yerde incele. Yeni sezon parçalar, temel ürünler ve günlük kullanıma uygun modeller arasından seçim yap.',
    },
  } as Record<string, {heading: string; body: string}>,
} as const;

export const TOP_BAR = {
  left: {
    text: 'Koleksiyonumuza bak',
    href: '/collections/all',
  },
  right: {
    text: '5000₺ üzeri ücretsiz kargo',
    href: null as string | null,
  },
} as const;

export const PRODUCT_PAGE = {
  freeShippingNote: '5000₺ ve üzeri siparişlerde ücretsiz kargo',
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
      '/hirka.jpg',
  },
  {
    name: 'Pantolon',
    href: '/collections/pantolon',
    image: '/pantolon.jpg',
  },
  {
    name: 'Sweatshirt',
    href: '/collections/sweatshirt',
    image:
      '/sweatshirt.jpg',
  },
  {
    name: 'Triko',
    href: '/collections/triko',
    image:
      '/triko.jpg',
  },
  {
    name: 'Ceket',
    href: '/collections/ceket',
    image: '/ceket.jpg',
  },
] as const;

export const HOME_CATEGORIES = {
  title: 'Kategorilerimiz',
  items: [...CATEGORIES],
} as const;

/**
 * Fallback header nav when Shopify `main-menu` is empty / unreachable.
 * Prefer editing Online Store → Navigation → Main menu in Admin.
 */
export const HEADER_NAV = [
  {
    title: 'Koleksiyon',
    href: '/collections/all',
    image: '/menu.jpg',
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
    '/hero-10.jpg',
  alt: 'Sezonun favorileri',
} as const;

/** Same promo banner on every collection / category page */
export const COLLECTION_BANNER = {
  title: 'Sezonun favorileri',
  text: 'Şehirden hafta sonuna, her güne uyum sağlayan seçili parçalar.',
  ctaLabel: 'Keşfet',
  href: '/collections/all',
  image:
    '/hero-10.jpg',
  alt: 'Koleksiyon kampanyası',
} as const;

const CONTACT_PHONE = '+90 536 722 27 93';
const CONTACT_ADDRESS = 'Akşemsettin, Selimpaşa Sk. 17A, Eyüpsultan/İstanbul';
const CONTACT_EMAIL = 'taylanwear@gmail.com';

export const CONTACT_PAGE = {
  title: 'İletişim',
  eyebrow: 'Taylan Wear',
  intro:
    'Sipariş, iade veya koleksiyon hakkında soruların için buradayız. Mesajını bırak, en kısa sürede dönüş yapalım.',
  email: CONTACT_EMAIL,
  phone: CONTACT_PHONE,
  address: CONTACT_ADDRESS,
  hours: [
    {label: 'Hafta içi', value: '10:00 – 18:00'},
    {label: 'Cumartesi', value: '10:00 – 16:00'},
    {label: 'Pazar', value: '10:00 – 16:00'},
  ],
  form: {
    title: 'Mesaj gönder',
    text: 'Formu doldurduktan sonra e-posta uygulaman açılır. Dilersen doğrudan yazabilirsin.',
    nameLabel: 'Ad Soyad',
    emailLabel: 'E-posta',
    subjectLabel: 'Konu',
    messageLabel: 'Mesaj',
    submitLabel: 'Gönder',
    subjects: ['Sipariş', 'İade & Değişim', 'Ürün sorusu', 'İş birliği', 'Diğer'],
  },
  social: {
    title: 'Sosyal',
    links: [
      {label: 'Instagram', href: 'https://instagram.com/taylanwear/'},
      {label: 'Shopier', href: 'https://www.shopier.com/Taylanwear_'},
    ],
  },
} as const;

export const ABOUT_PAGE = {
  title: 'Hakkımızda',
  eyebrow: 'Taylan Wear',
  intro:
    'Taylan Wear, günlük kullanıma uygun sade kesimler tasarlayan bir giyim markası. Koleksiyon; hırka, pantolon, sweatshirt, triko ve ceketten oluşur.',
  sections: [
    {
      title: 'Ne yapıyoruz',
      body: 'Şehir temposunda rahatça giyilen, katmanlanabilir parçalar üretiyoruz. Sezonluk gürültü yerine gardırobun temelini oluşturan modelleri öne alıyoruz: net silüet, sade renk ve tekrar tekrar giyilen kumaş.',
    },
    {
      title: 'Nasıl çalışıyoruz',
      body: 'Her parça günlük kullanıma göre seçilir. Kalıp rahat olmalı, kumaş gün içinde formunu korumalı, renk kombinlemeyi zorlaştırmamalı. Yeni sezonlar bu çizgiyi bozmadan eklenir.',
    },
    {
      title: 'Nereden',
      body: `Sipariş, iade ve koleksiyon soruları için ${CONTACT_ADDRESS} adresinden ya da iletişim sayfamızdan bize ulaşabilirsin.`,
    },
  ],
  collectionCta: {
    label: 'Koleksiyonu incele',
    href: '/collections/all',
  },
  contactCta: {
    label: 'İletişime geç',
    href: '/pages/contact',
  },
} as const;

/** Shopify sends these policy titles in English. The storefront shows these instead. */
export const POLICY_TITLES = {
  'terms-of-service': 'Mesafeli Satış Sözleşmesi',
  'privacy-policy': 'Gizlilik Sözleşmesi',
  'refund-policy': 'İade ve Değişim',
  'shipping-policy': 'Kargo ve Teslimat',
} as const;

export function policyTitle(handle: string, fallback: string) {
  return handle in POLICY_TITLES
    ? POLICY_TITLES[handle as keyof typeof POLICY_TITLES]
    : fallback;
}

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
      {label: 'Hakkımızda', href: '/pages/hakkimizda'},
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
    address: CONTACT_ADDRESS,
    phone: CONTACT_PHONE,
  },
  social: {
    instagram: 'https://instagram.com/taylanwear/',
    shopier: 'https://www.shopier.com/Taylanwear_',
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
