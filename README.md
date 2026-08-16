# Feryshop — Platform Top-Up & Marketplace Akun Game

**Feryshop** adalah storefront publik untuk platform top-up game dan marketplace akun game. Dibangun dengan Next.js 15 (App Router), React 19, Tailwind CSS v3, Drizzle ORM, dan Supabase.

## Tech Stack

- **Framework:** Next.js 15 (React 19) dengan App Router & Server Components
- **Styling:** Tailwind CSS v3 + custom design system "Midnight Game Counter"
- **Database:** Supabase (PostgreSQL) via Drizzle ORM + REST client
- **Auth:** NextAuth v4 (Google, Credentials email/password, WhatsApp OTP)
- **Realtime:** Pusher (payment status, order updates)
- **Payment:** Integration dengan `payment-service` (Cloudflare Worker) untuk QRIS/e-wallet/VA
- **Runtime:** Node.js standalone di Railway

## Fitur Utama

- Registrasi & Login User (OAuth Google & Email/Password + WhatsApp OTP)
- Top-Up game (Mobile Legends, Free Fire, Valorant, PUBG Mobile, Genshin Impact, dll.)
- Marketplace akun game (filter by game, rank, price)
- Invoice & QR pembayaran dengan countdown timer
- Real-time status pembayaran & order via Pusher
- Riwayat transaksi & dashboard pengguna
- Kode promo & saldo
- Admin panel seller management
- Responsive design (mobile & desktop)
- Dark theme only dengan estetika premium

## Struktur Direktori

```
FS-Public/
├── src/
│   ├── app/                 # Next.js App Router (pages, layouts, API routes)
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Base UI primitives
│   │   ├── home/            # Homepage sections
│   │   ├── order/           # Order flow components
│   │   ├── invoice/         # Invoice components
│   │   ├── marketplace/     # Marketplace components
│   │   └── panel/           # User panel/dashboard
│   ├── lib/
│   │   ├── db/              # Drizzle schema & database client
│   │   ├── supabase-*.ts    # Supabase client adapters
│   │   ├── auth.ts          # NextAuth configuration
│   │   ├── payment-client.ts # Payment service integration
│   │   └── data/            # Seed data & fallback data
│   ├── hooks/               # Custom React hooks
│   ├── context/             # React context providers
│   └── types/               # TypeScript definitions
├── public/                  # Static assets & logos
├── registry/                # UI registry
├── package.json
└── README.md
```

## Instalasi & Menjalankan Lokal

### Prasyarat

- Node.js >= 20.x
- Package manager: npm / pnpm / yarn
- Proyek Supabase aktif

### Langkah Instalasi

1. **Masuk ke Direktori**
   ```bash
   cd FS-Public
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Siapkan Konfigurasi Environment**
   Salin `.env.example` menjadi `.env.local` dan isi dengan:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_GOOGLE_ID=your_google_client_id
   NEXTAUTH_GOOGLE_SECRET=your_google_client_secret
   NEXT_PUBLIC_PUSHER_APP_KEY=your_pusher_key
   NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster
   PAYMENT_CALLBACK_SECRET=your_payment_secret
   ```

4. **Jalankan Development Server**
   ```bash
   npm run dev
   ```
   Akses aplikasi melalui `http://localhost:3000`.

5. **Build untuk Production**
   ```bash
   npm run build
   npm start
   ```

## Arsitektur Data

- **Storefront** membaca data publik dari Supabase via REST + RLS: `games`, `categories`, `settings`, dan `inventory` dengan status `AVAILABLE`
- **Payment** menggunakan `payment-service` (Cloudflare Worker terpisah) untuk create payment intent, simulate, dan webhook callback
- **Realtime** menggunakan Pusher untuk update status pembayaran dan order secara live
- **Gambar** di-host di Railway S3 bucket dan di-serve via `/api/storage/[...key]` (S3 signed URL) atau `/api/proxy-image`

## Batasan Scope

- **Pembayaran** menggunakan `payment-service` untuk generate VA/QRIS; settlement dan callback diverifikasi via HMAC signature.
- **Admin & pembukuan** (inventori, deal, ledger, laporan) ada di repo terpisah: `game-inventori` (admin ERP).
- Kedua repo berbagi satu database Supabase.

## Commands

```bash
npm run dev                  # start dev server
npm run build                # production build + type/lint check
npm run start                # serve production build
npm run start:railway        # serve standalone di Railway (HOSTNAME=::)
npm run lint                 # ESLint flat config
npm run format               # format codebase dengan Prettier
npm run registry:build       # rebuild UI registry
```

---

_Dikembangkan dengan Zero-Hallucination Vibe Coding Principles._

