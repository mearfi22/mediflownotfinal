import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  CheckIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { queueApi, patientsApi, preRegistrationApi, reportsApi } from "../services/api";
import { QueueStatistics, Patient, PreRegistration, Queue } from "../types";
import { useAuth } from "../contexts/AuthContext";
import QueueTicketPrint from "../components/QueueTicketPrint";
import ConfirmDialog from "../components/ConfirmDialog";
import AlertDialog from "../components/AlertDialog";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isDoctorView = user?.role === 'doctor' || (user?.doctor_id !== undefined && user?.doctor_id !== null);
  
  const [stats, setStats] = useState<QueueStatistics | null>(null);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [myQueue, setMyQueue] = useState<Queue[]>([]);
  const [pendingPreRegistrations, setPendingPreRegistrations] = useState<
    PreRegistration[]
  >([]);
  const [selectedPreReg, setSelectedPreReg] = useState<PreRegistration | null>(
    null
  );
  const [newQueue, setNewQueue] = useState<Queue | null>(null);
  const [rejectConfirm, setRejectConfirm] = useState<{ show: boolean; preRegId: number | null }>({ show: false, preRegId: null });
  const [topDoctorsWeekly, setTopDoctorsWeekly] = useState<any[]>([]);
  const [topDoctorsMonthly, setTopDoctorsMonthly] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    fetchDashboardData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [selectedDate, isDoctorView]);

  // Handle navigation from notification
  useEffect(() => {
    if (location.state?.openPreRegistration) {
      const preRegId = location.state.openPreRegistration;
      // Find and open the pre-registration
      const preReg = pendingPreRegistrations.find(p => p.id === preRegId);
      if (preReg) {
        handleViewPreReg(preReg);
      } else {
        // If not in current list, fetch it
        preRegistrationApi.getById(preRegId)
          .then(response => {
            handleViewPreReg(response.data);
          })
          .catch(err => console.error("Error fetching pre-registration:", err));
      }
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, pendingPreRegistrations]);

  const fetchDashboardData = async () => {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      
      const promises = [
        queueApi.getStatistics(selectedDate),
        patientsApi.getAll(),
        preRegistrationApi.getAll(),
      ];

      // Only fetch top doctors for admin view
      if (!isDoctorView) {
        promises.push(
          reportsApi.getMedicalRecordsAnalytics(
            weekAgo.toISOString().split('T')[0],
            new Date().toISOString().split('T')[0]
          ),
          reportsApi.getMedicalRecordsAnalytics(
            monthAgo.toISOString().split('T')[0],
            new Date().toISOString().split('T')[0]
          )
        );
      } else {
        // Fetch doctor's queue
        promises.push(queueApi.getAll(selectedDate));
      }

      const results = await Promise.all(promises);
      const [statsData, patientsData, preRegData, ...extraData] = results;

      setStats(statsData.data);
      
      // Handle paginated response from Laravel
      const patients = Array.isArray(patientsData.data) 
        ? patientsData.data 
        : patientsData.data?.data || [];
      setRecentPatients(patients.slice(0, 5));
      
      // Pre-registrations API returns paginated data
      const preRegs = Array.isArray(preRegData.data)
        ? preRegData.data
        : preRegData.data?.data || [];
      
      if (isDoctorView) {
        // Filter pre-registrations for this doctor
        setPendingPreRegistrations(
          preRegs.filter((reg) => 
            reg.status === "pending" && reg.doctor_id === user?.doctor_id
          ).slice(0, 5)
        );
        
        // Set doctor's queue from extra data
        const queueData = extraData[0];
        const allQueue = queueData?.data || [];
        setMyQueue(allQueue.filter((q: Queue) => q.doctor_id === user?.doctor_id));
      } else {
        // Admin view - all pending pre-registrations
        setPendingPreRegistrations(
          preRegs.filter((reg) => reg.status === "pending").slice(0, 5)
        );
        
        // Set top doctors data
        const weeklyDoctors = extraData[0];
        const monthlyDoctors = extraData[1];
        setTopDoctorsWeekly(weeklyDoctors?.data.top_doctors?.slice(0, 5) || []);
        setTopDoctorsMonthly(monthlyDoctors?.data.top_doctors?.slice(0, 5) || []);
      }
      
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
      if (response.data.queue) {
        setNewQueue(response.data.queue);
      }
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error approving pre-registration:", error);
      alert("Failed to approve pre-registration");
    }
  };

  const handleRejectPreRegistration = (preRegId: number) => {
    setRejectConfirm({ show: true, preRegId });
  };

  const confirmReject = async () => {
    if (rejectConfirm.preRegId) {
      try {
        await preRegistrationApi.reject(rejectConfirm.preRegId);
        fetchDashboardData(); // Refresh data
      } catch (error) {
        console.error("Error rejecting pre-registration:", error);
        alert("Failed to reject pre-registration");
      }
    }
  };

  const handleViewPreReg = (preReg: PreRegistration) => {
    setSelectedPreReg(preReg);
  };

  const handleStatusChange = async (queueItem: Queue, status: Queue['status']) => {
    try {
      const updatedQueue = await queueApi.update(queueItem.id, { status });
      setMyQueue(
        myQueue.map((item) => (item.id === queueItem.id ? updatedQueue.data : item))
      );
      // Refresh stats
      fetchDashboardData();
    } catch (error) {
      console.error("Error updating queue status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-100 text-yellow-800";
      case "attending":
        return "bg-blue-100 text-blue-800";
      case "attended":
        return "bg-green-100 text-green-800";
      case "no_show":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      emergency: "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30",
      senior: "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30",
      pwd: "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/30",
      regular: "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md",
    };
    const labels = {
      emergency: "EMERGENCY",
      senior: "SENIOR",
      pwd: "PWD",
      regular: "REGULAR",
    };
    return (
      <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-2xl ${badges[priority as keyof typeof badges] || badges.regular}`}>
        {labels[priority as keyof typeof labels] || labels.regular}
      </span>
    );
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Patients Today",
      value: stats?.total_patients_today || 0,
      icon: UsersIcon,
      gradient: "from-secondary-500 to-secondary-600",
      bg: "bg-secondary-50",
      iconColor: "text-secondary-600",
    },
    {
      title: "Currently Serving",
      value: stats?.now_serving ? `#${stats.now_serving.queue_number}` : "None",
      icon: ClockIcon,
      gradient: "from-yellow-400 to-yellow-500",
      bg: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    {
      title: "Served Today",
      value: stats?.served || 0,
      icon: CheckCircleIcon,
      gradient: "from-green-500 to-green-600",
      bg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "No Show Today",
      value: stats?.no_show || 0,
      icon: XCircleIcon,
      gradient: "from-primary-500 to-primary-600",
      bg: "bg-primary-50",
      iconColor: "text-primary-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent">
            {isDoctorView ? "My Dashboard" : "Dashboard"}
          </h1>
          <p className="text-gray-600 mt-1.5 font-medium">
            {isDoctorView 
              ? `Welcome back, ${user?.name || 'Doctor'}` 
              : "Overview of hospital queue and patient management"}
          </p>
        </div>
        {isDoctorView && (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input"
          />
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, index) => (
          <div key={index} className="card-stat group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`p-4 rounded-2xl ${card.bg} group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className={`w-8 h-8 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Currently Serving */}
      {stats?.now_serving && (
        <div className="card bg-gradient-to-br from-yellow-50 via-yellow-50/50 to-orange-50/30 border-2 border-yellow-200">
          <div className="flex items-center mb-3">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-400/30">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 ml-4">
              Currently Serving
            </h3>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
            <div>
              <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Queue #{stats.now_serving.queue_number}
              </p>
              <p className="text-gray-900 font-semibold text-lg mt-1">
                {stats.now_serving.patient?.full_name}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {stats.now_serving.reason_for_visit}
              </p>
            </div>
            <Link to="/queue" className="btn btn-primary">
              Manage Queue
            </Link>
          </div>
        </div>
      )}

      {/* Doctor's Queue Management (Only for doctor view) */}
      {isDoctorView && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-bold text-gray-900">
              My Queue - {selectedDate}
            </h3>
          </div>
          {myQueue.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
              {myQueue.map((queueItem) => (
                <div
                  key={queueItem.id}
                  className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-5 border-2 border-gray-200 hover:border-secondary-300 hover:shadow-medium transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl px-4 py-3 shadow-lg shadow-secondary-500/30">
                        <div className="text-2xl font-bold text-white">
                          #{queueItem.queue_number}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">
                          {queueItem.patient?.full_name}
                        </div>
                        <div className="flex items-center space-x-2 mt-1.5">
                          <span className={`badge badge-${queueItem.status === 'waiting' ? 'warning' : queueItem.status === 'attending' ? 'info' : queueItem.status === 'attended' ? 'success' : 'danger'}`}>
                            {queueItem.status.charAt(0).toUpperCase() + queueItem.status.slice(1)}
                          </span>
                          {getPriorityBadge(queueItem.priority)}
                        </div>
                      </div>
                    </div>
                    {queueItem.estimated_wait_minutes !== null && 
                     queueItem.estimated_wait_minutes !== undefined && 
                     queueItem.status === 'waiting' && (
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl px-3 py-2 border-2 border-yellow-200">
                        <div className="text-xs text-yellow-600 font-semibold">Est. Wait</div>
                        <div className="text-lg font-bold text-yellow-700">
                          {queueItem.estimated_wait_minutes}m
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 mb-4 bg-gray-50 rounded-2xl p-3 border border-gray-200">
                    <strong className="text-gray-900">Reason:</strong> {queueItem.reason_for_visit}
                  </div>

                  <div className="flex justify-end items-center space-x-2 pt-4 border-t border-gray-200">
                    {queueItem.status === "waiting" && (
                      <button
                        onClick={() => handleStatusChange(queueItem, "attending")}
                        className="btn-secondary btn-sm inline-flex items-center"
                      >
                        <PlayIcon className="h-4 w-4 mr-1.5" />
                        Start
                      </button>
                    )}
                    {queueItem.status === "attending" && (
                      <button
                        onClick={() => handleStatusChange(queueItem, "attended")}
                        className="btn-success btn-sm inline-flex items-center"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">
                No patients in your queue for {selectedDate}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recent Patients */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            Recent Patients
          </h3>
          <Link
            to="/patients"
            className="text-primary-600 hover:text-primary-700 text-sm font-semibold inline-flex items-center"
          >
            View all →
          </Link>
        </div>

        {recentPatients.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-gray-200 mt-6">
            <table className="table-modern">
              <thead>
                <tr>
                  <th className="text-center">Name</th>
                  <th className="text-center">Age/Sex</th>
                  <th className="text-center">Contact</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="text-center">
                      <div className="font-semibold text-gray-900">
                        {patient.full_name}
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="text-gray-600">
                        {patient.age}/{patient.gender.charAt(0).toUpperCase()}
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="text-gray-600">
                        {patient.contact_number}
                      </div>
                    </td>
                    <td className="text-center">
                      <span className={`badge badge-${patient.status === "active" ? "success" : "danger"}`}>
                        {patient.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No patients found</p>
          </div>
        )}
      </div>

      {/* Pending Pre-registrations */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-bold text-gray-900">
              Pending Pre-registrations
            </h3>
            {pendingPreRegistrations.length > 0 && (
              <span className="badge badge-warning">
                {pendingPreRegistrations.length}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            <Link
              to="/pre-register"
              target="_blank"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Pre-registration form →
            </Link>
          </div>
        </div>

        {pendingPreRegistrations.length > 0 ? (
          <div className="space-y-4 mt-6">
            {pendingPreRegistrations.map((preReg) => (
              <div
                key={preReg.id}
                className="bg-gradient-to-br from-white to-blue-50/20 border-2 border-gray-200 rounded-2xl p-5 hover:border-secondary-300 hover:shadow-medium transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="font-bold text-gray-900 text-lg">
                        {preReg.last_name}, {preReg.first_name}{" "}
                        {preReg.middle_name || ""}
                      </h4>
                      <span className="badge badge-info">
                        New Registration
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 font-medium">Contact:</span>
                        <span className="font-semibold text-gray-900">
                          {preReg.contact_number}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 font-medium">Age/Sex:</span>
                        <span className="font-semibold text-gray-900">
                          {preReg.age}/{preReg.sex}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 font-medium">Civil Status:</span>
                        <span className="font-semibold text-gray-900">
                          {preReg.civil_status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 font-medium">Nationality:</span>
                        <span className="font-semibold text-gray-900">
                          {preReg.nationality}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 mb-3">
                      <span className="text-gray-600 text-sm font-medium">
                        Reason for Visit:
                      </span>
                      <p className="text-gray-900 font-semibold mt-1 line-clamp-2">
                        {preReg.reason_for_visit}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Submitted:{" "}
                        {new Date(preReg.created_at).toLocaleDateString()} at{" "}
                        {new Date(preReg.created_at).toLocaleTimeString()}
                      </span>
                      <button
                        onClick={() => setSelectedPreReg(preReg)}
                        className="text-primary-600 hover:text-primary-700 font-semibold"
                      >
                        View Full Details →
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleApprovePreRegistration(preReg.id)}
                      className="btn-success btn-sm min-h-[44px] touch-manipulation"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectPreRegistration(preReg.id)}
                      className="btn-danger btn-sm min-h-[44px] touch-manipulation"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 mt-6">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardDocumentListIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">
              No pending pre-registrations
            </p>
          </div>
        )}
      </div>

      {/* Top Doctors - Only for Admin View */}
      {!isDoctorView && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Doctors This Week */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-xl font-bold text-gray-900">
                Top Doctors This Week
              </h3>
            </div>
            {topDoctorsWeekly.length > 0 ? (
              <div className="space-y-3 mt-6">
                {topDoctorsWeekly.map((doctor, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-secondary-50/50 to-blue-50/30 rounded-xl border border-secondary-200 hover:shadow-medium transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg shadow-secondary-500/30">
                        <span className="text-base font-bold text-white">
                          #{index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-base">
                          {doctor.doctor_name}
                        </p>
                        <p className="text-xs text-gray-600 font-medium">
                          {doctor.visit_count} patients handled
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold bg-gradient-to-r from-secondary-600 to-secondary-700 bg-clip-text text-transparent">
                        {doctor.visit_count}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 mt-6">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No data available</p>
              </div>
            )}
          </div>

          {/* Top Doctors This Month */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-xl font-bold text-gray-900">
                Top Doctors This Month
              </h3>
            </div>
            {topDoctorsMonthly.length > 0 ? (
              <div className="space-y-3 mt-6">
                {topDoctorsMonthly.map((doctor, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/30 rounded-xl border border-green-200 hover:shadow-medium transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                        <span className="text-base font-bold text-white">
                          #{index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-base">
                          {doctor.doctor_name}
                        </p>
                        <p className="text-xs text-gray-600 font-medium">
                          {doctor.visit_count} patients handled
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                        {doctor.visit_count}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 mt-6">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No data available</p>
              </div>
            )}
          </div>
        </div>
      )}

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
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
                <div className="bg-gray-50 p-4 rounded-2xl">
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
                <div className="bg-gray-50 p-4 rounded-2xl">
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
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Medical Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">
                        Reason for Visit
                      </label>
                      <p className="font-semibold mt-1">
                        {selectedPreReg.reason_for_visit}
                      </p>
                    </div>
                    {selectedPreReg.priority && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Priority
                        </label>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedPreReg.priority === "emergency"
                              ? "bg-red-100 text-red-800"
                              : selectedPreReg.priority === "senior" || selectedPreReg.priority === "pwd"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {selectedPreReg.priority.toUpperCase()}
                        </span>
                      </div>
                    )}
                    {selectedPreReg.department && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Department
                        </label>
                        <p className="font-semibold">
                          {selectedPreReg.department.name}
                        </p>
                      </div>
                    )}
                    {selectedPreReg.doctor && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Assigned Doctor
                        </label>
                        <p className="font-semibold">
                          Dr. {selectedPreReg.doctor.full_name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submission Details */}
                <div className="bg-gray-50 p-4 rounded-2xl">
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
                    className="px-6 py-3 bg-red-100 text-red-800 rounded-2xl hover:bg-red-200 transition-colors font-medium min-h-[44px] touch-manipulation order-2 sm:order-1"
                  >
                    Reject Registration
                  </button>
                  <button
                    onClick={() => {
                      handleApprovePreRegistration(selectedPreReg.id);
                      setSelectedPreReg(null);
                    }}
                    className="px-6 py-3 bg-green-100 text-green-800 rounded-2xl hover:bg-green-200 transition-colors font-medium min-h-[44px] touch-manipulation order-1 sm:order-2"
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

      <ConfirmDialog
        isOpen={rejectConfirm.show}
        onClose={() => setRejectConfirm({ show: false, preRegId: null })}
        onConfirm={confirmReject}
        title="Reject Pre-registration"
        message="Are you sure you want to reject this pre-registration?"
        confirmText="Reject"
        type="danger"
      />
    </div>
  );
};

export default Dashboard;
