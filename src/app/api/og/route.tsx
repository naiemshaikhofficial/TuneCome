import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    // Dynamic parameters
    const title = searchParams.get('title') || 'Tune Come'
    const category = searchParams.get('category') || 'Premium Sounds'
    const price = searchParams.get('price') || ''
    const coverUrl = searchParams.get('image') || ''

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #00000015 2%, transparent 0%), radial-gradient(circle at 75px 75px, #00000015 2%, transparent 0%)',
            backgroundSize: '80px 80px',
            position: 'relative',
            padding: '60px',
          }}
        >
          {/* Main Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
              height: '100%',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '15px 15px 0px #000000',
              padding: '40px',
              gap: '60px',
              zIndex: 10,
              position: 'relative',
              borderRadius: '16px',
            }}
          >
            {/* Background Texture Overlay */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, display: 'flex' }}>
               <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(45deg, #000000, #000000 1px, transparent 1px, transparent 15px)' }} />
            </div>

            {/* Pack Cover Area */}
            <div
              style={{
                display: 'flex',
                width: '380px',
                height: '380px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                boxShadow: '10px 10px 0px #00000020',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '12px',
              }}
            >
              {coverUrl ? (
                <img src={coverUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="cover" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', padding: '20px' }}>
                   <div style={{ fontSize: '110px', fontWeight: '800', color: '#0f172a' }}>TC</div>
                   <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#000000', letterSpacing: '0.4em', marginTop: '-10px', textTransform: 'uppercase' }}>SOUNDS</div>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  padding: '6px 16px',
                  fontSize: '18px',
                  fontWeight: '700',
                  letterSpacing: '0.2em',
                  width: 'fit-content',
                  marginBottom: '24px',
                  textTransform: 'uppercase',
                  borderRadius: '6px',
                  boxShadow: '4px 4px 0px #00000020',
                }}
              >
                {category}
              </div>

              <h1
                style={{
                  fontSize: '85px',
                  color: '#0f172a',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.04em',
                  lineHeight: 0.9,
                  marginBottom: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  fontStyle: 'italic',
                }}
              >
                {title.split(' ').map((word, i) => (
                  <span key={i} style={{ color: i % 2 === 0 ? '#0f172a' : '#000000' }}>{word}</span>
                ))}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                {price && (
                  <div
                    style={{
                      fontSize: '42px',
                      backgroundColor: '#00000010',
                      color: '#000000',
                      border: '1px solid #00000030',
                      padding: '4px 18px',
                      fontWeight: '800',
                      borderRadius: '8px',
                    }}
                  >
                    ${price}
                  </div>
                )}
                <div style={{ fontSize: '20px', color: '#000000', fontWeight: '700', letterSpacing: '0.3em' }}>
                   TUNECOME.COM
                </div>
              </div>
            </div>
          </div>

          {/* Subtle decoration */}
          <div style={{ position: 'absolute', bottom: '25px', right: '35px', color: '#000000', fontSize: '60px', fontWeight: '800', opacity: 0.05, fontStyle: 'italic' }}>
            CREATIVE SAMPLES
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      }
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
