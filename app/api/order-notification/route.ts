import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json()
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Fetch order with customer profile
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        created_at,
        profiles!orders_user_id_fkey(
          full_name,
          email,
          phone
        ),
        order_items (
          quantity,
          unit,
          product_name
        )
      `)
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const customer = (order as any).profiles
    const items = (order as any).order_items as any[]
    const customerEmail = customer?.email
    const customerName = customer?.full_name || 'Kunde'

    if (!customerEmail) {
      return NextResponse.json({ error: 'No customer email' }, { status: 400 })
    }

    // Build item summary
    const itemSummary = items
      ?.map((i: any) => `${i.quantity} ${i.unit || 'x'} ${i.product_name}`)
      .join(', ') || 'Ihre Bestellung'

    // Send via Resend API (no npm package needed)
    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      console.log('[order-notification] RESEND_API_KEY not set — skipping email')
      return NextResponse.json({ sent: false, reason: 'no_api_key' })
    }

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Weicken & Schmidt <noreply@weicken-schmidt.de>',
        to: [customerEmail],
        subject: '✅ Ihre Bestellung ist abholbereit',
        html: `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#262626;">
  <div style="background:#f97316;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
    <h1 style="color:white;margin:0;font-size:20px;">Weicken &amp; Schmidt</h1>
    <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:13px;">Farben &amp; Malerbedarf · Witten</p>
  </div>

  <h2 style="color:#16a34a;font-size:18px;margin-bottom:8px;">
    ✅ Ihre Bestellung ist abholbereit!
  </h2>
  <p style="color:#525252;font-size:15px;line-height:1.6;margin-bottom:16px;">
    Hallo ${customerName},<br/><br/>
    Ihre Bestellung ist fertig und kann jetzt bei uns im Laden abgeholt werden.
  </p>

  <div style="background:#f5f5f5;border-radius:10px;padding:16px;margin-bottom:20px;">
    <p style="margin:0 0 6px;font-size:13px;color:#737373;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Bestellung</p>
    <p style="margin:0;font-size:14px;color:#262626;">${itemSummary}</p>
  </div>

  <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px;margin-bottom:24px;">
    <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#9a3412;">📍 Abholadresse</p>
    <p style="margin:0;font-size:14px;color:#7c2d12;line-height:1.6;">
      Weicken &amp; Schmidt<br/>
      Ruhrstraße 57<br/>
      58452 Witten
    </p>
  </div>

  <p style="font-size:13px;color:#a3a3a3;border-top:1px solid #e5e5e5;padding-top:16px;margin:0;">
    Diese Nachricht wurde automatisch aus der Weicken &amp; Schmidt App gesendet.
  </p>
</body>
</html>
        `,
      }),
    })

    if (!emailRes.ok) {
      const err = await emailRes.text()
      console.error('[order-notification] Resend error:', err)
      return NextResponse.json({ sent: false, error: err }, { status: 500 })
    }

    return NextResponse.json({ sent: true })
  } catch (err) {
    console.error('[order-notification] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
