'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { getOptimizedImageUrl } from '@/lib/images'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Eye } from 'lucide-react'
import { cleanSearchQuery } from '@/lib/search/queryHelper'
import { getPackPriceDetails } from '@/lib/pricing'

export function BrowseLibrary({ initialPacks, searchQuery, isIndiaJourney }: { initialPacks: any[], searchQuery?: string, isIndiaJourney?: boolean }) {
  const { addItem } = useCart()
  const router = useRouter()

  const handleBuyNow = React.useCallback((pack: any, currentPrice: number) => {
    addItem({
      id: pack.id,
      name: pack.name,
      price: currentPrice,
      slug: pack.slug,
      cover_url: pack.cover_url || undefined,
      type: 'pack',
      is_downloadable: pack.is_downloadable
    })
    router.push('/checkout')
  }, [addItem, router])

  const packs = React.useMemo(() => {
    let currentPacks = initialPacks || []

    if (searchQuery) {
      const cleaned = cleanSearchQuery(searchQuery)
      if (cleaned) {
        const searchWords = cleaned.split(/\s+/)
        currentPacks = currentPacks.filter(p => {
          const nameLower = p.name.toLowerCase()
          const categoryLower = (p.categories?.name || '').toLowerCase()
          return searchWords.every(word => 
            nameLower.includes(word) || categoryLower.includes(word)
          )
        })
      }
    }
    return currentPacks
  }, [initialPacks, searchQuery])

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 justify-center">

      {packs.map((pack: any) => {
        // Calculate dynamic pricing and pre-order state
        const priceDetails = getPackPriceDetails(pack)
        const currentPrice = priceDetails.priceInr
        const isPreorderActive = priceDetails.isPreorderActive
        const isExpired = priceDetails.isExpired

        return (
          <div 
            key={pack.id} 
            className="group flex flex-col justify-between h-full space-y-4"
          >
            <Link 
              href={`/packs/${pack.slug}`} 
              prefetch={false}
              className="aspect-square relative overflow-hidden bg-slate-100 border border-slate-200 block transition-all group-hover:-translate-y-1 rounded-lg group-hover:border-[#00BFFF]/40 shadow-sm hover:shadow-md"
            >
              <Image
                src={getOptimizedImageUrl(pack.cover_url, 600, 80)}
                alt={`${pack.name} - Premium Sample Pack & Loops | TuneCome`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority={packs.indexOf(pack) < 10}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              
              {!pack.is_downloadable && (
                <div className={`absolute top-3 left-3 backdrop-blur-md px-2 py-0.5 border border-white/10 rounded-md z-10 ${
                  isExpired
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-[#00BFFF]/95 text-white shadow-sm font-semibold'
                }`}>
                  <span className="text-[8px] font-bold uppercase tracking-widest">
                    {isExpired ? 'Regular Price' : 'Pre-order Offer'}
                  </span>
                </div>
              )}
            </Link>

            <div className="flex flex-col flex-grow justify-between px-1 mt-2">
              <div className="space-y-1">
                <Link href={`/packs/${pack.slug}`} prefetch={false}>
                  <h3 className="text-[13px] font-bold uppercase truncate transition-colors tracking-tight text-slate-800 hover:text-[#00BFFF]">
                    {pack.name}
                  </h3>
                </Link>
                <div className="flex flex-col gap-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {pack.categories?.name || 'Sound Kits'}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 line-through font-bold">
                        ${pack.mrp_inr || (currentPrice * 3)}
                      </span>
                      <p className="text-[14px] font-extrabold italic leading-none text-[#00BFFF]">
                        ${currentPrice}
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <div className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <span className="text-[8px] font-bold uppercase">
                          {Math.round((1 - (currentPrice / (pack.mrp_inr || (currentPrice * 3)))) * 100)}% OFF
                        </span>
                      </div>
                      {!pack.is_downloadable && (
                        <span className={`text-[7px] font-semibold uppercase tracking-tighter px-1 rounded-sm text-center border ${
                          isExpired
                            ? 'bg-slate-100 text-slate-400 border-slate-200'
                            : 'bg-[#00BFFF]/10 text-[#00BFFF] border-[#00BFFF]/20'
                        }`}>
                          {isExpired ? 'Direct Purchase' : 'Pre-order Active'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Limited Offer / Countdown Tag */}
                {!pack.is_downloadable && isPreorderActive ? (
                  <PackCountdown pack={pack} />
                ) : (
                  <div className={`flex items-center gap-1.5 mt-2 px-2 py-0.5 border rounded-full w-fit ${
                    isExpired
                      ? 'bg-slate-50 text-slate-500 border-slate-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`} />
                    <span className="text-[8px] font-bold uppercase tracking-wider">
                      {isExpired ? 'In Stock / Ready' : 'Limited Offer'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-auto pt-4">
                <button 
                  onClick={() => addItem({
                    id: pack.id,
                    name: pack.name,
                    price: currentPrice,
                    slug: pack.slug,
                    cover_url: pack.cover_url || undefined,
                    type: 'pack',
                    is_downloadable: pack.is_downloadable
                  })}
                  className="flex-1 h-9 bg-white text-slate-700 text-[10px] md:text-xs font-semibold uppercase tracking-wider transition-all border border-slate-200 rounded-md flex items-center justify-center gap-1.5 hover:bg-slate-50 active:bg-slate-100 shadow-sm"
                  title={isPreorderActive ? "Pre-order" : "Add to Cart"}
                >
                  <ShoppingCart size={13} className="text-slate-500" />
                  {isPreorderActive ? 'Pre' : 'Cart'}
                </button>
                <button 
                  onClick={() => handleBuyNow(pack, currentPrice)}
                  className="flex-1 h-9 bg-[#00BFFF] hover:bg-[#009fcc] text-white text-[10px] md:text-xs font-semibold uppercase tracking-wider transition-all rounded-md flex items-center justify-center shadow-sm"
                >
                  {isPreorderActive ? 'Pre-Order' : 'Buy Now'}
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PackCountdown({ pack }: { pack: any }) {
  const [mounted, setMounted] = React.useState(false)
  const [, setTick] = React.useState(0)

  React.useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setTick(t => t + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const priceDetails = getPackPriceDetails(pack)
  const isPreorderActive = priceDetails.isPreorderActive

  if (!isPreorderActive) return null

  const days = priceDetails.daysLeft
  const hours = priceDetails.hoursLeft
  const minutes = priceDetails.minutesLeft
  const seconds = priceDetails.secondsLeft

  return (
    <div className="mt-2 p-1.5 rounded-md border flex items-center justify-between gap-1 text-slate-700 border-slate-200/80 bg-slate-50 shadow-sm">
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-[#00BFFF] animate-pulse" />
        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Ends In:</span>
      </div>
      <div className="flex gap-0.5 font-mono text-[9px] font-bold">
        <div className="bg-white px-1.5 py-0.5 rounded border border-slate-100 flex flex-col items-center min-w-[18px] shadow-sm">
          <span>{mounted ? String(days).padStart(2, '0') : '00'}</span>
          <span className="text-[4px] text-slate-400 uppercase font-sans">d</span>
        </div>
        <span className="text-slate-300 self-center">:</span>
        <div className="bg-white px-1.5 py-0.5 rounded border border-slate-100 flex flex-col items-center min-w-[18px] shadow-sm">
          <span>{mounted ? String(hours).padStart(2, '0') : '00'}</span>
          <span className="text-[4px] text-slate-400 uppercase font-sans">h</span>
        </div>
        <span className="text-slate-300 self-center">:</span>
        <div className="bg-white px-1.5 py-0.5 rounded border border-slate-100 flex flex-col items-center min-w-[18px] shadow-sm">
          <span>{mounted ? String(minutes).padStart(2, '0') : '00'}</span>
          <span className="text-[4px] text-slate-400 uppercase font-sans">m</span>
        </div>
        <span className="text-slate-300 self-center">:</span>
        <div className="bg-white px-1.5 py-0.5 rounded border border-slate-100 flex flex-col items-center min-w-[18px] shadow-sm">
          <span className="text-[#00BFFF] animate-pulse">
            {mounted ? String(seconds).padStart(2, '0') : '00'}
          </span>
          <span className="text-[4px] text-slate-400 uppercase font-sans">s</span>
        </div>
      </div>
    </div>
  )
}

