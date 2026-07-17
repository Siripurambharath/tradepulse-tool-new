



import { Search, Users, Contact, Activity, BarChart3, Clock, FileText, Megaphone, LogOut, UserPlus, Upload, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '@/asstes/globplselogo-removebg-preview.png'
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

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
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
    <Sidebar 
      collapsible="icon" 
      className="border-r border-blue-100 bg-white shadow-lg"
    >
      {/* Brand Section - Logo Only */}
      <div className="flex items-center justify-center px-4 py-8 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
        <img 
          src={logo}
          alt="Logo" 
          className="h-auto w-full max-w-[240px] object-contain"
        />
      </div>

      <SidebarContent className="px-3 py-4 bg-white">
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