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
  Loader2
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
        return <Badge className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200">
          <Send className="h-3 w-3 mr-1" />
          Sent
        </Badge>;
      case 'Replied':
        return <Badge className="bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200">
          <Reply className="h-3 w-3 mr-1" />
          Replied
        </Badge>;
      case 'Interested':
        return <Badge className="bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200">
          <ThumbsUp className="h-3 w-3 mr-1" />
          Interested
        </Badge>;
      case 'Not Interested':
        return <Badge className="bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200">
          <ThumbsDown className="h-3 w-3 mr-1" />
          Not Interested
        </Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Unknown</Badge>;
    }
  };

  // Get type icon
  const getTypeIcon = (communication: TrackingCommunication) => {
    switch(communication.display_status) {
      case 'Sent': return <Send className="h-4 w-4 text-blue-500" />;
      case 'Replied': return <Reply className="h-4 w-4 text-emerald-500" />;
      case 'Interested': return <ThumbsUp className="h-4 w-4 text-emerald-500" />;
      case 'Not Interested': return <ThumbsDown className="h-4 w-4 text-red-500" />;
      default: return <Mail className="h-4 w-4 text-gray-400" />;
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
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-xl opacity-20 animate-pulse" />
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto relative" />
          </div>
          <p className="mt-6 text-sm font-medium text-muted-foreground animate-pulse">
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
        <div className="w-full p-6 flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full text-center">
            <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-full w-fit mx-auto mb-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Data</h3>
            <p className="text-sm text-muted-foreground mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleBack} variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button onClick={refreshData} className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600">
                <RefreshCw className="h-4 w-4" />
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
      <div className="w-full p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header with Buyer Info */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={handleBack}
                className="hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  {buyerInfo?.company_name || 'Buyer Details'}
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                  <User className="h-4 w-4" />
                  Buyer ID: {buyerId}
                  <span className="text-xs text-muted-foreground ml-2">
                    • {totalCount} communications
                  </span>
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={refreshData} 
              disabled={refreshing}
              className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Buyer Info Cards */}
          {buyerInfo && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Company</p>
                    <p className="text-sm font-semibold text-gray-800">{buyerInfo.company_name}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
                    <AtSign className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{buyerInfo.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <Phone className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</p>
                    <p className="text-sm font-semibold text-gray-800">{buyerInfo.contact_name}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                    <Package className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</p>
                    <p className="text-sm font-semibold text-gray-800">{buyerInfo.product_name}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards for this buyer */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{summary?.total || 0}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sent</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{summary?.sent || 0}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <Send className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Replied</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{summary?.replied || 0}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
                  <Reply className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Interested</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{summary?.interested || 0}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
                  <ThumbsUp className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Not Interested</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{summary?.not_interested || 0}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl">
                  <ThumbsDown className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar - Like Search Page */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 mb-6">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                <Input
                  placeholder="Search by subject, message, status, template..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl bg-white/80"
                />
                {searchQuery && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    ) : (
                      <span className="text-xs text-emerald-500 font-medium">✓</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                  <Activity className="h-3.5 w-3.5 text-blue-500" />
                  Showing: <span className="font-semibold text-gray-700">{communications.length}</span>
                </span>
                {isSearching && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-200">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Searching...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Results count and pagination info */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{communications.length}</span> of{' '}
                <span className="font-semibold text-foreground">{totalCount}</span> communications
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1} 
                onClick={() => handlePageChange(currentPage - 1)}
                className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-4 py-1.5 bg-white rounded-lg border text-sm font-medium shadow-sm">
                Page <span className="text-blue-600">{currentPage}</span> / {totalPages || 1}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage >= totalPages} 
                onClick={() => handlePageChange(currentPage + 1)}
                className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Communications Table */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-md">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Communication History
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    All communications with {buyerInfo?.company_name || 'this buyer'}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50/80 to-blue-50/80">
                      <TableHead className="font-semibold text-gray-700 w-12">#</TableHead>
                      <TableHead className="font-semibold text-gray-700">Type</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                      <TableHead className="font-semibold text-gray-700">Message Preview</TableHead>
                      <TableHead className="font-semibold text-gray-700">Template</TableHead>
                      <TableHead className="font-semibold text-gray-700">Date</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isSearching ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-16">
                          <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                            <p className="text-slate-500 text-sm font-medium">Searching communications...</p>
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
                          <TableCell className="font-medium text-gray-600">{index + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                {getTypeIcon(comm)}
                              </div>
                              <span className="text-xs font-medium text-gray-600">{comm.display_status}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(comm)}</TableCell>
                          <TableCell className="max-w-xs">
                            <p className="truncate font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                              {comm.subject || 'No Subject'}
                            </p>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <p className="text-sm text-muted-foreground truncate">
                              {getMessagePreview(comm.message)}
                            </p>
                          </TableCell>
                          <TableCell>
                            {comm.template_used && (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200">
                                <Sparkles className="h-3 w-3" />
                                {comm.template_used}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              {formatDate(comm.date)}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1.5 h-9 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded-lg transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                viewMessage(comm);
                              }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-gray-50 rounded-full">
                              <Mail className="h-10 w-10 text-gray-400" />
                            </div>
                            <p className="text-muted-foreground font-medium">No communications found</p>
                            <p className="text-sm text-muted-foreground/70">
                              {searchQuery ? 'Try adjusting your search terms' : 'No emails have been sent to this buyer yet'}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Summary footer with pagination */}
              {communications.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                      <Send className="h-3.5 w-3.5 text-blue-500" />
                      Sent: <span className="font-semibold text-gray-700">{summary?.sent || 0}</span>
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                      <Reply className="h-3.5 w-3.5 text-emerald-500" />
                      Replied: <span className="font-semibold text-gray-700">{summary?.replied || 0}</span>
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                      <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />
                      Interested: <span className="font-semibold text-gray-700">{summary?.interested || 0}</span>
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                      <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
                      Not Interested: <span className="font-semibold text-gray-700">{summary?.not_interested || 0}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-3 mr-2">
                      <span className="text-sm text-slate-600">Rows:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400"
                      >
                        {itemsPerPageOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={currentPage === 1} 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={currentPage >= totalPages} 
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* View Message Dialog - Same as before */}
          <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 rounded-2xl border-0 shadow-2xl">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-800">
                        <div className="p-1.5 bg-gradient-to-r to-indigo-500 rounded-lg">
                          {selectedMessage && getTypeIcon(selectedMessage)}
                        </div>
                        Message Details
                      </DialogTitle>
                      <DialogDescription className="flex items-center gap-2 mt-1.5 text-sm">
                        <Building className="h-3.5 w-3.5 text-blue-500" />
                        {selectedMessage?.company_name}
                        <span className="text-gray-300">|</span>
                        <Activity className="h-3.5 w-3.5 text-blue-500" />
                        {selectedMessage?.display_status} communication
                      </DialogDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedMessage && getStatusBadge(selectedMessage)}
                    </div>
                  </div>
                </DialogHeader>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-gray-50 p-2 rounded-lg">
                  <Calendar className="h-3.5 w-3.5 text-blue-500" />
                  {formatDate(selectedMessage?.date || null)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Send className="h-3 w-3 text-blue-500" />
                      From
                    </p>
                    <p className="text-sm font-medium text-gray-800 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                      {selectedMessage?.from_email || '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <User className="h-3 w-3 text-blue-500" />
                      To
                    </p>
                    <p className="text-sm font-medium text-gray-800 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                      {selectedMessage?.to_email || '-'}
                    </p>
                  </div>
                </div>

                {selectedMessage?.subject && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-blue-500" />
                      Subject
                    </h4>
                    <p className="text-sm font-medium text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      {selectedMessage.subject}
                    </p>
                  </div>
                )}

                {selectedMessage?.message && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                      Message
                    </h4>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 min-h-[100px]">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>
                )}

                {selectedMessage?.response && selectedMessage.display_status !== 'Sent' && (
                  <div className={`p-3 rounded-xl border ${
                    selectedMessage.response === 'interested' 
                      ? 'bg-emerald-50 border-emerald-200' 
                      : selectedMessage.response === 'not_interested' 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <Activity className="h-3 w-3 text-blue-500" />
                      Response Status
                    </p>
                    <p className="text-sm font-semibold">
                      {selectedMessage.response === 'interested' && <span className="text-emerald-600">✓ Interested</span>}
                      {selectedMessage.response === 'not_interested' && <span className="text-red-600">✗ Not Interested</span>}
                      {selectedMessage.response !== 'interested' && selectedMessage.response !== 'not_interested' && (
                        <span className="text-gray-600">{selectedMessage.response}</span>
                      )}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-blue-500" />
                      Template Used
                    </p>
                    <p className="text-sm font-medium text-gray-800 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                      {selectedMessage?.template_used || '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="h-3 w-3 text-blue-500" />
                      Product
                    </p>
                    <p className="text-sm font-medium text-gray-800 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                      {selectedMessage?.product_name || '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/50 flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setMessageDialogOpen(false)}
                  className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}