import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import axios from "axios";

interface Department {
  id: number;
  name: string;
}

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: "staff" | "doctor";
  doctor_profile?: {
    department_id: number;
    full_name: string;
    email: string;
    phone: string;
    avg_consultation_minutes: number;
  };
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      role: "staff",
    },
  });

  const watchedRole = watch("role");
  const watchedName = watch("name");
  const watchedEmail = watch("email");

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Auto-fill doctor profile when role is doctor
  useEffect(() => {
    if (watchedRole === "doctor" && watchedName) {
      const nameWithoutDr = watchedName.replace(/^Dr\.\s*/i, "");
      const doctorFullName = nameWithoutDr ? `Dr. ${nameWithoutDr}` : "";
      setValue("doctor_profile.full_name", doctorFullName);
    }
  }, [watchedName, watchedRole, setValue]);

  useEffect(() => {
    if (watchedRole === "doctor" && watchedEmail) {
      setValue("doctor_profile.email", watchedEmail);
    }
  }, [watchedEmail, watchedRole, setValue]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/departments");
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      setError("");

      await axios.post("http://localhost:8000/api/register", data);

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Registration Submitted!
          </h2>
          <p className="text-gray-600 mb-4">
            Your registration has been submitted successfully. Please wait for
            admin approval before you can log in.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-700 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Roxas Memorial <span className="text-blue-700">Provincial Hospital</span>
          </h1>
          <p className="mt-2 text-gray-600">Healthcare Excellence Through Innovation</p>
          <p className="mt-1 text-sm text-gray-500">Staff & Doctor Registration</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am registering as *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    {...register("role")}
                    value="staff"
                    className="mr-3"
                  />
                  <span className="font-medium">Staff</span>
                </label>
                <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    {...register("role")}
                    value="doctor"
                    className="mr-3"
                  />
                  <span className="font-medium">Doctor</span>
                </label>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Basic Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  {...register("name", { required: "Name is required" })}
                  className="input"
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                    className="input pr-10"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("password_confirmation", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === watch("password") || "Passwords do not match",
                    })}
                    className="input pr-10"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password_confirmation.message}
                  </p>
                )}
              </div>
            </div>

            {/* Doctor Profile Fields */}
            {watchedRole === "doctor" && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-gray-900">Doctor Profile</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department *
                    </label>
                    <select
                      {...register("doctor_profile.department_id", {
                        required: watchedRole === "doctor",
                        valueAsNumber: true,
                      })}
                      className="input"
                    >
                      <option value="">Select department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Doctor Full Name *
                    </label>
                    <input
                      type="text"
                      {...register("doctor_profile.full_name", {
                        required: watchedRole === "doctor",
                      })}
                      className="input"
                      placeholder="Dr. Full Name"
                    />
                  </div>

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
                      defaultValue={15}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <Link
                to="/login"
                className="text-sm text-primary hover:text-primary-dark"
              >
                Already have an account? Login
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  "Register"
                )}
              </button>
            </div>

            <p className="text-xs text-center text-gray-500 mt-4">
              Your registration will be reviewed by an administrator before you can
              access the system.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
