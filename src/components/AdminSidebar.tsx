// // AdminSidebar.tsx
// import { Search, Users, Contact, Activity, BarChart3, Clock, FileText, Megaphone, LogOut } from 'lucide-react';
// import { NavLink } from '@/components/NavLink';
// import { useLocation, useNavigate } from 'react-router-dom';
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   useSidebar,
// } from '@/components/ui/sidebar';

// const navItems = [
//   { title: 'Templates', url: '/templates', icon: FileText },
//   { title: 'Users', url: '/adminusers', icon: Megaphone },
//   // { title: 'History', url: '/admin/history', icon: Clock },
//   { title: 'Sellers', url: '/admin/sellers', icon: BarChart3 },
// ];

// export function AdminSidebar() {
//   const { state } = useSidebar();
//   const collapsed = state === 'collapsed';
//   const navigate = useNavigate();

//   return (
//     <Sidebar 
//       collapsible="icon" 
//       className="border-r-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800"
//     >
//       <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
//         <img 
//           src="/logo.png" 
//           alt="Logo" 
//           className="h-8 w-8 object-contain shrink-0"
//         />
//         {!collapsed && (
//           <div>
//             <div className="font-bold text-white text-sm">Global Trade  (ADMIN)</div>
//             <div className="text-xs text-white/70">Sales Accelerator</div>
//           </div>
//         )}
//       </div>

//       <SidebarContent>
//         <SidebarGroup>
//           {!collapsed && (
//             <SidebarGroupLabel className="text-white/50 text-xs uppercase tracking-wider">
//               Navigation
//             </SidebarGroupLabel>
//           )}
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {navItems.map((item) => (
//                 <SidebarMenuItem key={item.title}>
//                   <SidebarMenuButton asChild>
//                     <NavLink
//                       to={item.url}
//                       end={item.url === '/templates'}
//                       className="flex items-center gap-3 px-3 py-2 rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors"
//                       activeClassName="bg-white/20 text-white hover:bg-white/20 hover:text-white"
//                     >
//                       <item.icon className="h-4 w-4 shrink-0" />
//                       {!collapsed && <span className="text-sm">{item.title}</span>}
//                     </NavLink>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>

//       <div className="mt-auto p-3 border-t border-white/10">
//         <button
//           onClick={() => {
//             localStorage.removeItem("token");
//             navigate("/login");
//           }}
//           className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-white/80 hover:bg-white/10 transition-colors text-sm"
//         >
//           <LogOut className="h-4 w-4 shrink-0" />
//           {!collapsed && <span>Sign Out</span>}
//         </button>
//       </div>
//     </Sidebar>
//   );
// }



import { Link, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  UserCog, 
  LogOut,
  LayoutDashboard,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import './AdminSidebar.css';

export function AdminSidebar() {
  const location = useLocation();
  
  const menuItems = [
    { icon: FileText, label: 'Templates', path: '/templates' },
    { icon: Users, label: 'Users', path: '/adminusers' },
    { icon: UserCog, label: 'Sellers', path: '/admin/sellers' },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm flex flex-col shadow-lg">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 h-14 border-b border-slate-200/80 dark:border-slate-700/80 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/25">
          GP
        </div>
        <div>
          <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            GlbPulse
          </span>
          <p className="text-[10px] text-muted-foreground leading-none -mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-4">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-3">
          Admin Menu
        </p>
        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/templates' && location.pathname.startsWith('/templates')) ||
              (item.path === '/adminusers' && location.pathname.startsWith('/adminusers')) ||
              (item.path === '/admin/sellers' && location.pathname.startsWith('/admin/sellers'));
            return (
              <li key={item.path}>
                <Link to={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      "w-full justify-start gap-3 px-3.5 h-10 rounded-xl transition-all duration-200",
                      isActive 
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 text-blue-700 dark:text-blue-400 shadow-sm" 
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:translate-x-0.5"
                    )}
                  >
                    <item.icon className={cn(
                      "h-4.5 w-4.5 transition-all duration-200",
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
                    )} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-700/80 shrink-0">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 px-3.5 h-10 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span className="text-sm font-medium">Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}