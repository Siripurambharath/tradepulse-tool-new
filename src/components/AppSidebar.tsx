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
import { ACTIVITY_URL } from './api';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

// Activity Log Helper Functions
const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown Browser';
};

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

const createActivityLog = async (actionId: number, moduleId: number, description: string, additionalData?: any) => {
  try {
    const seller = JSON.parse(localStorage.getItem("seller") || "{}");
    const ipAddress = await getIPAddress();
    const device = getDeviceInfo();

    const logData = {
      userId: seller.id || 1,
      userName: seller.name || seller.email || 'Unknown',
      role: seller.role || 'seller',
      action_id: actionId,
      module_id: moduleId,
      description: description,
      ipAddress,
      device,
      status: 'SUCCESS',
      ...additionalData
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

const navItems = [
  { title: 'Search Products', url: '/search', icon: Search },
  { title: 'Contacts', url: '/contacts', icon: Contact },
  { title: 'Tracking', url: '/tracking', icon: Activity },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
  { title: 'History', url: '/history', icon: Clock },
  { title: 'EmailConfig', url: '/emailconfig', icon: FileText },
];

// Mobile Sidebar Content Component - FIXED: Better mobile styling
function MobileSidebarContent({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      const seller = JSON.parse(localStorage.getItem("seller") || "{}");
      
      await createActivityLog(2, 2, `User signed out: ${seller.email || seller.name || 'Unknown'}`, {
        user_id: seller.id,
        user_name: seller.name,
        user_email: seller.email
      });
    } catch (error) {
      console.error('Error logging signout:', error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("seller");
      localStorage.removeItem("userRole");
      navigate("/login");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Brand Section */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
        <img 
          src={logo}
          alt="Logo" 
          className="h-8 w-auto object-contain" // Reduced from h-10
        />
      
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider px-3 mb-2">
            Main Menu
          </p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.url || 
                           (item.url !== '/search' && location.pathname.startsWith(item.url));
            const isHovered = hoveredItem === item.title;
            
            return (
              <NavLink
                key={item.title}
                to={item.url}
                end={item.url === '/search'}
                onClick={() => onClose?.()}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg 
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
                  relative flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300
                  ${isActive ? 'bg-blue-500/20' : isHovered ? 'bg-blue-100' : ''}
                `}>
                  <item.icon className={`
                    h-4 w-4 shrink-0 transition-all duration-300
                    ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}
                    ${isHovered ? 'scale-110 rotate-6' : ''}
                  `} />
                </div>

                <span className={`
                  text-xs font-medium transition-all duration-300
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
      <div className="p-3 border-t border-blue-100 bg-white">
        <button
          onClick={handleSignOut}
          className="group flex items-center gap-3 px-3 py-2 w-full rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-300 ease-in-out"
        >
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300 group-hover:bg-red-50">
            <LogOut className="h-4 w-4 shrink-0 text-gray-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:text-red-600" />
          </div>
          <span className="text-xs font-medium transition-colors duration-300 group-hover:text-red-600">
            Sign Out
          </span>
        </button>
      </div>
    </div>
  );
}

export function AppSidebar() {
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

  const handleSignOut = async () => {
    try {
      const seller = JSON.parse(localStorage.getItem("seller") || "{}");
      
      await createActivityLog(2, 2, `User signed out: ${seller.email || seller.name || 'Unknown'}`, {
        user_id: seller.id,
        user_name: seller.name,
        user_email: seller.email
      });
    } catch (error) {
      console.error('Error logging signout:', error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("seller");
      localStorage.removeItem("userRole");
      navigate("/login");
    }
  };

  if (isMobile) {
    return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
  {!mobileOpen && (
    <SheetTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 h-8 w-8 bg-white shadow-sm rounded-lg"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </SheetTrigger>
  )}

  <SheetContent
    side="left"
    className="p-0 w-[280px]"
  >
    <MobileSidebarContent onClose={() => setMobileOpen(false)} />
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
      <div className="flex items-center justify-center px-4 py-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
        <img 
          src={logo}
          alt="Logo" 
          className={`transition-all duration-300 ${
            collapsed ? 'h-10 w-10' : 'h-auto w-full max-w-[200px]'
          } object-contain`}
        />
      </div>

      <SidebarContent className="px-3 py-4 bg-white overflow-y-auto">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-blue-600 text-xs uppercase tracking-wider font-semibold mb-2 px-3">
              Main Menu
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.url || 
                               (item.url !== '/search' && location.pathname.startsWith(item.url));
                const isHovered = hoveredItem === item.title;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === '/search'}
                        className={`
                          relative flex items-center gap-3 px-3 py-2.5 rounded-lg 
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
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-700 rounded-r-full shadow-lg shadow-blue-300"></div>
                        )}
                        
                        {/* Icon with gradient */}
                        <div className={`
                          relative flex items-center justify-center
                          ${collapsed ? 'w-10 h-10' : 'w-8 h-8'}
                          rounded-lg transition-all duration-300
                          ${isActive 
                            ? 'bg-blue-500/20' 
                            : isHovered 
                              ? 'bg-blue-100' 
                              : ''
                          }
                        `}>
                          <item.icon className={`
                            h-5 w-5 shrink-0 transition-all duration-300
                            ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}
                            ${isHovered ? 'scale-110 rotate-6' : ''}
                          `} />
                        </div>

                        {!collapsed && (
                          <span className={`
                            text-sm font-medium transition-all duration-300
                            ${isActive ? 'text-white' : 'text-gray-700'}
                          `}>
                            {item.title}
                          </span>
                        )}

                        {/* Tooltip for collapsed state */}
                        {collapsed && isHovered && (
                          <div className="absolute left-full ml-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg shadow-xl border border-blue-400 whitespace-nowrap z-50">
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
        <div className="my-4 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
      </SidebarContent>

      {/* Footer - Sign Out */}
      <div className="mt-auto p-3 border-t border-blue-100 bg-white">
        <button
          onClick={handleSignOut}
          className={`
            group relative flex items-center gap-3 px-3 py-2.5 w-full rounded-lg
            text-gray-700 hover:text-red-600 hover:bg-red-50
            transition-all duration-300 ease-in-out
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 group-hover:bg-red-50">
            <LogOut className="h-5 w-5 shrink-0 text-gray-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:text-red-600" />
          </div>
          {!collapsed && (
            <span className="text-sm font-medium transition-colors duration-300 group-hover:text-red-600">
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