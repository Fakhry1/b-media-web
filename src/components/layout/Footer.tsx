"use client";

import { useLang } from "@/lib/LangContext";

export default function Footer() {
  const { t } = useLang();

  const columns = [
    {
      title: t.footerSections,
      links: [
        { label: t.footerVideo, href: "/video" },
        { label: t.footerImages, href: "/gallery" },
        { label: t.footerAudio, href: "/audio" },
        { label: t.footerArticlesLabel, href: "/articles" },
      ],
    },
    {
      title: t.footerQuickLinks,
      links: [
        { label: t.footerAbout, href: "#" },
        { label: t.footerLibrary, href: "#" },
        { label: t.footerBlog, href: "#" },
        { label: t.footerFAQ, href: "#" },
      ],
    },
    {
      title: t.footerSupport,
      links: [
        { label: t.footerContact, href: "#" },
        { label: t.footerPrivacyPolicy, href: "#" },
        { label: t.footerTermsOfUse, href: "#" },
      ],
    },
  ];

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
            <p className="text-sm leading-relaxed">{t.footerDesc}</p>
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
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-white text-sm font-bold mb-4 flex items-center gap-2">
                <span className="w-1 h-4 rounded-sm" style={{ background: "var(--gold)" }} />
                {col.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm transition-colors"
                      style={{ color: "rgba(255,255,255,.50)" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,.50)")}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-5 flex justify-between flex-wrap gap-3 text-xs"
          style={{ borderTop: "1px solid rgba(200,168,75,.12)" }}>
          <span>{t.footerCopyright}</span>
          <div className="flex gap-4">
            {[{ label: t.footerPrivacy }, { label: t.footerTermsShort }].map((l) => (
              <a key={l.label} href="#" style={{ color: "rgba(255,255,255,.40)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,.40)")}>
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
