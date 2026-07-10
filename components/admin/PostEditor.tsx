"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { RichTextEditor } from "@/components/RichTextEditor";
import { slugify } from "@/lib/utils";
import { ImagePlus, Eye } from "lucide-react";

type Category = { id: string; name: string };
type Tag = { id: string; name: string };

export type PostEditorInitial = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  contentHtml?: string;
  coverImageUrl?: string;
  categoryId?: string;
  tagIds?: string[];
  status?: string;
  scheduledAt?: string;
  isFeatured?: boolean;
  isSticky?: boolean;
  isTrending?: boolean;
  isSponsored?: boolean;
  sponsorName?: string;
  seoTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  noIndex?: boolean;
};

export function PostEditor({ initial }: { initial?: PostEditorInitial }) {
  const router = useRouter();
  const isEdit = !!initial?.id;

  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
  const [excerpt, setExcerpt] = useState(initial?.excerpt || "");
  const [contentHtml, setContentHtml] = useState(initial?.contentHtml || "");
  const [contentJson, setContentJson] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl || "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId || "");
  const [tagIds, setTagIds] = useState<string[]>(initial?.tagIds || []);
  const [isFeatured, setIsFeatured] = useState(!!initial?.isFeatured);
  const [isSticky, setIsSticky] = useState(!!initial?.isSticky);
  const [isTrending, setIsTrending] = useState(!!initial?.isTrending);
  const [isSponsored, setIsSponsored] = useState(!!initial?.isSponsored);
  const [sponsorName, setSponsorName] = useState(initial?.sponsorName || "");
  const [scheduledAt, setScheduledAt] = useState(initial?.scheduledAt?.slice(0, 16) || "");

  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle || "");
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription || "");
  const [metaKeywords, setMetaKeywords] = useState(initial?.metaKeywords || "");
  const [canonicalUrl, setCanonicalUrl] = useState(initial?.canonicalUrl || "");
  const [noIndex, setNoIndex] = useState(!!initial?.noIndex);

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [showSeo, setShowSeo] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((d) => setCategories(d.categories));
    fetch("/api/tags").then((r) => r.json()).then((d) => setTags(d.tags));
  }, []);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  async function uploadImage(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    return data.media.url as string;
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    setCoverImageUrl(url);
  }

  function buildPayload(status: "DRAFT" | "SCHEDULED" | "PUBLISHED") {
    return {
      title, slug, excerpt, contentHtml, contentJson,
      coverImageUrl, categoryId: categoryId || undefined, tagIds,
      status, scheduledAt: status === "SCHEDULED" ? new Date(scheduledAt).toISOString() : undefined,
      isFeatured, isSticky, isTrending, isSponsored, sponsorName,
      seoTitle, metaDescription, metaKeywords, canonicalUrl, ogImageUrl: coverImageUrl, noIndex,
    };
  }

  async function save(status: "DRAFT" | "SCHEDULED" | "PUBLISHED") {
    if (!title.trim() || !contentHtml.trim()) {
      alert("Please add a title and some content first.");
      return;
    }
    if (status === "SCHEDULED" && !scheduledAt) {
      alert("Pick a date/time to schedule this post.");
      return;
    }
    setSaving(status);
    try {
      const payload = buildPayload(status);
      const res = isEdit
        ? await fetch(`/api/posts/${initial!.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      router.push("/admin/posts");
      router.refresh();
      return data;
    } catch {
      alert("Something went wrong saving this post.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-8">
      <div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className="w-full bg-transparent font-display text-3xl sm:text-4xl font-semibold outline-none placeholder:text-[var(--ink-muted)]"
        />
        <div className="mt-2 flex items-center gap-2 text-xs text-[var(--ink-muted)]">
          <span>/blog/</span>
          <input
            value={slug}
            onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }}
            className="bg-transparent outline-none border-b border-dashed border-[var(--border)] focus:border-[var(--gold)]"
          />
        </div>

        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short excerpt (shown in cards & search — auto-generated if left blank)"
          rows={2}
          className="mt-4 w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
        />

        <div className="mt-6">
          {coverImageUrl ? (
            <div className="relative aspect-[16/6] w-full overflow-hidden rounded-lg">
              <Image src={coverImageUrl} alt="Cover" fill className="object-cover" />
              <button
                onClick={() => setCoverImageUrl("")}
                className="absolute top-2 right-2 rounded-full bg-black/60 text-white text-xs px-2 py-1"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex aspect-[16/6] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--border)] text-[var(--ink-muted)] hover:border-[var(--gold)]">
              <ImagePlus size={22} />
              <span className="text-sm">Upload featured image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            </label>
          )}
        </div>

        <div className="mt-6">
          <RichTextEditor content={contentHtml} onChange={(html, json) => { setContentHtml(html); setContentJson(json); }} onUploadImage={uploadImage} />
        </div>

        <div className="mt-8">
          <button
            onClick={() => setShowSeo((v) => !v)}
            className="text-sm font-medium text-[var(--gold)]"
          >
            {showSeo ? "Hide" : "Show"} SEO settings
          </button>
          {showSeo && (
            <div className="mt-4 space-y-4 rounded-lg border border-[var(--border)] p-4">
              <div>
                <label className="text-xs font-medium text-[var(--ink-muted)]">SEO title ({seoTitle.length}/70)</label>
                <input maxLength={70} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={title}
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--ink-muted)]">Meta description ({metaDescription.length}/160)</label>
                <textarea maxLength={160} rows={2} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--ink-muted)]">Meta keywords (comma separated)</label>
                <input value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--ink-muted)]">Canonical URL (optional)</label>
                <input value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} placeholder="https://…"
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={noIndex} onChange={(e) => setNoIndex(e.target.checked)} />
                Hide from search engines (noindex)
              </label>
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-5">
        <div className="rounded-lg border border-[var(--border)] p-4">
          <h3 className="text-sm font-semibold mb-3">Publish</h3>
          <div className="space-y-2">
            <button
              onClick={() => save("DRAFT")}
              disabled={!!saving}
              className="w-full rounded-md border border-[var(--border)] py-2 text-sm hover:border-[var(--gold)] disabled:opacity-60"
            >
              {saving === "DRAFT" ? "Saving…" : "Save as draft"}
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="w-full flex items-center justify-center gap-2 rounded-md border border-[var(--border)] py-2 text-sm hover:border-[var(--gold)]"
            >
              <Eye size={14} /> Preview
            </button>
            <button
              onClick={() => save("PUBLISHED")}
              disabled={!!saving}
              className="w-full rounded-md bg-[var(--gold)] py-2 text-sm font-medium text-[var(--accent-contrast)] hover:opacity-90 disabled:opacity-60"
            >
              {saving === "PUBLISHED" ? "Publishing…" : isEdit ? "Update & publish" : "Publish now"}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <label className="text-xs font-medium text-[var(--ink-muted)]">Schedule for later</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1.5 text-sm outline-none focus:border-[var(--gold)]"
            />
            <button
              onClick={() => save("SCHEDULED")}
              disabled={!!saving}
              className="mt-2 w-full rounded-md border border-[var(--border)] py-2 text-sm hover:border-[var(--gold)] disabled:opacity-60"
            >
              {saving === "SCHEDULED" ? "Scheduling…" : "Schedule"}
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] p-4">
          <h3 className="text-sm font-semibold mb-3">Organize</h3>
          <label className="text-xs font-medium text-[var(--ink-muted)]">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1.5 text-sm outline-none focus:border-[var(--gold)]">
            <option value="">None</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <label className="text-xs font-medium text-[var(--ink-muted)] mt-3 block">Tags</label>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {tags.map((t) => {
              const active = tagIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => setTagIds((prev) => active ? prev.filter((id) => id !== t.id) : [...prev, t.id])}
                  className={`rounded-full border px-2.5 py-1 text-xs ${active ? "border-[var(--gold)] bg-[var(--gold-soft)] text-[var(--gold)]" : "border-[var(--border)] text-[var(--ink-muted)]"}`}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] p-4 space-y-2">
          <h3 className="text-sm font-semibold mb-1">Flags</h3>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} /> Featured</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isSticky} onChange={(e) => setIsSticky(e.target.checked)} /> Sticky (pin to top)</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isTrending} onChange={(e) => setIsTrending(e.target.checked)} /> Trending</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isSponsored} onChange={(e) => setIsSponsored(e.target.checked)} /> Sponsored post</label>
          {isSponsored && (
            <input value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} placeholder="Sponsor name"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1.5 text-sm outline-none focus:border-[var(--gold)]" />
          )}
        </div>
      </aside>

      {showPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--bg)]">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg)] px-6 py-3">
            <span className="text-sm font-medium">Preview</span>
            <button onClick={() => setShowPreview(false)} className="text-sm text-[var(--gold)]">Close</button>
          </div>
          <div className="mx-auto max-w-3xl px-6 py-10">
            <h1 className="font-display text-4xl font-semibold">{title || "Untitled post"}</h1>
            {excerpt && <p className="mt-3 text-lg text-[var(--ink-muted)]">{excerpt}</p>}
            {coverImageUrl && (
              <div className="relative mt-6 aspect-[16/8] w-full overflow-hidden rounded-lg">
                <Image src={coverImageUrl} alt="" fill className="object-cover" />
              </div>
            )}
            <div className="prose-aurum mt-8" dangerouslySetInnerHTML={{ __html: contentHtml }} />
          </div>
        </div>
      )}
    </div>
  );
}
