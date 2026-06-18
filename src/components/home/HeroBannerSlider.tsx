"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  fetchPublicCategories, fetchPublicContents, fetchPublicDetail, fetchSignedUrl,
} from "@/lib/public";

const CATEGORY_NAME    = "الاعلانات";
const SUBCATEGORY_NAME = "اسلايدر";
const PAGE_SIZE        = 20;
const SLIDE_INTERVAL   = 5000;
const SLIDER_HEIGHT    = "clamp(300px, 55vw, 620px)";

function norm(s: string) {
  return s.trim()
    .replace(/[ؐ-ًؚ-ٰٟ]/g, "")
    .replace(/[أإآٱ]/g, "ا");
}

interface Slide { id: string; title: string; url: string; }

async function getFirstImageUrl(
  item: { id: string; thumbnailUrl: string | null },
  signal: AbortSignal,
): Promise<string | null> {
  try {
    const detail = await fetchPublicDetail(item.id, signal);
    const img = detail.mediaAssets.find(a =>
      ["Image", "image", "2", "Photo", "photo"].includes(a.mediaType)
    );
    if (img) {
      const { url } = await fetchSignedUrl(img.id, signal);
      return url;
    }
    return item.thumbnailUrl ?? null;
  } catch {
    return item.thumbnailUrl ?? null;
  }
}

export default function HeroBannerSlider() {
  const [slides, setSlides]   = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused]   = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const cats = await fetchPublicCategories(ctrl.signal);
        const cat  = cats.find(c => norm(c.name) === norm(CATEGORY_NAME));
        if (!cat) { setLoading(false); return; }

        const sub = cat.subcategories.find(s => norm(s.name) === norm(SUBCATEGORY_NAME));
        if (!sub) { setLoading(false); return; }

        const page = await fetchPublicContents(
          { categoryId: cat.id, subcategoryId: sub.id, pageSize: PAGE_SIZE },
          ctrl.signal,
        );

        const resolved = await Promise.all(
          page.items.map(async item => {
            const url = await getFirstImageUrl(item, ctrl.signal);
            return url ? { id: item.id, title: item.title, url } : null;
          })
        );
        setSlides(resolved.filter(Boolean) as Slide[]);
      } catch (e: unknown) {
        if ((e as Error).name !== "AbortError") setSlides([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  const total = slides.length;
  const next  = useCallback(() => setCurrent(c => (c + 1) % total), [total]);
  const prev  = useCallback(() => setCurrent(c => (c - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused || total <= 1) return;
    timer.current = setInterval(next, SLIDE_INTERVAL);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [paused, next, total]);

  if (loading) {
    return (
      <div style={{
        borderRadius: 20, height: SLIDER_HEIGHT,
        background: "linear-gradient(135deg,var(--surface-2),var(--surface-3))",
        border: "1px solid var(--line)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "3px solid var(--line)",
          borderTopColor: "var(--gold)",
          animation: "spin .8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (slides.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        borderRadius: 20,
        boxShadow: "0 32px 80px rgba(11,35,24,.22), 0 0 0 1px var(--line-gold)",
        height: SLIDER_HEIGHT,
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides track */}
      <div style={{
        display: "flex",
        height: "100%",
        transition: "transform .55s cubic-bezier(.4,0,.2,1)",
        transform: `translateX(${current * 100}%)`,
        direction: "ltr",
      }}>
        {slides.map((slide, i) => (
          <div key={slide.id} style={{ minWidth: "100%", flexShrink: 0, position: "relative" }}>
            <img
              src={slide.url}
              alt={slide.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              loading={i === 0 ? "eager" : "lazy"}
            />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,.45) 0%, transparent 40%)",
              pointerEvents: "none",
            }} />
            {slide.title && (
              <div style={{
                position: "absolute", bottom: 52, right: 24, left: 24,
                color: "#fff", fontFamily: "'Noto Kufi Arabic',sans-serif",
                fontSize: "clamp(14px,2.2vw,22px)", fontWeight: 700,
                textShadow: "0 2px 8px rgba(0,0,0,.6)",
              }}>
                {slide.title}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Arrows */}
      {total > 1 && (
        <>
          <SliderArrow side="right" label="السابق" onClick={prev}>&#8250;</SliderArrow>
          <SliderArrow side="left"  label="التالي"  onClick={next}>&#8249;</SliderArrow>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div style={{
          position: "absolute", bottom: 18, left: "50%",
          transform: "translateX(-50%)",
          display: "flex", gap: 6, zIndex: 10,
        }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`الشريحة ${i + 1}`}
              style={{
                width: i === current ? 28 : 8, height: 8,
                borderRadius: 99, border: "none", cursor: "pointer", padding: 0,
                transition: "all .35s",
                background: i === current ? "var(--gold)" : "rgba(255,255,255,.55)",
                boxShadow: "0 1px 4px rgba(0,0,0,.35)",
              }}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {total > 1 && !paused && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "rgba(0,0,0,.20)", zIndex: 10 }}>
          <div key={current} style={{
            height: "100%", background: "var(--gold)",
            animation: `sliderProgress ${SLIDE_INTERVAL}ms linear forwards`,
          }} />
        </div>
      )}

      <style>{`@keyframes sliderProgress { from { width:0 } to { width:100% } }`}</style>
    </div>
  );
}

function SliderArrow({ side, label, onClick, children }: {
  side: "left" | "right"; label: string; onClick: () => void; children: React.ReactNode;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label={label}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "absolute", top: "50%", [side]: 16,
        transform: "translateY(-50%)", zIndex: 10,
        width: 44, height: 44, borderRadius: "50%", border: "none",
        background: hov ? "var(--gold)" : "rgba(255,255,255,.85)",
        color: hov ? "var(--forest)" : "#111",
        boxShadow: "0 4px 16px rgba(0,0,0,.28)",
        cursor: "pointer", fontSize: 26,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .2s",
      }}
    >{children}</button>
  );
}
