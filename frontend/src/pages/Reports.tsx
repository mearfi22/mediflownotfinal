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
  UsersIcon,
  ClipboardDocumentListIcon,
  QueueListIcon,
  DocumentTextIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const Reports: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [patientAnalytics, setPatientAnalytics] = useState<PatientAnalytics | null>(null);
  const [queueAnalytics, setQueueAnalytics] = useState<QueueAnalytics | null>(null);
  const [medicalRecordsAnalytics, setMedicalRecordsAnalytics] = useState<MedicalRecordsAnalytics | null>(null);
  const [preRegistrationAnalytics, setPreRegistrationAnalytics] = useState<PreRegistrationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetchAllReports();
  }, [startDate, endDate]);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      const [dashboard, patients, queue, medicalRecords, preRegistration] = await Promise.all([
        reportsApi.getDashboard(startDate, endDate),
        reportsApi.getPatientAnalytics(startDate, endDate),
        reportsApi.getQueueAnalytics(startDate, endDate),
        reportsApi.getMedicalRecordsAnalytics(startDate, endDate),
        reportsApi.getPreRegistrationAnalytics(startDate, endDate),
      ]);

      setDashboardStats(dashboard.data);
      setPatientAnalytics(patients.data);
      setQueueAnalytics(queue.data);
      setMedicalRecordsAnalytics(medicalRecords.data);
      setPreRegistrationAnalytics(preRegistration.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = {
    primary: "#0EA5E9",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    purple: "#8B5CF6",
    pink: "#EC4899",
    indigo: "#6366F1",
    teal: "#14B8A6",
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trend === "up" ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {trendValue}
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-full bg-gradient-to-br ${color}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Prepare queue status distribution data
  const queueStatusData = queueAnalytics
    ? [
        { name: "Attended", value: queueAnalytics.total_attended, color: COLORS.success },
        { name: "Waiting", value: queueAnalytics.total_waiting, color: COLORS.warning },
        { name: "Skipped", value: queueAnalytics.total_skipped, color: COLORS.danger },
      ]
    : [];

  // Prepare patient gender distribution
  const patientGenderData = patientAnalytics
    ? [
        { name: "Male", value: patientAnalytics.total_male, color: COLORS.primary },
        { name: "Female", value: patientAnalytics.total_female, color: COLORS.pink },
      ]
    : [];

  // Prepare pre-registration status data
  const preRegStatusData = preRegistrationAnalytics
    ? [
        { name: "Pending", value: preRegistrationAnalytics.pending, color: COLORS.warning },
        { name: "Approved", value: preRegistrationAnalytics.approved, color: COLORS.success },
        { name: "Rejected", value: preRegistrationAnalytics.rejected, color: COLORS.danger },
        { name: "No Show", value: preRegistrationAnalytics.no_show, color: COLORS.purple },
      ]
    : [];

  // Mock daily trend data (you can replace with actual daily data from backend)
  const dailyTrendData = [
    { date: "Mon", patients: 12, queue: 15, records: 10 },
    { date: "Tue", patients: 19, queue: 22, records: 18 },
    { date: "Wed", patients: 15, queue: 18, records: 14 },
    { date: "Thu", patients: 22, queue: 25, records: 20 },
    { date: "Fri", patients: 28, queue: 30, records: 25 },
    { date: "Sat", patients: 18, queue: 20, records: 16 },
    { date: "Sun", patients: 10, queue: 12, records: 8 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive overview of hospital operations</p>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border-0 focus:ring-0 text-sm"
          />
          <span className="text-gray-400">—</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border-0 focus:ring-0 text-sm"
          />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={dashboardStats?.total_patients || 0}
          icon={UsersIcon}
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Queue Today"
          value={queueAnalytics?.total_queue || 0}
          icon={QueueListIcon}
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Medical Records"
          value={medicalRecordsAnalytics?.total_records || 0}
          icon={ClipboardDocumentListIcon}
          color="from-green-500 to-green-600"
        />
        <StatCard
          title="Pre-Registrations"
          value={preRegistrationAnalytics?.total || 0}
          icon={DocumentTextIcon}
          color="from-orange-500 to-orange-600"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyTrendData}>
              <defs>
                <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorQueue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="patients"
                stroke={COLORS.primary}
                fillOpacity={1}
                fill="url(#colorPatients)"
                name="Patients"
              />
              <Area
                type="monotone"
                dataKey="queue"
                stroke={COLORS.purple}
                fillOpacity={1}
                fill="url(#colorQueue)"
                name="Queue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Queue Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Queue Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={queueStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {queueStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Gender Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Demographics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={patientGenderData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {patientGenderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pre-Registration Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pre-Registration Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={preRegStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {preRegStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Patient Metrics */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center mb-4">
            <UsersIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-blue-900">Patient Metrics</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Total Patients</span>
              <span className="font-semibold text-blue-900">{patientAnalytics?.total_patients || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Male</span>
              <span className="font-semibold text-blue-900">{patientAnalytics?.total_male || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Female</span>
              <span className="font-semibold text-blue-900">{patientAnalytics?.total_female || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Active</span>
              <span className="font-semibold text-blue-900">{patientAnalytics?.active_patients || 0}</span>
            </div>
          </div>
        </div>

        {/* Queue Metrics */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center mb-4">
            <QueueListIcon className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-purple-900">Queue Performance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-700">Total Queue</span>
              <span className="font-semibold text-purple-900">{queueAnalytics?.total_queue || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-700">Attended</span>
              <span className="font-semibold text-purple-900">{queueAnalytics?.total_attended || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-700">Waiting</span>
              <span className="font-semibold text-purple-900">{queueAnalytics?.total_waiting || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-700">Avg Wait Time</span>
              <span className="font-semibold text-purple-900">
                {queueAnalytics?.avg_wait_time ? `${Math.round(queueAnalytics.avg_wait_time)} min` : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Medical Records Metrics */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center mb-4">
            <ClipboardDocumentListIcon className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-green-900">Medical Records</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700">Total Records</span>
              <span className="font-semibold text-green-900">{medicalRecordsAnalytics?.total_records || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700">This Month</span>
              <span className="font-semibold text-green-900">
                {medicalRecordsAnalytics?.records_this_month || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700">This Week</span>
              <span className="font-semibold text-green-900">{medicalRecordsAnalytics?.records_this_week || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700">Today</span>
              <span className="font-semibold text-green-900">{medicalRecordsAnalytics?.records_today || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Quick Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <CheckCircleIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold">High Efficiency</p>
              <p className="text-sm text-indigo-100 mt-1">
                {queueAnalytics && queueAnalytics.total_queue > 0
                  ? `${Math.round((queueAnalytics.total_attended / queueAnalytics.total_queue) * 100)}%`
                  : "0%"}{" "}
                of queue patients were attended
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <ClockIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold">Average Wait Time</p>
              <p className="text-sm text-indigo-100 mt-1">
                {queueAnalytics?.avg_wait_time
                  ? `${Math.round(queueAnalytics.avg_wait_time)} minutes per patient`
                  : "No data available"}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <ArrowTrendingUpIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold">Growing Database</p>
              <p className="text-sm text-indigo-100 mt-1">
                {patientAnalytics?.total_patients || 0} patients registered in the system
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
