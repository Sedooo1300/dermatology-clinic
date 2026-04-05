import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emitSync } from '@/lib/socket-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId') || ''
    const section = searchParams.get('section') || ''
    const relatedId = searchParams.get('relatedId') || ''

    const where: Record<string, unknown> = {}
    if (patientId) where.patientId = patientId
    if (section) where.section = section
    if (relatedId) where.relatedId = relatedId

    const notes = await db.note.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true } } },
    })

    return NextResponse.json({ notes })
  } catch (error) {
    console.error('GET notes error:', error)
    return NextResponse.json({ error: 'خطأ في جلب الملاحظات' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const note = await db.note.create({
      data: {
        patientId: body.patientId,
        userId: body.userId,
        section: body.section,
        relatedId: body.relatedId,
        content: body.content,
        isImportant: body.isImportant || false,
      },
      include: { user: { select: { id: true, name: true } } },
    })

    emitSync('note:new', { note })

    return NextResponse.json({ note }, { status: 201 })
  } catch (error) {
    console.error('POST note error:', error)
    return NextResponse.json({ error: 'خطأ في إضافة ملاحظة' }, { status: 500 })
  }
}
