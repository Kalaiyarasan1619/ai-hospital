import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  StarIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  LanguageIcon,
  UserPlusIcon,
  VideoCameraIcon,
  HeartIcon,
  UserGroupIcon,
  ChevronDownIcon,
  Squares2X2Icon,
  CheckBadgeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const DoctorsList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [viewType, setViewType] = useState('grid'); // 'grid' or 'list'
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const DOCTOR_API = 'https://ai-hospital-doctor.onrender.com/api/doctors';

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      // Get token from localStorage
      let token = localStorage.getItem("token");
      
      if (token) {
        token = token.replace(/"/g, "");
      }

      if (!token) {
        setError("Authentication token not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(DOCTOR_API + "/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch doctors");
      }

      const data = await response.json();
      
      // Transform API data to match the expected format for our UI
      const formattedDoctors = Array.isArray(data) ? data.map(doc => ({
        id: doc.id.toString(),
        name: doc.name,
        image: doc.profileImage || 'https://randomuser.me/api/portraits/men/1.jpg', // Fallback image
        specialization: doc.specialization,
        department: doc.department,
        qualification: doc.qualification,
        experience: doc.experience,
        rating: 4.7, // Default rating since API doesn't provide it
        reviews: 150, // Default reviews count
        languages: doc.languages || [],
        phone: doc.phone,
        email: doc.email,
        consultationFee: doc.consultationFee,
        availability: isAvailableToday(doc.workingDays) ? 'Available' : 'Busy',
        nextAvailable: getNextAvailableTime(doc.workingDays, doc.workingHours),
        consultationTypes: doc.consultationTypes || [],
        todaySlots: getTodaySlots(doc.workingDays, doc.workingHours),
        awards: doc.awards ? [doc.awards] : [],
        about: doc.about || ''
      })) : [];

      setDoctors(formattedDoctors);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError("Failed to load doctors: " + (err.message || "Unknown error"));
      setLoading(false);
    }
  };

  // Helper function to determine if doctor is available today
  const isAvailableToday = (workingDays) => {
    if (!workingDays || !Array.isArray(workingDays)) return false;
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return workingDays.includes(today);
  };

  const role = localStorage.getItem('role');

  // Helper function to get next available time
  const getNextAvailableTime = (workingDays, workingHours) => {
    if (!workingDays || !Array.isArray(workingDays) || !workingHours) {
      return 'Not available';
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    if (workingDays.includes(today) && workingHours[today]) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      const startTime = workingHours[today].start;
      if (startTime) {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        
        if (currentHour < startHour || (currentHour === startHour && currentMinute < startMinute)) {
          return `Today, ${formatTime(startTime)}`;
        }
      }
    }
    
    // Find the next working day
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayIndex = weekdays.indexOf(today);
    
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (todayIndex + i) % 7;
      const nextDay = weekdays[nextDayIndex];
      
      if (workingDays.includes(nextDay) && workingHours[nextDay]) {
        const nextDayText = i === 1 ? 'Tomorrow' : capitalizeFirstLetter(nextDay);
        return `${nextDayText}, ${formatTime(workingHours[nextDay].start)}`;
      }
    }
    
    return 'Not available';
  };

  // Helper function to get today's available slots
  const getTodaySlots = (workingDays, workingHours) => {
    if (!workingDays || !Array.isArray(workingDays) || !workingHours) {
      return [];
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    if (!workingDays.includes(today) || !workingHours[today]) {
      return [];
    }
    
    const { start, end } = workingHours[today];
    if (!start || !end) return [];
    
    // Generate slots at 30-minute intervals
    const slots = [];
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    
    let currentDateTime = new Date();
    currentDateTime.setHours(startHour, startMinute, 0);
    
    const endDateTime = new Date();
    endDateTime.setHours(endHour, endMinute, 0);
    
    while (currentDateTime < endDateTime) {
      const formattedTime = currentDateTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).toUpperCase();
      
      slots.push(formattedTime);
      currentDateTime.setMinutes(currentDateTime.getMinutes() + 30);
    }
    
    return slots;
  };

  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toUpperCase();
  };

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Get unique departments
  const departments = ['All', ...new Set(doctors.map(doc => doc.department))];

  // Filter doctors
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = 
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'All' || doctor.department === selectedDepartment;
    const matchesAvailability = selectedAvailability === 'All' || doctor.availability === selectedAvailability;
    
    return matchesSearch && matchesDepartment && matchesAvailability;
  });

  // Stats
  const stats = {
    totalDoctors: doctors.length,
    availableNow: doctors.filter(d => d.availability === 'Available').length,
    departments: new Set(doctors.map(d => d.department)).size || 0,
    avgRating: doctors.length ? (doctors.reduce((sum, d) => sum + d.rating, 0) / doctors.length).toFixed(1) : "0.0"
  };

  const handleAddDoctor = () => {
    navigate('/doctors/add');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with Add Doctor Button */}
      { role === "ROLE_ADMIN" ? <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Doctors</h1>
          <p className="text-gray-600">Find and book appointments with our experienced medical professionals</p>
        </div>
        <button
          onClick={handleAddDoctor}
          className="bg-gradient-to-r from-sky-500 to-pink-500 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:shadow-lg transition-all transform hover:scale-105 group"
        >
          <PlusIcon className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-medium">Add New Doctor</span>
        </button>
      </div> : <></>}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-sky-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Doctors</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalDoctors}</p>
            </div>
            <div className="bg-sky-100 rounded-full p-3">
              <UserGroupIcon className="h-8 w-8 text-sky-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Available Now</p>
              <p className="text-2xl font-bold text-gray-800">{stats.availableNow}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <CheckBadgeIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Departments</p>
              <p className="text-2xl font-bold text-gray-800">{stats.departments}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <BriefcaseIcon className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Average Rating</p>
              <p className="text-2xl font-bold text-gray-800">{stats.avgRating}</p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <StarIcon className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors by name, specialization, or department..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          
          <select
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
          </select>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewType('grid')}
              className={`p-3 rounded-lg transition-all ${
                viewType === 'grid' 
                  ? 'bg-sky-500 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`p-3 rounded-lg transition-all ${
                viewType === 'list' 
                  ? 'bg-sky-500 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={fetchDoctors}
            className="mt-2 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Doctors Grid */}
      {!loading && !error && (
        <div className={viewType === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              {/* Card Header with Gradient */}
              <div className="bg-gradient-to-r from-sky-500 to-pink-500 p-6 text-white">
                <div className="flex items-start gap-4">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="h-20 w-20 rounded-full border-4 border-white shadow-lg object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://randomuser.me/api/portraits/men/1.jpg';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{doctor.name}</h3>
                    <p className="text-sky-100">{doctor.specialization}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIconSolid
                            key={i}
                            className={`h-4 w-4 ${i < Math.floor(doctor.rating) ? 'text-yellow-300' : 'text-white/30'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm">{doctor.rating} ({doctor.reviews})</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    doctor.availability === 'Available' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {doctor.availability}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Department & Experience */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Department</p>
                      <p className="font-medium text-gray-800">{doctor.department}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Experience</p>
                      <p className="font-medium text-gray-800">{doctor.experience}</p>
                    </div>
                  </div>

                  {/* Qualification */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Qualification</p>
                    <p className="text-sm text-gray-700">{doctor.qualification}</p>
                  </div>

                  {/* Languages */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {doctor.languages.map((lang) => (
                        <span key={lang} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Consultation Types */}
                  <div className="flex gap-3">
                    {doctor.consultationTypes.includes('In-person') && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <UserGroupIcon className="h-4 w-4" />
                        <span>In-person</span>
                      </div>
                    )}
                    {doctor.consultationTypes.includes('Video') && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <VideoCameraIcon className="h-4 w-4" />
                        <span>Video</span>
                      </div>
                    )}
                  </div>

                  {/* Consultation Fee */}
                  <div className="flex items-center justify-between py-3 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Consultation Fee</p>
                      <p className="text-xl font-bold text-gray-800">₹{doctor.consultationFee}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Next Available</p>
                      <p className="text-sm font-medium text-sky-600">{doctor.nextAvailable}</p>
                    </div>
                  </div>

                  {/* Today's Slots */}
                  {doctor.todaySlots.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Available Slots Today</p>
                      <div className="flex flex-wrap gap-2">
                        {doctor.todaySlots.slice(0, 3).map((slot) => (
                          <button key={slot} className="px-3 py-1 bg-sky-50 text-sky-600 text-xs rounded-full hover:bg-sky-100 transition-colors">
                            {slot}
                          </button>
                        ))}
                        {doctor.todaySlots.length > 3 && (
                          <button className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{doctor.todaySlots.length - 3} more
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Awards */}
                  {doctor.awards.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-amber-600">
                      <AcademicCapIcon className="h-4 w-4" />
                      <span>{doctor.awards[0]}</span>
                    </div>
                  )}

                  {/* About */}
                  <p className="text-sm text-gray-600 line-clamp-2">{doctor.about}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  {/* <button className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all font-medium">
                    Book Appointment
                  </button> */}
                  <button 
                    onClick={() => navigate(`/doctors/${doctor.id}`)}
                    className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredDoctors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
          <button
            onClick={handleAddDoctor}
            className="bg-gradient-to-r from-sky-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
          >
            Add First Doctor
          </button>
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      <button
        onClick={handleAddDoctor}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-sky-500 to-pink-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 md:hidden"
      >
        <PlusIcon className="h-6 w-6" />
      </button>
    </div>
  );
};

export default DoctorsList;
