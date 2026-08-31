import React, { useState, useEffect } from 'react';
import { User, Briefcase, Users, Sparkles, Zap, Eye, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { API_URL } from '@/components/api';
import { useSearchParams } from 'react-router-dom';
import AdminUserindetailPage from './AdminUserindetailPage';
import AdminTrackingPage from './AdminTrackingPage';

const AdminUsersManagement = () => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'userDetails';
  
  const [activeTab, setActiveTab] = useState<'userDetails' | 'tracking'>(tabFromUrl as 'userDetails' | 'tracking');
  const [usersCount, setUsersCount] = useState(0);
  const [sellersCount, setSellersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'userDetails' || tab === 'tracking') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        
        const usersRes = await fetch(`${API_URL}/users?page=1&limit=1&role=user`);
        const usersData = await usersRes.json();
        if (usersData.success) {
          setUsersCount(usersData.total || 0);
        }

        const sellersRes = await fetch(`${API_URL}/users?page=1&limit=1&role=seller`);
        const sellersData = await sellersRes.json();
        if (sellersData.success) {
          setSellersCount(sellersData.total || 0);
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-50/20">
      <div className="w-full px-0 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8 space-y-4 sm:space-y-5 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative flex-shrink-0">
                <div className="p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-xl shadow-indigo-500/30">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-emerald-400 rounded-full ring-2 ring-white animate-pulse"></div>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent tracking-tight truncate">
                  User Management
                </h1>
                <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 mt-0.5 flex items-center gap-1 sm:gap-2 truncate">
                  <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-indigo-400 flex-shrink-0" />
                  <span className="hidden xs:inline">Manage user activity and email tracking</span>
                  <span className="xs:hidden">Manage users</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation - Centered with Counts */}
        <div className="border-b border-slate-200/60">
          <div className="flex justify-center gap-3 sm:gap-6 overflow-x-auto px-2">
            {/* User Details Tab */}
            <button
              onClick={() => setActiveTab('userDetails')}
              className={`pb-3 sm:pb-4 px-2 text-xs sm:text-sm font-medium transition-all duration-300 relative flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                activeTab === 'userDetails'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-700 hover:border-b-2 hover:border-slate-300'
              }`}
            >
              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">User Activity</span>
              <span className="xs:hidden">Activity</span>
              <Badge className="ml-0.5 sm:ml-1 bg-indigo-100 text-indigo-700 border-0 hover:bg-indigo-200 transition-colors text-[10px] sm:text-xs">
                {loading ? '...' : usersCount}
              </Badge>
            </button>

            {/* Tracking Tab */}
            <button
              onClick={() => setActiveTab('tracking')}
              className={`pb-3 sm:pb-4 px-2 text-xs sm:text-sm font-medium transition-all duration-300 relative flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                activeTab === 'tracking'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-700 hover:border-b-2 hover:border-slate-300'
              }`}
            >
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Email Tracking</span>
              <span className="xs:hidden">Tracking</span>
              <Badge className="ml-0.5 sm:ml-1 bg-indigo-100 text-indigo-700 border-0 hover:bg-indigo-200 transition-colors text-[10px] sm:text-xs">
                {loading ? '...' : sellersCount}
              </Badge>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-4 sm:mt-6">
          {activeTab === 'userDetails' ? <AdminUserindetailPage /> : <AdminTrackingPage />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end text-[10px] sm:text-xs text-slate-400 px-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-indigo-400" />
            <span>Premium Dashboard</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersManagement;