// import { useState } from 'react';
// import { Navigate, useNavigate } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Globe, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
// import {API_URL, ACTIVITY_URL} from '@/components/api';

// const BASE_URL = API_URL;

// export default function LoginPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   // If token already exists, redirect based on role
//   const token = localStorage.getItem("token");
//   const userRole = localStorage.getItem("userRole");
  
//   if (token) {
//     if (userRole === 'admin') {
//       return <Navigate to="/templates" replace />;
//     }
//     return <Navigate to="/search" replace />;
//   }

//   // Helper function to get device info
//   const getDeviceInfo = () => {
//     const userAgent = navigator.userAgent;
//     if (userAgent.includes('Chrome')) return 'Chrome';
//     if (userAgent.includes('Firefox')) return 'Firefox';
//     if (userAgent.includes('Safari')) return 'Safari';
//     if (userAgent.includes('Edge')) return 'Edge';
//     return 'Unknown Browser';
//   };

//   // Helper function to get IP address
//   const getIPAddress = async () => {
//     try {
//       const response = await fetch('https://api.ipify.org?format=json');
//       const data = await response.json();
//       return data.ip;
//     } catch (error) {
//       console.error('Error fetching IP:', error);
//       return '127.0.0.1';
//     }
//   };

//   // Function to create activity log for users
//   const createActivityLog = async (userId: number, userName: string, role: string) => {
//     try {
//       const ipAddress = await getIPAddress();
//       const device = getDeviceInfo();

//       const logData = {
//         userId,
//         userName,
//         role,
//         action_id: 1,
//         module_id: 2,
//         description: 'User logged in successfully',
//         ipAddress,
//         device,
//         status: 'SUCCESS'
//       };

//       const response = await fetch(`${ACTIVITY_URL}/api/activity-log`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(logData),
//       });

//       const result = await response.json();
//       if (!result.success) {
//         console.error('Failed to create activity log:', result.message);
//       }
//       return result;
//     } catch (error) {
//       console.error('Error creating activity log:', error);
//       return null;
//     }
//   };

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     // ✅ ADMIN LOGIN - redirect to admin panel
//     if (email === 'Admin@gmail.com' && password === '1234') {
//       try {
//         localStorage.setItem("token", "admin-token");
//         localStorage.setItem("userRole", "admin");
//         const adminData = {
//           id: 1,
//           email: 'Admin@gmail.com',
//           role: 'admin',
//           name: 'Admin'
//         };
//         localStorage.setItem("seller", JSON.stringify(adminData));
        
//         setLoading(false);
//         navigate("/templates");
//       } catch (error) {
//         setLoading(false);
//         setError("Login failed. Please try again.");
//       }
//       return;
//     }

//     // ✅ SELLER LOGIN
//     try {
//       const response = await fetch(`${BASE_URL}/api/seller/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (data.status === true && data.token) {
//         // Save user in local database
//         try {
//           await fetch(`${BASE_URL}/store-login`, {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               id: data.seller.id,
//               email: data.seller.email,
//               password: password,
//               role: "seller",
//             }),
//           });
//         } catch (e) {
//           console.log("Store login failed", e);
//         }

//         // Save login details
//         localStorage.setItem("token", data.token);
//         localStorage.setItem("userRole", "seller");
//         localStorage.setItem("seller", JSON.stringify(data.seller));

//         // Activity Log for seller
//         if (data.seller && data.seller.id) {
//           await createActivityLog(
//             data.seller.id,
//             data.seller.name || data.seller.email,
//             "seller"
//           );
//         }

//         navigate("/search");
//       } else {
//         setError(data.message || "Invalid Email or Password");
//       }
//     } catch (err) {
//       setError("Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background">
//       <div className="w-full max-w-md p-8">
//         <div className="flex flex-col items-center mb-8">
//           <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
//             <Globe className="h-8 w-8 text-primary-foreground" />
//           </div>
//           <h1 className="text-2xl font-bold text-foreground">Global Trade</h1>
//           <p className="text-muted-foreground text-sm">Sales Accelerator</p>
//         </div>

//         <div className="bg-card rounded-xl border p-6 shadow-sm">
//           <h2 className="text-lg font-semibold text-foreground mb-1">Welcome back</h2>
//           <p className="text-sm text-muted-foreground mb-6">Sign in to your account</p>

