"use client";

import { useEffect, useState } from "react";

export function TableOfContents({ headings }: { headings: { id: string; text: string; level: number }[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-100px 0px -70% 0px" }
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="Table of contents" className="sticky top-24 hidden lg:block">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)] mb-3">On this page</p>
      <ul className="space-y-2 border-l border-[var(--border)]">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: h.level === 3 ? "1.75rem" : "1rem" }}>
            <a
              href={`#${h.id}`}
              className={`block text-sm py-0.5 -ml-px border-l-2 pl-3 transition-colors ${
                activeId === h.id
                  ? "border-[var(--gold)] text-[var(--gold)] font-medium"
                  : "border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
