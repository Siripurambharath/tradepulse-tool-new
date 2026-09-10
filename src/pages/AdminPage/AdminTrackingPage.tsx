import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, Eye, Send, Reply, ThumbsUp, ThumbsDown, 
  AlertCircle, MessageSquare, Users,
  Mail, Activity, BarChart3, Filter, ArrowUpRight,
  Building2, Package, Globe, RefreshCw, ArrowLeft, User,
  ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '@/components/api';

interface TrackingItem {
  buyer_id: number;
  company_name: string;
  country: string;
  contact_name: string;
  email: string;
  template_used?: string;
  product_name: string;
  interaction_count: number;
  last_interaction: string;
  type: string;
  current_status: string;
  subject?: string;
  message?: string;
  reply_date?: string;
  responded_at?: string;
  response?: string;
}

interface TrackingData {
  sent: TrackingItem[];
  replied: TrackingItem[];
  interested: TrackingItem[];
  not_interested: TrackingItem[];
}

interface Counts {
  sent: number;
  replied: number;
  interested: number;
  not_interested: number;
  not_contacted: number;
  total_companies: number;
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

export default function AdminTrackingPage() {
  const navigate = useNavigate();
  const { sellerId } = useParams<{ sellerId: string }>();
  
  // State
  const [activeTab, setActiveTab] = useState('sent');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState('all');
  const [trackingData, setTrackingData] = useState<TrackingData>({
    sent: [],
    replied: [],
    interested: [],
    not_interested: []
  });
  const [counts, setCounts] = useState<Counts>({
    sent: 0,
    replied: 0,
    interested: 0,
    not_interested: 0,
    not_contacted: 0,
    total_companies: 0
  });
  const [sellerEmail, setSellerEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [itemsPerPageOptions] = useState([10, 20, 50, 100]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pagination, setPagination] = useState<any>(null);

  // Cache for search results
  const searchCache = useRef<Map<string, any>>(new Map());

  const statuses = ['sent', 'interested', 'not_contacted'];
  
  useEffect(() => {
    if (!sellerId) {
      setError('No seller ID provided');
      setLoading(false);
      return;
    }
    
    // Get seller email from localStorage or fetch from API
    const getSellerEmail = () => {
      try {
        const sellerStr = localStorage.getItem('seller');
        if (sellerStr) {
          const seller = JSON.parse(sellerStr);
          if (seller.id && String(seller.id) === sellerId) {
            setSellerEmail(seller.email || '');
            return;
          }
        }
        setSellerEmail(`Seller ${sellerId}`);
      } catch (error) {
        console.error('Error getting seller email:', error);
        setSellerEmail(`Seller ${sellerId}`);
      }
    };

    getSellerEmail();
    fetchCounts();
    fetchTrackingData();
  }, [sellerId]);

  // Fetch counts only
  const fetchCounts = async () => {
    try {
      if (!sellerId) return;

      const response = await axios.get(`${API_URL}/api/tracking/counts?seller_id=${sellerId}`);
      if (response.data.success) {
        setCounts({
          sent: response.data.data.sent,
          replied: response.data.data.replied,
          interested: response.data.data.interested,
          not_interested: response.data.data.not_interested,
          not_contacted: response.data.data.not_contacted || 0,
          total_companies: response.data.total.all
        });
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  // Fetch tracking data with pagination
  const fetchTrackingData = useCallback(async (isSearch = false) => {
    try {
      if (isSearch) {
        setIsSearching(true);
      } else {
        setLoading(true);
      }
      setError(null);

      if (!sellerId) {
        setError('No seller ID available');
        setLoading(false);
        return;
      }

      // Build query params
      const params = new URLSearchParams();
      params.set('seller_id', sellerId);
      params.set('page', String(currentPage));
      params.set('limit', String(itemsPerPage));
      
      // Add search if present
      if (debouncedSearchQuery) {
        params.set('search', debouncedSearchQuery);
      }

      // Generate cache key
      const cacheKey = `${sellerId}-${debouncedSearchQuery}-${currentPage}-${itemsPerPage}`;
      
      // Check cache first
      if (searchCache.current.has(cacheKey)) {
        const cachedData = searchCache.current.get(cacheKey);
        setTrackingData(cachedData.trackingData || { sent: [], replied: [], interested: [], not_interested: [] });
        setTotalCount(cachedData.totalCount || 0);
        setTotalPages(cachedData.totalPages || 0);
        setPagination(cachedData.pagination || null);
        if (isSearch) setIsSearching(false);
        else setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/api/tracking/page?${params.toString()}`);
      
      if (response.data.success) {
        const data = response.data.data;
        const paginationData = response.data.pagination;
        
        setTrackingData(data);
        setTotalCount(paginationData?.totalItems || 0);
        setTotalPages(paginationData?.totalPages || 0);
        setPagination(paginationData || null);
        
        // Store in cache
        searchCache.current.set(cacheKey, {
          trackingData: data,
          totalCount: paginationData?.totalItems || 0,
          totalPages: paginationData?.totalPages || 0,
          pagination: paginationData || null
        });
        
        console.log('Tracking data for seller', sellerId, ':', data);
      } else {
        setError('Failed to load tracking data');
      }
    } catch (error: any) {
      console.error('Error fetching tracking data:', error);
      setError(error.message || 'Error loading tracking data');
    } finally {
      if (isSearch) setIsSearching(false);
      else setLoading(false);
    }
  }, [sellerId, currentPage, itemsPerPage, debouncedSearchQuery]);

  // Initial load
  useEffect(() => {
    fetchTrackingData(false);
  }, []);

  // Handle search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery) {
      fetchTrackingData(true);
    } else {
      // If search is cleared, fetch all data
      fetchTrackingData(false);
      // Clear cache when search is cleared
      searchCache.current.clear();
    }
  }, [debouncedSearchQuery, currentPage, itemsPerPage, fetchTrackingData]);

  const getCurrentData = () => {
    switch (activeTab) {
      case 'sent':
        return trackingData.sent || [];
      case 'replied':
        return trackingData.replied || [];
      case 'interested':
        return trackingData.interested || [];
      case 'not_interested':
        return trackingData.not_interested || [];
      default:
        return [];
    }
  };

  const filteredData = useMemo(() => {
    let allData = getCurrentData();
    
    let filtered = allData;
    
    // Search filter (already handled by backend, but keep for client-side filtering)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        return item.company_name?.toLowerCase().includes(query) ||
               item.country?.toLowerCase().includes(query) ||
               item.product_name?.toLowerCase().includes(query);
      });
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => {
        return item.current_status === statusFilter;
      });
    }
    
    return filtered;
  }, [searchQuery, statusFilter, activeTab, trackingData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-[#8EE147]/20 text-[#0E223B] border border-[#8EE147]/30 text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1">
          <Send className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" style={{ color: '#8EE147' }} />
          Sent
        </Badge>;
      case 'replied':
        return <Badge className="bg-[#8EE147]/20 text-[#0E223B] border border-[#8EE147]/30 text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1">
          <Reply className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" style={{ color: '#8EE147' }} />
          Replied
        </Badge>;
      case 'interested':
        return <Badge className="bg-[#8EE147]/20 text-[#0E223B] border border-[#8EE147]/30 text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1">
          <ThumbsUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" style={{ color: '#8EE147' }} />
          Interested
        </Badge>;
      case 'not_interested':
        return <Badge className="bg-red-500/20 text-red-700 border border-red-500/30 text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1">
          <ThumbsDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
          Not Interested
        </Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1">{status || 'Unknown'}</Badge>;
    }
  };

  const viewDetails = (item: TrackingItem) => {
    navigate(`/admin/trackingindetail/${sellerId}/${item.buyer_id}`);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleCardClick = (tab: string) => {
    setActiveTab(tab);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/admin/sellers", { replace: true });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPage(1);
    setSearchQuery(e.target.value);
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
            Loading tracking data for seller {sellerId}...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen" style={{ backgroundColor: '#0E223B' }}>
        <div className="w-full px-4 sm:px-6 py-6 flex items-center justify-center min-h-screen">
          <div className="bg-[#0E223B] rounded-2xl shadow-xl border border-white/10 p-6 sm:p-8 max-w-md w-full text-center">
            <div className="p-3 sm:p-4 bg-red-500/10 rounded-full w-fit mx-auto mb-3 sm:mb-4">
              <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Error Loading Data</h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-4 sm:mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <Button onClick={() => fetchTrackingData(false)} className="gap-1.5 sm:gap-2 bg-[#8EE147] text-[#0E223B] hover:bg-[#6EC035] text-xs sm:text-sm h-8 sm:h-9">
                <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Try Again
              </Button>
              <Button onClick={() => navigate("/search")} className="text-xs sm:text-sm h-8 sm:h-9 border-white/20 text-white hover:bg-white/10">
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-3 sm:p-4 md:p-6" style={{ backgroundColor: '#0E223B' }}>
      {/* Decorative gradient header */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8EE147] via-[#6EC035] to-[#5AA82E]" />
      
      <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-5 md:space-y-6">
        {/* Header with Back Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2 flex-wrap">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="gap-1.5 sm:gap-2 hover:bg-[#8EE147]/10 hover:text-[#8EE147] h-7 sm:h-8 md:h-9 text-xs sm:text-sm px-2 sm:px-3 text-slate-300"
              >
                <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden xs:inline">Back</span>
              </Button>
              <div className="p-1.5 sm:p-2 md:p-2.5 bg-gradient-to-r from-[#8EE147] to-[#6EC035] rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#0E223B]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#8EE147] to-[#6EC035] bg-clip-text text-transparent truncate">
                  Email Tracking Dashboard
                </h1>
                <p className="text-[10px] sm:text-xs md:text-sm flex items-center gap-1 sm:gap-2 mt-0.5 flex-wrap" style={{ color: '#94A3B8' }}>
                  <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#8EE147]" />
                  Seller: <span className="font-medium text-white truncate max-w-[120px] sm:max-w-[200px]">{sellerEmail}</span>
                  <span className="text-[8px] sm:text-[10px] text-slate-500">(ID: {sellerId})</span>
                </p>
              </div>
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <Button 
              onClick={() => {
                searchCache.current.clear();
                setSearchQuery('');
                fetchTrackingData(false);
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

        {/* Summary Cards - Dark Theme */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 mb-3 sm:mb-4 md:mb-6">
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 bg-gradient-to-br from-[#0E223B] to-[#1A3355] shadow-lg border border-white/10"
            onClick={() => handleCardClick('sent')}
          >
            <CardContent className="pt-2 sm:pt-3 md:pt-4 pb-2 sm:pb-3 md:pb-4">
              <div className="text-center">
                <div className="p-1 sm:p-1.5 md:p-2 bg-[#8EE147]/10 rounded-lg sm:rounded-xl shadow-sm w-fit mx-auto mb-1 sm:mb-1.5 md:mb-2 border border-[#8EE147]/20">
                  <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5 text-[#8EE147]" />
                </div>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white">{counts.sent}</p>
                <p className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-xs font-medium text-[#8EE147]/70 uppercase tracking-wider mt-0.5">Sent</p>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 bg-gradient-to-br from-[#0E223B] to-[#1A3355] shadow-lg border border-white/10"
            onClick={() => handleCardClick('replied')}
          >
            <CardContent className="pt-2 sm:pt-3 md:pt-4 pb-2 sm:pb-3 md:pb-4">
              <div className="text-center">
                <div className="p-1 sm:p-1.5 md:p-2 bg-[#8EE147]/10 rounded-lg sm:rounded-xl shadow-sm w-fit mx-auto mb-1 sm:mb-1.5 md:mb-2 border border-[#8EE147]/20">
                  <Reply className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5 text-[#8EE147]" />
                </div>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white">{counts.replied}</p>
                <p className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-xs font-medium text-[#8EE147]/70 uppercase tracking-wider mt-0.5">Replied</p>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 bg-gradient-to-br from-[#0E223B] to-[#1A3355] shadow-lg border border-white/10"
            onClick={() => handleCardClick('interested')}
          >
            <CardContent className="pt-2 sm:pt-3 md:pt-4 pb-2 sm:pb-3 md:pb-4">
              <div className="text-center">
                <div className="p-1 sm:p-1.5 md:p-2 bg-[#8EE147]/10 rounded-lg sm:rounded-xl shadow-sm w-fit mx-auto mb-1 sm:mb-1.5 md:mb-2 border border-[#8EE147]/20">
                  <ThumbsUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5 text-[#8EE147]" />
                </div>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white">{counts.interested}</p>
                <p className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-xs font-medium text-[#8EE147]/70 uppercase tracking-wider mt-0.5">Interested</p>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 bg-gradient-to-br from-[#0E223B] to-[#1A3355] shadow-lg border border-white/10"
            onClick={() => handleCardClick('not_interested')}
          >
            <CardContent className="pt-2 sm:pt-3 md:pt-4 pb-2 sm:pb-3 md:pb-4">
              <div className="text-center">
                <div className="p-1 sm:p-1.5 md:p-2 bg-red-500/10 rounded-lg sm:rounded-xl shadow-sm w-fit mx-auto mb-1 sm:mb-1.5 md:mb-2 border border-red-500/20">
                  <ThumbsDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5 text-red-400" />
                </div>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white">{counts.not_interested}</p>
                <p className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-xs font-medium text-red-400/70 uppercase tracking-wider mt-0.5">Not Interested</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar - Dark Theme */}
        <div className="bg-[#0E223B]/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/10 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
            <div className="relative flex-1 min-w-[150px]">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#8EE147]" />
              <Input
                placeholder="Search company, product or country..."
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] sm:w-48 border-white/10 focus:border-[#8EE147] rounded-lg sm:rounded-xl bg-white/5 text-white h-8 sm:h-9 md:h-10 text-xs sm:text-sm">
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-[#8EE147]" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#0E223B] border-white/10 text-white">
                  <SelectItem value="all" className="hover:bg-[#8EE147]/10 focus:bg-[#8EE147]/10">📊 All Statuses</SelectItem>
                  {statuses.map(s => (
                    <SelectItem key={s} value={s} className="hover:bg-[#8EE147]/10 focus:bg-[#8EE147]/10">
                      {s === 'sent' && '📤 Sent'}
                      {s === 'interested' && '👍 Interested'}
                      {s === 'not_contacted' && '📭 Not Contacted'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm text-slate-400">
              <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 bg-white/5 rounded-lg shadow-sm border border-white/10">
                <Activity className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#8EE147]" />
                Showing: <span className="font-semibold text-white">{filteredData.length}</span>
              </span>
              {isSearching && (
                <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-amber-500/10 text-amber-400 rounded-full text-[8px] sm:text-xs font-medium border border-amber-500/30">
                  <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin" />
                  Searching...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Results count and pagination info - Dark Theme */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-[10px] sm:text-sm text-slate-400">
              Showing <span className="font-semibold text-white">{filteredData.length}</span> of{' '}
              <span className="font-semibold text-white">{totalCount}</span> items
            </span>
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

        {/* Tabs - Dark Theme */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 bg-transparent p-0 mb-4 sm:mb-6 mb-10">
            <TabsTrigger 
              value="sent" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#8EE147] data-[state=active]:to-[#6EC035] data-[state=active]:text-[#0E223B] data-[state=active]:shadow-lg transition-all duration-300 rounded-lg sm:rounded-xl py-2 sm:py-2.5 md:py-3 gap-1 sm:gap-1.5 md:gap-2 bg-white/5 border border-white/10 text-[10px] sm:text-xs md:text-sm text-slate-400"
            >
              <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
              <span className="hidden xs:inline">Sent</span>
              <span className="xs:hidden">Sent</span>
              <Badge className="ml-0.5 sm:ml-1 bg-white/20 text-white border-0 text-[8px] sm:text-[10px]">{counts.sent}</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="replied" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#8EE147] data-[state=active]:to-[#6EC035] data-[state=active]:text-[#0E223B] data-[state=active]:shadow-lg transition-all duration-300 rounded-lg sm:rounded-xl py-2 sm:py-2.5 md:py-3 gap-1 sm:gap-1.5 md:gap-2 bg-white/5 border border-white/10 text-[10px] sm:text-xs md:text-sm text-slate-400"
            >
              <Reply className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
              <span className="hidden xs:inline">Replied</span>
              <span className="xs:hidden">Replied</span>
              <Badge className="ml-0.5 sm:ml-1 bg-white/20 text-white border-0 text-[8px] sm:text-[10px]">{counts.replied}</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="interested" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#8EE147] data-[state=active]:to-[#6EC035] data-[state=active]:text-[#0E223B] data-[state=active]:shadow-lg transition-all duration-300 rounded-lg sm:rounded-xl py-2 sm:py-2.5 md:py-3 gap-1 sm:gap-1.5 md:gap-2 bg-white/5 border border-white/10 text-[10px] sm:text-xs md:text-sm text-slate-400"
            >
              <ThumbsUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
              <span className="hidden xs:inline">Interested</span>
              <span className="xs:hidden">Interest</span>
              <Badge className="ml-0.5 sm:ml-1 bg-white/20 text-white border-0 text-[8px] sm:text-[10px]">{counts.interested}</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="not_interested" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg sm:rounded-xl py-2 sm:py-2.5 md:py-3 gap-1 sm:gap-1.5 md:gap-2 bg-white/5 border border-white/10 text-[10px] sm:text-xs md:text-sm text-slate-400"
            >
              <ThumbsDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
              <span className="hidden xs:inline">Not Interested</span>
              <span className="xs:hidden">Not Int.</span>
              <Badge className="ml-0.5 sm:ml-1 bg-white/20 text-white border-0 text-[8px] sm:text-[10px]">{counts.not_interested}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* All Tab Contents - Dark Theme */}
          {['sent', 'replied', 'interested', 'not_interested'].map((tab) => {
            const tabData = filteredData;
            const isSent = tab === 'sent';
            const isReplied = tab === 'replied';
            const isInterested = tab === 'interested';
            const isNotInterested = tab === 'not_interested';
            
            let bgGradient = 'from-[#8EE147]/10 to-[#6EC035]/10';
            let iconColor = 'text-[#8EE147]';
            let badgeBg = 'bg-[#8EE147]/10';
            let badgeText = 'text-[#8EE147]';
            let hoverBg = 'hover:from-[#8EE147]/10 hover:to-[#6EC035]/10';
            
            if (isReplied) {
              bgGradient = 'from-[#8EE147]/10 to-[#6EC035]/10';
              iconColor = 'text-[#8EE147]';
              badgeBg = 'bg-[#8EE147]/10';
              badgeText = 'text-[#8EE147]';
              hoverBg = 'hover:from-[#8EE147]/10 hover:to-[#6EC035]/10';
            } else if (isInterested) {
              bgGradient = 'from-[#8EE147]/10 to-[#6EC035]/10';
              iconColor = 'text-[#8EE147]';
              badgeBg = 'bg-[#8EE147]/10';
              badgeText = 'text-[#8EE147]';
              hoverBg = 'hover:from-[#8EE147]/10 hover:to-[#6EC035]/10';
            } else if (isNotInterested) {
              bgGradient = 'from-red-500/10 to-rose-500/10';
              iconColor = 'text-red-400';
              badgeBg = 'bg-red-500/10';
              badgeText = 'text-red-400';
              hoverBg = 'hover:from-red-500/10 hover:to-rose-500/10';
            }

            return (
              <TabsContent key={tab} value={tab}>
                <div className="bg-[#0E223B]/50 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] sm:min-w-full text-xs sm:text-sm">
                      <thead>
                        <tr className={`bg-gradient-to-r ${bgGradient} border-b border-white/10`}>
                          <th className="p-1.5 sm:p-2 md:p-3 lg:p-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Building2 className={`h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 flex-shrink-0 ${iconColor}`} />
                              <span className="text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider text-slate-300">Company</span>
                            </div>
                          </th>
                          <th className="p-1.5 sm:p-2 md:p-3 lg:p-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Globe className={`h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 flex-shrink-0 ${iconColor}`} />
                              <span className="text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider text-slate-300">Country</span>
                            </div>
                          </th>
                          <th className="p-1.5 sm:p-2 md:p-3 lg:p-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Package className={`h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 flex-shrink-0 ${iconColor}`} />
                              <span className="text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider text-slate-300">Product</span>
                            </div>
                          </th>
                          <th className="p-1.5 sm:p-2 md:p-3 lg:p-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Activity className={`h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 flex-shrink-0 ${iconColor}`} />
                              <span className="text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider text-slate-300">Status</span>
                            </div>
                          </th>
                          <th className="p-1.5 sm:p-2 md:p-3 lg:p-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1 sm:gap-2">
                              <MessageSquare className={`h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 flex-shrink-0 ${iconColor}`} />
                              <span className="text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider text-slate-300">Interactions</span>
                            </div>
                          </th>
                          <th className="p-1.5 sm:p-2 md:p-3 lg:p-4 text-center whitespace-nowrap">
                            <span className="text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider text-slate-300">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tabData.map((item, index) => (
                          <tr key={item.buyer_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-1.5 sm:p-2 md:p-3 lg:p-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-[#8EE147]/20 to-[#6EC035]/20 flex items-center justify-center font-semibold text-[8px] sm:text-xs flex-shrink-0 text-[#8EE147]">
                                  {item.company_name?.charAt(0) || 'C'}
                                </div>
                                <span className="font-medium text-white text-[10px] sm:text-xs md:text-sm truncate max-w-[60px] sm:max-w-[100px] md:max-w-[150px]" title={item.company_name}>
                                  {item.company_name}
                                </span>
                              </div>
                            </td>
                            <td className="p-1.5 sm:p-2 md:p-3 lg:p-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white/5 rounded-lg text-[8px] sm:text-[10px] md:text-xs text-slate-300">
                                {item.country}
                              </span>
                            </td>
                            <td className="p-1.5 sm:p-2 md:p-3 lg:p-4 whitespace-nowrap">
                              <span className="text-slate-300 text-[10px] sm:text-xs md:text-sm truncate max-w-[50px] sm:max-w-[80px] md:max-w-[120px] block" title={item.product_name}>
                                {item.product_name}
                              </span>
                            </td>
                            <td className="p-1.5 sm:p-2 md:p-3 lg:p-4 whitespace-nowrap">
                              <div className="scale-75 sm:scale-90 md:scale-100 origin-left">
                                {getStatusBadge(item.current_status || item.type)}
                              </div>
                            </td>
                            <td className="p-1.5 sm:p-2 md:p-3 lg:p-4 text-center whitespace-nowrap">
                              <div className="inline-flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full bg-[#8EE147]/10 border border-[#8EE147]/20">
                                <MessageSquare className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 lg:h-3.5 lg:w-3.5 text-[#8EE147]" />
                                <span className="font-bold text-[8px] sm:text-[10px] md:text-xs text-[#8EE147]">{item.interaction_count || 0}</span>
                              </div>
                            </td>
                            <td className="p-1.5 sm:p-2 md:p-3 lg:p-4 text-center whitespace-nowrap">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="gap-0.5 sm:gap-1 h-6 sm:h-7 md:h-8 lg:h-9 px-1.5 sm:px-2 md:px-2.5 lg:px-3 rounded-lg transition-colors text-[8px] sm:text-[10px] md:text-xs bg-[#8EE147]/10 hover:bg-[#8EE147]/20 text-[#8EE147] hover:text-[#8EE147]"
                                onClick={() => viewDetails(item)}
                              >
                                <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5" />
                                <span className="hidden xs:inline">View</span>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Bottom Pagination - Dark Theme */}
        {totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 sm:pt-4 border-t border-white/10">
            <div className="text-[10px] sm:text-sm text-slate-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} items
            </div>
        <div className="flex items-center gap-2 flex-wrap justify-center">
  <div className="flex items-center gap-1.5 sm:gap-2 mr-1 sm:mr-2">
    <span className="text-[10px] sm:text-sm text-slate-400">Rows:</span>
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
  <Button 
    variant="outline" 
    size="sm" 
    disabled={currentPage === 1} 
    onClick={() => handlePageChange(currentPage - 1)}
    className="h-7 sm:h-8 md:h-9 px-2 sm:px-3 hover:bg-[#8EE147]/10 hover:border-[#8EE147]/30 transition-colors text-xs border border-white/20 bg-transparent text-white hover:text-[#8EE147] disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#8EE147]" />
  </Button>
  <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] sm:text-sm font-medium text-white">
    {currentPage} / {totalPages || 1}
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
        )}
      </div>
    </div>
  );
}