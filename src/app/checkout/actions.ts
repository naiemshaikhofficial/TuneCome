'use server'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { generateInvoicePDF } from '@/lib/invoice'
import { sendInvoiceEmail } from '@/lib/emails'

// 1. Coupon Validation Action
export async function validateCoupon(code: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('coupons')
    .select('code, discount_percent')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  // If expires_at is null, it's a perpetual coupon
  if (!data) {
     const { data: perpetual } = await supabase
      .from('coupons')
      .select('code, discount_percent')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .is('expires_at', null)
      .maybeSingle()
     
     if (perpetual) return { success: true, discount: perpetual.discount_percent }
  }

  if (data) return { success: true, discount: data.discount_percent }
  
  return { success: false, message: "Invalid or expired coupon" }
}

// 2. PayPal Credentials Token Auth Helper (Server-only)
async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('PayPal Client ID or Client Secret is missing in environment variables.')
  }

  const isSandbox = process.env.NODE_ENV !== 'production' || process.env.PAYPAL_MODE === 'sandbox'
  const host = isSandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com'

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  
  const response = await fetch(`${host}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store'
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to fetch PayPal Access Token: ${errorText}`)
  }

  const data = await response.json()
  return data.access_token
}

// 3. PayPal Order Creation Action
export async function createPayPalOrder(items: { id: string, type: 'pack' | 'preset' }[], couponCode?: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Please login to purchase' }
    }

    // Fetch dynamic item details securely from Supabase
    const packIds = items.filter((i: any) => i.type === 'pack').map((i: any) => i.id)
    const presetIds = items.filter((i: any) => i.type === 'preset').map((i: any) => i.id)

    const [packsRes, presetsRes] = await Promise.all([
      packIds.length > 0 ? supabase.from('sample_packs').select('id, name, price_usd, price_inr, created_at, full_pack_download_url').in('id', packIds) : { data: [] },
      presetIds.length > 0 ? supabase.from('presets').select('id, name, price_usd, price_inr').in('id', presetIds) : { data: [] }
    ])

    const resolvedPacks = (packsRes.data || []).map((pack: any) => ({
      ...pack,
      price_usd: pack.price_usd || (pack.price_inr ? Number(pack.price_inr) / 50 : 19.99)
    }))

    const resolvedPresets = (presetsRes.data || []).map((preset: any) => ({
      ...preset,
      price_usd: preset.price_usd || (preset.price_inr ? Number(preset.price_inr) / 50 : 9.99)
    }))

    const allItems = [...resolvedPacks, ...resolvedPresets]
    if (allItems.length === 0) {
      return { error: 'Checkout items not found in store' }
    }

    // Dynamic price calculation
    const rawSubtotal = allItems.reduce((sum, p) => sum + Number(p.price_usd), 0)
    
    // Bundle discount (10% off for 3+ items)
    const bundleDiscountPercent = items.length >= 3 ? 10 : 0
    const bundleDiscountAmount = rawSubtotal * bundleDiscountPercent / 100
    const subtotalAfterBundle = rawSubtotal - bundleDiscountAmount

    // Coupon discount calculation
    let couponDiscountPercent = 0
    if (couponCode) {
      const { data: couponData } = await supabase
        .from('coupons')
        .select('discount_percent')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .or(`expires_at.gt.${new Date().toISOString()},expires_at.is.null`)
        .maybeSingle()
      
      if (couponData) {
        couponDiscountPercent = couponData.discount_percent
      }
    }

    const couponDiscountAmount = subtotalAfterBundle * couponDiscountPercent / 100
    const finalTotal = Number((subtotalAfterBundle - couponDiscountAmount).toFixed(2))

    // Call PayPal REST API to create checkout order
    const accessToken = await getPayPalAccessToken()
    const isSandbox = process.env.NODE_ENV !== 'production' || process.env.PAYPAL_MODE === 'sandbox'
    const host = isSandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com'

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: finalTotal.toString()
          },
          description: `Checkout ${items.length} items from TuneCome`
        }
      ]
    }

    const response = await fetch(`${host}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderPayload),
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[PAYPAL_ORDER_API_ERROR]', errorText)
      return { error: 'Failed to initiate order checkout via PayPal API' }
    }

    const orderData = await response.json()
    return { success: true, orderId: orderData.id }
  } catch (err: any) {
    console.error('[CREATE_PAYPAL_ORDER_ERROR]', err)
    return { error: err.message || 'Server error creating PayPal Order' }
  }
}

// 4. PayPal Order Capture Action
export async function capturePayPalOrder(
  orderId: string, 
  billingDetails: { fullName: string, phone: string, address: string, city: string, state: string, zip: string, country: string },
  userId: string,
  items: { id: string, type: 'pack' | 'preset' }[]
) {
  try {
    const accessToken = await getPayPalAccessToken()
    const isSandbox = process.env.NODE_ENV !== 'production' || process.env.PAYPAL_MODE === 'sandbox'
    const host = isSandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com'

    // Capture payment from PayPal order
    const response = await fetch(`${host}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[PAYPAL_CAPTURE_API_ERROR]', errorText)
      return { error: 'Failed to capture PayPal checkout payment' }
    }

    const captureData = await response.json()
    if (captureData.status !== 'COMPLETED') {
      return { error: `PayPal capture was not completed successfully. Status: ${captureData.status}` }
    }

    const finalOrderId = orderId
    const finalPaymentId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || `PP_CAPT_${Date.now()}`

    // Fetch purchased items to update libraries
    const admin = getAdminClient()
    const packIds = items.filter((i: any) => i.type === 'pack').map((i: any) => i.id)
    const presetIds = items.filter((i: any) => i.type === 'preset').map((i: any) => i.id)

    const [packsRes, presetsRes] = await Promise.all([
      packIds.length > 0 ? admin.from('sample_packs').select('id, name, price_usd, price_inr, full_pack_download_url').in('id', packIds) : { data: [] },
      presetIds.length > 0 ? admin.from('presets').select('id, name, price_usd, price_inr').in('id', presetIds) : { data: [] }
    ])

    const resolvedPacks = (packsRes.data || []).map((pack: any) => ({
      ...pack,
      price_usd: pack.price_usd || (pack.price_inr ? Number(pack.price_inr) / 50 : 19.99)
    }))

    const resolvedPresets = (presetsRes.data || []).map((preset: any) => ({
      ...preset,
      price_usd: preset.price_usd || (preset.price_inr ? Number(preset.price_inr) / 50 : 9.99)
    }))

    const allPurchasedItems = [...resolvedPacks, ...resolvedPresets]
    if (allPurchasedItems.length === 0) {
      return { error: "Could not retrieve vault items details" }
    }

    // Add purchased assets to Supabase vault (maintaining razorpay column mappings to avoid DB schema migration error)
    const vaultEntries = items.map((item: any) => {
      const dbItem = allPurchasedItems.find(p => p.id === item.id)
      return {
        user_id: userId,
        item_id: item.id,
        item_type: item.type,
        item_name: dbItem?.name || 'Unknown Item',
        amount: dbItem?.price_usd || 0,
        razorpay_order_id: finalOrderId,
        razorpay_payment_id: finalPaymentId
      }
    })

    const { error: vaultError } = await admin
      .from('user_vault')
      .insert(vaultEntries)

    if (vaultError && vaultError.code !== '23505') {
      console.error('[VAULT_ERROR]', vaultError)
      return { error: "Failed to sync purchased items to your vault" }
    }

    // Sync address metadata and newsletter fields to user account
    if (billingDetails) {
      const { error: accountError } = await admin
        .from('user_accounts')
        .upsert({
          user_id: userId,
          full_name: billingDetails.fullName,
          phone_number: billingDetails.phone,
          address_line1: billingDetails.address,
          city: billingDetails.city,
          state: billingDetails.state,
          postal_code: billingDetails.zip,
          country: billingDetails.country,
          updated_at: new Date().toISOString()
        })

      if (accountError) {
        console.error('[SYNC_ACCOUNT_ERROR]', accountError)
      }
    }

    // Trigger Invoice PDF rendering and dispatch transactional emails (Async background)
    try {
      const { data: { user } } = await admin.auth.admin.getUserById(userId)
      if (user && user.email) {
        const invoiceItems = items.map((item: any) => {
          const dbItem = allPurchasedItems.find(p => p.id === item.id)
          return { 
            name: dbItem?.name || 'Unknown Item', 
            price: dbItem?.price_usd || 0,
            isPreorder: item.type === 'pack' && !dbItem?.full_pack_download_url 
          }
        })

        const totalSum = invoiceItems.reduce((sum, i) => sum + i.price, 0)
        const hasPreorder = invoiceItems.some(i => i.isPreorder)
        const userAddress = `${billingDetails.address}, ${billingDetails.city}, ${billingDetails.state} - ${billingDetails.zip}, ${billingDetails.country}`

        const pdfBuffer = await generateInvoicePDF({
          orderId: finalOrderId,
          paymentId: finalPaymentId,
          userName: user.user_metadata?.full_name || billingDetails?.fullName || user.email.split('@')[0],
          userEmail: user.email,
          userAddress: userAddress,
          items: invoiceItems,
          total: totalSum,
          date: new Date().toLocaleDateString()
        })

        await sendInvoiceEmail({
          email: user.email,
          pdfBuffer,
          orderId: finalOrderId,
          packNames: invoiceItems.map(i => i.name),
          userName: user.user_metadata?.full_name || billingDetails?.fullName || user.email.split('@')[0],
          total: totalSum,
          items: invoiceItems,
          isPreorder: hasPreorder
        })
      }
    } catch (emailErr) {
      console.error('[INVOICE_SEND_EMAIL_BACKGROUND_ERROR]', emailErr)
    }

    return { success: true }
  } catch (err: any) {
    console.error('[CAPTURE_PAYPAL_ORDER_ERROR]', err)
    return { error: err.message || 'PayPal capture operation encountered a server error' }
  }
}
