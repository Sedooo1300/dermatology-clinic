import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/backup/auto - Called by Vercel Cron every 24 hours
// Creates an automatic backup without downloading
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.log('[AutoBackup] Unauthorized attempt - missing or invalid cron secret')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if an auto backup was already created today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const existingToday = await db.backup.count({
      where: {
        type: 'auto',
        createdAt: { gte: todayStart, lte: todayEnd },
      },
    })

    if (existingToday > 0) {
      console.log('[AutoBackup] Already created today, skipping')
      return NextResponse.json({ message: 'تم إنشاء نسخة تلقائية بالفعل اليوم', skipped: true })
    }

    // Export all data
    const [users, patients, services, sessions, visits, notes, alerts] = await Promise.all([
      db.user.findMany(),
      db.patient.findMany(),
      db.service.findMany(),
      db.session.findMany(),
      db.visit.findMany(),
      db.note.findMany(),
      db.alert.findMany(),
    ])

    const backupData = {
      version: '1.0',
      appName: 'عيادة الجلدية',
      exportedAt: new Date().toISOString(),
      type: 'auto',
      stats: {
        users: users.length,
        patients: patients.length,
        services: services.length,
        sessions: sessions.length,
        visits: visits.length,
        notes: notes.length,
        alerts: alerts.length,
      },
      data: { users, patients, services, sessions, visits, notes, alerts },
    }

    const jsonData = JSON.stringify(backupData)
    const sizeBytes = Buffer.byteLength(jsonData, 'utf-8')

    // Auto cleanup: keep last 10 auto backups
    const autoBackups = await db.backup.findMany({
      where: { type: 'auto' },
      orderBy: { createdAt: 'desc' },
    })

    if (autoBackups.length >= 10) {
      const toDelete = autoBackups.slice(10)
      for (const b of toDelete) {
        await db.backup.delete({ where: { id: b.id } })
      }
    }

    // Generate name
    const now = new Date()
    const date = now.toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' })
    const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    const name = `تلقائي - ${date} ${time}`

    // Save backup
    await db.backup.create({
      data: {
        name,
        type: 'auto',
        size: sizeBytes,
        data: jsonData,
      },
    })

    console.log(`[AutoBackup] Created successfully - ${name} (${formatSize(sizeBytes)})`)

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء نسخة احتياطية تلقائية بنجاح',
      stats: backupData.stats,
      size: formatSize(sizeBytes),
    })
  } catch (error) {
    console.error('[AutoBackup] Error:', error)
    return NextResponse.json({ error: 'خطأ في النسخ الاحتياطي التلقائي' }, { status: 500 })
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
