"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { fetchPublicContents, type PublicItem } from "@/lib/public";

/* ─── Constants ────────────────────────────────────────────── */
const TOPICS = [
  { href: "/video",    label: "المشاهدة", icon: "🎬", color: "#10B981" },
  { href: "/audio",    label: "السماع",   icon: "🎧", color: "#8B5CF6" },
  { href: "/articles", label: "الاطلاع",  icon: "📖", color: "#3B82F6" },
  { href: "/gallery",  label: "صور",      icon: "🖼️", color: "#F59E0B" },
];

const TYPE_META: Record<number, { label: string; color: string; playIcon: boolean }> = {
  1: { label: "فيديو", color: "#10B981", playIcon: true  },
  2: { label: "صورة",  color: "#F59E0B", playIcon: false },
  3: { label: "صوت",   color: "#8B5CF6", playIcon: false },
  5: { label: "مقال",  color: "#3B82F6", playIcon: false },
};

function fmtDate(iso: string | null) {
  return iso
    ? new Date(iso).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })
    : "";
}

/* ─── News Ticker ────────────────────────────────────────── */
function NewsTicker() {
  const [titles, setTitles] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetchPublicContents({ pageSize: 6, mediaType: 1 }),
      fetchPublicContents({ pageSize: 6, mediaType: 3 }),
      fetchPublicContents({ pageSize: 6, mediaType: 5 }),
    ]).then(results => {
      const all = results.flatMap(r => r.items.map(i => i.title)).filter(Boolean);
      setTitles(all);
    }).catch(() => {});
  }, []);

  if (titles.length === 0) return null;

  const repeated = [...titles, ...titles, ...titles];
  const duration = titles.length * 6;

  return (
    <div style={{
      background: "linear-gradient(90deg,#0a1f12 0%,var(--forest) 30%,var(--forest) 70%,#0a1f12 100%)",
      borderTop: "1px solid rgba(200,168,75,.25)",
      borderBottom: "1px solid rgba(200,168,75,.25)",
      display: "flex", alignItems: "center", height: 46, overflow: "hidden",
    }}>
      {/* Label badge */}
      <div style={{
        flexShrink: 0, position: "relative", zIndex: 2,
        background: "linear-gradient(135deg,var(--gold),#e8c05a)",
        color: "var(--forest)", padding: "0 20px", height: "100%",
        display: "flex", alignItems: "center", gap: 7,
        fontWeight: 800, fontSize: 12, letterSpacing: ".6px",
        clipPath: "polygon(0 0,calc(100% - 12px) 0,100% 50%,calc(100% - 12px) 100%,0 100%)",
        paddingInlineEnd: 28,
      }}>
        <span style={{ fontSize: 10 }}>📡</span>
        آخر الإضافات
      </div>

      {/* Fade-left overlay */}
      <div style={{ position: "absolute", right: 0, width: 80, height: 46, zIndex: 1, pointerEvents: "none",
        background: "linear-gradient(to left,#0a1f12,transparent)" }} />

      {/* Scrolling track */}
      <div style={{ overflow: "hidden", flex: 1 }}>
        <div style={{
          display: "inline-flex", gap: 0,
          animation: `newsticker ${duration}s linear infinite`,
          willChange: "transform",
        }}>
          {repeated.map((title, i) => (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center", whiteSpace: "nowrap",
              color: "rgba(255,255,255,.82)", fontSize: 13, fontWeight: 500,
              padding: "0 32px",
            }}>
              <span style={{ color: "var(--gold)", fontSize: 7, marginInlineEnd: 14, opacity: .8 }}>◆</span>
              {title}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes newsticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        @media (prefers-reduced-motion: reduce) {
          div[style*="newsticker"] { animation: none; }
        }
      `}</style>
    </div>
  );
}

/* ─── Hero ────────────────────────────────────────────────── */
function Hero() {
  return (
    <div style={{
      background: "linear-gradient(150deg,var(--forest) 0%,#1a4332 55%,#0a1f12 100%)",
      padding: "72px 0 60px", position: "relative", overflow: "hidden",
    }}>
      {/* Dot grid texture */}
      <div style={{ position: "absolute", inset: 0, opacity: .045,
        backgroundImage: "radial-gradient(circle,#C8A84B 1px,transparent 1px)",
        backgroundSize: "36px 36px" }} />
      {/* Top gold stripe — TED red-bar equivalent */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5,
        background: "linear-gradient(90deg,var(--gold),#e8c05a,var(--gold))" }} />

      <div className="hp-wrap" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          {/* Eyebrow */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(200,168,75,.12)", border: "1px solid rgba(200,168,75,.3)",
            color: "var(--gold)", fontSize: 12, fontWeight: 700, padding: "6px 20px",
            borderRadius: 999, marginBottom: 26, letterSpacing: ".4px" }}>
            🌙 منصة BMedia للمحتوى الرقمي
          </div>

          {/* Main headline — TED-style */}
          <h1 style={{
            color: "#fff", margin: "0 0 18px",
            fontSize: "clamp(30px,5.5vw,58px)", fontWeight: 900, lineHeight: 1.15,
            fontFamily: "'Noto Kufi Arabic',sans-serif", letterSpacing: "-.5px",
          }}>
            أفكار تستحق المشاركة
          </h1>

          {/* Sub */}
          <p style={{
            color: "rgba(255,255,255,.6)", margin: "0 0 40px",
            fontSize: "clamp(15px,2vw,18px)", lineHeight: 1.75, maxWidth: 520,
            marginInline: "auto",
          }}>
            تصفّح مكتبة متنوعة من المحتوى — فيديو، صوت، مقالات وصور منتقاة بعناية.
          </p>

          {/* Topic pills */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {TOPICS.map(t => (
              <TopicPill key={t.href} {...t} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TopicPill({ href, icon, label, color }: typeof TOPICS[0]) {
  const [h, setH] = useState(false);
  return (
    <a href={href}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "10px 22px", borderRadius: 999,
        background: h ? color + "40" : color + "20",
        border: `1.5px solid ${h ? color : color + "50"}`,
        color: "#fff", fontSize: 14, fontWeight: 600,
        textDecoration: "none", transition: "all .18s",
        transform: h ? "translateY(-2px)" : "none",
        boxShadow: h ? `0 6px 20px ${color}33` : "none",
      }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      {label}
    </a>
  );
}

/* ─── Content Card (TED-style) ───────────────────────────── */
function ContentCard({ item, mediaType, href }: { item: PublicItem; mediaType: number; href: string }) {
  const [h, setH] = useState(false);
  const meta = TYPE_META[mediaType] ?? TYPE_META[1];

  return (
    <a href={href} style={{ display: "block", textDecoration: "none" }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>

      {/* Thumbnail */}
      <div style={{ position: "relative", paddingTop: "56.25%", overflow: "hidden",
        borderRadius: 6, background: `linear-gradient(135deg,${meta.color}18,${meta.color}30)` }}>
        {item.thumbnailUrl
          ? <img src={item.thumbnailUrl} alt={item.title} loading="lazy"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
                objectFit: "cover", transform: h ? "scale(1.04)" : "scale(1)", transition: "transform .45s" }} />
          : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 36, color: meta.color, opacity: .55 }}>
              {mediaType === 1 ? "🎬" : mediaType === 3 ? "🎧" : mediaType === 5 ? "📄" : "🖼️"}
            </div>
        }
        {/* Type badge */}
        <div style={{ position: "absolute", top: 10, right: 10,
          background: meta.color, color: "#fff",
          fontSize: 11, fontWeight: 700, padding: "3px 11px", borderRadius: 999 }}>
          {meta.label}
        </div>
        {/* Play button overlay for video */}
        {meta.playIcon && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
            justifyContent: "center", background: h ? "rgba(0,0,0,.3)" : "rgba(0,0,0,.15)", transition: "background .2s" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%",
              background: h ? "var(--gold)" : "rgba(255,255,255,.88)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transform: h ? "scale(1.12)" : "scale(1)", transition: "all .2s" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={h ? "var(--forest)" : "#1a1a1a"} style={{ marginRight: -2 }}>
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
          </div>
        )}
        {item.isFeatured && (
          <div style={{ position: "absolute", top: 10, left: 10,
            background: "var(--gold)", color: "var(--forest)",
            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>مميز</div>
        )}
      </div>

      {/* Thin color accent bar */}
      <div style={{ height: 3, background: meta.color, borderRadius: "0 0 2px 2px",
        transform: h ? "scaleX(1)" : "scaleX(.35)",
        transition: "transform .3s", transformOrigin: "right" }} />

      {/* Text */}
      <div style={{ paddingTop: 14 }}>
        <h3 style={{
          color: "var(--ink)", fontSize: 16, fontWeight: 700, lineHeight: 1.45,
          margin: "0 0 7px",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          textDecorationLine: h ? "underline" : "none", textDecorationColor: "var(--gold)",
          textUnderlineOffset: 3,
        }}>
          {item.title}
        </h3>
        {item.summary && (
          <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.55, margin: "0 0 10px",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {item.summary}
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {item.categoryName && (
            <span style={{ fontSize: 12, color: meta.color, fontWeight: 700 }}>{item.categoryName}</span>
          )}
          {item.categoryName && item.publishedAt && (
            <span style={{ fontSize: 12, color: "var(--muted-2)" }}>·</span>
          )}
          {item.publishedAt && (
            <span style={{ fontSize: 12, color: "var(--muted-2)" }}>{fmtDate(item.publishedAt)}</span>
          )}
        </div>
      </div>
    </a>
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div style={{ paddingTop: "56.25%", background: "var(--surface-2)", borderRadius: 6, position: "relative" }} />
      <div style={{ height: 3, background: "var(--surface-2)", marginBottom: 14 }} />
      <div style={{ height: 16, borderRadius: 4, background: "var(--surface-2)", width: "88%", marginBottom: 8 }} />
      <div style={{ height: 13, borderRadius: 4, background: "var(--surface-2)", width: "65%", marginBottom: 8 }} />
      <div style={{ height: 12, borderRadius: 4, background: "var(--surface-2)", width: "40%" }} />
    </div>
  );
}

/* ─── Content Section ──────────────────────────────────────── */
function Section({ title, icon, href, mediaType, count = 4 }:
  { title: string; icon: string; href: string; mediaType: number; count?: number }) {
  const [items, setItems] = useState<PublicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const meta = TYPE_META[mediaType];

  useEffect(() => {
    const ctrl = new AbortController();
    fetchPublicContents({ pageSize: count, mediaType }, ctrl.signal)
      .then(d => { setItems(d.items); setLoading(false); })
      .catch(() => setLoading(false));
    return () => ctrl.abort();
  }, [mediaType, count]);

  return (
    <section style={{ padding: "56px 0 0" }}>
      <div className="hp-wrap">
        {/* Section header — TED style */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 28, paddingBottom: 18,
          borderBottom: `2px solid var(--line)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Left accent bar */}
            <div style={{ width: 4, height: 26, borderRadius: 2, background: meta.color, flexShrink: 0 }} />
            <h2 style={{ color: "var(--ink)", fontWeight: 800, fontSize: 22,
              fontFamily: "'Noto Kufi Arabic',sans-serif", margin: 0,
              display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              {title}
            </h2>
          </div>
          <SeeAll href={href} color={meta.color} />
        </div>

        {/* Grid */}
        <div className="hp-grid">
          {loading
            ? Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)
            : items.length === 0
              ? <p style={{ color: "var(--muted)", fontSize: 14, gridColumn: "1/-1", padding: "20px 0" }}>
                  لا يوجد محتوى حالياً
                </p>
              : items.map(item => (
                  <ContentCard key={item.id} item={item} mediaType={mediaType} href={href} />
                ))
          }
        </div>
      </div>
    </section>
  );
}

