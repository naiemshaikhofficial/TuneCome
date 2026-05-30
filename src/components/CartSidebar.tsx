'use client'

import React, { useEffect, useState } from 'react'
import { useCart } from '@/context/CartContext'
import { X, ShoppingBag, Trash2, ArrowRight, Zap } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export function CartSidebar({ initialUser }: { initialUser?: any }) {
  const { items, removeItem, subtotal, discount, total, itemCount, isSidebarOpen, setSidebarOpen } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isSidebarOpen])

  if (!isSidebarOpen) return null

  const handleCheckout = () => {
    setSidebarOpen(false)
    if (!user) {
      router.push('/auth?next=/checkout')
    } else {
      router.push('/checkout')
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar - Clean Light Theme */}
      <div className="relative w-full max-w-md bg-white border-l border-slate-100 h-full flex flex-col shadow-xl animate-in slide-in-from-right duration-300 text-slate-800">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between relative z-10 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black text-white rounded-md">
              <ShoppingBag size={18} />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold uppercase tracking-widest text-slate-800">
                Your <span className="text-slate-900">Cart</span>
              </h2>
              <div className="bg-black text-white px-2 py-0.5 rounded-full text-[9px] font-bold">
                {itemCount}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 relative z-10">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 border border-slate-100 flex items-center justify-center rounded-full opacity-40 text-slate-300">
                <ShoppingBag size={28} strokeWidth={1.5} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Bundle Builder Progress */}
              {items.length < 3 ? (
                <div className="bg-slate-50 p-4 border border-slate-100 rounded-md relative overflow-hidden">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                    ⚡ Get <span className="text-black font-black">10% OFF</span> by adding <span className="text-slate-800 font-black">{3 - items.length} more</span> items!
                  </p>

                  <div className="relative h-2.5 bg-slate-200 overflow-hidden rounded-full">
                    <div 
                      className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full"
                      style={{ 
                        width: `${(items.length / 3) * 100}%`,
                        backgroundColor: '#000000'
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="bg-black/5 p-3.5 border border-black/10 rounded-md">
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-black animate-pulse" />
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-800">
                        Bundle Unlocked: <span className="font-black">10% Discount</span> Applied!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 bg-slate-50 border border-slate-100 rounded-md group hover:border-slate-200 transition-all">
                    <div className="w-16 h-16 relative border border-slate-100 rounded-sm overflow-hidden flex-shrink-0 bg-slate-200">
                      <Image src={item.cover_url || '/placeholder.jpg'} alt={item.name} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="flex-grow min-w-0 flex flex-col justify-between">
                      <div className="space-y-0.5">
                        <h3 className="font-bold uppercase tracking-tight text-xs truncate text-slate-800">{item.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-bold bg-white text-slate-400 border border-slate-100 px-1 py-0.5 rounded-sm uppercase tracking-wide">
                            {item.type}
                          </span>
                          <p className="text-xs font-bold text-slate-800">${item.price}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-600 transition-colors w-fit cursor-pointer"
                      >
                        <Trash2 size={10} />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-slate-100 space-y-4 bg-slate-50 relative z-10">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-slate-400">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-black">
                  <span>Bundle Discount (10%)</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-end pt-1.5 border-t border-slate-200/60">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Total Amount</span>
                <span className="text-2xl font-black text-slate-900">${total.toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              onClick={handleCheckout}
              className="w-full h-12 bg-slate-950 text-white font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all rounded-md cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={14} />
            </button>

            <button 
              onClick={() => setSidebarOpen(false)}
              className="w-full text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors cursor-pointer text-center"
            >
              Back to Store
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
