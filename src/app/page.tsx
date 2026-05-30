import React from 'react'
import Link from 'next/link'
import { getPacks, getPresets } from '@/app/browse/actions'
import { ArrowRight, Sparkles } from 'lucide-react'
import { HeroSearch } from '@/components/HeroSearch'
import { HomePacks } from '@/components/HomePacks'
import { PresetCard } from '@/components/PresetCard'
import { generatePageMetadata } from '@/lib/seo/metadata'

export const revalidate = false

export const metadata = generatePageMetadata({
  title: "Tune Come | Premium Sample Packs, Loops & Presets",
  description: "Download high-quality professional sample packs, loops, and curated collections for Drill, Hip-Hop, Electronic, and Lofi music. 100% royalty-free.",
  path: '/'
})

export default async function HomePage() {
  const [packs, presets] = await Promise.all([
    getPacks(12),
    getPresets(4)
  ])

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Tune Come",
    "url": "https://tunecome.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://tunecome.com/browse?query={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Tune Come",
    "url": "https://tunecome.com",
    "logo": "https://tunecome.com/file_00000000f5e07206b2af9c5d8b51b144.png",
    "sameAs": [
      "https://instagram.com/tunecome",
      "https://youtube.com/tunecome"
    ]
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* Sleek, Premium Light Hero Section */}
      <section className="relative py-28 md:py-36 flex flex-col items-center justify-center text-center overflow-hidden bg-slate-50/50 border-b border-slate-100">

        <div className="container mx-auto px-4 max-w-4xl relative z-10 space-y-10">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-slate-900 leading-tight">
              Find your sound.
            </h1>
            <p className="text-xs sm:text-sm md:text-[14px] text-slate-500 font-bold uppercase tracking-[0.25em] max-w-xl mx-auto">
              PRISTINE SAMPLE PACKS, LOOPS & PRESETS :: 100% ROYALTY-FREE
            </p>
          </div>

          {/* Sleek Splice-style search container */}
          <div className="w-full max-w-xl mx-auto">
            <HeroSearch />
          </div>

          {/* Quick trending tags */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">
            <span>Trending searches:</span>
            {['Drill', 'Hip-Hop', 'Trap', 'Lofi', 'Presets'].map((tag) => (
              <Link 
                key={tag} 
                href={`/browse?q=${tag}`} 
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-black rounded-full border border-slate-200 transition-all cursor-pointer font-bold"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Packs Grid Section */}
      <section className="py-24 bg-[#ffffff]">
        <div className="container mx-auto px-4 space-y-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-100 pb-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight text-slate-900">
                New Releases
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Pristine quality sample libraries for your DAW
              </p>
            </div>
            <Link 
              href="/browse" 
              className="px-6 py-2.5 border border-slate-200 hover:border-slate-900 hover:text-white hover:bg-slate-900 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group rounded-md bg-[#f8fafc] text-slate-800"
            >
              Browse All Packs
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <HomePacks packs={packs.slice(0, 8)} />
        </div>
      </section>

      {/* Featured Presets */}
      <section className="py-24 bg-[#f8fafc] border-t border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-12 gap-6 border-b border-slate-200 pb-6">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-sm">
                <Sparkles size={11} className="text-slate-900" />
                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-550">VOCAL CHAINS &amp; DAW PRESETS</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-900 leading-none">
                PRODUCER PRESETS
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Professional DAW presets and vocal setups</p>
            </div>
            <Link 
              href="/browse?type=presets" 
              className="px-6 py-2.5 border border-slate-200 hover:border-slate-900 hover:text-white hover:bg-slate-900 bg-white text-slate-800 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group rounded-md"
            >
              Explore Presets
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {presets.slice(0, 4).map((preset: any) => (
              <PresetCard key={preset.id} preset={preset} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
