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
      // If search is cleared, fetch all users
      fetchUsers();
      // Clear cache when search is cleared
      searchCache.current.clear();
    }
  }, [debouncedSearchQuery, currentPage, itemsPerPage, fetchUsers, searchUsers]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Clear cache when page changes
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
    setCurrentPage(1); // Reset to first page on search
    setSearchQuery(e.target.value);
  };

  const getRoleBadge = (role: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode; glow: string }> = {
      'admin': { 
        color: 'bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 border-rose-200',
        icon: <Crown className="h-3 w-3" />,
        glow: 'shadow-rose-200/50'
      },
      'seller': { 
        color: 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border-indigo-200',
        icon: <Briefcase className="h-3 w-3" />,
        glow: 'shadow-indigo-200/50'
      },
      'user': { 
        color: 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200',
        icon: <User className="h-3 w-3" />,
        glow: 'shadow-emerald-200/50'
      },
    };
    const { color, icon, glow } = config[role] || { 
      color: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200',
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
          ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200 shadow-emerald-200/30' 
          : 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-500 border-slate-200'
      } border font-medium px-3 py-1.5 gap-1.5 transition-all duration-300 rounded-full hover:shadow-lg`}>
        {isEnabled ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
        {label}
      </Badge>
    );
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group cursor-default bg-white/80 backdrop-blur-sm">
      <CardContent className="pt-6 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
            Loading users...
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
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-xl shadow-indigo-500/30">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent tracking-tight">
                  Users
                </h1>
                <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  Manage and monitor all registered users
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => {
                searchCache.current.clear();
                setSearchQuery('');
                fetchUsers();
              }} 
              disabled={loading || isSearching} 
              variant="default"
              className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-xl"
            >
              <RefreshCw className={`h-4 w-4 ${loading || isSearching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <StatCard 
            icon={Users} 
            label="Total Users" 
            value={totalCount} 
            color="from-blue-500 to-blue-600"
          />
          <StatCard 
            icon={Mail} 
            label="Email Sent" 
            value={users.filter(u => u.email_sent === 1).length} 
            color="from-purple-500 to-purple-600"
          />
          <StatCard 
            icon={RefreshIcon} 
            label="Email Configured" 
            value={users.filter(u => u.email_config === 1).length} 
            color="from-amber-500 to-amber-600"
          />
        </div>

        {/* Search Bar */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by user ID or email..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-11 border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all duration-300 h-11 rounded-xl bg-slate-50/50"
                />
                {/* Search indicator */}
                {searchQuery && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                    ) : (
                      <span className="text-xs text-emerald-500 font-medium">✓</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>{isSearching ? 'Searching...' : `${users.length} users found`}</span>
              </div>
            </div>
          </CardContent>
        </Card>

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
              Showing <span className="font-semibold text-slate-700">{users.length}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalCount}</span> users
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

        {/* Users Table */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
          <CardContent className="pt-0 p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50/80 to-indigo-50/80 border-b border-slate-200/60">
                    <th className="p-5 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">#</th>
                    <th className="p-5 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">User ID</th>
                    <th className="p-5 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Email</th>
                    <th className="p-5 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider">Email Sent</th>
                    <th className="p-5 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider">Email Config</th>
                  </tr>
                </thead>
                <tbody>
                  {isSearching ? (
                    <tr>
                      <td colSpan={6} className="text-center py-20">
                        <div className="flex flex-col items-center gap-4">
                          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                          <p className="text-slate-500 text-sm font-medium">Searching users...</p>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-20">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <Users className="h-10 w-10 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-slate-600 text-sm font-medium">No users found</p>
                            <p className="text-xs text-slate-400 mt-1">
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
                          className="border-b last:border-b-0 hover:bg-gradient-to-r hover:from-indigo-50/40 hover:to-transparent transition-all duration-300 group"
                          onMouseEnter={() => setHoveredRow(user.user_id)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          <td className="p-5 font-medium text-slate-400 text-xs">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center ring-2 ring-white shadow-md group-hover:ring-indigo-300 transition-all duration-300">
                                  <User className="h-4.5 w-4.5 text-indigo-600" />
                                </div>
                                {isHovered && (
                                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white animate-pulse"></div>
                                )}
                              </div>
                              <span className="font-mono text-xs text-slate-700 font-medium">{user.id}</span>
                            </div>
                          </td>
                          <td className="p-5">
                            <button
                              onClick={() => handleEmailClick(user.id)}
                              className="text-indigo-600 hover:text-indigo-800 transition-all duration-200 flex items-center gap-2 group/email"
                            >
                              <Mail className="h-4 w-4 group-hover/email:scale-110 transition-transform duration-200" />
                              <span className="hover:underline underline-offset-2 font-medium">{user.email}</span>
                              <span className="text-[10px] text-slate-400 opacity-0 group-hover/email:opacity-100 transition-all duration-200 ml-1">
                                →
                              </span>
                            </button>
                          </td>
               
                          <td className="p-5 text-center">{getStatusBadge(user.email_sent, 'sent')}</td>
                          <td className="p-5 text-center">{getStatusBadge(user.email_config, 'config')}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {users.length > 0 && (
              <div className="border-t border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-indigo-50/30 px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-600">Rows per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400"
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
          </CardContent>
        </Card>

        {/* Footer Stats */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-2 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span>Showing {users.length} users</span>
            <span className="w-px h-4 bg-slate-200"></span>
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-indigo-400" />
            <span>Premium Dashboard</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Adminusers;