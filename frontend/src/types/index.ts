export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "staff";
}

export interface Patient {
  id: number;
  last_name: string;
  first_name: string;
  middle_name?: string;
  full_name: string; // computed field
  date_of_birth: string;
  age: string;
  gender: "male" | "female" | "other";
  birthplace: string;
  nationality: string;
  civil_status: string;
  spouse_name?: string;
  religion?: string;
  occupation?: string;
  address: string;
  contact_number: string;
  philhealth_id?: string;
  reason_for_visit?: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: number;
  patient_id: number;
  visit_date: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  doctor_name: string;
  pdf_file_path?: string;
  patient?: Patient;
  created_at: string;
  updated_at: string;
}

export interface Queue {
  id: number;
  queue_number: number;
  patient_id: number;
  reason_for_visit: string;
  status: "waiting" | "serving" | "served" | "skipped";
  called_at?: string;
  served_at?: string;
  queue_date: string;
  patient?: Patient;
  created_at: string;
  updated_at: string;
}

export interface PreRegistration {
  id: number;
  last_name: string;
  first_name: string;
  middle_name?: string;
  address: string;
  contact_number: string;
  sex: "male" | "female";
  civil_status: string;
  spouse_name?: string;
  date_of_birth: string;
  age: string;
  birthplace: string;
  nationality: string;
  religion?: string;
  occupation?: string;
  reason_for_visit: string;
  philhealth_id?: string;
  status: "pending" | "approved" | "rejected";
  approved_by?: number;
  approved_at?: string;
  approver?: User;
  created_at: string;
  updated_at: string;
}

export interface QueueStatistics {
  total_patients_today: number;
  now_serving?: Queue;
  served: number;
  skipped: number;
  waiting: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
}

// Reports interfaces
export interface DashboardStats {
  total_patients: number;
  total_medical_records: number;
  total_queue_entries: number;
  pending_pre_registrations: number;
  period_stats: {
    new_patients: number;
    medical_records: number;
    queue_entries: number;
    approved_pre_registrations: number;
  };
  today_stats: {
    queue_served: number;
    queue_waiting: number;
    queue_serving: number;
    queue_skipped: number;
  };
}

export interface PatientAnalytics {
  gender_distribution: Array<{ gender: string; count: number }>;
  age_distribution: Array<{ age_group: string; count: number }>;
  civil_status_distribution: Array<{ civil_status: string; count: number }>;
  registration_trends: Array<{ date: string; count: number }>;
}

export interface QueueAnalytics {
  status_distribution: Array<{ status: string; count: number }>;
  daily_trends: Array<{
    date: string;
    total: number;
    served: number;
    skipped: number;
  }>;
  peak_hours: Array<{ hour: number; count: number }>;
  waiting_time_stats: {
    avg_wait_minutes: number;
    min_wait_minutes: number;
    max_wait_minutes: number;
  } | null;
}

export interface MedicalRecordsAnalytics {
  visit_trends: Array<{ date: string; count: number }>;
  top_doctors: Array<{ doctor_name: string; visit_count: number }>;
  top_diagnoses: Array<{ diagnosis: string; diagnosis_count: number }>;
  diagnosis_categories: Array<{ category: string; count: number }>;
  pdf_attachment_stats: {
    total_records: number;
    records_with_pdf: number;
    pdf_attachment_rate: number;
  };
  monthly_distribution: Array<{
    year: number;
    month: number;
    count: number;
  }>;
}

export interface PreRegistrationAnalytics {
  status_distribution: Array<{ status: string; count: number }>;
  approval_trends: Array<{
    date: string;
    total: number;
    approved: number;
    rejected: number;
  }>;
  conversion_stats: {
    total_pre_registrations: number;
    approved_pre_registrations: number;
    approval_rate: number;
  };
}

export interface ExportData {
  data: any[];
  filename: string;
}
