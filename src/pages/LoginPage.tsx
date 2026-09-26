import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { API_URL, ACTIVITY_URL } from '@/components/api';

// Import images from assets folder
import logo from '@/asstes/globplselogo.jpeg';
import illustration from '@/asstes/laptopimage.jpg';

const BASE_URL = API_URL;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // If token already exists, redirect based on role
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (token) {
    if (userRole === 'admin') {
      return <Navigate to="/admindashboard" replace />;
    }
    return <Navigate to="/search" replace />;
  }

  // Helper function to get device info
  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  };

  // Helper function to get IP address
  const getIPAddress = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error fetching IP:', error);
      return '127.0.0.1';
    }
  };

  // Function to create activity log for users
  const createActivityLog = async (userId: number, userName: string, role: string) => {
    try {
      const ipAddress = await getIPAddress();
      const device = getDeviceInfo();

      const logData = {
        userId,
        userName,
        role,
        action_id: 1,
        module_id: 2,
        description: 'User logged in successfully',
        ipAddress,
        device,
        status: 'SUCCESS'
      };

      const response = await fetch(`${ACTIVITY_URL}/api/activity-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });

      const result = await response.json();
      if (!result.success) {
        console.error('Failed to create activity log:', result.message);
      }
      return result;
    } catch (error) {
      console.error('Error creating activity log:', error);
      return null;
    }
  };

  const storeUserIfNotExists = async (
    userId: string,
    email: string,
    password: string,
    role: string,
    name: string,
    phone: string,
    package_id: number,
    pack_exp_date: string
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/api/store-user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userId,
          email,
          password,
          role,
          name,
          phone,
          package_id,
          pack_exp_date,
        }),
      });

      return await response.json();
    } catch (e) {
      console.log("Store user failed", e);
      return null;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // ✅ ADMIN LOGIN - redirect to admin panel
    if (email === 'Admin@gmail.com' && password === '1234') {
      try {
        localStorage.setItem("token", "admin-token");
        localStorage.setItem("userRole", "admin");
        const adminData = {
          id: "1",
          email: 'Admin@gmail.com',
          role: 'admin',
          name: 'Admin'
        };
        localStorage.setItem("seller", JSON.stringify(adminData));

        setLoading(false);
        navigate("/admindashboard");
      } catch (error) {
        setLoading(false);
        setError("Login failed. Please try again.");
      }
      return;
    }

    try {
            const response = await fetch(`https://globpulsebita.gfeworldwide.com/api/seller/login`, {

      // const response = await fetch(`https://www.globpulse.com/api/seller/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.status === true && data.token) {
        // Store user only if not exists with all parameters
        if (data.seller && data.seller.id) {
          await storeUserIfNotExists(
            data.seller.id.toString(),
            data.seller.email,
            password,
            "seller",
            data.seller.name,
            data.seller.phone,
            data.seller.package_id,
            data.seller.pack_exp_date
          );
        }

        // Save login details
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", "seller");
        localStorage.setItem("seller", JSON.stringify(data.seller));

        // Activity Log for seller
        if (data.seller && data.seller.id) {
          await createActivityLog(
            data.seller.id,
            data.seller.name || data.seller.email,
            "seller"
          );
        }

        navigate("/search");
      } else {
        setError(data.message || "Invalid Email or Password");
      }
    }catch (err) {
  console.error("Login API Error:", err);
  console.error("API URL:", "https://globpulsebita.gfeworldwide.com/api/seller/login");
  console.error("Email:", email);

  setError("Unable to connect to server. Please check the API.");
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1849] via-[#FFFCFB] to-[#276F27] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">

      {/* S-Curve Background Design - exactly same as desktop */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top S-Curve - Dark Navy Blue (#0B1849) with Light Blue (#4BB8FA) and Bright Green (#499A13) accents */}
        <div
          className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#0B1849] via-[#4BB8FA] to-[#499A13] opacity-25"
          style={{
            transform: 'rotate(-15deg) scale(1.2)',
          }}
        ></div>

        {/* Bottom S-Curve - Dark Green (#276F27) with Bright Green (#499A13) and Light Blue (#4BB8FA) accents */}
        <div
          className="absolute -bottom-40 -right-20 w-[700px] h-[700px] rounded-full bg-gradient-to-tl from-[#276F27] via-[#499A13] to-[#4BB8FA] opacity-25"
          style={{
            transform: 'rotate(20deg) scale(1.3)',
          }}
        ></div>

        {/* Middle S-Curve - Bright Green (#499A13) accent */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border-2 border-[#499A13] opacity-15"
          style={{
            transform: 'rotate(45deg) scale(1.5)',
          }}
        ></div>

        {/* Additional S-Curve details - Bright Green */}
        <div
          className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-l from-[#499A13] to-transparent opacity-15"
          style={{
            transform: 'rotate(30deg)',
          }}
        ></div>

        {/* Additional S-Curve details - Bright Green */}
        <div
          className="absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-[#499A13] to-transparent opacity-15"
          style={{
            transform: 'rotate(-30deg)',
          }}
        ></div>
      </div>

      {/* Main Content Card */}
      <div className="relative w-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10">
        <div className="grid lg:grid-cols-2 items-center">

          {/* Left Section - exactly same as desktop */}
          <div className="relative p-10 hidden lg:block">
            {/* Decorative Background - using Bright Green */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-[#499A13] to-[#0B1849] rounded-br-[120px] opacity-15"></div>

            {/* Illustration */}
            <img
              src={illustration}
              alt="Illustration"
              className="relative z-10 w-full max-w-lg mx-auto"
            />

            {/* Logo Box - with Bright Green accent border */}
            <div className="absolute bottom-16 left-24 bg-white shadow-xl rounded-xl px-12 py-6 z-20 flex items-center justify-center border-2 border-[#499A13]">
              <img
                src={logo}
                alt="Company Logo"
                className="h-12 w-auto object-contain"
              />
            </div>
          </div>

          {/* Right Section - Full width on mobile, half on desktop */}
          <div className="flex justify-center p-6 sm:p-8 md:p-10 lg:p-10">
            <div className="w-full max-w-md">
              {/* Mobile Logo - visible only on mobile/tablet */}
              <div className="flex justify-center mb-4 lg:hidden">
                <img
                  src={logo}
                  alt="Company Logo"
                  className="h-12 w-auto object-contain"
                />
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-center text-[#0B1849] mb-1 sm:mb-2 lg:mb-2">
                USER LOGIN
              </h2>
              <p className="text-center text-xs sm:text-sm lg:text-sm text-[#276F27] mb-6 sm:mb-8 lg:mb-10">
                Welcome back! Sign in to your account
              </p>

              <form onSubmit={handleLogin}>
                {/* Email - with icon */}
                <div className="relative mb-4 sm:mb-5 lg:mb-5">
                  <div className="absolute left-3 sm:left-4 lg:left-4 top-1/2 -translate-y-1/2 text-[#4BB8FA]">
                    <Mail size={16} className="sm:w-[18px] sm:h-[18px] lg:w-[18px] lg:h-[18px]" />
                  </div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#0B1849] text-white placeholder-gray-400 rounded-full py-2.5 sm:py-3 lg:py-3 pl-10 sm:pl-12 lg:pl-12 pr-4 sm:pr-5 lg:pr-5 outline-none focus:ring-2 focus:ring-[#499A13] transition-all text-sm sm:text-base lg:text-base"
                    required
                  />
                </div>

                {/* Password - with icon */}
                <div className="relative mb-3 sm:mb-4 lg:mb-4">
                  <div className="absolute left-3 sm:left-4 lg:left-4 top-1/2 -translate-y-1/2 text-[#4BB8FA]">
                    <Lock size={16} className="sm:w-[18px] sm:h-[18px] lg:w-[18px] lg:h-[18px]" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#0B1849] text-white placeholder-gray-400 rounded-full py-2.5 sm:py-3 lg:py-3 pl-10 sm:pl-12 lg:pl-12 pr-10 sm:pr-12 lg:pr-12 outline-none focus:ring-2 focus:ring-[#499A13] transition-all text-sm sm:text-base lg:text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-4 lg:right-4 top-1/2 -translate-y-1/2 text-[#4BB8FA] hover:text-[#499A13] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff size={16} className="sm:w-[18px] sm:h-[18px] lg:w-[18px] lg:h-[18px]" />
                    ) : (
                      <Eye size={16} className="sm:w-[18px] sm:h-[18px] lg:w-[18px] lg:h-[18px]" />
                    )}
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <p className="text-xs sm:text-sm lg:text-sm text-red-500 text-center mb-3 sm:mb-4 lg:mb-4">{error}</p>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#0B1849] hover:bg-[#499A13] text-white rounded-full py-2.5 sm:py-3 lg:py-3 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base lg:text-base"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Login"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}