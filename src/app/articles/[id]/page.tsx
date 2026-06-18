"use client";

import { useState, useEffect, use } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { fetchPublicDetail, fetchSignedUrl, type PubContentDetail } from "@/lib/public";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
}

export default function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [detail, setDetail] = useState<PubContentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(false);
    fetchPublicDetail(id, ctrl.signal)
      .then(setDetail)
      .catch((e) => {
        if (e.name !== "AbortError") setError(true);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [id]);

  const primaryPdf = detail?.mediaAssets.find(
    (a) => a.isPrimary && (a.contentType.includes("pdf") || a.mediaType.toLowerCase().includes("document"))
  ) ?? detail?.mediaAssets.find(
    (a) => a.contentType.includes("pdf") || a.mediaType.toLowerCase().includes("document")
  );

  const handleLoadPdf = async () => {
    if (!primaryPdf) return;
    setPdfLoading(true);
    setPdfError(false);
    try {
      const signed = await fetchSignedUrl(primaryPdf.id);
      setPdfUrl(signed.url);
    } catch {
      setPdfError(true);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <Header />

      <main style={{ flex: 1 }}>
        <div className="container-main" style={{ padding: "32px 0 60px" }}>
          {/* Back button */}
          <button
            onClick={() => { window.location.href = "/articles"; }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "8px 18px", borderRadius: 10,
              border: "1px solid var(--line)", background: "var(--surface)",
              color: "var(--ink)", fontSize: 13, fontWeight: 600,
              cursor: "pointer", marginBottom: 28,
            }}
          >
            <span style={{ fontSize: 16 }}>&#x2190;</span>
            العودة إلى المقالات
          </button>

          {loading && (
            <div className="animate-pulse">
              <div style={{ height: 16, borderRadius: 6, background: "var(--surface-2)", width: "20%", marginBottom: 16 }} />
              <div style={{ height: 32, borderRadius: 8, background: "var(--surface-2)", width: "70%", marginBottom: 12 }} />
              <div style={{ height: 14, borderRadius: 6, background: "var(--surface-2)", width: "35%", marginBottom: 24 }} />
              <div style={{ height: 14, borderRadius: 6, background: "var(--surface-2)", width: "90%", marginBottom: 8 }} />
              <div style={{ height: 14, borderRadius: 6, background: "var(--surface-2)", width: "80%", marginBottom: 8 }} />
              <div style={{ height: 14, borderRadius: 6, background: "var(--surface-2)", width: "85%" }} />
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>
              تعذّر تحميل المقال. يرجى المحاولة لاحقاً.
            </div>
          )}

          {!loading && !error && detail && (
            <article style={{ maxWidth: 840 }}>
              {/* Category badge */}
              {detail.categoryName && (
                <span
                  style={{
                    fontSize: 12, fontWeight: 700,
                    padding: "4px 14px", borderRadius: 999,
                    background: "color-mix(in srgb,var(--forest) 10%,transparent)",
                    color: "var(--forest)",
                    display: "inline-block", marginBottom: 14,
                  }}
                >
                  {detail.categoryName}
                </span>
              )}

              {/* Title */}
              <h1
                style={{
                  fontSize: 28, fontWeight: 800,
                  color: "var(--ink)", lineHeight: 1.35, marginBottom: 14,
                  fontFamily: "'Noto Kufi Arabic',sans-serif",
                }}
              >
                {detail.title}
              </h1>

              {/* Meta */}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24, alignItems: "center" }}>
                {detail.publishedAt && (
                  <span style={{ fontSize: 13, color: "var(--muted-2)" }}>{formatDate(detail.publishedAt)}</span>
                )}
                <span
                  style={{
                    fontSize: 12, fontWeight: 600,
                    padding: "3px 12px", borderRadius: 999,
                    background: "var(--surface-2)", color: "var(--muted)",
                  }}
                >
                  {detail.language === "ar" ? "عربي" : detail.language === "en" ? "English" : detail.language}
                </span>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "var(--line)", marginBottom: 24 }} />

              {/* Summary */}
              {detail.summary && (
                <p
                  style={{
                    fontSize: 16, lineHeight: 1.8,
                    color: "var(--ink-2)",
                    marginBottom: 32,
                    padding: "16px 20px",
                    background: "var(--surface)",
                    borderRadius: 12,
                    borderInlineStart: "4px solid var(--gold)",
                  }}
                >
                  {detail.summary}
                </p>
              )}

              {/* PDF viewer */}
              {primaryPdf && (
                <div style={{ marginBottom: 36 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", marginBottom: 14 }}>
                    ملف PDF
                  </h3>

                  {!pdfUrl && !pdfLoading && !pdfError && (
                    <button
                      onClick={handleLoadPdf}
                      style={{
                        padding: "12px 28px", borderRadius: 12,
                        border: "none",
                        background: "var(--forest)", color: "#fff",
                        fontWeight: 700, fontSize: 14, cursor: "pointer",
                        display: "inline-flex", alignItems: "center", gap: 8,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>&#128196;</span>
                      عرض PDF / Load PDF
                    </button>
                  )}

                  {pdfLoading && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--muted)" }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: "50%",
                        border: "2px solid var(--gold)", borderTopColor: "transparent",
                        animation: "spin 1s linear infinite",
                      }} />
                      جارٍ التحميل...
                    </div>
                  )}

                  {pdfError && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <p style={{ color: "#DC2626", fontSize: 14 }}>تعذّر تحميل ملف PDF.</p>
                      <button
                        onClick={handleLoadPdf}
                        style={{
                          padding: "8px 18px", borderRadius: 8,
                          border: "1px solid var(--line)", background: "var(--surface)",
                          cursor: "pointer", fontSize: 13, color: "var(--ink)",
                        }}
                      >
                        إعادة المحاولة
                      </button>
                    </div>
                  )}

                  {pdfUrl && (
                    <div>
                      <iframe
                        src={pdfUrl}
                        style={{
                          width: "100%", minHeight: 600, border: "1px solid var(--line)",
                          borderRadius: 12,
                        }}
                        title={detail.title}
                        onError={() => {
                          setPdfError(true);
                          setPdfUrl(null);
                        }}
                      />
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-block", marginTop: 10,
                          fontSize: 13, color: "var(--gold)", fontWeight: 600,
                        }}
                      >
                        تنزيل PDF &#8599;
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {detail.tags.length > 0 && (
                <div>
                  <div style={{ height: 1, background: "var(--line)", marginBottom: 20 }} />
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".05em" }}>
                    الوسوم
                  </h4>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {detail.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: "5px 14px", borderRadius: 999,
                          background: "var(--surface-2)",
                          border: "1px solid var(--line)",
                          color: "var(--muted)", fontSize: 12, fontWeight: 500,
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>
          )}
        </div>
      </main>

      <Footer />

      <style>{`
        .container-main { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
