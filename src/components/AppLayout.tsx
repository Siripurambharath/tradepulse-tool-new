// AppLayout.tsx
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Globe, Sun, Moon, Search, Sparkles, ChevronDown, LogOut, Package, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { PackageModal } from './PackageModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { API_URL } from './api';
import logo from '@/asstes/globpulsenew.png';

export function AppLayout() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const location = useLocation();
  const navigate = useNavigate();
  const [packageName, setPackageName] = useState("Loading...");
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Pages that should NOT show AppSidebar
  const noSidebarPages = [];
  
  const isNoSidebarPage = noSidebarPages.some(page => 
    location.pathname === page || 
    location.pathname.startsWith('/admin/history') || 
    location.pathname.startsWith('/admin/tracking') || 
    location.pathname.startsWith('/usersindetail') ||
    location.pathname.startsWith('/admin/trackingindetail') 
  );

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const seller = JSON.parse(localStorage.getItem("seller") || "{}");
        const response = await fetch(`${API_URL}/api/package/${seller.id}`);
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

  // Auth monitoring
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("seller");
    navigate("/login", { replace: true });
  };

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

  // If on pages with their own sidebar
  if (isNoSidebarPage) {
    return (
      <div className="min-h-screen flex w-full" style={{ backgroundColor: '#0E223B' }}>
        <div className="flex-1 flex flex-col min-w-0">
          <header 
            className="h-14 flex items-center justify-between border-b px-3 sm:px-6 shrink-0 fixed top-0 left-0 right-0 z-50"
            style={{ 
              backgroundColor: '#0E223B',
              borderBottomColor: 'rgba(142,225,71,0.15)'
            }}
          >
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: '#8EE147' }} />
              <span className="hidden xs:inline text-slate-300">Global Trade Sales Accelerator</span>
              <span className="xs:hidden text-slate-300">GTSA</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDark(d => !d)}
                className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400 hover:text-[#8EE147] hover:bg-[#8EE147]/10"
              >
                {dark ? <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs sm:text-sm px-2 sm:px-3"
              >
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto pt-14" style={{ backgroundColor: '#0E223B' }}>
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" style={{ backgroundColor: '#0E223B' }}>
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Top Header - with border matching sidebar */}
          <header 
            className="h-14 flex items-center justify-between px-2 sm:px-4 shrink-0 fixed top-0 right-0 z-40 gap-2 sm:gap-4"
            style={{ 
              backgroundColor: '#0E223B',
              left: isMobile ? '0' : 'var(--sidebar-width, 240px)',
              borderBottom: '1px solid rgba(142,225,71,0.15)',
              borderLeft: isMobile ? 'none' : '1px solid rgba(142,225,71,0.15)',
              width: isMobile ? '100%' : 'calc(100% - var(--sidebar-width, 240px))',
              boxShadow: '0 1px 0 rgba(142,225,71,0.05)'
            }}
          >
            {/* Left side - with sidebar trigger and search */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="hidden md:flex items-center gap-3 flex-1">
                <SidebarTrigger className="text-slate-400 hover:text-[#8EE147] transition-colors" />
                <div className="relative flex-1 max-w-xl">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#8EE147' }} />
                  <Input
                    placeholder="Search buyers, RFQs, products..."
                    className="pl-9 h-9 bg-[#0E223B]/50 border-[rgba(255,255,255,0.05)] focus-visible:ring-[#8EE147] text-sm w-full text-slate-300 placeholder:text-slate-500"
                    style={{ 
                      borderColor: 'rgba(255,255,255,0.05)',
                      backgroundColor: 'rgba(14,34,59,0.5)'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Center - Logo on mobile only */}
            <div className="absolute left-1/2 -translate-x-1/2 md:hidden flex items-center">
              <img 
                src={logo}
                alt="Logo" 
                className="h-6 w-auto object-contain"
              />
            </div>

            {/* Right side - User actions */}
            <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
              {/* Theme Toggle */}
              {/* <Button
                variant="ghost"
                size="icon"
                onClick={() => setDark(d => !d)}
                className="h-8 w-8 text-slate-400 hover:text-[#8EE147] hover:bg-[#8EE147]/10 transition-colors"
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button> */}

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-1 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <div 
                      className="h-7 w-7 sm:h-7 sm:w-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-medium text-[#0E223B] flex-shrink-0"
                      style={{ backgroundColor: '#8EE147' }}
                    >
                      {userInfo.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:flex sm:items-center sm:gap-1.5">
                      <span className="text-xs sm:text-sm font-medium max-w-[60px] sm:max-w-[80px] truncate text-slate-300">{userInfo.name}</span>
                      <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400" />
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 sm:w-64" style={{ backgroundColor: '#0E223B', borderColor: 'rgba(255,255,255,0.05)' }}>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-0.5 sm:space-y-1">
                      <p className="text-xs sm:text-sm font-medium text-white truncate">{userInfo.name}</p>
                      <p className="text-[10px] sm:text-xs text-slate-400 truncate">{userInfo.email}</p>
                      <p className="text-[10px] sm:text-xs text-slate-400 capitalize">Role: {userInfo.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
                  
                  <DropdownMenuItem 
                    onClick={() => setIsPackageModalOpen(true)}
                    className="cursor-pointer group transition-colors duration-200 hover:bg-[#8EE147]/10 focus:bg-[#8EE147]/10 text-slate-300 hover:text-[#8EE147]"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className="p-1 rounded-md bg-[#8EE147]/10 group-hover:bg-[#8EE147]/20 transition-colors duration-200">
                        <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: '#8EE147' }} />
                      </div>
                      <span className="text-xs sm:text-sm font-medium transition-colors duration-200">Package Details</span>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
                  
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer hover:bg-red-500/10 transition-colors duration-200 text-xs sm:text-sm"
                  >
                    <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Package Badge */}
              <Badge
                variant="secondary"
                className="hidden sm:inline-flex h-5 sm:h-6 px-1.5 sm:px-2 text-[8px] sm:text-[10px] font-medium border flex-shrink-0"
                style={{
                  backgroundColor: '#8EE147',
                  color: '#0E223B',
                  borderColor: '#8EE147',
                }}
              >
                {packageName}
              </Badge>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto mt-10 p-1.5 sm:p-3 md:p-4 lg:p-6 min-h-[calc(100vh-56px)]" style={{ backgroundColor: '#0E223B' }}>
            <div className="max-w-full">
              <Outlet />
            </div>
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