import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, role } = body

    if (!name || !role) {
      return NextResponse.json({ error: 'الاسم والدور مطلوبان' }, { status: 400 })
    }

    // Find or create user
    let user = await db.user.findFirst({
      where: { name, role },
    })

    if (!user) {
      user = await db.user.create({
        data: {
          name,
          role,
          phone: body.phone || null,
          isActive: true,
        },
      })
    } else {
      user = await db.user.update({
        where: { id: user.id },
        data: { isActive: true, phone: body.phone || user.phone },
      })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'خطأ في تسجيل الدخول' }, { status: 500 })
  }
}
