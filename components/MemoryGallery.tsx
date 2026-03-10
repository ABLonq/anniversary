'use client'

import { useEffect, useState } from 'react'
import { MemoryCard, Category } from '@/lib/types'
import CardItem from './CardItem'
import CreateCardModal from './CreateCardModal'
import EditCardModal from './EditCardModal'
import Sidebar from './Sidebar'

export default function MemoryGallery() {
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editCard, setEditCard] = useState<MemoryCard | null>(null)
  const [selectedCard, setSelectedCard] = useState<MemoryCard | null>(null)
  const [activeCategory, setActiveCategory] = useState<Category>('tumü')

  const fetchCards = async () => {
    try {
      const res = await fetch('/api/cards')
      const data = await res.json()
      setCards(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCards() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Bu anıyı silmek istediğinden emin misin? 💔')) return
    await fetch(`/api/cards/${id}`, { method: 'DELETE' })
    setCards(prev => prev.filter(c => c.id !== id))
    if (selectedCard?.id === id) setSelectedCard(null)
  }

  const handleCreated = (card: MemoryCard) => {
    setCards(prev => [card, ...prev])
    setShowCreate(false)
  }

  const handleUpdated = (updated: MemoryCard) => {
    setCards(prev => prev.map(c => c.id === updated.id ? updated : c))
    setEditCard(null)
    if (selectedCard?.id === updated.id) setSelectedCard(updated)
  }

  const counts = cards.reduce((acc, card) => {
    const cat = card.category || 'onemli-anilar'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const filtered = activeCategory === 'tumü' ? cards : cards.filter(c => c.category === activeCategory)

  return (
    <div className="flex min-h-screen">
      <Sidebar active={activeCategory} counts={counts} onChange={setActiveCategory} />

      <div className="flex-1 relative z-10 lg:ml-[240px]">
        <header className="text-center pt-14 pb-8 px-4 fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div style={{ width: '60px', height: '1px', background: 'linear-gradient(to right, transparent, #c9a84c)' }} />
            <span style={{ color: '#c9a84c', fontSize: '1.2rem' }}>✦</span>
            <div style={{ width: '60px', height: '1px', background: 'linear-gradient(to left, transparent, #c9a84c)' }} />
          </div>
          <h1 className="font-display" style={{ fontSize: '3.5rem', color: '#5a3e3e', fontWeight: 300, lineHeight: 1.1 }}>Anılarımız</h1>
          <p className="font-body mt-3" style={{ color: '#a07070', fontWeight: 300, fontSize: '1rem', letterSpacing: '0.08em' }}>Seninle geçirdiğimiz her özel an...</p>
          <div className="flex items-center justify-center gap-2 mt-4 mb-6">
            {['♡', '✦', '♡'].map((s, i) => (<span key={i} style={{ color: '#e8d5a3', fontSize: '0.75rem' }}>{s}</span>))}
          </div>
          <button onClick={() => setShowCreate(true)} className="font-body gold-shimmer" style={{
            borderRadius: '50px', padding: '12px 28px', color: '#fff',
            fontSize: '0.85rem', letterSpacing: '0.12em', fontWeight: 700,
            cursor: 'pointer', border: 'none', boxShadow: '0 4px 20px rgba(201, 168, 76, 0.3)',
          }}>✦ YENİ ANI EKLE</button>
        </header>

        <main className="max-w-5xl mx-auto px-4 pb-16">
          {loading ? (
            <div className="text-center py-20">
              <div style={{ color: '#c9a84c', fontSize: '2rem' }} className="animate-pulse">♡</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 fade-in">
              <p style={{ color: '#c9a84c', fontSize: '3rem' }}>🌸</p>
              <p className="font-display mt-4" style={{ color: '#a07070', fontSize: '1.4rem', fontWeight: 300 }}>Henüz anı yok</p>
              <p className="font-body mt-2" style={{ color: '#c9a0a0', fontSize: '0.9rem' }}>İlk anını ekleyerek başla ♡</p>
            </div>
          ) : (
            <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
              {filtered.map((card, i) => (
                <div key={card.id} className="fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <CardItem card={card} onDelete={handleDelete} onEdit={() => setEditCard(card)} onClick={() => setSelectedCard(card)} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {showCreate && <CreateCardModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
      {editCard && <EditCardModal card={editCard} onClose={() => setEditCard(null)} onUpdated={handleUpdated} />}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onDelete={handleDelete}
          onEdit={() => { setEditCard(selectedCard); setSelectedCard(null) }}
        />
      )}
    </div>
  )
}

function CardDetailModal({ card, onClose, onDelete, onEdit }: {
  card: MemoryCard; onClose: () => void; onDelete: (id: string) => void; onEdit: () => void
}) {
  const images = card.photos && card.photos.length > 0 ? card.photos : [card.imageUrl]
  const [current, setCurrent] = useState(0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={onClose}>
      <div className="w-full max-w-lg fade-in" onClick={e => e.stopPropagation()} style={{
        background: 'rgba(253, 246, 236, 0.97)', backdropFilter: 'blur(20px)',
        borderRadius: '24px', border: '1px solid rgba(201, 168, 76, 0.3)',
        overflow: 'hidden', boxShadow: '0 30px 80px rgba(90, 62, 62, 0.3)',
        maxHeight: '90vh', overflowY: 'auto' as const, scrollbarWidth: 'none' as const,
      }}>
        <div style={{ position: 'relative', height: '280px', overflow: 'hidden' }}>
          {images.map((src, i) => (
            <img key={i} src={src} alt={card.title} style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', opacity: i === current ? 1 : 0, transition: 'opacity 0.6s ease',
            }} />
          ))}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(90,62,62,0.5) 0%, transparent 60%)' }} />
          <button onClick={onClose} style={{
            position: 'absolute', top: '12px', right: '12px',
            background: 'rgba(253,246,236,0.8)', border: 'none', borderRadius: '50%',
            width: '36px', height: '36px', cursor: 'pointer', color: '#5a3e3e',
            fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
          {images.length > 1 && (
            <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
              {images.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} style={{
                  width: i === current ? '20px' : '8px', height: '8px',
                  borderRadius: '4px', border: 'none', cursor: 'pointer',
                  background: i === current ? '#c9a84c' : 'rgba(253,246,236,0.6)',
                  transition: 'all 0.3s ease', padding: 0,
                }} />
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: '2rem' }}>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ color: '#c9a84c', fontSize: '0.75rem' }}>✦</span>
            <span className="font-body" style={{ color: '#c9a84c', fontSize: '0.8rem', letterSpacing: '0.1em' }}>{card.date}</span>
          </div>
          <h2 className="font-display mb-4" style={{ fontSize: '2rem', color: '#5a3e3e', fontWeight: 400 }}>{card.title}</h2>
          <p className="font-body" style={{ color: '#7a5858', lineHeight: 1.8, fontSize: '0.95rem' }}>{card.meaning}</p>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onEdit} className="font-body" style={{
              background: 'transparent', border: '1px solid rgba(201,168,76,0.4)',
              borderRadius: '8px', padding: '8px 16px', color: '#c9a84c', fontSize: '0.8rem', cursor: 'pointer',
            }}>✦ Düzenle</button>
            <button onClick={() => { onDelete(card.id); onClose() }} className="font-body" style={{
              background: 'transparent', border: '1px solid #e8a0a0',
              borderRadius: '8px', padding: '8px 16px', color: '#c27070', fontSize: '0.8rem', cursor: 'pointer',
            }}>💔 Sil</button>
          </div>
        </div>
      </div>
    </div>
  )
}
