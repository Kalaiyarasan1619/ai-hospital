import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  UserPlusIcon,
  CameraIcon,
  IdentificationIcon,
  PhoneIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XMarkIcon,
  CalendarIcon,
  HomeIcon,
  EnvelopeIcon,
  UserIcon,
  MapPinIcon,
  BeakerIcon,
  ClipboardDocumentCheckIcon,
  SparklesIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const PATIENT_API = 'https://ai-hospital-patient.onrender.com/api/patients';

function isAdminRole() {
  const r = localStorage.getItem('role');
  if (!r) return false;
  return r.includes('ROLE_ADMIN');
}

const PatientsRegisterView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const admin = isAdminRole();
  const [activeTab, setActiveTab] = useState('personal');
  const [profileImage, setProfileImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form validation errors
  const [errors, setErrors] = useState({});
  
  // Form data
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    occupation: '',
    nationality: 'Indian',
    aadharNumber: '',
    
    // Contact Information
    phoneNumber: '',
    alternatePhone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    
    // Medical Information
    bloodGroup: '',
    height: '',
    weight: '',
    allergies: '',
    chronicDiseases: '',
    currentMedications: '',
    previousSurgeries: '',
    familyHistory: '',
    smokingStatus: 'No',
    alcoholConsumption: 'No',
    
    // New fields for treatment
    treatmentType: '',
    patientMode: 'Outpatient', // Default value
    
    // Emergency Contact
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    emergencyAddress: '',
    
    // Insurance Information
    hasInsurance: false,
    insuranceProvider: '',
    policyNumber: '',
    validUntil: '',
    coverageAmount: ''
  });

  useEffect(() => {
    const prefillName = location.state?.prefillName;
    if (!prefillName) return;

    const parts = String(prefillName).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return;

    const firstName = parts[0];
    const lastName = parts.slice(1).join(" ");

    setFormData((prev) => ({
      ...prev,
      firstName: prev.firstName || firstName,
      lastName: prev.lastName || lastName,
    }));
  }, [location.state]);

  useEffect(() => {
    if (admin) return;
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return;
      const email = JSON.parse(raw).email;
      if (email) {
        setFormData((prev) => ({ ...prev, email }));
      }
    } catch {
      /* ignore */
    }
  }, [admin]);

  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: IdentificationIcon, description: 'Basic patient details' },
    { id: 'contact', name: 'Contact Info', icon: PhoneIcon, description: 'Address and phone' },
    { id: 'medical', name: 'Medical Info', icon: HeartIcon, description: 'Health information' },
    { id: 'emergency', name: 'Emergency', icon: ExclamationTriangleIcon, description: 'Emergency contacts' },
    { id: 'insurance', name: 'Insurance', icon: DocumentTextIcon, description: 'Insurance details' }
  ];

  const handleInputChange = (e) => {
  const { name, value, type, checked } = e.target;
  
  // Special handling for treatmentType to automatically set patientMode
  if (name === 'treatmentType') {
    // Outpatient treatment list
    const outpatientTreatments = [
      'General Consultation', 
      'Fever Treatment', 
      'Gold Fever Treatment', 
      'Injury Treatment', 
      'Follow-up Visit',
      'Vaccination',
      'Minor Procedure',
      'Diagnostic Tests'
    ];
    
    // Inpatient treatment list
    const inpatientTreatments = [
      'Major Surgery', 
      'Accident Treatment', 
      'Cancer Treatment', 
      'Lung Cancer Treatment',
      'Intensive Care',
      'Extended Monitoring',
      'Post-operative Care',
      'Complex Treatment'
    ];
    
    // Determine patientMode based on selected treatment
    let patientMode;
    if (outpatientTreatments.includes(value)) {
      patientMode = 'Outpatient';
    } else if (inpatientTreatments.includes(value)) {
      patientMode = 'Inpatient';
    } else {
      patientMode = 'Outpatient'; // Default value
    }
    
    setFormData({
      ...formData,
      [name]: value,
      patientMode: patientMode
    });
  } else {
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  }
  
  // Clear error for this field when user starts typing
  if (errors[name]) {
    setErrors({ ...errors, [name]: '' });
  }
};


  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateTab = (tabId) => {
    const newErrors = {};
    
    switch(tabId) {
      case 'personal':
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        break;
      
      case 'contact':
        if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
        if (!formData.email?.trim()) newErrors.email = 'Email is required';
        if (!formData.address) newErrors.address = 'Address is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.pincode) newErrors.pincode = 'Pincode is required';
        break;
      
      case 'medical':
        if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required';
        if (!formData.treatmentType) newErrors.treatmentType = 'Treatment type is required';
        break;
      
      case 'emergency':
        if (!formData.emergencyName) newErrors.emergencyName = 'Emergency contact name is required';
        if (!formData.emergencyPhone) newErrors.emergencyPhone = 'Emergency phone is required';
        if (!formData.emergencyRelation) newErrors.emergencyRelation = 'Relationship is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextTab = () => {
    if (validateTab(activeTab)) {
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1].id);
      }
    }
  };

  const handlePreviousTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate all tabs
  let hasErrors = false;
  for (const tab of tabs) {
    if (!validateTab(tab.id)) {
      hasErrors = true;
      setActiveTab(tab.id);
      break;
    }
  }

  if (!hasErrors) {
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        ...formData,
        profileImage: profileImage
      };

      const response = await fetch(PATIENT_API + "/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `Registration failed (${response.status})`);
      }

      const savedPatient = await response.json();

      setIsSubmitting(false);
      setShowSuccess(true);

      // Redirect to patient profile after showing success modal
      setTimeout(() => {
        if (location.state?.redirectToDashboardVisit) {
          navigate("/dashboard", {
            state: {
              openDashboardVisitModal: true,
              preselectedPatient: savedPatient,
            },
          });
          return;
        }

        navigate('/patient');
      }, 1800);

    } catch (error) {
      setIsSubmitting(false);
      alert("Error: " + error.message);
    }
  }
};


  const getTabCompletionStatus = (tabId) => {
    switch(tabId) {
      case 'personal':
        return formData.firstName && formData.lastName && formData.dateOfBirth && formData.gender;
      case 'contact':
        return (
          formData.phoneNumber &&
          formData.email &&
          formData.address &&
          formData.city &&
          formData.state &&
          formData.pincode
        );
      case 'medical':
        return formData.bloodGroup && formData.treatmentType;
      case 'emergency':
        return formData.emergencyName && formData.emergencyPhone && formData.emergencyRelation;
      case 'insurance':
        return true; // Insurance is optional
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-pink-500 shadow-xl sticky top-0 z-40">
        <div className="px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/patient')}
                className="p-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-200 group"
              >
                <ArrowLeftIcon className="h-5 w-5 text-white group-hover:-translate-x-1 transition-transform" />
              </button>
              <div className="text-white">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  Register New Patient
                  <SparklesIcon className="h-7 w-7 text-yellow-300" />
                </h1>
                <p className="text-sky-100 mt-1">Complete all steps to create a new patient record</p>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-white/90 text-sm">
                Progress: {tabs.filter(tab => getTabCompletionStatus(tab.id)).length}/{tabs.length} completed
              </div>
              <div className="w-48 bg-white/30 backdrop-blur-sm rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-white to-yellow-300 h-3 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${(tabs.filter(tab => getTabCompletionStatus(tab.id)).length / tabs.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="w-full px-8 py-8">
        {/* Enhanced Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative p-6 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-sky-500 to-pink-500 shadow-lg scale-105'
                      : getTabCompletionStatus(tab.id)
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-md'
                      : 'bg-white shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className={`p-3 rounded-2xl ${
                      activeTab === tab.id || getTabCompletionStatus(tab.id)
                        ? 'bg-white/20'
                        : 'bg-gray-100'
                    }`}>
                      <tab.icon className={`h-8 w-8 ${
                        activeTab === tab.id || getTabCompletionStatus(tab.id)
                          ? 'text-white'
                          : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="text-center">
                      <p className={`font-semibold ${
                        activeTab === tab.id || getTabCompletionStatus(tab.id)
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}>{tab.name}</p>
                      <p className={`text-xs mt-1 ${
                        activeTab === tab.id || getTabCompletionStatus(tab.id)
                          ? 'text-white/80'
                          : 'text-gray-500'
                      }`}>{tab.description}</p>
                    </div>
                    {getTabCompletionStatus(tab.id) && (
                      <div className="absolute -top-2 -right-2">
                        <div className="bg-white rounded-full p-1">
                          <CheckCircleIcon className="h-6 w-6 text-green-500" />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Connection Line */}
                  {index < tabs.length - 1 && (
                    <div className={`hidden lg:block absolute top-1/2 -right-14 w-14 h-0.5 ${
                      getTabCompletionStatus(tab.id) ? 'bg-green-300' : 'bg-gray-300'
                    }`}></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Form Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Enhanced Profile Image Section */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 border-b">
            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
              <div className="relative group">
                <div className="h-40 w-40 rounded-2xl bg-gradient-to-br from-sky-400 to-pink-400 p-1 shadow-xl">
                  <div className="h-full w-full rounded-xl bg-white overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <UserIcon className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                <label className="absolute -bottom-2 -right-2 bg-gradient-to-r from-sky-500 to-pink-500 text-white p-3 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
                  <CameraIcon className="h-6 w-6" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-center lg:text-left">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Patient Photo</h3>
                <p className="text-gray-600 mb-4">Upload a clear photo for easy identification</p>
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  <span className="px-4 py-2 bg-sky-100 text-sky-700 rounded-full text-sm font-medium">
                    JPG, PNG formats
                  </span>
                  <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                    Max 5MB size
                  </span>
                  <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    Square ratio preferred
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Personal Information Tab - Enhanced */}
            {activeTab === 'personal' && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-sky-500 to-pink-500 rounded-xl">
                    <IdentificationIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
                    <p className="text-gray-600">Basic details about the patient</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-sky-600">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                        errors.firstName 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-gray-200 focus:border-sky-500 hover:border-gray-300'
                      } focus:outline-none focus:ring-4 focus:ring-sky-500/20`}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <XMarkIcon className="h-3 w-3" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-sky-600">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                        errors.lastName 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-gray-200 focus:border-sky-500 hover:border-gray-300'
                      } focus:outline-none focus:ring-4 focus:ring-sky-500/20`}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <XMarkIcon className="h-3 w-3" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-sky-600">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 pr-12 border-2 rounded-xl transition-all duration-200 ${
                          errors.dateOfBirth 
                            ? 'border-red-500 focus:border-red-600' 
                            : 'border-gray-200 focus:border-sky-500 hover:border-gray-300'
                        } focus:outline-none focus:ring-4 focus:ring-sky-500/20`}
                      />
                      <CalendarIcon className="h-5 w-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {errors.dateOfBirth && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <XMarkIcon className="h-3 w-3" />
                        {errors.dateOfBirth}
                      </p>
                    )}
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-sky-600">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                        errors.gender 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-gray-200 focus:border-sky-500 hover:border-gray-300'
                      } focus:outline-none focus:ring-4 focus:ring-sky-500/20`}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <XMarkIcon className="h-3 w-3" />
                        {errors.gender}
                      </p>
                    )}
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-sky-600">
                      Marital Status
                    </label>
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/20 transition-all duration-200"
                    >
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-sky-600">
                      Occupation
                    </label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/20 transition-all duration-200"
                      placeholder="Enter occupation"
                    />
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-sky-600">
                      Nationality
                    </label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/20 transition-all duration-200"
                      placeholder="Enter nationality"
                    />
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-sky-600">
                      Aadhar Number
                    </label>
                    <input
                      type="text"
                      name="aadharNumber"
                      value={formData.aadharNumber}
                      onChange={handleInputChange}
                      maxLength="12"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/20 transition-all duration-200"
                      placeholder="xxxx xxxx xxxx"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information Tab - Enhanced */}
            {activeTab === 'contact' && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <PhoneIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Contact Information</h3>
                    <p className="text-gray-600">How to reach the patient</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-purple-600">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                          errors.phoneNumber 
                            ? 'border-red-500 focus:border-red-600' 
                            : 'border-gray-200 focus:border-purple-500 hover:border-gray-300'
                        } focus:outline-none focus:ring-4 focus:ring-purple-500/20`}
                        placeholder="+91 xxxxx xxxxx"
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <XMarkIcon className="h-3 w-3" />
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-purple-600">
                      Alternate Phone
                    </label>
                    <div className="relative">
                      <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        name="alternatePhone"
                        value={formData.alternatePhone}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-200"
                        placeholder="+91 xxxxx xxxxx"
                      />
                    </div>
                  </div>
                  
                  <div className="group lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-purple-600">
                      Email Address {!admin && <span className="text-red-500">*</span>}
                    </label>
                    {!admin && (
                      <p className="mb-2 text-xs text-gray-500">
                        Must match your login email — required for account-linked registration.
                      </p>
                    )}
                    <div className="relative">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        readOnly={!admin}
                        className={`w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 ${
                          admin ? 'hover:border-gray-300' : 'cursor-not-allowed bg-gray-50 text-gray-700'
                        }`}
                        placeholder="patient@email.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 flex items-center gap-1 text-xs text-red-500">
                        <XMarkIcon className="h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                  
                  <div className="group lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-purple-600">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <HomeIcon className="h-5 w-5 text-gray-400 absolute left-4 top-4" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={4}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                          errors.address 
                            ? 'border-red-500 focus:border-red-600' 
                            : 'border-gray-200 focus:border-purple-500 hover:border-gray-300'
                        } focus:outline-none focus:ring-4 focus:ring-purple-500/20`}
                        placeholder="Enter complete address"
                      />
                    </div>
                    {errors.address && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <XMarkIcon className="h-3 w-3" />
                        {errors.address}
                      </p>
                    )}
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-purple-600">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                        errors.city 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-gray-200 focus:border-purple-500 hover:border-gray-300'
                      } focus:outline-none focus:ring-4 focus:ring-purple-500/20`}
                      placeholder="Enter city"
                    />
                    {errors.city && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <XMarkIcon className="h-3 w-3" />
                        {errors.city}
                      </p>
                    )}
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-purple-600">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                        errors.state 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-gray-200 focus:border-purple-500 hover:border-gray-300'
                      } focus:outline-none focus:ring-4 focus:ring-purple-500/20`}
                    >
                      <option value="">Select State</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.state && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <XMarkIcon className="h-3 w-3" />
                        {errors.state}
                      </p>
                    )}
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-purple-600">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPinIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        maxLength="6"
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                          errors.pincode 
                            ? 'border-red-500 focus:border-red-600' 
                            : 'border-gray-200 focus:border-purple-500 hover:border-gray-300'
                        } focus:outline-none focus:ring-4 focus:ring-purple-500/20`}
                        placeholder="xxxxxx"
                      />
                    </div>
                    {errors.pincode && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <XMarkIcon className="h-3 w-3" />
                        {errors.pincode}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Medical Information Tab - Enhanced */}
            {activeTab === 'medical' && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl">
                    <HeartIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Medical Information</h3>
                    <p className="text-gray-600">Health-related details and history</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-red-600">
                      Blood Group <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                        errors.bloodGroup 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-gray-200 focus:border-red-500 hover:border-gray-300'
                      } focus:outline-none focus:ring-4 focus:ring-red-500/20`}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                                        {errors.bloodGroup && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <XMarkIcon className="h-3 w-3" />
                        {errors.bloodGroup}
                      </p>
                    )}
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-red-600">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all duration-200"
                      placeholder="170"
                    />
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-red-600">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all duration-200"
                      placeholder="70"
                    />
                  </div>

                  {/* Treatment Type & Patient Mode - New Addition */}
                  <div className="group lg:col-span-3">
                    <div className="flex items-center gap-3 mb-4 mt-6">
                      <div className="p-3 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl">
                        <ClipboardDocumentCheckIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">Treatment Information</h3>
                        <p className="text-gray-600">Details about patient treatment type</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 p-4 bg-cyan-50 rounded-xl border border-cyan-100">
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-cyan-600">
                          Treatment Type <span className="text-red-500">*</span>
                        </label>
                       <select
  name="treatmentType"
  value={formData.treatmentType}
  onChange={handleInputChange}
  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
    errors.treatmentType 
      ? 'border-red-500 focus:border-red-600' 
      : 'border-gray-200 focus:border-cyan-500 hover:border-gray-300'
  } focus:outline-none focus:ring-4 focus:ring-cyan-500/20`}
>
  <option value="">Select Treatment Type</option>
  
  {/* Outpatient Treatment Options */}
  <optgroup label="Outpatient Treatments">
    <option value="General Consultation">General Consultation</option>
    <option value="Fever Treatment">Fever Treatment</option>
    <option value="Gold Fever Treatment">Gold Fever Treatment</option>
    <option value="Injury Treatment">Injury Treatment</option>
    <option value="Follow-up Visit">Follow-up Visit</option>
    <option value="Vaccination">Vaccination</option>
    <option value="Minor Procedure">Minor Procedure</option>
    <option value="Diagnostic Tests">Diagnostic Tests</option>
  </optgroup>
  
  {/* Inpatient Treatment Options */}
  <optgroup label="Inpatient Treatments">
    <option value="Major Surgery">Major Surgery</option>
    <option value="Accident Treatment">Accident Treatment</option>
    <option value="Cancer Treatment">Cancer Treatment</option>
    <option value="Lung Cancer Treatment">Lung Cancer Treatment</option>
    <option value="Intensive Care">Intensive Care</option>
    <option value="Extended Monitoring">Extended Monitoring</option>
    <option value="Post-operative Care">Post-operative Care</option>
    <option value="Complex Treatment">Complex Treatment</option>
  </optgroup>
</select>

                        {errors.treatmentType && (
                          <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                            <XMarkIcon className="h-3 w-3" />
                            {errors.treatmentType}
                          </p>
                        )}
                      </div>
                      
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-cyan-600">
                          Patient Mode
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="patientMode"
                            value={formData.patientMode}
                            readOnly
                            className="w-full px-4 py-3 border-2 border-gray-200 bg-gray-50 rounded-xl text-gray-700 cursor-not-allowed"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              formData.patientMode === 'Inpatient' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {formData.patientMode}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Automatically set based on treatment type
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-red-600">
                      Smoking Status
                    </label>
                    <select
                      name="smokingStatus"
                      value={formData.smokingStatus}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all duration-200"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                      <option value="Former">Former Smoker</option>
                    </select>
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-red-600">
                      Alcohol Consumption
                    </label>
                    <select
                      name="alcoholConsumption"
                      value={formData.alcoholConsumption}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all duration-200"
                    >
                      <option value="No">No</option>
                      <option value="Occasional">Occasional</option>
                      <option value="Regular">Regular</option>
                    </select>
                  </div>
                  
                  <div className="group lg:col-span-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-red-600">
                      Allergies
                    </label>
                    <div className="relative">
                      <BeakerIcon className="h-5 w-5 text-gray-400 absolute left-4 top-4" />
                      <textarea
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all duration-200"
                        placeholder="List any known allergies (e.g., Penicillin, Peanuts, Dust)"
                      />
                    </div>
                  </div>
                  
                  <div className="group lg:col-span-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-red-600">
                      Chronic Diseases
                    </label>
                    <textarea
                      name="chronicDiseases"
                      value={formData.chronicDiseases}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all duration-200"
                      placeholder="E.g., Diabetes, Hypertension, Asthma"
                    />
                  </div>
                  
                  <div className="group lg:col-span-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-red-600">
                      Current Medications
                    </label>
                    <textarea
                      name="currentMedications"
                      value={formData.currentMedications}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all duration-200"
                      placeholder="List all current medications with dosage"
                    />
                  </div>
                  
                  <div className="group lg:col-span-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-red-600">
                      Previous Surgeries
                    </label>
                    <textarea
                      name="previousSurgeries"
                      value={formData.previousSurgeries}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all duration-200"
                      placeholder="List any previous surgeries with dates"
                    />
                  </div>
                  
                  <div className="group lg:col-span-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-red-600">
                      Family Medical History
                    </label>
                    <textarea
                      name="familyHistory"
                      value={formData.familyHistory}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all duration-200"
                      placeholder="Relevant family medical history (e.g., hereditary conditions)"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Emergency Contact Tab - Enhanced */}
            {activeTab === 'emergency' && (
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-lg font-semibold text-red-900 mb-1">Important Notice</h4>
                      <p className="text-sm text-red-700">
                        Emergency contact information is crucial for patient safety. Please ensure all details are accurate and the contact person is available 24/7.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                    <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Emergency Contact</h3>
                    <p className="text-gray-600">Who to contact in case of emergency</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600">
                      Emergency Contact Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="emergencyName"
                      value={formData.emergencyName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                        errors.emergencyName 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-gray-200 focus:border-orange-500 hover:border-gray-300'
                      } focus:outline-none focus:ring-4 focus:ring-orange-500/20`}
                      placeholder="Full name"
                    />
                    {errors.emergencyName && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <XMarkIcon className="h-3 w-3" />
                        {errors.emergencyName}
                      </p>
                    )}
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600">
                      Relationship <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="emergencyRelation"
                      value={formData.emergencyRelation}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                        errors.emergencyRelation 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-gray-200 focus:border-orange-500 hover:border-gray-300'
                      } focus:outline-none focus:ring-4 focus:ring-orange-500/20`}
                    >
                      <option value="">Select Relationship</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Child">Child</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Friend">Friend</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.emergencyRelation && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <XMarkIcon className="h-3 w-3" />
                        {errors.emergencyRelation}
                      </p>
                    )}
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600">
                      Emergency Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        name="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                          errors.emergencyPhone 
                            ? 'border-red-500 focus:border-red-600' 
                            : 'border-gray-200 focus:border-orange-500 hover:border-gray-300'
                        } focus:outline-none focus:ring-4 focus:ring-orange-500/20`}
                        placeholder="+91 xxxxx xxxxx"
                      />
                    </div>
                    {errors.emergencyPhone && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <XMarkIcon className="h-3 w-3" />
                        {errors.emergencyPhone}
                      </p>
                    )}
                  </div>
                  
                  <div className="group lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600">
                      Emergency Contact Address
                    </label>
                    <div className="relative">
                      <HomeIcon className="h-5 w-5 text-gray-400 absolute left-4 top-4" />
                      <textarea
                        name="emergencyAddress"
                        value={formData.emergencyAddress}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all duration-200"
                        placeholder="Complete address"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Insurance Information Tab - Enhanced */}
            {activeTab === 'insurance' && (
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <ShieldCheckIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-lg font-semibold text-blue-900 mb-1">Insurance Benefits</h4>
                      <p className="text-sm text-blue-700">
                        Having health insurance helps in processing claims faster and reduces out-of-pocket expenses for medical treatments.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                    <DocumentTextIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Insurance Information</h3>
                    <p className="text-gray-600">Health insurance coverage details</p>
                  </div>
                </div>
                
                <div className="p-6 bg-gray-50 rounded-xl mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="hasInsurance"
                      checked={formData.hasInsurance}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all"
                    />
                    <label className="ml-3 text-base font-medium text-gray-700">
                      Patient has health insurance coverage
                    </label>
                  </div>
                </div>
                
                {formData.hasInsurance && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600">
                        Insurance Provider
                      </label>
                      <input
                        type="text"
                        name="insuranceProvider"
                        value={formData.insuranceProvider}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                        placeholder="E.g., Star Health, ICICI Lombard"
                      />
                    </div>
                    
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600">
                        Policy Number
                      </label>
                      <input
                        type="text"
                        name="policyNumber"
                        value={formData.policyNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                        placeholder="Policy number"
                      />
                    </div>
                    
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600">
                        Valid Until
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          name="validUntil"
                          value={formData.validUntil}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                        />
                        <CalendarIcon className="h-5 w-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                    
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600">
                        Coverage Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                        <input
                          type="number"
                          name="coverageAmount"
                          value={formData.coverageAmount}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                          placeholder="500000"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>

          {/* Enhanced Form Actions */}
          <div className="p-8 bg-gradient-to-r from-gray-50 to-gray-100 border-t rounded-b-2xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap gap-3">
                {activeTab !== tabs[0].id && (
                  <button
                    type="button"
                    onClick={handlePreviousTab}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-white hover:border-gray-400 transition-all duration-200 flex items-center gap-2 group"
                  >
                    <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Previous</span>
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => navigate('/patients')}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition-all duration-200 flex items-center gap-2 font-medium"
                >
                  <ClipboardDocumentCheckIcon className="h-5 w-5" />
                  <span>Save as Draft</span>
                </button>
                
                {activeTab === tabs[tabs.length - 1].id ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-sky-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Registering...</span>
                      </>
                    ) : (
                      <>
                        <UserPlusIcon className="h-5 w-5" />
                        <span>Register Patient</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextTab}
                    className="px-8 py-3 bg-gradient-to-r from-sky-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 font-semibold group"
                  >
                    <span>Next Step</span>
                    <ArrowLeftIcon className="h-5 w-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Help */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <SparklesIcon className="h-7 w-7 text-yellow-500" />
              Quick Help & Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-6 rounded-xl hover:shadow-lg transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <IdentificationIcon className="h-6 w-6 text-sky-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Personal Information</h4>
                    <p className="text-sm text-gray-600">Ensure name and DOB match government ID exactly</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl hover:shadow-lg transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <HeartIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Medical History</h4>
                    <p className="text-sm text-gray-600">Be thorough with allergies and chronic conditions</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl hover:shadow-lg transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Emergency Contact</h4>
                    <p className="text-sm text-gray-600">Must be reachable 24/7 in emergencies</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal - Enhanced */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center transform scale-100 transition-all duration-300">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <CheckCircleIcon className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-3">Registration Successful!</h3>
            <p className="text-gray-600 mb-8 text-lg">
              Patient has been successfully registered. Redirecting to patient profile...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-500 border-t-transparent"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsRegisterView;
