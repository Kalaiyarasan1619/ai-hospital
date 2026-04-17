import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserPlus } from "react-icons/fa";
import { XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import DoctorAssignmentModal from "./DoctorAssignmentModal";

const PATIENT_API = "https://ai-hospital-patient-service.onrender.com/api/patients";

const DashboardDoctorAssignmentModal = ({
  isOpen,
  onClose,
  preselectedPatient = null,
}) => {
  const navigate = useNavigate();
  const [searchName, setSearchName] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [allPatients, setAllPatients] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [matchedPatient, setMatchedPatient] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const prefillName = useMemo(() => {
    if (!preselectedPatient) return "";
    if (preselectedPatient.name) return preselectedPatient.name;
    const firstName = preselectedPatient.firstName || "";
    const lastName = preselectedPatient.lastName || "";
    return `${firstName} ${lastName}`.trim();
  }, [preselectedPatient]);

  useEffect(() => {
    if (!isOpen) return;
    if (!preselectedPatient) {
      setSearchName("");
      setMatchedPatient(null);
      setShowAssignModal(false);
      setSearchError("");
      setShowSuggestions(false);
      return;
    }

    const patientName = prefillName;
    setSearchName(patientName);
    setMatchedPatient({
      id: preselectedPatient.id,
      name: patientName,
      phoneNumber: preselectedPatient.phoneNumber || preselectedPatient.phone || "",
      email: preselectedPatient.email || "",
      patientMode: preselectedPatient.patientMode || "Outpatient",
      treatmentType: preselectedPatient.treatmentType || "",
    });
  }, [isOpen, preselectedPatient, prefillName]);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!isOpen) return;
      try {
        setIsSearching(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await axios.get(`${PATIENT_API}/list-with-latest-visit`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const patients = (response.data || [])
          .map((row) => row.patient)
          .filter(Boolean)
          .map((patient) => ({
            id: patient.id,
            name: `${patient.firstName || ""} ${patient.lastName || ""}`.trim(),
            phoneNumber: patient.phoneNumber || "",
            email: patient.email || "",
            patientMode: patient.patientMode || "Outpatient",
            treatmentType: patient.treatmentType || "",
          }));

        setAllPatients(patients);
        setSearchError("");
      } catch (error) {
        console.error("Error loading patients:", error);
        setSearchError(error.message || "Failed to load patient list.");
      } finally {
        setIsSearching(false);
      }
    };

    fetchPatients();
  }, [isOpen]);

  const handleCloseAll = () => {
    setShowAssignModal(false);
    onClose();
  };

  const handleSearchInputChange = (value) => {
    setSearchName(value);
    setShowSuggestions(true);
    setMatchedPatient(null);
    setSearchError("");
  };

  const handleRegisterNewPatient = () => {
    navigate("/patients/register", {
      state: {
        redirectToDashboardVisit: true,
        prefillName: searchName.trim(),
      },
    });
  };

  const filteredPatients = useMemo(() => {
    const query = searchName.trim().toLowerCase();
    if (!query) return [];
    return allPatients
      .filter((patient) => patient.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [allPatients, searchName]);

  const hasTypedValue = searchName.trim().length > 0;
  const showNoMatch = hasTypedValue && filteredPatients.length === 0 && !isSearching;

  const handleSelectPatient = (patient) => {
    setMatchedPatient(patient);
    setSearchName(patient.name);
    setShowSuggestions(false);
    setSearchError("");
  };

  const handleDoctorAssigned = () => {
    setShowAssignModal(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
            <h2 className="text-xl font-semibold">Today Patient Visit</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter Patient Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchName}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Type patient name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />

              {showSuggestions && hasTypedValue && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {isSearching ? (
                    <div className="px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      Loading patients...
                    </div>
                  ) : (
                    <>
                      {filteredPatients.map((patient) => (
                        <button
                          key={patient.id}
                          type="button"
                          onClick={() => handleSelectPatient(patient)}
                          className="w-full text-left px-4 py-3 hover:bg-sky-50 border-b border-gray-100 last:border-b-0"
                        >
                          <p className="font-medium text-gray-900">{patient.name}</p>
                          <p className="text-xs text-gray-500">
                            ID: {patient.id} {patient.phoneNumber ? `| ${patient.phoneNumber}` : ""}
                          </p>
                        </button>
                      ))}

                      {showNoMatch && (
                        <div className="px-4 py-3 bg-amber-50">
                          <p className="text-sm text-amber-800 mb-2">
                            No matching patient. Create new patient.
                          </p>
                          <button
                            type="button"
                            onClick={handleRegisterNewPatient}
                            className="px-3 py-1.5 border border-emerald-300 text-emerald-700 rounded-md hover:bg-emerald-50 transition-colors text-sm flex items-center gap-2"
                          >
                            <FaUserPlus className="h-3 w-3" />
                            New Patient
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Required: Start typing patient name and select from dropdown.
            </p>

            {searchError && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                {searchError}
              </div>
            )}

            {matchedPatient ? (
              <div className="mt-5 bg-sky-50 border border-sky-100 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Patient Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <p>
                    <span className="text-gray-500">Name: </span>
                    <span className="font-medium">{matchedPatient.name}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Patient ID: </span>
                    <span className="font-medium">{matchedPatient.id}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Phone: </span>
                    <span className="font-medium">{matchedPatient.phoneNumber || "N/A"}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Email: </span>
                    <span className="font-medium">{matchedPatient.email || "N/A"}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Patient Mode: </span>
                    <span className="font-medium">{matchedPatient.patientMode || "Outpatient"}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Treatment: </span>
                    <span className="font-medium">{matchedPatient.treatmentType || "N/A"}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-5 p-4 rounded-lg bg-amber-50 border border-amber-100">
                <p className="text-sm text-amber-800">
                  If patient is not available, register new patient and come back here.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              {/* {!matchedPatient && (
                <button
                  type="button"
                  onClick={handleRegisterNewPatient}
                  className="px-4 py-2 border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-2"
                >
                  <FaUserPlus className="h-4 w-4" />
                  Register New Patient
                </button>
              )} */}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                disabled={!matchedPatient}
                onClick={() => setShowAssignModal(true)}
                className="px-5 py-2 bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-lg disabled:opacity-50"
              >
                Assign Doctor
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAssignModal && matchedPatient && (
        <DoctorAssignmentModal
          isOpen={showAssignModal}
          onClose={handleCloseAll}
          patientId={matchedPatient.id}
          patientName={matchedPatient.name}
          onAssign={handleDoctorAssigned}
        />
      )}
    </>
  );
};

export default DashboardDoctorAssignmentModal;
