import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, RefreshCw, User, Activity, Clock, Mail, Globe, ArrowLeft,
  ChevronLeft, ChevronRight, Loader2, Filter, Sparkles
} from 'lucide-react';
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

// Custom debounce hook for smooth search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const AdminUserindetailPage = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  
  // State
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [itemsPerPageOptions] = useState([10, 20, 50, 100]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filter options
  const [modules, setModules] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(true);
  
  // Cache for search results
  const searchCache = useRef<Map<string, any>>(new Map());

  // Fetch filter options
  const fetchFilters = useCallback(async () => {
    try {
      setFiltersLoading(true);
      const params = new URLSearchParams();
      if (sellerId) params.set('user_id', sellerId);

      const response = await fetch(`${ACTIVITY_URL}/api/activity-filters?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setModules(data.modules || []);
        setActions(data.actions || []);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    } finally {
      setFiltersLoading(false);
    }
  }, [sellerId]);

  // Fetch all logs (main API - no search/filters)
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (sellerId) params.set('user_id', sellerId);
      params.set('page', String(currentPage));
      params.set('limit', String(itemsPerPage));

      const response = await fetch(`${ACTIVITY_URL}/api/activity-new?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.data || []);
        setTotalCount(data.total || 0);
        setTotalPages(data.totalPages || 0);
      } else {
        setError(data.message || 'Failed to fetch activity logs');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  }, [sellerId, currentPage, itemsPerPage]);

  // Search logs (separate search API)
  const searchLogs = useCallback(async () => {
    try {
      setIsSearching(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (sellerId) params.set('user_id', sellerId);
      if (debouncedSearchQuery) params.set('search', debouncedSearchQuery);
      if (moduleFilter !== 'all') params.set('module', moduleFilter);
      if (actionFilter !== 'all') params.set('action', actionFilter);
      params.set('page', String(currentPage));
      params.set('limit', String(itemsPerPage));

      // Generate cache key
      const cacheKey = `${sellerId}-${debouncedSearchQuery}-${moduleFilter}-${actionFilter}-${currentPage}-${itemsPerPage}`;
      
      // Check cache first
      if (searchCache.current.has(cacheKey)) {
        const cachedData = searchCache.current.get(cacheKey);
        setLogs(cachedData.logs || []);
        setTotalCount(cachedData.total || 0);
        setTotalPages(cachedData.totalPages || 0);
        setIsSearching(false);
        return;
      }

      const response = await fetch(`${ACTIVITY_URL}/api/activity-search?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        const logsData = data.data || [];
        const total = data.total || 0;
        const pages = data.pagination?.totalPages || 0;
        
        setLogs(logsData);
        setTotalCount(total);
        setTotalPages(pages);
        
        // Store in cache
        searchCache.current.set(cacheKey, {
          logs: logsData,
          total: total,
          totalPages: pages
        });
      } else {
        setError(data.message || 'Failed to search logs');
      }
    } catch (error) {
      console.error('Error searching logs:', error);
      setError('Failed to search logs');
    } finally {
      setIsSearching(false);
    }
  }, [sellerId, debouncedSearchQuery, moduleFilter, actionFilter, currentPage, itemsPerPage]);

  // Initial load
  useEffect(() => {
    fetchFilters();
    fetchLogs();
  }, []);

  // Handle search when debounced query or filters change
  useEffect(() => {
    if (debouncedSearchQuery || moduleFilter !== 'all' || actionFilter !== 'all') {
      searchLogs();
    } else {
      // If search is cleared, fetch all logs
      fetchLogs();
      // Clear cache when search is cleared
      searchCache.current.clear();
    }
  }, [debouncedSearchQuery, moduleFilter, actionFilter, currentPage, itemsPerPage, searchLogs, fetchLogs]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPage(1);
    setSearchQuery(e.target.value);
  };

  const handleModuleChange = (value: string) => {
    setCurrentPage(1);
    setModuleFilter(value);
    searchCache.current.clear();
  };

  const handleActionChange = (value: string) => {
    setCurrentPage(1);
    setActionFilter(value);
    searchCache.current.clear();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    searchCache.current.clear();
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
    searchCache.current.clear();
  };

  const getStatusBadge = (status: string) => {
    if (status === 'SUCCESS') {
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">✓ Success</Badge>;
    }
    return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">{status}</Badge>;
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
    return <span className={`font-medium ${colors[actionName] || 'text-slate-600'}`}>{actionName}</span>;
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

  const handleBack = () => {
    navigate(-1);
  };

  // Show full page loader only on initial load
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full blur-xl opacity-20 animate-pulse" />
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto relative" />
          </div>
          <p className="mt-6 text-sm font-medium text-slate-500 animate-pulse">
            Loading activity logs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-50/20">
      <div className="w-full p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
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
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  {sellerId && (
                    <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 px-3 py-1">
                      User ID: {sellerId}
                    </Badge>
                  )}
                  <span className="text-sm text-slate-500">
                    {totalCount > 0 
                      ? `${totalCount} activity records found`
                      : 'No activity records found'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => {
              searchCache.current.clear();
              setSearchQuery('');
              setModuleFilter('all');
              setActionFilter('all');
              fetchLogs();
            }} 
            disabled={loading || isSearching} 
            variant="default"
            className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg shadow-indigo-500/30"
          >
            <RefreshCw className={`h-4 w-4 ${loading || isSearching ? 'animate-spin' : ''}`} />
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
                  <p className="text-2xl font-bold text-slate-800">{totalCount}</p>
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
                  <p className="text-2xl font-bold text-slate-800">{modules.length}</p>
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
                  <p className="text-2xl font-bold text-slate-800">{actions.length}</p>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Actions Performed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section - Exactly like Search page */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500" />
              <Input
                placeholder="Search by description, user, action..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20 rounded-xl bg-white/80"
              />
              {searchQuery && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                  ) : (
                    <span className="text-xs text-emerald-500 font-medium">✓</span>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <Select value={moduleFilter} onValueChange={handleModuleChange}>
                <SelectTrigger className="w-48 border-gray-200 focus:border-indigo-400 rounded-xl bg-white/80">
                  <Filter className="h-4 w-4 mr-2 text-indigo-500" />
                  <SelectValue placeholder="All Modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📋 All Modules</SelectItem>
                  {modules.map((module) => (
                    <SelectItem key={module} value={module}>
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-indigo-400" />
                        {module}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Select value={actionFilter} onValueChange={handleActionChange}>
                <SelectTrigger className="w-48 border-gray-200 focus:border-indigo-400 rounded-xl bg-white/80">
                  <Filter className="h-4 w-4 mr-2 text-indigo-500" />
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🎯 All Actions</SelectItem>
                  {actions.map((action) => (
                    <SelectItem key={action} value={action}>
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-purple-400" />
                        {action}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Results count and pagination info */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-700">{logs.length}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalCount}</span> logs
            </span>
            {isSearching && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-200">
                <Loader2 className="h-3 w-3 animate-spin" />
                Searching...
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1} 
              onClick={() => handlePageChange(currentPage - 1)}
              className="hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-4 py-1.5 bg-white rounded-lg border text-sm font-medium shadow-sm">
              Page <span className="text-indigo-600">{currentPage}</span> / {totalPages || 1}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage >= totalPages} 
              onClick={() => handlePageChange(currentPage + 1)}
              className="hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50/80 to-indigo-50/80 border-b border-gray-200">
                  <th className="p-4 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">#</th>
                  <th className="p-4 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">User</th>
                  <th className="p-4 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">Action</th>
                  <th className="p-4 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">Module</th>
                  <th className="p-4 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">Description</th>
                  <th className="p-4 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">IP Address</th>
                  <th className="p-4 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">Device</th>
                  <th className="p-4 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[160px]">Time</th>
                </tr>
              </thead>
              <tbody>
                {isSearching ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                        <p className="text-slate-500 text-sm font-medium">Searching logs...</p>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-gray-50 rounded-full">
                          <Activity className="h-10 w-10 text-gray-400" />
                        </div>
                        <p className="text-muted-foreground font-medium">No logs found</p>
                        <p className="text-sm text-muted-foreground/70">
                          {searchQuery || moduleFilter !== 'all' || actionFilter !== 'all' 
                            ? "Try adjusting your search terms or filters"
                            : "No activity logs available for this user"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log, index) => (
                    <tr 
                      key={log.id} 
                      className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-transparent transition-all duration-200"
                    >
                      <td className="p-4 font-medium text-slate-400 text-xs">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center ring-2 ring-white shadow-md">
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
            <div className="border-t border-gray-200/60 bg-gradient-to-r from-gray-50/50 to-indigo-50/30 px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">Rows per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400"
                  >
                    {itemsPerPageOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">
                    {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === 1} 
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage >= totalPages} 
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-2 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span>Total logs: {totalCount}</span>
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