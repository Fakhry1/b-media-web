"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  fetchPublicContents, fetchPublicCategories, fetchPublicDetail, fetchSignedUrl,
  downloadBlob, type PublicItem, type PubCategory,
} from "@/lib/public";

const PAGE_SIZE = 12;
const CATEGORY_NAME = "الاطلاع";
const MEDIA_TYPE = 5; // PDF

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
}

function SkeletonCard({ large }: { large?: boolean }) {
  return (
    <div className="animate-pulse" style={{ borderRadius: 20, background: "var(--surface)",
      border: "1px solid var(--line)", height: large ? 220 : 180, overflow: "hidden" }}>
      <div style={{ height: large ? 8 : 5, background: "var(--surface-2)" }} />
      <div style={{ padding: 16 }}>
        <div style={{ height: 14, borderRadius: 6, background: "var(--surface-2)", width: "75%", marginBottom: 8 }} />
        <div style={{ height: 12, borderRadius: 6, background: "var(--surface-2)", width: "50%", marginBottom: 8 }} />
        <div style={{ height: 12, borderRadius: 6, background: "var(--surface-2)", width: "65%" }} />
      </div>
    </div>
  );
}

function ArticleCard({ item, large, onClick, onDownload, isDownloading }: {
  item: PublicItem; large?: boolean; onClick: () => void;
  onDownload: (e: React.MouseEvent) => void; isDownloading: boolean;
}) {
  const [hover, setHover] = useState(false);
  const palette = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EC4899", "#06B6D4"];
  const color = palette[item.title.charCodeAt(0) % palette.length];
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ borderRadius: 20, overflow: "hidden", cursor: "pointer", background: "var(--surface)",
        border: "1px solid var(--line)", boxShadow: hover ? "var(--shadow-md)" : "var(--shadow-sm)",
        transform: hover ? "translateY(-2px)" : "none", transition: "all .2s",
        display: "flex", flexDirection: "column" }}>
      <div style={{ height: large ? 8 : 5, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
      <div style={{ padding: large ? "20px 22px" : "16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {item.categoryName && (
          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
            alignSelf: "flex-start", background: `${color}18`, color }}>{item.categoryName}</span>
        )}
        <h3 style={{ color: "var(--ink)", fontWeight: 700, lineHeight: 1.45, fontSize: large ? 18 : 15, margin: 0,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {item.title}
        </h3>
        {item.summary && (
          <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6, margin: 0,
            display: "-webkit-box", WebkitLineClamp: large ? 3 : 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {item.summary}
          </p>
        )}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: "auto", flexWrap: "wrap" }}>
          {item.publishedAt && <span style={{ fontSize: 11, color: "var(--muted-2)" }}>{formatDate(item.publishedAt)}</span>}
          {item.isFeatured && (
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20,
              background: "rgba(200,168,75,.15)", color: "var(--forest)", fontWeight: 700 }}>مميز</span>
          )}
          <span style={{ marginInlineStart: "auto", fontSize: 12, color, fontWeight: 600 }}>📋 PDF</span>
          <button disabled={isDownloading} onClick={onDownload}
            style={{ padding: "4px 12px", borderRadius: 8, border: `1px solid ${color}44`,
              background: isDownloading ? "var(--line)" : `${color}12`,
              color: isDownloading ? "var(--muted)" : color,
              fontSize: 12, fontWeight: 600, cursor: isDownloading ? "default" : "pointer" }}>
            {isDownloading ? "..." : "⬇ تحميل"}
          </button>
        </div>
      </div>
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

export default function ArticlesPage() {
  const [pageCategory, setPageCategory] = useState<PubCategory | null>(null);
  const [subId, setSubId] = useState<string | null>(null);
  const [lang, setLang] = useState<string | null>(null);
  const [items, setItems] = useState<PublicItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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
        subcategoryId: subId ?? undefined, language: lang ?? undefined, mediaType: MEDIA_TYPE },
      ctrl.signal
    )
      .then(d => { setItems(d.items); setTotalPages(d.totalPages); })
      .catch(e => { if (e.name !== "AbortError") setError(true); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [pageCategory, page, subId, lang]);

  const handleSub = useCallback((id: string | null) => { setSubId(id); setPage(1); }, []);
  const handleLang = useCallback((l: string | null) => { setLang(l); setPage(1); }, []);

  async function handleDownload(item: PublicItem, e: React.MouseEvent) {
    e.stopPropagation();
    if (downloadingId) return;
    setDownloadingId(item.id);
    try {
      const detail = await fetchPublicDetail(item.id);
      const asset = detail.mediaAssets.find(a =>
        a.mediaType.toLowerCase().includes("pdf") || a.mediaType === "5"
      );
      if (!asset) return;
      const { url } = await fetchSignedUrl(asset.id);
      await downloadBlob(url, item.title + ".pdf");
    } catch { /* ignore */ } finally { setDownloadingId(null); }
  }

  const featured = items[0] ?? null;
  const rest = items.slice(1);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <Header />
      <main style={{ flex: 1 }}>
        <div style={{ padding: "28px 0 0", borderBottom: "1px solid var(--line)" }}>
          <div className="container-main">
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)", fontFamily: "'Noto Kufi Arabic',sans-serif" }}>
                  📋 {CATEGORY_NAME}
                </h1>
                <p style={{ color: "var(--muted)", marginTop: 4, fontSize: 14 }}>اطلع على الملفات والمستندات</p>
              </div>
              {/* Language chips */}
              <div style={{ display: "flex", gap: 6 }}>
                {([{ key: null, label: "الكل" }, { key: "ar", label: "عربي" }, { key: "en", label: "English" }] as const).map(opt => (
                  <button key={opt.key ?? "all"} onClick={() => handleLang(opt.key ?? null)}
                    style={{ padding: "6px 14px", borderRadius: 999, border: "1px solid",
                      borderColor: lang === opt.key ? "var(--forest)" : "var(--line)",
                      background: lang === opt.key ? "var(--forest)" : "transparent",
                      color: lang === opt.key ? "#fff" : "var(--muted)",
                      fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{opt.label}</button>
                ))}
              </div>
            </div>
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
            <div>
              <SkeletonCard large />
              <div className="agrid" style={{ marginTop: 24 }}>
                {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            </div>
          ) : !error && items.length === 0 ? (
            <p style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>لا توجد مستندات في هذا القسم حالياً</p>
          ) : !error && (
            <>
              {featured && (
                <div style={{ marginBottom: 28 }}>
                  <ArticleCard item={featured} large
                    onClick={() => { window.location.href = `/articles/${featured.id}`; }}
                    onDownload={e => handleDownload(featured, e)}
                    isDownloading={downloadingId === featured.id} />
                </div>
              )}
              {rest.length > 0 && (
                <div className="agrid">
                  {rest.map(item => (
                    <ArticleCard key={item.id} item={item}
                      onClick={() => { window.location.href = `/articles/${item.id}`; }}
                      onDownload={e => handleDownload(item, e)}
                      isDownloading={downloadingId === item.id} />
                  ))}
                </div>
              )}
            </>
          )}
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </div>
      </main>
      <Footer />
      <style>{`
        .container-main { max-width: 1280px; margin: 0 auto; padding-inline: 24px; }
        .agrid { display: grid; gap: 20px; grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 1024px) { .agrid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px)  { .agrid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
