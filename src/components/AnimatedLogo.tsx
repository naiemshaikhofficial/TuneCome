'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

interface AnimatedLogoProps {
  className?: string
  onClick?: () => void
  isHero?: boolean
}

export function AnimatedLogo({ className = '', onClick, isHero = false }: AnimatedLogoProps) {
  return (
    <Link href="/" className={`flex items-center select-none ${className}`} onClick={onClick}>
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex items-center relative py-1"
      >
        <div className={`relative ${
          isHero ? 'w-48 h-12 sm:w-60 sm:h-16' : 'w-36 h-9 md:w-40 md:h-10'
        }`}>
          <Image
            src="/logo-cropped.png"
            alt="Tune Come Logo"
            fill
            priority
            sizes={isHero ? "(max-width: 768px) 192px, 240px" : "160px"}
            className="object-contain"
          />
        </div>
      </motion.div>
    </Link>
  )
}
