# Fitur: Isolasi Data & Visibilitas Komponen
**Oleh: Nailah Rasya (NR)**

Dokumen ini menjelaskan implementasi fitur yang memastikan data hanya dapat diakses oleh pemiliknya dan elemen antarmuka hanya muncul bagi pengguna yang berwenang.

## 📋 Fitur yang Dikerjakan

### 1. Isolasi Dashboard Freelancer
Memastikan bahwa seorang Freelancer hanya dapat melihat proyek dan data yang memang ditugaskan kepada mereka.
- **Tujuan**: Menjaga kerahasiaan data antar freelancer dan efisiensi informasi di dashboard.

### 2. Visibilitas Tombol "Upload Bukti"
Mengontrol kemunculan tombol aksi pengunggahan bukti kerja agar hanya muncul di sisi Freelancer.
- **Tujuan**: Menghindari kebingungan Klien dan memastikan alur kerja sesuai dengan tanggung jawab masing-masing peran.

---

## 🛠️ Cara Implementasi di Next.js & Supabase

### 1. Filter Data di Sisi Server (Isolasi)
Saat mengambil data dari database, kita selalu menyertakan filter berdasarkan ID pengguna yang sedang login.

```typescript
// services/projectService.ts
export const getMyProjects = async (userId: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('freelancer_id', userId); // Hanya ambil proyek milik freelancer ini

  return { data, error };
};
```

### 2. Visibilitas UI Berdasarkan Peran
Di dalam halaman detail milestone, kita melakukan pengecekan role sebelum merender tombol upload.

```tsx
// components/MilestoneDetails.tsx
export default function MilestoneDetails({ role }) {
  return (
    <div className="card">
      <h2>Detail Milestone</h2>
      
      {/* Tombol hanya dirender jika role adalah freelancer */}
      {role === 'freelancer' && (
        <button className="btn-primary">
          Upload Bukti Pekerjaan
        </button>
      )}
    </div>
  );
}
```

---
> [!IMPORTANT]
> Selain menyembunyikan tombol di UI, pastikan API yang menangani proses upload juga memvalidasi bahwa pengirim data memang memiliki role 'freelancer' untuk keamanan ekstra (Double-gate validation).
