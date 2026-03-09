import { NextRequest, NextResponse } from 'next/server'
import { getCards, saveCard } from '@/lib/storage'
import { MemoryCard } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  try {
    const cards = getCards()
    return NextResponse.json(cards)
  } catch {
    return NextResponse.json({ error: 'Kartlar yüklenemedi' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, date, meaning, imageUrl, imagePublicId } = body

    if (!title || !date || !meaning || !imageUrl) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur' }, { status: 400 })
    }

    const card: MemoryCard = {
      id: uuidv4(),
      title,
      date,
      meaning,
      imageUrl,
      imagePublicId,
      createdAt: new Date().toISOString(),
    }

    saveCard(card)
    return NextResponse.json(card, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Kart oluşturulamadı' }, { status: 500 })
  }
}
