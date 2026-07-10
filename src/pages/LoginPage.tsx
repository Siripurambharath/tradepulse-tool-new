import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import {API_URL, ACTIVITY_URL} from '@/components/api';

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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <Globe className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Global Trade</h1>
          <p className="text-muted-foreground text-sm">Sales Accelerator</p>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-1">Welcome back</h2>
          <p className="text-sm text-muted-foreground mb-6">Sign in to your account</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-10 bg-card"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-card"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Admin Login Hint */}
     

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}