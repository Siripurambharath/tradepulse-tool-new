import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, Eye, Send, Reply, ThumbsUp, ThumbsDown, 
  AlertCircle, MessageSquare,
  Mail, Activity,
  BarChart3, Filter, ArrowUpRight,
  Building2, Package, Globe,
  RefreshCw, ChevronLeft, ChevronRight,
  Hash
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
  hsn_code: string;
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
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Search logging functions
  const logSearch = (searchValue: string) => {
    if (!searchValue || searchValue.length < 2) return;
    
    let actionId = 42;
    let searchType = 'HSN';
    const lowerValue = searchValue.toLowerCase();
    
    const companyMatch = trackingData.sent.some(item => 
      item.company_name?.toLowerCase().includes(lowerValue)
    ) || trackingData.replied.some(item => 
      item.company_name?.toLowerCase().includes(lowerValue)
    ) || trackingData.interested.some(item => 
      item.company_name?.toLowerCase().includes(lowerValue)
    ) || trackingData.not_interested.some(item => 
      item.company_name?.toLowerCase().includes(lowerValue)
    );
    
    const productMatch = trackingData.sent.some(item => 
      item.product_name?.toLowerCase().includes(lowerValue)
    ) || trackingData.replied.some(item => 
      item.product_name?.toLowerCase().includes(lowerValue)
    ) || trackingData.interested.some(item => 
      item.product_name?.toLowerCase().includes(lowerValue)
    ) || trackingData.not_interested.some(item => 
      item.product_name?.toLowerCase().includes(lowerValue)
    );
    
    const countryMatch = trackingData.sent.some(item => 
      item.country?.toLowerCase().includes(lowerValue)
    ) || trackingData.replied.some(item => 
      item.country?.toLowerCase().includes(lowerValue)
    ) || trackingData.interested.some(item => 
      item.country?.toLowerCase().includes(lowerValue)
    ) || trackingData.not_interested.some(item => 
      item.country?.toLowerCase().includes(lowerValue)
    );
    
    const hsnMatch = trackingData.sent.some(item => 
      item.hsn_code?.toLowerCase().includes(lowerValue)
    ) || trackingData.replied.some(item => 
      item.hsn_code?.toLowerCase().includes(lowerValue)
    ) || trackingData.interested.some(item => 
      item.hsn_code?.toLowerCase().includes(lowerValue)
    ) || trackingData.not_interested.some(item => 
      item.hsn_code?.toLowerCase().includes(lowerValue)
    );
    
    if (companyMatch) {
      actionId = 43;
      searchType = 'Company';
    } else if (productMatch) {
      actionId = 44;
      searchType = 'Product';
    } else if (countryMatch) {
      actionId = 45;
      searchType = 'Country';
    } else if (hsnMatch) {
      actionId = 42;
      searchType = 'HSN';
    }
    
    createActivityLog(actionId, 5, `Searched by ${searchType}: ${searchValue}`, {
      searchType: searchType,
      searchValue: searchValue
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setPage(1);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (value && value.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        logSearch(value);
      }, 500);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (searchQuery && searchQuery.length >= 2) {
        logSearch(searchQuery);
      }
    }
  };

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

      const params: any = {
        seller_id: sellerId,
        page: page,
        limit: perPage
      };

      if (searchQuery && searchQuery.trim() !== '') {
        params.search = searchQuery.trim();
      }

      const response = await axios.get(`${API_URL}/api/tracking/page`, { params });
      
      if (response.data.success) {
        setTrackingData(response.data.data);
        setCounts(response.data.counts);
        setPagination(response.data.pagination);
      }

      createActivityLog(31, 5, 'Viewed tracking Table page');

    } catch (error: any) {
      console.error('Error fetching tracking data:', error);
      setError(error.message || 'Error loading tracking data');
    } finally {
      setLoading(false);
    }
  }, [getSellerId, page, searchQuery]);

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

  useEffect(() => {
    fetchTrackingData();
    fetchCounts();
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [fetchTrackingData, fetchCounts]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const filteredData = useMemo(() => {
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
    
    if (statusFilter !== 'all') {
      allData = allData.filter(item => item.current_status === statusFilter);
    }
    
    return allData;
  }, [activeTab, trackingData, statusFilter]);

  useEffect(() => {
    if (statusFilter !== 'all') {
      createActivityLog(29, 5, `Filtered tracking data by status: ${statusFilter}`, {
        statusFilter: statusFilter,
        activeTab: activeTab
      });
    }
  }, [statusFilter, activeTab]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-[#8EE147]/20 text-[#0E223B] border border-[#8EE147]/30 hover:bg-[#8EE147]/30">
          <Send className="h-3 w-3 mr-1" style={{ color: '#8EE147' }} />
          Sent
        </Badge>;
      case 'replied':
        return <Badge className="bg-[#8EE147]/20 text-[#0E223B] border border-[#8EE147]/30 hover:bg-[#8EE147]/30">
          <Reply className="h-3 w-3 mr-1" style={{ color: '#8EE147' }} />
          Replied
        </Badge>;
      case 'interested':
        return <Badge className="bg-[#8EE147]/20 text-[#0E223B] border border-[#8EE147]/30 hover:bg-[#8EE147]/30">
          <ThumbsUp className="h-3 w-3 mr-1" style={{ color: '#8EE147' }} />
          Interested
        </Badge>;
      case 'not_interested':
        return <Badge className="bg-red-500/20 text-red-700 border border-red-500/30 hover:bg-red-500/30">
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
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ backgroundColor: '#0E223B' }}>
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-xl opacity-20 animate-pulse" style={{ background: 'linear-gradient(to right, #8EE147, #6EC035)' }} />
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 mx-auto relative" style={{ borderColor: '#8EE14720', borderTopColor: '#8EE147' }} />
          </div>
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm font-medium animate-pulse" style={{ color: '#94A3B8' }}>
            Loading tracking data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ backgroundColor: '#0E223B' }}>
        <div className="bg-[#0E223B] rounded-2xl shadow-xl border border-white/10 p-4 sm:p-6 md:p-8 max-w-md w-full text-center mx-4">
          <div className="p-3 sm:p-4 bg-red-500/10 rounded-full w-fit mx-auto mb-3 sm:mb-4">
            <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Error Loading Data</h3>
          <p className="text-xs sm:text-sm text-slate-400 mb-4 sm:mb-6">{error}</p>
          <Button onClick={() => { setPage(1); fetchTrackingData(); }} className="gap-2 bg-[#8EE147] text-[#0E223B] hover:bg-[#6EC035] text-sm sm:text-base">
            <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6" style={{ backgroundColor: '#0E223B' }}>
      {/* Decorative gradient header */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8EE147] via-[#6EC035] to-[#5AA82E]" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="p-2 sm:p-2.5 bg-gradient-to-r from-[#8EE147] to-[#6EC035] rounded-xl shadow-lg">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-[#0E223B]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#8EE147] to-[#6EC035] bg-clip-text text-transparent">
                Email Tracking Dashboard
              </h1>
              <p className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1" style={{ color: '#94A3B8' }}>
                <Activity className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: '#8EE147' }} />
                <span className="hidden xs:inline">Track all email communications and buyer responses</span>
                <span className="xs:hidden">Track email communications</span>
                <span className="text-[10px] sm:text-xs ml-1 sm:ml-2" style={{ color: '#64748B' }}>
                  ({pagination.totalItems} total buyers)
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Email Tracking Summary Cards - Dark Theme */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 mb-3 sm:mb-4 md:mb-6">
          <Card 
            className={`cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 bg-gradient-to-br from-[#0E223B] to-[#1A3355] shadow-lg border border-white/10 ${activeTab === 'sent' ? 'ring-2 ring-[#8EE147] shadow-[#8EE147]/20' : ''}`}
            onClick={() => handleCardClick('sent')}
          >
            <CardContent className="pt-2 sm:pt-3 md:pt-4 pb-2 sm:pb-3 md:pb-4">
              <div className="text-center">
                <div className="p-1 sm:p-1.5 md:p-2 bg-[#8EE147]/10 rounded-lg sm:rounded-xl shadow-sm w-fit mx-auto mb-0.5 sm:mb-1 md:mb-2 border border-[#8EE147]/20">
                  <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" style={{ color: '#8EE147' }} />
                </div>
                <p className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-white">{counts.sent}</p>
                <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-[#8EE147]/70 uppercase tracking-wider mt-0 sm:mt-0.5">Sent</p>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 bg-gradient-to-br from-[#0E223B] to-[#1A3355] shadow-lg border border-white/10 ${activeTab === 'replied' ? 'ring-2 ring-[#8EE147] shadow-[#8EE147]/20' : ''}`}
            onClick={() => handleCardClick('replied')}
          >
            <CardContent className="pt-2 sm:pt-3 md:pt-4 pb-2 sm:pb-3 md:pb-4">
              <div className="text-center">
                <div className="p-1 sm:p-1.5 md:p-2 bg-[#8EE147]/10 rounded-lg sm:rounded-xl shadow-sm w-fit mx-auto mb-0.5 sm:mb-1 md:mb-2 border border-[#8EE147]/20">
                  <Reply className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" style={{ color: '#8EE147' }} />
                </div>
                <p className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-white">{counts.replied}</p>
                <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-[#8EE147]/70 uppercase tracking-wider mt-0 sm:mt-0.5">Replied</p>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 bg-gradient-to-br from-[#0E223B] to-[#1A3355] shadow-lg border border-white/10 ${activeTab === 'interested' ? 'ring-2 ring-[#8EE147] shadow-[#8EE147]/20' : ''}`}
            onClick={() => handleCardClick('interested')}
          >
            <CardContent className="pt-2 sm:pt-3 md:pt-4 pb-2 sm:pb-3 md:pb-4">
              <div className="text-center">
                <div className="p-1 sm:p-1.5 md:p-2 bg-[#8EE147]/10 rounded-lg sm:rounded-xl shadow-sm w-fit mx-auto mb-0.5 sm:mb-1 md:mb-2 border border-[#8EE147]/20">
                  <ThumbsUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" style={{ color: '#8EE147' }} />
                </div>
                <p className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-white">{counts.interested}</p>
                <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-[#8EE147]/70 uppercase tracking-wider mt-0 sm:mt-0.5">Interested</p>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 bg-gradient-to-br from-[#0E223B] to-[#1A3355] shadow-lg border border-white/10 ${activeTab === 'not_interested' ? 'ring-2 ring-red-500 shadow-red-500/20' : ''}`}
            onClick={() => handleCardClick('not_interested')}
          >
            <CardContent className="pt-2 sm:pt-3 md:pt-4 pb-2 sm:pb-3 md:pb-4">
              <div className="text-center">
                <div className="p-1 sm:p-1.5 md:p-2 bg-red-500/10 rounded-lg sm:rounded-xl shadow-sm w-fit mx-auto mb-0.5 sm:mb-1 md:mb-2 border border-red-500/20">
                  <ThumbsDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-red-400" />
                </div>
                <p className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-white">{counts.not_interested}</p>
                <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-red-400/70 uppercase tracking-wider mt-0 sm:mt-0.5">Not Int.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar - Dark Theme */}
        <div className="bg-[#0E223B]/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
            <div className="relative flex-1 min-w-[150px] sm:min-w-[200px]">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: '#8EE147' }} />
              <Input
                placeholder="Search by company, product, country or HSN code..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                className="pl-8 sm:pl-10 border-white/10 focus:border-[#8EE147] focus:ring-[#8EE147]/20 rounded-xl bg-white/5 text-white text-sm sm:text-base h-9 sm:h-10 placeholder:text-slate-500"
              />
            </div>
            <div className="relative w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 border-white/10 focus:border-[#8EE147] rounded-xl bg-white/5 text-white h-9 sm:h-10 text-sm sm:text-base">
                  <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" style={{ color: '#8EE147' }} />
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-[#0E223B] border-white/10 text-white">
                  <SelectItem value="all">📊 All Statuses</SelectItem>
                  {statuses.map(s => (
                    <SelectItem key={s} value={s}>
                      {s === 'sent' && '📤 Sent'}
                      {s === 'replied' && '💬 Replied'}
                      {s === 'interested' && '👍 Interested'}
                      {s === 'not_interested' && '👎 Not Interested'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ml-auto">
              <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/5 rounded-lg shadow-sm border border-white/10">
                <Activity className="h-3 w-3 sm:h-3.5 sm:w-3.5" style={{ color: '#8EE147' }} />
                <span className="hidden xs:inline text-slate-400">Showing:</span>
                <span className="font-semibold text-white">{filteredData.length}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tabs - Dark Theme */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 bg-transparent p-0 mb-3 sm:mb-4 md:mb-6">
            <TabsTrigger 
              value="sent" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#8EE147] data-[state=active]:to-[#6EC035] data-[state=active]:text-[#0E223B] data-[state=active]:shadow-lg transition-all duration-300 rounded-xl py-2 sm:py-3 px-1 sm:px-3 gap-1 sm:gap-2 bg-white/5 border border-white/10 text-[10px] sm:text-xs md:text-sm flex-1 min-w-0 text-slate-400"
            >
              <Send className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">Sent</span>
              <Badge className="ml-0.5 sm:ml-1 bg-white/20 text-white border-0 text-[10px] sm:text-xs flex-shrink-0">{counts.sent}</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="replied" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#8EE147] data-[state=active]:to-[#6EC035] data-[state=active]:text-[#0E223B] data-[state=active]:shadow-lg transition-all duration-300 rounded-xl py-2 sm:py-3 px-1 sm:px-3 gap-1 sm:gap-2 bg-white/5 border border-white/10 text-[10px] sm:text-xs md:text-sm flex-1 min-w-0 text-slate-400"
            >
              <Reply className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">Replied</span>
              <Badge className="ml-0.5 sm:ml-1 bg-white/20 text-white border-0 text-[10px] sm:text-xs flex-shrink-0">{counts.replied}</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="interested" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#8EE147] data-[state=active]:to-[#6EC035] data-[state=active]:text-[#0E223B] data-[state=active]:shadow-lg transition-all duration-300 rounded-xl py-2 sm:py-3 px-1 sm:px-3 gap-1 sm:gap-2 bg-white/5 border border-white/10 text-[10px] sm:text-xs md:text-sm flex-1 min-w-0 text-slate-400"
            >
              <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">Interested</span>
              <Badge className="ml-0.5 sm:ml-1 bg-white/20 text-white border-0 text-[10px] sm:text-xs flex-shrink-0">{counts.interested}</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="not_interested" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl py-2 sm:py-3 px-1 sm:px-3 gap-1 sm:gap-2 bg-white/5 border border-white/10 text-[10px] sm:text-xs md:text-sm flex-1 min-w-0 text-slate-400"
            >
              <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden xs:inline truncate">Not Interested</span>
              <span className="xs:hidden truncate">Not Int.</span>
              <Badge className="ml-0.5 sm:ml-1 bg-white/20 text-white border-0 text-[10px] sm:text-xs flex-shrink-0">{counts.not_interested}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Sent Tab - Dark Theme */}
          <TabsContent value="sent">
            <div className="bg-[#0E223B]/50 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#8EE147]/10 to-[#6EC035]/10 border-b border-white/10">
                      <th className="p-3 sm:p-4 text-left font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" style={{ color: '#8EE147' }} />
                          Company
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-left font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" style={{ color: '#8EE147' }} />
                          Country
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-left font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" style={{ color: '#8EE147' }} />
                          Product
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-left font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4" style={{ color: '#8EE147' }} />
                          HSN Code
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-left font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" style={{ color: '#8EE147' }} />
                          Status
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-center font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <MessageSquare className="h-4 w-4" style={{ color: '#8EE147' }} />
                          Interactions
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-center font-semibold text-slate-300 whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr 
                        key={item.buyer_id} 
                        className={`border-b border-white/5 hover:bg-gradient-to-r hover:from-[#8EE147]/10 hover:to-[#6EC035]/10 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white/5' : 'bg-white/5'
                        }`}
                      >
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-[#8EE147]/20 to-[#6EC035]/20 flex items-center justify-center font-semibold text-xs flex-shrink-0" style={{ color: '#8EE147' }}>
                              {item.company_name?.charAt(0) || 'C'}
                            </div>
                            <span className="font-medium text-white text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[150px]">
                              {item.company_name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg text-xs whitespace-nowrap text-slate-300">
                            {item.country}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className="text-slate-300 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[120px] block">
                            {item.product_name}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#8EE147]/20 text-[#8EE147] rounded-lg text-xs font-medium whitespace-nowrap">
                            {item.hsn_code || '-'}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4">{getStatusBadge(item.current_status)}</td>
                        <td className="p-3 sm:p-4 text-center">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#8EE147]/10 rounded-full whitespace-nowrap border border-[#8EE147]/20">
                            <MessageSquare className="h-3.5 w-3.5" style={{ color: '#8EE147' }} />
                            <span className="font-bold" style={{ color: '#8EE147' }}>{item.interaction_count || 0}</span>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1.5 h-8 sm:h-9 px-3 sm:px-4 bg-[#8EE147]/10 hover:bg-[#8EE147]/20 text-[#8EE147] hover:text-[#8EE147] rounded-lg transition-colors text-xs sm:text-sm"
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
                        <td colSpan={7} className="text-center py-8 sm:py-10 md:py-12">
                          <div className="flex flex-col items-center gap-2 sm:gap-3">
                            <div className="p-3 sm:p-4 bg-white/5 rounded-full">
                              <Mail className="h-8 w-8 sm:h-10 sm:w-10" style={{ color: '#64748B' }} />
                            </div>
                            <p className="text-xs sm:text-sm text-slate-400 font-medium">No sent emails found</p>
                            <p className="text-[10px] sm:text-xs text-slate-500">Start sending emails to track them here</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredData.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 border-t border-white/10 bg-gradient-to-r from-[#8EE147]/5 to-[#6EC035]/5">
                  <p className="text-xs sm:text-sm text-slate-400">
                    Showing <span className="font-semibold text-white">{filteredData.length}</span> sent emails
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg shadow-sm border border-white/10 whitespace-nowrap text-slate-300">
                      <Send className="h-3.5 w-3.5" style={{ color: '#8EE147' }} />
                      Total: <span className="font-semibold text-white">{counts.sent}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Replied Tab - Dark Theme */}
          <TabsContent value="replied">
            <div className="bg-[#0E223B]/50 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#8EE147]/10 to-[#6EC035]/10 border-b border-white/10">
                      <th className="p-3 sm:p-4 text-left font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" style={{ color: '#8EE147' }} />
                          Company
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-left font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" style={{ color: '#8EE147' }} />
                          Country
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-left font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" style={{ color: '#8EE147' }} />
                          Product
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-left font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4" style={{ color: '#8EE147' }} />
                          HSN Code
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-left font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" style={{ color: '#8EE147' }} />
                          Status
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-center font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <MessageSquare className="h-4 w-4" style={{ color: '#8EE147' }} />
                          Interactions
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-center font-semibold text-slate-300 whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr 
                        key={item.buyer_id} 
                        className={`border-b border-white/5 hover:bg-gradient-to-r hover:from-[#8EE147]/10 hover:to-[#6EC035]/10 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white/5' : 'bg-white/5'
                        }`}
                      >
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-[#8EE147]/20 to-[#6EC035]/20 flex items-center justify-center font-semibold text-xs flex-shrink-0" style={{ color: '#8EE147' }}>
                              {item.company_name?.charAt(0) || 'C'}
                            </div>
                            <span className="font-medium text-white text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[150px]">
                              {item.company_name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg text-xs whitespace-nowrap text-slate-300">
                            {item.country}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className="text-slate-300 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[120px] block">
                            {item.product_name}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#8EE147]/20 text-[#8EE147] rounded-lg text-xs font-medium whitespace-nowrap">
                            {item.hsn_code || '-'}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4">{getStatusBadge(item.current_status)}</td>
                        <td className="p-3 sm:p-4 text-center">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#8EE147]/10 rounded-full whitespace-nowrap border border-[#8EE147]/20">
                            <MessageSquare className="h-3.5 w-3.5" style={{ color: '#8EE147' }} />
                            <span className="font-bold" style={{ color: '#8EE147' }}>{item.interaction_count || 0}</span>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1.5 h-8 sm:h-9 px-3 sm:px-4 bg-[#8EE147]/10 hover:bg-[#8EE147]/20 text-[#8EE147] hover:text-[#8EE147] rounded-lg transition-colors text-xs sm:text-sm"
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
                        <td colSpan={7} className="text-center py-8 sm:py-10 md:py-12">
                          <div className="flex flex-col items-center gap-2 sm:gap-3">
                            <div className="p-3 sm:p-4 bg-white/5 rounded-full">
                              <Reply className="h-8 w-8 sm:h-10 sm:w-10" style={{ color: '#64748B' }} />
                            </div>
                            <p className="text-xs sm:text-sm text-slate-400 font-medium">No replied emails found</p>
                            <p className="text-[10px] sm:text-xs text-slate-500">Replies will appear here once received</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredData.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 border-t border-white/10 bg-gradient-to-r from-[#8EE147]/5 to-[#6EC035]/5">
                  <p className="text-xs sm:text-sm text-slate-400">
                    Showing <span className="font-semibold text-white">{filteredData.length}</span> replied emails
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg shadow-sm border border-white/10 whitespace-nowrap text-slate-300">
                      <Reply className="h-3.5 w-3.5" style={{ color: '#8EE147' }} />
                      Total: <span className="font-semibold text-white">{counts.replied}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Interested Tab - Dark Theme */}
          <TabsContent value="interested">
            <div className="bg-[#0E223B]/50 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#8EE147]/10 to-[#6EC035]/10 border-b border-white/10">
                      <th className="p-3 sm:p-4 text-left font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" style={{ color: '#8EE147' }} />
                          Company
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-left font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" style={{ color: '#8EE147' }} />
                          Country
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-left font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" style={{ color: '#8EE147' }} />
                          Product
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-left font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4" style={{ color: '#8EE147' }} />
                          HSN Code
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-left font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" style={{ color: '#8EE147' }} />
                          Status
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-center font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <MessageSquare className="h-4 w-4" style={{ color: '#8EE147' }} />
                          Interactions
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-center font-semibold text-slate-300 whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr 
                        key={item.buyer_id} 
                        className={`border-b border-white/5 hover:bg-gradient-to-r hover:from-[#8EE147]/10 hover:to-[#6EC035]/10 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white/5' : 'bg-white/5'
                        }`}
                      >
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-[#8EE147]/20 to-[#6EC035]/20 flex items-center justify-center font-semibold text-xs flex-shrink-0" style={{ color: '#8EE147' }}>
                              {item.company_name?.charAt(0) || 'C'}
                            </div>
                            <span className="font-medium text-white text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[150px]">
                              {item.company_name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg text-xs whitespace-nowrap text-slate-300">
                            {item.country}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className="text-slate-300 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[120px] block">
                            {item.product_name}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#8EE147]/20 text-[#8EE147] rounded-lg text-xs font-medium whitespace-nowrap">
                            {item.hsn_code || '-'}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4">{getStatusBadge(item.current_status)}</td>
                        <td className="p-3 sm:p-4 text-center">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#8EE147]/10 rounded-full whitespace-nowrap border border-[#8EE147]/20">
                            <MessageSquare className="h-3.5 w-3.5" style={{ color: '#8EE147' }} />
                            <span className="font-bold" style={{ color: '#8EE147' }}>{item.interaction_count || 0}</span>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1.5 h-8 sm:h-9 px-3 sm:px-4 bg-[#8EE147]/10 hover:bg-[#8EE147]/20 text-[#8EE147] hover:text-[#8EE147] rounded-lg transition-colors text-xs sm:text-sm"
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
                        <td colSpan={7} className="text-center py-8 sm:py-10 md:py-12">
                          <div className="flex flex-col items-center gap-2 sm:gap-3">
                            <div className="p-3 sm:p-4 bg-white/5 rounded-full">
                              <ThumbsUp className="h-8 w-8 sm:h-10 sm:w-10" style={{ color: '#64748B' }} />
                            </div>
                            <p className="text-xs sm:text-sm text-slate-400 font-medium">No interested responses</p>
                            <p className="text-[10px] sm:text-xs text-slate-500">Interested buyers will appear here</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredData.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 border-t border-white/10 bg-gradient-to-r from-[#8EE147]/5 to-[#6EC035]/5">
                  <p className="text-xs sm:text-sm text-slate-400">
                    Showing <span className="font-semibold text-white">{filteredData.length}</span> interested responses
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg shadow-sm border border-white/10 whitespace-nowrap text-slate-300">
                      <ThumbsUp className="h-3.5 w-3.5" style={{ color: '#8EE147' }} />
                      Total: <span className="font-semibold text-white">{counts.interested}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Not Interested Tab - Dark Theme */}
          <TabsContent value="not_interested">
            <div className="bg-[#0E223B]/50 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-red-500/10 to-rose-500/10 border-b border-white/10">
                      <th className="p-3 sm:p-4 text-left font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-red-400" />
                          Company
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-left font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-red-400" />
                          Country
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-left font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-red-400" />
                          Product
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-left font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-red-400" />
                          HSN Code
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-left font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-red-400" />
                          Status
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-center font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <MessageSquare className="h-4 w-4 text-red-400" />
                          Interactions
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-center font-semibold text-slate-300 whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr 
                        key={item.buyer_id} 
                        className={`border-b border-white/5 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-rose-500/10 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white/5' : 'bg-white/5'
                        }`}
                      >
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-red-500/20 to-rose-500/20 flex items-center justify-center font-semibold text-xs flex-shrink-0 text-red-400">
                              {item.company_name?.charAt(0) || 'C'}
                            </div>
                            <span className="font-medium text-white text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[150px]">
                              {item.company_name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg text-xs whitespace-nowrap text-slate-300">
                            {item.country}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className="text-slate-300 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[120px] block">
                            {item.product_name}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#8EE147]/20 text-[#8EE147] rounded-lg text-xs font-medium whitespace-nowrap">
                            {item.hsn_code || '-'}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4">{getStatusBadge(item.current_status)}</td>
                        <td className="p-3 sm:p-4 text-center">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-full whitespace-nowrap border border-red-500/20">
                            <MessageSquare className="h-3.5 w-3.5 text-red-400" />
                            <span className="font-bold text-red-400">{item.interaction_count || 0}</span>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1.5 h-8 sm:h-9 px-3 sm:px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-400 rounded-lg transition-colors text-xs sm:text-sm"
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
                        <td colSpan={7} className="text-center py-8 sm:py-10 md:py-12">
                          <div className="flex flex-col items-center gap-2 sm:gap-3">
                            <div className="p-3 sm:p-4 bg-white/5 rounded-full">
                              <ThumbsDown className="h-8 w-8 sm:h-10 sm:w-10" style={{ color: '#64748B' }} />
                            </div>
                            <p className="text-xs sm:text-sm text-slate-400 font-medium">No not interested responses</p>
                            <p className="text-[10px] sm:text-xs text-slate-500">Buyers who are not interested will appear here</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredData.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 border-t border-white/10 bg-gradient-to-r from-red-500/5 to-rose-500/5">
                  <p className="text-xs sm:text-sm text-slate-400">
                    Showing <span className="font-semibold text-white">{filteredData.length}</span> not interested responses
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg shadow-sm border border-white/10 whitespace-nowrap text-slate-300">
                      <ThumbsDown className="h-3.5 w-3.5 text-red-400" />
                      Total: <span className="font-semibold text-white">{counts.not_interested}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Pagination Controls - Dark Theme */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10">
            <div className="text-xs sm:text-sm text-slate-400 order-2 sm:order-1">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="hover:bg-[#8EE147]/10 hover:border-[#8EE147]/30 transition-colors h-8 sm:h-9 px-2.5 sm:px-3 text-white border-white/20"
              >
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <div className="flex gap-0.5 sm:gap-1">
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
                      className={`h-8 sm:h-9 w-8 sm:w-9 p-0 text-xs ${
                        pageNum === pagination.currentPage ? 
                          "bg-gradient-to-r from-[#8EE147] to-[#6EC035] text-[#0E223B] hover:from-[#7DD13A] hover:to-[#5AA82E]" : 
                          "hover:bg-[#8EE147]/10 hover:border-[#8EE147]/30 transition-colors text-white border-white/20"
                      }`}
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
                className="hover:bg-[#8EE147]/10 hover:border-[#8EE147]/30 transition-colors h-8 sm:h-9 px-2.5 sm:px-3 text-white border-white/20"
              >
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
            <div className="text-xs sm:text-sm text-slate-400 order-3">
              {pagination.itemsPerPage} per page
            </div>
          </div>
        )}
      </div>
    </div>
  );
}