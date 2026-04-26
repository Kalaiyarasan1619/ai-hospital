import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const AUTH_API = 'https://ai-hospital-user-ucks.onrender.com/api/auth';
const Login = ({ onLoginSuccess, onBack }) => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Auto login ONLY if user not expired
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
      const token = localStorage.getItem('token');

      if (storedUser && token) {
        if (Date.now() < storedUser.expiry) {
          onLoginSuccess(storedUser.username || "User");
        } else {
          // Clear both user and token if expired
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          console.log("Session expired during initial check");
        }
      }
    } catch (error) {
      console.error("Error in auto-login check:", error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [onLoginSuccess]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (passwordError) setPasswordError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isSignIn && formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      const normalizedEmail = formData.email.trim().toLowerCase();
      const normalizedPassword = formData.password;

      if (isSignIn) {
        // --- LOGIN ---
          const res = await fetch(AUTH_API + '/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: normalizedEmail,
            password: normalizedPassword
          })
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || 'Invalid credentials');
        }

        const data = await res.json();

        // Save token and user
        const expiryTime = Date.now() + 2 * 60 * 60 * 1000; // 2 hrs
        const userData = {
          username: data.username || formData.email.split('@')[0],
          email: normalizedEmail,
          expiry: expiryTime
        };

        // Store token directly without JSON.stringify
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.roles);
        localStorage.setItem('user', JSON.stringify(userData));

        console.log("Login successful, token stored:", data.token);
        onLoginSuccess(userData.username);

      } else {
        // --- SIGNUP ---
        const res = await fetch(AUTH_API + '/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.username,
            username: formData.username,
            email: normalizedEmail,
            password: normalizedPassword,
            repeatPassword: formData.confirmPassword,
            role: ['user']
          })
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || 'Signup failed');
        }

        const data = await res.json();
        alert(data.message || "Signup successful! Please sign in.");
        setIsSignIn(true);
        setFormData({
          ...formData,
          username: '',
          password: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto logout check - runs every minute
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
        const token = localStorage.getItem('token');

        if (user && token) {
          if (Date.now() > user.expiry) {
            console.log("Session expired during interval check");
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            alert("Session expired. Please sign in again.");
            window.location.reload();
          }
        }
      } catch (error) {
        console.error("Error in session check:", error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }, 60000); 

    return () => clearInterval(interval);
  }, []);

  // Logout function - properly implemented
  const handleLogout = (e) => {
    e.preventDefault(); // Prevent default button behavior
    console.log("Logout button clicked");
    
    try {
      // First log what's in localStorage
      const beforeUser = localStorage.getItem('user');
      const beforeToken = localStorage.getItem('token');
      console.log("Before logout - User:", beforeUser);
      console.log("Before logout - Token:", beforeToken);
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Verify removal
      const afterUser = localStorage.getItem('user');
      const afterToken = localStorage.getItem('token');
      console.log("After logout - User:", afterUser);
      console.log("After logout - Token:", afterToken);
      
      // Reload page
      alert("Logout successful!");
      window.location.reload();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // For testing - attach to window
  useEffect(() => {
    window.logoutUser = handleLogout;
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-white to-sky-50 overflow-y-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="fixed top-4 left-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 z-10"
      >
        <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
      </button>

      {/* Test Logout Button */}
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 p-2 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600 transition-all duration-300"
      >
        Test Logout
      </button>

      <div className="flex items-center justify-center min-h-screen p-4 my-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-sky-500 p-6 text-center">
            <div className="inline-block p-3 bg-white/20 rounded-full mb-3">
              <span className="text-4xl">🏥</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">MediCare Hospital</h1>
            <p className="text-white/90 text-sm">
              {isSignIn ? "Welcome back! Sign in to continue" : "Join us today! Create your account"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {!isSignIn && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <div className="relative">
                  <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    placeholder="Enter your username"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            {!isSignIn && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Retype Password</label>
                <div className="relative">
                  <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>

                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-sky-500 text-white font-medium rounded-lg hover:from-pink-600 hover:to-sky-600 transition-all duration-300"
            >
              {loading ? "Please wait..." : isSignIn ? "Sign In" : "Sign Up"}
            </button>

            {/* Toggle */}
            <div className="text-center pt-4">
              <p className="text-gray-600 text-sm">
                {isSignIn ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignIn(!isSignIn);
                    setPasswordError('');
                    setShowPassword(false);
                    setShowConfirmPassword(false);
                    setFormData({
                      username: '',
                      email: '',
                      password: '',
                      confirmPassword: ''
                    });
                  }}
                  className="text-pink-600 hover:text-pink-700 font-semibold hover:underline"
                >
                  {isSignIn ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
