import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export async function generateInvoicePDF(orderData: {
  orderId: string,
  paymentId: string,
  userName: string,
  userEmail: string,
  userAddress?: string,
  items: { name: string, price: number }[],
  total: number,
  date: string
}) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([600, 800])
  const { width, height } = page.getSize()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Clean Theme Palette
  const skyBlue = rgb(0.0, 0.74, 1.0)
  const charcoal = rgb(0.09, 0.12, 0.18)
  const slate = rgb(0.3, 0.35, 0.45)
  const lightGray = rgb(0.95, 0.96, 0.98)
  const white = rgb(1, 1, 1)

  // Premium Top Accent Bar
  page.drawRectangle({ x: 0, y: height - 10, width: width, height: 10, color: skyBlue })

  // Clean Typography Header instead of messy images
  page.drawText('TUNE COME', {
    x: 50,
    y: height - 60,
    size: 24,
    font: boldFont,
    color: charcoal
  })
  
  page.drawText('GLOBAL SOUNDS & SAMPLES', {
    x: 50,
    y: height - 72,
    size: 8,
    font: boldFont,
    color: skyBlue
  })

  // Official Title
  page.drawText('INVOICE / RECEIPT', {
    x: width - 200,
    y: height - 60,
    size: 18,
    font: boldFont,
    color: charcoal,
  })
  page.drawText('(Digital Goods Delivery)', { x: width - 200, y: height - 72, size: 8, font, color: slate })

  page.drawText(`INV-REF: ${orderData.orderId.slice(-10).toUpperCase()}`, { x: width - 200, y: height - 90, size: 9, font: boldFont, color: charcoal })
  page.drawText(`DATE: ${orderData.date}`, { x: width - 200, y: height - 105, size: 9, font, color: slate })

  // Company Details (Supplier)
  page.drawText('SUPPLIER:', { x: 50, y: height - 130, size: 10, font: boldFont, color: slate })
  page.drawText('TUNE COME INC.', { x: 50, y: height - 145, size: 11, font: boldFont, color: charcoal })
  page.drawText('Global Music Distribution Platform', { x: 50, y: height - 160, size: 9, font, color: slate })
  page.drawText('Web: www.tunecome.com', { x: 50, y: height - 175, size: 9, font, color: slate })
  page.drawText('Email: support@tunecome.com', { x: 50, y: height - 190, size: 9, font, color: slate })

  // Customer Details (Recipient)
  page.drawText('BILL TO (RECIPIENT):', { x: width - 240, y: height - 130, size: 10, font: boldFont, color: slate })
  page.drawText(orderData.userName.toUpperCase() || 'VALUED CUSTOMER', { x: width - 240, y: height - 145, size: 9, font: boldFont, color: charcoal })
  page.drawText(orderData.userEmail.toLowerCase(), { x: width - 240, y: height - 160, size: 9, font, color: slate })
  
  if (orderData.userAddress) {
    const addressLines = orderData.userAddress.match(/.{1,40}/g) || [orderData.userAddress]
    let addrY = height - 175
    addressLines.slice(0, 3).forEach(line => {
      page.drawText(line.toUpperCase(), { x: width - 240, y: addrY, size: 8, font, color: slate })
      addrY -= 12
    })
    page.drawText(`BILLING COUNTRY: ${orderData.userAddress.split(',').pop()?.trim().toUpperCase() || 'GLOBAL'}`, { x: width - 240, y: addrY - 5, size: 8, font: boldFont, color: skyBlue })
  }

  // Main Transaction Table Border (Premium Thin Slate Grid)
  page.drawRectangle({
    x: 50,
    y: 220,
    width: 500,
    height: 350,
    borderWidth: 1,
    borderColor: rgb(0.85, 0.88, 0.93),
  })

  // Table Header (Light Gray Background with Charcoal Text)
  page.drawRectangle({ x: 51, y: 545, width: 498, height: 24, color: lightGray })
  page.drawText('DESCRIPTION OF DIGITAL GOODS', { x: 70, y: 552, size: 9, font: boldFont, color: charcoal })
  page.drawText('AMOUNT (USD)', { x: 450, y: 552, size: 9, font: boldFont, color: charcoal })

  // Items
  let currentY = 520
  orderData.items.forEach((item) => {
    page.drawText(item.name.toUpperCase(), { x: 70, y: currentY, size: 9, font: boldFont, color: charcoal })
    page.drawText(`$${item.price.toFixed(2)}`, { x: 450, y: currentY, size: 9, font: boldFont, color: charcoal })
    
    page.drawLine({
      start: { x: 70, y: currentY - 8 },
      end: { x: 530, y: currentY - 8 },
      thickness: 0.5,
      color: rgb(0.9, 0.92, 0.95),
    })
    currentY -= 30
  })

  // Calculation Block (Clean White card with subtle border and Sky Blue accents)
  const calcTop = 350
  page.drawRectangle({ x: 350, y: calcTop - 60, width: 200, height: 80, color: lightGray })
  page.drawRectangle({ x: 350, y: calcTop - 60, width: 200, height: 80, borderWidth: 1, borderColor: rgb(0.85, 0.88, 0.93) })

  page.drawText('SUBTOTAL:', { x: 365, y: calcTop - 5, size: 9, font: boldFont, color: slate })
  page.drawText(`$${orderData.total.toFixed(2)}`, { x: 470, y: calcTop - 5, size: 9, font: boldFont, color: charcoal })

  page.drawText('TAX / VAT (0%):', { x: 365, y: calcTop - 25, size: 9, font: boldFont, color: slate })
  page.drawText('$0.00', { x: 470, y: calcTop - 25, size: 9, font: boldFont, color: charcoal })

  page.drawLine({ start: { x: 365, y: calcTop - 35 }, end: { x: 535, y: calcTop - 35 }, thickness: 0.5, color: rgb(0.8, 0.83, 0.88) })

  page.drawText('NET PAYABLE:', { x: 365, y: calcTop - 52, size: 10, font: boldFont, color: charcoal })
  page.drawText(`USD $${orderData.total.toFixed(2)}`, { x: 460, y: calcTop - 52, size: 10, font: boldFont, color: skyBlue })

  // Transaction Stamp
  page.drawRectangle({ x: 50, y: 230, width: 140, height: 30, color: skyBlue })
  page.drawText('PAYMENT SUCCESSFUL', { x: 60, y: 241, size: 8, font: boldFont, color: white })

  // Legal declarations (Mandatory for global compliance)
  const legalY = 180
  page.drawText('DECLARATIONS & TERMS:', { x: 50, y: legalY, size: 8, font: boldFont, color: charcoal })
  page.drawText('1. We declare that this invoice shows the actual price of the digital goods described.', { x: 50, y: legalY - 15, size: 7, font, color: slate })
  page.drawText('2. This is a computer generated invoice and does not require a physical signature.', { x: 50, y: legalY - 25, size: 7, font, color: slate })
  page.drawText('3. Digital product access is delivered instantly via email and the user vault library.', { x: 50, y: legalY - 35, size: 7, font, color: slate })
  page.drawText('4. All items are sold as-is and are subject to the global royalty-free end user license agreement.', { x: 50, y: legalY - 45, size: 7, font: boldFont, color: slate })

  // Footer / Branding
  page.drawText('THANK YOU FOR YOUR PATRONAGE', {
    x: 50,
    y: 60,
    size: 10,
    font: boldFont,
    color: charcoal,
  })

  page.drawText('TUNE COME INC. | GLOBAL SOUNDS FOR MODERN PRODUCERS', {
    x: 50,
    y: 45,
    size: 8,
    font: font,
    color: slate,
  })

  page.drawText('SUPPORT & GENERAL INQUIRIES: support@tunecome.com', {
    x: 50,
    y: 30,
    size: 8,
    font: font,
    color: slate,
  })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
