import React from 'react'
import { getPresetBySlug, getRelatedPresets, getPresets } from '../../actions'
import { notFound } from 'next/navigation'
import { generatePageMetadata, generatePresetMetadata } from '@/lib/seo/metadata'
import { generateBreadcrumbData, generatePresetStructuredData } from '@/lib/seo/structuredData'
import { PresetDetailClient } from '@/components/PresetDetailClient'
import Link from 'next/link'
import Image from 'next/image'

// 🟢 CPU OPTIMIZATION: Infinite cache (until manual or database webhook revalidation triggers).
export const revalidate = false

// 🟢 CPU OPTIMIZATION: Pre-render all preset pages at build time as static HTML.
export async function generateStaticParams() {
  const presets = await getPresets()
  return presets.map((preset: any) => ({ slug: preset.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const preset = await getPresetBySlug(slug)
  if (!preset) return { title: 'Preset Not Found' }

  return generatePresetMetadata(preset)
}

export default async function PresetDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const preset = await getPresetBySlug(slug)
  if (!preset) notFound()

  const relatedPresets = await getRelatedPresets(preset.type, preset.id)

  const isFree = preset.price_inr === 0

  const vId = (() => {
    if (!preset.youtube_url) return null;
    
    // Support for studio.youtube.com/video/ID/edit
    if (preset.youtube_url.includes('studio.youtube.com/video/')) {
        const parts = preset.youtube_url.split('/video/');
        if (parts[1]) {
            const id = parts[1].split('/')[0];
            if (id.length === 11) return id;
        }
    }

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = preset.youtube_url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  })()

  const breadcrumbs = generateBreadcrumbData([
    { name: 'Home', item: 'https://sampleswala.com' },
    { name: 'Presets', item: 'https://sampleswala.com/browse/presets' },
    { name: preset.name, item: `https://sampleswala.com/browse/presets/${preset.slug}` }
  ])

  const productData = generatePresetStructuredData(preset)

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productData) }}
      />
      <div className="flex-grow">
        <PresetDetailClient 
          preset={preset} 
          isFree={isFree} 
          vId={vId} 
        />
      </div>

      {/* Related Presets Section */}
      {relatedPresets.length > 0 && (
        <section className="py-24 bg-slate-50 border-t border-slate-200/50 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col mb-12">
              <div className="h-1 bg-[#00BFFF] w-12 mb-4 rounded-full" />
              <h2 className="text-3xl font-extrabold uppercase italic tracking-tighter text-slate-900">
                Similar <span className="text-[#00BFFF]">Presets</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">
                More {preset.type} tools for your library
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedPresets.map((item: any) => (
                <Link 
                  key={item.id} 
                  href={`/browse/presets/${item.slug}`}
                  className="group block space-y-4"
                >
                  <div className="aspect-square relative overflow-hidden rounded-lg border border-slate-200/60 group-hover:border-[#00BFFF]/30 transition-all bg-slate-100 shadow-sm">
                    <Image 
                      src={item.cover_url || '/placeholder.jpg'} 
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-100"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <span className="px-4 py-2 bg-[#00BFFF] text-white text-[8px] font-bold uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-all rounded-md shadow-sm">
                         View Preset
                       </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-extrabold uppercase tracking-tight text-xs text-slate-800 group-hover:text-[#00BFFF] transition-colors">{item.name}</h3>
                    <div className="flex items-center gap-2">
                      {item.mrp_inr && (
                        <span className="text-[9px] text-slate-400 line-through font-bold">
                          ${item.mrp_inr}
                        </span>
                      )}
                      <p className="text-[10px] font-extrabold text-[#00BFFF] uppercase italic tracking-tighter">
                        {item.price_inr === 0 ? 'FREE' : `$${item.price_inr}`}
                      </p>
                      {item.mrp_inr && item.price_inr > 0 && (
                        <div className="bg-[#00BFFF]/10 border border-[#00BFFF]/20 px-1.5 py-0.5 rounded-md">
                          <span className="text-[8px] font-bold text-[#00BFFF] uppercase">
                            {Math.round((1 - (Number(item.price_inr) / Number(item.mrp_inr))) * 100)}% OFF
                          </span>
                        </div>
                      )}
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
