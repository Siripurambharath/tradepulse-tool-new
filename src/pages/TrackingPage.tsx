import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, Eye, Send, Reply, ThumbsUp, ThumbsDown, 
  AlertCircle, MessageSquare, Users,
  Mail, Activity,
  BarChart3, Filter, ArrowUpRight,
  Building2, Package, Globe,
  RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { ACTIVITY_URL, API_URL } from '@/components/api';

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

// Interface for tracking data
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
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function TrackingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sent');
  const [searchQuery, setSearchQuery] = useState('');
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
    not_interested: 0
  });
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const statuses = ['sent', 'interested', 'not_interested'];
  const perPage = 10;

  const getSellerId = useCallback(() => {
    const sellerStr = localStorage.getItem('seller');
    if (!sellerStr) return null;
    try {
      const seller = JSON.parse(sellerStr);
      return seller?.id;
    } catch (e) {
      console.error('Failed to parse seller from localStorage:', e);
      return null;
    }
  }, []);

  // Fetch tracking data with pagination
  const fetchTrackingData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const sellerId = getSellerId();
      if (!sellerId) {
        setError('No seller found — please log in again');
        setLoading(false);
        return;
      }

      // Fetch tracking data with pagination
      const response = await axios.get(`${API_URL}/api/tracking/page`, {
        params: {
          seller_id: sellerId,
          page: page,
          limit: perPage
        }
      });
      
      if (response.data.success) {
        setTrackingData(response.data.data);
        setCounts(response.data.counts);
        setPagination(response.data.pagination);
      }

      // Log activity
      createActivityLog(31, 5, 'Viewed tracking Table page');

    } catch (error: any) {
      console.error('Error fetching tracking data:', error);
      setError(error.message || 'Error loading tracking data');
    } finally {
      setLoading(false);
    }
  }, [getSellerId, page]);

  // Fetch counts separately (only when needed)
  const fetchCounts = useCallback(async () => {
    try {
      const sellerId = getSellerId();
      if (!sellerId) return;

      const response = await axios.get(`${API_URL}/api/tracking/counts?seller_id=${sellerId}`);
      if (response.data.success) {
        setCounts({
          sent: response.data.data.sent || 0,
          replied: response.data.data.replied || 0,
          interested: response.data.data.interested || 0,
          not_interested: response.data.data.not_interested || 0
        });
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  }, [getSellerId]);

  // Initial load and page changes
  useEffect(() => {
    fetchTrackingData();
    fetchCounts();
  }, [fetchTrackingData, fetchCounts]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  // Memoized filtered data - FIXED: Filter by current_status only
  const filteredData = useMemo(() => {
    // Get data for the active tab - this already has the correct status
    let allData: TrackingItem[] = [];
    
    switch (activeTab) {
      case 'sent':
        allData = trackingData.sent || [];
        break;
      case 'replied':
        allData = trackingData.replied || [];
        break;
      case 'interested':
        allData = trackingData.interested || [];
        break;
      case 'not_interested':
        allData = trackingData.not_interested || [];
        break;
      default:
        allData = [];
    }
    
    // Apply search filter
    let filtered = allData;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        (item.company_name?.toLowerCase() || '').includes(query) ||
        (item.country?.toLowerCase() || '').includes(query) ||
        (item.product_name?.toLowerCase() || '').includes(query)
      );
    }
    
    // Apply status filter - FIXED: Only filter if statusFilter is not 'all'
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.current_status === statusFilter);
    }
    
    return filtered;
  }, [searchQuery, statusFilter, activeTab, trackingData]);

  // Debounced activity log for search
  useEffect(() => {
    if (searchQuery) {
      const timeoutId = setTimeout(() => {
        createActivityLog(28, 5, `Searched tracking data with query: ${searchQuery}`, {
          searchQuery: searchQuery,
          activeTab: activeTab
        });
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, activeTab]);

  // Debounced activity log for filter
  useEffect(() => {
    if (statusFilter !== 'all') {
      const timeoutId = setTimeout(() => {
        createActivityLog(29, 5, `Filtered tracking data by status: ${statusFilter}`, {
          statusFilter: statusFilter,
          activeTab: activeTab
        });
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [statusFilter, activeTab]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 hover:bg-blue-50">
          <Send className="h-3 w-3 mr-1" />
          Sent
        </Badge>;
      case 'replied':
        return <Badge className="bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50">
          <Reply className="h-3 w-3 mr-1" />
          Replied
        </Badge>;
      case 'interested':
        return <Badge className="bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50">
          <ThumbsUp className="h-3 w-3 mr-1" />
          Interested
        </Badge>;
      case 'not_interested':
        return <Badge className="bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200 hover:bg-red-50">
          <ThumbsDown className="h-3 w-3 mr-1" />
          Not Interested
        </Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600">{status || 'Unknown'}</Badge>;
    }
  };

  const viewDetails = (item: TrackingItem) => {
    createActivityLog(11, 5, `Viewed tracking details for: ${item.company_name}`, {
      buyer_id: item.buyer_id,
      company_name: item.company_name,
      country: item.country,
      product_name: item.product_name,
      current_status: item.current_status,
      interaction_count: item.interaction_count
    });
    navigate(`/trackingindetail/${item.buyer_id}`);
  };

  const handleTabChange = (tab: string) => {
    const tabNames: Record<string, string> = {
      sent: 'Sent',
      replied: 'Replied',
      interested: 'Interested',
      not_interested: 'Not Interested'
    };
    createActivityLog(30, 5, `Switched to ${tabNames[tab] || tab} tab`, {
      tab: tab,
      tabName: tabNames[tab] || tab,
      count: filteredData.length
    });
    setActiveTab(tab);
  };

  const handleCardClick = (tab: string) => {
    const tabNames: Record<string, string> = {
      sent: 'Sent',
      replied: 'Replied',
      interested: 'Interested',
      not_interested: 'Not Interested'
    };
    createActivityLog(24, 5, `Clicked on ${tabNames[tab] || tab} card to filter`, {
      tab: tab,
      tabName: tabNames[tab] || tab,
      count: counts[tab as keyof Counts] || 0
    });
    setActiveTab(tab);
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-xl opacity-20 animate-pulse" />
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto relative" />
          </div>
          <p className="mt-6 text-sm font-medium text-muted-foreground animate-pulse">
            Loading tracking data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-full w-fit mx-auto mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Data</h3>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => { setPage(1); fetchTrackingData(); }} className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 p-6">
      {/* Decorative gradient header */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Email Tracking Dashboard
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <Activity className="h-4 w-4" />
                Track all email communications and buyer responses
                <span className="text-xs text-muted-foreground ml-2">
                  ({pagination.totalItems} total buyers)
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card 
            className={`cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 bg-gradient-to-br from-blue-50 to-indigo-50 ${activeTab === 'sent' ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
            onClick={() => handleCardClick('sent')}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="p-2.5 bg-white rounded-xl shadow-sm w-fit mx-auto mb-3">
                  <Send className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-700">{counts.sent}</p>
                <p className="text-xs font-medium text-blue-600/70 uppercase tracking-wider mt-1">Sent</p>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 bg-gradient-to-br from-emerald-50 to-green-50 ${activeTab === 'replied' ? 'ring-2 ring-emerald-500 shadow-lg' : ''}`}
            onClick={() => handleCardClick('replied')}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="p-2.5 bg-white rounded-xl shadow-sm w-fit mx-auto mb-3">
                  <Reply className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-emerald-700">{counts.replied}</p>
                <p className="text-xs font-medium text-emerald-600/70 uppercase tracking-wider mt-1">Replied</p>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 bg-gradient-to-br from-emerald-50 to-teal-50 ${activeTab === 'interested' ? 'ring-2 ring-emerald-500 shadow-lg' : ''}`}
            onClick={() => handleCardClick('interested')}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="p-2.5 bg-white rounded-xl shadow-sm w-fit mx-auto mb-3">
                  <ThumbsUp className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-emerald-700">{counts.interested}</p>
                <p className="text-xs font-medium text-emerald-600/70 uppercase tracking-wider mt-1">Interested</p>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 bg-gradient-to-br from-red-50 to-rose-50 ${activeTab === 'not_interested' ? 'ring-2 ring-red-500 shadow-lg' : ''}`}
            onClick={() => handleCardClick('not_interested')}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="p-2.5 bg-white rounded-xl shadow-sm w-fit mx-auto mb-3">
                  <ThumbsDown className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-red-700">{counts.not_interested}</p>
                <p className="text-xs font-medium text-red-600/70 uppercase tracking-wider mt-1">Not Interested</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
              <Input
                placeholder="Search company, product or country..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl bg-white/80"
              />
            </div>
            <div className="relative">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 border-gray-200 focus:border-blue-400 rounded-xl bg-white/80">
                  <Filter className="h-4 w-4 mr-2 text-blue-500" />
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📊 All Statuses</SelectItem>
                  {statuses.map(s => (
                    <SelectItem key={s} value={s}>
                      {s === 'sent' && '📤 Sent'}
                      {s === 'interested' && '👍 Interested'}
                      {s === 'not_interested' && '👎 Not Interested'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                <Activity className="h-3.5 w-3.5 text-blue-500" />
                Showing: <span className="font-semibold text-gray-700">{filteredData.length}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 gap-2 bg-transparent p-0 mb-6">
            <TabsTrigger 
              value="sent" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl py-3 gap-2 bg-white/50 border border-gray-200"
            >
              <Send className="h-4 w-4" />
              Sent
              <Badge className="ml-1 bg-white/20 text-white border-0">{counts.sent}</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="replied" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl py-3 gap-2 bg-white/50 border border-gray-200"
            >
              <Reply className="h-4 w-4" />
              Replied
              <Badge className="ml-1 bg-white/20 text-white border-0">{counts.replied}</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="interested" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl py-3 gap-2 bg-white/50 border border-gray-200"
            >
              <ThumbsUp className="h-4 w-4" />
              Interested
              <Badge className="ml-1 bg-white/20 text-white border-0">{counts.interested}</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="not_interested" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl py-3 gap-2 bg-white/50 border border-gray-200"
            >
              <ThumbsDown className="h-4 w-4" />
              Not Interested
              <Badge className="ml-1 bg-white/20 text-white border-0">{counts.not_interested}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Sent Tab - FIXED: Only shows items with current_status = 'sent' */}
          <TabsContent value="sent">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-b border-gray-200">
                      <th className="p-4 text-left font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-blue-500" />
                          Company
                        </div>
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-blue-500" />
                          Country
                        </div>
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-500" />
                          Product
                        </div>
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          Status
                        </div>
                      </th>
                      <th className="p-4 text-center font-semibold text-gray-700">
                        <div className="flex items-center justify-center gap-2">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          Interactions
                        </div>
                      </th>
                      <th className="p-4 text-center font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr 
                        key={item.buyer_id} 
                        className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
                              {item.company_name?.charAt(0) || 'C'}
                            </div>
                            <span className="font-medium text-gray-800">{item.company_name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg text-xs">
                            {item.country}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-gray-600">{item.product_name}</span>
                        </td>
                        <td className="p-4">{getStatusBadge(item.current_status)}</td>
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
                            <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                            <span className="font-bold text-blue-700">{item.interaction_count || 0}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1.5 h-9 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded-lg transition-colors"
                            onClick={() => viewDetails(item)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                            <ArrowUpRight className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-gray-50 rounded-full">
                              <Mail className="h-10 w-10 text-gray-400" />
                            </div>
                            <p className="text-muted-foreground font-medium">No sent emails found</p>
                            <p className="text-sm text-muted-foreground/70">Start sending emails to track them here</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredData.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{filteredData.length}</span> sent emails
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                      <Send className="h-3.5 w-3.5 text-blue-500" />
                      Total: <span className="font-semibold text-gray-700">{counts.sent}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Replied Tab - FIXED: Only shows items with current_status = 'replied' */}
          <TabsContent value="replied">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-emerald-50/80 to-green-50/80 border-b border-gray-200">
                      <th className="p-4 text-left font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-emerald-500" />
                          Company
                        </div>
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-emerald-500" />
                          Country
                        </div>
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-emerald-500" />
                          Product
                        </div>
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-emerald-500" />
                          Status
                        </div>
                      </th>
                      <th className="p-4 text-center font-semibold text-gray-700">
                        <div className="flex items-center justify-center gap-2">
                          <MessageSquare className="h-4 w-4 text-emerald-500" />
                          Interactions
                        </div>
                      </th>
                      <th className="p-4 text-center font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr 
                        key={item.buyer_id} 
                        className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-green-50/50 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-100 to-green-100 flex items-center justify-center text-emerald-600 font-semibold text-xs">
                              {item.company_name?.charAt(0) || 'C'}
                            </div>
                            <span className="font-medium text-gray-800">{item.company_name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg text-xs">
                            {item.country}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-gray-600">{item.product_name}</span>
                        </td>
                        <td className="p-4">{getStatusBadge(item.current_status)}</td>
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                            <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="font-bold text-emerald-700">{item.interaction_count || 0}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1.5 h-9 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 rounded-lg transition-colors"
                            onClick={() => viewDetails(item)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                            <ArrowUpRight className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-gray-50 rounded-full">
                              <Reply className="h-10 w-10 text-gray-400" />
                            </div>
                            <p className="text-muted-foreground font-medium">No replied emails found</p>
                            <p className="text-sm text-muted-foreground/70">Replies will appear here once received</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredData.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-emerald-50/50">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{filteredData.length}</span> replied emails
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                      <Reply className="h-3.5 w-3.5 text-emerald-500" />
                      Total: <span className="font-semibold text-gray-700">{counts.replied}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Interested Tab - FIXED: Only shows items with current_status = 'interested' */}
          <TabsContent value="interested">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border-b border-gray-200">
                      <th className="p-4 text-left font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-emerald-500" />
                          Company
                        </div>
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-emerald-500" />
                          Country
                        </div>
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-emerald-500" />
                          Product
                        </div>
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-emerald-500" />
                          Status
                        </div>
                      </th>
                      <th className="p-4 text-center font-semibold text-gray-700">
                        <div className="flex items-center justify-center gap-2">
                          <MessageSquare className="h-4 w-4 text-emerald-500" />
                          Interactions
                        </div>
                      </th>
                      <th className="p-4 text-center font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr 
                        key={item.buyer_id} 
                        className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-600 font-semibold text-xs">
                              {item.company_name?.charAt(0) || 'C'}
                            </div>
                            <span className="font-medium text-gray-800">{item.company_name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg text-xs">
                            {item.country}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-gray-600">{item.product_name}</span>
                        </td>
                        <td className="p-4">{getStatusBadge(item.current_status)}</td>
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                            <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="font-bold text-emerald-700">{item.interaction_count || 0}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1.5 h-9 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 rounded-lg transition-colors"
                            onClick={() => viewDetails(item)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                            <ArrowUpRight className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-gray-50 rounded-full">
                              <ThumbsUp className="h-10 w-10 text-gray-400" />
                            </div>
                            <p className="text-muted-foreground font-medium">No interested responses</p>
                            <p className="text-sm text-muted-foreground/70">Interested buyers will appear here</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredData.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-emerald-50/50">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{filteredData.length}</span> interested responses
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                      <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />
                      Total: <span className="font-semibold text-gray-700">{counts.interested}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Not Interested Tab - FIXED: Only shows items with current_status = 'not_interested' */}
          <TabsContent value="not_interested">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-red-50/80 to-rose-50/80 border-b border-gray-200">
                      <th className="p-4 text-left font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-red-500" />
                          Company
                        </div>
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-red-500" />
                          Country
                        </div>
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-red-500" />
                          Product
                        </div>
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-red-500" />
                          Status
                        </div>
                      </th>
                      <th className="p-4 text-center font-semibold text-gray-700">
                        <div className="flex items-center justify-center gap-2">
                          <MessageSquare className="h-4 w-4 text-red-500" />
                          Interactions
                        </div>
                      </th>
                      <th className="p-4 text-center font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr 
                        key={item.buyer_id} 
                        className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-red-50/50 hover:to-rose-50/50 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-100 to-rose-100 flex items-center justify-center text-red-600 font-semibold text-xs">
                              {item.company_name?.charAt(0) || 'C'}
                            </div>
                            <span className="font-medium text-gray-800">{item.company_name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg text-xs">
                            {item.country}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-gray-600">{item.product_name}</span>
                        </td>
                        <td className="p-4">{getStatusBadge(item.current_status)}</td>
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full">
                            <MessageSquare className="h-3.5 w-3.5 text-red-500" />
                            <span className="font-bold text-red-700">{item.interaction_count || 0}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1.5 h-9 px-4 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 rounded-lg transition-colors"
                            onClick={() => viewDetails(item)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                            <ArrowUpRight className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-gray-50 rounded-full">
                              <ThumbsDown className="h-10 w-10 text-gray-400" />
                            </div>
                            <p className="text-muted-foreground font-medium">No not interested responses</p>
                            <p className="text-sm text-muted-foreground/70">Buyers who are not interested will appear here</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredData.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-red-50/50">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{filteredData.length}</span> not interested responses
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                      <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
                      Total: <span className="font-semibold text-gray-700">{counts.not_interested}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                      className={pageNum === pagination.currentPage ? 
                        "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" : 
                        "hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      }
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {pagination.itemsPerPage} per page
            </div>
          </div>
        )}
      </div>
    </div>
  );
}