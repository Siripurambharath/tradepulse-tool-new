import React, { useState, useEffect } from 'react';
import { User, Briefcase, Users, Sparkles, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { API_URL } from '@/components/api';
import AdminUsers from './AdminUsers'; // Your existing Users page
import AdminSellers from './AdminSeller'; // Your existing Sellers page

const AdminUsersManagement = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'sellers'>('users');
  const [usersCount, setUsersCount] = useState(0);
  const [sellersCount, setSellersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch counts for both tabs
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        
        // Fetch users count
        const usersRes = await fetch(`${API_URL}/users?page=1&limit=1&role=user`);
        const usersData = await usersRes.json();
        if (usersData.success) {
          setUsersCount(usersData.total || 0);
        }

        // Fetch sellers count
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
      <div className="w-full p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-xl shadow-indigo-500/30">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent tracking-tight">
                  User Management
                </h1>
                <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  Manage and monitor all registered users and sellers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation - Centered with Counts */}
        <div className="border-b border-slate-200/60">
          <div className="flex justify-center gap-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-4 px-2 text-sm font-medium transition-all duration-300 relative flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-700 hover:border-b-2 hover:border-slate-300'
              }`}
            >
              <User className="h-4 w-4" />
              Users
              <Badge className="ml-1 bg-indigo-100 text-indigo-700 border-0 hover:bg-indigo-200 transition-colors">
                {loading ? '...' : usersCount}
              </Badge>
            </button>
            <button
              onClick={() => setActiveTab('sellers')}
              className={`pb-4 px-2 text-sm font-medium transition-all duration-300 relative flex items-center gap-2 ${
                activeTab === 'sellers'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-700 hover:border-b-2 hover:border-slate-300'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              Sellers
              <Badge className="ml-1 bg-indigo-100 text-indigo-700 border-0 hover:bg-indigo-200 transition-colors">
                {loading ? '...' : sellersCount}
              </Badge>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'users' ? <AdminUsers /> : <AdminSellers />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end text-xs text-slate-400 px-2">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-indigo-400" />
            <span>Premium Dashboard</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersManagement;