import React, { useState, useEffect } from "react";
import { queueApi, patientApi } from "../services/api";
import { Queue, Patient, QueueStatistics } from "../types";
import {
  PlusIcon,
  PlayIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  PrinterIcon,
} from "@heroicons/react/24/outline";
import QueueModal from "../components/QueueModal.tsx";
import QueueTicketPrint from "../components/QueueTicketPrint";

const QueuePage: React.FC = () => {
  const [queue, setQueue] = useState<Queue[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [statistics, setStatistics] = useState<QueueStatistics>({
    total_patients_today: 0,
    served: 0,
    skipped: 0,
    waiting: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nowServing, setNowServing] = useState<Queue | null>(null);
  const [printQueue, setPrintQueue] = useState<Queue | null>(null);

  useEffect(() => {
    fetchQueue();
    fetchStatistics();
    fetchPatients();
  }, [selectedDate]);

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchQueue();
      fetchStatistics();
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedDate]);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await queueApi.getAll(selectedDate);
      setQueue(data);

      // Find currently serving patient
      const serving = data.find((q) => q.status === "serving");
      setNowServing(serving || null);
    } catch (error) {
      console.error("Error fetching queue:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await queueApi.getStatistics(selectedDate);
      setStatistics(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await patientApi.getAll(1);
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const handleAddToQueue = () => {
    setIsModalOpen(true);
  };

  const handleSaveQueue = async (data: {
    patient_id: number;
    reason_for_visit: string;
  }) => {
    try {
      await queueApi.create({
        ...data,
        queue_date: selectedDate,
      });
      setIsModalOpen(false);
      fetchQueue();
      fetchStatistics();
    } catch (error) {
      console.error("Error adding to queue:", error);
      throw error;
    }
  };

  const handleStatusChange = async (
    queueItem: Queue,
    newStatus: Queue["status"]
  ) => {
    try {
      await queueApi.update(queueItem.id, { status: newStatus });
      fetchQueue();
      fetchStatistics();
    } catch (error) {
      console.error("Error updating queue status:", error);
      alert("Failed to update queue status");
    }
  };

  const handleDeleteFromQueue = async (queueItem: Queue) => {
    if (
      window.confirm(
        "Are you sure you want to remove this patient from the queue?"
      )
    ) {
      try {
        await queueApi.delete(queueItem.id);
        fetchQueue();
        fetchStatistics();
      } catch (error) {
        console.error("Error deleting from queue:", error);
        alert("Failed to remove from queue");
      }
    }
  };

  const getStatusColor = (status: Queue["status"]) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-100 text-yellow-800";
      case "serving":
        return "bg-blue-100 text-blue-800";
      case "served":
        return "bg-green-100 text-green-800";
      case "skipped":
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
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
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
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckIcon className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                Served
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {statistics.served}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <XMarkIcon className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                Skipped
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {statistics.skipped}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Now Serving */}
      {nowServing && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900">
                Now Serving
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-2">
                <span className="text-2xl sm:text-3xl font-bold text-blue-900">
                  #{nowServing.queue_number}
                </span>
                <div>
                  <p className="font-medium text-blue-800">
                    {nowServing.patient?.full_name}
                  </p>
                  <p className="text-sm text-blue-600">
                    {nowServing.reason_for_visit}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
              <button
                onClick={() => setPrintQueue(nowServing)}
                className="btn-secondary bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200 flex items-center justify-center space-x-1 text-sm"
              >
                <PrinterIcon className="h-4 w-4" />
                <span>Print Ticket</span>
              </button>
              <button
                onClick={() => handleStatusChange(nowServing, "served")}
                className="btn-primary bg-green-600 hover:bg-green-700 text-sm"
              >
                Mark as Served
              </button>
              <button
                onClick={() => handleStatusChange(nowServing, "skipped")}
                className="btn-secondary text-red-600 border-red-300 hover:bg-red-50 text-sm"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

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
            {/* Mobile Card View */}
            <div className="block lg:hidden">
              <div className="space-y-4">
                {queue.map((queueItem) => (
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

                    {/* Mobile Actions */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setPrintQueue(queueItem)}
                        className="p-3 text-purple-600 hover:text-purple-900 hover:bg-white rounded-full min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center"
                        title="Print Queue Ticket"
                      >
                        <PrinterIcon className="h-4 w-4" />
                      </button>

                      {queueItem.status === "waiting" && (
                        <button
                          onClick={() =>
                            handleStatusChange(queueItem, "serving")
                          }
                          className="px-4 py-2 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 min-h-[44px] touch-manipulation flex items-center justify-center"
                        >
                          Start Serving
                        </button>
                      )}
                      {queueItem.status === "serving" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusChange(queueItem, "served")
                            }
                            className="px-4 py-2 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200 min-h-[44px] touch-manipulation flex items-center justify-center"
                          >
                            Mark Served
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(queueItem, "skipped")
                            }
                            className="px-4 py-2 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 min-h-[44px] touch-manipulation flex items-center justify-center"
                          >
                            Skip
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteFromQueue(queueItem)}
                        className="px-4 py-2 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 min-h-[44px] touch-manipulation flex items-center justify-center"
                      >
                        Remove
                      </button>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Queue #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Called At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Served At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {queue.map((queueItem) => (
                    <tr key={queueItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-gray-900">
                          #{queueItem.queue_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {queueItem.patient?.full_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {queueItem.reason_for_visit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {/* Print Button - Always available */}
                          <button
                            onClick={() => setPrintQueue(queueItem)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Print Queue Ticket"
                          >
                            <PrinterIcon className="h-5 w-5" />
                          </button>

                          {queueItem.status === "waiting" && (
                            <button
                              onClick={() =>
                                handleStatusChange(queueItem, "serving")
                              }
                              className="text-blue-600 hover:text-blue-900"
                              title="Start Serving"
                            >
                              <PlayIcon className="h-5 w-5" />
                            </button>
                          )}
                          {queueItem.status === "serving" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusChange(queueItem, "served")
                                }
                                className="text-green-600 hover:text-green-900"
                                title="Mark as Served"
                              >
                                <CheckIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusChange(queueItem, "skipped")
                                }
                                className="text-red-600 hover:text-red-900"
                                title="Skip Patient"
                              >
                                <XMarkIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteFromQueue(queueItem)}
                            className="text-red-600 hover:text-red-900"
                            title="Remove from Queue"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
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

      {/* Queue Modal */}
      {isModalOpen && (
        <QueueModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveQueue}
          patients={patients}
        />
      )}

      {/* Print Ticket Modal */}
      {printQueue && (
        <QueueTicketPrint
          queue={printQueue}
          onClose={() => setPrintQueue(null)}
        />
      )}
    </div>
  );
};

export default QueuePage;
