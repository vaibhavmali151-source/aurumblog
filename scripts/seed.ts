import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@aurum.blog";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Vaibhav Mali",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      bio: "Founder of Aurum. Building at the intersection of AI and markets.",
    },
  });

  const ai = await prisma.category.upsert({
    where: { slug: "ai" },
    update: {},
    create: { name: "AI", slug: "ai", description: "Artificial intelligence, tools, and the people building with them." },
  });
  const markets = await prisma.category.upsert({
    where: { slug: "markets" },
    update: {},
    create: { name: "Markets", slug: "markets", description: "Equities, options, and macro." },
  });
  await prisma.category.upsert({
    where: { slug: "tech" },
    update: {},
    create: { name: "Technology", slug: "tech", description: "Software, infrastructure, and the tools of the trade." },
  });

  const tagNames = ["prompt-engineering", "nifty", "sensex", "saas", "automation"];
  const tags = await Promise.all(
    tagNames.map((name) =>
      prisma.tag.upsert({ where: { slug: name }, update: {}, create: { name, slug: name } })
    )
  );

  const existingPosts = await prisma.post.count();
  if (existingPosts === 0) {
    await prisma.post.create({
      data: {
        title: "Welcome to Aurum: AI, Markets, and the Modern Builder",
        slug: "welcome-to-aurum",
        excerpt: "The first dispatch from Aurum — why we're covering AI and markets together, and what's coming next.",
        contentHtml: `
          <p>Welcome to Aurum. This is your first published post, seeded automatically so the homepage isn't empty on day one.</p>
          <h2>Why AI and markets, together</h2>
          <p>The tools reshaping how software gets built are the same tools reshaping how capital gets allocated. We think that's worth covering in one place.</p>
          <h2>What's next</h2>
          <p>Head to <strong>/admin/posts/new</strong> to replace this with your first real article — rich text, images, video, tables, and code blocks are all supported.</p>
          <blockquote>Delete or edit this post any time from the admin dashboard.</blockquote>
        `,
        status: "PUBLISHED",
        publishedAt: new Date(),
        isFeatured: true,
        isSticky: true,
        readingTimeMins: 2,
        seoTitle: "Welcome to Aurum",
        metaDescription: "The first dispatch from Aurum — AI, markets, and the tools shaping how modern builders work.",
        authorId: admin.id,
        categoryId: ai.id,
        tags: { connect: [{ id: tags[0].id }] },
      },
    });

    await prisma.post.create({
      data: {
        title: "Reading the Tape: A Framework for Expiry-Day Options",
        slug: "reading-the-tape-expiry-day-options",
        excerpt: "A structured approach to intraday Sensex/Nifty expiry-day setups using EMA crossovers and support/resistance.",
        contentHtml: `
          <p>Expiry days reward structure over instinct. Here's a simple framework.</p>
          <h2>1. Mark your levels pre-market</h2>
          <p>Identify prior-day high/low and the overnight GIFT Nifty cue before the bell.</p>
          <h2>2. Wait for the EMA crossover</h2>
          <p>A 9/21 EMA crossover on the 15-minute chart, confirmed by volume, is the entry trigger.</p>
          <pre><code>if ema9 crosses_above ema21 and volume &gt; avg_volume:
    signal = "CE"
elif ema9 crosses_below ema21 and volume &gt; avg_volume:
    signal = "PE"</code></pre>
          <p>This is educational content, not financial advice — size positions according to your own risk tolerance.</p>
        `,
        status: "PUBLISHED",
        publishedAt: new Date(),
        isTrending: true,
        readingTimeMins: 4,
        seoTitle: "Expiry-Day Options Framework — Aurum",
        metaDescription: "A structured, EMA-crossover based framework for intraday Sensex/Nifty expiry-day options trading.",
        authorId: admin.id,
        categoryId: markets.id,
        tags: { connect: [{ id: tags[1].id }, { id: tags[2].id }] },
      },
    });
  }

  console.log("Seed complete.");
  console.log(`Admin login → email: ${adminEmail}  password: ${adminPassword}`);
  console.log("Change this password immediately after first login.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
