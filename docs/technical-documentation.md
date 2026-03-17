# Backend Technical Documentation

## Gambaran Umum

`backend-mobile` adalah API server berbasis Express.js yang menangani autentikasi, katalog layanan, diagnosis, order, chat, notifikasi, partner application, dan dashboard admin. Backend ini terhubung ke Supabase Auth untuk verifikasi token dan Supabase PostgreSQL untuk penyimpanan data aplikasi.

## Diagram Alur Sistem Backend

```mermaid
flowchart TD
    A[Client mengirim request ke backend] --> B{Endpoint publik atau terproteksi?}
    B -- Publik --> C[Express route menerima request]
    B -- Terproteksi --> D[Middleware verifyToken atau optionalAuth]
    D --> E[Supabase Auth verifikasi bearer token]
    E --> F[req.user diisi dengan id, authUid, email, role]
    F --> C
    C --> G[Route module memvalidasi payload]
    G --> H[Business logic per fitur]
    H --> I[Supabase PostgreSQL]
    I --> J[Data hasil query atau update]
    J --> K[Backend bentuk response JSON]
    K --> L[Client menerima response]
```

## ERD / Model Data

```mermaid
erDiagram
    USERS {
        int id PK
        uuid auth_uid UK
        text full_name
        text email UK
        text phone
        text role
        text status
        timestamptz created_at
    }

    ADDRESSES {
        int id PK
        int user_id FK
        text label
        text address_line
        text city
        text province
        text postal_code
        boolean is_primary
    }

    SERVICE_CATEGORIES {
        int id PK
        text slug UK
        text title
        text description
        text icon
        text eco_score
        text tone
        text price_label
    }

    SERVICES {
        int id PK
        int category_id FK
        text slug UK
        text title
        text description
        text about
        text duration
        text price
        text eco_score
    }

    PROVIDERS {
        int id PK
        text full_name
        text company
        text address
        text rating
        text eta
        boolean is_recommended
    }

    PROVIDER_SERVICES {
        int id PK
        int provider_id FK
        int service_id FK
    }

    DIAGNOSES {
        int id PK
        int user_id FK
        int service_id FK
        text title
        text problem_description
        text urgency
        timestamptz scheduled_at
        timestamptz created_at
    }

    ORDERS {
        int id PK
        text code UK
        int user_id FK
        int service_id FK
        int provider_id FK
        int address_id FK
        int diagnosis_id FK
        text status
        timestamptz scheduled_at
        int total_estimate
        int total_final
        text payment_method
        timestamptz created_at
    }

    ORDER_TRACKING_EVENTS {
        int id PK
        int order_id FK
        text status
        text label
        text description
        timestamptz happened_at
        int sort_order
    }

    PAYMENTS {
        int id PK
        int order_id FK
        text method
        int amount
        text status
        timestamptz paid_at
    }

    REVIEWS {
        int id PK
        int order_id FK
        int service_id FK
        int provider_id FK
        int user_id FK
        int overall_rating
        text review_text
        timestamptz created_at
    }

    PARTNER_APPLICATIONS {
        int id PK
        text full_name
        text phone
        text area
        text field
        text experience
        text status
        timestamptz created_at
    }

    COMPLAINTS {
        int id PK
        text user_name
        text title
        text complaint
        text service
        text vendor
        text priority
        text status
        timestamptz created_at
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        text type
        text title
        text body
        boolean is_read
        timestamptz created_at
    }

    EDUCATION_CONTENTS {
        int id PK
        text category
        text title
        text body
        text icon
        text tone
    }

    PAYMENT_METHODS {
        int id PK
        text code UK
        text label
        text description
    }

    CHAT_THREADS {
        int id PK
        text title
        text label
        text description
        text time_label
        int unread_count
        boolean pinned
    }

    CHAT_MESSAGES {
        int id PK
        int thread_id FK
        text sender_role
        text body
        timestamptz sent_at
    }

    USERS ||--o{ ADDRESSES : has
    USERS ||--o{ DIAGNOSES : creates
    USERS ||--o{ ORDERS : places
    USERS ||--o{ REVIEWS : writes
    USERS ||--o{ NOTIFICATIONS : receives
    SERVICE_CATEGORIES ||--o{ SERVICES : groups
    SERVICES ||--o{ DIAGNOSES : referenced_by
    SERVICES ||--o{ ORDERS : ordered_as
    SERVICES ||--o{ REVIEWS : reviewed_as
    PROVIDERS ||--o{ PROVIDER_SERVICES : offers
    SERVICES ||--o{ PROVIDER_SERVICES : linked_to
    PROVIDERS ||--o{ ORDERS : handles
    PROVIDERS ||--o{ REVIEWS : reviewed_on
    ADDRESSES ||--o{ ORDERS : used_for
    DIAGNOSES ||--o{ ORDERS : optional_source
    ORDERS ||--o{ ORDER_TRACKING_EVENTS : tracks
    ORDERS ||--o{ PAYMENTS : paid_by
    ORDERS ||--o{ REVIEWS : reviewed_with
    CHAT_THREADS ||--o{ CHAT_MESSAGES : contains
```

