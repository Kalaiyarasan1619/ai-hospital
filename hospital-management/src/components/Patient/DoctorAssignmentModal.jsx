import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUserMd, FaTimes, FaCalendarAlt, FaClock } from "react-icons/fa";
import { CheckCircleIcon, XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

// const PATIENT_API = "http://localhost:8082/api/patients";
const PATIENT_API = 'https://ai-hospital-patient-service.onrender.com/api/patients';
const DOCTOR_API = 'https://ai-hospital-doctor.onrender.com/api/doctors';
const getToken = () => {
  let token = localStorage.getItem("token");
  if (token) token = token.replace(/"/g, "");
  return token;
};

// Doctor Assignment Modal Component
const DoctorAssignmentModal = ({ isOpen, onClose, patientId, patientName, onAssign }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [treatmentType, setTreatmentType] = useState("Consultation");
  const [patientMode, setPatientMode] = useState("Outpatient");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch doctors when modal opens
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!isOpen) return;
      
      try {
        setLoading(true);
        const token = getToken();
        
        if (!token) {
          throw new Error("Authentication token not found");
        }
        
        const response = await axios.get(
          DOCTOR_API + "/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        setDoctors(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError(err.message || "Failed to fetch doctors");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [isOpen]);

  // Handle doctor selection
  const handleDoctorChange = (e) => {
    const doctorId = parseInt(e.target.value);
    const doctor = doctors.find(doc => doc.id === doctorId);
    setSelectedDoctor(doctor);
    setSelectedDay("");
    setSelectedTime("");
  };

  // Handle day selection
  const handleDayChange = (e) => {
    setSelectedDay(e.target.value);
    setSelectedTime("");
  };

  // Get available working days for selected doctor
  const getWorkingDays = () => {
    if (!selectedDoctor || !selectedDoctor.workingDays) return [];
    return selectedDoctor.workingDays;
  };

  // Get available time slots for selected day
  const getTimeSlots = () => {
    if (!selectedDoctor || !selectedDay || !selectedDoctor.workingHours || !selectedDoctor.workingHours[selectedDay]) {
      return [];
    }
    
    const hours = selectedDoctor.workingHours[selectedDay];
    const startTime = hours.start;
    const endTime = hours.end;
    
    // Generate 30-minute time slots between start and end time
    const timeSlots = [];
    let currentTime = new Date(`2023-01-01T${startTime}`);
    const endTimeObj = new Date(`2023-01-01T${endTime}`);
    
    while (currentTime < endTimeObj) {
      const formattedTime = currentTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      });
      timeSlots.push(formattedTime);
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }
    
    return timeSlots;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDoctor || !selectedDay || !selectedTime) {
      alert("Please select a doctor, day and time slot");
      return;
    }
    
    try {
      setSubmitting(true);
      const token = getToken();
      
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      const normalizedPatientId = Number(patientId);
      if (!Number.isInteger(normalizedPatientId) || normalizedPatientId <= 0) {
        throw new Error("Invalid patient id selected");
      }
      
      // Prepare data for assignment
      const assignmentData = {
        patientId: normalizedPatientId,
        doctorId: selectedDoctor.id,
        appointmentDate: selectedDay,
        appointmentTime: selectedTime,
        treatmentType: treatmentType,
        patientMode: patientMode,
        doctor_name: selectedDoctor.name,
        consultationFee: selectedDoctor.consultationFee,
        patientName: patientName
      };
      
      // Make API call to assign doctor
      // Note: This is a placeholder URL - replace with your actual endpoint
      await axios.post(
        `${PATIENT_API}/assign-doctor`,
        assignmentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

    console.log(assignmentData, "Assign Doctor")
      
      setSuccess(true);
      
      // Close modal after showing success for 1.5 seconds
      setTimeout(() => {
        onAssign(selectedDoctor);
        onClose();
        setSuccess(false);
      }, 1500);
      
    } catch (err) {
      console.error("Error assigning doctor:", err);
      setError(err.message || "Failed to assign doctor");
    } finally {
      setSubmitting(false);
    }
  };

  // Format working hours display
  const formatWorkingHours = (hours) => {
    if (!hours) return "Not available";
    return `${hours.start} - ${hours.end}`;
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FaUserMd className="text-xl" />
            <h2 className="text-xl font-semibold">Assign Doctor</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Doctor Assigned Successfully</h3>
              <p className="text-gray-500">The patient has been assigned to {selectedDoctor?.name}</p>
            </div>
          ) : loading ? (
            <div className="py-12 text-center">
              <ArrowPathIcon className="h-12 w-12 mx-auto animate-spin text-sky-500" />
              <p className="mt-4 text-gray-600">Loading doctors...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XMarkIcon className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Doctors</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-sky-500 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-1">Patient Information</h3>
                <p className="text-gray-500">Assigning doctor to: <span className="font-medium text-gray-800">{patientName}</span> ({patientId})</p>
              </div>
              
              {/* Doctor Selection */}
              <div className="mb-5">
                <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Doctor
                </label>
                <select
                  id="doctor"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={selectedDoctor?.id || ""}
                  onChange={handleDoctorChange}
                  required
                >
                  <option value="">-- Select a doctor --</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Doctor Details */}
              {selectedDoctor && (
                <div className="bg-sky-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Doctor Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Specialization</p>
                      <p className="font-medium">{selectedDoctor.specialization}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">{selectedDoctor.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-medium">{selectedDoctor.experience}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Consultation Fee</p>
                      <p className="font-medium">₹{selectedDoctor.consultationFee}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Languages</p>
                      <p className="font-medium">{selectedDoctor.languages?.join(", ") || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Consultation Types</p>
                      <p className="font-medium">{selectedDoctor.consultationTypes?.join(", ") || "In-person"}</p>
                    </div>
                  </div>
                  
                  {/* Working Days & Hours */}
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-700 mb-2">Working Schedule</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {selectedDoctor.workingDays?.map((day) => (
                        <div key={day} className="bg-white p-2 border border-gray-200 rounded">
                          <p className="font-medium capitalize">{day}</p>
                          <p className="text-sm text-gray-500">
                            {selectedDoctor.workingHours?.[day] 
                              ? formatWorkingHours(selectedDoctor.workingHours[day])
                              : "Hours not specified"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Appointment Scheduling */}
              {selectedDoctor && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Schedule Appointment</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Day Selection */}
                    <div>
                      <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Day
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaCalendarAlt className="text-gray-400" />
                        </div>
                        <select
                          id="day"
                          className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                          value={selectedDay}
                          onChange={handleDayChange}
                          required
                        >
                          <option value="">-- Select a day --</option>
                          {getWorkingDays().map((day) => (
                            <option key={day} value={day} className="capitalize">
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {/* Time Slot Selection */}
                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Time Slot
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaClock className="text-gray-400" />
                        </div>
                        <select
                          id="time"
                          className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          required
                          disabled={!selectedDay}
                        >
                          <option value="">-- Select a time slot --</option>
                          {getTimeSlots().map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Treatment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="treatmentType" className="block text-sm font-medium text-gray-700 mb-1">
                    Treatment Type
                  </label>
                  <select
                    id="treatmentType"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={treatmentType}
                    onChange={(e) => setTreatmentType(e.target.value)}
                    required
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Preventive Care">Preventive Care</option>
                    <option value="Therapy">Therapy</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="patientMode" className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Mode
                  </label>
                  <select
                    id="patientMode"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={patientMode}
                    onChange={(e) => setPatientMode(e.target.value)}
                    required
                  >
                    <option value="Outpatient">Outpatient</option>
                    <option value="Inpatient">Inpatient</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Day Care">Day Care</option>
                  </select>
                </div>
              </div>
              
              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center"
                  disabled={submitting || !selectedDoctor || !selectedDay || !selectedTime}
                >
                  {submitting ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Assign Doctor</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// Export the component
export default DoctorAssignmentModal;
