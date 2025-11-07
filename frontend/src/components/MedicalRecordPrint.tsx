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

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
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
            <div className="text-center border-b-2 border-teal-600 pb-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-teal-600 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-2xl">R</span>
                </div>
                <div className="text-left">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Roxas Memorial Provincial Hospital
                  </h1>
                  <p className="text-lg text-gray-600">Medical Record</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <p>Roxas City, Capiz, Philippines</p>
                <p>Tel: (036) 621-0951 | Email: info@rmph.gov.ph</p>
              </div>
            </div>

            {/* Patient Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-300 pb-2">
                  Patient Information
                </h2>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-32">
                      Name:
                    </span>
                    <span className="text-gray-900">{patient.full_name}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-32">Age:</span>
                    <span className="text-gray-900">
                      {patient.age} years old
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-32">
                      Gender:
                    </span>
                    <span className="text-gray-900 capitalize">
                      {patient.gender}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-32">
                      Date of Birth:
                    </span>
                    <span className="text-gray-900">
                      {formatDate(patient.date_of_birth)}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-32">
                      Contact:
                    </span>
                    <span className="text-gray-900">
                      {patient.contact_number}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-32">
                      Civil Status:
                    </span>
                    <span className="text-gray-900">
                      {patient.civil_status}
                    </span>
                  </div>
                  {patient.philhealth_id && (
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">
                        PhilHealth ID:
                      </span>
                      <span className="text-gray-900">
                        {patient.philhealth_id}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-300 pb-2">
                  Visit Details
                </h2>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-32">
                      Visit Date:
                    </span>
                    <span className="text-gray-900">
                      {formatDate(record.visit_date)}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-32">
                      Doctor:
                    </span>
                    <span className="text-gray-900">{record.doctor_name}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-32">
                      Record ID:
                    </span>
                    <span className="text-gray-900">
                      #{record.id.toString().padStart(6, "0")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4">
                Address
              </h2>
              <p className="text-gray-900">{patient.address}</p>
            </div>

            {/* Medical Details */}
            <div className="space-y-6">
              {/* Diagnosis */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4">
                  Diagnosis
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {record.diagnosis}
                  </p>
                </div>
              </div>

              {/* Treatment */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4">
                  Treatment
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {record.treatment}
                  </p>
                </div>
              </div>

              {/* Additional Notes */}
              {record.notes && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4">
                    Additional Notes
                  </h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {record.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-300">
              <div className="flex justify-between items-end">
                <div className="text-sm text-gray-500">
                  <p>Generated on: {formatDate(new Date().toISOString())}</p>
                  <p>Record Created: {formatDate(record.created_at)}</p>
                </div>
                <div className="text-center">
                  <div className="border-t-2 border-gray-400 w-64 pt-2">
                    <p className="text-sm font-medium text-gray-700">
                      Doctor's Signature
                    </p>
                    <p className="text-sm text-gray-500">
                      {record.doctor_name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center text-xs text-gray-400">
                <p>
                  This is a computer-generated medical record from Roxas
                  Memorial Provincial Hospital
                </p>
                <p>
                  For verification, please contact the hospital at (036)
                  621-0951
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
