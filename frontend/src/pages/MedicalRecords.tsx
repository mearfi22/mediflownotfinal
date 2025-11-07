import React, { useState, useEffect } from "react";
import { medicalRecordApi, patientApi } from "../services/api";
import { MedicalRecord, Patient, PaginatedResponse } from "../types";
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import MedicalRecordModal from "../components/MedicalRecordModal.tsx";
import MedicalRecordPrint from "../components/MedicalRecordPrint";

const MedicalRecords: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [printRecord, setPrintRecord] = useState<MedicalRecord | null>(null);
  const [searchPatient, setSearchPatient] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  );

  useEffect(() => {
    fetchRecords();
    fetchPatients();
  }, [pagination.current_page, selectedPatientId]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response: PaginatedResponse<MedicalRecord> =
        await medicalRecordApi.getAll(
          pagination.current_page,
          selectedPatientId || undefined
        );
      setRecords(response.data);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        total: response.total,
      });
    } catch (error) {
      console.error("Error fetching medical records:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await patientApi.getAll(1); // Get first page of patients
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const handleAddRecord = () => {
    setSelectedRecord(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleEditRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleViewRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  const handlePrintRecord = (record: MedicalRecord) => {
    setPrintRecord(record);
    setShowPrint(true);
  };

  const handleDeleteRecord = async (record: MedicalRecord) => {
    if (
      window.confirm("Are you sure you want to delete this medical record?")
    ) {
      try {
        await medicalRecordApi.delete(record.id);
        fetchRecords();
      } catch (error) {
        console.error("Error deleting medical record:", error);
        alert("Failed to delete medical record");
      }
    }
  };

  const handleSaveRecord = async (data: FormData | Partial<MedicalRecord>) => {
    try {
      if (selectedRecord) {
        await medicalRecordApi.update(selectedRecord.id, data);
      } else {
        await medicalRecordApi.create(data as any);
      }
      setIsModalOpen(false);
      fetchRecords();
    } catch (error) {
      console.error("Error saving medical record:", error);
      throw error;
    }
  };

  const filteredPatients = patients.filter((patient) =>
    patient.full_name.toLowerCase().includes(searchPatient.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPatientName = (patientId: number) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.full_name : "Unknown Patient";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-gray-600">
            View and manage patient medical history
          </p>
        </div>
        <button
          onClick={handleAddRecord}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Medical Record</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <label
              htmlFor="patient-search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search Patient
            </label>
            <div className="relative">
              <input
                id="patient-search"
                type="text"
                placeholder="Type patient name..."
                value={searchPatient}
                onChange={(e) => setSearchPatient(e.target.value)}
                className="input pl-10"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
          <div className="flex-1">
            <label
              htmlFor="patient-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filter by Patient
            </label>
            <select
              id="patient-filter"
              value={selectedPatientId || ""}
              onChange={(e) =>
                setSelectedPatientId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="input"
            >
              <option value="">All Patients</option>
              {filteredPatients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Medical Records Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-500">Loading medical records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No medical records found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visit Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diagnosis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PDF
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {record.patient?.full_name ||
                            getPatientName(record.patient_id)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(record.visit_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {record.diagnosis}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {record.doctor_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.pdf_file_path ? (
                          <button
                            onClick={() => {
                              const url = `http://localhost:8000/api/medical-records/${record.id}/download-pdf`;
                              window.open(url, "_blank");
                            }}
                            className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                            title="Download PDF"
                          >
                            <DocumentIcon className="h-5 w-5" />
                            <span className="text-xs">PDF</span>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">No PDF</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewRecord(record)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handlePrintRecord(record)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Print Record"
                          >
                            <PrinterIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEditRecord(record)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Record"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Record"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {records.length} of {pagination.total} records
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        current_page: prev.current_page - 1,
                      }))
                    }
                    disabled={pagination.current_page === 1}
                    className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {pagination.current_page} of {pagination.last_page}
                  </span>
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        current_page: prev.current_page + 1,
                      }))
                    }
                    disabled={pagination.current_page === pagination.last_page}
                    className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Medical Record Modal */}
      {isModalOpen && (
        <MedicalRecordModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveRecord}
          record={selectedRecord}
          patients={patients}
          isViewMode={isViewMode}
        />
      )}

      {/* Print Modal */}
      {showPrint && printRecord && (
        <MedicalRecordPrint
          record={printRecord}
          patient={patients.find((p) => p.id === printRecord.patient_id)!}
          onClose={() => {
            setShowPrint(false);
            setPrintRecord(null);
          }}
        />
      )}
    </div>
  );
};

export default MedicalRecords;