function SeeAll({ href, color }: { href: string; color: string }) {
  const [h, setH] = useState(false);
  return (
    <a href={href}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        color: h ? color : "var(--muted)", fontSize: 13, fontWeight: 700,
        textDecoration: "none", padding: "7px 14px", borderRadius: 8,
        border: `1.5px solid ${h ? color + "55" : "var(--line)"}`,
        background: h ? color + "0d" : "transparent",
        transition: "all .15s",
      }}>
      رؤية الكل
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </a>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Hero />
        <NewsTicker />
        <Section title="المشاهدة" icon="🎬" href="/video"    mediaType={1} count={4} />
        <Section title="السماع"   icon="🎧" href="/audio"    mediaType={3} count={4} />
        <Section title="الاطلاع"  icon="📖" href="/articles" mediaType={5} count={4} />
        <Section title="صور"      icon="🖼️" href="/gallery"  mediaType={2} count={4} />
        <div style={{ height: 80 }} />
      </main>
      <Footer />

      <style>{`
        .hp-wrap { max-width: 1280px; margin: 0 auto; padding-inline: 24px; }
        .hp-grid { display: grid; gap: 32px 24px; grid-template-columns: repeat(4,1fr); }
        @media (max-width: 1100px) { .hp-grid { grid-template-columns: repeat(3,1fr); } }
        @media (max-width: 768px)  { .hp-grid { grid-template-columns: repeat(2,1fr); gap: 24px 16px; } }
        @media (max-width: 480px)  { .hp-grid { grid-template-columns: 1fr; gap: 28px; }
                                      .hp-wrap { padding-inline: 16px; } }
      `}</style>
    </div>
  );
}
