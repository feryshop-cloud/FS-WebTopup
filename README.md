# Feryshop - Platform Top-Up & Marketplace Akun

**Feryshop** adalah frontend modern berbasis Next.js (TypeScript/JavaScript) untuk platform Feryshop yang siap pakai di desktop & mobile. Frontend ini menjadi antarmuka utama pelanggan untuk eksplorasi produk digital top-up, transaksi, riwayat, marketplace akun, dan dashboard pengguna.

---

## Deskripsi

Feryshop terhubung langsung ke backend via API untuk menyajikan layanan transaksi pulsa, paket data, voucher game, dan marketplace akun digital secara real time dengan UI/UX modern bertema Dark Mode eksklusif.

---

## Fitur-Fitur

- Registrasi & Login User (OAuth Google & OTP)
- Dashboard Pengguna & Pengaturan Akun
- Browse dan Pesan Produk Digital & Marketplace Akun
- Riwayat & Status Transaksi Real Time
- Info Saldo, TopUp & Kode Promo
- Notifikasi & WhatsApp Bubble Integration
- Admin Panel / Seller Management
- Responsive Design (Mobile & Desktop)
- Dark Theme Only dengan Estetika Premium
- Integrasi ke Payment Gateway

---

## Struktur Direktori

```
├── src/
│   ├── app/           # Next.js App Router (Pages & API Routes)
│   ├── components/    # Reusable UI Components (Lucide Icons, Tailwind)
│   ├── context/       # React Context Providers (Settings, Theme)
│   ├── lib/           # Database (Drizzle ORM), Auth, Utilities, & Seed Data
│   └── types/         # TypeScript Definitions
├── public/            # Static Assets & Logos
├── package.json
└── README.md
```

---

## Instalasi & Menjalankan secara Lokal

### Prasyarat

- Node.js (disarankan v18+)
- Package manager (npm / pnpm / yarn)

### Langkah Instalasi

1. **Clone Project / Masuk ke Direktori**
   ```bash
   cd TopupSon
   ```

2. **Install Dependency**
   ```bash
   npm install
   ```

3. **Siapkan Konfigurasi Environment**
   - Salin dan edit file `.env`, contoh:
     ```env
     NEXT_PUBLIC_APP_NAME="Feryshop"
     NEXT_PUBLIC_API_URL=http://localhost:8000
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

---

## Branding & Kredit

- **Brand**: Feryshop
- **Credit**: Made in Feryshop
- All rights reserved.
