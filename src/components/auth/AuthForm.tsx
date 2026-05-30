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

  // 1. Dynamically load Google GSI script & initialize on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    const GSI_SRC = 'https://accounts.google.com/gsi/client'

    const loadGsiScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Already loaded
        if ((window as any).google?.accounts) {
          resolve()
          return
        }
        // Script tag already in DOM, wait for it
        const existing = document.querySelector(`script[src="${GSI_SRC}"]`)
        if (existing) {
          existing.addEventListener('load', () => resolve())
          existing.addEventListener('error', () => reject(new Error('GSI script failed')))
          // If already loaded
          if ((window as any).google?.accounts) resolve()
          return
        }
        // Inject script
        const script = document.createElement('script')
        script.src = GSI_SRC
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('GSI script failed to load'))
        document.head.appendChild(script)
      })
    }

    loadGsiScript()
      .then(() => {
        initGoogleOneTap()
      })
      .catch((err) => {
        console.warn('Could not load Google GSI:', err)
      })
  }, [mode])

  const initGoogleOneTap = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId || !(window as any).google) return

    try {
      const google = (window as any).google
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        cancel_on_tap_outside: true
      })
      // Trigger subtle prompt silently in background
      google.accounts.id.prompt()
    } catch (err) {
      console.warn('Google One Tap init failed', err)
    }
  }

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

  const handleGoogleLoginExplicit = async () => {
    setError(null)
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) {
      setError('Google Client ID is missing. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to environment variables.')
      return
    }

    // Dynamically load Google script if not yet available
    if (!(window as any).google?.accounts) {
      setIsGoogleLoading(true)
      try {
        const GSI_SRC = 'https://accounts.google.com/gsi/client'
        await new Promise<void>((resolve, reject) => {
          if ((window as any).google?.accounts) { resolve(); return }
          const existing = document.querySelector(`script[src="${GSI_SRC}"]`) as HTMLScriptElement
          if (existing) {
            if ((window as any).google?.accounts) { resolve(); return }
            existing.addEventListener('load', () => resolve())
            existing.addEventListener('error', () => reject())
            // Timeout safety
            setTimeout(() => reject(), 5000)
            return
          }
          const s = document.createElement('script')
          s.src = GSI_SRC
          s.async = true
          s.onload = () => resolve()
          s.onerror = () => reject()
          document.head.appendChild(s)
          setTimeout(() => reject(), 5000)
        })
      } catch {
        setError('Google Auth load nahi ho raha. Internet connection check karo aur retry karo.')
        setIsGoogleLoading(false)
        return
      }
    }

    setIsGoogleLoading(true)
    try {
      const google = (window as any).google
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse
      })

      // Render native hidden login button container and trigger click programmatically
      const container = document.getElementById('google-btn-container')
      if (container) {
        google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          width: 320
        })
        // Small delay for button rendering
        await new Promise(r => setTimeout(r, 100))
        const googleButton = container.querySelector('div[role="button"]') as HTMLElement
        if (googleButton) {
          googleButton.click()
        } else {
          // If programmatic click is blocked, show the container visibly so they can click
          container.style.display = 'flex'
          setIsGoogleLoading(false)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize Google login popup')
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
      {/* Dynamic Hidden Container for Native Google Authentication popup trigger */}
      <div id="google-btn-container" style={{ display: 'none' }} className="justify-center py-2" />

      {/* Social Login Button */}
      {mode !== 'forgot' && (
        <>
          <div className="grid grid-cols-1 gap-3">
            <button 
              type="button"
              onClick={handleGoogleLoginExplicit}
              disabled={loading || isGoogleLoading}
              className="w-full h-11 bg-white text-slate-900 border border-slate-200 font-bold rounded-md text-xs flex items-center justify-center gap-3 hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="animate-spin text-black" size={16} />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Continue with Google
            </button>
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
