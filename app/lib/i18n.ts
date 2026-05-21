export type Language = "id" | "en";

export const translations = {
  id: {
    // Navbar
    search: "Cari...",
    notifications: "Notifikasi",
    no_notifications: "Belum ada notifikasi.",
    unread: "Belum dibaca",
    profile: "Profil",
    settings: "Pengaturan",
    logout: "Keluar",
    confirm_logout: "Konfirmasi Logout",
    confirm_logout_text: "Apakah anda yakin ingin keluar dari sistem?",
    logging_out: "Sedang keluar...",
    
    // Sidebar
    dashboard: "Dasbor",
    marketplace: "Marketplace",
    my_projects: "Proyek Saya",
    contacts: "Kontak",
    payments: "Pembayaran",
    invoices: "Invoice",
    milestones: "Target Pencapaian",
    messages: "Pesan",
    my_profile: "Profil Saya",
    change_requests: "Permintaan Perubahan",
    
    // Settings
    account_settings: "Pengaturan Akun",
    manage_profile: "Kelola informasi profil, preferensi tampilan, dan keamanan akun Anda.",
    appearance: "Tampilan",
    security: "Keamanan",
    save_changes: "Simpan Perubahan",
    cancel: "Batal",
    
    // Appearance Tab
    app_appearance: "Tampilan Aplikasi",
    dark_mode: "Mode Gelap (Dark Mode)",
    coming_soon: "Segera Hadir",
    dark_mode_desc: "Gunakan tema gelap yang nyaman di mata untuk bekerja.",
    language: "Bahasa (Language)",
    language_desc: "Pilih bahasa antarmuka yang Anda inginkan.",
    
    // Profile Tab
    profile_info: "Informasi Profil",
    full_name: "Nama Lengkap",
    email: "Email",
    role: "Peran (Role)",
    bio: "Bio / Deskripsi Singkat",
    bio_placeholder: "Ceritakan sedikit tentang Anda...",
    saving: "Menyimpan...",
    profile_updated: "Profil Diperbarui",
    profile_updated_desc: "Informasi profil Anda telah berhasil disimpan.",
    system_notifications: "Notifikasi Sistem",
    system_notifications_desc: "Tampilkan notifikasi desktop untuk aktivitas real-time.",
  },
  en: {
    // Navbar
    search: "Search...",
    notifications: "Notifications",
    no_notifications: "No notifications yet.",
    unread: "Unread",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    confirm_logout: "Confirm Logout",
    confirm_logout_text: "Are you sure you want to log out?",
    logging_out: "Logging out...",
    
    // Sidebar
    dashboard: "Dashboard",
    marketplace: "Marketplace",
    my_projects: "My Projects",
    contacts: "Contacts",
    payments: "Payments",
    invoices: "Invoices",
    milestones: "Milestones",
    messages: "Messages",
    my_profile: "My Profile",
    change_requests: "Change Requests",
    
    // Settings
    account_settings: "Account Settings",
    manage_profile: "Manage your profile information, appearance preferences, and account security.",
    appearance: "Appearance",
    security: "Security",
    save_changes: "Save Changes",
    cancel: "Cancel",
    
    // Appearance Tab
    app_appearance: "App Appearance",
    dark_mode: "Dark Mode",
    coming_soon: "Coming Soon",
    dark_mode_desc: "Use a dark theme that's easy on the eyes while working.",
    language: "Language",
    language_desc: "Choose your preferred interface language.",
    
    // Profile Tab
    profile_info: "Profile Information",
    full_name: "Full Name",
    email: "Email",
    role: "Role",
    bio: "Bio / Short Description",
    bio_placeholder: "Tell us a bit about yourself...",
    saving: "Saving...",
    profile_updated: "Profile Updated",
    profile_updated_desc: "Your profile information has been successfully saved.",
    system_notifications: "System Notifications",
    system_notifications_desc: "Show desktop notifications for real-time activities.",
  }
};

export type TranslationKey = keyof typeof translations.id;
