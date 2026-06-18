"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  fetchPublicContents, fetchPublicCategories, fetchPublicDetail, fetchSignedUrl,
  downloadBlob, type PublicItem, type PubCategory,
} from "@/lib/public";
import { useLang } from "@/lib/LangContext";

const PAGE_SIZE = 15;
const CATEGORY_NAME = "السماع";
const MEDIA_TYPE = 3; // Audio

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
}

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center gap-4 p-4 rounded-2xl"
      style={{ background: "var(--surface)", border: "1px solid var(--line)", marginBottom: 8 }}>
      <div style={{ width: 50, height: 50, borderRadius: "50%", background: "var(--surface-2)", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 14, borderRadius: 6, background: "var(--surface-2)", width: "60%", marginBottom: 8 }} />
        <div style={{ height: 11, borderRadius: 6, background: "var(--surface-2)", width: "40%" }} />
      </div>
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
    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 32, flexWrap: "wrap" }}>
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

export default function AudioPage() {
  const { t } = useLang();
  const [pageCategory, setPageCategory] = useState<PubCategory | null>(null);
  const [subId, setSubId] = useState<string | null>(null);
  const [items, setItems] = useState<PublicItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Player state
  const [playing, setPlaying] = useState<PublicItem | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [loadingTrack, setLoadingTrack] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [downloadingAudio, setDownloadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Find fixed category
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

  // Fetch content
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

  // Audio element sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => { if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100); };
    const onEnded = () => {
      const idx = items.findIndex(i => i.id === playing?.id);
      if (idx !== -1 && idx < items.length - 1) handlePlay(items[idx + 1]);
      else setIsPaused(true);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    return () => { audio.removeEventListener("timeupdate", onTime); audio.removeEventListener("ended", onEnded); };
  }, [items, playing]);

  // When src changes, play
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;
    audio.src = audioSrc;
    audio.play().then(() => setIsPaused(false)).catch(() => {});
  }, [audioSrc]);

  async function handlePlay(item: PublicItem) {
    if (playing?.id === item.id) {
      const audio = audioRef.current;
      if (!audio) return;
      if (isPaused) { audio.play(); setIsPaused(false); }
      else { audio.pause(); setIsPaused(true); }
      return;
    }
    setLoadingTrack(item.id);
    try {
      const detail = await fetchPublicDetail(item.id);
      const asset = detail.mediaAssets.find(a => a.mediaType.toLowerCase().includes("audio"));
      if (!asset) return;
      const { url } = await fetchSignedUrl(asset.id);
      setPlaying(item);
      setAudioSrc(url);
      setProgress(0);
    } catch { /* ignore */ } finally { setLoadingTrack(null); }
  }

  function handlePrev() {
    const idx = items.findIndex(i => i.id === playing?.id);
    if (idx > 0) handlePlay(items[idx - 1]);
  }
  function handleNext() {
    const idx = items.findIndex(i => i.id === playing?.id);
    if (idx !== -1 && idx < items.length - 1) handlePlay(items[idx + 1]);
  }
  function handleClose() {
    audioRef.current?.pause();
    setPlaying(null); setAudioSrc(null); setProgress(0);
  }

  const handleSub = useCallback((id: string | null) => { setSubId(id); setPage(1); }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)",
      paddingBottom: playing ? 90 : 0 }}>
      <Header />
      <main style={{ flex: 1 }}>
        {/* Hero + tabs */}
        <div style={{ padding: "28px 0 0", borderBottom: "1px solid var(--line)" }}>
          <div className="container-main">
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)", fontFamily: "'Noto Kufi Arabic',sans-serif" }}>
              🎙 {CATEGORY_NAME}
            </h1>
            <p style={{ color: "var(--muted)", marginTop: 4, fontSize: 14 }}>{t.browseAllAudio}</p>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "16px 0 0", scrollbarWidth: "none" }}>
              <button onClick={() => handleSub(null)}
                style={{ flexShrink: 0, padding: "7px 20px", borderRadius: 999, border: "1px solid",
                  borderColor: subId === null ? "var(--gold)" : "var(--line)",
                  background: subId === null ? "var(--gold)" : "transparent",
                  color: subId === null ? "var(--forest)" : "var(--ink)",
                  fontWeight: 600, fontSize: 13, cursor: "pointer" }}>{t.all}</button>
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

        {/* List */}
        <div className="container-main" style={{ padding: "28px 0 48px" }}>
          {error && <p style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>{t.loadingError}</p>}
          {loading ? (
            Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />)
          ) : !error && items.length === 0 ? (
            <p style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>{t.noAudio}</p>
          ) : !error && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map((item, idx) => {
                const isPlaying = playing?.id === item.id && !isPaused;
                const isActive = playing?.id === item.id;
                const isLoading = loadingTrack === item.id;
                return (
                  <div key={item.id}
                    style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 18px", borderRadius: 18,
                      background: "var(--surface)", border: "1px solid",
                      borderColor: isActive ? "var(--gold)" : "var(--line)",
                      borderInlineStart: isActive ? "4px solid var(--gold)" : "1px solid var(--line)",
                      transition: "all .15s", cursor: "pointer" }}
                    onClick={() => handlePlay(item)}>
                    {/* Index */}
                    <span style={{ fontSize: 12, color: "var(--muted-2)", width: 22, textAlign: "center", flexShrink: 0 }}>
                      {String(idx + 1 + (page - 1) * PAGE_SIZE).padStart(2, "0")}
                    </span>
                    {/* Play button */}
                    <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, cursor: "pointer",
                      background: isActive ? "var(--gold)" : "var(--surface-2)",
                      border: `1.5px solid ${isActive ? "var(--gold)" : "var(--line)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
                      {isLoading ? (
                        <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid var(--forest)",
                          borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
                      ) : isPlaying ? (
                        <span style={{ fontSize: 14, color: "var(--forest)" }}>⏸</span>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={isActive ? "var(--forest)" : "var(--muted)"}>
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      )}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "var(--ink)", fontWeight: isActive ? 700 : 500, fontSize: 14,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</p>
                      <div style={{ display: "flex", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                        {item.categoryName && <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600 }}>{item.categoryName}</span>}
                        {item.publishedAt && <span style={{ fontSize: 11, color: "var(--muted-2)" }}>{formatDate(item.publishedAt)}</span>}
                      </div>
                    </div>
                    {item.isFeatured && (
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20,
                        background: "rgba(200,168,75,.15)", color: "var(--forest)", fontWeight: 700, flexShrink: 0 }}>{t.featured}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </div>
      </main>

      {/* Hidden audio element */}
      <audio ref={audioRef} style={{ display: "none" }} />

      {/* Sticky player */}
      {playing && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          background: "var(--surface)", borderTop: "1px solid var(--line-gold)",
          boxShadow: "0 -4px 24px rgba(0,0,0,.15)", padding: "12px 24px" }}>
          {/* Progress bar */}
          <div style={{ height: 3, background: "var(--line)", borderRadius: 99, marginBottom: 12, cursor: "pointer" }}
            onClick={e => {
              const rect = (e.target as HTMLElement).getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              const audio = audioRef.current;
              if (audio && audio.duration) { audio.currentTime = pct * audio.duration; setProgress(pct * 100); }
            }}>
            <div style={{ height: "100%", borderRadius: 99, background: "var(--gold)", width: `${progress}%`, transition: "width .3s linear" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, maxWidth: 1280, margin: "0 auto" }}>
            {/* Track info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: "var(--ink)", fontWeight: 600, fontSize: 14, overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{playing.title}</p>
              <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>{playing.categoryName}</p>
            </div>
            {/* Controls */}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button onClick={handlePrev} style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--line)",
                background: "var(--surface-2)", cursor: "pointer", fontSize: 15, color: "var(--ink)" }}>⏮</button>
              <button onClick={() => handlePlay(playing)}
                style={{ width: 44, height: 44, borderRadius: "50%", border: "none",
                  background: "var(--gold)", cursor: "pointer", fontSize: 18, color: "var(--forest)",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isPaused ? <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--forest)"><polygon points="5,3 19,12 5,21"/></svg> : <span>⏸</span>}
              </button>
              <button onClick={handleNext} style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--line)",
                background: "var(--surface-2)", cursor: "pointer", fontSize: 15, color: "var(--ink)" }}>⏭</button>
              <button onClick={handleClose} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--line)",
                background: "var(--surface-2)", cursor: "pointer", fontSize: 16, color: "var(--muted)" }}>×</button>
              {audioSrc && (
                <button disabled={downloadingAudio}
                  onClick={async () => {
                    if (!audioSrc || !playing) return;
                    setDownloadingAudio(true);
                    try { await downloadBlob(audioSrc, playing.title + ".mp3"); } finally { setDownloadingAudio(false); }
                  }}
                  style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid var(--line)",
                    background: downloadingAudio ? "var(--line)" : "var(--surface-2)",
                    cursor: downloadingAudio ? "default" : "pointer", fontSize: 12,
                    color: "var(--ink)", fontWeight: 600, whiteSpace: "nowrap" }}>
                  {downloadingAudio ? "..." : t.downloadAudio}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <Footer />
      <style>{`
        .container-main { max-width: 1280px; margin: 0 auto; padding-inline: 24px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
