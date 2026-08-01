# PRD — Customer-Facing Interface Sync (FS-Public ↔ game-inventori)

> **Dokumen ini adalah PRD (Product Requirements Document) untuk aplikasi `FS-Public` (storefront pelanggan) yang menyesuaikan interface yang dilihat pelanggan agar dikelola / diturunkan langsung dari keadaan operasional yang ditDefinisikan di `@game-inventori/prd.md`.
>
> **Sumber kebenaran:** `game-inventori/prd.md` (sistem internal / admin).
> **Aplikasi target:** `FS-Public/` — Next.js 15 storefront pelanggan.
> **Status:** Draft (fase perencanaan).

---

## 1. Gambaran Umum

### 1.1 Latar Belakang
Feryshop menggunakan dua aplikasi terpisah:

| Aplikasi | Peran | Teknologi |
|---|---|---|
| `game-inventori` | Sistem **internal/admin** — manajemen stok, deal/transaksi, pembayaran, ledger keuangan, problem case, dashboard operasional. | Next.js 16, Supabase + RLS |
| `FS-Public` | **Storefront pelanggan** — browsing marketplace akun game, pemesanan top-up, bayar, lihat invoice, riwayat transaksi, akun settings. | Next.js 15, Drizzle + Postgres, NextAuth, Pusher |

`game-inventori/prd.md` mendefinisikan model keadaan yang kaya dan otoritatif:

- **Deal** (transaksi utama) yang bisa memiliki **banyak payment record** (DP, cicilan, pelunasan).
- **Status stok** multi-level: *Tersedia, Booking, Akses Terbatas, Terjual, On Hold, Bermasalah - Ditindaklanjuti, Bermasalah - Permanen, Cancel*.
- **Status deal** multi-level: *Draft, Booking, Akses Terbatas, Lunas, Cancel oleh Pembeli, Cancel oleh Feryshop, Refund Sebagian, Refund Penuh, Bermasalah, Selesai*.
- **Problem case** terpisah yang bisa melekat pada stock/deal/customer.
- **Ledger keuangan** yang mencatat setiap aliran uang.
- **Rekening/metode pembayaran** yang dikelola owner.

Saat ini, interface pelanggan di `FS-Public` menggunakan model yang **terlalu sederhana**:

- `orders` hanya memiliki dua status: `payment_status` (`pending`/`paid`/`failed`/`expired`) dan `buy_status` (`pending`/`processing`/`success`/`failed`).
- **Satu order = satu payment** — tidak mendukung DP/cicilan/pelunasan dalam satu deal.
- Tidak ada konsep **deal**, **problem case**, **refund**, atau **akses terbatas** yang ditampilkan ke pelanggan.
- Dashboard pelanggan hanya menampilkan `Status` (derivatives dari `buy_status`/`payment_status`) dan tidak membedakan booking, lunas, cancel, atau bermasalah.

### 1.2 Tujuan
Menyelaraskan interface pelanggan `FS-Public` agar **status yang dilihat dan ditindaklanjuti pelanggan dikelola oleh sistem internal** (`game-inventori`), bukan model status lokal yang sederhana. Interface pelanggan harus **menyajikan kembali keadaan deal yang ditentukan oleh sistem internal**, termasuk:

1. **Deal** sebagai unit transaksi tunggal yang sumber kebenaarannya dari `game-inventori`.
2. **Riwayat pembayaran** (DP, cicilan, pelunasan) — satu deal, banyak payment.
3. **Status deal** yang mencerminkan lifecycle internal (Booking → Akses Terbatas → Lunas → Selesai / Cancel / Refund / Bermasalah).
4. **Notifikasi problem case** bila akun/deal bermasalah.
5. **Status refund/cancel** dan nominal yang harus dikembalikan.
6. **Saldo/akses terbatas** (mis. akun ditahan sampai dilunasi).

