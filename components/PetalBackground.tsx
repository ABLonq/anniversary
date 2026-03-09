'use client'

import { useEffect, useState } from 'react'

interface Petal {
  id: number
  left: string
  delay: string
  duration: string
  size: string
  symbol: string
}

const SYMBOLS = ['🌸', '🌺', '✿', '❀', '♡', '✦']

export default function PetalBackground() {
  const [petals, setPetals] = useState<Petal[]>([])

  useEffect(() => {
    const generated = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${6 + Math.random() * 6}s`,
      size: `${0.8 + Math.random() * 0.8}rem`,
      symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    }))
    setPetals(generated)
  }, [])

  return (
    <div className="petal-bg">
      {petals.map(p => (
        <span
          key={p.id}
          className="petal"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            fontSize: p.size,
            opacity: 0.4,
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  )
}
