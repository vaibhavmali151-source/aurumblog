import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PostCard, type PostCardData } from "@/components/PostCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return {};
  return {
    title: category.name,
    description: category.description || `Articles filed under ${category.name}.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED", categoryId: category.id },
    orderBy: { publishedAt: "desc" },
    include: { author: true, category: true },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: category.name }]} />
      <h1 className="mt-4 font-display text-4xl font-semibold">{category.name}</h1>
      {category.description && <p className="mt-2 text-[var(--ink-muted)] max-w-xl">{category.description}</p>}

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
        {posts.map((p: PostCardData) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
      {posts.length === 0 && <p className="mt-10 text-[var(--ink-muted)]">No articles in this category yet.</p>}
    </div>
  );
}
