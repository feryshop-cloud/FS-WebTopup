// ============================================================================
// DEFAULT SEED & FALLBACK DATA UNTUK FERYSHOP
// Digunakan sebagai fallback jika Supabase belum dikonfigurasi atau tabel masih kosong
// ====================================================================

export const seedCategories = [
  { id: 1, title: 'Mobile Games', logo: '/images/ml.png', game: 'Mobile Games', sortOrder: 1, isActive: true },
  { id: 2, title: 'PC Games', logo: '/images/val.png', game: 'PC Games', sortOrder: 2, isActive: true },
  { id: 3, title: 'Voucher', logo: '/images/steam.png', game: 'Voucher', sortOrder: 3, isActive: true },
  { id: 4, title: 'Entertainment', logo: '/images/netflix.png', game: 'Entertainment', sortOrder: 4, isActive: true },
];

export const seedGames = [
  {
    id: 1,
    title: 'Mobile Legends: Bang Bang',
    slug: 'mobile-legends',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=100&auto=format&fit=crop',
    developers: 'Moonton',
    categoryId: 1,
    description: 'Top up Diamond Mobile Legends resmi 100% legal, murah, dan instan masuk ke akun Anda dalam hitungan detik.',
    instructions: {
      title: 'Cara Top Up Mobile Legends',
      steps: [
        'Masukkan User ID dan Zone ID Anda (Contoh: 12345678 (1234))',
        'Pilih nominal Diamond atau Pass yang ingin dibeli',
        'Pilih metode pembayaran yang Anda inginkan',
        'Selesaikan pembayaran dan Diamond akan otomatis masuk ke akun Anda',
      ],
      fields: [
        { name: 'id', label: 'User ID', placeholder: 'Masukkan User ID', type: 'text', required: true },
        { name: 'server', label: 'Zone ID', placeholder: 'Masukkan Zone ID (1234)', type: 'text', required: true },
      ],
    },
    isPopular: true,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 2,
    title: 'Free Fire',
    slug: 'free-fire',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=100&auto=format&fit=crop',
    developers: 'Garena',
    categoryId: 1,
    description: 'Top up Diamond Free Fire Garena termurah dan tercepat langsung proses 24 jam.',
    instructions: {
      title: 'Cara Top Up Free Fire',
      steps: [
        'Masukkan Player ID Free Fire Anda',
        'Pilih nominal Diamond yang diinginkan',
        'Pilih metode pembayaran',
        'Selesaikan pembayaran dan Diamond akan langsung bertambah',
      ],
      fields: [
        { name: 'id', label: 'Player ID', placeholder: 'Masukkan Player ID', type: 'text', required: true },
      ],
    },
    isPopular: true,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 3,
    title: 'PUBG Mobile',
    slug: 'pubg-mobile',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=400&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=100&auto=format&fit=crop',
    developers: 'Tencent / Level Infinite',
    categoryId: 1,
    description: 'Top up UC PUBG Mobile legal resmi aman dengan berbagai nominal.',
    instructions: {
      title: 'Cara Top Up PUBG Mobile',
      steps: [
        'Masukkan Player ID PUBG Mobile Anda',
        'Pilih nominal UC',
        'Pilih metode pembayaran dan selesaikan transaksi',
      ],
      fields: [
        { name: 'id', label: 'Player ID', placeholder: 'Masukkan Player ID', type: 'text', required: true },
      ],
    },
    isPopular: true,
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 4,
    title: 'Valorant',
    slug: 'valorant',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=100&auto=format&fit=crop',
    developers: 'Riot Games',
    categoryId: 2,
    description: 'Beli Valorant Points (VP) resmi Riot Games dengan cepat dan harga terjangkau.',
    instructions: {
      title: 'Cara Top Up Valorant',
      steps: [
        'Masukkan Riot ID Anda (Contoh: Username#TAG)',
        'Pilih nominal Valorant Points',
        'Pilih pembayaran dan selesaikan',
      ],
      fields: [
        { name: 'id', label: 'Riot ID', placeholder: 'Username#TAG', type: 'text', required: true },
      ],
    },
    isPopular: true,
    isActive: true,
    sortOrder: 4,
  },
];

