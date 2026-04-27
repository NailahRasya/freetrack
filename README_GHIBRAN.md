# Fitur: Notifikasi & Penanganan Error
**Oleh: Ghibran (GA)**

Dokumen ini menjelaskan implementasi sistem umpan balik (feedback) dan pesan error untuk memastikan pengguna memahami apa yang terjadi saat terjadi kesalahan input atau kegagalan sistem.

## 📋 Fitur yang Dikerjakan

### 1. Pesan Error Kredensial Salah
Menampilkan pesan peringatan yang jelas ketika pengguna memasukkan email atau password yang tidak valid saat login.
- **Tujuan**: Memberikan informasi yang tepat kepada pengguna agar mereka tahu mengapa proses login gagal.

---

## 🛠️ Cara Implementasi di Next.js

### 1. Penanganan Error dari Supabase
Saat memanggil fungsi `signInWithPassword`, Supabase mengembalikan objek `error`. Kita menangkap pesan ini dan menampilkannya kepada pengguna.

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

if (error) {
  // Menampilkan pesan error spesifik dari server
  setErrorMessage(error.message); 
  // Contoh: "Invalid login credentials"
}
```

### 2. UI Feedback (Menggunakan SweetAlert2 / Toast)
Sesuai dengan stack teknologi proyek, kita bisa menggunakan library notifikasi untuk tampilan yang lebih premium.

```typescript
import Swal from 'sweetalert2';

if (error) {
  Swal.fire({
    title: 'Login Gagal',
    text: error.message,
    icon: 'error',
    confirmButtonColor: '#3085d6',
    background: '#1a1a1a',
    color: '#ffffff'
  });
}
```

---
> [!TIP]
> Selalu berikan pesan yang membantu namun tetap aman. Hindari memberikan informasi terlalu spesifik seperti "Email ini tidak terdaftar" untuk mencegah teknik *enumeration* oleh pihak tidak bertanggung jawab. Cukup gunakan "Email atau Password salah".
