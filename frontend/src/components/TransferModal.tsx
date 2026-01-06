import React, { useState, useEffect } from "react";
import { Queue, Department, Doctor } from "../types";
import { XMarkIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (data: {
    to_doctor_id?: number;
    to_department_id?: number;
    reason?: string;
  }) => Promise<void>;
  queue: Queue;
  departments: Department[];
  doctors: Doctor[];
  onDepartmentChange: (departmentId: number) => void;
}

const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  onTransfer,
  queue,
  departments,
  doctors,
  onDepartmentChange,
}) => {
  const [departmentId, setDepartmentId] = useState<number | "">(
    queue.department_id || ""
  );
  const [doctorId, setDoctorId] = useState<number | "">(queue.doctor_id || "");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (departmentId) {
      onDepartmentChange(Number(departmentId));
    }
  }, [departmentId, onDepartmentChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if anything changed
    const hasChanges = 
      (departmentId && departmentId !== queue.department_id) ||
      (doctorId && doctorId !== queue.doctor_id);

    if (!hasChanges) {
      alert("Please select a different department or doctor to transfer");
      return;
    }

    setSubmitting(true);
    try {
      await onTransfer({
        to_department_id: departmentId ? Number(departmentId) : undefined,
        to_doctor_id: doctorId ? Number(doctorId) : undefined,
        reason: reason || undefined,
      });
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to transfer queue");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Transfer Queue</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Assignment */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Assignment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Patient</p>
                <p className="font-semibold text-gray-900">
                  {queue.patient?.full_name}
                </p>
                <p className="text-xs text-gray-600">Queue #{queue.queue_number}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Department</p>
                <p className="font-semibold text-gray-900">
                  {queue.department?.name || "Not Assigned"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Doctor</p>
                <p className="font-semibold text-gray-900">
                  {queue.doctor?.full_name || "Not Assigned"}
                </p>
              </div>
            </div>
          </div>

          {/* Transfer Arrow */}
          <div className="flex justify-center">
            <div className="bg-blue-100 rounded-full p-3">
              <ArrowRightIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          {/* New Assignment */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Transfer To</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                value={departmentId}
                onChange={(e) => {
                  const value = e.target.value;
                  setDepartmentId(value ? Number(value) : "");
                  setDoctorId(""); // Reset doctor when department changes
                }}
                className="input"
              >
                <option value="">-- Select Department --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doctor
              </label>
              <select
                value={doctorId}
                onChange={(e) => {
                  const value = e.target.value;
                  setDoctorId(value ? Number(value) : "");
                }}
                className="input"
                disabled={!departmentId}
              >
                <option value="">-- Select Doctor --</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.full_name}
                  </option>
                ))}
              </select>
              {!departmentId && (
                <p className="text-xs text-gray-500 mt-1">
                  Select a department first to see available doctors
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Transfer (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="input"
                placeholder="Enter reason for transferring this patient..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? "Transferring..." : "Transfer Queue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;