export const seedProducts: Record<string, any[]> = {
  'mobile-legends': [
    { id: 'ML-86', title: '86 Diamonds (78 + 8 Bonus)', selling_price: 23500, selling_price_gold: 23000, selling_price_platinum: 22500, promo_price: 22000, is_active: true },
    { id: 'ML-172', title: '172 Diamonds (156 + 16 Bonus)', selling_price: 46500, selling_price_gold: 45500, selling_price_platinum: 44500, promo_price: null, is_active: true },
    { id: 'ML-257', title: '257 Diamonds (234 + 23 Bonus)', selling_price: 69000, selling_price_gold: 68000, selling_price_platinum: 67000, promo_price: null, is_active: true },
    { id: 'ML-344', title: '344 Diamonds (312 + 32 Bonus)', selling_price: 92000, selling_price_gold: 90500, selling_price_platinum: 89000, promo_price: null, is_active: true },
    { id: 'ML-706', title: '706 Diamonds (625 + 81 Bonus)', selling_price: 185000, selling_price_gold: 182000, selling_price_platinum: 179000, promo_price: null, is_active: true },
    { id: 'ML-WDP', title: 'Weekly Diamond Pass (WDP)', selling_price: 28500, selling_price_gold: 28000, selling_price_platinum: 27500, promo_price: 27000, is_active: true },
  ],
  'free-fire': [
    { id: 'FF-70', title: '70 Diamonds', selling_price: 10000, selling_price_gold: 9800, selling_price_platinum: 9500, promo_price: null, is_active: true },
    { id: 'FF-140', title: '140 Diamonds', selling_price: 19500, selling_price_gold: 19000, selling_price_platinum: 18500, promo_price: null, is_active: true },
    { id: 'FF-355', title: '355 Diamonds', selling_price: 48500, selling_price_gold: 47500, selling_price_platinum: 46500, promo_price: null, is_active: true },
    { id: 'FF-720', title: '720 Diamonds', selling_price: 96500, selling_price_gold: 95000, selling_price_platinum: 93500, promo_price: null, is_active: true },
  ],
  'pubg-mobile': [
    { id: 'PUBG-60', title: '60 UC', selling_price: 15000, selling_price_gold: 14700, selling_price_platinum: 14400, promo_price: null, is_active: true },
    { id: 'PUBG-325', title: '325 UC (300 + 25 Bonus)', selling_price: 74500, selling_price_gold: 73000, selling_price_platinum: 71500, promo_price: null, is_active: true },
    { id: 'PUBG-660', title: '660 UC (600 + 60 Bonus)', selling_price: 149000, selling_price_gold: 146000, selling_price_platinum: 143000, promo_price: null, is_active: true },
  ],
  'valorant': [
    { id: 'VAL-300', title: '300 Points', selling_price: 40000, selling_price_gold: 39000, selling_price_platinum: 38000, promo_price: null, is_active: true },
    { id: 'VAL-625', title: '625 Points', selling_price: 80000, selling_price_gold: 78000, selling_price_platinum: 76000, promo_price: null, is_active: true },
    { id: 'VAL-1125', title: '1125 Points', selling_price: 140000, selling_price_gold: 137000, selling_price_platinum: 134000, promo_price: null, is_active: true },
  ],
};

export const seedPaymentMethods = [
  {
    id: 'qris',
    name: 'QRIS (All Bank & E-Wallet)',
    images: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg',
    payment_id: 'QRIS',
    minimum_amount: 1000,
    maximum_amount: 10000000,
    fee: 0,
    fee_percent: 0.7,
    type: 'qris',
    status: 'active',
    group: 'QRIS & E-Wallet',
    instructions: [
      { title: 'Cara Bayar dengan QRIS', steps: ['Buka aplikasi E-Wallet (GoPay, OVO, DANA, ShopeePay) atau Mobile Banking Anda', 'Pilih menu Scan / Bayar', 'Scan QR Code yang muncul di layar', 'Periksa detail pembayaran dan masukkan PIN Anda'] },
    ],
  },
  {
    id: 'gopay',
    name: 'GoPay',
    images: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg',
    payment_id: 'GOPAY',
    minimum_amount: 1000,
    maximum_amount: 2000000,
    fee: 1000,
    fee_percent: 1.5,
    type: 'e-wallet',
    status: 'active',
    group: 'QRIS & E-Wallet',
    instructions: [
      { title: 'Cara Bayar via GoPay', steps: ['Klik tombol Bayar Sekarang untuk membuka aplikasi Gojek/GoPay', 'Konfirmasi nominal pembayaran', 'Masukkan PIN GoPay Anda'] },
    ],
  },
  {
    id: 'va_bca',
    name: 'BCA Virtual Account',
    images: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg',
    payment_id: 'VA_BCA',
    minimum_amount: 10000,
    maximum_amount: 50000000,
    fee: 4000,
    fee_percent: 0,
    type: 'va',
    status: 'active',
    group: 'Virtual Account Bank',
    instructions: [
      { title: 'm-BCA (BCA mobile)', steps: ['Buka BCA mobile dan pilih m-BCA', 'Pilih menu m-Transfer > BCA Virtual Account', 'Masukkan nomor Virtual Account yang tertera', 'Periksa nominal pembayaran dan masukkan PIN m-BCA'] },
    ],
  },
  {
    id: 'va_mandiri',
    name: 'Mandiri Virtual Account',
    images: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg',
    payment_id: 'VA_MANDIRI',
    minimum_amount: 10000,
    maximum_amount: 50000000,
    fee: 4000,
    fee_percent: 0,
    type: 'va',
    status: 'active',
    group: 'Virtual Account Bank',
    instructions: [
      { title: 'Livin by Mandiri', steps: ['Buka aplikasi Livin by Mandiri', 'Pilih menu Bayar > Multi Payment', 'Masukkan nomor Virtual Account', 'Konfirmasi dan masukkan PIN'] },
    ],
  },
  {
    id: 'alfamart',
    name: 'Alfamart / Alfamidi',
    images: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Alfamart_logo.svg',
    payment_id: 'ALFAMART',
    minimum_amount: 10000,
    maximum_amount: 2500000,
    fee: 5000,
    fee_percent: 0,
    type: 'convenience_store',
    status: 'active',
    group: 'Convenience Store',
    instructions: [
      { title: 'Pembayaran di Alfamart / Alfamidi', steps: ['Kunjungi kasir Alfamart atau Alfamidi terdekat', 'Beritahu kasir ingin membayar transaksi Feryshop / Merchant Kode Pembayaran', 'Tunjukkan Kode Pembayaran kepada kasir', 'Lakukan pembayaran dengan tunai atau non-tunai'] },
    ],
  },
];

