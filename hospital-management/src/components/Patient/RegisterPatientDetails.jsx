import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  IdentificationIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  PencilIcon,
  PrinterIcon,
  ArrowLeftIcon,
  ShareIcon,
  ClockIcon,
  BeakerIcon,
  ShieldCheckIcon,
  HomeIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  DocumentDuplicateIcon,
  QrCodeIcon,
  CheckBadgeIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

import DoctorAssignmentModal from "./DoctorAssignmentModal";

const PatientDetails = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [activeSection, setActiveSection] = useState("overview");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);

  // Fetch patient data from API
  const fetchPatientData = async () => {
    try {
      setLoading(true);
      console.log("Fetching patient with ID:", patientId);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await axios.get(
        `http://localhost:8082/api/patients/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Response:", response.data);
      setPatient(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching patient data:", err);
      setError(err.message || "Failed to load patient data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    } else {
      setError("No patient ID provided");
      setLoading(false);
    }
  }, [patientId]);

  const calculateAge = (dob) => {
    if (!dob) return "Unknown";

    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const sections = [
    { id: "overview", name: "Overview", icon: UserIcon },
    { id: "personal", name: "Personal Info", icon: IdentificationIcon },
    { id: "contact", name: "Contact Info", icon: PhoneIcon },
    { id: "medical", name: "Medical Info", icon: HeartIcon },
    { id: "emergency", name: "Emergency", icon: ExclamationTriangleIcon },
    { id: "insurance", name: "Insurance", icon: DocumentTextIcon },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    navigate(`/patients/edit/${patientId}`);
  };

  const viewHistory = () => {
    navigate(`/patients/view_histroy/${patientId}`);
  };

  const handleOpenDoctorModal = () => {
    setIsDoctorModalOpen(true);
  };

  const handleDoctorAssigned = async (doctor) => {
    // Refresh data to ensure all information is up-to-date
    await fetchPatientData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 mx-auto animate-spin text-sky-500" />
          <p className="mt-4 text-gray-600">Loading patient information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md text-center">
          <ExclamationTriangleIcon className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Patient
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/patient")}
            className="bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600"
          >
            Return to Patient List
          </button>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md text-center">
          <ExclamationTriangleIcon className="h-16 w-16 mx-auto text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Patient Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The requested patient could not be found.
          </p>
          <button
            onClick={() => navigate("/patient")}
            className="bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600"
          >
            Return to Patient List
          </button>
        </div>
      </div>
    );
  }

  const patientImage =
    patient.profileImage ||
    `https://ui-avatars.com/api/?name=${patient.firstName}+${patient.lastName}&background=3b82f6&color=fff&size=200`;

  // Generate a formatted patient ID
  const formattedPatientId = `P${patient.id.toString().padStart(6, "0")}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-pink-500 shadow-xl">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/patient")}
                className="p-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-200 group"
              >
                <ArrowLeftIcon className="h-5 w-5 text-white group-hover:-translate-x-1 transition-transform" />
              </button>
              <div className="text-white">
                <h1 className="text-3xl font-bold">Patient Details</h1>
                <p className="text-sky-100 mt-1">
                  Complete patient information and medical records
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        {/* Patient Header Card */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              {/* Profile Image */}
              <div className="relative">
                <img
                  src={patientImage}
                  alt={`${patient.firstName} ${patient.lastName}`}
                  className="h-32 w-32 rounded-2xl shadow-lg object-cover"
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                  Active
                </div>
              </div>

              {/* Patient Basic Info */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                  <h2 className="text-3xl font-bold text-gray-800">
                    {patient.firstName} {patient.lastName}
                  </h2>
                  <div className="flex items-center justify-center lg:justify-start gap-3 flex-wrap">
                    <span className="px-4 py-1.5 bg-sky-100 text-sky-700 rounded-full text-sm font-medium">
                      ID: {formattedPatientId}
                    </span>
                    <span className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {patient.bloodGroup || "Unknown Blood Group"}
                    </span>
                    {/* Add Treatment Type Badge */}
                    {patient.treatmentType && (
                      <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {patient.treatmentType}
                      </span>
                    )}
                    {/* Add Patient Mode Badge */}
                    <span
                      className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                        patient.patientMode === "Inpatient"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {patient.patientMode || "Outpatient"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                  <div>
                    <p className="text-gray-500">Age / Gender</p>
                    <p className="font-semibold text-gray-800">
                      {calculateAge(patient.dateOfBirth)} Years /{" "}
                      {patient.gender || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-semibold text-gray-800">
                      {patient.phoneNumber || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-semibold text-gray-800">
                      {patient.email || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Registered On</p>
                    <p className="font-semibold text-gray-800">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="text-center">
                <div className="bg-white p-4 rounded-xl shadow-inner">
                  <QrCodeIcon className="h-20 w-20 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Patient QR Code</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-8 py-4 bg-white border-t flex flex-wrap gap-3">
            <button 
              onClick={handleOpenDoctorModal}
              className="px-4 py-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-all flex items-center gap-2 text-sm font-medium">
              <CalendarIcon className="h-4 w-4" />
              Book Appointment
            </button>
            <button 
              onClick={viewHistory}
              className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-all flex items-center gap-2 text-sm font-medium">
              <DocumentDuplicateIcon className="h-4 w-4" />
              Medical History
            </button>
            <button className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all flex items-center gap-2 text-sm font-medium">
              <CurrencyRupeeIcon className="h-4 w-4" />
              Billing
            </button>
            <button className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-all flex items-center gap-2 text-sm font-medium">
              <ShareIcon className="h-4 w-4" />
              Share
            </button>
            <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-2 text-sm font-medium">
              <ArrowDownTrayIcon className="h-4 w-4" />
              Download PDF
            </button>
          </div>

          {/* Treatment Status */}
          {(patient.treatmentType || patient.patientMode) && (
            <div className="mx-8 mt-4 mb-6 p-4 bg-blue-50 rounded-xl">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ClockIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">
                      Current Treatment
                    </h4>
                    <p className="text-lg font-bold text-blue-900">
                      {patient.treatmentType || "No treatment specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-blue-800">
                    Patient Status:
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      patient.patientMode === "Inpatient"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {patient.patientMode || "Outpatient"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section Tabs */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 p-2">
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeSection === section.id
                    ? "bg-gradient-to-r from-sky-500 to-pink-500 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <section.icon className="h-5 w-5" />
                <span>{section.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Overview Section */}
          {activeSection === "overview" && (
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-sky-500 to-pink-500 rounded-lg">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                Patient Overview
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Personal & Contact */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <IdentificationIcon className="h-5 w-5 text-gray-600" />
                      Basic Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">
                          {patient.firstName} {patient.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-medium">
                          {patient.dateOfBirth
                            ? new Date(patient.dateOfBirth).toLocaleDateString()
                            : "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Aadhar Number</p>
                        <p className="font-medium">
                          {patient.aadharNumber || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Occupation</p>
                        <p className="font-medium">
                          {patient.occupation || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <PhoneIcon className="h-5 w-5 text-gray-600" />
                      Contact Details
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Primary Phone</p>
                        <p className="font-medium">
                          {patient.phoneNumber || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">
                          {patient.email || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">
                          {patient.address
                            ? `${patient.address}, ${patient.city || ""}, ${
                                patient.state || ""
                              } ${patient.pincode || ""}`
                            : "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Column - Medical Summary */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <HeartIcon className="h-5 w-5 text-gray-600" />
                      Medical Summary
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Blood Group</p>
                        <p className="font-medium text-red-600">
                          {patient.bloodGroup || "Not recorded"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Patient Mode</p>
                        <p className="font-medium">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              patient.patientMode === "Inpatient"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {patient.patientMode || "Outpatient"}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Treatment Type</p>
                        <p className="font-medium">
                          {patient.treatmentType || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Height / Weight</p>
                        <p className="font-medium">
                          {patient.height
                            ? `${patient.height} cm`
                            : "Not recorded"}{" "}
                          /
                          {patient.weight
                            ? `${patient.weight} kg`
                            : "Not recorded"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Chronic Diseases
                        </p>
                        <p className="font-medium">
                          {patient.chronicDiseases || "None"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Allergies</p>
                        <p className="font-medium text-orange-600">
                          {patient.allergies || "None"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-gray-600" />
                      Emergency Contact
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Contact Name</p>
                        <p className="font-medium">
                          {patient.emergencyName || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Relationship</p>
                        <p className="font-medium">
                          {patient.emergencyRelation || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">
                          {patient.emergencyPhone || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Insurance & Stats */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <ShieldCheckIcon className="h-5 w-5 text-gray-600" />
                      Insurance Details
                    </h4>
                    {patient.hasInsurance ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Provider</p>
                          <p className="font-medium">
                            {patient.insuranceProvider}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Policy Number</p>
                          <p className="font-medium">{patient.policyNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Coverage</p>
                          <p className="font-medium">
                            {patient.coverageAmount
                              ? `₹${parseInt(
                                  patient.coverageAmount
                                ).toLocaleString()}`
                              : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Valid Until</p>
                          <p className="font-medium">
                            {patient.validUntil
                              ? new Date(
                                  patient.validUntil
                                ).toLocaleDateString()
                              : "Not specified"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No insurance information</p>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-sky-50 to-pink-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4">
                      Visit Statistics
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Total Visits
                        </span>
                        <span className="font-bold text-lg">1</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Last Visit
                        </span>
                        <span className="font-medium">Today</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Next Appointment
                        </span>
                        <span className="font-medium text-sky-600">
                          Not Scheduled
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Personal Information Section */}
          {activeSection === "personal" && (
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-sky-500 to-pink-500 rounded-lg">
                  <IdentificationIcon className="h-6 w-6 text-white" />
                </div>
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <p className="text-sm text-gray-500 mb-1">First Name</p>
                    <p className="text-lg font-medium">
                      {patient.firstName || "Not provided"}
                    </p>
                  </div>
                  <div className="border-b pb-3">
                    <p className="text-sm text-gray-500 mb-1">Last Name</p>
                    <p className="text-lg font-medium">
                      {patient.lastName || "Not provided"}
                    </p>
                  </div>
                  <div className="border-b pb-3">
                    <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
                    <p className="text-lg font-medium">
                      {patient.dateOfBirth
                        ? `${new Date(
                            patient.dateOfBirth
                          ).toLocaleDateString()} (${calculateAge(
                            patient.dateOfBirth
                          )} years)`
                        : "Not provided"}
                    </p>
                  </div>
                  <div className="border-b pb-3">
                    <p className="text-sm text-gray-500 mb-1">Gender</p>
                    <p className="text-lg font-medium">
                      {patient.gender || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <p className="text-sm text-gray-500 mb-1">Marital Status</p>
                    <p className="text-lg font-medium">
                      {patient.maritalStatus || "Not provided"}
                    </p>
                  </div>
                  <div className="border-b pb-3">
                    <p className="text-sm text-gray-500 mb-1">Occupation</p>
                    <p className="text-lg font-medium">
                      {patient.occupation || "Not provided"}
                    </p>
                  </div>
                  <div className="border-b pb-3">
                    <p className="text-sm text-gray-500 mb-1">Nationality</p>
                    <p className="text-lg font-medium">
                      {patient.nationality || "Not provided"}
                    </p>
                  </div>
                  <div className="border-b pb-3">
                    <p className="text-sm text-gray-500 mb-1">Aadhar Number</p>
                    <p className="text-lg font-medium">
                      {patient.aadharNumber || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckBadgeIcon className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">
                      Registration Details
                    </p>
                    <p className="text-sm text-blue-700">
                      Patient registered in the system
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Information Section */}
          {activeSection === "contact" && (
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <PhoneIcon className="h-6 w-6 text-white" />
                </div>
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <PhoneIcon className="h-5 w-5 text-purple-600" />
                      Phone Numbers
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Primary Phone</p>
                        <p className="text-lg font-medium">
                          {patient.phoneNumber || "Not provided"}
                        </p>
                      </div>
                      {patient.alternatePhone && (
                        <div>
                          <p className="text-sm text-gray-500">
                            Alternate Phone
                          </p>
                          <p className="text-lg font-medium">
                            {patient.alternatePhone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <EnvelopeIcon className="h-5 w-5 text-purple-600" />
                      Email Address
                    </h4>
                    <p className="text-lg font-medium">
                      {patient.email || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <HomeIcon className="h-5 w-5 text-purple-600" />
                    Address
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Street Address</p>
                      <p className="text-lg font-medium">
                        {patient.address || "Not provided"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">City</p>
                        <p className="text-lg font-medium">
                          {patient.city || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">State</p>
                        <p className="text-lg font-medium">
                          {patient.state || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pincode</p>
                      <p className="text-lg font-medium">
                        {patient.pincode || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all flex items-center justify-center gap-2 text-purple-600 font-medium">
                  <PhoneIcon className="h-5 w-5" />
                  Call Patient
                </button>
                <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all flex items-center justify-center gap-2 text-purple-600 font-medium">
                  <EnvelopeIcon className="h-5 w-5" />
                  Send Email
                </button>
                <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all flex items-center justify-center gap-2 text-purple-600 font-medium">
                  <MapPinIcon className="h-5 w-5" />
                  View on Map
                </button>
              </div>
            </div>
          )}

          {/* Medical Information Section */}
          {activeSection === "medical" && (
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
                  <HeartIcon className="h-6 w-6 text-white" />
                </div>
                Medical Information
              </h3>

              {/* Treatment Information Card */}
              <div className="bg-blue-50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-blue-600" />
                  Treatment Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Treatment Type</p>
                    <p className="text-xl font-bold text-blue-700">
                      {patient.treatmentType || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Patient Mode</p>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                          patient.patientMode === "Inpatient"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {patient.patientMode || "Outpatient"}
                      </span>
                    </div>
                  </div>
                  {patient.patientMode === "Inpatient" && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Admission Date</p>
                        <p className="text-lg font-medium">
                          {
                            new Date().toLocaleDateString() /* Replace with actual admission date if available */
                          }
                        </p>
                      </div>
                      <div>
                                               <p className="text-sm text-gray-500">
                          Estimated Discharge
                        </p>
                        <p className="text-lg font-medium">Not specified</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4">
                      Physical Measurements
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Blood Group</p>
                        <p className="text-xl font-bold text-red-600">
                          {patient.bloodGroup || "Not recorded"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">BMI</p>
                        <p className="text-xl font-bold">
                          {patient.bmi || "Not calculated"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Height</p>
                        <p className="text-lg font-medium">
                          {patient.height
                            ? `${patient.height} cm`
                            : "Not recorded"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Weight</p>
                        <p className="text-lg font-medium">
                          {patient.weight
                            ? `${patient.weight} kg`
                            : "Not recorded"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                      Allergies
                    </h4>
                    <p className="text-lg font-medium text-red-700">
                      {patient.allergies || "No known allergies"}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4">
                      Lifestyle
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Smoking</span>
                        <span className="font-medium">
                          {patient.smokingStatus || "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Alcohol</span>
                        <span className="font-medium">
                          {patient.alcoholConsumption || "Not specified"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4">
                      Chronic Diseases
                    </h4>
                    <p className="text-gray-700">
                      {patient.chronicDiseases || "None reported"}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4">
                      Current Medications
                    </h4>
                    <p className="text-gray-700 whitespace-pre-line">
                      {patient.currentMedications || "No current medications"}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4">
                      Previous Surgeries
                    </h4>
                    <p className="text-gray-700">
                      {patient.previousSurgeries || "No previous surgeries"}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4">
                      Family Medical History
                    </h4>
                    <p className="text-gray-700">
                      {patient.familyHistory || "No significant family history"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contact Section */}
          {activeSection === "emergency" && (
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                </div>
                Emergency Contact Information
              </h3>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Contact Name</p>
                      <p className="text-xl font-bold text-gray-800">
                        {patient.emergencyName || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Relationship</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {patient.emergencyRelation || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Emergency Phone
                      </p>
                      <p className="text-xl font-bold text-orange-600">
                        {patient.emergencyPhone || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Address</p>
                      <p className="text-lg font-medium text-gray-800">
                        {patient.emergencyAddress || "Same as patient address"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-white/70 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
                    <p className="text-sm text-orange-800">
                      This contact will be notified in case of medical
                      emergencies. Ensure the information is current and
                      accurate.
                    </p>
                  </div>
                </div>

                <button className="mt-6 w-full md:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                  <PhoneIcon className="h-5 w-5" />
                  Call Emergency Contact
                </button>
              </div>
            </div>
          )}

          {/* Insurance Section */}
          {activeSection === "insurance" && (
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                </div>
                Insurance Information
              </h3>

              {patient.hasInsurance ? (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Insurance Provider
                        </p>
                        <p className="text-xl font-bold text-gray-800">
                          {patient.insuranceProvider}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Policy Number
                        </p>
                        <p className="text-lg font-semibold text-gray-800">
                          {patient.policyNumber}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Coverage Amount
                        </p>
                        <p className="text-xl font-bold text-blue-600">
                          {patient.coverageAmount
                            ? `₹${parseInt(
                                patient.coverageAmount
                              ).toLocaleString()}`
                            : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Valid Until
                        </p>
                        <p className="text-lg font-semibold text-gray-800">
                          {patient.validUntil
                            ? new Date(patient.validUntil).toLocaleDateString()
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/70 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckBadgeIcon className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-800">
                            Active Coverage
                          </p>
                          <p className="text-sm text-green-700">
                            Insurance is valid and active
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white/70 rounded-lg">
                      <div className="flex items-center gap-3">
                        <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                        <div>
                          <p className="font-semibold text-blue-800">
                            Cashless Facility
                          </p>
                          <p className="text-sm text-blue-700">
                            Available at network hospitals
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="mt-6 w-full md:w-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                    <DocumentTextIcon className="h-5 w-5" />
                    View Insurance Card
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <ShieldCheckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-gray-700 mb-2">
                    No Insurance Information
                  </h4>
                  <p className="text-gray-600 mb-6">
                    This patient does not have any insurance coverage on record.
                  </p>
                  <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all">
                    Add Insurance Details
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <ClockIcon className="h-5 w-5" />
              <span>
                Last updated: {new Date().toLocaleDateString()} at{" "}
                {new Date().toLocaleTimeString()}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={viewHistory}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all flex items-center gap-2 font-medium"
              >
                <DocumentDuplicateIcon className="h-5 w-5" />
                View History
              </button>
              <button
                onClick={handleOpenDoctorModal}
                className="px-6 py-2.5 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-lg transition-all flex items-center gap-2 font-medium"
              >
                <CalendarIcon className="h-5 w-5" />
                Schedule Appointment
              </button>
              <button
                onClick={handleEdit}
                className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-pink-500 hover:from-sky-600 hover:to-pink-600 text-white rounded-lg transition-all flex items-center gap-2 font-medium"
              >
                <PencilIcon className="h-5 w-5" />
                Edit Patient Details
              </button>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-3">
          <button
            onClick={handlePrint}
            className="p-4 bg-white shadow-lg rounded-full hover:shadow-xl transition-all group"
            title="Print"
          >
            <PrinterIcon className="h-6 w-6 text-gray-600 group-hover:text-gray-800" />
          </button>
          <button
            className="p-4 bg-white shadow-lg rounded-full hover:shadow-xl transition-all group"
            title="Download PDF"
          >
            <ArrowDownTrayIcon className="h-6 w-6 text-gray-600 group-hover:text-gray-800" />
          </button>
          <button
            className="p-4 bg-gradient-to-r from-sky-500 to-pink-500 text-white shadow-lg rounded-full hover:shadow-xl transition-all"
            title="Quick Actions"
          >
            <ShareIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Doctor Assignment Modal */}
      {isDoctorModalOpen && (
        <DoctorAssignmentModal
          isOpen={isDoctorModalOpen}
          onClose={() => setIsDoctorModalOpen(false)}
          patientId={patient.id}
          patientName={`${patient.firstName} ${patient.lastName}`}
          onAssign={handleDoctorAssigned}
        />
      )}

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
};

export default PatientDetails;
