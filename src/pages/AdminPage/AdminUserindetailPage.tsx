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
  
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [itemsPerPageOptions] = useState([10, 20, 50, 100]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [modules, setModules] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(true);
  
  const searchCache = useRef<Map<string, any>>(new Map());

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

      const cacheKey = `${sellerId}-${debouncedSearchQuery}-${moduleFilter}-${actionFilter}-${currentPage}-${itemsPerPage}`;
      
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

  useEffect(() => {
    fetchFilters();
    fetchLogs();
  }, []);

  useEffect(() => {
    if (debouncedSearchQuery || moduleFilter !== 'all' || actionFilter !== 'all') {
      searchLogs();
    } else {
      fetchLogs();
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
      return <Badge className="bg-[#8EE147]/20 text-[#8EE147] hover:bg-[#8EE147]/20 border-[#8EE147]/30 text-[10px] sm:text-xs">✓ Success</Badge>;
    }
    return <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/20 border-amber-500/30 text-[10px] sm:text-xs">{status}</Badge>;
  };

  const getActionBadge = (actionName: string) => {
    const colors: Record<string, string> = {
      'LOGIN': 'text-[#8EE147]',
      'Products Table': 'text-[#8EE147]',
      'Contacts Table': 'text-[#8EE147]',
      'Tracking Table': 'text-[#8EE147]',
      'Analytics Dashboard Page': 'text-[#8EE147]',
      'History Page': 'text-[#8EE147]',
      'Email Configuration Page': 'text-[#8EE147]',
    };
    return <span className={`font-medium text-xs sm:text-sm ${colors[actionName] || 'text-slate-300'}`}>{actionName}</span>;
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

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0E223B' }}>
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-xl opacity-20 animate-pulse" style={{ background: 'linear-gradient(to right, #8EE147, #6EC035)' }} />
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 mx-auto relative" style={{ borderColor: '#8EE14720', borderTopColor: '#8EE147' }} />
          </div>
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm font-medium animate-pulse" style={{ color: '#94A3B8' }}>
            Loading activity logs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-3 sm:p-4 md:p-6" style={{ backgroundColor: '#0E223B' }}>
      {/* Decorative gradient header */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8EE147] via-[#6EC035] to-[#5AA82E]" />
      
      <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-5 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button 
                onClick={handleBack} 
                variant="ghost"
                size="sm"
                className="gap-1.5 sm:gap-2 hover:bg-[#8EE147]/10 hover:text-[#8EE147] transition-all duration-300 h-7 sm:h-8 md:h-9 text-xs sm:text-sm text-slate-300"
              >
                <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden xs:inline">Back to Users</span>
                <span className="xs:hidden">Back</span>
              </Button>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
              <div className="p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#8EE147] to-[#6EC035] shadow-xl shadow-[#8EE147]/30">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-[#0E223B]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#8EE147] to-[#6EC035] bg-clip-text text-transparent truncate">
                  User Activity Log
                </h1>
                <div className="flex items-center gap-2 sm:gap-3 mt-0.5 flex-wrap">
                  {sellerId && (
                    <Badge className="bg-[#8EE147]/20 text-[#8EE147] border-[#8EE147]/30 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs">
                      User ID: {sellerId}
                    </Badge>
                  )}
                  <span className="text-[10px] sm:text-xs md:text-sm text-slate-400">
                    {totalCount > 0 
                      ? `${totalCount} activity records found`
                      : 'No activity records found'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full sm:w-auto">
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
              className="gap-1.5 sm:gap-2 w-full sm:w-auto bg-gradient-to-r from-[#8EE147] to-[#6EC035] hover:from-[#7DD13A] hover:to-[#5AA82E] text-[#0E223B] shadow-lg shadow-[#8EE147]/30 text-xs sm:text-sm h-8 sm:h-9 md:h-10 px-3 sm:px-4"
            >
              <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${loading || isSearching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards - Dark Theme */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <Card className="border border-white/10 shadow-lg bg-[#0E223B]/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500">
            <CardContent className="pt-3 sm:pt-4 md:pt-6 pb-3 sm:pb-4 md:pb-6">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <div className="p-2 sm:p-2.5 md:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#8EE147] to-[#6EC035] shadow-lg">
                  <Activity className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-[#0E223B]" />
                </div>
                <div>
                  <p className="text-base sm:text-lg md:text-2xl font-bold text-white">{totalCount}</p>
                  <p className="text-[8px] sm:text-[9px] md:text-xs text-slate-400 font-medium uppercase tracking-wider">Total Activities</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-white/10 shadow-lg bg-[#0E223B]/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500">
            <CardContent className="pt-3 sm:pt-4 md:pt-6 pb-3 sm:pb-4 md:pb-6">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <div className="p-2 sm:p-2.5 md:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#8EE147] to-[#6EC035] shadow-lg">
                  <User className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-[#0E223B]" />
                </div>
                <div>
                  <p className="text-base sm:text-lg md:text-2xl font-bold text-white">{new Set(logs.map(l => l.user_name)).size}</p>
                  <p className="text-[8px] sm:text-[9px] md:text-xs text-slate-400 font-medium uppercase tracking-wider">Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-white/10 shadow-lg bg-[#0E223B]/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500">
            <CardContent className="pt-3 sm:pt-4 md:pt-6 pb-3 sm:pb-4 md:pb-6">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <div className="p-2 sm:p-2.5 md:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#8EE147] to-[#6EC035] shadow-lg">
                  <Globe className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-[#0E223B]" />
                </div>
                <div>
                  <p className="text-base sm:text-lg md:text-2xl font-bold text-white">{modules.length}</p>
                  <p className="text-[8px] sm:text-[9px] md:text-xs text-slate-400 font-medium uppercase tracking-wider">Modules</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-white/10 shadow-lg bg-[#0E223B]/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500">
            <CardContent className="pt-3 sm:pt-4 md:pt-6 pb-3 sm:pb-4 md:pb-6">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <div className="p-2 sm:p-2.5 md:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#8EE147] to-[#6EC035] shadow-lg">
                  <Clock className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-[#0E223B]" />
                </div>
                <div>
                  <p className="text-base sm:text-lg md:text-2xl font-bold text-white">{actions.length}</p>
                  <p className="text-[8px] sm:text-[9px] md:text-xs text-slate-400 font-medium uppercase tracking-wider">Actions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section - Dark Theme */}
        <div className="bg-[#0E223B]/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/10 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
            <div className="relative flex-1 min-w-[150px]">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#8EE147]" />
              <Input
                placeholder="Search by description, user, action..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 sm:pl-10 border-white/10 focus:border-[#8EE147] focus:ring-[#8EE147]/20 rounded-lg sm:rounded-xl bg-white/5 text-white placeholder:text-slate-500 h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
              />
              {searchQuery && (
                <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2">
                  {isSearching ? (
                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-[#8EE147]" />
                  ) : (
                    <span className="text-[10px] sm:text-xs text-[#8EE147] font-medium">✓</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Select value={moduleFilter} onValueChange={handleModuleChange}>
                <SelectTrigger className="w-[130px] sm:w-48 border-white/10 focus:border-[#8EE147] rounded-lg sm:rounded-xl bg-white/5 text-white h-8 sm:h-9 md:h-10 text-xs sm:text-sm">
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-[#8EE147]" />
                  <SelectValue placeholder="Modules" />
                </SelectTrigger>
                <SelectContent className="bg-[#0E223B] border-white/10 text-white">
                  <SelectItem value="all" className="hover:bg-[#8EE147]/10 focus:bg-[#8EE147]/10">📋 All Modules</SelectItem>
                  {modules.map((module) => (
                    <SelectItem key={module} value={module} className="hover:bg-[#8EE147]/10 focus:bg-[#8EE147]/10">
                      <span className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                        <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#8EE147]" />
                        {module}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={actionFilter} onValueChange={handleActionChange}>
                <SelectTrigger className="w-[130px] sm:w-48 border-white/10 focus:border-[#8EE147] rounded-lg sm:rounded-xl bg-white/5 text-white h-8 sm:h-9 md:h-10 text-xs sm:text-sm">
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-[#8EE147]" />
                  <SelectValue placeholder="Actions" />
                </SelectTrigger>
                <SelectContent className="bg-[#0E223B] border-white/10 text-white">
                  <SelectItem value="all" className="hover:bg-[#8EE147]/10 focus:bg-[#8EE147]/10">🎯 All Actions</SelectItem>
                  {actions.map((action) => (
                    <SelectItem key={action} value={action} className="hover:bg-[#8EE147]/10 focus:bg-[#8EE147]/10">
                      <span className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                        <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#8EE147]" />
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
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm">
            {error}
          </div>
        )}

        {/* Results count and pagination info - Dark Theme */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-[10px] sm:text-sm text-slate-400">
              Showing <span className="font-semibold text-white">{logs.length}</span> of{' '}
              <span className="font-semibold text-white">{totalCount}</span> logs
            </span>
            {isSearching && (
              <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-amber-500/10 text-amber-400 rounded-full text-[8px] sm:text-xs font-medium border border-amber-500/30">
                <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin" />
                Searching...
              </span>
            )}
          </div>
       <div className="flex items-center gap-1.5 sm:gap-2">
  <Button 
    variant="outline" 
    size="sm" 
    disabled={currentPage === 1} 
    onClick={() => handlePageChange(currentPage - 1)}
    className="h-7 sm:h-8 md:h-9 px-2 sm:px-3 hover:bg-[#8EE147]/10 hover:border-[#8EE147]/30 transition-colors text-xs border border-white/20 bg-transparent text-white hover:text-[#8EE147] disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#8EE147]" />
  </Button>
  <div className="px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] sm:text-sm font-medium shadow-sm text-white">
    Page <span className="text-[#8EE147]">{currentPage}</span> / {totalPages || 1}
  </div>
  <Button 
    variant="outline" 
    size="sm" 
    disabled={currentPage >= totalPages} 
    onClick={() => handlePageChange(currentPage + 1)}
    className="h-7 sm:h-8 md:h-9 px-2 sm:px-3 hover:bg-[#8EE147]/10 hover:border-[#8EE147]/30 transition-colors text-xs border border-white/20 bg-transparent text-white hover:text-[#8EE147] disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#8EE147]" />
  </Button>
</div>
        </div>

        {/* Table - Dark Theme */}
        <div className="bg-[#0E223B]/50 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] sm:min-w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-[#8EE147]/10 to-[#6EC035]/10 border-b border-white/10">
                  <th className="p-2 sm:p-3 md:p-4 text-left font-semibold text-slate-300 text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap">#</th>
                  <th className="p-2 sm:p-3 md:p-4 text-left font-semibold text-slate-300 text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap">User</th>
                  <th className="p-2 sm:p-3 md:p-4 text-left font-semibold text-slate-300 text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap">Action</th>
                  <th className="p-2 sm:p-3 md:p-4 text-left font-semibold text-slate-300 text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap">Module</th>
                  <th className="p-2 sm:p-3 md:p-4 text-left font-semibold text-slate-300 text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap">Description</th>
                  <th className="p-2 sm:p-3 md:p-4 text-left font-semibold text-slate-300 text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap">IP</th>
                  <th className="p-2 sm:p-3 md:p-4 text-left font-semibold text-slate-300 text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap">Device</th>
                  <th className="p-2 sm:p-3 md:p-4 text-left font-semibold text-slate-300 text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap min-w-[100px]">Time</th>
                </tr>
              </thead>
              <tbody>
                {isSearching ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 sm:py-16">
                      <div className="flex flex-col items-center gap-3 sm:gap-4">
                        <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-[#8EE147]" />
                        <p className="text-xs sm:text-sm text-slate-400 font-medium">Searching logs...</p>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 sm:py-16">
                      <div className="flex flex-col items-center gap-2 sm:gap-3">
                        <div className="p-3 sm:p-4 bg-white/5 rounded-full">
                          <Activity className="h-8 w-8 sm:h-10 sm:w-10 text-slate-500" />
                        </div>
                        <p className="text-sm sm:text-base text-slate-300 font-medium">No logs found</p>
                        <p className="text-[10px] sm:text-sm text-slate-500 text-center px-4">
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
                      className="border-b border-white/5 hover:bg-[#8EE147]/5 transition-all duration-200"
                    >
                      <td className="p-2 sm:p-3 md:p-4 font-medium text-slate-500 text-[10px] sm:text-xs whitespace-nowrap">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="p-2 sm:p-3 md:p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 sm:gap-3">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-[#8EE147]/20 to-[#6EC035]/20 flex items-center justify-center ring-2 ring-[#8EE147]/10 shadow-md flex-shrink-0 border border-[#8EE147]/20">
                            <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-[#8EE147]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-xs sm:text-sm text-white truncate max-w-[60px] sm:max-w-[100px]">{log.user_name}</p>
                            <p className="text-[8px] sm:text-[10px] text-slate-400 truncate">{log.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 md:p-4 whitespace-nowrap">{getActionBadge(log.action_name)}</td>
                      <td className="p-2 sm:p-3 md:p-4 whitespace-nowrap">
                        <Badge variant="outline" className="bg-white/5 border-white/10 text-slate-300 text-[8px] sm:text-[10px] md:text-xs whitespace-nowrap">
                          {log.module_name}
                        </Badge>
                      </td>
                      <td className="p-2 sm:p-3 md:p-4 max-w-[100px] sm:max-w-[150px]">
                        <p className="truncate text-xs sm:text-sm text-slate-300" title={log.description}>{log.description}</p>
                      </td>
                      <td className="p-2 sm:p-3 md:p-4 whitespace-nowrap">
                        <code className="text-[8px] sm:text-[10px] bg-white/5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-slate-300">{log.ip_address}</code>
                      </td>
                      <td className="p-2 sm:p-3 md:p-4 whitespace-nowrap">
                        <span className="text-[8px] sm:text-[10px] text-slate-400">{log.device}</span>
                      </td>
                      <td className="p-2 sm:p-3 md:p-4 min-w-[80px] sm:min-w-[120px] whitespace-nowrap">
                        <div className="flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] text-slate-400 whitespace-nowrap">
                          <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                          {formatDate(log.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - Dark Theme */}
          {logs.length > 0 && (
            <div className="border-t border-white/10 bg-gradient-to-r from-[#8EE147]/5 to-[#6EC035]/5 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-[10px] sm:text-sm text-slate-400 whitespace-nowrap">Rows:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="border border-white/10 rounded-lg px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-sm bg-[#0E223B] text-white focus:outline-none focus:ring-2 focus:ring-[#8EE147]/20 focus:border-[#8EE147]"
                  >
                    {itemsPerPageOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
             <div className="flex items-center gap-2">
  <span className="text-[10px] sm:text-sm text-slate-400 whitespace-nowrap">
    {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
  </span>
  <Button 
    variant="outline" 
    size="sm" 
    disabled={currentPage === 1} 
    onClick={() => handlePageChange(currentPage - 1)}
    className="h-7 sm:h-8 md:h-9 px-2 sm:px-3 hover:bg-[#8EE147]/10 hover:border-[#8EE147]/30 transition-colors text-xs border border-white/20 bg-transparent text-white hover:text-[#8EE147] disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#8EE147]" />
  </Button>
  <Button 
    variant="outline" 
    size="sm" 
    disabled={currentPage >= totalPages} 
    onClick={() => handlePageChange(currentPage + 1)}
    className="h-7 sm:h-8 md:h-9 px-2 sm:px-3 hover:bg-[#8EE147]/10 hover:border-[#8EE147]/30 transition-colors text-xs border border-white/20 bg-transparent text-white hover:text-[#8EE147] disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#8EE147]" />
  </Button>
</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Dark Theme */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-xs text-slate-500 px-2 gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 justify-center sm:justify-start">
            <span>Total logs: {totalCount}</span>
            <span className="hidden xs:inline w-px h-4 bg-white/10"></span>
            <span className="text-center">Last updated: {new Date().toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#8EE147] animate-pulse"></div>
            <span className="text-slate-400">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserindetailPage;