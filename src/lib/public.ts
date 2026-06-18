const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function pfetch<T>(path: string, signal?: AbortSignal): Promise<T> {
  const r = await fetch(`${BASE}${path}`, { signal, cache: "no-store" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export interface PublicItem {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  language: string;
  isFeatured: boolean;
  publishedAt: string | null;
  categoryName: string | null;
  thumbnailUrl: string | null;
  tags: string[];
}

export interface PublicPage {
  items: PublicItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PubCategory {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  subcategories: { id: string; name: string; slug: string }[];
}

export interface PubContentDetail {
  id: string;
  title: string;
  summary: string | null;
  language: string;
  categoryName: string | null;
  publishedAt: string | null;
  mediaAssets: {
    id: string;
    mediaType: string;
    status: string;
    isPrimary: boolean;
    originalFileName: string;
    fileSizeBytes: number;
    contentType: string;
    publicUrl: string | null;
  }[];
  tags: string[];
}

export function fetchPublicContents(params: {
  page?: number; pageSize?: number; categoryId?: string;
  subcategoryId?: string; language?: string; mediaType?: number;
  isFeatured?: boolean;
} = {}, signal?: AbortSignal): Promise<PublicPage> {
  const q = new URLSearchParams({ status: "Published" });
  if (params.page) q.set("page", String(params.page));
  if (params.pageSize) q.set("pageSize", String(params.pageSize));
  if (params.categoryId) q.set("categoryId", params.categoryId);
  if (params.subcategoryId) q.set("subcategoryId", params.subcategoryId);
  if (params.language) q.set("language", params.language);
  if (params.mediaType) q.set("mediaType", String(params.mediaType));
  if (params.isFeatured !== undefined) q.set("isFeatured", String(params.isFeatured));
  return pfetch<PublicPage>(`/api/v1/contents?${q}`, signal);
}

export function fetchPublicCategories(signal?: AbortSignal): Promise<PubCategory[]> {
  return pfetch<PubCategory[]>("/api/v1/categories", signal);
}

export function fetchPublicDetail(id: string, signal?: AbortSignal): Promise<PubContentDetail> {
  return pfetch<PubContentDetail>(`/api/v1/contents/${id}`, signal);
}

export function fetchSignedUrl(assetId: string, signal?: AbortSignal): Promise<{ url: string }> {
  return pfetch<{ url: string }>(`/api/v1/mediaassets/${assetId}/url`, signal);
}

export async function downloadBlob(url: string, filename: string): Promise<void> {
  const a = document.createElement("a");
  try {
    const resp = await fetch(url);
    const blob = await resp.blob();
    const blobUrl = URL.createObjectURL(blob);
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  } catch {
    a.href = url;
    a.target = "_blank";
    a.rel = "noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
