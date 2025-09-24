import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { patientApi } from '../services/api';
import { Patient } from '../types';

interface PatientModalProps {
  patient?: Patient | null;
  onClose: () => void;
}

interface PatientFormData {
  full_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  contact_number: string;
  civil_status?: string;
  religion?: string;
  philhealth_id?: string;
  reason_for_visit?: string;
}

const PatientModal: React.FC<PatientModalProps> = ({ patient, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormData>({
    defaultValues: patient ? {
      full_name: patient.full_name,
      date_of_birth: patient.date_of_birth,
      gender: patient.gender,
      address: patient.address,
      contact_number: patient.contact_number,
      civil_status: patient.civil_status || '',
      religion: patient.religion || '',
      philhealth_id: patient.philhealth_id || '',
      reason_for_visit: patient.reason_for_visit || '',
    } : {},
  });

  const onSubmit = async (data: PatientFormData) => {
    setLoading(true);
    setError('');

    try {
      if (patient) {
        await patientApi.update(patient.id, data);
      } else {
        await patientApi.create(data);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {patient ? 'Edit Patient' : 'Add New Patient'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  className="input"
                  {...register('full_name', { required: 'Full name is required' })}
                />
                {errors.full_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label className="label">Date of Birth *</label>
                <input
                  type="date"
                  className="input"
                  {...register('date_of_birth', { required: 'Date of birth is required' })}
                />
                {errors.date_of_birth && (
                  <p className="text-red-500 text-sm mt-1">{errors.date_of_birth.message}</p>
                )}
              </div>

              <div>
                <label className="label">Gender *</label>
                <select
                  className="input"
                  {...register('gender', { required: 'Gender is required' })}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
                )}
              </div>

              <div>
                <label className="label">Contact Number *</label>
                <input
                  type="tel"
                  className="input"
                  {...register('contact_number', { required: 'Contact number is required' })}
                />
                {errors.contact_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.contact_number.message}</p>
                )}
              </div>

              <div>
                <label className="label">Civil Status</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Single, Married, Widowed"
                  {...register('civil_status')}
                />
              </div>

              <div>
                <label className="label">Religion</label>
                <input
                  type="text"
                  className="input"
                  {...register('religion')}
                />
              </div>

              <div>
                <label className="label">PhilHealth ID</label>
                <input
                  type="text"
                  className="input"
                  {...register('philhealth_id')}
                />
              </div>
            </div>

            <div>
              <label className="label">Address *</label>
              <textarea
                className="input"
                rows={3}
                {...register('address', { required: 'Address is required' })}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label className="label">Reason for Visit</label>
              <textarea
                className="input"
                rows={2}
                {...register('reason_for_visit')}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : (patient ? 'Update Patient' : 'Add Patient')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientModal;