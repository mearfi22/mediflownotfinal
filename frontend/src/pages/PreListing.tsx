import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { preRegistrationApi } from '../services/api';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface FormData {
  full_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  contact_number: string;
  civil_status?: string;
  religion?: string;
  philhealth_id?: string;
  reason_for_visit: string;
}

const PreListing: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      await preRegistrationApi.create(data);
      setSubmitted(true);
      reset();
    } catch (error) {
      console.error('Error submitting pre-registration:', error);
      setError('Failed to submit pre-registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for pre-registering with Roxas Memorial Provincial Hospital. 
              Your request has been submitted successfully and is pending approval.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>What's next?</strong><br />
                Our staff will review your information and contact you with your queue number and appointment details.
              </p>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="btn-primary w-full"
            >
              Submit Another Registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">R</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Pre-registration</h2>
          <p className="text-gray-600">Roxas Memorial Provincial Hospital</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="full_name"
                type="text"
                placeholder="Enter your full name"
                {...register('full_name', { required: 'Full name is required' })}
                className="input"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                id="date_of_birth"
                type="date"
                {...register('date_of_birth', { required: 'Date of birth is required' })}
                className="input"
              />
              {errors.date_of_birth && (
                <p className="mt-1 text-sm text-red-600">{errors.date_of_birth.message}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                id="gender"
                {...register('gender', { required: 'Gender is required' })}
                className="input"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>

            {/* Contact Number */}
            <div>
              <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number *
              </label>
              <input
                id="contact_number"
                type="tel"
                placeholder="e.g., +63 912 345 6789"
                {...register('contact_number', { required: 'Contact number is required' })}
                className="input"
              />
              {errors.contact_number && (
                <p className="mt-1 text-sm text-red-600">{errors.contact_number.message}</p>
              )}
            </div>

            {/* Civil Status */}
            <div>
              <label htmlFor="civil_status" className="block text-sm font-medium text-gray-700 mb-1">
                Civil Status
              </label>
              <select
                id="civil_status"
                {...register('civil_status')}
                className="input"
              >
                <option value="">Select civil status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>

            {/* Religion */}
            <div>
              <label htmlFor="religion" className="block text-sm font-medium text-gray-700 mb-1">
                Religion
              </label>
              <input
                id="religion"
                type="text"
                placeholder="Enter your religion (optional)"
                {...register('religion')}
                className="input"
              />
            </div>

            {/* PhilHealth ID */}
            <div>
              <label htmlFor="philhealth_id" className="block text-sm font-medium text-gray-700 mb-1">
                PhilHealth ID
              </label>
              <input
                id="philhealth_id"
                type="text"
                placeholder="Enter PhilHealth ID (optional)"
                {...register('philhealth_id')}
                className="input"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <textarea
                id="address"
                rows={3}
                placeholder="Enter your complete address"
                {...register('address', { required: 'Address is required' })}
                className="input"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            {/* Reason for Visit */}
            <div className="md:col-span-2">
              <label htmlFor="reason_for_visit" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Visit *
              </label>
              <textarea
                id="reason_for_visit"
                rows={3}
                placeholder="Please describe the reason for your visit"
                {...register('reason_for_visit', { required: 'Reason for visit is required' })}
                className="input"
              />
              {errors.reason_for_visit && (
                <p className="mt-1 text-sm text-red-600">{errors.reason_for_visit.message}</p>
              )}
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Privacy Notice:</strong> Your personal information will be used solely for healthcare purposes 
              and appointment management. We comply with data privacy regulations and will not share your information 
              with third parties without your consent.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit Pre-registration'
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Need help? Contact us at <strong>+63 123 456 7890</strong> or <strong>info@careconnect.ph</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreListing;