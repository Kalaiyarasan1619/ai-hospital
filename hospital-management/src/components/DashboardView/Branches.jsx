import React from 'react';
import { MapPinIcon, PhoneIcon, ClockIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const Branches = () => {
  const branches = [
    {
      id: 1,
      name: "MediCare Chennai - Adyar",
      image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&h=600&fit=crop",
      address: "123, Adyar Main Road, Chennai - 600020",
      phone: "+91 44 2345 6789",
      timing: "Open 24/7",
      beds: "500+ Beds",
      doctors: "120+ Doctors",
      specialties: ["Cardiology", "Neurology", "Oncology"],
      rating: 4.8,
      emergency: true,
      features: ["ICU", "Emergency", "Pharmacy", "Lab"]
    },
    {
      id: 2,
      name: "MediCare Chennai - T.Nagar",
      image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=600&fit=crop",
      address: "456, Usman Road, T.Nagar, Chennai - 600017",
      phone: "+91 44 2815 9876",
      timing: "6:00 AM - 11:00 PM",
      beds: "300+ Beds",
      doctors: "80+ Doctors",
      specialties: ["Pediatrics", "Gynecology", "General Medicine"],
      rating: 4.7,
      emergency: true,
      features: ["NICU", "Labor Rooms", "Diagnostics"]
    },
    {
      id: 3,
      name: "MediCare Chennai - Velachery",
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop",
      address: "789, Velachery Main Road, Chennai - 600042",
      phone: "+91 44 2234 5678",
      timing: "Open 24/7",
      beds: "400+ Beds",
      doctors: "100+ Doctors",
      specialties: ["Trauma Care", "Emergency Medicine", "Surgery"],
      rating: 4.9,
      emergency: true,
      features: ["Trauma Center", "Blood Bank", "MRI"]
    },
    {
      id: 4,
      name: "MediCare Chennai - Anna Nagar",
      image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=600&fit=crop",
      address: "321, 2nd Avenue, Anna Nagar, Chennai - 600040",
      phone: "+91 44 2626 7890",
      timing: "7:00 AM - 10:00 PM",
      beds: "250+ Beds",
      doctors: "60+ Doctors",
      specialties: ["Dermatology", "ENT", "Ophthalmology"],
      rating: 4.6,
      emergency: false,
      features: ["Laser Center", "Cosmetic Surgery", "Eye Care"]
    },
    {
      id: 5,
      name: "MediCare Chennai - OMR",
      image: "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=800&h=600&fit=crop",
      address: "567, Old Mahabalipuram Road, Chennai - 600096",
      phone: "+91 44 2454 3210",
      timing: "Open 24/7",
      beds: "600+ Beds",
      doctors: "150+ Doctors",
      specialties: ["All Specialties", "Research", "Robotic Surgery"],
      rating: 4.9,
      emergency: true,
      features: ["Research Lab", "Robotic Surgery", "Helipad"]
    },
    {
      id: 6,
      name: "MediCare Chennai - Tambaram",
      image: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=800&h=600&fit=crop",
      address: "890, GST Road, Tambaram, Chennai - 600045",
      phone: "+91 44 2236 5432",
      timing: "6:00 AM - 11:00 PM",
      beds: "350+ Beds",
      doctors: "90+ Doctors",
      specialties: ["Diabetology", "Nephrology", "Urology"],
      rating: 4.7,
      emergency: true,
      features: ["Dialysis Center", "Diabetes Clinic", "Physiotherapy"]
    }
  ];

  return (
    <div className="py-10 px-6 md:px-10 bg-gray-50">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Hospital Branches</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Providing quality healthcare across Chennai with 6 state-of-the-art facilities
        </p>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {branches.map((branch) => (
          <div key={branch.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col md:flex-row h-full">
              {/* Branch Image */}
              <div className="md:w-2/5 h-60 md:h-auto relative overflow-hidden">
                <img 
                  src={branch.image} 
                  alt={branch.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                {branch.emergency && (
                  <div className="absolute top-4 left-0 bg-red-500 text-white px-4 py-1 rounded-r-full text-sm font-semibold shadow-md">
                    24/7 Emergency
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60"></div>
              </div>

              {/* Branch Details */}
              <div className="md:w-3/5 p-6 flex flex-col">
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{branch.name}</h3>
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                      <StarIcon className="h-4 w-4 text-yellow-500" />
                      <span className="ml-1 text-sm font-medium text-gray-700">{branch.rating}</span>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 mb-2 text-gray-700">
                    <MapPinIcon className="h-5 w-5 text-sky-600 flex-shrink-0 mt-0.5" />
                    <span>{branch.address}</span>
                  </div>

                  {/* Contact & Hours */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <PhoneIcon className="h-4 w-4 text-sky-600" />
                      <span className="text-sm">{branch.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <ClockIcon className="h-4 w-4 text-sky-600" />
                      <span className="text-sm">{branch.timing}</span>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-sky-50 p-2 rounded-lg text-center">
                      <p className="text-sm text-gray-600">Beds</p>
                      <p className="font-bold text-sky-700">{branch.beds}</p>
                    </div>
                    <div className="bg-pink-50 p-2 rounded-lg text-center">
                      <p className="text-sm text-gray-600">Doctors</p>
                      <p className="font-bold text-pink-600">{branch.doctors}</p>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Key Specialties:</p>
                    <div className="flex flex-wrap gap-2">
                      {branch.specialties.map((specialty, idx) => (
                        <span 
                          key={idx} 
                          className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {branch.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-xs text-gray-600">
                        <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 mr-1" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <button className="mt-4 w-full bg-gradient-to-r from-sky-500 to-pink-500 text-white py-2.5 rounded-lg font-medium hover:from-sky-600 hover:to-pink-600 transition-all duration-300 shadow-md">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Branches;
