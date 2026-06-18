"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  fetchPublicContents, fetchPublicCategories, fetchPublicDetail, fetchSignedUrl,
  downloadBlob, type PublicItem, type PubCategory,
} from "@/lib/public";
import { useLang } from "@/lib/LangContext";

const PAGE_SIZE = 10;
const CATEGORY_NAME = "المشاهدة";
const MEDIA_TYPE = 1; // Video

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
}

function FeaturedBadge() {
  const { t } = useLang();
  return (
    <div style={{ position: "absolute", top: 12, right: 12, background: "var(--gold)", color: "var(--forest)",
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{t.featured}</div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
      <div style={{ paddingTop: "56.25%", background: "var(--surface-2)" }} />
      <div className="p-4">
        <div style={{ height: 14, borderRadius: 6, background: "var(--surface-2)", width: "80%", marginBottom: 8 }} />
        <div style={{ height: 12, borderRadius: 6, background: "var(--surface-2)", width: "50%" }} />
      </div>
    </div>
  );
}

function VideoCard({ item, onClick, featured }: { item: PublicItem; onClick: () => void; featured?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className={featured ? "col-span-full" : ""}
      style={{ borderRadius: 20, overflow: "hidden", cursor: "pointer", background: "var(--surface)",
        border: "1px solid var(--line)", boxShadow: hover ? "var(--shadow-md)" : "var(--shadow-sm)",
        transform: hover ? "translateY(-2px)" : "none", transition: "all .2s" }}>
      <div style={{ position: "relative", paddingTop: featured ? "38%" : "56.25%", overflow: "hidden" }}>
        {item.thumbnailUrl
          ? <img src={item.thumbnailUrl} alt={item.title} loading="lazy"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ position: "absolute", inset: 0,
              background: "linear-gradient(135deg, var(--forest) 0%, #0f2d1e 100%)" }} />
        }
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: hover ? "rgba(0,0,0,.38)" : "rgba(0,0,0,.18)", transition: "background .2s" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%",
            background: hover ? "var(--gold)" : "rgba(255,255,255,.88)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,.3)",
            transform: hover ? "scale(1.12)" : "scale(1)", transition: "all .2s" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={hover ? "var(--forest)" : "#1a1a1a"} style={{ marginRight: -2 }}>
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        </div>
        {item.isFeatured && <FeaturedBadge />}
      </div>
      <div className="p-4">
        <h3 style={{ color: "var(--ink)", fontSize: featured ? 18 : 15, fontWeight: 700, lineHeight: 1.4, marginBottom: 6,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {item.title}
        </h3>
        {featured && item.summary && (
          <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 8,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {item.summary}
          </p>
        )}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {item.categoryName && <span style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600 }}>{item.categoryName}</span>}
          {item.publishedAt && <span style={{ fontSize: 11, color: "var(--muted-2)" }}>{formatDate(item.publishedAt)}</span>}
        </div>
      </div>
    </div>
  );
}

function VideoModal({ item, onClose }: { item: PublicItem; onClose: () => void }) {
  const { t } = useLang();
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState<string | null>(null);
  const [err, setErr] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchPublicDetail(item.id, ctrl.signal)
      .then(async d => {
        const asset = d.mediaAssets.find(a => a.mediaType.toLowerCase().includes("video"));
        if (!asset) { setErr(true); setLoading(false); return; }
        const signed = await fetchSignedUrl(asset.id, ctrl.signal);
        setUrl(signed.url); setLoading(false);
      })
      .catch(e => { if (e.name !== "AbortError") { setErr(true); setLoading(false); } });
    return () => ctrl.abort();
  }, [item.id]);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,.78)",
      backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: "var(--surface)", borderRadius: 20, width: "100%", maxWidth: 900,
          maxHeight: "90vh", overflow: "auto", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          padding: "20px 24px 16px", borderBottom: "1px solid var(--line)" }}>
          <div>
            <h2 style={{ color: "var(--ink)", fontWeight: 700, fontSize: 18 }}>{item.title}</h2>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              {item.categoryName && <span style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600 }}>{item.categoryName}</span>}
              {item.publishedAt && <span style={{ fontSize: 12, color: "var(--muted-2)" }}>{formatDate(item.publishedAt)}</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--line)",
            background: "var(--surface-2)", cursor: "pointer", fontSize: 20, color: "var(--muted)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
        </div>
        {item.summary && <p style={{ padding: "12px 24px 0", color: "var(--muted)", fontSize: 14 }}>{item.summary}</p>}
        <div style={{ padding: 24 }}>
          {loading && (
            <div style={{ paddingTop: "56.25%", position: "relative", background: "var(--surface-2)", borderRadius: 12 }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--gold)",
                  borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
                <p style={{ color: "var(--muted)", fontSize: 14 }}>{t.loading}</p>
              </div>
            </div>
          )}
          {err && !loading && <p style={{ textAlign: "center", color: "var(--muted)", padding: "40px 0" }}>{t.videoLoadError}</p>}
          {url && !loading && (
            <>
              <video controls autoPlay style={{ width: "100%", borderRadius: 12, background: "#000" }} src={url}>
                {t.browserNoVideo}
              </video>
              <div style={{ textAlign: "center", marginTop: 14 }}>
                <button disabled={downloading}
                  onClick={async () => {
                    setDownloading(true);
                    try { await downloadBlob(url, item.title + ".mp4"); } finally { setDownloading(false); }
                  }}
                  style={{ padding: "8px 22px", borderRadius: 10, border: "none",
                    background: downloading ? "var(--line)" : "var(--forest)", color: "#fff",
                    fontSize: 13, fontWeight: 600, cursor: downloading ? "default" : "pointer" }}>
                  {downloading ? t.downloading : t.downloadVideo}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Pagination({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (p: number) => void }) {
  const { t } = useLang();
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
          cursor: page === 1 ? "default" : "pointer", fontSize: 13 }}>{t.prev}</button>
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
          cursor: page === totalPages ? "default" : "pointer", fontSize: 13 }}>{t.next}</button>
    </div>
  );
}

