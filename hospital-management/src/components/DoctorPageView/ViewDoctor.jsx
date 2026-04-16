import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaLanguage, FaMapMarkerAlt, FaPhone, FaEnvelope, FaMedal, FaBook, FaUserMd, FaArrowLeft, FaTrash } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';

const ViewDoctor = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();


  const DOCTOR_API = 'https://ai-hospital-doctor.onrender.com/api/doctors';
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(DOCTOR_API + `/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch doctor data');
        }
        
        const data = await response.json();
        setDoctor(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch doctor data');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchDoctorData();
  }, [id]);

  // Function to handle going back
  const handleGoBack = () => {
    navigate(-1); // This will navigate to the previous page in history
  };
  
  // Function to delete the doctor
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(DOCTOR_API + `/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete doctor');
      }
      
      setDeleteLoading(false);
      // Show success alert and navigate back
      alert('Doctor deleted successfully');
      navigate(-1);
    } catch (err) {
      setDeleteLoading(false);
      alert(err.message || 'Failed to delete doctor');
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-80 text-xl bg-gradient-to-r from-sky-100 to-pink-100 rounded-xl">Loading doctor profile...</div>;
  if (error) return <div className="flex justify-center items-center h-80 text-xl text-red-600 bg-gradient-to-r from-sky-100 to-pink-100 rounded-xl">{error}</div>;
  if (!doctor) return <div className="flex justify-center items-center h-80 text-xl text-red-600 bg-gradient-to-r from-sky-100 to-pink-100 rounded-xl">No doctor data available</div>;

  const getInitials = (name) => {
    if (!name) return "DR";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Check for different image properties in the doctor object
  const getProfileImage = () => {
    if (doctor.profileImage) {
      // Check if profileImage is a base64 string
      if (typeof doctor.profileImage === 'string' && doctor.profileImage.startsWith('data:')) {
        return doctor.profileImage;
      } else if (typeof doctor.profileImage === 'string') {
        return `data:image/jpeg;base64,${doctor.profileImage}`;
      }
    }
    
    // Try alternate image fields
    if (doctor.image) return doctor.image;
    if (doctor.imageUrl) return doctor.imageUrl;
    if (doctor.avatar) return doctor.avatar;
    
    // Return null if no image found
    return null;
  };

  const profileImage = getProfileImage();

  return (
    <div className="max-w-7xl mx-auto p-5 font-sans bg-gradient-to-r from-sky-100 to-pink-100 rounded-2xl shadow-xl">
      {/* Navigation Bar */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={handleGoBack} 
          className="flex items-center gap-2 px-4 py-2 bg-white/70 hover:bg-white/90 rounded-full shadow-md transition-all text-purple-800 font-medium"
        >
          <FaArrowLeft /> Back
        </button>
        
        <button 
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-full shadow-md transition-all text-white font-medium"
        >
          <FaTrash /> Delete
        </button>
      </div>
      
      {/* Header with doctor info */}
      <div className="flex flex-col md:flex-row items-center mb-8 p-6 rounded-xl bg-gradient-to-r from-sky-400 to-pink-400 shadow-md text-white">
        <div className="w-36 h-36 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4 md:mb-0 md:mr-8">
          {profileImage ? (
            <img 
              src={profileImage} 
              alt={doctor.name || "Doctor"} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loop
                e.target.src = "https://cdn-icons-png.flaticon.com/512/3774/3774299.png"; // Default doctor icon
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-400 to-purple-500 text-4xl font-bold">
              {getInitials(doctor.name)}
            </div>
          )}
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold mb-1 text-white drop-shadow-md">{doctor.name || "Doctor"}</h1>
          <p className="text-xl font-medium mb-1">{doctor.specialization || "Specialist"}</p>
          <p className="text-base mb-1">{doctor.qualification || "Medical Professional"}</p>
          <p className="text-base mb-3">{doctor.experience || "Experienced"}</p>
          <div className="inline-block px-4 py-2 bg-white/20 rounded-full font-semibold">
            Consultation Fee: ₹{doctor.consultationFee || "N/A"}
          </div>
        </div>
      </div>

      {/* Profile content in cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Personal Information Card */}
        <div className="bg-white/85 p-6 rounded-xl shadow-md hover:shadow-lg transition-transform hover:-translate-y-1">
          <h2 className="text-xl font-bold mb-4 text-purple-900 border-b-2 border-sky-100 pb-2">Personal Information</h2>
          
          <div className="flex items-start mb-4">
            <FaPhone className="text-indigo-500 mr-3 mt-1" />
            <div>
              <span className="font-semibold text-indigo-500 mr-2">Phone:</span>
              <span>{doctor.phone || "Not Available"}</span>
            </div>
          </div>
          
          <div className="flex items-start mb-4">
            <FaEnvelope className="text-indigo-500 mr-3 mt-1" />
            <div>
              <span className="font-semibold text-indigo-500 mr-2">Email:</span>
              <span>{doctor.email || "Not Available"}</span>
            </div>
          </div>
          
          <div className="mb-4 ml-7">
            <span className="font-semibold text-indigo-500 mr-2">Gender:</span>
            <span>{doctor.gender || "Not Specified"}</span>
          </div>
          
          <div className="mb-4 ml-7">
            <span className="font-semibold text-indigo-500 mr-2">Date of Birth:</span>
            <span>
              {doctor.dateOfBirth 
                ? new Date(doctor.dateOfBirth).toLocaleDateString() 
                : "Not Available"}
            </span>
          </div>
        </div>

        {/* Address Card */}
        <div className="bg-white/85 p-6 rounded-xl shadow-md hover:shadow-lg transition-transform hover:-translate-y-1">
          <h2 className="text-xl font-bold mb-4 text-purple-900 border-b-2 border-sky-100 pb-2">Address</h2>
          
          <div className="flex items-start">
            <FaMapMarkerAlt className="text-indigo-500 mr-3 mt-1" />
            <div>
              <p>{doctor.address || "Address not available"}</p>
              <p>
                {doctor.city ? `${doctor.city}, ` : ""}
                {doctor.state ? `${doctor.state} ` : ""}
                {doctor.pincode ? `- ${doctor.pincode}` : ""}
                {!doctor.city && !doctor.state && !doctor.pincode && "Location details not available"}
              </p>
            </div>
          </div>
        </div>

        {/* Professional Details Card */}
        <div className="bg-white/85 p-6 rounded-xl shadow-md hover:shadow-lg transition-transform hover:-translate-y-1">
          <h2 className="text-xl font-bold mb-4 text-purple-900 border-b-2 border-sky-100 pb-2">Professional Details</h2>
          
          <div className="flex items-start mb-4">
            <FaUserMd className="text-indigo-500 mr-3 mt-1" />
            <div>
              <span className="font-semibold text-indigo-500 mr-2">Department:</span>
              <span>{doctor.department || "Not Specified"}</span>
            </div>
          </div>
          
          <div className="mb-4 ml-7">
            <span className="font-semibold text-indigo-500 mr-2">Reg. Number:</span>
            <span>{doctor.registrationNumber || "Not Available"}</span>
          </div>
          
          <div className="flex items-start">
            <FaMedal className="text-indigo-500 mr-3 mt-1" />
            <div>
              <span className="font-semibold text-indigo-500 mr-2">Awards:</span>
              <span>{doctor.awards || "None Listed"}</span>
            </div>
          </div>
        </div>

        {/* Consultation Types Card */}
        {doctor.consultationTypes && doctor.consultationTypes.length > 0 && (
          <div className="bg-white/85 p-6 rounded-xl shadow-md hover:shadow-lg transition-transform hover:-translate-y-1">
            <h2 className="text-xl font-bold mb-4 text-purple-900 border-b-2 border-sky-100 pb-2">Consultation Types</h2>
            
            <div className="flex flex-wrap gap-2">
              {doctor.consultationTypes.map((type, index) => (
                <span key={index} className="px-3 py-1 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-full text-sm">
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages Card */}
        {doctor.languages && doctor.languages.length > 0 && (
          <div className="bg-white/85 p-6 rounded-xl shadow-md hover:shadow-lg transition-transform hover:-translate-y-1">
            <h2 className="text-xl font-bold mb-4 text-purple-900 border-b-2 border-sky-100 pb-2 flex items-center">
              <FaLanguage className="mr-2" /> Languages
            </h2>
            
            <div className="flex flex-wrap gap-2">
              {doctor.languages.map((language, index) => (
                <span key={index} className="px-3 py-1 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-full text-sm">
                  {language}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Working Days Card */}
        {doctor.workingDays && doctor.workingDays.length > 0 && (
          <div className="bg-white/85 p-6 rounded-xl shadow-md hover:shadow-lg transition-transform hover:-translate-y-1">
            <h2 className="text-xl font-bold mb-4 text-purple-900 border-b-2 border-sky-100 pb-2 flex items-center">
              <FaCalendarAlt className="mr-2" /> Working Days
            </h2>
            
            <div className="flex flex-wrap gap-2">
              {doctor.workingDays.map((day, index) => (
                <span key={index} className="px-3 py-1 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-full text-sm">
                  {typeof day === 'string' ? day.charAt(0).toUpperCase() + day.slice(1) : day}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Working Hours Card */}
        {doctor.workingHours && Object.keys(doctor.workingHours).length > 0 && (
          <div className="bg-white/85 p-6 rounded-xl shadow-md hover:shadow-lg transition-transform hover:-translate-y-1">
            <h2 className="text-xl font-bold mb-4 text-purple-900 border-b-2 border-sky-100 pb-2 flex items-center">
              <FaClock className="mr-2" /> Working Hours
            </h2>
            
            <div className="space-y-3">
              {Object.entries(doctor.workingHours).map(([day, hours]) => (
                <div key={day} className="flex justify-between border-b border-dotted border-gray-200 pb-2">
                  <span className="font-semibold text-indigo-500">
                    {typeof day === 'string' ? day.charAt(0).toUpperCase() + day.slice(1) : day}:
                  </span>
                  <span>
                    {hours && hours.start && hours.end 
                      ? `${hours.start} - ${hours.end}`
                      : "Hours not specified"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About Card - Full Width */}
        {doctor.about && (
          <div className="bg-white/85 p-6 rounded-xl shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 col-span-1 md:col-span-2 lg:col-span-3">
            <h2 className="text-xl font-bold mb-4 text-purple-900 border-b-2 border-sky-100 pb-2">About</h2>
            <p>{doctor.about}</p>
          </div>
        )}

        {/* Specializations Card */}
        {doctor.specializations && (
          <div className="bg-white/85 p-6 rounded-xl shadow-md hover:shadow-lg transition-transform hover:-translate-y-1">
            <h2 className="text-xl font-bold mb-4 text-purple-900 border-b-2 border-sky-100 pb-2">Specializations</h2>
            <p>{doctor.specializations}</p>
          </div>
        )}

        {/* Publications Card */}
        {doctor.publications && (
          <div className="bg-white/85 p-6 rounded-xl shadow-md hover:shadow-lg transition-transform hover:-translate-y-1">
            <h2 className="text-xl font-bold mb-4 text-purple-900 border-b-2 border-sky-100 pb-2 flex items-center">
              <FaBook className="mr-2" /> Publications
            </h2>
            <p>{doctor.publications}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        {/* <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:-translate-y-1 transition-all">
          Book Appointment
        </button> */}
        
        <button 
          onClick={() => setShowDeleteConfirm(true)}
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
        >
          <FaTrash /> Delete Doctor
        </button>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-red-600">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete <strong>{doctor.name}</strong>? This action cannot be undone.</p>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white flex items-center gap-2"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : (
                  <>
                    <FaTrash /> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewDoctor;
