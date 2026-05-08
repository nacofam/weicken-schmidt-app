import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#f97316',
          width: '192px',
          height: '192px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '38px',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 96,
            fontWeight: 'bold',
            fontFamily: 'sans-serif',
            letterSpacing: '-4px',
          }}
        >
          W
        </div>
      </div>
    ),
    { width: 192, height: 192 }
  )
}
