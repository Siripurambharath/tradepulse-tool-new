import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Building,
  Package,
  Search,
  User,
  Calendar,
  AlertCircle,
  RefreshCw,
  Eye,
  Clock,
  Mail,
  Send,
  Reply,
  ThumbsUp,
  ThumbsDown,
  Activity,
  MessageSquare,
  Sparkles,
  FileText,
  ChevronRight,
  Building2,
  Phone,
  AtSign,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Loader2,
    X
} from 'lucide-react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { API_URL } from '@/components/api';

interface TrackingCommunication {
  id: number;
  buyer_id: number;
  batch_id: string;
  company_name: string;
  country: string;
  contact_name: string;
  from_email: string;
  to_email: string;
  subject: string;
  message: string;
  product_name: string;
  sent_at: string | null;
  reply_date: string | null;
  responded_at: string | null;
  status: string;
  template_used: string;
  response: string | null;
  display_status: string;
  record_type: string;
  date: string | null;
  seller_id: string;
}

interface BuyerInfo {
  buyer_id: number;
  company_name: string;
  country: string;
  product_name: string;
  contact_name: string;
  email: string;
  all_emails: string;
  all_contacts: string;
  seller_id: string;
}

interface Summary {
  total: number;
  sent: number;
  replied: number;
  interested: number;
  not_interested: number;
  last_activity: string | null;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

export default function AdminTrackingPagIndetail() {
  const { sellerId, buyerId } = useParams<{ sellerId: string; buyerId: string }>();
  const navigate = useNavigate();
  
  // State
  const [communications, setCommunications] = useState<TrackingCommunication[]>([]);
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedMessage, setSelectedMessage] = useState<TrackingCommunication | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [itemsPerPageOptions] = useState([10, 20, 50, 100]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  // Cache for search results
  const searchCache = useRef<Map<string, any>>(new Map());

  // Fetch buyer communications (main API)
  const fetchBuyerDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!sellerId || !buyerId) {
        setError('Missing seller or buyer information');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      params.set('sellerId', sellerId);
      params.set('page', String(currentPage));
      params.set('limit', String(itemsPerPage));

      const response = await axios.get(`${API_URL}/api/tracking/buyer/${buyerId}?${params.toString()}`);
      
      if (response.data.success) {
        setBuyerInfo(response.data.buyer_info);
        setCommunications(response.data.data || []);
        setSummary(response.data.summary || {
          total: 0,
          sent: 0,
          replied: 0,
          interested: 0,
          not_interested: 0,
          last_activity: null
        });
        setTotalCount(response.data.pagination?.total || 0);
        setTotalPages(response.data.pagination?.totalPages || 0);
        setPagination(response.data.pagination || null);
      } else {
        setError(response.data.message || 'Buyer not found');
      }
    } catch (error: any) {
      console.error('Error fetching buyer details:', error);
      if (error.response?.status === 404) {
        setError('Buyer not found');
      } else {
        setError('Failed to load buyer details');
      }
    } finally {
      setLoading(false);
    }
  }, [sellerId, buyerId, currentPage, itemsPerPage]);

  // Search communications (separate search API)
  const searchCommunications = useCallback(async () => {
    try {
      setIsSearching(true);
      setError(null);
      
      if (!sellerId || !buyerId) {
        setError('Missing seller or buyer information');
        setIsSearching(false);
        return;
      }

      const params = new URLSearchParams();
      params.set('sellerId', sellerId);
      params.set('search', debouncedSearchQuery);
      params.set('page', String(currentPage));
      params.set('limit', String(itemsPerPage));

      // Generate cache key
      const cacheKey = `${sellerId}-${buyerId}-${debouncedSearchQuery}-${currentPage}-${itemsPerPage}`;
      
      // Check cache first
      if (searchCache.current.has(cacheKey)) {
        const cachedData = searchCache.current.get(cacheKey);
        setCommunications(cachedData.communications || []);
        setBuyerInfo(cachedData.buyerInfo || null);
        setSummary(cachedData.summary || null);
        setTotalCount(cachedData.totalCount || 0);
        setTotalPages(cachedData.totalPages || 0);
        setPagination(cachedData.pagination || null);
        setIsSearching(false);
        return;
      }

      const response = await axios.get(`${API_URL}/api/tracking/buyer/${buyerId}/search?${params.toString()}`);
      
      if (response.data.success) {
        const data = response.data.data || [];
        const buyer = response.data.buyer_info || null;
        const summaryData = response.data.summary || null;
        const paginationData = response.data.pagination || null;
        
        setCommunications(data);
        setBuyerInfo(buyer);
        setSummary(summaryData);
        setTotalCount(paginationData?.total || 0);
        setTotalPages(paginationData?.totalPages || 0);
        setPagination(paginationData || null);
        
        // Store in cache
        searchCache.current.set(cacheKey, {
          communications: data,
          buyerInfo: buyer,
          summary: summaryData,
          totalCount: paginationData?.total || 0,
          totalPages: paginationData?.totalPages || 0,
          pagination: paginationData || null
        });
      } else {
        setError(response.data.message || 'Failed to search communications');
      }
    } catch (error: any) {
      console.error('Error searching communications:', error);
      setError('Failed to search communications');
    } finally {
      setIsSearching(false);
    }
  }, [sellerId, buyerId, debouncedSearchQuery, currentPage, itemsPerPage]);

  // Initial load
  useEffect(() => {
    if (sellerId && buyerId) {
      fetchBuyerDetails();
    } else {
      setError('Missing seller or buyer information');
      setLoading(false);
    }
  }, [sellerId, buyerId]);

  // Handle search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery) {
      searchCommunications();
    } else {
      // If search is cleared, fetch all data
      fetchBuyerDetails();
      // Clear cache when search is cleared
      searchCache.current.clear();
    }
  }, [debouncedSearchQuery, currentPage, itemsPerPage, fetchBuyerDetails, searchCommunications]);

  // Refresh function
  const refreshData = async () => {
    setRefreshing(true);
    searchCache.current.clear();
    setSearchQuery('');
    await fetchBuyerDetails();
    setRefreshing(false);
  };

  // Format date function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (communication: TrackingCommunication) => {
    switch(communication.display_status) {
      case 'Sent':
        return <Badge className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1">
          <Send className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
          Sent
        </Badge>;
      case 'Replied':
        return <Badge className="bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1">
          <Reply className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
          Replied
        </Badge>;
      case 'Interested':
        return <Badge className="bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200 text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1">
          <ThumbsUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
          Interested
        </Badge>;
      case 'Not Interested':
        return <Badge className="bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200 text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1">
          <ThumbsDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
          Not Interested
        </Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1">Unknown</Badge>;
    }
  };

  // Get type icon
  const getTypeIcon = (communication: TrackingCommunication) => {
    switch(communication.display_status) {
      case 'Sent': return <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-blue-500" />;
      case 'Replied': return <Reply className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-emerald-500" />;
      case 'Interested': return <ThumbsUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-emerald-500" />;
      case 'Not Interested': return <ThumbsDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-red-500" />;
      default: return <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-gray-400" />;
    }
  };

  // Get message preview
  const getMessagePreview = (message: string) => {
    if (!message) return 'No message content';
    return message.length > 100 ? message.substring(0, 100) + '...' : message;
  };

  // View message dialog
  const viewMessage = (communication: TrackingCommunication) => {
    setSelectedMessage(communication);
    setMessageDialogOpen(true);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
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
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-xl opacity-20 animate-pulse" />
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-200 border-t-blue-600 mx-auto relative" />
          </div>
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm font-medium text-muted-foreground animate-pulse">
            Loading buyer details...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
        <div className="w-full px-4 sm:px-6 py-6 flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 max-w-md w-full text-center">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-full w-fit mx-auto mb-3 sm:mb-4">
              <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Error Loading Data</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <Button onClick={handleBack} variant="outline" className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9">
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Back
              </Button>
              <Button onClick={refreshData} className="gap-1.5 sm:gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-xs sm:text-sm h-8 sm:h-9">
                <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
      <div className="w-full px-0 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8 space-y-4 sm:space-y-5 md:space-y-6">
        {/* Header with Buyer Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="hover:bg-blue-50 hover:text-blue-700 transition-colors h-7 sm:h-8 md:h-9 text-xs sm:text-sm px-2 sm:px-3"
            >
              <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Back</span>
            </Button>
            <div className="min-w-0 flex-1 sm:flex-none">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg sm:rounded-xl flex-shrink-0">
                  <Building className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                </div>
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">
                  {buyerInfo?.company_name || 'Buyer Details'}
                </h1>
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground flex items-center gap-1 sm:gap-2 mt-0.5 flex-wrap">
                <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Buyer ID: {buyerId}
                <span className="text-[8px] sm:text-[10px] text-muted-foreground ml-1 sm:ml-2">
                  • {totalCount} communications
                </span>
              </p>
            </div>
          </div>
        <div className="w-full sm:w-auto">
  <Button 
    variant="outline" 
    onClick={refreshData} 
    disabled={refreshing}
    className="gap-1.5 sm:gap-2 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 text-white text-xs sm:text-sm h-8 sm:h-9 md:h-10 px-3 sm:px-4"
  >
    <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${refreshing ? 'animate-spin' : ''}`} />
    Refresh
  </Button>
</div>
        </div>

        {/* Buyer Info Cards */}
        {buyerInfo && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 md:p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl">
                  <Building2 className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-[9px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Company</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{buyerInfo.company_name}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 md:p-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg sm:rounded-xl">
                  <AtSign className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-[9px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{buyerInfo.email}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 md:p-2.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl">
                  <Phone className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-[9px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{buyerInfo.contact_name}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 md:p-2.5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg sm:rounded-xl">
                  <Package className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-[9px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{buyerInfo.product_name}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards for this buyer */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-[9px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mt-0.5 sm:mt-1">{summary?.total || 0}</p>
              </div>
              <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl">
                <MessageSquare className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-[9px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Sent</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 mt-0.5 sm:mt-1">{summary?.sent || 0}</p>
              </div>
              <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl">
                <Send className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-[9px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Replied</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-600 mt-0.5 sm:mt-1">{summary?.replied || 0}</p>
              </div>
              <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg sm:rounded-xl">
                <Reply className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-[9px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Interested</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-600 mt-0.5 sm:mt-1">{summary?.interested || 0}</p>
              </div>
              <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg sm:rounded-xl">
                <ThumbsUp className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-[9px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Not Int.</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-600 mt-0.5 sm:mt-1">{summary?.not_interested || 0}</p>
              </div>
              <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg sm:rounded-xl">
                <ThumbsDown className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/50 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
            <div className="relative flex-1 min-w-[150px]">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
              <Input
                placeholder="Search by subject, message, status, template..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 sm:pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg sm:rounded-xl bg-white/80 h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
              />
              {searchQuery && (
                <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2">
                  {isSearching ? (
                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-blue-500" />
                  ) : (
                    <span className="text-[10px] sm:text-xs text-emerald-500 font-medium">✓</span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 bg-white rounded-lg shadow-sm border border-gray-100">
                <Activity className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500" />
                Showing: <span className="font-semibold text-gray-700">{communications.length}</span>
              </span>
              {isSearching && (
                <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-amber-50 text-amber-700 rounded-full text-[8px] sm:text-xs font-medium border border-amber-200">
                  <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin" />
                  Searching...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Results count and pagination info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-[10px] sm:text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{communications.length}</span> of{' '}
              <span className="font-semibold text-foreground">{totalCount}</span> communications
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1} 
              onClick={() => handlePageChange(currentPage - 1)}
              className="h-7 sm:h-8 md:h-9 px-2 sm:px-3 hover:bg-blue-50 hover:border-blue-300 transition-colors text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <div className="px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 bg-white rounded-lg border text-[10px] sm:text-sm font-medium shadow-sm">
              Page <span className="text-blue-600">{currentPage}</span> / {totalPages || 1}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage >= totalPages} 
              onClick={() => handlePageChange(currentPage + 1)}
              className="h-7 sm:h-8 md:h-9 px-2 sm:px-3 hover:bg-blue-50 hover:border-blue-300 transition-colors text-xs"
            >
              <ChevronRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

       {/* Communications Table */}
<Card className="border-0 shadow-lg overflow-hidden">
  <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-blue-50/50 p-3 sm:p-4 md:p-5 lg:p-6">
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-md flex-shrink-0">
        <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <CardTitle className="text-sm sm:text-base md:text-lg lg:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent truncate">
          Communication History
        </CardTitle>
        <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">
          All communications with {buyerInfo?.company_name || 'this buyer'}
        </p>
      </div>
    </div>
  </CardHeader>
  <CardContent className="p-0">
    <div className="overflow-x-auto">
      <Table className="min-w-[700px] sm:min-w-full">
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-gray-50/80 to-blue-50/80">
            <TableHead className="font-semibold text-gray-700 w-8 sm:w-10 md:w-12 text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider p-1.5 sm:p-2 md:p-3 lg:p-4 whitespace-nowrap">#</TableHead>
            <TableHead className="font-semibold text-gray-700 text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider p-1.5 sm:p-2 md:p-3 lg:p-4 whitespace-nowrap">Type</TableHead>
            <TableHead className="font-semibold text-gray-700 text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider p-1.5 sm:p-2 md:p-3 lg:p-4 whitespace-nowrap">Status</TableHead>
            <TableHead className="font-semibold text-gray-700 text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider p-1.5 sm:p-2 md:p-3 lg:p-4 whitespace-nowrap">Subject</TableHead>
            <TableHead className="font-semibold text-gray-700 text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider p-1.5 sm:p-2 md:p-3 lg:p-4 whitespace-nowrap">Preview</TableHead>
            <TableHead className="font-semibold text-gray-700 text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider p-1.5 sm:p-2 md:p-3 lg:p-4 whitespace-nowrap">Template</TableHead>
            <TableHead className="font-semibold text-gray-700 text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider p-1.5 sm:p-2 md:p-3 lg:p-4 whitespace-nowrap">Date</TableHead>
            <TableHead className="font-semibold text-gray-700 text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider p-1.5 sm:p-2 md:p-3 lg:p-4 text-center whitespace-nowrap">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isSearching ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 sm:py-10 md:py-12 lg:py-16">
                <div className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 animate-spin text-blue-500" />
                  <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 font-medium">Searching communications...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : communications.length > 0 ? (
            communications.map((comm, index) => (
              <TableRow 
                key={comm.id} 
                className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 cursor-pointer group"
                onClick={() => viewMessage(comm)}
              >
                <TableCell className="font-medium text-gray-600 text-[10px] sm:text-xs p-1.5 sm:p-2 md:p-3 lg:p-4 whitespace-nowrap">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell className="p-1.5 sm:p-2 md:p-3 lg:p-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="p-0.5 sm:p-1 bg-white rounded-lg shadow-sm flex-shrink-0">
                      {getTypeIcon(comm)}
                    </div>
                    <span className="text-[8px] sm:text-[10px] md:text-xs font-medium text-gray-600">
                      {comm.display_status}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="p-1.5 sm:p-2 md:p-3 lg:p-4 whitespace-nowrap">
                  <div className="scale-75 sm:scale-90 md:scale-100 origin-left">
                    {getStatusBadge(comm)}
                  </div>
                </TableCell>
                <TableCell className="p-1.5 sm:p-2 md:p-3 lg:p-4 max-w-[80px] sm:max-w-[120px] md:max-w-[150px]">
                  <p className="truncate font-medium text-gray-700 group-hover:text-blue-600 transition-colors text-[10px] sm:text-xs md:text-sm" title={comm.subject || 'No Subject'}>
                    {comm.subject || 'No Subject'}
                  </p>
                </TableCell>
                <TableCell className="p-1.5 sm:p-2 md:p-3 lg:p-4 max-w-[100px] sm:max-w-[150px] md:max-w-[200px]">
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate" title={comm.message}>
                    {getMessagePreview(comm.message)}
                  </p>
                </TableCell>
                <TableCell className="p-1.5 sm:p-2 md:p-3 lg:p-4 whitespace-nowrap">
                  {comm.template_used && (
                    <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full text-[8px] sm:text-[10px] md:text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 truncate max-w-[70px] sm:max-w-[100px]">
                      <Sparkles className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 flex-shrink-0" />
                      <span className="truncate">{comm.template_used}</span>
                    </span>
                  )}
                </TableCell>
                <TableCell className="p-1.5 sm:p-2 md:p-3 lg:p-4 whitespace-nowrap">
                  <div className="flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] md:text-xs text-muted-foreground">
                    <Clock className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 flex-shrink-0" />
                    {formatDate(comm.date)}
                  </div>
                </TableCell>
                <TableCell className="p-1.5 sm:p-2 md:p-3 lg:p-4 text-center whitespace-nowrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-0.5 sm:gap-1 h-6 sm:h-7 md:h-8 lg:h-9 px-1.5 sm:px-2 md:px-2.5 lg:px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded-lg transition-colors text-[8px] sm:text-[10px] md:text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      viewMessage(comm);
                    }}
                  >
                    <Eye className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 lg:h-3.5 lg:w-3.5" />
                    <span className="hidden xs:inline">View</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6 sm:py-8 md:py-10 lg:py-12">
                <div className="flex flex-col items-center gap-1.5 sm:gap-2 md:gap-3">
                  <div className="p-2.5 sm:p-3 md:p-4 bg-gray-50 rounded-full">
                    <Mail className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-gray-400" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">No communications found</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground/70 text-center px-4">
                    {searchQuery ? 'Try adjusting your search terms' : 'No emails have been sent to this buyer yet'}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>

    {/* Summary footer with pagination - Mobile Optimized */}
    {communications.length > 0 && (
      <div className="flex flex-col gap-2 sm:gap-3 p-2 sm:p-3 md:p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
        {/* Stats Row - Horizontal scroll on mobile */}
        <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2 justify-center sm:justify-start overflow-x-auto pb-1">
          <span className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-white rounded-lg shadow-sm border border-gray-100 text-[8px] sm:text-[10px] md:text-xs whitespace-nowrap">
            <Send className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 text-blue-500" />
            Sent: <span className="font-semibold text-gray-700">{summary?.sent || 0}</span>
          </span>
          <span className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-white rounded-lg shadow-sm border border-gray-100 text-[8px] sm:text-[10px] md:text-xs whitespace-nowrap">
            <Reply className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 text-emerald-500" />
            Replied: <span className="font-semibold text-gray-700">{summary?.replied || 0}</span>
          </span>
          <span className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-white rounded-lg shadow-sm border border-gray-100 text-[8px] sm:text-[10px] md:text-xs whitespace-nowrap">
            <ThumbsUp className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 text-emerald-500" />
            Interested: <span className="font-semibold text-gray-700">{summary?.interested || 0}</span>
          </span>
          <span className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-white rounded-lg shadow-sm border border-gray-100 text-[8px] sm:text-[10px] md:text-xs whitespace-nowrap">
            <ThumbsDown className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 text-red-500" />
            Not Int.: <span className="font-semibold text-gray-700">{summary?.not_interested || 0}</span>
          </span>
        </div>
        
        {/* Pagination Controls - Stacked on mobile */}
        <div className="flex flex-col xs:flex-row items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-[8px] sm:text-[10px] md:text-sm text-slate-600 whitespace-nowrap">Rows:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 text-[8px] sm:text-[10px] md:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400"
            >
              {itemsPerPageOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
            <span className="text-[8px] sm:text-[10px] md:text-sm text-muted-foreground whitespace-nowrap">
              {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1} 
              onClick={() => handlePageChange(currentPage - 1)}
              className="h-6 sm:h-7 md:h-8 lg:h-9 px-1.5 sm:px-2 md:px-2.5 lg:px-3 hover:bg-blue-50 hover:border-blue-300 transition-colors text-[10px] sm:text-xs"
            >
              <ChevronLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage >= totalPages} 
              onClick={() => handlePageChange(currentPage + 1)}
              className="h-6 sm:h-7 md:h-8 lg:h-9 px-1.5 sm:px-2 md:px-2.5 lg:px-3 hover:bg-blue-50 hover:border-blue-300 transition-colors text-[10px] sm:text-xs"
            >
              <ChevronRightIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>
      </div>
    )}
  </CardContent>
</Card>
{/* View Message Dialog */}
<Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
  <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden p-0 rounded-xl sm:rounded-2xl border-0 shadow-2xl w-[95vw] sm:w-full fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
    <div className="p-4 sm:p-5 md:p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
      <DialogHeader>
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="p-2 sm:p-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-md flex-shrink-0">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-base sm:text-lg md:text-xl font-bold text-gray-800 truncate">
              Message Details
            </DialogTitle>
            <DialogDescription className="flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5 text-[10px] sm:text-xs md:text-sm">
              <Building className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500 flex-shrink-0" />
              <span className="truncate max-w-[100px] sm:max-w-[200px]">{selectedMessage?.company_name}</span>
              <span className="text-gray-300">|</span>
              <Activity className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500 flex-shrink-0" />
              <span className="truncate max-w-[80px] sm:max-w-[150px]">{selectedMessage?.display_status}</span>
            </DialogDescription>
          </div>
        </div>
        {/* REMOVE THIS - The DialogContent already has a close button */}
        {/* <button ...> */}
      </DialogHeader>
    </div>

    <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 overflow-y-auto max-h-[calc(85vh-160px)]">
      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground bg-gray-50 p-2 rounded-lg">
        <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500 flex-shrink-0" />
        <span className="truncate">{formatDate(selectedMessage?.date || null)}</span>
        {selectedMessage && getStatusBadge(selectedMessage)}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1">
          <p className="text-[8px] sm:text-[9px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
            <Send className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500 flex-shrink-0" />
            From
          </p>
          <p className="text-xs sm:text-sm font-medium text-gray-800 bg-blue-50/50 p-2 rounded-lg border border-blue-100 break-all">
            {selectedMessage?.from_email || '-'}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[8px] sm:text-[9px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
            <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500 flex-shrink-0" />
            To
          </p>
          <p className="text-xs sm:text-sm font-medium text-gray-800 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100 break-all">
            {selectedMessage?.to_email || '-'}
          </p>
        </div>
      </div>

      {selectedMessage?.subject && (
        <div className="space-y-1.5">
          <h4 className="text-[8px] sm:text-[9px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
            <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 text-blue-500 flex-shrink-0" />
            Subject
          </h4>
          <p className="text-xs sm:text-sm font-medium text-gray-800 bg-gray-50 p-2 sm:p-3 rounded-xl border border-gray-100 break-words">
            {selectedMessage.subject}
          </p>
        </div>
      )}

      {selectedMessage?.message && (
        <div className="space-y-1.5">
          <h4 className="text-[8px] sm:text-[9px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
            <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 text-blue-500 flex-shrink-0" />
            Message
          </h4>
          <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 min-h-[60px] sm:min-h-[80px] md:min-h-[100px]">
            <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
              {selectedMessage.message}
            </p>
          </div>
        </div>
      )}

      {selectedMessage?.response && selectedMessage.display_status !== 'Sent' && (
        <div className={`p-2.5 sm:p-3 rounded-xl border ${
          selectedMessage.response === 'interested' 
            ? 'bg-emerald-50 border-emerald-200' 
            : selectedMessage.response === 'not_interested' 
            ? 'bg-red-50 border-red-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <p className="text-[8px] sm:text-[9px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
            <Activity className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500 flex-shrink-0" />
            Response Status
          </p>
          <p className="text-xs sm:text-sm font-semibold">
            {selectedMessage.response === 'interested' && <span className="text-emerald-600">✓ Interested</span>}
            {selectedMessage.response === 'not_interested' && <span className="text-red-600">✗ Not Interested</span>}
            {selectedMessage.response !== 'interested' && selectedMessage.response !== 'not_interested' && (
              <span className="text-gray-600">{selectedMessage.response}</span>
            )}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 border-t border-gray-100">
        <div className="space-y-1">
          <p className="text-[8px] sm:text-[9px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
            <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500 flex-shrink-0" />
            Template
          </p>
          <p className="text-xs sm:text-sm font-medium text-gray-800 bg-blue-50/50 p-2 rounded-lg border border-blue-100 break-words">
            {selectedMessage?.template_used || '-'}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[8px] sm:text-[9px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
            <Package className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500 flex-shrink-0" />
            Product
          </p>
          <p className="text-xs sm:text-sm font-medium text-gray-800 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100 break-words">
            {selectedMessage?.product_name || '-'}
          </p>
        </div>
      </div>
    </div>
  </DialogContent>
</Dialog>
      </div>
    </div>
  );
}