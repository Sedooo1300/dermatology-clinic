import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/backup - List all saved backups
export async function GET() {
  try {
    const backups = await db.backup.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Return metadata without the heavy data field
    const meta = backups.map(b => ({
      id: b.id,
      name: b.name,
      type: b.type,
      size: b.size,
      sizeFormatted: formatSize(b.size),
      createdAt: b.createdAt,
    }))

    return NextResponse.json({ backups: meta })
  } catch (error) {
    console.error('GET backups error:', error)
    return NextResponse.json({ error: 'خطأ في جلب النسخ الاحتياطية' }, { status: 500 })
  }
}

// POST /api/backup - Create a new backup (auto or manual)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const type = body.type || 'manual'
    const name = body.name || generateBackupName(type)

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

    // Save backup to database (auto cleanup: keep last 10 backups max)
    const existingCount = await db.backup.count()
    if (existingCount >= 10) {
      const oldest = await db.backup.findFirst({ orderBy: { createdAt: 'asc' } })
      if (oldest) await db.backup.delete({ where: { id: oldest.id } })
    }

    const backup = await db.backup.create({
      data: {
        name,
        type,
        size: sizeBytes,
        data: jsonData,
      },
    })

    return NextResponse.json({
      backup: {
        id: backup.id,
        name: backup.name,
        type: backup.type,
        size: formatSize(sizeBytes),
        createdAt: backup.createdAt,
        stats: backupData.stats,
      },
      exportData: backupData, // Include full data for download
    }, { status: 201 })
  } catch (error) {
    console.error('POST backup error:', error)
    return NextResponse.json({ error: 'خطأ في إنشاء نسخة احتياطية' }, { status: 500 })
  }
}

// DELETE /api/backup?id=xxx - Delete a backup
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'معرف النسخة مطلوب' }, { status: 400 })
    }

    await db.backup.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE backup error:', error)
    return NextResponse.json({ error: 'خطأ في حذف النسخة الاحتياطية' }, { status: 500 })
  }
}

function generateBackupName(type: string) {
  const now = new Date()
  const date = now.toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' })
  const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
  const prefix = type === 'auto' ? 'تلقائي' : 'يدوي'
  return `${prefix} - ${date} ${time}`
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
