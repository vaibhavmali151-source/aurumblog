import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PostCard, type PostCardData } from "@/components/PostCard";
import { SearchBar } from "@/components/SearchBar";
import { NewsletterForm } from "@/components/NewsletterForm";

export const revalidate = 60; // ISR -- homepage refreshes at most once/minute

async function getData() {
  const [featured, latest, trending, categories] = await Promise.all([
    prisma.post.findMany({
      where: { status: "PUBLISHED", isFeatured: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: { author: true, category: true },
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ isSticky: "desc" }, { publishedAt: "desc" }],
      take: 9,
      include: { author: true, category: true },
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED", isTrending: true },
      orderBy: { viewCount: "desc" },
      take: 5,
      include: { author: true, category: true },
    }),
    prisma.category.findMany({ include: { _count: { select: { posts: true } } }, orderBy: { name: "asc" } }),
  ]);
  return { featured, latest, trending, categories };
}

export default async function HomePage() {
  const { featured, latest, trending, categories } = await getData();
  const hero = featured[0] ?? latest[0];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="pt-10 sm:pt-16 pb-14 border-b border-[var(--border)]">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
              AI · Markets · Technology
            </p>
            <h1 className="mt-3 font-display text-4xl sm:text-5xl font-semibold leading-[1.05] max-w-2xl">
              Signal, not noise, for people building with AI and capital.
            </h1>
          </div>
          <SearchBar />
        </div>

        {hero && (
          <div className="grid md:grid-cols-[1.4fr_1fr] gap-10">
            <PostCard post={hero} variant="large" />
            <div className="flex flex-col gap-6 divide-y divide-[var(--border)]">
              {featured.slice(1, 4).length > 0
                ? featured.slice(1, 4).map((p: PostCardData) => (
                    <div key={p.id} className="pt-6 first:pt-0">
                      <PostCard post={p} variant="compact" />
                    </div>
                  ))
                : latest.slice(1, 4).map((p: PostCardData) => (
                    <div key={p.id} className="pt-6 first:pt-0">
                      <PostCard post={p} variant="compact" />
                    </div>
                  ))}
            </div>
          </div>
        )}
      </section>

      {trending.length > 0 && (
        <section className="py-14 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold">Trending now</h2>
            <div className="gold-rule flex-1 ml-6" />
          </div>
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {trending.map((p: PostCardData, i: number) => (
              <div key={p.id} className="flex gap-4 items-start">
                <span className="font-display text-3xl text-[var(--gold-soft)] font-semibold leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <PostCard post={p} variant="compact" />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="py-14 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold">Latest articles</h2>
          <div className="gold-rule flex-1 ml-6" />
        </div>
        {latest.length === 0 ? (
          <p className="text-[var(--ink-muted)]">
            No posts yet -- publish your first article from the{" "}
            <Link href="/admin/posts/new" className="text-[var(--gold)] underline">
              admin dashboard
            </Link>
            .
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {latest.map((p: PostCardData) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </section>

      {categories.length > 0 && (
        <section className="py-14 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold">Browse by category</h2>
            <div className="gold-rule flex-1 ml-6" />
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
              >
                {c.name} <span className="text-[var(--ink-muted)]">({c._count?.posts ?? 0})</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="py-16 text-center flex flex-col items-center">
        <h2 className="font-display text-3xl font-semibold">Never miss a dispatch</h2>
        <p className="mt-2 text-[var(--ink-muted)] max-w-md">
          One weekly email -- the sharpest reads on AI and markets, curated by Aurum.
        </p>
        <div className="mt-6">
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
