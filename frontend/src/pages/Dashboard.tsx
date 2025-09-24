import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { queueApi, patientApi, preRegistrationApi } from '../services/api';
import { QueueStatistics, Patient, PreRegistration } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<QueueStatistics | null>(null);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [pendingPreRegistrations, setPendingPreRegistrations] = useState<PreRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        preRegistrationApi.getAll(1)
      ]);
      
      setStats(statsData);
      setRecentPatients(patientsData.data.slice(0, 5));
      setPendingPreRegistrations(
        preRegData.data.filter(reg => reg.status === 'pending').slice(0, 5)
      );
      setError('');
    } catch (err: any) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePreRegistration = async (preRegId: number) => {
    try {
      await preRegistrationApi.approve(preRegId);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error approving pre-registration:', error);
      alert('Failed to approve pre-registration');
    }
  };

  const handleRejectPreRegistration = async (preRegId: number) => {
    if (window.confirm('Are you sure you want to reject this pre-registration?')) {
      try {
        await preRegistrationApi.reject(preRegId);
        fetchDashboardData(); // Refresh data
      } catch (error) {
        console.error('Error rejecting pre-registration:', error);
        alert('Failed to reject pre-registration');
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
      title: 'Total Patients Today',
      value: stats?.total_patients_today || 0,
      icon: UsersIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Currently Serving',
      value: stats?.now_serving ? `#${stats.now_serving.queue_number}` : 'None',
      icon: ClockIcon,
      color: 'bg-yellow-500',
    },
    {
      title: 'Served Today',
      value: stats?.served || 0,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Skipped Today',
      value: stats?.skipped || 0,
      icon: XCircleIcon,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to Roxas Memorial Provincial Hospital Management System</p>
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
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Currently Serving */}
      {stats?.now_serving && (
        <div className="card bg-yellow-50 border-yellow-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Currently Serving</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                Queue #{stats.now_serving.queue_number}
              </p>
              <p className="text-gray-600">{stats.now_serving.patient?.full_name}</p>
              <p className="text-sm text-gray-500">{stats.now_serving.reason_for_visit}</p>
            </div>
            <Link
              to="/queue"
              className="btn btn-primary"
            >
              Manage Queue
            </Link>
          </div>
        </div>
      )}

      {/* Recent Patients */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
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
                      <div className="text-sm font-medium text-gray-900">{patient.full_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()}/
                        {patient.gender.charAt(0).toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{patient.contact_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        patient.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
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
            <Link to="/pre-register" target="_blank" className="text-primary hover:text-primary-dark">
              Pre-registration form →
            </Link>
          </div>
        </div>
        
        {pendingPreRegistrations.length > 0 ? (
          <div className="space-y-3">
            {pendingPreRegistrations.map((preReg) => (
              <div key={preReg.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{preReg.full_name}</h4>
                    <p className="text-sm text-gray-600">
                      {preReg.contact_number} • {preReg.gender}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 truncate max-w-md">
                      <strong>Reason:</strong> {preReg.reason_for_visit}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Submitted: {new Date(preReg.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleApprovePreRegistration(preReg.id)}
                      className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectPreRegistration(preReg.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No pending pre-registrations</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/patients" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-center">
            <UsersIcon className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Manage Patients</h3>
            <p className="text-gray-600">Add, edit, or view patient information</p>
          </div>
        </Link>
        
        <Link to="/queue" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-center">
            <ClockIcon className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Queue Management</h3>
            <p className="text-gray-600">Manage patient queue and appointments</p>
          </div>
        </Link>
        
        <Link to="/medical-records" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-center">
            <CheckCircleIcon className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Medical Records</h3>
            <p className="text-gray-600">View and manage patient medical history</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;