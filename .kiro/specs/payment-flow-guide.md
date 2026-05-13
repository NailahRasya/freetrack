# 💳 Payment & Evidence Submission Flow - Complete Guide

## 🎯 COMPLETE FLOW (Updated)

```
┌─────────────────────────────────────────────────────────────┐
│                    MILESTONE LIFECYCLE                       │
└─────────────────────────────────────────────────────────────┘

1️⃣ FREELANCER BUAT MILESTONE
   └─► Status: "Menunggu DP" 🟡
   └─► Payment: "Escrowed" (belum dibayar)
   └─► Freelancer: ❌ Ga bisa upload bukti (terkunci)
   └─► Client: Lihat tombol "💳 Bayar DP Sekarang"

2️⃣ CLIENT BAYAR DP
   ├─► Klik "💳 Bayar DP Sekarang"
   ├─► Redirect ke /dashboard/payments
   ├─► Lihat list milestone yang perlu dibayar
   ├─► Klik "Bayar DP Sekarang" pada milestone
   ├─► Konfirmasi pembayaran (popup)
   ├─► Processing... (2 detik simulasi)
   └─► ✅ Success!
       ├─► Status: "Menunggu DP" → "In Progress" 🔵
       ├─► Payment: "Escrowed" (uang ditahan platform)
       └─► Freelancer: ✅ Bisa upload bukti sekarang!

3️⃣ FREELANCER UPLOAD BUKTI
   ├─► Tombol "Upload Bukti" sekarang aktif
   ├─► Klik "Upload Bukti"
   ├─► Modal popup
   ├─► Upload file/link + deskripsi
   ├─► Klik "Kirim Kemajuan"
   └─► ✅ Success!
       ├─► Status: "In Progress" → "Waiting for Approval" 🟡
       ├─► Evidence tersimpan
       └─► Client dapat notifikasi

4️⃣ CLIENT REVIEW BUKTI
   ├─► Tombol "Review Submission" muncul
   ├─► Klik "Review Submission"
   ├─► Modal popup dengan semua evidence
   ├─► Review file/link/deskripsi
   └─► Pilih aksi:
       │
       ├─► A. APPROVE ✅
       │   ├─► Klik "Setujui Milestone"
       │   ├─► Konfirmasi
       │   └─► ✅ Success!
       │       ├─► Status: "Approved" 🟢
       │       ├─► Payment: "Released" 💰
       │       └─► Freelancer terima uang!
       │
       └─► B. REQUEST REVISION ⚠️
           ├─► Klik "Minta Revisi"
           ├─► Input catatan revisi
           └─► ✅ Revisi diminta!
               ├─► Status: "In Progress" 🔵
               ├─► Payment: "Escrowed" (masih ditahan)
               └─► Freelancer upload bukti lagi (repeat step 3)
```

---

## 📱 STEP-BY-STEP TESTING GUIDE

### **STEP 1: Setup Milestone (Freelancer)**

```
1. Login sebagai Freelancer
2. Buka "Target Pencapaian"
3. Pilih klien & proyek
4. Klik "+ Buat Milestone"
5. Isi form:
   - Judul: "Wireframe Design"
   - Nilai: 1234567
   - Deadline: 2026-05-14
   - Deskripsi: "Buat wireframe untuk homepage"
6. Klik "Kirim ke Klien"
7. ✅ Milestone dibuat dengan status "Menunggu DP"
```

**Yang Terlihat:**
```
┌─────────────────────────────────────────┐
│ 📌 Wireframe Design                     │
│ 🟡 MENUNGGU DP    💰 Escrowed          │
│ Rp 1.234.567 • 2026-05-14             │
│                                         │
│ ⏰ Unggahan terkunci sampai DP dibayar │
└─────────────────────────────────────────┘
```

---

### **STEP 2: Bayar DP (Client)**

```
1. Login sebagai Client
2. Buka "Target Pencapaian"
3. Pilih proyek
4. Lihat milestone card dengan badge "MENUNGGU DP"
5. Klik tombol "💳 Bayar DP Sekarang"
6. Redirect ke halaman /dashboard/payments
7. Lihat list milestone yang perlu dibayar
8. Klik "Bayar DP Sekarang" pada milestone
9. Popup konfirmasi muncul:
   - Milestone: Wireframe Design
   - Jumlah DP: Rp 1.234.567
   - Info: Uang akan ditahan di escrow
10. Klik "Ya, Bayar Sekarang"
11. Loading 2 detik (simulasi payment processing)
12. ✅ Popup success: "Pembayaran Berhasil!"
13. Milestone hilang dari list (sudah dibayar)
```

