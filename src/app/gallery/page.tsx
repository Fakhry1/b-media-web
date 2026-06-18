"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  fetchPublicContents, fetchPublicCategories, fetchPublicDetail, fetchSignedUrl,
  downloadBlob, type PublicItem, type PubCategory,
} from "@/lib/public";

const PAGE_SIZE = 16;
const CATEGORY_NAME = "الصور";
const MEDIA_TYPE = 2; // Image

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
}

function SkeletonCard() {
  return (
    <div className="animate-pulse" style={{ borderRadius: 16, overflow: "hidden",
      background: "var(--surface)", border: "1px solid var(--line)" }}>
      <div style={{ paddingTop: "75%", background: "var(--surface-2)" }} />
      <div style={{ padding: "12px 14px" }}>
        <div style={{ height: 13, borderRadius: 6, background: "var(--surface-2)", width: "70%", marginBottom: 6 }} />
        <div style={{ height: 11, borderRadius: 6, background: "var(--surface-2)", width: "45%" }} />
      </div>
    </div>
  );
}

function ImageCard({ item, onClick }: { item: PublicItem; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  const palette = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EC4899", "#06B6D4", "#EF4444"];
  const color = palette[item.title.charCodeAt(0) % palette.length];

  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ borderRadius: 16, overflow: "hidden", cursor: "pointer", background: "var(--surface)",
        border: "1px solid var(--line)", boxShadow: hover ? "var(--shadow-md)" : "var(--shadow-sm)",
        transform: hover ? "translateY(-3px)" : "none", transition: "all .2s" }}>
      <div style={{ position: "relative", paddingTop: "75%", overflow: "hidden" }}>
        {item.thumbnailUrl
          ? <img src={item.thumbnailUrl} alt={item.title} loading="lazy"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
                transform: hover ? "scale(1.05)" : "scale(1)", transition: "transform .3s" }} />
          : <div style={{ position: "absolute", inset: 0,
              background: `linear-gradient(135deg, ${color}55 0%, ${color}22 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21,15 16,10 5,21" />
              </svg>
            </div>
        }
        <div style={{ position: "absolute", inset: 0, background: hover ? "rgba(0,0,0,.3)" : "transparent",
          transition: "background .2s", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {hover && (
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,.9)",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
          )}
        </div>
        {item.isFeatured && (
          <div style={{ position: "absolute", top: 10, right: 10, background: "var(--gold)",
            color: "var(--forest)", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>مميز</div>
        )}
      </div>
      <div style={{ padding: "12px 14px" }}>
        <h3 style={{ color: "var(--ink)", fontSize: 14, fontWeight: 700, lineHeight: 1.4, margin: "0 0 6px",
          display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {item.title}
        </h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {item.categoryName && (
            <span style={{ fontSize: 11, color, fontWeight: 600 }}>{item.categoryName}</span>
          )}
          {item.publishedAt && (
            <span style={{ fontSize: 11, color: "var(--muted-2)" }}>{formatDate(item.publishedAt)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ImageLightbox({ item, onClose }: { item: PublicItem; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState<string | null>(null);
  const [err, setErr] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchPublicDetail(item.id, ctrl.signal)
      .then(async d => {
        const asset = d.mediaAssets.find(a =>
          a.mediaType.toLowerCase().includes("image") || a.mediaType === "2"
        );
        if (!asset) {
          if (item.thumbnailUrl) { setUrl(item.thumbnailUrl); setLoading(false); return; }
          setErr(true); setLoading(false); return;
        }
        const signed = await fetchSignedUrl(asset.id, ctrl.signal);
        setUrl(signed.url); setLoading(false);
      })
      .catch(e => { if (e.name !== "AbortError") { setErr(true); setLoading(false); } });
    return () => ctrl.abort();
  }, [item.id, item.thumbnailUrl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,.88)",
      backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: "var(--surface)", borderRadius: 20, width: "100%", maxWidth: 860,
          maxHeight: "92vh", overflow: "auto", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          padding: "18px 22px 14px", borderBottom: "1px solid var(--line)" }}>
          <div>
            <h2 style={{ color: "var(--ink)", fontWeight: 700, fontSize: 17, margin: 0 }}>{item.title}</h2>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              {item.categoryName && <span style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600 }}>{item.categoryName}</span>}
              {item.publishedAt && <span style={{ fontSize: 12, color: "var(--muted-2)" }}>{formatDate(item.publishedAt)}</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--line)",
            background: "var(--surface-2)", cursor: "pointer", fontSize: 20, color: "var(--muted)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
        </div>
        {item.summary && <p style={{ padding: "10px 22px 0", color: "var(--muted)", fontSize: 13, margin: 0 }}>{item.summary}</p>}
        <div style={{ padding: 22 }}>
          {loading && (
            <div style={{ paddingTop: "60%", position: "relative", background: "var(--surface-2)", borderRadius: 12 }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--gold)",
                  borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
                <p style={{ color: "var(--muted)", fontSize: 14 }}>جارٍ التحميل...</p>
              </div>
            </div>
          )}
          {err && !loading && <p style={{ textAlign: "center", color: "var(--muted)", padding: "40px 0" }}>تعذّر تحميل الصورة</p>}
          {url && !loading && (
            <div style={{ textAlign: "center" }}>
              <img src={url} alt={item.title} style={{ maxWidth: "100%", borderRadius: 12, display: "block", margin: "0 auto" }} />
              <button disabled={downloading}
                onClick={async () => {
                  setDownloading(true);
                  try { await downloadBlob(url, item.title + ".jpg"); } finally { setDownloading(false); }
                }}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14,
                  padding: "8px 20px", borderRadius: 10, border: "none",
                  background: downloading ? "var(--line)" : "var(--forest)", color: downloading ? "var(--muted)" : "#fff",
                  fontSize: 13, fontWeight: 600, cursor: downloading ? "default" : "pointer" }}>
                {downloading ? "جارٍ التحميل..." : "⬇ تحميل الصورة"}
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Pagination({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= totalPages - 3) return totalPages - 6 + i;
    return page - 3 + i;
  });
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 40, flexWrap: "wrap" }}>
      <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
        style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid var(--line)",
          background: "var(--surface)", color: page === 1 ? "var(--muted-2)" : "var(--ink)",
          cursor: page === 1 ? "default" : "pointer", fontSize: 13 }}>السابق</button>
      {pages.map(p => (
        <button key={p} onClick={() => setPage(p)}
          style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid",
            borderColor: p === page ? "var(--gold)" : "var(--line)",
            background: p === page ? "var(--gold)" : "var(--surface)",
            color: p === page ? "var(--forest)" : "var(--ink)",
            fontWeight: p === page ? 700 : 400, cursor: "pointer", fontSize: 13 }}>{p}</button>
      ))}
      <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
        style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid var(--line)",
          background: "var(--surface)", color: page === totalPages ? "var(--muted-2)" : "var(--ink)",
          cursor: page === totalPages ? "default" : "pointer", fontSize: 13 }}>التالي</button>
    </div>
  );
}

export default function GalleryPage() {
  const [pageCategory, setPageCategory] = useState<PubCategory | null>(null);
  const [subId, setSubId] = useState<string | null>(null);
  const [items, setItems] = useState<PublicItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeItem, setActiveItem] = useState<PublicItem | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchPublicCategories(ctrl.signal)
      .then(cats => {
        const cat = cats.find(c => c.name === CATEGORY_NAME) ?? null;
        setPageCategory(cat);
        if (!cat) setLoading(false);
      })
      .catch(e => { if (e.name !== "AbortError") { setError(true); setLoading(false); } });
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    if (!pageCategory) return;
    const ctrl = new AbortController();
    setLoading(true); setError(false);
    fetchPublicContents(
      { page, pageSize: PAGE_SIZE, categoryId: pageCategory.id,
        subcategoryId: subId ?? undefined, mediaType: MEDIA_TYPE },
      ctrl.signal
    )
      .then(d => { setItems(d.items); setTotalPages(d.totalPages); })
      .catch(e => { if (e.name !== "AbortError") setError(true); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [pageCategory, page, subId]);

  const handleSub = useCallback((id: string | null) => { setSubId(id); setPage(1); }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <Header />
      <main style={{ flex: 1 }}>
        <div style={{ padding: "28px 0 0", borderBottom: "1px solid var(--line)" }}>
          <div className="container-main">
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)", fontFamily: "'Noto Kufi Arabic',sans-serif" }}>
              🖼️ {CATEGORY_NAME}
            </h1>
            <p style={{ color: "var(--muted)", marginTop: 4, fontSize: 14 }}>استعرض مجموعة الصور</p>

            {/* Subcategory tabs */}
            <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "16px 0 0", scrollbarWidth: "none" }}>
              <button onClick={() => handleSub(null)}
                style={{ flexShrink: 0, padding: "7px 20px", borderRadius: 999, border: "1px solid",
                  borderColor: subId === null ? "var(--gold)" : "var(--line)",
                  background: subId === null ? "var(--gold)" : "transparent",
                  color: subId === null ? "var(--forest)" : "var(--ink)",
                  fontWeight: 600, fontSize: 13, cursor: "pointer" }}>الكل</button>
              {(pageCategory?.subcategories ?? []).map(sub => (
                <button key={sub.id} onClick={() => handleSub(sub.id)}
                  style={{ flexShrink: 0, padding: "7px 20px", borderRadius: 999, border: "1px solid",
                    borderColor: subId === sub.id ? "var(--gold)" : "var(--line)",
                    background: subId === sub.id ? "var(--gold)" : "transparent",
                    color: subId === sub.id ? "var(--forest)" : "var(--ink)",
                    fontWeight: 600, fontSize: 13, cursor: "pointer" }}>{sub.name}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="container-main" style={{ padding: "32px 0 48px" }}>
          {error && <p style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>حدث خطأ أثناء التحميل</p>}
          {loading ? (
            <div className="ggrid">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : !error && items.length === 0 ? (
            <p style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>لا توجد صور في هذا القسم حالياً</p>
          ) : !error && (
            <div className="ggrid">
              {items.map(item => (
                <ImageCard key={item.id} item={item} onClick={() => setActiveItem(item)} />
              ))}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </div>
      </main>
      <Footer />
      {activeItem && <ImageLightbox item={activeItem} onClose={() => setActiveItem(null)} />}
      <style>{`
        .container-main { max-width: 1280px; margin: 0 auto; padding-inline: 24px; }
        .ggrid { display: grid; gap: 20px; grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 1280px) { .ggrid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px)  { .ggrid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px)  { .ggrid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
