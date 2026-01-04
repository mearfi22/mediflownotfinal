export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "staff" | "doctor";
  doctor_id?: number; // Links staff user to a doctor profile
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
  department_id?: number;
  doctor_id?: number;
  department?: Department;
  doctor?: Doctor;
  priority?: "regular" | "senior" | "pwd" | "emergency";
  status: "active" | "inactive";
  patient_uid?: string; // Unique patient ID
  medical_records_count?: number; // Count of medical records
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: number;
  name: string;
  doctors_count?: number;
  queue_entries_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: number;
  department_id: number;
  full_name: string;
  email?: string;
  phone?: string;
  status: "active" | "inactive";
  avg_consultation_minutes?: number;
  department?: Department;
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
  status: "waiting" | "attending" | "attended" | "skipped";
  priority: "regular" | "senior" | "pwd" | "emergency";
  estimated_wait_minutes?: number;
  called_at?: string;
  served_at?: string;
  queue_date: string;
  patient?: Patient;
  department_id?: number;
  doctor_id?: number;
  department?: Department;
  doctor?: Doctor;
  medical_record_id?: number;
  medical_record?: MedicalRecord;
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
  sex: string;
  civil_status: string;
  spouse_name?: string;
  date_of_birth: string;
  age: string;
  birthplace: string;
  nationality: string;
  religion?: string;
  occupation?: string;
  reason_for_visit: string;
  priority?: "regular" | "senior" | "pwd" | "emergency";
  philhealth_id?: string;
  status: "pending" | "approved" | "rejected" | "no_show";
  department_id?: number;
  doctor_id?: number;
  department?: Department;
  doctor?: Doctor;
  approved_by?: number;
  approved_at?: string;
  approver?: User;
  created_at: string;
  updated_at: string;
}

export interface QueueStatistics {
  total_patients_today: number;
  now_serving: Queue | undefined;
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
  age_groups: Array<{ range: string; count: number }>;
  civil_status_distribution: Array<{ civil_status: string; count: number }>;
  nationality_distribution: Array<{ nationality: string; count: number }>;
  registration_trends: Array<{ date: string; count: number }>;
  top_reasons_for_visit: Array<{ reason: string; count: number }>;
}

export interface QueueAnalytics {
  daily_trends: Array<{ date: string; count: number }>;
  status_distribution: Array<{ status: string; count: number }>;
  avg_wait_time: number;
  peak_hours: Array<{ hour: number; count: number }>;
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

export interface QueueTransfer {
  id: number;
  queue_id: number;
  from_doctor_id?: number;
  to_doctor_id?: number;
  from_department_id?: number;
  to_department_id?: number;
  reason?: string;
  transferred_by?: number;
  from_doctor?: Doctor;
  to_doctor?: Doctor;
  from_department?: Department;
  to_department?: Department;
  created_at: string;
  updated_at: string;
}

export interface ExportData {
  data: any[];
  filename: string;
}