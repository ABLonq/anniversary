'use client'
import { useEffect, useRef, useState } from 'react'

interface Props { onClose: () => void; onScore: (score: number) => void }

export default function BrickGame({ onClose, onScore }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({
    paddle: { x: 110, w: 80 },
    ball: { x: 160, y: 320, vx: 3, vy: -4 },
    bricks: [] as {x:number,y:number,alive:boolean,color:string}[],
    score: 0, alive: true, started: false,
  })
  const rafRef = useRef<number>(0)
  const [score, setScore] = useState(0)
  const [dead, setDead] = useState(false)

  const makeBricks = () => {
    const colors = ['#e8a0a0','#c9a84c','#90c890','#a0b8e8','#d4a0d4']
    const bricks = []
    for (let r=0;r<4;r++) for (let c=0;c<7;c++)
      bricks.push({ x: 8+c*44, y: 40+r*28, alive: true, color: colors[r%colors.length] })
    return bricks
  }

  useEffect(() => {
    stateRef.current.bricks = makeBricks()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height
    const s = stateRef.current

    const loop = () => {
      ctx.fillStyle = '#fdf6ec'; ctx.fillRect(0,0,W,H)
      if (s.started && s.alive) {
        s.ball.x += s.ball.vx; s.ball.y += s.ball.vy
        if (s.ball.x < 8 || s.ball.x > W-8) s.ball.vx *= -1
        if (s.ball.y < 8) s.ball.vy *= -1
        if (s.ball.y > H) { s.alive=false; setDead(true); onScore(s.score) }
        if (s.ball.y > H-40 && s.ball.y < H-20 && s.ball.x > s.paddle.x && s.ball.x < s.paddle.x+s.paddle.w) {
          s.ball.vy = -Math.abs(s.ball.vy)
          s.ball.vx += ((s.ball.x - (s.paddle.x + s.paddle.w/2)) / (s.paddle.w/2)) * 2
        }
        s.bricks.forEach(b => {
          if (!b.alive) return
          if (s.ball.x>b.x && s.ball.x<b.x+38 && s.ball.y>b.y && s.ball.y<b.y+20) {
            b.alive=false; s.ball.vy*=-1; s.score++; setScore(s.score)
          }
        })
        if (s.bricks.every(b=>!b.alive)) { s.bricks=makeBricks(); s.ball.vy -= 0.3 }
      }
      s.bricks.forEach(b => {
        if (!b.alive) return
        ctx.fillStyle=b.color; ctx.beginPath(); ctx.roundRect(b.x,b.y,38,20,4); ctx.fill()
        ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.roundRect(b.x+2,b.y+2,34,6,2); ctx.fill()
      })
      ctx.fillStyle='#c9a84c'; ctx.beginPath(); ctx.roundRect(s.paddle.x,H-30,s.paddle.w,12,6); ctx.fill()
      ctx.font='16px serif'; ctx.fillText('🎾', s.ball.x-8, s.ball.y+8)
      if (!s.started) {
        ctx.fillStyle='rgba(90,62,62,0.6)'; ctx.font='14px Lato,sans-serif'
        ctx.textAlign='center'; ctx.fillText('Parmağını sürükle!', W/2, H/2); ctx.textAlign='left'
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const handleTouch = (e: React.TouchEvent) => {
    const s = stateRef.current
    s.started = true
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = e.touches[0].clientX - rect.left
    const scale = canvasRef.current!.width / rect.width
    s.paddle.x = Math.max(0, Math.min(canvasRef.current!.width - s.paddle.w, x * scale - s.paddle.w/2))
  }

  const handleMouse = (e: React.MouseEvent) => {
    const s = stateRef.current
    if (!s.started) return
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const scale = canvasRef.current!.width / rect.width
    s.paddle.x = Math.max(0, Math.min(canvasRef.current!.width - s.paddle.w, x * scale - s.paddle.w/2))
  }

  const restart = () => {
    stateRef.current = { paddle:{x:110,w:80}, ball:{x:160,y:320,vx:3,vy:-4}, bricks:makeBricks(), score:0, alive:true, started:false }
    setScore(0); setDead(false)
  }

  return (
    <div style={{ position:'relative', userSelect:'none' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px' }}>
        <span style={{ fontFamily:'Lato', fontSize:'0.8rem', color:'#c9a84c', fontWeight:700 }}>🎾 Top Sıçrat</span>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <span style={{ fontFamily:'Lato', fontSize:'0.9rem', color:'#5a3e3e', fontWeight:700 }}>⭐ {score}</span>
          <button onClick={onClose} style={{ background:'transparent', border:'none', color:'#c9a0a0', fontSize:'1rem', cursor:'pointer' }}>✕</button>
        </div>
      </div>
      <canvas ref={canvasRef} width={320} height={420}
        onClick={() => { stateRef.current.started = true }}
        onMouseMove={handleMouse} onTouchMove={handleTouch} onTouchStart={handleTouch}
        style={{ display:'block', width:'100%', borderRadius:'12px', border:'1px solid rgba(201,168,76,0.2)', touchAction:'none', cursor:'none' }} />
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
