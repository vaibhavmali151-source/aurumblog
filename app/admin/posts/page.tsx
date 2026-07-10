"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Trash2, RotateCcw, Star, Pin, TrendingUp } from "lucide-react";

type Post = {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
  publishedAt: string | null;
  isFeatured: boolean;
  isSticky: boolean;
  isTrending: boolean;
  author: { name: string };
  category: { name: string } | null;
};

const TABS = ["ALL", "PUBLISHED", "DRAFT", "SCHEDULED", "TRASHED"];

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [tab, setTab] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const status = tab === "ALL" ? "" : `&status=${tab}`;
    const res = await fetch(`/api/posts?pageSize=100${status}`);
    const data = await res.json();
    setPosts(tab === "ALL" ? data.posts.filter((p: Post) => p.status !== "TRASHED") : data.posts);
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  async function patch(id: string, body: Record<string, unknown>) {
    await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    load();
  }

  async function permanentlyDelete(id: string) {
    if (!confirm("Permanently delete this post? This cannot be undone.")) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Posts</h1>
        <Link href="/admin/posts/new" className="rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-medium text-[var(--accent-contrast)] hover:opacity-90">
          New post
        </Link>
      </div>

      <div className="mt-6 flex gap-2 border-b border-[var(--border)]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm border-b-2 -mb-px ${
              tab === t ? "border-[var(--gold)] text-[var(--gold)] font-medium" : "border-transparent text-[var(--ink-muted)]"
            }`}
          >
            {t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-[var(--border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-elevated)] text-left text-xs uppercase tracking-wider text-[var(--ink-muted)]">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Status</th>
              <th className="p-3">Author</th>
              <th className="p-3">Category</th>
              <th className="p-3">Updated</th>
              <th className="p-3">Flags</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-[var(--border)]">
                <td className="p-3 max-w-xs">
                  <Link href={`/admin/posts/${p.id}/edit`} className="font-medium hover:text-[var(--gold)] line-clamp-1">
                    {p.title}
                  </Link>
                </td>
                <td className="p-3">
                  <span className="rounded-full bg-[var(--gold-soft)] px-2 py-0.5 text-xs text-[var(--gold)]">{p.status}</span>
                </td>
                <td className="p-3 text-[var(--ink-muted)]">{p.author.name}</td>
                <td className="p-3 text-[var(--ink-muted)]">{p.category?.name ?? "—"}</td>
                <td className="p-3 text-[var(--ink-muted)]">{formatDate(p.updatedAt)}</td>
                <td className="p-3">
                  <div className="flex gap-1.5">
                    <button title="Featured" onClick={() => patch(p.id, { isFeatured: !p.isFeatured })}>
                      <Star size={14} className={p.isFeatured ? "fill-[var(--gold)] text-[var(--gold)]" : "text-[var(--ink-muted)]"} />
                    </button>
                    <button title="Sticky" onClick={() => patch(p.id, { isSticky: !p.isSticky })}>
                      <Pin size={14} className={p.isSticky ? "fill-[var(--gold)] text-[var(--gold)]" : "text-[var(--ink-muted)]"} />
                    </button>
                    <button title="Trending" onClick={() => patch(p.id, { isTrending: !p.isTrending })}>
                      <TrendingUp size={14} className={p.isTrending ? "text-[var(--gold)]" : "text-[var(--ink-muted)]"} />
                    </button>
                  </div>
                </td>
                <td className="p-3 text-right">
                  {p.status === "TRASHED" ? (
                    <div className="flex justify-end gap-2">
                      <button title="Restore" onClick={() => patch(p.id, { action: "restore" })}>
                        <RotateCcw size={16} className="text-[var(--ink-muted)] hover:text-[var(--gold)]" />
                      </button>
                      <button title="Delete permanently" onClick={() => permanentlyDelete(p.id)}>
                        <Trash2 size={16} className="text-[var(--ink-muted)] hover:text-red-500" />
                      </button>
                    </div>
                  ) : (
                    <button title="Move to trash" onClick={() => patch(p.id, { action: "trash" })}>
                      <Trash2 size={16} className="text-[var(--ink-muted)] hover:text-red-500" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!loading && posts.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-[var(--ink-muted)]">No posts here.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
