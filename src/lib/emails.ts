import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tunecome.com'

export async function sendInvoiceEmail({
  email,
  pdfBuffer,
  orderId,
  packNames,
  userName,
  total,
  items,
  isPreorder = false
}: {
  email: string,
  pdfBuffer: Buffer,
  orderId: string,
  packNames: string[],
  userName?: string,
  total?: number,
  items?: { name: string, price: number }[],
  isPreorder?: boolean
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Tune Come <info@tunecome.com>',
      to: email,
      subject: isPreorder ? `Pre-order Confirmed! - Order #${orderId}` : `Your Purchase is Ready! - Order #${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @media only screen and (max-width: 600px) {
              .content { padding: 24px !important; }
              .header { padding: 30px 24px !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
                  
                  <!-- Top Sky Blue Border -->
                  <tr>
                    <td style="background-color: #00BFFF; height: 6px;"></td>
                  </tr>

                  <!-- Header -->
                  <tr>
                    <td align="center" class="header" style="padding: 40px 40px 30px 40px; background-color: #ffffff; border-bottom: 1px solid #f1f5f9;">
                      <h2 style="margin: 0 0 10px 0; color: #00BFFF; font-size: 26px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
                        TUNE COME
                      </h2>
                      <p style="margin: 0; color: #64748b; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">
                        Global Music Distribution Platform
                      </p>
                      <h1 style="margin: 25px 0 0 0; color: #0f172a; font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.5px;">
                        ${isPreorder ? 'Pre-Order Confirmed' : 'Thank You for Your Order'}
                      </h1>
                    </td>
                  </tr>

                  <!-- Main Content Section -->
                  <tr>
                    <td class="content" style="padding: 40px 40px; background-color: #ffffff;">
                      <p style="margin: 0 0 16px 0; color: #64748b; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                        Hello ${userName?.toUpperCase() || 'VALUED CUSTOMER'},
                      </p>
                      
                      <p style="margin: 0 0 30px 0; font-size: 15px; font-weight: 400; color: #334155; line-height: 1.6;">
                        Your purchase of <strong style="color: #0f172a;">${packNames.join(' & ')}</strong> was successful. 
                        ${isPreorder ? "We are actively finalizing this pack in the studio. You'll receive an instant notification as soon as the full package is released and ready for download." : "Your samples are successfully unlocked and ready for your production session!"}
                      </p>

                      <!-- Receipt Table -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; background-color: #fafafa;">
                        <tr style="background-color: #f1f5f9;">
                          <td style="padding: 12px 16px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Item Description</td>
                          <td align="right" style="padding: 12px 16px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Price</td>
                        </tr>
                        ${items?.map(item => `
                        <tr>
                          <td style="padding: 16px; font-size: 14px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${item.name.toUpperCase()}</td>
                          <td align="right" style="padding: 16px; font-size: 14px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0;">$${item.price.toFixed(2)}</td>
                        </tr>
                        `).join('') || `
                          <tr>
                            <td style="padding: 16px; font-size: 14px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${packNames.join(', ')}</td>
                            <td align="right" style="padding: 16px; font-size: 14px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0;">$${(total || 0).toFixed(2)}</td>
                          </tr>
                        `}
                        <tr>
                          <td style="padding: 16px; font-size: 15px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">Total Paid</td>
                          <td align="right" style="padding: 16px; font-size: 16px; font-weight: 800; color: #00BFFF;">$${(total || 0).toFixed(2)}</td>
                        </tr>
                      </table>

                      <!-- Library CTA Button -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 40px 0 20px 0;">
                        <tr>
                          <td align="center">
                            <table border="0" cellpadding="0" cellspacing="0">
                              <tr>
                                <td align="center" style="background-color: #00BFFF; border-radius: 6px;">
                                  <a href="${SITE_URL}/library" 
                                     style="display: inline-block; color: #ffffff; padding: 16px 40px; font-size: 14px; font-weight: 700; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">
                                     ${isPreorder ? 'View in Vault' : 'Access My Library'}
                                  </a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer Section -->
                  <tr>
                    <td style="padding: 40px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                      <div style="margin-bottom: 25px;">
                        <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: 700; color: #00BFFF; text-transform: uppercase; letter-spacing: 2px;">
                          Need Assistance?
                        </p>
                        <p style="margin: 0; font-size: 13px; color: #64748b;">
                          Contact our team at <a href="mailto:support@tunecome.com" style="color: #64748b; text-decoration: underline; font-weight: 600;">support@tunecome.com</a>
                        </p>
                      </div>

                      <p style="margin: 0 0 25px 0; font-size: 10px; color: #94a3b8; line-height: 1.6; text-transform: uppercase; letter-spacing: 0.5px;">
                        TUNE COME INC. | GLOBAL SOUND DISTRIBUTIONS
                      </p>
                      
                      <p style="margin: 0; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">
                        &copy; 2026 TUNE COME. ALL RIGHTS RESERVED.
                      </p>

                      <!-- Unique ID to prevent Gmail quoting/collapsing -->
                      <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px;">
                        Order Ref: ${orderId}-${Date.now()}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `Invoice-${orderId}.pdf`,
          content: pdfBuffer,
        },
      ],
    })

    if (error) {
      console.error('[RESEND_ERROR]', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (err) {
    console.error('[SEND_EMAIL_ERROR]', err)
    return { success: false, error: err }
  }
}
