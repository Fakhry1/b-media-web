import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import HomeVideoSection from "@/components/home/VideoSection";
import HomeGallerySection from "@/components/home/GallerySection";
import HomeAudioSection from "@/components/home/AudioSection";
import HomeArticlesSection from "@/components/home/ArticlesSection";

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
        <section style={{
          padding: "64px 0", position: "relative", overflow: "hidden",
          background: "linear-gradient(150deg,var(--forest),#142E22)",
        }}>
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse at 50% 50%,rgba(200,168,75,.18),transparent 60%)",
          }} />
          <div className="container-main" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>
              — ابدأ الآن —
            </p>
            <h2 style={{
              color: "#fff", fontFamily: "'Scheherazade New',serif",
              fontSize: "clamp(26px,5vw,42px)", lineHeight: 2,
              fontWeight: 700, margin: "0 0 8px",
            }}>
              "وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ"
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.60)", marginBottom: 32 }}>سورة المطففين · آية ٢٦</p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/video" style={{
                padding: "12px 28px", borderRadius: 14, fontSize: 14, fontWeight: 700,
                background: "var(--gold)", color: "var(--forest)",
                boxShadow: "var(--shadow-gold)", textDecoration: "none",
                fontFamily: "'Noto Kufi Arabic',sans-serif",
              }}>
                استكشف المحتوى
              </a>
              <a href="/categories" style={{
                padding: "12px 28px", borderRadius: 14, fontSize: 14, fontWeight: 700,
                background: "rgba(255,255,255,.08)", color: "#fff",
                border: "1px solid rgba(255,255,255,.18)", textDecoration: "none",
                fontFamily: "'Noto Kufi Arabic',sans-serif",
              }}>
                تصفح التصنيفات
              </a>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
