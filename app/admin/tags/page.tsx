"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2 } from "lucide-react";

type Tag = { id: string; name: string; slug: string; _count: { posts: number } };

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [name, setName] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/tags");
    const data = await res.json();
    setTags(data.tags);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch("/api/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    setName("");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this tag?")) return;
    await fetch("/api/tags", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-6">Tags</h1>
      <form onSubmit={add} className="flex gap-2 max-w-sm mb-8">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New tag name"
          className="flex-1 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]" />
        <button className="rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-medium text-[var(--accent-contrast)]">Add</button>
      </form>

      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <div key={t.id} className="flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm">
            #{t.name} <span className="text-xs text-[var(--ink-muted)]">({t._count.posts})</span>
            <button onClick={() => remove(t.id)}><Trash2 size={12} className="text-[var(--ink-muted)] hover:text-red-500" /></button>
          </div>
        ))}
        {tags.length === 0 && <p className="text-sm text-[var(--ink-muted)]">No tags yet.</p>}
      </div>
    </div>
  );
}
