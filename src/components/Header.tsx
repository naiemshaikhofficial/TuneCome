'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Menu, X, ChevronRight, Search, ArrowRight } from 'lucide-react'
import { HeaderCartIcon } from './HeaderCartIcon'
import { LogoutButton } from './LogoutButton'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedLogo } from './AnimatedLogo'
import { useAuth } from '@/context/AuthContext'
import { getSearchSuggestions } from '@/app/browse/actions'

function HeaderSearch({ onSearchClose }: { onSearchClose?: () => void }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true)
        const results = await getSearchSuggestions(query)
        setSuggestions(results)
        setIsOpen(true)
        setIsLoading(false)
      } else {
        setSuggestions([])
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSearch = React.useCallback((e?: React.FormEvent) => {
    e?.preventDefault()
    if (query.trim()) {
      setIsOpen(false)
      if (onSearchClose) onSearchClose()
      router.push(`/browse?q=${encodeURIComponent(query.trim())}`)
    }
  }, [query, router, onSearchClose])

  const [placeholderText, setPlaceholderText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)
  const [typingSpeed, setTypingSpeed] = useState(150)

  const words = ['TRAP SAMPLES', 'HIP HOP LOOPS', 'DRILL KITS', 'LO-FI MELODIES', 'PRESETS']

  useEffect(() => {
    let timer: NodeJS.Timeout

    const handleType = () => {
      const i = loopNum % words.length
      const fullTxt = `SEARCH ${words[i]}...`

      if (isDeleting) {
        setPlaceholderText(fullTxt.substring(0, placeholderText.length - 1))
        setTypingSpeed(45)
      } else {
        setPlaceholderText(fullTxt.substring(0, placeholderText.length + 1))
        setTypingSpeed(90)
      }

      if (!isDeleting && placeholderText === fullTxt) {
        timer = setTimeout(() => setIsDeleting(true), 2500)
      } else if (isDeleting && placeholderText === '') {
        setIsDeleting(false)
        setLoopNum(loopNum + 1)
        setTypingSpeed(250)
      } else {
        timer = setTimeout(handleType, typingSpeed)
      }
    }

    timer = setTimeout(handleType, typingSpeed)
    return () => clearTimeout(timer)
  }, [placeholderText, isDeleting, loopNum, typingSpeed])

  return (
    <div ref={searchRef} className="relative w-full md:max-w-[260px] z-50">
      <motion.form 
        onSubmit={handleSearch} 
        whileHover={{ y: -0.5 }}
        className="relative border border-slate-200/60 bg-slate-50 hover:bg-slate-100/50 hover:border-slate-300 focus-within:border-slate-400 focus-within:bg-white rounded-full transition-all duration-250 overflow-hidden h-9 flex items-center px-4"
      >
        <div className="text-slate-400 mr-2 shrink-0 flex items-center justify-center">
          <Search size={13} strokeWidth={2.5} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholderText}
          className="w-full h-5 bg-transparent text-[10px] font-semibold uppercase tracking-wider focus:outline-none placeholder:text-slate-400 text-slate-800 self-center leading-none"
        />
        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setSuggestions([]); }}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </motion.form>

      {/* Suggestions Dropdown */}
      {isOpen && (suggestions.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200/80 shadow-2xl rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 w-full md:w-[290px]">
          {isLoading ? (
            <div className="p-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 animate-pulse">Searching Signal...</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {suggestions.map((pack) => (
                <Link
                  key={pack.id}
                  href={`/packs/${pack.slug}`}
                  onClick={() => {
                    setIsOpen(false)
                    if (onSearchClose) onSearchClose()
                  }}
                  className="flex items-center gap-3 p-2 hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-8 h-8 relative flex-shrink-0 border border-slate-100 rounded-md overflow-hidden">
                    <Image
                      src={pack.cover_url || '/placeholder.jpg'}
                      alt={pack.name}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-[10px] font-bold uppercase text-slate-800 truncate group-hover:text-black transition-colors">
                      {pack.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] text-slate-450 line-through font-bold">
                        ${pack.price_usd ? (Number(pack.price_usd) * 3).toFixed(2) : '59.99'}
                      </span>
                      <p className="text-[10px] font-bold text-studio-yellow uppercase tracking-widest leading-none">
                        ${pack.price_usd || '19.99'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={10} className="text-slate-300 group-hover:text-black -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                </Link>
              ))}
              <button
                onClick={handleSearch}
                className="w-full p-2.5 bg-slate-50 text-[8px] font-bold uppercase tracking-widest text-slate-550 hover:text-black text-left border-t border-slate-100"
              >
                View all results for "{query}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function Header() {
  const { user, isArtist } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const dashboardUrl = process.env.NODE_ENV === 'production'
    ? 'https://dashboard.sampleswala.com'
    : 'http://dashboard.localhost:3000';

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  useEffect(() => {
    if (isMenuOpen) {
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    } else {
      document.documentElement.style.overflow = 'unset'
      document.body.style.overflow = 'unset'
      document.body.style.touchAction = 'unset'
    }
    return () => {
      document.documentElement.style.overflow = 'unset'
      document.body.style.overflow = 'unset'
      document.body.style.touchAction = 'unset'
    }
  }, [isMenuOpen])

  const NavLinks = () => (
    <>
      <Link href="/browse/sounds" onClick={() => setIsMenuOpen(false)} className="hover:text-slate-900 transition-colors tracking-[0.12em]">Sounds</Link>
      <Link href="/browse/presets" onClick={() => setIsMenuOpen(false)} className="hover:text-slate-900 transition-colors tracking-[0.12em]">Presets</Link>
      <Link href="/library" onClick={() => setIsMenuOpen(false)} className="hover:text-slate-900 transition-colors tracking-[0.12em]">Library</Link>

      {isArtist && (
        <a
          href={dashboardUrl}
          className="px-3 py-1 bg-slate-900 text-white font-bold tracking-widest text-[9px] hover:bg-slate-800 transition-colors rounded-sm"
        >
          DASHBOARD
        </a>
      )}

      <div className="flex items-center gap-4 text-slate-700 ml-2">
        <HeaderCartIcon />
        {user ? (
          <LogoutButton />
        ) : (
          <Link
            href="/auth"
            onClick={() => setIsMenuOpen(false)}
            className="px-3.5 py-1.5 border border-slate-200 hover:border-slate-800 text-slate-800 font-bold hover:bg-slate-50 transition-all rounded-full text-[9px] uppercase tracking-wider"
          >
            Sign In
          </Link>
        )}
      </div>
    </>
  )

  return (
    <header className={`${isMenuOpen ? 'fixed top-0' : 'sticky top-0'} z-[100] h-16 border-b border-slate-100 ${isMenuOpen ? 'bg-white' : 'bg-white/80 backdrop-blur-md'} transition-all flex items-center w-full`}>
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between w-full h-full relative z-[110]">
        <AnimatedLogo onClick={() => setIsMenuOpen(false)} />

        {/* Global Search Bar (Desktop) */}
        <div className="hidden md:block flex-grow max-w-[200px] lg:max-w-[260px] mx-6">
          <HeaderSearch />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[9px] font-bold uppercase tracking-widest text-slate-500">
          <NavLinks />
        </nav>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-3">
          {!user && (
            <Link
              href="/auth"
              className="px-3 py-1.5 border border-slate-200 bg-white text-slate-800 text-[9px] font-bold uppercase tracking-wider rounded-full hover:bg-slate-50 transition-all"
            >
              Sign In
            </Link>
          )}
          <HeaderCartIcon />
          <button
            onClick={toggleMenu}
            className="w-8 h-8 flex flex-col items-center justify-center gap-1 border border-slate-200/80 bg-slate-50 rounded-full transition-all group overflow-hidden cursor-pointer"
          >
            <motion.div
              animate={isMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
              className="w-4 h-0.5 bg-slate-800 rounded-full origin-center"
            />
            <motion.div
              animate={isMenuOpen ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }}
              className="w-4 h-0.5 bg-slate-800 rounded-full"
            />
            <motion.div
              animate={isMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
              className="w-4 h-0.5 bg-slate-800 rounded-full origin-center"
            />
          </button>
        </div>
      </div>


      {/* Mobile Menu Overlay - Framer Motion */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute top-full left-0 right-0 h-[calc(100dvh-4rem)] bg-white z-[100] flex flex-col p-6 md:p-8 space-y-6 overflow-y-auto border-t border-slate-100"
          >
            {/* Elegant Tech Dots */}
            <div 
              className="absolute inset-0 opacity-[0.015] pointer-events-none" 
              style={{
                backgroundImage: `radial-gradient(#000000 1px, transparent 1px)`,
                backgroundSize: '16px 16px'
              }}
            />

            {/* Mobile Search Bar */}
            <div className="w-full relative z-20">
              <HeaderSearch onSearchClose={() => setIsMenuOpen(false)} />
            </div>

            <nav className="flex flex-col space-y-3 text-lg font-bold uppercase tracking-wider relative z-10">
              {[
                { name: 'Sounds', href: '/browse/sounds' },
                { name: 'Producer Presets', href: '/browse/presets' },
                { name: 'Your Library', href: '/library' },
                ...(isArtist ? [{ name: 'ARTIST DASHBOARD', href: dashboardUrl }] : []),
                { name: 'Production Blog', href: '/blog' },
                { name: 'About Us', href: '/about' },
                { name: 'Help Center', href: '/help' },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`group flex items-center justify-between p-3 border border-slate-100 rounded-md hover:border-slate-900 transition-all ${link.name === 'ARTIST DASHBOARD'
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                    }`}
                >
                  <span>{link.name}</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1.5 transition-transform text-slate-400" />
                </a>
              ))}

              <div className="pt-4">
                {user ? (
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-md flex flex-col gap-4 italic shadow-xs">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Account</span>
                      <p className="text-xs text-slate-800 truncate font-bold not-italic">{user.email}</p>
                    </div>
                    <LogoutButton />
                  </div>
                ) : (
                  <Link
                    href="/auth"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full h-12 bg-slate-900 text-white flex items-center justify-center text-sm font-bold tracking-widest border border-slate-900 rounded-md hover:bg-slate-800 transition-all"
                  >
                    SIGN IN NOW
                  </Link>
                )}
              </div>
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-100 text-center">
              <p className="text-[9px] font-bold text-slate-350 uppercase tracking-[0.4em]">TUNECOME :: CREATIVE 2026</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
