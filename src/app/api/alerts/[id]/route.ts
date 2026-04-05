import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emitSync } from '@/lib/socket-server'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const alert = await db.alert.update({
      where: { id },
      data: {
        title: body.title,
        message: body.message,
        alertDate: body.alertDate ? new Date(body.alertDate) : undefined,
        alertType: body.alertType,
        isRead: body.isRead,
      },
      include: { patient: { select: { id: true, name: true } } },
    })

    emitSync('alert:updated', { alert })

    return NextResponse.json({ alert })
  } catch (error) {
    console.error('PUT alert error:', error)
    return NextResponse.json({ error: 'خطأ في تحديث التنبيه' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const alert = await db.alert.findUnique({ where: { id }, select: { patientId: true } })
    await db.alert.delete({ where: { id } })
    emitSync('alert:deleted', { id, patientId: alert?.patientId })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE alert error:', error)
    return NextResponse.json({ error: 'خطأ في حذف التنبيه' }, { status: 500 })
  }
}
