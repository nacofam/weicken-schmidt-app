import { ImageResponse } from 'next/og'
import React from 'react'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    React.createElement(
      'div',
      { style: { background: '#f97316', width: '192px', height: '192px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '38px' } },
      React.createElement('div', { style: { color: 'white', fontSize: 96, fontWeight: 'bold', fontFamily: 'sans-serif' } }, 'W')
    ),
    { width: 192, height: 192 }
  )
}
