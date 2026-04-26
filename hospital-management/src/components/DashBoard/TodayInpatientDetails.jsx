import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  UserGroupIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
//   BedIcon,
  HeartIcon,
  BeakerIcon,
  XCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClipboardDocumentCheckIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

// const PATIENT_API = 'http://localhost:8082/api/patients';
const PATIENT_API = 'https://ai-hospital-patient.onrender.com/api/patients';

const emptyStats = () => ({
  totalPatients: 0,
  newAdmissions: 0,
  dischargedToday: 0,
  totalRevenue: 0,
  averagePerPatient: 0,
  pendingPayments: 0,
  pendingCount: 0,
  roomCharges: 0,
  treatmentCharges: 0,
  medicineCharges: 0,
  otherCharges: 0,
  occupiedBeds: 0,
  totalBeds: 300,
  averageStayDays: 0,
  criticalPatients: 0,
  generalWardPatients: 0,
  privateRoomPatients: 0,
});

const normalizeStats = (s) => ({
  totalPatients: Number(s?.totalPatients ?? 0),
  newAdmissions: Number(s?.newAdmissions ?? 0),
  dischargedToday: Number(s?.dischargedToday ?? 0),
  totalRevenue: Number(s?.totalRevenue ?? 0),
  averagePerPatient: Number(s?.averagePerPatient ?? 0),
  pendingPayments: Number(s?.pendingPayments ?? 0),
  pendingCount: Number(s?.pendingCount ?? 0),
  roomCharges: Number(s?.roomCharges ?? 0),
  treatmentCharges: Number(s?.treatmentCharges ?? 0),
  medicineCharges: Number(s?.medicineCharges ?? 0),
  otherCharges: Number(s?.otherCharges ?? 0),
  occupiedBeds: Number(s?.occupiedBeds ?? 0),
  totalBeds: Number(s?.totalBeds ?? 300),
  averageStayDays: Number(s?.averageStayDays ?? 0),
  criticalPatients: Number(s?.criticalPatients ?? 0),
  generalWardPatients: Number(s?.generalWardPatients ?? 0),
  privateRoomPatients: Number(s?.privateRoomPatients ?? 0),
});

const normalizeWardStats = (list) =>
  (Array.isArray(list) ? list : []).map((w) => ({
    name: w.name ?? '—',
    patients: Number(w?.patients ?? 0),
    available: Number(w?.available ?? 0),
    total: Number(w?.total ?? 0),
    revenue: Number(w?.revenue ?? 0),
    avgStay: Number(w?.avgStay ?? 0),
  }));

const normalizePatientRows = (list) =>
  (Array.isArray(list) ? list : []).map((p) => ({
    id: p.id,
    patientId: p.patientId,
    patientName: p.patientName ?? 'Patient',
    age: p.age != null ? Number(p.age) : null,
    gender: p.gender ?? '—',
    admissionDate: p.admissionDate ?? '—',
    admissionTime: p.admissionTime ?? '—',
    bedNumber: p.bedNumber ?? '—',
    ward: p.ward ?? '—',
    doctor: p.doctor ?? '—',
    department: p.department ?? '—',
    diagnosis: p.diagnosis ?? '—',
    treatment: p.treatment ?? '—',
    roomCharges: Number(p?.roomCharges ?? 0),
    treatmentCharges: Number(p?.treatmentCharges ?? 0),
    medicineCharges: Number(p?.medicineCharges ?? 0),
    otherCharges: Number(p?.otherCharges ?? 0),
    totalAmount: Number(p?.totalAmount ?? 0),
    insuranceCovered: Number(p?.insuranceCovered ?? 0),
    paymentStatus: p.paymentStatus ?? 'Pending',
    daysAdmitted: Number(p?.daysAdmitted ?? 0),
    condition: p.condition ?? 'Stable',
    nextReview: p.nextReview ?? '—',
  }));

