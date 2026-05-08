import { ImageResponse } from 'next/og'
import React from 'react'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    React.createElement(
      'div',
      { style: { background: '#f97316', width: '512px', height: '512px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '102px' } },
      React.createElement('div', { style: { color: 'white', fontSize: 256, fontWeight: 'bold', fontFamily: 'sans-serif' } }, 'W')
    ),
    { width: 512, height: 512 }
  )
}
