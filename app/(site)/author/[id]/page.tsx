import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PostCard, type PostCardData } from "@/components/PostCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const author = await prisma.user.findUnique({ where: { id } });
  if (!author) return {};
  return { title: author.name, description: author.bio || `Articles by ${author.name}.` };
}

export default async function AuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const author = await prisma.user.findUnique({ where: { id } });
  if (!author) notFound();

  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED", authorId: author.id },
    orderBy: { publishedAt: "desc" },
    include: { author: true, category: true },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: author.name }]} />

      <div className="mt-6 flex items-center gap-5">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[var(--bg-elevated)] border border-[var(--border)]">
          {author.avatarUrl && <Image src={author.avatarUrl} alt={author.name} fill className="object-cover" />}
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold">{author.name}</h1>
          <p className="text-xs uppercase tracking-wider text-[var(--gold)] mt-1">{author.role}</p>
        </div>
      </div>

      {author.bio && <p className="mt-6 max-w-2xl text-[var(--ink-muted)]">{author.bio}</p>}

      <div className="mt-4 flex gap-4 text-sm">
        {author.twitterHandle && (
          <a href={`https://twitter.com/${author.twitterHandle}`} className="text-[var(--gold)] hover:underline" target="_blank" rel="noopener noreferrer">
            @{author.twitterHandle}
          </a>
        )}
        {author.websiteUrl && (
          <a href={author.websiteUrl} className="text-[var(--gold)] hover:underline" target="_blank" rel="noopener noreferrer">
            Website
          </a>
        )}
      </div>

      <h2 className="mt-12 mb-6 font-display text-2xl font-semibold">Articles by {author.name}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
        {posts.map((p: PostCardData) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
      {posts.length === 0 && <p className="text-[var(--ink-muted)]">No published articles yet.</p>}
    </div>
  );
}
