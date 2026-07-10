"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Trash2, Upload, Copy, Check } from "lucide-react";

type Media = { id: string; url: string; filename: string; width: number | null; height: number | null; sizeBytes: number | null; createdAt: string };

export default function AdminMediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/media");
    if (res.ok) setMedia((await res.json()).media);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      await fetch("/api/upload", { method: "POST", body: form });
    }
    setUploading(false);
    e.target.value = "";
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this image? It will stop rendering anywhere it's used.")) return;
    await fetch("/api/media", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  function copyUrl(id: string, url: string) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-semibold">Media library</h1>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-medium text-[var(--accent-contrast)] disabled:opacity-60"
        >
          <Upload size={14} /> {uploading ? "Uploading…" : "Upload images"}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {media.map((m) => (
          <div key={m.id} className="group relative rounded-lg border border-[var(--border)] overflow-hidden">
            <div className="relative aspect-square bg-[var(--bg-elevated)]">
              <Image src={m.url} alt={m.filename} fill className="object-cover" sizes="200px" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => copyUrl(m.id, m.url)} className="rounded-full bg-white/90 p-2">
                {copiedId === m.id ? <Check size={14} /> : <Copy size={14} />}
              </button>
              <button onClick={() => remove(m.id)} className="rounded-full bg-white/90 p-2">
                <Trash2 size={14} className="text-red-500" />
              </button>
            </div>
          </div>
        ))}
        {media.length === 0 && <p className="col-span-full text-sm text-[var(--ink-muted)]">No media uploaded yet.</p>}
      </div>
    </div>
  );
}
