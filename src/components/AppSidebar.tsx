import { Search, Users, Contact, Activity, BarChart3, Clock, FileText, Megaphone, LogOut, UserPlus, Upload } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation, useNavigate } from 'react-router-dom';
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
  // { title: 'Buyers', url: '/buyers', icon: Users },
  { title: 'Contacts', url: '/contacts', icon: Contact },
  { title: 'Tracking', url: '/tracking', icon: Activity },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
  { title: 'History', url: '/history', icon: Clock },
  // { title: 'Templates', url: '/templates', icon: FileText },
  { title: 'EmailConfig', url: '/emailconfig', icon: FileText },
  // { title: 'Campaigns', url: '/campaigns', icon: Megaphone }, 
  { title: 'Single Adding Buyer', url: '/add-buyer', icon: UserPlus },
  { title: 'Bulk Upload Buyers', url: '/bulk-upload', icon: Upload },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();

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
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="h-8 w-8 object-contain shrink-0"
        />
        {!collapsed && (
          <div>
            <div className="font-bold text-sidebar-primary-foreground text-sm">Global Trade</div>
            <div className="text-xs text-sidebar-foreground">Sales Accelerator</div>
          </div>
        )}
      </div>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/search'}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-3 border-t border-sidebar-border">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-sm"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </Sidebar>
  );
}