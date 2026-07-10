# Aurum Blog — Production-Grade CMS

A modern, deploy-ready blogging platform. Editorial finance-and-AI aesthetic (deep ink navy, antique gold accent) with a full admin dashboard that lets you write posts in a rich text editor and publish them without touching code.

---

## Quick start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.local.example .env.local     # then edit values
# On first run set NEXTAUTH_SECRET (openssl rand -base64 32)

# 3. Initialize the database (SQLite by default — swap to Postgres for production)
npx prisma db push
npm run db:seed                       # creates admin user + sample posts

# 4. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the site and [http://localhost:3000/login](http://localhost:3000/login) for the admin.

**Default admin login** (change immediately):
```
Email:    admin@aurum.blog
Password: ChangeMe123!
```

Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` env vars before running `db:seed` to pick your own.

---

## Publishing a post (the main workflow)

1. Sign in at `/login`
2. Click **New post** in the sidebar
3. Write the title → the slug and URL auto-generate
4. Use the rich text editor toolbar: **H2/H3**, **bold/italic**, **lists**, **quotes**, **code blocks**, **images**, **video**, **tables**, **links**
5. Upload a cover image (auto-optimized to WebP)
6. Assign a category and tags in the right sidebar
7. Toggle flags: Featured, Sticky, Trending, Sponsored
8. Open the SEO panel — customize SEO title, meta description, keywords, canonical URL, no-index
9. Click **Preview** to see the final rendered article
10. Click **Save as draft**, **Schedule**, or **Publish now**

Published posts appear immediately at `/blog/[slug]` and are included in the sitemap, RSS-ready, and structured-data enriched (Schema.org Article JSON-LD).

---

## What's included

### Frontend
- Fully responsive homepage: hero, featured, trending (numbered), latest grid, category chips, search, newsletter
- Article page with reading progress bar, sticky table of contents, breadcrumbs, share buttons, related posts, comments
- Category / tag / author archive pages
- Full-text search page
- Light + dark mode with system preference detection
- PWA manifest + service worker (offline shell)
- Reading time estimation, view counter

### Admin dashboard
- Overview: total posts, published, drafts, scheduled, categories, comments, views, subscribers
- Posts list with tabs (All / Published / Draft / Scheduled / Trashed) and inline actions (feature, pin, trend, trash, restore, delete)
- Rich text editor (TipTap) with image upload, video embed, tables, code blocks with syntax highlighting
- Draft / Schedule / Publish / Preview flows
- Category + tag CRUD
- Media library with grid view, copy URL, delete
- Comment moderation queue
- Team management (Admin can add Editors)
- Banner ad management (used when AdSense isn't configured)

### SEO
- Custom SEO title, meta description, meta keywords, canonical URL, no-index toggle per post
- Open Graph + Twitter Card metadata
- Automatic `sitemap.xml` covering posts, categories, tags
- `robots.txt`
- JSON-LD structured data (Schema.org Article) on every post
- Google Search Console verification via env var

### Performance
- Image optimization via `sharp` — WebP conversion, 1920px max width, EXIF stripped
- Next.js Image component with automatic AVIF/WebP delivery, lazy loading
- ISR on homepage (60s revalidate)
- Response compression enabled
- Long-lived cache headers on `/uploads/*` and `/icons/*`
- CDN-ready static assets

### Security
- Password hashing with bcrypt (12 rounds)
- CSRF: same-origin check on all state-changing API requests
- XSS: strict HTML sanitization (`sanitize-html`) on post content + comments
- SQL injection: Prisma parameterized queries throughout
- Rate limiting on `/api/auth`, `/api/comments`, `/api/newsletter`
- Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- Session cookies: httpOnly, secure, SameSite=lax
- Role-based access: Admin vs Editor
- Full DB backup export at `/api/admin/backup` (Admin only)

### Monetization
- Google AdSense — set `NEXT_PUBLIC_ADSENSE_CLIENT` and ad slots render automatically
- Banner ad manager (fallback when AdSense isn't set) at Admin → Settings
- Affiliate link tracking via `/go/[id]` (records click counts per link)
- Sponsored post support (badge + sponsor name shown above article)

### Integrations
- Google Analytics — set `NEXT_PUBLIC_GA_ID`
- Google Search Console — set `NEXT_PUBLIC_GSC_VERIFICATION`
- Newsletter subscriptions stored in DB (hook an ESP like Resend/Mailchimp in `/api/newsletter/route.ts`)
- Social share buttons: Twitter, LinkedIn, Facebook, copy link
- Push notifications: PWA service worker in place; wire a push service (e.g. Web Push + VAPID) when you're ready
- Social auto-share on publish: hook into the `POST /api/posts` handler to fan out to Twitter/LinkedIn APIs

---

## Tech stack

- **Framework:** Next.js 16 (App Router, React 19, Turbopack)
- **Database:** Prisma ORM — SQLite in dev, swap to Postgres in one line for prod
- **Auth:** NextAuth v5 (credentials provider, JWT sessions)
- **Editor:** TipTap (ProseMirror) — headings, images, video, tables, code, quotes, lists, links
- **Styling:** Tailwind CSS v4 with CSS custom properties for theming
- **Icons:** Lucide
- **Type safety:** TypeScript, Zod validation on API boundaries

---

## Environment variables

```bash
# Required
DATABASE_URL="file:./dev.db"                 # or postgresql://... in production
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"         # or your production origin
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="Aurum Blog"

# Optional integrations
NEXT_PUBLIC_GA_ID=""                          # Google Analytics measurement ID (G-XXXXXX)
NEXT_PUBLIC_ADSENSE_CLIENT=""                 # ca-pub-XXXXXXXXXXXXXXX
NEXT_PUBLIC_GSC_VERIFICATION=""               # meta content string from Search Console

# Seeding (only used by `npm run db:seed`)
SEED_ADMIN_EMAIL="you@yourdomain.com"
SEED_ADMIN_PASSWORD="a-strong-password"
```

---

## Switching to PostgreSQL for production

1. Set `DATABASE_URL="postgresql://user:pass@host:5432/db"`
2. In `prisma/schema.prisma`, change `provider = "sqlite"` → `provider = "postgresql"`
3. Run `npx prisma migrate deploy`

---

## Deployment

### Vercel (recommended)
- Push to GitHub, import at [vercel.com](https://vercel.com)
- Add environment variables in the project settings
- For the DB, use Vercel Postgres, Neon, or Supabase and set `DATABASE_URL`
- The build command is `next build`; Vercel handles the rest

### Docker / any Node host
The `next.config.ts` sets `output: "standalone"`, so:

```bash
npm run build
# copy .next/standalone, .next/static, public to your image
node server.js
```

Put the app behind a CDN (Cloudflare, Fastly) and everything under `/uploads/*` and `/icons/*` will cache with immutable long-lived headers.

---

## Project structure

```
app/
  (site)/            Public site — homepage, blog/[slug], category/[slug], tag/[slug], author/[id], search
  admin/             Admin dashboard (auth-guarded via proxy.ts)
    posts/           Posts list, new, edit
    categories/      Category management
    tags/            Tag management
    media/           Media library
    comments/        Comment moderation
    settings/        Team, banner ads, integrations
  api/               All API routes
  login/             Admin login page
  go/[id]/           Affiliate link click-tracking redirect
  sitemap.ts         Dynamic XML sitemap
  robots.ts          robots.txt
  layout.tsx         Root layout (fonts, GA, PWA, providers)
  globals.css        Design tokens (Aurum navy + gold)

components/
  Header, Footer, ThemeToggle, SearchBar, NewsletterForm
  PostCard, ReadingProgress, TableOfContents, ShareButtons, Breadcrumbs, CommentSection, AdSlot
  RichTextEditor        TipTap editor with full toolbar
  Providers, ServiceWorkerRegister
  admin/AdminSidebar    Sidebar nav
  admin/PostEditor      The full create/edit UI

lib/
  prisma.ts        Prisma client singleton
  auth.ts          NextAuth v5 config
  utils.ts         slugify, uniqueSlug, reading time, TOC extraction
  sanitize.ts      XSS-safe HTML for posts + comments
  rate-limit.ts    In-memory rate limiter (swap for Upstash in production)

prisma/schema.prisma   Full data model
scripts/seed.ts        First-run seed
proxy.ts               Next.js 16 middleware (auth guard, rate limits, CSRF, security headers)
```

---

## Notes on production-hardening TODOs

Wired-in stubs that need your production credentials:

- **Newsletter double-opt-in email** — `/api/newsletter/route.ts` currently just stores the email. Add your ESP call (Resend, Mailchimp, SendGrid).
- **Push notifications** — service worker registered; add VAPID + subscription flow when you're ready.
- **Social auto-share** — hook Twitter/LinkedIn API calls into the `POST /api/posts` handler when `status === "PUBLISHED"`.
- **Rate limiter** — in-memory works for a single instance; swap `lib/rate-limit.ts` for `@upstash/ratelimit` on serverless.

Everything else is production-wired.