**Yang Terjadi di Backend:**
```sql
UPDATE milestones 
SET 
  status = 'In Progress',
  payment_status = 'Escrowed'
WHERE id = 'milestone-id';
```

---

### **STEP 3: Upload Bukti (Freelancer)**

```
1. Refresh halaman "Target Pencapaian"
2. Milestone sekarang status "IN PROGRESS" 🔵
3. Tombol "Upload Bukti" sekarang aktif ✅
4. Klik "Upload Bukti"
5. Modal popup "Kirim Kemajuan"
6. Tab "Unggah Berkas":
   - Klik area upload
   - Pilih file: wireframe-v1.png (2.3 MB)
   - File muncul di list
7. Tab "URL / Tautan":
   - Input URL: https://figma.com/file/abc123
   - Input Judul: "Figma Wireframe"
   - Klik "+ Tambah Link"
   - Link muncul di list
8. Tambah catatan:
   "Pak, wireframe sudah selesai. 
    Sudah saya buat 5 halaman utama. 
    Silakan cek di Figma ya!"
9. Klik "Kirim Kemajuan"
10. Progress bar: 10% → 30% → 80% → 100%
11. ✅ Success! Checkmark hijau muncul
12. Modal tutup otomatis
```

**Yang Terlihat Setelah Upload:**
```
┌─────────────────────────────────────────┐
│ 📌 Wireframe Design                     │
│ 🟡 MENUNGGU PERSETUJUAN  💰 Escrowed   │
│ Rp 1.234.567 • 2026-05-14             │
│ 📎 2 bukti                              │
│                                         │
│ ⏳ Menunggu review dari klien          │
└─────────────────────────────────────────┘
```

---

### **STEP 4: Review Bukti (Client)**

```
1. Refresh halaman "Target Pencapaian"
2. Milestone sekarang status "WAITING FOR APPROVAL" 🟡
3. Tombol "Review Submission" muncul
4. Klik "Review Submission"
5. Modal popup "Review Bukti Kerja"
6. Lihat evidence:
   
   📄 wireframe-v1.png
      2.3 MB • 13 Mei 2026, 14:30
      [📥 Download]
      [Preview gambar muncul - bisa diklik zoom]
   
   🔗 Figma Wireframe
      https://figma.com/file/abc123
      13 Mei 2026, 14:30
      [Link bisa diklik]
   
   📝 CATATAN DARI JOHN DOE
   ┌─────────────────────────────────────┐
   │ Pak, wireframe sudah selesai.      │
   │ Sudah saya buat 5 halaman utama.   │
   │ Silakan cek di Figma ya!           │
   └─────────────────────────────────────┘

7. Review semua bukti
8. Pilih aksi:
```

#### **OPSI A: APPROVE ✅**
```
9a. Klik "Setujui Milestone" (hijau)
10a. Popup konfirmasi:
     "Setujui Milestone?
      Anda akan menyetujui milestone ini dan 
      pembayaran akan dilepas ke freelancer."
11a. Klik "Ya, Setujui"
12a. ✅ Success! "Milestone Disetujui!"
13a. Modal tutup
14a. Milestone sekarang:
     - Status: "APPROVED" 🟢
     - Payment: "RELEASED" 💰
     - Badge: "Milestone Approved"
```

#### **OPSI B: REQUEST REVISION ⚠️**
```
9b. Klik "Minta Revisi" (kuning)
10b. Popup dengan textarea:
     "Minta Revisi?
      Milestone akan dikembalikan ke status 
      'In Progress' dan freelancer akan diminta 
      untuk melakukan perbaikan."
     
     [Textarea catatan revisi]
     Input: "Tolong tambahkan wireframe untuk 
            halaman Contact Us juga ya"
11b. Klik "Ya, Minta Revisi"
12b. ✅ Success! "Revisi Diminta"
13b. Modal tutup
14b. Milestone sekarang:
     - Status: "IN PROGRESS" 🔵
     - Payment: "ESCROWED" (masih ditahan)
     - Freelancer bisa upload bukti lagi
```

---

## 🔍 VERIFICATION CHECKLIST

### **After Payment:**
- [ ] Milestone status berubah "Menunggu DP" → "In Progress"
- [ ] Payment status tetap "Escrowed"
- [ ] Tombol "Upload Bukti" aktif di freelancer side
- [ ] Tombol "Bayar DP" hilang di client side

