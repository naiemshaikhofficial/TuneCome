'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useCart } from '@/context/CartContext'
import { ShoppingBag, Trash2, Tag, ArrowRight, Loader2, Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { validateCoupon, createPayPalOrder, capturePayPalOrder } from './actions'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/Header'
import Select from 'react-select'
import countryList from 'react-select-country-list'
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'

// --- DYNAMIC FLOATING SYMBOLS ---
const MusicalNotesBackground = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const notes = React.useMemo(() => {
    if (!mounted) return []
    const musicalNotes = ['♪', '♫', '♬', '♪', '♫', '♬']
    return musicalNotes.map((note) => ({
      note,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      fontSize: `${Math.random() * 1.5 + 0.75}rem`,
      animationDelay: `${Math.random() * 8}s`,
      animationDuration: `${12 + Math.random() * 8}s`
    }))
  }, [mounted])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-[0.05]">
      {notes.map((data, index) => (
        <span
          key={index}
          className="absolute text-slate-400 animate-float-note"
          style={{
            left: data.left,
            top: data.top,
            fontSize: data.fontSize,
            animationDelay: data.animationDelay,
            animationDuration: data.animationDuration
          }}
        >
          {data.note}
        </span>
      ))}
    </div>
  )
}

export default function CheckoutPage() {
  const countryOptions = React.useMemo(() => countryList().getData(), [])
  const { items, removeItem, total, clearCart, itemCount, setSidebarOpen } = useCart()
  const hasPreorder = items.some(item => item.type === 'pack' && item.is_downloadable === false)

  useEffect(() => {
    setSidebarOpen(false)
  }, [setSidebarOpen])

  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle')
  const [user, setUser] = useState<any>(null)
  const [upsellPacks, setUpsellPacks] = useState<any[]>([])
  const [billingDetails, setBillingDetails] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States'
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [newsletterOptIn, setNewsletterOptIn] = useState(true)
  const [paypalLoaded, setPaypalLoaded] = useState(false)
  const paypalButtonRenderedRef = useRef(false)
  const router = useRouter()
  const supabase = createClient()

  // 1. Initial User Account Fetch
  useEffect(() => {
    const ensureE164 = (phone: any) => {
      if (!phone || phone === '0' || phone === 0) return ''
      let str = String(phone).trim()
      if (str.startsWith('+')) return str
      const digits = str.replace(/\D/g, '')
      if (!digits) return ''
      if (digits.length === 10) return `+1${digits}`
      return `+${digits}`
    }

    const loadData = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return
      setUser(currentUser)

      const { data: account } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle()

      if (account && account.address_line1) {
        const dbDetails = {
          fullName: account.full_name || '',
          phone: ensureE164(account.phone_number || ''),
          address: account.address_line1 || '',
          city: account.city || '',
          state: account.state || '',
          zip: account.postal_code || '',
          country: account.country || 'United States'
        }
        setBillingDetails(dbDetails)
        localStorage.setItem('billing_details', JSON.stringify(dbDetails))
        return
      }

      const savedDetails = localStorage.getItem('billing_details')
      if (savedDetails) {
        const parsed = JSON.parse(savedDetails)
        setBillingDetails({
          ...parsed,
          phone: ensureE164(parsed.phone),
          country: parsed.country || 'United States'
        })
        return
      }

      if (currentUser.user_metadata) {
        const meta = currentUser.user_metadata
        const clean = (val: any) => (val === '0' || val === 0) ? '' : (val || '')

        const metaDetails = {
          fullName: clean(meta.full_name),
          phone: ensureE164(clean(meta.phone)),
          address: clean(meta.address),
          city: clean(meta.city),
          state: clean(meta.state),
          zip: clean(meta.zip),
          country: clean(meta.country) || 'United States'
        }
        setBillingDetails(metaDetails)
        localStorage.setItem('billing_details', JSON.stringify(metaDetails))
      }
    }

    loadData()
  }, [])

  // 2. Fetch Upsells (Frequently Bought Together)
  useEffect(() => {
    if (items.length > 0) {
      // Safely default to mock values if api call fails
      fetch('/api/packs/featured')
        .then(res => res.json())
        .then(data => {
          const filtered = data.filter((p: any) => !items.some(item => item.id === p.id)).slice(0, 2)
          setUpsellPacks(filtered)
        })
        .catch(err => console.warn("Failed to fetch featured upsells, using static fallbacks"))
    }
  }, [items])

  // 3. Dynamically Load PayPal SDK script
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    if (!clientId) return

    const scriptId = 'paypal-jssdk'
    if (document.getElementById(scriptId)) {
      setPaypalLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.id = scriptId
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`
    script.async = true
    script.onload = () => setPaypalLoaded(true)
    script.onerror = () => console.error('Failed to load PayPal SDK')
    document.body.appendChild(script)
  }, [])

  // 4. Render PayPal Smart Buttons Container
  useEffect(() => {
    if (!paypalLoaded || !items.length || !user || paypalButtonRenderedRef.current) return

    const paypal = (window as any).paypal
    if (!paypal) return

    paypalButtonRenderedRef.current = true

    paypal.Buttons({
      createOrder: async () => {
        setError('')
        setLoading(true)

        if (!validateForm()) {
          setError('Please complete the billing details form.')
          setLoading(false)
          const billingSection = document.getElementById('billing-details-section')
          if (billingSection) {
            billingSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
          return null
        }

        const res = await createPayPalOrder(
          items.map(i => ({ id: i.id, type: i.type })),
          coupon
        )

        if (res.error) {
          setError(res.error)
          setLoading(false)
          return null
        }

        return res.orderId
      },
      onApprove: async (data: any) => {
        setPaymentStatus('processing')
        
        try {
          const res = await capturePayPalOrder(
            data.orderID,
            billingDetails,
            user.id,
            items.map(i => ({ id: i.id, type: i.type }))
          )

          if (res.error) {
            setError(res.error)
            setPaymentStatus('idle')
            setLoading(false)
          } else {
            // Update Supabase customer profile details
            await supabase.auth.updateUser({
              data: {
                full_name: billingDetails.fullName,
                phone: billingDetails.phone,
                address: billingDetails.address,
                city: billingDetails.city,
                state: billingDetails.state,
                zip: billingDetails.zip,
                country: billingDetails.country
              }
            })

            try {
              await supabase
                .from('user_accounts')
                .update({ newsletter: newsletterOptIn })
                .eq('user_id', user.id)
            } catch (e) {
              console.error('Failed to sync newsletter options:', e)
            }

            setPaymentStatus('success')
            clearCart()
            router.push('/library?success=true')
          }
        } catch (err: any) {
          setError(err.message || 'Payment capture processing error.')
          setPaymentStatus('idle')
          setLoading(false)
        }
      },
      onCancel: () => {
        setLoading(false)
      },
      onError: (err: any) => {
        setError('PayPal Checkout operation failed. Please try again.')
        setLoading(false)
        console.error('[PAYPAL_ERROR]', err)
      },
      style: {
        layout: 'vertical',
        color: 'black',
        shape: 'rect',
        label: 'pay',
        height: 50
      }
    }).render('#paypal-button-container')

  }, [paypalLoaded, items, billingDetails, coupon, user])

  const handleBillingChange = (field: string, value: string) => {
    const updated = { ...billingDetails, [field]: value }
    setBillingDetails(updated)
    localStorage.setItem('billing_details', JSON.stringify(updated))

    if (formErrors[field]) {
      setFormErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!billingDetails.fullName.trim()) errors.fullName = 'Full Name is required'
    
    if (!billingDetails.phone) {
      errors.phone = 'Phone Number is required'
    } else if (billingDetails.phone.length < 5) {
      errors.phone = 'Enter a valid phone number'
    }

    if (!billingDetails.address.trim()) errors.address = 'Street Address is required'
    if (!billingDetails.city.trim()) errors.city = 'City is required'
    if (!billingDetails.state.trim()) errors.state = 'State is required'

    const cleanZip = billingDetails.zip.trim()
    if (!cleanZip) {
      errors.zip = 'Postal / Zip code is required'
    } else if (cleanZip.length < 3 || cleanZip.length > 10) {
      errors.zip = 'Enter a valid Zip/Postal Code'
    }

    if (!billingDetails.country) errors.country = 'Country is required'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleApplyCoupon = async () => {
    if (!coupon) return
    setLoading(true)
    const result = await validateCoupon(coupon)
    if (result.success) {
      setDiscount(result.discount || 0)
      setCouponError('')
    } else {
      setCouponError(result.message || 'Invalid coupon')
      setDiscount(0)
    }
    setLoading(false)
  }

  const discountedTotal = Number((total - (total * discount / 100)).toFixed(2))

  // Free Cart Checkout bypass
  const handleFreeCheckout = async () => {
    if (!user) {
      router.push('/auth?next=/checkout')
      return
    }

    if (!validateForm()) {
      setError('Please complete the billing details form.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const verifyRes = await fetch('/api/stripe/verify-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isFree: true,
          items: items.map(i => ({ id: i.id, type: i.type })),
          userId: user.id,
          billingDetails: billingDetails
        }),
      })

      if (verifyRes.ok) {
        try {
          await supabase
            .from('user_accounts')
            .update({ newsletter: newsletterOptIn })
            .eq('user_id', user.id)
        } catch (e) {
          console.error('Failed to sync newsletter options:', e)
        }
        clearCart()
        router.push('/library?success=true')
      } else {
        const err = await verifyRes.json()
        setError(err.error || 'Free checkout capture failed.')
      }
    } catch (err) {
      setError('Network error processing free checkout.')
    } finally {
      setLoading(false)
    }
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6 text-center px-4 relative z-10 bg-white text-slate-800">
        <div className="relative mb-4 flex items-center justify-center">
          <div className="w-16 h-16 bg-[#00BFFF]/10 rounded-full flex items-center justify-center text-[#00BFFF]">
            <ShoppingBag size={32} />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 leading-none">
            Checkout Successful!
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] max-w-md mx-auto">
            Your sounds are being synchronized to your library...
          </p>
        </div>

        <div className="max-w-md w-full p-6 bg-slate-50 border border-slate-100 rounded-md space-y-3 shadow-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00BFFF]/10 border border-[#00BFFF]/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#00BFFF] animate-pulse" />
            <span className="text-[8px] font-bold text-[#00BFFF] uppercase tracking-widest">INVOICE & ORDER CONFIRMED</span>
          </div>

          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wide leading-relaxed">
            An order confirmation and PDF invoice receipt have been sent to your email address. Please check your inbox (or spam folder) shortly.
          </p>

          <div className="pt-3 border-t border-slate-100">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
              ℹ️ Your license keys and high-speed direct downloads are securely hosted inside your{' '}
              <Link href="/library" className="text-[#00BFFF] hover:underline font-bold">
                User Library / Vault
              </Link>{' '}
              at any time.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Link href="/library" className="px-8 py-3.5 bg-slate-950 text-white font-bold uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all rounded-md">
            Go to Library
          </Link>
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">
            Need help? Contact support at{' '}
            <a href="mailto:support@tunecome.com" className="text-[#00BFFF] hover:underline transition-colors">
              support@tunecome.com
            </a>
          </p>
        </div>
      </div>
    )
  }

  if (itemCount === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 text-center px-4 bg-white text-slate-800">
        <ShoppingBag size={60} className="text-slate-200" />
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800">Your Cart is Empty</h1>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Explore sounds to fill your library</p>
        <Link href="/browse" className="px-6 py-3.5 border border-slate-200 hover:border-slate-800 hover:bg-slate-50 transition-all uppercase text-[10px] font-bold tracking-widest rounded-md">
          Browse Library
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 relative overflow-hidden">
      <MusicalNotesBackground />

      <div className="container mx-auto px-4 pt-16 pb-24 relative z-10">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="h-[3px] bg-[#00BFFF] w-16 mb-4" />
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 leading-none">
            SECURE <span className="text-[#00BFFF]">CHECKOUT</span>
          </h1>
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em] mt-3">
            Instant Digital Delivery / Global Access
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-md group hover:border-slate-200 transition-all">
                <div className="w-16 h-16 relative rounded-sm overflow-hidden flex-shrink-0 border border-slate-100">
                  <Image src={item.cover_url || '/placeholder.jpg'} alt={item.name} fill sizes="64px" className="object-cover" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold uppercase tracking-tight text-sm text-slate-800">{item.name}</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    {item.type === 'preset' ? 'Synth Preset' : 'Sample Pack & Stems'}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold text-base text-slate-900">${item.price}</p>
                  <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1 flex items-center justify-end ml-auto cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            <Link href="/browse" className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-800 pt-3 transition-colors">
              <ArrowRight size={12} className="rotate-180" />
              Continue Shopping
            </Link>

            {/* Billing Address Section */}
            <div id="billing-details-section" className="pt-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-1 bg-[#00BFFF] rounded-sm" />
                  <h2 className="text-lg font-bold uppercase tracking-tight text-slate-800">Billing Information</h2>
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-300">
                  Secure / Autocached
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="NAME"
                    className={`w-full h-11 bg-slate-50 border rounded-md px-4 text-xs font-bold uppercase tracking-wide focus:border-studio-yellow focus:bg-white outline-none transition-all ${formErrors.fullName ? 'border-red-300 bg-red-50/20' : 'border-slate-200'}`}
                    value={billingDetails.fullName}
                    onChange={(e) => handleBillingChange('fullName', e.target.value)}
                  />
                  {formErrors.fullName && <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest mt-1 ml-1">{formErrors.fullName}</p>}
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                  <div className="phone-input-container rounded-md overflow-hidden">
                    <PhoneInput
                      international
                      defaultCountry="US"
                      placeholder="PHONE"
                      value={billingDetails.phone}
                      onChange={(val) => handleBillingChange('phone', val || '')}
                      className={`w-full h-11 bg-slate-50 border rounded-md px-4 text-xs font-bold focus-within:border-studio-yellow focus-within:bg-white outline-none transition-all ${formErrors.phone ? 'border-red-300 bg-red-50/20' : 'border-slate-200'}`}
                    />
                  </div>
                  {formErrors.phone && <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest mt-1 ml-1">{formErrors.phone}</p>}
                </div>

                <div className="col-span-full space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Street Address</label>
                  <input
                    type="text"
                    placeholder="STREET ADDRESS"
                    className={`w-full h-11 bg-slate-50 border rounded-md px-4 text-xs font-bold uppercase tracking-wide focus:border-studio-yellow focus:bg-white outline-none transition-all ${formErrors.address ? 'border-red-300 bg-red-50/20' : 'border-slate-200'}`}
                    value={billingDetails.address}
                    onChange={(e) => handleBillingChange('address', e.target.value)}
                  />
                  {formErrors.address && <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest mt-1 ml-1">{formErrors.address}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">City</label>
                  <input
                    type="text"
                    placeholder="CITY"
                    className={`w-full h-11 bg-slate-50 border rounded-md px-4 text-xs font-bold uppercase tracking-wide focus:border-studio-yellow focus:bg-white outline-none transition-all ${formErrors.city ? 'border-red-300 bg-red-50/20' : 'border-slate-200'}`}
                    value={billingDetails.city}
                    onChange={(e) => handleBillingChange('city', e.target.value)}
                  />
                  {formErrors.city && <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest mt-1 ml-1">{formErrors.city}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">State</label>
                    <input
                      type="text"
                      placeholder="STATE"
                      className={`w-full h-11 bg-slate-50 border rounded-md px-4 text-xs font-bold uppercase tracking-wide focus:border-studio-yellow focus:bg-white outline-none transition-all ${formErrors.state ? 'border-red-300 bg-red-50/20' : 'border-slate-200'}`}
                      value={billingDetails.state}
                      onChange={(e) => handleBillingChange('state', e.target.value)}
                    />
                    {formErrors.state && <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest mt-1 ml-1">{formErrors.state}</p>}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Zip / Postal</label>
                    <input
                      type="text"
                      placeholder="ZIP"
                      className={`w-full h-11 bg-slate-50 border rounded-md px-4 text-xs font-bold uppercase tracking-wide focus:border-studio-yellow focus:bg-white outline-none transition-all ${formErrors.zip ? 'border-red-300 bg-red-50/20' : 'border-slate-200'}`}
                      value={billingDetails.zip}
                      onChange={(e) => handleBillingChange('zip', e.target.value)}
                    />
                    {formErrors.zip && <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest mt-1 ml-1">{formErrors.zip}</p>}
                  </div>
                </div>

                <div className="col-span-full space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Country</label>
                  <Select
                    options={countryOptions}
                    value={countryOptions.find(opt => opt.label === billingDetails.country)}
                    onChange={(val: any) => handleBillingChange('country', val?.label || '')}
                    placeholder="SELECT COUNTRY"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: 'rgba(248, 250, 252, 1)',
                        borderColor: state.isFocused ? '#00BFFF' : (formErrors.country ? 'rgba(239, 68, 68, 0.5)' : 'rgba(226, 232, 240, 1)'),
                        borderRadius: '0.375rem',
                        height: '2.75rem',
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        boxShadow: 'none',
                        '&:hover': {
                          borderColor: state.isFocused ? '#00BFFF' : 'rgba(203, 213, 225, 1)',
                        }
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: '#fff',
                        border: '1px solid rgba(226, 232, 240, 1)',
                        borderRadius: '0.375rem',
                        zIndex: 50
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused ? 'rgba(0, 191, 255, 0.05)' : 'transparent',
                        color: state.isFocused ? '#00BFFF' : 'rgba(71, 85, 105, 1)',
                        fontSize: '10px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        '&:active': {
                          backgroundColor: '#00BFFF',
                          color: '#fff'
                        }
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: '#0f172a'
                      }),
                      input: (base) => ({
                        ...base,
                        color: '#0f172a'
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: 'rgba(148, 163, 184, 1)'
                      })
                    }}
                  />
                  {formErrors.country && <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest mt-1 ml-1">{formErrors.country}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 px-1 opacity-60 hover:opacity-100 transition-opacity duration-200">
                <input
                  id="checkout-newsletter"
                  type="checkbox"
                  checked={newsletterOptIn}
                  onChange={(e) => setNewsletterOptIn(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-transparent border border-slate-200 text-slate-800 focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer"
                />
                <label htmlFor="checkout-newsletter" className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed cursor-pointer select-none">
                  Email me with news and offers
                </label>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-md">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
                  Note: This information is used strictly for digital license verification and compliance. Instantly synchronized items will activate inside your personal library immediately after checkout completes.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary Side */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 bg-white border border-slate-200 rounded-md space-y-6 shadow-xs text-slate-800">
              <h2 className="text-base font-bold uppercase tracking-widest border-b border-slate-100 pb-2">Order Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[#00BFFF]">
                    <span>Discount ({discount}%)</span>
                    <span>-${(total * discount / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-100 flex justify-between items-end">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">Total Amount</span>
                  <span className="text-2xl font-black text-slate-900">${discountedTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon Input */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                    <input
                      type="text"
                      placeholder="COUPON CODE"
                      className="w-full h-9 bg-slate-50 border border-slate-200 rounded-md pl-9 pr-4 text-[9px] font-bold uppercase tracking-wider focus:border-studio-yellow focus:bg-white outline-none transition-all"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={loading}
                    className="px-4 bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-bold uppercase tracking-widest rounded-md disabled:opacity-50 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest">{couponError}</p>}
                {discount > 0 && <p className="text-[8px] font-bold text-[#00BFFF] uppercase tracking-widest">Coupon Applied Successfully!</p>}
              </div>

              {/* Pre-order warning notice */}
              {hasPreorder && (
                <div className="p-4 rounded-md border border-[#00BFFF] bg-slate-50 text-left space-y-2.5 mt-2">
                  <div className="flex items-center gap-2 text-[#00BFFF]">
                    <Clock size={12} className="animate-pulse" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Pre-order Notice</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-relaxed">
                    Some items in your cart are <span className="text-slate-800 font-black">pre-orders</span>. Our sounds are highly custom and hand-crafted, taking up to <span className="text-[#00BFFF]">1-2 months to fully deliver</span>.
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed pt-1.5 border-t border-slate-100">
                    📧 Reach us at <a href="mailto:support@tunecome.com" className="text-[#00BFFF] hover:underline font-bold lowercase">support@tunecome.com</a> for updates.
                  </p>
                </div>
              )}

              {/* Legal Agreement & PayPal Buttons */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold uppercase tracking-tight rounded-md text-center">
                    {error}
                  </div>
                )}
                
                {/* Dynamic Smart Buttons Injection */}
                <div className="w-full flex flex-col justify-center">
                  {!paypalLoaded && total > 0 && (
                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase py-4">
                      <Loader2 className="animate-spin text-studio-yellow" size={16} />
                      Loading PayPal Checkout...
                    </div>
                  )}

                  {total === 0 ? (
                    <button
                      onClick={handleFreeCheckout}
                      disabled={loading}
                      className="w-full h-12 bg-slate-950 text-white font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-slate-800 transition-all rounded-md cursor-pointer disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="animate-spin text-white" size={14} /> : 'Get For Free'}
                    </button>
                  ) : (
                    <div id="paypal-button-container" className="w-full min-h-[50px] relative z-10" />
                  )}
                </div>

                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-wider leading-relaxed text-center px-2">
                  By purchasing, you agree to our <Link href="/terms" className="text-slate-400 hover:text-studio-yellow underline">Terms & EULA</Link>, <Link href="/refund-policy" className="text-slate-400 hover:text-studio-yellow underline">Refund</Link>, and <Link href="/privacy" className="text-slate-400 hover:text-studio-yellow underline">Privacy</Link>.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2 opacity-30">
                <span className="text-[8px] font-bold uppercase tracking-widest">128-bit SSL Secure Transaction</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="p-5 bg-slate-50 border border-slate-100 rounded-md space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-1 bg-[#00BFFF] rounded-sm" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Why TuneCome?</h3>
              </div>

              <div className="grid grid-cols-1 gap-3 text-slate-600">
                <div>
                  <h4 className="text-[9px] font-bold uppercase tracking-wide">⚡ Instant Delivery</h4>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Get your high-speed zip package downloads immediately</p>
                </div>
                <div>
                  <h4 className="text-[9px] font-bold uppercase tracking-wide">🛡️ Lifetime Access</h4>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Restore and download sounds anytime from your personal library</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
