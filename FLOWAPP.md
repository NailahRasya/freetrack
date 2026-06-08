# FLOWAPP.md — Dokumentasi Alur Aplikasi FreeTrack

> **FreeTrack** adalah platform manajemen freelance berbasis Next.js + Supabase yang menghubungkan **Klien** dan **Freelancer** dengan sistem kontrak digital, milestone terstruktur, dan pembayaran DP yang transparan.

---

## Daftar Isi

1. [Arsitektur Umum](#1-arsitektur-umum)
2. [Flow 1 — Landing Page & Splash Screen](#2-flow-1--landing-page--splash-screen)
3. [Flow 2 — Onboarding (Pemilihan Role & Pengisian Data Awal)](#3-flow-2--onboarding)
4. [Flow 3 — Registrasi Akun](#4-flow-3--registrasi-akun)
5. [Flow 4 — Login](#5-flow-4--login)
6. [Flow 5 — Auth Callback & Session Setup](#6-flow-5--auth-callback--session-setup)
7. [Flow 6 — Dashboard Layout & Session Guard](#7-flow-6--dashboard-layout--session-guard)
8. [Flow 7 — Dashboard Klien](#8-flow-7--dashboard-klien)
9. [Flow 8 — Dashboard Freelancer](#9-flow-8--dashboard-freelancer)
10. [Flow 9 — Inisiasi Kontrak oleh Freelancer](#10-flow-9--inisiasi-kontrak-oleh-freelancer)
11. [Flow 10 — Review & Persetujuan Kontrak oleh Klien](#11-flow-10--review--persetujuan-kontrak-oleh-klien)
12. [Flow 11 — Freelancer Membuat Milestone](#12-flow-11--freelancer-membuat-milestone)
13. [Flow 12 — Klien Melihat & Membayar DP Milestone](#13-flow-12--klien-melihat--membayar-dp-milestone)
14. [Status Lifecycle Milestone](#14-status-lifecycle-milestone)
15. [Diagram Alur Keseluruhan](#15-diagram-alur-keseluruhan)
16. [Flow Khusus: Bagaimana Klien Menemukan Freelancer](#16-flow-khusus-bagaimana-klien-menemukan-freelancer)
17. [Flow Khusus: Bagaimana Freelancer Menemukan Klien & Proyek](#17-flow-khusus-bagaimana-freelancer-menemukan-klien--proyek)
18. [Rekomendasi Best Practice untuk Peningkatan Flow](#18-rekomendasi-best-practice-untuk-peningkatan-flow)

---

## 1. Arsitektur Umum

| Lapisan | Teknologi |
|---|---|
| Framework | Next.js (App Router) |
| Auth & Database | Supabase (PostgreSQL + Auth) |
| State Management | React Context (`UserContext`) + Custom Hooks |
| Styling | Vanilla CSS + Inline Styles |
| Animasi | Framer Motion |
| Notifikasi | SweetAlert2 |
| Ikon | Lucide React |

**Tabel Database Utama:**

| Tabel | Fungsi |
|---|---|
| `profiles` | Data profil pengguna (nama, role) |
| `onboarding_freelancer` | Data preferensi freelancer dari onboarding |
| `onboarding_client` | Data preferensi klien dari onboarding |
| `projects` | Data proyek yang diposting klien |
| `contracts` | Data kontrak digital antara freelancer & klien |
| `milestones` | Tahapan pengerjaan proyek beserta status & nilai |
| `messages` | Pesan antar pengguna per proyek |
| `contacts` | Relasi/koneksi antara freelancer & klien |

---

## 2. Flow 1 — Landing Page & Splash Screen

**File Terkait:** `app/page.tsx`, `app/components/SplashScreen.tsx`, `app/components/Navbar.tsx`

### Urutan Kejadian

```
Pengguna buka "/" (root)
  │
  ├─► SplashScreen ditampilkan (3 detik)
  │     └── Animasi logo FreeTrack
  │
  └─► Setelah 3 detik, konten utama muncul dengan animasi fade-in
        ├── Navbar (dengan tombol "Masuk" dan "Daftar")
        ├── HeroSection (CTA utama)
        ├── FeaturesSection (fitur platform)
        ├── HowItWorksSection (cara kerja)
        ├── DashboardSection (preview UI)
        ├── TestimonialsSection (testimoni pengguna)
        ├── FAQSection (pertanyaan umum)
        └── Footer
```

### Navigasi dari Landing Page
- Klik **"Mulai Sekarang"** / **"Daftar"** → `/onboarding`
- Klik **"Masuk"** → `/login?role=client` atau `/login?role=freelancer`

---

## 3. Flow 2 — Onboarding

**File Terkait:** `app/onboarding/page.tsx`, `app/components/onboarding/`

Onboarding adalah proses **pengumpulan preferensi sebelum registrasi**. Ada dua jalur berdasarkan role yang dipilih.

### Tampilan Awal (Greeting Screen)
Saat pengguna pertama kali membuka `/onboarding`, muncul animasi selamat datang selama 3 detik (menggunakan Framer Motion), lalu form step-by-step tampil.

---

### 3a. Jalur Onboarding — CLIENT (3 Step)

| Step | Komponen | Isi |
|---|---|---|
| Step 1 | `ClientStep1Categories.tsx` | Pilih kategori bisnis / kebutuhan proyek (min. 1) |
| Step 2 | `ClientStep2Preferences.tsx` | Pilih skala bisnis, tipe kerja, preferensi pengalaman freelancer |
| Step 3 | `ClientStep3AuthGate.tsx` | Ringkasan + CTA: **Daftar** atau **Masuk** |

**Validasi per step:**
- Step 1: Wajib pilih minimal 1 kategori
- Step 2: `businessScale`, `workType`, `experiencePreference` wajib diisi

### 3b. Jalur Onboarding — FREELANCER (4 Step)

| Step | Komponen | Isi |
|---|---|---|
| Step 1 | `FreelancerStep1Skills.tsx` | Pilih kategori skill (mis: UI/UX, Backend, Mobile) |
| Step 2 | `FreelancerStep2WorkPreferences.tsx` | Pilih skala klien yang diinginkan & tipe kerjasama |
| Step 3 | `FreelancerStep3ProfileForm.tsx` | Pilih level pengalaman (Junior/Mid/Senior) + tahun pengalaman |
| Step 4 | `FreelancerStep4AuthGate.tsx` | Ringkasan profil + CTA: **Daftar** atau **Masuk** |

**Validasi per step:**
- Step 2: Wajib pilih min. 1 skala klien & tipe kerjasama
- Step 3: Level Junior maks 2 tahun; Mid 2–5 tahun; Senior min 5 tahun

### Data Onboarding

Data disimpan secara sementara di `useOnboardingStore` (state in-memory), lalu diteruskan ke halaman registrasi melalui URL parameter saat pengguna memilih **"Daftar"** di step terakhir.

Setelah akun terbuat, data onboarding akan disimpan ke tabel `onboarding_freelancer` atau `onboarding_client` di Supabase.

---

## 4. Flow 3 — Registrasi Akun

**File Terkait:** `app/register/page.tsx`

### Form Registrasi

| Field | Validasi |
|---|---|
| Nama Lengkap | Wajib diisi |
| Alamat Email | Format email valid |
| Password | Minimal 8 karakter (ada indikator kekuatan: Sangat Lemah → Sangat Kuat) |
| Konfirmasi Password | Harus sama persis dengan password |
| Checkbox Syarat & Ketentuan | Wajib dicentang |

### Proses Registrasi

```
User isi form → Klik "Buat Akun"
  │
  ├─► Validasi sisi klien
  │
  ├─► supabase.auth.signUp({ email, password, options: { data: { full_name, role } } })
  │     └── emailRedirectTo: /auth/callback?role={role}
  │
  ├─► Sukses → SweetAlert "Pendaftaran Berhasil" → redirect ke /login?role={role}
  │
  └─► Gagal → SweetAlert error
```

> Role (client/freelancer) ditentukan dari parameter URL `?role=` yang berasal dari halaman onboarding.

---

## 5. Flow 4 — Login

**File Terkait:** `app/login/page.tsx`, `app/api/auth/login/`

### Proses Login

```
User isi email + password → Klik "Masuk ke Akun"
  │
  ├─► Validasi format email & panjang password
  │
  ├─► POST /api/auth/login { email, password, role }
  │     └── Server memvalidasi role sesuai database (role check)
  │
  ├─► Respons sukses:
  │     ├── supabase.auth.setSession({ access_token, refresh_token })
  │     ├── SweetAlert "Selamat datang! 👋"
  │     └── Redirect ke /dashboard/client atau /dashboard/freelancer
  │
  └─► Respons gagal:
        ├── "Invalid login credentials" → tawaran daftar baru
        └── Error lain → SweetAlert error
```

**Fitur tambahan:**
- Toggle visibilitas password (show/hide)
- Link ke `/forgot-password`
- Switch role: "Bukan Client? Masuk sebagai Freelancer" (vice versa)
- Tampilan UI berbeda per role: Client = biru-cyan, Freelancer = hijau-cyan

---

## 6. Flow 5 — Auth Callback & Session Setup

**File Terkait:** `app/auth/callback/`

Setelah registrasi, Supabase mengirim email verifikasi. Setelah pengguna klik link di email, mereka diarahkan ke `/auth/callback?role={role}`. Halaman ini:

1. Mengambil token dari URL
2. Menukarnya dengan session aktif di Supabase
3. Menyimpan data onboarding ke database
4. Mengarahkan ke dashboard sesuai role

---

## 7. Flow 6 — Dashboard Layout & Session Guard

**File Terkait:** `app/dashboard/layout.tsx`

### Session Guard

Setiap kali halaman dashboard dimuat, layout melakukan:

```
supabase.auth.getUser()
  │
  ├─► User ada → fetch profile dari tabel "profiles"
  │     ├─► Jika freelancer: ambil skill dari onboarding_freelancer
  │     ├─► Jika client: ambil skill dari onboarding_client
  │     └─► Set UserContext dengan { user, role, profile }
  │
  └─► User tidak ada → redirect ke /login
```

### Struktur Layout Dashboard

```
DashboardLayout
  ├── DashboardSidebar (navigasi kiri, collapsible)
  │     ├── Menu: Dashboard, Proyek, Milestone, Pesan, Pembayaran, Kontak, Profil, Pengaturan
  │     └── Tombol collapse
  │
  └── Main Content
        ├── DashboardNavbar (atas: search, notifikasi, language toggle, avatar)
        └── {children} (halaman spesifik per route)
```

**Context yang disediakan:**
- `useUser()` → `{ user, role, loading, language, t }`
- `useSidebar()` → `{ collapsed, setCollapsed }`

---

## 8. Flow 7 — Dashboard Klien

**File Terkait:** `app/dashboard/client/page.tsx`

### Komponen di Dashboard Klien

| Komponen | Fungsi |
|---|---|
| `OnboardingWelcomeBanner` | Banner selamat datang (muncul saat pertama kali) |
| `StatsCards` | Statistik ringkasan: proyek aktif, milestone selesai, dll |
| `ProgressTrackerCard` | Progress bar proyek aktif saat ini |
| `PaymentTracker` | Status pembayaran |
| `RecommendedFreelancers` | Rekomendasi freelancer berdasarkan preferensi onboarding |
| `ProjectMarketFeed` | Daftar proyek yang diposting klien |
| `ActiveProjects` | Proyek yang sedang berjalan |
| `MessagesPreview` | Preview pesan terbaru |
| `ActivityTimeline` | Timeline aktivitas proyek |

---

## 9. Flow 8 — Dashboard Freelancer

**File Terkait:** `app/dashboard/freelancer/page.tsx`

### Komponen di Dashboard Freelancer

| Komponen | Fungsi |
|---|---|
| `OnboardingWelcomeBanner` | Banner selamat datang |
| `FreelancerStatsCards` | Statistik: pendapatan, proyek aktif, dll |
| `ProgressTrackerCard` | Progress milestone proyek aktif |
| `PaymentTracker` | Status tagihan / pembayaran |
| `ProjectMarketFeed` | Feed proyek tersedia di marketplace |
| `MilestoneManager` | Pengelolaan milestone proyek aktif |
| `MessagesPreview` | Preview pesan |
| `ActivityTimeline` | Timeline aktivitas |
| **"Scope Creep Terdeteksi?"** Card | Tombol **"Ajukan Permintaan Perubahan"** (membuka `ChangeRequestModal`) |

---

## 10. Flow 9 — Inisiasi Kontrak oleh Freelancer

**File Terkait:** `app/components/dashboard/ContractInitiationModal.tsx`

Setelah freelancer dan klien bersepakat (via chat di `/dashboard/messages`), freelancer menginisiasi kontrak digital.

### Alur Inisiasi Kontrak (3 Step)

```
Freelancer klik "Inisiasi Kontrak" dari halaman proyek
  │
  ├── STEP 1: Isi Ringkasan Inisiasi
  │     ├── Ringkasan Pendahuluan (textarea)
  │     └── Deliverables / Hasil Akhir (textarea)
  │
  ├── STEP 2: Perencanaan Milestone
  │     ├── Daftar milestone dengan: Nama, Anggaran (IDR), Deadline, Deskripsi
  │     └── Tombol "+ Tambah" untuk milestone baru
  │
  └── STEP 3: Timeline & Pembayaran
        ├── Estimasi timeline (mis: "4 Minggu")
        ├── Rincian pembayaran (mis: "30% DP, 40% tengah, 30% final")
        └── Ringkasan: Total milestone & Total Anggaran
              └── Klik "Kirim Proposal Kontrak"
```

### Yang Terjadi di Database (saat submit)

```sql
-- 1. Insert record kontrak
INSERT INTO contracts (project_id, freelancer_id, client_id, ..., status: 'pending')

-- 2. Insert semua milestone
INSERT INTO milestones (..., status: 'Contract Pending')

-- 3. Update status proyek
UPDATE projects SET status = 'contract_pending', contract_id = ..., freelancer_id = ...

-- 4. Kirim notifikasi via pesan
INSERT INTO messages (content: "Saya telah mengirimkan proposal kontrak...")
```

---

## 11. Flow 10 — Review & Persetujuan Kontrak oleh Klien

**File Terkait:** `app/components/dashboard/ContractReviewModal.tsx`

Klien menerima notifikasi dan membuka `ContractReviewModal` untuk meninjau proposal.

### Konten Review

- **Ringkasan Inisiasi**: Detail pendekatan freelancer
- **Rencana Milestone**: Grid semua milestone + anggaran per milestone
- **Deliverables**: Apa saja yang akan diterima klien
- **Timeline & Pembayaran**: Estimasi waktu dan skema pembayaran
- **Total Investasi Proyek**: Jumlah semua anggaran milestone

### Keputusan Klien

```
Klien review kontrak
  │
  ├─► Klik "Setujui Kontrak"
  │     ├── contracts.status = 'approved', locked = true
  │     ├── projects.status = 'active'
  │     ├── milestones.status = 'In Progress' (semua yg 'Contract Pending')
  │     ├── Kirim pesan notifikasi ke freelancer: "Kontrak disetujui!"
  │     └── SweetAlert sukses
  │
  └─► Klik "Kembalikan / Revisi"
        ├── contracts.status = 'rejected'
        ├── projects.status = 'pending_freelancer'
        ├── DELETE milestones yg masih 'Contract Pending'
        ├── Kirim pesan notifikasi ke freelancer: "Ada yang perlu disesuaikan"
        └── SweetAlert info
```

---

## 12. Flow 11 — Freelancer Membuat Milestone

**File Terkait:**
- `app/components/dashboard/freelancer/MilestoneManager.tsx`
- `app/components/dashboard/freelancer/CreateMilestoneModal.tsx`
- `app/dashboard/milestones/page.tsx`
- `app/api/milestones/`

Selain melalui inisiasi kontrak, freelancer juga dapat membuat milestone secara langsung dari **Dashboard** atau halaman **Target Pencapaian** (`/dashboard/milestones`).

### Cara Akses

1. **Dari Dashboard Freelancer**: Komponen `MilestoneManager` tampil langsung di halaman utama
2. **Dari Halaman Milestone** (`/dashboard/milestones`): Halaman khusus dengan selector klien & proyek

### Langkah Membuat Milestone

```
Freelancer klik tombol "+ Buat Milestone"
  │
  └─► CreateMilestoneModal terbuka
        │
        ├── Pilih Klien (dropdown dari kontak terhubung)
        ├── Pilih Proyek (difilter berdasarkan klien yang dipilih)
        ├── Judul Milestone (wajib)
        ├── Nilai / Harga (IDR, format Rupiah otomatis)
        ├── Tenggat Waktu (date picker)
        └── Deskripsi Pengerjaan (textarea)
              │
              └── Klik "Kirim ke Klien"
```

### Yang Terjadi di Database (saat submit)

```
POST /api/milestones
  Body: { title, amount, deadline, description, project_id, status: "Menunggu DP" }

  Database:
  INSERT INTO milestones (
    title, amount, deadline, description,
    project_id, status = "Menunggu DP"
  )
```

> **Penting:** Milestone yang baru dibuat langsung berstatus **"Menunggu DP"**. Ini berarti klien HARUS membayar Down Payment sebelum freelancer dapat mulai mengerjakan milestone tersebut.

### Tampilan Milestone di MilestoneManager

Setiap milestone ditampilkan dengan:
- Judul & deskripsi singkat
- Nilai (harga) dan tenggat waktu
- **Badge status** (berwarna sesuai status)
- Aksi berdasarkan status:
  - `Menunggu DP` → Teks peringatan: "Unggahan terkunci sampai DP dibayar"
  - `In Progress` / status lain → Tombol **"Upload Bukti"**
  - `Disetujui` → Teks: "Selesai & Disetujui"

### Status Milestone yang Dapat Diedit/Dihapus

Freelancer HANYA dapat mengedit atau menghapus milestone yang belum dikunci. Milestone dengan status `Disetujui` atau `Menunggu Persetujuan` **terkunci** (ditandai ikon 🔒).

---

## 13. Flow 12 — Klien Melihat & Membayar DP Milestone

**File Terkait:**
- `app/dashboard/milestones/page.tsx` (view klien)
- `app/components/dashboard/milestones/ClientMilestoneCard.tsx`
- `app/dashboard/payments/page.tsx`

### Tampilan Klien di Halaman Milestone

Klien mengakses `/dashboard/milestones` dan melihat semua milestone proyek dalam format **grid kartu**.

Setiap `ClientMilestoneCard` menampilkan:
- Judul milestone
- **Badge status** (mis: "Menunggu DP", "Dalam Pengerjaan", "Menunggu Persetujuan", "Disetujui")
- **Badge payment status** ("Escrowed" atau "Released")
- Deadline
- Deskripsi (read-only)
- **Tombol aksi** sesuai status

### Logika Tombol Aksi di ClientMilestoneCard

```
Status Milestone          → Aksi yang Muncul
─────────────────────────────────────────────────
"Menunggu DP"             → [🟡 Bayar DP Sekarang] (link ke /dashboard/payments)
"In Progress"             → [⏳ Waiting for freelancer submission]
"Menunggu Persetujuan"    → [👁 Review Submission] + [👍 Approve]
"Disetujui"               → [✅ Milestone Approved] (tidak ada aksi)
```

### Alur Pembayaran DP

```
Klien lihat milestone berstatus "Menunggu DP"
  │
  └─► Klik "Bayar DP Sekarang"
        │
        └─► Diarahkan ke /dashboard/payments
              └─► Klien melakukan pembayaran DP
                    └─► Setelah dibayar, status milestone berubah
                          dari "Menunggu DP" → "In Progress"
```

> **Catatan:** Halaman `/dashboard/payments` adalah placeholder (`page.tsx` hanya 167 byte) yang menunjukkan fitur pembayaran masih dalam tahap pengembangan / integrasi payment gateway.

### Alur Setelah DP Dibayar

```
Milestone status: "In Progress"
  │
  ├─► Freelancer mengerjakan milestone
  │
  ├─► Freelancer klik "Upload Bukti" → UploadEvidenceModal
  │     └─► Upload file/link bukti penyelesaian
  │           └─► Status berubah → "Menunggu Persetujuan"
  │
  └─► Klien review bukti → Klik "Approve"
        └─► Status berubah → "Disetujui"
              └─► Pembayaran dilepas (Released) ke freelancer
```

---

## 14. Status Lifecycle Milestone

```
[Dibuat oleh Freelancer]
        │
        ▼
  "Menunggu DP"          ← Status awal saat milestone dibuat manual
        │
        │ (Klien bayar DP)
        ▼
  "In Progress"          ← Freelancer mulai mengerjakan
        │
        │ (Freelancer upload bukti)
        ▼
  "Menunggu Persetujuan" ← Klien harus review
        │
        ├──(Klien approve)──────────► "Disetujui" / "Approved" ✅
        │
        └──(Rejek/revisi)───────────► Kembali ke "In Progress"


[Dibuat melalui Inisiasi Kontrak]
        │
        ▼
  "Contract Pending"     ← Menunggu klien setujui kontrak
        │
        ├──(Klien setujui)──────────► "In Progress" (dilanjutkan dari atas)
        │
        └──(Klien tolak)────────────► Milestone dihapus
```

---

## 15. Diagram Alur Keseluruhan

```
Landing Page (/)
      │
      ├──────────────────────────────┐
      │                              │
      ▼                              ▼
/onboarding?role=client    /onboarding?role=freelancer
  [3 Step]                   [4 Step]
      │                              │
      ▼                              ▼
/register?role=client      /register?role=freelancer
  (Buat akun)                (Buat akun)
      │                              │
      └──────────┬───────────────────┘
                 │
                 ▼
         /auth/callback
         (Verifikasi email & simpan data onboarding)
                 │
                 ▼
          /login?role=...
          (Masuk dengan email + password)
                 │
          ┌──────┴──────┐
          │             │
          ▼             ▼
  /dashboard/client   /dashboard/freelancer
          │             │
          │             ├── MilestoneManager
          │             │     └── CreateMilestoneModal
          │             │           └── POST /api/milestones
          │             │                 └── status: "Menunggu DP"
          │             │
          │             └── ContractInitiationModal (3 Step)
          │                   └── Kirim kontrak ke klien
          │
          ├── ContractReviewModal
          │     ├── Setujui → milestones.status = "In Progress"
          │     └── Tolak   → milestones dihapus
          │
          └── /dashboard/milestones (ClientMilestoneCard)
                └── Milestone "Menunggu DP"
                      └── Klik "Bayar DP Sekarang"
                            └── /dashboard/payments
                                  └── DP Dibayar
                                        └── Milestone "In Progress"
                                              └── Freelancer Upload Bukti
                                                    └── "Menunggu Persetujuan"
                                                          └── Klien Approve
                                                                └── "Disetujui" ✅
```

---

## Catatan Pengembangan

| Fitur | Status |
|---|---|
| Landing Page | ✅ Selesai |
| Onboarding (Client & Freelancer) | ✅ Selesai |
| Registrasi & Login | ✅ Selesai |
| Auth Callback | ✅ Selesai |
| Dashboard Klien | ✅ Selesai |
| Dashboard Freelancer | ✅ Selesai |
| Inisiasi Kontrak (Freelancer) | ✅ Selesai |
| Review Kontrak (Klien) | ✅ Selesai |
| Buat Milestone (Freelancer) | ✅ Selesai |
| Tampilan Milestone (Klien) | ✅ Selesai |
| Tombol "Bayar DP" → /dashboard/payments | ✅ Routing ada |
| Integrasi Payment Gateway | 🔄 Dalam Pengembangan |
| Upload Bukti (Evidence Modal) | ✅ Selesai |
| Approve Milestone (Klien) | ✅ Selesai |
| Change Request Modal (Scope Creep) | ✅ Selesai |
| Lupa Password / Reset Password | ✅ Routing ada |

---

## 16. Flow Khusus: Bagaimana Klien Menemukan Freelancer

Sistem FreeTrack menyediakan dua cara utama bagi Klien untuk menemukan dan terhubung dengan Freelancer profesional:

### 16a. Pencocokan Otomatis (Auto-Matching Recommendations)
Saat Klien membuka Dashboard (`/dashboard/client`), sistem secara dinamis memuat komponen `RecommendedFreelancers.tsx` yang melakukan kalkulasi skor kecocokan secara real-time.
*   **Sumber Data**: 
    1. Preferensi yang diinput oleh klien saat proses onboarding (`onboarding_client`).
    2. Data profil freelancer (`profiles` dengan `role = 'freelancer'`).
    3. Preferensi kerja freelancer (`onboarding_freelancer`).
    4. Rating & reputasi freelancer (`reviews`).
*   **Algoritma Skoring**:
    *   **Level Pengalaman**: Jika level pengalaman freelancer cocok dengan preferensi klien → **+40 Poin**.
    *   **Tipe Kerjasama**: Jika tipe kerjasama pilihan klien (misal: Berkelanjutan) didukung oleh preferensi freelancer → **+30 Poin**.
    *   **Skala Bisnis**: Jika skala bisnis klien tercantum di daftar skala bisnis yang disukai freelancer → **+20 Poin**.
    *   **Keahlian & Tools**: Setiap tumpang tindih (overlap) antara keahlian yang dicari klien dengan daftar keahlian/tools freelancer → **+15 Poin per keahlian**.
*   **Aksi Diskusi**: Klien dapat langsung menekan tombol **"Mulai Diskusi"** pada salah satu profil rekomendasi. Tindakan ini memicu:
    1. Pembuatan relasi kontak baru secara otomatis di tabel `contacts` via hooks `ensureContact` dengan status `accepted`.
    2. Pengalihan halaman ke menu Pesan (`/dashboard/messages?chat={freelancer_id}`) untuk memulai diskusi secara instan.

### 16b. Publikasi Proyek Publik (Marketplace Job Postings)
Klien dapat mempublikasikan deskripsi kebutuhan kerja mereka ke marketplace umum:
1. Klien membuka modal pembuatan proyek dan mengisi informasi detail proyek (Kategori, Anggaran, Batas Waktu, Deskripsi, Tujuan, Hasil Akhir, Pertanyaan Penyaringan, dan Lampiran).
2. Klien menyimpan proyek dengan status **`published`** (atau mengubah status dari draf menjadi dipublikasikan).
3. Proyek ini masuk ke antrean marketplace umum yang dapat dijelajahi oleh seluruh freelancer.

---

## 17. Flow Khusus: Bagaimana Freelancer Menemukan Klien & Proyek

Freelancer menggunakan umpan marketplace (marketplace feed) untuk mencari pekerjaan dan bernegosiasi dengan klien:

### 17a. Menjelajahi Marketplace (`/dashboard/marketplace`)
Saat freelancer membuka menu **Marketplace**, sistem memuat umpan proyek aktif (`ProjectMarketFeed.tsx`) melalui API `/api/projects/market`.
*   **Penyaringan Sesuai Keahlian**: Secara otomatis, sistem mengurutkan daftar proyek berdasarkan kecocokan skor tertinggi dengan keahlian freelancer (memakai algoritma pencocokan yang sejenis dengan sisi klien).
*   **Tab Filter**:
    *   *Semua Proyek*: Menampilkan seluruh proyek dengan status `published`.
    *   *Sesuai Keahlian*: Menyaring dan hanya menampilkan proyek dengan kecocokan skor di atas ambang batas (`matchScore >= 50`).
    *   *Tersimpan*: Proyek yang dibookmark oleh freelancer (menggunakan state `localStorage` lokal `freetrack_saved_projects`).

### 17b. Proses Pengajuan Lamaran (Application Process)
Setelah freelancer menemukan proyek yang cocok:
1. Freelancer membuka halaman detail proyek di `/dashboard/marketplace/[projectId]`.
2. Jika ada kecocokan awal, freelancer dapat menekan tombol **"Ajukan Lamaran"** untuk membuka modal proposal.
3. Freelancer mengisi surat lamaran (Cover Letter) dan wajib menjawab seluruh Pertanyaan Penyaringan (Screening Questions) yang diajukan klien.
4. **Logika Duplikasi & Isolasi Lamaran (Database Level)**:
   *   Saat freelancer mengirim lamaran (`PATCH /api/projects`), endpoint `/api/projects/route.ts` mendeteksi bahwa proyek berstatus `published` dan belum memiliki freelancer.
   *   Sistem tidak langsung mengubah baris proyek asli menjadi milik freelancer. Alih-alih, sistem **membuat salinan baru (kloning)** dari baris proyek tersebut dengan:
       *   `freelancer_id` diisi ID freelancer pelamar.
       *   `status` disetel ke `pending_client`.
       *   `proposal_reason` diisi hasil gabungan Cover Letter dan jawaban screening.
       *   Tanda asal proyek disematkan di deskripsi dalam format tag `[source_id:{original_project_id}]`.
   *   Hal ini memungkinkan **banyak freelancer melamar proyek yang sama secara bersamaan**, masing-masing memiliki salinan negosiasi proyek sendiri yang terisolasi dengan klien.
5. **Notifikasi Chat Otomatis**: Setelah lamaran terkirim, pesan sambutan otomatis dikirimkan ke chatroom klien dan freelancer untuk memicu diskusi negosiasi lebih lanjut.
6. **Kesepakatan Akhir**: Jika klien menyetujui salah satu lamaran (status diubah ke `agreed` -> `active`), sistem (melalui Next.js API route admin bypass) otomatis menghapus postingan proyek asli di marketplace (menggunakan pencarian `source_id` di database) sehingga proyek tersebut tidak dapat dilamar lagi oleh freelancer lainnya.

---

## 18. Rekomendasi Best Practice untuk Peningkatan Flow

Untuk mengoptimalkan keandalan arsitektur dan kualitas pengalaman pengguna (UX) FreeTrack, berikut beberapa rekomendasi perbaikan berbasis best practices industri:

### 18a. Penggunaan Tabel Khusus Lamaran (`proposals` / `bids`)
*   **Kondisi Saat Ini**: Sistem menduplikasi baris di tabel `projects` setiap kali freelancer melamar pekerjaan. Hal ini menyebabkan polusi data pada tabel `projects` (banyak baris proyek duplikat dengan status `pending_client`), serta ketergantungan pada parsing string regex `[source_id:...]` untuk melacak asal proyek asli.
*   **Rekomendasi Best Practice**: Buat tabel `proposals` yang berdiri sendiri untuk memisahkan entitas pekerjaan dengan lamaran.
    ```sql
    CREATE TABLE proposals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        freelancer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        cover_letter TEXT NOT NULL,
        screening_answers JSONB, -- Menyimpan jawaban Q&A secara terstruktur
        proposed_budget NUMERIC,
        proposed_duration VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
    ```
    *Keuntungan*: Menjaga database tetap bersih, mempermudah penghapusan/penolakan lamaran secara otomatis jika salah satu lamaran diterima, dan mempermudah pelacakan histori penawaran harga.

### 18b. Alur Persetujuan Kontak yang Konsisten (Double-Opt-In)
*   **Kondisi Saat Ini**: Klien yang menekan tombol "Mulai Diskusi" pada rekomendasi otomatis secara instan memaksa pembentukan kontak dengan status `accepted` tanpa persetujuan dari freelancer. Namun, di sisi lain, freelancer harus melewati alur pengiriman permintaan kontak (`pending`) yang menunggu persetujuan klien.
*   **Rekomendasi Best Practice**: Terapkan alur masuk (inbox) permintaan pesan / permintaan diskusi. Diskusi awal dapat dilakukan di ruang pesan khusus "Permintaan", dan status koneksi kontak hanya menjadi `accepted` setelah kedua belah pihak secara sadar menekan tombol persetujuan atau ketika kontrak proyek pertama kali diinisiasi.

### 18c. Direktori Freelancer untuk Pencarian Klien (Freelancer Directory)
*   **Kondisi Saat Ini**: Klien tidak memiliki alat pencarian freelancer aktif. Klien sepenuhnya bergantung pada 4 rekomendasi acak yang ditampilkan di dashboard mereka.
*   **Rekomendasi Best Practice**: Sediakan halaman khusus **Direktori Freelancer** (`/dashboard/freelancers`) bagi Klien.
    *   Halaman ini menyediakan bilah pencarian nama/kata kunci keahlian.
    *   Sistem filter berdasarkan kategori keahlian, tarif per jam, tingkat pengalaman, lokasi, dan rating minimum.
    *   Hal ini memberi kendali penuh bagi klien untuk mencari dan mengundang freelancer secara proaktif ke draf proyek mereka.

### 18d. Antarmuka Manajemen Pelamar (Applicant Review Dashboard)
*   **Kondisi Saat Ini**: Klien melihat proyek yang dilamar oleh freelancer sebagai draf proyek terpisah di tab proyeknya. Klien tidak memiliki satu dasbor terpadu untuk membandingkan pelamar pada satu proyek tertentu.
*   **Rekomendasi Best Practice**: Pada detail proyek yang dipublikasikan oleh Klien, tampilkan tab khusus **"Pelamar & Proposal"** (Applicants).
    *   Menampilkan kartu ringkasan masing-masing freelancer pelamar (skor kecocokan, portofolio, rating, dan cover letter).
    *   Tombol aksi langsung: **[Hubungi / Chat]**, **[Tolak Proposal]**, atau **[Setujui & Buat Kontrak]**.
    *   Hal ini membuat proses penyeleksian jauh lebih efisien dan terorganisir.

---

*Dokumen ini di-generate berdasarkan analisis kode sumber FreeTrack pada 13 Mei 2026, dan diperbarui dengan panduan flow pencarian kerja serta rekomendasi arsitektur best practices.*

