import React, { useState, useEffect } from "react";
import { queueApi, reportsApi } from "../services/api";
import { Queue, MedicalRecordsAnalytics } from "../types";
import {
  UsersIcon,
  ClockIcon,
  PlayIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

const DoctorDashboard: React.FC = () => {
  const [myQueue, setMyQueue] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [analytics, setAnalytics] = useState<MedicalRecordsAnalytics | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // In a real implementation, we would fetch data specific to the logged-in doctor
      // For now, we'll simulate with general data
      const [queueRes, analyticsRes] = await Promise.all([
        queueApi.getAll(selectedDate),
        reportsApi.getMedicalRecordsAnalytics()
      ]);

      // Filter to show only queue items assigned to this doctor
      // In a real implementation, this would be done on the backend
      const doctorQueue = queueRes.data.filter((item: Queue) => item.doctor_id === 1); // Simulate filtering
      
      setMyQueue(doctorQueue);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (queueItem: Queue, status: Queue['status']) => {
    try {
      const updatedQueue = await queueApi.update(queueItem.id, { status });
      setMyQueue(
        myQueue.map((item) => (item.id === queueItem.id ? updatedQueue.data : item))
      );
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

  const formatTime = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-gray-600">Welcome back, Dr. John Smith</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <UsersIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                My Patients Today
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {myQueue.filter(q => q.status === "served").length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <ClockIcon className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                Waiting
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {myQueue.filter(q => q.status === "waiting").length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <PlayIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                Currently Serving
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {myQueue.filter(q => q.status === "serving").length > 0 
                  ? `#${myQueue.find(q => q.status === "serving")?.queue_number}` 
                  : "None"}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckIcon className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                Total Served
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {myQueue.filter(q => q.status === "served").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* My Queue Section */}
      <div className="card overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            My Queue
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Patients assigned to you today
          </p>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-500">Loading queue...</p>
          </div>
        ) : myQueue.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No patients assigned to you for {selectedDate}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden">
              <div className="space-y-4 p-4">
                {myQueue.map((queueItem) => (
                  <div
                    key={queueItem.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-xl font-bold text-gray-900">
                          #{queueItem.queue_number}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {queueItem.patient?.full_name}
                          </div>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              queueItem.status
                            )}`}
                          >
                            {queueItem.status.charAt(0).toUpperCase() +
                              queueItem.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-900 line-clamp-2">
                        {queueItem.reason_for_visit}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-3">
                      <div>
                        <span>Called:</span>
                        <p className="font-medium">
                          {formatTime(queueItem.called_at)}
                        </p>
                      </div>
                      <div>
                        <span>Served:</span>
                        <p className="font-medium">
                          {formatTime(queueItem.served_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      {queueItem.status === "waiting" && (
                        <button
                          onClick={() =>
                            handleStatusChange(queueItem, "serving")
                          }
                          className="btn-primary text-sm px-3 py-1"
                        >
                          Serve
                        </button>
                      )}
                      {queueItem.status === "serving" && (
                        <button
                          onClick={() =>
                            handleStatusChange(queueItem, "served")
                          }
                          className="btn-success text-sm px-3 py-1"
                        >
                          Mark Served
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Queue #
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Called At
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Served At
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {myQueue.map((queueItem) => (
                    <tr key={queueItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-lg font-bold text-gray-900">
                          #{queueItem.queue_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {queueItem.patient?.full_name}
                        </div>
                        {queueItem.patient?.patient_uid && (
                          <div className="text-xs text-gray-500">
                            UID: {queueItem.patient.patient_uid}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {queueItem.reason_for_visit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            queueItem.status
                          )}`}
                        >
                          {queueItem.status.charAt(0).toUpperCase() +
                            queueItem.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(queueItem.called_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(queueItem.served_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <div className="flex space-x-2">
                          {queueItem.status === "waiting" && (
                            <button
                              onClick={() =>
                                handleStatusChange(queueItem, "serving")
                              }
                              className="btn-primary text-sm px-3 py-1"
                            >
                              Serve
                            </button>
                          )}
                          {queueItem.status === "serving" && (
                            <button
                              onClick={() =>
                                handleStatusChange(queueItem, "served")
                              }
                              className="btn-success text-sm px-3 py-1"
                            >
                              Mark Served
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Analytics Section */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Diagnoses */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Top Diagnoses
            </h3>
            <div className="space-y-3">
              {analytics.top_diagnoses.slice(0, 5).map((item) => (
                <div
                  key={item.diagnosis}
                  className="flex justify-between items-center"
                >
                  <span className="text-gray-600">{item.diagnosis}</span>
                  <span className="font-medium">{item.diagnosis_count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Doctors */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Top Doctors
            </h3>
            <div className="space-y-3">
              {analytics.top_doctors.slice(0, 5).map((item) => (
                <div
                  key={item.doctor_name}
                  className="flex justify-between items-center"
                >
                  <span className="text-gray-600">{item.doctor_name}</span>
                  <span className="font-medium">{item.visit_count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
