export interface AccountSpecification {
  rank: string;
  level?: string | number;
  skinsCount: number | string;
  heroesCount?: number | string;
  loginVia: "Moonton All Monsep" | "Garena" | "Riot ID" | "Konami ID" | "Level Infinite" | "Google / FB" | "All Monsep";
  changeName?: "Ready (Gratis)" | "Off (Beli Card)" | "Available";
  deliveryType: "Instant Delivery" | "Manual Check (< 5 Menit)";
  winrate?: string;
}

export interface SellerProfile {
  name: string;
  rating: number;
  salesCount: number;
  isVerified: boolean;
  avatar?: string;
  responseTime: string;
}

export interface GameAccount {
  id: string;
  slug: string; // url slug for detail
  gameSlug: string; // mlbb, ff, valorant, efootball, pubgm
  gameName: string;
  title: string;
  price: number;
  originalPrice?: number;
  badge?: "Sultan" | "Fast Delivery" | "Verified Seller" | "Hot Deal" | "Rare Item";
  seller: SellerProfile;
  specs: AccountSpecification;
  description: string[];
  images: string[];
  createdAt: string;
  isFeatured?: boolean;
}

export interface GameCategory {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  iconName: "mlbb" | "ff" | "valorant" | "efootball" | "pubgm";
  bannerUrl: string;
  totalAccounts: number;
  colorTheme: string;
  popularRanks: string[];
}

export const MARKETPLACE_CATEGORIES: GameCategory[] = [
  {
    id: "1",
    slug: "mlbb",
    name: "Mobile Legends",
    subtitle: "Bang Bang Akun Sultan & Mythic",
    iconName: "mlbb",
    bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
    totalAccounts: 24,
    colorTheme: "from-indigo-600/20 via-purple-600/10 to-transparent border-indigo-500/30",
    popularRanks: ["Mythic Glory", "Mythic Immortal", "Legend", "Epic", "Sultan Collector"],
  },
  {
    id: "2",
    slug: "ff",
    name: "Free Fire",
    subtitle: "Akun SG 2 Ungu & Evo Gun Max",
    iconName: "ff",
    bannerUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop",
    totalAccounts: 18,
    colorTheme: "from-orange-600/20 via-red-600/10 to-transparent border-orange-500/30",
    popularRanks: ["Heroic / Master", "Grandmaster", "Akun Vault Penuh", "SG 2 Ungu", "Evo Gun Max"],
  },
  {
    id: "3",
    slug: "valorant",
    name: "Valorant",
    subtitle: "Skin Kuronami, Reaver & Radiant Peak",
    iconName: "valorant",
    bannerUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop",
    totalAccounts: 15,
    colorTheme: "from-rose-600/20 via-red-600/10 to-transparent border-rose-500/30",
    popularRanks: ["Radiant", "Immortal 3", "Ascendant", "Diamond", "Full Skin Bundle"],
  },
  {
    id: "4",
    slug: "efootball",
    name: "eFootball",
    subtitle: "Tim Impian Epic Big Time 104+ OVR",
    iconName: "efootball",
    bannerUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop",
    totalAccounts: 12,
    colorTheme: "from-blue-600/20 via-cyan-600/10 to-transparent border-blue-500/30",
    popularRanks: ["Divisi 1", "Tim 104+ OVR", "Epic Big Time", "Showtime Full", "Legendary Squad"],
  },
  {
    id: "5",
    slug: "pubgm",
    name: "PUBG Mobile",
    subtitle: "M416 Glacier Max Lv 7 & Conqueror",
    iconName: "pubgm",
    bannerUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1200&auto=format&fit=crop",
    totalAccounts: 16,
    colorTheme: "from-amber-600/20 via-yellow-600/10 to-transparent border-amber-500/30",
    popularRanks: ["Conqueror", "Ace Dominator", "Crown", "M416 Glacier Lv 7", "Set Firaun Max"],
  },
];

