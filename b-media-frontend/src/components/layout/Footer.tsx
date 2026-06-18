"use client";

export default function Footer() {
  return (
    <footer style={{ background: "color-mix(in srgb,var(--forest) 95%,#000)", borderTop: "1px solid rgba(200,168,75,.12)" }}>
      <div className="container-main">
        <div className="flex justify-between flex-wrap gap-3 py-5 text-xs"
          style={{ color: "rgba(255,255,255,.45)" }}>
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
