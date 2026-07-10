"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Check, X, Trash2 } from "lucide-react";

type Comment = {
  id: string; content: string; approved: boolean; createdAt: string;
  guestName?: string | null; author?: { name: string } | null;
  post: { title: string; slug: string };
};

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/comments?all=true");
    if (res.ok) setComments((await res.json()).comments);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function setApproved(id: string, approved: boolean) {
    await fetch(`/api/comments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ approved }) });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this comment?")) return;
    await fetch(`/api/comments/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-6">Comments</h1>
      <div className="rounded-lg border border-[var(--border)] divide-y divide-[var(--border)]">
        {comments.map((c) => (
          <div key={c.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm">
                  <span className="font-medium">{c.author?.name || c.guestName || "Anonymous"}</span>{" "}
                  <span className="text-[var(--ink-muted)]">on</span>{" "}
                  <Link href={`/blog/${c.post.slug}`} className="text-[var(--gold)] hover:underline">{c.post.title}</Link>
                </p>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">{c.content}</p>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">{formatDate(c.createdAt)} · {c.approved ? "Approved" : "Pending"}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {!c.approved && (
                  <button onClick={() => setApproved(c.id, true)} title="Approve"><Check size={16} className="text-green-600" /></button>
                )}
                {c.approved && (
                  <button onClick={() => setApproved(c.id, false)} title="Unapprove"><X size={16} className="text-[var(--ink-muted)]" /></button>
                )}
                <button onClick={() => remove(c.id)} title="Delete"><Trash2 size={16} className="text-[var(--ink-muted)] hover:text-red-500" /></button>
              </div>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="p-6 text-center text-sm text-[var(--ink-muted)]">No comments yet.</p>}
      </div>
    </div>
  );
}
