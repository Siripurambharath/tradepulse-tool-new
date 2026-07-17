// AppLayout.tsx
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Globe, Sun, Moon, Search, Sparkles, ChevronDown, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AppLayout() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const location = useLocation();
  const navigate = useNavigate();
  
  // Pages that should NOT show AppSidebar (they have their own sidebar)
  const noSidebarPages = [];
  
  const isNoSidebarPage = noSidebarPages.some(page => 
    location.pathname === page || 
    location.pathname.startsWith('/admin/history') || 
    location.pathname.startsWith('/admin/tracking') || 
    location.pathname.startsWith('/usersindetail') ||
    location.pathname.startsWith('/admin/trackingindetail') 
  );

  // 🔐 AUTH MONITORING - Check if user is still authenticated
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        // Clear any remaining user data
        localStorage.removeItem("userRole");
        localStorage.removeItem("seller");
        // Redirect to login
        navigate("/login", { replace: true });
      }
    };

    // Check immediately
    checkAuth();

    // Check on visibility change (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuth();
      }
    };

    // Check on storage events (other tabs or manual clear)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && !e.newValue) {
        // Token was removed from localStorage
        localStorage.removeItem("userRole");
        localStorage.removeItem("seller");
        navigate("/login", { replace: true });
      }
    };

    // Check on page focus
    const handlePageFocus = () => {
      checkAuth();
    };

    // Check before page becomes visible again
    const handleBeforeUnload = () => {
      // No need to do anything here, but keep for cleanup
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handlePageFocus);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Optional: Periodic check every 30 seconds
    const interval = setInterval(checkAuth, 30000);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handlePageFocus);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(interval);
    };
  }, [navigate]);

  // Handle logout
  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("seller");
    
    // Navigate to login
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
          {/* Full width header - no sidebar offset */}
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
              
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#499A13' }} />
                <Input
                  placeholder="Search buyers, RFQs, products, documents..."
                  className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1 text-sm focus-visible:ring-[#499A13]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 text-xs font-medium hover:bg-[#499A13]/10"
                style={{ 
                  borderColor: '#499A13',
                  color: '#499A13'
                }}
              >
                <Sparkles className="h-3 w-3 mr-1" style={{ color: '#499A13' }} />
                Upgrade
              </Button>

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
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userInfo.name}</p>
                      <p className="text-xs text-muted-foreground">{userInfo.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">Role: {userInfo.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
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
                  backgroundColor: '#499A13',
                  color: 'white',
                  borderColor: '#499A13'
                }}
              >
                Accelerator
              </Badge>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDark(d => !d)}
                className="h-8 w-8 ml-1"
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto pt-14 p-6 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}