import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { MedicalRecord, Patient } from '../types';

interface MedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<MedicalRecord>) => Promise<void>;
  record?: MedicalRecord | null;
  patients: Patient[];
  isViewMode?: boolean;
}

interface FormData {
  patient_id: number;
  visit_date: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  doctor_name: string;
}

const MedicalRecordModal: React.FC<MedicalRecordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  record,
  patients,
  isViewMode = false
}) => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>();

  useEffect(() => {
    if (isOpen) {
      if (record) {
        reset({
          patient_id: record.patient_id,
          visit_date: record.visit_date.split('T')[0], // Format for date input
          diagnosis: record.diagnosis,
          treatment: record.treatment,
          notes: record.notes || '',
          doctor_name: record.doctor_name
        });
      } else {
        reset({
          visit_date: new Date().toISOString().split('T')[0],
          diagnosis: '',
          treatment: '',
          notes: '',
          doctor_name: ''
        });
      }
    }
  }, [isOpen, record, reset]);

  const onSubmit = async (data: FormData) => {
    if (isViewMode) return;
    
    try {
      setLoading(true);
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Error saving medical record:', error);
      alert('Failed to save medical record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {isViewMode 
              ? 'View Medical Record' 
              : record 
                ? 'Edit Medical Record' 
                : 'Add Medical Record'
            }
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Selection */}
            <div className="md:col-span-2">
              <label htmlFor="patient_id" className="block text-sm font-medium text-gray-700 mb-1">
                Patient *
              </label>
              <select
                id="patient_id"
                {...register('patient_id', { 
                  required: 'Patient is required',
                  valueAsNumber: true 
                })}
                className="input"
                disabled={isViewMode}
              >
                <option value="">Select a patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.full_name}
                  </option>
                ))}
              </select>
              {errors.patient_id && (
                <p className="mt-1 text-sm text-red-600">{errors.patient_id.message}</p>
              )}
            </div>

            {/* Visit Date */}
            <div>
              <label htmlFor="visit_date" className="block text-sm font-medium text-gray-700 mb-1">
                Visit Date *
              </label>
              <input
                id="visit_date"
                type="date"
                {...register('visit_date', { required: 'Visit date is required' })}
                className="input"
                readOnly={isViewMode}
              />
              {errors.visit_date && (
                <p className="mt-1 text-sm text-red-600">{errors.visit_date.message}</p>
              )}
            </div>

            {/* Doctor Name */}
            <div>
              <label htmlFor="doctor_name" className="block text-sm font-medium text-gray-700 mb-1">
                Doctor Name *
              </label>
              <input
                id="doctor_name"
                type="text"
                placeholder="Enter doctor's name"
                {...register('doctor_name', { required: 'Doctor name is required' })}
                className="input"
                readOnly={isViewMode}
              />
              {errors.doctor_name && (
                <p className="mt-1 text-sm text-red-600">{errors.doctor_name.message}</p>
              )}
            </div>

            {/* Diagnosis */}
            <div className="md:col-span-2">
              <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosis *
              </label>
              <textarea
                id="diagnosis"
                rows={3}
                placeholder="Enter diagnosis details"
                {...register('diagnosis', { required: 'Diagnosis is required' })}
                className="input"
                readOnly={isViewMode}
              />
              {errors.diagnosis && (
                <p className="mt-1 text-sm text-red-600">{errors.diagnosis.message}</p>
              )}
            </div>

            {/* Treatment */}
            <div className="md:col-span-2">
              <label htmlFor="treatment" className="block text-sm font-medium text-gray-700 mb-1">
                Treatment *
              </label>
              <textarea
                id="treatment"
                rows={3}
                placeholder="Enter treatment details"
                {...register('treatment', { required: 'Treatment is required' })}
                className="input"
                readOnly={isViewMode}
              />
              {errors.treatment && (
                <p className="mt-1 text-sm text-red-600">{errors.treatment.message}</p>
              )}
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Enter any additional notes (optional)"
                {...register('notes')}
                className="input"
                readOnly={isViewMode}
              />
            </div>
          </div>

          {/* Form Actions */}
          {!isViewMode && (
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  record ? 'Update Record' : 'Create Record'
                )}
              </button>
            </div>
          )}

          {/* View Mode Actions */}
          {isViewMode && (
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default MedicalRecordModal;