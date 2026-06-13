"use client";

import { useEffect, useState } from "react";
import { fetchPublicContents, fetchPublicDetail, fetchSignedUrl, PublicItem } from "@/lib/public";

type GalleryItem = PublicItem & { imageUrl: string | null };

export default function HomeGallerySection() {
  const [items, setItems]     = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const page = await fetchPublicContents({ pageSize: 4, mediaType: 2 }, ctrl.signal);
        const withUrls = await Promise.all(page.items.map(async item => {
          let imageUrl: string | null = item.thumbnailUrl;
          try {
            const detail = await fetchPublicDetail(item.id, ctrl.signal);
            const img = detail.mediaAssets.find(a =>
              ["Image", "image", "2", "Photo", "photo"].includes(a.mediaType)
            );
            if (img) {
              const { url } = await fetchSignedUrl(img.id, ctrl.signal);
              imageUrl = url;
            }
          } catch { /* use thumbnailUrl */ }
          return { ...item, imageUrl };
        }));
        setItems(withUrls.filter(i => i.imageUrl));
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  if (loading) return <SectionSkeleton />;
  if (items.length === 0) return null;

  return (
    <section style={{ paddingBlock: "48px 24px" }}>
      <div className="container-main">
        <SectionHeader title="معرض الصور" label="مرئيات" href="/gallery" linkText="شاهد المعرض" icon="🖼️" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
          {items.map(item => <GalleryCard key={item.id} item={item} />)}
        </div>
      </div>
    </section>
  );
}

function GalleryCard({ item }: { item: GalleryItem }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={`/gallery?open=${item.id}`}
      style={{
        display: "block", borderRadius: 14, overflow: "hidden",
        aspectRatio: "4/3", position: "relative",
        boxShadow: hov ? "var(--shadow-lg)" : "var(--shadow-sm)",
        transform: hov ? "scale(1.03)" : "scale(1)",
        transition: "all .25s", textDecoration: "none",
        background: "var(--surface-3)",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {item.imageUrl && (
        <img src={item.imageUrl} alt={item.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
            filter: hov ? "brightness(1.08)" : "brightness(1)", transition: "filter .25s" }} />
      )}
      <div style={{
        position: "absolute", inset: 0,
        background: hov
          ? "linear-gradient(to top,rgba(0,0,0,.65) 0%,transparent 55%)"
          : "linear-gradient(to top,rgba(0,0,0,.45) 0%,transparent 45%)",
        transition: "background .25s",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 14px",
        opacity: hov ? 1 : 0.85, transition: "opacity .25s",
      }}>
        <p style={{
          margin: 0, color: "#fff", fontSize: 13, fontWeight: 700,
          fontFamily: "'Noto Kufi Arabic',sans-serif",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          textShadow: "0 1px 4px rgba(0,0,0,.6)",
        }}>{item.title}</p>
      </div>
      {/* Zoom icon on hover */}
      {hov && (
        <div style={{
          position: "absolute", top: 10, left: 10,
          width: 32, height: 32, borderRadius: 8,
          background: "rgba(255,255,255,.9)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
        }}>🔍</div>
      )}
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
        <div style={{ height: 30, width: 180, borderRadius: 8, background: "var(--surface-3)", marginBottom: 20 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ borderRadius: 14, background: "var(--surface-3)", aspectRatio: "4/3" }} />
          ))}
        </div>
      </div>
    </section>
  );
}
