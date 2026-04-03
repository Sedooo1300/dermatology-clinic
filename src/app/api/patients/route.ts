import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emitSync } from '@/lib/socket-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name') || ''
    const phone = searchParams.get('phone') || ''
    const fileNumber = searchParams.get('fileNumber') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, unknown> = {}
    if (name) where.name = { contains: name }
    if (phone) where.phone = { contains: phone }
    if (fileNumber) where.fileNumber = fileNumber
    if (status) where.status = status

    const [patients, total] = await Promise.all([
      db.patient.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.patient.count({ where }),
    ])

    return NextResponse.json({ patients, total, page, limit })
  } catch (error) {
    console.error('GET patients error:', error)
    return NextResponse.json({ error: 'خطأ في جلب المرضى', details: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[API] Creating patient:', JSON.stringify(body))

    const patient = await db.patient.create({
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
        status: body.status || 'active',
        createdBy: body.createdBy,
      },
    })

    console.log('[API] Patient created:', patient.id)
    emitSync('patient:created', { patient, userId: body.userId })

    return NextResponse.json({ patient }, { status: 201 })
  } catch (error: unknown) {
    console.error('[API] POST patient error:', error)
    const errMsg = error instanceof Error ? error.message : String(error)
    const msg = errMsg.includes('Unique') 
      ? 'رقم الملف موجود مسبقاً' 
      : 'خطأ في إنشاء مريض جديد'
    return NextResponse.json({ error: msg, debug: errMsg }, { status: 500 })
  }
}
