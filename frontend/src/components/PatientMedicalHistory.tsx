import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { medicalRecordsApi } from "../services/api";
import { MedicalRecord, Patient } from "../types";
import {
  XMarkIcon,
  ClockIcon,
  DocumentTextIcon,
  BeakerIcon,
  PlusIcon,
  EyeIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

interface PatientMedicalHistoryProps {
  patient: Patient;
  onClose: () => void;
}

const PatientMedicalHistory: React.FC<PatientMedicalHistoryProps> = ({
  patient,
  onClose,
}) => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    fetchMedicalRecords();
  }, [patient.id]);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const response = await medicalRecordsApi.getAll();
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      
      // Filter records for this patient and sort by date
      const patientRecords = data
        .filter((record: MedicalRecord) => record.patient_id === patient.id)
        .sort((a: MedicalRecord, b: MedicalRecord) => 
          new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()
        );
      
      setRecords(patientRecords);
    } catch (error) {
      console.error("Error fetching medical records:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const handleAddRecord = () => {
    // Navigate to medical records page with patient pre-selected
    navigate(`/medical-records?patient_id=${patient.id}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">
              Medical History
            </h3>
            <div className="mt-2 flex items-center gap-3">
              <div>
                <p className="text-sm text-gray-600">
                  Patient: <span className="font-semibold text-gray-900">{patient.full_name}</span>
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  ID: {patient.patient_uid ? patient.patient_uid.substring(0, 8).toUpperCase() : 'N/A'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                  {records.length} {records.length === 1 ? 'Visit' : 'Visits'}
                </span>
                <span className="text-gray-500">
                  {patient.age}y/{patient.gender.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 ml-4"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-gray-500">Loading medical records...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Medical Records Yet
              </h4>
              <p className="text-gray-500 mb-6">
                This patient doesn't have any medical records in the system.
              </p>
              <button
                onClick={handleAddRecord}
                className="btn-primary inline-flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Add First Medical Record
              </button>
            </div>
          ) : (
            <>
              {/* Timeline View */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {/* Records */}
                <div className="space-y-6">
                  {records.map((record, index) => (
                    <div key={record.id} className="relative pl-16">
                      {/* Timeline dot */}
                      <div className="absolute left-6 top-2 w-4 h-4 rounded-full bg-primary border-4 border-white ring-2 ring-gray-200"></div>

                      {/* Record card */}
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CalendarIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-semibold text-gray-900">
                                {formatDate(record.visit_date)}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({getTimeSince(record.visit_date)})
                              </span>
                            </div>
                            {record.doctor_name && (
                              <p className="text-xs text-gray-600">
                                Dr. {record.doctor_name}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="text-primary hover:text-primary-dark p-2 rounded-full hover:bg-white"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Diagnosis */}
                        <div className="mb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <BeakerIcon className="h-4 w-4 text-red-500" />
                            <span className="text-xs font-medium text-gray-700">
                              Diagnosis
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 ml-6">
                            {record.diagnosis}
                          </p>
                        </div>

                        {/* Treatment */}
                        {record.treatment && (
                          <div className="mb-2">
                            <div className="flex items-center gap-2 mb-1">
                              <DocumentTextIcon className="h-4 w-4 text-blue-500" />
                              <span className="text-xs font-medium text-gray-700">
                                Treatment
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 ml-6 line-clamp-2">
                              {record.treatment}
                            </p>
                          </div>
                        )}

                        {/* Notes preview */}
                        {record.notes && (
                          <div className="text-xs text-gray-500 ml-6 italic line-clamp-1">
                            Note: {record.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add new record button */}
              <div className="mt-6 text-center">
                <button
                  onClick={handleAddRecord}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add New Medical Record
                </button>
              </div>
            </>
          )}
        </div>

        {/* Record Detail Modal */}
        {selectedRecord && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-gray-900">
                    Medical Record Details
                  </h4>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Visit Date
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(selectedRecord.visit_date)}
                    </p>
                  </div>

                  {selectedRecord.doctor_name && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Doctor
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        Dr. {selectedRecord.doctor_name}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Diagnosis
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedRecord.diagnosis}
                    </p>
                  </div>

                  {selectedRecord.treatment && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Treatment
                      </label>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedRecord.treatment}
                      </p>
                    </div>
                  )}

                  {selectedRecord.notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Notes
                      </label>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedRecord.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientMedicalHistory;
