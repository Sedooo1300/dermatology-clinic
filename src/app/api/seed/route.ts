import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Create default users
    const doctor = await db.user.upsert({
      where: { id: 'doctor-1' },
      update: {},
      create: {
        id: 'doctor-1',
        name: 'د. أحمد محمد',
        role: 'doctor',
        phone: '0501234567',
        isActive: true,
      },
    })

    const secretary = await db.user.upsert({
      where: { id: 'sec-1' },
      update: {},
      create: {
        id: 'sec-1',
        name: 'فاطمة علي',
        role: 'secretary',
        phone: '0507654321',
        isActive: true,
      },
    })

    // Create default services
    const services = [
      { name: 'كشف عام', description: 'فحص جلدي عام', price: 200, duration: 30 },
      { name: 'استشارة متقدمة', description: 'استشارة جلدية متقدمة', price: 350, duration: 45 },
      { name: 'إزالة شعر بالليزر', description: 'جلسة إزالة شعر بالليزر', price: 500, duration: 60 },
      { name: 'تقشير كيميائي', description: 'جلسة تقشير كيميائي للوجه', price: 400, duration: 45 },
      { name: 'ميزوثيرابي', description: 'جلسة ميزوثيرابي للوجه والشعر', price: 600, duration: 60 },
      { name: 'علاج حب الشباب', description: 'برنامج علاج حب الشباب', price: 300, duration: 30 },
      { name: 'فحص الشامة', description: 'فحص وتحليل الشامات', price: 250, duration: 20 },
      { name: 'حجامة جلدية', description: 'جلسة حجامة جلدية', price: 150, duration: 30 },
      { name: 'بلازما', description: 'علاج بالبلازما الغنية بالصفائح', price: 800, duration: 45 },
      { name: 'حقن فيلر', description: 'حقن فيلر تجميلي', price: 1200, duration: 30 },
    ]

    for (const s of services) {
      await db.service.upsert({
        where: { id: `service-${s.name.replace(/\s/g, '-')}` },
        update: {},
        create: {
          id: `service-${s.name.replace(/\s/g, '-')}`,
          ...s,
          isActive: true,
        },
      })
    }

    // Create sample patients
    const patients = [
      { name: 'محمد عبدالله السعيد', phone: '0551234567', age: 35, gender: 'male', fileNumber: 'P001' },
      { name: 'نورة خالد العتيبي', phone: '0559876543', age: 28, gender: 'female', fileNumber: 'P002' },
      { name: 'عبدالرحمن سعد الدوسري', phone: '0541112233', age: 42, gender: 'male', fileNumber: 'P003' },
      { name: 'سارة أحمد القحطاني', phone: '0553334455', age: 25, gender: 'female', fileNumber: 'P004' },
      { name: 'فهد محمد الشمري', phone: '0565556677', age: 50, gender: 'male', fileNumber: 'P005' },
    ]

    for (const p of patients) {
      await db.patient.upsert({
        where: { fileNumber: p.fileNumber! },
        update: {},
        create: {
          ...p,
          status: 'active',
          createdBy: secretary.id,
        },
      })
    }

    return NextResponse.json({
      message: 'تم تهيئة البيانات بنجاح',
      doctor,
      secretary,
      servicesCount: services.length,
      patientsCount: patients.length,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'فشل في تهيئة البيانات' }, { status: 500 })
  }
}
