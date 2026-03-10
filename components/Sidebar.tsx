'use client'

import { useState } from 'react'
import { Category } from '@/lib/types'

interface Props {
  active: Category
  counts: Record<string, number>
  onChange: (cat: Category) => void
  onExpandChange?: (expanded: boolean) => void
}

const CATEGORIES = [
  { id: 'tumü' as Category, label: 'Tümü', icon: '✦' },
  { id: 'gezdigimiz-yerler' as Category, label: 'Gezdiğimiz Yerler', icon: '🗺️' },
  { id: 'onemli-anilar' as Category, label: 'Önemli Anılar', icon: '⭐' },
  { id: 'romantik-anlar' as Category, label: 'Romantik Anlar', icon: '♡' },
  { id: 'ilk-kezler' as Category, label: 'İlk Kez\'ler', icon: '🌸' },
  { id: 'kutlamalar' as Category, label: 'Kutlamalar', icon: '🎉' },
]

export default function Sidebar({ active, counts, onChange, onExpandChange }: Props) {
  const [expanded, setExpanded] = useState(true)

  const toggle = (val: boolean) => {
    setExpanded(val)
    onExpandChange?.(val)
  }
  
  return (
    <>
      

      {/* Sidebar */}
      <aside style={{
        position: 'fixed',
        top: 0, left: 0,
        height: '100vh',
        width: expanded ? '240px' : '0px',
        background: 'rgba(253, 246, 236, 0.97)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(201, 168, 76, 0.2)',
        zIndex: 30,
        transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        boxShadow: expanded ? '4px 0 30px rgba(201, 168, 76, 0.1)' : 'none',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '2rem 1.5rem 1rem', borderBottom: '1px solid rgba(201, 168, 76, 0.15)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: '#c9a84c', fontSize: '0.65rem', letterSpacing: '0.15em', fontFamily: 'Lato', fontWeight: 700 }}>KATEGORİLER</p>
              <div style={{ width: '30px', height: '1px', background: 'linear-gradient(to right, #c9a84c, transparent)', marginTop: '4px' }} />
            </div>
            <button onClick={() => setExpanded(false)} style={{ background: 'transparent', border: 'none', color: '#c9a0a0', cursor: 'pointer', fontSize: '1rem', padding: '4px' }}>✕</button>
          </div>
        </div>

        {/* Categories */}
        <nav style={{ padding: '1rem 0.75rem', flex: 1, overflowY: 'auto', scrollbarWidth: 'none' as const }}>
          {CATEGORIES.map((cat) => {
            const isActive = active === cat.id
            const count = cat.id === 'tumü'
              ? Object.values(counts).reduce((a, b) => a + b, 0)
              : (counts[cat.id] || 0)
            return (
              <button
                key={cat.id}
                onClick={() => { onChange(cat.id); if (window.innerWidth < 1024) setExpanded(false) }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  marginBottom: '4px',
                  borderRadius: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(232,213,163,0.1))' : 'transparent',
                  borderLeft: isActive ? '3px solid #c9a84c' : '3px solid transparent',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(201,168,76,0.07)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{cat.icon}</span>
                  <span style={{
                    fontFamily: 'Lato', fontSize: '0.85rem',
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? '#5a3e3e' : '#8a6060',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{cat.label}</span>
                </div>
                <span style={{
                  fontFamily: 'Lato', fontSize: '0.7rem', fontWeight: 700,
                  color: isActive ? '#c9a84c' : '#c9a0a0',
                  background: isActive ? 'rgba(201,168,76,0.12)' : 'rgba(201,168,76,0.06)',
                  borderRadius: '10px', padding: '2px 8px', flexShrink: 0,
                }}>{count}</span>
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(201, 168, 76, 0.1)' }}>
          <p style={{ color: '#c9a0a0', fontSize: '0.7rem', fontFamily: 'Lato', textAlign: 'center', letterSpacing: '0.05em' }}>♡ anılarımız</p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {expanded && (
        <div className="lg:hidden fixed inset-0 z-20"
          style={{ background: 'rgba(90,62,62,0.2)', backdropFilter: 'blur(2px)' }}
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Toggle when closed */}
      {!expanded && (
        <button onClick={() => setExpanded(true)} style={{
          position: 'fixed', top: '50%', left: 0,
          transform: 'translateY(-50%)',
          background: 'rgba(253, 246, 236, 0.95)',
          border: '1px solid rgba(201, 168, 76, 0.3)',
          borderLeft: 'none',
          borderRadius: '0 12px 12px 0',
          padding: '16px 10px',
          color: '#c9a84c', cursor: 'pointer',
          fontSize: '0.8rem', zIndex: 30,
          boxShadow: '4px 0 20px rgba(201, 168, 76, 0.1)',
          writingMode: 'vertical-rl',
          letterSpacing: '0.1em',
          fontFamily: 'Lato',
        }}>
          KATEGORİLER
        </button>
      )}
    </>
  )
}
