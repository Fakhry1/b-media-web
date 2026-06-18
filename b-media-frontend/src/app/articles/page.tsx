"use client";

import { useState, useEffect, useRef, type MouseEvent } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCategoryData, Pagination } from "@/components/shared/CategoryScreen";
import { fetchPublicDetail, fetchSignedUrl, downloadBlob, type PublicItem } from "@/lib/public";

const PAGE_SIZE = 12;
const CATEGORY  = "الاطلاع / Reading";
const MEDIA_TYPE = 5;

/* ── helpers ────────────────────────────────────────────── */
const PALETTE = ["#2563EB","#7C3AED","#059669","#D97706","#DB2777","#0891B2","#DC2626"];
const accent  = (t: string) => PALETTE[t.charCodeAt(0) % PALETTE.length];

function fmtDate(iso: string | null) {
  return iso
    ? new Date(iso).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })
    : "";
}

function readEstimate(summary: string | null) {
  if (!summary) return "";
  const words = summary.trim().split(/\s+/).length;
  const mins  = Math.max(1, Math.round(words / 200));
  return `${mins} دقيقة للقراءة`;
}

/* ── Article Card (Medium / Guardian style) ─────────────── */
function ArticleCard({ item, onClick }: { item: PublicItem; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  const [dl,    setDl]    = useState(false);
  const c = accent(item.title);

  async function handleDownload(e: MouseEvent) {
    e.stopPropagation();
    setDl(true);
    try {
      const d = await fetchPublicDetail(item.id);
      const a = d.mediaAssets.find(x => ["pdf","document"].some(t => x.mediaType.toLowerCase().includes(t)));
      if (!a) return;
      const s = await fetchSignedUrl(a.id);
      await downloadBlob(s.url, item.title + ".pdf");
    } finally { setDl(false); }
  }

  return (
    <article
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: "var(--surface)", borderRadius: 16,
        border: "1px solid var(--line)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        boxShadow: hover ? "0 8px 32px rgba(0,0,0,.10)" : "0 1px 4px rgba(0,0,0,.06)",
        transform: hover ? "translateY(-3px)" : "none",
        transition: "all .25s",
        cursor: "pointer",
      }}
    >
      {/* Color bar */}
      <div style={{ height: 4, background: `linear-gradient(90deg,${c},${c}88)`, flexShrink: 0 }} />

      {/* Thumbnail placeholder — accent gradient */}
      <div onClick={onClick} style={{
        position: "relative", paddingTop: "52%",
        background: `linear-gradient(135deg,${c}18 0%,${c}30 100%)`,
        flexShrink: 0,
      }}>
        {item.thumbnailUrl
          ? <img src={item.thumbnailUrl} alt={item.title} loading="lazy"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
              justifyContent: "center", flexDirection: "column", gap: 8 }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.4" opacity=".5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
        }
        {item.isFeatured && (
          <span style={{ position: "absolute", top: 10, right: 10,
            background: "var(--gold)", color: "var(--forest)",
            fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 99,
            boxShadow: "0 2px 8px rgba(0,0,0,.2)" }}>مميز</span>
        )}
      </div>

      {/* Body */}
      <div onClick={onClick} style={{ padding: "16px 18px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Category */}
        {item.categoryName && (
          <span style={{ fontSize: 11, fontWeight: 700, color: c, textTransform: "uppercase", letterSpacing: ".04em" }}>
            {item.categoryName}
          </span>
        )}

        {/* Title */}
        <h3 style={{
          color: "var(--ink)", fontSize: 15, fontWeight: 800,
          lineHeight: 1.5, margin: 0,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {item.title}
        </h3>

        {/* Summary */}
        {item.summary && (
          <p style={{
            color: "var(--muted)", fontSize: 13, lineHeight: 1.65, margin: 0,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {item.summary}
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 18px 16px", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {item.publishedAt && (
            <span style={{ fontSize: 11, color: "var(--muted-2)" }}>{fmtDate(item.publishedAt)}</span>
          )}
          {item.summary && (
            <span style={{ fontSize: 10, color: "var(--muted-2)" }}>{readEstimate(item.summary)}</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={onClick}
            style={{
              padding: "5px 14px", borderRadius: 8,
              border: "none", background: c, color: "#fff",
              fontSize: 11, fontWeight: 700, cursor: "pointer",
              transition: "opacity .15s",
            }}>
            قراءة
          </button>
          <button disabled={dl} onClick={handleDownload}
            style={{
              padding: "5px 10px", borderRadius: 8,
              border: "1px solid var(--line)", background: "var(--surface-2)",
              color: dl ? "var(--muted-2)" : "var(--muted)",
              fontSize: 11, fontWeight: 600,
              cursor: dl ? "default" : "pointer", transition: "all .15s",
              display: "flex", alignItems: "center", gap: 4,
            }}>
            {dl
              ? <span style={{ display: "flex", gap: 3, alignItems: "center" }}>
                  <span className="ar-spin" style={{ width: 10, height: 10, borderRadius: "50%",
                    border: "1.5px solid var(--muted)", borderTopColor: "transparent",
                    display: "inline-block" }} />
                  جارٍ…
                </span>
              : <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12l7 7 7-7"/>
                  </svg>
                  PDF
                </>
            }
          </button>
        </div>
      </div>
    </article>
  );
}

/* ── Featured Hero Card (first article, large) ──────────── */
function FeaturedCard({ item, onClick }: { item: PublicItem; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  const [dl,    setDl]    = useState(false);
  const c = accent(item.title);

  async function handleDownload(e: MouseEvent) {
    e.stopPropagation();
    setDl(true);
    try {
      const d = await fetchPublicDetail(item.id);
      const a = d.mediaAssets.find(x => ["pdf","document"].some(t => x.mediaType.toLowerCase().includes(t)));
      if (!a) return;
      const s = await fetchSignedUrl(a.id);
      await downloadBlob(s.url, item.title + ".pdf");
    } finally { setDl(false); }
  }

  return (
    <article
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className="ar-featured"
      style={{
        background: "var(--surface)", borderRadius: 20, overflow: "hidden",
        border: "1px solid var(--line)",
        display: "grid", gridTemplateColumns: "1fr 1fr",
        boxShadow: hover ? "0 12px 48px rgba(0,0,0,.12)" : "0 2px 8px rgba(0,0,0,.06)",
        transition: "box-shadow .25s, transform .25s",
        transform: hover ? "translateY(-2px)" : "none",
      }}
    >
      {/* Left: Image */}
      <div onClick={onClick} style={{
        position: "relative", minHeight: 280, cursor: "pointer",
        background: `linear-gradient(135deg,${c}22,${c}40)`,
      }}>
        {item.thumbnailUrl
          ? <img src={item.thumbnailUrl} alt={item.title} loading="lazy"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
              justifyContent: "center" }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.2" opacity=".4">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
        }
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to left, transparent 60%, rgba(0,0,0,.15))",
        }} />
        {item.isFeatured && (
          <span style={{ position: "absolute", top: 14, right: 14,
            background: "var(--gold)", color: "var(--forest)",
            fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 99,
            boxShadow: "0 2px 10px rgba(0,0,0,.25)" }}>مميز</span>
        )}
      </div>

      {/* Right: Content */}
      <div style={{ display: "flex", flexDirection: "column", padding: "28px 32px" }}>
        <div style={{ flex: 1 }}>
          {item.categoryName && (
            <span style={{ fontSize: 12, fontWeight: 700, color: c,
              textTransform: "uppercase", letterSpacing: ".05em" }}>
              {item.categoryName}
            </span>
          )}
          <h2 onClick={onClick} style={{
            color: "var(--ink)", fontSize: 22, fontWeight: 800,
            lineHeight: 1.45, margin: "10px 0 14px",
            cursor: "pointer",
            display: "-webkit-box", WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {item.title}
          </h2>
          {item.summary && (
            <p style={{
              color: "var(--muted)", fontSize: 14, lineHeight: 1.7, margin: "0 0 20px",
              display: "-webkit-box", WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {item.summary}
            </p>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div>
            {item.publishedAt && (
              <span style={{ fontSize: 12, color: "var(--muted-2)" }}>{fmtDate(item.publishedAt)}</span>
            )}
            {item.summary && (
              <span style={{ fontSize: 11, color: "var(--muted-2)", display: "block", marginTop: 2 }}>
                {readEstimate(item.summary)}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClick}
              style={{ padding: "8px 20px", borderRadius: 10, border: "none",
                background: c, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              قراءة
            </button>
            <button disabled={dl} onClick={handleDownload}
              style={{ padding: "8px 16px", borderRadius: 10,
                border: "1px solid var(--line)", background: "var(--surface-2)",
                color: dl ? "var(--muted-2)" : "var(--muted)",
                fontSize: 13, fontWeight: 600,
                cursor: dl ? "default" : "pointer",
                display: "flex", alignItems: "center", gap: 5 }}>
              {dl
                ? <><span className="ar-spin" style={{ width: 12, height: 12, borderRadius: "50%",
                    border: "2px solid var(--muted)", borderTopColor: "transparent",
                    display: "inline-block" }} /> جارٍ…</>
                : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12l7 7 7-7"/>
                  </svg> PDF</>
              }
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ── Reading Drawer (Medium-style slide-in) ─────────────── */
function ReadingDrawer({ item, onClose }: { item: PublicItem; onClose: () => void }) {
  const [url,        setUrl]        = useState<string | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [err,        setErr]        = useState(false);
  const [dl,         setDl]         = useState(false);
  const [visible,    setVisible]    = useState(false);
  const c = accent(item.title);

  useEffect(() => { setTimeout(() => setVisible(true), 10); }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true); setErr(false); setUrl(null);
    fetchPublicDetail(item.id, ctrl.signal)
      .then(async d => {
        const a = d.mediaAssets.find(x => ["pdf","document"].some(t => x.mediaType.toLowerCase().includes(t)));
        if (!a) { setErr(true); setLoading(false); return; }
        const s = await fetchSignedUrl(a.id, ctrl.signal);
        setUrl(s.url); setLoading(false);
      })
      .catch(e => { if (e.name !== "AbortError") { setErr(true); setLoading(false); } });
    return () => ctrl.abort();
  }, [item.id]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      display: "flex", alignItems: "stretch",
    }}>
      {/* Backdrop */}
      <div onClick={handleClose} style={{
        flex: 1, background: "rgba(0,0,0,.6)",
        backdropFilter: "blur(4px)",
        opacity: visible ? 1 : 0, transition: "opacity .3s",
      }} />

      {/* Drawer panel */}
      <div style={{
        width: "min(700px,100vw)", height: "100%",
        background: "var(--bg)", overflowY: "auto",
        display: "flex", flexDirection: "column",
        transform: visible ? "translateX(0)" : "translateX(100%)",
        transition: "transform .3s cubic-bezier(.32,0,.15,1)",
        boxShadow: "-8px 0 40px rgba(0,0,0,.2)",
      }}>

        {/* Accent bar */}
        <div style={{ height: 4, background: `linear-gradient(90deg,${c},${c}66)`, flexShrink: 0 }} />

        {/* Header */}
        <div style={{
          padding: "20px 28px 18px",
          borderBottom: "1px solid var(--line)",
          position: "sticky", top: 0, background: "var(--bg)", zIndex: 10,
          display: "flex", alignItems: "flex-start", gap: 14,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {item.categoryName && (
              <span style={{ fontSize: 11, fontWeight: 700, color: c,
                textTransform: "uppercase", letterSpacing: ".05em" }}>
                {item.categoryName}
              </span>
            )}
            <h2 style={{ color: "var(--ink)", fontWeight: 800, fontSize: 18, lineHeight: 1.4,
              margin: "6px 0 0" }}>
              {item.title}
            </h2>
          </div>
          <button onClick={handleClose}
            style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--line)",
              background: "var(--surface)", cursor: "pointer", color: "var(--muted)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0 }}>
            ×
          </button>
        </div>

        {/* Meta bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 28px",
          borderBottom: "1px solid var(--line)", flexWrap: "wrap" }}>
          {item.publishedAt && (
            <span style={{ fontSize: 12, color: "var(--muted-2)" }}>{fmtDate(item.publishedAt)}</span>
          )}
          {item.summary && (
            <span style={{ fontSize: 12, color: "var(--muted-2)", display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {readEstimate(item.summary)}
            </span>
          )}
          {url && !loading && (
            <button disabled={dl}
              onClick={async () => {
                setDl(true);
                try { await downloadBlob(url, item.title + ".pdf"); } finally { setDl(false); }
              }}
              style={{
                marginRight: "auto", padding: "5px 16px", borderRadius: 8,
                border: "none", background: c, color: "#fff",
                fontSize: 12, fontWeight: 700, cursor: dl ? "default" : "pointer",
                display: "flex", alignItems: "center", gap: 5, opacity: dl ? .7 : 1,
              }}>
              {dl
                ? <><span className="ar-spin" style={{ width: 11, height: 11, borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,.5)", borderTopColor: "#fff",
                    display: "inline-block" }} /> جارٍ…</>
                : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12l7 7 7-7"/>
                  </svg> تحميل PDF</>
              }
            </button>
          )}
        </div>

        {/* Summary */}
        {item.summary && (
          <div style={{ padding: "20px 28px 0" }}>
            <p style={{
              fontSize: 15, lineHeight: 1.8, color: "var(--ink-2)", margin: 0,
              padding: "16px 20px", background: "var(--surface)", borderRadius: 12,
              borderInlineStart: `4px solid ${c}`,
            }}>
              {item.summary}
            </p>
          </div>
        )}

        {/* PDF area */}
        <div style={{ padding: "20px 28px 32px", flex: 1 }}>
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 16, padding: "60px 0" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%",
                border: `3px solid ${c}22`, borderTopColor: c,
                animation: "ar-spin 1s linear infinite" }} />
              <p style={{ color: "var(--muted)", fontSize: 13 }}>جارٍ تحميل المستند…</p>
            </div>
          )}

          {err && !loading && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
              <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 16 }}>
                تعذّر تحميل المستند
              </p>
              <button onClick={() => { setErr(false); setLoading(true); }}
                style={{ padding: "8px 20px", borderRadius: 8,
                  border: "1px solid var(--line)", background: "var(--surface)",
                  cursor: "pointer", fontSize: 13, color: "var(--ink)" }}>
                إعادة المحاولة
              </button>
            </div>
          )}

          {url && !loading && (
            <iframe src={url}
              style={{ width: "100%", height: "calc(100vh - 260px)", minHeight: 500,
                borderRadius: 12, border: "1px solid var(--line)" }}
              title={item.title}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton Card ──────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="animate-pulse" style={{ background: "var(--surface)", borderRadius: 16,
      border: "1px solid var(--line)", overflow: "hidden" }}>
      <div style={{ height: 4, background: "var(--surface-2)" }} />
      <div style={{ paddingTop: "52%", background: "var(--surface-2)" }} />
      <div style={{ padding: "16px 18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ height: 10, borderRadius: 4, background: "var(--surface-2)", width: "30%" }} />
        <div style={{ height: 14, borderRadius: 4, background: "var(--surface-2)", width: "90%" }} />
        <div style={{ height: 14, borderRadius: 4, background: "var(--surface-2)", width: "70%" }} />
        <div style={{ height: 11, borderRadius: 4, background: "var(--surface-2)", width: "55%", marginTop: 4 }} />
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────── */
export default function ArticlesPage() {
  const [page, setPage]       = useState(1);
  const [activeId, setActiveId] = useState<string | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const { items, loading, error, totalCount, totalPages } = useCategoryData(
    CATEGORY, page, undefined, PAGE_SIZE, MEDIA_TYPE
  );

  const activeItem = activeId ? items.find(i => i.id === activeId) ?? null : null;

  function handlePage(p: number) {
    setPage(p);
    mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <Header />

      {/* ── Hero ── */}
      <section style={{
        background: "linear-gradient(135deg,#1e3a2f 0%,#14532d 45%,#0f1f14 100%)",
        padding: "56px 0 52px", position: "relative", overflow: "hidden",
      }}>
        {/* Decorative shapes */}
        <div style={{ position: "absolute", top: -60, left: -60, width: 220, height: 220,
          borderRadius: "50%", background: "rgba(255,255,255,.03)" }} />
        <div style={{ position: "absolute", bottom: -40, right: -40, width: 160, height: 160,
          borderRadius: "50%", background: "rgba(255,255,255,.04)" }} />

        <div className="ar-wrap">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>📖</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)",
              textTransform: "uppercase", letterSpacing: ".1em" }}>B-Media · Reading</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: "clamp(28px,5vw,48px)", fontWeight: 900,
            lineHeight: 1.15, margin: "0 0 10px",
            fontFamily: "'Noto Kufi Arabic',sans-serif" }}>
            الاطلاع
          </h1>
          <p style={{ color: "rgba(255,255,255,.6)", fontSize: 16, margin: "0 0 24px" }}>
            تصفّح المقالات والمستندات بأسلوب راقي
          </p>
          {totalCount > 0 && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,.08)", borderRadius: 99,
              padding: "6px 16px", backdropFilter: "blur(8px)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="var(--gold)" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
                {totalCount} مستند
              </span>
            </div>
          )}
        </div>
      </section>

      <main ref={mainRef} style={{ flex: 1, paddingTop: 40, paddingBottom: 64 }}>
        <div className="ar-wrap">

          {/* Error */}
          {error && (
            <div style={{ textAlign: "center", padding: 60 }}>
              <p style={{ color: "var(--muted)", marginBottom: 16 }}>حدث خطأ أثناء التحميل</p>
              <button onClick={() => window.location.reload()}
                style={{ padding: "8px 22px", borderRadius: 10, border: "1px solid var(--line)",
                  background: "var(--surface)", color: "var(--ink)", cursor: "pointer", fontSize: 13 }}>
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="ar-grid">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && items.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>📖</div>
              <p style={{ color: "var(--muted)", fontSize: 15 }}>لا توجد مقالات في هذا القسم حالياً</p>
            </div>
          )}

          {/* Content — unified grid for all items */}
          {!loading && !error && items.length > 0 && (
            <div className="ar-grid">
              {items.map((item) => (
                <ArticleCard key={item.id} item={item}
                  onClick={() => setActiveId(item.id)} />
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} setPage={handlePage} />
        </div>
      </main>

      <Footer />

      {/* Reading Drawer */}
      {activeItem && (
        <ReadingDrawer item={activeItem} onClose={() => setActiveId(null)} />
      )}

      <style>{`
        .ar-wrap  { max-width: 1200px; margin: 0 auto; padding-left: 24px; padding-right: 24px; }
        .ar-grid  { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }
        @media (max-width: 900px) { .ar-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 640px) {
          .ar-grid { grid-template-columns: 1fr; }
          .ar-wrap { padding-left: 16px; padding-right: 16px; }
        }
        @keyframes ar-spin { to { transform: rotate(360deg); } }
        .ar-spin { animation: ar-spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
