import { NextRequest, NextResponse } from 'next/server'
import { deleteCard, updateCard } from '@/lib/storage'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteCard(params.id)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE error:', e)
    return NextResponse.json({ error: 'Kart silinemedi' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    await updateCard(params.id, body)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('PUT error:', e)
    return NextResponse.json({ error: 'Kart güncellenemedi' }, { status: 500 })
  }
}
