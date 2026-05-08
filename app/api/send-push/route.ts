import { NextRequest, NextResponse } from 'next/server'

// POST /api/send-push
// Sends a Web Push notification to one or all users
// Uses web-push library via dynamic import for edge compatibility

export async function POST(req: NextRequest) {
  const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY
  const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:info@weicken-schmidt.de'

  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return NextResponse.json({ sent: false, reason: 'no_vapid_keys' })
  }

  try {
    const body = await req.json()
    const { userId, title, message, url } = body

    if (!userId || !title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch subscriptions via Supabase REST API (service role)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const subsRes = await fetch(
      `${supabaseUrl}/rest/v1/push_subscriptions?user_id=eq.${userId}&select=endpoint,p256dh,auth`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    )

    if (!subsRes.ok) {
      return NextResponse.json({ sent: false, reason: 'db_error' })
    }

    const subscriptions = await subsRes.json()

    if (subscriptions.length === 0) {
      return NextResponse.json({ sent: false, reason: 'no_subscriptions' })
    }

    // Use web-push to send notifications
    const webpush = await import('web-push')
    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE)

    const payload = JSON.stringify({
      title,
      body: message,
      url: url || '/dashboard',
      tag: 'order-update',
    })

    const results = await Promise.allSettled(
      subscriptions.map((sub: any) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
      )
    )

    const sent = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return NextResponse.json({ sent: true, notifications_sent: sent, failed })
  } catch (err: any) {
    console.error('Push send error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
