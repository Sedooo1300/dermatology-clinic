import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emitSync } from '@/lib/socket-server'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const service = await db.service.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        price: body.price ? parseFloat(body.price) : undefined,
        duration: body.duration ? parseInt(body.duration) : undefined,
        isActive: body.isActive,
      },
    })

    emitSync('service:updated', { service })

    return NextResponse.json({ service })
  } catch (error) {
    console.error('PUT service error:', error)
    return NextResponse.json({ error: 'خطأ في تحديث الخدمة' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.service.update({
      where: { id },
      data: { isActive: false },
    })

    emitSync('service:deleted', { id })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE service error:', error)
    return NextResponse.json({ error: 'خطأ في حذف الخدمة' }, { status: 500 })
  }
}
