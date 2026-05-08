'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

type PermissionState = 'default' | 'granted' | 'denied'

export default function PushSubscribeButton() {
  const [status, setStatus] = useState<'loading' | 'unsupported' | 'subscribed' | 'unsubscribed'>('loading')
  const [permission, setPermission] = useState<PermissionState>('default')

  useEffect(() => {
    checkSubscriptionStatus()
  }, [])

  const checkSubscriptionStatus = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    setPermission((Notification.permission || 'default') as PermissionState)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      setStatus(sub ? 'subscribed' : 'unsubscribed')
    } catch {
      setStatus('unsubscribed')
    }
  }

  const subscribe = async () => {
    if (!VAPID_PUBLIC_KEY) { toast.error('Push-Benachrichtigungen sind noch nicht konfiguriert.'); return }
    setStatus('loading')
    try {
      let reg = await navigator.serviceWorker.getRegistration('/sw.js')
      if (!reg) {
        reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        await navigator.serviceWorker.ready
      }
      const perm = await Notification.requestPermission()
      setPermission(perm as PermissionState)
      if (perm !== 'granted') {
        toast.error('Benachrichtigungen wurden verweigert. Bitte in den Browser-Einstellungen aktivieren.')
        setStatus('unsubscribed'); return
      }
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) })
      const subJson = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } }
      const res = await fetch('/api/push-subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subJson.endpoint, keys: subJson.keys }),
      })
      if (!res.ok) throw new Error('Server error')
      setStatus('subscribed')
      toast.success('Benachrichtigungen aktiviert! Du wirst benachrichtigt wenn deine Bestellung abholbereit ist.')
    } catch (err: any) {
      toast.error('Fehler beim Aktivieren: ' + (err.message || 'Unbekannter Fehler'))
      setStatus('unsubscribed')
    }
  }

  const unsubscribe = async () => {
    setStatus('loading')
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        const endpoint = sub.endpoint
        await sub.unsubscribe()
        await fetch('/api/push-subscribe', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint }) })
      }
      setStatus('unsubscribed')
      toast.success('Benachrichtigungen deaktiviert.')
    } catch {
      toast.error('Fehler beim Deaktivieren.')
      setStatus('subscribed')
    }
  }

  if (status === 'unsupported') return null
  if (status === 'loading') return (
    <div className="flex items-center gap-2 text-xs text-neutral-400 py-2">
      <Loader2 size={13} className="animate-spin" />
      Benachrichtigungen werden geladen…
    </div>
  )
  if (permission === 'denied') return (
    <div className="flex items-center gap-2 text-xs text-neutral-400 py-2">
      <BellOff size={13} />
      Benachrichtigungen wurden in den Browser-Einstellungen blockiert
    </div>
  )

  return (
    <button
      onClick={status === 'subscribed' ? unsubscribe : subscribe}
      className={`flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border-2 w-full transition-colors ${
        status === 'subscribed' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-neutral-200 text-neutral-600 bg-white hover:border-brand-300'
      }`}
    >
      {status === 'subscribed' ? (
        <><Bell size={15} className="text-brand-500" />Benachrichtigungen aktiv<span className="ml-auto text-xs text-neutral-400 font-normal">Deaktivieren</span></>
      ) : (
        <><BellOff size={15} />Benachrichtigungen aktivieren<span className="ml-auto text-xs text-neutral-400 font-normal">wenn Bestellung bereit</span></>
      )}
    </button>
  )
}
