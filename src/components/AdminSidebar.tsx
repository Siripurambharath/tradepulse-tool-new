// AdminSidebar.tsx
import { Search, Users, Contact, Activity, BarChart3, Clock, FileText, Megaphone, LogOut, UserPlus, Upload, ChevronLeft, ChevronRight, Sparkles, Menu, X } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '@/asstes/GFEPLUSE.png';
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
    { title: 'Dashboard', url: '/admindashboard', icon: BarChart3 },
  { title: 'Templates', url: '/templates', icon: FileText },
  { title: 'Users', url: '/adminusers', icon: Megaphone },
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
    <div className="flex flex-col h-full" style={{ backgroundColor: '#0E223B' }}>
      {/* Brand Section */}
      <div className="flex items-center px-5 py-5" style={{ backgroundColor: '#0E223B' }}>
        <img src={logo} alt="Logo" className="h-8 w-auto object-contain" />
      </div>

      <div className="flex-1 overflow-y-auto px-3" style={{ backgroundColor: '#0E223B' }}>
        <SidebarMenu className="space-y-1.5">
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
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 transition-all duration-200
                      w-full px-3 py-2.5
                      ${isActive 
                        ? 'text-black shadow-md' 
                        : 'text-slate-400 hover:bg-[#8EE147]/10 hover:text-[#8EE147]'}
                    `}
                    style={{
                      backgroundColor: isActive ? '#8EE147' : 'transparent',
                      borderRadius: '12px',
                      width: '100%',
                    }}
                    onMouseEnter={() => setHoveredItem(item.title)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span
                      className={`
                        flex items-center justify-center shrink-0 transition-colors duration-200
                        h-8 w-8
                        ${isActive ? 'bg-white/20' : 'bg-transparent'}
                      `}
                      style={{ 
                        borderRadius: '8px',
                      }}
                    >
                    <item.icon className={`h-[18px] w-[18px] ${isActive ? 'text-black' : 'text-white'}`} />

                    </span>

                    <span className={`text-sm font-medium ${isActive ? 'text-black' : 'text-slate-300'}`}>
                      {item.title}
                    </span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </div>

      {/* Sign Out - Mobile */}
      <div className="px-3 py-4 border-t mt-2" style={{ 
        borderColor: 'rgba(142,225,71,0.15)',
        backgroundColor: '#0E223B'
      }}>
        <button
          onClick={handleSignOut}
          className={`
            flex items-center gap-3 transition-colors duration-200
            hover:bg-red-500/10 hover:text-red-400
            w-full px-3 py-2.5
          `}
          style={{ 
            color: '#64748B',
            borderRadius: '12px',
            width: '100%',
          }}
        >
          <span className="flex items-center justify-center shrink-0 h-8 w-8" style={{ borderRadius: '8px' }}>
            <LogOut className="h-[18px] w-[18px]" />
          </span>
          <span className="text-sm font-medium">Log out</span>
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const { state, toggleSidebar } = useSidebar();
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
              className="fixed top-1.5 left-3 z-50 h-9 w-9 shadow-md"
              style={{ 
                backgroundColor: '#0E223B',
                color: '#8EE147',
                border: '1px solid rgba(142,225,71,0.2)',
                borderRadius: '8px'
              }}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
        )}
    <SheetContent
  side="left"
  className="w-[260px] p-0 border-0 [&>button]:text-white [&>button]:opacity-100 [&>button]:hover:text-white"
  style={{ backgroundColor: '#0E223B' }}
>
          <MobileAdminSidebarContent onClose={() => setMobileOpen(false)} />
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
          color: '#FFFFFF'
        }}
      >
        {/* Brand + collapse toggle */}
        <div className={`flex items-center py-5 ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`} style={{ 
          backgroundColor: '#0E223B',
          borderBottom: '1px solid rgba(142,225,71,0.15)'
        }}>
          <div className="flex items-center">
            <img 
              src={logo} 
              alt="Logo" 
              className={`transition-all duration-300 ${
                collapsed ? 'h-8 w-auto' : 'h-8 w-auto'
              } object-contain`} 
            />
          </div>

          {!collapsed && (
            <button
              onClick={toggleSidebar}
              className="flex h-7 w-7 items-center justify-center border transition-colors"
              style={{ 
                borderColor: 'rgba(255,255,255,0.1)',
                color: '#94A3B8',
                backgroundColor: 'transparent',
                borderRadius: '6px'
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
            className="mx-auto mb-3 flex h-7 w-7 items-center justify-center border transition-colors"
            style={{ 
              borderColor: 'rgba(255,255,255,0.1)',
              color: '#94A3B8',
              backgroundColor: 'transparent',
              borderRadius: '6px'
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

        <SidebarContent className="px-3 py-1 overflow-y-auto" style={{ backgroundColor: '#0E223B' }}>
          <SidebarGroup style={{ backgroundColor: '#0E223B' }}>
            <SidebarGroupContent style={{ backgroundColor: '#0E223B' }}>
              <SidebarMenu className="space-y-1.5" style={{ backgroundColor: '#0E223B' }}>
                {navItems.map((item) => {
                  const isActive = location.pathname === item.url || 
                                 (item.url !== '/templates' && location.pathname.startsWith(item.url));
                  const isHovered = hoveredItem === item.title;
                  
                  return (
                    <SidebarMenuItem key={item.title} style={{ backgroundColor: '#0E223B' }}>
                      <SidebarMenuButton asChild style={{ backgroundColor: '#0E223B' }}>
                        <NavLink
                          to={item.url}
                          end={item.url === '/templates'}
                          className={`
                            flex items-center gap-3 transition-all duration-200
                            ${collapsed ? 'justify-center w-full' : 'px-3 py-2.5'}
                            ${isActive 
                              ? 'text-black shadow-md' 
                              : 'text-slate-400 hover:bg-[#8EE147]/10 hover:text-[#8EE147]'}
                          `}
                          style={{
                            backgroundColor: isActive ? '#8EE147' : 'transparent',
                            borderRadius: '12px',
                            width: collapsed ? 'auto' : '100%',
                            margin: collapsed ? '0 auto' : '0',
                          }}
                          onMouseEnter={() => setHoveredItem(item.title)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          <span
                            className={`
                              flex items-center justify-center shrink-0 transition-colors duration-200
                              ${collapsed ? 'h-11 w-11' : 'h-8 w-8'}
                              ${isActive ? 'bg-white/20' : 'bg-transparent'}
                            `}
                            style={{ 
                              borderRadius: '8px',
                              minWidth: collapsed ? '44px' : 'auto',
                              minHeight: collapsed ? '44px' : 'auto',
                            }}
                          >
                            <item.icon className={`h-[18px] w-[18px] ${isActive ? 'text-black' : 'text-slate-400'}`} />
                          </span>

                          {!collapsed && (
                            <span className={`text-sm font-medium ${isActive ? 'text-black' : 'text-slate-300'}`}>
                              {item.title}
                            </span>
                          )}

                          {/* Tooltip for collapsed state */}
                          {collapsed && isHovered && (
                            <div className="absolute left-full ml-2 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg shadow-xl border z-50 whitespace-nowrap" style={{ 
                              backgroundColor: '#8EE147',
                              color: '#0E223B',
                              borderColor: '#6EC035'
                            }}>
                              {item.title}
                              <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-8 border-transparent" style={{ borderRightColor: '#8EE147' }}></div>
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
        </SidebarContent>

        <div className="mt-auto px-3 py-4 border-t" style={{ 
          borderColor: 'rgba(142,225,71,0.15)',
          backgroundColor: '#0E223B'
        }}>
          <button
            onClick={handleSignOut}
            className={`
              flex items-center gap-3 transition-colors duration-200
              hover:bg-red-500/10 hover:text-red-400
              ${collapsed ? 'justify-center w-full' : 'w-full px-3 py-2.5'}
            `}
            style={{ 
              color: '#64748B',
              borderRadius: '12px',
              width: collapsed ? 'auto' : '100%',
              margin: collapsed ? '0 auto' : '0',
            }}
          >
            <span 
              className={`flex items-center justify-center shrink-0 ${collapsed ? 'h-11 w-11' : 'h-8 w-8'}`} 
              style={{ 
                borderRadius: '8px',
                minWidth: collapsed ? '44px' : 'auto',
                minHeight: collapsed ? '44px' : 'auto',
              }}
            >
              <LogOut className="h-[18px] w-[18px]" />
            </span>
            {!collapsed && <span className="text-sm font-medium">Log out</span>}
          </button>
        </div>
      </Sidebar>
    </div>
  );
}