'use client'

import React, { useState, useEffect } from 'react'
import { Shield, Loader2, ArrowRight, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { Turnstile } from '@marsidev/react-turnstile'
import { useSearchParams, useRouter } from 'next/navigation'
import { signIn, signUp, signInWithGoogleToken, forgotPassword } from '@/app/auth/actions'

type AuthMode = 'login' | 'signup' | 'forgot'

export function AuthForm({ allowSignup = true, next: defaultNext }: { allowSignup?: boolean, next?: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const next = defaultNext || searchParams.get('next') || '/browse'
  
  const [mode, setMode] = useState<AuthMode>('login')
  const [loading, setLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [strength, setStrength] = useState(0)

  // Track Google Identity Services loading and initialization status
  const [gsiInitialized, setGsiInitialized] = useState(false)
  const googleBtnRef = React.useRef<HTMLDivElement>(null)

  // 1. Dynamically load Google GSI script & initialize once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    const GSI_SRC = 'https://accounts.google.com/gsi/client'

    const loadGsiScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if ((window as any).google?.accounts) {
          resolve()
          return
        }
        const existing = document.querySelector(`script[src="${GSI_SRC}"]`)
        if (existing) {
          if ((window as any).google?.accounts) {
            resolve()
            return
          }
          existing.addEventListener('load', () => resolve())
          existing.addEventListener('error', () => reject(new Error('GSI script failed')))
          return
        }
        const script = document.createElement('script')
        script.src = GSI_SRC
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('GSI script failed to load'))
        document.head.appendChild(script)
      })
    }

    let active = true
    loadGsiScript()
      .then(() => {
        if (!active) return
        
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        if (!clientId || !(window as any).google) return

        try {
          const google = (window as any).google
          google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse
          })
          setGsiInitialized(true)
        } catch (err) {
          console.warn('Google GSI initialization failed:', err)
        }
      })
      .catch((err) => {
        console.warn('Could not load Google GSI:', err)
      })

    return () => {
      active = false
    }
  }, []) // Empty dependency array - runs exactly once on mount

  // 2. Render the Google Sign-In button once GSI is initialized and DOM node is ready
  useEffect(() => {
    if (mode === 'forgot' || !gsiInitialized) return

    // Small delay to ensure the DOM node is fully layouted and painted
    const timer = setTimeout(() => {
      if (!googleBtnRef.current) return
      
      // Avoid duplicate rendering
      if (googleBtnRef.current.hasChildNodes()) return

      try {
        const google = (window as any).google
        google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
          shape: 'rectangular'
        })
      } catch (err) {
        console.warn('Failed to render Google Sign-In button:', err)
      }
    }, 50)

    return () => clearTimeout(timer)
  }, [mode, gsiInitialized])

  const handleCredentialResponse = async (response: any) => {
    setIsGoogleLoading(true)
    setError(null)
    try {
      const result = await signInWithGoogleToken(response.credential, next)
      if (result?.error) {
        setError(result.error)
        setIsGoogleLoading(false)
      } else if (result?.success) {
        router.refresh()
        router.push(result.redirect)
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed')
      setIsGoogleLoading(false)
    }
  }

  const checkStrength = (pass: string) => {
    let s = 0
    if (pass.length > 7) s++
    if (/[A-Z]/.test(pass)) s++
    if (/[0-9]/.test(pass)) s++
    if (/[^A-Za-z0-9]/.test(pass)) s++
    setStrength(s)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const formData = new FormData(event.currentTarget)
    formData.append('next', next)

    if (mode === 'signup') {
      const pass = formData.get('password') as string
      const confirm = formData.get('confirmPassword') as string
      if (pass !== confirm) {
        setError("Passwords do not match")
        setLoading(false)
        return
      }
    }
    
    let result;
    if (mode === 'login') result = await signIn(formData)
    else if (mode === 'signup') result = await signUp(formData)
    else result = await forgotPassword(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result && 'success' in result) {
      setMessage((result as any).success)
      if ((result as any).redirect) {
        router.refresh()
        router.push((result as any).redirect)
      } else {
        setLoading(false)
      }
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Social Login Button */}
      {mode !== 'forgot' && (
        <>
          <div className="w-full flex justify-center py-1 min-h-[44px]">
            {!gsiInitialized ? (
              <div className="w-[320px] h-11 bg-white border border-slate-200 rounded-md flex items-center justify-center gap-3 animate-pulse">
                <Loader2 className="animate-spin text-slate-400" size={16} />
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Loading Google Auth...</span>
              </div>
            ) : (
              <div ref={googleBtnRef} className="w-[320px] h-11 flex justify-center" />
            )}
          </div>

          <div className="relative flex items-center justify-center py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <span className="relative bg-white px-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">OR</span>
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-md border border-red-100 text-center uppercase tracking-tight">
            {error}
          </div>
        )}
        
        {message && (
          <div className="p-3 bg-slate-50 text-slate-700 text-xs font-semibold rounded-md border border-slate-100 text-center uppercase tracking-tight">
            {message}
          </div>
        )}

        <div className="space-y-3">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input 
                  name="fullName"
                  type="text" 
                  required
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-md pl-11 pr-4 text-xs focus:border-black focus:bg-white outline-none transition-all text-slate-900 font-bold uppercase tracking-wide"
                  placeholder="NAME"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                name="email"
                type="email" 
                required
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-md pl-11 pr-4 text-xs focus:border-black focus:bg-white outline-none transition-all text-slate-900 font-bold lowercase"
                placeholder="email@example.com"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                {mode === 'login' && (
                  <button 
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[9px] font-black uppercase tracking-widest text-black hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input 
                  name="password"
                  type={showPassword ? 'text' : 'password'} 
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    checkStrength(e.target.value)
                  }}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-md pl-11 pr-11 text-xs focus:border-black focus:bg-white outline-none transition-all text-slate-900 font-bold"
                  placeholder="PASSWORD"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              
              {mode === 'signup' && password.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div 
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                          strength >= level 
                            ? strength <= 2 ? 'bg-red-400' : strength === 3 ? 'bg-yellow-400' : 'bg-black'
                            : 'bg-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input 
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'} 
                  required
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-md pl-11 pr-11 text-xs focus:border-black focus:bg-white outline-none transition-all text-slate-900 font-bold"
                  placeholder="REPEAT PASSWORD"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div className="flex items-center gap-2 pt-2 opacity-60 hover:opacity-100 transition-opacity duration-200">
              <input 
                id="signup-newsletter"
                name="newsletter"
                type="checkbox" 
                defaultChecked
                className="w-3.5 h-3.5 rounded bg-transparent border border-slate-200 text-slate-900 focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer"
              />
              <label htmlFor="signup-newsletter" className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed cursor-pointer select-none">
                Email me with news and offers
              </label>
            </div>
          )}
        </div>

        <div className="flex justify-center py-2">
          <Turnstile 
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!} 
            options={{ theme: 'light' }}
          />
        </div>

        <button 
          type="submit"
          disabled={loading || isGoogleLoading}
          className="w-full h-11 bg-slate-950 text-white font-bold rounded-md text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 cursor-pointer uppercase tracking-widest"
        >
          {loading ? (
            <Loader2 className="animate-spin text-white" size={16} />
          ) : (
            <>
              {mode === 'login' && 'Sign In'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'forgot' && 'Send Reset Link'}
              <ArrowRight size={14} />
            </>
          )}
        </button>

        {allowSignup && (
          <div className="flex flex-col gap-2 pt-2">
            <button 
              type="button"
              onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
              className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
            >
              {mode === 'signup' ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
