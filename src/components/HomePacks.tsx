'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { getOptimizedImageUrl } from '@/lib/images'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getPackPriceDetails } from '@/lib/pricing'
import { ShoppingBag, Zap, Clock } from 'lucide-react'

export function HomePacks({ packs }: { packs: any[] }) {
  const { addItem } = useCart()
  const router = useRouter()
  const [addedPackId, setAddedPackId] = React.useState<string | null>(null)

  const handleAddToCart = (pack: any, currentPrice: number) => {
    addItem({
      id: pack.id,
      name: pack.name,
      price: currentPrice,
      slug: pack.slug,
      cover_url: pack.cover_url || undefined,
      type: 'pack',
      is_downloadable: pack.is_downloadable
    })
    setAddedPackId(pack.id)
    setTimeout(() => setAddedPackId(null), 1200)
  }

  const handleBuyNow = (pack: any, currentPrice: number) => {
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
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  } as const

  const item = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 250, damping: 18 } }
  } as const

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-10"
    >
      {packs.map((pack: any) => {
        // Calculate dynamic pricing and pre-order state
        const priceDetails = getPackPriceDetails(pack)
        const currentPrice = priceDetails.priceInr
        const isPreorderActive = priceDetails.isPreorderActive
        const isExpired = priceDetails.isExpired

        return (
          <motion.div
            key={pack.id}
            variants={item}
            className="group flex flex-col justify-between h-full space-y-3 text-slate-800"
          >
            <Link
              href={`/packs/${pack.slug}`}
              prefetch={false}
              className="comic-panel aspect-square block border border-slate-200 bg-[#f8fafc] rounded-lg overflow-hidden relative transition-all group-hover:border-slate-900 hover:shadow-md"
            >
              <Image
                src={getOptimizedImageUrl(pack.cover_url, 600, 80)}
                alt={`${pack.name} - Sample Pack & Loops | TuneCome`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

              {!pack.is_downloadable && (
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-800 z-10">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-black">
                    {isExpired ? 'Regular' : 'Pre-order Offer'}
                  </span>
                </div>
              )}
            </Link>

            <div className="flex flex-col flex-grow justify-between px-1">
              <div className="space-y-1">
                <Link href={`/packs/${pack.slug}`} prefetch={false}>
                  <h3 className="text-xs font-bold uppercase truncate hover:text-studio-yellow transition-colors tracking-tight text-slate-900">
                    {pack.name}
                  </h3>
                </Link>
                <div className="flex flex-col gap-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {pack.categories?.name || 'Sound Kits'}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-slate-400 line-through font-bold">
                        ${(pack.mrp_inr || (currentPrice * 3)).toFixed(2)}
                      </span>
                      <p className="text-sm font-black text-slate-900 leading-none">
                        ${currentPrice.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-0.5">
                      <div className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-sm">
                        <span className="text-[8px] font-bold text-slate-700 uppercase italic">
                          {Math.round((1 - (currentPrice / (pack.mrp_inr || (currentPrice * 3)))) * 100)}% OFF
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {!pack.is_downloadable && isPreorderActive ? (
                  <PackCountdown pack={pack} />
                ) : (
                  <div className="flex items-center gap-1.5 mt-2 px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-700 text-[8px] font-bold uppercase tracking-wider rounded-md w-fit">
                    <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                    <span className="text-[8px] font-bold tracking-widest text-slate-600">
                      {isExpired ? 'In Stock' : 'Premium Release'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-row gap-2 pt-3 mt-auto relative">
                <AnimatePresence>
                  {addedPackId === pack.id && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="absolute -top-10 left-0 right-0 z-50 flex justify-center pointer-events-none"
                    >
                      <div className="bg-black text-white px-3 py-1.5 rounded-md font-bold text-[9px] uppercase tracking-wider shadow-sm relative">
                        {isPreorderActive ? 'Reserved!' : 'Added!'}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={() => handleAddToCart(pack, currentPrice)}
                  className="flex-1 h-9 bg-white text-slate-800 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 hover:border-slate-350 transition-all border border-slate-200 rounded-md flex items-center justify-center gap-1.5 cursor-pointer"
                  title={isPreorderActive ? "Pre-order" : "Add to Cart"}
                >
                  <ShoppingBag size={12} className="text-slate-500" />
                  {isPreorderActive ? 'Pre' : 'Cart'}
                </button>
                <button
                  onClick={() => handleBuyNow(pack, currentPrice)}
                  className="flex-1 h-9 bg-black text-white text-[10px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-all rounded-md cursor-pointer"
                >
                  {isPreorderActive ? 'Pre' : 'Get'}
                </button>
              </div>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
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
    <div className="mt-2 p-1.5 rounded-md border border-black bg-slate-50 flex items-center justify-between gap-1 text-slate-800">
      <div className="flex items-center gap-1">
        <Clock size={11} className="text-black animate-pulse" />
        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-450">Ends:</span>
      </div>
      <div className="flex gap-0.5 font-mono text-[9px] font-bold">
        <div className="bg-white px-1 py-0.5 rounded-sm border border-slate-200 flex flex-col items-center min-w-[18px]">
          <span>{mounted ? String(days).padStart(2, '0') : '00'}</span>
        </div>
        <span className="text-slate-400 self-center">:</span>
        <div className="bg-white px-1 py-0.5 rounded-sm border border-slate-200 flex flex-col items-center min-w-[18px]">
          <span>{mounted ? String(hours).padStart(2, '0') : '00'}</span>
        </div>
        <span className="text-slate-400 self-center">:</span>
        <div className="bg-white px-1 py-0.5 rounded-sm border border-slate-200 flex flex-col items-center min-w-[18px]">
          <span>{mounted ? String(minutes).padStart(2, '0') : '00'}</span>
        </div>
        <span className="text-slate-400 self-center">:</span>
        <div className="bg-white px-1 py-0.5 rounded-sm border border-slate-200 flex flex-col items-center min-w-[18px]">
          <span className="text-black">
            {mounted ? String(seconds).padStart(2, '0') : '00'}
          </span>
        </div>
      </div>
    </div>
  )
}
