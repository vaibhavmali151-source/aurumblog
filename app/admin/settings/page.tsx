"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2 } from "lucide-react";

type User = { id: string; name: string; email: string; role: string };
type Banner = { id: string; name: string; placement: string; imageUrl: string; linkUrl: string };

export default function AdminSettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "EDITOR" });
  const [bannerForm, setBannerForm] = useState({ name: "", placement: "home-top", imageUrl: "", linkUrl: "" });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [u, b] = await Promise.all([fetch("/api/users").then((r) => r.json()), fetch("/api/banners").then((r) => r.json())]);
    setUsers(u.users || []);
    setBanners(b.banners || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Could not add team member.");
      return;
    }
    setForm({ name: "", email: "", password: "", role: "EDITOR" });
    load();
  }

  async function addBanner(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/banners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bannerForm) });
    setBannerForm({ name: "", placement: "home-top", imageUrl: "", linkUrl: "" });
    load();
  }

  async function removeBanner(id: string) {
    await fetch("/api/banners", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  return (
    <div className="max-w-3xl space-y-12">
      <div>
        <h1 className="font-display text-3xl font-semibold">Settings</h1>
        <p className="text-[var(--ink-muted)] mt-1">Team access, monetization, and integrations.</p>
      </div>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4">Team (Admin / Editor)</h2>
        <div className="rounded-lg border border-[var(--border)] divide-y divide-[var(--border)] mb-4">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-3 text-sm">
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-[var(--ink-muted)]">{u.email}</p>
              </div>
              <span className="rounded-full bg-[var(--gold-soft)] px-2 py-0.5 text-xs text-[var(--gold)]">{u.role}</span>
            </div>
          ))}
        </div>
        <form onSubmit={addUser} className="grid sm:grid-cols-2 gap-3">
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]" />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]" />
          <input required type="password" minLength={8} placeholder="Temporary password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]" />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]">
            <option value="EDITOR">Editor</option>
            <option value="ADMIN">Admin</option>
          </select>
          {error && <p className="sm:col-span-2 text-xs text-red-500">{error}</p>}
          <button className="sm:col-span-2 rounded-md bg-[var(--gold)] py-2 text-sm font-medium text-[var(--accent-contrast)]">Add team member</button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4">Banner ads</h2>
        <p className="text-sm text-[var(--ink-muted)] mb-4">
          Used automatically when <code className="font-mono">NEXT_PUBLIC_ADSENSE_CLIENT</code> isn&apos;t set. Placements:
          home-top, sidebar, in-article.
        </p>
        <div className="rounded-lg border border-[var(--border)] divide-y divide-[var(--border)] mb-4">
          {banners.map((b) => (
            <div key={b.id} className="flex items-center justify-between p-3 text-sm">
              <div>
                <p className="font-medium">{b.name}</p>
                <p className="text-xs text-[var(--ink-muted)]">{b.placement}</p>
              </div>
              <button onClick={() => removeBanner(b.id)}><Trash2 size={16} className="text-[var(--ink-muted)] hover:text-red-500" /></button>
            </div>
          ))}
        </div>
        <form onSubmit={addBanner} className="grid sm:grid-cols-2 gap-3">
          <input required placeholder="Campaign name" value={bannerForm.name} onChange={(e) => setBannerForm({ ...bannerForm, name: e.target.value })}
            className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]" />
          <select value={bannerForm.placement} onChange={(e) => setBannerForm({ ...bannerForm, placement: e.target.value })}
            className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]">
            <option value="home-top">Home top</option>
            <option value="sidebar">Sidebar</option>
            <option value="in-article">In-article</option>
          </select>
          <input required placeholder="Image URL" value={bannerForm.imageUrl} onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
            className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]" />
          <input required placeholder="Destination URL" value={bannerForm.linkUrl} onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })}
            className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]" />
          <button className="sm:col-span-2 rounded-md bg-[var(--gold)] py-2 text-sm font-medium text-[var(--accent-contrast)]">Add banner</button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4">Backup</h2>
        <p className="text-sm text-[var(--ink-muted)] mb-3">
          Download a full JSON export of posts, users, comments, and media records.
        </p>
        <a
          href="/api/admin/backup"
          className="inline-block rounded-md border border-[var(--border)] px-4 py-2 text-sm hover:border-[var(--gold)]"
        >
          Download backup (.json)
        </a>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4">Integrations</h2>
        <p className="text-sm text-[var(--ink-muted)]">
          Google Analytics, Search Console verification, and AdSense are configured via environment
          variables (<code className="font-mono">NEXT_PUBLIC_GA_ID</code>,{" "}
          <code className="font-mono">NEXT_PUBLIC_GSC_VERIFICATION</code>,{" "}
          <code className="font-mono">NEXT_PUBLIC_ADSENSE_CLIENT</code>) — see the README for setup.
        </p>
      </section>
    </div>
  );
}
