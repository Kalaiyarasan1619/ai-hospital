import React from 'react';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  ClockIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'About Us', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Doctors', href: '#doctors' },
    { name: 'Appointments', href: '#appointments' },
    { name: 'Contact', href: '#contact' }
  ];

  const services = [
    { name: 'Emergency Care', href: '#emergency' },
    { name: 'Surgery', href: '#surgery' },
    { name: 'Pharmacy', href: '/pharmacy' },
    { name: 'Laboratory', href: '#laboratory' },
    { name: 'Radiology', href: '#radiology' }
  ];

  const socialLinks = [
    { 
      name: 'Facebook', 
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
        </svg>
      )
    },
    { 
      name: 'Twitter', 
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
        </svg>
      )
    },
    { 
      name: 'LinkedIn', 
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
        </svg>
      )
    },
    { 
      name: 'YouTube', 
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    }
  ];

  return (
    <footer className="relative bg-gradient-to-br from-sky-200 via-pink-100 to-sky-300 text-gray-800">
      {/* Wave Top */}
      <div className="absolute top-0 w-full overflow-hidden leading-none">
        <svg className="relative block w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
            className="fill-white"></path>
        </svg>
      </div>

      <div className="relative pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-sky-400 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🏥</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">MediCare</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Leading healthcare provider committed to delivering exceptional medical services with compassion and excellence.
              </p>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-10 h-10 bg-white/50 backdrop-blur-sm hover:bg-gradient-to-r hover:from-pink-400 hover:to-sky-400 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg text-gray-700 hover:text-white"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900">
                <div className="w-1 h-6 bg-gradient-to-b from-pink-400 to-sky-400 rounded-full"></div>
                Quick Links
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      className="text-gray-700 hover:text-sky-600 transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-0 group-hover:w-4 h-0.5 bg-gradient-to-r from-pink-400 to-sky-400 transition-all duration-300"></span>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900">
                <div className="w-1 h-6 bg-gradient-to-b from-pink-400 to-sky-400 rounded-full"></div>
                Our Services
              </h4>
              <ul className="space-y-3">
                {services.map((service, index) => (
                  <li key={index}>
                    <a 
                      href={service.href}
                      className="text-gray-700 hover:text-sky-600 transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-0 group-hover:w-4 h-0.5 bg-gradient-to-r from-pink-400 to-sky-400 transition-all duration-300"></span>
                      {service.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900">
                <div className="w-1 h-6 bg-gradient-to-b from-pink-400 to-sky-400 rounded-full"></div>
                Contact Info
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3 group">
                  <div className="w-10 h-10 bg-white/50 backdrop-blur-sm group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-sky-400 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0 shadow-md group-hover:text-white">
                    <MapPinIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-gray-700">123 Healthcare Avenue</p>
                    <p className="text-gray-700">Chennai, Tamil Nadu 600001</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-white/50 backdrop-blur-sm group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-sky-400 rounded-lg flex items-center justify-center transition-all duration-300 shadow-md group-hover:text-white">
                    <PhoneIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-gray-700">+91 98765 43210</p>
                    <p className="text-gray-600 text-sm">Emergency: 108</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-white/50 backdrop-blur-sm group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-sky-400 rounded-lg flex items-center justify-center transition-all duration-300 shadow-md group-hover:text-white">
                    <EnvelopeIcon className="h-5 w-5" />
                  </div>
                  <p className="text-gray-700">info@medicare.com</p>
                </div>
                
                <div className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-white/50 backdrop-blur-sm group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-sky-400 rounded-lg flex items-center justify-center transition-all duration-300 shadow-md group-hover:text-white">
                    <ClockIcon className="h-5 w-5" />
                  </div>
                  <p className="text-gray-700">24/7 Emergency Services</p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="border-t border-white/30 pt-8 mb-8">
            <div className="bg-white/30 backdrop-blur-md rounded-2xl p-8 shadow-lg">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">Subscribe to Our Newsletter</h3>
                  <p className="text-gray-700">Get health tips and updates delivered to your inbox</p>
                </div>
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 bg-white/70 backdrop-blur-sm border border-pink-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-sky-400 focus:bg-white transition-all duration-300"
                  />
                  <button className="bg-gradient-to-r from-pink-400 to-sky-400 hover:from-pink-500 hover:to-sky-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/30 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-700 text-sm">
                © {currentYear} MediCare Hospital. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm">
                <a href="#" className="text-gray-700 hover:text-sky-600 transition-colors duration-200">Privacy Policy</a>
                <a href="#" className="text-gray-700 hover:text-sky-600 transition-colors duration-200">Terms of Service</a>
                <a href="#" className="text-gray-700 hover:text-sky-600 transition-colors duration-200">Cookie Policy</a>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span>Made with</span>
                <HeartIcon className="h-4 w-4 text-pink-500 animate-pulse" />
                <span>in India</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Background Elements */}
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-300 rounded-full filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-sky-300 rounded-full filter blur-3xl opacity-30"></div>
    </footer>
  );
};

export default Footer;
