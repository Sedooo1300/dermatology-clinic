import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emitSync } from '@/lib/socket-server'

export async function GET() {
  try {
    const services = await db.service.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ services })
  } catch (error) {
    console.error('GET services error:', error)
    return NextResponse.json({ error: 'خطأ في جلب الخدمات' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const service = await db.service.create({
      data: {
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        duration: body.duration ? parseInt(body.duration) : null,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    })

    emitSync('service:created', { service })

    return NextResponse.json({ service }, { status: 201 })
  } catch (error) {
    console.error('POST service error:', error)
    return NextResponse.json({ error: 'خطأ في إنشاء خدمة جديدة' }, { status: 500 })
  }
}
