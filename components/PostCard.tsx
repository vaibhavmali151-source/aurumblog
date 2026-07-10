import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";

export type PostCardData = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  readingTimeMins: number;
  publishedAt?: Date | string | null;
  category?: { name: string; slug: string } | null;
  author?: { name: string } | null;
};

export function PostCard({ post, variant = "default" }: { post: PostCardData; variant?: "default" | "compact" | "large" }) {
  if (variant === "compact") {
    return (
      <Link href={`/blog/${post.slug}`} className="flex gap-4 group items-start">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-[var(--bg-elevated)]">
          {post.coverImageUrl && (
            <Image src={post.coverImageUrl} alt={post.title} fill className="object-cover" sizes="64px" loading="lazy" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium leading-snug group-hover:text-[var(--gold)] transition-colors line-clamp-2">
            {post.title}
          </p>
          <p className="mt-1 text-xs text-[var(--ink-muted)]">{post.readingTimeMins} min read</p>
        </div>
      </Link>
    );
  }

  if (variant === "large") {
    return (
      <Link href={`/blog/${post.slug}`} className="group block">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-[var(--bg-elevated)]">
          {post.coverImageUrl && (
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
            />
          )}
        </div>
        <div className="mt-4">
          {post.category && (
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--gold)]">
              {post.category.name}
            </span>
          )}
          <h3 className="mt-2 font-display text-2xl sm:text-3xl font-semibold leading-tight group-hover:text-[var(--gold)] transition-colors">
            {post.title}
          </h3>
          {post.excerpt && <p className="mt-2 text-[var(--ink-muted)] line-clamp-2">{post.excerpt}</p>}
          <p className="mt-3 text-xs text-[var(--ink-muted)]">
            {post.author?.name} {post.publishedAt && <>· {formatDate(post.publishedAt)}</>} · {post.readingTimeMins} min read
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-[var(--bg-elevated)]">
        {post.coverImageUrl && (
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
            loading="lazy"
          />
        )}
      </div>
      <div className="mt-3">
        {post.category && (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--gold)]">
            {post.category.name}
          </span>
        )}
        <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug group-hover:text-[var(--gold)] transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="mt-2 text-xs text-[var(--ink-muted)]">
          {post.publishedAt && formatDate(post.publishedAt)} · {post.readingTimeMins} min read
        </p>
      </div>
    </Link>
  );
}
