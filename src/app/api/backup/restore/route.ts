import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/backup/restore - Restore from a saved backup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { backupId, importData } = body

    let backupData: any = null

    if (importData) {
      // Restore from uploaded file
      backupData = typeof importData === 'string' ? JSON.parse(importData) : importData
    } else if (backupId) {
      // Restore from saved backup in database
      const backup = await db.backup.findUnique({ where: { id: backupId } })
      if (!backup) {
        return NextResponse.json({ error: 'النسخة الاحتياطية غير موجودة' }, { status: 404 })
      }
      backupData = JSON.parse(backup.data)
    } else {
      return NextResponse.json({ error: 'يجب توفير معرف النسخة أو بيانات الاستيراد' }, { status: 400 })
    }

    // Validate backup structure
    if (!backupData?.data) {
      return NextResponse.json({ error: 'صيغة النسخة الاحتياطية غير صحيحة' }, { status: 400 })
    }

    const { users, patients, services, sessions, visits, notes, alerts } = backupData.data

    // Delete all existing data (in reverse dependency order)
    await db.alert.deleteMany()
    await db.note.deleteMany()
    await db.session.deleteMany()
    await db.visit.deleteMany()
    await db.patient.deleteMany()
    await db.service.deleteMany()
    await db.user.deleteMany()

    // Restore data (in dependency order)
    let restoredCounts = { users: 0, patients: 0, services: 0, sessions: 0, visits: 0, notes: 0, alerts: 0 }

    if (users?.length) {
      for (const u of users) {
        await db.user.create({
          data: {
            id: u.id,
            name: u.name,
            role: u.role,
            phone: u.phone,
            isActive: u.isActive,
            createdAt: new Date(u.createdAt),
            updatedAt: new Date(u.updatedAt),
          },
        })
      }
      restoredCounts.users = users.length
    }

    if (patients?.length) {
      for (const p of patients) {
        await db.patient.create({
          data: {
            id: p.id,
            name: p.name,
            phone: p.phone,
            age: p.age,
            gender: p.gender,
            address: p.address,
            nationalId: p.nationalId,
            fileNumber: p.fileNumber,
            diagnosis: p.diagnosis,
            notes: p.notes,
            status: p.status,
            createdBy: p.createdBy,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          },
        })
      }
      restoredCounts.patients = patients.length
    }

    if (services?.length) {
      for (const s of services) {
        await db.service.create({
          data: {
            id: s.id,
            name: s.name,
            description: s.description,
            price: s.price,
            duration: s.duration,
            isActive: s.isActive,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt),
          },
        })
      }
      restoredCounts.services = services.length
    }

    if (visits?.length) {
      for (const v of visits) {
        await db.visit.create({
          data: {
            id: v.id,
            patientId: v.patientId,
            doctorId: v.doctorId,
            visitDate: new Date(v.visitDate),
            visitType: v.visitType,
            diagnosis: v.diagnosis,
            prescription: v.prescription,
            examination: v.examination,
            fees: v.fees,
            paidAmount: v.paidAmount,
            notes: v.notes,
            createdBy: v.createdBy,
            createdAt: new Date(v.createdAt),
            updatedAt: new Date(v.updatedAt),
          },
        })
      }
      restoredCounts.visits = visits.length
    }

    if (sessions?.length) {
      for (const s of sessions) {
        await db.session.create({
          data: {
            id: s.id,
            patientId: s.patientId,
            serviceId: s.serviceId,
            doctorId: s.doctorId,
            status: s.status,
            sessionDate: new Date(s.sessionDate),
            notes: s.notes,
            totalPrice: s.totalPrice,
            paidAmount: s.paidAmount,
            createdBy: s.createdBy,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt),
          },
        })
      }
      restoredCounts.sessions = sessions.length
    }

    if (notes?.length) {
      for (const n of notes) {
        await db.note.create({
          data: {
            id: n.id,
            patientId: n.patientId,
            userId: n.userId,
            section: n.section,
            relatedId: n.relatedId,
            content: n.content,
            isImportant: n.isImportant,
            createdAt: new Date(n.createdAt),
            updatedAt: new Date(n.updatedAt),
          },
        })
      }
      restoredCounts.notes = notes.length
    }

    if (alerts?.length) {
      for (const a of alerts) {
        await db.alert.create({
          data: {
            id: a.id,
            patientId: a.patientId,
            title: a.title,
            message: a.message,
            alertDate: new Date(a.alertDate),
            isRead: a.isRead,
            alertType: a.alertType,
            createdAt: new Date(a.createdAt),
            updatedAt: new Date(a.updatedAt),
          },
        })
      }
      restoredCounts.alerts = alerts.length
    }

    return NextResponse.json({
      success: true,
      message: 'تم استعادة النسخة الاحتياطية بنجاح',
      restored: restoredCounts,
    })
  } catch (error) {
    console.error('Restore error:', error)
    return NextResponse.json({ 
      error: 'خطأ في استعادة النسخة الاحتياطية',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}
