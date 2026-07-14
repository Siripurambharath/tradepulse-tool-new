import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, User, Activity, Clock, Mail, Globe, ArrowLeft } from 'lucide-react';
import { AdminSidebar } from "@/components/AdminSidebar";
import { Pagination } from './Pagination';
import { ACTIVITY_URL } from '@/components/api';

interface ActivityLog {
  id: number;
  user_id: string;
  user_name: string;
  role: string;
  action_id: number;
  action_name: string;
  module_id: number;
  module_name: string;
  description: string;
  ip_address: string;
  device: string;
  status: string;
  created_at: string;
}

const AdminUserindetailPage = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [itemsPerPageOptions] = useState([5, 10, 20, 50, 100]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sellerId) {
      fetchActivityLogs(sellerId);
    }
  }, [sellerId]);

  const fetchActivityLogs = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔍 Fetching logs for user:", userId);
      console.log("🔍 API URL:", `${ACTIVITY_URL}/api/activity-log?user_id=${userId}`);
      
      const response = await fetch(`${ACTIVITY_URL}/api/activity-log?user_id=${userId}`);
      const data = await response.json();
      
      console.log("🔍 Response data:", data);
      
      if (data.success) {
        setLogs(data.data);
        console.log(`✅ Received ${data.data.length} logs for user ${userId}`);
      } else {
        setLogs([]);
        setError(data.message || 'Failed to fetch activity logs');
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setLogs([]);
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  // Get unique modules and actions for filters (for UI dropdowns)
  const modules = [...new Set(logs.map(log => log.module_name))].sort();
  const actions = [...new Set(logs.map(log => log.action_name))].sort();

  // Pagination - only on frontend since data is already filtered by backend
  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const paginatedLogs = logs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const getStatusBadge = (status: string) => {
    if (status === 'SUCCESS') {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">✓ Success</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const getActionBadge = (actionName: string) => {
    const colors: Record<string, string> = {
      'LOGIN': 'text-blue-600',
      'Products Table': 'text-purple-600',
      'Contacts Table': 'text-indigo-600',
      'Tracking Table': 'text-cyan-600',
      'Analytics Dashboard Page': 'text-emerald-600',
      'History Page': 'text-amber-600',
      'Email Configuration Page': 'text-pink-600',
    };
    return <span className={`font-medium ${colors[actionName] || 'text-gray-600'}`}>{actionName}</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

const handleBack = () => {
  navigate(-1); // Go back to the previous page
};

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-slate-100 via-white to-indigo-50/20">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-8 space-y-6 content-space">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleBack} 
                variant="outline" 
                size="sm"
                className="gap-2 hover:bg-indigo-50/50 transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Users
              </Button>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-xl shadow-indigo-500/30">
                <Activity className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  User Activity Log
                </h1>
                <div className="flex items-center gap-3 mt-0.5">
                  {sellerId && (
                    <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 px-3 py-1">
                      User ID: {sellerId}
                    </Badge>
                  )}
                  <span className="text-sm text-slate-500">
                    {logs.length > 0 
                      ? `${logs.length} activity records found`
                      : 'No activity records found'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => sellerId && fetchActivityLogs(sellerId)} 
            disabled={loading} 
            variant="default"
            className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg shadow-indigo-500/30"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{logs.length}</p>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Activities</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{new Set(logs.map(l => l.user_name)).size}</p>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{new Set(logs.map(l => l.module_name)).size}</p>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Modules Used</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{new Set(logs.map(l => l.action_name)).size}</p>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Actions Performed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border-0 shadow-lg bg-red-50/80 backdrop-blur-sm">
            <CardContent className="pt-4 pb-4">
              <p className="text-red-600 font-medium">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
          <CardContent className="pt-0 p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50/80 to-indigo-50/80 border-b border-slate-200/60">
                    <th className="p-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">#</th>
                    <th className="p-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">User</th>
                    <th className="p-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Action</th>
                    <th className="p-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Module</th>
                    <th className="p-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Description</th>
                    <th className="p-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">IP Address</th>
                    <th className="p-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Device</th>
                    <th className="p-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider min-w-[160px]">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-16">
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative">
                            <div className="animate-spin rounded-full h-14 w-14 border-4 border-indigo-200 border-t-indigo-600"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-pulse"></div>
                          </div>
                          <p className="text-slate-500 text-sm font-medium">Loading activity logs...</p>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <Activity className="h-8 w-8 text-slate-400" />
                          </div>
                          <p className="text-slate-500 font-medium">
                            {error ? 'No logs available' : 'No activity logs found for this user'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((log, index) => (
                      <tr key={log.id} className="border-b last:border-b-0 hover:bg-gradient-to-r hover:from-indigo-50/40 hover:to-transparent transition-all duration-300 group">
                        <td className="p-4 font-medium text-slate-400 text-xs">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center ring-2 ring-white shadow-md group-hover:ring-indigo-300 transition-all duration-300">
                              <User className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-700">{log.user_name}</p>
                              <p className="text-xs text-slate-400">{log.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">{getActionBadge(log.action_name)}</td>
                        <td className="p-4">
                          <Badge variant="outline" className="bg-slate-50/50 border-slate-200 text-slate-600">
                            {log.module_name}
                          </Badge>
                        </td>
                        <td className="p-4 max-w-xs">
                          <p className="truncate text-slate-600" title={log.description}>{log.description}</p>
                        </td>
                        <td className="p-4">
                          <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{log.ip_address}</code>
                        </td>
                        <td className="p-4">
                          <span className="text-xs text-slate-500">{log.device}</span>
                        </td>
                        <td className="p-4 min-w-[160px]">
                          <div className="flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
                            <Clock className="h-3 w-3" />
                            {formatDate(log.created_at)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {logs.length > 0 && (
              <div className="border-t border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-indigo-50/30 px-6 py-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={logs.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  itemsPerPageOptions={itemsPerPageOptions}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-2">
          <div className="flex items-center gap-4">
            <span>Total logs: {logs.length}</span>
            <span className="w-px h-4 bg-slate-200"></span>
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span>Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserindetailPage;