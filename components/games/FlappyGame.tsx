'use client'
import { useEffect, useRef, useState } from 'react'

interface Props { onClose: () => void; onScore: (score: number) => void }

export default function FlappyGame({ onClose, onScore }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({ bird: { y: 200, vy: 0 }, pipes: [] as {x:number,gap:number,scored:boolean}[], score: 0, alive: true, started: false, frame: 0 })
  const rafRef = useRef<number>(0)
  const [score, setScore] = useState(0)
  const [dead, setDead] = useState(false)

  const jump = () => {
    const s = stateRef.current
    if (!s.alive) return
    s.started = true
    s.bird.vy = -5.5
  }

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height
    const s = stateRef.current

    const loop = () => {
      ctx.fillStyle = '#fdf6ec'; ctx.fillRect(0, 0, W, H)
      if (s.started && s.alive) {
        s.bird.vy += 0.25; s.bird.y += s.bird.vy; s.frame++
        if (s.frame % 90 === 0) s.pipes.push({ x: W, gap: 80 + Math.random() * (H - 250), scored: false })
        s.pipes.forEach(p => { p.x -= 3 })
        s.pipes = s.pipes.filter(p => p.x > -60)
        s.pipes.forEach(p => {
          if (!p.scored && p.x < 60) { p.scored = true; s.score++; setScore(s.score) }
          if (60 > p.x - 5 && 60 < p.x + 45 && (s.bird.y < p.gap || s.bird.y + 24 > p.gap + 130)) {
            s.alive = false; setDead(true); onScore(s.score)
          }
        })
        if (s.bird.y < 0 || s.bird.y + 24 > H - 30) { s.alive = false; setDead(true); onScore(s.score) }
      }
      s.pipes.forEach(p => {
        ctx.fillStyle = '#90c890'; ctx.fillRect(p.x, 0, 45, p.gap - 8)
        ctx.fillStyle = '#7aba7a'; ctx.fillRect(p.x - 4, p.gap - 20, 53, 20)
        ctx.fillStyle = '#90c890'; ctx.fillRect(p.x, p.gap + 130 + 8, 45, H)
        ctx.fillStyle = '#7aba7a'; ctx.fillRect(p.x - 4, p.gap + 130, 53, 20)
      })
      ctx.fillStyle = '#e8d5a3'; ctx.fillRect(0, H - 30, W, 30)
      ctx.fillStyle = '#c9a84c'; ctx.fillRect(0, H - 32, W, 3)
      ctx.font = '28px serif'; ctx.fillText('🐨', 46, s.bird.y + 24)
      if (!s.started) {
        ctx.fillStyle = 'rgba(90,62,62,0.6)'; ctx.font = '15px Lato,sans-serif'
        ctx.textAlign = 'center'; ctx.fillText('Başlamak için dokun! 🐾', W/2, H/2); ctx.textAlign = 'left'
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const restart = () => {
    stateRef.current = { bird: { y: 200, vy: 0 }, pipes: [], score: 0, alive: true, started: false, frame: 0 }
    setScore(0); setDead(false)
  }

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px' }}>
        <span style={{ fontFamily: 'Lato', fontSize: '0.8rem', color: '#c9a84c', fontWeight: 700 }}>🐨 Flappy Koala</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Lato', fontSize: '0.9rem', color: '#5a3e3e', fontWeight: 700 }}>⭐ {score}</span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#c9a0a0', fontSize: '1rem', cursor: 'pointer' }}>✕</button>
        </div>
      </div>
      <canvas ref={canvasRef} width={320} height={420} onClick={jump}
        style={{ display: 'block', width: '100%', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(201,168,76,0.2)' }} />
      {dead && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(253,246,236,0.88)', borderRadius: '12px' }}>
          <p style={{ fontFamily: 'Lato', fontSize: '1.2rem', color: '#5a3e3e', fontWeight: 700 }}>💔 Oyun Bitti!</p>
          <p style={{ fontFamily: 'Lato', fontSize: '0.9rem', color: '#c9a84c', margin: '4px 0 16px' }}>Skor: {score}</p>
          <button onClick={restart} style={{ background: 'linear-gradient(135deg,#c9a84c,#e8d5a3)', border: 'none', borderRadius: '20px', padding: '10px 24px', color: '#fff', fontFamily: 'Lato', fontWeight: 700, cursor: 'pointer' }}>Tekrar Oyna</button>
        </div>
      )}
    </div>
  )
}
