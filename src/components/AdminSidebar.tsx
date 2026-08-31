// AdminSidebar.tsx
import { Search, Users, Contact, Activity, BarChart3, Clock, FileText, Megaphone, LogOut, UserPlus, Upload, ChevronLeft, ChevronRight, Sparkles, Menu, X } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '@/asstes/globplselogo-removebg-preview.png';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const navItems = [
  { title: 'Templates', url: '/templates', icon: FileText },
  { title: 'Users', url: '/adminusers', icon: Megaphone },
   // { title: 'Sellers', url: '/admin/sellers', icon: BarChart3 },
// Single navigation item that opens the combined page
// { 
//   title: 'User Management', 
//   url: '/admin/users', 
//   icon: Users 
// },
  { title: 'Single Adding Buyer', url: '/add-buyer', icon: UserPlus },
  { title: 'Bulk Upload Buyers', url: '/bulk-upload', icon: Upload },
];

// Mobile Sidebar Content Component
function MobileAdminSidebarContent({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Brand Section */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
        <img 
          src={logo}
          alt="Logo" 
          className="h-8 w-auto object-contain"
        />
       
      </div>

      <div className="flex-1 overflow-y-auto px-2 sm:px-3 py-3 sm:py-4">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider px-2 sm:px-3 mb-2">
            Admin Navigation
          </p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.url || 
                           (item.url !== '/templates' && location.pathname.startsWith(item.url));
            const isHovered = hoveredItem === item.title;
            
            return (
              <NavLink
                key={item.title}
                to={item.url}
                end={item.url === '/templates'}
                onClick={() => onClose?.()}
                className={`
                  flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg 
                  transition-all duration-300 ease-in-out
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }
                `}
                onMouseEnter={() => setHoveredItem(item.title)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-700 rounded-r-full shadow-lg shadow-blue-300"></div>
                )}
                
                <div className={`
                  relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg transition-all duration-300
                  ${isActive ? 'bg-blue-500/20' : isHovered ? 'bg-blue-100' : ''}
                `}>
                  <item.icon className={`
                    h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 transition-all duration-300
                    ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}
                    ${isHovered ? 'scale-110 rotate-6' : ''}
                  `} />
                </div>

                <span className={`
                  text-xs sm:text-sm font-medium transition-all duration-300
                  ${isActive ? 'text-white' : 'text-gray-700'}
                `}>
                  {item.title}
                </span>
              </NavLink>
            );
          })}
        </div>

        <div className="my-3 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
      </div>

      {/* Sign Out - Mobile */}
      <div className="p-2 sm:p-3 border-t border-blue-100 bg-white">
        <button
          onClick={handleSignOut}
          className="group flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 w-full rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-300 ease-in-out"
        >
          <div className="relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg transition-all duration-300 group-hover:bg-red-50">
            <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-gray-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:text-red-600" />
          </div>
          <span className="text-xs sm:text-sm font-medium transition-colors duration-300 group-hover:text-red-600">
            Sign Out
          </span>
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  // Mobile: Show hamburger menu button
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        {!mobileOpen && (
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-2.5 sm:top-3 left-2.5 sm:left-3 z-50 h-8 w-8 sm:h-9 sm:w-9 bg-white shadow-sm rounded-lg border border-gray-200"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </SheetTrigger>
        )}
        <SheetContent
          side="left"
          className="p-0 w-[280px] sm:w-[300px]"
        >
          <MobileAdminSidebarContent onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop sidebar
  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r border-blue-100 bg-white shadow-lg h-screen sticky top-0"
    >
      {/* Brand Section - Logo Only */}
      <div className="flex items-center justify-center px-3 sm:px-4 py-4 sm:py-6 md:py-8 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
        <img 
          src={logo}
          alt="Logo" 
          className={`transition-all duration-300 ${
            collapsed ? 'h-10 w-10' : 'h-auto w-full max-w-[180px] sm:max-w-[200px] md:max-w-[220px] lg:max-w-[240px]'
          } object-contain`}
        />
      </div>

      <SidebarContent className="px-2 sm:px-3 py-3 sm:py-4 bg-white overflow-y-auto">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-blue-600 text-[10px] sm:text-xs uppercase tracking-wider font-semibold mb-2 px-2 sm:px-3">
              Admin Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 sm:space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.url || 
                               (item.url !== '/templates' && location.pathname.startsWith(item.url));
                const isHovered = hoveredItem === item.title;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === '/templates'}
                        className={`
                          relative flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg 
                          transition-all duration-300 ease-in-out
                          ${isActive 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                          }
                          ${collapsed ? 'justify-center' : ''}
                        `}
                        onMouseEnter={() => setHoveredItem(item.title)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        {/* Active Indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 sm:h-7 md:h-8 bg-blue-700 rounded-r-full shadow-lg shadow-blue-300"></div>
                        )}
                        
                        {/* Icon with gradient */}
                        <div className={`
                          relative flex items-center justify-center
                          ${collapsed ? 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10' : 'w-7 h-7 sm:w-8 sm:h-8'}
                          rounded-lg transition-all duration-300
                          ${isActive 
                            ? 'bg-blue-500/20' 
                            : isHovered 
                              ? 'bg-blue-100' 
                              : ''
                          }
                        `}>
                          <item.icon className={`
                            h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 shrink-0 transition-all duration-300
                            ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}
                            ${isHovered ? 'scale-110 rotate-6' : ''}
                          `} />
                        </div>

                        {!collapsed && (
                          <span className={`
                            text-xs sm:text-sm font-medium transition-all duration-300
                            ${isActive ? 'text-white' : 'text-gray-700'}
                          `}>
                            {item.title}
                          </span>
                        )}

                        {/* Tooltip for collapsed state */}
                        {collapsed && isHovered && (
                          <div className="absolute left-full ml-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-blue-600 text-white text-xs sm:text-sm rounded-lg shadow-xl border border-blue-400 whitespace-nowrap z-50">
                            {item.title}
                            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-8 border-transparent border-r-blue-600"></div>
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Divider with gradient */}
        <div className="my-3 sm:my-4 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
      </SidebarContent>

      {/* Footer - Sign Out */}
      <div className="mt-auto p-2 sm:p-3 border-t border-blue-100 bg-white">
        <button
          onClick={handleSignOut}
          className={`
            group relative flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 w-full rounded-lg
            text-gray-700 hover:text-red-600 hover:bg-red-50
            transition-all duration-300 ease-in-out
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-all duration-300 group-hover:bg-red-50">
            <LogOut className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 shrink-0 text-gray-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:text-red-600" />
          </div>
          {!collapsed && (
            <span className="text-xs sm:text-sm font-medium transition-colors duration-300 group-hover:text-red-600">
              Sign Out
            </span>
          )}
          {/* Hover glow effect */}
          <div className="absolute inset-0 rounded-lg bg-red-50/0 transition-all duration-300 group-hover:bg-red-50/50 -z-10"></div>
        </button>
      </div>
    </Sidebar>
  );
}