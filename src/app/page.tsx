'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuthStore } from '@/lib/store'
import { useClinicData } from '@/hooks/useClinicData'
import {
  loginAPI,
  createPatientAPI,
  updatePatientAPI,
  deletePatientAPI,
  createVisitAPI,
  updateVisitAPI,
  deleteVisitAPI,
  createSessionAPI,
  updateSessionAPI,
  deleteSessionAPI,
  createServiceAPI,
  updateServiceAPI,
  deleteServiceAPI,
  createNoteAPI,
  createAlertAPI,
  updateAlertAPI,
  deleteAlertAPI,
} from '@/lib/api'
import { toast } from 'sonner'

// ─── shadcn/ui ─────────────────────────────────────────────────
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// ─── Lucide Icons ──────────────────────────────────────────────
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  BarChart3,
  MoreHorizontal,
  LogIn,
  LogOut,
  Bell,
  Plus,
  Search,
  RefreshCw,
  Phone,
  User as UserIcon,
  FileText,
  AlertTriangle,
  Heart,
  Activity,
  TrendingUp,
  DollarSign,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Settings,
  Trash2,
  Edit3,
  Eye,
  Check,
  AlertCircle,
  Star,
  Building2,
  ClipboardList,
  Syringe,
  Baby,
  UserCheck,
  Circle,
  Wifi,
  WifiOff,
  Lock,
  Palette,
  HardDrive,
  Download,
  Upload,
  RotateCcw,
} from 'lucide-react'

// ─── Helpers ───────────────────────────────────────────────────
function formatCurrency(val: number | null | undefined) {
  return `${Number(val || 0).toLocaleString('ar-EG')} جنيه`
}

function formatDate(dateStr: string | Date) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    calendar: 'gregory',
  })
}

function formatDateTime(dateStr: string | Date) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    calendar: 'gregory',
  })
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function generateFileNumber() {
  return 'F-' + Date.now().toString(36).toUpperCase()
}

// ─── Color Themes ──────────────────────────────────────────
export const COLOR_THEMES = [
  { id: 'teal', name: 'أخضر زمردي', primary: 'from-emerald-500 to-teal-600', bg: 'from-teal-50 via-emerald-50 to-cyan-50', btn: 'bg-emerald-600 hover:bg-emerald-700', badge: 'text-emerald-700', ring: 'ring-emerald-600', dot: 'bg-emerald-500', icon: 'text-emerald-600', light: 'bg-emerald-50', lightText: 'text-emerald-700', border: 'border-emerald-200', hue: '163' },
  { id: 'blue', name: 'أزرق سماوي', primary: 'from-blue-500 to-indigo-600', bg: 'from-blue-50 via-indigo-50 to-sky-50', btn: 'bg-blue-600 hover:bg-blue-700', badge: 'text-blue-700', ring: 'ring-blue-600', dot: 'bg-blue-500', icon: 'text-blue-600', light: 'bg-blue-50', lightText: 'text-blue-700', border: 'border-blue-200', hue: '250' },
  { id: 'purple', name: 'بنفسجي ملكي', primary: 'from-purple-500 to-violet-600', bg: 'from-purple-50 via-violet-50 to-fuchsia-50', btn: 'bg-purple-600 hover:bg-purple-700', badge: 'text-purple-700', ring: 'ring-purple-600', dot: 'bg-purple-500', icon: 'text-purple-600', light: 'bg-purple-50', lightText: 'text-purple-700', border: 'border-purple-200', hue: '290' },
  { id: 'rose', name: 'وردي طبي', primary: 'from-rose-500 to-pink-600', bg: 'from-rose-50 via-pink-50 to-fuchsia-50', btn: 'bg-rose-600 hover:bg-rose-700', badge: 'text-rose-700', ring: 'ring-rose-600', dot: 'bg-rose-500', icon: 'text-rose-600', light: 'bg-rose-50', lightText: 'text-rose-700', border: 'border-rose-200', hue: '350' },
  { id: 'amber', name: 'ذهبي أنيق', primary: 'from-amber-500 to-orange-600', bg: 'from-amber-50 via-orange-50 to-yellow-50', btn: 'bg-amber-600 hover:bg-amber-700', badge: 'text-amber-700', ring: 'ring-amber-600', dot: 'bg-amber-500', icon: 'text-amber-600', light: 'bg-amber-50', lightText: 'text-amber-700', border: 'border-amber-200', hue: '75' },
  { id: 'slate', name: 'رمادي فاخر', primary: 'from-slate-600 to-zinc-700', bg: 'from-slate-50 via-gray-50 to-zinc-50', btn: 'bg-slate-700 hover:bg-slate-800', badge: 'text-slate-700', ring: 'ring-slate-600', dot: 'bg-slate-500', icon: 'text-slate-600', light: 'bg-slate-100', lightText: 'text-slate-700', border: 'border-slate-200', hue: '220' },
]

function applyThemeCSS(theme: typeof COLOR_THEMES[number]) {
  if (typeof document === 'undefined') return
  const h = theme.hue
  const root = document.documentElement
  root.style.setProperty('--background', `oklch(0.985 0.002 ${h})`)
  root.style.setProperty('--foreground', `oklch(0.15 0.02 ${h})`)
  root.style.setProperty('--card-foreground', `oklch(0.15 0.02 ${h})`)
  root.style.setProperty('--popover-foreground', `oklch(0.15 0.02 ${h})`)
  root.style.setProperty('--primary', `oklch(0.55 0.15 ${h})`)
  root.style.setProperty('--primary-foreground', `oklch(0.99 0.002 ${h})`)
  root.style.setProperty('--secondary', `oklch(0.94 0.015 ${h})`)
  root.style.setProperty('--secondary-foreground', `oklch(0.25 0.04 ${h})`)
  root.style.setProperty('--muted', `oklch(0.95 0.01 ${h})`)
  root.style.setProperty('--muted-foreground', `oklch(0.5 0.03 ${h})`)
  root.style.setProperty('--accent', `oklch(0.94 0.015 ${h})`)
  root.style.setProperty('--accent-foreground', `oklch(0.25 0.04 ${h})`)
  root.style.setProperty('--border', `oklch(0.91 0.015 ${h})`)
  root.style.setProperty('--input', `oklch(0.91 0.015 ${h})`)
  root.style.setProperty('--ring', `oklch(0.55 0.15 ${h})`)
  root.style.setProperty('--chart-1', `oklch(0.55 0.15 ${h})`)
  root.style.setProperty('--chart-2', `oklch(0.65 0.14 ${h})`)
  root.style.setProperty('--chart-3', `oklch(0.75 0.12 ${h})`)
  root.style.setProperty('--sidebar', `oklch(0.97 0.008 ${h})`)
  root.style.setProperty('--sidebar-primary', `oklch(0.55 0.15 ${h})`)
  root.style.setProperty('--sidebar-primary-foreground', `oklch(0.99 0.002 ${h})`)
  root.style.setProperty('--sidebar-accent', `oklch(0.94 0.015 ${h})`)
  root.style.setProperty('--sidebar-accent-foreground', `oklch(0.25 0.04 ${h})`)
  root.style.setProperty('--sidebar-border', `oklch(0.91 0.015 ${h})`)
  root.style.setProperty('--sidebar-ring', `oklch(0.55 0.15 ${h})`)
  // Update meta theme-color
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    const metaColors: Record<string, string> = {
      teal: '#0d9488', blue: '#2563eb', purple: '#7c3aed', rose: '#e11d48', amber: '#d97706', slate: '#334155'
    }
    meta.setAttribute('content', metaColors[theme.id] || '#0d9488')
  }
}

function removeThemeCSS() {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const props = ['--background','--foreground','--card-foreground','--popover-foreground','--primary','--primary-foreground','--secondary','--secondary-foreground','--muted','--muted-foreground','--accent','--accent-foreground','--border','--input','--ring','--chart-1','--chart-2','--chart-3','--sidebar','--sidebar-primary','--sidebar-primary-foreground','--sidebar-accent','--sidebar-accent-foreground','--sidebar-border','--sidebar-ring']
  props.forEach(p => root.style.removeProperty(p))
}

// ─── Type definitions ──────────────────────────────────────────
type MainTab = 'dashboard' | 'patients' | 'visits' | 'sessions' | 'reports' | 'more'
type SubView = 'list' | 'detail' | 'form'
type PatientDetailTab = 'visits' | 'sessions' | 'notes' | 'alerts'
type ReportSubTab = 'daily' | 'weekly' | 'monthly'
type MoreSubTab = 'services' | 'alerts' | 'settings'

