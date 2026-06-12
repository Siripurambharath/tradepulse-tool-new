import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
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

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/search" element={<SearchPage />} />
              <Route path="/buyers" element={<BuyersPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/tracking" element={<TrackingPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/history/:id" element={<HistoryDetailPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
                 <Route path="/emailconfig" element={<EmailConfiguration />} />
                  <Route path="/trackingindetail/:id" element={<TrackingPagIndetail />} />
                  <Route path="/contactsindetail/:id" element={<ContactDetailPage />} />

            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;