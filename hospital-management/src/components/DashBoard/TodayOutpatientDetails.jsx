import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  UserGroupIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  ClockIcon,
  UserCircleIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

// const PATIENT_API = 'http://localhost:8082/api/patients';
const PATIENT_API = 'https://ai-hospital-patient.onrender.com/api/patients';

const emptyStats = () => ({
  totalPatients: 0,
  totalVisits: 0,
  totalRevenue: 0,
  averagePerPatient: 0,
  pendingPayments: 0,
  pendingCount: 0,
  consultationFees: 0,
  labTests: 0,
  pharmacy: 0,
  newPatients: 0,
  followUpPatients: 0,
});

const normalizeStats = (s) => ({
  totalPatients: Number(s?.totalPatients ?? 0),
  totalVisits: Number(s?.totalVisits ?? 0),
  totalRevenue: Number(s?.totalRevenue ?? 0),
  averagePerPatient: Number(s?.averagePerPatient ?? 0),
  pendingPayments: Number(s?.pendingPayments ?? 0),
  pendingCount: Number(s?.pendingCount ?? 0),
  consultationFees: Number(s?.consultationFees ?? 0),
  labTests: Number(s?.labTests ?? 0),
  pharmacy: Number(s?.pharmacy ?? 0),
  newPatients: Number(s?.newPatients ?? 0),
  followUpPatients: Number(s?.followUpPatients ?? 0),
});

const normalizeQuick = (q) => ({
  averageWaitTime: q?.averageWaitTime != null ? String(q.averageWaitTime) : '—',
  peakHour: q?.peakHour != null ? String(q.peakHour) : '—',
  doctorsOnDuty: Number(q?.doctorsOnDuty ?? 0),
  avgConsultationTime: q?.avgConsultationTime != null ? String(q.avgConsultationTime) : '—',
});

const normalizeVisitRows = (list) =>
  (Array.isArray(list) ? list : []).map((v) => ({
    id: v.id,
    patientName: v.patientName ?? 'Patient',
    age: v.age != null ? Number(v.age) : null,
    gender: v.gender ?? '—',
    time: v.time ?? '—',
    doctor: v.doctor ?? '—',
    department: v.department ?? '—',
    visitType: v.visitType ?? '—',
    treatment: v.treatment ?? '—',
    prescription: v.prescription ?? '—',
    consultationFee: Number(v?.consultationFee ?? 0),
    labCharges: Number(v?.labCharges ?? 0),
    pharmacyCharges: Number(v?.pharmacyCharges ?? 0),
    totalAmount: Number(v?.totalAmount ?? 0),
    paymentStatus: v.paymentStatus ?? 'Pending',
    symptoms: v.symptoms ?? '—',
  }));

