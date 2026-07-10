import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { FileText, Eye, Users, MessageSquare, FolderTree, FileEdit } from "lucide-react";

async function getStats() {
  const [total, published, drafts, scheduled, categories, comments, viewsAgg, recent, subscribers] = await Promise.all([
    prisma.post.count({ where: { deletedAt: null } }),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.post.count({ where: { status: "SCHEDULED" } }),
    prisma.category.count(),
    prisma.comment.count(),
    prisma.post.aggregate({ _sum: { viewCount: true } }),
    prisma.post.findMany({ orderBy: { updatedAt: "desc" }, take: 6, include: { author: true } }),
    prisma.newsletterSubscriber.count(),
  ]);
  return {
    total, published, drafts, scheduled, categories, comments,
    totalViews: viewsAgg._sum.viewCount || 0, recent, subscribers,
  };
}

export default async function AdminOverviewPage() {
  const s = await getStats();

  const cards = [
    { label: "Total posts", value: s.total, icon: FileText },
    { label: "Published", value: s.published, icon: FileEdit },
    { label: "Drafts", value: s.drafts, icon: FileEdit },
    { label: "Scheduled", value: s.scheduled, icon: FileEdit },
    { label: "Total views", value: s.totalViews.toLocaleString(), icon: Eye },
    { label: "Categories", value: s.categories, icon: FolderTree },
    { label: "Comments", value: s.comments, icon: MessageSquare },
    { label: "Subscribers", value: s.subscribers, icon: Users },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
      <p className="text-[var(--ink-muted)] mt-1">An overview of your publication.</p>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
            <Icon size={18} className="text-[var(--gold)] mb-3" />
            <p className="text-2xl font-semibold font-display">{value}</p>
            <p className="text-xs text-[var(--ink-muted)] mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl font-semibold mb-4">Recently updated</h2>
        <div className="rounded-lg border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-elevated)] text-left text-xs uppercase tracking-wider text-[var(--ink-muted)]">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Status</th>
                <th className="p-3">Author</th>
                <th className="p-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {s.recent.map((p) => (
                <tr key={p.id} className="border-t border-[var(--border)]">
                  <td className="p-3">
                    <Link href={`/admin/posts/${p.id}/edit`} className="hover:text-[var(--gold)] font-medium">
                      {p.title}
                    </Link>
                  </td>
                  <td className="p-3">
                    <span className="rounded-full bg-[var(--gold-soft)] px-2 py-0.5 text-xs text-[var(--gold)]">
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-[var(--ink-muted)]">{p.author.name}</td>
                  <td className="p-3 text-[var(--ink-muted)]">{formatDate(p.updatedAt)}</td>
                </tr>
              ))}
              {s.recent.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-[var(--ink-muted)]">
                    No posts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