export const seedSliders = [
  {
    id: 1,
    title: 'Top Up Mobile Legends Instant & Termurah',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    url: '/order/mobile-legends',
    isActive: true,
  },
  {
    id: 2,
    title: 'Diskon Spesial Valorant Points',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
    url: '/order/valorant',
    isActive: true,
  },
];

export const seedArticles = [
  {
    id: 1,
    title: 'Cara Top Up Mobile Legends Termurah 2026 di Feryshop',
    slug: 'cara-top-up-mlbb-termurah-2026',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    excerpt: 'Panduan lengkap cara beli diamond MLBB legal 100% instan tanpa ribet dan proses cepat 24 jam.',
    content: '<p>Top up Mobile Legends sekarang semakin mudah dan cepat hanya di <strong>Feryshop</strong>. Cukup masukkan User ID dan Zone ID Anda, pilih nominal Diamond atau Weekly Diamond Pass, lalu pilih metode pembayaran seperti QRIS, E-Wallet (GoPay, DANA, OVO), atau Virtual Account Bank.</p><p>Setelah pembayaran dikonfirmasi, Diamond akan otomatis masuk ke akun game Anda dalam waktu kurang dari 5 detik! Nikmati juga berbagai promo diskon harian dan harga khusus untuk member Gold dan Platinum.</p>',
    author: 'Admin Feryshop',
    views: 1250,
    created_at: '2026-07-20T10:00:00Z',
  },
  {
    id: 2,
    title: 'Update Patch Valorant Terbaru: Agen & Skin Eksklusif',
    slug: 'update-patch-valorant-terbaru',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
    excerpt: 'Simak detail pembaruan agen baru dan bundle skin eksklusif yang wajib kamu miliki season ini.',
    content: '<p>Riot Games kembali menghadirkan update patch terbaru untuk Valorant yang membawa penyesuaian keseimbangan (buff & nerf) pada beberapa agen initiator dan duelist. Selain itu, bundle skin terbaru dengan efek animasi finisher yang memukau juga telah resmi dirilis di store in-game.</p><p>Jangan sampai ketinggalan! Segera top up Valorant Points (VP) kamu di Feryshop untuk membeli night market ataupun bundle favoritmu dengan harga termurah.</p>',
    author: 'Tim Redaksi',
    views: 840,
    created_at: '2026-07-22T14:30:00Z',
  },
  {
    id: 3,
    title: 'Tips Booyah Free Fire Solo Ranked dengan Cepat',
    slug: 'tips-booyah-ff-solo-ranked',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    excerpt: 'Strategi terbaik naik rank Heroic Free Fire dengan cepat menggunakan kombinasi karakter dan senjata terkuat.',
    content: '<p>Bermain solo ranked di Free Fire membutuhkan ketahanan dan strategi penempatan posisi yang tepat. Gunakan kombinasi skill pasif dan aktif dari karakter seperti Alok, Chrono, atau K untuk bertahan hidup di zona akhir.</p><p>Pastikan juga kamu memiliki persediaan Gloo Wall yang cukup dan jangan lupa top up diamond Free Fire di Feryshop untuk membeli Elite Pass terbaru!</p>',
    author: 'Gamer Pro',
    views: 2100,
    created_at: '2026-07-25T09:15:00Z',
  },
];

export const seedSettings = {
  site_name: 'Feryshop',
  site_title: 'Feryshop - Marketplace Akun Game Sultan & Top Up',
  site_description: 'Platform marketplace akun game Sultan dan layanan top up game resmi termurah dan otomatis 24 jam di Indonesia.',
  logo: '/logo-2.png',
  favicon: '/favicon.ico',
  footer_text: 'Made in Feryshop',
  social_facebook: 'https://facebook.com',
  social_instagram: 'https://instagram.com',
  social_whatsapp: 'https://wa.me/628123456789',
};
