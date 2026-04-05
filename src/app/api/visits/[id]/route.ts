import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emitSync } from '@/lib/socket-server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const visit = await db.visit.findUnique({
      where: { id },
      include: { patient: true },
    })

    if (!visit) {
      return NextResponse.json({ error: 'الزيارة غير موجودة' }, { status: 404 })
    }

    return NextResponse.json({ visit })
  } catch (error) {
    console.error('GET visit error:', error)
    return NextResponse.json({ error: 'خطأ في جلب بيانات الزيارة' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const visit = await db.visit.update({
      where: { id },
      data: {
        patientId: body.patientId,
        doctorId: body.doctorId,
        visitDate: body.visitDate ? new Date(body.visitDate) : undefined,
        visitType: body.visitType,
        diagnosis: body.diagnosis,
        prescription: body.prescription,
        examination: body.examination,
        fees: body.fees ? parseFloat(body.fees) : undefined,
        paidAmount: body.paidAmount ? parseFloat(body.paidAmount) : undefined,
        notes: body.notes,
      },
      include: { patient: true },
    })

    emitSync('visit:updated', { visit, userId: body.userId })

    return NextResponse.json({ visit })
  } catch (error) {
    console.error('PUT visit error:', error)
    return NextResponse.json({ error: 'خطأ في تحديث بيانات الزيارة' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const visit = await db.visit.findUnique({ where: { id }, select: { patientId: true } })
    await db.visit.delete({ where: { id } })
    emitSync('visit:deleted', { id, patientId: visit?.patientId })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE visit error:', error)
    return NextResponse.json({ error: 'خطأ في حذف الزيارة' }, { status: 500 })
  }
}
