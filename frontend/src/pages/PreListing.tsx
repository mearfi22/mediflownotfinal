import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { preRegistrationApi, queueApi } from "../services/api";
import { Department, Doctor } from "../types";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface FormData {
  last_name: string;
  first_name: string;
  middle_name?: string;
  address: string;
  contact_number: string;
  sex: "male" | "female";
  civil_status: string;
  spouse_name?: string;
  date_of_birth: string;
  age: string;
  birthplace: string;
  nationality: string;
  religion?: string;
  occupation?: string;
  reason_for_visit: string;
  philhealth_id?: string;
  department_id?: number;
  doctor_id?: number;
  priority?: string;
}

const PreListing: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  const watchedDepartmentId = watch("department_id");

  // Load departments and doctors on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [departmentsRes, doctorsRes] = await Promise.all([
          queueApi.getDepartments(),
          queueApi.getDoctors(),
        ]);
        setDepartments(departmentsRes.data);
        setDoctors(doctorsRes.data);
        setFilteredDoctors(doctorsRes.data);
      } catch (err) {
        console.error("Error fetching departments/doctors:", err);
      }
    };

    fetchData();
  }, []);

  // Filter doctors based on selected department
  useEffect(() => {
    if (watchedDepartmentId) {
      const filtered = doctors.filter(
        (doctor) => doctor.department_id === watchedDepartmentId
      );
      setFilteredDoctors(filtered);
      // Reset doctor selection if it's not in the filtered list
      setValue("doctor_id", undefined);
    } else {
      setFilteredDoctors(doctors);
    }
  }, [watchedDepartmentId, doctors, setValue]);

  const watchedDateOfBirth = watch("date_of_birth");

  // Calculate age automatically when date of birth changes
  useEffect(() => {
    if (watchedDateOfBirth) {
      const calculateAge = (dateOfBirth: string) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }

        return age.toString();
      };

      const calculatedAge = calculateAge(watchedDateOfBirth);
      setValue("age", calculatedAge);
    }
  }, [watchedDateOfBirth, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      await preRegistrationApi.create(data);
      setSubmitted(true);
      reset();
    } catch (error) {
      console.error("Error submitting pre-registration:", error);
      setError("Failed to submit pre-registration. Please try again.");
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Registration Submitted!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for pre-registering with Roxas Memorial Provincial
              Hospital. Your request has been submitted successfully and is
              pending approval.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>What's next?</strong>
                <br />
                Our staff will review your information and contact you with your
                queue number and appointment details.
              </p>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="btn btn-primary w-full"
            >
              Submit Another Registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-red-700 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-3xl">M</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Roxas Memorial <span className="text-blue-700">Provincial Hospital</span>
          </h1>
          <p className="text-gray-600 text-lg">Healthcare Excellence Through Innovation</p>
          <div className="mt-4 inline-block bg-blue-100 border border-blue-200 rounded-lg px-4 py-2">
            <h2 className="text-xl font-semibold text-blue-900">Patient Pre-registration</h2>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Please fill out all required fields marked with <span className="text-red-600">*</span>
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8">

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Last Name */}
              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name *
                </label>
                <input
                  id="last_name"
                  type="text"
                  placeholder="Enter last name"
                  {...register("last_name", {
                    required: "Last name is required",
                    maxLength: { value: 255, message: "Last name too long" },
                  })}
                  className="input"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.last_name.message}
                  </p>
                )}
              </div>

              {/* First Name */}
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name *
                </label>
                <input
                  id="first_name"
                  type="text"
                  placeholder="Enter first name"
                  {...register("first_name", {
                    required: "First name is required",
                    maxLength: { value: 255, message: "First name too long" },
                  })}
                  className="input"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.first_name.message}
                  </p>
                )}
              </div>

              {/* Middle Name */}
              <div>
                <label
                  htmlFor="middle_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Middle Name
                </label>
                <input
                  id="middle_name"
                  type="text"
                  placeholder="Enter middle name (optional)"
                  {...register("middle_name", {
                    maxLength: { value: 255, message: "Middle name too long" },
                  })}
                  className="input"
                />
                {errors.middle_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.middle_name.message}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label
                  htmlFor="date_of_birth"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Date of Birth *
                </label>
                <input
                  id="date_of_birth"
                  type="date"
                  {...register("date_of_birth", {
                    required: "Date of birth is required",
                  })}
                  className="input"
                />
                {errors.date_of_birth && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.date_of_birth.message}
                  </p>
                )}
              </div>

              {/* Age */}
              <div>
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Age *
                </label>
                <input
                  id="age"
                  type="text"
                  placeholder="Calculated automatically"
                  readOnly
                  {...register("age", {
                    required: "Age is required",
                    maxLength: { value: 10, message: "Age too long" },
                  })}
                  className="input bg-gray-50 cursor-not-allowed"
                  style={{ caretColor: "transparent" }}
                />
                {errors.age && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.age.message}
                  </p>
                )}
              </div>

              {/* Sex */}
              <div>
                <label
                  htmlFor="sex"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Sex *
                </label>
                <select
                  id="sex"
                  {...register("sex", { required: "Sex is required" })}
                  className="input"
                >
                  <option value="">Select sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {errors.sex && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.sex.message}
                  </p>
                )}
              </div>

              {/* Birthplace */}
              <div>
                <label
                  htmlFor="birthplace"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Birthplace *
                </label>
                <input
                  id="birthplace"
                  type="text"
                  placeholder="Enter birthplace"
                  {...register("birthplace", {
                    required: "Birthplace is required",
                    maxLength: { value: 255, message: "Birthplace too long" },
                  })}
                  className="input"
                />
                {errors.birthplace && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.birthplace.message}
                  </p>
                )}
              </div>

              {/* Nationality */}
              <div>
                <label
                  htmlFor="nationality"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nationality *
                </label>
                <input
                  id="nationality"
                  type="text"
                  placeholder="Enter nationality"
                  {...register("nationality", {
                    required: "Nationality is required",
                    maxLength: { value: 100, message: "Nationality too long" },
                  })}
                  className="input"
                />
                {errors.nationality && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.nationality.message}
                  </p>
                )}
              </div>

              {/* Civil Status */}
              <div>
                <label
                  htmlFor="civil_status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Civil Status *
                </label>
                <select
                  id="civil_status"
                  {...register("civil_status", {
                    required: "Civil status is required",
                  })}
                  className="input"
                >
                  <option value="">Select civil status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                </select>
                {errors.civil_status && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.civil_status.message}
                  </p>
                )}
              </div>

              {/* Spouse Name */}
              <div>
                <label
                  htmlFor="spouse_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Spouse Name
                </label>
                <input
                  id="spouse_name"
                  type="text"
                  placeholder="Enter spouse name (if married)"
                  {...register("spouse_name", {
                    maxLength: { value: 255, message: "Spouse name too long" },
                  })}
                  className="input"
                />
                {errors.spouse_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.spouse_name.message}
                  </p>
                )}
              </div>

              {/* Religion */}
              <div>
                <label
                  htmlFor="religion"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Religion
                </label>
                <select
                  id="religion"
                  {...register("religion", {
                    maxLength: { value: 100, message: "Religion too long" },
                  })}
                  className="input"
                >
                  <option value="">Select religion (optional)</option>
                  <option value="Catholic">Catholic</option>
                  <option value="Protestant">Protestant</option>
                  <option value="Born Again Christian">
                    Born Again Christian
                  </option>
                  <option value="Iglesia ni Cristo">Iglesia ni Cristo</option>
                  <option value="Jehovah's Witness">Jehovah's Witness</option>
                  <option value="Seventh-day Adventist">
                    Seventh-day Adventist
                  </option>
                  <option value="Baptist">Baptist</option>
                  <option value="Methodist">Methodist</option>
                  <option value="Pentecostal">Pentecostal</option>
                  <option value="Islam">Islam</option>
                  <option value="Buddhism">Buddhism</option>
                  <option value="Hinduism">Hinduism</option>
                  <option value="Judaism">Judaism</option>
                  <option value="Other Christian">Other Christian</option>
                  <option value="Other">Other</option>
                  <option value="None/Atheist">None/Atheist</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {errors.religion && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.religion.message}
                  </p>
                )}
              </div>

              {/* Occupation */}
              <div>
                <label
                  htmlFor="occupation"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Occupation
                </label>
                <input
                  id="occupation"
                  type="text"
                  placeholder="Enter your occupation (optional)"
                  {...register("occupation", {
                    maxLength: { value: 255, message: "Occupation too long" },
                  })}
                  className="input"
                />
                {errors.occupation && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.occupation.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Number */}
              <div>
                <label
                  htmlFor="contact_number"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contact Number *
                </label>
                <input
                  id="contact_number"
                  type="tel"
                  placeholder="e.g., +63 912 345 6789"
                  {...register("contact_number", {
                    required: "Contact number is required",
                    maxLength: {
                      value: 20,
                      message: "Contact number too long",
                    },
                  })}
                  className="input"
                />
                {errors.contact_number && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.contact_number.message}
                  </p>
                )}
              </div>

              {/* PhilHealth ID */}
              <div>
                <label
                  htmlFor="philhealth_id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  PhilHealth ID
                </label>
                <input
                  id="philhealth_id"
                  type="text"
                  placeholder="Enter PhilHealth ID (optional)"
                  {...register("philhealth_id", {
                    maxLength: {
                      value: 255,
                      message: "PhilHealth ID too long",
                    },
                  })}
                  className="input"
                />
                {errors.philhealth_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.philhealth_id.message}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Complete Address *
                </label>
                <textarea
                  id="address"
                  rows={3}
                  placeholder="Enter your complete address"
                  {...register("address", {
                    required: "Address is required",
                    maxLength: { value: 500, message: "Address too long" },
                  })}
                  className="input"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Medical Information Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Medical Information
            </h3>
            <div className="space-y-4">
              {/* Department Selection */}
              <div>
                <label
                  htmlFor="department_id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Department
                </label>
                <select
                  id="department_id"
                  {...register("department_id", {
                    setValueAs: (value) =>
                      value === "" || value === undefined ? undefined : Number(value),
                  })}
                  className="input"
                >
                  <option value="">Select Department (Optional)</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor Selection */}
              <div>
                <label
                  htmlFor="doctor_id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Doctor
                </label>
                <select
                  id="doctor_id"
                  {...register("doctor_id", {
                    setValueAs: (value) =>
                      value === "" || value === undefined ? undefined : Number(value),
                  })}
                  className="input"
                  disabled={!watchedDepartmentId}
                >
                  <option value="">Select Doctor (Optional)</option>
                  {filteredDoctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.full_name}
                    </option>
                  ))}
                </select>
                {!watchedDepartmentId && (
                  <p className="mt-1 text-sm text-gray-500">
                    Please select a department first
                  </p>
                )}
              </div>

              {/* Priority Selection */}
              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Priority
                </label>
                <select
                  id="priority"
                  {...register("priority")}
                  className="input"
                  defaultValue="regular"
                >
                  <option value="regular">Regular</option>
                  <option value="senior">Senior Citizen</option>
                  <option value="pwd">PWD (Person with Disability)</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              {/* Reason for Visit */}
              <div>
                <label
                  htmlFor="reason_for_visit"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Reason for Visit *
                </label>
                <textarea
                  id="reason_for_visit"
                  rows={4}
                  placeholder="Please describe the reason for your visit in detail"
                  {...register("reason_for_visit", {
                    required: "Reason for visit is required",
                  })}
                  className="input"
                />
                {errors.reason_for_visit && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.reason_for_visit.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Privacy Notice:</strong> Your personal information will be
              used solely for healthcare purposes and appointment management. We
              comply with data privacy regulations and will not share your
              information with third parties without your consent.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="btn btn-primary w-full py-3 text-lg"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                "Submit Pre-registration"
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Need help? Contact us at <strong>+63 123 456 7890</strong> or{" "}
            <strong>info@Mediqueue.ph</strong>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default PreListing;