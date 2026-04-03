import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay() + 1) // Monday
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const [
      weekVisits,
      weekSessions,
      weekRevenueVisits,
      weekRevenueSessions,
      weekNewPatients,
      visitTypeStats,
      topServices,
      dailyData,
    ] = await Promise.all([
      db.visit.count({
        where: { visitDate: { gte: weekStart, lt: weekEnd } },
      }),
      db.session.count({
        where: { sessionDate: { gte: weekStart, lt: weekEnd } },
      }),
      db.visit.aggregate({
        where: { visitDate: { gte: weekStart, lt: weekEnd } },
        _sum: { fees: true, paidAmount: true },
      }),
      db.session.aggregate({
        where: { sessionDate: { gte: weekStart, lt: weekEnd } },
        _sum: { totalPrice: true, paidAmount: true },
      }),
      db.patient.count({
        where: { createdAt: { gte: weekStart, lt: weekEnd } },
      }),
      db.visit.groupBy({
        by: ['visitType'],
        where: { visitDate: { gte: weekStart, lt: weekEnd } },
        _count: { id: true },
      }),
      db.session.groupBy({
        by: ['serviceId'],
        where: { sessionDate: { gte: weekStart, lt: weekEnd } },
        _count: { id: true },
        _sum: { totalPrice: true },
      }),
      // Daily breakdown
      Promise.all(
        Array.from({ length: 7 }).map(async (_, i) => {
          const day = new Date(weekStart)
          day.setDate(weekStart.getDate() + i)
          const dayEnd = new Date(day)
          dayEnd.setDate(day.getDate() + 1)

          const [dayVisits, daySessions] = await Promise.all([
            db.visit.count({ where: { visitDate: { gte: day, lt: dayEnd } } }),
            db.session.count({ where: { sessionDate: { gte: day, lt: dayEnd } } }),
          ])

          return {
            date: day.toISOString().split('T')[0],
            dayName: day.toLocaleDateString('ar-SA', { weekday: 'short' }),
            visits: dayVisits,
            sessions: daySessions,
          }
        })
      ),
    ])

    // Get service names for top services
    const serviceIds = topServices.map(s => s.serviceId)
    const services = serviceIds.length > 0
      ? await db.service.findMany({ where: { id: { in: serviceIds } }, select: { id: true, name: true } })
      : []

    const topServicesWithNames = topServices
      .map(s => ({
        serviceName: services.find(sv => sv.id === s.serviceId)?.name || 'غير معروف',
        count: s._count.id,
        revenue: s._sum.totalPrice || 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return NextResponse.json({
      period: `${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}`,
      visits: {
        count: weekVisits,
        revenue: weekRevenueVisits._sum.fees || 0,
        collected: weekRevenueVisits._sum.paidAmount || 0,
      },
      sessions: {
        count: weekSessions,
        revenue: weekRevenueSessions._sum.totalPrice || 0,
        collected: weekRevenueSessions._sum.paidAmount || 0,
      },
      newPatients: weekNewPatients,
      visitTypeStats,
      topServices: topServicesWithNames,
      dailyData,
    })
  } catch (error) {
    console.error('Weekly report error:', error)
    return NextResponse.json({ error: 'خطأ في جلب التقرير الأسبوعي' }, { status: 500 })
  }
}
