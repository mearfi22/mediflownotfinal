import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { XMarkIcon, DocumentArrowUpIcon } from "@heroicons/react/24/outline";
import { Queue, Doctor } from "../types";
import { medicalRecordsApi, queueApi, doctorsApi } from "../services/api";

interface QuickMedicalRecordProps {
  queue: Queue;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  visit_date: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  doctor_name: string;
  pdf_file: FileList;
}

const QuickMedicalRecord: React.FC<QuickMedicalRecordProps> = ({
  queue,
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await doctorsApi.getAll();
        // Handle both array and paginated response
        const data: Doctor[] = Array.isArray(response.data) 
          ? response.data 
          : (response.data as any)?.data || [];
        setDoctors(data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setDoctors([]);
      }
    };
    fetchDoctors();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      visit_date: new Date().toISOString().split("T")[0],
      diagnosis: "",
      treatment: "",
      notes: "",
      doctor_name: queue.doctor?.full_name || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!selectedFile) {
      alert("Please upload a PDF file for the medical record.");
      return;
    }

    try {
      setLoading(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("patient_id", queue.patient_id.toString());
      formData.append("visit_date", data.visit_date);
      formData.append("diagnosis", data.diagnosis);
      formData.append("treatment", data.treatment);
      formData.append("doctor_name", data.doctor_name);
      if (data.notes) {
        formData.append("notes", data.notes);
      }
      formData.append("pdf_file", selectedFile);

      // Create medical record
      const response = await medicalRecordsApi.create(formData as any);

      // Link medical record to queue entry
      await queueApi.update(queue.id, {
        medical_record_id: response.data.id,
        status: "attended",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating medical record:", error);
      alert("Failed to create medical record. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToFullForm = () => {
    navigate(`/medical-records?patient_id=${queue.patient_id}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Document Patient Visit
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Patient: <span className="font-semibold">{queue.patient?.full_name}</span> | Queue #{queue.queue_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Visit Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visit Date *
              </label>
              <input
                type="date"
                {...register("visit_date", {
                  required: "Visit date is required",
                })}
                className="input"
              />
              {errors.visit_date && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.visit_date.message}
                </p>
              )}
            </div>

            {/* Doctor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor *
              </label>
              <select
                {...register("doctor_name", {
                  required: "Doctor selection is required",
                })}
                className="input"
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.full_name}>
                    Dr. {doctor.full_name}
                  </option>
                ))}
              </select>
              {errors.doctor_name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.doctor_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis *
            </label>
            <textarea
              rows={3}
              placeholder="Enter diagnosis"
              {...register("diagnosis", {
                required: "Diagnosis is required",
              })}
              className="input"
            />
            {errors.diagnosis && (
              <p className="mt-1 text-sm text-red-600">
                {errors.diagnosis.message}
              </p>
            )}
          </div>

          {/* Treatment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Treatment & Medication *
            </label>
            <textarea
              rows={3}
              placeholder="Enter treatment details and medications"
              {...register("treatment", {
                required: "Treatment is required",
              })}
              className="input"
            />
            {errors.treatment && (
              <p className="mt-1 text-sm text-red-600">
                {errors.treatment.message}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              rows={2}
              placeholder="Enter any additional notes (optional)"
              {...register("notes")}
              className="input"
            />
          </div>

          {/* PDF File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medical Record PDF *
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-2xl hover:border-blue-400 transition-colors">
              <div className="space-y-1 text-center">
                <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-2xl font-medium text-blue-600 hover:text-blue-500">
                    <span>Upload PDF file</span>
                    <input
                      type="file"
                      accept=".pdf"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                        }
                      }}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF up to 10MB</p>
                {selectedFile && (
                  <div className="mt-2 text-sm text-green-600 font-medium">
                    ✓ Selected: {selectedFile.name}
                  </div>
                )}
                {!selectedFile && (
                  <div className="mt-2 text-sm text-red-600">
                    PDF file is required
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleGoToFullForm}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Need more options? Use full form →
            </button>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Complete & Document"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickMedicalRecord;