const TodayInpatientDetails = () => {
  // Current date and time state
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedWard, setSelectedWard] = useState('All');

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [inpatientStats, setInpatientStats] = useState(emptyStats);
  const [wardStats, setWardStats] = useState([]);
  const [patientDetails, setPatientDetails] = useState([]);

  const fetchInpatientDashboard = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoadError('Sign in to load inpatient data.');
      setLoading(false);
      return;
    }
    try {
      setLoadError(null);
      setLoading(true);
      const { data } = await axios.get(`${PATIENT_API}/dashboard/today/inpatient`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000,
      });
      if (data?.stats) setInpatientStats(normalizeStats(data.stats));
      setWardStats(normalizeWardStats(data?.wardStats));
      setPatientDetails(normalizePatientRows(data?.patients));
    } catch (e) {
      console.error('IPD /dashboard/today/inpatient', e.response?.status, e.response?.data, e.message);
      const body = e.response?.data;
      const msg =
        typeof body === 'string'
          ? body
          : body?.message || body?.error || body?.path
            ? `${body?.error || 'Error'} ${body?.status != null ? `(${body.status})` : ''} ${body?.path || ''}`.trim()
            : null;
      if (e.code === 'ECONNABORTED' || e.message === 'Network Error') {
        setLoadError(
          'Cannot reach patient API at http://localhost:8082. Start the patient service and try again.'
        );
      } else if (e.response?.status === 401 || e.response?.status === 403) {
        setLoadError('Session expired or not allowed. Sign out and sign in again.');
      } else {
        setLoadError(msg || e.message || 'Failed to load inpatient dashboard');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInpatientDashboard();
  }, [fetchInpatientDashboard]);
  
  // Update the time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);

  // Format date and time
  const formattedDate = currentDateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formattedTime = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // Filter patients based on search, department and ward
  const filteredPatients = patientDetails.filter(patient => {
    const matchesSearch = patient.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.bedNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'All' || patient.department === selectedDepartment;
    const matchesWard = selectedWard === 'All' || patient.ward === selectedWard;
    return matchesSearch && matchesDepartment && matchesWard;
  });

  // Get unique departments
  const departments = [...new Set(patientDetails.map(p => p.department))];

  const totalRev = Math.max(1e-9, inpatientStats.totalRevenue);

  return (
    <div className="px-6 py-8 bg-gray-50 min-h-screen">
      {(loading || loadError) && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm ${
            loadError ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-sky-50 text-sky-900 border border-sky-200'
          }`}
        >
          {loading && !loadError && 'Loading inpatient data from the server…'}
          {loadError && (
            <span>
              {loadError}{' '}
              <button type="button" onClick={fetchInpatientDashboard} className="underline font-medium">
                Retry
              </button>
            </span>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 md:mb-0">Today's Inpatient Details</h1>
        <div className="flex flex-col md:flex-row items-start md:items-center md:space-x-6 text-gray-600">
          <div className="flex items-center mb-2 md:mb-0">
            <CalendarIcon className="h-5 w-5 mr-2 text-sky-500" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 text-pink-500" />
            <span className="font-mono">{formattedTime}</span>
          </div>
        </div>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Inpatients */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Total Inpatients</p>
              <h3 className="text-3xl font-bold text-gray-800">{inpatientStats.totalPatients}</h3>
              <p className="text-xs text-gray-500 mt-2">Current admissions (live)</p>
            </div>
            <div className="bg-purple-100 rounded-full h-14 w-14 flex items-center justify-center">
              <UserGroupIcon className="h-7 w-7 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-gray-600">Admitted: <span className="font-medium text-gray-800">{inpatientStats.newAdmissions}</span></span>
            <span className="text-gray-600">Discharged: <span className="font-medium text-gray-800">{inpatientStats.dischargedToday}</span></span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Total Revenue</p>
              <h3 className="text-3xl font-bold text-gray-800">
                {inpatientStats.totalRevenue >= 100000
                  ? `₹${(inpatientStats.totalRevenue / 100000).toFixed(1)}L`
                  : `₹${Math.round(inpatientStats.totalRevenue).toLocaleString()}`}
              </h3>
              <p className="text-xs text-gray-500 mt-2">From visit fees (estimated split)</p>
            </div>
            <div className="bg-green-100 rounded-full h-14 w-14 flex items-center justify-center">
              <CurrencyRupeeIcon className="h-7 w-7 text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Avg per patient: <span className="font-medium text-gray-800">₹{inpatientStats.averagePerPatient.toLocaleString()}</span>
          </div>
        </div>

        {/* Bed Occupancy */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-sky-500">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Bed Occupancy</p>
              <h3 className="text-3xl font-bold text-gray-800">
                {inpatientStats.totalBeds > 0
                  ? `${Math.round((inpatientStats.occupiedBeds / inpatientStats.totalBeds) * 100)}%`
                  : '—'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{inpatientStats.occupiedBeds} of {inpatientStats.totalBeds} beds</p>
            </div>
            <div className="bg-sky-100 rounded-full h-14 w-14 flex items-center justify-center">
              <BuildingOfficeIcon className="h-7 w-7 text-sky-600" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">ICU</span>
              <span className="font-medium text-gray-800">{inpatientStats.criticalPatients} patients</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">General</span>
              <span className="font-medium text-gray-800">{inpatientStats.generalWardPatients} patients</span>
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Pending Payments</p>
              <h3 className="text-2xl font-bold text-gray-800">
                ₹{Math.round(inpatientStats.pendingPayments).toLocaleString()}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {inpatientStats.pendingCount} patient{inpatientStats.pendingCount === 1 ? '' : 's'} pending fee
              </p>
            </div>
            <div className="bg-red-100 rounded-full h-14 w-14 flex items-center justify-center">
              <ExclamationCircleIcon className="h-7 w-7 text-red-600" />
            </div>
          </div>
          <div className="mt-4 text-sm">
            <button className="text-red-600 hover:text-red-800 font-medium">View Pending List →</button>
          </div>
        </div>
      </div>

      {/* Ward wise breakdown and Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Ward Occupancy */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Ward-wise Occupancy & Revenue</h3>
          <div className="space-y-4">
            {wardStats.map((ward) => (
              <div key={ward.name} className="p-4 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{ward.name}</p>
                    <p className="text-sm text-gray-500">
                      {ward.patients} patients | {ward.available} beds available | Avg stay: {ward.avgStay} days
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">₹{(ward.revenue / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-gray-500">
                      {((ward.revenue / totalRev) * 100).toFixed(1)}% of revenue
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      ward.name === 'ICU' ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-sky-500'
                    }`}
                    style={{ width: `${(ward.patients / ward.total) * 100}%` }}
                  >
                    <div className="h-full flex items-center justify-end pr-2">
                      <span className="text-xs text-white font-medium">
                        {Math.round((ward.patients / ward.total) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Revenue Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <HomeIcon className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-gray-600">Room Charges</span>
              </div>
              <span className="font-semibold text-gray-800">₹{(inpatientStats.roomCharges / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <HeartIcon className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-gray-600">Treatment</span>
              </div>
              <span className="font-semibold text-gray-800">₹{(inpatientStats.treatmentCharges / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <BeakerIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-600">Medicine</span>
              </div>
              <span className="font-semibold text-gray-800">₹{(inpatientStats.medicineCharges / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <ClipboardDocumentCheckIcon className="h-5 w-5 text-sky-500 mr-2" />
                <span className="text-gray-600">Other Charges</span>
              </div>
              <span className="font-semibold text-gray-800">₹{(inpatientStats.otherCharges / 1000).toFixed(0)}K</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Avg Stay</span>
                <span className="font-semibold text-gray-800">{inpatientStats.averageStayDays} days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Details Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 md:mb-0">Inpatient Details</h3>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search patient, doctor, bed..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            
            {/* Department Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="All">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Ward Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
            >
              <option value="All">All Wards</option>
              {wardStats.map((ward) => (
                <option key={ward.name} value={ward.name}>{ward.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bed/Ward</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Details</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor/Dept</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis & Treatment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stay Duration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charges</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{patient.bedNumber}</p>
                      <p className="text-xs text-gray-500">{patient.ward}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{patient.patientName}</p>
                      <p className="text-xs text-gray-500">
                        {patient.age != null ? `${patient.age}Y` : '—'}/{patient.gender}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Admitted: {patient.admissionDate} {patient.admissionTime}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm text-gray-900">{patient.doctor}</p>
                      <p className="text-xs text-gray-500">{patient.department}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{patient.diagnosis}</p>
                      <p className="text-xs text-gray-500 mt-1">{patient.treatment}</p>
                      <div className="mt-1">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          patient.condition === 'Critical' ? 'bg-red-100 text-red-800' :
                          patient.condition === 'Stable' ? 'bg-green-100 text-green-800' :
                          patient.condition === 'Improving' ? 'bg-blue-100 text-blue-800' :
                          patient.condition === 'Recovering' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {patient.condition}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{patient.daysAdmitted} days</p>
                      <p className="text-xs text-gray-500">Next review:</p>
                      <p className="text-xs text-gray-600">{patient.nextReview}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Room:</span>
                          <span>₹{patient.roomCharges.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Treatment:</span>
                          <span>₹{patient.treatmentCharges.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Medicine:</span>
                          <span>₹{patient.medicineCharges.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Other:</span>
                          <span>₹{patient.otherCharges.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1 font-medium">
                          <span className="text-gray-800">Total:</span>
                          <span className="text-gray-900">₹{patient.totalAmount.toLocaleString()}</span>
                        </div>
                        {patient.insuranceCovered > 0 && (
                          <div className="flex justify-between text-xs text-green-600">
                            <span>Insurance:</span>
                            <span>₹{patient.insuranceCovered.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      patient.paymentStatus === 'Paid' 
                        ? 'bg-green-100 text-green-800' 
                        : patient.paymentStatus === 'Partial'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {patient.paymentStatus === 'Paid' ? (
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                      ) : patient.paymentStatus === 'Partial' ? (
                        <ExclamationCircleIcon className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircleIcon className="h-3 w-3 mr-1" />
                      )}
                      {patient.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600 mb-2 md:mb-0">
              Showing {filteredPatients.length} of {patientDetails.length} patients
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Charges:</span>
                <span className="font-bold text-gray-800 ml-2">
                  ₹{filteredPatients.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Insurance Covered:</span>
                <span className="font-bold text-blue-600 ml-2">
                  ₹{filteredPatients.reduce((sum, p) => sum + p.insuranceCovered, 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Patient Payable:</span>
                <span className="font-bold text-purple-600 ml-2">
                  ₹{filteredPatients.reduce((sum, p) => sum + (p.totalAmount - p.insuranceCovered), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayInpatientDetails;
