import sanitizeHtml from "sanitize-html";

/** Sanitize rich-text editor output before storing/rendering. Allows the tags the editor produces. */
export function sanitizePostHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "p", "br", "hr",
      "b", "strong", "i", "em", "u", "s", "blockquote",
      "ul", "ol", "li", "a", "img", "video", "source",
      "table", "thead", "tbody", "tr", "th", "td",
      "pre", "code", "span", "div", "figure", "figcaption",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "title"],
      img: ["src", "alt", "width", "height", "loading"],
      video: ["src", "controls", "width", "height"],
      source: ["src", "type"],
      code: ["class"], // preserves language-xxx classes from code blocks
      span: ["class"],
      div: ["class"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto", "data"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}

/** Much stricter sanitizer for user-submitted comments — text formatting only, no media/embeds. */
export function sanitizeCommentHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: ["b", "strong", "i", "em", "a", "p", "br", "ul", "ol", "li", "code"],
    allowedAttributes: { a: ["href", "rel", "target"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "nofollow noopener noreferrer", target: "_blank" }),
    },
  });
}
