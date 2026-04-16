import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserMd } from "react-icons/fa";
import DoctorAssignmentModal from "./DoctorAssignmentModal";

import {
  UserGroupIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  MapPinIcon,
  HeartIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserIcon,
  BuildingOffice2Icon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// const PATIENT_API = "http://localhost:8082/api/patients";
const PATIENT_API = 'https://ai-hospital-patient-service.onrender.com/api/patients';
/** Align with backend {@code PatientModeHelper}: IP / Inpatient / admitted → display "Inpatient", else "Outpatient". */
function normalizePatientModeToDisplay(patientMode) {
  if (patientMode == null || String(patientMode).trim() === "") {
    return "Outpatient";
  }
  const m = String(patientMode)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
  if (
    m === "inpatient" ||
    m === "ip" ||
    m === "i" ||
    m === "admitted" ||
    m === "admission" ||
    m === "admit"
  ) {
    return "Inpatient";
  }
  return "Outpatient";
}

const PatientsView = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);

  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Function to handle opening the doctor assignment modal
  const handleOpenDoctorModal = (patient) => {
    setSelectedPatient(patient);
    setIsDoctorModalOpen(true);
  };

  // Function to handle doctor assignment
  const handleDoctorAssigned = async (doctor) => {
    if (!selectedPatient || !doctor) return;
    
    // Create a new array to ensure React detects state change
    const updatedPatients = patients.map((p) => {
      if (p.id === selectedPatient.id) {
        return {
          ...p,
          doctor: doctor.name || "Dr. Assignment Pending"
        };
      }
      return p;
    });
    
    setPatients(updatedPatients);
    
    // Refresh data to ensure all information is up-to-date
    setTimeout(() => {
      handleRefresh();
    }, 2000);
  };

  // Fetch patients from backend: one call returns each patient + latest visit doctor/date
  const fetchPatients = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

        const response = await axios.get(`${PATIENT_API}/list-with-latest-visit`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const processedPatients = response.data.map((row) =>
        transformPatientData(
          row.patient,
          row.latestDoctorName || "Dr. Assignment Pending",
          row.latestVisitDate
        )
      );

      setPatients(processedPatients);
      setError(null);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError(err.message || "Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  // Load patients on component mount
  useEffect(() => {
    fetchPatients();
  }, []);

  // Transform API data to match our UI structure
  const formatVisitDate = (v) => {
    if (v == null || v === "") return "—";
    if (typeof v === "string") {
      return v.length >= 10 ? v.slice(0, 10) : v;
    }
    if (Array.isArray(v) && v.length >= 3) {
      const [y, m, d] = v;
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
    return "—";
  };

  const transformPatientData = (apiPatient, doctorName, latestVisitDate) => {
    const fullName = `${apiPatient.firstName} ${apiPatient.lastName}`;

    // Calculate age from date of birth
    const calculateAge = (dob) => {
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

    // IP/OP from patientMode only (treatmentType is department/specialty, not visit mode)
    const patientType = normalizePatientModeToDisplay(apiPatient.patientMode);

    // Determine patient status (using a simple logic - can be adjusted)
    const determineStatus = () => {
      if (patientType === "Inpatient") return "Admitted";
      if (
        apiPatient.chronicDiseases &&
        apiPatient.chronicDiseases.toLowerCase().includes("critical")
      )
        return "Critical";
      return "Active";
    };

    return {
      // id: `P${apiPatient.id.toString().padStart(3, "0")}`,
      id:apiPatient.id,
      name: fullName,
      age: calculateAge(apiPatient.dateOfBirth),
      gender: apiPatient.gender,
      phone: apiPatient.phoneNumber,
      email: apiPatient.email,
      address: `${apiPatient.address}, ${apiPatient.city}`,
      bloodGroup: apiPatient.bloodGroup,
      patientType: patientType,
      department: apiPatient.treatmentType || "General Medicine",
      doctor: doctorName,
      lastVisit: formatVisitDate(latestVisitDate),
      nextAppointment:
        patientType === "Inpatient" ? "Currently Admitted" : "Not Scheduled",
      diagnosis: apiPatient.chronicDiseases || "Under Evaluation",
      treatment: apiPatient.currentMedications || "Treatment plan pending",
      status: determineStatus(),
      totalVisits: 1,
      totalSpent: 0,
      insuranceStatus: apiPatient.hasInsurance ? "Covered" : "Not Covered",
      emergencyContact: `${apiPatient.emergencyName} - ${apiPatient.emergencyPhone}`,
      medicalHistory: apiPatient.familyHistory
        ? [apiPatient.familyHistory]
        : [],
      currentMedications: apiPatient.currentMedications
        ? [apiPatient.currentMedications]
        : [],
      allergies: apiPatient.allergies ? [apiPatient.allergies] : ["None"],
      image:
        apiPatient.profileImage ||
        `https://ui-avatars.com/api/?name=${fullName.replace(
          " ",
          "+"
        )}&background=3b82f6&color=fff`,
    };
  };

  // Filter patients based on search and type
  const filteredPatients = patients.filter((patient) => {
    const idStr = String(patient.id);
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery) ||
      (patient.diagnosis &&
        patient.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      filterType === "all" ||
      (filterType === "inpatient" && patient.patientType === "Inpatient") ||
      (filterType === "outpatient" && patient.patientType === "Outpatient");

    return matchesSearch && matchesType;
  });

  // Statistics
  const stats = {
    total: patients.length,
    inpatients: patients.filter((p) => p.patientType === "Inpatient").length,
    outpatients: patients.filter((p) => p.patientType === "Outpatient").length,
    critical: patients.filter((p) => p.status === "Critical").length,
    admitted: patients.filter((p) => p.status === "Admitted").length,
    active: patients.filter((p) => p.status === "Active").length,
  };

  const handleRegisterPatient = () => {
    navigate("/patients/register");
  };

  const handleViewPatient = (patientId) => {
    console.log(patientId, "Passing id")
    navigate(`/patients/${patientId}`);
  };

  const handleEditPatient = (patientId) => {
    navigate(`/patients/edit/${patientId}`);
  };

  const handleRefresh = async () => {
    await fetchPatients();
  };

  if (loading && patients.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 mx-auto animate-spin text-sky-500" />
          <p className="mt-4 text-gray-600">Loading patients data...</p>
        </div>
      </div>
    );
  }

  if (error && patients.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md text-center">
          <ExclamationTriangleIcon className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Patients Management
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage all patient records
            </p>
          </div>
          <button
            onClick={handleRegisterPatient}
            className="bg-gradient-to-r from-sky-500 to-pink-500 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:shadow-lg transition-all transform hover:scale-105"
          >
            <UserPlusIcon className="h-5 w-5" />
            <span>Register New Patient</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-sky-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Patients</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-sky-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Inpatients</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.inpatients}
              </p>
            </div>
            <BuildingOffice2Icon className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Outpatients</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.outpatients}
              </p>
            </div>
            <UserIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Critical</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.critical}
              </p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Admitted</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.admitted}
              </p>
            </div>
            <HeartIcon className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active</p>
              <p className="text-2xl font-bold text-gray-800">{stats.active}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-teal-500" />
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, phone, or diagnosis..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Patients</option>
              <option value="inpatient">Inpatients Only</option>
              <option value="outpatient">Outpatients Only</option>
            </select>

            <button
              onClick={() =>
                setViewMode(viewMode === "table" ? "card" : "table")
              }
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {viewMode === "table" ? "Card View" : "Table View"}
            </button>

            <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2 transition-colors">
              <FunnelIcon className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center my-8">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      )}

      {/* Table View */}
      {!loading && viewMode === "table" && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnosis
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={patient.image}
                          alt={patient.name}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {patient.id} • {patient.age}Y/{patient.gender?.[0] ?? "—"} •{" "}
                            {patient.bloodGroup}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {patient.phone}
                      </div>
                      <div className="text-sm text-gray-500">
                        {patient.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          patient.patientType === "Inpatient"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {patient.patientType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.department}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {patient.diagnosis}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {patient.treatment}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.doctor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          patient.status === "Critical"
                            ? "bg-red-100 text-red-800"
                            : patient.status === "Admitted"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full mr-2 ${
                            patient.status === "Critical"
                              ? "bg-red-600"
                              : patient.status === "Admitted"
                              ? "bg-orange-600"
                              : "bg-green-600"
                          }`}
                        ></span>
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleViewPatient(patient.id)}
                          className="text-sky-600 hover:text-sky-900 transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {/* <button
                          onClick={() => handleEditPatient(patient.id)}
                          className="text-purple-600 hover:text-purple-900 transition-colors"
                          title="Edit Patient"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button> */}
                        <button
                          onClick={() => handleOpenDoctorModal(patient)}
                          className="text-teal-600 hover:text-teal-900 transition-colors"
                          title="Assign Doctor"
                        >
                          <FaUserMd className="h-5 w-5" />
                        </button>
                        {/* <button
                          className="text-teal-600 hover:text-teal-900 transition-colors"
                          title="Medical History"
                        >
                          <DocumentTextIcon className="h-5 w-5" />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Card View */}
      {!loading && viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              {/* Card Header */}
              <div
                className={`p-4 rounded-t-xl bg-gradient-to-r ${
                  patient.status === "Critical"
                    ? "from-red-500 to-pink-500"
                    : patient.status === "Admitted"
                    ? "from-orange-500 to-amber-500"
                    : "from-sky-500 to-teal-500"
                }`}
              >
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-3">
                    <img
                      className="h-12 w-12 rounded-full border-2 border-white"
                      src={patient.image}
                      alt={patient.name}
                    />
                    <div>
                      <h3 className="font-semibold">{patient.name}</h3>
                      <p className="text-sm opacity-90">
                        {patient.id} • {patient.age}Y/{patient.gender?.[0] ?? "—"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm`}
                  >
                    {patient.patientType}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    {patient.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    {patient.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {patient.address}
                  </div>
                </div>

                {/* Medical Info */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Blood Group</p>
                      <p className="font-medium text-red-600">
                        {patient.bloodGroup}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Department</p>
                      <p className="font-medium">{patient.department}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Doctor</p>
                      <p className="font-medium text-sm">{patient.doctor}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          patient.status === "Critical"
                            ? "bg-red-100 text-red-800"
                            : patient.status === "Admitted"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {patient.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Diagnosis & Treatment */}
                <div className="border-t mt-4 pt-4">
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Diagnosis</p>
                    <p className="text-sm font-medium text-gray-900">
                      {patient.diagnosis}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Treatment</p>
                    <p className="text-sm text-gray-600">{patient.treatment}</p>
                  </div>
                </div>

                {/* Additional Info for Inpatients */}
                {patient.patientType === "Inpatient" && (
                  <div className="border-t mt-4 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Ward/Room</p>
                        <p className="text-sm font-medium">
                          {patient.ward || "Not Assigned"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Admitted</p>
                        <p className="text-sm font-medium">
                          {patient.admissionDate ||
                            new Date().toISOString().split("T")[0]}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Appointments */}
                <div className="border-t mt-4 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <CalendarDaysIcon className="h-4 w-4 mr-1" />
                      Last: {patient.lastVisit}
                    </div>
                    <div className="flex items-center text-sky-600">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      Next: {patient.nextAppointment}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="border-t mt-4 pt-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-800">
                        {patient.totalVisits}
                      </p>
                      <p className="text-xs text-gray-500">Total Visits</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">
                        ₹{(patient.totalSpent / 1000).toFixed(0)}K
                      </p>
                      <p className="text-xs text-gray-500">Total Spent</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 mt-2">
                        {patient.insuranceStatus}
                      </p>
                      <p className="text-xs text-gray-500">Insurance</p>
                    </div>
                  </div>
                </div>

                {/* Medical History Preview */}
                <div className="border-t mt-4 pt-4">
                  <p className="text-xs text-gray-500 mb-2">Medical History</p>
                  <div className="flex flex-wrap gap-1">
                    {patient.medicalHistory &&
                    patient.medicalHistory.length > 0 ? (
                      <>
                        {patient.medicalHistory
                          .slice(0, 2)
                          .map((condition, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded"
                            >
                              {condition}
                            </span>
                          ))}
                        {patient.medicalHistory.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                            +{patient.medicalHistory.length - 2} more
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                        No records
                      </span>
                    )}
                  </div>
                </div>

                {/* Allergies */}
                {patient.allergies &&
                  patient.allergies.length > 0 &&
                  patient.allergies[0] !== "None" && (
                    <div className="mt-3 p-2 bg-red-50 rounded-lg">
                      <div className="flex items-center text-red-700">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                        <p className="text-xs font-medium">
                          Allergies: {patient.allergies.join(", ")}
                        </p>
                      </div>
                    </div>
                  )}

                {/* Emergency Contact */}
                <div className="border-t mt-4 pt-4">
                  <p className="text-xs text-gray-500">Emergency Contact</p>
                  <p className="text-sm text-gray-700">
                    {patient.emergencyContact}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleViewPatient(patient.id)}
                    className="flex-1 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleEditPatient(patient.id)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Edit Info
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPatients.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No patients found
          </h3>
          <p className="text-gray-500 mb-6">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={handleRegisterPatient}
            className="bg-gradient-to-r from-sky-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
          >
            Register New Patient
          </button>
        </div>
      )}

      {/* Doctor Assignment Modal */}
      {isDoctorModalOpen && selectedPatient && (
        <DoctorAssignmentModal
          isOpen={isDoctorModalOpen}
          onClose={() => setIsDoctorModalOpen(false)}
          patientId={selectedPatient.id}
          patientName={selectedPatient.name}
          onAssign={handleDoctorAssigned}
        />
      )}

      {/* Refresh Button */}
      <button
        onClick={handleRefresh}
        className="fixed bottom-6 right-6 bg-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <ArrowPathIcon className="h-6 w-6 text-gray-600" />
      </button>
    </div>
  );
};

export default PatientsView;