## Diagram Arsitektur Sistem Backend

```mermaid
flowchart LR
    A[Mobile Client] --> B[Express Server]
    B --> C[Auth Middleware]
    B --> D[Route Modules]
    D --> E[Supabase Admin Client]
    C --> F[Supabase Auth]
    E --> G[Supabase PostgreSQL]
```

## API Dokumentasi

### Base URL

```text
http://localhost:3000
```

### Health dan metadata

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/health` | Health check backend |
| GET | `/api/meta` | Metadata backend |

### Auth

| Method | Endpoint | Auth | Fungsi |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Registrasi user |
| POST | `/api/auth/login` | No | Login user atau admin |
| GET | `/api/auth/me` | Bearer | Ambil profil user aktif |
| PATCH | `/api/auth/profile` | Bearer | Ubah profil user |
| POST | `/api/auth/change-password` | Bearer | Ganti password |
| POST | `/api/auth/logout` | Bearer | Logout |

### Services

| Method | Endpoint | Auth | Fungsi |
| --- | --- | --- | --- |
| GET | `/api/service-categories` | No | Daftar kategori layanan |
| GET | `/api/services` | No | Daftar layanan |
| GET | `/api/services/:slug` | No | Detail layanan |
| GET | `/api/services/:slug/providers` | No | Provider per layanan |

### Orders dan diagnosis

| Method | Endpoint | Auth | Fungsi |
| --- | --- | --- | --- |
| POST | `/api/diagnoses` | Optional Bearer | Buat diagnosis |
| GET | `/api/orders` | Optional Bearer | Daftar order |
| GET | `/api/orders/:id` | No | Detail order |
| GET | `/api/orders/:id/tracking` | No | Tracking order |
| POST | `/api/orders` | Optional Bearer | Buat order |
| POST | `/api/orders/:id/payments/confirm` | No | Konfirmasi pembayaran |
| POST | `/api/orders/:id/reviews` | Optional Bearer | Kirim review |

### Chat dan konten pendukung

| Method | Endpoint | Auth | Fungsi |
| --- | --- | --- | --- |
| GET | `/api/chat/threads` | No | Ambil thread chat |
| GET | `/api/chat/threads/:id/messages` | No | Ambil pesan chat |
| POST | `/api/chat/threads/:id/messages` | No | Kirim pesan chat |
| GET | `/api/notifications` | Optional Bearer | Ambil notifikasi |
| PATCH | `/api/notifications/:id/read` | No | Tandai notifikasi dibaca |
| GET | `/api/education` | No | Ambil konten edukasi |
| GET | `/api/payment-methods` | No | Ambil metode pembayaran |
| GET | `/api/partner-applications` | No | Daftar partner application |
| POST | `/api/partner-applications` | No | Kirim partner application |

### Admin

Semua endpoint admin membutuhkan bearer token dengan role `admin`.

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| GET | `/api/admin/dashboard` | Statistik dashboard admin |
| GET | `/api/admin/partner-applications` | Daftar partner application |
| POST | `/api/admin/partner-applications/:id/approve` | Approve partner |
| POST | `/api/admin/partner-applications/:id/reject` | Reject partner |
| GET | `/api/admin/complaints` | Daftar komplain |
| POST | `/api/admin/complaints/:id/process` | Proses komplain |
| GET | `/api/admin/users` | Daftar user |
| GET | `/api/admin/users/:id` | Detail user |
