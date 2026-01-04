import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { systemSettingsApi } from "../services/api";
import {
  BuildingOfficeIcon,
  ClockIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface SystemSettings {
  id: number;
  hospital_name: string;
  hospital_address: string | null;
  hospital_phone: string | null;
  hospital_email: string | null;
  hospital_logo: string | null;
  working_hours_start: string;
  working_hours_end: string;
  average_consultation_minutes: number;
  timezone: string;
  auto_approve_preregistration: boolean;
  queue_number_prefix: string;
}

const SystemSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SystemSettings>();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await systemSettingsApi.get();
      reset(response.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SystemSettings) => {
    try {
      setSaving(true);
      await systemSettingsApi.update(data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure hospital information and system preferences
          </p>
        </div>
        {saveSuccess && (
          <div className="flex items-center text-green-600">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Hospital Information */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Hospital Information</h3>
            </div>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("hospital_name", { required: "Hospital name is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="MediQueue Hospital"
                />
                {errors.hospital_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.hospital_name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital Phone
                </label>
                <input
                  type="text"
                  {...register("hospital_phone")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+63 123 456 7890"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital Email
                </label>
                <input
                  type="email"
                  {...register("hospital_email", {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="info@mediqueue.com"
                />
                {errors.hospital_email && (
                  <p className="mt-1 text-sm text-red-600">{errors.hospital_email.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("timezone", { required: "Timezone is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Asia/Manila">Asia/Manila (UTC+8)</option>
                  <option value="Asia/Singapore">Asia/Singapore (UTC+8)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                  <option value="UTC">UTC (UTC+0)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hospital Address
              </label>
              <textarea
                {...register("hospital_address")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter hospital address"
              />
            </div>
          </div>
        </div>

        {/* Working Hours & Queue Settings */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Working Hours & Queue</h3>
            </div>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opening Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  {...register("working_hours_start", { required: "Opening time is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Closing Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  {...register("working_hours_end", { required: "Closing time is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avg. Consultation (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register("average_consultation_minutes", {
                    required: "Consultation time is required",
                    min: { value: 5, message: "Minimum 5 minutes" },
                    max: { value: 120, message: "Maximum 120 minutes" },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="15"
                />
                {errors.average_consultation_minutes && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.average_consultation_minutes.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Queue Number Prefix <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("queue_number_prefix", {
                    required: "Prefix is required",
                    maxLength: { value: 10, message: "Maximum 10 characters" },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Q"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Example: "Q" will generate Q001, Q002, etc.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* System Preferences */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <Cog6ToothIcon className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">System Preferences</h3>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register("auto_approve_preregistration")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-3 block text-sm text-gray-700">
                <span className="font-medium">Auto-approve Pre-registrations</span>
                <p className="text-gray-500">
                  Automatically approve all pre-registration requests without staff review
                </p>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettings;
