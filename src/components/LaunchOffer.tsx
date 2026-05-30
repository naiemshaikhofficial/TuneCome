'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export function LaunchOffer() {
  return (
    <div className="relative overflow-hidden h-9 flex items-center bg-[#000000] border-b border-[#1a1a1a] z-[50]">
      {/* Animated subtle glow overlay */}
      <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-white via-transparent to-white" />

      {/* Animated Marquee */}
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: 20,
          ease: "linear",
          repeat: Infinity
        }}
        style={{ willChange: 'transform' }}
        className="flex whitespace-nowrap items-center relative z-10"
      >
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-8 px-4">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-white flex items-center gap-3">
              <Zap size={13} fill="white" className="text-white" />
              
              LAUNCH OFFER: GET <span className="bg-white/20 px-2 py-0.5 rounded-sm font-extrabold">ANY SAMPLE PACK</span> AT ONLY 
              <span className="bg-white text-[#000000] px-2 py-0.5 rounded-sm font-extrabold">$9.99</span> 
              FOR A LIMITED TIME!

              <Zap size={13} fill="white" className="text-white" />
            </span>
            <div className="h-1 w-1 bg-white/50 rounded-full mx-4" />
          </div>
        ))}
      </motion.div>
    </div>
  )
}
