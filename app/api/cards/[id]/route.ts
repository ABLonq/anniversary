import { NextRequest, NextResponse } from 'next/server'
import { deleteCard } from '@/lib/storage'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    deleteCard(params.id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Kart silinemedi' }, { status: 500 })
  }
}
