'use client'

import { useState, useEffect, useCallback } from 'react'

interface Pet {
  name: string
  emoji: string
  hunger: number
  happiness: number
  energy: number
  animation: string
}

const FOODS = ['🍎', '🍓', '🌿', '🍪', '🍰', '🥕']
const GAMES = ['🎾', '🪀', '🎈', '⭐', '🌸']

const DEFAULT_KOALA: Pet = { name: 'Koala', emoji: '🐨', hunger: 70, happiness: 80, energy: 90, animation: '' }
const DEFAULT_FROG: Pet = { name: 'Kurbağa', emoji: '🐸', hunger: 60, happiness: 75, energy: 85, animation: '' }

function getMood(pet: Pet) {
  const avg = (pet.hunger + pet.happiness + pet.energy) / 3
  if (avg > 80) return '😊'
  if (avg > 60) return '🙂'
  if (avg > 40) return '😐'
  return '😢'
}

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.4s ease' }} />
    </div>
  )
}

interface PetCardProps {
  petData: Pet
  selectedFood: string
  selectedGame: string
  onFeed: (e: React.MouseEvent) => void
  onPlay: (e: React.MouseEvent) => void
  onPet: (e: React.MouseEvent) => void
  onSleep: () => void
}

function PetCard({ petData, onFeed, onPlay, onPet, onSleep }: PetCardProps) {
  const mood = getMood(petData)
  const isHappy = (petData.hunger + petData.happiness + petData.energy) / 3 > 70
  return (
    <div style={{ flex: 1, background: 'rgba(253,246,236,0.8)', borderRadius: '16px', border: '1px solid rgba(201,168,76,0.2)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ textAlign: 'center' }}>
        <div onClick={onPet} style={{
          fontSize: '3.5rem', cursor: 'pointer', display: 'inline-block',
          filter: isHappy ? 'none' : 'grayscale(30%)',
          animation: petData.animation === 'bounce' ? 'petBounce 0.5s ease' :
            petData.animation === 'spin' ? 'petSpin 0.5s ease' :
            petData.animation === 'wiggle' ? 'petWiggle 0.5s ease' : 'none',
        }}>{petData.emoji}</div>
        <div style={{ fontSize: '1.2rem', marginTop: '-4px' }}>{mood}</div>
        <p style={{ fontFamily: 'Lato', fontSize: '0.75rem', color: '#c9a84c', fontWeight: 700, letterSpacing: '0.08em', marginTop: '2px' }}>{petData.name.toUpperCase()}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {[
          { label: '🍽 Açlık', value: petData.hunger, color: '#e8a0a0' },
          { label: '♡ Mutluluk', value: petData.happiness, color: '#c9a84c' },
          { label: '⚡ Enerji', value: petData.energy, color: '#90c890' },
        ].map(bar => (
          <div key={bar.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Lato', fontSize: '0.65rem', color: '#a07070' }}>{bar.label}</span>
              <span style={{ fontFamily: 'Lato', fontSize: '0.65rem', color: '#a07070' }}>{Math.round(bar.value)}%</span>
            </div>
            <Bar value={bar.value} color={bar.color} />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        {[
          { label: '🍽 Besle', action: onFeed, color: '#e8a0a0' },
          { label: '🎮 Oyna', action: onPlay, color: '#c9a84c' },
          { label: '💕 Okşa', action: onPet, color: '#f4c2c2' },
          { label: '💤 Uyu', action: onSleep, color: '#b0c8e8' },
        ].map(btn => (
          <button key={btn.label} onClick={btn.action as () => void} style={{
            padding: '7px 4px', borderRadius: '10px',
            border: `1px solid ${btn.color}`,
            background: `${btn.color}22`,
            color: '#5a3e3e', fontSize: '0.7rem',
            fontFamily: 'Lato', fontWeight: 700, cursor: 'pointer',
          }}>{btn.label}</button>
        ))}
      </div>
    </div>
  )
}

export default function MiniGame() {
  const [open, setOpen] = useState(false)
  const [koala, setKoala] = useState<Pet>(DEFAULT_KOALA)
  const [frog, setFrog] = useState<Pet>(DEFAULT_FROG)
  const [selectedFood, setSelectedFood] = useState('🍎')
  const [selectedGame, setSelectedGame] = useState('🎾')
  const [message, setMessage] = useState('')
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([])
  const [particleId, setParticleId] = useState(0)

  // localStorage - sadece client'ta çalışır
  useEffect(() => {
    const saved = localStorage.getItem('minigame_pets')
    if (saved) {
      try {
        const { koalaData, frogData, lastSeen } = JSON.parse(saved)
        const minutesPassed = (Date.now() - lastSeen) / 1000 / 60
        const decay = Math.floor(minutesPassed * 0.5)
        setKoala({ ...koalaData, hunger: Math.max(0, koalaData.hunger - decay), happiness: Math.max(0, koalaData.happiness - decay), energy: Math.max(0, koalaData.energy - decay), animation: '' })
        setFrog({ ...frogData, hunger: Math.max(0, frogData.hunger - decay), happiness: Math.max(0, frogData.happiness - decay), energy: Math.max(0, frogData.energy - decay), animation: '' })
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('minigame_pets', JSON.stringify({ koalaData: koala, frogData: frog, lastSeen: Date.now() }))
  }, [koala, frog])

  useEffect(() => {
    const interval = setInterval(() => {
      setKoala(p => ({ ...p, hunger: Math.max(0, p.hunger - 1), happiness: Math.max(0, p.happiness - 1), energy: Math.max(0, p.energy - 1) }))
      setFrog(p => ({ ...p, hunger: Math.max(0, p.hunger - 1), happiness: Math.max(0, p.happiness - 1), energy: Math.max(0, p.energy - 1) }))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const showMessage = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 2500)
  }

  const addParticle = (emoji: string, x: number, y: number) => {
    const id = particleId + 1
    setParticleId(id)
    setParticles(p => [...p, { id, x, y, emoji }])
    setTimeout(() => setParticles(p => p.filter(pt => pt.id !== id)), 1200)
  }

  const animatePet = (setPet: typeof setKoala, anim: string) => {
    setPet(p => ({ ...p, animation: anim }))
    setTimeout(() => setPet(p => ({ ...p, animation: '' })), 600)
  }

  const feed = useCallback((setPet: typeof setKoala, pet: Pet, e: React.MouseEvent) => {
    addParticle(selectedFood, e.clientX, e.clientY)
    animatePet(setPet, 'bounce')
    setPet(p => ({ ...p, hunger: Math.min(100, p.hunger + 20), happiness: Math.min(100, p.happiness + 5), energy: Math.min(100, p.energy + 10) }))
    showMessage(`${pet.name} ${selectedFood} yedi, çok sevdi! ✨`)
  }, [selectedFood, particleId])

  const play = useCallback((setPet: typeof setKoala, pet: Pet, e: React.MouseEvent) => {
    addParticle(selectedGame, e.clientX, e.clientY)
    animatePet(setPet, 'spin')
    setPet(p => ({ ...p, happiness: Math.min(100, p.happiness + 25), energy: Math.max(0, p.energy - 15), hunger: Math.max(0, p.hunger - 10) }))
    showMessage(`${pet.name} ${selectedGame} ile oynadı! 🎉`)
  }, [selectedGame, particleId])

  const petAction = useCallback((setPet: typeof setKoala, pet: Pet, e: React.MouseEvent) => {
    addParticle('💕', e.clientX, e.clientY)
    animatePet(setPet, 'wiggle')
    setPet(p => ({ ...p, happiness: Math.min(100, p.happiness + 15), energy: Math.min(100, p.energy + 5) }))
    showMessage(`${pet.name} okşandı, çok mutlu oldu! 💕`)
  }, [particleId])

  const sleep = (setPet: typeof setKoala, pet: Pet) => {
    animatePet(setPet, 'bounce')
    setPet(p => ({ ...p, energy: Math.min(100, p.energy + 40), happiness: Math.min(100, p.happiness + 10) }))
    showMessage(`${pet.name} uyudu, dinlendi! 💤`)
  }

  const needsAttention = koala.hunger < 30 || koala.happiness < 30 || frog.hunger < 30 || frog.happiness < 30

  return (
    <>
      <style>{`
        @keyframes petBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes petSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes petWiggle { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-15deg)} 75%{transform:rotate(15deg)} }
        @keyframes floatUp { 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(-60px);opacity:0} }
        @keyframes notifBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      `}</style>

      {/* Bildirim */}
      {needsAttention && !open && (
        <div onClick={() => setOpen(true)} style={{
          position: 'fixed', top: '20px', right: '60px', zIndex: 50,
          background: 'rgba(253, 246, 236, 0.97)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(201, 168, 76, 0.3)', borderRadius: '14px',
          padding: '10px 16px', boxShadow: '0 4px 20px rgba(201,168,76,0.2)',
          display: 'flex', alignItems: 'center', gap: '8px',
          animation: 'notifBounce 1.5s ease infinite', cursor: 'pointer',
        }}>
          <span style={{ fontSize: '1.2rem' }}>{koala.hunger < 30 ? '🐨' : '🐸'}</span>
          <span style={{ fontFamily: 'Lato', fontSize: '0.8rem', color: '#5a3e3e', fontWeight: 700 }}>
            {koala.hunger < 30 || frog.hunger < 30 ? 'Acıktım! 🍽' : 'Mutsuzum! 💔'}
          </span>
        </div>
      )}

      {/* Partiküller */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'fixed', left: p.x, top: p.y, zIndex: 9999,
          fontSize: '1.4rem', pointerEvents: 'none',
          animation: 'floatUp 1.2s ease forwards',
          transform: 'translate(-50%, -50%)',
        }}>{p.emoji}</div>
      ))}

      {/* Açma butonu */}
      <button onClick={() => setOpen(p => !p)} style={{
        position: 'fixed', right: 0, top: '35%',
        transform: 'translateY(-50%)',
        background: 'rgba(253, 246, 236, 0.95)',
        border: '1px solid rgba(201, 168, 76, 0.3)',
        borderRight: 'none', borderRadius: '12px 0 0 12px',
        padding: '14px 10px', cursor: 'pointer', zIndex: 40,
        boxShadow: '-4px 0 20px rgba(201, 168, 76, 0.15)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
      }}>
        <span style={{ fontSize: '1.1rem' }}>🎮</span>
        {!open && <span style={{ writingMode: 'vertical-rl', fontSize: '0.65rem', color: '#c9a84c', fontFamily: 'Lato', fontWeight: 700, letterSpacing: '0.1em' }}>OYUN</span>}
      </button>

      {/* Oyun paneli */}
      <div style={{
        position: 'fixed', right: open ? '0' : '-380px', top: '50%',
        transform: 'translateY(-50%)',
        width: '360px', maxHeight: '90vh',
        background: 'rgba(253, 246, 236, 0.98)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(201, 168, 76, 0.25)',
        borderRadius: '20px 0 0 20px',
        boxShadow: '-8px 0 40px rgba(201, 168, 76, 0.15)',
        zIndex: 39, transition: 'right 0.4s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid rgba(201,168,76,0.15)', textAlign: 'center' }}>
          <p style={{ color: '#c9a84c', fontSize: '0.65rem', letterSpacing: '0.15em', fontFamily: 'Lato', fontWeight: 700 }}>✦ MİNİ OYUN ✦</p>
          <p style={{ color: '#a07070', fontSize: '0.75rem', fontFamily: 'Lato', marginTop: '2px' }}>Karakterlere tıklayarak okşa!</p>
        </div>

        <div style={{ padding: '14px', overflowY: 'auto', scrollbarWidth: 'none' as const, flex: 1 }}>
          {message && (
            <div style={{
              background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: '10px', padding: '8px 12px', marginBottom: '12px', textAlign: 'center',
              fontFamily: 'Lato', fontSize: '0.8rem', color: '#5a3e3e',
            }}>{message}</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div style={{ background: 'rgba(253,232,232,0.4)', borderRadius: '12px', padding: '10px' }}>
              <p style={{ fontFamily: 'Lato', fontSize: '0.65rem', color: '#c9a84c', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '6px' }}>YİYECEK SEÇ</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {FOODS.map(f => (
                  <button key={f} onClick={() => setSelectedFood(f)} style={{
                    fontSize: '1.1rem', padding: '3px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    background: selectedFood === f ? 'rgba(201,168,76,0.2)' : 'transparent',
                    outline: selectedFood === f ? '1.5px solid #c9a84c' : 'none',
                  }}>{f}</button>
                ))}
              </div>
            </div>
            <div style={{ background: 'rgba(253,232,232,0.4)', borderRadius: '12px', padding: '10px' }}>
              <p style={{ fontFamily: 'Lato', fontSize: '0.65rem', color: '#c9a84c', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '6px' }}>OYUNCAK SEÇ</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {GAMES.map(g => (
                  <button key={g} onClick={() => setSelectedGame(g)} style={{
                    fontSize: '1.1rem', padding: '3px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    background: selectedGame === g ? 'rgba(201,168,76,0.2)' : 'transparent',
                    outline: selectedGame === g ? '1.5px solid #c9a84c' : 'none',
                  }}>{g}</button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <PetCard
              petData={koala}
              selectedFood={selectedFood}
              selectedGame={selectedGame}
              onFeed={(e) => feed(setKoala, koala, e)}
              onPlay={(e) => play(setKoala, koala, e)}
              onPet={(e) => petAction(setKoala, koala, e)}
              onSleep={() => sleep(setKoala, koala)}
            />
            <PetCard
              petData={frog}
              selectedFood={selectedFood}
              selectedGame={selectedGame}
              onFeed={(e) => feed(setFrog, frog, e)}
              onPlay={(e) => play(setFrog, frog, e)}
              onPet={(e) => petAction(setFrog, frog, e)}
              onSleep={() => sleep(setFrog, frog)}
            />
          </div>

          <p style={{ textAlign: 'center', fontFamily: 'Lato', fontSize: '0.65rem', color: '#c9a0a0', marginTop: '12px' }}>
            ♡ karakterlere tıklayarak okşayabilirsin
          </p>
        </div>
      </div>
    </>
  )
}
