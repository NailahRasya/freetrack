

## 🚀 Teknologi yang Digunakan

*   **Frontend**: Next.js 15+ (App Router), TypeScript, Framer Motion (Animasi), Lucide React (Icons).
*   **Styling**: Tailwind CSS dengan sistem token warna (Navy, Emerald, Cyan) untuk estetika premium dan performa maksimal.
*   **Backend & Database**: Supabase (PostgreSQL) dengan Row Level Security (RLS) untuk keamanan data tingkat baris.
*   **Authentication**: Supabase Auth (Email & Role-based metadata).
*   **API**: Next.js Route Handlers (RESTful API).

---

## 🔄 Alur Kerja & Logika Fitur

### 1. Landing Page & Onboarding
Landing page dirancang untuk memberikan impresi premium dengan micro-animations. Pengguna dapat mendaftar sebagai **Freelancer** atau **Client**.
*   **Logika**: Data role disimpan dalam `user_metadata` Supabase Auth saat registrasi. Dashboard akan menyesuaikan fitur berdasarkan role tersebut.

### 2. Tab Kontak: Membangun Koneksi
Sebelum memulai proyek, Freelancer dan Klien harus terhubung terlebih dahulu.
*   **Logika**: 
    *   Freelancer mengundang Klien melalui email.
    *   Data disimpan di tabel `contacts` dengan status `pending`.
    *   Setelah Klien menerima undangan di dashboard mereka, status menjadi `accepted`, dan mereka dapat saling melihat proyek.

### 3. Inisiasi Proyek & Negosiasi "Ping-pong"
Inti dari FreeTrack adalah fleksibilitas negosiasi sebelum proyek benar-benar dimulai.
*   **Logika**:
    *   Klien atau Freelancer dapat membuat draf proyek awal (Judul, Budget, Deadline).
    *   Status awal: `draft` -> `pending_client` atau `pending_freelancer`.
    *   **Fitur Pesan & Nego**: Setiap kali ada perubahan budget atau detail, status akan berputar (ping-pong). 
    ```typescript
    // Cuplikan Logika PATCH Proyek
    if (role === "client" && payload.status === "pending_freelancer") {
      nextNegoCount += 1; // Melacak berapa kali negosiasi terjadi
      // Kirim pesan otomatis ke chat untuk memberitahu ada update
    }
    ```
    *   Tombol **"Ajukan Negosiasi"** memungkinkan salah satu pihak mengirimkan balik revisi hingga keduanya sepakat.

### 4. Proyek Aktif & Manajemen Milestone
Setelah tombol **"Approve"** ditekan oleh kedua belah pihak, proyek berpindah status menjadi `active`. Di tahap ini, Freelancer memegang kendali untuk menentukan langkah kerja.
*   **Logika**:
    *   Freelancer membuat daftar **Milestone** di tab "Target Pencapaian".
    *   Setiap milestone memiliki nilai (IDR) dan deadline sendiri.
    *   Data ini dikirim ke server via `POST /api/milestones` dan langsung muncul secara *real-time* di dashboard Klien.

### 5. Pembayaran DP & Escrow
Freelancer seringkali ragu memulai pekerjaan tanpa jaminan. Di FreeTrack, milestone pertama biasanya adalah DP.
*   **Logika UI**: 
    *   Di sisi Klien, milestone dengan status **"Menunggu DP"** akan menampilkan tombol kuning cerah **"Bayar DP Sekarang"**.
    *   Tombol ini mengarahkan Klien ke tab Pembayaran untuk melakukan deposit.
    ```tsx
    // Komponen ClientMilestoneCard
    {milestone.status === "Menunggu DP" && (
      <Link href="/dashboard/payments">
        <button className="btn-warning">Bayar DP Sekarang</button>
      </Link>
    )}
    ```

### 6. Pengiriman Bukti & Approval Milestone
Setiap kali tahap selesai, Freelancer mengunggah bukti pengerjaan.
*   **Logika Progres**:
    *   Setiap kali milestone disetujui (`Approved`), sistem secara otomatis menghitung ulang persentase progres proyek di tabel `projects`.
    ```sql
    -- Logika Update Progress otomatis di API
    UPDATE projects 
    SET progress = (approved_milestones / total_milestones) * 100 
    WHERE id = project_id;
    ```

---

## 🛡️ Keamanan Data (RLS)
Keamanan adalah prioritas. Freelancer tidak bisa melihat proyek freelancer lain, dan klien hanya bisa melihat data yang relevan dengan mereka melalui **Supabase Row Level Security**.
```sql
CREATE POLICY "Freelancers can manage their milestones" 
ON milestones FOR ALL 
USING (auth.uid() = freelancer_id);
```

---

## 📈 Visi Pitch
FreeTrack bukan sekadar alat manajemen tugas, melainkan jembatan kepercayaan. Dengan alur yang terstruktur—mulai dari koneksi kontak, negosiasi yang terekam, hingga pembayaran berbasis milestone—kami meminimalisir risiko *ghosting* dan penunggakan pembayaran yang sering dialami oleh pekerja kreatif.

**FreeTrack: Workspace Profesional untuk Masa Depan Kerja Lepas.**