### 1.3 Cakupan (In Scope)
- Sinkronisasi status invoice (`/invoices/[orderId]`) ke model **deal**.
- Sinkronisasi status pembayaran ke **payment records** (riwayat + sisa + sukses langkah).
- Sinkronisasi dashboard pelanggan ke model **deal**.
- Notifikasi **problem case** ke pelanggan.
- Tampilan **refund / cancel** kepada pelanggan.
- Kontrak API `/api/order*` agar mengembalikan data deal yang konsisten.
- Sinkronisasi **stock status** yang relevan bagi pelanggan (apakah akun masih tersedia untuk dibeli / sudah terjual / bermasalah).

### 1.4 Di Luar Cakupan (Out of Scope)
- Implementasi sistem akuntansi/ledger internal di `FS-Public` (ledger tetap milik `game-inventori`).
- Manajemen stok, role/permission, dan operasional admin di `FS-Public`.
- Integrasi pembayaran langsung (gateway) — `FS-Public` tetap menampilkan instruksi pembayaran; eksekusi payment mingkem ke `game-inventori`/gateway.

---

## 2. Prinsip Sistem yang Wajib Dipatu

1. **Deal adalah unit kebenaran tunggal.** Pelanggan tidak perlu tahu ada "stock" di balik layar, tetapi setiap aksi/status yang mereka lihat harus berasal dari satu deal yang sama.
2. **Satu deal, banyak payment.** Interface harus menampilkan daftar payment record (DP, cicilan, pelunasan), bukan single payment.
3. **Riwayat tidak boleh hilang.** Jika deal sudah lunas tapi akun kemudian bermasalah, riwayat pembayaran lunas tetap ditampilkan; problem case muncul sebagai lapisan tambahan.
4. **Pelanggan hanya lihat apa yang perlu.** Data sensitif (harga modal, profit, biaya, ledger internal) **tidak** pernah ditampilkan ke pelanggan.
5. **Audit log tetap wajib.** Setiap view penting (invoice dibuka, payment ditambahkan dari sisi pelanggan via webhook, dll.) minimal dicatat — walaupun log ini bisa berupa event di `FS-Public` yang selanjutnya direplikasi ke `game-inventori`.

---

## 3. Analisis Status yang Ada (Current State) di FS-Public

### 3.1 Model Data Saat Ini (`src/lib/db/schema.ts`)
```ts
orders: {
  order_id, payment_status: "pending"|"paid"|"failed"|"expired",
  buy_status: "pending"|"processing"|"success"|"failed", ...
}
```
- **Keterbatasan:** hanya 2 status; tidak ada concept DP/cicilan; tidak ada refund; tidak ada problem case; tidak ada "akses terbatas".

### 3.2 Interface Pelanggan Saat Ini
| Route | Komponen | Status yang ditampilkan |
|---|---|---|
| `/invoices/[orderId]` | `InvoiceHeader`, `InvoicePaymentMethod`, `InvoicePaymentDetails`, `InvoiceStatus` | `payment_status`, `buy_status` |
| `/dashboard` | transaksi list + summary | `StatusBadge` (derivatif `buy_status`/`payment_status`) |
| `/order/[slug]` | order flow | hanya checkout tunggal, satu payment method, satu total |
| `/marketplace/[slug]/[accountId]` | akun marketplace | statis, tidak terhubung ke deal |

### 3.3 API yang Ada
- `POST /api/order` — membuat order (satu payment, satu total).
- `GET /api/order/{orderId}` & `GET /api/orders/{orderId}` — mengembalikan `order` dengan `payment_status` + `buy_status`.
- `GET /api/order/{orderId}/payment-status` — polling status (hardcoded `success` bila ada di DB).
- `GET /api/transactions` / `transaction-summary` — daftar + ringkasan transaksi.

---

## 4. Model Data yang Diharapkan (Setelah Sync)

Interface pelanggan akan mengonsumsi bentuk **deal view** yang diekspor oleh sistem internal. Bentuk ini **read-only** bagi pelanggan (customer tidak bisa mengubah deal; mereka hanya melihat/membayar).

