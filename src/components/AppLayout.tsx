// // AppLayout.tsx
// import { Outlet, useLocation } from 'react-router-dom';
// import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
// import { AppSidebar } from './AppSidebar';
// import { Globe, Sun, Moon } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { useEffect, useState } from 'react';

// export function AppLayout() {
//   const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
//   const location = useLocation();
  
//   // Pages that should NOT show AppSidebar
//   const noSidebarPages = ['/templates', '/users'];
//   const isNoSidebarPage = noSidebarPages.includes(location.pathname);

//   useEffect(() => {
//     document.documentElement.classList.toggle('dark', dark);
//   }, [dark]);

//   // If on templates or adminusers page, render without AppSidebar
//   if (isNoSidebarPage) {
//     return (
//       <SidebarProvider>
//         <div className="min-h-screen flex w-full">
//           <div className="flex-1 flex flex-col min-w-0">
//             <header className="h-12 flex items-center justify-between border-b bg-card px-4 shrink-0">
//               <div className="flex items-center gap-3">
//                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                   <Globe className="h-4 w-4" />
//                   <span>Global Trade Sales Accelerator</span>
//                 </div>
//               </div>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => setDark(d => !d)}
//                 className="h-8 w-8"
//               >
//                 {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
//               </Button>
//             </header>
//             <main className="flex-1 overflow-auto p-0 bg-background">
//               <Outlet />
//             </main>
//           </div>
//         </div>
//       </SidebarProvider>
//     );
//   }

//   // Normal layout with AppSidebar
//   return (
//     <SidebarProvider>
//       <div className="min-h-screen flex w-full">
//         <AppSidebar />
//         <div className="flex-1 flex flex-col min-w-0">
//           <header className="h-12 flex items-center justify-between border-b bg-card px-4 shrink-0">
//             <div className="flex items-center gap-3">
//               <SidebarTrigger className="text-muted-foreground" />
//               <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                 <Globe className="h-4 w-4" />
//                 <span>Global Trade Sales Accelerator</span>
//               </div>
//             </div>
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={() => setDark(d => !d)}
//               className="h-8 w-8"
//             >
//               {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
//             </Button>
//           </header>
//           <main className="flex-1 overflow-auto p-6 bg-background">
//             <Outlet />
//           </main>
//         </div>
//       </div>
//     </SidebarProvider>
//   );
// }



// AppLayout.tsx
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { 
  Globe, 
  Sun, 
  Moon, 
  Sparkles, 
  Bell, 
  User, 
  ChevronDown,
  Activity,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function AppLayout() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  // Pages that should NOT show AppSidebar
  const noSidebarPages = ['/templates', '/users'];
  const isNoSidebarPage = noSidebarPages.includes(location.pathname);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Premium Header Component
  const PremiumHeader = ({ showSidebarTrigger = true }) => (
    <header className={cn(
      "h-16 flex items-center justify-between px-6 shrink-0 sticky top-0 z-50 transition-all duration-300",
      scrolled 
        ? "bg-background/95 backdrop-blur-xl border-b shadow-sm" 
        : "bg-background/80 backdrop-blur-md border-b border-transparent"
    )}>
      <div className="flex items-center gap-4">
        {showSidebarTrigger && (
          <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-all hover:scale-110" />
        )}
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center gap-2.5">
              <div className="relative">
                <Globe className="h-6 w-6 text-primary" />
                <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                <div className="absolute -inset-1 bg-primary/20 rounded-full blur-md animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Global Trade Sales
                </span>
                <span className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase">
                  Accelerator Platform
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Status Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">System Online</span>
        </div>

        {/* Activity Stats */}
        <div className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted/30">
          <Activity className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            <span className="text-foreground font-semibold">99.9%</span> uptime
          </span>
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full hover:bg-muted/80 transition-all hover:scale-105"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDark(d => !d)}
          className="h-9 w-9 rounded-full hover:bg-muted/80 transition-all duration-300 hover:scale-105 hover:rotate-12"
        >
          {dark ? (
            <Sun className="h-4.5 w-4.5 text-yellow-500 transition-all" />
          ) : (
            <Moon className="h-4.5 w-4.5 text-slate-600 transition-all" />
          )}
        </Button>

     
      </div>
    </header>
  );

  // If on templates or adminusers page, render without AppSidebar
  if (isNoSidebarPage) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-primary/5">
          <div className="flex-1 flex flex-col min-w-0">
            <PremiumHeader showSidebarTrigger={false} />
            <main className="flex-1 overflow-auto p-6 md:p-8 lg:p-10 bg-gradient-to-b from-background via-background/95 to-primary/5">
              <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Normal layout with AppSidebar
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-primary/5">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <PremiumHeader showSidebarTrigger={true} />
          <main className="flex-1 overflow-auto p-6 md:p-8 lg:p-10 bg-gradient-to-b from-background via-background/95 to-primary/5">
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}