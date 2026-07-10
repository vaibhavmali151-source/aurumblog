import Link from "next/link";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1.3fr]">
        <div>
          <div className="font-display text-xl font-semibold">
            Aurum<span className="text-[var(--gold)]">.</span>
          </div>
          <p className="mt-3 text-sm text-[var(--ink-muted)] max-w-xs">
            Editorial dispatches on AI, markets, and the tools shaping how modern builders work.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/category/ai" className="hover:text-[var(--gold)]">AI</Link></li>
            <li><Link href="/category/markets" className="hover:text-[var(--gold)]">Markets</Link></li>
            <li><Link href="/category/tech" className="hover:text-[var(--gold)]">Technology</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Company</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/login" className="hover:text-[var(--gold)]">Admin login</Link></li>
            <li><a href="/sitemap.xml" className="hover:text-[var(--gold)]">Sitemap</a></li>
            <li><a href="/robots.txt" className="hover:text-[var(--gold)]">Robots.txt</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Newsletter</h4>
          <p className="mt-3 mb-3 text-sm text-[var(--ink-muted)]">One dispatch a week. No spam.</p>
          <NewsletterForm />
        </div>
      </div>
      <div className="border-t border-[var(--border)] py-5 text-center text-xs text-[var(--ink-muted)]">
        © {new Date().getFullYear()} Aurum Blog. All rights reserved.
      </div>
    </footer>
  );
}
