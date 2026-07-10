import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostEditor } from "@/components/admin/PostEditor";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id }, include: { tags: true } });
  if (!post) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-8">Edit post</h1>
      <PostEditor
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || "",
          contentHtml: post.contentHtml,
          coverImageUrl: post.coverImageUrl || "",
          categoryId: post.categoryId || "",
          tagIds: post.tags.map((t: { id: string }) => t.id),
          scheduledAt: post.scheduledAt?.toISOString(),
          isFeatured: post.isFeatured,
          isSticky: post.isSticky,
          isTrending: post.isTrending,
          isSponsored: post.isSponsored,
          sponsorName: post.sponsorName || "",
          seoTitle: post.seoTitle || "",
          metaDescription: post.metaDescription || "",
          metaKeywords: post.metaKeywords || "",
          canonicalUrl: post.canonicalUrl || "",
          noIndex: post.noIndex,
        }}
      />
    </div>
  );
}
