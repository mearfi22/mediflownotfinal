import React from "react";
import { Queue } from "../types";

interface QueueTicketPrintProps {
  queue: Queue;
  onClose: () => void;
}

const QueueTicketPrint: React.FC<QueueTicketPrintProps> = ({
  queue,
  onClose,
}) => {
  const currentDate = new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currentTime = new Date().toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Print Queue Ticket
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Print Preview */}
          <div className="border-2 border-dashed border-gray-300 p-4 mb-6 bg-gray-50">
            <div className="thermal-ticket" id="thermal-ticket">
              {/* Ticket Content */}
              <div className="text-center space-y-2 font-mono text-sm">
                <div className="font-bold text-lg">ROXAS MEMORIAL</div>
                <div className="font-bold">PROVINCIAL HOSPITAL</div>
                <div className="text-xs">===============================</div>
                <div className="text-xs">QUEUE TICKET</div>
                <div className="text-xs">===============================</div>

                <div className="py-4">
                  <div className="text-4xl font-bold">
                    #{queue.queue_number}
                  </div>
                </div>

                <div className="text-xs">===============================</div>
                <div className="text-xs">
                  PATIENT: {queue.patient?.full_name}
                </div>
                <div className="text-xs">REASON: {queue.reason_for_visit}</div>
                <div className="text-xs">DATE: {currentDate}</div>
                <div className="text-xs">TIME: {currentTime}</div>
                <div className="text-xs">===============================</div>

                <div className="text-xs py-2">
                  <div>Please wait for your number</div>
                  <div>to be called.</div>
                  <div></div>
                  <div>Have your documents ready.</div>
                  <div>Maintain social distancing.</div>
                </div>

                <div className="text-xs">===============================</div>
                <div className="text-xs">Thank you for choosing</div>
                <div className="text-xs">
                  Roxas Memorial Provincial Hospital
                </div>
                <div className="text-xs">===============================</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-2xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-primary text-white rounded-2xl hover:bg-primary-dark flex items-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a1 1 0 001-1v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4a1 1 0 001 1zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              <span>Print Ticket</span>
            </button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            body * {
              visibility: hidden;
            }

            #thermal-ticket,
            #thermal-ticket * {
              visibility: visible;
            }

            #thermal-ticket {
              position: absolute;
              left: 0;
              top: 0;
              width: 80mm;
              font-family: "Courier New", monospace;
              font-size: 12px;
              line-height: 1.2;
              color: black;
              background: white;
            }

            .thermal-ticket {
              margin: 0;
              padding: 5mm;
              border: none;
              background: white !important;
            }

            @page {
              size: 80mm auto;
              margin: 0;
            }
          }
        `,
        }}
      />
    </div>
  );
};

export default QueueTicketPrint;
