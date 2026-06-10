# 🎙️ Pitching Script: The Project Manager
**Speaker: Nailah Rasya**  
**Duration: 08:30 - 12:45 (4 Menit 15 Detik)**

---

## 🎯 Goals
1. Mendemokan pembuatan Milestone oleh Freelancer.
2. Menjelaskan transparansi progres proyek bagi Klien.
3. Mendemokan fitur pengunggahan bukti (Evidence Submission).
4. Menjelaskan fitur "Change Request" untuk menangani perubahan lingkup kerja.

---

## 📝 Script Walkthrough

### 1. Manajemen Milestone (08:30 - 10:00)
*   **Visual**: Halaman [Milestones](file:///app/dashboard/milestones/page.tsx) di sisi Freelancer.
*   **Action**: Demo pembuatan satu milestone baru (Judul, Nominal, Deadline).
*   **Talking Point**:
    > "Proyek sudah aktif! Sekarang, sebagai Freelancer, saya tidak bekerja membabi buta. Saya memecah proyek menjadi **Milestones**. Misalnya: 'Desain Landing Page' dengan nilai 2 juta rupiah. Ini memberikan kepastian bagi saya dan kejelasan bagi Klien."

### 2. Evidence Submission & Progress Bar (10:00 - 11:30)
*   **Visual**: Komponen [UploadEvidenceModal.tsx](file:///app/components/dashboard/freelancer/UploadEvidenceModal.tsx) dan [ProgressTrackerCard.tsx](file:///app/components/dashboard/ProgressTrackerCard.tsx).
*   **Action**: Unggah file dummy sebagai bukti pengerjaan. Tunjukkan bar progres yang bergerak.
*   **Talking Point**:
    > "Bagaimana Klien tahu saya benar-benar bekerja? Saya mengunggah bukti di sini. Begitu bukti diunggah, Klien menerima notifikasi. Lihat bar progres ini—ia bergerak secara otomatis setiap kali milestone disetujui. Inilah **Real-time Accountability** yang kami tawarkan."

### 3. Change Request (11:30 - 12:30)
*   **Visual**: Tab [Change Requests](file:///app/dashboard/change-requests/page.tsx).
*   **Action**: Tunjukkan list permintaan perubahan atau modal [ChangeRequestModal.tsx](file:///app/components/dashboard/freelancer/ChangeRequestModal.tsx).
*   **Talking Point**:
    > "Scope creep? Perubahan mendadak di tengah jalan? Kami punya solusinya. Fitur **Change Request** memungkinkan penyesuaian draf di tengah proyek yang sedang berjalan tanpa harus membatalkan kontrak yang sudah ada. Semua terekam dengan rapi."

### 4. Transition to Ghibran (12:30 - 12:45)
*   **Talking Point**:
    > "Kerja keras sudah dibuktikan, progres sudah terlihat. Sekarang, bagaimana dengan bayarannya? Ghibran akan menunjukkan betapa amannya sistem keuangan di FreeTrack."

---

## 💡 Best Practice Tips for Nailah
*   **Fokus pada 'Structure'**: Gunakan istilah "Langkah Kerja" atau "Target Pencapaian" saat menjelaskan Milestone.
*   **Visual Progress**: Pastikan audiens melihat progress bar yang tadinya 0% menjadi (misalnya) 25% setelah satu milestone selesai.
*   **Highlight Anti-Ghosting**: Sebutkan bahwa pengunggahan bukti adalah cara terbaik mengunci kepercayaan klien.
