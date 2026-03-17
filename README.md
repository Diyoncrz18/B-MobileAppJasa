# SmartEco Service Backend

Backend API untuk aplikasi SmartEco Service yang dibangun dengan Express dan Supabase PostgreSQL. Backend ini menangani autentikasi, katalog layanan, order, chat, notifikasi, partner application, serta dashboard admin untuk aplikasi mobile.

## Tools dan Teknologi yang Digunakan

- Node.js
- Express.js
- Supabase PostgreSQL
- Supabase JavaScript SDK
- dotenv
- cors
- nodemon

## Langkah Instalasi

### 1. Prasyarat

Sebelum instalasi, pastikan sudah tersedia:

- Node.js 18 atau versi terbaru yang kompatibel
- npm
- Project Supabase aktif
- Akses ke Supabase SQL Editor

### 2. Install dependency

```bash
npm install
```

### 3. Buat file environment

Buat file `.env` di folder `backend-mobile`, lalu isi:

```env
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Jalankan struktur database

Project ini menyimpan skema database pada file:

```text
src/db/migration.sql
```

Cara yang paling aman:

1. Buka Supabase Dashboard.
2. Masuk ke `SQL Editor`.
3. Copy isi `src/db/migration.sql`.
4. Jalankan query tersebut sampai seluruh tabel berhasil dibuat.

### 5. Isi data awal

Setelah tabel selesai dibuat, jalankan:

```bash
npm run db:seed
```

Seed akan membuat data contoh, termasuk akun berikut:

- Admin: `admin@gmail.com` / `admin123`
- User: `user@gmail.com` / `user123`

## Penjelasan Struktur Proyek

```text
backend-mobile/
├── src/
│   ├── config/              # Koneksi Supabase
│   ├── db/                  # Migration SQL, seed, dan data awal
│   ├── middleware/          # Middleware auth/token
│   ├── routes/              # Seluruh endpoint API
│   └── server.js            # Entry point Express app
├── package.json             # Dependency dan script backend
└── package-lock.json
```

Keterangan modul utama:

- `src/server.js`: konfigurasi server, middleware, health check, dan registrasi route.
- `src/config/supabase.js`: inisialisasi client Supabase admin dan public.
- `src/routes/auth.js`: register, login, me, logout.
- `src/routes/services.js`: kategori layanan, daftar layanan, detail layanan, provider.
- `src/routes/orders.js`: diagnosis, order, tracking, pembayaran, review.
- `src/routes/chat.js`: thread chat dan pesan.
- `src/routes/misc.js`: notifikasi, edukasi, metode pembayaran, partner application.
- `src/routes/admin.js`: dashboard admin, verifikasi mitra, komplain, dan data user.
- `src/db/seed.js`: seed data awal proyek SmartEco.

## Cara Menjalankan Aplikasi

### Menjalankan server development

```bash
npm run dev
```

### Menjalankan server production/local biasa

```bash
npm start
```

Server akan berjalan di:

```text
http://localhost:3000
```

Endpoint pengecekan cepat:

- `GET /health`
- `GET /api/meta`

## Script yang Tersedia

```bash
npm start
npm run dev
npm run db:seed
```

## Ringkasan API

Backend ini menyediakan endpoint untuk:

- Auth user dan admin
- Service categories, services, dan providers
- Diagnosis, order, tracking, payment, dan review
- Chat dan notifikasi
- Education content dan payment methods
- Partner application
- Dashboard admin, komplain, verifikasi partner, dan daftar user

## Dokumentasi Teknis

Dokumentasi teknis backend tersedia di folder `docs`:

- [Backend docs index](docs/README.md)
- [Backend technical documentation](docs/technical-documentation.md)
