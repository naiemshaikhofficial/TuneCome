'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Download, ShieldCheck, Zap, Music, CheckCircle2, HelpCircle, Plus } from 'lucide-react'
import { AddToCartButton } from '@/components/AddToCartButton'
import { ShareButton } from '@/components/ShareButton'
import { DownloadButton } from '@/components/DownloadButton'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'

interface PresetDetailClientProps {
  preset: any
  isFree: boolean
  vId: string | null
}

export function PresetDetailClient({ preset, isFree, vId }: PresetDetailClientProps) {
  const { user } = useAuth()
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [isOwned, setIsOwned] = useState(false)

  useEffect(() => {
    if (user) {
      fetch(`/api/auth/ownership?itemId=${preset.id}`)
        .then(res => res.ok ? res.json() : { owned: false })
        .then(data => setIsOwned(data.owned))
        .catch(() => setIsOwned(false))
    } else {
      setIsOwned(false)
    }
  }, [user, preset.id])

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 bg-white text-slate-800">
      <Link href="/browse/presets" className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-studio-yellow transition-colors group">
        <ArrowLeft className="mr-2 h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
        Back to Presets
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Mobile: 1. Video Preview | Desktop: Right Column */}
        <div className="lg:col-span-7 lg:order-2 space-y-8">
           {vId ? (
              <div className="space-y-4">
                 <div className="flex items-center gap-2">
                    <div className="h-4 w-1 bg-[#000000] rounded-sm" />
                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">Preset Demo</h2>
                 </div>
                 <div className="aspect-video rounded-md overflow-hidden border border-slate-100 bg-slate-50">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${vId}?rel=0&modestbranding=1`}
                      title={`${preset.name} Demo`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                 </div>
              </div>
           ) : (
              <div className="aspect-video rounded-md border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-3 text-slate-300">
                 <Music size={40} strokeWidth={1.5} />
                 <p className="text-[10px] font-bold uppercase tracking-widest">Audio preview coming soon</p>
              </div>
           )}
        </div>

        {/* Mobile: 2. Info & Actions | Desktop: Left Column */}
        <div className="lg:col-span-5 lg:order-1 space-y-6">
           <div className="space-y-3">
              <div className="inline-block px-3 py-1 bg-slate-950 text-white text-[9px] font-bold uppercase tracking-widest rounded-md">
                {preset.type}
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none text-slate-900 italic">
                {preset.name}
              </h1>
              
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  {preset.mrp_inr && (
                    <span className="text-[10px] text-slate-400 line-through font-bold">
                      ${preset.mrp_inr.toFixed(2)}
                    </span>
                  )}
                  <p className="text-2xl font-black text-slate-900 uppercase tracking-widest leading-none">
                    {preset.price_inr === 0 ? 'FREE' : `$${preset.price_inr.toFixed(2)}`}
                  </p>
                </div>
                {preset.mrp_inr && preset.price_inr > 0 && (
                  <div className="bg-slate-950 px-2 py-0.5 rounded-sm">
                    <span className="text-[9px] font-bold text-white uppercase italic">
                      {Math.round((1 - (Number(preset.price_inr) / Number(preset.mrp_inr))) * 100)}% OFF
                    </span>
                  </div>
                )}
                {preset.price_inr === 0 && (
                   <div className="px-2.5 py-0.5 bg-[#000000]/10 border border-[#000000]/20 rounded-md text-[8px] font-bold uppercase tracking-wider text-[#1a1a1a]">
                      COMMUNITY GIFT
                   </div>
                )}
              </div>
           </div>

           {/* Compatibility */}
           <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#000000]">Compatibility</h3>
              <div className="flex flex-wrap gap-2.5">
                 {preset.daws.map((daw: string) => (
                    <div key={daw} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-md flex items-center gap-2 text-slate-800 shadow-xs">
                       {daw === 'FL Studio' && (
                          <div className="relative w-3.5 h-3.5">
                             <Image src="/logos/Fl-Studio.png" alt="FL Studio" fill sizes="14px" className="object-contain" />
                          </div>
                       )}
                       <span className="text-[9px] font-bold uppercase tracking-wider">{daw}</span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Purchase Buttons */}
           <div className="pt-2">
              {isOwned ? (
                 <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[#000000] font-bold uppercase tracking-widest text-[9px]">
                       <CheckCircle2 size={14} />
                       You own this preset
                    </div>
                    <DownloadButton itemId={preset.id} type="preset" />
                 </div>
              ) : (
                   <div className="grid grid-cols-1 gap-3">
                      <AddToCartButton 
                        item={{
                          id: preset.id,
                          name: preset.name,
                          price: Number(preset.price_inr),
                          slug: preset.slug,
                          cover_url: preset.cover_url || undefined,
                          type: 'preset'
                        }} 
                      />
                      <Link 
                         href={`/checkout?direct=${preset.id}&type=preset`}
                         className="w-full h-11 bg-slate-950 text-white font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all rounded-md cursor-pointer"
                      >
                         <Zap size={14} fill="currentColor" />
                         {isFree ? 'GET FOR FREE' : 'BUY NOW'}
                      </Link>
                   </div>
                )}
                
                <div className="pt-2">
                  <ShareButton title={preset.name} text={`Check out this ${preset.type} preset on TuneCome: ${preset.name}`} />
                </div>
           </div>

           <p className="text-[10px] font-bold text-slate-650 leading-relaxed uppercase tracking-wider bg-slate-50 p-5 border border-slate-100 rounded-md">
              {preset.description || `Take your sound to the next level with ${preset.name}. Professionally crafted for high-quality music production.`}
           </p>

           {/* Plugins Used Section */}
           {preset.plugins_used && preset.plugins_used.flat().length > 0 && (
             <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                   <div className="h-4 w-1 bg-[#000000] rounded-sm" />
                   <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">Plugins Used</h2>
                </div>
                <div className="grid grid-cols-3 gap-3">
                   {preset.plugins_used.flat().map((plugin: string, i: number) => {
                      const colors = [
                        { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-850' },
                        { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-850' },
                        { bg: 'bg-slate-50', border: 'border-[#000000]/20', text: 'text-slate-850' }
                      ];
                      const style = colors[i % colors.length];
                      return (
                        <div 
                          key={plugin} 
                          className={`p-2 ${style.bg} border ${style.border} flex flex-col gap-0.5 rounded-md transition-all hover:border-[#000000]`}
                        >
                           <span className={`text-[8px] md:text-[9px] font-bold uppercase ${style.text} tracking-tight leading-tight truncate`}>{plugin}</span>
                           <span className={`text-[5px] md:text-[6px] font-bold ${style.text} opacity-40 uppercase tracking-tighter`}>Required</span>
                        </div>
                      );
                   })}
                </div>
             </div>
           )}

           <div className="flex items-center justify-center gap-6 py-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                <ShieldCheck size={12} className="text-[#000000]" />
                100% Royalty Free
              </div>
              <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                <Zap size={12} className="text-[#000000]" />
                Immediate Access
              </div>
           </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="pt-8 border-t border-slate-100 space-y-6">
         <div className="flex items-center gap-2">
            <div className="h-4 w-1 bg-[#000000] rounded-sm" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Common Questions</h2>
         </div>
         
         <div className="max-w-3xl space-y-3">
            {[
               { q: "Are these presets royalty-free?", a: "Yes, 100%. You can use these presets in your commercial projects, songs, and background scores without any additional payments or attribution." },
               { q: "What if I use a different DAW?", a: `Presets are DAW-specific. If you use a different DAW than ${preset.daws.join(' & ')}, the files will not work. We strongly suggest checking compatibility before purchasing to ensure the presets work for you.` },
               { q: "Do I need external plugins?", a: "Yes, you might need external plugins depending on the preset. You'll be able to see the full list of required plugins once you apply the preset in your DAW." },
               { q: "How do I get the files after purchase?", a: "Immediately after your payment is successful, you'll receive an email with a download link. You can also access all your purchases in 'Your Library'." }
            ].map((faq, i) => (
              <div key={i} className="border border-slate-200 bg-slate-50 rounded-md shadow-xs overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-5 flex items-center justify-between group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`transition-colors duration-300 ${activeFaq === i ? 'text-[#000000]' : 'text-slate-300'}`}>
                      <HelpCircle size={16} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${activeFaq === i ? 'text-[#000000]' : 'text-slate-700'}`}>
                      {faq.q}
                    </span>
                  </div>
                  
                  <motion.div
                    animate={{ rotate: activeFaq === i ? 45 : 0 }}
                    className={`flex-shrink-0 transition-colors duration-300 ${activeFaq === i ? 'text-[#000000]' : 'text-slate-450'}`}
                  >
                    <Plus size={16} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden bg-white border-t border-slate-100"
                    >
                      <div className="py-4 px-5 pl-12">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
         </div>
      </section>

      {/* Installation Guide */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-100 pb-8">
         <div className="space-y-2.5 p-5 bg-slate-50 border border-slate-100 rounded-md">
            <div className="flex items-center gap-2">
               <ShieldCheck className="text-[#000000]" size={16} />
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#000000]">Pro Tip</h3>
            </div>
            <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider">
               For best results, make sure you have the latest versions of both stock and external plugins installed. Always check your gain staging before applying vocal chains.
            </p>
         </div>
         <div className="space-y-2.5 p-5 bg-slate-50 border border-slate-100 rounded-md">
            <div className="flex items-center gap-2">
               <Download className="text-[#000000]" size={16} />
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#000000]">Installation Guide</h3>
            </div>
            <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider">
               1. Extract the downloaded ZIP file.<br />
               2. Drag and drop the preset file directly onto your mixer bus.<br />
               3. The preset will be applied automatically.<br />
               4. Ensure you have the required plugins installed as mentioned.<br />
               5. Start creating!
            </p>
         </div>
      </section>
    </div>
  )
}
