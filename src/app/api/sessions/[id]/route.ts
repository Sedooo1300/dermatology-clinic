import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emitSync } from '@/lib/socket-server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await db.session.findUnique({
      where: { id },
      include: { patient: true, service: true },
    })

    if (!session) {
      return NextResponse.json({ error: 'الجلسة غير موجودة' }, { status: 404 })
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('GET session error:', error)
    return NextResponse.json({ error: 'خطأ في جلب بيانات الجلسة' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const session = await db.session.update({
      where: { id },
      data: {
        patientId: body.patientId,
        serviceId: body.serviceId,
        doctorId: body.doctorId,
        status: body.status,
        sessionDate: body.sessionDate ? new Date(body.sessionDate) : undefined,
        notes: body.notes,
        totalPrice: body.totalPrice ? parseFloat(body.totalPrice) : undefined,
        paidAmount: body.paidAmount ? parseFloat(body.paidAmount) : undefined,
      },
      include: { patient: true, service: true },
    })

    emitSync('session:updated', { session, userId: body.userId })

    return NextResponse.json({ session })
  } catch (error) {
    console.error('PUT session error:', error)
    return NextResponse.json({ error: 'خطأ في تحديث بيانات الجلسة' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await db.session.findUnique({ where: { id }, select: { patientId: true } })
    await db.session.delete({ where: { id } })
    emitSync('session:deleted', { id, patientId: session?.patientId })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE session error:', error)
    return NextResponse.json({ error: 'خطأ في حذف الجلسة' }, { status: 500 })
  }
}
