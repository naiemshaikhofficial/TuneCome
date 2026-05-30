'use client'

import React from 'react'
import Link from 'next/link'
import { AnimatedLogo } from '@/components/AnimatedLogo'
import { Instagram, Youtube, Facebook, Send } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative bg-white border-t border-slate-200 pt-12 pb-10 overflow-hidden font-sans">
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        
        {/* Help Center / FAQ Callout Section (Splice Style) */}
        <div className="mb-12 pb-10 border-b border-slate-100">
          <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2">
            Can&apos;t find your answer here?
          </h3>
          <p className="text-xs md:text-sm text-slate-500">
            Check out our{' '}
            <Link href="/faq" className="text-slate-950 font-medium underline hover:text-black transition-colors duration-150">
              Help Center
            </Link>
            ,{' '}
            <Link href="/faq" className="text-slate-950 font-medium underline hover:text-black transition-colors duration-150">
              Licensing FAQ
            </Link>
            , or{' '}
            <Link href="/contact" className="text-slate-950 font-medium underline hover:text-black transition-colors duration-150">
              Contact Us
            </Link>{' '}
            for more information.
          </p>
        </div>

        {/* Multi-Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          {/* Brand & Logo Column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <AnimatedLogo className="opacity-95 hover:opacity-100 transition-all duration-300" />
            <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest leading-relaxed max-w-xs">
              Premium sound design for the modern producer.
            </p>
          </div>

          {/* Sounds Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Sounds</h4>
            <ul className="space-y-2 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
              <li>
                <Link href="/browse/sounds" className="hover:text-black transition-colors duration-200">
                  Browse Sounds
                </Link>
              </li>
              <li>
                <Link href="/browse?category=Melodic" className="hover:text-black transition-colors duration-200">
                  Melodic Loops
                </Link>
              </li>
              <li>
                <Link href="/browse?category=Vocals" className="hover:text-black transition-colors duration-200">
                  Indian Vocals
                </Link>
              </li>
              <li>
                <Link href="/browse?category=Percussion" className="hover:text-black transition-colors duration-200">
                  Percussion
                </Link>
              </li>
              <li>
                <Link href="/browse?category=Cinematic" className="hover:text-black transition-colors duration-200">
                  Cinematic
                </Link>
              </li>
              <li>
                <Link href="/browse?category=Bollywood" className="hover:text-black transition-colors duration-200">
                  Bollywood
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Navigation</h4>
            <ul className="space-y-2 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
              <li>
                <Link href="/browse/sounds" className="hover:text-black transition-colors duration-200">
                  All Sounds
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-black transition-colors duration-200">
                  Production Blog
                </Link>
              </li>
              <li>
                <Link href="/library" className="hover:text-black transition-colors duration-200">
                  Your Library
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-black transition-colors duration-200">
                  Sell Your Samples
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Company</h4>
            <ul className="space-y-2 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
              <li>
                <Link href="/about" className="hover:text-black transition-colors duration-200">
                  About TuneCome
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-black transition-colors duration-200">
                  Careers
                </Link>
              </li>
              <li>
                <span className="text-[10px] bg-slate-100 text-slate-650 px-2 py-0.5 rounded font-bold">
                  100% Royalty-Free
                </span>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Support</h4>
            <ul className="space-y-2 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
              <li>
                <Link href="/faq" className="hover:text-black transition-colors duration-200">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-black transition-colors duration-200">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-black transition-colors duration-200">
                  Refund & Cancellation
                </Link>
              </li>
              <li>
                <Link href="/dmca" className="hover:text-black transition-colors duration-200">
                  DMCA Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section: Copyright, Legal Links, Social Media */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Copyright & Legal */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <p className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider">
              © {new Date().getFullYear()} TuneCome. All Rights Reserved
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <Link href="/terms" className="hover:text-slate-800 transition-colors duration-150">
                Terms of Use
              </Link>
              <Link href="/privacy" className="hover:text-slate-800 transition-colors duration-150">
                Privacy Policy
              </Link>
              <Link href="/refund-policy" className="hover:text-slate-800 transition-colors duration-150">
                Refund Policy
              </Link>
            </div>
          </div>

          {/* Right: Minimalist Social Icons */}
          <div className="flex items-center gap-5 text-slate-400">
            <a
              href="https://youtube.com/@tunecome"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors duration-150"
              title="YouTube"
            >
              <Youtube className="w-5 h-5" strokeWidth={2} />
            </a>
            <a
              href="https://instagram.com/tunecome"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors duration-150"
              title="Instagram"
            >
              <Instagram className="w-5 h-5" strokeWidth={2} />
            </a>
            <a
              href="https://facebook.com/tunecome"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors duration-150"
              title="Facebook"
            >
              <Facebook className="w-5 h-5" strokeWidth={2} />
            </a>
            <a
              href="https://t.me/tunecome"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors duration-150"
              title="Telegram"
            >
              <Send className="w-5 h-5" strokeWidth={2} />
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}
