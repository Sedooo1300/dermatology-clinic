---
Task ID: 1
Agent: Main Agent
Task: فحص وإصلاح نظام المزامنة في تطبيق عيادة الجلدية

Work Log:
- قراءة جميع ملفات المشروع المتعلقة بالمزامنة
- اكتشاف 6 مشاكل حرجة في نظام المزامنة
- إصلاح socket-server.ts: تغيير الاتصال من خلال Caddy gateway إلى الاتصال المباشر بالمنفذ 3003
- إضافة أحداث الحذف المفقودة (visit:deleted, session:deleted, alert:updated, alert:deleted) في sync-service
- إضافة emitSync في API routes للحذف: visits/[id], sessions/[id], alerts/[id]
- إضافة جميع الأحداث المفقودة (16 حدث) في useSync.ts
- إضافة handlers للحذف في useClinicData.ts لجميع الأحداث
- إضافة آلية Polling fallback (كل 5 ثوان) عند فقدان اتصال WebSocket
- إصلاح مشكلة binding المنفذ (0.0.0.0 لا يعمل → استخدم 127.0.0.1)
- إعادة تشغيل خدمة المزامنة وتأكيدها تعمل
- اختبار ناجح: بث الأحداث بين عميلين يعمل
- اختبار ناجح: الاتصال عبر Caddy gateway يعمل
- تشغيل lint بدون أخطاء

Stage Summary:
- تم إصلاح 6 مشاكل حرجة في نظام المزامنة
- خدمة المزامنة تعمل الآن على المنفذ 3003 (127.0.0.1)
- جميع أحداث CRUD (إنشاء، تعديل، حذف) تُبث بين الأجهزة
- آلية Polling تعمل كـ backup عند فقدان WebSocket
- تم اختبار الاتصال بين عميلين بنجاح + عبر Caddy gateway

---
Task ID: 2
Agent: Main Agent
Task: تجهيز التطبيق للنشر على GitHub و Vercel

Work Log:
- تحليل هيكل المشروع بالكامل وتحديد المشاكل للنشر على Vercel
- ترحيل قاعدة البيانات: إضافة دعم Turso (libSQL) عبر @prisma/adapter-libsql
- تحديث src/lib/db.ts: دعم قاعدة بيانات محلية (SQLite) وبعيدة (Turso) تلقائياً
- تحويل Socket.IO sync إلى polling فقط (WebSocket لا يعمل على Vercel serverless)
- تحديث src/hooks/useSync.ts: يبدأ بـ polling ويحاول WebSocket مع fallback تلقائي
- تحديث src/lib/socket-server.ts: يصبح no-op على Vercel (بدون SYNC_URL)
- إصلاح حفظ السمة (Theme) في localStorage
- إنشاء .gitignore شامل (يستثني node_modules, .next, db, skills, upload)
- إنشاء .env.example مع تعليمات التكوين
- إنشاء vercel.json للنشر
- تنظيف package.json: إضافة libSQL deps, تحديث build scripts, إضافة postinstall
- إصلاح أخطاء TypeScript: نوع User.role, مقارنة activeSubView, socket.id nullable
- إضافة skills/ و db/ و upload/ إلى tsconfig.json exclude
- استعادة postcss.config.mjs و eslint.config.mjs
- حذف ملفات غير ضرورية: Caddyfile, bun.lock, examples/, mini-services/
- إنشاء package-lock.json للبناء المتكرر
- اختبار البناء: ناجح ✅ (18 API route + 1 صفحة رئيسية)

Stage Summary:
- المشروع جاهز للنشر على Vercel مع قاعدة بيانات Turso
- البناء يعمل بنجاح: `npx next build` يمر بدون أخطاء
- المزامنة تعمل بـ polling mode على Vercel (بدون WebSocket server)
- السمة تُحفظ في localStorage الآن
- ملفات النشر جاهزة: .gitignore, .env.example, vercel.json, package.json
