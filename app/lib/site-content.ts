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

export const HOME_CATEGORIES = {
  title: 'Kategorilerimiz',
  items: [
    {
      name: 'T-Shirt',
      href: '/collections/t-shirt',
      image:
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Sweatshirt',
      href: '/collections/sweatshirt',
      image:
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Şort',
      href: '/collections/sort',
      image:
        'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Eşofman Altı',
      href: '/collections/esofman-alti',
      image:
        'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Polo Yaka',
      href: '/collections/polo-yaka',
      image:
        'https://images.unsplash.com/photo-1625910513413-c23b5806f9f0?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Aksesuar',
      href: '/collections/aksesuar',
      image:
        'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    },
  ],
} as const;

export const HOME_DEPARTMENTS = [
  {
    title: 'Klasik',
    text: 'Zamansız kesimler ve günlük gardırobun temel parçaları.',
    href: '/collections/klasik',
    image:
      'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1200&q=80',
    alt: 'Klasik koleksiyon',
  },
  {
    title: 'Spor Giyim',
    text: 'Hareket özgürlüğü sunan, şehir temposuna uygun parçalar.',
    href: '/collections/spor-giyim',
    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
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
    links: [
      {label: 'T-Shirt', href: '/collections/t-shirt'},
      {label: 'Sweatshirt', href: '/collections/sweatshirt'},
      {label: 'Şort', href: '/collections/sort'},
      {label: 'Eşofman Altı', href: '/collections/esofman-alti'},
      {label: 'Polo Yaka', href: '/collections/polo-yaka'},
      {label: 'Aksesuar', href: '/collections/aksesuar'},
    ],
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
    title: 'Newsletter',
    text: 'Yeni sezon ve kampanyalardan ilk sen haberdar ol.',
    placeholder: 'E-mail adresiniz',
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
    src: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2400&q=80',
    alt: 'Taylan Wear — yaz koleksiyonu',
  },
  title: 'Yazın taze girişi',
  text: 'Hafif kumaşlar, sade kesimler ve günlük ritmine uyan parçalar.',
  cta: {
    label: 'Alışverişe başla',
    href: '/collections/all',
  },
} as const;