export const MOCK_ACCOUNTS: GameAccount[] = [
  // --- MOBILE LEGENDS (MLBB) ---
  {
    id: "mlbb-001",
    slug: "mlbb-mythic-glory-sultan-collector-gusion",
    gameSlug: "mlbb",
    gameName: "Mobile Legends",
    title: "Akun Sultan Mythic Glory 112 Star - Skin Collector Gusion, Legend Miya & 185 Skin Epic",
    price: 1450000,
    originalPrice: 2800000,
    badge: "Sultan",
    seller: {
      name: "SultanGaming Store",
      rating: 4.9,
      salesCount: 342,
      isVerified: true,
      responseTime: "< 3 Menit",
    },
    specs: {
      rank: "Mythic Glory (112 Star)",
      level: 95,
      skinsCount: 245,
      heroesCount: 122,
      loginVia: "Moonton All Monsep",
      changeName: "Ready (Gratis)",
      deliveryType: "Instant Delivery",
      winrate: "68.4%",
    },
    description: [
      "Akun pribadi super aman, 100% All Monsep (Moonton Sepaket email & password bisa ganti ke email pembeli).",
      "Skin Legend: Miya, Granger, Gusion.",
      "Skin Collector: Gusion K, Ling Serene Plume, Benedetta.",
      "Winrate rank tinggi 68.4%, Emblem MAX semua.",
      "Garansi anti-hack back 100% selamanya via Rekber Feryshop.",
    ],
    images: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    ],
    createdAt: "2026-07-25",
    isFeatured: true,
  },
  {
    id: "mlbb-002",
    slug: "mlbb-mythic-immortal-fast-hand-assassin",
    gameSlug: "mlbb",
    gameName: "Mobile Legends",
    title: "Akun Mythic Immortal 150 Star - Spesialis Assassin Ling & Fanny Skin KOF MAX",
    price: 980000,
    originalPrice: 1500000,
    badge: "Hot Deal",
    seller: {
      name: "ProPlayer Shop",
      rating: 4.8,
      salesCount: 189,
      isVerified: true,
      responseTime: "< 5 Menit",
    },
    specs: {
      rank: "Mythic Immortal (150 Star)",
      level: 88,
      skinsCount: 178,
      heroesCount: 118,
      loginVia: "Moonton All Monsep",
      changeName: "Off (Beli Card)",
      deliveryType: "Instant Delivery",
      winrate: "71.2%",
    },
    description: [
      "Akun siap turnamen atau push rank leaderboard dengan WR Assassin di atas 70%.",
      "Skin KOF: Chou, Gusion, Karina lengkap.",
      "Emblem Assassin & Fighter lv 60 MAX.",
      "Akun clean, bind hanya Moonton (bisa ganti email sepaket).",
      "Transaksi aman kawalan admin Rekber.",
    ],
    images: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
    ],
    createdAt: "2026-07-24",
    isFeatured: true,
  },
  {
    id: "mlbb-003",
    slug: "mlbb-legend-starter-pack-murah",
    gameSlug: "mlbb",
    gameName: "Mobile Legends",
    title: "Akun Legend Starter Pack - 45 Skin Epic & Starlight Lengkap, Cocok Buat Pemula",
    price: 250000,
    originalPrice: 450000,
    badge: "Fast Delivery",
    seller: {
      name: "FeryStore Official",
      rating: 5.0,
      salesCount: 512,
      isVerified: true,
      responseTime: "< 1 Menit",
    },
    specs: {
      rank: "Legend I",
      level: 65,
      skinsCount: 85,
      heroesCount: 92,
      loginVia: "Moonton All Monsep",
      changeName: "Ready (Gratis)",
      deliveryType: "Instant Delivery",
      winrate: "59.5%",
    },
    description: [
      "Akun starter super murah & ekonomis untuk mabar santai bersama teman.",
      "Banyak skin Starlight dan Epic Shop (Layla, Freya, Zilong).",
      "Belum pernah terkait sosial media lain, 100% clean.",
    ],
    images: [
      "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop",
    ],
    createdAt: "2026-07-26",
  },
  {
    id: "mlbb-004",
    slug: "mlbb-sultan-all-skin-zodiac",
    gameSlug: "mlbb",
    gameName: "Mobile Legends",
    title: "Akun Sultan Full Zodiac 12/12 & 5 Skin Legend - Winrate 65% All Season",
    price: 2100000,
    originalPrice: 3500000,
    badge: "Rare Item",
    seller: {
      name: "SultanGaming Store",
      rating: 4.9,
      salesCount: 342,
      isVerified: true,
      responseTime: "< 3 Menit",
    },
    specs: {
      rank: "Mythic Glory (75 Star)",
      level: 105,
      skinsCount: 310,
      heroesCount: 124,
      loginVia: "Moonton All Monsep",
      changeName: "Ready (Gratis)",
      deliveryType: "Manual Check (< 5 Menit)",
      winrate: "65.1%",
    },
    description: [
      "Koleksi ZODIAC LENGKAP 12 Hero (Lunox, Badang, Minotaur, dll).",
      "Recall Tas Tas Tas permanen & animasi spawn eksklusif.",
      "Data akun lengkap hingga resi top up pertama tersedia untuk keamanan garansi.",
    ],
    images: [
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop",
    ],
    createdAt: "2026-07-22",
  },

  // --- FREE FIRE (FF) ---
  {
    id: "ff-001",
    slug: "ff-sg2-ungu-evo-gun-max-sultan",
    gameSlug: "ff",
    gameName: "Free Fire",
    title: "Akun Sultan FF - SG 2 Ungu M1887, AK47 Blue Flame Max & Vault Fashion Penuh",
    price: 850000,
    originalPrice: 1600000,
    badge: "Sultan",
    seller: {
      name: "Booyah Kingdom",
      rating: 4.9,
      salesCount: 278,
      isVerified: true,
      responseTime: "< 2 Menit",
    },
    specs: {
      rank: "Master",
      level: 74,
      skinsCount: "190+ Vault",
      heroesCount: "All Char Unlocked",
      loginVia: "Garena",
      changeName: "Ready (Gratis)",
      deliveryType: "Instant Delivery",
      winrate: "54.2%",
    },
    description: [
      "Akun Sultan FF idaman: SG 2 Ungu M1887 Rapper Underworld permanen.",
      "Evo Gun AK47 Blue Flame Draco LEVEL MAX 7 (Emote Eksklusif).",
      "Celana Angelic Merah & Biru cowok cewek lengkap.",
      "Login via Garena murni, nomer HP & email kosong siap bind ke pembeli.",
    ],
    images: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
    ],
    createdAt: "2026-07-25",
    isFeatured: true,
  },
  {
    id: "ff-002",
    slug: "ff-master-grandmaster-push-squad",
    gameSlug: "ff",
    gameName: "Free Fire",
    title: "Akun Grandmaster Season Ini - KD Ratio 4.5, Skin MP40 Cobra Lv 6 & Sakura Bundle",
    price: 620000,
    originalPrice: 950000,
    badge: "Hot Deal",
    seller: {
      name: "FeryStore Official",
      rating: 5.0,
      salesCount: 512,
      isVerified: true,
      responseTime: "< 1 Menit",
    },
    specs: {
      rank: "Grandmaster",
      level: 68,
      skinsCount: "140+ Vault",
      heroesCount: "48 Characters",
      loginVia: "Garena",
      changeName: "Off (Beli Card)",
      deliveryType: "Instant Delivery",
      winrate: "62.0%",
    },
    description: [
      "Akun statistik mengerikan dengan KD Ratio 4.5 di CS Ranked & BR Ranked.",
      "MP40 Predatory Cobra Level 6 (efek hit & kill menawan).",
      "Bundle Sakura & Budi01 Gaming siap pakai.",
    ],
    images: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    ],
    createdAt: "2026-07-26",
  },
  {
    id: "ff-003",
    slug: "ff-murah-heroic-starter",
    gameSlug: "ff",
    gameName: "Free Fire",
    title: "Akun Heroic Murah Meriah - 3 Evo Gun Lv 4, Cocok Buat Push Rank CS",
    price: 180000,
    originalPrice: 350000,
    badge: "Fast Delivery",
    seller: {
      name: "Booyah Kingdom",
      rating: 4.9,
      salesCount: 278,
      isVerified: true,
      responseTime: "< 2 Menit",
    },
    specs: {
      rank: "Heroic",
      level: 55,
      skinsCount: "80+ Vault",
      heroesCount: "35 Characters",
      loginVia: "Google / FB",
      changeName: "Ready (Gratis)",
      deliveryType: "Instant Delivery",
      winrate: "48.5%",
    },
    description: [
      "Pilihan tepat untuk pelajar/starter yang ingin akun spek lumayan dengan harga terjangkau.",
      "Login via Akun Google clean (diberikan beserta Gmail & passwordnya).",
    ],
    images: [
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    ],
    createdAt: "2026-07-23",
  },

  // --- VALORANT ---
  {
    id: "val-001",
    slug: "valorant-radiant-peak-kuronami-reaver-prime",
    gameSlug: "valorant",
    gameName: "Valorant",
    title: "Akun Radiant Peak - Vandal Kuronami & Reaver, Phantom Prime, Karambit RGX",
    price: 1350000,
    originalPrice: 2400000,
    badge: "Sultan",
    seller: {
      name: "Valorant Apex Shop",
      rating: 4.9,
      salesCount: 145,
      isVerified: true,
      responseTime: "< 4 Menit",
    },
    specs: {
      rank: "Immortal 3 (Peak Radiant)",
      level: 210,
      skinsCount: "42 Premium Skins",
      heroesCount: "All Agents Unlocked",
      loginVia: "Riot ID",
      changeName: "Ready (Gratis)",
      deliveryType: "Instant Delivery",
      winrate: "56.8%",
    },
    description: [
      "Akun Sultan Valorant Region Asia Pacific / Jakarta Server (Ping rendah 15ms).",
      "Vandal: Kuronami, Reaver, Prime, Prelude to Chaos (All MAX VFX & Finisher).",
      "Melee: Karambit RGX 11z Pro, Butterfly Knife Recon, Valorant Go Vol 1.",
      "Email pertama (OG Email) disertakan untuk garansi keamanan mutlak.",
    ],
    images: [
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop",
    ],
    createdAt: "2026-07-25",
    isFeatured: true,
  },
  {
    id: "val-002",
    slug: "valorant-ascendant-vandal-elderflame",
    gameSlug: "valorant",
    gameName: "Valorant",
    title: "Akun Ascendant 2 - Vandal Elderflame (Naga) & Ion Phantom, Knife Celestial Fan",
    price: 750000,
    originalPrice: 1200000,
    badge: "Hot Deal",
    seller: {
      name: "ProPlayer Shop",
      rating: 4.8,
      salesCount: 189,
      isVerified: true,
      responseTime: "< 5 Menit",
    },
    specs: {
      rank: "Ascendant 2",
      level: 135,
      skinsCount: "22 Premium Skins",
      heroesCount: "22 Agents",
      loginVia: "Riot ID",
      changeName: "Ready (Gratis)",
      deliveryType: "Instant Delivery",
      winrate: "53.4%",
    },
    description: [
      "Skin ikonik Vandal Naga (Elderflame) dengan animasi reload & kill terkeren.",
      "Phantom Ion bersuara renyah & Melee Celestial Kipas.",
      "No ban / No penalty history, akun sangat terawat.",
    ],
    images: [
      "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop",
    ],
    createdAt: "2026-07-24",
  },
  {
    id: "val-003",
    slug: "valorant-diamond-smurf-clean",
    gameSlug: "valorant",
    gameName: "Valorant",
    title: "Akun Diamond 3 Smurf Ready - Vandal Gaia Vengeance & Ghost Sovereign",
    price: 380000,
    originalPrice: 650000,
    badge: "Fast Delivery",
    seller: {
      name: "Valorant Apex Shop",
      rating: 4.9,
      salesCount: 145,
      isVerified: true,
      responseTime: "< 4 Menit",
    },
    specs: {
      rank: "Diamond 3",
      level: 78,
      skinsCount: "12 Premium Skins",
      heroesCount: "18 Agents",
      loginVia: "Riot ID",
      changeName: "Available",
      deliveryType: "Instant Delivery",
      winrate: "60.2%",
    },
    description: [
      "Akun smurf cocok untuk mabar santai bersama teman tier Platinum/Diamond.",
      "Skin Vandal Gaia putih elegan dengan finisher pohon eksklusif.",
    ],
    images: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
    ],
    createdAt: "2026-07-26",
  },

  // --- EFOOTBALL ---
  {
    id: "efo-001",
    slug: "efootball-epic-big-time-104-ovr-messi-ronaldinho",
    gameSlug: "efootball",
    gameName: "eFootball",
    title: "Akun eFootball Sultan Tim 104+ OVR - Trio Epic Big Time Messi 2015, Cruyff & Ronaldinho",
    price: 920000,
    originalPrice: 1800000,
    badge: "Sultan",
    seller: {
      name: "PES Legends ID",
      rating: 4.9,
      salesCount: 198,
      isVerified: true,
      responseTime: "< 3 Menit",
    },
    specs: {
      rank: "Divisi 1",
      level: "Squad 3150+",
      skinsCount: "35+ Epic / Big Time",
      heroesCount: "150+ Players",
      loginVia: "Konami ID",
      changeName: "Ready (Gratis)",
      deliveryType: "Instant Delivery",
      winrate: "74.5%",
    },
    description: [
      "Akun Sultan eFootball 2026 Mobile spesialis push Divisi 1 Dunia.",
      "Trio lini depan tak terkalahkan: Lionel Messi Big Time 2015 (105 OVR), Johan Cruyff Epic, Ronaldinho Gaucho.",
      "Lini belakang pertahanan kokoh: Maldini Epic, Nesta, Beckenbauer, Cech di gawang.",
      "Pelatih Luis A. Roman & Xabi Alonso Booster 88+.",
      "Login via Konami ID murni (bisa ganti email & password 100% aman).",
    ],
    images: [
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    ],
    createdAt: "2026-07-25",
    isFeatured: true,
  },
  {
    id: "efo-002",
    slug: "efootball-showtime-blitz-curler-son-salah",
    gameSlug: "efootball",
    gameName: "eFootball",
    title: "Akun Showtime Blitz Curler - Son Heung-Min, Salah & Chiesa 103 OVR",
    price: 550000,
    originalPrice: 900000,
    badge: "Hot Deal",
    seller: {
      name: "PES Legends ID",
      rating: 4.9,
      salesCount: 198,
      isVerified: true,
      responseTime: "< 3 Menit",
    },
    specs: {
      rank: "Divisi 2",
      level: "Squad 3080+",
      skinsCount: "18+ Epic / Showtime",
      heroesCount: "120+ Players",
      loginVia: "Konami ID",
      changeName: "Ready (Gratis)",
      deliveryType: "Instant Delivery",
      winrate: "65.0%",
    },
    description: [
      "Akun dengan skill eksklusif Blitz Curler yang sangat overpower untuk tendangan melengkung jarak jauh.",
      "Komposisi tim seimbang, siap langsung dipakai untuk event online & liga.",
    ],
    images: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    ],
    createdAt: "2026-07-24",
  },
  {
    id: "efo-003",
    slug: "efootball-starter-epic-mbappe-haaland",
    gameSlug: "efootball",
    gameName: "eFootball",
    title: "Akun Starter Pack eFootball - Mbappe Showtime & Haaland 102 OVR + 500 Koin",
    price: 150000,
    originalPrice: 300000,
    badge: "Fast Delivery",
    seller: {
      name: "FeryStore Official",
      rating: 5.0,
      salesCount: 512,
      isVerified: true,
      responseTime: "< 1 Menit",
    },
    specs: {
      rank: "Divisi 4",
      level: "Squad 2980+",
      skinsCount: "8+ Special Players",
      heroesCount: "80+ Players",
      loginVia: "Konami ID",
      changeName: "Ready (Gratis)",
      deliveryType: "Instant Delivery",
      winrate: "58.0%",
    },
    description: [
      "Akun pemula yang sudah dilengkapi striker top dunia dan bonus koin untuk gacha event minggu ini.",
    ],
    images: [
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop",
    ],
    createdAt: "2026-07-26",
  },

  // --- PUBG MOBILE ---
  {
    id: "pubg-001",
    slug: "pubgm-conqueror-m416-glacier-max-lv-7",
    gameSlug: "pubgm",
    gameName: "PUBG Mobile",
    title: "Akun Sultan Conqueror - M416 Glacier Level 7 MAX (Loot Crate & On-Hit Effect) + X-Suit Firaun Lv 4",
    price: 1850000,
    originalPrice: 3500000,
    badge: "Sultan",
    seller: {
      name: "Winner Chicken Shop",
      rating: 4.9,
      salesCount: 215,
      isVerified: true,
      responseTime: "< 3 Menit",
    },
    specs: {
      rank: "Conqueror S19 & C5S14",
      level: 79,
      skinsCount: "65+ Mythic & 120+ Epic",
      heroesCount: "All Sara/Carlo/Andy Unlocked",
      loginVia: "Level Infinite",
      changeName: "Ready (Gratis)",
      deliveryType: "Instant Delivery",
      winrate: "KD 4.8",
    },
    description: [
      "Akun Sultan PUBG Mobile impian semua player: M416 Glacier Level 7 MAX dengan peti mati es (Loot Crate) eksklusif.",
      "X-Suit Golden Pharaoh (Firaun) Level 4 (Kilap emas & emote masuk lobi).",
      "AKM Glacier Level 4 (Kill Message) & AWM Godzilla Lv 4.",
      "Tas & Helm Mythic lengkap, mobil McLaren & Lamborghini di garasi.",
      "Login via Level Infinite / Email sepaket super clean & garansi aman 100%.",
    ],
    images: [
      "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop",
    ],
    createdAt: "2026-07-25",
    isFeatured: true,
  },
  {
    id: "pubg-002",
    slug: "pubgm-ace-dominator-m416-fool-lv-4",
    gameSlug: "pubgm",
    gameName: "PUBG Mobile",
    title: "Akun Ace Dominator - M416 The Fool Level 4 (Kill Message) & Set Mythic Vampire",
    price: 780000,
    originalPrice: 1300000,
    badge: "Hot Deal",
    seller: {
      name: "Winner Chicken Shop",
      rating: 4.9,
      salesCount: 215,
      isVerified: true,
      responseTime: "< 3 Menit",
    },
    specs: {
      rank: "Ace Dominator",
      level: 68,
      skinsCount: "35+ Mythic",
      heroesCount: "Victor, Sara, Riley",
      loginVia: "Level Infinite",
      changeName: "Off (Beli Card)",
      deliveryType: "Instant Delivery",
      winrate: "KD 3.9",
    },
    description: [
      "Skin M416 The Fool badut ungu Level 4 dengan pesan membunuh (Kill Message) lidah badut.",
      "Set Mythic banyak, cocok untuk push rank squad dengan tampilan berkelas.",
    ],
    images: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
    ],
    createdAt: "2026-07-24",
  },
  {
    id: "pubg-003",
    slug: "pubgm-starter-uc-rp-max",
    gameSlug: "pubgm",
    gameName: "PUBG Mobile",
    title: "Akun Starter Royal Pass A7 MAX - 3 Skin Senjata Upgradable Lv 1 & 600 UC",
    price: 220000,
    originalPrice: 400000,
    badge: "Fast Delivery",
    seller: {
      name: "FeryStore Official",
      rating: 5.0,
      salesCount: 512,
      isVerified: true,
      responseTime: "< 1 Menit",
    },
    specs: {
      rank: "Crown I",
      level: 52,
      skinsCount: "15+ Mythic RP",
      heroesCount: "Sara Unlocked",
      loginVia: "Google / FB",
      changeName: "Ready (Gratis)",
      deliveryType: "Instant Delivery",
      winrate: "KD 2.8",
    },
    description: [
      "Akun Royal Pass aktif dan sudah max 100, sisa 600 UC bisa untuk beli RP season depan gratis.",
    ],
    images: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    ],
    createdAt: "2026-07-26",
  },
];
