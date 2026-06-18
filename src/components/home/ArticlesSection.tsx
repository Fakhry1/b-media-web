"use client";

import { useEffect, useState } from "react";
import { fetchPublicContents, PublicItem } from "@/lib/public";
import { useLang } from "@/lib/LangContext";

export default function HomeArticlesSection() {
  const { t } = useLang();
  const [items, setItems]     = useState<PublicItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchPublicContents({ pageSize: 4 }, ctrl.signal)
      .then(p => setItems(p.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  if (loading) return <SectionSkeleton />;
  if (items.length === 0) return null;

  return (
    <section style={{ paddingBlock: "48px 24px" }}>
      <div className="container-main">
        <SectionHeader title={t.articlesSectionTitle} label={t.articlesSectionLabel} href="/articles" linkText={t.articlesSectionLink} icon="📖" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 18 }}>
          {items.map((item, idx) => <ArticleCard key={item.id} item={item} index={idx} />)}
        </div>
      </div>
    </section>
  );
}

const CARD_PALETTES = [
  { bg: "linear-gradient(135deg,#deeadc,#eff5ed)", accent: "#1A4332" },
  { bg: "linear-gradient(135deg,#f0e8d8,#faf3e6)", accent: "#7A5000" },
  { bg: "linear-gradient(135deg,#e5eae8,#f2f5f3)", accent: "#264D3B" },
  { bg: "linear-gradient(135deg,#e8e5ea,#f5f2f5)", accent: "#3B2664" },
];

function ArticleCard({ item, index }: { item: PublicItem; index: number }) {
  const [hov, setHov] = useState(false);
  const palette = CARD_PALETTES[index % CARD_PALETTES.length];

  return (
    <a
      href={`/articles/${item.id}`}
      style={{
        display: "flex", flexDirection: "column", borderRadius: 18, overflow: "hidden",
        background: "var(--surface)", border: `1px solid ${hov ? "var(--line-gold)" : "var(--line)"}`,
        boxShadow: hov ? "var(--shadow-md)" : "var(--shadow-sm)",
        transform: hov ? "translateY(-4px)" : "none",
        transition: "all .22s", textDecoration: "none",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Card header color block */}
      <div style={{ height: 100, background: item.thumbnailUrl ? undefined : palette.bg, position: "relative", overflow: "hidden" }}>
        {item.thumbnailUrl
          ? <img src={item.thumbnailUrl} alt={item.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 36, opacity: .4 }}>📄</span>
            </div>
          )
        }
        {item.categoryName && (
          <span style={{
            position: "absolute", bottom: 10, right: 12,
            fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 8,
            background: "rgba(255,255,255,.92)", color: palette.accent,
          }}>{item.categoryName}</span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {item.publishedAt && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 16, height: 2, background: "var(--gold)", borderRadius: 99 }} />
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              {new Date(item.publishedAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        )}
        <h3 style={{
          margin: 0, fontSize: 15, fontWeight: 700, lineHeight: 1.5, color: "var(--ink)",
          fontFamily: "'Noto Kufi Arabic',sans-serif",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{item.title}</h3>
        {item.summary && (
          <p style={{
            margin: 0, fontSize: 13, color: "var(--muted)", lineHeight: 1.65,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>{item.summary}</p>
        )}
        <div style={{
          marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--line)",
          display: "flex", justifyContent: "flex-end",
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--forest)" }}>{t.readMore} ←</span>
        </div>
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
    <section style={{ paddingBlock: "48px 24px" }}>
      <div className="container-main">
        <div style={{ height: 30, width: 200, borderRadius: 8, background: "var(--surface-3)", marginBottom: 20 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 18 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ borderRadius: 18, background: "var(--surface-3)", height: 220 }} />
          ))}
        </div>
      </div>
    </section>
  );
}
