import { NextRequest, NextResponse } from 'next/server'
import { getCards, saveCard } from '@/lib/storage'
import { MemoryCard } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  try {
    const cards = await getCards()
    return NextResponse.json(Array.isArray(cards) ? cards : [])
  } catch (e) {
    console.error('GET /api/cards error:', e)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, date, meaning, imageUrl, imagePublicId, photos } = body

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
      photos: photos || [],
      category: category || 'onemli-anilar',
      createdAt: new Date().toISOString(),
    }

    await saveCard(card)
    return NextResponse.json(card, { status: 201 })
  } catch (e) {
    console.error('POST /api/cards error:', e)
    return NextResponse.json({ error: 'Kart oluşturulamadı' }, { status: 500 })
  }
}
