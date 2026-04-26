import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlusIcon,
  CameraIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  StarIcon,
  CalendarIcon,
  LanguageIcon,
  VideoCameraIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PlusIcon,
  XMarkIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

const AddDoctors = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personal");
  const [profileImage, setProfileImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form validation errors
  const [errors, setErrors] = useState({});
  
  // const DOCTOR_API = 'http://localhost:8081/api/doctors';
  const DOCTOR_API = 'https://ai-hospital-doctor-lshb.onrender.com/api/doctors';

  // Form data
  const [formData, setFormData] = useState({
    // Personal Information
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    pincode: "",

    // Professional Information
    specialization: "",
    department: "",
    qualification: "",
    experience: "",
    registrationNumber: "",

    // Work Details
    consultationFee: "",
    consultationTypes: [],
    languages: [],

    // Schedule
    workingDays: [],
    workingHours: {
      monday: { start: "", end: "" },
      tuesday: { start: "", end: "" },
      wednesday: { start: "", end: "" },
      thursday: { start: "", end: "" },
      friday: { start: "", end: "" },
      saturday: { start: "", end: "" },
      sunday: { start: "", end: "" },
    },

    // Additional Information
    about: "",
    awards: "",
    specializations: "",
    publications: "",
    profileImage: "",
  });

  const tabs = [
    { id: "personal", name: "Personal Info", icon: UserIcon },
    { id: "professional", name: "Professional", icon: AcademicCapIcon },
    { id: "schedule", name: "Schedule", icon: CalendarIcon },
    { id: "additional", name: "Additional", icon: DocumentTextIcon },
  ];

  const departments = [
    "Cardiology",
    "General Medicine",
    "Orthopedics",
    "Dermatology",
    "Neurology",
    "Pediatrics",
    "ENT",
    "Obstetrics & Gynecology",
    "Ophthalmology",
    "Psychiatry",
    "Radiology",
    "Anesthesiology",
  ];

  const specializationOptions = [
    "Cardiologist",
    "General Physician",
    "Orthopedic Surgeon",
    "Dermatologist",
    "Neurologist",
    "Pediatrician",
    "ENT Specialist",
    "Gynecologist",
    "Ophthalmologist",
    "Psychiatrist",
    "Radiologist",
    "Anesthesiologist",
  ];

  const languageOptions = [
    "English",
    "Hindi",
    "Tamil",
    "Telugu",
    "Malayalam",
    "Kannada",
    "Bengali",
    "Marathi",
    "Gujarati",
    "Punjabi",
    "Urdu",
    "Arabic",
  ];

  const weekDays = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (
        name === "consultationTypes" ||
        name === "languages" ||
        name === "workingDays"
      ) {
        setFormData((prev) => ({
          ...prev,
          [name]: checked
            ? [...prev[name], value]
            : prev[name].filter((item) => item !== value),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleWorkingHoursChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Basic file size check (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("Image exceeds 5MB. Please choose a smaller file.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        // also store in formData for payload
        setFormData((prev) => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateTab = (tabId) => {
    const newErrors = {};

    switch (tabId) {
      case "personal":
        if (!formData.name) newErrors.name = "Name is required";
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.phone) newErrors.phone = "Phone number is required";
        if (!formData.dateOfBirth)
          newErrors.dateOfBirth = "Date of birth is required";
        if (!formData.gender) newErrors.gender = "Gender is required";
        if (!formData.address) newErrors.address = "Address is required";
        if (!formData.city) newErrors.city = "City is required";
        if (!formData.state) newErrors.state = "State is required";
        break;

      case "professional":
        if (!formData.specialization)
          newErrors.specialization = "Specialization is required";
        if (!formData.department)
          newErrors.department = "Department is required";
        if (!formData.qualification)
          newErrors.qualification = "Qualification is required";
        if (!formData.experience)
          newErrors.experience = "Experience is required";
        if (!formData.registrationNumber)
          newErrors.registrationNumber = "Registration number is required";
        if (!formData.consultationFee)
          newErrors.consultationFee = "Consultation fee is required";
        if (formData.consultationTypes.length === 0)
          newErrors.consultationTypes = "Select at least one consultation type";
        if (formData.languages.length === 0)
          newErrors.languages = "Select at least one language";
        break;

      case "schedule":
        if (formData.workingDays.length === 0)
          newErrors.workingDays = "Select at least one working day";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextTab = () => {
    // console.log(localStorage.getItem('token'), "Token");
    const user = localStorage.getItem("user");
    // console.log(user, "User Details")
    const token = localStorage.getItem("token");
    console.log(token, "User Token");

    if (validateTab(activeTab)) {
      const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1].id);
      }
    }
  };

  const handlePreviousTab = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all tabs; if any tab fails, open that tab and stop
    for (const tab of tabs) {
      if (!validateTab(tab.id)) {
        setActiveTab(tab.id);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Bearer token get from localStorage (adjust the key if you store token with different name)
      let token = localStorage.getItem("token");
      

      if (token) {
        token = token.replace(/"/g, "");
      }


      console.log(token, "Submitting Token");

      if (!token) {
        alert("Token not found in localStorage. Please login again.");
        setIsSubmitting(false);
        return;
      }

      // Prepare payload exactly like backend expects
      const payload = {
        ...formData,
        consultationFee: formData.consultationFee
          ? Number(formData.consultationFee)
          : 0,
        profileImage: profileImage || formData.profileImage || "",
      };

      // optional: remove empty workingHours entries for days that are not selected
      const cleanedWorkingHours = {};
      for (const day of weekDays) {
        if (formData.workingDays.includes(day)) {
          cleanedWorkingHours[day] = payload.workingHours[day] || {
            start: "",
            end: "",
          };
        }
      }
      payload.workingHours = cleanedWorkingHours;

      const response = await fetch(DOCTOR_API + "/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        // attempt to parse JSON error message
        let message = errorText;
        try {
          const parsed = JSON.parse(errorText);
          message = parsed.message || JSON.stringify(parsed);
        } catch (err) {
          // keep raw text
        }
        alert("Failed to add doctor: " + message);
        setIsSubmitting(false);
        return;
      }

      // If success
      setShowSuccess(true);

      // Optionally reset form or navigate
      setTimeout(() => {
        navigate("/doctors");
      }, 1500);
    } catch (err) {
      console.error("Submission Error:", err);
      alert(
        "Something went wrong while submitting. Check console for details."
      );
      setIsSubmitting(false);
    }
  };

  const getTabCompletionStatus = (tabId) => {
    switch (tabId) {
      case "personal":
        return (
          formData.name &&
          formData.email &&
          formData.phone &&
          formData.dateOfBirth &&
          formData.gender &&
          formData.address
        );
      case "professional":
        return (
          formData.specialization &&
          formData.department &&
          formData.qualification &&
          formData.experience &&
          formData.consultationTypes.length > 0
        );
      case "schedule":
        return formData.workingDays.length > 0;
      case "additional":
        return true; // Additional info is optional
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-pink-500 shadow-xl">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/doctors")}
                className="p-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-200 group"
              >
                <ArrowLeftIcon className="h-5 w-5 text-white group-hover:-translate-x-1 transition-transform" />
              </button>
              <div className="text-white">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  Add New Doctor
                  <UserPlusIcon className="h-7 w-7" />
                </h1>
                <p className="text-sky-100 mt-1">
                  Fill in the details to add a new doctor to the system
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-sky-500 to-pink-500 shadow-lg"
                      : getTabCompletionStatus(tab.id)
                      ? "bg-green-500 shadow-md"
                      : "bg-white shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          activeTab === tab.id || getTabCompletionStatus(tab.id)
                            ? "bg-white/20"
                            : "bg-gray-100"
                        }`}
                      >
                        <tab.icon
                          className={`h-6 w-6 ${
                            activeTab === tab.id ||
                            getTabCompletionStatus(tab.id)
                              ? "text-white"
                              : "text-gray-600"
                          }`}
                        />
                      </div>
                      <span
                        className={`font-medium ${
                          activeTab === tab.id || getTabCompletionStatus(tab.id)
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {tab.name}
                      </span>
                    </div>
                    {getTabCompletionStatus(tab.id) && (
                      <CheckCircleIcon className="h-5 w-5 text-white" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Image Section */}
          <div className="p-8 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
              <div className="relative group">
                <div className="h-40 w-40 rounded-2xl bg-gradient-to-br from-sky-400 to-pink-400 p-1 shadow-xl">
                  <div className="h-full w-full rounded-xl bg-white overflow-hidden">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <UserIcon className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                <label className="absolute -bottom-2 -right-2 bg-gradient-to-r from-sky-500 to-pink-500 text-white p-3 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
                  <CameraIcon className="h-6 w-6" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-center lg:text-left">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Doctor Photo
                </h3>
                <p className="text-gray-600 mb-4">
                  Upload a professional photo for the doctor's profile
                </p>
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  <span className="px-4 py-2 bg-sky-100 text-sky-700 rounded-full text-sm font-medium">
                    JPG, PNG formats
                  </span>
                  <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                    Max 5MB size
                  </span>
                  <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    Professional photo preferred
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Personal Information Tab */}
            {activeTab === "personal" && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-sky-500 to-pink-500 rounded-xl">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Personal Information
                    </h3>
                    <p className="text-gray-600">
                      Basic details about the doctor
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all ${
                          errors.name
                            ? "border-red-500 focus:border-red-600"
                            : "border-gray-200 focus:border-sky-500 hover:border-gray-300"
                        } focus:outline-none focus:ring-4 focus:ring-sky-500/20`}
                        placeholder="Dr. First Name Last Name"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all ${
                          errors.email
                            ? "border-red-500 focus:border-red-600"
                            : "border-gray-200 focus:border-sky-500 hover:border-gray-300"
                        } focus:outline-none focus:ring-4 focus:ring-sky-500/20`}
                        placeholder="doctor@hospital.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all ${
                          errors.phone
                            ? "border-red-500 focus:border-red-600"
                            : "border-gray-200 focus:border-sky-500 hover:border-gray-300"
                        } focus:outline-none focus:ring-4 focus:ring-sky-500/20`}
                        placeholder="+91 xxxxx xxxxx"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <CalendarIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all ${
                          errors.dateOfBirth
                            ? "border-red-500 focus:border-red-600"
                            : "border-gray-200 focus:border-sky-500 hover:border-gray-300"
                        } focus:outline-none focus:ring-4 focus:ring-sky-500/20`}
                      />
                    </div>
                    {errors.dateOfBirth && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.dateOfBirth}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                        errors.gender
                          ? "border-red-500 focus:border-red-600"
                          : "border-gray-200 focus:border-sky-500 hover:border-gray-300"
                      } focus:outline-none focus:ring-4 focus:ring-sky-500/20`}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPinIcon className="h-5 w-5 text-gray-400 absolute left-4 top-4" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all ${
                          errors.address
                            ? "border-red-500 focus:border-red-600"
                            : "border-gray-200 focus:border-sky-500 hover:border-gray-300"
                        } focus:outline-none focus:ring-4 focus:ring-sky-500/20`}
                        placeholder="Enter complete address"
                      />
                    </div>
                    {errors.address && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                        errors.city
                          ? "border-red-500 focus:border-red-600"
                          : "border-gray-200 focus:border-sky-500 hover:border-gray-300"
                      } focus:outline-none focus:ring-4 focus:ring-sky-500/20`}
                      placeholder="Enter city"
                    />
                    {errors.city && (
                      <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                        errors.state
                          ? "border-red-500 focus:border-red-600"
                          : "border-gray-200 focus:border-sky-500 hover:border-gray-300"
                      } focus:outline-none focus:ring-4 focus:ring-sky-500/20`}
                      placeholder="Enter state"
                    />
                    {errors.state && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.state}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/20 transition-all"
                      placeholder="xxxxxx"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Professional Information Tab */}
            {activeTab === "professional" && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <AcademicCapIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Professional Information
                    </h3>
                    <p className="text-gray-600">
                      Qualifications and work details
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Specialization <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                        errors.specialization
                          ? "border-red-500 focus:border-red-600"
                          : "border-gray-200 focus:border-purple-500 hover:border-gray-300"
                      } focus:outline-none focus:ring-4 focus:ring-purple-500/20`}
                    >
                      <option value="">Select Specialization</option>
                      {specializationOptions.map((specialization) => (
                        <option key={specialization} value={specialization}>
                          {specialization}
                        </option>
                      ))}
                    </select>
                    {errors.specialization && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.specialization}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                        errors.department
                          ? "border-red-500 focus:border-red-600"
                          : "border-gray-200 focus:border-purple-500 hover:border-gray-300"
                      } focus:outline-none focus:ring-4 focus:ring-purple-500/20`}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    {errors.department && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.department}
                      </p>
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Qualification <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                        errors.qualification
                          ? "border-red-500 focus:border-red-600"
                          : "border-gray-200 focus:border-purple-500 hover:border-gray-300"
                      } focus:outline-none focus:ring-4 focus:ring-purple-500/20`}
                      placeholder="e.g., MBBS, MD (Cardiology), DM"
                    />
                    {errors.qualification && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.qualification}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Experience <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                        errors.experience
                          ? "border-red-500 focus:border-red-600"
                          : "border-gray-200 focus:border-purple-500 hover:border-gray-300"
                      } focus:outline-none focus:ring-4 focus:ring-purple-500/20`}
                      placeholder="e.g., 15 years"
                    />
                    {errors.experience && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.experience}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Registration Number{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                        errors.registrationNumber
                          ? "border-red-500 focus:border-red-600"
                          : "border-gray-200 focus:border-purple-500 hover:border-gray-300"
                      } focus:outline-none focus:ring-4 focus:ring-purple-500/20`}
                      placeholder="Medical registration number"
                    />
                    {errors.registrationNumber && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.registrationNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Consultation Fee (₹){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <CurrencyRupeeIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        name="consultationFee"
                        value={formData.consultationFee}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all ${
                          errors.consultationFee
                            ? "border-red-500 focus:border-red-600"
                            : "border-gray-200 focus:border-purple-500 hover:border-gray-300"
                        } focus:outline-none focus:ring-4 focus:ring-purple-500/20`}
                        placeholder="1500"
                      />
                    </div>
                    {errors.consultationFee && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.consultationFee}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Consultation Types <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          name="consultationTypes"
                          value="In-person"
                          checked={formData.consultationTypes.includes(
                            "In-person"
                          )}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <UserGroupIcon className="h-5 w-5 text-gray-600 ml-3 mr-2" />
                        <span className="text-sm font-medium">
                          In-person Consultation
                        </span>
                      </label>
                      <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          name="consultationTypes"
                          value="Video"
                          checked={formData.consultationTypes.includes("Video")}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <VideoCameraIcon className="h-5 w-5 text-gray-600 ml-3 mr-2" />
                        <span className="text-sm font-medium">
                          Video Consultation
                        </span>
                      </label>
                    </div>
                    {errors.consultationTypes && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.consultationTypes}
                      </p>
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Languages <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {languageOptions.map((lang) => (
                        <label key={lang} className="flex items-center">
                          <input
                            type="checkbox"
                            name="languages"
                            value={lang}
                            checked={formData.languages.includes(lang)}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm">{lang}</span>
                        </label>
                      ))}
                    </div>
                    {errors.languages && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.languages}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === "schedule" && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl">
                    <CalendarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Schedule & Availability
                    </h3>
                    <p className="text-gray-600">Set working days and hours</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Working Days <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {weekDays.map((day) => (
                      <label
                        key={day}
                        className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          name="workingDays"
                          value={day}
                          checked={formData.workingDays.includes(day)}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm font-medium capitalize">
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.workingDays && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.workingDays}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Working Hours
                  </label>
                  <div className="space-y-4">
                    {weekDays.map(
                      (day) =>
                        formData.workingDays.includes(day) && (
                          <div
                            key={day}
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                          >
                            <span className="w-24 font-medium capitalize">
                              {day}
                            </span>
                            <div className="flex items-center gap-2">
                              <ClockIcon className="h-5 w-5 text-gray-400" />
                              <input
                                type="time"
                                value={formData.workingHours[day].start}
                                onChange={(e) =>
                                  handleWorkingHoursChange(
                                    day,
                                    "start",
                                    e.target.value
                                  )
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                            <span className="text-gray-500">to</span>
                            <div className="flex items-center gap-2">
                              <ClockIcon className="h-5 w-5 text-gray-400" />
                              <input
                                type="time"
                                value={formData.workingHours[day].end}
                                onChange={(e) =>
                                  handleWorkingHoursChange(
                                    day,
                                    "end",
                                    e.target.value
                                  )
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                          </div>
                        )
                    )}
                  </div>
                  {formData.workingDays.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        Select working days to set schedule
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Information Tab */}
            {activeTab === "additional" && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                    <DocumentTextIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Additional Information
                    </h3>
                    <p className="text-gray-600">
                      Optional details about the doctor
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      About
                    </label>
                    <textarea
                      name="about"
                      value={formData.about}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all"
                      placeholder="Brief description about the doctor's expertise and approach..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Awards & Achievements
                    </label>
                    <textarea
                      name="awards"
                      value={formData.awards}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all"
                      placeholder="List any awards or achievements (one per line)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Special Areas of Expertise
                    </label>
                    <textarea
                      name="specializations"
                      value={formData.specializations}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all"
                      placeholder="E.g., Minimally invasive surgery, Pediatric cardiology..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Publications
                    </label>
                    <textarea
                      name="publications"
                      value={formData.publications}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all"
                      placeholder="List any research publications or papers..."
                    />
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Form Actions */}
          <div className="p-8 bg-gradient-to-r from-gray-50 to-gray-100 border-t">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex gap-3">
                {activeTab !== tabs[0].id && (
                  <button
                    type="button"
                    onClick={handlePreviousTab}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-white hover:border-gray-400 transition-all flex items-center gap-2"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                    <span>Previous</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => navigate("/doctors")}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-white hover:border-gray-400 transition-all"
                >
                  Cancel
                </button>
              </div>

              <div className="flex gap-3">
                {activeTab === tabs[tabs.length - 1].id ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-sky-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Adding Doctor...</span>
                      </>
                    ) : (
                      <>
                        <UserPlusIcon className="h-5 w-5" />
                        <span>Add Doctor</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextTab}
                    className="px-8 py-3 bg-gradient-to-r from-sky-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 font-semibold"
                  >
                    <span>Next Step</span>
                    <ArrowLeftIcon className="h-5 w-5 rotate-180" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-sky-100 rounded-lg">
                <UserIcon className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  Personal Details
                </h4>
                <p className="text-sm text-gray-600">
                  Ensure all contact information is accurate for easy
                  communication
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <AcademicCapIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  Professional Info
                </h4>
                <p className="text-sm text-gray-600">
                  Add complete qualifications to build patient trust
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Schedule</h4>
                <p className="text-sm text-gray-600">
                  Set accurate working hours for appointment scheduling
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center transform scale-100 transition-all">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <CheckCircleIcon className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-3">
              Doctor Added Successfully!
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              The doctor has been added to the system. Redirecting to doctors
              list...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-500 border-t-transparent"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddDoctors;
