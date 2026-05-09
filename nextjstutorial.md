
Routing & Layout (Struktur Folder)

Next.js menggunakan **File-based Routing**. Artinya, struktur folder kamu adalah rute URL kamu.

### Folder `app/`
Di dalam folder `app`, setiap folder mewakili satu rute:
- `app/page.tsx` -> Halaman Utama (`/`)
- `app/dashboard/page.tsx` -> Halaman Dashboard (`/dashboard`)
- `app/dashboard/settings/page.tsx` -> Halaman Settings (`/dashboard/settings`)

### File Khusus
1.  **`page.tsx`**: Isi konten utama dari sebuah rute.
2.  **`layout.tsx`**: Kerangka luar yang membungkus halaman. Layout tidak akan di-render ulang saat pindah halaman di folder yang sama (cocok untuk Navbar/Sidebar).
3.  **`loading.tsx`**: Muncul otomatis saat data sedang diambil.
4.  **`error.tsx`**: Muncul jika ada error di rute tersebut.

---

Komponen: Server vs Client (PENTING!)

Ini adalah konsep paling krusial di Next.js App Router.

### Server Components (Default)
Secara default, semua file di folder `app` adalah Server Components.
- **Kelebihan:** Bisa ambil data langsung dari Database (aman), ukuran file JS ke browser lebih kecil.
- **Batasan:** Tidak bisa pakai `useState`, `useEffect`, atau event handler (seperti `onClick`).

### Client Components
Gunakan ini jika butuh interaksi (klik, input, state). Tambahkan tulisan `"use client";` di paling atas file.
- **Contoh:** Modal, Dropdown, Form Input.

---

Koneksi Database (Supabase)

Di proyek kamu, koneksi database dikelola di folder `utils/supabase/`.

### Cara Ambil Data (Server Side)
Kamu bisa langsung memanggil database di dalam fungsi komponen karena ia berjalan di server.

```tsx
// app/proyek/page.tsx
import { createClient } from "@/utils/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  
  // Ambil data langsung dari tabel 'projects'
  const { data: projects } = await supabase.from("projects").select("*");

  return (
    <div>
      <h1>Daftar Proyek</h1>
      {projects?.map(p => <p key={p.id}>{p.title}</p>)}
    </div>
  );
}
```

---

Cara Menghubungkan Semuanya (Input -> DB -> Tampilan)

Untuk mengirim data (seperti simpan form), kita menggunakan **Server Actions**.

### Step 1: Buat Action
```ts
// lib/actions.ts
"use server"; // Menandakan fungsi ini jalan di server

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title");

  await supabase.from("projects").insert({ title });

  // Update tampilan tanpa refresh halaman manual
  revalidatePath("/dashboard");
}
```

Hubungkan ke Form (Client Component)
```tsx
// app/components/ProjectForm.tsx
"use client";
import { createProject } from "@/lib/actions";

export function ProjectForm() {
  return (
    <form action={createProject}>
      <input name="title" type="text" />
      <button type="submit">Tambah Proyek</button>
    </form>
  );
}
```

