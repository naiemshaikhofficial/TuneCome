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
      {/* Elegant Dot-Matrix Tech Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(rgba(0, 0, 0, 0.025) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Very Soft Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/30" />
    </div>
  )
}
