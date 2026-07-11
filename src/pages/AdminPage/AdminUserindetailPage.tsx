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

  // In AdminUserindetailPage.tsx
const fetchActivityLogs = async (userId: string) => {
  try {
    setLoading(true);
    setError(null);
    
    // Make sure ACTIVITY_URL is correct
    console.log("🔍 Fetching logs for user:", userId);
    console.log("🔍 API URL:", `${ACTIVITY_URL}/api/activity-log?user_id=${userId}`);
    
    const response = await fetch(`${ACTIVITY_URL}/api/activity-log?user_id=${userId}`);
    const data = await response.json();
    
    console.log("🔍 Response data:", data); // Check what's returned
    
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
    navigate('/adminusers');
  };

  return (
    <div className="flex h-screen w-full">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleBack} 
                variant="outline" 
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
            </div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2 mt-2">
              <Activity className="h-6 w-6 text-primary" />
              User Activity Log
              {sellerId && (
                <Badge variant="outline" className="ml-2 text-sm">
                  User ID: {sellerId}
                </Badge>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {logs.length > 0 
                ? `Showing ${logs.length} activity records for user ${sellerId}`
                : `Activity logs for user ${sellerId}`}
            </p>
          </div>
          <Button 
            onClick={() => sellerId && fetchActivityLogs(sellerId)} 
            disabled={loading} 
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{logs.length}</p>
                  <p className="text-xs text-muted-foreground">Total Activities</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{new Set(logs.map(l => l.user_name)).size}</p>
                  <p className="text-xs text-muted-foreground">Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Globe className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{new Set(logs.map(l => l.module_name)).size}</p>
                  <p className="text-xs text-muted-foreground">Modules Used</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{new Set(logs.map(l => l.action_name)).size}</p>
                  <p className="text-xs text-muted-foreground">Actions Performed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="p-3 text-left font-medium text-foreground">S.NO</th>
                    <th className="p-3 text-left font-medium text-foreground">User</th>
                    <th className="p-3 text-left font-medium text-foreground">Action</th>
                    <th className="p-3 text-left font-medium text-foreground">Module</th>
                    <th className="p-3 text-left font-medium text-foreground">Description</th>
                    <th className="p-3 text-left font-medium text-foreground">IP Address</th>
                    <th className="p-3 text-left font-medium text-foreground">Device</th>
                    <th className="p-3 text-left font-medium text-foreground min-w-[160px]">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">Loading activity logs...</p>
                      </td>
                    </tr>
                  ) : paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-muted-foreground">
                        {error ? 'No logs available' : 'No activity logs found for this user'}
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((log, index) => (
                      <tr key={log.id} className="border-b hover:bg-muted/20 transition-colors">
                        <td className="p-3 font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-3 w-3 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{log.user_name}</p>
                              <p className="text-xs text-muted-foreground">{log.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">{getActionBadge(log.action_name)}</td>
                        <td className="p-3">
                          <Badge variant="outline">{log.module_name}</Badge>
                        </td>
                        <td className="p-3 max-w-xs">
                          <p className="truncate" title={log.description}>{log.description}</p>
                        </td>
                        <td className="p-3">
                          <code className="text-xs bg-muted px-2 py-1 rounded">{log.ip_address}</code>
                        </td>
                        <td className="p-3">
                          <span className="text-xs">{log.device}</span>
                        </td>
                        <td className="p-3 min-w-[160px]">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(log.created_at)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
            {logs.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={logs.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                itemsPerPageOptions={itemsPerPageOptions}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUserindetailPage;