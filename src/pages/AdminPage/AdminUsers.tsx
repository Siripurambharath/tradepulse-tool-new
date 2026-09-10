import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, RefreshCw, User, Mail, Users, 
  RefreshCw as RefreshIcon, 
  CheckCircle2, XCircle, UserCircle, Crown, Briefcase,
  TrendingUp, Award, Zap, Sparkles,
  ChevronLeft, ChevronRight, Loader2, Filter
} from 'lucide-react';
import { API_URL } from "@/components/api";

interface User {
  user_id: number;
  id: string;
  email: string;
  role: string;
  email_sent: number;
  email_config: number;
  name: string;
  phone: string;
  phone_number: string;
  package_id: string;
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

const Adminusers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [itemsPerPageOptions] = useState([10, 20, 50, 100]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cache for search results
  const searchCache = useRef<Map<string, any>>(new Map());

  // Fetch all users (initial load)
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/users?page=${currentPage}&limit=${itemsPerPage}`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data || []);
        setTotalCount(data.total || 0);
        setTotalPages(data.totalPages || 0);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error fetching users');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  // Search users (when search query changes)
  const searchUsers = useCallback(async () => {
    try {
      setIsSearching(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.set('search', debouncedSearchQuery);
      params.set('page', String(currentPage));
      params.set('limit', String(itemsPerPage));

      // Generate cache key
      const cacheKey = `${debouncedSearchQuery}-${currentPage}-${itemsPerPage}`;
      
      // Check cache first
      if (searchCache.current.has(cacheKey)) {
        const cachedData = searchCache.current.get(cacheKey);
        setUsers(cachedData.users || []);
        setTotalCount(cachedData.total || 0);
        setTotalPages(cachedData.totalPages || 0);
        setIsSearching(false);
        return;
      }

      const response = await fetch(`${API_URL}/users/search?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        const usersData = data.data || [];
        const total = data.total || 0;
        const pages = data.pagination?.totalPages || 0;
        
        setUsers(usersData);
        setTotalCount(total);
        setTotalPages(pages);
        
        // Store in cache
        searchCache.current.set(cacheKey, {
          users: usersData,
          total: total,
          totalPages: pages
        });
      } else {
        setError(data.message || 'Failed to search users');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Error searching users');
    } finally {
      setIsSearching(false);
    }
  }, [debouncedSearchQuery, currentPage, itemsPerPage]);

  // Initial load
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery) {
      searchUsers();
    } else {
      fetchUsers();
      searchCache.current.clear();
    }
  }, [debouncedSearchQuery, currentPage, itemsPerPage, fetchUsers, searchUsers]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    searchCache.current.clear();
  };

  // Handle items per page change
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
    searchCache.current.clear();
  };

  const handleEmailClick = (userId: string) => {
    navigate(`/admin/users/${userId}?tab=userDetails`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPage(1);
    setSearchQuery(e.target.value);
  };

  const getRoleBadge = (role: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode; glow: string }> = {
      'admin': { 
        color: 'bg-gradient-to-r from-rose-500/20 to-rose-500/10 text-rose-400 border-rose-500/30',
        icon: <Crown className="h-3 w-3" />,
        glow: 'shadow-rose-200/50'
      },
      'seller': { 
        color: 'bg-gradient-to-r from-indigo-500/20 to-indigo-500/10 text-indigo-400 border-indigo-500/30',
        icon: <Briefcase className="h-3 w-3" />,
        glow: 'shadow-indigo-200/50'
      },
      'user': { 
        color: 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 text-emerald-400 border-emerald-500/30',
        icon: <User className="h-3 w-3" />,
        glow: 'shadow-emerald-200/50'
      },
    };
    const { color, icon, glow } = config[role] || { 
      color: 'bg-gradient-to-r from-gray-500/20 to-gray-500/10 text-gray-400 border-gray-500/30',
      icon: <UserCircle className="h-3 w-3" />,
      glow: 'shadow-gray-200/50'
    };
    return (
      <Badge className={`${color} border font-medium hover:shadow-lg ${glow} transition-all duration-300 px-3 py-1.5 gap-1.5 rounded-full`}>
        {icon}
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: number, type: string) => {
    const isEnabled = status === 1;
    const label = type === 'sent' ? 'Email Sent' : 'Email Config';
    return (
      <Badge className={`${
        isEnabled 
          ? 'bg-[#8EE147]/20 text-[#8EE147] border-[#8EE147]/30' 
          : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
      } border font-medium px-3 py-1.5 gap-1.5 transition-all duration-300 rounded-full hover:shadow-lg`}>
        {isEnabled ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
        {label}
      </Badge>
    );
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <Card className="border border-white/10 shadow-lg hover:shadow-2xl transition-all duration-500 group cursor-default bg-[#0E223B]/80 backdrop-blur-sm">
      <CardContent className="pt-3 sm:pt-4 md:pt-6 pb-3 sm:pb-4 md:pb-6">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <div className={`p-2 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight">{value}</p>
            <p className="text-[9px] sm:text-[10px] md:text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Show full page loader only on initial load
  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0E223B' }}>
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-xl opacity-20 animate-pulse" style={{ background: 'linear-gradient(to right, #8EE147, #6EC035)' }} />
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 mx-auto relative" style={{ borderColor: '#8EE14720', borderTopColor: '#8EE147' }} />
          </div>
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm font-medium animate-pulse" style={{ color: '#94A3B8' }}>
            Loading users...
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
          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative flex-shrink-0">
                <div className="p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#8EE147] to-[#6EC035] shadow-xl shadow-[#8EE147]/30">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-[#0E223B]" />
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-[#8EE147] rounded-full ring-2 ring-[#0E223B] animate-pulse"></div>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#8EE147] to-[#6EC035] bg-clip-text text-transparent tracking-tight truncate">
                  Users
                </h1>
                <p className="text-[10px] sm:text-xs md:text-sm text-slate-400 mt-0.5 flex items-center gap-1 sm:gap-2 truncate">
                  <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#8EE147] flex-shrink-0" />
                  <span className="hidden xs:inline">Manage and monitor all registered users</span>
                  <span className="xs:hidden">Manage users</span>
                </p>
              </div>
            </div>
          </div>
          
          {/* Reload Button */}
          <div className="hidden sm:block w-full sm:w-auto">
            <Button 
              onClick={() => {
                searchCache.current.clear();
                setSearchQuery('');
                fetchUsers();
              }} 
              disabled={loading || isSearching} 
              variant="default"
              className="gap-1.5 sm:gap-2 w-full sm:w-auto bg-gradient-to-r from-[#8EE147] to-[#6EC035] hover:from-[#7DD13A] hover:to-[#5AA82E] text-[#0E223B] transition-all duration-300 shadow-lg shadow-[#8EE147]/30 hover:shadow-xl text-xs sm:text-sm h-8 sm:h-9 md:h-10 px-3 sm:px-4"
            >
              <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${loading || isSearching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards - Dark Theme */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          <StatCard 
            icon={Users} 
            label="Total Users" 
            value={totalCount} 
            color="from-[#8EE147] to-[#6EC035]"
          />
          <StatCard 
            icon={Mail} 
            label="Email Sent" 
            value={users.filter(u => u.email_sent === 1).length} 
            color="from-[#8EE147] to-[#6EC035]"
          />
          <StatCard 
            icon={RefreshIcon} 
            label="Email Configured" 
            value={users.filter(u => u.email_config === 1).length} 
            color="from-[#8EE147] to-[#6EC035]"
          />
        </div>

        {/* Search Bar - Dark Theme */}
        <Card className="border border-white/10 shadow-lg bg-[#0E223B]/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500">
          <CardContent className="pt-4 sm:pt-5 md:pt-6 pb-4 sm:pb-5 md:pb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              <div className="relative flex-1 min-w-[150px]">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#8EE147]" />
                <Input
                  placeholder="Search by user ID or email..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-8 sm:pl-11 border-white/10 focus:border-[#8EE147] focus:ring-2 focus:ring-[#8EE147]/20 transition-all duration-300 h-9 sm:h-10 md:h-11 rounded-lg sm:rounded-xl bg-white/5 text-white placeholder:text-slate-500 text-xs sm:text-sm"
                />
                {searchQuery && (
                  <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                    {isSearching ? (
                      <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-[#8EE147]" />
                    ) : (
                      <span className="text-[10px] sm:text-xs text-[#8EE147] font-medium">✓</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] sm:text-sm text-slate-400 flex-shrink-0">
                <span>{isSearching ? 'Searching...' : `${users.length} users found`}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm">
            {error}
          </div>
        )}

      {/* Results count and pagination info */}
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
    <span className="text-[10px] sm:text-sm text-slate-400">
      Showing <span className="font-semibold text-white">{users.length}</span> of{' '}
      <span className="font-semibold text-white">{totalCount}</span> users
    </span>
    {isSearching && (
      <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-amber-500/10 text-amber-400 rounded-full text-[8px] sm:text-xs font-medium border border-amber-500/30">
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
  <div className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 bg-white/5 rounded-lg border border-white/10 text-[10px] sm:text-sm font-medium text-white shadow-sm">
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

        {/* Users Table - Dark Theme */}
        <Card className="border border-white/10 shadow-lg bg-[#0E223B]/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
          <CardContent className="pt-0 p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-[#8EE147]/10 to-[#6EC035]/10 border-b border-white/10">
                    <th className="p-2 sm:p-3 md:p-4 text-left font-semibold text-slate-300 text-[10px] sm:text-xs uppercase tracking-wider">#</th>
                    <th className="p-2 sm:p-3 md:p-4 text-left font-semibold text-slate-300 text-[10px] sm:text-xs uppercase tracking-wider">User ID</th>
                    <th className="p-2 sm:p-3 md:p-4 text-left font-semibold text-slate-300 text-[10px] sm:text-xs uppercase tracking-wider">Name</th>
                    <th className="p-2 sm:p-3 md:p-4 text-left font-semibold text-slate-300 text-[10px] sm:text-xs uppercase tracking-wider">Email</th>
                    <th className="p-2 sm:p-3 md:p-4 text-left font-semibold text-slate-300 text-[10px] sm:text-xs uppercase tracking-wider">Phone</th>
                    <th className="p-2 sm:p-3 md:p-4 text-center font-semibold text-slate-300 text-[10px] sm:text-xs uppercase tracking-wider">Email Sent</th>
                    <th className="p-2 sm:p-3 md:p-4 text-center font-semibold text-slate-300 text-[10px] sm:text-xs uppercase tracking-wider">Email Config</th>
                  </tr>
                </thead>
                <tbody>
                  {isSearching ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 sm:py-16 md:py-20">
                        <div className="flex flex-col items-center gap-3 sm:gap-4">
                          <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-[#8EE147]" />
                          <p className="text-xs sm:text-sm text-slate-400 font-medium">Searching users...</p>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 sm:py-16 md:py-20">
                        <div className="flex flex-col items-center gap-3 sm:gap-4">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                            <Users className="h-8 w-8 sm:h-10 sm:w-10 text-slate-500" />
                          </div>
                          <div>
                            <p className="text-sm sm:text-base text-slate-300 font-medium">No users found</p>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                              {searchQuery ? 'Try adjusting your search terms' : 'No users registered yet'}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user, index) => {
                      const isHovered = hoveredRow === user.user_id;
                      return (
                        <tr 
                          key={user.user_id} 
                          className="border-b last:border-b-0 border-white/5 hover:bg-[#8EE147]/5 transition-all duration-300 group"
                          onMouseEnter={() => setHoveredRow(user.user_id)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          <td className="p-2 sm:p-3 md:p-4 font-medium text-slate-500 text-xs sm:text-sm">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="p-2 sm:p-3 md:p-4">
                            <div className="flex items-center gap-1.5 sm:gap-3">
                              <div className="relative flex-shrink-0">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-[#8EE147]/20 to-[#6EC035]/20 flex items-center justify-center ring-2 ring-[#8EE147]/10 shadow-md group-hover:ring-[#8EE147]/30 transition-all duration-300 border border-[#8EE147]/20">
                                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-[#8EE147]" />
                                </div>
                              </div>
                              <span className="font-mono text-xs sm:text-sm text-slate-300 font-medium truncate max-w-[40px] sm:max-w-[80px] md:max-w-[120px]">
                                {user.id}
                              </span>
                            </div>
                          </td>
                          <td className="p-2 sm:p-3 md:p-4">
                            <span className="font-medium text-white text-xs sm:text-sm truncate block max-w-[50px] sm:max-w-[120px] md:max-w-[180px]">
                              {user.name || <span className="text-slate-500 italic text-xs">N/A</span>}
                            </span>
                          </td>
                          <td className="p-2 sm:p-3 md:p-4">
                            <button
                              onClick={() => handleEmailClick(user.id)}
                              className="text-[#8EE147] hover:text-[#6EC035] transition-all duration-200 flex items-center gap-1 sm:gap-2 group/email"
                            >
                              <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 group-hover/email:scale-110 transition-transform duration-200 flex-shrink-0" />
                              <span className="hover:underline underline-offset-2 font-medium text-xs sm:text-sm truncate max-w-[50px] sm:max-w-[120px] md:max-w-[180px]">
                                {user.email}
                              </span>
                            </button>
                          </td>
                          <td className="p-2 sm:p-3 md:p-4">
                            <span className="font-medium text-slate-300 text-xs sm:text-sm">
                              {user.phone_number || <span className="text-slate-500 italic text-xs">N/A</span>}
                            </span>
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 text-center">
                            <div className="scale-90 sm:scale-100 origin-center">
                              {getStatusBadge(user.email_sent, 'sent')}
                            </div>
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 text-center">
                            <div className="scale-90 sm:scale-100 origin-center">
                              {getStatusBadge(user.email_config, 'config')}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

         {/* Pagination Controls - Dark Theme */}
{users.length > 0 && (
  <div className="border-t border-white/10 bg-gradient-to-r from-[#8EE147]/5 to-[#6EC035]/5 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-start">
        <span className="text-xs sm:text-sm text-slate-400">Rows:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
          className="border border-white/10 rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-sm bg-[#0E223B] text-white focus:outline-none focus:ring-2 focus:ring-[#8EE147]/20 focus:border-[#8EE147]"
        >
          {itemsPerPageOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
  <div className="flex items-center gap-2">
  <span className="text-xs sm:text-sm text-slate-400">
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
          </CardContent>
        </Card>

        {/* Footer Stats - Dark Theme */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-xs text-slate-500 px-2 gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 justify-center sm:justify-start">
            <span>Showing {users.length} users</span>
            <span className="hidden xs:inline w-px h-4 bg-white/10"></span>
            <span className="text-center">Updated: {new Date().toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#8EE147]" />
            <span className="text-slate-400">Premium Dashboard</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Adminusers;