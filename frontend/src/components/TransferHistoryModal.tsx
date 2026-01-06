import React from "react";
import { XMarkIcon, ClockIcon } from "@heroicons/react/24/outline";

interface QueueTransfer {
  id: number;
  queue_id: number;
  from_doctor_id: number | null;
  to_doctor_id: number | null;
  from_department_id: number | null;
  to_department_id: number | null;
  reason: string | null;
  transferred_by: number | { id: number; name: string };
  created_at: string;
  from_doctor?: { full_name: string };
  to_doctor?: { full_name: string };
  from_department?: { name: string };
  to_department?: { name: string };
}

interface TransferHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfers: QueueTransfer[];
  queueNumber: number;
  patientName: string;
}

const TransferHistoryModal: React.FC<TransferHistoryModalProps> = ({
  isOpen,
  onClose,
  transfers,
  queueNumber,
  patientName,
}) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Transfer History</h2>
            <p className="text-sm text-gray-600 mt-1">
              Queue #{queueNumber} - {patientName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {transfers.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No transfer history</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transfers.map((transfer, index) => (
                <div
                  key={transfer.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded">
                        Transfer #{transfers.length - index}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(transfer.created_at)}
                      </span>
                    </div>
                    {transfer.transferred_by && typeof transfer.transferred_by === 'object' && (
                      <span className="text-xs text-gray-600">
                        by {transfer.transferred_by.name}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                      <p className="text-xs font-semibold text-red-700 mb-2">FROM</p>
                      <div className="space-y-1">
                        <div>
                          <span className="text-xs text-red-600">Department:</span>
                          <p className="text-sm font-medium text-red-900">
                            {transfer.from_department?.name || "Not Assigned"}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-red-600">Doctor:</span>
                          <p className="text-sm font-medium text-red-900">
                            {transfer.from_doctor?.full_name || "Not Assigned"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                      <p className="text-xs font-semibold text-green-700 mb-2">TO</p>
                      <div className="space-y-1">
                        <div>
                          <span className="text-xs text-green-600">Department:</span>
                          <p className="text-sm font-medium text-green-900">
                            {transfer.to_department?.name || "Not Assigned"}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-green-600">Doctor:</span>
                          <p className="text-sm font-medium text-green-900">
                            {transfer.to_doctor?.full_name || "Not Assigned"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {transfer.reason && (
                    <div className="mt-3 bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                      <p className="text-xs font-semibold text-yellow-700 mb-1">
                        Reason:
                      </p>
                      <p className="text-sm text-yellow-900">{transfer.reason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferHistoryModal;
