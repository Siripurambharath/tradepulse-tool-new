// src/components/AdminLayout.tsx
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import logo from '@/asstes/globpulsenew.png';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const [dark] = useState(() => document.documentElement.classList.contains('dark'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('seller');
    navigate('/login', { replace: true });
  };

  const getAdminInfo = () => {
    try {
      const seller = JSON.parse(localStorage.getItem('seller') || '{}');
      return {
        name: seller.name || seller.email || 'Admin',
        email: seller.email || 'admin@example.com',
        role: localStorage.getItem('userRole') || 'admin',
      };
    } catch {
      return { name: 'Admin', email: 'admin@example.com', role: 'admin' };
    }
  };

  const adminInfo = getAdminInfo();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <SidebarProvider style={{ '--sidebar-width-icon': '4rem' } as React.CSSProperties}>
      <div className="min-h-screen flex w-full" style={{ backgroundColor: '#0E223B' }}>
        <AdminSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Sticky header inside the content column: always starts exactly
              where the sidebar ends, no gap and no CSS-variable hack */}
          <header
            className="sticky top-0 z-40 h-12 sm:h-14 shrink-0 flex items-center justify-between pl-14 pr-2 sm:pr-3 md:px-4"
            style={{
              backgroundColor: '#0E223B',
              borderBottom: '1px solid rgba(142,225,71,0.15)',
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0" />

            {/* Center - Logo on mobile only */}
            <div className="md:hidden absolute left-1/2 -translate-x-1/2 flex items-center">
              <img src={logo} alt="Logo" className="h-6 sm:h-7 w-auto object-contain" />
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-1 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <div
                        className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-medium text-[#0E223B] flex-shrink-0"
                        style={{ backgroundColor: '#8EE147' }}
                      >
                        {adminInfo.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden sm:inline text-xs sm:text-sm font-medium max-w-[80px] truncate text-slate-300">
                        {adminInfo.name}
                      </span>
                      <ChevronDown className="hidden sm:block h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400" />
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 sm:w-56"
                  style={{ backgroundColor: '#0E223B', borderColor: 'rgba(255,255,255,0.05)' }}
                >
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

          {/* Main content */}
          <main
            className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6"
            style={{ backgroundColor: '#0E223B', color: '#FFFFFF' }}
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