const TodayOutpatientDetails = () => {
  // Current date and time state
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [outpatientStats, setOutpatientStats] = useState(emptyStats);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [patientDetails, setPatientDetails] = useState([]);
  const [quickStats, setQuickStats] = useState(() => normalizeQuick({}));

  const fetchOutpatientDashboard = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoadError('Sign in to load OPD data.');
      setLoading(false);
      return;
    }
    try {
      setLoadError(null);
      setLoading(true);
      const { data } = await axios.get(`${PATIENT_API}/dashboard/today/outpatient`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000,
      });
      if (data?.stats) setOutpatientStats(normalizeStats(data.stats));
      setDepartmentStats(Array.isArray(data?.departmentStats) ? data.departmentStats : []);
      setPatientDetails(normalizeVisitRows(data?.visits));
      if (data?.quickStats) setQuickStats(normalizeQuick(data.quickStats));
    } catch (e) {
      console.error('OPD /dashboard/today/outpatient', e.response?.status, e.response?.data, e.message);
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
        setLoadError(msg || e.message || 'Failed to load OPD dashboard');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOutpatientDashboard();
  }, [fetchOutpatientDashboard]);
  
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

  const consultationSharePct =
    outpatientStats.totalRevenue > 0
      ? Math.round((outpatientStats.consultationFees / outpatientStats.totalRevenue) * 100)
      : 0;

  const totalVisitsDen = Math.max(1, outpatientStats.totalVisits);

  // Filter patients based on search and department
  const filteredPatients = patientDetails.filter((patient) => {
    const matchesSearch =
      (patient.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient.doctor || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      selectedDepartment === 'All' || patient.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="px-6 py-8 bg-gray-50 min-h-screen">
      {(loading || loadError) && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm ${
            loadError ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-sky-50 text-sky-900 border border-sky-200'
          }`}
        >
          {loading && !loadError && 'Loading today’s outpatient data from the server…'}
          {loadError && (
            <span>
              {loadError}{' '}
              <button type="button" onClick={fetchOutpatientDashboard} className="underline font-medium">
                Retry
              </button>
            </span>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 md:mb-0">Today's Outpatient Details</h1>
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
        {/* Total Patients */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-sky-500">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Total OPD Patients</p>
              <h3 className="text-3xl font-bold text-gray-800">{outpatientStats.totalPatients}</h3>
              <div className="flex items-center mt-2 text-gray-500">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1 opacity-70" />
                <span className="text-xs font-medium">
                  {outpatientStats.totalVisits} OP visit{outpatientStats.totalVisits === 1 ? '' : 's'} today
                </span>
              </div>
            </div>
            <div className="bg-sky-100 rounded-full h-14 w-14 flex items-center justify-center">
              <UserGroupIcon className="h-7 w-7 text-sky-600" />
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-gray-600">New: <span className="font-medium text-gray-800">{outpatientStats.newPatients}</span></span>
            <span className="text-gray-600">Follow-up: <span className="font-medium text-gray-800">{outpatientStats.followUpPatients}</span></span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Total Revenue</p>
              <h3 className="text-3xl font-bold text-gray-800">₹{Math.round(outpatientStats.totalRevenue).toLocaleString()}</h3>
              <div className="flex items-center mt-2 text-gray-500">
                <span className="text-xs font-medium">Consultation fees recorded today</span>
              </div>
            </div>
            <div className="bg-green-100 rounded-full h-14 w-14 flex items-center justify-center">
              <CurrencyRupeeIcon className="h-7 w-7 text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Avg per patient:{' '}
            <span className="font-medium text-gray-800">
              ₹{Math.round(outpatientStats.averagePerPatient).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Consultation Fees */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Consultation Fees</p>
              <h3 className="text-2xl font-bold text-gray-800">₹{Math.round(outpatientStats.consultationFees).toLocaleString()}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {consultationSharePct > 0 ? `${consultationSharePct}% of total revenue` : 'No revenue recorded'}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full h-14 w-14 flex items-center justify-center">
              <UserCircleIcon className="h-7 w-7 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Lab Tests</span>
              <span className="font-medium text-gray-800">₹{Math.round(outpatientStats.labTests).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pharmacy</span>
              <span className="font-medium text-gray-800">₹{Math.round(outpatientStats.pharmacy).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Pending Payments</p>
              <h3 className="text-2xl font-bold text-gray-800">₹{Math.round(outpatientStats.pendingPayments).toLocaleString()}</h3>
              <p className="text-xs text-gray-500 mt-1">
                From {outpatientStats.pendingCount} visit{outpatientStats.pendingCount === 1 ? '' : 's'} with no fee
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

      {/* Department wise breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Department-wise Patient Flow & Revenue</h3>
          <div className="space-y-4">
            {departmentStats.map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{dept.name}</p>
                  <p className="text-sm text-gray-500">
                    {dept.patients} visit{dept.patients === 1 ? '' : 's'} | Avg: ₹{Math.round(dept.avgFee ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">₹{Math.round(dept.revenue ?? 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      {outpatientStats.totalRevenue > 0
                        ? `${(((dept.revenue ?? 0) / outpatientStats.totalRevenue) * 100).toFixed(1)}% of total`
                        : '—'}
                    </p>
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-sky-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${((dept.patients ?? 0) / totalVisitsDen) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Average Wait Time</span>
              <span className="font-semibold text-gray-800">{quickStats.averageWaitTime}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Peak Hour</span>
              <span className="font-semibold text-gray-800">{quickStats.peakHour}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Doctors on Duty</span>
              <span className="font-semibold text-gray-800">{quickStats.doctorsOnDuty}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Avg Consultation Time</span>
              <span className="font-semibold text-gray-800">{quickStats.avgConsultationTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Details Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 md:mb-0">Patient Visit Details</h3>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search patient or doctor..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 w-full md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            
            {/* Department Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="All">All Departments</option>
              {departmentStats.map((dept) => (
                <option key={dept.name} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Details</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Treatment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charges</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{patient.time}</td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{patient.patientName}</p>
                      <p className="text-xs text-gray-500">
                        {patient.age != null ? `${patient.age}Y` : '—'}/{patient.gender} • {patient.visitType}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{patient.symptoms}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{patient.doctor}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{patient.department}</td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-900">{patient.treatment}</p>
                    {/* <p className="text-xs text-gray-500 mt-1">{patient.prescription}</p> */}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Consultation:</span>
                        <span className="font-medium">₹{patient.consultationFee}</span>
                      </div>
                      {patient.labCharges > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lab:</span>
                          <span className="font-medium">₹{patient.labCharges}</span>
                        </div>
                      )}
                      {patient.pharmacyCharges > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pharmacy:</span>
                          <span className="font-medium">₹{patient.pharmacyCharges}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-1 mt-1">
                        <span className="text-gray-800 font-medium">Total:</span>
                        <span className="font-bold">₹{patient.totalAmount}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      patient.paymentStatus === 'Paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {patient.paymentStatus === 'Paid' ? (
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
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
            <div className="flex space-x-6 text-sm">
              <div>
                <span className="text-gray-600">Total Revenue:</span>
                <span className="font-bold text-gray-800 ml-2">
                  ₹{filteredPatients.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Paid:</span>
                <span className="font-bold text-green-600 ml-2">
                  ₹{filteredPatients.filter(p => p.paymentStatus === 'Paid').reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Pending:</span>
                <span className="font-bold text-red-600 ml-2">
                  ₹{filteredPatients.filter(p => p.paymentStatus === 'Pending').reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayOutpatientDetails;
