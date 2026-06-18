"use client";

import { useEffect, useState } from "react";
import { fetchPublicContents, PublicItem } from "@/lib/public";

export default function HomeVideoSection() {
  const [items, setItems]     = useState<PublicItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchPublicContents({ pageSize: 4, mediaType: 1 }, ctrl.signal)
      .then(p => setItems(p.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  if (loading) return <SectionSkeleton />;
  if (items.length === 0) return null;

  return (
    <section style={{ paddingBlock: "48px 24px", background: "var(--surface-2)" }}>
      <div className="container-main">
        <SectionHeader
          label="محتوى مرئي" title="أحدث الفيديوهات"
          href="/video" linkText="شاهد الكل"
          icon="🎬"
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 }}>
          {items.map(item => <VideoCard key={item.id} item={item} />)}
        </div>
      </div>
    </section>
  );
}

function VideoCard({ item }: { item: PublicItem }) {
  const [hov, setHov] = useState(false);

  const GRADIENTS = [
    "linear-gradient(145deg,#142820,#081A10)",
    "linear-gradient(145deg,#1A1408,#0D0B06)",
    "linear-gradient(145deg,#0C1E28,#06101A)",
    "linear-gradient(145deg,#1C1428,#0C0814)",
  ];
  const bg = item.thumbnailUrl
    ? undefined
    : GRADIENTS[Math.abs(item.id.charCodeAt(0)) % GRADIENTS.length];

  return (
    <a
      href={`/video?open=${item.id}`}
      style={{
        borderRadius: 16, overflow: "hidden", display: "block",
        background: "var(--surface)", border: "1px solid var(--line)",
        boxShadow: hov ? "var(--shadow-lg)" : "var(--shadow-sm)",
        transform: hov ? "translateY(-4px)" : "none",
        transition: "all .22s", textDecoration: "none",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", aspectRatio: "16/10", background: bg, overflow: "hidden" }}>
        {item.thumbnailUrl && (
          <img src={item.thumbnailUrl} alt={item.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 30%,rgba(0,0,0,.55))" }} />
        {/* Play button */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: `translate(-50%,-50%) scale(${hov ? 1.12 : 1})`,
          width: 50, height: 50, borderRadius: "50%",
          background: "rgba(200,168,75,.92)",
          boxShadow: "0 6px 20px rgba(200,168,75,.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform .22s",
        }}>
          <div style={{
            borderRight: "14px solid var(--forest)",
            borderTop: "9px solid transparent",
            borderBottom: "9px solid transparent",
            transform: "translateX(2px)",
          }} />
        </div>
        {/* Category badge */}
        {item.categoryName && (
          <span style={{
            position: "absolute", top: 10, right: 10,
            fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 8,
            background: "var(--gold)", color: "var(--forest)",
          }}>{item.categoryName}</span>
        )}
      </div>
      {/* Title */}
      <div style={{ padding: "12px 14px" }}>
        <p style={{
          margin: 0, fontSize: 14, fontWeight: 700, lineHeight: 1.5,
          color: "var(--ink)", fontFamily: "'Noto Kufi Arabic',sans-serif",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{item.title}</p>
        {item.publishedAt && (
          <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--muted)" }}>
            {new Date(item.publishedAt).toLocaleDateString("ar-SA")}
          </p>
        )}
      </div>
    </a>
  );
}

function SectionHeader({ label, title, href, linkText, icon }: {
  label: string; title: string; href: string; linkText: string; icon: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <div style={{ width: 20, height: 2, background: "var(--gold)", borderRadius: 99 }} />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: "var(--gold)", textTransform: "uppercase" }}>{label}</span>
        </div>
        <h2 style={{ margin: 0, fontFamily: "'Noto Kufi Arabic',sans-serif", fontSize: "clamp(18px,3vw,26px)", fontWeight: 800, color: "var(--ink)" }}>
          {title}
        </h2>
      </div>
      <a href={href} style={{
        flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6,
        padding: "8px 18px", borderRadius: 12,
        border: "1px solid var(--line-gold)", color: "var(--forest)",
        fontSize: 13, fontWeight: 700, textDecoration: "none",
        transition: "all .2s",
        background: "transparent",
        fontFamily: "'Noto Kufi Arabic',sans-serif",
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--gold)"; (e.currentTarget as HTMLElement).style.color = "var(--forest)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--forest)"; }}
      >
        {linkText} ←
      </a>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <section style={{ paddingBlock: "48px 24px", background: "var(--surface-2)" }}>
      <div className="container-main">
        <div style={{ height: 30, width: 180, borderRadius: 8, background: "var(--surface-3)", marginBottom: 20 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ borderRadius: 16, overflow: "hidden", background: "var(--surface-3)", aspectRatio: "4/3" }} />
          ))}
        </div>
      </div>
    </section>
  );
}
