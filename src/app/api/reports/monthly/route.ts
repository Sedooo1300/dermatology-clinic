import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const today = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1)

    const [
      monthVisits,
      monthSessions,
      monthRevenueVisits,
      monthRevenueSessions,
      monthNewPatients,
      activePatients,
      topDiagnoses,
      topServices,
      weeklyData,
    ] = await Promise.all([
      db.visit.count({
        where: { visitDate: { gte: monthStart, lt: monthEnd } },
      }),
      db.session.count({
        where: { sessionDate: { gte: monthStart, lt: monthEnd } },
      }),
      db.visit.aggregate({
        where: { visitDate: { gte: monthStart, lt: monthEnd } },
        _sum: { fees: true, paidAmount: true },
      }),
      db.session.aggregate({
        where: { sessionDate: { gte: monthStart, lt: monthEnd } },
        _sum: { totalPrice: true, paidAmount: true },
      }),
      db.patient.count({
        where: { createdAt: { gte: monthStart, lt: monthEnd } },
      }),
      db.patient.count({
        where: { status: 'active' },
      }),
      db.visit.groupBy({
        by: ['diagnosis'],
        where: {
          visitDate: { gte: monthStart, lt: monthEnd },
          diagnosis: { not: null },
        },
        _count: { id: true },
        take: 10,
        orderBy: { _count: { id: 'desc' } },
      }),
      db.session.groupBy({
        by: ['serviceId'],
        where: { sessionDate: { gte: monthStart, lt: monthEnd } },
        _count: { id: true },
        _sum: { totalPrice: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      // Weekly breakdown
      Promise.all(
        Array.from({ length: 4 }).map(async (_, i) => {
          const weekStart = new Date(monthStart)
          weekStart.setDate(monthStart.getDate() + i * 7)
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 7)

          const [weekVisits, weekRevenue] = await Promise.all([
            db.visit.count({ where: { visitDate: { gte: weekStart, lt: weekEnd } } }),
            db.visit.aggregate({
              where: { visitDate: { gte: weekStart, lt: weekEnd } },
              _sum: { fees: true, paidAmount: true },
            }),
          ])

          return {
            date: weekStart.toISOString().split('T')[0],
            week: i + 1,
            visits: weekVisits,
            revenue: weekRevenue._sum.fees || 0,
            collected: weekRevenue._sum.paidAmount || 0,
          }
        })
      ),
    ])

    return NextResponse.json({
      period: `${monthStart.toISOString().split('T')[0]} to ${monthEnd.toISOString().split('T')[0]}`,
      visits: {
        count: monthVisits,
        revenue: monthRevenueVisits._sum.fees || 0,
        collected: monthRevenueVisits._sum.paidAmount || 0,
      },
      sessions: {
        count: monthSessions,
        revenue: monthRevenueSessions._sum.totalPrice || 0,
        collected: monthRevenueSessions._sum.paidAmount || 0,
      },
      newPatients: monthNewPatients,
      activePatients,
      totalRevenue: (monthRevenueVisits._sum.paidAmount || 0) + (monthRevenueSessions._sum.paidAmount || 0),
      topDiagnoses: topDiagnoses.map(d => ({
        diagnosis: d.diagnosis || 'غير محدد',
        count: d._count.id,
      })),
      topServices,
      weeklyData,
    })
  } catch (error) {
    console.error('Monthly report error:', error)
    return NextResponse.json({ error: 'خطأ في جلب التقرير الشهري' }, { status: 500 })
  }
}
