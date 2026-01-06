import React, { useState, useEffect } from "react";
import { queueApi, patientsApi } from "../services/api";
import { Queue, Patient, Department, Doctor } from "../types";
import {
  PlusIcon,
  ClockIcon,
  PlayIcon,
  CheckIcon,
  XMarkIcon,
  PrinterIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";
import QueueModal from "../components/QueueModal";
import QueueTicketPrint from "../components/QueueTicketPrint";
import TransferModal from "../components/TransferModal";
import TransferHistoryModal from "../components/TransferHistoryModal";
import ConfirmDialog from "../components/ConfirmDialog";

const QueuePage: React.FC = () => {
  const [queue, setQueue] = useState<Queue[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; queueItem: Queue | null }>({ show: false, queueItem: null });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [statistics, setStatistics] = useState({
    total_patients_today: 0,
    now_serving: undefined as Queue | undefined,
    served: 0,
    no_show: 0,
    waiting: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [printQueue, setPrintQueue] = useState<Queue | null>(null);
  const [transferQueue, setTransferQueue] = useState<Queue | null>(null);
  const [transferDoctors, setTransferDoctors] = useState<Doctor[]>([]);
  const [transferHistory, setTransferHistory] = useState<any[]>([]);
  const [showTransferHistory, setShowTransferHistory] = useState(false);
  const [selectedQueueForHistory, setSelectedQueueForHistory] = useState<Queue | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [queueRes, patientsRes, statsRes, departmentsRes, doctorsRes] =
        await Promise.all([
          queueApi.getAll(selectedDate),
          patientsApi.getAll(),
          queueApi.getStatistics(selectedDate),
          queueApi.getDepartments(),
          queueApi.getDoctors(),
        ]);

      setQueue(queueRes.data);
      // Handle paginated response from Laravel
      const patients = Array.isArray(patientsRes.data) 
        ? patientsRes.data 
        : patientsRes.data?.data || [];
      setPatients(patients);
      setStatistics(statsRes.data);
      setDepartments(departmentsRes.data);
      setDoctors(doctorsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToQueue = () => {
    setIsModalOpen(true);
  };

  const handleSaveQueue = async (data: {
    patient_id: number;
    reason_for_visit: string;
    department_id?: number;
    doctor_id?: number;
  }) => {
    try {
      const newQueue = await queueApi.create(data);
      setQueue([...queue, newQueue.data]);
      // Refresh statistics
      const stats = await queueApi.getStatistics(selectedDate);
      setStatistics(stats.data);
    } catch (error) {
      console.error("Error adding to queue:", error);
      throw error;
    }
  };

  const handleStatusChange = async (queueItem: Queue, status: Queue['status']) => {
    try {
      const updatedQueue = await queueApi.update(queueItem.id, { status });
      setQueue(
        queue.map((item) => (item.id === queueItem.id ? updatedQueue.data : item))
      );
      // Refresh statistics
      const stats = await queueApi.getStatistics(selectedDate);
      setStatistics(stats.data);
    } catch (error) {
      console.error("Error updating queue status:", error);
    }
  };

  const handleDeleteFromQueue = (queueItem: Queue) => {
    setDeleteConfirm({ show: true, queueItem });
  };

  const confirmDeleteFromQueue = async () => {
    if (deleteConfirm.queueItem) {
      try {
        await queueApi.delete(deleteConfirm.queueItem.id);
        setQueue(queue.filter((item) => item.id !== deleteConfirm.queueItem!.id));
        // Refresh statistics
        const stats = await queueApi.getStatistics(selectedDate);
        setStatistics(stats.data);
      } catch (error) {
        console.error("Error deleting from queue:", error);
      }
    }
  };

  const handleOpenTransferModal = async (queueItem: Queue) => {
    setTransferQueue(queueItem);
    // Fetch doctors for the current department
    if (queueItem.department_id) {
      try {
        const response = await queueApi.getDoctors(queueItem.department_id);
        setTransferDoctors(response.data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    }
  };

  const handleTransferDepartmentChange = async (departmentId: number) => {
    try {
      const response = await queueApi.getDoctors(departmentId);
      setTransferDoctors(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const handleTransfer = async (data: {
    to_doctor_id?: number;
    to_department_id?: number;
    reason?: string;
  }) => {
    if (!transferQueue) return;

    try {
      const response = await queueApi.transfer(transferQueue.id, data);
      // Update the queue list with the transferred queue
      setQueue(queue.map((item) => 
        item.id === transferQueue.id ? response.data.queue : item
      ));
      // Refresh statistics
      const stats = await queueApi.getStatistics(selectedDate);
      setStatistics(stats.data);
      setTransferQueue(null);
    } catch (error) {
      console.error("Error transferring queue:", error);
      throw error;
    }
  };

  const handleViewTransferHistory = async (queueItem: Queue) => {
    try {
      const response = await queueApi.getTransferHistory(queueItem.id);
      setTransferHistory(response.data);
      setSelectedQueueForHistory(queueItem);
      setShowTransferHistory(true);
    } catch (error) {
      console.error("Error fetching transfer history:", error);
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
      emergency: "bg-red-600 text-white",
      senior: "bg-purple-600 text-white",
      pwd: "bg-indigo-600 text-white",
      regular: "bg-gray-400 text-white",
    };

    const labels = {
      emergency: "EMERGENCY",
      senior: "SENIOR",
      pwd: "PWD",
      regular: "REGULAR",
    };

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-bold rounded ${
          badges[priority as keyof typeof badges] || badges.regular
        }`}
      >
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Queue Management</h1>
          <p className="text-gray-600">Manage patient queue and appointments</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input"
          />
          <button
            onClick={handleAddToQueue}
            className="btn btn-primary flex items-center justify-center space-x-2"
          >
            <span>Add to Queue</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <ClockIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                Total Today
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {statistics.total_patients_today}
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
                {statistics.waiting}
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
                Now Attending
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {statistics.now_serving ? `#${statistics.now_serving.queue_number}` : "None"}
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
                Attended
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {statistics.served}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-500">Loading queue...</p>
          </div>
        ) : queue.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No patients in queue for {selectedDate}
            </p>
          </div>
        ) : (
          <>
            {/* Card View - All Devices */}
            {queue.filter(q => q.status !== 'attended').length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No active patients in queue. All patients have been attended.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                {queue.filter(q => q.status !== 'attended').map((queueItem) => (
                  <div
                    key={queueItem.id}
                    className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all shadow-sm relative"
                  >
                  {/* History Button - Top Right */}
                  <button
                    onClick={() => handleViewTransferHistory(queueItem)}
                    className="absolute top-4 right-4 inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors"
                    title="View Transfer History"
                  >
                    <ClockIcon className="h-4 w-4 mr-1" />
                    History
                  </button>

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 rounded-2xl px-4 py-3">
                        <div className="text-2xl font-bold text-blue-600">
                          #{queueItem.queue_number}
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          {queueItem.patient?.full_name}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              queueItem.status
                            )}`}
                          >
                            {queueItem.status?.charAt(0).toUpperCase() +
                              queueItem.status?.slice(1)}
                          </span>
                          {getPriorityBadge(queueItem.priority)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Reason for Visit:</p>
                      <p className="text-sm text-gray-900 font-medium">
                        {queueItem.reason_for_visit}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Department:</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {queueItem.department?.name || "Not Assigned"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Doctor:</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {queueItem.doctor?.full_name || "Not Assigned"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div>
                        <p className="text-xs text-gray-500">Called At:</p>
                        <p className="text-sm font-medium text-gray-700">
                          {formatTime(queueItem.called_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Attended At:</p>
                        <p className="text-sm font-medium text-gray-700">
                          {formatTime(queueItem.served_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end items-center gap-2 pt-4 border-t">
                    <button
                      onClick={() => setPrintQueue(queueItem)}
                      className="inline-flex items-center px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-2xl hover:bg-purple-200 transition-colors"
                      title="Print Queue Ticket"
                    >
                      <PrinterIcon className="h-4 w-4 mr-1" />
                      Print
                    </button>

                    <button
                      onClick={() => handleOpenTransferModal(queueItem)}
                      className="inline-flex items-center px-3 py-2 text-sm bg-orange-100 text-orange-700 rounded-2xl hover:bg-orange-200 transition-colors"
                      title="Transfer Queue"
                    >
                      <ArrowsRightLeftIcon className="h-4 w-4 mr-1" />
                      Transfer
                    </button>

                    {queueItem.status === "waiting" && (
                      <button
                        onClick={() =>
                          handleStatusChange(queueItem, "attending")
                        }
                        className="inline-flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors"
                        title="Start Attending"
                      >
                        <PlayIcon className="h-4 w-4 mr-1" />
                        Start Attending
                      </button>
                    )}
                    {queueItem.status === "attending" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusChange(queueItem, "attended")
                          }
                          className="inline-flex items-center px-4 py-2 text-sm bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-colors"
                          title="Mark as Attended"
                        >
                          Mark Attended
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(queueItem, "no_show")
                          }
                          className="inline-flex items-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-2xl hover:bg-red-200 transition-colors"
                          title="Mark as No Show"
                        >
                          No Show
                        </button>
                      </>
                    )}
                    {queueItem.status === "attended" && queueItem.medical_record_id && (
                      <div className="inline-flex items-center px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Documented
                      </div>
                    )}
                    <button
                      onClick={() => handleDeleteFromQueue(queueItem)}
                      className="inline-flex items-center p-2 text-sm text-gray-600 rounded-2xl hover:bg-gray-100 transition-colors"
                      title="Remove from Queue"
                    >
                      </button>
                  </div>
                </div>
              ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Queue Modal */}
      {isModalOpen && (
        <QueueModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveQueue}
          patients={patients}
          departments={departments}
          doctors={doctors}
        />
      )}

      {/* Print Ticket Modal */}
      {printQueue && (
        <QueueTicketPrint
          queue={printQueue}
          onClose={() => setPrintQueue(null)}
        />
      )}

      {/* Transfer Modal */}
      {transferQueue && (
        <TransferModal
          isOpen={true}
          onClose={() => {
            setTransferQueue(null);
            setTransferDoctors([]);
          }}
          onTransfer={handleTransfer}
          queue={transferQueue}
          departments={departments}
          doctors={transferDoctors}
          onDepartmentChange={handleTransferDepartmentChange}
        />
      )}

      {/* Transfer History Modal */}
      {showTransferHistory && selectedQueueForHistory && (
        <TransferHistoryModal
          isOpen={showTransferHistory}
          onClose={() => {
            setShowTransferHistory(false);
            setSelectedQueueForHistory(null);
            setTransferHistory([]);
          }}
          transfers={transferHistory}
          queueNumber={selectedQueueForHistory.queue_number}
          patientName={selectedQueueForHistory.patient?.full_name || "Unknown"}
        />
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, queueItem: null })}
        onConfirm={confirmDeleteFromQueue}
        title="Remove from Queue"
        message={`Are you sure you want to remove ${deleteConfirm.queueItem?.patient?.full_name} from the queue?`}
        confirmText="Remove"
        type="danger"
      />
    </div>
  );
};

export default QueuePage;