### 4.1 Deal View (dibaca dari game-inventori)
```ts
interface CustomerDealView {
  deal_number: string;           // Nomor deal dari game-inventori
  order_id: string;             // ID order di FS-Public (mungkin mapping/sync ke deal_number)
  customer_id: string;          // user_id FS-Public
  game_slug: string;
  stock_id: string;             // ID stok/akun yang dibeli
  product_title: string;        // nama akun/top up
  deal_price: number;           // Harga deal (bisa = total harga jual akun)
  total_paid: number;           // Jumlah total sudah dibayar (semua payment record)
  remaining_amount: number;     // Sisa yang harus dibayar
  payment_percentage: number;   // % pembayaran (0-100)
  deal_status: DealStatus;      // lihat 4.2
  access_status: AccessStatus;  // akses akun saat ini (terbatas/belum/aktif)
  created_at: string;
  due_date: string | null;      // jatuh tempo pelunasan
  payments: PaymentRecord[];    // riwayat semua payment
  problem_case?: ProblemCaseView | null;
  refund?: RefundView | null;
  trade_in?: TradeInDealView | null;  // jika deal ini tukar tambah
  admin_notes?: string;         // catatan internal yang dapat dilihat pelanggan (non-sensitif)
}
```

### 4.2 Deal Status (sinkron dari game-inventori §4.D / §5)
> Nilai `deal_status` adalah sumber kebenaran yang ditampilkan ke pelanggan:

| Status internal (game-inventori) | Label customer | Keterangan UI |
|---|---|---|
| `draft` | Draft | Hanya internal; tidak tampil ke customer sampai ada DP. |
| `booking` | Booking / DP | Sudah ada DP; sisa masih ada. Tunggu pelunasan. |
| `akses_terbatas` | Akses Terbatas | ≥70% dibayar; customer bisa dapat akses terbatas. |
| `lunas` | Lunas | 100% dibayar; stok = Terjual. Tampilkan SN/credential. |
| `selesai` | Selesai | Deal final & selesai (mis. sudah diterima & dikonfirmasi). |
| `cancel_pembeli` | Dibatalkan (DP hangus) | Tampilkan nominal hangus + refund (jika ada). |
| `cancel_feryshop` | Dibatalkan (Refund Penuh) | Refund penuh ke customer. |
| `refund_sebagian` | Refund Sebagian | Tampilkan nominal refund + tanggal. |
| `refund_penuh` | Refund Penuh | Tampilkan nominal refund + tanggal. |
| `bermasalah` | Perlu Perhatian | Problem case terbuka; jelaskan langkah selanjutnya. |

> Note: `FS-Public` tidak perlu meng-*implementasikan* status ini secara lokal — ia **menerima** status ini dari API game-inventori.

### 4.3 Payment Record (game-inventori §4.E)
```ts
interface PaymentRecord {
  payment_id: string;
  deal_number: string;
  amount: number;
  method: string;        // rekening/metode pembayaran
  method_name: string;
  type: "dp" | "cicilan" | "pelunasan" | "refund" | "cashback";
  paid_at: string;
  proof_url?: string;    // attachment bukti
  recorded_by?: string;  // admin yang mencatat (hanya label, bukan detail sensitif)
}
```

### 4.4 Problem Case View
```ts
interface ProblemCaseView {
  case_number: string;
  reported_at: string;
  issue_type: string;          // e.g. "akun bermasalah", "hack-back"
  status: "open" | "ditindaklanjuti" | "menunggu_customer" | "selesai" | "permanen";
  summary: string;             // kronologi singkat yang boleh dilihat customer
  resolution?: string;         // solusi / apa yang harus customer lakukan
  refund_amount?: number;      // jika ada refund terkait case
  attachments?: string[];
}
```

### 4.5 Refund View
```ts
interface RefundView {
  refund_id: string;
  amount: number;
  reason: string;
  status: "pending" | "processing" | "done" | "failed";
  method: string;    // rekening tujuan refund
  created_at: string;
  processed_at?: string;
}
```

---

## 5. Kebutuhan (Requirements) per Interface

### 5.1 Invoice / Halaman Pembayaran (`/invoices/[orderId]`)
Halaman invoice adalah **sumber informasi utama deal bagi pelanggan**.