### **After Evidence Upload:**
- [ ] Milestone status berubah "In Progress" → "Waiting for Approval"
- [ ] Evidence count badge muncul (contoh: "2 bukti")
- [ ] Tombol "Upload Bukti" hilang
- [ ] Tombol "Review Submission" muncul di client side

### **After Approve:**
- [ ] Milestone status berubah → "Approved"
- [ ] Payment status berubah "Escrowed" → "Released"
- [ ] Badge hijau "Milestone Approved" muncul
- [ ] Semua tombol aksi hilang (sudah selesai)

### **After Request Revision:**
- [ ] Milestone status kembali ke "In Progress"
- [ ] Payment status tetap "Escrowed"
- [ ] Tombol "Upload Bukti" aktif lagi
- [ ] Evidence lama tetap tersimpan (history)

---

## 🎨 UI STATES REFERENCE

### **Milestone Card States:**

```
STATE 1: MENUNGGU DP (Freelancer View)
┌─────────────────────────────────────────┐
│ 🟡 MENUNGGU DP    💰 Escrowed          │
│ ⏰ Unggahan terkunci sampai DP dibayar │
└─────────────────────────────────────────┘

STATE 2: MENUNGGU DP (Client View)
┌─────────────────────────────────────────┐
│ 🟡 MENUNGGU DP    💰 Escrowed          │
│ [💳 Bayar DP Sekarang] ← KLIK INI      │
└─────────────────────────────────────────┘

STATE 3: IN PROGRESS (Freelancer View)
┌─────────────────────────────────────────┐
│ 🔵 IN PROGRESS    💰 Escrowed          │
│ [📤 Upload Bukti] ← KLIK INI           │
└─────────────────────────────────────────┘

STATE 4: WAITING FOR APPROVAL (Client View)
┌─────────────────────────────────────────┐
│ 🟡 WAITING FOR APPROVAL  💰 Escrowed   │
│ 📎 2 bukti                              │
│ [👁 Review Submission] [👍 Approve]    │
└─────────────────────────────────────────┘

STATE 5: APPROVED (Both Views)
┌─────────────────────────────────────────┐
│ 🟢 APPROVED    💰 Released             │
│ ✅ Milestone Approved                   │
└─────────────────────────────────────────┘
```

---

## 🐛 TROUBLESHOOTING

### **"Tombol Bayar DP ga muncul"**
```
Cek:
- Login sebagai Client ✓
- Milestone status = "Menunggu DP" ✓
- Kamu adalah owner project ✓
```

### **"Tombol Upload Bukti ga aktif"**
```
Cek:
- Login sebagai Freelancer ✓
- Milestone status = "In Progress" ✓
- DP sudah dibayar ✓
```

### **"Payment ga berhasil"**
```
Cek:
- Browser console untuk error
- Network tab untuk API response
- Milestone ID valid
```

### **"Evidence ga keupload"**
```
Cek:
- File size < 10MB ✓
- File type valid (PNG/JPG/PDF/ZIP) ✓
- Internet connection stable ✓
- Browser ga block popup ✓
```

---

## 💡 IMPORTANT NOTES

### **Payment Simulation:**
```
⚠️ CURRENT: Mock payment (instant, no real money)
   - Langsung update status
   - Simulasi 2 detik processing
   - Ga ada payment gateway

🚀 PRODUCTION: Real payment gateway needed
   - Midtrans / Xendit / Stripe
   - Real transaction
   - Webhook untuk status update
```

### **Escrow System:**
```
✅ Uang ditahan platform
✅ Ga langsung ke freelancer
✅ Released setelah client approve
✅ Bisa dispute kalo ada masalah
```

### **Evidence Storage:**
```
✅ File disimpan di Supabase Storage
✅ Private bucket (authenticated only)
✅ Signed URLs (1-hour expiry)
✅ Soft delete (history preserved)
```

---

## 🎯 NEXT STEPS

1. **Test Complete Flow:**
   - [ ] Buat milestone
   - [ ] Bayar DP
   - [ ] Upload bukti
   - [ ] Review & approve

2. **Run Database Migration:**
   - [ ] Execute `add_milestone_evidence.sql`
   - [ ] Create storage bucket
   - [ ] Apply RLS policies

3. **Production Readiness:**
   - [ ] Integrate real payment gateway
   - [ ] Setup webhook handlers
   - [ ] Add email notifications
   - [ ] Setup monitoring & logging

---

**Last Updated:** 2026-05-13  
**Status:** ✅ Ready for Testing  
**Payment:** 🔄 Mock (Production needs real gateway)
