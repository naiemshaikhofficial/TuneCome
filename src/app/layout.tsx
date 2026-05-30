import { Inter } from 'next/font/google'
import type { Metadata } from "next";
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
})

import { generatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Tune Come | Premium Sample Packs, Loops & Presets",
  description: "Tune Come provides premium royalty-free sample packs, loop libraries, and DAW presets. Download high-quality professional sounds for Drill, Hip-Hop, Trap, and Lofi music production.",
});


import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { HeaderCartIcon } from "@/components/HeaderCartIcon";
import { Instagram, Youtube, Twitter } from "lucide-react";
import { BackgroundMural } from "@/components/BackgroundMural";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { ContentProtection } from "@/components/ContentProtection";
import { CartSidebar } from "@/components/CartSidebar";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { ArtistStatusProvider } from "@/components/ArtistStatusProvider";
import Script from "next/script";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 🟢 CPU OPTIMIZATION: All user session checks and artist status checking
  // are now lazy-loaded client-side inside their respective components.
  // This removes all server-side database/auth lookups from the layout,
  // allowing the root shell to be statically pre-rendered (SSG).

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Samples Wala",
    "url": "https://sampleswala.com",
    "logo": "https://sampleswala.com/Logo.png",
    "sameAs": [
      "https://instagram.com/sampleswala",
      "https://youtube.com/@sampleswala",
      "https://twitter.com/sampleswala"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "support@sampleswala.com"
    }
  };

  const siteSearchLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://sampleswala.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://sampleswala.com/browse?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/Favicon.ico?v=8" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png?v=8" type="image/png" sizes="32x32" />
        <link rel="icon" href="/icon.png?v=8" type="image/png" sizes="192x192" />
        
        {/* Mobile Viewport & Optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />


        {/* All Google fonts are self-hosted via next/font/google at build time for optimal performance */}

        {/* Supabase Connection Preconnection */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <>
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
          </>
        )}

        {/* Payment Gateways & Media CDNs Preconnection */}
        <link rel="dns-prefetch" href="https://api.razorpay.com" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        {/* Geographic Targeting (Local SEO) */}
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="Mumbai, India" />
        <meta name="geo.position" content="19.0760;72.8777" />
        <meta name="ICBM" content="19.0760, 72.8777" />

        {/* Crawler Directives */}
        <meta name="rating" content="general" />
        <meta name="distribution" content="global" />
        <meta name="revisit-after" content="1 day" />

        {/* Music-Specific Meta Categorization */}
        <meta name="subject" content="Music Production, Sample Packs, Loops, Beats, Presets" />
        <meta name="topic" content="Music Production and Beat Making" />
        <meta name="summary" content="Tune Come - Premium sample packs, loops, software presets, and audio libraries. 100% royalty-free for music producers." />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSearchLd) }}
        />
        <Script 
          src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js" 
          strategy="afterInteractive" 
        />
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col text-white`}>
        <AuthProvider>
          <CartProvider>
            <ArtistStatusProvider>
              <BackgroundMural />
              <ContentProtection />
              <ServiceWorkerRegistration />
              <CartSidebar />
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
              <Analytics />
              <SpeedInsights />
            </ArtistStatusProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
