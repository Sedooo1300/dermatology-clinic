import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emitSync } from '@/lib/socket-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId') || ''
    const isRead = searchParams.get('isRead')
    const alertType = searchParams.get('alertType') || ''

    const where: Record<string, unknown> = {}
    if (patientId) where.patientId = patientId
    if (isRead !== null && isRead !== undefined) where.isRead = isRead === 'true'
    if (alertType) where.alertType = alertType

    const alerts = await db.alert.findMany({
      where,
      orderBy: { alertDate: 'desc' },
      include: { patient: { select: { id: true, name: true } } },
    })

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('GET alerts error:', error)
    return NextResponse.json({ error: 'خطأ في جلب التنبيهات' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const alert = await db.alert.create({
      data: {
        patientId: body.patientId,
        title: body.title,
        message: body.message,
        alertDate: body.alertDate ? new Date(body.alertDate) : new Date(),
        alertType: body.alertType || 'reminder',
      },
      include: { patient: { select: { id: true, name: true } } },
    })

    emitSync('alert:new', { alert })

    return NextResponse.json({ alert }, { status: 201 })
  } catch (error) {
    console.error('POST alert error:', error)
    return NextResponse.json({ error: 'خطأ في إنشاء تنبيه' }, { status: 500 })
  }
}
