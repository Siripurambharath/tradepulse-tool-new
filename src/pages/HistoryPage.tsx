import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Clock, Users, TrendingUp, Calendar, Filter, ChevronRight, Eye, MessageSquare, Loader2, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { API_URL, ACTIVITY_URL } from '@/components/api';

// Activity Log Helper Functions
const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown Browser';
};

const getIPAddress = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP:', error);
    return '127.0.0.1';
  }
};

const createActivityLog = async (actionId: number, moduleId: number, description: string, additionalData?: any) => {
  try {
    const seller = JSON.parse(localStorage.getItem("seller") || "{}");
    const ipAddress = await getIPAddress();
    const device = getDeviceInfo();

    const logData = {
      userId: seller.id || 1,
      userName: seller.name || seller.email || 'Unknown',
      role: seller.role || 'seller',
      action_id: actionId,
      module_id: moduleId,
      description: description,
      ipAddress,
      device,
      status: 'SUCCESS',
      ...additionalData
    };

    const response = await fetch(`${ACTIVITY_URL}/api/activity-log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    });

    const result = await response.json();
    if (!result.success) {
      console.error('Failed to create activity log:', result.message);
    }
    return result;
  } catch (error) {
    console.error('Error creating activity log:', error);
    return null;
  }
};

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

interface StatsData {
  totalEntries: number;
  totalCompanies: number;
  totalReplied: number;
  totalInterested: number;
  totalNotInterested: number;
  responseRate: number;
  interestedRate: number;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [productFilter, setProductFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [stats, setStats] = useState<StatsData>({
    totalEntries: 0,
    totalCompanies: 0,
    totalReplied: 0,
    totalInterested: 0,
    totalNotInterested: 0,
    responseRate: 0,
    interestedRate: 0
  });
  const [products, setProducts] = useState<any[]>([]);
  const navigate = useNavigate();
  const perPage = 10;
  
  // Ref for debounce
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const seller = JSON.parse(
    localStorage.getItem("seller") || "{}"
  );
  const sellerId = seller.id;

  // ✅ Function to log search with debounce
  const logSearch = (searchValue: string) => {
    if (!searchValue || searchValue.length < 2) return;
    
    let actionId = 44; // Default: Product search
    let searchType = 'Product';
    
    createActivityLog(actionId, 11, `Searched by ${searchType}: ${searchValue}`, {
      searchType: searchType,
      searchValue: searchValue
    });
  };

  // ✅ Handle search with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setPage(0);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (value && value.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        logSearch(value);
      }, 500);
    }
  };

  // ✅ Handle search on Enter key
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (query && query.length >= 2) {
        logSearch(query);
      }
    }
  };

  // ✅ Handle product filter change with activity log
  const handleProductFilterChange = (value: string) => {
    setPage(0);
    setProductFilter(value);
    
    // Action 47: Search TableDropdown Products
    if (value !== 'all') {
      createActivityLog(47, 11, `Selected product filter: ${value}`, {
        filterType: 'product',
        selectedValue: value
      });
    } else {
      createActivityLog(47, 11, 'Cleared product filter', {
        filterType: 'product',
        selectedValue: 'all'
      });
    }
  };

  // Load products for dropdown
  useEffect(() => {
    if (sellerId) {
      loadProducts();
    }
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [sellerId]);

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/history/products?seller_id=${sellerId}`);
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch(`${API_URL}/history/stats?seller_id=${sellerId}`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch history with pagination
  const fetchHistory = useCallback(async () => {
    try {
      const isInitialLoad = page === 0 && !debouncedQuery && productFilter === 'all';
      if (isInitialLoad) {
        setIsLoading(true);
      }
      
      const params = new URLSearchParams();
      params.set('seller_id', sellerId);
      params.set('page', String(page + 1));
      params.set('limit', String(perPage));
      if (debouncedQuery) params.set('search', debouncedQuery);
      if (productFilter !== 'all') params.set('product', productFilter);
      
      const response = await fetch(`${API_URL}/history?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setHistory(data.data || []);
        setTotalCount(data.total || 0);
        setPagination(data.pagination || null);
      }
      
      // Log activity
      if (isInitialLoad) {
        createActivityLog(37, 11, 'Viewed history page');
      }
      
      // Note: Search logging is now handled by handleSearchChange with debounce
      // Filter logging is handled by handleProductFilterChange
      
    } catch (err) {
      console.error("History API Error:", err);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, productFilter, page, perPage, sellerId]);

  useEffect(() => {
    if (sellerId) {
      fetchStats();
      fetchHistory();
    }
  }, [sellerId]);

  // Refetch when filters change
  useEffect(() => {
    if (sellerId) {
      fetchHistory();
    }
  }, [page, debouncedQuery, productFilter, fetchHistory, sellerId]);

  const handleCardClick = (entry: any) => {
    createActivityLog(36, 11, `Navigated to history detail for: ${entry.product}`, {
      history_id: entry.id,
      product: entry.product,
      companies_count: entry.companies?.length || 0,
      date: entry.date
    });
    navigate(`/history/${entry.id}`);
  };

  const totalPages = pagination?.totalPages || Math.ceil(totalCount / perPage) || 1;

  // Only show full page loading on initial load
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-6 md:p-8 border border-primary/10">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                History
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                Track your past activities and interactions
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-background/50 rounded-full backdrop-blur-sm">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Show skeleton while loading */}
      {statsLoading ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-3 sm:p-4 md:p-6 border-0 shadow-sm animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-2 w-14 sm:h-3 sm:w-20 bg-gray-200 rounded"></div>
                  <div className="h-6 w-10 sm:h-7 sm:w-12 bg-gray-200 rounded mt-1 sm:mt-2"></div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-200 rounded-xl"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
          <Card className="p-3 sm:p-4 md:p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-medium">Total History</p>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold mt-0.5 sm:mt-1">{stats.totalEntries}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4 md:p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-medium">Companies</p>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold mt-0.5 sm:mt-1">{stats.totalCompanies}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4 md:p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-medium">Replied</p>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold mt-0.5 sm:mt-1">{stats.totalReplied}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-emerald-500" />
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4 md:p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-medium">Response Rate</p>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold mt-0.5 sm:mt-1">{stats.responseRate}%</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-500" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1 min-w-[150px] sm:min-w-[200px]">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          <Input
            placeholder="Search by product..."
            value={query}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            className="pl-8 sm:pl-10 bg-card border-muted-foreground/20 focus:border-primary/50 transition-colors text-sm sm:text-base h-9 sm:h-10"
          />
        </div>

        <Select value={productFilter} onValueChange={handleProductFilterChange}>
          <SelectTrigger className="w-full sm:w-48 bg-card border-muted-foreground/20 focus:border-primary/50 transition-colors h-9 sm:h-10 text-sm sm:text-base">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <SelectValue placeholder="All Products" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">📦 All Products</SelectItem>
            {products.map((p: any) => (
              <SelectItem key={p.product} value={p.product}>
                {p.product}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count and pagination info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{history.length}</span> of{' '}
            <span className="font-semibold text-foreground">{totalCount}</span> entries
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page === 0} 
            onClick={() => setPage((p) => p - 1)}
            className="hover:bg-primary/10 transition-colors h-8 sm:h-9 px-2.5 sm:px-3"
          >
            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          <div className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 bg-card rounded-lg border text-xs sm:text-sm font-medium shadow-sm">
            Page <span className="text-primary">{page + 1}</span> / {totalPages || 1}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page + 1 >= totalPages} 
            onClick={() => setPage((p) => p + 1)}
            className="hover:bg-primary/10 transition-colors h-8 sm:h-9 px-2.5 sm:px-3"
          >
            <ChevronRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      {/* List */}
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-muted/20 flex items-center justify-center mb-3 sm:mb-4">
            <Search className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">No history found</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm px-4">
            {query || productFilter !== 'all' 
              ? "Try adjusting your filters or search terms"
              : "Your history will appear here once you start interacting with companies"}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {history.map((entry, index) => {
            const date = new Date(entry.date);
            const companies = entry.companies || [];
            const replied = companies.filter((c: any) => c.status === 'Replied').length;
            const opened = companies.filter((c: any) => c.status === 'Opened' || c.status === 'Replied').length;
            const responseRate = companies.length > 0 ? Math.round((replied / companies.length) * 100) : 0;

            return (
              <div
                key={entry.id}
                className="group relative overflow-hidden rounded-xl bg-card border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] cursor-pointer"
                onClick={() => handleCardClick(entry)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative p-3 sm:p-4 md:p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0 w-full sm:w-auto">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-300">
                        <TrendingUp className="h-5 w-5 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 text-primary" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <h3 className="font-semibold text-foreground text-sm sm:text-base md:text-lg truncate max-w-[180px] sm:max-w-[280px] md:max-w-none">
                            {entry.product}
                          </h3>
                          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground bg-muted/30 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                            <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            <span>{date.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">
                          <span className="flex items-center gap-0.5 sm:gap-1">
                            <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            {companies.length} companies
                          </span>
                          {opened > 0 && (
                            <span className="flex items-center gap-0.5 sm:gap-1">
                              <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              {opened} opened
                            </span>
                          )}
                          {replied > 0 && (
                            <span className="flex items-center gap-0.5 sm:gap-1">
                              <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              {replied} replied
                            </span>
                          )}
                          {companies.length > 0 && (
                            <span className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 bg-muted/30 rounded-full">
                              <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              {responseRate}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 ml-auto flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                      {companies.length > 0 && (
                        <div className="flex sm:hidden flex-col items-end gap-0.5 flex-1 max-w-[100px]">
                          <div className="w-full h-1 bg-muted/30 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-1000"
                              style={{ width: `${responseRate}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {responseRate}% response
                          </span>
                        </div>
                      )}
                      
                      {companies.length > 0 && (
                        <div className="hidden sm:flex flex-col items-end gap-1 min-w-[70px] md:min-w-[80px]">
                          <div className="w-16 sm:w-20 md:w-24 h-1 sm:h-1.5 bg-muted/30 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-1000"
                              style={{ width: `${responseRate}%` }}
                            />
                          </div>
                          <span className="text-[10px] sm:text-xs text-muted-foreground">
                            Response rate
                          </span>
                        </div>
                      )}
                      
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted/20 flex items-center justify-center group-hover:bg-primary/10 transition-colors flex-shrink-0">
                        <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom pagination */}
      {history.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
          <div className="text-xs sm:text-sm text-muted-foreground">
            Showing {page * perPage + 1} - {Math.min((page + 1) * perPage, totalCount)} of {totalCount} entries
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === 0} 
              onClick={() => setPage((p) => p - 1)}
              className="hover:bg-primary/10 transition-colors h-8 sm:h-9 px-2.5 sm:px-3"
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <div className="px-2 sm:px-3 py-1 bg-card rounded-lg border text-xs sm:text-sm font-medium">
              {page + 1} / {totalPages || 1}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page + 1 >= totalPages} 
              onClick={() => setPage((p) => p + 1)}
              className="hover:bg-primary/10 transition-colors h-8 sm:h-9 px-2.5 sm:px-3"
            >
              <ChevronRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}