| No | Kebutuhan | Dari game-inventori |
|---|---|---|
| 5.1.1 | Ganti heading status dari `payment_status`/`buy_status` ke **deal_status** (Booking, Lunas, Akses Terbatas, dll). | §4.D, §5 |
| 5.1.2 | Tampilkan **progress pembayaran**: total dibayar / total deal / sisa / persentase. | §4.D Flow 2–3 |
| 5.1.3 | Tampilkan **daftar payment record** (DP, ciciilan, pelunasan) sebagai riwayat, bukan single payment. | §4.E |
| 5.1.4 | Jika status **Booking/DP**: tampilkan tombol/CTA "Bayar Sisa" yang membuka flow payment berikutnya ke deal yang sama. | §5 Flow 2–3 |
| 5.1.5 | Jika status **Akses Terbatas**: beri tahu customer bahwa akses terbatas sudah bisa diberikan; tampilkan credential akses sementara. | §5 Flow 2 item 8 |
| 5.1.6 | Jika status **Lunas/Selesai**: tampilkan serial number / credential akun. | §5 Flow 1 |
| 5.1.7 | Jika **problem case** aktif: tampilkan banner "Akun Bermasalah" + status case + aksi selanjutnya + link hubungi admin. | §8 |
| 5.1.8 | Jika **cancel/refund**: tampilkan nominal hangus, nominal refund, status refund, dan perkiraan waktu. | §5 Flow 5–6 |
| 5.1.9 | Countdown hanya muncul bila deal masih **terbuka** (Booking/DP) & belum lunas. | §5 Flow 2 (jatuh tempo) |
| 5.1.10 | Tombol "Unduh Nota / Invoice PDF" (opsional, phase 2). | §12 |

#### 5.1.1 UI Mockup Status (header invoice)
```
[Deal Status Badge: "Booking" | "Akses Terbatas" | "Lunas" | "Dibatalkan" | "PerlU Perhatian"]
Progress: Rp 200.000 / Rp 1.000.000 (20%)  [====------]  Sisa: Rp 800.000
```

#### 5.1.2 Riwayat Payment (payment list)
```
Tanggal        | Jenis    | Metode   | Jumlah       | Status
01/08 14:00    | DP       | QRIS     | Rp 200.000   | ✓ Sukses
02/08 10:00    | Cicilan  | Dana     | Rp 300.000   | ✓ Sukses   [opsional: upload buktar]
```

### 5.2 Halaman Order / Checkout (`/order/[slug]`)
Flow checkout kini bisa menjadi **pembuatan deal Booking** (DP) atau **pembayaran sisa**.

| No | Kebutuhan | Dari game-inventori |
|---|---|---|
| 5.2.1 | Pada awal, customer pilih "Bayar Penuh" (Lunas langsung) atau "Booking / DP" (≥20%). | §5 Flow 1 vs Flow 2 |
| 5.2.2 | Jika DP: sistem buat **deal** dengan `deal_status = booking`, `remaining_amount` dihitung, `due_date` = +7 hari. | §5 Flow 2 |
| 5.2.3 | Jika customer sudah punya deal booking & kembali bayar: arahkan ke flow "Bayar Sisa" pada deal yang sama (bukan order baru). | §5 Flow 3 |
| 5.2.4 | Split payment tetap didukung (1 deal, banyak payment). | §4.E |
| 5.2.5 | Jika stock tidak lagi **Tersedia/Tersedia untuk dibeli** (mis. sudah Terjual/Bermasalah), tombol beli dinonaktifkan & tampilkan pesan. | §4.B status stok |
| 5.2.6 | Setelah payment berhasil, update realtime ke deal view (via Pusher/webhook). | — |

### 5.3 Dashboard Pelanggan (`/dashboard`)
Dashboard harus menyajikan **daftar deal** customer, bukan sekadar `buy_status`.

