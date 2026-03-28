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
      last_seen BIGINT DEFAULT 0,
      coins INTEGER DEFAULT 30,
      inventory JSONB DEFAULT '{"foods":{"🍎":2,"🥕":1},"games":{"🎾":1}}',
      daily_tasks JSONB DEFAULT '[]',
      last_task_reset TEXT DEFAULT '',
      game_played_date TEXT DEFAULT ''
    )
  `
  await sql`ALTER TABLE pet_stats ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 30`
  await sql`ALTER TABLE pet_stats ADD COLUMN IF NOT EXISTS inventory JSONB DEFAULT '{"foods":{"🍎":2,"🥕":1},"games":{"🎾":1}}'`
  await sql`ALTER TABLE pet_stats ADD COLUMN IF NOT EXISTS daily_tasks JSONB DEFAULT '[]'`
  await sql`ALTER TABLE pet_stats ADD COLUMN IF NOT EXISTS last_task_reset TEXT DEFAULT ''`
  await sql`ALTER TABLE pet_stats ADD COLUMN IF NOT EXISTS game_played_date TEXT DEFAULT ''`
  await sql`INSERT INTO pet_stats (id) VALUES ('main') ON CONFLICT (id) DO NOTHING`
}

const TASK_POOL = [
  { id: 'open_site', label: 'Siteyi aç', desc: 'Bugün siteye gir', reward: 10, icon: '🌸', auto: true },
  { id: 'feed_both', label: 'İkisini besle', desc: 'Koala ve kurbağayı besle', reward: 8, icon: '🍽', auto: false },
  { id: 'pet_both', label: 'İkisini okşa', desc: 'Her ikisini de okşa', reward: 8, icon: '💕', auto: false },
  { id: 'play_game', label: 'Oyun oyna', desc: 'Günlük oyun hakkını kullan', reward: 15, icon: '🎮', auto: false },
  { id: 'keep_happy', label: 'Mutlu tut', desc: 'İkisinin mutluluğunu %80 üstünde tut', reward: 12, icon: '😊', auto: false },
  { id: 'add_memory', label: 'Anı ekle', desc: 'Yeni bir anı ekle', reward: 20, icon: '📸', auto: false },
  { id: 'full_energy', label: 'Enerji ver', desc: 'İkisinin enerjisini %90 üstüne çıkar', reward: 10, icon: '⚡', auto: false },
]

function getTodayStr() {
  return new Date().toISOString().split('T')[0]
}

function getDailyTasks(lastReset: string, existingTasks: any[]) {
  const today = getTodayStr()
  if (lastReset === today && existingTasks.length > 0) return { tasks: existingTasks, reset: false }
  const shuffled = [...TASK_POOL].sort(() => Math.random() - 0.5)
  const tasks = shuffled.slice(0, 3).map(t => ({ ...t, completed: t.id === 'open_site' }))
  return { tasks, reset: true }
}

export async function GET() {
  await initPets()
  const sql = getSQL()
  const rows = await sql`SELECT * FROM pet_stats WHERE id = 'main'`
  const r = rows[0]
  const minutesPassed = (Date.now() - Number(r.last_seen)) / 1000 / 60
  const decay = Math.min(Math.floor(minutesPassed / 8), 50)
  const { tasks, reset } = getDailyTasks(r.last_task_reset as string, r.daily_tasks as any[])
  let coins = r.coins as number
  if (reset) {
    const openTask = tasks.find((t: any) => t.id === 'open_site')
    if (openTask) coins = Math.min(9999, coins + 10)
    await sql`UPDATE pet_stats SET daily_tasks = ${JSON.stringify(tasks)}, last_task_reset = ${getTodayStr()}, coins = ${coins} WHERE id = 'main'`
  }
  const today = getTodayStr()
  const gamePlayed = (r.game_played_date as string) === today
  return NextResponse.json({
    koala: { hunger: Math.max(0, (r.koala_hunger as number) - decay), happiness: Math.max(0, (r.koala_happiness as number) - decay), energy: Math.max(0, (r.koala_energy as number) - decay) },
    frog: { hunger: Math.max(0, (r.frog_hunger as number) - decay), happiness: Math.max(0, (r.frog_happiness as number) - decay), energy: Math.max(0, (r.frog_energy as number) - decay) },
    coins, inventory: r.inventory, dailyTasks: tasks, gamePlayed,
  })
}

export async function POST(req: Request) {
  const body = await req.json()
  await initPets()
  const sql = getSQL()

  if (body.action === 'complete_task') {
    const rows = await sql`SELECT coins, daily_tasks FROM pet_stats WHERE id = 'main'`
    const r = rows[0]
    const tasks = r.daily_tasks as {id: string, completed: boolean, reward: number}[]
    const task = tasks.find(t => t.id === body.taskId)
    if (!task || task.completed) return NextResponse.json({ ok: false })
    task.completed = true
    const newCoins = Math.min(9999, (r.coins as number) + task.reward)
    await sql`UPDATE pet_stats SET daily_tasks = ${JSON.stringify(tasks)}, coins = ${newCoins} WHERE id = 'main'`
    return NextResponse.json({ ok: true, coins: newCoins, tasks })
  }

  if (body.action === 'finish_game') {
    const rows = await sql`SELECT coins, daily_tasks FROM pet_stats WHERE id = 'main'`
    const r = rows[0]
    const bonus = Math.min(Math.floor((body.score || 0) * 2), 30)
    const newCoins = Math.min(9999, (r.coins as number) + bonus)
    const tasks = r.daily_tasks as {id: string, completed: boolean, reward: number}[]
    const playTask = tasks.find(t => t.id === 'play_game')
    let extraCoins = 0
    if (playTask && !playTask.completed) {
      playTask.completed = true
      extraCoins = playTask.reward
    }
    const finalCoins = Math.min(9999, newCoins + extraCoins)
    await sql`UPDATE pet_stats SET coins = ${finalCoins}, game_played_date = ${getTodayStr()}, daily_tasks = ${JSON.stringify(tasks)} WHERE id = 'main'`
    return NextResponse.json({ ok: true, coins: finalCoins, bonus, tasks })
  }
    if (body.action === 'use_item') {
    const rows = await sql`SELECT inventory FROM pet_stats WHERE id = 'main'`
    const r = rows[0]
    const inv = r.inventory as Record<string, Record<string, number>>
    const { item, itemType } = body
    const stock = inv[itemType]?.[item] || 0
    if (stock <= 0) return NextResponse.json({ ok: false, error: 'Out of stock' })
    inv[itemType] = { ...inv[itemType], [item]: stock - 1 }
    await sql`UPDATE pet_stats SET inventory = ${JSON.stringify(inv)} WHERE id = 'main'`
    return NextResponse.json({ ok: true, inventory: inv })
  }

    if (body.action === 'buy_item') {
    const rows = await sql`SELECT coins, inventory FROM pet_stats WHERE id = 'main'`
    const r = rows[0]
    const SHOP: Record<string, {price: number, type: string}> = {
      '🍎': {price:5,type:'foods'}, '🍓': {price:8,type:'foods'}, '🌿': {price:6,type:'foods'},
      '🍪': {price:12,type:'foods'}, '🍰': {price:20,type:'foods'}, '🥕': {price:5,type:'foods'},
      '🎾': {price:8,type:'games'}, '🪀': {price:10,type:'games'}, '🎈': {price:12,type:'games'},
      '⭐': {price:15,type:'games'}, '🌸': {price:25,type:'games'},
    }
    const item = SHOP[body.item]
    if (!item) return NextResponse.json({ ok: false, error: 'Item not found' })
    const coins = r.coins as number
    if (coins < item.price) return NextResponse.json({ ok: false, error: 'Not enough coins' })
    const inv = r.inventory as Record<string, Record<string, number>>
    const currentStock = inv[item.type]?.[body.item] || 0
    inv[item.type] = { ...inv[item.type], [body.item]: currentStock + 3 }
    const newCoins = coins - item.price
    await sql`UPDATE pet_stats SET inventory = ${JSON.stringify(inv)}, coins = ${newCoins} WHERE id = 'main'`
    return NextResponse.json({ ok: true, coins: newCoins, inventory: inv })
  }

  const { koala, frog } = body
  await sql`
    UPDATE pet_stats SET
      koala_hunger = ${koala.hunger}, koala_happiness = ${koala.happiness}, koala_energy = ${koala.energy},
      frog_hunger = ${frog.hunger}, frog_happiness = ${frog.happiness}, frog_energy = ${frog.energy},
      last_seen = ${Date.now()}
    WHERE id = 'main'
  `
  return NextResponse.json({ ok: true })
}
