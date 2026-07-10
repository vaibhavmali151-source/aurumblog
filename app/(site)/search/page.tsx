import { prisma } from "@/lib/prisma";
import { PostCard, type PostCardData } from "@/components/PostCard";
import { SearchBar } from "@/components/SearchBar";

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const posts = q
    ? await prisma.post.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: q } },
            { excerpt: { contains: q } },
            { contentHtml: { contains: q } },
          ],
        },
        orderBy: { publishedAt: "desc" },
        include: { author: true, category: true },
      })
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-4xl font-semibold mb-6">Search</h1>
      <SearchBar initialQuery={q} />

      {q && (
        <p className="mt-6 text-sm text-[var(--ink-muted)]">
          {posts.length} result{posts.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
        </p>
      )}

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
        {posts.map((p: PostCardData) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
