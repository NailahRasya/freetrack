// Mengimpor seluruh komponen yang dibutuhkan untuk membangun Landing Page utama
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import HowItWorksSection from "./components/HowItWorksSection";
import DashboardSection from "./components/DashboardSection";
import TestimonialsSection from "./components/TestimonialsSection";
import FAQSection from "./components/FAQSection";
import Footer from "./components/Footer";
import SplashScreen from "./components/SplashScreen";

// Komponen Home sebagai entry point utama halaman depan (Landing Page)
export default function Home() {
  return (
    <>
      {/* Menampilkan splash screen saat awal dimuat */}
      <SplashScreen />

      {/* Menampilkan navigasi di bagian atas halaman */}
      <Navbar />
      
      {/* Konten utama halaman yang berisi berbagai section penunjang */}
      <main>
        {/* Bagian Hero: Judul utama dan CTA awal */}
        <HeroSection />
        
        {/* Bagian Fitur: Penjelasan tiga pilar utama perlindungan Freetrack */}
        <FeaturesSection />
        
        {/* Bagian Cara Kerja: Step-by-step penggunaan platform */}
        <HowItWorksSection />
        
        {/* Bagian Preview Dashboard: Gambaran antarmuka aplikasi */}
        <DashboardSection />
        
        {/* Bagian Testimoni: Review dari pengguna lain */}
        <TestimonialsSection />

        {/* Bagian FAQ: Pertanyaan yang sering diajukan */}
        <FAQSection />
      </main>
      
      {/* Menampilkan footer atau bagian bawah halaman */}
      <Footer />
    </>
  );
}
