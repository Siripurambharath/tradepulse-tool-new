// src/components/AdminLayout.tsx
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { Globe, Sun, Moon, Search, Sparkles, ChevronDown, LogOut, Menu } from 'lucide-react';
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import logo from '@/asstes/globpulsenew.png';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      <div className="min-h-screen flex w-full" style={{ backgroundColor: '#0E223B' }}>
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Header with sidebar offset */}
          <header 
            className="h-12 sm:h-14 flex items-center justify-between px-2 sm:px-3 md:px-4 shrink-0 fixed top-0 right-0 z-40"
            style={{ 
              backgroundColor: '#0E223B',
              left: isMobile ? '0' : 'var(--sidebar-width, 240px)',
              width: isMobile ? '100%' : 'calc(100% - var(--sidebar-width, 240px))',
              borderBottom: '1px solid rgba(142,225,71,0.15)',
              borderLeft: isMobile ? 'none' : '1px solid rgba(142,225,71,0.15)',
              boxShadow: '0 1px 0 rgba(142,225,71,0.05)'
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              {/* Sidebar trigger - hidden on mobile since we use hamburger */}
              <div className="hidden md:flex items-center">
                <SidebarTrigger className="text-slate-400 hover:text-[#8EE147] transition-colors" />
              </div>
            </div>

            {/* Center - Logo on mobile only */}
            <div className="md:hidden absolute left-1/2 -translate-x-1/2 flex items-center">
              <img 
                src={logo}
                alt="Logo" 
                className="h-6 sm:h-7 w-auto object-contain"
              />
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
              {/* User Profile Dropdown with Logout */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-1 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <div 
                        className="h-7 w-7 sm:h-7 sm:w-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-medium text-[#0E223B] flex-shrink-0"
                        style={{ backgroundColor: '#8EE147' }}
                      >
                        {adminInfo.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden sm:inline text-xs sm:text-sm font-medium max-w-[40px] sm:max-w-[60px] truncate text-slate-300">{adminInfo.name}</span>
                      <ChevronDown className="hidden sm:block h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400" />
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 sm:w-56" style={{ backgroundColor: '#0E223B', borderColor: 'rgba(255,255,255,0.05)' }}>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-0.5 sm:space-y-1">
                      <p className="text-xs sm:text-sm font-medium truncate text-white">{adminInfo.name}</p>
                      <p className="text-[10px] sm:text-xs text-slate-400 truncate">{adminInfo.email}</p>
                      <p className="text-[10px] sm:text-xs text-slate-400 capitalize">Role: {adminInfo.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer text-xs sm:text-sm hover:bg-red-500/10 transition-colors duration-200"
                  >
                    <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          
          {/* Main content - DARK BACKGROUND */}
          <main 
            className="flex-1 overflow-auto pt-12 sm:pt-14 p-1.5 sm:p-3 md:p-4 lg:p-6 min-h-[calc(100vh-48px)] sm:min-h-[calc(100vh-56px)]"
            style={{ 
              backgroundColor: '#0E223B',
              color: '#FFFFFF'
            }}
          >
            <div className="max-w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};