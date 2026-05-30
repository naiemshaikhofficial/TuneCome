'use client'
import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'

interface PaymentButtonProps {
  packId: string
  packName: string
  price: number
  slug: string
  cover_url: string
  userId?: string
  type?: 'pack' | 'preset'
  label?: string
}

export function PaymentButton({ packId, packName, price, slug, cover_url, userId, type = 'pack', label }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { addItem, items, setSidebarOpen } = useCart()

  const handleBuyNow = async () => {
    setLoading(true)
    setSidebarOpen(false) // Close sidebar if it's open
    
    // 1. Add to cart if not already there
    const isAlreadyInCart = items.some(i => i.id === packId)
    if (!isAlreadyInCart) {
      addItem({
        id: packId,
        name: packName,
        price: price,
        slug: slug,
        cover_url: cover_url,
        type: type
      })
    }

    // 2. Redirect directly to checkout
    router.push('/checkout')
  }

  return (
    <button 
      disabled={loading}
      onClick={handleBuyNow}
      className="w-full h-14 bg-[#000000] text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-3 hover:bg-[#1a1a1a] transition-all disabled:opacity-50 rounded-lg shadow-sm"
    >
      {loading ? (
        <Loader2 className="animate-spin" size={20} />
      ) : (
        <>
          <CreditCard size={20} />
          <span>{label || `BUY NOW — $${price}`}</span>
        </>
      )}
    </button>
  )
}
