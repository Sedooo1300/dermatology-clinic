const BASE = '/api';

async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'خطأ في الاتصال' }));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

function buildQuery(params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return '';
  const filtered = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (filtered.length === 0) return '';
  return '?' + filtered.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');
}

// ─── Auth ──────────────────────────────────────────────────────
export async function loginAPI(name: string, role: string, phone?: string) {
  return fetchAPI<{ user: { id: string; name: string; role: string; phone?: string | null } }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ name, role, phone }) }
  );
}

// ─── Patients ──────────────────────────────────────────────────
export interface PatientFilters {
  name?: string;
  phone?: string;
  fileNumber?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function getPatientsAPI(params?: PatientFilters) {
  return fetchAPI<{ patients: any[]; total: number; page: number; limit: number }>(
    `/patients${buildQuery(params as any)}`
  );
}

export function getPatientAPI(id: string) {
  return fetchAPI<{ patient: any }>(`/patients/${id}`);
}

export function createPatientAPI(data: any) {
  return fetchAPI<{ patient: any }>('/patients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updatePatientAPI(id: string, data: any) {
  return fetchAPI<{ patient: any }>(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deletePatientAPI(id: string, userId?: string) {
  return fetchAPI<{ success: boolean }>(`/patients/${id}${buildQuery({ userId })}`, {
    method: 'DELETE',
  });
}

// ─── Visits ────────────────────────────────────────────────────
export interface VisitFilters {
  patientId?: string;
  visitType?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export function getVisitsAPI(params?: VisitFilters) {
  return fetchAPI<{ visits: any[]; total: number; page: number; limit: number }>(
    `/visits${buildQuery(params as any)}`
  );
}

export function createVisitAPI(data: any) {
  return fetchAPI<{ visit: any }>('/visits', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateVisitAPI(id: string, data: any) {
  return fetchAPI<{ visit: any }>(`/visits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteVisitAPI(id: string) {
  return fetchAPI<{ success: boolean }>(`/visits/${id}`, { method: 'DELETE' });
}

// ─── Sessions ──────────────────────────────────────────────────
export interface SessionFilters {
  patientId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export function getSessionsAPI(params?: SessionFilters) {
  return fetchAPI<{ sessions: any[]; total: number; page: number; limit: number }>(
    `/sessions${buildQuery(params as any)}`
  );
}

export function createSessionAPI(data: any) {
  return fetchAPI<{ session: any }>('/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateSessionAPI(id: string, data: any) {
  return fetchAPI<{ session: any }>(`/sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteSessionAPI(id: string) {
  return fetchAPI<{ success: boolean }>(`/sessions/${id}`, { method: 'DELETE' });
}

// ─── Services ──────────────────────────────────────────────────
export function getServicesAPI() {
  return fetchAPI<{ services: any[] }>('/services');
}

export function createServiceAPI(data: any) {
  return fetchAPI<{ service: any }>('/services', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateServiceAPI(id: string, data: any) {
  return fetchAPI<{ service: any }>(`/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteServiceAPI(id: string) {
  return fetchAPI<{ success: boolean }>(`/services/${id}`, { method: 'DELETE' });
}

// ─── Notes ─────────────────────────────────────────────────────
export interface NoteFilters {
  patientId?: string;
  section?: string;
  relatedId?: string;
}

export function getNotesAPI(params?: NoteFilters) {
  return fetchAPI<{ notes: any[] }>(`/notes${buildQuery(params as any)}`);
}

export function createNoteAPI(data: any) {
  return fetchAPI<{ note: any }>('/notes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Alerts ────────────────────────────────────────────────────
export interface AlertFilters {
  patientId?: string;
  isRead?: boolean;
  alertType?: string;
}

export function getAlertsAPI(params?: AlertFilters) {
  const qp: Record<string, any> = {};
  if (params?.patientId) qp.patientId = params.patientId;
  if (params?.isRead !== undefined) qp.isRead = String(params.isRead);
  if (params?.alertType) qp.alertType = params.alertType;
  return fetchAPI<{ alerts: any[] }>(`/alerts${buildQuery(qp)}`);
}

export function createAlertAPI(data: any) {
  return fetchAPI<{ alert: any }>('/alerts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateAlertAPI(id: string, data: any) {
  return fetchAPI<{ alert: any }>(`/alerts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteAlertAPI(id: string) {
  return fetchAPI<{ success: boolean }>(`/alerts/${id}`, { method: 'DELETE' });
}

// ─── Reports ───────────────────────────────────────────────────
export function getDashboardAPI() {
  return fetchAPI<any>('/reports/dashboard');
}

export function getDailyReportAPI() {
  return fetchAPI<any>('/reports/daily');
}

export function getWeeklyReportAPI() {
  return fetchAPI<any>('/reports/weekly');
}

export function getMonthlyReportAPI() {
  return fetchAPI<any>('/reports/monthly');
}
