'use client'
import { useEffect, useRef, useState } from 'react'

interface Props { onClose: () => void; onScore: (score: number) => void }

const CELL = 20, COLS = 16, ROWS = 21

export default function SnakeGame({ onClose, onScore }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({
    snake: [{x:8,y:10},{x:7,y:10},{x:6,y:10}],
    dir: {x:1,y:0}, nextDir: {x:1,y:0},
    food: {x:12,y:10}, score: 0, alive: true, started: false,
  })
  const rafRef = useRef<number>(0)
  const lastMoveRef = useRef(0)
  const touchRef = useRef<{x:number,y:number}|null>(null)
  const [score, setScore] = useState(0)
  const [dead, setDead] = useState(false)

  const placeFood = (snake: {x:number,y:number}[]) => {
    let f
    do { f = {x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS)} }
    while (snake.some(s => s.x===f.x && s.y===f.y))
    return f
  }

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const s = stateRef.current

    const draw = (ts: number) => {
      if (s.started && s.alive && ts - lastMoveRef.current > 150) {
        lastMoveRef.current = ts
        s.dir = s.nextDir
        const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y }
        if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS || s.snake.some(b => b.x===head.x && b.y===head.y)) {
          s.alive = false; setDead(true); onScore(s.score); rafRef.current = requestAnimationFrame(draw); return
        }
        s.snake.unshift(head)
        if (head.x === s.food.x && head.y === s.food.y) { s.score++; setScore(s.score); s.food = placeFood(s.snake) }
        else s.snake.pop()
      }
      ctx.fillStyle = '#fdf6ec'; ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'rgba(201,168,76,0.06)'
      for (let i=0;i<COLS;i++) for (let j=0;j<ROWS;j++) if ((i+j)%2===0) ctx.fillRect(i*CELL,j*CELL,CELL,CELL)
      s.snake.forEach((seg, i) => {
        ctx.fillStyle = i===0 ? '#c9a84c' : i%2===0 ? '#7aba7a' : '#90c890'
        ctx.beginPath(); ctx.roundRect(seg.x*CELL+2, seg.y*CELL+2, CELL-4, CELL-4, 4); ctx.fill()
      })
      ctx.font = `${CELL}px serif`; ctx.fillText('🍎', s.food.x*CELL, s.food.y*CELL+CELL-2)
      if (!s.started) {
        ctx.fillStyle = 'rgba(253,246,236,0.75)'; ctx.fillRect(0,0,canvas.width,canvas.height)
        ctx.fillStyle = 'rgba(90,62,62,0.8)'; ctx.font = '15px Lato,sans-serif'
        ctx.textAlign='center'; ctx.fillText('Kaydırarak oyna! 👆', canvas.width/2, canvas.height/2); ctx.textAlign='left'
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = stateRef.current
      s.started = true
      const d = s.nextDir
      if (e.key==='ArrowUp'&&d.y!==1) s.nextDir={x:0,y:-1}
      if (e.key==='ArrowDown'&&d.y!==-1) s.nextDir={x:0,y:1}
      if (e.key==='ArrowLeft'&&d.x!==1) s.nextDir={x:-1,y:0}
      if (e.key==='ArrowRight'&&d.x!==-1) s.nextDir={x:1,y:0}
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    stateRef.current.started = true
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current) return
    const dx = e.changedTouches[0].clientX - touchRef.current.x
    const dy = e.changedTouches[0].clientY - touchRef.current.y
    const s = stateRef.current; const d = s.nextDir
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 20 && d.x !== -1) s.nextDir = {x:1,y:0}
      if (dx < -20 && d.x !== 1) s.nextDir = {x:-1,y:0}
    } else {
      if (dy > 20 && d.y !== -1) s.nextDir = {x:0,y:1}
      if (dy < -20 && d.y !== 1) s.nextDir = {x:0,y:-1}
    }
    touchRef.current = null
  }

  const restart = () => {
    stateRef.current = { snake:[{x:8,y:10},{x:7,y:10},{x:6,y:10}], dir:{x:1,y:0}, nextDir:{x:1,y:0}, food:{x:12,y:10}, score:0, alive:true, started:false }
    setScore(0); setDead(false)
  }

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px' }}>
        <span style={{ fontFamily:'Lato', fontSize:'0.8rem', color:'#c9a84c', fontWeight:700 }}>🐍 Yılan</span>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <span style={{ fontFamily:'Lato', fontSize:'0.9rem', color:'#5a3e3e', fontWeight:700 }}>⭐ {score}</span>
          <button onClick={onClose} style={{ background:'transparent', border:'none', color:'#c9a0a0', fontSize:'1rem', cursor:'pointer' }}>✕</button>
        </div>
      </div>
      <canvas ref={canvasRef} width={COLS*CELL} height={ROWS*CELL}
        onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
        style={{ display:'block', width:'100%', borderRadius:'12px', border:'1px solid rgba(201,168,76,0.2)', touchAction:'none' }} />
      {dead && (
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'rgba(253,246,236,0.88)', borderRadius:'12px' }}>
          <p style={{ fontFamily:'Lato', fontSize:'1.2rem', color:'#5a3e3e', fontWeight:700 }}>💔 Oyun Bitti!</p>
          <p style={{ fontFamily:'Lato', fontSize:'0.9rem', color:'#c9a84c', margin:'4px 0 16px' }}>Skor: {score}</p>
          <button onClick={restart} style={{ background:'linear-gradient(135deg,#c9a84c,#e8d5a3)', border:'none', borderRadius:'20px', padding:'10px 24px', color:'#fff', fontFamily:'Lato', fontWeight:700, cursor:'pointer' }}>Tekrar Oyna</button>
        </div>
      )}
    </div>
  )
}
