"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl">
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search articles…"
        className="w-full rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] py-3 pl-11 pr-4 text-sm outline-none focus:border-[var(--gold)]"
      />
    </form>
  );
}
