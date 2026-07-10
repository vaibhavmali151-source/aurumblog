"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/category/ai", label: "AI" },
  { href: "/category/markets", label: "Markets" },
  { href: "/category/tech", label: "Technology" },
  { href: "/search", label: "Search" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-1 font-display text-xl font-semibold tracking-tight">
          Aurum
          <span className="text-[var(--gold)]">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <Search size={16} />
          </Link>
          <ThemeToggle />
          <button
            aria-label="Toggle menu"
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)]"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-[var(--border)] px-4 py-3 flex flex-col gap-3">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm py-1" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
