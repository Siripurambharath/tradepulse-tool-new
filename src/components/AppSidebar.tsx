import { Search, Contact, Activity, BarChart3, Clock, FileText, LogOut, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '@/asstes/GFEPLUSE.png';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { ACTIVITY_URL } from './api';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Activity Log Helpers
// ---------------------------------------------------------------------------
const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
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
    const seller = JSON.parse(localStorage.getItem('seller') || '{}');
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
      ...additionalData,
    };

    const response = await fetch(`${ACTIVITY_URL}/api/activity-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

// ---------------------------------------------------------------------------
// Nav config
// ---------------------------------------------------------------------------
const navItems = [
  { title: 'Search Products', url: '/search', icon: Search },
  { title: 'Contacts', url: '/contacts', icon: Contact },
  { title: 'Tracking', url: '/tracking', icon: Activity },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
  { title: 'History', url: '/history', icon: Clock },
  { title: 'EmailConfig', url: '/emailconfig', icon: FileText },
];

function useIsActive() {
  const location = useLocation();
  return (url: string) =>
    location.pathname === url || (url !== '/search' && location.pathname.startsWith(url));
}

// ---------------------------------------------------------------------------
// Nav list — NavLink rendered directly (no SidebarMenuButton) so the
// collapsed-mode size clipping no longer cuts the active pill.
// ---------------------------------------------------------------------------
function NavList({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const isActive = useIsActive();

  return (
    <SidebarMenu className={collapsed ? 'items-center gap-2' : 'gap-1.5'}>
      {navItems.map((item) => {
        const active = isActive(item.url);
        return (
          <SidebarMenuItem key={item.title} className="w-full">
            <NavLink
              to={item.url}
              end={item.url === '/search'}
              onClick={onNavigate}
              title={collapsed ? item.title : undefined}
              className={`flex items-center rounded-xl transition-colors duration-200
                ${collapsed ? 'mx-auto h-11 w-11 justify-center' : 'h-11 w-full gap-3 px-3'}
                ${active
                  ? 'bg-[#8EE147] text-black shadow-md'
                  : 'text-slate-400 hover:bg-[#8EE147]/10 hover:text-[#8EE147]'}`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
            </NavLink>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

function SignOutRow({ collapsed }: { collapsed?: boolean }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const seller = JSON.parse(localStorage.getItem('seller') || '{}');
      await createActivityLog(2, 2, `User signed out: ${seller.email || seller.name || 'Unknown'}`, {
        user_id: seller.id,
        user_name: seller.name,
        user_email: seller.email,
      });
    } catch (error) {
      console.error('Error logging signout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('seller');
      localStorage.removeItem('userRole');
      navigate('/login');
    }
  };

  return (
    <button
      onClick={handleSignOut}
      title={collapsed ? 'Log out' : undefined}
      className={`flex items-center rounded-xl text-slate-500 transition-colors duration-200
        hover:bg-red-500/10 hover:text-red-400
        ${collapsed ? 'mx-auto h-11 w-11 justify-center' : 'h-11 w-full gap-3 px-3'}`}
    >
      <LogOut className="h-5 w-5 shrink-0" />
      {!collapsed && <span className="text-sm font-medium">Log out</span>}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Mobile sidebar content
// ---------------------------------------------------------------------------
function MobileSidebarContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: '#0E223B' }}>
      {/* Logo Section */}
      <div className="flex items-center px-5 py-5" style={{ backgroundColor: '#0E223B' }}>
        <img src={logo} alt="Logo" className="h-8 w-auto object-contain" />
      </div>

      <div className="flex-1 overflow-y-auto px-3" style={{ backgroundColor: '#0E223B' }}>
        <NavList onNavigate={onClose} />
      </div>

      <div
        className="px-3 py-4 border-t mt-2"
        style={{
          borderColor: 'rgba(142,225,71,0.15)',
          backgroundColor: '#0E223B',
        }}
      >
        <SignOutRow />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === 'collapsed';
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        {!mobileOpen && (
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-3 left-3 z-50 h-9 w-9 shadow-md"
              style={{
                backgroundColor: '#0E223B',
                color: '#8EE147',
                border: '1px solid rgba(142,225,71,0.2)',
                borderRadius: '8px',
              }}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
        )}

        <SheetContent
          side="left"
          className="w-[260px] p-0 border-0"
          style={{
            backgroundColor: '#0E223B',
            color: '#FFFFFF',
          }}
        >
          <MobileSidebarContent onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop sidebar
  return (
    <div className="h-screen sticky top-0" style={{ backgroundColor: '#0E223B' }}>
      <Sidebar
        collapsible="icon"
        className="h-full overflow-hidden border-r"
        style={{
          backgroundColor: '#0E223B',
          borderColor: 'rgba(142,225,71,0.15)',
          borderRadius: '0px',
          color: '#FFFFFF',
        }}
      >
        {/* Brand + collapse toggle */}
        <div
          className={`flex items-center py-5 ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}
          style={{
            backgroundColor: '#0E223B',
            borderBottom: '1px solid rgba(142,225,71,0.15)',
          }}
        >
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="h-8 w-auto object-contain transition-all duration-300" />
          </div>

          {!collapsed && (
            <button
              onClick={toggleSidebar}
              className="flex h-7 w-7 items-center justify-center border transition-colors"
              style={{
                borderColor: 'rgba(255,255,255,0.1)',
                color: '#94A3B8',
                backgroundColor: 'transparent',
                borderRadius: '6px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(142,225,71,0.1)';
                e.currentTarget.style.color = '#8EE147';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#94A3B8';
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={toggleSidebar}
            className="mx-auto my-3 flex h-7 w-7 items-center justify-center border transition-colors"
            style={{
              borderColor: 'rgba(255,255,255,0.1)',
              color: '#94A3B8',
              backgroundColor: 'transparent',
              borderRadius: '6px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(142,225,71,0.1)';
              e.currentTarget.style.color = '#8EE147';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#94A3B8';
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        <SidebarContent
          className={`py-1 overflow-y-auto ${collapsed ? 'px-2' : 'px-3'}`}
          style={{ backgroundColor: '#0E223B' }}
        >
          <SidebarGroup style={{ backgroundColor: '#0E223B' }}>
            <SidebarGroupContent style={{ backgroundColor: '#0E223B' }}>
              <NavList collapsed={collapsed} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <div
          className={`mt-auto py-4 border-t ${collapsed ? 'px-2' : 'px-3'}`}
          style={{
            borderColor: 'rgba(142,225,71,0.15)',
            backgroundColor: '#0E223B',
          }}
        >
          <SignOutRow collapsed={collapsed} />
        </div>
      </Sidebar>
    </div>
  );
}