'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSync } from './useSync';
import {
  getPatientsAPI,
  getVisitsAPI,
  getSessionsAPI,
  getServicesAPI,
  getAlertsAPI,
  getNotesAPI,
  getDashboardAPI,
  getDailyReportAPI,
  getWeeklyReportAPI,
  getMonthlyReportAPI,
  type PatientFilters,
  type VisitFilters,
  type SessionFilters,
} from '@/lib/api';

interface ClinicDataState {
  // Dashboard
  dashboard: any | null;
  dashboardLoading: boolean;
  // Patients
  patients: any[];
  patientsTotal: number;
  patientsLoading: boolean;
  patientDetail: any | null;
  patientDetailLoading: boolean;
  // Visits
  visits: any[];
  visitsTotal: number;
  visitsLoading: boolean;
  // Sessions
  sessions: any[];
  sessionsTotal: number;
  sessionsLoading: boolean;
  // Services
  services: any[];
  servicesLoading: boolean;
  // Alerts
  alerts: any[];
  alertsLoading: boolean;
  // Notes
  notes: any[];
  notesLoading: boolean;
  // Reports
  dailyReport: any | null;
  weeklyReport: any | null;
  monthlyReport: any | null;
  reportsLoading: boolean;
}

export function useClinicData() {
  const { connected, connectionInfo, lastSyncTime, on } = useSync();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPollRef = useRef<number>(Date.now());

  const [state, setState] = useState<ClinicDataState>({
    dashboard: null,
    dashboardLoading: false,
    patients: [],
    patientsTotal: 0,
    patientsLoading: false,
    patientDetail: null,
    patientDetailLoading: false,
    visits: [],
    visitsTotal: 0,
    visitsLoading: false,
    sessions: [],
    sessionsTotal: 0,
    sessionsLoading: false,
    services: [],
    servicesLoading: false,
    alerts: [],
    alertsLoading: false,
    notes: [],
    notesLoading: false,
    dailyReport: null,
    weeklyReport: null,
    monthlyReport: null,
    reportsLoading: false,
  });

  const update = useCallback((partial: Partial<ClinicDataState>) => {
    setState(prev => ({ ...prev, ...partial }));
  }, []);

  // ─── Fetch functions ────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    update({ dashboardLoading: true });
    try {
      const data = await getDashboardAPI();
      update({ dashboard: data, dashboardLoading: false });
    } catch {
      update({ dashboardLoading: false });
    }
  }, [update]);

  const fetchPatients = useCallback(async (params?: PatientFilters) => {
    update({ patientsLoading: true });
    try {
      const data = await getPatientsAPI(params);
      update({ patients: data.patients, patientsTotal: data.total, patientsLoading: false });
    } catch {
      update({ patientsLoading: false });
    }
  }, [update]);

  const fetchPatientDetail = useCallback(async (id: string) => {
    update({ patientDetailLoading: true });
    try {
      const res = await fetch(`/api/patients/${id}`);
      const json = await res.json();
      update({ patientDetail: json.patient, patientDetailLoading: false });
    } catch {
      update({ patientDetailLoading: false });
    }
  }, [update]);

  const fetchVisits = useCallback(async (params?: VisitFilters) => {
    update({ visitsLoading: true });
    try {
      const data = await getVisitsAPI(params);
      update({ visits: data.visits, visitsTotal: data.total, visitsLoading: false });
    } catch {
      update({ visitsLoading: false });
    }
  }, [update]);

  const fetchSessions = useCallback(async (params?: SessionFilters) => {
    update({ sessionsLoading: true });
    try {
      const data = await getSessionsAPI(params);
      update({ sessions: data.sessions, sessionsTotal: data.total, sessionsLoading: false });
    } catch {
      update({ sessionsLoading: false });
    }
  }, [update]);

  const fetchServices = useCallback(async () => {
    update({ servicesLoading: true });
    try {
      const data = await getServicesAPI();
      update({ services: data.services, servicesLoading: false });
    } catch {
      update({ servicesLoading: false });
    }
  }, [update]);

  const fetchAlerts = useCallback(async (params?: { patientId?: string; isRead?: boolean; alertType?: string }) => {
    update({ alertsLoading: true });
    try {
      const data = await getAlertsAPI(params);
      update({ alerts: data.alerts, alertsLoading: false });
    } catch {
      update({ alertsLoading: false });
    }
  }, [update]);

  const fetchNotes = useCallback(async (params?: { patientId?: string; section?: string; relatedId?: string }) => {
    update({ notesLoading: true });
    try {
      const data = await getNotesAPI(params);
      update({ notes: data.notes, notesLoading: false });
    } catch {
      update({ notesLoading: false });
    }
  }, [update]);

  const fetchDailyReport = useCallback(async () => {
    update({ reportsLoading: true });
    try {
      const data = await getDailyReportAPI();
      update({ dailyReport: data, reportsLoading: false });
    } catch {
      update({ reportsLoading: false });
    }
  }, [update]);

  const fetchWeeklyReport = useCallback(async () => {
    update({ reportsLoading: true });
    try {
      const data = await getWeeklyReportAPI();
      update({ weeklyReport: data, reportsLoading: false });
    } catch {
      update({ reportsLoading: false });
    }
  }, [update]);

  const fetchMonthlyReport = useCallback(async () => {
    update({ reportsLoading: true });
    try {
      const data = await getMonthlyReportAPI();
      update({ monthlyReport: data, reportsLoading: false });
    } catch {
      update({ reportsLoading: false });
    }
  }, [update]);

  // ─── Listen to sync events for auto-refresh ────────────────
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    // Patient events
    unsubs.push(on('patient:created', () => { fetchPatients(); fetchDashboard(); }));
    unsubs.push(on('patient:updated', () => { fetchPatients(); fetchDashboard(); }));
    unsubs.push(on('patient:deleted', () => { fetchPatients(); fetchDashboard(); }));

    // Visit events
    unsubs.push(on('visit:created', () => { fetchVisits(); fetchDashboard(); }));
    unsubs.push(on('visit:updated', () => { fetchVisits(); fetchDashboard(); }));
    unsubs.push(on('visit:deleted', () => { fetchVisits(); fetchDashboard(); }));

    // Session events
    unsubs.push(on('session:created', () => { fetchSessions(); fetchDashboard(); }));
    unsubs.push(on('session:updated', () => { fetchSessions(); fetchDashboard(); }));
    unsubs.push(on('session:deleted', () => { fetchSessions(); fetchDashboard(); }));

    // Alert events
    unsubs.push(on('alert:new', () => { fetchAlerts(); fetchDashboard(); }));
    unsubs.push(on('alert:updated', () => { fetchAlerts(); fetchDashboard(); }));
    unsubs.push(on('alert:deleted', () => { fetchAlerts(); fetchDashboard(); }));

    // Note events
    unsubs.push(on('note:new', () => { fetchNotes(); }));

    // Service events
    unsubs.push(on('service:created', () => { fetchServices(); }));
    unsubs.push(on('service:updated', () => { fetchServices(); }));
    unsubs.push(on('service:deleted', () => { fetchServices(); }));

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [on, fetchPatients, fetchVisits, fetchSessions, fetchDashboard, fetchAlerts, fetchNotes, fetchServices]);

  // ─── Polling fallback when WebSocket is disconnected ───────
  useEffect(() => {
    if (connected) {
      // Stop polling when WebSocket is connected
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Poll every 5 seconds when disconnected (as fallback)
    pollingIntervalRef.current = setInterval(async () => {
      // Avoid excessive polling
      const now = Date.now();
      if (now - lastPollRef.current < 5000) return;
      lastPollRef.current = now;

      try {
        // Silently refresh dashboard and alerts
        const [dashData, alertsData] = await Promise.allSettled([
          getDashboardAPI(),
          getAlertsAPI({ isRead: false }),
        ]);
        if (dashData.status === 'fulfilled') {
          update({ dashboard: dashData.value });
        }
        if (alertsData.status === 'fulfilled') {
          update({ alerts: alertsData.value.alerts });
        }
      } catch {
        // Silent fail - polling is a fallback
      }
    }, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [connected, update]);

  return {
    ...state,
    connected,
    connectionInfo: connectionInfo || '',
    lastSyncTime,
    fetchDashboard,
    fetchPatients,
    fetchPatientDetail,
    fetchVisits,
    fetchSessions,
    fetchServices,
    fetchAlerts,
    fetchNotes,
    fetchDailyReport,
    fetchWeeklyReport,
    fetchMonthlyReport,
  };
}
