import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  XMarkIcon,
  PrinterIcon,
  DocumentArrowUpIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { MedicalRecord, Patient, Doctor } from "../types";
import MedicalRecordPrint from "./MedicalRecordPrint";
import { doctorsApi } from "../services/api";

interface MedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData | Partial<MedicalRecord>) => Promise<void>;
  record?: MedicalRecord | null;
  patients: Patient[];
  isViewMode?: boolean;
  existingRecords?: MedicalRecord[]; // Add this to track existing records
}

interface FormData {
  patient_id: number;
  visit_date: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  doctor_name: string;
  pdf_file?: FileList;
}

const MedicalRecordModal: React.FC<MedicalRecordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  record,
  patients,
  isViewMode = false,
  existingRecords = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // All patients are available for medical records (multiple records per patient allowed)
  const availablePatients = patients;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  const watchedPatientId = watch("patient_id");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await doctorsApi.getAll();
        const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        setDoctors(data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setDoctors([]);
      }
    };

    if (isOpen) {
      fetchDoctors();
      setSelectedFile(null); // Reset file selection
      if (record) {
        reset({
          patient_id: record.patient_id,
          visit_date: record.visit_date.split("T")[0], // Format for date input
          diagnosis: record.diagnosis,
          treatment: record.treatment,
          notes: record.notes || "",
          doctor_name: record.doctor_name,
        });
      } else {
        reset({
          visit_date: new Date().toISOString().split("T")[0],
          diagnosis: "",
          treatment: "",
          notes: "",
          doctor_name: "",
        });
      }
    }
  }, [isOpen, record, reset]);

  // Auto-populate doctor based on selected patient
  useEffect(() => {
    if (watchedPatientId && !record && doctors.length > 0) {
      const selectedPatient = patients.find(p => p.id === Number(watchedPatientId));
      if (selectedPatient?.doctor_id) {
        const patientDoctor = doctors.find(d => d.id === selectedPatient.doctor_id);
        if (patientDoctor) {
          setValue("doctor_name", patientDoctor.full_name);
        }
      }
    }
  }, [watchedPatientId, patients, doctors, record, setValue]);

  const onSubmit = async (data: FormData) => {
    if (isViewMode) return;

    // Validate PDF file for new records
    if (!selectedFile) {
      alert('Please upload a PDF file for the medical record.');
      return;
    }

    try {
      setLoading(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("patient_id", data.patient_id.toString());
      formData.append("visit_date", data.visit_date);
      formData.append("diagnosis", data.diagnosis);
      formData.append("treatment", data.treatment);
      formData.append("doctor_name", data.doctor_name);
      if (data.notes) {
        formData.append("notes", data.notes);
      }
      if (selectedFile) {
        formData.append("pdf_file", selectedFile);
      }

      // Always create new record (even when editing - it creates a new visit entry)
      // This builds medical history instead of overwriting
      await onSave(formData as any);
      setSelectedFile(null);
      onClose();
    } catch (error) {
      console.error("Error saving medical record:", error);
      alert("Failed to save medical record. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (record && isViewMode) {
      const patient = patients.find((p) => p.id === record.patient_id);
      if (patient) {
        setShowPrint(true);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isOpen) return null;

  const currentPatient = record
    ? patients.find((p) => p.id === record.patient_id)
    : null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {isViewMode
                  ? "Medical Record Details"
                  : record
                  ? "Edit Medical Record"
                  : "Add New Medical Record"}
              </h3>
              {isViewMode && currentPatient && (
                <p className="text-sm text-gray-600 mt-1">
                  Patient: {currentPatient.full_name} | Record #
                  {record?.id.toString().padStart(6, "0")}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {isViewMode && record && (
                <button
                  onClick={handlePrint}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <PrinterIcon className="h-5 w-5" />
                  <span>Print Record</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {isViewMode && currentPatient && record ? (
              // Enhanced View Mode Design
              <div className="space-y-8">
                {/* Patient Information Card */}
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-teal-900 mb-4 flex items-center">
                    👤 Patient Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Full Name:
                      </span>
                      <p className="text-gray-900 font-medium">
                        {currentPatient.full_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Age/Gender:
                      </span>
                      <p className="text-gray-900">
                        {currentPatient.age} years old, {currentPatient.gender}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Contact:
                      </span>
                      <p className="text-gray-900">
                        {currentPatient.contact_number}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Civil Status:
                      </span>
                      <p className="text-gray-900">
                        {currentPatient.civil_status}
                      </p>
                    </div>
                    {currentPatient.philhealth_id && (
                      <div className="md:col-span-2">
                        <span className="text-sm font-medium text-gray-600">
                          PhilHealth ID:
                        </span>
                        <p className="text-gray-900">
                          {currentPatient.philhealth_id}
                        </p>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <span className="text-sm font-medium text-gray-600">
                        Address:
                      </span>
                      <p className="text-gray-900">{currentPatient.address}</p>
                    </div>
                  </div>
                </div>

                {/* Visit Information Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    📅 Visit Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Visit Date:
                      </span>
                      <p className="text-gray-900 font-medium">
                        {formatDate(record.visit_date)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Attending Doctor:
                      </span>
                      <p className="text-gray-900 font-medium">
                        {record.doctor_name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Medical Details Cards */}
                <div className="space-y-6">
                  {/* Diagnosis */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                      🏥 Diagnosis
                    </h4>
                    <div className="bg-white rounded-lg p-4 border border-red-100">
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {record.diagnosis}
                      </p>
                    </div>
                  </div>

                  {/* Treatment */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                      💊 Treatment & Medication
                    </h4>
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {record.treatment}
                      </p>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  {record.notes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
                        📝 Additional Notes
                      </h4>
                      <div className="bg-white rounded-lg p-4 border border-yellow-100">
                        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                          {record.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* PDF Document */}
                  {record.pdf_file_path && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                        📄 Medical Record Document
                      </h4>
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <DocumentIcon className="h-8 w-8 text-purple-600" />
                            <div>
                              <p className="text-gray-900 font-medium">
                                Medical Record PDF
                              </p>
                              <p className="text-sm text-gray-500">
                                Soft copy of medical record
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                const url = `http://localhost:8000/api/medical-records/${record.id}/download-pdf`;
                                window.open(url, "_blank");
                              }}
                              className="btn btn-primary flex items-center space-x-2"
                            >
                              <DocumentIcon className="h-4 w-4" />
                              <span>Download PDF</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Record Metadata */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Record Created:</span>{" "}
                      {formatDate(record.created_at)}
                    </p>
                    <p>
                      <span className="font-medium">Last Updated:</span>{" "}
                      {formatDate(record.updated_at)}
                    </p>
                    <p>
                      <span className="font-medium">Record ID:</span> #
                      {record.id.toString().padStart(6, "0")}
                    </p>
                  </div>
                </div>

                {/* View Mode Actions */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-primary"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              // Edit/Add Mode - Original Form
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Patient Selection */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="patient_id"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Patient *
                    </label>
                    <select
                      id="patient_id"
                      {...register("patient_id", {
                        required: "Patient is required",
                        valueAsNumber: true,
                      })}
                      className="input"
                      disabled={isViewMode || !!record}
                    >
                      <option value="">Select a patient</option>
                      {availablePatients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.full_name}
                        </option>
                      ))}
                    </select>
                    {errors.patient_id && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.patient_id.message}
                      </p>
                    )}
                  </div>

                  {/* Visit Date */}
                  <div>
                    <label
                      htmlFor="visit_date"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Visit Date *
                    </label>
                    <input
                      id="visit_date"
                      type="date"
                      {...register("visit_date", {
                        required: "Visit date is required",
                      })}
                      className="input"
                      readOnly={isViewMode}
                    />
                    {errors.visit_date && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.visit_date.message}
                      </p>
                    )}
                  </div>

                  {/* Doctor Selection */}
                  <div>
                    <label
                      htmlFor="doctor_name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Doctor *
                    </label>
                    {isViewMode ? (
                      <input
                        id="doctor_name"
                        type="text"
                        value={record?.doctor_name || ""}
                        className="input"
                        readOnly
                      />
                    ) : (
                      <select
                        id="doctor_name"
                        {...register("doctor_name", {
                          required: "Doctor selection is required",
                        })}
                        className="input"
                      >
                        <option value="">Select a doctor</option>
                        {doctors.map((doctor) => (
                          <option key={doctor.id} value={doctor.full_name}>
                            {doctor.full_name}
                          </option>
                        ))}
                      </select>
                    )}
                    {errors.doctor_name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.doctor_name.message}
                      </p>
                    )}
                  </div>

                  {/* Diagnosis */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="diagnosis"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Diagnosis *
                    </label>
                    <textarea
                      id="diagnosis"
                      rows={3}
                      placeholder="Enter diagnosis details"
                      {...register("diagnosis", {
                        required: "Diagnosis is required",
                      })}
                      className="input"
                      readOnly={isViewMode}
                    />
                    {errors.diagnosis && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.diagnosis.message}
                      </p>
                    )}
                  </div>

                  {/* Treatment */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="treatment"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Treatment *
                    </label>
                    <textarea
                      id="treatment"
                      rows={3}
                      placeholder="Enter treatment details"
                      {...register("treatment", {
                        required: "Treatment is required",
                      })}
                      className="input"
                      readOnly={isViewMode}
                    />
                    {errors.treatment && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.treatment.message}
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="notes"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Additional Notes
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      placeholder="Enter any additional notes (optional)"
                      {...register("notes")}
                      className="input"
                      readOnly={isViewMode}
                    />
                  </div>

                  {/* PDF File Upload */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="pdf_file"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Medical Record PDF {record ? '(Upload new file to replace existing)' : '*'}
                    </label>
                    {record && record.pdf_file_path && (
                      <p className="text-xs text-gray-500 mb-2">
                        Current file: {record.pdf_file_path.split('/').pop()}
                      </p>
                    )}
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                      <div className="space-y-1 text-center">
                        <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="pdf_file"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Upload a PDF file</span>
                            <input
                              id="pdf_file"
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
                          <div className="mt-2 text-sm text-green-600">
                            Selected: {selectedFile.name}
                          </div>
                        )}
                        {!record && !selectedFile && (
                          <div className="mt-2 text-sm text-red-600">
                            PDF file is required for medical records
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
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
                    ) : record ? (
                      "Update Record"
                    ) : (
                      "Create Record"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Print Modal */}
      {showPrint && record && currentPatient && (
        <MedicalRecordPrint
          record={record}
          patient={currentPatient}
          onClose={() => setShowPrint(false)}
        />
      )}
    </>
  );
};

export default MedicalRecordModal;
