// src/components/AdminLayout.tsx
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { Globe, Sun, Moon, Search, Sparkles, ChevronDown, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("seller");
    navigate("/login", { replace: true });
  };

  // Get admin info for display
  const getAdminInfo = () => {
    try {
      const seller = JSON.parse(localStorage.getItem("seller") || "{}");
      return {
        name: seller.name || seller.email || 'Admin',
        email: seller.email || 'admin@example.com',
        role: localStorage.getItem("userRole") || 'admin'
      };
    } catch {
      return {
        name: 'Admin',
        email: 'admin@example.com',
        role: 'admin'
      };
    }
  };

  const adminInfo = getAdminInfo();

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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with sidebar offset */}
          <header 
            className="h-14 flex items-center justify-between px-4 shrink-0 fixed top-0 right-0 z-50 bg-card"
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
              {/* <Button 
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
              </Button> */}

              {/* User Profile Dropdown with Logout */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 ml-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="flex items-center gap-1.5">
                      <div 
                        className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium text-white"
                        style={{ backgroundColor: '#499A13' }}
                      >
                        {adminInfo.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{adminInfo.name}</span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{adminInfo.name}</p>
                      <p className="text-xs text-muted-foreground">{adminInfo.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">Role: {adminInfo.role}</p>
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

          
              {/* <Button
                variant="ghost"
                size="icon"
                onClick={() => setDark(d => !d)}
                className="h-8 w-8 ml-1"
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button> */}
            </div>
          </header>
          
          <main className="flex-1 overflow-auto pt-14 p-6 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};