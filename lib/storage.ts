import { neon } from '@neondatabase/serverless'
import { MemoryCard } from './types'

function getSQL() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  return neon(url)
}

export async function initDB() {
  const sql = getSQL()
  await sql`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      meaning TEXT NOT NULL,
      image_url TEXT NOT NULL,
      image_public_id TEXT NOT NULL,
      photos TEXT[] DEFAULT '{}',
      created_at TEXT NOT NULL
    )
  `
  await sql`
    ALTER TABLE cards ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}'
  `
}

export async function getCards(): Promise<MemoryCard[]> {
  await initDB()
  const sql = getSQL()
  const rows = await sql`SELECT * FROM cards ORDER BY created_at DESC`
  return rows.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    title: row.title as string,
    date: row.date as string,
    meaning: row.meaning as string,
    imageUrl: row.image_url as string,
    imagePublicId: row.image_public_id as string,
    photos: (row.photos as string[]) || [],
    createdAt: row.created_at as string,
  }))
}

export async function saveCard(card: MemoryCard): Promise<void> {
  await initDB()
  const sql = getSQL()
  await sql`
    INSERT INTO cards (id, title, date, meaning, image_url, image_public_id, photos, created_at)
    VALUES (${card.id}, ${card.title}, ${card.date}, ${card.meaning}, ${card.imageUrl}, ${card.imagePublicId}, ${card.photos}, ${card.createdAt})
  `
}

export async function deleteCard(id: string): Promise<void> {
  const sql = getSQL()
  await sql`DELETE FROM cards WHERE id = ${id}`
}
