import slugifyLib from "slugify";
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Generate a URL-safe, SEO-friendly slug from a title. */
export function slugify(title: string): string {
  return slugifyLib(title, { lower: true, strict: true, trim: true });
}

/** Ensure a slug is unique by appending -2, -3, etc. Caller supplies a checker fn. */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = slugify(base);
  let i = 2;
  while (await exists(slug)) {
    slug = `${slugify(base)}-${i}`;
    i++;
  }
  return slug;
}

/** Estimate reading time in minutes from HTML content (~200 wpm). */
export function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Strip HTML tags for excerpts / meta descriptions. */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function autoExcerpt(html: string, length = 160): string {
  const text = stripHtml(html);
  return text.length > length ? text.slice(0, length).trim() + "…" : text;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Extract h2/h3 headings from HTML to build a Table of Contents. Adds ids as a side effect string. */
export function extractHeadings(html: string): { id: string; text: string; level: number }[] {
  const headingRegex = /<h([23])[^>]*>(.*?)<\/h\1>/gi;
  const headings: { id: string; text: string; level: number }[] = [];
  let match;
  let i = 0;
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const text = match[2].replace(/<[^>]+>/g, "");
    const id = `${slugify(text)}-${i++}`;
    headings.push({ id, text, level });
  }
  return headings;
}

/** Inject id="" attributes into h2/h3 tags so the TOC can link to them. */
export function injectHeadingIds(html: string): string {
  let i = 0;
  return html.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (_full, level, attrs, text) => {
    const plain = text.replace(/<[^>]+>/g, "");
    const id = `${slugify(plain)}-${i++}`;
    return `<h${level}${attrs} id="${id}">${text}</h${level}>`;
  });
}
