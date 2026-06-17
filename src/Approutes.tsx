import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "@/components/context/AuthContext";
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
import EmailConfiguration from "./pages/Emailconfig";
import ContactDetailPage from "./pages/ContactDetailPage";
import TrackingPagIndetail from "./pages/TrackingPagIndetail";
import NotFound from "./pages/NotFound";

export default function AppRoutes() {
  const { token, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={token ? "/search" : "/login"}
            replace
          />
        }
      />

      <Route path="/login" element={<LoginPage />} />

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
          <Route
            path="/trackingindetail/:id"
            element={<TrackingPagIndetail />}
          />
          <Route
            path="/contactsindetail/:id"
            element={<ContactDetailPage />}
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}