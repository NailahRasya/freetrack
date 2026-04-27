# Fitur: Keamanan & Akses Kontrol (Role-Based Access)
**Oleh: Fitri Haerani (FH)**

Dokumen ini menjelaskan fitur keamanan dan pembatasan akses berdasarkan peran (Role-Based Access Control) yang diimplementasikan untuk memisahkan hak akses antara Klien dan Freelancer.

## 📋 Fitur yang Dikerjakan

### 1. Pembatasan Menu Edit Milestone
Klien dilarang mengakses atau melihat tombol/menu untuk mengedit milestone yang merupakan wewenang penuh Freelancer.
- **Tujuan**: Menjaga integritas data proyek agar hanya pihak penyedia jasa yang dapat mengatur tahapan kerja.

### 2. Redirect Akses Dashboard
Klien akan otomatis diarahkan kembali (redirect) jika mencoba mengakses halaman dashboard yang dikhususkan untuk Freelancer.
- **Tujuan**: Memastikan privasi data kerja Freelancer dan mencegah akses ke antarmuka yang tidak relevan bagi Klien.

---

## 🛠️ Cara Implementasi di Next.js & Supabase

### 1. Proteksi Halaman (Middleware)
Gunakan `middleware.ts` untuk memeriksa peran user di setiap request halaman dashboard.

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  // Ambil metadata role dari user
  const role = session?.user?.user_metadata?.role;

  // Jika klien mencoba masuk ke dashboard freelancer
  if (req.nextUrl.pathname.startsWith('/dashboard/freelancer') && role === 'client') {
    return NextResponse.redirect(new URL('/dashboard/client', req.url));
  }

  return res;
}
```

### 2. Kontrol Komponen (Conditional Rendering)
Di dalam komponen UI, kita melakukan pengecekan session untuk menyembunyikan elemen tertentu.

```tsx
// components/MilestoneItem.tsx
export default function MilestoneItem({ milestone, userRole }) {
  return (
    <div>
      <h3>{milestone.title}</h3>
      
      {/* Tombol edit hanya muncul jika user adalah freelancer */}
      {userRole === 'freelancer' && (
        <button onClick={() => handleEdit(milestone.id)}>
          Edit Milestone
        </button>
      )}
    </div>
  );
}
```

---
> [!IMPORTANT]
> Pastikan setiap API route yang melakukan update data juga memiliki pengecekan role di sisi server untuk mencegah manipulasi melalui tool seperti Postman.
