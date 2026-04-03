import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const [
      todayVisits,
      todaySessions,
      todayRevenueVisits,
      todayRevenueSessions,
      todayNewPatients,
      pendingSessions,
      todayAlerts,
    ] = await Promise.all([
      db.visit.count({
        where: { visitDate: { gte: startOfDay, lt: endOfDay } },
      }),
      db.session.count({
        where: { sessionDate: { gte: startOfDay, lt: endOfDay } },
      }),
      db.visit.aggregate({
        where: { visitDate: { gte: startOfDay, lt: endOfDay } },
        _sum: { fees: true, paidAmount: true },
      }),
      db.session.aggregate({
        where: { sessionDate: { gte: startOfDay, lt: endOfDay } },
        _sum: { totalPrice: true, paidAmount: true },
      }),
      db.patient.count({
        where: { createdAt: { gte: startOfDay, lt: endOfDay } },
      }),
      db.session.count({
        where: { status: 'scheduled', sessionDate: { gte: startOfDay } },
      }),
      db.alert.findMany({
        where: { isRead: false },
        orderBy: { alertDate: 'asc' },
        take: 10,
        include: { patient: true },
      }),
    ])

    const totalRevenue = (todayRevenueVisits._sum.paidAmount || 0) + (todayRevenueSessions._sum.paidAmount || 0)
    const totalFees = (todayRevenueVisits._sum.fees || 0) + (todayRevenueSessions._sum.totalPrice || 0)

    return NextResponse.json({
      date: today.toISOString().split('T')[0],
      visits: {
        count: todayVisits,
        revenue: todayRevenueVisits._sum.fees || 0,
        collected: todayRevenueVisits._sum.paidAmount || 0,
      },
      sessions: {
        count: todaySessions,
        revenue: todayRevenueSessions._sum.totalPrice || 0,
        collected: todayRevenueSessions._sum.paidAmount || 0,
      },
      newPatients: todayNewPatients,
      pendingSessions,
      totalRevenue,
      totalFees,
      alerts: todayAlerts,
    })
  } catch (error) {
    console.error('Daily report error:', error)
    return NextResponse.json({ error: 'خطأ في جلب التقرير اليومي' }, { status: 500 })
  }
}
