'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { getOptimizedImageUrl } from '@/lib/images'
import { ShoppingBag } from 'lucide-react'

interface PresetCardProps {
  preset: {
    id: string
    name: string
    slug: string
    type: string
    daws: string[]
    youtube_url?: string
    drive_url: string
    price_inr: number
    cover_url?: string
    mrp_inr?: number
  }
  priority?: boolean
}

export function PresetCard({ preset, priority = false }: PresetCardProps) {
  const { addItem } = useCart()
  const router = useRouter()
  const [isAdded, setIsAdded] = useState(false)

  const handleAddToCart = () => {
    addItem({
      id: preset.id,
      name: preset.name,
      price: Number(preset.price_inr),
      slug: preset.slug,
      cover_url: preset.cover_url || undefined,
      type: 'preset'
    })
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1200)
  }

  const handleBuyNow = () => {
    addItem({
      id: preset.id,
      name: preset.name,
      price: Number(preset.price_inr),
      slug: preset.slug,
      cover_url: preset.cover_url || undefined,
      type: 'preset'
    })
    router.push('/checkout')
  }

  const item = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 250, damping: 18 } }
  } as const

  return (
    <motion.div
      variants={item}
      initial={priority ? "show" : "hidden"}
      animate={priority ? "show" : undefined}
      whileInView={priority ? undefined : "show"}
      viewport={priority ? undefined : { once: true }}
      className="group flex flex-col space-y-3"
    >
      <Link
        href={`/browse/presets/${preset.slug}`}
        prefetch={false}
        className="comic-panel aspect-square block border border-slate-200 bg-[#f8fafc] rounded-lg overflow-hidden relative transition-all group-hover:border-slate-900 hover:shadow-md"
      >
        <Image
          src={getOptimizedImageUrl(preset.cover_url || '/placeholder.jpg', 600, 80)}
          alt={`${preset.name} - ${preset.type} Preset | TuneCome`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority={priority}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Type Badge */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-slate-200">
          <span className="text-[8px] font-bold uppercase tracking-widest text-black">{preset.type || 'Preset'}</span>
        </div>
      </Link>

      <div className="space-y-3 px-1 text-slate-800">
        <div className="space-y-1">
          <Link href={`/browse/presets/${preset.slug}`} prefetch={false}>
            <h3 className="text-xs font-bold uppercase truncate hover:text-black transition-colors tracking-tight text-slate-900">
              {preset.name}
            </h3>
          </Link>
          <div className="flex flex-col gap-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              {preset.daws?.join(' & ') || 'Universal'}
            </p>
            
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <span className="text-[8px] text-slate-400 line-through font-bold">
                  ${(preset.mrp_inr || (Number(preset.price_inr) * 3)).toFixed(2)}
                </span>
                <p className="text-sm font-black text-slate-900 leading-none">
                  ${preset.price_inr.toFixed(2)}
                </p>
              </div>
              
              {/* Discount Badge */}
              <div className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-sm">
                <span className="text-[8px] font-bold text-slate-700 uppercase italic">
                  {Math.round((1 - (Number(preset.price_inr) / (preset.mrp_inr || (Number(preset.price_inr) * 3)))) * 100)}% OFF
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-2 pt-1.5 relative">
          <AnimatePresence>
            {isAdded && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="absolute -top-10 left-0 right-0 z-50 flex justify-center pointer-events-none"
              >
                <div className="bg-black text-white px-3 py-1.5 rounded-md font-bold text-[9px] uppercase tracking-wider shadow-sm relative">
                  Added!
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleAddToCart}
            className="flex-1 h-9 bg-white text-slate-800 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 hover:border-slate-350 transition-all border border-slate-200 rounded-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag size={12} className="text-slate-500" />
            Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 h-9 bg-black text-white text-[10px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-all rounded-md cursor-pointer"
          >
            Get
          </button>
        </div>
      </div>
    </motion.div>
  )
}
