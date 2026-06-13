"use client";

import { useState, useEffect } from "react";
import { Search, Moon, Sun, Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/video", label: "فيديو" },
  { href: "/gallery", label: "صور" },
  { href: "/audio", label: "صوت" },
  { href: "/articles", label: "قراءة" },
];

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("bmedia-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = (saved as "light" | "dark") || (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("bmedia-theme", next);
  };

  return (
    <>
      {/* Announcement bar */}
      <div style={{ background: "linear-gradient(90deg,var(--forest),#1A4332)", color: "var(--gold-pale)" }}
           className="text-xs font-medium py-2 text-center relative overflow-hidden">
        <div className="relative z-10">
          🌙 أحدث محتوى: <span style={{ color: "var(--gold)", fontWeight: 700 }}>تفسير سورة يوسف</span> — متاح الآن
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b"
        style={{ background: "color-mix(in srgb,var(--surface) 92%,transparent)", borderColor: "var(--line)", backdropFilter: "saturate(180%) blur(16px)" }}>
        <div className="container-main">
          <div className="flex items-center justify-between gap-4 py-3">

            {/* Brand */}
            <a href="/" className="flex items-center gap-3" aria-label="BMedia">
              <div className="w-8 h-9 rounded-xl flex items-center justify-center text-lg font-bold"
                style={{ background: "linear-gradient(135deg,var(--gold),var(--gold-2))", color: "var(--forest)" }}>
                ب
              </div>
              <div>
                <div className="text-lg font-bold leading-none" style={{ color: "var(--forest)", fontFamily: "'Noto Kufi Arabic',sans-serif" }}>
                  BMedia
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>منصة المحتوى الرقمي</div>
              </div>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-1">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href}
                  className="px-3 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{ color: "var(--muted)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--ink)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}>
                  {l.label}
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all"
                style={{ background: "var(--surface-2)", borderColor: "var(--line)", width: "220px" }}>
                <Search size={14} style={{ color: "var(--muted-2)", flexShrink: 0 }} />
                <input type="search" placeholder="ابحث في المحتوى..." className="bg-transparent border-none outline-none w-full text-sm"
                  style={{ color: "var(--ink)" }} />
              </div>

              {/* Theme toggle */}
              <button onClick={toggleTheme} className="w-10 h-10 rounded-xl border flex items-center justify-center transition-all"
                style={{ background: "var(--surface)", borderColor: "var(--line)" }} aria-label="تبديل المظهر">
                {theme === "dark"
                  ? <Sun size={16} style={{ color: "var(--gold)" }} />
                  : <Moon size={16} style={{ color: "var(--ink-2)" }} />}
              </button>

              {/* Login */}
              <a href="/login" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: "var(--forest)", color: "#fff" }}>
                تسجيل الدخول
              </a>

              {/* Mobile menu */}
              <button onClick={() => setDrawerOpen(true)} className="md:hidden w-10 h-10 rounded-xl border flex items-center justify-center"
                style={{ background: "var(--surface)", borderColor: "var(--line)" }} aria-label="القائمة">
                <Menu size={18} style={{ color: "var(--ink-2)" }} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[70]" onClick={() => setDrawerOpen(false)}
          style={{ background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)" }} />
      )}
      <aside className={`fixed top-0 bottom-0 right-0 z-[80] w-[min(90vw,380px)] flex flex-col transition-transform duration-300 ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ background: "var(--surface)", borderLeft: "1px solid var(--line)", boxShadow: "var(--shadow-lg)" }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--line)" }}>
          <span className="text-lg font-bold" style={{ fontFamily: "'Noto Kufi Arabic',sans-serif", color: "var(--ink)" }}>BMedia</span>
          <button onClick={() => setDrawerOpen(false)} className="w-9 h-9 rounded-xl border flex items-center justify-center"
            style={{ background: "var(--surface-2)", borderColor: "var(--line)" }}>
            <X size={16} style={{ color: "var(--ink)" }} />
          </button>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setDrawerOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-medium transition-all"
              style={{ color: "var(--ink)" }}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="p-4 border-t flex gap-2" style={{ borderColor: "var(--line)" }}>
          <a href="/login" className="flex-1 py-2 rounded-xl text-center text-sm font-bold"
            style={{ background: "var(--forest)", color: "#fff" }}>
            تسجيل الدخول
          </a>
          <button onClick={toggleTheme} className="w-10 h-10 rounded-xl border flex items-center justify-center"
            style={{ background: "var(--surface-2)", borderColor: "var(--line)" }}>
            {theme === "dark" ? <Sun size={16} style={{ color: "var(--gold)" }} /> : <Moon size={16} />}
          </button>
        </div>
      </aside>
    </>
  );
}
