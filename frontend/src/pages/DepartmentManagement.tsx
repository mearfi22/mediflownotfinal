import React, { useState, useEffect } from "react";
import { departmentsApi } from "../services/api";
import {
  BuildingOfficeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import DepartmentModal from "../components/DepartmentModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { Department } from "../types";

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [expandedDept, setExpandedDept] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; department: Department | null }>({ show: false, department: null });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentsApi.getAll();
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingDepartment(null);
    setShowModal(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setShowModal(true);
  };

  const handleDelete = async (department: Department) => {
    if (department.doctors_count && department.doctors_count > 0) {
      alert(
        `Cannot delete ${department.name}. Please reassign ${department.doctors_count} doctor(s) first.`
      );
      return;
    }

    setDeleteConfirm({ show: true, department });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.department) {
      try {
        await departmentsApi.delete(deleteConfirm.department.id);
        fetchDepartments();
      } catch (error: any) {
        alert(error.response?.data?.message || "Failed to delete department");
      }
    }
  };

  const handleModalClose = (saved: boolean) => {
    setShowModal(false);
    setEditingDepartment(null);
    if (saved) {
      fetchDepartments();
    }
  };

  const totalDoctors = departments.reduce((sum, dept) => sum + (dept.doctors_count || 0), 0);
  const totalQueue = departments.reduce((sum, dept) => sum + (dept.queue_entries_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage hospital departments and specializations
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-2xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Department
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden rounded-2xl shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-blue-500 text-white">
                  <BuildingOfficeIcon className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 truncate">
                    Total Departments
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">{departments.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 overflow-hidden rounded-2xl shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-green-500 text-white">
                  <UsersIcon className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 truncate">
                    Total Doctors
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">{totalDoctors}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden rounded-2xl shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-purple-500 text-white">
                  <ClipboardDocumentListIcon className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 truncate">
                    Active Queue
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">{totalQueue}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Departments Table */}
      <div className="bg-white shadow-sm rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Departments</h3>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading departments...</p>
          </div>
        ) : departments.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No departments</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new department.
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreate}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-2xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Department
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department Name
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctors
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Queue
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departments.map((department) => (
                  <React.Fragment key={department.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {department.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <button
                            onClick={() => setExpandedDept(expandedDept === department.id ? null : department.id)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {department.doctors_count} {department.doctors_count === 1 ? 'Doctor' : 'Doctors'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <ClipboardDocumentListIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            {department.queue_entries_count}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {new Date(department.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => handleEdit(department)}
                          className="text-blue-600 hover:text-blue-900 mr-4 inline-flex items-center"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(department)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center"
                          disabled={department.doctors_count ? department.doctors_count > 0 : false}
                          title={
                            department.doctors_count && department.doctors_count > 0
                              ? "Cannot delete department with doctors"
                              : "Delete department"
                          }
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                    {/* Expanded row showing doctors */}
                    {expandedDept === department.id && department.doctors && department.doctors.length > 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 bg-gray-50">
                          <div className="text-sm font-medium text-gray-700 mb-2">Registered Doctors:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {department.doctors.map((doctor) => (
                              <div key={doctor.id} className="flex items-center p-2 bg-white rounded border border-gray-200">
                                <UsersIcon className="h-5 w-5 text-blue-500 mr-2" />
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">{doctor.full_name}</div>
                                  <div className="text-xs text-gray-500">{doctor.email || 'No email'}</div>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded ${doctor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {doctor.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Department Modal */}
      {showModal && (
        <DepartmentModal
          department={editingDepartment}
          onClose={handleModalClose}
        />
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, department: null })}
        onConfirm={confirmDelete}
        title="Delete Department"
        message={`Are you sure you want to delete ${deleteConfirm.department?.name}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default DepartmentManagement;
