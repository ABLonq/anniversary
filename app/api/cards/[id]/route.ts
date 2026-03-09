import { NextRequest, NextResponse } from 'next/server'
import { deleteCard } from '@/lib/storage'

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
