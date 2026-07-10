import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * Exports every table as JSON so an Admin can download a full backup.
 * For SQLite deployments you can also just copy prisma/dev.db directly.
 * For Postgres in production, prefer `pg_dump` on a schedule — this
 * endpoint is a convenient, database-agnostic supplement, not a replacement.
 */
export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const [users, posts, categories, tags, comments, media, affiliateLinks, subscribers, banners] = await Promise.all([
    prisma.user.findMany(),
    prisma.post.findMany({ include: { tags: true } }),
    prisma.category.findMany(),
    prisma.tag.findMany(),
    prisma.comment.findMany(),
    prisma.media.findMany(),
    prisma.affiliateLink.findMany(),
    prisma.newsletterSubscriber.findMany(),
    prisma.bannerAd.findMany(),
  ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    users, posts, categories, tags, comments, media, affiliateLinks, subscribers, banners,
  };

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="aurum-backup-${Date.now()}.json"`,
    },
  });
}
