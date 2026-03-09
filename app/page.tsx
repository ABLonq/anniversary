'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import PasswordScreen from '@/components/PasswordScreen'
import MemoryGallery from '@/components/MemoryGallery'
import PetalBackground from '@/components/PetalBackground'

const NFC_TOKEN = 'nfc_anniversary_love'
const CORRECT_PASSWORD = '23.04.2025'
const SESSION_KEY = 'anniversary_auth'

export default function Home() {
  const searchParams = useSearchParams()
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const nfcParam = searchParams.get('nfc')
    const sessionAuth = sessionStorage.getItem(SESSION_KEY)

    if (nfcParam === NFC_TOKEN || sessionAuth === 'true') {
      setAuthenticated(true)
    }
    setLoading(false)
  }, [searchParams])

  const handleAuth = (password: string) => {
    if (password === CORRECT_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      setAuthenticated(true)
      return true
    }
    return false
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#fdf6ec' }}>
        <div className="text-gold text-2xl font-display animate-pulse">✦</div>
      </div>
    )
  }

  return (
    <>
      <PetalBackground />
      {authenticated ? (
        <MemoryGallery />
      ) : (
        <PasswordScreen onAuth={handleAuth} />
      )}
    </>
  )
}
