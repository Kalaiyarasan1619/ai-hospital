import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  UserPlusIcon, 
  UserMinusIcon, 
  UsersIcon, 
  ClockIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const PATIENT_API = 'http://localhost:8082/api/patients';

const emptyHourly = () =>
  ['6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'].map(
    (hour) => ({ hour, inpatient: 0, outpatient: 0 })
  );

/** Coerce API stats so numeric fields always render (Jackson may send strings). */
const normalizePatientStats = (s) => ({
  registered: Number(s?.registered ?? 0),
  admitted: Number(s?.admitted ?? 0),
  discharged: Number(s?.discharged ?? 0),
  outpatient: Number(s?.outpatient ?? 0),
  emergency: Number(s?.emergency ?? 0),
  scheduled: Number(s?.scheduled ?? 0),
  cancelled: Number(s?.cancelled ?? 0),
  totalInPatients: Number(s?.totalInPatients ?? 0),
  totalOutPatients: Number(s?.totalOutPatients ?? 0),
  totalPatients: Number(s?.totalPatients ?? 0),
  availableBeds: Number(s?.availableBeds ?? 0),
  averageStay: s?.averageStay != null ? String(s.averageStay) : '—',
});

const TodayDetails = () => {
  // Current date and time state
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [patientStats, setPatientStats] = useState({
    registered: 0,
    admitted: 0,
    discharged: 0,
    outpatient: 0,
    emergency: 0,
    scheduled: 0,
    cancelled: 0,
    totalInPatients: 0,
    totalOutPatients: 0,
    totalPatients: 0,
    availableBeds: 0,
    averageStay: '—',
  });
  const [hourlyData, setHourlyData] = useState(emptyHourly);
  const [recentActivities, setRecentActivities] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);

  const fetchDashboard = useCallback(async () => {
    const token = localStorage.getItem('token');
    console.log(token, "Token");
    if (!token) {
      setLoadError('Sign in to load dashboard data.');
      setLoading(false);
      return;
    }
    try {
      setLoadError(null);
      setLoading(true);
      const { data } = await axios.get(`${PATIENT_API}/dashboard/today`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000,
      });
      if (data?.patientStats) setPatientStats(normalizePatientStats(data.patientStats));
      if (Array.isArray(data?.hourlyData) && data.hourlyData.length > 0) {
        setHourlyData(data.hourlyData);
      } else {
        setHourlyData(emptyHourly());
      }
      setRecentActivities(Array.isArray(data?.recentActivities) ? data.recentActivities : []);
      setDepartmentStats(Array.isArray(data?.departmentStats) ? data.departmentStats : []);
    } catch (e) {
      console.error('Dashboard /dashboard/today', e.response?.status, e.response?.data, e.message);
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
        setLoadError(msg || e.message || 'Failed to load dashboard');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);
  
  // Update the time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);

  // Format date as "Monday, 1 January 2023"
  const formattedDate = currentDateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Format time as "10:30:45 AM"
  const formattedTime = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // Get max count for scaling
  const maxCount = Math.max(1, ...hourlyData.map((d) => d.inpatient + d.outpatient));

  const bedDenominator = patientStats.totalInPatients + patientStats.availableBeds;
  const occupancyPct =
    bedDenominator > 0
      ? Math.round((patientStats.totalInPatients / bedDenominator) * 100)
      : 0;

  return (
    <div className="px-6 py-8 bg-gray-50 min-h-screen">
      {(loading || loadError) && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm ${
            loadError ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-sky-50 text-sky-900 border border-sky-200'
          }`}
        >
          {loading && !loadError && 'Loading today’s statistics from the server…'}
          {loadError && (
            <span>
              {loadError}{' '}
              <button type="button" onClick={fetchDashboard} className="underline font-medium">
                Retry
              </button>
            </span>
          )}
        </div>
      )}

      {/* Date and Time Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 md:mb-0">Today's Patient Statistics</h1>
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

      {/* Main Stats Cards - Now with 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Registered Patients */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-sky-500 hover:shadow-lg transition-shadow">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Registered Today</p>
              <h3 className="text-3xl font-bold text-gray-800">{patientStats.registered}</h3>
              <div className="flex items-center mt-2 text-gray-500">
                <span className="text-xs font-medium">Appointments & visits today</span>
              </div>
            </div>
            <div className="bg-sky-100 rounded-full h-14 w-14 flex items-center justify-center">
              <UserPlusIcon className="h-7 w-7 text-sky-600" />
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center text-sm">
            <div className="text-gray-600">
              <span className="font-medium text-gray-800">{patientStats.scheduled}</span> scheduled
            </div>
            <div className="text-gray-600">
              <span className="font-medium text-gray-800">{patientStats.cancelled}</span> cancelled
            </div>
          </div>
        </div>

        {/* Admitted Patients */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Admitted Today</p>
              <h3 className="text-3xl font-bold text-gray-800">{patientStats.admitted}</h3>
              <div className="flex items-center mt-2 text-gray-500">
                <span className="text-xs font-medium">Inpatient visits today</span>
              </div>
            </div>
            <div className="bg-purple-100 rounded-full h-14 w-14 flex items-center justify-center">
              <UsersIcon className="h-7 w-7 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center text-sm">
            <div className="text-gray-600">
              <span className="font-medium text-red-500">{patientStats.emergency}</span> emergency
            </div>
            <div className="text-gray-600">
              <span className="font-medium text-gray-800">{patientStats.totalInPatients}</span> total in-patients
            </div>
          </div>
        </div>

        {/* Outpatients - New Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Outpatients Today</p>
              <h3 className="text-3xl font-bold text-gray-800">{patientStats.outpatient}</h3>
              <div className="flex items-center mt-2 text-gray-500">
                <span className="text-xs font-medium">Outpatient visits today</span>
              </div>
            </div>
            <div className="bg-green-100 rounded-full h-14 w-14 flex items-center justify-center">
              <UserGroupIcon className="h-7 w-7 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center text-sm">
            <div className="text-gray-600">
              <span className="font-medium text-gray-800">{patientStats.totalPatients}</span> total patients
            </div>
            <div className="text-gray-600">
              <span className="font-medium text-gray-800">{patientStats.outpatient}</span> OPD today
            </div>
          </div>
        </div>

        {/* Discharged Patients */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-pink-500 hover:shadow-lg transition-shadow">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Discharged Today</p>
              <h3 className="text-3xl font-bold text-gray-800">{patientStats.discharged}</h3>
              <div className="flex items-center mt-2 text-gray-500">
                <span className="text-xs font-medium">Patient or visit discharge date = today</span>
              </div>
            </div>
            <div className="bg-pink-100 rounded-full h-14 w-14 flex items-center justify-center">
              <UserMinusIcon className="h-7 w-7 text-pink-600" />
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center text-sm">
            <div className="text-gray-600">
              <span className="font-medium text-gray-800">{patientStats.availableBeds}</span> beds available
            </div>
            <div className="text-gray-600">
              <span className="font-medium text-gray-800">{patientStats.averageStay}</span> avg. stay
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Hourly Chart - Updated with Stacked Bars */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Registration by Hour</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-xs">
                <div className="w-3 h-3 bg-purple-500 rounded mr-1"></div>
                <span>Inpatient</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                <span>Outpatient</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">Today</span>
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
          </div>
          
          <div className="h-64 relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
              <span>{maxCount}</span>
              <span>{Math.floor(maxCount * 0.75)}</span>
              <span>{Math.floor(maxCount * 0.5)}</span>
              <span>{Math.floor(maxCount * 0.25)}</span>
              <span>0</span>
            </div>
            
            {/* Grid lines */}
            <div className="absolute left-8 right-0 top-0 h-full">
              <div className="h-full relative">
                <div className="absolute w-full border-b border-gray-200" style={{ top: '0%' }}></div>
                <div className="absolute w-full border-b border-gray-200" style={{ top: '25%' }}></div>
                <div className="absolute w-full border-b border-gray-200" style={{ top: '50%' }}></div>
                <div className="absolute w-full border-b border-gray-200" style={{ top: '75%' }}></div>
                <div className="absolute w-full border-b border-gray-300" style={{ top: '100%' }}></div>
              </div>
            </div>
            
            {/* Chart bars - Stacked */}
            <div className="h-full flex items-end pl-8">
              {hourlyData.map((data, index) => {
                const totalCount = data.inpatient + data.outpatient;
                const totalHeight = maxCount > 0 ? (totalCount / maxCount) * 100 : 0;
                const safeTotalHeight = totalHeight > 0 ? totalHeight : 0;
                const opFrac = totalCount > 0 ? data.outpatient / totalCount : 0;
                const ipFrac = totalCount > 0 ? data.inpatient / totalCount : 0;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center justify-end px-1">
                    <div className="w-full relative group">
                      {/* Tooltip */}
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        <div>Total: {totalCount}</div>
                        <div>Inpatient: {data.inpatient}</div>
                        <div>Outpatient: {data.outpatient}</div>
                      </div>
                      {/* Total value on top */}
                      <div className="text-xs font-semibold text-gray-700 text-center mb-1">
                        {totalCount}
                      </div>
                      {/* Stacked bars container */}
                      <div className="w-full flex flex-col" style={{ height: `${safeTotalHeight * 2.4}px` }}>
                        {/* Outpatient bar (top) */}
                        <div 
                          className="w-full bg-gradient-to-t from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 transition-colors cursor-pointer rounded-t-md" 
                          style={{ height: totalCount > 0 ? `${opFrac * 100}%` : '0%' }}
                        ></div>
                        {/* Inpatient bar (bottom) */}
                        <div 
                          className="w-full bg-gradient-to-t from-purple-500 to-purple-400 hover:from-purple-600 hover:to-purple-500 transition-colors cursor-pointer rounded-b-md" 
                          style={{ height: totalCount > 0 ? `${ipFrac * 100}%` : '0%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* X-axis labels */}
          <div className="flex pl-8 mt-2">
            {hourlyData.map((data, index) => (
              <div key={index} className="flex-1 text-center">
                <div className="text-xs text-gray-600 transform -rotate-45 origin-center">
                  {data.hour}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-6 text-sm text-gray-600">
            <div className="flex items-center">
              <ChartBarIcon className="h-4 w-4 mr-1 text-sky-500" />
              <span>Visits today: {patientStats.registered}</span>
            </div>
            <button
              type="button"
              onClick={fetchDashboard}
              className="flex items-center text-sky-600 hover:text-sky-800"
            >
              <span className="mr-1">Refresh</span>
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
            <button className="text-sm text-sky-600 hover:text-sky-800">View All</button>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentActivities.length === 0 && !loading && (
              <p className="text-sm text-gray-500">No visits recorded for the current weekday yet.</p>
            )}
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start">
                <div className={`
                  h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mr-3
                  ${activity.type === 'registration' ? 'bg-sky-100 text-sky-600' : 
                    activity.type === 'admission' ? 'bg-purple-100 text-purple-600' :
                    activity.type === 'discharge' ? 'bg-pink-100 text-pink-600' :
                    'bg-red-100 text-red-600'}
                `}>
                  {activity.type === 'registration' ? <UserPlusIcon className="h-4 w-4" /> : 
                   activity.type === 'admission' ? <UsersIcon className="h-4 w-4" /> :
                   activity.type === 'discharge' ? <UserMinusIcon className="h-4 w-4" /> :
                   <ClipboardDocumentListIcon className="h-4 w-4" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-800">{activity.name}</p>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{activity.details}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500 mt-0.5">{activity.department}</p>
                    <span className={`text-xs font-medium ${
                      activity.patientType === 'Outpatient' ? 'text-green-600' : 
                      activity.patientType === 'Inpatient' ? 'text-purple-600' : 
                      'text-red-600'
                    }`}>
                      {activity.patientType}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Statistics - Updated with outpatient column */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Department Statistics (Today)</h3>
          <button className="flex items-center text-sky-600 hover:text-sky-800">
            <CheckBadgeIcon className="h-4 w-4 mr-1" />
            <span>Export Data</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Admitted</th>
                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Discharged</th>
                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Outpatient</th>
                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {departmentStats.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-6 px-4 text-sm text-gray-500 text-center">
                    No department breakdown for visits on this weekday yet.
                  </td>
                </tr>
              )}
              {departmentStats.map((dept, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-800">{dept.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-center">{dept.admitted}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-center">{dept.discharged}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-center">{dept.outpatient}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-center">{dept.scheduled}</td>
                  <td className="py-3 px-4 text-sm text-center">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      dept.admitted > dept.discharged ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {dept.admitted > dept.discharged ? 'High Intake' : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Summary Section - Updated with outpatient info */}
      <div className="mt-8 bg-gradient-to-r from-sky-500 to-pink-500 rounded-xl shadow-md p-6 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Daily Summary</h3>
            <p className="text-sky-100 max-w-lg">
              Today we have {patientStats.registered} visits scheduled for this weekday, {patientStats.admitted} inpatient
              and {patientStats.outpatient} outpatient touchpoints from those visits. Patients in system:{' '}
              {patientStats.totalPatients}. Estimated bed occupancy: {occupancyPct}%.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <button className="bg-white text-sky-600 px-4 py-2 rounded-lg font-medium hover:bg-sky-50 transition-colors shadow-sm">
              Generate Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayDetails;