export default function VideoPage() {
  const { t } = useLang();
  const [pageCategory, setPageCategory] = useState<PubCategory | null>(null);
  const [subId, setSubId] = useState<string | null>(null);
  const [items, setItems] = useState<PublicItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const modalItem = items.find(i => i.id === activeModal) ?? null;

  // Find the fixed category
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

  // Fetch content once category is known
  useEffect(() => {
    if (!pageCategory) return;
    const ctrl = new AbortController();
    setLoading(true); setError(false);
    fetchPublicContents(
      { page, pageSize: PAGE_SIZE, categoryId: pageCategory.id, subcategoryId: subId ?? undefined, mediaType: MEDIA_TYPE },
      ctrl.signal
    )
      .then(d => { setItems(d.items); setTotalPages(d.totalPages); })
      .catch(e => { if (e.name !== "AbortError") setError(true); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [pageCategory, page, subId]);

  const handleSub = useCallback((id: string | null) => { setSubId(id); setPage(1); }, []);

  const featuredItem = items.find(i => i.isFeatured) ?? null;
  const gridItems = featuredItem ? items.filter(i => i.id !== featuredItem.id) : items;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <Header />
      <main style={{ flex: 1 }}>
        {/* Hero */}
        <div style={{ padding: "28px 0 0", borderBottom: "1px solid var(--line)" }}>
          <div className="container-main">
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)", fontFamily: "'Noto Kufi Arabic',sans-serif" }}>
              🎬 {CATEGORY_NAME}
            </h1>
            <p style={{ color: "var(--muted)", marginTop: 4, fontSize: 14 }}>{t.browseAllVideos}</p>

            {/* Subcategory tabs */}
            <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "16px 0 0", scrollbarWidth: "none" }}>
              <button onClick={() => handleSub(null)}
                style={{ flexShrink: 0, padding: "7px 20px", borderRadius: 999, border: "1px solid",
                  borderColor: subId === null ? "var(--gold)" : "var(--line)",
                  background: subId === null ? "var(--gold)" : "transparent",
                  color: subId === null ? "var(--forest)" : "var(--ink)",
                  fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all .15s" }}>
                {t.all}
              </button>
              {(pageCategory?.subcategories ?? []).map(sub => (
                <button key={sub.id} onClick={() => handleSub(sub.id)}
                  style={{ flexShrink: 0, padding: "7px 20px", borderRadius: 999, border: "1px solid",
                    borderColor: subId === sub.id ? "var(--gold)" : "var(--line)",
                    background: subId === sub.id ? "var(--gold)" : "transparent",
                    color: subId === sub.id ? "var(--forest)" : "var(--ink)",
                    fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all .15s" }}>
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container-main" style={{ padding: "32px 0 48px" }}>
          {error && <p style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>{t.loadingError}</p>}
          {loading ? (
            <div className="vgrid">{Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : !error && items.length === 0 ? (
            <p style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>{t.noVideos}</p>
          ) : !error && (
            <>
              {featuredItem && <div style={{ marginBottom: 28 }}><VideoCard item={featuredItem} onClick={() => setActiveModal(featuredItem.id)} featured /></div>}
              <div className="vgrid">{gridItems.map(item => <VideoCard key={item.id} item={item} onClick={() => setActiveModal(item.id)} />)}</div>
            </>
          )}
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </div>
      </main>
      <Footer />
      {activeModal && modalItem && <VideoModal item={modalItem} onClose={() => setActiveModal(null)} />}
      <style>{`
        .container-main { max-width: 1280px; margin: 0 auto; padding-inline: 24px; }
        .vgrid { display: grid; gap: 24px; grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 1024px) { .vgrid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px)  { .vgrid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
