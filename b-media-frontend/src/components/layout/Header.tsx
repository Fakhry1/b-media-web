"use client";

import { useState, useEffect } from "react";
import { Search, Moon, Sun, Menu, X, LogOut } from "lucide-react";
import { getUser, clearSession, type UserInfo } from "@/lib/auth";
import { useLang } from "@/lib/LangContext";

export default function Header() {
  const { lang, t, setLang } = useLang();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [user, setUser] = useState<UserInfo | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("bmedia-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = (saved as "light" | "dark") || (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
    setUser(getUser());
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("bmedia-theme", next);
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setUserMenuOpen(false);
    window.location.href = "/login";
  };

  const displayName = user ? (user.firstName || user.username) : null;

  const navLinks = [
    { href: "/", label: t.home },
    { href: "/video", label: t.video },
    { href: "/gallery", label: t.gallery },
    { href: "/audio", label: t.audio },
    { href: "/articles", label: t.articles },
    { href: "/categories", label: t.categories },
    { href: "/contents", label: t.contents },
  ];

  return (
    <>
      {/* Announcement bar */}
      <div style={{ background: "linear-gradient(90deg,var(--forest),#1A4332)", color: "var(--gold-pale)" }}
        className="text-xs font-medium py-2 text-center">
        {user ? (
          <>👋 {lang === "ar" ? "مرحباً،" : "Welcome,"} <span style={{ color: "var(--gold)", fontWeight: 700 }}>{displayName}</span> — {lang === "ar" ? "أهلاً بك في BMedia" : "Welcome to BMedia"}</>
        ) : (
          <>🌙 {lang === "ar" ? "أحدث محتوى:" : "Latest content:"} <span style={{ color: "var(--gold)", fontWeight: 700 }}>{lang === "ar" ? "تفسير سورة يوسف" : "Tafsir Surah Yusuf"}</span> — {lang === "ar" ? "متاح الآن" : "Now available"}</>
        )}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b"
        style={{ background: "color-mix(in srgb,var(--surface) 92%,transparent)", borderColor: "var(--line)", backdropFilter: "saturate(180%) blur(16px)" }}>
        <div className="container-main">
          <div className="flex items-center justify-between gap-4 py-3">

            {/* Brand */}
            <a href="/" className="flex items-center gap-3">
              <div className="w-8 h-9 rounded-xl flex items-center justify-center text-lg font-bold"
                style={{ background: "linear-gradient(135deg,var(--gold),var(--gold-2))", color: "var(--forest)" }}>ب</div>
              <div>
                <div className="text-lg font-bold leading-none" style={{ color: "var(--forest)", fontFamily: "'Noto Kufi Arabic',sans-serif" }}>BMedia</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{lang === "ar" ? "منصة المحتوى الرقمي" : "Digital Media Platform"}</div>
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
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border"
                style={{ background: "var(--surface-2)", borderColor: "var(--line)", width: "200px" }}>
                <Search size={14} style={{ color: "var(--muted-2)", flexShrink: 0 }} />
                <input type="search" placeholder={t.search} className="bg-transparent border-none outline-none w-full text-sm"
                  style={{ color: "var(--ink)" }} />
              </div>

              {/* Lang toggle */}
              <button onClick={() => setLang(lang === "ar" ? "en" : "ar")}
                className="hidden sm:flex w-10 h-10 rounded-xl border items-center justify-center text-xs font-bold transition-all"
                style={{ background: "var(--surface)", borderColor: "var(--line)", color: "var(--forest)" }}
                title="Switch language / تبديل اللغة">
                {lang === "ar" ? "EN" : "ع"}
              </button>

              {/* Theme toggle */}
              <button onClick={toggleTheme} className="w-10 h-10 rounded-xl border flex items-center justify-center transition-all"
                style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
                {theme === "dark" ? <Sun size={16} style={{ color: "var(--gold)" }} /> : <Moon size={16} style={{ color: "var(--ink-2)" }} />}
              </button>

              {/* User area */}
              {user ? (
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(v => !v)}
                    className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border transition-all"
                    style={{ background: "var(--surface)", borderColor: "var(--line-gold)" }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                      style={{ background: "linear-gradient(135deg,var(--gold),var(--gold-2))", color: "var(--forest)" }}>
                      {displayName?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{displayName}</span>
                  </button>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute left-0 mt-2 w-48 rounded-2xl border z-20 overflow-hidden"
                        style={{ background: "var(--surface)", borderColor: "var(--line)", boxShadow: "var(--shadow-lg)" }}>
                        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--line)" }}>
                          <p className="text-sm font-bold" style={{ color: "var(--ink)" }}>{displayName}</p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{user.email}</p>
                        </div>
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm transition-all"
                          style={{ color: "#DC2626" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(220,38,38,.06)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <LogOut size={14} /> {t.logout}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <a href="/login" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                  style={{ background: "var(--forest)", color: "#fff" }}>
                  {t.login}
                </a>
              )}

              {/* Mobile menu */}
              <button onClick={() => setDrawerOpen(true)} className="md:hidden w-10 h-10 rounded-xl border flex items-center justify-center"
                style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
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
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-black"
                style={{ background: "linear-gradient(135deg,var(--gold),var(--gold-2))", color: "var(--forest)" }}>
                {displayName?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--ink)" }}>{displayName}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{user.email}</p>
              </div>
            </div>
          ) : (
            <span className="text-lg font-bold" style={{ fontFamily: "'Noto Kufi Arabic',sans-serif", color: "var(--ink)" }}>BMedia</span>
          )}
          <button onClick={() => setDrawerOpen(false)} className="w-9 h-9 rounded-xl border flex items-center justify-center"
            style={{ background: "var(--surface-2)", borderColor: "var(--line)" }}>
            <X size={16} style={{ color: "var(--ink)" }} />
          </button>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setDrawerOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "var(--ink)" }}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="p-4 border-t flex gap-2" style={{ borderColor: "var(--line)" }}>
          {user ? (
            <button onClick={handleLogout} className="flex-1 py-2 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: "rgba(220,38,38,.10)", color: "#DC2626", border: "1px solid rgba(220,38,38,.20)" }}>
              <LogOut size={14} /> {t.logout}
            </button>
          ) : (
            <a href="/login" className="flex-1 py-2 rounded-xl text-center text-sm font-bold"
              style={{ background: "var(--forest)", color: "#fff" }}>
              {t.login}
            </a>
          )}
          <button onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="w-10 h-10 rounded-xl border flex items-center justify-center text-xs font-bold"
            style={{ background: "var(--surface-2)", borderColor: "var(--line)", color: "var(--forest)" }}>
            {lang === "ar" ? "EN" : "ع"}
          </button>
          <button onClick={toggleTheme} className="w-10 h-10 rounded-xl border flex items-center justify-center"
            style={{ background: "var(--surface-2)", borderColor: "var(--line)" }}>
            {theme === "dark" ? <Sun size={16} style={{ color: "var(--gold)" }} /> : <Moon size={16} />}
          </button>
        </div>
      </aside>
    </>
  );
}