| No | Kebutuhan | Dari game-inventori |
|---|---|---|
| 5.3.1 | Ganti kolom "Status" ke **deal_status** (Booking / Akses Terbatas / Lunas / Dibatalkan / Perlu Perhatian). | §4.D |
| 5.3.2 | Tambah kolom/kartu: **Jumlah Dibayar** vs **Total**, **Sisa**. | §4.D Flow 2 |
| 5.3.3 | Kasih badge warna berdasarkan deal_status. | §4.D |
| 5.3.4 | Filter status: semua / aktif (booking/akses terbatas) / selesai / dibatalkan / bermasalah. | §13 Dashboard filter |
| 5.3.5 | Klik sebaris deal → buka invoice deal tersebut. | — |
| 5.3.6 | Ringkasan sementara: Jumlah deal aktif, total terbayar, jumlah overdue. | §13 |

### 5.4 Marketplace Detail Akun (`/marketplace/[slug]/[accountId]`)
Bila akun tersedia untuk dibeli (stock `Tersedia`), tombol beli aktif.

| No | Kebutuhan | Dari game-inventori |
|---|---|---|
| 5.3.1 | Jika stock tidak lagi `Tersedia` (mis. sudah `Terjual` / `Bermasalah` / `Booking`), ubah UI jadi "Stok Tidak Tersedia" + nonaktifkan CTA beli. | §4.B |
| 5.3.2 | Tampilkan badge status akun (Tersedia / Booking / Akses Terbatas / Terjual). | §4.B |

> Catatan: marketplace ini saat ini masih mock data (`mock-marketplace.ts`). Sinkronisasi status stok ke marketplace adalah phase 2.

### 5.5 Problem Case Notification
| No | Kebutuhan | Dari game-inventori |
|---|---|---|
| 5.5.1 | Jika deal/stock terkait ada problem case `open`/`ditindaklanjuti`/`menunggu_customer`: tampilkan banner notifikasi di invoice & dashboard. | §8 |
| 5.5.2 | Customer dapat melihat `summary` + `resolution` + `attachments` (bukti) dari case. | §8 |
| 5.5.3 | Customer **tidak** bisa menutup case sendiri (semua penyelesaian butuh approval owner). | §7 (note approval owner) |

---

## 6. Kontrak API (API Contract) yang Diperbarui

API di `FS-Public` harus melayani data deal view yang konsisten dengan sistem internal.

### 6.1 `GET /api/order/{orderId}` & `/api/orders/{orderId}`
Sekarang mengembalikandan. Response harus mencakup:

```ts
{
  success: true,
  order: CustomerDealView,   // ganti dari bentuk lama payment_status/buy_status
  game: { ... },
  product: { ... },
}
```

Field tambahan wajib:
- `deal_status` (enum §4.2)
- `access_status` (`none` | `limited` | `granted` | `revoked`)
- `total_paid`, `remaining_amount`, `payment_percentage`
- `due_date`
- `payments: PaymentRecord[]`
- `problem_case?: ProblemCaseView | null`
- `refund?: RefundView | null`

### 6.2 `GET /api/order/{orderId}/payment-status`
Dikembangkan untuk **polling deal-level status**. Response:

```ts
{
  success: true,
  data: {
    order_id,
    deal_status,         // ganti dari payment_status/buy_status
    payment_percentage,
    total_paid,
    remaining_amount,
    last_payment?: PaymentRecord,
  }
}
```

### 6.3 `POST /api/order`
Sekarang membuat **deal**, bukan hanya order. Body tambahan:

```ts
{
  game: string,
  product_id: string,
  whatsapp: string,
  payment_method_id: string,
  amount: number,        // untuk DP: nominal DP; untuk lunas: full
  payment_type: "full" | "dp",   // NEW
  // booking flow:
  due_date?: string,    // default +7 hari
}
```

Response mengembalikan `deal_number` + `order_id` + `deal_status: "booking"|"lunas"`.

> Implementasi akhir (insert deal ke game-inventori) dapat melalui API internal — `FS-Public` cukup meneruskan ke backend/internal.

### 6.4 `GET /api/transactions` & `/api/transactions/transaction-summary`
Mapping kolom:

| Lama (FS-Public) | Baru (deal view) |
|---|---|
| `buy_status` | `deal_status` |
| `total_price` | `deal_price` |
| — | `total_paid` |
| — | `remaining_amount` |

Summary menambahkan: `active_deals` (booking + akses_terbatas), `overdue_deals`, `completed_deals`, `cancelled_deals`, `problem_deals`.

