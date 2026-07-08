import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Send, Reply, ThumbsUp, ThumbsDown, AlertCircle, MessageSquare } from 'lucide-react';
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
    not_interested: 0,
    not_contacted: 0,
    total_companies: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statuses = ['sent', 'interested', 'not_contacted'];
  
  useEffect(() => {
    fetchTrackingData();
    fetchCounts();
    // Log page view (action_id: 26 for Tracking Page View)
    createActivityLog(31, 5, 'Viewed tracking Table page');
  }, []);

  const getSellerId = () => {
    const sellerStr = localStorage.getItem('seller');
    if (!sellerStr) return null;
    try {
      const seller = JSON.parse(sellerStr);
      return seller?.id;
    } catch (e) {
      console.error('Failed to parse seller from localStorage:', e);
      return null;
    }
  };

  // Fetch counts from the counts API
  const fetchCounts = async () => {
    try {
      const sellerId = getSellerId();
      if (!sellerId) {
        console.error('No seller found in localStorage');
        return;
      }

      const response = await axios.get(`${API_URL}/api/tracking/counts?seller_id=${sellerId}`);
      if (response.data.success) {
        setCounts({
          sent: response.data.data.sent,
          replied: response.data.data.replied,
          interested: response.data.data.interested,
          not_interested: response.data.data.not_interested,
          not_contacted: response.data.data.not_contacted,
          total_companies: response.data.total.all
        });
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const sellerId = getSellerId();
      if (!sellerId) {
        setError('No seller found — please log in again');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/api/tracking/all?seller_id=${sellerId}`);
      
      if (response.data.success) {
        setTrackingData(response.data.data);
        console.log('Tracking data:', response.data.data);
      } else {
        setError('Failed to load tracking data');
      }
    } catch (error: any) {
      console.error('Error fetching tracking data:', error);
      setError(error.message || 'Error loading tracking data');
    } finally {
      setLoading(false);
    }
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'sent':
        return trackingData.sent;
      case 'replied':
        return trackingData.replied;
      case 'interested':
        return trackingData.interested;
      case 'not_interested':
        return trackingData.not_interested;
      default:
        return [];
    }
  };

  const filteredData = useMemo(() => {
    // Get ALL data from all tabs
    let allData = [];
    
    if (activeTab === 'sent') allData = trackingData.sent;
    else if (activeTab === 'replied') allData = trackingData.replied;
    else if (activeTab === 'interested') allData = trackingData.interested;
    else if (activeTab === 'not_interested') allData = trackingData.not_interested;
    
    let filtered = allData;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        return item.company_name?.toLowerCase().includes(query) ||
               item.country?.toLowerCase().includes(query) ||
               item.product_name?.toLowerCase().includes(query);
      });
    }
    
    // Status filter - if not 'all', filter by current_status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => {
        return item.current_status === statusFilter;
      });
    }
    
    return filtered;
  }, [searchQuery, statusFilter, activeTab, trackingData]);

  // Log search activity
  useEffect(() => {
    if (searchQuery) {
      createActivityLog(28, 5, `Searched tracking data with query: ${searchQuery}`, {
        searchQuery: searchQuery,
        activeTab: activeTab
      });
    }
  }, [searchQuery]);

  // Log status filter activity
  useEffect(() => {
    if (statusFilter !== 'all') {
      createActivityLog(29, 5, `Filtered tracking data by status: ${statusFilter}`, {
        statusFilter: statusFilter,
        activeTab: activeTab
      });
    }
  }, [statusFilter]);

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'sent': return <Send className="h-4 w-4" />;
      case 'replied': return <Reply className="h-4 w-4" />;
      case 'interested': return <ThumbsUp className="h-4 w-4" />;
      case 'not_interested': return <ThumbsDown className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-700">Sent</Badge>;
      case 'replied':
        return <Badge className="bg-green-100 text-green-700">Replied</Badge>;
      case 'interested':
        return <Badge className="bg-emerald-100 text-emerald-700">Interested</Badge>;
      case 'not_interested':
        return <Badge className="bg-red-100 text-red-700">Not Interested</Badge>;
      default:
        return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const viewDetails = (item: TrackingItem) => {
    // Log view details (action_id: 29)
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
    // Log tab change (action_id: 30)
    const tabNames: Record<string, string> = {
      sent: 'Sent',
      replied: 'Replied',
      interested: 'Interested',
      not_interested: 'Not Interested'
    };
    createActivityLog(30, 5, `Switched to ${tabNames[tab] || tab} tab`, {
      tab: tab,
      tabName: tabNames[tab] || tab,
      count: getCurrentData().length
    });
    setActiveTab(tab);
  };

  const handleCardClick = (tab: string) => {
    // Log card click for filtering (action_id: 31)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading tracking data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-2">{error}</p>
          <Button onClick={fetchTrackingData}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Email Tracking Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track all email communications and buyer responses
        </p>
      </div>

      {/* Summary Cards - Using counts from /api/tracking/counts */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick('sent')}>
          <CardContent className="pt-6">
            <div className="text-center">
              <Send className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{counts.sent}</p>
              <p className="text-xs text-muted-foreground">Sent</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick('replied')}>
          <CardContent className="pt-6">
            <div className="text-center">
              <Reply className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{counts.replied}</p>
              <p className="text-xs text-muted-foreground">Replied</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick('interested')}>
          <CardContent className="pt-6">
            <div className="text-center">
              <ThumbsUp className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{counts.interested}</p>
              <p className="text-xs text-muted-foreground">Interested</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick('not_interested')}>
          <CardContent className="pt-6">
            <div className="text-center">
              <ThumbsDown className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{counts.not_interested}</p>
              <p className="text-xs text-muted-foreground">Not Interested</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-6 w-6 text-gray-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{counts.not_contacted}</p>
              <p className="text-xs text-muted-foreground">Not Contacted</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search company, product or country..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map(s => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sent" className="gap-2">
            <Send className="h-4 w-4" />
            Sent
          </TabsTrigger>
          <TabsTrigger value="replied" className="gap-2">
            <Reply className="h-4 w-4" />
            Replied
          </TabsTrigger>
          <TabsTrigger value="interested" className="gap-2">
            <ThumbsUp className="h-4 w-4" />
            Interested
          </TabsTrigger>
          <TabsTrigger value="not_interested" className="gap-2">
            <ThumbsDown className="h-4 w-4" />
            Not Interested
          </TabsTrigger>
        </TabsList> */}
  
        {/* Sent Tab */}
        <TabsContent value="sent">
          <div className="bg-card rounded-lg border overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="p-3 text-left">Company</th>
                  <th className="p-3 text-left">Country</th>
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-center">Interaction Count</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.buyer_id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-medium">{item.company_name}</td>
                    <td className="p-3">{item.country}</td>
                    <td className="p-3">{item.product_name}</td>
                    <td className="p-3">{getStatusBadge(item.current_status || item.type)}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <MessageSquare className="h-3 w-3 text-muted-foreground" />
                        <span className="font-semibold">{item.interaction_count || 0}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm" onClick={() => viewDetails(item)}>
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      No {activeTab} emails found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Replied Tab */}
        <TabsContent value="replied">
          <div className="bg-card rounded-lg border overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="p-3 text-left">Company</th>
                  <th className="p-3 text-left">Country</th>
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-center">Interaction Count</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.buyer_id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-medium">{item.company_name}</td>
                    <td className="p-3">{item.country}</td>
                    <td className="p-3">{item.product_name}</td>
                    <td className="p-3">{getStatusBadge(item.current_status || item.type)}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <MessageSquare className="h-3 w-3 text-muted-foreground" />
                        <span className="font-semibold">{item.interaction_count || 0}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm" onClick={() => viewDetails(item)}>
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      No replied emails found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Interested Tab */}
        <TabsContent value="interested">
          <div className="bg-card rounded-lg border overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="p-3 text-left">Company</th>
                  <th className="p-3 text-left">Country</th>
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-center">Interaction Count</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.buyer_id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-medium">{item.company_name}</td>
                    <td className="p-3">{item.country}</td>
                    <td className="p-3">{item.product_name}</td>
                    <td className="p-3">{getStatusBadge(item.current_status || item.type)}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <MessageSquare className="h-3 w-3 text-muted-foreground" />
                        <span className="font-semibold">{item.interaction_count || 0}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm" onClick={() => viewDetails(item)}>
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      No interested responses found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Not Interested Tab */}
        <TabsContent value="not_interested">
          <div className="bg-card rounded-lg border overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="p-3 text-left">Company</th>
                  <th className="p-3 text-left">Country</th>
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-center">Interaction Count</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.buyer_id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-medium">{item.company_name}</td>
                    <td className="p-3">{item.country}</td>
                    <td className="p-3">{item.product_name}</td>
                    <td className="p-3">{getStatusBadge(item.current_status || item.type)}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <MessageSquare className="h-3 w-3 text-muted-foreground" />
                        <span className="font-semibold">{item.interaction_count || 0}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm" onClick={() => viewDetails(item)}>
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      No not interested responses found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}