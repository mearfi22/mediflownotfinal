import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { User, Department } from "../types";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  user?: User | null;
  departments: Department[];
}

interface FormData {
  name: string;
  email: string;
  password?: string;
  role: "admin" | "staff" | "doctor";
  doctor_profile?: {
    department_id: number;
    full_name: string;
    email?: string;
    phone?: string;
    avg_consultation_minutes?: number;
  };
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
  departments,
}) => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const watchedRole = watch("role");

  useEffect(() => {
    if (isOpen) {
      if (user) {
        reset({
          name: user.name,
          email: user.email,
          role: user.role as "admin" | "staff" | "doctor",
          doctor_profile: user.doctor
            ? {
                department_id: user.doctor.department_id,
                full_name: user.doctor.full_name,
                email: user.doctor.email || "",
                phone: user.doctor.phone || "",
                avg_consultation_minutes: user.doctor.avg_consultation_minutes,
              }
            : undefined,
        });
      } else {
        reset({
          name: "",
          email: "",
          password: "",
          role: "staff",
        });
      }
    }
  }, [isOpen, user, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await onSave(data);
      onClose();
    } catch (error: any) {
      console.error("Error saving user:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to save user. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {user ? "Edit User Account" : "Create New User Account"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Basic Information</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  {...register("name", { required: "Name is required" })}
                  className="input"
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className="input"
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {!user && "*"}
                </label>
                <input
                  type="password"
                  {...register("password", {
                    required: !user ? "Password is required" : false,
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className="input"
                  placeholder={user ? "Leave blank to keep current" : "Enter password"}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  {...register("role", { required: "Role is required" })}
                  className="input"
                >
                  <option value="staff">Staff</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.role.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Doctor Profile (shown only for doctors) */}
          {watchedRole === "doctor" && (
            <div className="space-y-4 border-t pt-6">
              <h4 className="font-semibold text-gray-900">Doctor Profile</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Doctor Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doctor Full Name *
                  </label>
                  <input
                    type="text"
                    {...register("doctor_profile.full_name", {
                      required:
                        watchedRole === "doctor"
                          ? "Doctor full name is required"
                          : false,
                    })}
                    className="input"
                    placeholder="Dr. John Doe"
                  />
                  {errors.doctor_profile?.full_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.doctor_profile.full_name.message}
                    </p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    {...register("doctor_profile.department_id", {
                      required:
                        watchedRole === "doctor"
                          ? "Department is required"
                          : false,
                      valueAsNumber: true,
                    })}
                    className="input"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {errors.doctor_profile?.department_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.doctor_profile.department_id.message}
                    </p>
                  )}
                </div>

                {/* Doctor Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doctor Email
                  </label>
                  <input
                    type="email"
                    {...register("doctor_profile.email")}
                    className="input"
                    placeholder="doctor@hospital.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    {...register("doctor_profile.phone")}
                    className="input"
                    placeholder="+63 123 456 7890"
                  />
                </div>

                {/* Average Consultation Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avg Consultation Time (minutes)
                  </label>
                  <input
                    type="number"
                    {...register("doctor_profile.avg_consultation_minutes", {
                      valueAsNumber: true,
                    })}
                    className="input"
                    placeholder="15"
                    min="1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
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
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : user ? (
                "Update User"
              ) : (
                "Create User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
