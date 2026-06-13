"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { createContent, uploadAsset, guessMediaType } from "@/lib/contents";
import { getCategories, type CategoryDto } from "@/lib/categories";
import { ApiError } from "@/lib/api";
import { useLang } from "@/lib/LangContext";

const LANGS = [
  { code: "ar", label: "العربية" }, { code: "en", label: "English" },
  { code: "fr", label: "Français" }, { code: "ur", label: "اردو" },
];

const MEDIA_ICONS: Record<string, string> = {
  "video": "🎬", "image": "🖼", "audio": "🎙", "document": "📄", "pdf": "📋",
};

function Step({ n, active, done, label }: { n: number; active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all"
        style={{
          background: done ? "var(--forest)" : active ? "var(--gold)" : "var(--surface-2)",
          color: done ? "#fff" : active ? "var(--forest)" : "var(--muted)",
          border: active ? "2px solid var(--gold)" : done ? "2px solid var(--forest)" : "2px solid var(--line)",
        }}>
        {done ? "✓" : n}
      </div>
      <span className="text-sm font-semibold hidden sm:block"
        style={{ color: active ? "var(--ink)" : "var(--muted)" }}>{label}</span>
    </div>
  );
}

function FieldLabel({ text }: { text: string }) {
  return <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--ink-2)" }}>{text}</label>;
}
function InputEl(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
      style={{ background: "var(--surface)", border: "1.5px solid var(--line)", color: "var(--ink)", ...props.style }}
      onFocus={e => (e.currentTarget.style.borderColor = "var(--gold)")}
      onBlur={e => (e.currentTarget.style.borderColor = "var(--line)")} />
  );
}
function TextareaEl(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} rows={3} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all resize-none"
      style={{ background: "var(--surface)", border: "1.5px solid var(--line)", color: "var(--ink)", ...props.style }}
      onFocus={e => (e.currentTarget.style.borderColor = "var(--gold)")}
      onBlur={e => (e.currentTarget.style.borderColor = "var(--line)")} />
  );
}
function ErrMsg({ msg }: { msg: string }) {
  return msg ? <p className="px-3 py-2 rounded-xl text-xs font-medium mt-1"
    style={{ background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.20)", color: "#DC2626" }}>{msg}</p> : null;
}

interface UploadedFile {
  file: File;
  mediaType: number;
  isPrimary: boolean;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  assetId?: string;
  publicUrl?: string;
  error?: string;
}

export default function NewContentPage() {
  const { lang } = useLang();
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1 — basic info
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [language, setLanguage] = useState("ar");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [step1Error, setStep1Error] = useState("");
  const [creating, setCreating] = useState(false);
  const [contentId, setContentId] = useState("");

  // Step 2 — files
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { getCategories(true).then(setCategories).catch(() => {}); }, []);

  const selectedCat = categories.find(c => c.id === categoryId);

  /* ── Step 1: create content ──────────────────────── */
  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setStep1Error(""); setCreating(true);
    try {
      const res = await createContent({
        title, summary: summary || undefined, language,
        categoryId: categoryId || undefined,
        subcategoryId: subcategoryId || undefined,
        scheduledPublishAt: scheduledAt || undefined,
      });
      setContentId(res.contentId);
      setStep(2);
    } catch (err) {
      setStep1Error(err instanceof ApiError ? err.message : (lang === "ar" ? "حدث خطأ غير متوقع" : "Unexpected error"));
    } finally { setCreating(false); }
  }

  /* ── Step 2: file drop/select ────────────────────── */
  function addFiles(fileList: FileList) {
    const newFiles: UploadedFile[] = Array.from(fileList).map(f => ({
      file: f, mediaType: guessMediaType(f),
      isPrimary: files.length === 0,
      status: "pending", progress: 0,
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }

  async function uploadAll() {
    const pending = files.filter(f => f.status === "pending");
    if (pending.length === 0) { setStep(3); return; }
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== "pending") continue;
      setFiles(prev => prev.map((f, j) => j === i ? { ...f, status: "uploading", progress: 10 } : f));
      try {
        const res = await uploadAsset({
          file: files[i].file, contentId, mediaType: files[i].mediaType,
          language, isPrimary: files[i].isPrimary, sortOrder: i,
        });
        setFiles(prev => prev.map((f, j) => j === i ? { ...f, status: "done", progress: 100, assetId: res.assetId, publicUrl: res.publicUrl ?? undefined } : f));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setFiles(prev => prev.map((f, j) => j === i ? { ...f, status: "error", error: msg } : f));
      }
    }
    setUploading(false);
  }

  function getFileIcon(f: UploadedFile) {
    const mime = f.file.type;
    if (mime.startsWith("video/")) return MEDIA_ICONS.video;
    if (mime.startsWith("image/")) return MEDIA_ICONS.image;
    if (mime.startsWith("audio/")) return MEDIA_ICONS.audio;
    if (mime === "application/pdf") return MEDIA_ICONS.pdf;
    return MEDIA_ICONS.document;
  }

  const steps = lang === "ar"
    ? ["المعلومات الأساسية", "الملفات والوسائط", "مكتمل"]
    : ["Basic Info", "Files & Media", "Done"];

  return (
    <>
      <Header />
      <main className="flex-1 py-8">
        <div className="container-main max-w-2xl">

          {/* Steps indicator */}
          <div className="flex items-center gap-2 mb-8">
            <Step n={1} active={step === 1} done={step > 1} label={steps[0]} />
            <div className="flex-1 h-0.5 rounded mx-1" style={{ background: step > 1 ? "var(--forest)" : "var(--line)" }} />
            <Step n={2} active={step === 2} done={step > 2} label={steps[1]} />
            <div className="flex-1 h-0.5 rounded mx-1" style={{ background: step > 2 ? "var(--forest)" : "var(--line)" }} />
            <Step n={3} active={step === 3} done={false} label={steps[2]} />
          </div>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="rounded-3xl p-6 border" style={{ background: "var(--surface)", borderColor: "var(--line)", boxShadow: "var(--shadow-md)" }}>
              <h2 className="text-xl font-extrabold mb-6" style={{ fontFamily: "'Noto Kufi Arabic',sans-serif", color: "var(--ink)" }}>
                {lang === "ar" ? "معلومات المحتوى" : "Content Information"}
              </h2>
              <form onSubmit={handleStep1} className="flex flex-col gap-5">
                <div>
                  <FieldLabel text={lang === "ar" ? "العنوان *" : "Title *"} />
                  <InputEl required value={title} onChange={e => setTitle(e.target.value)}
                    placeholder={lang === "ar" ? "أدخل عنوان المحتوى..." : "Enter content title..."} />
                </div>
                <div>
                  <FieldLabel text={lang === "ar" ? "الملخص" : "Summary"} />
                  <TextareaEl value={summary} onChange={e => setSummary(e.target.value)}
                    placeholder={lang === "ar" ? "وصف مختصر للمحتوى..." : "Brief description..."} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel text={lang === "ar" ? "اللغة *" : "Language *"} />
                    <select required value={language} onChange={e => setLanguage(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: "var(--surface)", border: "1.5px solid var(--line)", color: "var(--ink)" }}>
                      {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <FieldLabel text={lang === "ar" ? "التصنيف" : "Category"} />
                    <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setSubcategoryId(""); }}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: "var(--surface)", border: "1.5px solid var(--line)", color: "var(--ink)" }}>
                      <option value="">{lang === "ar" ? "— اختر تصنيف —" : "— Select category —"}</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                {selectedCat && selectedCat.subcategories.length > 0 && (
                  <div>
                    <FieldLabel text={lang === "ar" ? "التصنيف الفرعي" : "Subcategory"} />
                    <select value={subcategoryId} onChange={e => setSubcategoryId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: "var(--surface)", border: "1.5px solid var(--line)", color: "var(--ink)" }}>
                      <option value="">{lang === "ar" ? "— اختر —" : "— Select —"}</option>
                      {selectedCat.subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <FieldLabel text={lang === "ar" ? "موعد النشر (اختياري)" : "Scheduled Publish (optional)"} />
                  <InputEl type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
                </div>
                <ErrMsg msg={step1Error} />
                <button type="submit" disabled={creating}
                  className="w-full py-3 rounded-xl text-sm font-bold mt-1"
                  style={{ background: creating ? "rgba(11,35,24,.4)" : "var(--forest)", color: "#fff", cursor: creating ? "not-allowed" : "pointer" }}>
                  {creating ? (lang === "ar" ? "جارٍ الإنشاء..." : "Creating...") : (lang === "ar" ? "التالي: الملفات" : "Next: Files")} →
                </button>
              </form>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="rounded-3xl p-6 border" style={{ background: "var(--surface)", borderColor: "var(--line)", boxShadow: "var(--shadow-md)" }}>
              <h2 className="text-xl font-extrabold mb-2" style={{ fontFamily: "'Noto Kufi Arabic',sans-serif", color: "var(--ink)" }}>
                {lang === "ar" ? "الملفات والوسائط" : "Files & Media"}
              </h2>
              <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
                {lang === "ar" ? "أضف الفيديوهات والصور والصوتيات والمستندات المرتبطة بهذا المحتوى" : "Add videos, images, audio, and documents for this content"}
              </p>

              {/* Drop zone */}
              <div
                className="border-2 border-dashed rounded-2xl p-8 text-center mb-5 transition-all"
                style={{ borderColor: dragOver ? "var(--gold)" : "var(--line)", background: dragOver ? "rgba(200,168,75,.06)" : "var(--surface-2)" }}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}>
                <p className="text-3xl mb-2">📁</p>
                <p className="font-semibold mb-1" style={{ color: "var(--ink)" }}>
                  {lang === "ar" ? "اسحب الملفات هنا" : "Drag files here"}
                </p>
                <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
                  {lang === "ar" ? "أو اضغط لاختيار الملفات" : "or click to browse"}
                </p>
                <label className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer"
                  style={{ background: "var(--forest)", color: "#fff" }}>
                  {lang === "ar" ? "اختر ملفات" : "Browse Files"}
                  <input type="file" multiple className="hidden"
                    accept="video/*,image/*,audio/*,.pdf,.doc,.docx"
                    onChange={e => { if (e.target.files) addFiles(e.target.files); }} />
                </label>
              </div>

              {/* File list */}
              {files.length > 0 && (
                <div className="flex flex-col gap-2 mb-5">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                      style={{ background: "var(--surface-2)", borderColor: f.status === "error" ? "#DC262640" : f.status === "done" ? "#22C55E40" : "var(--line)" }}>
                      <span className="text-xl">{getFileIcon(f)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>{f.file.name}</p>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>
                          {(f.file.size / 1024 / 1024).toFixed(2)} MB
                          {f.status === "error" && <span className="text-red-500 mr-2"> — {f.error}</span>}
                          {f.status === "done" && <span style={{ color: "#22C55E" }}> — {lang === "ar" ? "تم الرفع" : "Uploaded"} ✓</span>}
                          {f.status === "uploading" && <span style={{ color: "var(--gold)" }}> — {lang === "ar" ? "جارٍ الرفع..." : "Uploading..."}</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <label className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: "var(--muted)" }}>
                          <input type="radio" name="primary" checked={f.isPrimary}
                            onChange={() => setFiles(prev => prev.map((p, j) => ({ ...p, isPrimary: j === i })))} />
                          {lang === "ar" ? "رئيسي" : "Primary"}
                        </label>
                        {f.status === "pending" && (
                          <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs"
                            style={{ background: "rgba(220,38,38,.10)", color: "#DC2626" }}>✕</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setStep(3); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold border"
                  style={{ borderColor: "var(--line)", color: "var(--ink)" }}>
                  {lang === "ar" ? "تخطّي" : "Skip"}
                </button>
                <button onClick={uploadAll} disabled={uploading || files.filter(f => f.status === "pending").length === 0}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                  style={{
                    background: uploading ? "rgba(11,35,24,.4)" : "var(--forest)", color: "#fff",
                    cursor: (uploading || files.filter(f => f.status === "pending").length === 0) ? "not-allowed" : "pointer",
                    opacity: files.filter(f => f.status === "pending").length === 0 && !uploading ? 0.5 : 1,
                  }}>
                  {uploading
                    ? (lang === "ar" ? "جارٍ الرفع..." : "Uploading...")
                    : (lang === "ar" ? `رفع ${files.filter(f => f.status === "pending").length} ملف` : `Upload ${files.filter(f => f.status === "pending").length} file(s)`)}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Done ── */}
          {step === 3 && (
            <div className="rounded-3xl p-8 border text-center" style={{ background: "var(--surface)", borderColor: "var(--line-gold)", boxShadow: "var(--shadow-md)" }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
                style={{ background: "rgba(34,197,94,.12)", border: "2px solid rgba(34,197,94,.30)" }}>✓</div>
              <h2 className="text-xl font-extrabold mb-2" style={{ fontFamily: "'Noto Kufi Arabic',sans-serif", color: "var(--ink)" }}>
                {lang === "ar" ? "تم إنشاء المحتوى!" : "Content Created!"}
              </h2>
              <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
                {lang === "ar" ? "يمكنك الآن إدارة المحتوى ومتابعة سير العمل" : "You can now manage the content and track workflow progress"}
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => router.push(`/contents/${contentId}`)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold"
                  style={{ background: "var(--forest)", color: "#fff" }}>
                  {lang === "ar" ? "إدارة المحتوى" : "Manage Content"}
                </button>
                <button onClick={() => router.push("/contents/new")}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold border"
                  style={{ borderColor: "var(--line-gold)", color: "var(--forest)" }}>
                  + {lang === "ar" ? "إضافة محتوى آخر" : "Add Another"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
