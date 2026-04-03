import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const [
      totalPatients,
      activePatients,
      todayNewPatients,
      totalVisits,
      todayVisits,
      totalSessions,
      todaySessions,
      totalRevenue,
      todayRevenue,
      unreadAlerts,
      pendingSessions,
    ] = await Promise.all([
      db.patient.count(),
      db.patient.count({ where: { status: 'active' } }),
      db.patient.count({ where: { createdAt: { gte: startOfDay, lt: endOfDay } } }),
      db.visit.count(),
      db.visit.count({ where: { visitDate: { gte: startOfDay, lt: endOfDay } } }),
      db.session.count(),
      db.session.count({ where: { sessionDate: { gte: startOfDay, lt: endOfDay } } }),
      db.visit.aggregate({ _sum: { paidAmount: true } }),
      db.visit.aggregate({
        where: { visitDate: { gte: startOfDay, lt: endOfDay } },
        _sum: { paidAmount: true },
      }),
      db.alert.count({ where: { isRead: false } }),
      db.session.count({ where: { status: 'scheduled' } }),
    ])

    // Get recent visits for activity feed
    const recentVisits = await db.visit.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { patient: true },
    })

    // Get recent sessions for activity feed
    const recentSessions = await db.session.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { patient: true, service: true },
    })

    // Get weekly trend data (last 7 days)
    const weeklyTrend = await Promise.all(
      Array.from({ length: 7 }).map(async (_, i) => {
        const date = new Date(today)
        date.setDate(today.getDate() - (6 - i))
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        const dayEnd = new Date(dayStart)
        dayEnd.setDate(dayStart.getDate() + 1)

        const [visits, sessions, revenue] = await Promise.all([
          db.visit.count({ where: { visitDate: { gte: dayStart, lt: dayEnd } } }),
          db.session.count({ where: { sessionDate: { gte: dayStart, lt: dayEnd } } }),
          db.visit.aggregate({
            where: { visitDate: { gte: dayStart, lt: dayEnd } },
            _sum: { paidAmount: true },
          }),
        ])

        return {
          date: date.toISOString().split('T')[0],
          dayName: date.toLocaleDateString('ar-SA', { weekday: 'short' }),
          visits,
          sessions,
          revenue: revenue._sum.paidAmount || 0,
        }
      })
    )

    // Get recent alerts
    const recentAlerts = await db.alert.findMany({
      where: { isRead: false },
      orderBy: { alertDate: 'asc' },
      take: 5,
      include: { patient: true },
    })

    return NextResponse.json({
      patients: {
        total: totalPatients,
        active: activePatients,
        todayNew: todayNewPatients,
      },
      visits: {
        total: totalVisits,
        today: todayVisits,
      },
      sessions: {
        total: totalSessions,
        today: todaySessions,
        pending: pendingSessions,
      },
      revenue: {
        total: totalRevenue._sum.paidAmount || 0,
        today: todayRevenue._sum.paidAmount || 0,
      },
      alerts: {
        unread: unreadAlerts,
        recent: recentAlerts,
      },
      recentActivity: {
        visits: recentVisits,
        sessions: recentSessions,
      },
      weeklyTrend,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'خطأ في جلب بيانات لوحة التحكم' }, { status: 500 })
  }
}
