import React from "react";
import { MedicalRecord, Patient } from "../types";

interface MedicalRecordPrintProps {
  record: MedicalRecord;
  patient: Patient;
  onClose: () => void;
}

const MedicalRecordPrint: React.FC<MedicalRecordPrintProps> = ({
  record,
  patient,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .print-page {
            page-break-after: always;
          }
          @page {
            size: A4;
            margin: 0.5in;
          }
        }
      `}</style>

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Print Controls */}
          <div className="no-print flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">
              Medical Record - Print Preview
            </h3>
            <div className="flex space-x-3">
              <button onClick={handlePrint} className="btn btn-primary">
                🖨️ Print Record
              </button>
              <button onClick={onClose} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>

          {/* Printable Content */}
          <div className="print-area p-8">
            {/* Hospital Header */}
            <div className="text-center border-b-4 border-red-600 pb-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-bold text-4xl">M</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Roxas Memorial Provincial Hospital
                  </h1>
                  <p className="text-xl font-semibold text-blue-600 mt-1">Medical Record</p>
                  <p className="text-sm text-gray-500 italic">Healthcare Excellence Through Innovation</p>
                </div>
              </div>
              <div className="text-sm text-gray-600 font-medium">
                <p>Roxas City, Capiz, Philippines</p>
                <p>Tel: (036) 621-0951 | Email: info@rmph.gov.ph</p>
              </div>
            </div>

            {/* Patient Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border-2 border-blue-200 shadow-sm">
                <h2 className="text-2xl font-bold text-blue-900 border-b-2 border-blue-300 pb-3 mb-4 flex items-center">
                  <span className="mr-2">👤</span> Patient Information
                </h2>
                <div className="space-y-3">
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-36">
                      Name:
                    </span>
                    <span className="text-gray-900 font-medium">{patient.full_name}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-36">Age:</span>
                    <span className="text-gray-900 font-medium">
                      {patient.age} years old
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-36">
                      Gender:
                    </span>
                    <span className="text-gray-900 font-medium capitalize">
                      {patient.gender}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-36">
                      Date of Birth:
                    </span>
                    <span className="text-gray-900 font-medium">
                      {formatDate(patient.date_of_birth)}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-36">
                      Contact:
                    </span>
                    <span className="text-gray-900 font-medium">
                      {patient.contact_number}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-36">
                      Civil Status:
                    </span>
                    <span className="text-gray-900 font-medium">
                      {patient.civil_status}
                    </span>
                  </div>
                  {patient.philhealth_id && (
                    <div className="flex">
                      <span className="font-semibold text-gray-700 w-36">
                        PhilHealth ID:
                      </span>
                      <span className="text-gray-900 font-medium">
                        {patient.philhealth_id}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl border-2 border-green-200 shadow-sm">
                <h2 className="text-2xl font-bold text-green-900 border-b-2 border-green-300 pb-3 mb-4 flex items-center">
                  <span className="mr-2">📋</span> Visit Details
                </h2>
                <div className="space-y-3">
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-36">
                      Visit Date:
                    </span>
                    <span className="text-gray-900 font-medium">
                      {formatDate(record.visit_date)}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-36">
                      Doctor:
                    </span>
                    <span className="text-gray-900 font-medium">{record.doctor_name}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-36">
                      Record ID:
                    </span>
                    <span className="text-blue-600 font-bold text-lg">
                      RMPH-{record.id.toString().padStart(6, "0")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="mb-8 bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border-2 border-purple-200 shadow-sm">
              <h2 className="text-2xl font-bold text-purple-900 border-b-2 border-purple-300 pb-3 mb-4 flex items-center">
                <span className="mr-2">📍</span> Address
              </h2>
              <p className="text-gray-900 font-medium">{patient.address}</p>
            </div>

            {/* Medical Details */}
            <div className="space-y-6">
              {/* Diagnosis */}
              <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-2xl border-2 border-red-200 shadow-sm">
                <h2 className="text-2xl font-bold text-red-900 border-b-2 border-red-300 pb-3 mb-4 flex items-center">
                  <span className="mr-2">🩺</span> Diagnosis
                </h2>
                <div className="bg-white p-5 rounded-xl border border-red-100">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {record.diagnosis}
                  </p>
                </div>
              </div>

              {/* Treatment */}
              <div className="bg-gradient-to-br from-teal-50 to-white p-6 rounded-2xl border-2 border-teal-200 shadow-sm">
                <h2 className="text-2xl font-bold text-teal-900 border-b-2 border-teal-300 pb-3 mb-4 flex items-center">
                  <span className="mr-2">💊</span> Treatment
                </h2>
                <div className="bg-white p-5 rounded-xl border border-teal-100">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {record.treatment}
                  </p>
                </div>
              </div>

              {/* Additional Notes */}
              {record.notes && (
                <div className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-2xl border-2 border-yellow-200 shadow-sm">
                  <h2 className="text-2xl font-bold text-yellow-900 border-b-2 border-yellow-300 pb-3 mb-4 flex items-center">
                    <span className="mr-2">📝</span> Additional Notes
                  </h2>
                  <div className="bg-white p-5 rounded-xl border border-yellow-100">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {record.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t-2 border-gray-300">
              <div className="flex justify-between items-end">
                <div className="text-sm text-gray-600">
                  <p className="font-semibold">Generated on: <span className="font-normal">{formatDate(new Date().toISOString())}</span></p>
                  <p className="font-semibold">Record Created: <span className="font-normal">{formatDate(record.created_at)}</span></p>
                </div>
                <div className="text-center">
                  <div className="border-t-2 border-gray-600 w-64 pt-2">
                    <p className="text-sm font-bold text-gray-800">
                      Doctor's Signature
                    </p>
                    <p className="text-base font-semibold text-blue-600 mt-1">
                      {record.doctor_name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center text-xs text-gray-500 bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold">
                  This is a computer-generated medical record from Roxas Memorial Provincial Hospital
                </p>
                <p className="mt-1">
                  For verification, please contact the hospital at (036) 621-0951
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MedicalRecordPrint;
