import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emitSync } from '@/lib/socket-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId') || ''
    const visitType = searchParams.get('visitType') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, unknown> = {}
    if (patientId) where.patientId = patientId
    if (visitType) where.visitType = visitType
    if (dateFrom || dateTo) {
      const dateFilter: Record<string, unknown> = {}
      if (dateFrom) dateFilter.gte = new Date(dateFrom)
      if (dateTo) dateFilter.lte = new Date(dateTo)
      where.visitDate = dateFilter
    }

    const [visits, total] = await Promise.all([
      db.visit.findMany({
        where,
        include: { patient: true },
        orderBy: { visitDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.visit.count({ where }),
    ])

    return NextResponse.json({ visits, total, page, limit })
  } catch (error) {
    console.error('GET visits error:', error)
    return NextResponse.json({ error: 'خطأ في جلب الزيارات' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const visit = await db.visit.create({
      data: {
        patientId: body.patientId,
        doctorId: body.doctorId,
        visitDate: body.visitDate ? new Date(body.visitDate) : new Date(),
        visitType: body.visitType || 'new',
        diagnosis: body.diagnosis,
        prescription: body.prescription,
        examination: body.examination,
        fees: body.fees ? parseFloat(body.fees) : null,
        paidAmount: body.paidAmount ? parseFloat(body.paidAmount) : 0,
        notes: body.notes,
        createdBy: body.createdBy,
      },
      include: { patient: true },
    })

    emitSync('visit:created', { visit, userId: body.userId })

    return NextResponse.json({ visit }, { status: 201 })
  } catch (error) {
    console.error('POST visit error:', error)
    return NextResponse.json({ error: 'خطأ في إنشاء زيارة جديدة' }, { status: 500 })
  }
}
