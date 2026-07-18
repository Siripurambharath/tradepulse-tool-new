// src/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { AdminLayout } from "@/components/AdminLayout"; // NEW
import ProtectedRoute from "./pages/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import SearchPage from "./pages/SearchPage";
import BuyersPage from "./pages/BuyersPage";
import ContactsPage from "./pages/ContactsPage";
import TrackingPage from "./pages/TrackingPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import HistoryPage from "./pages/HistoryPage";
import HistoryDetailPage from "./pages/HistoryDetailPage";
import TemplatesPage from "./pages/TemplatesPage";
import CampaignsPage from "./pages/CampaignsPage";
import NotFound from "./pages/NotFound";
import EmailConfiguration from "./pages/Emailconfig";
import TrackingPageIndetail from "./pages/TrackingPage";
import ContactDetailPage from "./pages/ContactDetailPage";
import TrackingPagIndetail from "./pages/TrackingPagIndetail";
import AdminUsers from "./pages/AdminPage/AdminUserindetailPage";
import AddBuyerPage from "./pages/AdminPage/AddBuyerPage";
import BuyerBulkUpload from "./pages/AdminPage/BulkUpload";
import AdminHistoryPage from "./pages/AdminPage/AdminHistorypage";
import AdminHistoryDetail from "./pages/AdminPage/AdminHistoryDetail";
import AdminSeller from "./pages/AdminPage/AdminSeller";
import AdminTracker from "./pages/AdminPage/AdminTrackingPage";
import AdminUserindetailPage from "./pages/AdminPage/AdminUserindetailPage";
import Adminusers from "./pages/AdminPage/AdminUsers";
import AdminTrackingPage from "./pages/AdminPage/AdminTrackingPage";
import AdminTrackingPagIndetail from "./pages/AdminPage/AdminTrackingPagIndetail";
import { AdminSidebar } from "./components/AdminSidebar";
import AdminUsersManagement from "./pages/AdminPage/AdminUsersManagement";
import SsoCallback from "./pages/SsoCallback";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Root redirect based on token */}
          <Route
            path="/"
            element={
              <Navigate
                to={localStorage.getItem("token") ? "/search" : "/login"}
                replace
              />
            }
          />

          {/* Login - redirects to /search if token exists */}
          <Route path="/login" element={<LoginPage />} />
  <Route path="/sso/callback" element={<SsoCallback />} />
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            {/* Main App Layout - Regular routes */}
            <Route element={<AppLayout />}>
              <Route path="/search" element={<SearchPage />} />
              <Route path="/buyers" element={<BuyersPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/tracking" element={<TrackingPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/history/:id" element={<HistoryDetailPage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/emailconfig" element={<EmailConfiguration />} />
              <Route path="/trackingindetail/:id" element={<TrackingPagIndetail />} />
              <Route path="/contactsindetail/:id" element={<ContactDetailPage />} />
            
              <Route path="/admin/history" element={<AdminHistoryPage />} />
              <Route path="/admin/historydetail/:id" element={<AdminHistoryDetail />} />
            
            </Route>

            <Route element={<AdminLayout />}>
              <Route path="/add-buyer" element={<AddBuyerPage />} />
                            <Route path="/bulk-upload" element={<BuyerBulkUpload />} />
              <Route path="/admin/sellers" element={<AdminSeller />} />
              <Route path="/adminusers" element={<Adminusers />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/usersindetail" element={<AdminUserindetailPage />} />
              <Route path="/usersindetail/:sellerId" element={<AdminUserindetailPage />} />
              <Route path="/admin/tracking" element={<AdminTrackingPage />} />
              <Route path="/admin/tracking/:sellerId" element={<AdminTrackingPage />} />
<Route path="/admin/trackingindetail/:sellerId/:buyerId" element={<AdminTrackingPagIndetail />} />
              <Route path="/admin/trackingindetail" element={<AdminTrackingPagIndetail />} />
              <Route path="/admin/users" element={<AdminUsersManagement />} />    
                          <Route path="/admin/users/:sellerId" element={<AdminUsersManagement />} />  

            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;