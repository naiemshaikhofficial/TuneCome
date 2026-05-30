'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { ArrowLeft, PlayCircle, ShieldCheck, Zap, HelpCircle, Plus, Download, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { DownloadButton } from '@/components/DownloadButton'
import { PaymentButton } from '@/components/PaymentButton'
import { AddToCartButton } from '@/components/AddToCartButton'
import { ShareButton } from '@/components/ShareButton'
import Link from 'next/link'
import { getOptimizedImageUrl } from '@/lib/images'
import { getPackPriceDetails } from '@/lib/pricing'
import { useAuth } from '@/context/AuthContext'

export function PackDetailClient({ initialPack }: { initialPack: any }) {
  const pack = initialPack
  const { user } = useAuth()
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [owned, setOwned] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (user) {
      fetch(`/api/auth/ownership?itemId=${pack.id}`)
        .then(res => res.ok ? res.json() : { owned: false })
        .then(data => setOwned(data.owned))
        .catch(() => setOwned(false))
    } else {
      setOwned(false)
    }
  }, [user, pack.id])

  const priceDetails = React.useMemo(() => {
    return getPackPriceDetails(pack)
  }, [pack, now])

  const faqs = React.useMemo(() => {
    const list = [
      {
        q: "Is this compatible with FL Studio?",
        a: "Yes! Our samples are professional 24-bit WAV files, compatible with all DAWs including FL Studio, Ableton Live, Logic Pro, Cubase, and more."
      }
    ];

    if (!pack.is_downloadable) {
      list.push(
        {
          q: "How does the pre-order process work?",
          a: "By pre-ordering, you secure the pack at a highly discounted special price while it is in the studio. Once completed, the download link will automatically appear in your Library/Vault and we'll email you immediately."
        },
        {
          q: "Why does it take 1-2 months to deliver?",
          a: "Our sample packs are premium products curating real session players and live-recorded instruments. Post-production (editing, mixing, mastering) is highly time-consuming because we are committed to delivering unmatched, commercial-grade sound quality. But we are trying hard to make it available as soon as possible!"
        },
        {
          q: "Can I get a refund on my pre-order?",
          a: "No, all pre-orders are strictly non-refundable and final, similar to our digital products. A refund will only be issued in the extremely rare event that the production is officially cancelled by TuneCome."
        },
        {
          q: "How will I be notified when it's ready?",
          a: "We will notify you instantly via your registered email address and through our official social media channels. You'll be able to log in and download it instantly."
        }
      );
    } else {
      list.push({
        q: "Where is my download link?",
        a: "Delivery is instant. You will get a download link on the screen immediately after payment, and a backup link will be sent to your registered email."
      });
    }

    list.push(
      {
        q: "Will I get an official invoice?",
        a: "Yes, a digital PDF invoice is automatically generated for every purchase and sent to your email for your records."
      },
      {
        q: "Are these sounds royalty-free?",
        a: "Absolutely. Every sound you buy from TuneCome is 100% royalty-free for use in your commercial music productions without any attribution."
      }
    );

    return list;
  }, [pack.is_downloadable]);

  const currentPrice = priceDetails.priceInr
  const isPreorderActive = priceDetails.isPreorderActive
  const isExpired = priceDetails.isExpired

  const days = priceDetails.daysLeft
  const hours = priceDetails.hoursLeft
  const minutes = priceDetails.minutesLeft
  const seconds = priceDetails.secondsLeft

  const vId = React.useMemo(() => {
    if (!pack.video_url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = pack.video_url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }, [pack.video_url])

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 bg-white text-slate-800">
      <Link href="/browse" className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-studio-yellow transition-colors group">
        <ArrowLeft className="mr-2 h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
        Back to Library
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Mobile Order 1: Video Preview & Technical Specs */}
        <div className="lg:col-span-8 space-y-8 order-1 lg:order-2">
          {vId ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-1 bg-[#00BFFF] rounded-sm" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">Demo Video</h2>
              </div>
              <div className="aspect-video rounded-md overflow-hidden border border-slate-100 bg-slate-50">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${vId}?rel=0&modestbranding=1`}
                  title={`${pack.name} Preview`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          ) : (
            <div className="aspect-video rounded-md border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-3 text-slate-300">
               <PlayCircle size={40} strokeWidth={1.5} />
               <p className="text-[10px] font-bold uppercase tracking-widest">No Preview Signal Found</p>
            </div>
          )}

          {/* Technical Specs / Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
             <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#00BFFF]">Technical Specifications</h3>
                <ul className="space-y-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                   <li>• Format: Professional 24-Bit / 44.1kHz WAV</li>
                   <li>• Compatibility: All DAWs (FL Studio, Ableton, Logic, etc.)</li>
                   <li>• License: Personal & Commercial Royalty-Free</li>
                   <li>• Delivery: Secure Digital Download</li>
                </ul>
             </div>
             <div className="space-y-3 hidden md:block">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Production Details</h3>
                <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider">
                   Expertly mixed and mastered using industry-standard equipment. Designed to cut through the mix and provide instant inspiration for modern music producers.
                </p>
             </div>
          </div>
        </div>

        {/* Mobile Order 2: Name & Purchase */}
        <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
          <div className="aspect-square relative rounded-md overflow-hidden border border-slate-100 shadow-md group/image">
            <Image 
              src={getOptimizedImageUrl(pack.cover_url, 800, 90)} 
              alt={`${pack.name} - Premium Sample Pack | TuneCome`} 
              fill 
              priority
              sizes="(max-width: 768px) 100vw, 500px"
              className="object-cover transition-transform duration-700 group-hover:scale-103"
            />
            
            <div className="absolute top-3 right-3 z-20">
               <ShareButton 
                 title={pack.name} 
                 text={`Check out ${pack.name} on TuneCome!`} 
                 url={typeof window !== 'undefined' ? window.location.href : ''}
                 className="w-8 h-8 bg-slate-900/60 backdrop-blur-xs border border-white/20 text-white flex items-center justify-center hover:bg-[#00BFFF] hover:border-[#00BFFF] rounded-md transition-all cursor-pointer"
               />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none text-slate-900 italic">
                {pack.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 line-through font-bold">
                    ${(pack.mrp_inr || (currentPrice * 3)).toFixed(2)}
                  </span>
                  <p className="text-2xl font-black text-slate-900 uppercase tracking-widest leading-none">
                    ${currentPrice.toFixed(2)}
                  </p>
                </div>
                <div className="bg-slate-950 px-2 py-0.5 rounded-sm flex flex-col items-center">
                  <span className="text-[9px] font-bold text-white uppercase italic">
                    {Math.round((1 - (currentPrice / (pack.mrp_inr || (currentPrice * 3)))) * 100)}% OFF
                  </span>
                  {!pack.is_downloadable && (
                    <span className="text-[6px] font-bold uppercase tracking-wider text-white mt-0.5 opacity-60">
                      {isExpired ? 'Regular' : 'Pre-order Offer'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-1">
              <div className="flex flex-col gap-3">
                {owned ? (
                  pack.is_downloadable ? (
                    <DownloadButton itemId={pack.id} />
                  ) : (
                    <div className="w-full p-6 bg-slate-50 border border-slate-100 rounded-md text-center space-y-2 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-2 opacity-[0.03]">
                        <Zap size={40} className="text-[#00BFFF]" />
                      </div>
                      <p className="text-[11px] font-black uppercase tracking-wider text-[#00BFFF] italic">Pre-ordered Successfully!</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                        This pack is currently in production.<br/>We will notify you via email once it's available for download.
                      </p>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {!pack.is_downloadable && isPreorderActive && (
                      <div className="bg-slate-950 p-2.5 rounded-md mb-1 text-center">
                        <p className="text-[9px] font-bold text-white uppercase tracking-widest animate-pulse">
                          🔥 PRE-ORDER OFFER: SECURE THIS PRICE NOW!
                        </p>
                      </div>
                    )}
                    
                    {!pack.is_downloadable && isPreorderActive && (
                      <div className="p-4 rounded-md border border-[#00BFFF] bg-slate-50 text-slate-800 mb-1">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Offer Ends In:</span>
                          <div className="grid grid-cols-4 gap-2 text-center font-mono text-slate-800">
                            <div className="bg-white p-1.5 border border-slate-200 rounded-md min-w-[36px]">
                              <span className="text-base font-black block leading-none">{mounted ? String(days).padStart(2, '0') : '00'}</span>
                              <span className="text-[6px] font-bold text-slate-400 uppercase tracking-wider">Days</span>
                            </div>
                            <div className="bg-white p-1.5 border border-slate-200 rounded-md min-w-[36px]">
                              <span className="text-base font-black block leading-none">{mounted ? String(hours).padStart(2, '0') : '00'}</span>
                              <span className="text-[6px] font-bold text-slate-400 uppercase tracking-wider">Hours</span>
                            </div>
                            <div className="bg-white p-1.5 border border-slate-200 rounded-md min-w-[36px]">
                              <span className="text-base font-black block leading-none">{mounted ? String(minutes).padStart(2, '0') : '00'}</span>
                              <span className="text-[6px] font-bold text-slate-400 uppercase tracking-wider">Mins</span>
                            </div>
                            <div className="bg-white p-1.5 border border-slate-200 rounded-md min-w-[36px]">
                              <span className="text-base font-black block leading-none text-[#00BFFF]">{mounted ? String(seconds).padStart(2, '0') : '00'}</span>
                              <span className="text-[6px] font-bold text-slate-400 uppercase tracking-wider">Secs</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <AddToCartButton 
                      label={isPreorderActive ? "Pre-order" : "Add to Cart"}
                      item={{
                        id: pack.id,
                        name: pack.name,
                        price: currentPrice,
                        slug: pack.slug,
                        cover_url: pack.cover_url || undefined,
                        type: 'pack',
                        is_downloadable: pack.is_downloadable
                      }} 
                    />
                    <PaymentButton 
                      label={isPreorderActive ? `PRE-ORDER NOW — $${currentPrice.toFixed(2)}` : `BUY NOW — $${currentPrice.toFixed(2)}`}
                      packId={pack.id} 
                      packName={pack.name} 
                      price={currentPrice} 
                      slug={pack.slug}
                      cover_url={pack.cover_url || ''}
                      userId={user?.id}
                    />
                    
                    {!pack.is_downloadable && (
                      <div className="p-4 rounded-md border border-[#00BFFF] bg-slate-50 text-slate-800 text-left space-y-2 mt-2">
                        <div className="flex items-center gap-2 text-[#00BFFF]">
                          <Clock size={12} className="animate-pulse" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Pre-order Notice</span>
                        </div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-relaxed">
                          Please note: our sample packs are mostly curating <span className="text-[#00BFFF]">live session players</span>, taking up to <span className="text-slate-800 font-black">1-2 months to deliver</span>.
                        </p>
                        <p className="text-[9px] font-bold text-slate-450 uppercase tracking-wider leading-relaxed pt-1 border-t border-slate-200">
                          📧 For availability queries, email us at <a href="mailto:support@tunecome.com" className="text-[#00BFFF] hover:underline font-bold lowercase">support@tunecome.com</a>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Order 3: Description & Details */}
        <div className="lg:col-span-12 lg:grid lg:grid-cols-12 gap-10 order-3">
          <div className="lg:col-span-8 space-y-4">
            <p className="text-[10px] font-bold text-slate-650 leading-relaxed uppercase tracking-wider bg-slate-50 p-5 border border-slate-100 rounded-md whitespace-pre-wrap">
              {pack.description || "No description available for this collection."}
            </p>
          </div>
          
          <div className="lg:col-span-4 space-y-4 mt-6 lg:mt-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-md space-y-1">
                <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Type</span>
                <p className="text-[9px] font-bold uppercase text-slate-800">{pack.categories?.[0]?.name || 'Sound Kits'}</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-md space-y-1">
                <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Quality</span>
                <p className="text-[9px] font-bold uppercase text-slate-800">24-Bit WAV</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-6 py-3 border-t border-slate-100">
               <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                 <ShieldCheck size={12} className="text-[#00BFFF]" />
                 100% Royalty Free
               </div>
               <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                 <Zap size={12} className="text-[#00BFFF]" />
                 Immediate Access
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="pt-8 border-t border-slate-100 space-y-6">
        <div className="flex items-center gap-2">
          <div className="h-4 w-1 bg-[#00BFFF] rounded-sm" />
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Frequently Asked Questions</h2>
        </div>

        <div className="max-w-3xl space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-slate-200 bg-slate-50 rounded-md shadow-xs overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 flex items-center justify-between group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`transition-colors duration-300 ${activeFaq === idx ? 'text-[#00BFFF]' : 'text-slate-300'}`}>
                    <HelpCircle size={16} />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${activeFaq === idx ? 'text-[#00BFFF]' : 'text-slate-700'}`}>
                    {faq.q}
                  </span>
                </div>
                
                <motion.div
                  animate={{ rotate: activeFaq === idx ? 45 : 0 }}
                  className={`flex-shrink-0 transition-colors duration-300 ${activeFaq === idx ? 'text-[#00BFFF]' : 'text-slate-400'}`}
                >
                  <Plus size={16} />
                </motion.div>
              </button>

              <AnimatePresence>
                {activeFaq === idx && (
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
      </div>

      {/* Installation Guide */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-100 pb-8">
         <div className="space-y-2.5 p-5 bg-slate-50 border border-slate-100 rounded-md">
            <div className="flex items-center gap-2">
               <ShieldCheck className="text-[#00BFFF]" size={16} />
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#00BFFF]">Pro Tip</h3>
            </div>
            <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider">
               For best results, use high-quality monitors or headphones to hear the full frequency range. Organize your library by bpm and key for faster workflow.
            </p>
         </div>
         <div className="space-y-2.5 p-5 bg-slate-50 border border-slate-100 rounded-md">
            <div className="flex items-center gap-2">
               <Download className="text-[#00BFFF]" size={16} />
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#00BFFF]">Installation Guide</h3>
            </div>
            <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider">
               1. Extract the downloaded ZIP file.<br />
               2. Drag the folder into your DAW's browser or sample library.<br />
               3. Add the folder to your 'Places' for quick access.<br />
               4. Start creating!
            </p>
         </div>
      </section>
    </div>
  )
}