### 6.5 API baru opsional (phase 2)
- `GET /api/order/{orderId}/payments` — riwayat lengkap payment record.
- `GET /api/order/{orderId}/problem-case` — detail problem case (jika ada).
- `GET /api/order/{orderId}/refund` — detail refund (jika ada).

---

## 7. Mapping Status (FS-Public lama → deal view baru)

Untuk kompatibilitas transisi, berikan **mapping** dari sistem lama ke sistem baru:

### 7.1 payment_status + buy_status → deal_status
| payment_status | buy_status | → deal_status (customer) |
|---|---|---|
| `pending` | `pending` | `booking` (jika ada DP dibayar) / `draft` (belum bayar) |
| `paid` | `processing` | `akses_terbatas` (jika <100%) |
| `paid` | `success` | `lunas` |
| `expired` | `failed` | `cancel_feryshop` (atau `bermasalah` bila ada DP) |
| `failed` | `failed` | `cancel_feryshop` |

> Mapping ini **hanya untuk transisi**. Setelah sinkronisasi penuh, `deal_status` langsung diterima dari game-inventori.

### 7.2 Stock status → Customer CTA
| Stock status (game-inventori §4.B) | Customer lihat / bisa lakukan |
|---|---|
| `Tersedia` | Tombol "Beli" aktif |
| `Booking` | "Sedang dibooking pelanggan lain" — beli dinonaktifkan |
| `Akses Terbatas` | "Akses terbatas aktif" — hanya info |
| `Terjual` | "Stok habis / terjual" — beli dinonaktifkan |
| `On Hold` | "Sedang ditinjau" — beli dinonaktifkan |
| `Bermasalah - Ditindaklanjuti` | "Akun sedang ditinjau kembali" |
| `Bermasalah - Permanen` | "Akun tidak tersedia" |
| `Cancel` | "Stok dibatalkan" |

---

## 8. Pengalaman Pengguna (Flow) yang Diupdate

### 8.1 Flow: Checkout DP (Booking)
```
1. Customer pilih akun → halaman order
2. Pilih "Booking / DP" (radio)
3. Pilih metode pembayaran
4. Sistem hitung DP minimal (20%)
5. Bayar DP → deal_status = booking
6. UI invoice: progress bar 20%, sisa 80%, countdown
7. Customer bisa kembali bayar sisa → payment record baru di deal sama
```

### 8.2 Flow: Pelunasan
```
1. Customer buka invoice deal booking
2. Klik "Bayar Sisa"
3. Pilih metode (bisa beda)
4. Payment record baru dicatat di deal yang sama
5. total_paid bertambah, sisa berkurang
6. Jika 100% → deal_status = lunas → tampilkan credential
```

### 8.3 Flow: Akses Terbatas
```
1. Deal mencapai ≥70% (setelah payment)
2. deal_status = akses_terbatas
3. Customer dapat credential akses terbatas (sementara)
4. Sisa harus dilunasi
```

### 8.4 Flow: Cancel / Refund
```
1. Admin cancel di game-inventori
2. deal_status = cancel_pembeli | cancel_feryshop
3. customer lihat: nominal hangus, nominal refund, status refund
4. Refund otomatis masuk ke rekening customer (jika sudah lunas) atau dicatat sebagai piutang
```

### 8.5 Flow: Problem Case
```
1. Akun/deal bermasalah
2. problem_case terbuka di deal
3. Customer lihat banner "PerlU Perhatian" + detail case + aksi
4. Semua resolusi butuh approval owner (manual) — customer tidak bisa self-approve
```

---

## 9. Keamanan & Privasi

| Aturan | Diterapkan di |
|---|---|
| Harga modal & profit **tidak** pernah tampil ke customer | UI invoice, dashboard, API |
| Problem case hanya menampilkan `summary`/`resolution`, bukan kronologi admin penuh | API deal view |
| Refund hanya menampilkan nominal + status, bukan ledger internal | API refund view |
| Credential akun (password, email) hanya tampil setelah `lunas` | invoice credential section |
| Stock internal (login akun stok) tidak pernah bocoro ke customer | backend saja |
| Audit view invoice & aksi customer dicatat | API + webhook ke game-inventori |

