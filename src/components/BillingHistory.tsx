'use client'
import React from 'react'
import { Receipt, Download, Calendar, Hash, CreditCard, ShieldCheck, FileCheck } from 'lucide-react'

interface BillingItem {
  id: string
  created_at: string
  item_name: string
  amount: number
  razorpay_order_id: string
  razorpay_payment_id: string
}

export function BillingHistory({ items, profile, email }: { 
  items: BillingItem[], 
  profile: {
    full_name: string | null,
    phone_number: string | null,
    address_line1: string | null,
    city: string | null,
    state: string | null,
    postal_code: string | null,
    gstin: string | null
  } | null,
  email?: string
}) {
  if (items.length === 0) return null

  const handleDownloadInvoice = (item: BillingItem) => {
    const invoiceWindow = window.open('', '_blank')
    if (!invoiceWindow) return

    const date = new Date(item.created_at).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })

    const total = Number(item.amount)

    invoiceWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${item.razorpay_order_id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 50px; color: #1e293b; line-height: 1.5; background: #fff; }
            .top-bar { height: 6px; background: #00BFFF; margin-bottom: 40px; border-radius: 3px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
            .logo-text { font-size: 24px; font-weight: 800; text-transform: uppercase; color: #0f172a; letter-spacing: 1px; }
            .logo-sub { font-size: 8px; font-weight: 700; color: #00BFFF; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }
            .official-title { text-align: right; }
            .title-text { font-size: 20px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin: 0; }
            .subtitle-text { font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
            
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .section-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; }
            .value { font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; }
            .sub-val { font-size: 11px; color: #475569; line-height: 1.5; margin-top: 4px; }
            
            .table { width: 100%; border-collapse: collapse; border-radius: 6px; overflow: hidden; border: 1px solid #e2e8f0; }
            .table th { background: #f8fafc; padding: 12px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; border-bottom: 1px solid #e2e8f0; }
            .table td { padding: 14px 12px; font-size: 12px; border-bottom: 1px solid #e2e8f0; color: #0f172a; }
            
            .totals { margin-top: 30px; margin-left: auto; width: 260px; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; background: #f8fafc; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; font-weight: 500; color: #475569; }
            .grand-total { font-size: 14px; font-weight: 800; color: #00BFFF; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 8px; }
            
            .declarations { margin-top: 40px; font-size: 10px; color: #64748b; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px dashed #e2e8f0; }
            .footer { margin-top: 60px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 11px; color: #64748b; }
            .help-box { margin-top: 15px; display: inline-flex; align-items: center; gap: 6px; color: #00BFFF; font-weight: 700; font-size: 10px; text-transform: uppercase; text-decoration: none; }
            
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="top-bar"></div>
          <div class="header">
            <div>
              <div class="logo-text">TUNE COME</div>
              <div class="logo-sub">Global Sound Platform</div>
            </div>
            <div class="official-title">
              <h1 class="title-text">INVOICE / RECEIPT</h1>
              <p class="subtitle-text">Digital Goods delivery</p>
              <div style="margin-top: 12px;">
                <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Invoice Reference</div>
                <div class="value">#${item.razorpay_payment_id?.slice(-12).toUpperCase() || item.id.slice(0,12).toUpperCase()}</div>
              </div>
            </div>
          </div>
 
          <div class="details-grid">
            <div>
              <div class="section-label">Supplier</div>
              <div class="value">TUNE COME INC.</div>
              <div class="sub-val">
                Global Sound Distribution Network<br>
                Web: www.tunecome.com<br>
                Email: support@tunecome.com
              </div>
            </div>
            <div>
              <div class="section-label">Recipient</div>
              <div class="value">${profile?.full_name?.toUpperCase() || 'VALUED CUSTOMER'}</div>
              <div class="sub-val">
                Email: ${email?.toLowerCase() || 'N/A'}<br>
                Address: ${profile?.address_line1?.toUpperCase() || 'DIGITAL DELIVERY'}<br>
                ${profile?.city?.toUpperCase() || ''} ${profile?.state?.toUpperCase() || ''} ${profile?.postal_code || ''}<br>
                Country: ${profile?.state?.toUpperCase() || 'GLOBAL'}
              </div>
            </div>
          </div>
 
          <table class="table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center; width: 60px;">Qty</th>
                <th style="text-align: right; width: 120px;">Amount (USD)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-weight: 600;">${item.item_name?.toUpperCase() || 'STUDIO ASSET'}</td>
                <td style="text-align: center;">1</td>
                <td style="text-align: right; font-weight: 700;">$${total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
 
          <div class="totals">
            <div class="total-row">
              <span>Subtotal</span>
              <span style="font-weight: 700; color: #0f172a;">$${total.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Tax / VAT (0%)</span>
              <span style="font-weight: 700; color: #0f172a;">$0.00</span>
            </div>
            <div class="total-row grand-total">
              <span>Total Paid</span>
              <span>$${total.toFixed(2)}</span>
            </div>
          </div>
 
          <div class="declarations">
            <strong>DECLARATIONS & TERMS:</strong><br>
            1. All digital products are delivered instantly via email access and secure vault downloads.<br>
            2. This invoice is computer-generated and is legally binding without a physical signature.<br>
            3. Subject to global digital end-user license agreements (Royalty-Free EULA).
          </div>
 
          <div class="footer">
            <div>TUNE COME INC. | GLOBAL SOUNDS FOR MODERN PRODUCERS</div>
            <a href="mailto:support@tunecome.com" class="help-box">
              Need assistance? contact support@tunecome.com
            </a>
          </div>
 
          <div class="no-print" style="margin-top: 40px; text-align: center;">
            <button onclick="window.print()" style="padding: 12px 24px; background: #00BFFF; color: #fff; border: none; border-radius: 6px; font-weight: 700; text-transform: uppercase; cursor: pointer; letter-spacing: 1px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Print / Download PDF</button>
          </div>
        </body>
      </html>
    `)
    invoiceWindow.document.close()
  }

  const handleDownloadLicense = (item: BillingItem) => {
    const licenseWindow = window.open('', '_blank')
    if (!licenseWindow) return

    const date = new Date(item.created_at).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })

    licenseWindow.document.write(`
      <html>
        <head>
          <title>License Certificate - ${item.item_name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 50px; color: #1e293b; line-height: 1.5; background: #fff; }
            .top-bar { height: 6px; background: #00BFFF; margin-bottom: 40px; border-radius: 3px; }
            .cert-container { border: 1px solid #e2e8f0; border-radius: 8px; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
            .header { text-align: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 25px; margin-bottom: 30px; }
            .logo-text { font-size: 26px; font-weight: 800; text-transform: uppercase; color: #0f172a; letter-spacing: 1.5px; }
            .cert-title { font-size: 22px; font-weight: 800; text-transform: uppercase; color: #00BFFF; margin: 15px 0 0 0; letter-spacing: 0.5px; }
            .cert-subtitle { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px; }
            
            .license-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 35px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; }
            .grid-item { border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
            .grid-label { font-size: 8px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 3px; }
            .grid-value { font-size: 11px; font-weight: 700; color: #0f172a; text-transform: uppercase; }
 
            .terms-section { font-size: 11px; color: #475569; columns: 2; column-gap: 40px; line-height: 1.6; }
            .terms-section h4 { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin: 0 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; display: block; }
            .terms-section p { margin-bottom: 15px; text-align: justify; }
            
            .footer-grid { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
            .stamp-box { border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; background: #f8fafc; color: #00BFFF; font-size: 9px; font-weight: 800; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; }
            .sig-area { text-align: right; }
            .sig-line { border-top: 1px solid #e2e8f0; width: 200px; margin-left: auto; padding-top: 8px; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; }
            .help-box { margin-top: 10px; font-size: 9px; font-weight: 700; color: #00BFFF; text-transform: uppercase; text-decoration: none; display: block; }
            
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="top-bar"></div>
          <div class="cert-container">
            <div class="header">
              <div class="logo-text">TUNE COME</div>
              <h1 class="cert-title">LICENSE CERTIFICATE</h1>
              <div class="cert-subtitle">Official EULA - Royalty Free License</div>
            </div>
 
            <div class="license-grid">
              <div class="grid-item">
                <div class="grid-label">Product</div>
                <div class="grid-value">${item.item_name?.toUpperCase() || 'STUDIO ASSET'}</div>
              </div>
              <div class="grid-item">
                <div class="grid-label">Licensee</div>
                <div class="grid-value">${profile?.full_name?.toUpperCase() || 'VERIFIED USER'}</div>
              </div>
              <div class="grid-item">
                <div class="grid-label">Issue Date</div>
                <div class="grid-value">${date}</div>
              </div>
              <div class="grid-item">
                <div class="grid-label">Order ID</div>
                <div class="grid-value">#${item.razorpay_order_id || item.id.slice(0,12).toUpperCase()}</div>
              </div>
              <div class="grid-item">
                <div class="grid-label">License Type</div>
                <div class="grid-value">SINGLE USER</div>
              </div>
              <div class="grid-item">
                <div class="grid-label">Status</div>
                <div class="grid-value" style="color: #059669;">VERIFIED / ACTIVE</div>
              </div>
            </div>
 
            <div class="terms-section">
              <h4>1. LICENSE GRANT</h4>
              <p>TuneCome grants you a limited, non-exclusive, non-transferable global license to use these sounds solely for creating original audio compositions.</p>
 
              <h4>2. OWNERSHIP</h4>
              <p>All materials remain the intellectual property of TuneCome. This certificate grants usage and synchronization rights, not ownership.</p>
 
              <h4>3. PERMITTED USE</h4>
              <p>You may use and commercialize these sounds in your music releases globally (Spotify, YouTube, Apple Music, etc.) without paying any additional royalties.</p>
 
              <h4>4. PROHIBITIONS</h4>
              <p>Reselling, sharing, compiling, or distributing the raw assets in isolation is strictly prohibited. You cannot build competing sample platforms.</p>
 
              <h4>5. WATERMARKING</h4>
              <p>To protect creators, digital audio assets contain hidden watermarks linked to this license for leak tracking and compliance.</p>
 
              <h4>6. COMPLIANCE</h4>
              <p>Violation of these terms will result in immediate termination of this license and swift copyright claim/DMCA action globally.</p>
            </div>
 
            <div class="footer-grid">
              <div class="stamp-box">
                OFFICIAL SECURE<br>TUNE COME LICENSE
              </div>
              <div class="sig-area">
                <div class="sig-line">TUNE COME LICENSING AUTH</div>
                <a href="mailto:support@tunecome.com" class="help-box">SUPPORT@TUNECOME.COM</a>
              </div>
            </div>
          </div>
 
          <div class="no-print" style="margin-top: 40px; text-align: center;">
            <button onclick="window.print()" style="padding: 12px 24px; background: #00BFFF; color: #fff; border: none; border-radius: 6px; font-weight: 700; text-transform: uppercase; cursor: pointer; letter-spacing: 1px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Print Certificate</button>
          </div>
        </body>
      </html>
    `)
    licenseWindow.document.close()
  }

  return (
    <div className="space-y-8 pt-16 border-t border-slate-200">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-slate-50 flex items-center justify-center rounded-lg border border-slate-200">
          <Receipt size={20} className="text-slate-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight text-slate-800">Billing History</h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Manage your transactions and receipts</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Date</th>
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Item</th>
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Order ID</th>
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Amount</th>
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <Calendar size={14} className="text-slate-400" />
                      <span className="text-[11px] font-semibold text-slate-600">
                        {new Date(item.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="text-[11px] font-bold uppercase tracking-tight text-slate-700">{item.item_name || 'Digital Pack'}</span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-500 transition-colors">
                      <Hash size={12} />
                      <span className="text-[9px] font-mono tracking-tighter uppercase">{item.razorpay_order_id || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <span className="text-[11px] font-extrabold text-[#00BFFF]">${item.amount}</span>
                  </td>
                  <td className="p-5 text-right">
                     <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => handleDownloadInvoice(item)}
                         className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[9px] font-bold uppercase tracking-wider text-slate-700 rounded-md transition-all"
                       >
                         <Receipt size={12} />
                         Invoice
                       </button>
                       <button 
                         onClick={() => handleDownloadLicense(item)}
                         className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00BFFF]/10 border border-[#00BFFF]/20 text-[9px] font-bold uppercase tracking-wider text-[#00BFFF] hover:bg-[#00BFFF] hover:text-white rounded-md transition-all"
                       >
                         <FileCheck size={12} />
                         License
                       </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
