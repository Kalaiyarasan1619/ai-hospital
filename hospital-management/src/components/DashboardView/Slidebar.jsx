import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UserGroupIcon, 
  UserIcon, 
  CalendarIcon, 
  BeakerIcon, 
  CurrencyRupeeIcon, 
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  ChartBarIcon,
  Squares2X2Icon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const [activeLink, setActiveLink] = useState('Home');
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('User');
  const [isAdmin, setIsAdmin] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check user role from localStorage on component mount
  useEffect(() => {
    const checkUserRole = () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const role = localStorage.getItem('role');
        console.log(role, "Roles")
        
        // Check if user has ROLE_ADMIN
        if (role === "ROLE_ADMIN") {
          setIsAdmin(true);
          setUserRole('Admin');
        } else {
          setIsAdmin(false);
          setUserRole('User');
        }
        
        // Set user name if available
        if (userData) {
          if (userData.username) {
            setUserName(userData.username);
          } else if (userData.name) {
            setUserName(userData.name);
          } else if (userData.firstName) {
            setUserName(`${userData.firstName} ${userData.lastName || ''}`);
          }
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        setIsAdmin(false);
        setUserRole('User');
      }
    };

    checkUserRole();
  }, []);

  // Set active link based on current route
  useEffect(() => {
    const currentPath = location.pathname.slice(1); // Remove leading slash
    const activeItem = allSidebarLinks.find(link => link.href === currentPath);
    if (activeItem) {
      setActiveLink(activeItem.name);
    }
  }, [location]);

  // Outside click handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsCollapsed(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Drag functionality
  useEffect(() => {
    let startX = 0;
    let sidebarWidth = 0;
    let isDragging = false;

    const handleMouseDown = (e) => {
      if (e.target.classList.contains('drag-handle')) {
        isDragging = true;
        startX = e.clientX;
        sidebarWidth = sidebarRef.current.offsetWidth;
        document.body.style.cursor = 'ew-resize';
        document.body.style.userSelect = 'none';
      }
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const diff = e.clientX - startX;
      const newWidth = sidebarWidth + diff;
      
      // Collapse if dragged to less than 150px, expand if more
      if (newWidth < 150) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // All possible sidebar links
  const allSidebarLinks = [
    { name: 'Home', href: 'home', icon: HomeIcon, badge: null, forAdmin: false }, // available to all
    { name: 'Dashboard', href: 'dashboard', icon: Squares2X2Icon, badge: null, forAdmin: true },
    { name: 'Patients', href: 'patient', icon: UserGroupIcon, badge: '124', forAdmin: true },
    { name: 'Doctors', href: 'doctors', icon: UserIcon, badge: '8', forAdmin: false }, // available to all
    { name: 'Appointments', href: 'appointments', icon: CalendarIcon, badge: '3', forAdmin: false }, // available to all
    { name: 'Pharmacy', href: 'pharmacy', icon: BeakerIcon, badge: null, forAdmin: false },
    { name: 'AI Assistant', href: 'ai-assistant', icon: SparklesIcon, badge: 'RAG', forAdmin: false },
    { name: 'Billing', href: 'billing', icon: CurrencyRupeeIcon, badge: '5', forAdmin: true },
    { name: 'Reports', href: 'reports', icon: DocumentTextIcon, badge: null, forAdmin: true },
    { name: 'Analytics', href: 'analytics', icon: ChartBarIcon, badge: 'New', forAdmin: true },
  ];

  // Filter links based on user role - only show non-admin links if not admin
  const sidebarLinks = allSidebarLinks.filter(link => {
    return isAdmin || !link.forAdmin;
  });

  const bottomLinks = [
    { name: 'Settings', href: 'settings', icon: Cog6ToothIcon },
    { name: 'Logout', href: 'logout', icon: ArrowRightOnRectangleIcon },
  ];

  const handleLinkClick = (e, linkName, href) => {
    e.preventDefault();
    setActiveLink(linkName);
    
    // Navigate to the route
    if (href === 'logout') {
      // Handle logout logic
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
      window.location.reload(); // Refresh the page to clear the state
    } else {
      navigate(`/${href}`);
    }
  };

  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      <aside 
        ref={sidebarRef}
        className={`${isCollapsed ? 'w-20' : 'w-72'} bg-gradient-to-b from-sky-200 via-pink-100 to-sky-300 min-h-screen transition-all duration-300 ease-in-out flex flex-col relative z-40 flex-shrink-0`}
      >
        {/* Drag Handle */}
        <div 
          className="drag-handle absolute right-0 top-0 w-1 h-full cursor-ew-resize bg-transparent hover:bg-pink-400 transition-colors duration-200 opacity-0 hover:opacity-50"
        />
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ec4899' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Logo Section */}
        <div className="relative z-10 flex items-center justify-between p-4 border-b border-white/30">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-sky-400 blur-xl opacity-50"></div>
              <span className="relative text-4xl cursor-pointer filter drop-shadow-lg" onClick={() => setIsCollapsed(false)}>🏥</span>
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <h2 className="text-xl font-bold text-gray-800">MediCare</h2>
                <p className="text-xs text-gray-600">Hospital Management</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/70 text-gray-700 hover:text-gray-900 transition-all duration-200 hover:scale-110"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Role Badge - Only when not collapsed */}
        {!isCollapsed && (
          <div className="relative z-10 px-4 pt-4">
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              isAdmin 
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' 
                : 'bg-gradient-to-r from-sky-400 to-blue-500 text-white'
            }`}>
              {isAdmin ? 'Admin Access' : 'Limited Access'}
            </div>
          </div>
        )}

        {/* Quick Stats - Only when not collapsed and is admin */}
        {!isCollapsed && isAdmin && (
          <div className="relative z-10 p-4 grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-sky-400 to-sky-500 p-3 rounded-xl shadow-lg">
              <p className="text-xs text-white/90">Today's Patients</p>
              <p className="text-xl font-bold text-white">48</p>
            </div>
            <div className="bg-gradient-to-br from-pink-400 to-pink-500 p-3 rounded-xl shadow-lg">
              <p className="text-xs text-white/90">Appointments</p>
              <p className="text-xl font-bold text-white">12</p>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="relative z-10 flex-1 p-4 overflow-visible">
          <ul className="space-y-2">
            {sidebarLinks.map((link, index) => (
              <li key={link.name} className="relative">
                <a
                  href={`#${link.href}`}
                  onClick={(e) => handleLinkClick(e, link.name, link.href)}
                  className={`relative flex items-center p-3 rounded-xl transition-all duration-300 group cursor-pointer
                    ${activeLink === link.name 
                      ? 'bg-gradient-to-r from-sky-500 to-pink-500 text-white shadow-lg' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-white/50 backdrop-blur-sm'
                    }`}
                >
                  {/* Active indicator */}
                  {activeLink === link.name && (
                    <div className="absolute inset-0 bg-white opacity-20 rounded-xl"></div>
                  )}
                  
                  <link.icon className={`${isCollapsed ? 'h-6 w-6 mx-auto' : 'h-5 w-5'} flex-shrink-0 relative z-10 transition-transform group-hover:scale-110`} />
                  
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 font-medium relative z-10">{link.name}</span>
                      {link.badge && (
                        <span className={`ml-auto px-2 py-1 text-xs rounded-full relative z-10
                          ${link.badge === 'New' 
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white animate-pulse' 
                            : activeLink === link.name
                              ? 'bg-white/70 text-gray-700'
                              : 'bg-white/70 text-gray-700'
                          }`}>
                          {link.badge}
                        </span>
                      )}
                    </>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-white text-gray-800 text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all duration-200 shadow-2xl border border-pink-200 z-[999]">
                      <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-0 h-0 
                        border-t-[5px] border-t-transparent 
                        border-r-[5px] border-r-white 
                        border-b-[5px] border-b-transparent">
                      </div>
                      {link.name}
                      {link.badge && (
                        <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full
                          ${link.badge === 'New' 
                            ? 'bg-pink-500 text-white' 
                            : 'bg-sky-100 text-gray-700'
                          }`}>
                          {link.badge}
                        </span>
                      )}
                    </div>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="relative z-10 p-4 border-t border-white/30 overflow-visible">
          {/* Notification Bell - Only for admin users */}
          {!isCollapsed && isAdmin && (
            <button className="w-full mb-4 p-3 bg-gradient-to-r from-orange-400 to-amber-400 rounded-xl flex items-center justify-between group hover:shadow-lg transition-all duration-300">
              <div className="flex items-center">
                <BellIcon className="h-5 w-5 text-white" />
                <span className="ml-3 text-sm font-medium text-white">Notifications</span>
              </div>
              <span className="bg-white text-orange-600 text-xs px-2 py-1 rounded-full font-bold animate-pulse">12</span>
            </button>
          )}

          <ul className="space-y-2 mb-4">
            {bottomLinks.map((link) => (
              <li key={link.name} className="relative">
                <a
                  href={`#${link.href}`}
                  onClick={(e) => handleLinkClick(e, link.name, link.href)}
                  className={`flex items-center p-3 rounded-xl transition-all duration-200 group cursor-pointer
                    ${activeLink === link.name 
                      ? 'bg-gradient-to-r from-sky-500 to-pink-500 text-white shadow-lg' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-white/50 backdrop-blur-sm'
                    }`}
                >
                  <link.icon className={`${isCollapsed ? 'h-6 w-6 mx-auto' : 'h-5 w-5'} flex-shrink-0 transition-transform group-hover:scale-110`} />
                  {!isCollapsed && (
                    <span className="ml-3 font-medium">{link.name}</span>
                  )}
                  
                  {/* Tooltip for bottom links */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-white text-gray-800 text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all duration-200 shadow-2xl border border-pink-200 z-[999]">
                      <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-0 h-0 
                        border-t-[5px] border-t-transparent 
                        border-r-[5px] border-r-white 
                        border-b-[5px] border-b-transparent">
                      </div>
                      {link.name}
                    </div>
                  )}
                </a>
              </li>
            ))}
          </ul>

          {/* User Profile */}
          <div 
            className={`${isCollapsed ? 'px-2' : 'p-4'} bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-sm rounded-xl border border-white/50 cursor-pointer group relative`}
            onClick={() => setIsCollapsed(false)}
          >
            <div className={`flex ${isCollapsed ? 'justify-center' : 'items-center'}`}>
              <div className="relative">
                <img
                  className={`${isCollapsed ? 'h-10 w-10' : 'h-12 w-12'} rounded-full ring-2 ring-gradient-to-r from-pink-400 to-sky-400 ring-offset-2 ring-offset-transparent group-hover:ring-4 transition-all`}
                  src={`https://ui-avatars.com/api/?name=${userName}&background=ec4899&color=fff`}
                  alt="User"
                />
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              {!isCollapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-600">{isAdmin ? 'Administrator' : 'User'}</p>
                </div>
              )}
            </div>
            
            {/* User tooltip */}
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-white text-gray-800 text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all duration-200 shadow-2xl border border-pink-200 z-[999]">
                <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-0 h-0 
                  border-t-[5px] border-t-transparent 
                  border-r-[5px] border-r-white 
                  border-b-[5px] border-b-transparent">
                </div>
                {userName}
                <p className="text-xs text-gray-500">{isAdmin ? 'Administrator' : 'User'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Floating Background Elements */}
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-300 rounded-full filter blur-3xl opacity-30"></div>
        <div className="absolute top-1/2 right-0 w-32 h-32 bg-sky-300 rounded-full filter blur-3xl opacity-30"></div>
      </aside>
    </>
  );
};

export default Sidebar;
