'use client'

import { useState } from 'react'

interface Props {
  onAuth: (password: string) => boolean
}

export default function PasswordScreen({ onAuth }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  const handleSubmit = () => {
    const success = onAuth(password)
    if (!success) {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 600)
      setTimeout(() => setError(false), 3000)
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
      <div
        className={`w-full max-w-md text-center fade-in ${shake ? 'animate-bounce' : ''}`}
        style={{
          background: 'rgba(253, 246, 236, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(201, 168, 76, 0.3)',
          borderRadius: '24px',
          padding: '3rem 2.5rem',
          boxShadow: '0 20px 60px rgba(201, 168, 76, 0.15), 0 4px 20px rgba(90, 62, 62, 0.1)',
        }}
      >
        {/* Decorative top */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(to right, transparent, #c9a84c)' }} />
          <span style={{ color: '#c9a84c', fontSize: '1.4rem' }}>♡</span>
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(to left, transparent, #c9a84c)' }} />
        </div>

        <h1
          className="font-display mb-2"
          style={{ fontSize: '2.8rem', color: '#5a3e3e', fontWeight: 300, lineHeight: 1.1 }}
        >
          Anılarımız
        </h1>
        <p
          className="font-body mb-8"
          style={{ color: '#a07070', fontWeight: 300, fontSize: '0.95rem', letterSpacing: '0.05em' }}
        >
          Bu özel yere girmek için şifreyi girin
        </p>

        {/* Heart decorations */}
        <div className="flex justify-center gap-3 mb-8">
          {['✦', '♡', '✦'].map((sym, i) => (
            <span key={i} style={{ color: '#e8d5a3', fontSize: '0.8rem' }}>{sym}</span>
          ))}
        </div>

        <div className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Şifreni gir..."
            className="w-full text-center font-body"
            style={{
              background: 'rgba(253, 232, 232, 0.5)',
              border: `1px solid ${error ? '#e8a0a0' : 'rgba(201, 168, 76, 0.3)'}`,
              borderRadius: '12px',
              padding: '14px 20px',
              color: '#5a3e3e',
              fontSize: '1.1rem',
              letterSpacing: '0.15em',
              transition: 'all 0.3s ease',
            }}
          />

          {error && (
            <p style={{ color: '#c27070', fontSize: '0.85rem', fontFamily: 'Lato' }}>
              Şifre yanlış, tekrar dene 💔
            </p>
          )}

          <button
            onClick={handleSubmit}
            className="w-full font-body gold-shimmer"
            style={{
              borderRadius: '12px',
              padding: '14px 20px',
              color: '#fff',
              fontSize: '0.95rem',
              letterSpacing: '0.1em',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            GİR ♡
          </button>
        </div>

        {/* Bottom decoration */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <div style={{ width: '30px', height: '1px', background: 'linear-gradient(to right, transparent, #e8d5a3)' }} />
          <span style={{ color: '#e8d5a3', fontSize: '0.7rem' }}>✦ ✦ ✦</span>
          <div style={{ width: '30px', height: '1px', background: 'linear-gradient(to left, transparent, #e8d5a3)' }} />
        </div>
      </div>
    </div>
  )
}
