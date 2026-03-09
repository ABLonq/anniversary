'use client'

import { MemoryCard } from '@/lib/types'

interface Props {
  card: MemoryCard
  onDelete: (id: string) => void
  onClick: () => void
}

export default function CardItem({ card, onDelete, onClick }: Props) {
  return (
    <div
      className="memory-card"
      style={{
        background: 'rgba(253, 246, 236, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        border: '1px solid rgba(201, 168, 76, 0.25)',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(201, 168, 76, 0.1)',
      }}
      onClick={onClick}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
        <img
          src={card.imageUrl}
          alt={card.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(90,62,62,0.4) 0%, transparent 50%)'
        }} />
        {/* Date badge */}
        <div style={{
          position: 'absolute', bottom: '10px', left: '12px',
          background: 'rgba(253,246,236,0.9)',
          borderRadius: '20px', padding: '3px 10px',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <span style={{ color: '#c9a84c', fontSize: '0.6rem' }}>✦</span>
          <span className="font-body" style={{ color: '#5a3e3e', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
            {card.date}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.2rem' }}>
        <h3
          className="font-display"
          style={{ fontSize: '1.4rem', color: '#5a3e3e', fontWeight: 400, marginBottom: '0.4rem' }}
        >
          {card.title}
        </h3>
        <p
          className="font-body"
          style={{
            color: '#a07070', fontSize: '0.85rem', lineHeight: 1.6,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}
        >
          {card.meaning}
        </p>

        {/* Delete button */}
        <div className="flex justify-end mt-3">
          <button
            onClick={e => { e.stopPropagation(); onDelete(card.id) }}
            className="font-body"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#d0a0a0',
              fontSize: '0.75rem',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#c27070')}
            onMouseLeave={e => (e.currentTarget.style.color = '#d0a0a0')}
          >
            💔 sil
          </button>
        </div>
      </div>
    </div>
  )
}
