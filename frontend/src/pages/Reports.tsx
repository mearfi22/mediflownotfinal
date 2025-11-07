import React, { useState, useEffect } from "react";
import { reportsApi } from "../services/api";
import {
  DashboardStats,
  PatientAnalytics,
  QueueAnalytics,
  MedicalRecordsAnalytics,
  PreRegistrationAnalytics,
} from "../types";
import {
  ChartBarIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  QueueListIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

const Reports: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [patientAnalytics, setPatientAnalytics] =
    useState<PatientAnalytics | null>(null);
  const [queueAnalytics, setQueueAnalytics] = useState<QueueAnalytics | null>(
    null
  );
  const [medicalRecordsAnalytics, setMedicalRecordsAnalytics] =
    useState<MedicalRecordsAnalytics | null>(null);
  const [preRegistrationAnalytics, setPreRegistrationAnalytics] =
    useState<PreRegistrationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    fetchAllReports();
  }, [startDate, endDate]);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      const [dashboard, patients, queue, medicalRecords, preRegistration] =
        await Promise.all([
          reportsApi.getDashboard(startDate, endDate),
          reportsApi.getPatientAnalytics(startDate, endDate),
          reportsApi.getQueueAnalytics(startDate, endDate),
          reportsApi.getMedicalRecordsAnalytics(startDate, endDate),
          reportsApi.getPreRegistrationAnalytics(startDate, endDate),
        ]);

      setDashboardStats(dashboard);
      setPatientAnalytics(patients);
      setQueueAnalytics(queue);
      setMedicalRecordsAnalytics(medicalRecords);
      setPreRegistrationAnalytics(preRegistration);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (
    type: "patients" | "medical_records" | "queue"
  ) => {
    try {
      const exportData = await reportsApi.exportData(type, startDate, endDate);

      // Convert data to CSV
      const csvContent = convertToCSV(exportData.data);

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", exportData.filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data. Please try again.");
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(",");

    const csvRows = data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma or quote
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    );

    return [csvHeaders, ...csvRows].join("\n");
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const calculatePercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 text-lg">Loading reports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-600">
            Comprehensive insights and statistics for hospital operations
          </p>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "dashboard", name: "Dashboard", icon: ChartBarIcon },
            { id: "patients", name: "Patients", icon: UsersIcon },
            { id: "queue", name: "Queue", icon: QueueListIcon },
            {
              id: "medical-records",
              name: "Medical Records",
              icon: ClipboardDocumentListIcon,
            },
            {
              id: "pre-registration",
              name: "Pre-Registration",
              icon: DocumentTextIcon,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && dashboardStats && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total Patients
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatNumber(dashboardStats.total_patients)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClipboardDocumentListIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Medical Records
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatNumber(dashboardStats.total_medical_records)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <QueueListIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Queue Entries
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatNumber(dashboardStats.total_queue_entries)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Pending Pre-Reg
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatNumber(dashboardStats.pending_pre_registrations)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Period Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Period Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">New Patients</span>
                  <span className="font-medium">
                    {formatNumber(dashboardStats.period_stats.new_patients)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Medical Records</span>
                  <span className="font-medium">
                    {formatNumber(dashboardStats.period_stats.medical_records)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Queue Entries</span>
                  <span className="font-medium">
                    {formatNumber(dashboardStats.period_stats.queue_entries)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Approved Pre-Registrations
                  </span>
                  <span className="font-medium">
                    {formatNumber(
                      dashboardStats.period_stats.approved_pre_registrations
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Today's Queue Status
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Served</span>
                  <span className="font-medium text-green-600">
                    {formatNumber(dashboardStats.today_stats.queue_served)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Currently Serving</span>
                  <span className="font-medium text-blue-600">
                    {formatNumber(dashboardStats.today_stats.queue_serving)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Waiting</span>
                  <span className="font-medium text-yellow-600">
                    {formatNumber(dashboardStats.today_stats.queue_waiting)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Skipped</span>
                  <span className="font-medium text-red-600">
                    {formatNumber(dashboardStats.today_stats.queue_skipped)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patients Tab */}
      {activeTab === "patients" && patientAnalytics && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Patient Analytics
            </h2>
            <button
              onClick={() => handleExport("patients")}
              className="btn-primary flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gender Distribution */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Gender Distribution
              </h3>
              <div className="space-y-3">
                {patientAnalytics.gender_distribution.map((item) => (
                  <div
                    key={item.gender}
                    className="flex justify-between items-center"
                  >
                    <span className="capitalize text-gray-600">
                      {item.gender}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${calculatePercentage(
                              item.count,
                              patientAnalytics.gender_distribution.reduce(
                                (acc, curr) => acc + curr.count,
                                0
                              )
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="font-medium">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Age Distribution */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Age Distribution
              </h3>
              <div className="space-y-3">
                {patientAnalytics.age_distribution.map((item) => (
                  <div
                    key={item.age_group}
                    className="flex justify-between items-center"
                  >
                    <span className="text-gray-600">{item.age_group}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${calculatePercentage(
                              item.count,
                              patientAnalytics.age_distribution.reduce(
                                (acc, curr) => acc + curr.count,
                                0
                              )
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="font-medium">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Civil Status */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Civil Status Distribution
              </h3>
              <div className="space-y-3">
                {patientAnalytics.civil_status_distribution.map((item) => (
                  <div
                    key={item.civil_status}
                    className="flex justify-between items-center"
                  >
                    <span className="capitalize text-gray-600">
                      {item.civil_status}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{
                            width: `${calculatePercentage(
                              item.count,
                              patientAnalytics.civil_status_distribution.reduce(
                                (acc, curr) => acc + curr.count,
                                0
                              )
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="font-medium">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Registration Trends */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Registration Trends
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {patientAnalytics.registration_trends.map((item) => (
                  <div key={item.date} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    <span className="font-medium">
                      {item.count} registrations
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Queue Tab */}
      {activeTab === "queue" && queueAnalytics && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Queue Analytics
            </h2>
            <button
              onClick={() => handleExport("queue")}
              className="btn-primary flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Queue Status Distribution
              </h3>
              <div className="space-y-3">
                {queueAnalytics.status_distribution.map((item) => (
                  <div
                    key={item.status}
                    className="flex justify-between items-center"
                  >
                    <span className="capitalize text-gray-600">
                      {item.status}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            item.status === "served"
                              ? "bg-green-600"
                              : item.status === "waiting"
                              ? "bg-yellow-600"
                              : item.status === "serving"
                              ? "bg-blue-600"
                              : "bg-red-600"
                          }`}
                          style={{
                            width: `${calculatePercentage(
                              item.count,
                              queueAnalytics.status_distribution.reduce(
                                (acc, curr) => acc + curr.count,
                                0
                              )
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="font-medium">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Waiting Time Stats */}
            {queueAnalytics.waiting_time_stats && (
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Waiting Time Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Wait</span>
                    <span className="font-medium">
                      {Math.round(
                        queueAnalytics.waiting_time_stats.avg_wait_minutes || 0
                      )}{" "}
                      minutes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Minimum Wait</span>
                    <span className="font-medium text-green-600">
                      {queueAnalytics.waiting_time_stats.min_wait_minutes || 0}{" "}
                      minutes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Maximum Wait</span>
                    <span className="font-medium text-red-600">
                      {queueAnalytics.waiting_time_stats.max_wait_minutes || 0}{" "}
                      minutes
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Daily Trends */}
            <div className="card lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Daily Queue Trends
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {queueAnalytics.daily_trends.map((item) => (
                  <div key={item.date} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-4">
                      <span className="text-green-600">
                        {item.served} served
                      </span>
                      <span className="text-red-600">
                        {item.skipped} skipped
                      </span>
                      <span className="font-medium">{item.total} total</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medical Records Tab */}
      {activeTab === "medical-records" && medicalRecordsAnalytics && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Medical Records Analytics
            </h2>
            <button
              onClick={() => handleExport("medical_records")}
              className="btn-primary flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Diagnoses */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Most Common Diagnoses
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {medicalRecordsAnalytics.top_diagnoses.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-gray-600 text-sm truncate pr-2">
                      {item.diagnosis}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{
                            width: `${calculatePercentage(
                              item.diagnosis_count,
                              medicalRecordsAnalytics.top_diagnoses[0]
                                ?.diagnosis_count || 1
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="font-medium text-sm">
                        {item.diagnosis_count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnosis Categories */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Diagnosis Categories
              </h3>
              <div className="space-y-3">
                {medicalRecordsAnalytics.diagnosis_categories.map((item) => (
                  <div
                    key={item.category}
                    className="flex justify-between items-center"
                  >
                    <span className="text-gray-600 text-sm">
                      {item.category}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-teal-600 h-2 rounded-full"
                          style={{
                            width: `${calculatePercentage(
                              item.count,
                              medicalRecordsAnalytics.diagnosis_categories.reduce(
                                (acc, curr) => acc + curr.count,
                                0
                              )
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="font-medium">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Doctors */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Top Doctors by Visits
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {medicalRecordsAnalytics.top_doctors.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-gray-600">{item.doctor_name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${calculatePercentage(
                              item.visit_count,
                              medicalRecordsAnalytics.top_doctors[0]
                                ?.visit_count || 1
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="font-medium">{item.visit_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PDF Attachment Stats */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                PDF Attachment Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Records</span>
                  <span className="font-medium">
                    {formatNumber(
                      medicalRecordsAnalytics.pdf_attachment_stats.total_records
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">With PDF</span>
                  <span className="font-medium text-green-600">
                    {formatNumber(
                      medicalRecordsAnalytics.pdf_attachment_stats
                        .records_with_pdf
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Attachment Rate</span>
                  <span className="font-medium">
                    {
                      medicalRecordsAnalytics.pdf_attachment_stats
                        .pdf_attachment_rate
                    }
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Visit Trends */}
            <div className="card lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Visit Trends
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {medicalRecordsAnalytics.visit_trends.map((item) => (
                  <div key={item.date} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    <span className="font-medium">{item.count} visits</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pre-Registration Tab */}
      {activeTab === "pre-registration" && preRegistrationAnalytics && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Pre-Registration Analytics
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Status Distribution
              </h3>
              <div className="space-y-3">
                {preRegistrationAnalytics.status_distribution.map((item) => (
                  <div
                    key={item.status}
                    className="flex justify-between items-center"
                  >
                    <span className="capitalize text-gray-600">
                      {item.status}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            item.status === "approved"
                              ? "bg-green-600"
                              : item.status === "pending"
                              ? "bg-yellow-600"
                              : "bg-red-600"
                          }`}
                          style={{
                            width: `${calculatePercentage(
                              item.count,
                              preRegistrationAnalytics.status_distribution.reduce(
                                (acc, curr) => acc + curr.count,
                                0
                              )
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="font-medium">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversion Stats */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Conversion Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Submissions</span>
                  <span className="font-medium">
                    {formatNumber(
                      preRegistrationAnalytics.conversion_stats
                        .total_pre_registrations
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Approved</span>
                  <span className="font-medium text-green-600">
                    {formatNumber(
                      preRegistrationAnalytics.conversion_stats
                        .approved_pre_registrations
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Approval Rate</span>
                  <span className="font-medium">
                    {preRegistrationAnalytics.conversion_stats.approval_rate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Approval Trends */}
            <div className="card lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Approval Trends
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {preRegistrationAnalytics.approval_trends.map((item) => (
                  <div key={item.date} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-4">
                      <span className="text-green-600">
                        {item.approved} approved
                      </span>
                      <span className="text-red-600">
                        {item.rejected} rejected
                      </span>
                      <span className="font-medium">{item.total} total</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Buttons */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Data</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => handleExport("patients")}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Export Patients</span>
          </button>
          <button
            onClick={() => handleExport("medical_records")}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Export Medical Records</span>
          </button>
          <button
            onClick={() => handleExport("queue")}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Export Queue Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
