// AppLayout.tsx
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Globe, Sun, Moon, Search, Sparkles, ChevronDown, LogOut, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { PackageModal } from './PackageModal'; // Import the modal

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { API_URL } from './api';

export function AppLayout() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const location = useLocation();
  const navigate = useNavigate();
  const [packageName, setPackageName] = useState("Loading...");
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false); // Add this state
  
  // Pages that should NOT show AppSidebar (they have their own sidebar)
  const noSidebarPages = [];
  
  const isNoSidebarPage = noSidebarPages.some(page => 
    location.pathname === page || 
    location.pathname.startsWith('/admin/history') || 
    location.pathname.startsWith('/admin/tracking') || 
    location.pathname.startsWith('/usersindetail') ||
    location.pathname.startsWith('/admin/trackingindetail') 
  );

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const seller = JSON.parse(localStorage.getItem("seller") || "{}");

       

        const response = await fetch(
          `${API_URL}/api/package/${seller.id}`
        );

        const data = await response.json();
        console.log("Package fetch response:", data);
        if (data.success) {
          setPackageName(data.data.package_name);
        } else {
          setPackageName("No Package");
        }
      } catch (err) {
        console.error("Package fetch error:", err);
        setPackageName("No Package");
      }
    };

    fetchPackage();
  }, []);

  // 🔐 AUTH MONITORING - Check if user is still authenticated
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        localStorage.removeItem("userRole");
        localStorage.removeItem("seller");
        navigate("/login", { replace: true });
      }
    };

    checkAuth();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuth();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && !e.newValue) {
        localStorage.removeItem("userRole");
        localStorage.removeItem("seller");
        navigate("/login", { replace: true });
      }
    };

    const handlePageFocus = () => {
      checkAuth();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handlePageFocus);

    const interval = setInterval(checkAuth, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handlePageFocus);
      clearInterval(interval);
    };
  }, [navigate]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("seller");
    navigate("/login", { replace: true });
  };

  // Get user info for display
  const getUserInfo = () => {
    try {
      const seller = JSON.parse(localStorage.getItem("seller") || "{}");
      return {
        name: seller.name || seller.email || 'User',
        email: seller.email || '',
        role: localStorage.getItem("userRole") || 'user'
      };
    } catch {
      return {
        name: 'User',
        email: '',
        role: 'user'
      };
    }
  };

  const userInfo = getUserInfo();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  // Set sidebar width CSS variable for header positioning
  useEffect(() => {
    const updateSidebarWidth = () => {
      const sidebar = document.querySelector('[data-sidebar]');
      if (sidebar) {
        const width = sidebar.getBoundingClientRect().width;
        document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
      }
    };
    
    updateSidebarWidth();
    window.addEventListener('resize', updateSidebarWidth);
    return () => window.removeEventListener('resize', updateSidebarWidth);
  }, []);

  // If on pages with their own sidebar, render WITHOUT SidebarProvider
  if (isNoSidebarPage) {
    return (
      <div className="min-h-screen flex w-full">
        <div className="flex-1 flex flex-col min-w-0">
          <header 
            className="h-14 flex items-center justify-between border-b px-6 shrink-0 fixed top-0 left-0 right-0 z-50 bg-card"
            style={{ borderBottomColor: '#40A2E3' }}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" style={{ color: '#499A13' }} />
              <span>Global Trade Sales Accelerator</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDark(d => !d)}
                className="h-8 w-8"
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto pt-14 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  // Normal layout with AppSidebar
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header 
            className="h-14 flex items-center justify-between px-4 shrink-0 fixed top-0 right-0 z-50 gap-4 bg-card"
            style={{ 
              left: 'var(--sidebar-width, 240px)',
              borderBottom: '1px solid #40A2E3',
              width: 'calc(100% - var(--sidebar-width, 240px))'
            }}
          >
            <div className="flex items-center gap-3 flex-1">
              <SidebarTrigger className="text-muted-foreground" />
              
              {/* <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#499A13' }} />
                <Input
                  placeholder="Search buyers, RFQs, products, documents..."
                  className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1 text-sm focus-visible:ring-[#499A13]"
                />
              </div> */}
            </div>

            <div className="flex items-center gap-3">
{/* User Profile Dropdown with Logout */}
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <div className="flex items-center gap-2 ml-2 cursor-pointer hover:opacity-80 transition-opacity">
      <div className="flex items-center gap-1.5">
        <div 
          className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium text-white"
          style={{ backgroundColor: '#499A13' }}
        >
          {userInfo.name.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium">{userInfo.name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </div>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-64">
    <DropdownMenuLabel>
      <div className="flex flex-col space-y-1">
        <p className="text-sm font-medium">{userInfo.name}</p>
        <p className="text-xs text-muted-foreground">{userInfo.email}</p>
        <p className="text-xs text-muted-foreground capitalize">Role: {userInfo.role}</p>
      </div>
    </DropdownMenuLabel>
    <DropdownMenuSeparator />
    
    {/* Package Menu Item - Enhanced UI with hover effects */}
    <DropdownMenuItem 
      onClick={() => setIsPackageModalOpen(true)}
      className="cursor-pointer group relative transition-colors duration-200 hover:bg-green-50 focus:bg-green-50"
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-green-50 group-hover:bg-green-100 transition-colors duration-200">
            <Package className="h-4 w-4" style={{ color: '#499A13' }} />
          </div>
          <span className="font-medium group-hover:text-[#499A13] transition-colors duration-200">Package Details</span>
        </div>
    
      </div>
    </DropdownMenuItem>
    
    <DropdownMenuSeparator />
    
    <DropdownMenuItem 
      onClick={handleLogout}
      className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer hover:bg-red-50 transition-colors duration-200"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

              <Badge
                variant="secondary"
                className="h-6 px-2 text-[10px] font-medium border"
                style={{
                  backgroundColor: "#499A13",
                  color: "white",
                  borderColor: "#499A13",
                }}
              >
                {packageName}
              </Badge>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto pt-14 p-6 bg-background">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Package Modal */}
      <PackageModal 
        open={isPackageModalOpen} 
        onOpenChange={setIsPackageModalOpen} 
      />
    </SidebarProvider>
  );
}