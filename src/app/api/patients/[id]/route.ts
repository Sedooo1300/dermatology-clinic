import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emitSync } from '@/lib/socket-server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const patient = await db.patient.findUnique({
      where: { id },
      include: {
        visits: { orderBy: { visitDate: 'desc' } },
        sessions: { orderBy: { sessionDate: 'desc' }, include: { service: true } },
        alerts: { orderBy: { alertDate: 'desc' } },
        patientNotes: { orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true } } } },
      },
    })

    if (!patient) {
      return NextResponse.json({ error: 'المريض غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ patient })
  } catch (error) {
    console.error('GET patient error:', error)
    return NextResponse.json({ error: 'خطأ في جلب بيانات المريض' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const patient = await db.patient.update({
      where: { id },
      data: {
        name: body.name,
        phone: body.phone,
        age: body.age ? parseInt(body.age) : null,
        gender: body.gender,
        address: body.address,
        nationalId: body.nationalId,
        fileNumber: body.fileNumber,
        diagnosis: body.diagnosis,
        notes: body.notes,
        status: body.status,
      },
    })

    emitSync('patient:updated', { patient, userId: body.userId })

    return NextResponse.json({ patient })
  } catch (error: unknown) {
    console.error('PUT patient error:', error)
    const msg = error instanceof Error && error.message.includes('Unique')
      ? 'رقم الملف موجود مسبقاً'
      : 'خطأ في تحديث بيانات المريض'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || ''

    await db.note.deleteMany({ where: { patientId: id } })
    await db.alert.deleteMany({ where: { patientId: id } })
    await db.visit.deleteMany({ where: { patientId: id } })
    await db.session.deleteMany({ where: { patientId: id } })
    await db.patient.delete({ where: { id } })

    emitSync('patient:deleted', { id, userId })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE patient error:', error)
    return NextResponse.json({ error: 'خطأ في حذف المريض' }, { status: 500 })
  }
}
