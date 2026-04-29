# Fitur: Sistem Autentikasi & Pemulihan Akun
**Oleh: Eko Muhammad (E)**

Dokumen ini menjelaskan implementasi sistem login dan fitur "Lupa Password" yang menjadi pintu utama keamanan aplikasi FreeTrack.

## 📋 Fitur yang Dikerjakan

### 1. Login dengan Email & Password
Memungkinkan pengguna untuk masuk ke dalam platform menggunakan kredensial yang sudah terdaftar.
- **Tujuan**: Memberikan akses aman ke data pribadi dan proyek pengguna.

### 2. Fitur "Lupa Password" via Email
Menyediakan alur bagi pengguna untuk mereset kata sandi mereka jika lupa, melalui link yang dikirimkan ke email.
- **Tujuan**: Memastikan pengguna tidak kehilangan akses ke akun mereka secara permanen.

---

## 🛠️ Cara Implementasi di Next.js & Supabase

### 1. Proses Login (Client Side)
Menggunakan library `@supabase/supabase-js` untuk melakukan autentikasi langsung ke server Supabase.

```typescript
// components/LoginForm.tsx
import { supabase } from '@/lib/supabase';

const handleLogin = async (e) => {
  e.preventDefault();
  const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    alert(error.message); // Pesan error jika kredensial salah
  } else {
    router.push('/dashboard');
  }
};
```

### 2. Alur Lupa Password
Fitur ini melibatkan pengiriman email instruksi reset password.

```typescript
// components/ForgotPassword.tsx
const handleReset = async () => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/update-password`,
  });

  if (error) {
    console.error(error);
  } else {
    alert("Cek email Anda untuk link reset password!");
  }
};
```

Di halaman `/auth/update-password`, user dapat memasukkan password baru menggunakan:
```typescript
await supabase.auth.updateUser({ password: newPassword });
```

---
> [!TIP]
> Gunakan validasi input di sisi client menggunakan library seperti `Zod` atau `React Hook Form` untuk memberikan pengalaman pengguna yang lebih responsif sebelum data dikirim ke server.
