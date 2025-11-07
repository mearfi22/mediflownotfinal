import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Patient } from "../types";

interface QueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    patient_id: number;
    reason_for_visit: string;
  }) => Promise<void>;
  patients: Patient[];
}

interface FormData {
  patient_id: number;
  reason_for_visit: string;
}

const QueueModal: React.FC<QueueModalProps> = ({
  isOpen,
  onClose,
  onSave,
  patients,
}) => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await onSave(data);
      reset();
      onClose();
    } catch (error) {
      console.error("Error adding to queue:", error);
      alert("Failed to add patient to queue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.contact_number.includes(searchTerm)
  );

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
          {/* Patient Search */}
          <div>
            <label
              htmlFor="patient-search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Search Patient
            </label>
            <input
              id="patient-search"
              type="text"
              placeholder="Type patient name or contact number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input mb-2"
            />
          </div>

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
                valueAsNumber: true,
              })}
              className="input"
            >
              <option value="">Choose a patient</option>
              {filteredPatients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.full_name} - {patient.contact_number}
                </option>
              ))}
              \n{" "}
            </select>
            {errors.patient_id && (
              <p className="mt-1 text-sm text-red-600">
                {errors.patient_id.message}
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
