import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  HeartIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  ChartBarIcon,
  BeakerIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { ArrowRightIcon, PlayIcon } from '@heroicons/react/24/solid';

const WelcomePage = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [counters, setCounters] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    revenue: 0
  });

  // Animated counter effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCounters(prev => ({
        patients: prev.patients < 15420 ? prev.patients + 154 : 15420,
        doctors: prev.doctors < 284 ? prev.doctors + 3 : 284,
        appointments: prev.appointments < 147 ? prev.appointments + 2 : 147,
        revenue: prev.revenue < 45.2 ? prev.revenue + 0.5 : 45.2
      }));
    }, 20);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    { title: "Total Patients", value: counters.patients.toLocaleString(), icon: UserGroupIcon, gradient: "from-blue-400 to-blue-600" },
    { title: "Doctors", value: counters.doctors, icon: HeartIcon, gradient: "from-emerald-400 to-emerald-600" },
    { title: "Appointments Today", value: counters.appointments, icon: CalendarDaysIcon, gradient: "from-violet-400 to-violet-600" },
    { title: "Revenue This Month", value: `₹${counters.revenue.toFixed(1)}L`, icon: CurrencyDollarIcon, gradient: "from-amber-400 to-amber-600" },
  ];

  const features = [
    {
      title: "Patient Management",
      description: "Complete patient records with AI-powered insights",
      icon: UserGroupIcon,
      color: "teal",
      image: "🏥"
    },
    {
      title: "Smart Scheduling",
      description: "Intelligent appointment system with zero conflicts",
      icon: ClockIcon,
      color: "blue",
      image: "📅"
    },
    {
      title: "Lab Integration",
      description: "Real-time test results and automated reporting",
      icon: BeakerIcon,
      color: "purple",
      image: "🔬"
    },
    {
      title: "Analytics Pro",
      description: "Advanced insights for better decision making",
      icon: ChartBarIcon,
      color: "orange",
      image: "📊"
    },
  ];

  const testimonials = [
    { name: "Dr. Rajesh Kumar", role: "Chief Medical Officer", text: "MediCare transformed how we manage our 500+ bed hospital" },
    { name: "Dr. Priya Sharma", role: "Head of Pediatrics", text: "The best investment we made for our healthcare facility" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Hero Section with 3D Effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-teal-500 to-blue-600 transform skew-y-1"></div>
        <div className="relative bg-gradient-to-r from-teal-600/95 via-teal-500/95 to-blue-600/95 text-white">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          
          <div className="relative z-10 px-6 py-24">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="animate-fade-in">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                    <SparklesIcon className="h-5 w-5 text-yellow-300" />
                    <span className="text-sm font-medium">AI-Powered Healthcare Platform</span>
                  </div>
                  
                  <h1 className="text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                    Welcome to
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-teal-200">
                      MediCare Hospital
                    </span>
                  </h1>
                  
                  <p className="text-xl text-teal-50 mb-10 leading-relaxed">
                    Revolutionizing healthcare management with cutting-edge technology and seamless patient care
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    <button className="group bg-white text-teal-600 px-8 py-4 rounded-full font-bold hover:bg-teal-50 transition-all duration-300 flex items-center gap-3 shadow-2xl hover:shadow-3xl transform hover:scale-105">
                      <PlayIcon className="h-5 w-5 group-hover:scale-125 transition-transform" />
                      Watch Demo
                    </button>
                    <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-teal-600 transition-all duration-300 transform hover:scale-105">
                      Get Started Free
                      <ArrowRightIcon className="inline-block h-5 w-5 ml-2" />
                    </button>
                  </div>
                </div>
                
                <div className="hidden lg:block relative">
                  <div className="relative transform perspective-1000 hover:rotate-y-12 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-400 blur-3xl opacity-30"></div>
                    <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                            <div className="h-8 w-8 bg-white/20 rounded-lg mb-2"></div>
                            <div className="h-2 bg-white/20 rounded w-3/4 mb-1"></div>
                            <div className="h-2 bg-white/20 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-gradient-to-r from-teal-400 to-blue-400 p-4 rounded-xl">
                        <div className="flex items-center justify-between text-white">
                          <span className="font-bold">Live Dashboard</span>
                          <span className="text-2xl">📊</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Stats Cards */}
      <div className="relative z-20 -mt-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-white rounded-2xl p-6 shadow-2xl hover:shadow-3xl border border-gray-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-teal-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  
                  <div className={`relative w-16 h-16 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg transform group-hover:rotate-12 transition-transform duration-300`}>
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-gray-600 text-sm font-medium mb-2">{stat.title}</h3>
                  <p className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">+12% from last month</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Features Showcase */}
      <div className="px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full mb-6">
              <StarIcon className="h-5 w-5" />
              <span className="text-sm font-bold">FEATURES THAT MATTER</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Everything You Need,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                Nothing You Don't
              </span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                    activeFeature === index 
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-2xl scale-105' 
                      : 'bg-white hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-4xl ${activeFeature === index ? 'animate-bounce' : ''}`}>
                      {feature.image}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">{feature.title}</h3>
                      <p className={activeFeature === index ? 'text-teal-50' : 'text-gray-600'}>
                        {feature.description}
                      </p>
                    </div>
                    {activeFeature === index && (
                      <CheckCircleIcon className="h-6 w-6 ml-auto animate-ping" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-400 blur-3xl opacity-20"></div>
              <div className="relative bg-gradient-to-br from-teal-600 to-blue-600 rounded-3xl p-12 text-white shadow-2xl transform hover:rotate-1 transition-transform duration-300">
                <div className="text-6xl mb-6 animate-pulse">{features[activeFeature].image}</div>
                <h3 className="text-3xl font-bold mb-4">{features[activeFeature].title}</h3>
                <p className="text-teal-50 text-lg leading-relaxed">{features[activeFeature].description}</p>
                
                <div className="mt-8 space-y-3">
                  {['Real-time updates', '99.9% uptime', '24/7 support'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircleIcon className="h-5 w-5 text-teal-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg italic mb-6">"{testimonial.text}"</p>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative px-6 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 opacity-90"></div>
        <div className="absolute inset-0 bg-grid-white/10"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <ShieldCheckIcon className="h-20 w-20 mx-auto mb-8 animate-bounce" />
          <h2 className="text-5xl font-bold mb-6">
            Join 1000+ Hospitals Already Using MediCare
          </h2>
          <p className="text-xl mb-10 text-teal-50">
            Start your 30-day free trial. No credit card required.
          </p>
          <button className="bg-white text-teal-600 px-12 py-5 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl transform hover:scale-110">
            Start Your Free Trial Now
          </button>
          <p className="mt-6 text-sm text-teal-100">
            ✓ No credit card required ✓ 30-day free trial ✓ Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
