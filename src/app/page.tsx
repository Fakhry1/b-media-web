import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import HomeVideoSection from "@/components/home/VideoSection";
import HomeGallerySection from "@/components/home/GallerySection";
import HomeAudioSection from "@/components/home/AudioSection";
import HomeArticlesSection from "@/components/home/ArticlesSection";
import CtaSection from "@/components/home/CtaSection";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">

        {/* ══ 1. Hero Slider ══ */}
        <HeroSection />

        {/* ══ 2. Latest Videos ══ */}
        <HomeVideoSection />

        {/* ══ 3. Gallery ══ */}
        <HomeGallerySection />

        {/* ══ 4. Audio ══ */}
        <HomeAudioSection />

        {/* ══ 5. Articles / Reading ══ */}
        <HomeArticlesSection />

        {/* ══ 6. CTA Banner ══ */}
        <CtaSection />

      </main>
      <Footer />
    </>
  );
}
