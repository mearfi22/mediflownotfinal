import axios from "axios";
import {
  Patient,
  MedicalRecord,
  Queue,
  PreRegistration,
  User,
  DashboardStats,
  PatientAnalytics,
  QueueAnalytics,
  MedicalRecordsAnalytics,
  PreRegistrationAnalytics,
  ExportData,
  Department,
  Doctor,
  QueueStatistics,
} from "../types";

const API_BASE_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/login", { email, password }),
  logout: () => api.post("/logout"),
  register: (userData: Partial<User>) => api.post("/register", userData),
  getUser: () => api.get<User>("/user"),
};

// Patients API
export const patientsApi = {
  getAll: () => api.get<Patient[]>("/patients"),
  getById: (id: number) => api.get<Patient>(`/patients/${id}`),
  create: (patient: Partial<Patient>) => api.post<Patient>("/patients", patient),
  update: (id: number, patient: Partial<Patient>) =>
    api.put<Patient>(`/patients/${id}`, patient),
  delete: (id: number) => api.delete(`/patients/${id}`),
};

// Medical Records API
export const medicalRecordsApi = {
  getAll: () => api.get<MedicalRecord[]>("/medical-records"),
  getByPatientId: (patientId: number) =>
    api.get<MedicalRecord[]>(`/patients/${patientId}/medical-records`),
  getById: (id: number) => api.get<MedicalRecord>(`/medical-records/${id}`),
  create: (record: Partial<MedicalRecord>) =>
    api.post<MedicalRecord>("/medical-records", record),
  update: (id: number, record: Partial<MedicalRecord>) =>
    api.post<MedicalRecord>(`/medical-records/${id}`, record),
  delete: (id: number) => api.delete(`/medical-records/${id}`),
  downloadPdf: (id: number) =>
    api.get(`/medical-records/${id}/download-pdf`, {
      responseType: "blob",
    }),
};

// Queue API
export const queueApi = {
  getAll: (date?: string) => {
    const params = date ? { date } : {};
    return api.get<Queue[]>("/queue", { params });
  },
  getById: (id: number) => api.get<Queue>(`/queue/${id}`),
  create: (queue: Partial<Queue>) => api.post<Queue>("/queue", queue),
  update: (id: number, queue: Partial<Queue>) =>
    api.put<Queue>(`/queue/${id}`, queue),
  delete: (id: number) => api.delete(`/queue/${id}`),
  getStatistics: (date?: string) => {
    const params = date ? { date } : {};
    return api.get<QueueStatistics>("/queue-statistics", { params });
  },
  getDisplay: (date?: string) => {
    const params = date ? { date } : {};
    return api.get<any>("/queue/display", { params });
  },
  display: (date?: string) => {
    const params = date ? { date } : {};
    return api.get<{ now_serving: Queue | null; next_five: Queue[] }>(
      "/queue/display",
      { params }
    );
  },
  transfer: (id: number, data: { to_doctor_id?: number; to_department_id?: number; reason?: string }) =>
    api.post(`/queue/${id}/transfer`, data),
  getTransferHistory: (id: number) =>
    api.get(`/queue/${id}/transfer-history`),
  getDepartments: () => api.get<Department[]>("/departments"),
  getDoctors: (departmentId?: number) => {
    const params = departmentId ? { department_id: departmentId } : {};
    return api.get<Doctor[]>("/doctors", { params });
  },
};

// Doctors API
export const doctorsApi = {
  getAll: () => api.get<Doctor[]>("/doctors"),
  getById: (id: number) => api.get<Doctor>(`/doctors/${id}`),
  create: (doctor: Partial<Doctor>) => api.post<Doctor>("/doctors", doctor),
  update: (id: number, doctor: Partial<Doctor>) =>
    api.put<Doctor>(`/doctors/${id}`, doctor),
  delete: (id: number) => api.delete(`/doctors/${id}`),
  getDepartments: () => api.get<Department[]>("/departments-list"),
};

// Departments API
export const departmentsApi = {
  getAll: () => api.get<Department[]>("/departments"),
  getById: (id: number) => api.get<Department>(`/departments/${id}`),
  create: (department: Partial<Department>) => api.post<Department>("/departments", department),
  update: (id: number, department: Partial<Department>) =>
    api.put<Department>(`/departments/${id}`, department),
  delete: (id: number) => api.delete(`/departments/${id}`),
};

// System Settings API
export const systemSettingsApi = {
  get: () => api.get("/system-settings"),
  update: (settings: any) => api.put("/system-settings", settings),
};

// Users API
export const usersApi = {
  getAll: (params?: any) => api.get<User[]>("/users", { params }),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  create: (user: any) => api.post<User>("/users", user),
  update: (id: number, user: any) => api.put<User>(`/users/${id}`, user),
  delete: (id: number) => api.delete(`/users/${id}`),
  getStaff: () => api.get<User[]>("/staff-list"),
  getDoctorUsers: () => api.get<User[]>("/doctor-users"),
  toggleStatus: (id: number) => api.post(`/users/${id}/toggle-status`),
};

// Pre-registration API
export const preRegistrationApi = {
  getAll: () => api.get<PreRegistration[]>("/pre-registrations"),
  getById: (id: number) => api.get<PreRegistration>(`/pre-registrations/${id}`),
  create: (preReg: Partial<PreRegistration>) =>
    api.post<PreRegistration>("/pre-registrations", preReg),
  update: (id: number, preReg: Partial<PreRegistration>) =>
    api.put<PreRegistration>(`/pre-registrations/${id}`, preReg),
  delete: (id: number) => api.delete(`/pre-registrations/${id}`),
  approve: (id: number) =>
    api.post(`/pre-registrations/${id}/approve`),
  reject: (id: number) =>
    api.post(`/pre-registrations/${id}/reject`),
};

// Reports API
export const reportsApi = {
  getDashboard: (startDate?: string, endDate?: string) => {
    const params = { start_date: startDate, end_date: endDate };
    return api.get<DashboardStats>("/reports/dashboard", { params });
  },
  getPatientAnalytics: (startDate?: string, endDate?: string) => {
    const params = { start_date: startDate, end_date: endDate };
    return api.get<PatientAnalytics>("/reports/patient-analytics", { params });
  },
  getQueueAnalytics: (startDate?: string, endDate?: string) => {
    const params = { start_date: startDate, end_date: endDate };
    return api.get<QueueAnalytics>("/reports/queue-analytics", { params });
  },
  getMedicalRecordsAnalytics: (startDate?: string, endDate?: string) => {
    const params = { start_date: startDate, end_date: endDate };
    return api.get<MedicalRecordsAnalytics>(
      "/reports/medical-records-analytics",
      { params }
    );
  },
  getPreRegistrationAnalytics: (startDate?: string, endDate?: string) => {
    const params = { start_date: startDate, end_date: endDate };
    return api.get<PreRegistrationAnalytics>(
      "/reports/pre-registration-analytics",
      { params }
    );
  },
  exportData: (
    type: "patients" | "medical_records" | "queue",
    startDate?: string,
    endDate?: string
  ) => {
    const params = { type, start_date: startDate, end_date: endDate };
    return api.get<ExportData>("/reports/export", { params });
  },
};

// Audit Logs API
export const auditLogsApi = {
  getAll: (params?: any) => api.get("/audit-logs", { params }),
  getStatistics: (params?: any) => api.get("/audit-logs/statistics", { params }),
};

// System Analytics API
export const systemAnalyticsApi = {
  getDashboard: (params?: any) => api.get("/system-analytics/dashboard", { params }),
};

// Export api object for direct use
export { api };

export default api;