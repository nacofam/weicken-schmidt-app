import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: '#f97316',
        width: '100%',
        height: '100%',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ color: 'white', fontSize: 18, fontWeight: 'bold', letterSpacing: '-1px' }}>
        W
      </div>
    </div>,
    { ...size }
  )
}
