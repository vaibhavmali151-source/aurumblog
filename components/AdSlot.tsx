import Script from "next/script";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

/**
 * Renders a Google AdSense unit if NEXT_PUBLIC_ADSENSE_CLIENT is configured,
 * otherwise falls back to an admin-managed banner for the given placement
 * (see BannerAd model / Admin → Settings → Ad Manager).
 */
export async function AdSlot({ placement }: { placement: string }) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  if (adsenseClient) {
    return (
      <div className="my-8 text-center">
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={adsenseClient}
          data-ad-slot={placement}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <Script id={`adsbygoogle-push-${placement}`} strategy="lazyOnload">
          {`(adsbygoogle = window.adsbygoogle || []).push({});`}
        </Script>
      </div>
    );
  }

  const banner = await prisma.bannerAd.findFirst({ where: { placement, active: true } });
  if (!banner) return null;

  return (
    <a href={banner.linkUrl} target="_blank" rel="noopener sponsored" className="my-8 block">
      <Image
        src={banner.imageUrl}
        alt={banner.name}
        width={728}
        height={90}
        className="mx-auto w-full max-w-3xl rounded-md"
        loading="lazy"
      />
      <p className="mt-1 text-center text-[10px] uppercase tracking-wider text-[var(--ink-muted)]">Advertisement</p>
    </a>
  );
}
