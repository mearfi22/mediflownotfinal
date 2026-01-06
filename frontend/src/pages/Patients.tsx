import React, { useState, useEffect, useMemo } from "react";
import { patientsApi, queueApi } from "../services/api";
import { Patient, Doctor } from "../types";
import PatientModal from "../components/PatientModal";
import PatientMedicalHistory from "../components/PatientMedicalHistory";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  FunnelIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [medicalHistoryPatient, setMedicalHistoryPatient] = useState<Patient | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; patientId: number | null }>({ show: false, patientId: null });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [ageRangeFilter, setAgeRangeFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, [currentPage]);

  const fetchDoctors = async () => {
    try {
      const response = await queueApi.getDoctors();
      setDoctors(response.data);
    } catch (err) {
      console.error("Error fetching doctors:", err);
    }
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await patientsApi.getAll();
      // Handle both array and paginated responses
      const patientsData = Array.isArray(response.data) 
        ? response.data 
        : response.data.data || [];
      setPatients(patientsData);
      // Since there's no pagination, we'll set totalPages to 1
      setTotalPages(1);
      setError("");
    } catch (err: any) {
      setError("Failed to load patients");
      console.error("Patients error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = () => {
    setEditingPatient(null);
    setShowModal(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setShowModal(true);
  };

  const handleViewPatient = (patient: Patient) => {
    setViewingPatient(patient);
  };

  const handleDeletePatient = (patientId: number) => {
    setDeleteConfirm({ show: true, patientId });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.patientId) {
      try {
        await patientsApi.delete(deleteConfirm.patientId);
        fetchPatients();
      } catch (err: any) {
        alert("Failed to delete patient");
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingPatient(null);
    fetchPatients();
  };

  // Filter and search logic
  const filteredPatients = useMemo(() => {
    // Ensure patients is an array
    if (!Array.isArray(patients)) {
      return [];
    }
    
    // Sort patients by creation date (most recent first)
    const sortedPatients = [...patients].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return sortedPatients.filter((patient) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        patient.full_name.toLowerCase().includes(searchLower) ||
        patient.contact_number.toLowerCase().includes(searchLower) ||
        (patient.philhealth_id &&
          patient.philhealth_id.toLowerCase().includes(searchLower)) ||
        (patient.reason_for_visit &&
          patient.reason_for_visit.toLowerCase().includes(searchLower));

      // Gender filter
      const matchesGender = !genderFilter || patient.gender === genderFilter;

      // Age range filter
      const age = parseInt(patient.age);
      let matchesAgeRange = true;
      if (ageRangeFilter) {
        switch (ageRangeFilter) {
          case "0-18":
            matchesAgeRange = age >= 0 && age <= 18;
            break;
          case "19-35":
            matchesAgeRange = age >= 19 && age <= 35;
            break;
          case "36-60":
            matchesAgeRange = age >= 36 && age <= 60;
            break;
          case "60+":
            matchesAgeRange = age > 60;
            break;
          default:
            matchesAgeRange = true;
        }
      }

      return matchesSearch && matchesGender && matchesAgeRange;
    });
  }, [patients, searchTerm, genderFilter, ageRangeFilter]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setGenderFilter("");
    setAgeRangeFilter("");
    setDoctorFilter("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600">
            Manage patient information and records
          </p>
        </div>
        <button
          onClick={handleAddPatient}
          className="btn btn-primary flex items-center min-h-[48px] px-6 w-full sm:w-auto justify-center"
        >
          Add Patient
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="card">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 w-full sm:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, contact, PhilHealth ID, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-2xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary text-sm sm:text-base"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn flex items-center flex-1 sm:flex-initial justify-center sm:justify-start ${
                  showFilters ? "btn-primary" : "btn-secondary"
                }`}
              >
                <FunnelIcon className="w-4 h-4 mr-2" />
                Filters
                {(genderFilter || ageRangeFilter || doctorFilter) && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-2 w-2"></span>
                )}
              </button>

              {(searchTerm || genderFilter || ageRangeFilter || doctorFilter) && (
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary text-sm whitespace-nowrap"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl">
              {/* Gender Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  <option value="">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Age Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age Range
                </label>
                <select
                  value={ageRangeFilter}
                  onChange={(e) => setAgeRangeFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  <option value="">All Ages</option>
                  <option value="0-18">0-18 years</option>
                  <option value="19-35">19-35 years</option>
                  <option value="36-60">36-60 years</option>
                  <option value="60+">60+ years</option>
                </select>
              </div>

              {/* Doctor Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor
                </label>
                <select
                  value={doctorFilter}
                  onChange={(e) => setDoctorFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  <option value="">All Doctors</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredPatients.length} of {patients.length} patients
              {(searchTerm || genderFilter || ageRangeFilter || doctorFilter) && " (filtered)"}
            </span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Patients Table/Cards */}
      <div className="card">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <EyeIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {patients.length === 0
                ? "No patients found"
                : "No patients match your search criteria"}
            </h3>
            <p className="text-gray-500">
              {patients.length === 0
                ? "Add your first patient to get started."
                : "Try adjusting your search terms or filters."}
            </p>
            {(searchTerm || genderFilter || ageRangeFilter) && (
              <button onClick={clearFilters} className="mt-4 btn btn-secondary">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden">
              <div className="space-y-4">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="bg-gray-50 rounded-2xl p-4 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold bg-primary text-white">
                            {patient.patient_uid ? `RMPH-${patient.patient_uid.substring(0, 8).toUpperCase()}` : 'N/A'}
                          </span>
                          <span className="text-xs text-gray-500">#{patient.id}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {patient.full_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {patient.philhealth_id || "No PhilHealth"}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => setMedicalHistoryPatient(patient)}
                          className="p-3 text-green-600 hover:text-green-900 hover:bg-white rounded-full min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center relative"
                          title="Medical History"
                        >
                          <DocumentTextIcon className="w-5 h-5" />
                          {patient.medical_records_count > 0 && (
                            <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {patient.medical_records_count}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => handleViewPatient(patient)}
                          className="p-3 text-primary hover:text-primary-dark hover:bg-white rounded-full min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center"
                          title="View Details"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditPatient(patient)}
                          className="p-3 text-blue-600 hover:text-blue-900 hover:bg-white rounded-full min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center"
                          title="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeletePatient(patient.id)}
                          className="p-3 text-red-600 hover:text-red-900 hover:bg-white rounded-full min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center"
                          title="Delete"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Age/Sex:</span>
                        <p className="font-medium">
                          {patient.age}/{patient.gender.charAt(0).toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Contact:</span>
                        <p className="font-medium">{patient.contact_number}</p>
                      </div>
                      {patient.department && (
                        <div>
                          <span className="text-gray-500">Department:</span>
                          <p className="font-medium">{patient.department.name}</p>
                        </div>
                      )}
                      {patient.doctor && (
                        <div>
                          <span className="text-gray-500">Doctor:</span>
                          <p className="font-medium">{patient.doctor.full_name}</p>
                        </div>
                      )}
                    </div>
                    {patient.reason_for_visit && (
                      <div className="mt-3">
                        <span className="text-gray-500 text-sm">Reason:</span>
                        <p className="text-sm text-gray-900 mt-1">
                          {patient.reason_for_visit}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-visible">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient ID
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age/Sex
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-mono font-semibold text-primary">
                          {patient.patient_uid ? `RMPH-${patient.patient_uid.substring(0, 8).toUpperCase()}` : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          #{patient.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {patient.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {patient.philhealth_id || "No PhilHealth"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">
                          {patient.age}/{patient.gender.charAt(0).toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">
                          {patient.contact_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">
                          {patient.department?.name || "N/A"}
                        </div>
                        {patient.doctor && (
                          <div className="text-xs text-gray-500">
                            {patient.doctor.full_name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {patient.reason_for_visit || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <div className="flex space-x-2 justify-end">
                          <button
                            onClick={() => setMedicalHistoryPatient(patient)}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-2xl transition-colors relative"
                            title="Medical History"
                          >
                            <DocumentTextIcon className="w-5 h-5" />
                            {patient.medical_records_count > 0 && (
                              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-bold">
                                {patient.medical_records_count}
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => handleViewPatient(patient)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-2xl transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEditPatient(patient)}
                            className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-2xl transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeletePatient(patient.id)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-2xl transition-colors"
                            title="Delete"
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
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Patient Modal */}
      {showModal && (
        <PatientModal patient={editingPatient} onClose={handleModalClose} />
      )}

      {/* View Patient Modal */}
      {viewingPatient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-4 sm:pt-10 px-4">
          <div className="relative p-5 border w-full max-w-4xl shadow-lg rounded-2xl bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Patient Details
                </h3>
                <button
                  onClick={() => setViewingPatient(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Full Name
                    </p>
                    <p className="text-sm text-gray-900">
                      {viewingPatient.full_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Date of Birth
                    </p>
                    <p className="text-sm text-gray-900">
                      {new Date(
                        viewingPatient.date_of_birth
                      ).toLocaleDateString()}
                      ({viewingPatient.age} years old)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Gender</p>
                    <p className="text-sm text-gray-900 capitalize">
                      {viewingPatient.gender}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Birthplace
                    </p>
                    <p className="text-sm text-gray-900">
                      {viewingPatient.birthplace}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Nationality
                    </p>
                    <p className="text-sm text-gray-900">
                      {viewingPatient.nationality}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Civil Status
                    </p>
                    <p className="text-sm text-gray-900">
                      {viewingPatient.civil_status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Spouse Name
                    </p>
                    <p className="text-sm text-gray-900">
                      {viewingPatient.spouse_name || "Not applicable"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Religion
                    </p>
                    <p className="text-sm text-gray-900">
                      {viewingPatient.religion || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Occupation
                    </p>
                    <p className="text-sm text-gray-900">
                      {viewingPatient.occupation || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Contact Number
                    </p>
                    <p className="text-sm text-gray-900">
                      {viewingPatient.contact_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      PhilHealth ID
                    </p>
                    <p className="text-sm text-gray-900">
                      {viewingPatient.philhealth_id || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        viewingPatient.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {viewingPatient.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Priority
                    </p>
                    <p className="text-sm text-gray-900 capitalize">
                      {viewingPatient.priority === "pwd" ? "PWD" : viewingPatient.priority || "Regular"}
                    </p>
                  </div>
                  {viewingPatient.department && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Department
                      </p>
                      <p className="text-sm text-gray-900">
                        {viewingPatient.department.name}
                      </p>
                    </div>
                  )}
                  {viewingPatient.doctor && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Doctor
                      </p>
                      <p className="text-sm text-gray-900">
                        {viewingPatient.doctor.full_name}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Complete Address
                  </p>
                  <p className="text-sm text-gray-900">
                    {viewingPatient.address}
                  </p>
                </div>

                {viewingPatient.reason_for_visit && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Reason for Visit
                    </p>
                    <p className="text-sm text-gray-900">
                      {viewingPatient.reason_for_visit}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medical History Modal */}
      {medicalHistoryPatient && (
        <PatientMedicalHistory
          patient={medicalHistoryPatient}
          onClose={() => setMedicalHistoryPatient(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, patientId: null })}
        onConfirm={confirmDelete}
        title="Delete Patient"
        message="Are you sure you want to delete this patient? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Patients;
