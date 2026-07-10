"use client";

import { useEffect, useState, useCallback } from "react";
import { formatDate } from "@/lib/utils";

type CommentT = {
  id: string;
  content: string;
  createdAt: string;
  guestName?: string | null;
  author?: { name: string } | null;
  replies?: CommentT[];
};

export function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<CommentT[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/comments?postId=${postId}`);
    if (res.ok) {
      const data = await res.json();
      setComments(data.comments);
    }
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content, guestName: name, guestEmail: email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
      setStatus("done");
      setContent("");
      load();
    } catch {
      setStatus("error");
      setMessage("Could not post comment.");
    }
  }

  return (
    <section className="mt-16 pt-10 border-t border-[var(--border)]">
      <h2 className="font-display text-2xl font-semibold mb-6">
        Comments {comments.length > 0 && <span className="text-[var(--ink-muted)]">({comments.length})</span>}
      </h2>

      <form onSubmit={handleSubmit} className="mb-10 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            required
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
          />
          <input
            required
            type="email"
            placeholder="Email (not published)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
          />
        </div>
        <textarea
          required
          minLength={2}
          maxLength={2000}
          placeholder="Share your thoughts…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-md bg-[var(--gold)] px-5 py-2.5 text-sm font-medium text-[var(--accent-contrast)] hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {status === "loading" ? "Posting…" : "Post comment"}
        </button>
        {message && <p className="text-xs text-[var(--ink-muted)]">{message}</p>}
      </form>

      <ul className="space-y-6">
        {comments.map((c) => (
          <li key={c.id} className="border-b border-[var(--border)] pb-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{c.author?.name || c.guestName || "Anonymous"}</span>
              <span className="text-[var(--ink-muted)] text-xs">· {formatDate(c.createdAt)}</span>
            </div>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">{c.content}</p>
            {c.replies && c.replies.length > 0 && (
              <ul className="mt-4 ml-6 space-y-4 border-l border-[var(--border)] pl-4">
                {c.replies.map((r) => (
                  <li key={r.id}>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{r.author?.name || r.guestName || "Anonymous"}</span>
                      <span className="text-[var(--ink-muted)] text-xs">· {formatDate(r.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--ink-muted)]">{r.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-[var(--ink-muted)]">Be the first to comment.</p>
        )}
      </ul>
    </section>
  );
}