// ═══════════════════════════════════════════════════════════════
// MAIN APP COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function Home() {
  const { user, isAuthenticated, login, logout } = useAuthStore()
  const clinic = useClinicData()

  // ─── Login form state ─────────────────────────────────────
  const [loginName, setLoginName] = useState('')
  const [loginRole, setLoginRole] = useState<'doctor' | 'secretary'>('doctor')
  const [loginLoading, setLoginLoading] = useState(false)

  // ─── Navigation state ─────────────────────────────────────
  const [activeTab, setActiveTab] = useState<MainTab>('dashboard')
  const [activeSubView, setActiveSubView] = useState<SubView>('list')
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [patientDetailTab, setPatientDetailTab] = useState<PatientDetailTab>('visits')
  const [reportSubTab, setReportSubTab] = useState<ReportSubTab>('daily')
  const [moreSubTab, setMoreSubTab] = useState<MoreSubTab>('services')

  // ─── Dialog states ────────────────────────────────────────
  const [addPatientOpen, setAddPatientOpen] = useState(false)
  const [addVisitOpen, setAddVisitOpen] = useState(false)
  const [addSessionOpen, setAddSessionOpen] = useState(false)
  const [addNoteOpen, setAddNoteOpen] = useState(false)
  const [addAlertOpen, setAddAlertOpen] = useState(false)
  const [addServiceOpen, setAddServiceOpen] = useState(false)
  const [editPatientOpen, setEditPatientOpen] = useState(false)
  const [editVisitOpen, setEditVisitOpen] = useState(false)
  const [editSessionOpen, setEditSessionOpen] = useState(false)
  const [editServiceOpen, setEditServiceOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null)

  // ─── Search & filter state ────────────────────────────────
  const [patientSearch, setPatientSearch] = useState('')
  const [visitDateFilter, setVisitDateFilter] = useState(todayStr())
  const [visitTypeFilter, setVisitTypeFilter] = useState<string>('')
  const [sessionDateFilter, setSessionDateFilter] = useState(todayStr())
  const [sessionStatusFilter, setSessionStatusFilter] = useState<string>('')

  // ─── Form states ──────────────────────────────────────────
  const emptyPatient = { name: '', phone: '', age: '', gender: '', address: '', nationalId: '', fileNumber: '', diagnosis: '', notes: '', status: 'active' }
  const [patientForm, setPatientForm] = useState(emptyPatient)
  const [visitForm, setVisitForm] = useState({ patientId: '', visitType: 'new', visitDate: todayStr(), diagnosis: '', prescription: '', examination: '', fees: '', paidAmount: '', notes: '' })
  const [sessionForm, setSessionForm] = useState({ patientId: '', serviceId: '', sessionDate: todayStr(), status: 'scheduled', totalPrice: '', paidAmount: '', notes: '' })
  const [noteForm, setNoteForm] = useState({ content: '', section: 'general', isImportant: false })
  const [alertForm, setAlertForm] = useState({ patientId: '', title: '', message: '', alertDate: todayStr(), alertType: 'reminder' })
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', price: '', duration: '' })
  const [editItem, setEditItem] = useState<any>(null)

  // ─── Theme & Reports Password ───────────────────────────
  const [selectedTheme, setSelectedTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('derm-theme') || 'teal'
    }
    return 'teal'
  })

  // Persist theme to localStorage
  const handleThemeChange = useCallback((themeId: string) => {
    setSelectedTheme(themeId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('derm-theme', themeId)
    }
  }, [])
  const [reportsUnlocked, setReportsUnlocked] = useState(false)
  const [reportsPassword, setReportsPassword] = useState('')
  const [reportsPasswordOpen, setReportsPasswordOpen] = useState(false)

  // ─── Backup State ─────────────────────────────────────────
  const [backups, setBackups] = useState<any[]>([])
  const [backupLoading, setBackupLoading] = useState(false)

  // Fetch backups when settings tab is open
  useEffect(() => {
    if (activeTab === 'more' && moreSubTab === 'settings') {
      fetch('/api/backup')
        .then(r => r.json())
        .then(d => { if (d.backups) setBackups(d.backups) })
        .catch(() => {})
    }
  }, [activeTab, moreSubTab])

  const handleCreateBackup = useCallback(async () => {
    setBackupLoading(true)
    try {
      const res = await fetch('/api/backup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'manual' }) })
      const data = await res.json()
      if (data.backup) {
        toast.success(`تم إنشاء نسخة احتياطية (${data.backup.size})`)
        // Download file
        const blob = new Blob([JSON.stringify(data.exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `clinic-backup-${new Date().toISOString().slice(0,10)}.json`
        a.click()
        URL.revokeObjectURL(url)
        // Refresh list
        const list = await fetch('/api/backup').then(r => r.json())
        if (list.backups) setBackups(list.backups)
      } else {
        toast.error(data.error || 'خطأ في إنشاء النسخة')
      }
    } catch { toast.error('خطأ في الاتصال') }
    setBackupLoading(false)
  }, [])

  const handleImportBackup = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!confirm('هل أنت متأكد؟ سيتم استبدال جميع البيانات الحالية بالنسخة المحددة.')) {
      e.target.value = ''
      return
    }
    try {
      const text = await file.text()
      const res = await fetch('/api/backup/restore', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ importData: text }) })
      const data = await res.json()
      if (data.success) {
        toast.success(`تم الاستعادة بنجاح (${data.restored.patients} مريض، ${data.restored.visits} زيارة)`)
        // Refresh data
        clinic.fetchPatients()
        clinic.fetchDashboard()
      } else {
        toast.error(data.error || 'خطأ في الاستعادة')
      }
    } catch { toast.error('خطأ في قراءة الملف') }
    e.target.value = ''
  }, [clinic])

  const handleRestoreBackup = useCallback(async (backupId: string) => {
    if (!confirm('هل أنت متأكد؟ سيتم حذف جميع البيانات واستبدالها بهذه النسخة.')) return
    try {
      const res = await fetch('/api/backup/restore', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ backupId }) })
      const data = await res.json()
      if (data.success) {
        toast.success(`تم الاستعادة بنجاح (${data.restored.patients} مريض)`)
        clinic.fetchPatients()
        clinic.fetchDashboard()
      } else {
        toast.error(data.error || 'خطأ في الاستعادة')
      }
    } catch { toast.error('خطأ في الاتصال') }
  }, [clinic])

  const handleDeleteBackup = useCallback(async (backupId: string) => {
    if (!confirm('هل تريد حذف هذه النسخة؟')) return
    try {
      await fetch(`/api/backup?id=${backupId}`, { method: 'DELETE' })
      setBackups(prev => prev.filter((b: any) => b.id !== backupId))
      toast.success('تم حذف النسخة')
    } catch { toast.error('خطأ في الحذف') }
  }, [])

  const currentTheme = COLOR_THEMES.find(t => t.id === selectedTheme) || COLOR_THEMES[0]

  // Apply theme on change and on mount
  useEffect(() => {
    if (selectedTheme === 'teal') {
      removeThemeCSS()
    } else {
      applyThemeCSS(currentTheme)
    }
  }, [selectedTheme, currentTheme])

  // Reports password check
  const handleReportsAccess = () => {
    if (reportsUnlocked) return
    setReportsPasswordOpen(true)
  }
  const handleReportsPasswordSubmit = () => {
    if (reportsPassword === '2137') {
      setReportsUnlocked(true)
      setReportsPasswordOpen(false)
      setReportsPassword('')
      toast.success('تم فتح التقارير بنجاح')
    } else {
      toast.error('كلمة السر غير صحيحة')
      setReportsPassword('')
    }
  }

  // ─── Patient search debounce ──────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        clinic.fetchPatients({
          name: patientSearch || undefined,
          phone: patientSearch || undefined,
          fileNumber: patientSearch || undefined,
        })
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [patientSearch, isAuthenticated])

  // ─── Initial data load ────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      clinic.fetchDashboard()
      clinic.fetchServices()
      clinic.fetchAlerts({ isRead: false })
    }
  }, [isAuthenticated])

  // ─── Tab change: load data ────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return
    if (activeTab === 'visits') {
      clinic.fetchVisits({ dateFrom: visitDateFilter, dateTo: visitDateFilter, visitType: visitTypeFilter || undefined })
    } else if (activeTab === 'sessions') {
      clinic.fetchSessions({ dateFrom: sessionDateFilter, dateTo: sessionDateFilter, status: sessionStatusFilter || undefined })
    } else if (activeTab === 'reports') {
      if (reportSubTab === 'daily') clinic.fetchDailyReport()
      else if (reportSubTab === 'weekly') clinic.fetchWeeklyReport()
      else clinic.fetchMonthlyReport()
    } else if (activeTab === 'more') {
      if (moreSubTab === 'services') clinic.fetchServices()
      else if (moreSubTab === 'alerts') clinic.fetchAlerts()
    }
  }, [activeTab, reportSubTab, moreSubTab, visitDateFilter, visitTypeFilter, sessionDateFilter, sessionStatusFilter, isAuthenticated])

  // ─── Login handler ────────────────────────────────────────
  const handleLogin = async () => {
    if (!loginName.trim()) {
      toast.error('يرجى إدخال الاسم')
      return
    }
    setLoginLoading(true)
    try {
      const { user: userData } = await loginAPI(loginName.trim(), loginRole)
      login(userData)
      toast.success(`مرحباً ${userData.name}`)
    } catch (err: any) {
      toast.error(err.message || 'خطأ في تسجيل الدخول')
    }
    setLoginLoading(false)
  }

  const handleLogout = () => {
    logout()
    toast.success('تم تسجيل الخروج')
  }

  // ─── Patient detail navigation ────────────────────────────
  const openPatientDetail = (id: string) => {
    setSelectedPatientId(id)
    setActiveSubView('detail')
    setPatientDetailTab('visits')
    clinic.fetchPatientDetail(id)
  }

  const backToList = () => {
    setActiveSubView('list')
    setSelectedPatientId(null)
  }

  // ─── CRUD Handlers ────────────────────────────────────────
  const handleCreatePatient = async () => {
    if (!patientForm.name.trim()) {
      toast.error('يرجى إدخال اسم المريض')
      return
    }
    try {
      const data = { ...patientForm, age: patientForm.age ? parseInt(patientForm.age) : null, fileNumber: patientForm.fileNumber || generateFileNumber(), createdBy: user?.id }
      const { patient } = await createPatientAPI(data)
      toast.success('تم إضافة المريض بنجاح')
      setAddPatientOpen(false)
      setPatientForm(emptyPatient)
      clinic.fetchPatients()
      clinic.fetchDashboard()
      // If we were on patient detail with a patient selected, refresh
      if (selectedPatientId) clinic.fetchPatientDetail(selectedPatientId)
    } catch (err: any) {
      toast.error(err.message || 'خطأ في إضافة المريض')
    }
  }

  const handleEditPatient = async () => {
    if (!editItem) return
    try {
      const data = { ...patientForm, age: patientForm.age ? parseInt(patientForm.age) : null, userId: user?.id }
      await updatePatientAPI(editItem.id, data)
      toast.success('تم تحديث بيانات المريض')
      setEditPatientOpen(false)
      setEditItem(null)
      setPatientForm(emptyPatient)
      clinic.fetchPatients()
      if (selectedPatientId) clinic.fetchPatientDetail(selectedPatientId)
      clinic.fetchDashboard()
    } catch (err: any) {
      toast.error(err.message || 'خطأ في تحديث البيانات')
    }
  }

  const openEditPatient = (patient: any) => {
    setEditItem(patient)
    setPatientForm({
      name: patient.name || '',
      phone: patient.phone || '',
      age: patient.age?.toString() || '',
      gender: patient.gender || '',
      address: patient.address || '',
      nationalId: patient.nationalId || '',
      fileNumber: patient.fileNumber || '',
      diagnosis: patient.diagnosis || '',
      notes: patient.notes || '',
      status: patient.status || 'active',
    })
    setEditPatientOpen(true)
  }

  const handleCreateVisit = async () => {
    if (!visitForm.patientId) {
      toast.error('يرجى اختيار المريض')
      return
    }
    try {
      const data = {
        ...visitForm,
        fees: visitForm.fees ? parseFloat(visitForm.fees) : null,
        paidAmount: visitForm.paidAmount ? parseFloat(visitForm.paidAmount) : 0,
        doctorId: user?.id,
        createdBy: user?.id,
      }
      await createVisitAPI(data)
      toast.success('تم تسجيل الزيارة بنجاح')
      setAddVisitOpen(false)
      setVisitForm({ patientId: '', visitType: 'new', visitDate: todayStr(), diagnosis: '', prescription: '', examination: '', fees: '', paidAmount: '', notes: '' })
      clinic.fetchVisits({ dateFrom: visitDateFilter, dateTo: visitDateFilter, visitType: visitTypeFilter || undefined })
      if (selectedPatientId) {
        clinic.fetchPatientDetail(selectedPatientId)
      }
    } catch (err: any) {
      toast.error(err.message || 'خطأ في تسجيل الزيارة')
    }
  }

  const handleEditVisit = async () => {
    if (!editItem) return
    try {
      const data = {
        ...visitForm,
        fees: visitForm.fees ? parseFloat(visitForm.fees) : null,
        paidAmount: visitForm.paidAmount ? parseFloat(visitForm.paidAmount) : 0,
        doctorId: user?.id,
        userId: user?.id,
      }
      await updateVisitAPI(editItem.id, data)
      toast.success('تم تحديث الزيارة')
      setEditVisitOpen(false)
      setEditItem(null)
      clinic.fetchVisits({ dateFrom: visitDateFilter, dateTo: visitDateFilter, visitType: visitTypeFilter || undefined })
      if (selectedPatientId) clinic.fetchPatientDetail(selectedPatientId)
    } catch (err: any) {
      toast.error(err.message || 'خطأ في التحديث')
    }
  }

  const openEditVisit = (visit: any) => {
    setEditItem(visit)
    setVisitForm({
      patientId: visit.patientId || '',
      visitType: visit.visitType || 'new',
      visitDate: visit.visitDate ? new Date(visit.visitDate).toISOString().split('T')[0] : todayStr(),
      diagnosis: visit.diagnosis || '',
      prescription: visit.prescription || '',
      examination: visit.examination || '',
      fees: visit.fees?.toString() || '',
      paidAmount: visit.paidAmount?.toString() || '',
      notes: visit.notes || '',
    })
    setEditVisitOpen(true)
  }

  const handleCreateSession = async () => {
    if (!sessionForm.patientId || !sessionForm.serviceId) {
      toast.error('يرجى اختيار المريض والخدمة')
      return
    }
    try {
      const data = {
        ...sessionForm,
        totalPrice: sessionForm.totalPrice ? parseFloat(sessionForm.totalPrice) : null,
        paidAmount: sessionForm.paidAmount ? parseFloat(sessionForm.paidAmount) : 0,
        doctorId: user?.id,
        createdBy: user?.id,
      }
      await createSessionAPI(data)
      toast.success('تم حجز الجلسة بنجاح')
      setAddSessionOpen(false)
      setSessionForm({ patientId: '', serviceId: '', sessionDate: todayStr(), status: 'scheduled', totalPrice: '', paidAmount: '', notes: '' })
      clinic.fetchSessions({ dateFrom: sessionDateFilter, dateTo: sessionDateFilter, status: sessionStatusFilter || undefined })
      if (selectedPatientId) clinic.fetchPatientDetail(selectedPatientId)
    } catch (err: any) {
      toast.error(err.message || 'خطأ في حجز الجلسة')
    }
  }

  const handleEditSession = async () => {
    if (!editItem) return
    try {
      const data = {
        ...sessionForm,
        totalPrice: sessionForm.totalPrice ? parseFloat(sessionForm.totalPrice) : null,
        paidAmount: sessionForm.paidAmount ? parseFloat(sessionForm.paidAmount) : 0,
        doctorId: user?.id,
        userId: user?.id,
      }
      await updateSessionAPI(editItem.id, data)
      toast.success('تم تحديث الجلسة')
      setEditSessionOpen(false)
      setEditItem(null)
      clinic.fetchSessions({ dateFrom: sessionDateFilter, dateTo: sessionDateFilter, status: sessionStatusFilter || undefined })
      if (selectedPatientId) clinic.fetchPatientDetail(selectedPatientId)
    } catch (err: any) {
      toast.error(err.message || 'خطأ في التحديث')
    }
  }

  const openEditSession = (session: any) => {
    setEditItem(session)
    setSessionForm({
      patientId: session.patientId || '',
      serviceId: session.serviceId || '',
      sessionDate: session.sessionDate ? new Date(session.sessionDate).toISOString().split('T')[0] : todayStr(),
      status: session.status || 'scheduled',
      totalPrice: session.totalPrice?.toString() || session.service?.price?.toString() || '',
      paidAmount: session.paidAmount?.toString() || '',
      notes: session.notes || '',
    })
    setEditSessionOpen(true)
  }

  const handleCreateNote = async () => {
    if (!noteForm.content.trim()) {
      toast.error('يرجى إدخال الملاحظة')
      return
    }
    try {
      await createNoteAPI({
        ...noteForm,
        patientId: selectedPatientId,
        userId: user?.id,
      })
      toast.success('تم إضافة الملاحظة')
      setAddNoteOpen(false)
      setNoteForm({ content: '', section: 'general', isImportant: false })
      clinic.fetchPatientDetail(selectedPatientId!)
    } catch (err: any) {
      toast.error(err.message || 'خطأ في إضافة الملاحظة')
    }
  }

  const handleCreateAlert = async () => {
    if (!alertForm.title.trim()) {
      toast.error('يرجى إدخال عنوان التنبيه')
      return
    }
    try {
      await createAlertAPI({
        ...alertForm,
        patientId: alertForm.patientId || selectedPatientId,
      })
      toast.success('تم إضافة التنبيه')
      setAddAlertOpen(false)
      setAlertForm({ patientId: '', title: '', message: '', alertDate: todayStr(), alertType: 'reminder' })
      if (selectedPatientId) clinic.fetchPatientDetail(selectedPatientId)
      clinic.fetchAlerts()
    } catch (err: any) {
      toast.error(err.message || 'خطأ في إضافة التنبيه')
    }
  }

  const handleCreateService = async () => {
    if (!serviceForm.name.trim()) {
      toast.error('يرجى إدخال اسم الخدمة')
      return
    }
    try {
      await createServiceAPI({
        name: serviceForm.name,
        description: serviceForm.description,
        price: parseFloat(serviceForm.price) || 0,
        duration: serviceForm.duration ? parseInt(serviceForm.duration) : null,
      })
      toast.success('تم إضافة الخدمة')
      setAddServiceOpen(false)
      setServiceForm({ name: '', description: '', price: '', duration: '' })
      clinic.fetchServices()
    } catch (err: any) {
      toast.error(err.message || 'خطأ في إضافة الخدمة')
    }
  }

  const handleEditService = async () => {
    if (!editItem) return
    try {
      await updateServiceAPI(editItem.id, {
        name: serviceForm.name,
        description: serviceForm.description,
        price: parseFloat(serviceForm.price) || 0,
        duration: serviceForm.duration ? parseInt(serviceForm.duration) : null,
        isActive: editItem.isActive,
      })
      toast.success('تم تحديث الخدمة')
      setEditServiceOpen(false)
      setEditItem(null)
      setServiceForm({ name: '', description: '', price: '', duration: '' })
      clinic.fetchServices()
    } catch (err: any) {
      toast.error(err.message || 'خطأ في تحديث الخدمة')
    }
  }

  const openEditService = (service: any) => {
    setEditItem(service)
    setServiceForm({
      name: service.name || '',
      description: service.description || '',
      price: service.price?.toString() || '',
      duration: service.duration?.toString() || '',
    })
    setEditServiceOpen(true)
  }

  const handleMarkAlertRead = async (alertId: string) => {
    try {
      await updateAlertAPI(alertId, { isRead: true })
      clinic.fetchAlerts()
      clinic.fetchDashboard()
      if (selectedPatientId) clinic.fetchPatientDetail(selectedPatientId)
    } catch {
      toast.error('خطأ في تحديث التنبيه')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      if (deleteTarget.type === 'patient') await deletePatientAPI(deleteTarget.id, user?.id)
      else if (deleteTarget.type === 'visit') await deleteVisitAPI(deleteTarget.id)
      else if (deleteTarget.type === 'session') await deleteSessionAPI(deleteTarget.id)
      else if (deleteTarget.type === 'alert') await deleteAlertAPI(deleteTarget.id)
      else if (deleteTarget.type === 'service') await deleteServiceAPI(deleteTarget.id)
      toast.success('تم الحذف بنجاح')
      clinic.fetchDashboard()
      clinic.fetchPatients()
      clinic.fetchVisits()
      clinic.fetchSessions()
      clinic.fetchServices()
      clinic.fetchAlerts()
      if (selectedPatientId) clinic.fetchPatientDetail(selectedPatientId)
    } catch (err: any) {
      toast.error(err.message || 'خطأ في الحذف')
    }
    setDeleteConfirmOpen(false)
    setDeleteTarget(null)
  }

  const confirmDelete = (type: string, id: string) => {
    setDeleteTarget({ type, id })
    setDeleteConfirmOpen(true)
  }

  // ─── Auto-fill session price from service ─────────────────
  const handleSessionServiceChange = useCallback((serviceId: string) => {
    setSessionForm(prev => {
      const svc = clinic.services.find(s => s.id === serviceId)
      return {
        ...prev,
        serviceId,
        totalPrice: svc?.price?.toString() || '',
      }
    })
  }, [clinic.services])

  // ─── Unread alert count ───────────────────────────────────
  const unreadCount = useMemo(() => {
    return clinic.alerts.filter(a => !a.isRead).length
  }, [clinic.alerts])

  // ═══════════════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ═══════════════════════════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6">
              {/* Logo */}
              <div className="w-24 h-24 rounded-2xl shadow-lg overflow-hidden">
                <img src="/logo.png" alt="عيادة الجلدية" className="w-full h-full object-cover" />
              </div>

              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-emerald-800">عيادة الجلدية</h1>
                <p className="text-sm text-emerald-600">نظام إدارة العيادة</p>
              </div>

              <div className="w-full space-y-4">
                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={loginRole === 'doctor' ? 'default' : 'outline'}
                    className={`h-14 text-base ${loginRole === 'doctor' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                    onClick={() => setLoginRole('doctor')}
                  >
                    <UserCheck className="w-5 h-5 ml-2" />
                    دكتور
                  </Button>
                  <Button
                    type="button"
                    variant={loginRole === 'secretary' ? 'default' : 'outline'}
                    className={`h-14 text-base ${loginRole === 'secretary' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                    onClick={() => setLoginRole('secretary')}
                  >
                    <ClipboardList className="w-5 h-5 ml-2" />
                    سكرتيرة
                  </Button>
                </div>

                {/* Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم</Label>
                  <Input
                    id="name"
                    value={loginName}
                    onChange={e => setLoginName(e.target.value)}
                    placeholder="أدخل اسمك..."
                    className="h-12 text-base"
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                </div>

                {/* Login Button */}
                <Button
                  onClick={handleLogin}
                  disabled={loginLoading || !loginName.trim()}
                  className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700"
                >
                  {loginLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 ml-2" />
                      تسجيل الدخول
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════
  // MAIN APP LAYOUT
  // ═══════════════════════════════════════════════════════════════

  const selectedPatient = clinic.patientDetail
  const patientVisits = selectedPatient?.visits || []
  const patientSessions = selectedPatient?.sessions || []
  const patientNotes = selectedPatient?.patientNotes || []
  const patientAlerts = selectedPatient?.alerts || []

  const totalVisitFees = patientVisits.reduce((sum: number, v: any) => sum + (Number(v.fees) || 0), 0)
  const totalVisitPaid = patientVisits.reduce((sum: number, v: any) => sum + (Number(v.paidAmount) || 0), 0)
  const totalSessionPrice = patientSessions.reduce((sum: number, s: any) => sum + (Number(s.totalPrice) || 0), 0)
  const totalSessionPaid = patientSessions.reduce((sum: number, s: any) => sum + (Number(s.paidAmount) || 0), 0)

  const tabs: { id: MainTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'patients', label: 'المرضى', icon: <Users className="w-5 h-5" /> },
    { id: 'visits', label: 'الزيارات', icon: <Stethoscope className="w-5 h-5" /> },
    { id: 'sessions', label: 'الجلسات', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'reports', label: 'التقارير', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'more', label: 'المزيد', icon: <MoreHorizontal className="w-5 h-5" /> },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ─── HEADER ──────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Back button when in detail view */}
            {(activeSubView === 'detail') && (
              <Button variant="ghost" size="icon" onClick={backToList} className="touch-target">
                <ChevronRight className="w-5 h-5" />
              </Button>
            )}
            <div className="w-9 h-9 rounded-xl overflow-hidden">
              <img src="/logo.png" alt="عيادة" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-emerald-800 leading-tight">عيادة الجلدية</h1>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${clinic.connected ? 'bg-emerald-500 sync-pulse' : 'bg-red-400'}`} />
                <span className="text-[11px] text-muted-foreground">{clinic.connectionInfo || (clinic.connected ? 'متصل' : 'غير متصل')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Alert Bell */}
            <Button
              variant="ghost"
              size="icon"
              className="relative touch-target"
              onClick={() => { setActiveTab('more'); setMoreSubTab('alerts') }}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            {/* User Info */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
              <UserIcon className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">{user?.name}</span>
              <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700">
                {user?.role === 'doctor' ? 'دكتور' : 'سكرتيرة'}
              </Badge>
            </div>

            {/* Logout */}
            <Button variant="ghost" size="icon" onClick={handleLogout} className="touch-target text-red-500 hover:text-red-600 hover:bg-red-50">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* ─── CONTENT ─────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full pb-20 md:pb-4">
        {/* Desktop Sidebar Tabs */}
        <div className="hidden md:flex h-12 border-b border-border bg-white px-4 items-center gap-1">
          {tabs.map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              className={`gap-2 ${activeTab === tab.id ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
              onClick={() => { setActiveTab(tab.id); setActiveSubView('list') }}
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div className="p-4">
          {/* ─── DASHBOARD ────────────────────────────────── */}
          {activeTab === 'dashboard' && activeSubView === 'list' && (
            <DashboardTab
              clinic={clinic}
              onGoToPatients={() => { setActiveTab('patients'); setActiveSubView('list') }}
              onGoToVisits={() => { setActiveTab('visits'); setActiveSubView('list') }}
              onGoToSessions={() => { setActiveTab('sessions'); setActiveSubView('list') }}
              onAddPatient={() => setAddPatientOpen(true)}
              onAddVisit={() => setAddVisitOpen(true)}
              onAddSession={() => setAddSessionOpen(true)}
              onAlertClick={(id) => handleMarkAlertRead(id)}
              onRefresh={() => { clinic.fetchDashboard(); clinic.fetchAlerts() }}
            />
          )}

          {/* ─── PATIENTS ────────────────────────────────── */}
          {activeTab === 'patients' && activeSubView === 'list' && (
            <PatientsTab
              patients={clinic.patients}
              loading={clinic.patientsLoading}
              search={patientSearch}
              onSearch={setPatientSearch}
              onPatientClick={openPatientDetail}
              onAdd={() => setAddPatientOpen(true)}
              onRefresh={() => clinic.fetchPatients()}
            />
          )}

          {/* ─── PATIENT DETAIL ──────────────────────────── */}
          {activeTab === 'patients' && activeSubView === 'detail' && selectedPatient && (
            <PatientDetailTab
              patient={selectedPatient}
              loading={clinic.patientDetailLoading}
              activeSubTab={patientDetailTab}
              onSubTabChange={setPatientDetailTab}
              visits={patientVisits}
              sessions={patientSessions}
              notes={patientNotes}
              alerts={patientAlerts}
              totalVisitFees={totalVisitFees}
              totalVisitPaid={totalVisitPaid}
              totalSessionPrice={totalSessionPrice}
              totalSessionPaid={totalSessionPaid}
              onEditPatient={() => openEditPatient(selectedPatient)}
              onAddVisit={() => { setVisitForm(prev => ({ ...prev, patientId: selectedPatient.id })); setAddVisitOpen(true) }}
              onAddSession={() => { setSessionForm(prev => ({ ...prev, patientId: selectedPatient.id })); setAddSessionOpen(true) }}
              onAddNote={() => setAddNoteOpen(true)}
              onAddAlert={() => { setAlertForm(prev => ({ ...prev, patientId: selectedPatient.id })); setAddAlertOpen(true) }}
              onEditVisit={openEditVisit}
              onEditSession={openEditSession}
              onDelete={(type, id) => confirmDelete(type, id)}
              onMarkAlertRead={handleMarkAlertRead}
              services={clinic.services}
            />
          )}

          {/* ─── VISITS ──────────────────────────────────── */}
          {activeTab === 'visits' && (
            <VisitsTab
              visits={clinic.visits}
              loading={clinic.visitsLoading}
              dateFilter={visitDateFilter}
              onDateFilter={setVisitDateFilter}
              typeFilter={visitTypeFilter}
              onTypeFilter={setVisitTypeFilter}
              onAdd={() => setAddVisitOpen(true)}
              onEdit={openEditVisit}
              onDelete={(id) => confirmDelete('visit', id)}
              onRefresh={() => clinic.fetchVisits({ dateFrom: visitDateFilter, dateTo: visitDateFilter, visitType: visitTypeFilter || undefined })}
            />
          )}

          {/* ─── SESSIONS ────────────────────────────────── */}
          {activeTab === 'sessions' && (
            <SessionsTab
              sessions={clinic.sessions}
              loading={clinic.sessionsLoading}
              dateFilter={sessionDateFilter}
              onDateFilter={setSessionDateFilter}
              statusFilter={sessionStatusFilter}
              onStatusFilter={setSessionStatusFilter}
              onAdd={() => setAddSessionOpen(true)}
              onEdit={openEditSession}
              onDelete={(id) => confirmDelete('session', id)}
              onRefresh={() => clinic.fetchSessions({ dateFrom: sessionDateFilter, dateTo: sessionDateFilter, status: sessionStatusFilter || undefined })}
            />
          )}

          {/* ─── REPORTS ─────────────────────────────────── */}
          {activeTab === 'reports' && (
            reportsUnlocked ? (
              <ReportsTab
                reportSubTab={reportSubTab}
                onSubTabChange={setReportSubTab}
                dailyReport={clinic.dailyReport}
                weeklyReport={clinic.weeklyReport}
                monthlyReport={clinic.monthlyReport}
                loading={clinic.reportsLoading}
                services={clinic.services}
                onRefresh={() => {
                  if (reportSubTab === 'daily') clinic.fetchDailyReport()
                  else if (reportSubTab === 'weekly') clinic.fetchWeeklyReport()
                  else clinic.fetchMonthlyReport()
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className={`w-20 h-20 bg-gradient-to-br ${currentTheme.primary} rounded-2xl flex items-center justify-center shadow-lg mb-4`}>
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-2">التقارير محمية</h2>
                <p className="text-sm text-muted-foreground mb-4">أدخل كلمة السر للوصول للتقارير</p>
                <Button className={`${currentTheme.btn} text-white`} onClick={() => setReportsPasswordOpen(true)}>
                  <Lock className="w-4 h-4 ml-2" />
                  إدخال كلمة السر
                </Button>
              </div>
            )
          )}

          {/* ─── MORE ────────────────────────────────────── */}
          {activeTab === 'more' && (
            <MoreTab
              moreSubTab={moreSubTab}
              onSubTabChange={setMoreSubTab}
              services={clinic.services}
              servicesLoading={clinic.servicesLoading}
              alerts={clinic.alerts}
              alertsLoading={clinic.alertsLoading}
              onAddService={() => setAddServiceOpen(true)}
              onEditService={openEditService}
              onDeleteService={(id) => confirmDelete('service', id)}
              onAddAlert={() => setAddAlertOpen(true)}
              onMarkAlertRead={handleMarkAlertRead}
              onDeleteAlert={(id) => confirmDelete('alert', id)}
              onRefreshServices={() => clinic.fetchServices()}
              onRefreshAlerts={() => clinic.fetchAlerts()}
              selectedTheme={selectedTheme}
              onThemeChange={handleThemeChange}
              syncConnected={clinic.connected}
              syncConnectionInfo={clinic.connectionInfo}
              syncLastTime={clinic.lastSyncTime}
              backups={backups}
              backupLoading={backupLoading}
              onCreateBackup={handleCreateBackup}
              onImportBackup={handleImportBackup}
              onRestoreBackup={handleRestoreBackup}
              onDeleteBackup={handleDeleteBackup}
            />
          )}
        </div>
      </main>

      {/* ─── MOBILE BOTTOM NAVIGATION ──────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-border z-50 pb-safe">
        <div className="flex items-center justify-around h-16">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setActiveSubView('list') }}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full touch-target transition-colors ${
                activeTab === tab.id
                  ? 'text-emerald-600'
                  : 'text-muted-foreground'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* DIALOGS                                            */}
      {/* ═══════════════════════════════════════════════════════ */}

      {/* ─── ADD PATIENT DIALOG ───────────────────────────── */}
      <Dialog open={addPatientOpen} onOpenChange={setAddPatientOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              إضافة مريض جديد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>الاسم *</Label>
              <Input value={patientForm.name} onChange={e => setPatientForm(p => ({ ...p, name: e.target.value }))} placeholder="اسم المريض" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>الهاتف</Label>
                <Input value={patientForm.phone} onChange={e => setPatientForm(p => ({ ...p, phone: e.target.value }))} placeholder="05xxxxxxxx" dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>العمر</Label>
                <Input value={patientForm.age} onChange={e => setPatientForm(p => ({ ...p, age: e.target.value }))} placeholder="العمر" type="number" dir="ltr" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>الجنس</Label>
                <Select value={patientForm.gender} onValueChange={v => setPatientForm(p => ({ ...p, gender: v }))}>
                  <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ذكر">ذكر</SelectItem>
                    <SelectItem value="أنثى">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>رقم الملف</Label>
                <Input value={patientForm.fileNumber || generateFileNumber()} onChange={e => setPatientForm(p => ({ ...p, fileNumber: e.target.value }))} placeholder="تلقائي" dir="ltr" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>العنوان</Label>
              <Input value={patientForm.address} onChange={e => setPatientForm(p => ({ ...p, address: e.target.value }))} placeholder="العنوان" />
            </div>
            <div className="space-y-1.5">
              <Label>رقم الهوية</Label>
              <Input value={patientForm.nationalId} onChange={e => setPatientForm(p => ({ ...p, nationalId: e.target.value }))} placeholder="رقم الهوية الوطنية" dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>التشخيص</Label>
              <Input value={patientForm.diagnosis} onChange={e => setPatientForm(p => ({ ...p, diagnosis: e.target.value }))} placeholder="التشخيص" />
            </div>
            <div className="space-y-1.5">
              <Label>ملاحظات</Label>
              <Textarea value={patientForm.notes} onChange={e => setPatientForm(p => ({ ...p, notes: e.target.value }))} placeholder="ملاحظات إضافية" rows={2} />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAddPatientOpen(false)}>إلغاء</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleCreatePatient}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── EDIT PATIENT DIALOG ──────────────────────────── */}
      <Dialog open={editPatientOpen} onOpenChange={setEditPatientOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-emerald-600" />
              تعديل بيانات المريض
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>الاسم *</Label>
              <Input value={patientForm.name} onChange={e => setPatientForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>الهاتف</Label>
                <Input value={patientForm.phone} onChange={e => setPatientForm(p => ({ ...p, phone: e.target.value }))} dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>العمر</Label>
                <Input value={patientForm.age} onChange={e => setPatientForm(p => ({ ...p, age: e.target.value }))} type="number" dir="ltr" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>الجنس</Label>
                <Select value={patientForm.gender} onValueChange={v => setPatientForm(p => ({ ...p, gender: v }))}>
                  <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ذكر">ذكر</SelectItem>
                    <SelectItem value="أنثى">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>رقم الملف</Label>
                <Input value={patientForm.fileNumber} onChange={e => setPatientForm(p => ({ ...p, fileNumber: e.target.value }))} dir="ltr" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>العنوان</Label>
              <Input value={patientForm.address} onChange={e => setPatientForm(p => ({ ...p, address: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>رقم الهوية</Label>
              <Input value={patientForm.nationalId} onChange={e => setPatientForm(p => ({ ...p, nationalId: e.target.value }))} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>التشخيص</Label>
              <Input value={patientForm.diagnosis} onChange={e => setPatientForm(p => ({ ...p, diagnosis: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>ملاحظات</Label>
              <Textarea value={patientForm.notes} onChange={e => setPatientForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>الحالة</Label>
              <Select value={patientForm.status} onValueChange={v => setPatientForm(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditPatientOpen(false)}>إلغاء</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleEditPatient}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── ADD VISIT DIALOG ─────────────────────────────── */}
      <Dialog open={addVisitOpen} onOpenChange={setAddVisitOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              تسجيل زيارة جديدة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>المريض *</Label>
              <PatientSearchSelect
                patients={clinic.patients}
                value={visitForm.patientId}
                onChange={v => setVisitForm(p => ({ ...p, patientId: v }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>نوع الزيارة</Label>
                <Select value={visitForm.visitType} onValueChange={v => setVisitForm(p => ({ ...p, visitType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">كشف جديد</SelectItem>
                    <SelectItem value="revisit">إعادة</SelectItem>
                    <SelectItem value="session">جلسة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>التاريخ</Label>
                <Input type="date" value={visitForm.visitDate} onChange={e => setVisitForm(p => ({ ...p, visitDate: e.target.value }))} dir="ltr" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>التشخيص</Label>
              <Textarea value={visitForm.diagnosis} onChange={e => setVisitForm(p => ({ ...p, diagnosis: e.target.value }))} placeholder="التشخيص" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>الوصفة الطبية</Label>
              <Textarea value={visitForm.prescription} onChange={e => setVisitForm(p => ({ ...p, prescription: e.target.value }))} placeholder="الأدوية الموصوفة" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>الفحص</Label>
              <Textarea value={visitForm.examination} onChange={e => setVisitForm(p => ({ ...p, examination: e.target.value }))} placeholder="نتائج الفحص" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>الرسوم</Label>
                <Input type="number" value={visitForm.fees} onChange={e => setVisitForm(p => ({ ...p, fees: e.target.value }))} placeholder="0" dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>المدفوع</Label>
                <Input type="number" value={visitForm.paidAmount} onChange={e => setVisitForm(p => ({ ...p, paidAmount: e.target.value }))} placeholder="0" dir="ltr" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>ملاحظات</Label>
              <Textarea value={visitForm.notes} onChange={e => setVisitForm(p => ({ ...p, notes: e.target.value }))} placeholder="ملاحظات" rows={2} />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAddVisitOpen(false)}>إلغاء</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleCreateVisit}>تسجيل</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── EDIT VISIT DIALOG ────────────────────────────── */}
      <Dialog open={editVisitOpen} onOpenChange={setEditVisitOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-emerald-600" />
              تعديل الزيارة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>نوع الزيارة</Label>
              <Select value={visitForm.visitType} onValueChange={v => setVisitForm(p => ({ ...p, visitType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">كشف جديد</SelectItem>
                  <SelectItem value="revisit">إعادة</SelectItem>
                  <SelectItem value="session">جلسة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>التاريخ</Label>
              <Input type="date" value={visitForm.visitDate} onChange={e => setVisitForm(p => ({ ...p, visitDate: e.target.value }))} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>التشخيص</Label>
              <Textarea value={visitForm.diagnosis} onChange={e => setVisitForm(p => ({ ...p, diagnosis: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>الوصفة الطبية</Label>
              <Textarea value={visitForm.prescription} onChange={e => setVisitForm(p => ({ ...p, prescription: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>الفحص</Label>
              <Textarea value={visitForm.examination} onChange={e => setVisitForm(p => ({ ...p, examination: e.target.value }))} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>الرسوم</Label>
                <Input type="number" value={visitForm.fees} onChange={e => setVisitForm(p => ({ ...p, fees: e.target.value }))} dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>المدفوع</Label>
                <Input type="number" value={visitForm.paidAmount} onChange={e => setVisitForm(p => ({ ...p, paidAmount: e.target.value }))} dir="ltr" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>ملاحظات</Label>
              <Textarea value={visitForm.notes} onChange={e => setVisitForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditVisitOpen(false)}>إلغاء</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleEditVisit}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── ADD SESSION DIALOG ───────────────────────────── */}
      <Dialog open={addSessionOpen} onOpenChange={setAddSessionOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              حجز جلسة جديدة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>المريض *</Label>
              <PatientSearchSelect
                patients={clinic.patients}
                value={sessionForm.patientId}
                onChange={v => setSessionForm(p => ({ ...p, patientId: v }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>الخدمة *</Label>
              <Select value={sessionForm.serviceId} onValueChange={handleSessionServiceChange}>
                <SelectTrigger><SelectValue placeholder="اختر الخدمة" /></SelectTrigger>
                <SelectContent>
                  {clinic.services.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} - {formatCurrency(s.price)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>التاريخ</Label>
                <Input type="date" value={sessionForm.sessionDate} onChange={e => setSessionForm(p => ({ ...p, sessionDate: e.target.value }))} dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>الحالة</Label>
                <Select value={sessionForm.status} onValueChange={v => setSessionForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">مجدولة</SelectItem>
                    <SelectItem value="completed">مكتملة</SelectItem>
                    <SelectItem value="cancelled">ملغية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>السعر</Label>
                <Input type="number" value={sessionForm.totalPrice} onChange={e => setSessionForm(p => ({ ...p, totalPrice: e.target.value }))} placeholder="0" dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>المدفوع</Label>
                <Input type="number" value={sessionForm.paidAmount} onChange={e => setSessionForm(p => ({ ...p, paidAmount: e.target.value }))} placeholder="0" dir="ltr" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>ملاحظات</Label>
              <Textarea value={sessionForm.notes} onChange={e => setSessionForm(p => ({ ...p, notes: e.target.value }))} placeholder="ملاحظات" rows={2} />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAddSessionOpen(false)}>إلغاء</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleCreateSession}>حجز</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── EDIT SESSION DIALOG ──────────────────────────── */}
      <Dialog open={editSessionOpen} onOpenChange={setEditSessionOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-emerald-600" />
              تعديل الجلسة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>الخدمة</Label>
              <Select value={sessionForm.serviceId} onValueChange={v => setSessionForm(p => ({ ...p, serviceId: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {clinic.services.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} - {formatCurrency(s.price)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>التاريخ</Label>
                <Input type="date" value={sessionForm.sessionDate} onChange={e => setSessionForm(p => ({ ...p, sessionDate: e.target.value }))} dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>الحالة</Label>
                <Select value={sessionForm.status} onValueChange={v => setSessionForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">مجدولة</SelectItem>
                    <SelectItem value="completed">مكتملة</SelectItem>
                    <SelectItem value="cancelled">ملغية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>السعر</Label>
                <Input type="number" value={sessionForm.totalPrice} onChange={e => setSessionForm(p => ({ ...p, totalPrice: e.target.value }))} dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>المدفوع</Label>
                <Input type="number" value={sessionForm.paidAmount} onChange={e => setSessionForm(p => ({ ...p, paidAmount: e.target.value }))} dir="ltr" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>ملاحظات</Label>
              <Textarea value={sessionForm.notes} onChange={e => setSessionForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditSessionOpen(false)}>إلغاء</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleEditSession}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── ADD NOTE DIALOG ──────────────────────────────── */}
      <Dialog open={addNoteOpen} onOpenChange={setAddNoteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة ملاحظة</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>القسم</Label>
              <Select value={noteForm.section} onValueChange={v => setNoteForm(p => ({ ...p, section: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">عام</SelectItem>
                  <SelectItem value="clinical">طبي</SelectItem>
                  <SelectItem value="financial">مالي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>الملاحظة *</Label>
              <Textarea value={noteForm.content} onChange={e => setNoteForm(p => ({ ...p, content: e.target.value }))} placeholder="اكتب ملاحظتك..." rows={3} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="important"
                checked={noteForm.isImportant}
                onCheckedChange={v => setNoteForm(p => ({ ...p, isImportant: !!v }))}
              />
              <Label htmlFor="important" className="flex items-center gap-1.5 cursor-pointer">
                <Star className="w-4 h-4 text-amber-500" />
                ملاحظة مهمة
              </Label>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAddNoteOpen(false)}>إلغاء</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleCreateNote}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── ADD ALERT DIALOG ─────────────────────────────── */}
      <Dialog open={addAlertOpen} onOpenChange={setAddAlertOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة تنبيه</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {!selectedPatientId && (
              <div className="space-y-1.5">
                <Label>المريض</Label>
                <PatientSearchSelect
                  patients={clinic.patients}
                  value={alertForm.patientId}
                  onChange={v => setAlertForm(p => ({ ...p, patientId: v }))}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>العنوان *</Label>
              <Input value={alertForm.title} onChange={e => setAlertForm(p => ({ ...p, title: e.target.value }))} placeholder="عنوان التنبيه" />
            </div>
            <div className="space-y-1.5">
              <Label>الرسالة</Label>
              <Textarea value={alertForm.message} onChange={e => setAlertForm(p => ({ ...p, message: e.target.value }))} placeholder="تفاصيل التنبيه" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>التاريخ</Label>
                <Input type="date" value={alertForm.alertDate} onChange={e => setAlertForm(p => ({ ...p, alertDate: e.target.value }))} dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>النوع</Label>
                <Select value={alertForm.alertType} onValueChange={v => setAlertForm(p => ({ ...p, alertType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reminder">تذكير</SelectItem>
                    <SelectItem value="followup">متابعة</SelectItem>
                    <SelectItem value="payment">دفعة</SelectItem>
                    <SelectItem value="appointment">موعد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAddAlertOpen(false)}>إلغاء</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleCreateAlert}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── ADD SERVICE DIALOG ───────────────────────────── */}
      <Dialog open={addServiceOpen} onOpenChange={setAddServiceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة خدمة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>اسم الخدمة *</Label>
              <Input value={serviceForm.name} onChange={e => setServiceForm(p => ({ ...p, name: e.target.value }))} placeholder="مثال: جلسة ليزر" />
            </div>
            <div className="space-y-1.5">
              <Label>الوصف</Label>
              <Textarea value={serviceForm.description} onChange={e => setServiceForm(p => ({ ...p, description: e.target.value }))} placeholder="وصف الخدمة" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>السعر (جنيه)</Label>
                <Input type="number" value={serviceForm.price} onChange={e => setServiceForm(p => ({ ...p, price: e.target.value }))} placeholder="0" dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>المدة (دقيقة)</Label>
                <Input type="number" value={serviceForm.duration} onChange={e => setServiceForm(p => ({ ...p, duration: e.target.value }))} placeholder="30" dir="ltr" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAddServiceOpen(false)}>إلغاء</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleCreateService}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── EDIT SERVICE DIALOG ──────────────────────────── */}
      <Dialog open={editServiceOpen} onOpenChange={setEditServiceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل الخدمة</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>اسم الخدمة *</Label>
              <Input value={serviceForm.name} onChange={e => setServiceForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>الوصف</Label>
              <Textarea value={serviceForm.description} onChange={e => setServiceForm(p => ({ ...p, description: e.target.value }))} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>السعر (جنيه)</Label>
                <Input type="number" value={serviceForm.price} onChange={e => setServiceForm(p => ({ ...p, price: e.target.value }))} dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>المدة (دقيقة)</Label>
                <Input type="number" value={serviceForm.duration} onChange={e => setServiceForm(p => ({ ...p, duration: e.target.value }))} dir="ltr" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditServiceOpen(false)}>إلغاء</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleEditService}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── DELETE CONFIRM ───────────────────────────────── */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── REPORTS PASSWORD DIALOG ──────────────── */}
      <Dialog open={reportsPasswordOpen} onOpenChange={setReportsPasswordOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              كلمة سر التقارير
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>أدخل كلمة السر</Label>
              <Input
                type="password"
                value={reportsPassword}
                onChange={e => setReportsPassword(e.target.value)}
                placeholder="••••"
                onKeyDown={e => e.key === 'Enter' && handleReportsPasswordSubmit()}
                className="h-12 text-center text-lg tracking-widest"
                autoFocus
                dir="ltr"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setReportsPasswordOpen(false); setReportsPassword('') }}>إلغاء</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleReportsPasswordSubmit} disabled={!reportsPassword}>
                <Lock className="w-4 h-4 ml-1" />
                دخول
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PATIENT SEARCH SELECT COMPONENT
// ═══════════════════════════════════════════════════════════════
function PatientSearchSelect({ patients, value, onChange }: { patients: any[]; value: string; onChange: (v: string) => void }) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = patients.filter(p =>
    p.name.includes(search) || p.phone?.includes(search) || p.fileNumber?.includes(search)
  ).slice(0, 20)

  const selectedPatient = patients.find(p => p.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between font-normal">
          {selectedPatient ? (
            <span>{selectedPatient.name} {selectedPatient.phone && `- ${selectedPatient.phone}`}</span>
          ) : (
            <span className="text-muted-foreground">ابحث عن مريض...</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="بحث بالاسم أو الهاتف أو رقم الملف..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-9"
          />
        </div>
        <ScrollArea className="max-h-60">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">لا توجد نتائج</p>
          ) : (
            filtered.map(p => (
              <button
                key={p.id}
                className="w-full px-3 py-2 text-sm hover:bg-emerald-50 text-right flex items-center gap-2"
                onClick={() => { onChange(p.id); setOpen(false); setSearch('') }}
              >
                <UserIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.phone || p.fileNumber || ''}</p>
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD TAB
// ═══════════════════════════════════════════════════════════════
function DashboardTab({ clinic, onGoToPatients, onGoToVisits, onGoToSessions, onAddPatient, onAddVisit, onAddSession, onAlertClick, onRefresh }: any) {
  const d = clinic.dashboard

  if (clinic.dashboardLoading && !d) {
    return <DashboardSkeleton />
  }

  const weeklyTrend = d?.weeklyTrend || []
  const maxRevenue = Math.max(...weeklyTrend.map((w: any) => w.revenue), 1)

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="إجمالي المرضى"
          value={d?.patients?.total || 0}
          color="bg-blue-50 text-blue-600"
          onClick={onGoToPatients}
        />
        <StatCard
          icon={<Stethoscope className="w-5 h-5" />}
          label="زيارات اليوم"
          value={d?.visits?.today || 0}
          color="bg-orange-50 text-orange-600"
          onClick={onGoToVisits}
        />
        <StatCard
          icon={<CalendarDays className="w-5 h-5" />}
          label="جلسات اليوم"
          value={d?.sessions?.today || 0}
          color="bg-purple-50 text-purple-600"
          onClick={onGoToSessions}
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="إيرادات اليوم"
          value={formatCurrency(d?.revenue?.today)}
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300" onClick={onAddPatient}>
          <Plus className="w-5 h-5 text-emerald-600" />
          <span className="text-xs font-medium text-emerald-700">إضافة مريض</span>
        </Button>
        <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 border-blue-200 hover:bg-blue-50 hover:border-blue-300" onClick={onAddVisit}>
          <Stethoscope className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">تسجيل زيارة</span>
        </Button>
        <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 border-purple-200 hover:bg-purple-50 hover:border-purple-300" onClick={onAddSession}>
          <CalendarDays className="w-5 h-5 text-purple-600" />
          <span className="text-xs font-medium text-purple-700">جلسة جديدة</span>
        </Button>
      </div>

      {/* Weekly Trend */}
      {weeklyTrend.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                الاتجاه الأسبوعي
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40">
              {weeklyTrend.map((day: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative" style={{ height: '120px' }}>
                    <div
                      className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t-md transition-all duration-500 min-h-[4px]"
                      style={{ height: `${Math.max((day.revenue / maxRevenue) * 100, 3)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{day.dayName}</span>
                  <span className="text-[10px] font-medium">{day.visits + day.sessions}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity & Alerts */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              آخر النشاطات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {d?.recentActivity?.visits?.map((v: any, i: number) => (
                <div key={`v-${i}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{v.patient?.name}</p>
                    <p className="text-xs text-muted-foreground">زيارة - {formatDateTime(v.visitDate)}</p>
                  </div>
                  <Badge variant="secondary" className={v.visitType === 'new' ? 'bg-blue-100 text-blue-700' : v.visitType === 'session' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}>
                    {v.visitType === 'new' ? 'كشف جديد' : v.visitType === 'session' ? 'جلسة' : 'إعادة'}
                  </Badge>
                </div>
              ))}
              {d?.recentActivity?.sessions?.map((s: any, i: number) => (
                <div key={`s-${i}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.patient?.name}</p>
                    <p className="text-xs text-muted-foreground">{s.service?.name} - {formatDateTime(s.sessionDate)}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))}
              {(!d?.recentActivity?.visits?.length && !d?.recentActivity?.sessions?.length) && (
                <p className="text-sm text-muted-foreground text-center py-4">لا توجد نشاطات حديثة</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Unread Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                التنبيهات
              </CardTitle>
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                {d?.alerts?.unread || 0} غير مقروء
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {d?.alerts?.recent?.map((a: any, i: number) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-2 rounded-lg bg-amber-50/50 hover:bg-amber-50 cursor-pointer"
                  onClick={() => onAlertClick(a.id)}
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Bell className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{a.patient?.name} • {formatDate(a.alertDate)}</p>
                  </div>
                </div>
              ))}
              {(!d?.alerts?.recent?.length) && (
                <p className="text-sm text-muted-foreground text-center py-4">لا توجد تنبيهات</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-emerald-600">{d?.sessions?.pending || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">جلسات معلقة</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-blue-600">{d?.patients?.active || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">مرضى نشطون</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-orange-600">{d?.patients?.todayNew || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">مرضى جدد اليوم</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════
function StatCard({ icon, label, value, color, onClick }: { icon: React.ReactNode; label: string; value: string | number; color: string; onClick?: () => void }) {
  return (
    <Card className={`${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            {icon}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════
// STATUS BADGE
// ═══════════════════════════════════════════════════════════════
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    revisit: 'bg-orange-100 text-orange-700',
    session: 'bg-purple-100 text-purple-700',
    scheduled: 'bg-purple-100 text-purple-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
    active: 'bg-emerald-100 text-emerald-700',
    inactive: 'bg-gray-100 text-gray-700',
  }
  const labels: Record<string, string> = {
    new: 'كشف جديد',
    revisit: 'إعادة',
    session: 'جلسة',
    scheduled: 'مجدولة',
    completed: 'مكتملة',
    cancelled: 'ملغية',
    active: 'نشط',
    inactive: 'غير نشط',
  }
  return (
    <Badge variant="secondary" className={config[status] || 'bg-gray-100 text-gray-700'}>
      {labels[status] || status}
    </Badge>
  )
}

// ═══════════════════════════════════════════════════════════════
// PATIENTS TAB
// ═══════════════════════════════════════════════════════════════
function PatientsTab({ patients, loading, search, onSearch, onPatientClick, onAdd, onRefresh }: any) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pr-10"
            placeholder="بحث بالاسم أو الهاتف أو رقم الملف..."
            value={search}
            onChange={e => onSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4" />
        </Button>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={onAdd}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Patient List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <EmptyState
          icon={<Users className="w-12 h-12" />}
          title="لا يوجد مرضى"
          description={search ? 'لم يتم العثور على نتائج' : 'ابدأ بإضافة مريض جديد'}
          action={search ? undefined : onAdd}
          actionLabel="إضافة مريض"
        />
      ) : (
        <div className="space-y-2 max-h-[calc(100vh-260px)] overflow-y-auto">
          {patients.map((p: any) => (
            <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onPatientClick(p.id)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    {p.gender === 'أنثى' ? (
                      <Baby className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium truncate">{p.name}</p>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {p.age && <span>{p.age} سنة</span>}
                      {p.gender && <span>{p.gender}</span>}
                      {p.phone && (
                        <span className="flex items-center gap-0.5">
                          <Phone className="w-3 h-3" />
                          {p.phone}
                        </span>
                      )}
                    </div>
                    {p.diagnosis && (
                      <p className="text-xs text-emerald-600 mt-1 truncate">{p.diagnosis}</p>
                    )}
                  </div>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PATIENT DETAIL TAB
// ═══════════════════════════════════════════════════════════════
function PatientDetailTab({
  patient, loading, activeSubTab, onSubTabChange,
  visits, sessions, notes, alerts,
  totalVisitFees, totalVisitPaid, totalSessionPrice, totalSessionPaid,
  onEditPatient, onAddVisit, onAddSession, onAddNote, onAddAlert,
  onEditVisit, onEditSession, onDelete, onMarkAlertRead, services,
}: any) {
  if (loading) {
    return <div className="space-y-3"><Skeleton className="h-40 rounded-xl" /><Skeleton className="h-60 rounded-xl" /></div>
  }

  return (
    <div className="space-y-4">
      {/* Patient Info Card */}
      <Card className="bg-gradient-to-l from-emerald-50 to-white border-emerald-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                {patient.gender === 'أنثى' ? (
                  <Baby className="w-7 h-7 text-emerald-600" />
                ) : (
                  <UserIcon className="w-7 h-7 text-emerald-600" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold">{patient.name}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  {patient.age && <span>{patient.age} سنة</span>}
                  {patient.gender && <span>•</span>}
                  {patient.gender && <span>{patient.gender}</span>}
                  {patient.phone && <span>• {patient.phone}</span>}
                </div>
                {patient.fileNumber && (
                  <Badge variant="outline" className="mt-1 text-xs">{patient.fileNumber}</Badge>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onEditPatient}>
              <Edit3 className="w-4 h-4 ml-1" />
              تعديل
            </Button>
          </div>

          {patient.diagnosis && (
            <div className="mt-3 p-2 bg-white rounded-lg">
              <p className="text-xs text-muted-foreground">التشخيص</p>
              <p className="text-sm font-medium">{patient.diagnosis}</p>
            </div>
          )}

          {/* Payment Summary */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="p-2 bg-white rounded-lg text-center">
              <p className="text-xs text-muted-foreground">إجمالي المستحق</p>
              <p className="text-sm font-bold text-red-600">{formatCurrency(totalVisitFees + totalSessionPrice)}</p>
            </div>
            <div className="p-2 bg-white rounded-lg text-center">
              <p className="text-xs text-muted-foreground">إجمالي المدفوع</p>
              <p className="text-sm font-bold text-emerald-600">{formatCurrency(totalVisitPaid + totalSessionPaid)}</p>
            </div>
          </div>
          {(totalVisitFees + totalSessionPrice - totalVisitPaid - totalSessionPaid) > 0 && (
            <div className="mt-2 p-2 bg-red-50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">المتبقي</p>
              <p className="text-sm font-bold text-red-600">{formatCurrency(totalVisitFees + totalSessionPrice - totalVisitPaid - totalSessionPaid)}</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50" onClick={onAddVisit}>
              <Stethoscope className="w-4 h-4 ml-1" />
              زيارة
            </Button>
            <Button size="sm" variant="outline" className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50" onClick={onAddSession}>
              <CalendarDays className="w-4 h-4 ml-1" />
              جلسة
            </Button>
            <Button size="sm" variant="outline" className="flex-1 border-amber-200 text-amber-600 hover:bg-amber-50" onClick={onAddAlert}>
              <Bell className="w-4 h-4 ml-1" />
              تنبيه
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sub Tabs */}
      <Tabs value={activeSubTab} onValueChange={v => onSubTabChange(v as any)}>
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="visits" className="text-xs">الزيارات ({visits.length})</TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs">الجلسات ({sessions.length})</TabsTrigger>
          <TabsTrigger value="notes" className="text-xs">الملاحظات ({notes.length})</TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs">التنبيهات ({alerts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="visits" className="mt-3">
          <div className="flex justify-end mb-2">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={onAddVisit}>
              <Plus className="w-4 h-4 ml-1" />
              إضافة زيارة
            </Button>
          </div>
          {visits.length === 0 ? (
            <EmptyState icon={<Stethoscope className="w-10 h-10" />} title="لا توجد زيارات" description="لم يتم تسجيل أي زيارة بعد" />
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {visits.map((v: any) => (
                <Card key={v.id} className="hover:shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <StatusBadge status={v.visitType} />
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditVisit(v)}>
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDelete('visit', v.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm font-medium">{formatDate(v.visitDate)}</p>
                    {v.diagnosis && <p className="text-xs text-muted-foreground mt-1">{v.diagnosis}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-emerald-600 font-medium">الرسوم: {formatCurrency(v.fees)}</span>
                      <span className="text-blue-600 font-medium">المدفوع: {formatCurrency(v.paidAmount)}</span>
                    </div>
                    {v.prescription && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                        <p className="font-medium text-blue-700 mb-0.5">الوصفة:</p>
                        <p className="text-blue-600 whitespace-pre-wrap">{v.prescription}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="mt-3">
          <div className="flex justify-end mb-2">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={onAddSession}>
              <Plus className="w-4 h-4 ml-1" />
              إضافة جلسة
            </Button>
          </div>
          {sessions.length === 0 ? (
            <EmptyState icon={<CalendarDays className="w-10 h-10" />} title="لا توجد جلسات" description="لم يتم حجز أي جلسة بعد" />
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sessions.map((s: any) => (
                <Card key={s.id} className="hover:shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <StatusBadge status={s.status} />
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditSession(s)}>
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDelete('session', s.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm font-medium">{s.service?.name || 'خدمة'}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(s.sessionDate)}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-emerald-600 font-medium">السعر: {formatCurrency(s.totalPrice)}</span>
                      <span className="text-blue-600 font-medium">المدفوع: {formatCurrency(s.paidAmount)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notes" className="mt-3">
          <div className="flex justify-end mb-2">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={onAddNote}>
              <Plus className="w-4 h-4 ml-1" />
              ملاحظة
            </Button>
          </div>
          {notes.length === 0 ? (
            <EmptyState icon={<FileText className="w-10 h-10" />} title="لا توجد ملاحظات" description="أضف ملاحظة لهذا المريض" />
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notes.map((n: any) => (
                <Card key={n.id} className={n.isImportant ? 'border-amber-200 bg-amber-50/30' : ''}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {n.isImportant && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                        <Badge variant="outline" className="text-[10px]">
                          {n.section === 'clinical' ? 'طبي' : n.section === 'financial' ? 'مالي' : 'عام'}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{formatDateTime(n.createdAt)}</span>
                    </div>
                    <p className="text-sm">{n.content}</p>
                    {n.user && (
                      <p className="text-[10px] text-muted-foreground mt-1">بواسطة: {n.user.name}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="mt-3">
          <div className="flex justify-end mb-2">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={onAddAlert}>
              <Plus className="w-4 h-4 ml-1" />
              تنبيه
            </Button>
          </div>
          {alerts.length === 0 ? (
            <EmptyState icon={<Bell className="w-10 h-10" />} title="لا توجد تنبيهات" description="أضف تنبيه لهذا المريض" />
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {alerts.map((a: any) => (
                <Card key={a.id} className={!a.isRead ? 'border-amber-200 bg-amber-50/30' : ''}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {a.alertType === 'followup' ? 'متابعة' : a.alertType === 'payment' ? 'دفعة' : a.alertType === 'appointment' ? 'موعد' : 'تذكير'}
                        </Badge>
                        {!a.isRead && <span className="w-2 h-2 bg-amber-500 rounded-full" />}
                      </div>
                      <div className="flex items-center gap-1">
                        {!a.isRead && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMarkAlertRead(a.id)}>
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onDelete('alert', a.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm font-medium">{a.title}</p>
                    {a.message && <p className="text-xs text-muted-foreground mt-1">{a.message}</p>}
                    <p className="text-[10px] text-muted-foreground mt-1">{formatDate(a.alertDate)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// VISITS TAB
// ═══════════════════════════════════════════════════════════════
function VisitsTab({ visits, loading, dateFilter, onDateFilter, typeFilter, onTypeFilter, onAdd, onEdit, onDelete, onRefresh }: any) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[140px]">
              <Label className="text-xs mb-1 block">التاريخ</Label>
              <Input type="date" value={dateFilter} onChange={e => onDateFilter(e.target.value)} dir="ltr" className="h-9 text-sm" />
            </div>
            <div className="min-w-[130px]">
              <Label className="text-xs mb-1 block">نوع الزيارة</Label>
              <Select value={typeFilter} onValueChange={v => onTypeFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="new">كشف جديد</SelectItem>
                  <SelectItem value="revisit">إعادة</SelectItem>
                  <SelectItem value="session">جلسة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-1">
              <Button variant="outline" size="icon" className="h-9" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 h-9" onClick={onAdd}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visit List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : visits.length === 0 ? (
        <EmptyState
          icon={<Stethoscope className="w-12 h-12" />}
          title="لا توجد زيارات"
          description="لم يتم تسجيل أي زيارة في هذا التاريخ"
          action={onAdd}
          actionLabel="تسجيل زيارة"
        />
      ) : (
        <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto">
          {visits.map((v: any) => (
            <Card key={v.id} className="hover:shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{v.patient?.name || '—'}</p>
                      <StatusBadge status={v.visitType} />
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDateTime(v.visitDate)}</p>
                    {v.diagnosis && <p className="text-sm text-muted-foreground mt-1 truncate">{v.diagnosis}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-emerald-600">الرسوم: {formatCurrency(v.fees)}</span>
                      <span className="text-blue-600">المدفوع: {formatCurrency(v.paidAmount)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(v)}>
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDelete(v.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SESSIONS TAB
// ═══════════════════════════════════════════════════════════════
function SessionsTab({ sessions, loading, dateFilter, onDateFilter, statusFilter, onStatusFilter, onAdd, onEdit, onDelete, onRefresh }: any) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[140px]">
              <Label className="text-xs mb-1 block">التاريخ</Label>
              <Input type="date" value={dateFilter} onChange={e => onDateFilter(e.target.value)} dir="ltr" className="h-9 text-sm" />
            </div>
            <div className="min-w-[130px]">
              <Label className="text-xs mb-1 block">الحالة</Label>
              <Select value={statusFilter} onValueChange={v => onStatusFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="scheduled">مجدولة</SelectItem>
                  <SelectItem value="completed">مكتملة</SelectItem>
                  <SelectItem value="cancelled">ملغية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-1">
              <Button variant="outline" size="icon" className="h-9" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 h-9" onClick={onAdd}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="w-12 h-12" />}
          title="لا توجد جلسات"
          description="لم يتم حجز أي جلسة في هذا التاريخ"
          action={onAdd}
          actionLabel="حجز جلسة"
        />
      ) : (
        <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto">
          {sessions.map((s: any) => (
            <Card key={s.id} className="hover:shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{s.patient?.name || '—'}</p>
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {s.service?.name || 'خدمة'} • {formatDateTime(s.sessionDate)}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-emerald-600">السعر: {formatCurrency(s.totalPrice)}</span>
                      <span className="text-blue-600">المدفوع: {formatCurrency(s.paidAmount)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(s)}>
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDelete(s.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// REPORTS TAB
// ═══════════════════════════════════════════════════════════════
function ReportsTab({ reportSubTab, onSubTabChange, dailyReport, weeklyReport, monthlyReport, loading, services, onRefresh }: any) {
  return (
    <div className="space-y-4">
      {/* Sub Tabs */}
      <Tabs value={reportSubTab} onValueChange={v => onSubTabChange(v as any)}>
        <div className="flex justify-end mb-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 ml-1" />
            تحديث
          </Button>
        </div>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="daily">يومي</TabsTrigger>
          <TabsTrigger value="weekly">أسبوعي</TabsTrigger>
          <TabsTrigger value="monthly">شهري</TabsTrigger>
        </TabsList>

        {/* Daily Report */}
        <TabsContent value="daily" className="mt-4 space-y-4">
          {loading && !dailyReport ? <ReportSkeleton /> : dailyReport ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <MiniStatCard label="الزيارات" value={dailyReport.visits?.count || 0} icon={<Stethoscope className="w-4 h-4" />} />
                <MiniStatCard label="الجلسات" value={dailyReport.sessions?.count || 0} icon={<CalendarDays className="w-4 h-4" />} />
                <MiniStatCard label="مرضى جدد" value={dailyReport.newPatients || 0} icon={<Baby className="w-4 h-4" />} />
                <MiniStatCard label="جلسات معلقة" value={dailyReport.pendingSessions || 0} icon={<Clock className="w-4 h-4" />} />
              </div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">ملخص الإيرادات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-muted rounded-lg">
                      <span className="text-sm">إجمالي الرسوم</span>
                      <span className="font-bold">{formatCurrency(dailyReport.totalFees)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
                      <span className="text-sm text-emerald-700">إجمالي المحصل</span>
                      <span className="font-bold text-emerald-700">{formatCurrency(dailyReport.totalRevenue)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-red-600">المتبقي</span>
                      <span className="font-bold text-red-600">{formatCurrency((dailyReport.totalFees || 0) - (dailyReport.totalRevenue || 0))}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">تفصيل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>إيراد الزيارات</span>
                    <span>{formatCurrency(dailyReport.visits?.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>محصّل الزيارات</span>
                    <span className="text-emerald-600">{formatCurrency(dailyReport.visits?.collected)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span>إيراد الجلسات</span>
                    <span>{formatCurrency(dailyReport.sessions?.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>محصّل الجلسات</span>
                    <span className="text-emerald-600">{formatCurrency(dailyReport.sessions?.collected)}</span>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <EmptyState icon={<BarChart3 className="w-12 h-12" />} title="لا توجد بيانات" description="لا تتوفر بيانات للتقرير اليومي" />
          )}
        </TabsContent>

        {/* Weekly Report */}
        <TabsContent value="weekly" className="mt-4 space-y-4">
          {loading && !weeklyReport ? <ReportSkeleton /> : weeklyReport ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <MiniStatCard label="الزيارات" value={weeklyReport.visits?.count || 0} icon={<Stethoscope className="w-4 h-4" />} />
                <MiniStatCard label="الجلسات" value={weeklyReport.sessions?.count || 0} icon={<CalendarDays className="w-4 h-4" />} />
                <MiniStatCard label="مرضى جدد" value={weeklyReport.newPatients || 0} icon={<Baby className="w-4 h-4" />} />
              </div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">إيرادات الأسبوع</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm p-2 bg-muted rounded-lg">
                    <span>إجمالي الرسوم</span>
                    <span className="font-bold">{formatCurrency((weeklyReport.visits?.revenue || 0) + (weeklyReport.sessions?.revenue || 0))}</span>
                  </div>
                  <div className="flex justify-between text-sm p-2 bg-emerald-50 rounded-lg">
                    <span className="text-emerald-700">إجمالي المحصل</span>
                    <span className="font-bold text-emerald-700">{formatCurrency((weeklyReport.visits?.collected || 0) + (weeklyReport.sessions?.collected || 0))}</span>
                  </div>
                </CardContent>
              </Card>
              {/* Daily Breakdown */}
              {weeklyReport.dailyData && weeklyReport.dailyData.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">التوزيع اليومي</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {weeklyReport.dailyData.map((d: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium w-10">{d.dayName}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1"><Stethoscope className="w-3 h-3 text-blue-500" />{d.visits}</span>
                            <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3 text-purple-500" />{d.sessions}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* Visit Types */}
              {weeklyReport.visitTypeStats && weeklyReport.visitTypeStats.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">أنواع الزيارات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      {weeklyReport.visitTypeStats.map((vt: any, i: number) => (
                        <div key={i} className="flex-1 text-center p-2 bg-muted rounded-lg">
                          <p className="text-lg font-bold">{vt._count?.id || 0}</p>
                          <p className="text-xs text-muted-foreground">{vt.visitType === 'new' ? 'كشف جديد' : vt.visitType === 'session' ? 'جلسة' : 'إعادة'}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* Top Services */}
              {weeklyReport.topServices && weeklyReport.topServices.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">أكثر الخدمات طلباً</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {weeklyReport.topServices.map((s: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                          <span className="text-sm">{s.serviceName}</span>
                          <div className="flex items-center gap-3 text-xs">
                            <span>{s.count} جلسة</span>
                            <span className="text-emerald-600 font-medium">{formatCurrency(s.revenue)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <EmptyState icon={<BarChart3 className="w-12 h-12" />} title="لا توجد بيانات" description="لا تتوفر بيانات للتقرير الأسبوعي" />
          )}
        </TabsContent>

        {/* Monthly Report */}
        <TabsContent value="monthly" className="mt-4 space-y-4">
          {loading && !monthlyReport ? <ReportSkeleton /> : monthlyReport ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <MiniStatCard label="الزيارات" value={monthlyReport.visits?.count || 0} icon={<Stethoscope className="w-4 h-4" />} />
                <MiniStatCard label="الجلسات" value={monthlyReport.sessions?.count || 0} icon={<CalendarDays className="w-4 h-4" />} />
                <MiniStatCard label="مرضى جدد" value={monthlyReport.newPatients || 0} icon={<Baby className="w-4 h-4" />} />
              </div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">ملخص الشهر</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm p-2 bg-muted rounded-lg">
                    <span>إجمالي الإيرادات</span>
                    <span className="font-bold">{formatCurrency(monthlyReport.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm p-2 bg-emerald-50 rounded-lg">
                    <span className="text-emerald-700">المرضى النشطون</span>
                    <span className="font-bold text-emerald-700">{monthlyReport.activePatients || 0}</span>
                  </div>
                </CardContent>
              </Card>
              {/* Weekly Breakdown */}
              {monthlyReport.weeklyData && monthlyReport.weeklyData.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">التوزيع الأسبوعي</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {monthlyReport.weeklyData.map((w: any, i: number) => (
                        <div key={i} className="p-2 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">الأسبوع {w.week}</span>
                            <span className="text-xs text-muted-foreground">{formatDate(w.date)}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span>{w.visits} زيارات</span>
                            <span className="text-emerald-600">{formatCurrency(w.revenue)} رسوم</span>
                            <span className="text-blue-600">{formatCurrency(w.collected)} محصل</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* Top Diagnoses */}
              {monthlyReport.topDiagnoses && monthlyReport.topDiagnoses.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">أكثر التشخيصات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {monthlyReport.topDiagnoses.map((d: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                          <span className="text-sm truncate">{d.diagnosis}</span>
                          <Badge variant="secondary">{d.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* Top Services */}
              {monthlyReport.topServices && monthlyReport.topServices.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">أكثر الخدمات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {monthlyReport.topServices.map((s: any, i: number) => {
                        const svc = services.find((sv: any) => sv.id === s.serviceId)
                        return (
                          <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                            <span className="text-sm">{svc?.name || 'خدمة'}</span>
                            <div className="flex items-center gap-3 text-xs">
                              <span>{s._count?.id} جلسة</span>
                              <span className="text-emerald-600 font-medium">{formatCurrency(s._sum?.totalPrice)}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <EmptyState icon={<BarChart3 className="w-12 h-12" />} title="لا توجد بيانات" description="لا تتوفر بيانات للتقرير الشهري" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MORE TAB
// ═══════════════════════════════════════════════════════════════
function MoreTab({ moreSubTab, onSubTabChange, services, servicesLoading, alerts, alertsLoading, onAddService, onEditService, onDeleteService, onAddAlert, onMarkAlertRead, onDeleteAlert, onRefreshServices, onRefreshAlerts, selectedTheme, onThemeChange, syncConnected, syncConnectionInfo, syncLastTime, backups, backupLoading, onCreateBackup, onImportBackup, onRestoreBackup, onDeleteBackup }: any) {
  return (
    <div className="space-y-4">
      <Tabs value={moreSubTab} onValueChange={v => onSubTabChange(v as any)}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="services">الخدمات</TabsTrigger>
          <TabsTrigger value="alerts">التنبيهات</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        {/* Services */}
        <TabsContent value="services" className="mt-4">
          <div className="flex justify-end mb-3">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onRefreshServices}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={onAddService}>
                <Plus className="w-4 h-4 ml-1" />
                إضافة خدمة
              </Button>
            </div>
          </div>

          {servicesLoading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
          ) : services.length === 0 ? (
            <EmptyState icon={<Syringe className="w-10 h-10" />} title="لا توجد خدمات" description="أضف خدمات العيادة" action={onAddService} actionLabel="إضافة خدمة" />
          ) : (
            <div className="space-y-2">
              {services.map((s: any) => (
                <Card key={s.id} className="hover:shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="text-emerald-600 font-medium">{formatCurrency(s.price)}</span>
                          {s.duration && <span>{s.duration} دقيقة</span>}
                          {s.description && <span className="truncate max-w-[200px]">{s.description}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditService(s)}>
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDeleteService(s.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts" className="mt-4">
          <div className="flex justify-end mb-3">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onRefreshAlerts}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={onAddAlert}>
                <Plus className="w-4 h-4 ml-1" />
                إضافة تنبيه
              </Button>
            </div>
          </div>

          {alertsLoading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
          ) : alerts.length === 0 ? (
            <EmptyState icon={<Bell className="w-10 h-10" />} title="لا توجد تنبيهات" description="أضف تنبيه جديد" action={onAddAlert} actionLabel="إضافة تنبيه" />
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {alerts.map((a: any) => (
                <Card key={a.id} className={!a.isRead ? 'border-amber-200 bg-amber-50/30' : 'hover:shadow-sm'}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {!a.isRead && <span className="w-2 h-2 bg-amber-500 rounded-full shrink-0" />}
                          <p className="font-medium truncate">{a.title}</p>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {a.alertType === 'followup' ? 'متابعة' : a.alertType === 'payment' ? 'دفعة' : a.alertType === 'appointment' ? 'موعد' : 'تذكير'}
                          </Badge>
                        </div>
                        {a.message && <p className="text-sm text-muted-foreground truncate">{a.message}</p>}
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {a.patient?.name && <span>{a.patient.name} • </span>}
                          {formatDate(a.alertDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 mr-2">
                        {!a.isRead && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMarkAlertRead(a.id)} title="تحديد كمقروء">
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onDeleteAlert(a.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-4 h-4" />
                الإعدادات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sync Status */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {syncConnected ? <Wifi className="w-5 h-5 text-emerald-600" /> : <WifiOff className="w-5 h-5 text-red-500" />}
                  <p className="text-sm font-medium">حالة المزامنة</p>
                </div>
                <Card className={`border ${syncConnected ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${syncConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
                        <span className={`text-sm font-medium ${syncConnected ? 'text-emerald-700' : 'text-red-700'}`}>
                          {syncConnected ? 'متصل - المزامنة نشطة' : 'غير متصل'}
                        </span>
                      </div>
                      <Badge variant="secondary" className={syncConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                        {syncConnected ? 'WebSocket' : 'Polling'}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>حالة الاتصال</span>
                        <span className={syncConnected ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                          {syncConnectionInfo || 'جاري الاتصال...'}
                        </span>
                      </div>
                      {syncLastTime && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>آخر مزامنة</span>
                          <span>{formatDateTime(syncLastTime)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-muted-foreground">
                        <span>آلية المزامنة</span>
                        <span>{syncConnected ? 'Real-time (WebSocket)' : 'تلقائي كل 5 ثوان'}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-3 bg-white/60 rounded-lg p-2">
                      💡 المزامنة تعمل تلقائياً. أي تعديل من أي جهاز سيظهر على جميع الأجهزة المتصلة بنفس الشبكة فوراً.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Theme Picker */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-muted-foreground" />
                  <p className="text-sm font-medium">لون التطبيق</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {COLOR_THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => onThemeChange(theme.id)}
                      className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        selectedTheme === theme.id
                          ? 'border-primary shadow-md scale-105'
                          : 'border-transparent hover:border-border'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${theme.primary} shadow-sm`} />
                      <span className="text-xs font-medium">{theme.name}</span>
                      {selectedTheme === theme.id && (
                        <div className="absolute -top-1 -left-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Backup & Restore */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-muted-foreground" />
                  <p className="text-sm font-medium">النسخ الاحتياطي</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-center gap-1"
                    onClick={onCreateBackup}
                    disabled={backupLoading}
                  >
                    <Download className="w-5 h-5 text-blue-600" />
                    <span className="text-xs">إنشاء نسخة</span>
                  </Button>
                  <label className="Button-variant-outline h-auto py-3 flex flex-col items-center gap-1 border rounded-md cursor-pointer hover:bg-muted transition-colors">
                    <Upload className="w-5 h-5 text-amber-600" />
                    <span className="text-xs">استيراد نسخة</span>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={onImportBackup}
                    />
                  </label>
                </div>

                {/* Auto backup status */}
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">نسخ تلقائي كل 24 ساعة</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">مفعّل</span>
                </div>

                {/* Saved backups list */}
                {backups.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground font-medium">النسخ المحفوظة ({backups.length})</p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {backups.map((b: any) => (
                        <div key={b.id} className="flex items-center justify-between p-2 bg-background border rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{b.name}</p>
                            <p className="text-[10px] text-muted-foreground">{b.sizeFormatted} · {new Date(b.createdAt).toLocaleDateString('ar-EG')}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              className="p-1.5 hover:bg-emerald-50 rounded-md transition-colors"
                              title="استعادة"
                              onClick={() => onRestoreBackup(b.id)}
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                            </button>
                            <button
                              className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
                              title="حذف"
                              onClick={() => onDeleteBackup(b.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">عيادة الجلدية</p>
                    <p className="text-xs text-muted-foreground">نظام إدارة العيادة v1.0</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="text-center py-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${COLOR_THEMES.find(t => t.id === selectedTheme)?.primary || 'from-emerald-500 to-teal-600'} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm text-muted-foreground">
                  نظام إدارة عيادة الأمراض الجلدية
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  إدارة المرضى والزيارات والجلسات والتقارير
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════
function MiniStatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-3 text-center">
        <div className="flex justify-center mb-1 text-emerald-600">{icon}</div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}

function EmptyState({ icon, title, description, action, actionLabel }: { icon: React.ReactNode; title: string; description: string; action?: () => void; actionLabel?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-muted-foreground/40 mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-muted-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
      {action && actionLabel && (
        <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={action}>
          <Plus className="w-4 h-4 ml-1" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <Skeleton className="h-10 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
      <div className="grid md:grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  )
}

function ReportSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
    </div>
  )
}

// ─── Re-export Popover for PatientSearchSelect ─────────────────
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
