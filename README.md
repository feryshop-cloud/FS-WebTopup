# UltraTopUp-NextJS

**UltraTopUp-NextJS** adalah frontend modern berbasis Next.js (TypeScript/JavaScript) untuk platform UltraTopUp yang siap pakai di desktop & mobile. Frontend ini menjadi antarmuka utama pelanggan untuk eksplorasi produk digital top-up, transaksi, riwayat, dan dashboard pengguna.

---

## Deskripsi

UltraTopUp-NextJS terhubung langsung ke backend UltraTopUp-Laravel via API untuk menyajikan layanan transaksi pulsa, paket data, dan produk digital lainnya secara real time dengan UI/UX modern.

---

## Fitur-Fitur

- Registrasi & Login User
- Dashboard Pengguna
- Browse dan Pesan Produk Digital
- Riwayat & Status Transaksi
- Info Saldo & TopUp
- Notifikasi Real Time
- Admin Panel (opsional)
- Responsive (mobile & desktop)
- Integrasi ke Payment Gateway

---

## Struktur Direktori (Umum NextJS)

```
├── components/
├── pages/
│   ├── index.tsx
│   ├── login.tsx
│   ├── dashboard.tsx
│   └── api/
├── public/
│   └── assets/
├── styles/
├── services/
│   └── api.ts
├── utils/
├── package.json
└── README.md
```

---

## Instalasi & Deploy ke VPS aaPanel

### Prasyarat

- Node.js (disarankan v18+)
- aaPanel (web server management)
- PM2 (process manager nodejs, install: `npm install -g pm2`)
- Git (untuk clone repo)
- Backend UltraTopUp-Laravel telah jalan

### Langkah Instalasi & Deploy

1. **Clone Project**
    ```bash
    git clone https://github.com/ferdianandaid/UltraTopUp-NextJS.git
    cd UltraTopUp-NextJS
    ```

2. **Install Dependency**
    ```bash
    npm install
    ```

3. **Siapkan Konfigurasi Environment**
    - Edit file `.env.local`, contoh:
      ```
      NEXT_PUBLIC_API_BASE_URL=http://domain-backend-laravelmu/api
      ```

4. **Build dan Jalankan Production**
    ```bash
    npm run build
    PORT=3100 pm2 start npm --name "topup" -- start
    pm2 startup
    pm2 save
    ```

    - `PORT=3100` adalah port custom, bisa diganti sesuai kebutuhan.
    - Gunakan PM2 agar proses Next.js selalu running di background.

5. **Konfigurasi Domain/Subdomain di aaPanel**
    - Point domain ke folder project ini (bisa gunakan reverse proxy ke `localhost:3100`)

6. **(Opsional) Setting SSL Let's Encrypt di aaPanel**

---

## Panduan Akses

- Akses frontend via domain/subdomain yang sudah dipointing.

---

<<<<<<< HEAD
UltraTopUp — Solusi TopUp Otomatis Pulsa & Layanan Digital
=======
UltraTopUp — Solusi TopUp Otomatis Pulsa & Layanan Digital
>>>>>>> 37ec7a7 (feat: add and fix some feature)
