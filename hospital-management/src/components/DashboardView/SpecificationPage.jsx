import React from 'react';
import { 
  HeartIcon, 
  UserGroupIcon,
  BeakerIcon,
  ShieldCheckIcon,
  ClockIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const SpecializationPage = () => {
  const specializations = [
    {
      title: "Cardiology",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
      icon: "❤️",
      description: "Our state-of-the-art cardiology department provides comprehensive heart care services including diagnostics, interventional procedures, and cardiac rehabilitation.",
      features: [
        "24/7 Emergency Cardiac Care",
        "Advanced Cath Lab Facilities",
        "Non-invasive Cardiac Testing",
        "Cardiac Rehabilitation Programs"
      ],
      doctors: "15+ Specialists",
      successRate: "98%",
      gradient: "from-red-400 to-pink-500"
    },
    {
      title: "Neurology",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
      icon: "🧠",
      description: "Expert neurological care with cutting-edge technology for diagnosis and treatment of brain, spine, and nervous system disorders.",
      features: [
        "Advanced Brain Imaging",
        "Stroke Management Unit",
        "Epilepsy Treatment Center",
        "Neuro Rehabilitation"
      ],
      doctors: "12+ Specialists",
      successRate: "96%",
      gradient: "from-purple-400 to-indigo-500"
    },
    {
      title: "Orthopedics",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
      icon: "🦴",
      description: "Comprehensive bone and joint care including sports medicine, joint replacement, and trauma surgery with modern rehabilitation facilities.",
      features: [
        "Joint Replacement Surgery",
        "Sports Medicine",
        "Minimally Invasive Surgery",
        "Physiotherapy Center"
      ],
      doctors: "18+ Specialists",
      successRate: "97%",
      gradient: "from-blue-400 to-cyan-500"
    },
    {
      title: "Pediatrics",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
      icon: "👶",
      description: "Specialized pediatric care for infants, children, and adolescents with a child-friendly environment and experienced pediatricians.",
      features: [
        "Neonatal Intensive Care",
        "Pediatric Emergency Care",
        "Child Development Clinic",
        "Vaccination Programs"
      ],
      doctors: "20+ Specialists",
      successRate: "99%",
      gradient: "from-green-400 to-teal-500"
    },
    {
      title: "Oncology",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
      icon: "🎗️",
      description: "Comprehensive cancer care with advanced treatment options including chemotherapy, radiation therapy, and surgical oncology.",
      features: [
        "Medical Oncology",
        "Radiation Therapy",
        "Surgical Oncology",
        "Cancer Support Groups"
      ],
      doctors: "10+ Specialists",
      successRate: "94%",
      gradient: "from-orange-400 to-red-500"
    },
    {
      title: "Gastroenterology",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
      icon: "🫁",
      description: "Expert digestive system care with advanced endoscopy facilities and comprehensive treatment for gastrointestinal disorders.",
      features: [
        "Advanced Endoscopy",
        "Liver Disease Treatment",
        "IBD Management",
        "Nutritional Counseling"
      ],
      doctors: "8+ Specialists",
      successRate: "95%",
      gradient: "from-yellow-400 to-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-teal-600 to-blue-600 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Our Specializations</h1>
            <p className="text-xl text-teal-50 max-w-3xl mx-auto">
              Excellence in healthcare through specialized departments equipped with cutting-edge technology and expert medical professionals
            </p>
          </div>
        </div>
        
        {/* Decorative wave */}
        <div className="absolute bottom-0 w-full">
          <svg viewBox="0 0 1440 100" className="w-full h-16">
            <path fill="#F9FAFB" d="M0,32L80,37.3C160,43,320,53,480,58.7C640,64,800,64,960,58.7C1120,53,1280,43,1360,37.3L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
          </svg>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative -mt-10 z-20 px-6 mb-16">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <UserGroupIcon className="h-12 w-12 text-teal-600 mx-auto mb-2" />
              <h3 className="text-3xl font-bold text-gray-900">100+</h3>
              <p className="text-gray-600">Specialist Doctors</p>
            </div>
            <div className="text-center">
              <BeakerIcon className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <h3 className="text-3xl font-bold text-gray-900">15+</h3>
              <p className="text-gray-600">Departments</p>
            </div>
            <div className="text-center">
              <ShieldCheckIcon className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <h3 className="text-3xl font-bold text-gray-900">50K+</h3>
              <p className="text-gray-600">Successful Treatments</p>
            </div>
            <div className="text-center">
              <ClockIcon className="h-12 w-12 text-purple-600 mx-auto mb-2" />
              <h3 className="text-3xl font-bold text-gray-900">24/7</h3>
              <p className="text-gray-600">Emergency Services</p>
            </div>
          </div>
        </div>
      </div>

      {/* Specializations Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {specializations.map((spec, index) => (
            <div 
              key={index}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Image Section */}
              <div className="relative h-48 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-r ${spec.gradient} opacity-90`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl animate-pulse">{spec.icon}</span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{spec.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{spec.description}</p>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  {spec.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-700">
                      <CheckCircleIcon className="h-4 w-4 text-teal-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-xs text-gray-500">Doctors</p>
                      <p className="font-semibold text-gray-900">{spec.doctors}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Success Rate</p>
                      <p className="font-semibold text-green-600">{spec.successRate}</p>
                    </div>
                  </div>
                  <button className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-2 rounded-full hover:from-teal-600 hover:to-teal-700 transition-all duration-300 group-hover:scale-110">
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Need Help Choosing a Specialization?</h2>
          <p className="text-xl mb-8 text-teal-50">Our medical counselors are here to guide you to the right department</p>
          <button className="bg-white text-teal-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
            Contact Medical Counselor
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpecializationPage;
