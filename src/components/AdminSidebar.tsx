// AdminSidebar.tsx
import { Search, Users, Contact, Activity, BarChart3, Clock, FileText, Megaphone, LogOut } from 'lucide-react';
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

const navItems = [
  { title: 'Templates', url: '/templates', icon: FileText },
  { title: 'Users', url: '/users', icon: Megaphone },
  { title: 'History', url: '/admin/history', icon: Clock },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800"
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="h-8 w-8 object-contain shrink-0"
        />
        {!collapsed && (
          <div>
            <div className="font-bold text-white text-sm">Global Trade  (ADMIN)</div>
            <div className="text-xs text-white/70">Sales Accelerator</div>
          </div>
        )}
      </div>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-white/50 text-xs uppercase tracking-wider">
              Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/templates'}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                      activeClassName="bg-white/20 text-white hover:bg-white/20 hover:text-white"
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

      <div className="mt-auto p-3 border-t border-white/10">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-white/80 hover:bg-white/10 transition-colors text-sm"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </Sidebar>
  );
}