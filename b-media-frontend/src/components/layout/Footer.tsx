"use client";

export default function Footer() {
  return (
    <footer style={{ background: "color-mix(in srgb,var(--forest) 95%,#000)", color: "rgba(255,255,255,.55)" }}
      className="pt-14 pb-7">
      <div className="container-main">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-10 rounded-xl flex items-center justify-center text-xl font-bold"
                style={{ background: "linear-gradient(135deg,var(--gold),var(--gold-2))", color: "var(--forest)" }}>
                ب
              </div>
              <span className="text-xl font-bold text-white" style={{ fontFamily: "'Noto Kufi Arabic',sans-serif" }}>BMedia</span>
            </div>
            <p className="text-sm leading-relaxed">منصة رقمية متكاملة لإدارة ونشر المحتوى الإعلامي بجودة عالية وأمان كامل.</p>
            <div className="flex gap-2 mt-5 flex-wrap">
              {["f", "𝕏", "ig", "yt"].map((s) => (
                <a key={s} href="#" className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all"
                  style={{ background: "rgba(200,168,75,.08)", border: "1px solid rgba(200,168,75,.20)", color: "var(--gold-2)" }}>
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: "الأقسام", links: ["الفيديو", "الصور", "الصوت", "المقالات"] },
            { title: "روابط سريعة", links: ["عن المنصة", "المكتبة", "المدونة", "الأسئلة الشائعة"] },
            { title: "الدعم", links: ["تواصل معنا", "سياسة الخصوصية", "شروط الاستخدام"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-white text-sm font-bold mb-4 flex items-center gap-2">
                <span className="w-1 h-4 rounded-sm" style={{ background: "var(--gold)" }} />
                {col.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm transition-colors hover:text-gold-2"
                      style={{ color: "rgba(255,255,255,.50)" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,.50)")}>
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-5 flex justify-between flex-wrap gap-3 text-xs"
          style={{ borderTop: "1px solid rgba(200,168,75,.12)" }}>
          <span>© ٢٠٢٦ BMedia. جميع الحقوق محفوظة.</span>
          <div className="flex gap-4">
            {["الخصوصية", "الشروط"].map((l) => (
              <a key={l} href="#" style={{ color: "rgba(255,255,255,.40)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,.40)")}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
