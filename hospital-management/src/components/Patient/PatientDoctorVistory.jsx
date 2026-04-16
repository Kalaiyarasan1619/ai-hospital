import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  UserIcon, 
  ClockIcon, 
  CurrencyRupeeIcon, 
  CalendarDaysIcon, 
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon,
  CheckBadgeIcon,
  HeartIcon,
  BanknotesIcon,
  SparklesIcon,
  DocumentTextIcon,
  IdentificationIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const PATIENT_API = 'https://ai-hospital-patient-service.onrender.com/api/patients';

const PatientDoctorHistory = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [patientDetails, setPatientDetails] = useState(null);
  const [sortedVisits, setSortedVisits] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  
  useEffect(() => {
    const fetchVisitHistory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Extract numeric ID if needed
        let id = patientId;
        if (patientId && typeof patientId === 'string' && patientId.startsWith('P')) {
          id = patientId.replace('P', '');
        }
        
        const response = await axios.get(
          PATIENT_API + `/doctor_visit/${patientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data && response.data.length > 0) {
          // Sort visits by id in descending order (newest first)
          const sortedData = [...response.data].sort((a, b) => b.id - a.id);
          setVisits(response.data);
          setSortedVisits(sortedData);
          setSelectedVisit(sortedData[0]);
          
          // Set patient name from the first visit record
          const latestVisit = response.data[response.data.length-1];
          setPatientName(latestVisit.patientName || "");
          
          // Also fetch patient details if available
          try {
            const patientResponse = await axios.get(
              PATIENT_API + `/${id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );
            setPatientDetails(patientResponse.data);
          } catch (patientErr) {
            console.error('Could not fetch patient details:', patientErr);
          }
        } else {
          setVisits([]);
          setSortedVisits([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching visit history:', err);
        setError(err.message || 'Failed to load visit history');
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchVisitHistory();
    }
  }, [patientId]);

  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    
    // Check if it's already formatted as a day of week
    if (typeof dateString === 'string' && 
        (dateString.toLowerCase() === 'monday' || 
         dateString.toLowerCase() === 'tuesday' ||
         dateString.toLowerCase() === 'wednesday' ||
         dateString.toLowerCase() === 'thursday' ||
         dateString.toLowerCase() === 'friday' ||
         dateString.toLowerCase() === 'saturday' ||
         dateString.toLowerCase() === 'sunday')) {
      return dateString.charAt(0).toUpperCase() + dateString.slice(1);
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return as is if not a valid date
      }
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString; // Return original if formatting fails
    }
  };

  const getRecentVisitCount = () => {
    // Count visits in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return visits.filter(visit => {
      if (visit.appointmentDate) {
        try {
          const visitDate = new Date(visit.appointmentDate);
          return !isNaN(visitDate.getTime()) && visitDate >= thirtyDaysAgo;
        } catch (e) {
          return false;
        }
      }
      return false;
    }).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-sky-50 to-indigo-50">
        <div className="text-center bg-white p-10 rounded-2xl shadow-xl">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-pink-500 rounded-full animate-ping opacity-20"></div>
            <ArrowPathIcon className="h-20 w-20 mx-auto animate-spin text-sky-500 relative" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Visit History</h3>
          <p className="text-gray-600">Please wait while we retrieve the doctor visit records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-sky-50 to-indigo-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Visit History</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-sky-500 to-pink-500 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => window.history.back()}
            className="p-2.5 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-pink-600">
              Doctor Visit History
            </span>
            <SparklesIcon className="h-7 w-7 text-yellow-500" />
          </h1>
        </div>
        
        {/* Patient Header Card */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-pink-500 rounded-2xl overflow-hidden shadow-2xl">
          <div className="h-6 bg-gradient-to-r from-sky-400 to-pink-300 opacity-30"></div>
          <div className="p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <IdentificationIcon className="h-5 w-5 text-sky-200" />
                  <p className="text-sky-100 text-sm font-medium">Patient Information</p>
                </div>
                <h2 className="text-3xl font-bold text-white mt-2">{patientName}</h2>
                
                {patientDetails && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {patientDetails.gender && (
                      <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white flex items-center gap-1">
                        <UserIcon className="h-4 w-4" />
                        {patientDetails.gender}
                      </span>
                    )}
                    {patientDetails.bloodGroup && (
                      <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white flex items-center gap-1">
                        <HeartIcon className="h-4 w-4" />
                        {patientDetails.bloodGroup}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <ClipboardDocumentCheckIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sky-100 text-sm">Total Visits</p>
                      <p className="text-white text-2xl font-bold">{visits.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <CalendarDaysIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sky-100 text-sm">Recent (30 days)</p>
                      <p className="text-white text-2xl font-bold">{getRecentVisitCount()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* View Mode Toggle */}
      <div className="mb-6 flex justify-end">
        <div className="bg-white p-1 rounded-xl shadow-md inline-flex">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1 ${
              viewMode === 'grid' 
                ? 'bg-gradient-to-r from-sky-500 to-pink-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Grid View
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1 ${
              viewMode === 'detailed' 
                ? 'bg-gradient-to-r from-sky-500 to-pink-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Detailed View
          </button>
        </div>
      </div>
      
      {/* No visits message */}
      {visits.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-xl">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-sky-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
            <ClipboardDocumentCheckIcon className="h-12 w-12 text-sky-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No Visit Records Found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8">This patient doesn't have any doctor visit records yet. New visits will appear here once they are recorded.</p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-sky-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
          >
            Back to Patient Details
          </button>
        </div>
      )}
      
      {/* Grid View */}
      {visits.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {sortedVisits.map((visit) => (
            <div 
              key={visit.id}
              className="bg-gradient-to-br from-sky-500 via-sky-400 to-pink-500 rounded-2xl overflow-hidden shadow-xl transform transition-all hover:scale-105 hover:shadow-2xl"
            >
              <div className="h-3 bg-white/10"></div>
              <div className="p-5 bg-white/10 backdrop-blur-sm border-b border-white/20">
                <div className="flex justify-between items-center">
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <p className="text-white text-sm font-medium">Visit #{visit.id}</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                    visit.patientMode === 'Inpatient' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {visit.patientMode === 'Inpatient' ? (
                      <BuildingOffice2Icon className="h-3 w-3" />
                    ) : (
                      <UserGroupIcon className="h-3 w-3" />
                    )}
                    {visit.patientMode}
                  </div>
                </div>
              </div>
              
              <div className="p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">Doctor</p>
                    <p className="font-semibold">{visit.doctor_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                    <ClipboardDocumentCheckIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">Treatment</p>
                    <p className="font-semibold">{visit.treatmentType || "General Consultation"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                    <CurrencyRupeeIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">Consultation Fee</p>
                    <p className="font-semibold">₹{visit.consultationFee.toLocaleString()}</p>
                  </div>
                </div>
                
                {(visit.appointmentDate || visit.appointmentTime) && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mt-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      {visit.appointmentDate && (
                        <div className="flex items-center gap-2">
                          <CalendarDaysIcon className="h-5 w-5 text-white" />
                          <span className="font-medium">{formatDate(visit.appointmentDate)}</span>
                        </div>
                      )}
                      
                      {visit.appointmentTime && (
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-5 w-5 text-white" />
                          <span className="font-medium">{visit.appointmentTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <button 
                    onClick={() => setSelectedVisit(visit)} 
                    className="w-full py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <DocumentTextIcon className="h-4 w-4" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Detailed View */}
      {visits.length > 0 && viewMode === 'detailed' && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-sky-500 to-pink-500 p-5 text-white">
            <h3 className="text-lg font-semibold">Visit History</h3>
          </div>
          <div className="divide-y">
            {sortedVisits.map((visit) => (
              <div key={visit.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-sky-500 to-pink-500 h-12 w-12 rounded-full flex items-center justify-center text-white font-bold">
                      {visit.id}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">{visit.doctor_name}</h4>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <ClipboardDocumentCheckIcon className="h-4 w-4" />
                        <span>{visit.treatmentType || "General Consultation"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      visit.patientMode === 'Inpatient' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {visit.patientMode}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      ₹{visit.consultationFee.toLocaleString()}
                    </span>
                    {visit.appointmentDate && (
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium flex items-center gap-1">
                        <CalendarDaysIcon className="h-3 w-3" />
                        {formatDate(visit.appointmentDate)}
                      </span>
                    )}
                    {visit.appointmentTime && (
                      <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {visit.appointmentTime}
                      </span>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setSelectedVisit(visit)}
                    className="md:self-center px-4 py-1.5 border border-sky-500 text-sky-600 hover:bg-sky-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    Details
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Selected Visit Detail Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl transform transition-all">
            <div className="bg-gradient-to-r from-sky-500 to-pink-500 rounded-t-2xl p-5 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">Visit Details #{selectedVisit.id}</h3>
              <button 
                onClick={() => setSelectedVisit(null)}
                className="p-1.5 bg-white/20 rounded-full hover:bg-white/30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-sky-100 rounded-lg">
                      <UserIcon className="h-5 w-5 text-sky-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Doctor</h4>
                      <p className="text-lg font-semibold text-gray-900">{selectedVisit.doctor_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-pink-100 rounded-lg">
                      <ClipboardDocumentCheckIcon className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Treatment Type</h4>
                      <p className="text-lg font-semibold text-gray-900">{selectedVisit.treatmentType || "General Consultation"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <BanknotesIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Consultation Fee</h4>
                      <p className="text-lg font-semibold text-gray-900">₹{selectedVisit.consultationFee.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <BuildingOffice2Icon className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Patient Mode</h4>
                      <p className="text-lg font-semibold text-gray-900">{selectedVisit.patientMode}</p>
                    </div>
                  </div>
                  
                  {selectedVisit.appointmentDate && (
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <CalendarDaysIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Appointment Date</h4>
                        <p className="text-lg font-semibold text-gray-900">{formatDate(selectedVisit.appointmentDate)}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedVisit.appointmentTime && (
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <ClockIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Appointment Time</h4>
                        <p className="text-lg font-semibold text-gray-900">{selectedVisit.appointmentTime}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t mt-6 pt-6">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-lg">
                      <CheckBadgeIcon className="h-6 w-6 text-sky-500" />
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-gray-800">Visit Summary</h4>
                      <p className="text-gray-600 mt-2">
                        {`This visit was conducted by ${selectedVisit.doctor_name} 
                        as a ${selectedVisit.treatmentType || "General Consultation"} for 
                        ${selectedVisit.patientName}. The consultation fee was 
                        ₹${selectedVisit.consultationFee.toLocaleString()}.`}
                        
                        {selectedVisit.appointmentDate && selectedVisit.appointmentTime && 
                          ` The appointment was scheduled for ${formatDate(selectedVisit.appointmentDate)} 
                          at ${selectedVisit.appointmentTime}.`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setSelectedVisit(null)}
                  className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-pink-500 text-white rounded-xl shadow hover:shadow-lg transition-all font-medium"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDoctorHistory;
