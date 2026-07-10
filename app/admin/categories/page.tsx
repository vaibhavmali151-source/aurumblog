"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2 } from "lucide-react";

type Category = { id: string; name: string; slug: string; _count: { posts: number } };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    setName("");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this category? Posts will keep their content but lose this category.")) return;
    await fetch("/api/categories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-6">Categories</h1>
      <form onSubmit={add} className="flex gap-2 max-w-sm mb-8">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name"
          className="flex-1 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]" />
        <button className="rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-medium text-[var(--accent-contrast)]">Add</button>
      </form>

      <div className="rounded-lg border border-[var(--border)] divide-y divide-[var(--border)]">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-3">
            <div>
              <p className="text-sm font-medium">{c.name}</p>
              <p className="text-xs text-[var(--ink-muted)]">/category/{c.slug} · {c._count.posts} posts</p>
            </div>
            <button onClick={() => remove(c.id)}><Trash2 size={16} className="text-[var(--ink-muted)] hover:text-red-500" /></button>
          </div>
        ))}
        {categories.length === 0 && <p className="p-6 text-center text-sm text-[var(--ink-muted)]">No categories yet.</p>}
      </div>
    </div>
  );
}
