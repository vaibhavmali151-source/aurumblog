import { notFound } from "next/navigation";
import { after } from "next/server";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { extractHeadings, injectHeadingIds, formatDate } from "@/lib/utils";
import { ReadingProgress } from "@/components/ReadingProgress";
import { TableOfContents } from "@/components/TableOfContents";
import { ShareButtons } from "@/components/ShareButtons";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CommentSection } from "@/components/CommentSection";
import { PostCard, type PostCardData } from "@/components/PostCard";
import { AdSlot } from "@/components/AdSlot";

const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: true, category: true, tags: true },
  });
  if (!post || post.status !== "PUBLISHED") return null;
  return post;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const title = post.seoTitle || post.title;
  const description = post.metaDescription || post.excerpt || "";
  const url = `${site}/blog/${post.slug}`;

  return {
    title,
    description,
    keywords: post.metaKeywords || undefined,
    alternates: { canonical: post.canonicalUrl || url },
    robots: post.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      title,
      description,
      url,
      images: post.ogImageUrl || post.coverImageUrl ? [{ url: post.ogImageUrl || post.coverImageUrl! }] : undefined,
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.ogImageUrl || post.coverImageUrl ? [post.ogImageUrl || post.coverImageUrl!] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  // Reliable fire-and-forget view increment (runs after the response is sent).
  after(() => prisma.post.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } }));

  const contentWithIds = injectHeadingIds(post.contentHtml);
  const headings = extractHeadings(post.contentHtml);

  const related = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: post.id },
      OR: [
        { categoryId: post.categoryId ?? undefined },
        { tags: { some: { id: { in: post.tags.map((t: { id: string }) => t.id) } } } },
      ],
    },
    take: 3,
    include: { author: true, category: true },
  });

  const url = `${site}/blog/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.ogImageUrl || post.coverImageUrl || undefined,
    author: { "@type": "Person", name: post.author.name },
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return (
    <>
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            ...(post.category ? [{ label: post.category.name, href: `/category/${post.category.slug}` }] : []),
            { label: post.title },
          ]}
        />

        <header className="mt-6 max-w-3xl">
          {post.isSponsored && (
            <span className="inline-block mb-3 rounded-full bg-[var(--gold-soft)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--gold)]">
              Sponsored{post.sponsorName ? ` · ${post.sponsorName}` : ""}
            </span>
          )}
          <h1 className="font-display text-3xl sm:text-5xl font-semibold leading-tight">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-lg text-[var(--ink-muted)]">{post.excerpt}</p>}

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-[var(--ink-muted)]">
            <Link href={`/author/${post.authorId}`} className="font-medium text-[var(--ink)] hover:text-[var(--gold)]">
              {post.author.name}
            </Link>
            <span className="text-[var(--gold)]">•</span>
            <span>{post.publishedAt && formatDate(post.publishedAt)}</span>
            <span className="text-[var(--gold)]">•</span>
            <span>{post.readingTimeMins} min read</span>
            <span className="text-[var(--gold)]">•</span>
            <span>{post.viewCount.toLocaleString()} views</span>
          </div>
        </header>

        {post.coverImageUrl && (
          <div className="relative mt-8 aspect-[16/8] w-full overflow-hidden rounded-lg">
            <Image src={post.coverImageUrl} alt={post.title} fill className="object-cover" priority sizes="100vw" />
          </div>
        )}

        <div className="mt-10 grid lg:grid-cols-[220px_1fr] gap-12">
          <TableOfContents headings={headings} />

          <div className="min-w-0">
            <div className="mb-6">
              <ShareButtons url={url} title={post.title} />
            </div>

            <div
              id="article-content"
              className="prose-aurum"
              dangerouslySetInnerHTML={{ __html: contentWithIds }}
            />

            <AdSlot placement="in-article" />

            {post.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                {post.tags.map((t: { id: string; slug: string; name: string }) => (
                  <Link
                    key={t.id}
                    href={`/tag/${t.slug}`}
                    className="rounded-full border border-[var(--border)] px-3 py-1 text-xs hover:border-[var(--gold)] hover:text-[var(--gold)]"
                  >
                    #{t.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-10 flex items-center justify-between border-t border-[var(--border)] pt-6">
              <ShareButtons url={url} title={post.title} />
            </div>

            <CommentSection postId={post.id} />
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16 pt-10 border-t border-[var(--border)]">
            <h2 className="font-display text-2xl font-semibold mb-6">Related reading</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {related.map((p: PostCardData) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
