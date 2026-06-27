import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, User, Activity, Clock, Mail, Globe } from 'lucide-react';
import { AdminSidebar } from "@/components/AdminSidebar";
import { Pagination } from './Pagination';

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

const AdminUsers = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [itemsPerPageOptions] = useState([5, 10, 20, 50, 100]);

  // Get unique modules and actions for filters
  const modules = [...new Set(logs.map(log => log.module_name))].sort();
  const actions = [...new Set(logs.map(log => log.action_name))].sort();

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/activity-log');
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.data);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchQuery || 
      log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.module_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip_address.includes(searchQuery);
    
    const matchesModule = moduleFilter === 'all' || log.module_name === moduleFilter;
    const matchesAction = actionFilter === 'all' || log.action_name === actionFilter;
    
    return matchesSearch && matchesModule && matchesAction;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, moduleFilter, actionFilter, itemsPerPage]);

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

  return (
    <div className="flex h-screen w-full">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Activity Log
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track all user activities across the platform
            </p>
          </div>
          <Button onClick={fetchActivityLogs} disabled={loading} variant="outline">
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
                  <p className="text-xs text-muted-foreground">Unique Users</p>
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

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user, action, module..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {modules.map(module => (
                    <SelectItem key={module} value={module}>{module}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actions.map(action => (
                    <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="p-3 text-left font-medium text-foreground">S.NO</th>
                    <th className="p-3 text-left font-medium text-foreground">Users</th>
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
                      <td colSpan={9} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">Loading activity logs...</p>
                      </td>
                    </tr>
                  ) : paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-muted-foreground">
                        No activity logs found
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
            {filteredLogs.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredLogs.length}
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

export default AdminUsers;