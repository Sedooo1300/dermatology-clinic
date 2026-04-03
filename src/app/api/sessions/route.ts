import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emitSync } from '@/lib/socket-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId') || ''
    const status = searchParams.get('status') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, unknown> = {}
    if (patientId) where.patientId = patientId
    if (status) where.status = status
    if (dateFrom || dateTo) {
      const dateFilter: Record<string, unknown> = {}
      if (dateFrom) dateFilter.gte = new Date(dateFrom)
      if (dateTo) dateFilter.lte = new Date(dateTo)
      where.sessionDate = dateFilter
    }

    const [sessions, total] = await Promise.all([
      db.session.findMany({
        where,
        include: { patient: true, service: true },
        orderBy: { sessionDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.session.count({ where }),
    ])

    return NextResponse.json({ sessions, total, page, limit })
  } catch (error) {
    console.error('GET sessions error:', error)
    return NextResponse.json({ error: 'خطأ في جلب الجلسات' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const session = await db.session.create({
      data: {
        patientId: body.patientId,
        serviceId: body.serviceId,
        doctorId: body.doctorId,
        status: body.status || 'scheduled',
        sessionDate: body.sessionDate ? new Date(body.sessionDate) : new Date(),
        notes: body.notes,
        totalPrice: body.totalPrice ? parseFloat(body.totalPrice) : null,
        paidAmount: body.paidAmount ? parseFloat(body.paidAmount) : 0,
        createdBy: body.createdBy,
      },
      include: { patient: true, service: true },
    })

    emitSync('session:created', { session, userId: body.userId })

    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    console.error('POST session error:', error)
    return NextResponse.json({ error: 'خطأ في إنشاء جلسة جديدة' }, { status: 500 })
  }
}
