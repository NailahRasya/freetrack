# Fitur: Manajemen Sesi & Persistensi Login
**Oleh: Rifat Ali (RN)**

Dokumen ini menjelaskan bagaimana sesi login dijaga agar tetap aktif meskipun pengguna berpindah-pindah halaman atau menyegarkan (refresh) browser.

## 📋 Fitur yang Dikerjakan

### 1. Persistensi Sesi Login
Memastikan pengguna tidak perlu login berulang kali setiap kali membuka halaman baru dalam satu sesi browsing.
- **Tujuan**: Meningkatkan kenyamanan pengguna (User Experience) dan menjaga keamanan data selama navigasi.

---

## 🛠️ Cara Implementasi di Next.js & Supabase

### 1. Konfigurasi Client Supabase
Supabase Auth secara otomatis menyimpan token akses di dalam `localStorage` (untuk browser) atau `cookies` (untuk Server-Side Rendering/SSR).

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 2. Provider Sesi di App Router
Untuk memastikan seluruh aplikasi memiliki akses ke status login terbaru, kita menggunakan event listener dari Supabase.

```tsx
// context/AuthContext.tsx
'use client';
import { createContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Ambil sesi saat ini saat pertama kali load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Dengarkan perubahan status auth (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 3. Menggunakan Cookies untuk SSR
Dengan menggunakan helper `@supabase/ssr`, session akan disimpan di cookies sehingga server Next.js tahu siapa user-nya bahkan sebelum halaman di-render di browser.

---
> [!NOTE]
> Supabase menangani perpanjangan token (token refresh) secara otomatis di latar belakang selama user masih aktif berinteraksi dengan aplikasi.