//           <form onSubmit={handleLogin} className="space-y-4">
//             <div>
//               <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   type="email"
//                   placeholder="you@company.com"
//                   value={email}
//                   onChange={e => setEmail(e.target.value)}
//                   className="pl-10 bg-card"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   type={showPassword ? "text" : "password"}
//                   placeholder="••••••••"
//                   value={password}
//                   onChange={e => setPassword(e.target.value)}
//                   className="pl-10 pr-10 bg-card"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-4 w-4" />
//                   ) : (
//                     <Eye className="h-4 w-4" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* Admin Login Hint */}
     

//             {/* Error Message */}
//             {error && (
//               <p className="text-sm text-red-500 text-center">{error}</p>
//             )}

//             <Button type="submit" className="w-full" disabled={loading}>
//               {loading ? "Signing in..." : "Sign In"}
//             </Button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }




import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import {API_URL, ACTIVITY_URL} from '@/components/api';

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
      return <Navigate to="/templates" replace />;
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
          id: 1,
          email: 'Admin@gmail.com',
          role: 'admin',
          name: 'Admin'
        };
        localStorage.setItem("seller", JSON.stringify(adminData));
        
        setLoading(false);
        navigate("/templates");
      } catch (error) {
        setLoading(false);
        setError("Login failed. Please try again.");
      }
      return;
    }

    // ✅ SELLER LOGIN
    try {
      const response = await fetch(`${BASE_URL}/api/seller/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.status === true && data.token) {
        // Save user in local database
        try {
          await fetch(`${BASE_URL}/store-login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: data.seller.id,
              email: data.seller.email,
              password: password,
              role: "seller",
            }),
          });
        } catch (e) {
          console.log("Store login failed", e);
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
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* S-Curve Background Design */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top S-Curve */}
        <div 
          className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-600 to-blue-400 opacity-20"
          style={{
            transform: 'rotate(-15deg) scale(1.2)',
          }}
        ></div>
        
        {/* Bottom S-Curve */}
        <div 
          className="absolute -bottom-40 -right-20 w-[700px] h-[700px] rounded-full bg-gradient-to-tl from-blue-500 to-blue-300 opacity-20"
          style={{
            transform: 'rotate(20deg) scale(1.3)',
          }}
        ></div>
        
        {/* Middle S-Curve */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border-2 border-blue-300 opacity-10"
          style={{
            transform: 'rotate(45deg) scale(1.5)',
          }}
        ></div>

        {/* Additional S-Curve details */}
        <div 
          className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-l from-blue-400 to-transparent opacity-10"
          style={{
            transform: 'rotate(30deg)',
          }}
        ></div>
        
        <div 
          className="absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-blue-400 to-transparent opacity-10"
          style={{
            transform: 'rotate(-30deg)',
          }}
        ></div>
      </div>

      {/* Main Content Card */}
      <div className="relative w-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10">
        <div className="grid lg:grid-cols-2 items-center">

          {/* Left Section */}
          <div className="relative p-10">
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400 to-blue-200 rounded-br-[120px] opacity-20"></div>

            {/* Illustration */}
            <img
              src={illustration}
              alt="Illustration"
              className="relative z-10 w-full max-w-lg mx-auto"
            />

            {/* Logo Box - Replacing the text */}
            <div className="absolute bottom-16 left-24 bg-white shadow-xl rounded-xl px-12 py-6 z-20 flex items-center justify-center border-2 border-blue-200">
              <img
                src={logo}
                alt="Company Logo"
                className="h-12 w-auto object-contain"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex justify-center p-10">
            <div className="w-full max-w-md">
              <h2 className="text-3xl font-bold text-center text-blue-700 mb-2">
                USER LOGIN
              </h2>
              <p className="text-center text-sm text-blue-600 mb-10">Welcome back! Sign in to your account</p>

              <form onSubmit={handleLogin}>
                {/* Email */}
                <div className="relative mb-5">
                  <Mail
                    className="absolute left-4 top-3 text-white"
                    size={18}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-blue-600 text-white placeholder-white rounded-full py-3 pl-12 pr-5 outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>

                {/* Password */}
                <div className="relative mb-4">
                  <Lock
                    className="absolute left-4 top-3 text-white"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-blue-600 text-white placeholder-white rounded-full py-3 pl-12 pr-12 outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3 text-white hover:text-blue-200"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <div className="text-center mb-5">
                  <a
                    href="#"
                    className="text-sm text-blue-700 hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>

                {/* Error Message */}
                {error && (
                  <p className="text-sm text-red-500 text-center mb-4">{error}</p>
                )}

                <button 
                  type="submit" 
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white rounded-full py-3 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Login"}
                </button>

                <div className="text-center mt-6">
                  <a
                    href="#"
                    className="text-blue-700 font-semibold hover:underline"
                  >
                    Create Account
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}