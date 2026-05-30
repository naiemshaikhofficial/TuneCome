import React from 'react'
import { getPackBySlug, getRelatedPacks, getPacks } from '@/app/browse/actions'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { generatePackStructuredData, generateBreadcrumbData } from '@/lib/seo/structuredData'
import { getPackPriceDetails } from '@/lib/pricing'

// 🟢 CPU OPTIMIZATION: Infinite cache (until dynamic on-demand revalidation triggers via webhook).
export const revalidate = false

// 🟢 CPU OPTIMIZATION: Pre-render all pack pages at build time as static HTML.
// This eliminates server CPU usage for the most visited product pages.
export async function generateStaticParams() {
  const packs = await getPacks()
  return packs.map((pack: any) => ({ slug: pack.slug }))
}

import { generatePageMetadata, generatePackMetadata } from '@/lib/seo/metadata'
import { PackDetailClient } from '@/components/PackDetailClient'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const pack = await getPackBySlug(slug)
  if (!pack) return { title: 'Pack Not Found' }

  const priceDetails = getPackPriceDetails(pack)
  const dynamicPack = {
    ...pack,
    price_inr: priceDetails.priceInr,
    price_usd: priceDetails.priceUsd
  }

  return generatePackMetadata(dynamicPack)
}

export default async function PackDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const pack = await getPackBySlug(slug)
  if (!pack) notFound()

  const priceDetails = getPackPriceDetails(pack)
  const dynamicPack = {
    ...pack,
    price_inr: priceDetails.priceInr,
    price_usd: priceDetails.priceUsd
  }

  const relatedPacks = await getRelatedPacks((pack as any).categories?.[0]?.name || 'Samples', pack.id)

  const categoryName = (pack as any).categories?.[0]?.name || 'Samples'
  const jsonLd = generatePackStructuredData(dynamicPack)
  const breadcrumbs = generateBreadcrumbData([
    { name: 'Home', item: 'https://sampleswala.com' },
    { name: 'Library', item: 'https://sampleswala.com/browse' },
    { name: pack.name, item: `https://sampleswala.com/packs/${pack.slug}` }
  ])

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <div className="flex-grow">
        <PackDetailClient initialPack={pack} />
      </div>

      {/* Related Packs Section */}
      {relatedPacks.length > 0 && (
        <section className="py-24 bg-slate-50 border-t border-slate-200/50 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col mb-12">
              <div className="h-1 bg-[#00BFFF] w-12 mb-4 rounded-full" />
              <h2 className="text-3xl font-extrabold uppercase italic tracking-tighter text-slate-900">
                You Might Also <span className="text-[#00BFFF]">Like</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">
                Explore more {categoryName} sounds
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedPacks.map((item: any) => (
                <Link 
                  key={item.id} 
                  href={`/packs/${item.slug}`}
                  className="group block space-y-4"
                >
                  <div className="aspect-square relative overflow-hidden rounded-lg border border-slate-200/60 group-hover:border-[#00BFFF]/30 transition-all bg-white shadow-sm">
                    <Image 
                      src={item.cover_url || '/placeholder.jpg'} 
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <span className="px-4 py-2 bg-[#00BFFF] text-white text-[8px] font-bold uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-all rounded-md shadow-sm">
                         View Details
                       </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-extrabold uppercase tracking-tight text-xs text-slate-800 group-hover:text-[#00BFFF] transition-colors">{item.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-400 line-through font-bold">
                        ${item.mrp_inr || (Number(item.price_inr) * 3)}
                      </span>
                      <p className="text-[10px] font-extrabold text-[#00BFFF] uppercase italic tracking-tighter">${item.price_inr}</p>
                      <div className="bg-[#00BFFF]/10 border border-[#00BFFF]/20 px-1.5 py-0.5 rounded-md">
                        <span className="text-[8px] font-bold text-[#00BFFF] uppercase">
                          {Math.round((1 - (Number(item.price_inr) / (item.mrp_inr || (Number(item.price_inr) * 3)))) * 100)}% OFF
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
