'use client'

import { useEffect, useState } from 'react'

export function BackgroundMural() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none bg-white">
      {/* Soft Ambient Light Highlights (Vibrant Blue & Sky Blue) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none blur-[140px]">
        {/* Soft Vibrant Blue glow in the top-left */}
        <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] bg-[#0052ff] rounded-full animate-pulse" />
        
        {/* Soft sky blue glow in the bottom-right */}
        <div className="absolute bottom-[-15%] right-[-15%] w-[65%] h-[65%] bg-[#00BFFF] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Elegant Dot-Matrix Tech Grid Overlay (High-end Producer Aesthetic) */}
      <div 
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Very Soft Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/30" />
    </div>
  )
}
