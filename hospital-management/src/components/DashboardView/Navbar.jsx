import React, { useState, useEffect } from 'react';
import { 
  HomeIcon, 
  UserGroupIcon, 
  UserIcon, 
  CalendarIcon, 
  BeakerIcon, 
  CurrencyRupeeIcon, 
  DocumentTextIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import Login from './Login';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [showLoginPage, setShowLoginPage] = useState(false);

  const navLinks = [
    { name: 'Dashboard', href: '#dashboard', icon: HomeIcon },
    { name: 'Patients', href: '#patients', icon: UserGroupIcon },
    { name: 'Doctors', href: '#doctors', icon: UserIcon },
    { name: 'Appointments', href: '#appointments', icon: CalendarIcon },
    { name: 'Pharmacy', href: '/pharmacy', icon: BeakerIcon },
    { name: 'Billing', href: '#billing', icon: CurrencyRupeeIcon },
    { name: 'Reports', href: '#reports', icon: DocumentTextIcon },
  ];

  // ✅ Load login data from localStorage on first render
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      // Check expiry
      if (userData.expiry && Date.now() < userData.expiry) {
        setUserName(userData.username || 'User');
        setIsLoggedIn(true);
      } else {
        localStorage.removeItem('user');
        setIsLoggedIn(false);
      }
    }
  }, []);

  // ✅ Callback when login success from Login.jsx
  const handleLoginSuccess = (name) => {
    setUserName(name);
    setIsLoggedIn(true);
    setShowLoginPage(false);
    setIsMenuOpen(false);
    
    // Refresh the page after login
    window.location.reload();
  };

  // ✅ Logout function
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
    setIsMenuOpen(false);
    localStorage.removeItem("user");
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    
    // Refresh the page after logout
    window.location.reload();
  };

  // ✅ If user token expired while browsing, auto logout after expiry
  useEffect(() => {
    const interval = setInterval(() => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.expiry && Date.now() > storedUser.expiry) {
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUserName('');
        alert("Session expired. Please login again.");
        // Refresh the page after session expiry
        window.location.reload();
      }
    }, 60000); // check every minute

    return () => clearInterval(interval);
  }, []);

  if (showLoginPage) {
    return <Login onLoginSuccess={handleLoginSuccess} onBack={() => setShowLoginPage(false)} />;
  }

  return (
    <nav className="bg-gradient-to-r from-sky-200 via-pink-100 to-sky-200 shadow-lg sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-sky-400 blur-xl opacity-50"></div>
                <span className="relative text-3xl filter drop-shadow-lg">🏥</span>
              </div>
              <h1 className="ml-3 text-2xl font-bold bg-gradient-to-r from-pink-600 to-sky-600 bg-clip-text text-transparent">
                MediCare Hospital
              </h1>
            </div>
          </div>

          {/* Right side items */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isLoggedIn ? (
              <>
                {/* Notification Bell */}
                <button className="relative p-2.5 bg-white/50 backdrop-blur-sm text-gray-700 hover:text-pink-600 hover:bg-white/70 rounded-full transition-all duration-300 hover:scale-110">
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute top-0.5 right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
                  </span>
                </button>

                {/* User Profile */}
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      className="h-10 w-10 rounded-full ring-2 ring-white ring-offset-2 ring-offset-sky-200"
                      src={`https://ui-avatars.com/api/?name=${userName}&background=ec4899&color=fff`}
                      alt="User"
                    />
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {userName}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-sky-500 text-white rounded-full hover:from-pink-600 hover:to-sky-600 transition-all duration-300 hover:scale-105 shadow-md"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLoginPage(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-sky-500 text-white rounded-full hover:from-pink-600 hover:to-sky-600 transition-all duration-300 hover:scale-105 shadow-md"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                Login
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-pink-600 hover:bg-white/50 focus:outline-none transition-all duration-300"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gradient-to-b from-white/90 to-sky-100/90 backdrop-blur-md border-t border-pink-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gradient-to-r hover:from-pink-50 hover:to-sky-50 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <link.icon className="h-5 w-5 mr-3" />
                {link.name}
              </a>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-pink-200">
            {isLoggedIn ? (
              <div className="px-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <img
                        className="h-12 w-12 rounded-full ring-2 ring-white ring-offset-2 ring-offset-sky-200"
                        src={`https://ui-avatars.com/api/?name=${userName}&background=ec4899&color=fff`}
                        alt="User"
                      />
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-base font-medium text-gray-800">{userName}</div>
                    <div className="text-sm font-medium text-gray-600">Welcome back!</div>
                  </div>
                  <button className="ml-auto p-2 bg-white/50 backdrop-blur-sm text-gray-700 hover:text-pink-600 hover:bg-white/70 rounded-full transition-all duration-300">
                    <BellIcon className="h-6 w-6" />
                  </button>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-3 w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-pink-500 to-sky-500 text-white rounded-full hover:from-pink-600 hover:to-sky-600 transition-all duration-300"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-5">
                <button
                  onClick={() => setShowLoginPage(true)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-pink-500 to-sky-500 text-white rounded-full hover:from-pink-600 hover:to-sky-600 transition-all duration-300"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decorative bottom border */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-pink-400 to-transparent"></div>
    </nav>
  );
};

export default Navbar;
