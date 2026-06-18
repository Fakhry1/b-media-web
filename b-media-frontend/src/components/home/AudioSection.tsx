"use client";

import { useEffect, useState } from "react";
import { fetchPublicContents, PublicItem } from "@/lib/public";
import { useLang } from "@/lib/LangContext";

export default function HomeAudioSection() {
  const { t } = useLang();
  const [items, setItems]     = useState<PublicItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchPublicContents({ pageSize: 4, mediaType: 3 }, ctrl.signal)
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
        <SectionHeader title={t.audioSectionTitle} label={t.audioSectionLabel} href="/audio" linkText={t.audioSectionLink} icon="🎙️" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 }}>
          {items.map((item, idx) => <AudioCard key={item.id} item={item} index={idx} />)}
        </div>
      </div>
    </section>
  );
}

const AUDIO_BG = [
  "linear-gradient(135deg,#0B2318,#1A4332)",
  "linear-gradient(135deg,#142e22,#0b1f16)",
  "linear-gradient(135deg,#1a3a2a,#0d2318)",
  "linear-gradient(135deg,#0f2a1d,#162b20)",
];

function AudioCard({ item, index }: { item: PublicItem; index: number }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={`/audio?open=${item.id}`}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "16px 18px", borderRadius: 16,
        background: hov ? AUDIO_BG[index % AUDIO_BG.length] : "var(--surface)",
        border: `1px solid ${hov ? "var(--line-gold)" : "var(--line)"}`,
        boxShadow: hov ? "var(--shadow-md)" : "var(--shadow-sm)",
        transform: hov ? "translateY(-3px)" : "none",
        transition: "all .22s", textDecoration: "none",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Icon */}
      <div style={{
        flexShrink: 0, width: 52, height: 52, borderRadius: 14,
        background: hov ? "rgba(200,168,75,.20)" : "rgba(11,35,24,.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24, transition: "background .22s",
      }}>
        {hov ? "▶️" : "🎙️"}
      </div>
      {/* Text */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{
          margin: 0, fontSize: 14, fontWeight: 700, lineHeight: 1.45,
          color: hov ? "#fff" : "var(--ink)",
          fontFamily: "'Noto Kufi Arabic',sans-serif",
          transition: "color .22s",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{item.title}</p>
        {item.categoryName && (
          <span style={{
            display: "inline-block", marginTop: 6, fontSize: 11, fontWeight: 700,
            padding: "2px 8px", borderRadius: 6,
            background: hov ? "rgba(200,168,75,.25)" : "rgba(11,35,24,.07)",
            color: hov ? "var(--gold)" : "var(--muted)",
            transition: "all .22s",
          }}>{item.categoryName}</span>
        )}
      </div>
      {/* Arrow */}
      <div style={{ fontSize: 20, color: hov ? "var(--gold)" : "var(--muted-2)", flexShrink: 0, transition: "color .22s" }}>‹</div>
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
        transition: "all .2s", background: "transparent",
        fontFamily: "'Noto Kufi Arabic',sans-serif",
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--gold)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
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
        <div style={{ height: 30, width: 220, borderRadius: 8, background: "var(--surface-3)", marginBottom: 20 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ borderRadius: 16, background: "var(--surface-3)", height: 84 }} />
          ))}
        </div>
      </div>
    </section>
  );
}
