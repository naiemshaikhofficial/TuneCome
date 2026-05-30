import React from 'react'
import { getPacks, getAllCategories, getPresets } from './actions'
import Link from 'next/link'
import { Music, Sparkles, Zap, ShoppingBag } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { BrowseLibrary } from '@/components/BrowseLibrary'
import { PresetCard } from '@/components/PresetCard'
import { generateBreadcrumbData } from '@/lib/seo/structuredData'

export const metadata = generatePageMetadata({
  title: 'Browse Music Production Tools | TuneCome',
  description: 'Explore our library of premium Indian Sample Packs and Producer Presets.',
  path: '/browse'
})

export default async function BrowsePage({ 
  searchParams 
  }: { 
  searchParams: Promise<{ q?: string; type?: string }> 
}) {
  const { q, type = 'packs' } = await searchParams
  const packs = await getPacks()
  const categories = await getAllCategories()
  const presets = await getPresets()

  const breadcrumbs = generateBreadcrumbData([
    { name: 'Home', item: 'https://sampleswala.com' },
    { name: 'Browse', item: 'https://sampleswala.com/browse' }
  ])

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      {/* --- PREMIUM TAB SWITCHER --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-16">
         <Link 
            href="/browse/sounds"
            className={`flex-1 h-14 md:h-16 flex items-center justify-center gap-3 border border-slate-200/80 text-lg md:text-xl font-bold uppercase tracking-wider transition-all rounded-xl shadow-sm ${type === 'packs' ? 'bg-[#00BFFF] text-white border-[#00BFFF]' : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800'}`}
         >
            <Music size={18} />
            Sounds
            <span className="ml-2 text-[8px] bg-slate-900 text-white px-2 py-0.5 rounded-full font-bold">NEW</span>
         </Link>
         
         <Link 
            href="/browse/presets"
            className={`flex-1 h-14 md:h-16 flex items-center justify-center gap-3 border border-slate-200/80 text-lg md:text-xl font-bold uppercase tracking-wider transition-all rounded-xl shadow-sm ${type === 'presets' ? 'bg-[#00BFFF] text-white border-[#00BFFF]' : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800'}`}
         >
            <Sparkles size={18} />
            Producer Presets
            <span className="ml-2 text-[8px] bg-slate-900 text-white px-2 py-0.5 rounded-full font-bold">HOT</span>
         </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* --- SIDEBAR --- */}
        <aside className="lg:col-span-3 lg:sticky lg:top-32 space-y-6 order-2 lg:order-1">
           <div className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-6 shadow-sm">
              <div className="space-y-1">
                 <h2 className="text-base font-bold uppercase tracking-tight text-slate-800">Quick Filters</h2>
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Narrow down your sound</p>
              </div>

              <div className="space-y-2">
                 <Link 
                   href={`/browse?type=${type}`}
                   className="block w-full p-2.5 bg-slate-50 border border-slate-200/60 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-[#00BFFF] hover:text-white hover:border-[#00BFFF] text-center transition-all"
                 >
                    All Genres
                 </Link>
                 {categories.map((cat: any) => (
                    <Link
                      key={cat.id}
                      href={`/browse/genre/${cat.slug}?type=${type}`}
                      className="block w-full p-2.5 bg-slate-50 border border-slate-200/60 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-[#00BFFF] hover:text-white hover:border-[#00BFFF] text-center transition-all"
                    >
                      {cat.name}
                    </Link>
                 ))}
              </div>
           </div>

           {/* Stats / Promo */}
           <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl">
              <div className="flex items-center gap-2 text-[#00BFFF] mb-1.5">
                 <ShoppingBag size={14} />
                 <span className="text-[9px] font-bold uppercase tracking-widest">Flash Sale</span>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-tight text-slate-700">
                 Get any {type === 'packs' ? 'Pack' : 'Preset'} for <span className="text-[#00BFFF] font-extrabold">$9.99</span>
              </p>
           </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="lg:col-span-9 order-1 lg:order-2 min-h-[600px]">
          {type === 'packs' ? (
             <div className="space-y-8">
                <div className="space-y-1">
                   <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-slate-900">
                      Premium <span className="text-[#00BFFF]">Packs</span>
                   </h1>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Professional Indian Sample Kits & Vocal Stacks</p>
                </div>
                <BrowseLibrary initialPacks={packs} searchQuery={q} />
             </div>
          ) : (
             <div className="space-y-8">
                <div className="space-y-1">
                   <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-slate-900">
                      Signature <span className="text-[#00BFFF]">Presets</span>
                   </h1>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mixing Chains & Soundbanks for FL Studio & More</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                   {presets.map((preset: any) => (
                      <PresetCard key={preset.id} preset={preset} />
                   ))}
                </div>
             </div>
          )}
        </main>
      </div>
    </div>
  )
}
