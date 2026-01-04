import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { patientsApi, queueApi } from "../services/api";
import { Patient, Department, Doctor } from "../types";

interface PatientModalProps {
  patient?: Patient | null;
  onClose: () => void;
}

interface PatientFormData {
  last_name: string;
  first_name: string;
  middle_name?: string;
  date_of_birth: string;
  age: string;
  sex: "male" | "female";
  birthplace: string;
  nationality: string;
  civil_status: string;
  spouse_name?: string;
  religion?: string;
  occupation?: string;
  address: string;
  contact_number: string;
  philhealth_id?: string;
  reason_for_visit: string;
  department_id?: number;
  doctor_id?: number;
  priority?: string;
}

const PatientModal: React.FC<PatientModalProps> = ({ patient, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PatientFormData>({
    defaultValues: patient
      ? {
          last_name: patient.last_name,
          first_name: patient.first_name,
          middle_name: patient.middle_name || "",
          date_of_birth: patient.date_of_birth.split('T')[0], // Ensure YYYY-MM-DD format
          age: patient.age,
          sex: patient.gender === "other" ? "male" : patient.gender,
          birthplace: patient.birthplace,
          nationality: patient.nationality,
          civil_status: patient.civil_status,
          spouse_name: patient.spouse_name || "",
          religion: patient.religion || "",
          occupation: patient.occupation || "",
          address: patient.address,
          contact_number: patient.contact_number,
          philhealth_id: patient.philhealth_id || "",
          reason_for_visit: patient.reason_for_visit || "",
          department_id: patient.department_id || undefined,
          doctor_id: patient.doctor_id || undefined,
          priority: patient.priority || "regular",
        }
      : { priority: "regular" },
  });

  const watchedDateOfBirth = watch("date_of_birth");
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
        
        // If editing a patient with a department, filter doctors immediately
        if (patient?.department_id) {
          const filtered = doctorsRes.data.filter(
            (doctor: any) => doctor.department_id === patient.department_id
          );
          setFilteredDoctors(filtered);
        } else {
          setFilteredDoctors(doctorsRes.data);
        }
      } catch (err) {
        console.error("Error fetching departments/doctors:", err);
      }
    };

    fetchData();
  }, [patient]);

  // Filter doctors based on selected department
  useEffect(() => {
    if (watchedDepartmentId) {
      const filtered = doctors.filter(
        (doctor) => doctor.department_id === watchedDepartmentId
      );
      setFilteredDoctors(filtered);
      // Only reset doctor selection if the current doctor is not in the filtered list
      const currentDoctorId = watch("doctor_id");
      if (currentDoctorId) {
        const doctorInList = filtered.find(d => d.id === currentDoctorId);
        if (!doctorInList) {
          setValue("doctor_id", undefined);
        }
      }
    } else {
      setFilteredDoctors(doctors);
    }
  }, [watchedDepartmentId, doctors, setValue, watch]);

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

  const onSubmit = async (data: PatientFormData) => {
    setLoading(true);
    setError("");

    try {
      // Map sex back to gender for API compatibility
      const apiData: any = {
        ...data,
        gender: data.sex,
      };
      delete apiData.sex;

      if (patient) {
        await patientsApi.update(patient.id, apiData);
      } else {
        await patientsApi.create(apiData);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-4 sm:pt-10 px-4">
      <div className="relative p-4 sm:p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {patient ? "Edit Patient" : "Add New Patient"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information Section */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                Personal Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    className="input"
                    placeholder="Enter last name"
                    {...register("last_name", {
                      required: "Last name is required",
                      maxLength: { value: 255, message: "Last name too long" },
                    })}
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
                    className="input"
                    placeholder="Enter first name"
                    {...register("first_name", {
                      required: "First name is required",
                      maxLength: { value: 255, message: "First name too long" },
                    })}
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
                    className="input"
                    placeholder="Enter middle name (optional)"
                    {...register("middle_name", {
                      maxLength: {
                        value: 255,
                        message: "Middle name too long",
                      },
                    })}
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
                    className="input"
                    {...register("date_of_birth", {
                      required: "Date of birth is required",
                    })}
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
                    className="input bg-gray-50 cursor-not-allowed"
                    placeholder="Calculated automatically"
                    readOnly
                    {...register("age", {
                      required: "Age is required",
                      maxLength: { value: 10, message: "Age too long" },
                    })}
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
                    className="input"
                    {...register("sex", { required: "Sex is required" })}
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
                    className="input"
                    placeholder="Enter birthplace"
                    {...register("birthplace", {
                      required: "Birthplace is required",
                      maxLength: { value: 255, message: "Birthplace too long" },
                    })}
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
                    className="input"
                    placeholder="Enter nationality"
                    {...register("nationality", {
                      required: "Nationality is required",
                      maxLength: {
                        value: 100,
                        message: "Nationality too long",
                      },
                    })}
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
                    className="input"
                    {...register("civil_status", {
                      required: "Civil status is required",
                    })}
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
                    className="input"
                    placeholder="Enter spouse name (if married)"
                    {...register("spouse_name", {
                      maxLength: {
                        value: 255,
                        message: "Spouse name too long",
                      },
                    })}
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
                    className="input"
                    {...register("religion", {
                      maxLength: { value: 100, message: "Religion too long" },
                    })}
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
                    className="input"
                    placeholder="Enter your occupation (optional)"
                    {...register("occupation", {
                      maxLength: { value: 255, message: "Occupation too long" },
                    })}
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
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                Contact Information
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    className="input"
                    placeholder="e.g., +63 912 345 6789"
                    {...register("contact_number", {
                      required: "Contact number is required",
                      maxLength: {
                        value: 20,
                        message: "Contact number too long",
                      },
                    })}
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
                    className="input"
                    placeholder="Enter PhilHealth ID (optional)"
                    {...register("philhealth_id", {
                      maxLength: {
                        value: 255,
                        message: "PhilHealth ID too long",
                      },
                    })}
                  />
                  {errors.philhealth_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.philhealth_id.message}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="lg:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Complete Address *
                  </label>
                  <textarea
                    id="address"
                    className="input"
                    rows={3}
                    placeholder="Enter your complete address"
                    {...register("address", {
                      required: "Address is required",
                      maxLength: { value: 500, message: "Address too long" },
                    })}
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
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                Medical Information
              </h4>
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
                    className="input"
                    {...register("department_id", {
                      setValueAs: (value) =>
                        value === "" || value === undefined ? undefined : Number(value),
                    })}
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
                    className="input"
                    disabled={!watchedDepartmentId}
                    {...register("doctor_id", {
                      setValueAs: (value) =>
                        value === "" || value === undefined ? undefined : Number(value),
                    })}
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
                    className="input"
                    {...register("priority")}
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
                    className="input"
                    rows={4}
                    placeholder="Please describe the reason for your visit in detail"
                    {...register("reason_for_visit", {
                      required: "Reason for visit is required",
                    })}
                  />
                  {errors.reason_for_visit && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.reason_for_visit.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
              >
                {loading
                  ? "Saving..."
                  : patient
                  ? "Update Patient"
                  : "Add Patient"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientModal;