---

## 10. Ketergantungan (Dependencies)

1. **API game-inventori** yang mengekspor *read-only deal view* untuk pelanggan.
   - Endpoint yang diusulkan: `GET /api/public/deals/{orderId}` (atau sinkron melalui webhook ke FS-Public DB).
2. **Webhook / Pusher** untuk update realtime deal & payment status ke UI.
3. **Sinkronisasi `order_id` (FS-Public) ↔ `deal_number` (game-inventori)** — mapping 1:1 agar customer tetap pakai URL invoice yang familiar.

---

## 11. Prioritas MVP (Minimum Viable)

Wajib ada sebelum peluncuran:

1. `deal_status` menggantikan `payment_status`/`buy_status` di invoice & dashboard.
2. Progress pembayaran (total dibayar / sisa / %).
3. Daftar payment record (riwayat DP/cicilan/pelunasan).
4. CTA "Bayar Sisa" bila deal masih terbuka.
5. Banner problem case.
6. Tampilan refund/cancel (nominal + status).
7. API `/api/order/{orderId}` mengembalikandan deal view.
8. Mapping status lama → baru (fallback) selama transisi.

### 12. Tahap Berikutnya (Next Phase)
1. Export nota/invoice PDF.
2. Marketplace akun terhubung ke stock status (bukan lagi mock).
3. Split payment UI di checkout.
4. Notifikasi push/email (DP berhasil, sisa jatuh tempo, problem case update).
5. Trade-in deal customer view (jika ada).
6. Riwayat deal & ledger ringkas bagi customer (read-only rekap payment).

---

## 13. Kriteria Penerimaan (Acceptance Criteria)

1. **AC-1:** Invoice page menampilkan `deal_status`, progress pembayaran, dan daftar payment record.
2. **AC-2:** Jika deal status `booking`, customer melihat countdown jatuh tempo + tombol "Bayar Sisa".
3. **AC-3:** Jika deal status `lunas`, customer melihat credential akun (serial number / password) — tidak sebelum lunas.
4. **AC-4:** Jika deal ada `problem_case` aktif, banner "Akun Bermasalah" muncul di invoice & dashboard.
5. **AC-5:** Jika deal ada `refund`, nominal + status refund ditampilkan.
6. **AC-6:** Dashboard customer menampilkan daftar deal dengan kolom `deal_status`, `total_paid`, `remaining_amount`.
7. **AC-7:** Harga modal / profit / ledger internal **tidak pernah** muncul di response API ke customer.
8. **AC-8:** Jika stock tidak `Tersedia`, CTA beli di marketplace dinonaktifkan.
9. **AC-9:** Mapping status lama → baru tetap berfungsi selama transisi (old orders tetap terbaca).
10. **AC-10:** Polling / realtime update deal_status & pembayaran berfungsi ≤ 10 detik.

---

## 14. Glossary

| Istilah | Makna | Sumber |
|---|---|---|
| **Deal** | Unit transaksi utama antara Feryshop & customer (serupa order). | game-inventori §4.D |
| **Payment Record** | Pembayaran individu dalam satu deal (DP/cicilan/pelunasan). | game-inventori §4.E |
| **Stock** | Akun game / stok yang dikelola (internal). | game-inventori §4.B |
| **Problem Case** | Kasus akun bermasalah yang terpisah dari transaksi. | game-inventori §8 |
| **Akses Terbatas** | Status sementara bila ≥70% sudah dibayar, sebelum lunas penuh. | game-inventori §5.2 |
| **Refund** | Pengembalian dana ke customer. | game-inventori §5.5, §5.6 |
| **Trade-in** | Deal tukar tambah (akun customer + uang). | game-inventori §6 |
| **Ledger** | Catatan keuangan internal (tidak untuk customer). | game-inventori §4.F, §9 |
| **Rekening** | Metode pembayaran rekening (QRIS, e-wallet, dll). | game-inventori §9 |
| **Nota / Invoice** | Bukti transaksi untuk customer (bukan pengganti ledger). | game-inventori §12 |
