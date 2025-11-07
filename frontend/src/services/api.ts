import axios from "axios";
import {
  User,
  Patient,
  MedicalRecord,
  Queue,
  PreRegistration,
  QueueStatistics,
  PaginatedResponse,
  DashboardStats,
  PatientAnalytics,
  QueueAnalytics,
  MedicalRecordsAnalytics,
  PreRegistrationAnalytics,
  ExportData,
} from "../types";

const API_BASE_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
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

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post("/login", { email, password });
    return response.data;
  },

  logout: async () => {
    await api.post("/logout");
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: string;
  }) => {
    const response = await api.post("/register", userData);
    return response.data;
  },

  getUser: async (): Promise<User> => {
    const response = await api.get("/user");
    return response.data;
  },
};

export const patientApi = {
  getAll: async (page = 1): Promise<PaginatedResponse<Patient>> => {
    const response = await api.get(`/patients?page=${page}`);
    return response.data;
  },

  getById: async (id: number): Promise<Patient> => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  create: async (
    patientData: Omit<Patient, "id" | "created_at" | "updated_at" | "status">
  ): Promise<Patient> => {
    const response = await api.post("/patients", patientData);
    return response.data;
  },

  update: async (
    id: number,
    patientData: Partial<Patient>
  ): Promise<Patient> => {
    const response = await api.put(`/patients/${id}`, patientData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/patients/${id}`);
  },
};

export const medicalRecordApi = {
  getAll: async (
    page = 1,
    patientId?: number
  ): Promise<PaginatedResponse<MedicalRecord>> => {
    const params = new URLSearchParams({ page: page.toString() });
    if (patientId) params.append("patient_id", patientId.toString());
    const response = await api.get(`/medical-records?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<MedicalRecord> => {
    const response = await api.get(`/medical-records/${id}`);
    return response.data;
  },

  create: async (
    recordData:
      | FormData
      | Omit<MedicalRecord, "id" | "created_at" | "updated_at" | "patient">
  ): Promise<MedicalRecord> => {
    const config =
      recordData instanceof FormData
        ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        : undefined;

    const response = await api.post("/medical-records", recordData, config);
    return response.data;
  },

  update: async (
    id: number,
    recordData: FormData | Partial<MedicalRecord>
  ): Promise<MedicalRecord> => {
    const config =
      recordData instanceof FormData
        ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        : undefined;

    // Use POST with _method override for FormData (file uploads)
    if (recordData instanceof FormData) {
      const response = await api.post(
        `/medical-records/${id}`,
        recordData,
        config
      );
      return response.data;
    } else {
      const response = await api.put(
        `/medical-records/${id}`,
        recordData,
        config
      );
      return response.data;
    }
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/medical-records/${id}`);
  },

  getPatientHistory: async (patientId: number): Promise<MedicalRecord[]> => {
    const response = await api.get(`/patients/${patientId}/medical-records`);
    return response.data;
  },
};

export const queueApi = {
  getAll: async (date?: string): Promise<Queue[]> => {
    const params = date ? `?date=${date}` : "";
    const response = await api.get(`/queue${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<Queue> => {
    const response = await api.get(`/queue/${id}`);
    return response.data;
  },

  create: async (queueData: {
    patient_id: number;
    reason_for_visit: string;
    queue_date?: string;
  }): Promise<Queue> => {
    const response = await api.post("/queue", queueData);
    return response.data;
  },

  update: async (
    id: number,
    queueData: { status: Queue["status"] }
  ): Promise<Queue> => {
    const response = await api.put(`/queue/${id}`, queueData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/queue/${id}`);
  },

  getStatistics: async (date?: string): Promise<QueueStatistics> => {
    const params = date ? `?date=${date}` : "";
    const response = await api.get(`/queue-statistics${params}`);
    return response.data;
  },

  getDisplay: async (
    date?: string
  ): Promise<{ now_serving?: Queue; next_three: Queue[] }> => {
    const params = date ? `?date=${date}` : "";
    const response = await api.get(`/queue/display${params}`);
    return response.data;
  },
};

export const preRegistrationApi = {
  getAll: async (page = 1): Promise<PaginatedResponse<PreRegistration>> => {
    const response = await api.get(`/pre-registrations?page=${page}`);
    return response.data;
  },

  getById: async (id: number): Promise<PreRegistration> => {
    const response = await api.get(`/pre-registrations/${id}`);
    return response.data;
  },

  create: async (
    data: Omit<
      PreRegistration,
      | "id"
      | "status"
      | "approved_by"
      | "approved_at"
      | "approver"
      | "created_at"
      | "updated_at"
    >
  ): Promise<PreRegistration> => {
    const response = await api.post("/pre-registrations", data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<PreRegistration>
  ): Promise<PreRegistration> => {
    const response = await api.put(`/pre-registrations/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/pre-registrations/${id}`);
  },

  approve: async (id: number): Promise<{ patient: Patient; queue: Queue }> => {
    const response = await api.post(`/pre-registrations/${id}/approve`);
    return response.data;
  },

  reject: async (id: number): Promise<void> => {
    await api.post(`/pre-registrations/${id}/reject`);
  },
};

export const reportsApi = {
  getDashboard: async (
    startDate?: string,
    endDate?: string
  ): Promise<DashboardStats> => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const response = await api.get(`/reports/dashboard?${params}`);
    return response.data;
  },

  getPatientAnalytics: async (
    startDate?: string,
    endDate?: string
  ): Promise<PatientAnalytics> => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const response = await api.get(`/reports/patient-analytics?${params}`);
    return response.data;
  },

  getQueueAnalytics: async (
    startDate?: string,
    endDate?: string
  ): Promise<QueueAnalytics> => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const response = await api.get(`/reports/queue-analytics?${params}`);
    return response.data;
  },

  getMedicalRecordsAnalytics: async (
    startDate?: string,
    endDate?: string
  ): Promise<MedicalRecordsAnalytics> => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const response = await api.get(
      `/reports/medical-records-analytics?${params}`
    );
    return response.data;
  },

  getPreRegistrationAnalytics: async (
    startDate?: string,
    endDate?: string
  ): Promise<PreRegistrationAnalytics> => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const response = await api.get(
      `/reports/pre-registration-analytics?${params}`
    );
    return response.data;
  },

  exportData: async (
    type: "patients" | "medical_records" | "queue",
    startDate?: string,
    endDate?: string
  ): Promise<ExportData> => {
    const params = new URLSearchParams({ type });
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const response = await api.get(`/reports/export?${params}`);
    return response.data;
  },
};

export default api;
