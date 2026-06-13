"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, saveSession } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
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
          setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        } else if (err.status === 429) {
          setError("تم تجاوز عدد المحاولات المسموح بها. يرجى الانتظار قبل المحاولة مجدداً");
        } else {
          setError(err.message || "حدث خطأ غير متوقع");
        }
      } else {
        setError("تعذّر الاتصال بالخادم. تحقق من اتصالك بالإنترنت");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(150deg,var(--forest) 0%,#142E22 60%,#0B2318 100%)" }}>

      {/* BG decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle,rgba(200,168,75,.12),transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle,rgba(26,67,50,.35),transparent 65%)" }} />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-extrabold"
              style={{ background: "linear-gradient(135deg,var(--gold),var(--gold-2))", color: "var(--forest)" }}>
              ب
            </div>
            <span className="text-2xl font-bold text-white" style={{ fontFamily: "'Noto Kufi Arabic',sans-serif" }}>
              BMedia
            </span>
          </Link>
          <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,.55)" }}>
            مرحباً بعودتك — سجّل دخولك للمتابعة
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8"
          style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(200,168,75,.18)", backdropFilter: "blur(16px)", boxShadow: "0 32px 80px rgba(0,0,0,.40)" }}>

          <h1 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "'Noto Kufi Arabic',sans-serif" }}>
            تسجيل الدخول
          </h1>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: "rgba(220,38,38,.15)", border: "1px solid rgba(220,38,38,.30)", color: "#FCA5A5" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "rgba(255,255,255,.75)" }}>
                البريد الإلكتروني
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@domain.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(200,168,75,.20)", color: "#fff", direction: "ltr" }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--gold)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(200,168,75,.20)")}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold" style={{ color: "rgba(255,255,255,.75)" }}>
                  كلمة المرور
                </label>
                <a href="#" className="text-xs" style={{ color: "var(--gold)" }}>نسيت كلمة المرور؟</a>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(200,168,75,.20)", color: "#fff", direction: "ltr", paddingLeft: "60px" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "var(--gold)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(200,168,75,.20)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs px-1"
                  style={{ color: "rgba(255,255,255,.45)" }}>
                  {showPass ? "إخفاء" : "إظهار"}
                </button>
              </div>
            </div>

            {/* Remember */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" className="w-4 h-4 rounded" />
              <span className="text-sm" style={{ color: "rgba(255,255,255,.60)" }}>تذكّرني</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all mt-1"
              style={{
                background: loading ? "rgba(200,168,75,.50)" : "var(--gold)",
                color: "var(--forest)",
                boxShadow: loading ? "none" : "0 8px 32px rgba(200,168,75,.35)",
                cursor: loading ? "not-allowed" : "pointer",
              }}>
              {loading ? "جارٍ التحقق..." : "دخول"}
            </button>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-sm mt-6" style={{ color: "rgba(255,255,255,.45)" }}>
          ليس لديك حساب؟{" "}
          <Link href="/register" style={{ color: "var(--gold)" }} className="font-semibold">
            سجّل مجاناً
          </Link>
        </p>
      </div>
    </div>
  );
}
