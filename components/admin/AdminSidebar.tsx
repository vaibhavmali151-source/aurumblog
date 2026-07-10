"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, FileText, FolderTree, Tag, Image as ImageIcon,
  MessageSquare, Settings, LogOut, PlusCircle,
} from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/tags", label: "Tags", icon: Tag },
  { href: "/admin/media", label: "Media library", icon: ImageIcon },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/settings", label: "SEO & settings", icon: Settings },
];

export function AdminSidebar({ userName, role }: { userName: string; role: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-[var(--border)] flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-[var(--border)]">
        <Link href="/" className="font-display text-lg font-semibold">
          Aurum<span className="text-[var(--gold)]">.</span> <span className="text-xs font-sans text-[var(--ink-muted)]">admin</span>
        </Link>
      </div>

      <div className="p-4">
        <Link
          href="/admin/posts/new"
          className="flex items-center justify-center gap-2 rounded-md bg-[var(--gold)] py-2.5 text-sm font-medium text-[var(--accent-contrast)] hover:opacity-90"
        >
          <PlusCircle size={16} /> New post
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active ? "bg-[var(--gold-soft)] text-[var(--gold)] font-medium" : "text-[var(--ink-muted)] hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              <Icon size={16} /> {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        <p className="text-xs font-medium">{userName}</p>
        <p className="text-xs text-[var(--ink-muted)] mb-2">{role}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 text-xs text-[var(--ink-muted)] hover:text-[var(--gold)]"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}
