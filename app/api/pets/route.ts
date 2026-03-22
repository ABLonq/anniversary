import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

function getSQL() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  return neon(url)
}

async function initPets() {
  const sql = getSQL()
  await sql`
    CREATE TABLE IF NOT EXISTS pet_stats (
      id TEXT PRIMARY KEY DEFAULT 'main',
      koala_hunger FLOAT DEFAULT 70,
      koala_happiness FLOAT DEFAULT 80,
      koala_energy FLOAT DEFAULT 90,
      frog_hunger FLOAT DEFAULT 60,
      frog_happiness FLOAT DEFAULT 75,
      frog_energy FLOAT DEFAULT 85,
      last_seen BIGINT DEFAULT 0
    )
  `
  await sql`
    INSERT INTO pet_stats (id) VALUES ('main')
    ON CONFLICT (id) DO NOTHING
  `
}

export async function GET() {
  await initPets()
  const sql = getSQL()
  const rows = await sql`SELECT * FROM pet_stats WHERE id = 'main'`
  const r = rows[0]
  const minutesPassed = (Date.now() - Number(r.last_seen)) / 1000 / 60
  const decay = Math.min(Math.floor(minutesPassed / 8), 50)
  return NextResponse.json({
    koala: { hunger: Math.max(0, r.koala_hunger - decay), happiness: Math.max(0, r.koala_happiness - decay), energy: Math.max(0, r.koala_energy - decay) },
    frog:  { hunger: Math.max(0, r.frog_hunger - decay),  happiness: Math.max(0, r.frog_happiness - decay),  energy: Math.max(0, r.frog_energy - decay)  },
  })
}

export async function POST(req: Request) {
  const { koala, frog } = await req.json()
  await initPets()
  const sql = getSQL()
  await sql`
    UPDATE pet_stats SET
      koala_hunger = ${koala.hunger},
      koala_happiness = ${koala.happiness},
      koala_energy = ${koala.energy},
      frog_hunger = ${frog.hunger},
      frog_happiness = ${frog.happiness},
      frog_energy = ${frog.energy},
      last_seen = ${Date.now()}
    WHERE id = 'main'
  `
  return NextResponse.json({ ok: true })
}
