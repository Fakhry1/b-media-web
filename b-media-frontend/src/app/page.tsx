import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import VideoSection from "@/components/home/VideoSection";
import ArticlesSection from "@/components/home/ArticlesSection";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />

        {/* Divider */}
        <div style={{ background: "var(--surface-2)" }}>
          <VideoSection />
        </div>

        <ArticlesSection />

        {/* CTA Banner */}
        <section className="py-16 relative overflow-hidden" style={{ background: "linear-gradient(150deg,var(--forest),#142E22)" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 50%,rgba(200,168,75,.18),transparent 60%)" }} />
          <div className="container-main relative z-10 text-center">
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "var(--gold)" }}>
              — ابدأ الآن —
            </p>
            <h2 className="text-white font-extrabold mb-4" style={{ fontFamily: "'Scheherazade New',serif", fontSize: "clamp(28px,5vw,44px)", lineHeight: 2 }}>
              "وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ"
            </h2>
            <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,.65)" }}>سورة المطففين · آية ٢٦</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href="/video" className="px-6 py-3 rounded-xl text-sm font-bold transition-all"
                style={{ background: "var(--gold)", color: "var(--forest)", boxShadow: "var(--shadow-gold)" }}>
                استكشف المحتوى
              </a>
              <a href="/register" className="px-6 py-3 rounded-xl text-sm font-bold border"
                style={{ background: "rgba(255,255,255,.08)", color: "#fff", borderColor: "rgba(255,255,255,.18)" }}>
                سجّل مجاناً
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
