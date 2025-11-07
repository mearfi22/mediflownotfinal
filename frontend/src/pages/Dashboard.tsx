import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { queueApi, patientApi, preRegistrationApi } from "../services/api";
import { QueueStatistics, Patient, PreRegistration, Queue } from "../types";
import QueueTicketPrint from "../components/QueueTicketPrint";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<QueueStatistics | null>(null);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [pendingPreRegistrations, setPendingPreRegistrations] = useState<
    PreRegistration[]
  >([]);
  const [selectedPreReg, setSelectedPreReg] = useState<PreRegistration | null>(
    null
  );
  const [newQueue, setNewQueue] = useState<Queue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, patientsData, preRegData] = await Promise.all([
        queueApi.getStatistics(),
        patientApi.getAll(1),
        preRegistrationApi.getAll(1),
      ]);

      setStats(statsData);
      setRecentPatients(patientsData.data.slice(0, 5));
      setPendingPreRegistrations(
        preRegData.data.filter((reg) => reg.status === "pending").slice(0, 5)
      );
      setError("");
    } catch (err: any) {
      setError("Failed to load dashboard data");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePreRegistration = async (preRegId: number) => {
    try {
      const response = await preRegistrationApi.approve(preRegId);
      // Automatically trigger print for the new queue ticket
      if (response.queue) {
        setNewQueue(response.queue);
      }
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error approving pre-registration:", error);
      alert("Failed to approve pre-registration");
    }
  };

  const handleRejectPreRegistration = async (preRegId: number) => {
    if (
      window.confirm("Are you sure you want to reject this pre-registration?")
    ) {
      try {
        await preRegistrationApi.reject(preRegId);
        fetchDashboardData(); // Refresh data
      } catch (error) {
        console.error("Error rejecting pre-registration:", error);
        alert("Failed to reject pre-registration");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Patients Today",
      value: stats?.total_patients_today || 0,
      icon: UsersIcon,
      color: "bg-blue-500",
    },
    {
      title: "Currently Serving",
      value: stats?.now_serving ? `#${stats.now_serving.queue_number}` : "None",
      icon: ClockIcon,
      color: "bg-yellow-500",
    },
    {
      title: "Served Today",
      value: stats?.served || 0,
      icon: CheckCircleIcon,
      color: "bg-green-500",
    },
    {
      title: "Skipped Today",
      value: stats?.skipped || 0,
      icon: XCircleIcon,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome to Roxas Memorial Provincial Hospital Management System
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Currently Serving */}
      {stats?.now_serving && (
        <div className="card bg-yellow-50 border-yellow-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Currently Serving
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                Queue #{stats.now_serving.queue_number}
              </p>
              <p className="text-gray-600">
                {stats.now_serving.patient?.full_name}
              </p>
              <p className="text-sm text-gray-500">
                {stats.now_serving.reason_for_visit}
              </p>
            </div>
            <Link to="/queue" className="btn btn-primary">
              Manage Queue
            </Link>
          </div>
        </div>
      )}

      {/* Recent Patients */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Patients
          </h3>
          <Link
            to="/patients"
            className="text-primary hover:text-primary-dark text-sm font-medium"
          >
            View all →
          </Link>
        </div>

        {recentPatients.length > 0 ? (
          <div className="overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age/Sex
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {patient.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {patient.age}/{patient.gender.charAt(0).toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {patient.contact_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          patient.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {patient.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No patients found</p>
        )}
      </div>

      {/* Pending Pre-registrations */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Pending Pre-registrations
            {pendingPreRegistrations.length > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {pendingPreRegistrations.length} pending
              </span>
            )}
          </h3>
          <div className="text-sm text-gray-500">
            <Link
              to="/pre-register"
              target="_blank"
              className="text-primary hover:text-primary-dark"
            >
              Pre-registration form →
            </Link>
          </div>
        </div>

        {pendingPreRegistrations.length > 0 ? (
          <div className="space-y-3">
            {pendingPreRegistrations.map((preReg) => (
              <div
                key={preReg.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {preReg.last_name}, {preReg.first_name}{" "}
                        {preReg.middle_name || ""}
                      </h4>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        New Registration
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Contact:</span>
                        <span className="ml-1 font-medium">
                          {preReg.contact_number}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Age/Sex:</span>
                        <span className="ml-1 font-medium">
                          {preReg.age}/{preReg.sex}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Civil Status:</span>
                        <span className="ml-1 font-medium">
                          {preReg.civil_status}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Nationality:</span>
                        <span className="ml-1 font-medium">
                          {preReg.nationality}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className="text-gray-500 text-sm">
                        Reason for Visit:
                      </span>
                      <p className="text-gray-900 font-medium mt-1 line-clamp-2">
                        {preReg.reason_for_visit}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                      <span>
                        Submitted:{" "}
                        {new Date(preReg.created_at).toLocaleDateString()} at{" "}
                        {new Date(preReg.created_at).toLocaleTimeString()}
                      </span>
                      <button
                        onClick={() => setSelectedPreReg(preReg)}
                        className="text-primary hover:text-primary-dark font-medium"
                      >
                        View Full Details →
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleApprovePreRegistration(preReg.id)}
                      className="px-4 py-3 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors font-medium min-h-[44px] touch-manipulation"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleRejectPreRegistration(preReg.id)}
                      className="px-4 py-3 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors font-medium min-h-[44px] touch-manipulation"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No pending pre-registrations
          </p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/patients"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="text-center">
            <UsersIcon className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              Manage Patients
            </h3>
            <p className="text-gray-600">
              Add, edit, or view patient information
            </p>
          </div>
        </Link>

        <Link
          to="/queue"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="text-center">
            <ClockIcon className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              Queue Management
            </h3>
            <p className="text-gray-600">
              Manage patient queue and appointments
            </p>
          </div>
        </Link>

        <Link
          to="/medical-records"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="text-center">
            <CheckCircleIcon className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              Medical Records
            </h3>
            <p className="text-gray-600">
              View and manage patient medical history
            </p>
          </div>
        </Link>
      </div>

      {/* Pre-registration Detail Modal */}
      {selectedPreReg && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Pre-registration Details
                </h2>
                <button
                  onClick={() => setSelectedPreReg(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Patient Information */}
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Last Name
                      </label>
                      <p className="font-semibold">
                        {selectedPreReg.last_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        First Name
                      </label>
                      <p className="font-semibold">
                        {selectedPreReg.first_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Middle Name
                      </label>
                      <p className="font-semibold">
                        {selectedPreReg.middle_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Date of Birth
                      </label>
                      <p className="font-semibold">
                        {new Date(
                          selectedPreReg.date_of_birth
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Age
                      </label>
                      <p className="font-semibold">{selectedPreReg.age}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Sex
                      </label>
                      <p className="font-semibold capitalize">
                        {selectedPreReg.sex}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Birthplace
                      </label>
                      <p className="font-semibold">
                        {selectedPreReg.birthplace}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Nationality
                      </label>
                      <p className="font-semibold">
                        {selectedPreReg.nationality}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Civil Status
                      </label>
                      <p className="font-semibold">
                        {selectedPreReg.civil_status}
                      </p>
                    </div>
                    {selectedPreReg.spouse_name && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Spouse Name
                        </label>
                        <p className="font-semibold">
                          {selectedPreReg.spouse_name}
                        </p>
                      </div>
                    )}
                    {selectedPreReg.religion && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Religion
                        </label>
                        <p className="font-semibold">
                          {selectedPreReg.religion}
                        </p>
                      </div>
                    )}
                    {selectedPreReg.occupation && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Occupation
                        </label>
                        <p className="font-semibold">
                          {selectedPreReg.occupation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Contact Number
                      </label>
                      <p className="font-semibold">
                        {selectedPreReg.contact_number}
                      </p>
                    </div>
                    {selectedPreReg.philhealth_id && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          PhilHealth ID
                        </label>
                        <p className="font-semibold">
                          {selectedPreReg.philhealth_id}
                        </p>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">
                        Complete Address
                      </label>
                      <p className="font-semibold">{selectedPreReg.address}</p>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Medical Information
                  </h3>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Reason for Visit
                    </label>
                    <p className="font-semibold mt-1">
                      {selectedPreReg.reason_for_visit}
                    </p>
                  </div>
                </div>

                {/* Submission Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Submission Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Status
                      </label>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedPreReg.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : selectedPreReg.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedPreReg.status.charAt(0).toUpperCase() +
                          selectedPreReg.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Submitted
                      </label>
                      <p className="font-semibold">
                        {new Date(
                          selectedPreReg.created_at
                        ).toLocaleDateString()}{" "}
                        at{" "}
                        {new Date(
                          selectedPreReg.created_at
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              {selectedPreReg.status === "pending" && (
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6 pt-4 border-t">
                  <button
                    onClick={() => {
                      handleRejectPreRegistration(selectedPreReg.id);
                      setSelectedPreReg(null);
                    }}
                    className="px-6 py-3 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors font-medium min-h-[44px] touch-manipulation order-2 sm:order-1"
                  >
                    Reject Registration
                  </button>
                  <button
                    onClick={() => {
                      handleApprovePreRegistration(selectedPreReg.id);
                      setSelectedPreReg(null);
                    }}
                    className="px-6 py-3 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors font-medium min-h-[44px] touch-manipulation order-1 sm:order-2"
                  >
                    Approve & Create Patient
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auto-Print Queue Ticket Modal */}
      {newQueue && (
        <QueueTicketPrint queue={newQueue} onClose={() => setNewQueue(null)} />
      )}
    </div>
  );
};

export default Dashboard;
