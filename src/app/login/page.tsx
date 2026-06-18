"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, saveSession } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { useLang } from "@/lib/LangContext";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      saveSession(result);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError(t.wrongCredentials);
        } else if (err.status === 429) {
          setError(t.tooManyAttempts);
        } else {
          setError(err.message || t.unexpectedError);
        }
      } else {
        setError(t.serverError);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>

      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-10 relative overflow-hidden"
        style={{ background: "linear-gradient(155deg,var(--forest) 0%,#142E22 60%,#0B2318 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position: "absolute", top: "-15%", right: "-15%", width: "380px", height: "380px", borderRadius: "50%", background: "radial-gradient(circle,rgba(200,168,75,.15),transparent 65%)" }} />
          <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle,rgba(26,67,50,.50),transparent 65%)" }} />
        </div>

        <Link href="/" className="relative z-10 inline-flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-extrabold"
            style={{ background: "linear-gradient(135deg,var(--gold),var(--gold-2))", color: "var(--forest)" }}>ب</div>
          <span className="text-xl font-bold text-white" style={{ fontFamily: "'Noto Kufi Arabic',sans-serif" }}>BMedia</span>
        </Link>

        <div className="relative z-10">
          <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(200,168,75,.18)" }}>
            <p className="text-white font-bold text-lg leading-loose" style={{ fontFamily: "'Scheherazade New',serif" }}>
              وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ
            </p>
            <p className="text-xs mt-3 font-medium" style={{ color: "var(--gold)" }}>{t.loginQuranRef}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "🎬", label: t.loginFeatureVideoLabel,    desc: t.loginFeatureVideoDesc    },
              { icon: "🎙️", label: t.loginFeatureAudioLabel,   desc: t.loginFeatureAudioDesc   },
              { icon: "📋", label: t.loginFeatureArticlesLabel, desc: t.loginFeatureArticlesDesc },
              { icon: "🖼️", label: t.loginFeatureGalleryLabel,  desc: t.loginFeatureGalleryDesc  },
            ].map(f => (
              <div key={f.label} className="rounded-xl p-3"
                style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(200,168,75,.15)" }}>
                <div className="text-xl mb-1">{f.icon}</div>
                <p className="text-white text-xs font-bold leading-snug" style={{ fontFamily: "'Noto Kufi Arabic',sans-serif" }}>{f.label}</p>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,.50)", lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-up">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-extrabold"
              style={{ background: "linear-gradient(135deg,var(--gold),var(--gold-2))", color: "var(--forest)" }}>ب</div>
            <span className="text-xl font-bold" style={{ fontFamily: "'Noto Kufi Arabic',sans-serif", color: "var(--ink)" }}>BMedia</span>
          </div>

          <h1 className="text-2xl font-extrabold mb-1" style={{ fontFamily: "'Noto Kufi Arabic',sans-serif", color: "var(--ink)" }}>
            {t.loginTitle}
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>{t.loginSubtitle}</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.20)", color: "#DC2626" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--ink-2)" }}>{t.email}</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="example@domain.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: "var(--surface)", border: "1.5px solid var(--line)", color: "var(--ink)", direction: "ltr", boxShadow: "var(--shadow-sm)" }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--gold)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--line)")}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold" style={{ color: "var(--ink-2)" }}>{t.password}</label>
                <a href="#" className="text-xs font-medium" style={{ color: "var(--forest)" }}>{t.forgotPass}</a>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "var(--surface)", border: "1.5px solid var(--line)", color: "var(--ink)", direction: "ltr", paddingLeft: "60px", boxShadow: "var(--shadow-sm)" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "var(--gold)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "var(--line)")}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs px-1" style={{ color: "var(--muted)" }}>
                  {showPass ? t.hide : t.show}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" className="w-4 h-4 rounded" />
              <span className="text-sm" style={{ color: "var(--muted)" }}>{t.remember}</span>
            </label>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all mt-1"
              style={{
                background: loading ? "rgba(11,35,24,.45)" : "var(--forest)",
                color: "#fff",
                boxShadow: loading ? "none" : "0 8px 24px rgba(11,35,24,.22)",
                cursor: loading ? "not-allowed" : "pointer",
              }}>
              {loading ? t.loggingIn : t.loginButton}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--muted)" }}>
            {t.noAccount}{" "}
            <Link href="/register" className="font-semibold" style={{ color: "var(--forest)" }}>{t.registerFree}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
