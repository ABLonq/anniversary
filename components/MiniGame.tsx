'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'

const FlappyGame = dynamic(() => import('./games/FlappyGame'), { ssr: false })
const BalloonGame = dynamic(() => import('./games/BalloonGame'), { ssr: false })
const SnakeGame = dynamic(() => import('./games/SnakeGame'), { ssr: false })
const BrickGame = dynamic(() => import('./games/BrickGame'), { ssr: false })

interface Pet { name: string; emoji: string; hunger: number; happiness: number; energy: number; animation: string }

const DEFAULT_KOALA: Pet = { name: 'Gak Gak', emoji: '🐨', hunger: 70, happiness: 80, energy: 90, animation: '' }
const DEFAULT_FROG: Pet = { name: 'Pırt Pırt', emoji: '🐸', hunger: 60, happiness: 75, energy: 85, animation: '' }

const SHOP_FOODS = [
  { emoji: '🍎', price: 5 }, { emoji: '🍓', price: 8 }, { emoji: '🌿', price: 6 },
  { emoji: '🍪', price: 12 }, { emoji: '🍰', price: 20 }, { emoji: '🥕', price: 5 },
]
const SHOP_GAMES = [
  { emoji: '🎾', price: 8 }, { emoji: '🪀', price: 10 }, { emoji: '🎈', price: 12 },
  { emoji: '⭐', price: 15 }, { emoji: '🌸', price: 25 },
]

const ALL_GAMES = [
  { id: 'flappy', label: 'Flappy Koala', icon: '🐨', desc: 'Engelleri atla!' },
  { id: 'balloon', label: 'Balon Patlat', icon: '🎈', desc: '30 saniyede patlat!' },
  { id: 'snake', label: 'Yılan', icon: '🐍', desc: 'Yemi topla!' },
  { id: 'brick', label: 'Top Sıçrat', icon: '🎾', desc: 'Tuğlaları kır!' },
]

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

type Tab = 'pets' | 'tasks' | 'games' | 'shop'
type Inventory = { foods: Record<string, number>; games: Record<string, number> }
type Task = { id: string; label: string; desc: string; reward: number; icon: string; completed: boolean }

