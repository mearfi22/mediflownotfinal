import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { medicalRecordsApi, patientsApi } from "../services/api";
import { MedicalRecord, Patient } from "../types";
import MedicalRecordModal from "../components/MedicalRecordModal";
import MedicalRecordPrint from "../components/MedicalRecordPrint";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
  DocumentIcon,
  UserIcon,
  DocumentArrowDownIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";

const MedicalRecords: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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
    searchParams.get('patient_id') ? Number(searchParams.get('patient_id')) : null
  );
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; record: MedicalRecord | null }>({ show: false, record: null });

  useEffect(() => {
    fetchRecords();
    fetchPatients();
  }, [selectedPatientId]); // Removed pagination.current_page to stop auto-refresh

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await medicalRecordsApi.getAll();
      // Ensure we have an array
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      
      // Filter by selected patient if applicable
      let filteredRecords = data;
      if (selectedPatientId) {
        filteredRecords = filteredRecords.filter(record => record.patient_id === selectedPatientId);
      } else {
        // Group by patient and get only the most recent record for each patient
        const latestRecordsByPatient = new Map<number, MedicalRecord>();
        
        filteredRecords.forEach(record => {
          const existingRecord = latestRecordsByPatient.get(record.patient_id);
          if (!existingRecord || new Date(record.updated_at) > new Date(existingRecord.updated_at)) {
            latestRecordsByPatient.set(record.patient_id, record);
          }
        });
        
        filteredRecords = Array.from(latestRecordsByPatient.values());
      }
      
      setRecords(filteredRecords);
      // Since there's no pagination, we'll set pagination to default values
      setPagination({
        current_page: 1,
        last_page: 1,
        total: filteredRecords.length,
      });
    } catch (error) {
      console.error("Error fetching medical records:", error);
      setRecords([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await patientsApi.getAll();
      // Ensure we have an array
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]); // Set empty array on error
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

  const handleDeleteRecord = (record: MedicalRecord) => {
    setDeleteConfirm({ show: true, record });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.record) {
      try {
        await medicalRecordsApi.delete(deleteConfirm.record.id);
        fetchRecords();
      } catch (error) {
        console.error("Error deleting medical record:", error);
        alert("Failed to delete medical record");
      }
    }
  };

  const handleSaveRecord = async (data: Partial<MedicalRecord>) => {
    try {
      // Always create a new record (even when "editing" - it creates a new visit entry)
      // This builds up the medical history instead of overwriting it
      await medicalRecordsApi.create(data);
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
          {selectedPatientId && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-2xl">
              <UserIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-900">
                Viewing records for: <strong>{getPatientName(selectedPatientId)}</strong>
              </span>
              <button
                onClick={() => {
                  setSelectedPatientId(null);
                  setSearchParams({});
                }}
                className="text-blue-600 hover:text-blue-900 text-sm underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>
        <button
          onClick={handleAddRecord}
          className="btn btn-primary flex items-center min-h-[48px] px-6"
        >
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
      <div className="card overflow-visible">
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
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Date Visited
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diagnosis
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.patient?.full_name ||
                              getPatientName(record.patient_id)}
                          </div>
                          {record.patient?.patient_uid && (
                            <div className="text-xs text-gray-500 font-mono">
                              ID: RMPH-{record.patient.patient_uid.substring(0, 8).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">
                          {formatDate(record.visit_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">
                          {record.updated_at ? formatDate(record.updated_at) : formatDate(record.visit_date)}
                        </div>
                        {record.updated_at && record.updated_at !== record.created_at && (
                          <div className="text-xs text-blue-600">
                            (Edited)
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {record.diagnosis}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">
                          {record.doctor_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {record.pdf_file_path ? (
                          <button
                            onClick={async () => {
                              try {
                                const response = await medicalRecordsApi.downloadPdf(record.id);
                                const blob = new Blob([response.data], { type: 'application/pdf' });
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `medical_record_${record.patient?.full_name}_${record.visit_date}.pdf`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);
                              } catch (error) {
                                console.error('Error downloading PDF:', error);
                                alert('Failed to download PDF. Please try again.');
                              }
                            }}
                            className="inline-flex items-center px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-2xl hover:bg-green-200 transition-colors"
                            title="Download PDF"
                          >
                            <DocumentCheckIcon className="h-4 w-4 mr-1.5" />
                            PDF Available
                          </button>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-500 rounded-2xl">
                            <DocumentIcon className="h-4 w-4 mr-1.5" />
                            No PDF
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <div className="flex space-x-2 justify-end">
                          <button
                            onClick={() => handleViewRecord(record)}
                            className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-2xl transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handlePrintRecord(record)}
                            className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-2xl transition-colors"
                            title="Print Record"
                          >
                            <PrinterIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEditRecord(record)}
                            className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-2xl transition-colors"
                            title="Edit Record"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-2xl transition-colors"
                            title="Delete Record"
                          >
                            <TrashIcon className="w-5 h-5" />
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
                    className="px-3 py-1 text-sm border rounded-2xl disabled:opacity-50"
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
                    className="px-3 py-1 text-sm border rounded-2xl disabled:opacity-50"
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
          existingRecords={records}
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

      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, record: null })}
        onConfirm={confirmDelete}
        title="Delete Medical Record"
        message="Are you sure you want to delete this medical record? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default MedicalRecords;
