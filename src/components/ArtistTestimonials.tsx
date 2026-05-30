'use client'
import React from 'react'
import Image from 'next/image'
import { Star, Music, ShieldCheck, Youtube, Instagram } from 'lucide-react'
import Link from 'next/link'
import TrustedBy from './TrustedBy'

const testimonials = [
  {
    name: "Sohan Beatz",
    role: "Music Producer",
    image: "/Sohan.jpeg",
    pack: "THE SOUTH",
    quote: "Just picked up 'The South' pack and I'm really impressed. The authenticity of the percussion adds so much energy to my beats. It's a must-have for anyone producing Indian hip-hop.",
    youtube: "https://www.youtube.com/@sohanbeatz",
    instagram: "https://www.instagram.com/sohanbeatz/"
  },
  {
    name: "Abhi Bright",
    role: "Singer / Producer",
    image: "/abhi-bright.jpg",
    pack: "THE SOUTH",
    quote: "Honestly, 'THE SOUTH' pack is a complete vibe. Those tapori rhythms and South Indian elements were exactly what my latest track needed. SamplesWala is definitely the real deal.",
    youtube: "https://www.youtube.com/@abhibright",
    instagram: "https://www.instagram.com/abhibright/"
  },
  {
    name: "Deepak Poojary",
    role: "DJ",
    image: "/deepak-poojary.jpg",
    pack: "THE SOUTH",
    quote: "Finding authentic South Indian samples that actually work in a club setting used to be a struggle. This pack changed everything for me. The percussion is so crisp and hard-hitting.",
    instagram: "https://www.instagram.com/deepak_poojary._/"

  },
  {
    name: "Python",
    role: "Producer",
    image: "/python-artist.jpg",
    pack: "THE BOLLYWOOD",
    quote: "SamplesWala's Bollywood pack is basically the gold standard. The melodies and percussion feel so authentic, they bring that cinematic feel to my tracks instantly. Great stuff.",
    instagram: "https://www.instagram.com/mix_with_python/"
  },
  {
    name: "David Gifson",
    role: "Producer",
    image: "/david-gifson.jpg",
    pack: "SAMBALPUR RHYTHM",
    quote: "Finding authentic Odia and Sambalpuri folk elements of this quality is nearly impossible. The rhythms and percussions in this pack are incredibly rich and pristine. They give an organic energy to my production.",
    instagram: "https://www.instagram.com/davidgifson/"
  }
]

export function ArtistTestimonials() {
  return (
    <section className="pt-24 pb-20 bg-slate-50/50 border-t border-slate-100 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4 relative">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-slate-900 break-words">
            ARTIST REVIEWS
          </h2>
          <div className="h-[2px] bg-studio-yellow w-12 mx-auto" />
        </div>

        <div className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 overflow-x-auto md:overflow-x-visible pb-8 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-auto max-w-7xl">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[80vw] sm:w-[45vw] md:w-auto snap-center bg-white border border-slate-200 p-6 md:p-8 shadow-sm hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between rounded-lg"
            >
              {/* Decorative Background Icon */}
              <div className="absolute -right-4 -bottom-4 opacity-[0.02] text-slate-900 pointer-events-none">
                <Music size={120} />
              </div>

              <div>
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-12 h-12 md:w-14 md:h-14 relative border border-slate-200 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={t.image}
                      alt={t.name}
                      fill
                      sizes="(max-width: 768px) 48px, 64px"
                      className="object-cover transition-all duration-550"
                    />
                  </div>
                  <div>
                    <p className="text-base md:text-lg font-bold text-slate-900 uppercase italic tracking-tight leading-tight">{t.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-[8px] text-studio-neon font-black uppercase tracking-[0.2em]">{t.role}</p>
                      <div className="flex items-center gap-2">
                        {t.youtube && (
                          <Link href={t.youtube} target="_blank" className="text-slate-400 hover:text-[#FF0000] transition-colors">
                            <Youtube size={12} />
                          </Link>
                        )}
                        {t.instagram && (
                          <Link href={t.instagram} target="_blank" className="text-slate-400 hover:text-[#E1306C] transition-colors">
                            <Instagram size={12} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1 mb-6 relative z-10">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={13} className="fill-[#ffb800] text-[#ffb800]" />
                  ))}
                </div>

                <p className="text-[11px] md:text-xs font-bold uppercase leading-relaxed text-slate-500 tracking-wider relative z-10 italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2 text-studio-neon">
                  <ShieldCheck size={14} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Verified Buyer</span>
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.pack}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
      <div className="mt-20 md:mt-32">
        <TrustedBy />
      </div>
    </section>
  )
}