export default function MiniGame() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('pets')
  const [koala, setKoala] = useState<Pet>(DEFAULT_KOALA)
  const [frog, setFrog] = useState<Pet>(DEFAULT_FROG)
  const [selectedFood, setSelectedFood] = useState('🍎')
  const [selectedGame, setSelectedGame] = useState('🎾')
  const [message, setMessage] = useState('')
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([])
  const [particleId, setParticleId] = useState(0)
  const [coins, setCoins] = useState(30)
  const [inventory, setInventory] = useState<Inventory>({ foods: { '🍎': 2, '🥕': 1 }, games: { '🎾': 1 } })
  const [dailyTasks, setDailyTasks] = useState<Task[]>([])
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const [gamePlayed, setGamePlayed] = useState(false)
  const petBothRef = useRef({ koala: false, frog: false })
  const feedBothRef = useRef({ koala: false, frog: false })
  const dailyTasksRef = useRef<Task[]>([])

  useEffect(() => {
    dailyTasksRef.current = dailyTasks
    // Mutluluk zaten yüksekse görevi tamamla
    if (koala.happiness >= 80 && frog.happiness >= 80) {
      completeTask('keep_happy')
    }
  }, [dailyTasks])

  useEffect(() => {
    fetch('/api/pets').then(r => r.json()).then(data => {
      setKoala(p => ({ ...p, ...data.koala, animation: '' }))
      setFrog(p => ({ ...p, ...data.frog, animation: '' }))
      setCoins(data.coins || 30)
      if (data.inventory) {
        const inv = data.inventory
        // eski array formatını object formatına çevir
        const foods = Array.isArray(inv.foods)
          ? Object.fromEntries(inv.foods.map((f: string) => [f, 2]))
          : inv.foods
        const games = Array.isArray(inv.games)
          ? Object.fromEntries(inv.games.map((g: string) => [g, 1]))
          : inv.games
        setInventory({ foods, games })
        setGamePlayed(data.gamePlayed || false)
        // Mutluluk kontrolü için kısa bekle
        setTimeout(() => {
          if (data.koala?.happiness >= 80 && data.frog?.happiness >= 80) {
            const tasks = data.dailyTasks || []
            const task = tasks.find((t: Task) => t.id === 'keep_happy')
            if (task && !task.completed) {
              fetch('/api/pets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'complete_task', taskId: 'keep_happy' }),
              }).then(r => r.json()).then(d => {
                if (d.ok) { setCoins(d.coins); setDailyTasks(d.tasks) }
              })
            }
          }
        }, 500)
      }
      if (data.dailyTasks) setDailyTasks(data.dailyTasks)
      setGamePlayed(data.gamePlayed || false)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ koala, frog }),
      }).catch(() => {})
    }, 1000)
    return () => clearTimeout(timer)
  }, [koala, frog])

  useEffect(() => {
    const interval = setInterval(() => {
      setKoala(p => ({ ...p, hunger: Math.max(0, p.hunger - 1), happiness: Math.max(0, p.happiness - 1), energy: Math.max(0, p.energy - 1) }))
      setFrog(p => ({ ...p, hunger: Math.max(0, p.hunger - 1), happiness: Math.max(0, p.happiness - 1), energy: Math.max(0, p.energy - 1) }))
    }, 480000)
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

  const completeTask = useCallback(async (taskId: string) => {
    const tasks = dailyTasksRef.current
    const task = tasks.find(t => t.id === taskId)
    if (!task || task.completed) return
    // Önce UI güncelle
    setDailyTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t))
    setCoins(prev => prev + task.reward)
    showMessage(`+${task.reward} coin kazandın! 🪙`)
    // Arka planda API
    fetch('/api/pets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete_task', taskId }),
    }).catch(() => {})
  }, [])

  const feed = (setPet: typeof setKoala, pet: Pet, e: React.MouseEvent) => {
    const stock = inventory.foods[selectedFood] || 0
    if (stock <= 0) { showMessage('Stok bitti! Mağazadan satın al 🛒'); return }
    // Önce UI güncelle
    setInventory(prev => ({ ...prev, foods: { ...prev.foods, [selectedFood]: stock - 1 } }))
    addParticle(selectedFood, e.clientX, e.clientY)
    animatePet(setPet, 'bounce')
    setPet(p => {
      const updated = { ...p, hunger: Math.min(100, p.hunger + 20), happiness: Math.min(100, p.happiness + 5), energy: Math.min(100, p.energy + 10) }
      const isKoala = pet.name === 'Gak Gak'
      const otherHappiness = isKoala ? frog.happiness : koala.happiness
      if (updated.happiness >= 80 && otherHappiness >= 80) setTimeout(() => completeTask('keep_happy'), 0)
      return updated
    })
    showMessage(`${pet.name} ${selectedFood} yedi! ✨`)
    // Görev takibi
    if (pet.name === 'Gak Gak') feedBothRef.current.koala = true
    else feedBothRef.current.frog = true
    if (feedBothRef.current.koala && feedBothRef.current.frog) completeTask('feed_both')
    // Arka planda API
    fetch('/api/pets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'use_item', item: selectedFood, itemType: 'foods' }),
    }).catch(() => {})
  }

  const play = (setPet: typeof setKoala, pet: Pet, e: React.MouseEvent) => {
    const stock = inventory.games[selectedGame] || 0
    if (stock <= 0) { showMessage('Stok bitti! Mağazadan satın al 🛒'); return }
    // Önce UI güncelle
    setInventory(prev => ({ ...prev, games: { ...prev.games, [selectedGame]: stock - 1 } }))
    addParticle(selectedGame, e.clientX, e.clientY)
    animatePet(setPet, 'spin')
    setPet(p => ({ ...p, happiness: Math.min(100, p.happiness + 25), energy: Math.max(0, p.energy - 15), hunger: Math.max(0, p.hunger - 10) }))
    showMessage(`${pet.name} ${selectedGame} ile oynadı! 🎉`)
    // Arka planda API
    fetch('/api/pets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'use_item', item: selectedGame, itemType: 'games' }),
    }).catch(() => {})
  }

  const petAction = (setPet: typeof setKoala, pet: Pet, e: React.MouseEvent) => {
    addParticle('💕', e.clientX, e.clientY)
    animatePet(setPet, 'wiggle')
    setPet(p => {
      const updated = { ...p, happiness: Math.min(100, p.happiness + 15), energy: Math.min(100, p.energy + 5) }
      const isKoala = pet.name === 'Gak Gak'
      const otherHappiness = isKoala ? frog.happiness : koala.happiness
      if (updated.happiness >= 80 && otherHappiness >= 80) setTimeout(() => completeTask('keep_happy'), 0)
      return updated
    })
    showMessage(`${pet.name} okşandı! 💕`)
    if (pet.name === 'Gak Gak') petBothRef.current.koala = true
    else petBothRef.current.frog = true
    if (petBothRef.current.koala && petBothRef.current.frog) completeTask('pet_both')
  }
  const checkHappyTask = useCallback((k: Pet, f: Pet) => {
    if (k.happiness >= 80 && f.happiness >= 80) completeTask('keep_happy')
  }, [completeTask])
  
  const sleepPet = (setPet: typeof setKoala, pet: Pet) => {
    animatePet(setPet, 'bounce')
    setPet(p => ({ ...p, energy: Math.min(100, p.energy + 40), happiness: Math.min(100, p.happiness + 10) }))
    showMessage(`${pet.name} dinlendi! 💤`)
  }

  const buyItem = async (emoji: string) => {
    const res = await fetch('/api/pets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'buy_item', item: emoji }),
    })
    const data = await res.json()
    if (data.ok) {
      setCoins(data.coins)
      setInventory(data.inventory)
      showMessage(`${emoji} x3 satın alındı! 🛒`)
    } else {
      showMessage(data.error === 'Not enough coins' ? 'Yeterli coin yok! 🪙' : 'Bir hata oluştu')
    }
  }

  const handleGameScore = async (score: number) => {
    const bonus = Math.max(5, Math.min(Math.floor(score * 2), 30))
    // Önce UI güncelle
    setCoins(prev => prev + bonus)
    setGamePlayed(true)
    setDailyTasks(prev => prev.map(t => t.id === 'play_game' ? { ...t, completed: true } : t))
    showMessage(`Tebrikler! +${bonus} coin kazandın! 🪙`)
    setActiveGame(null)
    // Arka planda API
    fetch('/api/pets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'finish_game', score }),
    }).catch(() => {})
  }

  const needsAttention = koala.hunger < 30 || koala.happiness < 30 || frog.hunger < 30 || frog.happiness < 30
  const undoneTasks = dailyTasks.filter(t => !t.completed).length

  const TABS: { id: Tab; icon: string; label: string }[] = [
    { id: 'pets', icon: '🐾', label: 'Hayvanlar' },
    { id: 'tasks', icon: '📋', label: 'Görevler' },
    { id: 'games', icon: '🎮', label: 'Oyunlar' },
    { id: 'shop', icon: '🛒', label: 'Mağaza' },
  ]

  return (
    <>
      <style>{`
        @keyframes petBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes petSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes petWiggle { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-15deg)} 75%{transform:rotate(15deg)} }
        @keyframes floatUp { 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(-60px);opacity:0} }
        @keyframes notifBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      `}</style>

      {needsAttention && !open && (
        <div onClick={() => setOpen(true)} style={{
          position: 'fixed', top: '20px', right: '60px', zIndex: 50,
          background: 'rgba(253,246,236,0.97)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(201,168,76,0.3)', borderRadius: '14px',
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

      {message && (
        <div style={{
          position: 'fixed', bottom: '100px', right: '20px', zIndex: 9998,
          background: 'rgba(253,246,236,0.97)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(201,168,76,0.3)', borderRadius: '14px',
          padding: '10px 16px', boxShadow: '0 4px 20px rgba(201,168,76,0.2)',
          fontFamily: 'Lato', fontSize: '0.8rem', color: '#5a3e3e',
          animation: 'floatUp 2.5s ease forwards', pointerEvents: 'none', whiteSpace: 'nowrap',
        }}>{message}</div>
      )}

      {particles.map(p => (
        <div key={p.id} style={{
          position: 'fixed', left: p.x, top: p.y, zIndex: 9999,
          fontSize: '1.4rem', pointerEvents: 'none',
          animation: 'floatUp 1.2s ease forwards', transform: 'translate(-50%,-50%)',
        }}>{p.emoji}</div>
      ))}

      <button onClick={() => setOpen(p => !p)} style={{
        position: 'fixed', right: 0, top: '20px',
        background: 'rgba(253,246,236,0.95)',
        border: '1px solid rgba(201,168,76,0.3)', borderRight: 'none',
        borderRadius: '12px 0 0 12px', padding: '14px 10px',
        cursor: 'pointer', zIndex: 40,
        boxShadow: '-4px 0 20px rgba(201,168,76,0.15)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
      }}>
        <span style={{ fontSize: '1.1rem' }}>🎮</span>
        {undoneTasks > 0 && (
          <span style={{ background: '#e8a0a0', color: '#fff', borderRadius: '10px', fontSize: '0.6rem', padding: '1px 5px', fontFamily: 'Lato', fontWeight: 700 }}>{undoneTasks}</span>
        )}
        {!open && <span style={{ writingMode: 'vertical-rl', fontSize: '0.65rem', color: '#c9a84c', fontFamily: 'Lato', fontWeight: 700, letterSpacing: '0.1em' }}>OYUN</span>}
      </button>

      <div style={{
        position: 'fixed', right: open ? '0' : '-400px', top: '50%', transform: 'translateY(-50%)',
        width: '380px', maxHeight: '92vh',
        background: 'rgba(253,246,236,0.98)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(201,168,76,0.25)', borderRadius: '20px 0 0 20px',
        boxShadow: '-8px 0 40px rgba(201,168,76,0.15)',
        zIndex: 39, transition: 'right 0.4s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: '#c9a84c', fontSize: '0.65rem', letterSpacing: '0.15em', fontFamily: 'Lato', fontWeight: 700 }}>✦ MİNİ OYUN ✦</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontFamily: 'Lato', fontSize: '0.85rem', color: '#c9a84c', fontWeight: 700 }}>🪙 {coins}</span>
              <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: '#c9a0a0', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setActiveGame(null) }} style={{
                flex: 1, padding: '6px 4px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: tab === t.id ? 'rgba(201,168,76,0.15)' : 'transparent',
                borderBottom: tab === t.id ? '2px solid #c9a84c' : '2px solid transparent',
                fontFamily: 'Lato', fontSize: '0.65rem', color: tab === t.id ? '#5a3e3e' : '#a07070',
                fontWeight: tab === t.id ? 700 : 400,
              }}>
                <div>{t.icon}</div><div>{t.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' as const, padding: '12px' }}>

          {/* PETS */}
          {tab === 'pets' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                {[
                  { title: 'YİYECEK', items: inventory.foods, selected: selectedFood, onSelect: setSelectedFood },
                  { title: 'OYUNCAK', items: inventory.games, selected: selectedGame, onSelect: setSelectedGame },
                ].map(col => (
                  <div key={col.title} style={{ background: 'rgba(253,232,232,0.4)', borderRadius: '12px', padding: '10px' }}>
                    <p style={{ fontFamily: 'Lato', fontSize: '0.65rem', color: '#c9a84c', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '6px' }}>{col.title}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {Object.entries(col.items).map(([emoji, stock]) => (
                        <button key={emoji} onClick={() => col.onSelect(emoji)} style={{
                          padding: '3px 4px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                          background: col.selected === emoji ? 'rgba(201,168,76,0.2)' : 'transparent',
                          outline: col.selected === emoji ? '1.5px solid #c9a84c' : 'none',
                          opacity: stock <= 0 ? 0.35 : 1,
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                        }}>
                          <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
                          <span style={{ fontSize: '0.5rem', color: stock <= 0 ? '#e8a0a0' : '#c9a84c', fontFamily: 'Lato', fontWeight: 700, lineHeight: 1 }}>x{stock}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {[{ petData: koala, setPet: setKoala }, { petData: frog, setPet: setFrog }].map(({ petData, setPet }) => (
                  <div key={petData.name} style={{ flex: 1, background: 'rgba(253,246,236,0.8)', borderRadius: '16px', border: '1px solid rgba(201,168,76,0.2)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div onClick={(e) => petAction(setPet, petData, e)} style={{
                        fontSize: '3rem', cursor: 'pointer', display: 'inline-block',
                        filter: (petData.hunger + petData.happiness + petData.energy) / 3 > 70 ? 'none' : 'grayscale(30%)',
                        animation: petData.animation === 'bounce' ? 'petBounce 0.5s ease' : petData.animation === 'spin' ? 'petSpin 0.5s ease' : petData.animation === 'wiggle' ? 'petWiggle 0.5s ease' : 'none',
                      }}>{petData.emoji}</div>
                      <div style={{ fontSize: '1rem' }}>{getMood(petData)}</div>
                      <p style={{ fontFamily: 'Lato', fontSize: '0.7rem', color: '#c9a84c', fontWeight: 700, marginTop: '2px' }}>{petData.name.toUpperCase()}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {[{ l: '🍽', v: petData.hunger, c: '#e8a0a0' }, { l: '♡', v: petData.happiness, c: '#c9a84c' }, { l: '⚡', v: petData.energy, c: '#90c890' }].map(b => (
                        <div key={b.l}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ fontFamily: 'Lato', fontSize: '0.6rem', color: '#a07070' }}>{b.l}</span>
                            <span style={{ fontFamily: 'Lato', fontSize: '0.6rem', color: '#a07070' }}>{Math.round(b.v)}%</span>
                          </div>
                          <Bar value={b.v} color={b.c} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                      {[
                        { label: '🍽 Besle', action: (e: React.MouseEvent) => feed(setPet, petData, e), color: '#e8a0a0' },
                        { label: '🎮 Oyna', action: (e: React.MouseEvent) => play(setPet, petData, e), color: '#c9a84c' },
                        { label: '💕 Okşa', action: (e: React.MouseEvent) => petAction(setPet, petData, e), color: '#f4c2c2' },
                        { label: '💤 Uyu', action: () => sleepPet(setPet, petData), color: '#b0c8e8' },
                      ].map(btn => (
                        <button key={btn.label} onClick={btn.action as () => void} style={{
                          padding: '6px 4px', borderRadius: '10px', border: `1px solid ${btn.color}`,
                          background: `${btn.color}22`, color: '#5a3e3e', fontSize: '0.65rem',
                          fontFamily: 'Lato', fontWeight: 700, cursor: 'pointer',
                        }}>{btn.label}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* TASKS */}
          {tab === 'tasks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontFamily: 'Lato', fontSize: '0.75rem', color: '#a07070', textAlign: 'center' }}>Günlük görevler her gün sıfırlanır 🌸</p>
              {dailyTasks.length === 0 && (
                <p style={{ fontFamily: 'Lato', fontSize: '0.85rem', color: '#c9a0a0', textAlign: 'center', marginTop: '20px' }}>Yükleniyor... 🌸</p>
              )}
              {dailyTasks.map(task => (
                <div key={task.id} style={{
                  background: task.completed ? 'rgba(144,200,144,0.1)' : 'rgba(253,232,232,0.4)',
                  borderRadius: '14px', padding: '14px',
                  border: `1px solid ${task.completed ? 'rgba(144,200,144,0.4)' : 'rgba(201,168,76,0.2)'}`,
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{task.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'Lato', fontSize: '0.85rem', fontWeight: 700, color: '#5a3e3e', margin: 0 }}>{task.label}</p>
                    <p style={{ fontFamily: 'Lato', fontSize: '0.75rem', color: '#a07070', margin: '2px 0 0' }}>{task.desc}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'Lato', fontSize: '0.8rem', fontWeight: 700, color: '#c9a84c', margin: 0 }}>+{task.reward}🪙</p>
                    {task.completed
                      ? <span style={{ fontSize: '1rem' }}>✅</span>
                      : <span style={{ fontFamily: 'Lato', fontSize: '0.65rem', color: '#c9a0a0' }}>bekliyor</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* GAMES */}
          {tab === 'games' && !activeGame && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                background: gamePlayed ? 'rgba(144,200,144,0.1)' : 'rgba(201,168,76,0.08)',
                borderRadius: '12px', padding: '10px 14px', textAlign: 'center',
                border: `1px solid ${gamePlayed ? 'rgba(144,200,144,0.3)' : 'rgba(201,168,76,0.2)'}`,
              }}>
                {gamePlayed
                  ? <p style={{ fontFamily: 'Lato', fontSize: '0.8rem', color: '#90c890', fontWeight: 700 }}>✅ Bugünkü oyun hakkını kullandın!</p>
                  : <p style={{ fontFamily: 'Lato', fontSize: '0.8rem', color: '#c9a84c', fontWeight: 700 }}>🎮 Bugün 1 oyun hakkın var! Coin kazan 🪙</p>
                }
              </div>
              {ALL_GAMES.map(game => (
                <button key={game.id} onClick={() => !gamePlayed && setActiveGame(game.id)} style={{
                  background: gamePlayed ? 'rgba(0,0,0,0.03)' : 'rgba(253,232,232,0.4)',
                  borderRadius: '16px', padding: '16px',
                  border: '1px solid rgba(201,168,76,0.2)',
                  cursor: gamePlayed ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left',
                  opacity: gamePlayed ? 0.5 : 1,
                }}>
                  <span style={{ fontSize: '2.5rem' }}>{game.icon}</span>
                  <div>
                    <p style={{ fontFamily: 'Lato', fontSize: '0.9rem', fontWeight: 700, color: '#5a3e3e', margin: 0 }}>{game.label}</p>
                    <p style={{ fontFamily: 'Lato', fontSize: '0.75rem', color: '#a07070', margin: '2px 0 0' }}>{game.desc}</p>
                  </div>
                  {!gamePlayed && <span style={{ marginLeft: 'auto', color: '#c9a84c', fontSize: '1.2rem' }}>▶</span>}
                </button>
              ))}
            </div>
          )}

          {tab === 'games' && activeGame === 'flappy' && <FlappyGame onClose={() => setActiveGame(null)} onScore={handleGameScore} />}
          {tab === 'games' && activeGame === 'balloon' && <BalloonGame onClose={() => setActiveGame(null)} onScore={handleGameScore} />}
          {tab === 'games' && activeGame === 'snake' && <SnakeGame onClose={() => setActiveGame(null)} onScore={handleGameScore} />}
          {tab === 'games' && activeGame === 'brick' && <BrickGame onClose={() => setActiveGame(null)} onScore={handleGameScore} />}

          {/* SHOP */}
          {tab === 'shop' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'rgba(201,168,76,0.1)', borderRadius: '12px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Lato', fontSize: '0.85rem', color: '#5a3e3e' }}>Coinlerim</span>
                <span style={{ fontFamily: 'Lato', fontSize: '1rem', fontWeight: 700, color: '#c9a84c' }}>🪙 {coins}</span>
              </div>
              {[
                { title: 'YİYECEKLER', items: SHOP_FOODS, type: 'foods' as const },
                { title: 'OYUNCAKLAR', items: SHOP_GAMES, type: 'games' as const },
              ].map(section => (
                <div key={section.title}>
                  <p style={{ fontFamily: 'Lato', fontSize: '0.7rem', color: '#c9a84c', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '8px' }}>{section.title}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                    {section.items.map(item => {
                      const stock = inventory[section.type]?.[item.emoji] || 0
                      return (
                        <button key={item.emoji} onClick={() => buyItem(item.emoji)} style={{
                          background: stock > 0 ? 'rgba(144,200,144,0.1)' : 'rgba(253,232,232,0.5)',
                          border: `1px solid ${stock > 0 ? 'rgba(144,200,144,0.3)' : 'rgba(201,168,76,0.2)'}`,
                          borderRadius: '12px', padding: '10px 6px', cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                          opacity: coins < item.price ? 0.5 : 1,
                        }}>
                          <span style={{ fontSize: '1.6rem' }}>{item.emoji}</span>
                          {stock > 0 && <span style={{ fontFamily: 'Lato', fontSize: '0.6rem', color: '#90c890', fontWeight: 700 }}>x{stock}</span>}
                          <span style={{ fontFamily: 'Lato', fontSize: '0.7rem', color: '#c9a84c', fontWeight: 700 }}>🪙{item.price} → +3</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  )
}
