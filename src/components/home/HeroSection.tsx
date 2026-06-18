"use client";

import { useLang } from "@/lib/LangContext";
import HeroBannerSlider from "./HeroBannerSlider";

export default function HeroSection() {
  const { t } = useLang();

  const NAV_ITEMS = [
    { icon: "🎬", label: t.heroNavVideo,      sub: t.heroNavVideoSub,      href: "/video",      color: "rgba(26,67,50,.12)"   },
    { icon: "🖼️", label: t.heroNavGallery,    sub: t.heroNavGallerySub,    href: "/gallery",    color: "rgba(200,168,75,.14)" },
    { icon: "🎙️", label: t.heroNavAudio,      sub: t.heroNavAudioSub,      href: "/audio",      color: "rgba(26,67,50,.10)"   },
    { icon: "📖", label: t.heroNavArticles,   sub: t.heroNavArticlesSub,   href: "/articles",   color: "rgba(200,168,75,.12)" },
    { icon: "📂", label: t.heroNavCategories, sub: t.heroNavCategoriesSub, href: "/categories", color: "rgba(11,35,24,.08)"   },
  ];

  return (
    <section style={{ paddingTop: 24, paddingBottom: 8 }}>
      <div className="container-main">

        {/* ── Slider ── */}
        <HeroBannerSlider />

        {/* ── Quick-nav pills ── */}
        <nav aria-label={t.browseContentAria} style={{ marginTop: 20, paddingBottom: 4 }}>
          <div style={{
            display: "flex", gap: 12,
            overflowX: "auto", paddingBottom: 4,
            scrollSnapType: "x mandatory",
            msOverflowStyle: "none", scrollbarWidth: "none",
          }}>
            {NAV_ITEMS.map(item => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  flexShrink: 0, minWidth: 150,
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", borderRadius: 16,
                  background: "var(--surface)", border: "1px solid var(--line)",
                  boxShadow: "var(--shadow-sm)",
                  scrollSnapAlign: "start",
                  textDecoration: "none",
                  transition: "all .2s",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "var(--gold)";
                  el.style.transform   = "translateY(-3px)";
                  el.style.boxShadow   = "var(--shadow-md)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "var(--line)";
                  el.style.transform   = "";
                  el.style.boxShadow   = "var(--shadow-sm)";
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: item.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div>
                  <b style={{ display: "block", fontSize: 14, fontWeight: 700, color: "var(--ink)", fontFamily: "'Noto Kufi Arabic',sans-serif" }}>
                    {item.label}
                  </b>
                  <span style={{ display: "block", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    {item.sub}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </nav>

      </div>
    </section>
  );
}
