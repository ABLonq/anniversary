'use client'
import { useState, useEffect, useRef } from 'react'

interface Props { onClose: () => void; onScore: (score: number) => void }
interface Balloon { id: number; x: number; y: number; speed: number; emoji: string; popped: boolean }

export default function BalloonGame({ onClose, onScore }: Props) {
  const [balloons, setBalloons] = useState<Balloon[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const idRef = useRef(0)
  const scoreRef = useRef(0)

  useEffect(() => {
    if (!started || finished) return
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setFinished(true); onScore(scoreRef.current); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [started, finished])

  useEffect(() => {
    if (!started || finished) return
    const interval = setInterval(() => {
      const emojis = ['🎈', '🎀', '🌸', '💕', '⭐', '🍎', '🐨', '🐸']
      idRef.current++
      setBalloons(b => [...b, { id: idRef.current, x: 10 + Math.random() * 80, y: 0, speed: 0.8 + Math.random() * 1.2, emoji: emojis[Math.floor(Math.random() * emojis.length)], popped: false }])
    }, 600)
    return () => clearInterval(interval)
  }, [started, finished])

  useEffect(() => {
    if (!started || finished) return
    const interval = setInterval(() => {
      setBalloons(b => b.filter(bl => !bl.popped && bl.y < 110).map(bl => ({ ...bl, y: bl.y + bl.speed })))
    }, 16)
    return () => clearInterval(interval)
  }, [started, finished])

  const pop = (id: number) => {
    setBalloons(b => b.map(bl => bl.id === id ? { ...bl, popped: true } : bl))
    scoreRef.current++; setScore(scoreRef.current)
  }

  const restart = () => {
    setBalloons([]); setScore(0); scoreRef.current = 0; setTimeLeft(30); setFinished(false)
  }

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px' }}>
        <span style={{ fontFamily: 'Lato', fontSize: '0.8rem', color: '#c9a84c', fontWeight: 700 }}>🎈 Balon Patlat</span>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Lato', fontSize: '0.85rem', color: '#5a3e3e', fontWeight: 700 }}>⭐ {score}</span>
          <span style={{ fontFamily: 'Lato', fontSize: '0.85rem', color: '#e8a0a0', fontWeight: 700 }}>⏱ {timeLeft}s</span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#c9a0a0', fontSize: '1rem', cursor: 'pointer' }}>✕</button>
        </div>
      </div>
      <div onClick={() => !started && setStarted(true)} style={{
        width: '100%', height: '420px', background: 'linear-gradient(to bottom, #fde8f0, #fdf6ec)',
        borderRadius: '12px', border: '1px solid rgba(201,168,76,0.2)',
        position: 'relative', overflow: 'hidden', cursor: started ? 'default' : 'pointer',
      }}>
        {!started && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '3rem' }}>🎈</p>
            <p style={{ fontFamily: 'Lato', color: '#5a3e3e', fontWeight: 700 }}>Balonları patlat!</p>
            <p style={{ fontFamily: 'Lato', fontSize: '0.8rem', color: '#a07070' }}>Başlamak için dokun</p>
          </div>
        )}
        {balloons.filter(b => !b.popped).map(b => (
          <button key={b.id} onClick={() => pop(b.id)} style={{
            position: 'absolute', left: `${b.x}%`, top: `${b.y}%`,
            fontSize: '2.8rem', background: 'transparent', border: 'none',
            cursor: 'pointer', transform: 'translateX(-50%)', padding: '8px', lineHeight: 1,
          }}>{b.emoji}</button>
        ))}
        {finished && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(253,246,236,0.88)' }}>
            <p style={{ fontFamily: 'Lato', fontSize: '1.2rem', color: '#5a3e3e', fontWeight: 700 }}>🎉 Süre Doldu!</p>
            <p style={{ fontFamily: 'Lato', fontSize: '0.9rem', color: '#c9a84c', margin: '4px 0 16px' }}>Skor: {score}</p>
            <button onClick={restart} style={{ background: 'linear-gradient(135deg,#c9a84c,#e8d5a3)', border: 'none', borderRadius: '20px', padding: '10px 24px', color: '#fff', fontFamily: 'Lato', fontWeight: 700, cursor: 'pointer' }}>Tekrar Oyna</button>
          </div>
        )}
      </div>
    </div>
  )
}
