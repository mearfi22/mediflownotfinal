import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Patient, Department, Doctor } from "../types";

interface QueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    patient_id: number;
    reason_for_visit: string;
    department_id?: number;
    doctor_id?: number;
    priority?: string;
  }) => Promise<void>;
  patients: Patient[];
  departments?: Department[];
  doctors?: Doctor[];
}

interface FormData {
  patient_id: number;
  reason_for_visit: string;
  department_id?: number;
  doctor_id?: number;
  priority: string;
}

const QueueModal: React.FC<QueueModalProps> = ({
  isOpen,
  onClose,
  onSave,
  patients,
  departments = [],
  doctors = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>(doctors);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      priority: "regular",
    },
  });

  const watchedDepartmentId = watch("department_id");
  const watchedPatientId = watch("patient_id");

  // Auto-fill department, doctor, and reason when patient is selected
  useEffect(() => {
    if (watchedPatientId) {
      const selectedPatient = patients.find(
        (p) => p.id === Number(watchedPatientId)
      );
      if (selectedPatient) {
        // Auto-fill department if available
        if (selectedPatient.department_id) {
          setValue("department_id", selectedPatient.department_id);
        }
        // Auto-fill doctor if available
        if (selectedPatient.doctor_id) {
          setValue("doctor_id", selectedPatient.doctor_id);
        }
        // Auto-fill reason for visit if available
        if (selectedPatient.reason_for_visit) {
          setValue("reason_for_visit", selectedPatient.reason_for_visit);
        }
        // Auto-fill priority if available
        if (selectedPatient.priority) {
          setValue("priority", selectedPatient.priority);
        }
      }
    }
  }, [watchedPatientId, patients, setValue]);

  // Filter doctors based on selected department
  useEffect(() => {
    if (watchedDepartmentId) {
      const filtered = doctors.filter(
        (doctor) => doctor.department_id === watchedDepartmentId
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors(doctors);
    }
  }, [watchedDepartmentId, doctors]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      // Convert string values to numbers if needed
      const processedData = {
        ...data,
        patient_id: Number(data.patient_id),
        department_id: data.department_id ? Number(data.department_id) : undefined,
        doctor_id: data.doctor_id ? Number(data.doctor_id) : undefined,
        priority: data.priority || 'regular',
      };
      await onSave(processedData);
      reset();
      onClose();
    } catch (error) {
      console.error("Error adding to queue:", error);
      alert("Failed to add patient to queue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Add Patient to Queue
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-4 sm:p-6 space-y-4 sm:space-y-6"
        >
          {/* Patient Selection */}
          <div>
            <label
              htmlFor="patient_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Patient *
            </label>
            <select
              id="patient_id"
              {...register("patient_id", {
                required: "Patient selection is required",
              })}
              className="input"
            >
              <option value="">Choose a patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.full_name} - {patient.contact_number}
                </option>
              ))}
            </select>
            {errors.patient_id && (
              <p className="mt-1 text-sm text-red-600">
                {errors.patient_id.message}
              </p>
            )}
          </div>

          {/* Department Selection */}
          <div>
            <label
              htmlFor="department_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Department
            </label>
            <select
              id="department_id"
              {...register("department_id")}
              className="input"
            >
              <option value="">Select Department (Optional)</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Selection */}
          <div>
            <label
              htmlFor="doctor_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Doctor
            </label>
            <select
              id="doctor_id"
              {...register("doctor_id")}
              className="input"
              disabled={!watchedDepartmentId}
            >
              <option value="">Select Doctor (Optional)</option>
              {filteredDoctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.full_name}
                </option>
              ))}
            </select>
            {!watchedDepartmentId && (
              <p className="mt-1 text-sm text-gray-500">
                Please select a department first
              </p>
            )}
          </div>

          {/* Priority Selection */}
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Priority *
            </label>
            <select
              id="priority"
              {...register("priority", { required: "Priority is required" })}
              className="input"
            >
              <option value="regular">Regular</option>
              <option value="senior">Senior Citizen</option>
              <option value="pwd">PWD (Person with Disability)</option>
              <option value="emergency">Emergency</option>
            </select>
            {errors.priority && (
              <p className="mt-1 text-sm text-red-600">
                {errors.priority.message}
              </p>
            )}
          </div>

          {/* Reason for Visit */}
          <div>
            <label
              htmlFor="reason_for_visit"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Reason for Visit *
            </label>
            <textarea
              id="reason_for_visit"
              rows={3}
              placeholder="Enter the reason for this visit..."
              {...register("reason_for_visit", {
                required: "Reason for visit is required",
              })}
              className="input"
            />
            {errors.reason_for_visit && (
              <p className="mt-1 text-sm text-red-600">
                {errors.reason_for_visit.message}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary order-2 sm:order-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary order-1 sm:order-2"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </div>
              ) : (
                "Add to Queue"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QueueModal;