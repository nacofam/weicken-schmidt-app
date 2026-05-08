import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#f97316',
          width: '512px',
          height: '512px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '96px',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 260,
            fontWeight: 'bold',
            fontFamily: 'sans-serif',
            letterSpacing: '-10px',
          }}
        >
          W
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  )
}
