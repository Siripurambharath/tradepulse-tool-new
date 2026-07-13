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
  
//   // Pages that should NOT show AppSidebar (they have their own sidebar)
//   const noSidebarPages = ['/templates', '/users', '/admin/history', '/admin/historydetail'];
  
//   // Check if current path matches any no-sidebar page
//   const isNoSidebarPage = noSidebarPages.some(page => 
//     location.pathname === page || location.pathname.startsWith('/admin/history')
//   );

//   useEffect(() => {
//     document.documentElement.classList.toggle('dark', dark);
//   }, [dark]);

//   // If on templates, users, or admin history pages, render without AppSidebar
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




import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Globe, Sun, Moon, Search, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import "./AppLayout.css";

export function AppLayout() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const location = useLocation();
  
  // Pages that should NOT show AppSidebar (they have their own sidebar)
  const noSidebarPages = ['/adminusers', '/admin/history', '/admin/historydetail', '/admin/sellers'];
  
  // Check if current path matches any no-sidebar page
  const isNoSidebarPage = noSidebarPages.some(page => 
    location.pathname === page || 
    location.pathname.startsWith('/admin/history') || 
    location.pathname.startsWith('/admin/tracking') || 
    location.pathname.startsWith('/usersindetail')
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  // Full header shared by both layouts
  const renderFullHeader = (showSidebarTrigger: boolean) => (
    <header 
      className="h-14 flex items-center justify-between px-4 shrink-0 fixed top-0 right-0 left-0 z-50 gap-4 bg-card content-space"
      style={{ 
        left: showSidebarTrigger ? 'var(--sidebar-width, 240px)' : 0,
        right: 0,
        borderBottom: '1px solid #40A2E3',
      }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {showSidebarTrigger && <SidebarTrigger className="text-muted-foreground shrink-0" />}
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-xl min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#499A13' }} />
          <Input
            placeholder="Search buyers, RFQs, products, documents..."
            className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1 text-sm focus-visible:ring-[#499A13] w-full"
            style={{ 
              '--ring-color': '#499A13',
              borderColor: '#499A13'
            } as React.CSSProperties}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Upgrade Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-3 text-xs font-medium hover:bg-[#499A13]/10 shrink-0"
          style={{ 
            borderColor: '#499A13',
            color: '#499A13'
          }}
        >
          <Sparkles className="h-3 w-3 mr-1" style={{ color: '#499A13' }} />
          Upgrade
        </Button>

        {/* User/Avatar */}
        <div className="flex items-center gap-2 ml-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <div 
              className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium text-white shrink-0"
              style={{ backgroundColor: '#499A13' }}
            >
              iii
            </div>
            <span className="text-sm font-medium hidden sm:inline">iiiqbets</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>

        {/* Accelerator Badge */}
        <Badge 
          variant="secondary" 
          className="h-6 px-2 text-[10px] font-medium border shrink-0"
          style={{ 
            backgroundColor: '#499A13',
            color: 'white',
            borderColor: '#499A13'
          }}
        >
          Accelerator
        </Badge>

        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDark(d => !d)}
          className="h-8 w-8 ml-1 shrink-0"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );

  // No-sidebar layout (admin pages with their own sidebar)
  if (isNoSidebarPage) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <div className="flex-1 flex flex-col min-w-0">
            {renderFullHeader(false)}
            <main className="flex-1 overflow-auto pt-14 bg-background">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Normal layout with AppSidebar
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {renderFullHeader(true)}
          <main className="flex-1 overflow-auto pt-14 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}