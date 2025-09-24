export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'staff';
}

export interface Patient {
  id: number;
  full_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  contact_number: string;
  civil_status?: string;
  religion?: string;
  philhealth_id?: string;
  reason_for_visit?: string;
  status: 'active' | 'inactive';
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
  patient?: Patient;
  created_at: string;
  updated_at: string;
}

export interface Queue {
  id: number;
  queue_number: number;
  patient_id: number;
  reason_for_visit: string;
  status: 'waiting' | 'serving' | 'served' | 'skipped';
  called_at?: string;
  served_at?: string;
  queue_date: string;
  patient?: Patient;
  created_at: string;
  updated_at: string;
}

export interface PreRegistration {
  id: number;
  full_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  contact_number: string;
  civil_status?: string;
  religion?: string;
  philhealth_id?: string;
  reason_for_visit: string;
  status: 'pending' | 'approved' | 'rejected';
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