import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Building,
  MapPin,
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
  Hash,
  ThumbsDown,
  AtSign,
  Phone,
  Activity,
  MessageSquare,
  TrendingUp,
  Users,
  Sparkles,
  FileText,
  Globe,
  CheckCircle,
  XCircle,
  ChevronRight
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
  hsn_code: string;
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
  hsn_code: string;
}

interface Summary {
  total: number;
  sent: number;
  replied: number;
  interested: number;
  not_interested: number;
  last_activity: string | null;
}

export default function TrackingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [communications, setCommunications] = useState<TrackingCommunication[]>([]);
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<TrackingCommunication | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  useEffect(() => {
    fetchTrackingDetails();
  }, [id]);

  const fetchTrackingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const sellerData = localStorage.getItem('seller');
      if (!sellerData) {
        setError("Please login again");
        setLoading(false);
        return;
      }

      const seller = JSON.parse(sellerData);
      const sellerId = seller.id;

      if (!sellerId) {
        setError("Seller information not found");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/api/tracking/buyer/${id}`, {
        params: { sellerId: sellerId }
      });
      
      if (response.data.success) {
        setCommunications(response.data.data);
        setBuyerInfo(response.data.buyer_info);
        setSummary(response.data.summary);
        
        if (response.data.buyer_info) {
          createActivityLog(30, 13, `Viewed tracking detail for: ${response.data.buyer_info.company_name}`, {
            buyer_id: id,
            company_name: response.data.buyer_info.company_name,
            country: response.data.buyer_info.country,
            product_name: response.data.buyer_info.product_name,
            total_communications: response.data.data?.length || 0
          });
        }
      } else {
        setError(response.data.message || 'Tracking data not found');
      }
    } catch (error: any) {
      console.error('Error:', error);
      if (error.response?.status === 404) {
        setError('Buyer not found');
      } else if (error.response?.status === 400) {
        setError('Seller ID is required');
      } else if (error.response?.status === 401) {
        setError('Unauthorized - Please login again');
      } else {
        setError('Failed to load tracking details');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchTrackingDetails();
    setRefreshing(false);
  };

  const filteredCommunications = communications.filter(comm => {
    const q = searchQuery.toLowerCase();
    return !q ||
      comm.subject?.toLowerCase().includes(q) ||
      comm.message?.toLowerCase().includes(q) ||
      comm.response?.toLowerCase().includes(q) ||
      comm.template_used?.toLowerCase().includes(q) ||
      comm.display_status?.toLowerCase().includes(q) ||
      comm.hsn_code?.toLowerCase().includes(q);
  });

  const getStatusBadge = (communication: TrackingCommunication) => {
    switch(communication.display_status) {
      case 'Sent':
        return <Badge className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 text-[10px] sm:text-xs">
          <Send className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
          Sent
        </Badge>;
      case 'Replied':
        return <Badge className="bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 text-[10px] sm:text-xs">
          <Reply className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
          Replied
        </Badge>;
      case 'Interested':
        return <Badge className="bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200 text-[10px] sm:text-xs">
          <ThumbsUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
          Interested
        </Badge>;
      case 'Not Interested':
        return <Badge className="bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200 text-[10px] sm:text-xs">
          <ThumbsDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
          Not Interested
        </Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-[10px] sm:text-xs">Unknown</Badge>;
    }
  };

  const getTypeIcon = (communication: TrackingCommunication) => {
    switch(communication.display_status) {
      case 'Sent': return <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />;
      case 'Replied': return <Reply className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />;
      case 'Interested': return <ThumbsUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />;
      case 'Not Interested': return <ThumbsDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />;
      default: return <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />;
    }
  };

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

  const viewMessage = (communication: TrackingCommunication) => {
    createActivityLog(32, 13, `Viewed message for: ${communication.company_name}`, {
      buyer_id: communication.buyer_id,
      company_name: communication.company_name,
      communication_id: communication.id,
      display_status: communication.display_status,
      subject: communication.subject
    });
    setSelectedMessage(communication);
    setMessageDialogOpen(true);
  };

  const getMessagePreview = (message: string) => {
    if (!message) return 'No message content';
    return message.length > 100 ? message.substring(0, 100) + '...' : message;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-xl opacity-20 animate-pulse" />
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-200 border-t-blue-600 mx-auto relative" />
          </div>
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm font-medium text-muted-foreground animate-pulse">
            Loading tracking details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !buyerInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8 max-w-md w-full text-center mx-4">
          <div className="p-3 sm:p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-full w-fit mx-auto mb-3 sm:mb-4">
            <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">Buyer Not Found</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">{error || "No tracking data available"}</p>
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            <Button onClick={() => navigate('/tracking')} variant="outline" className="gap-2 text-sm sm:text-base">
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Back
            </Button>
            <Button onClick={fetchTrackingDetails} className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-sm sm:text-base">
              <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 p-3 sm:p-4 md:p-6">
      {/* Decorative gradient header */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/tracking')}
              className="hover:bg-blue-50 hover:text-blue-700 transition-colors text-sm sm:text-base px-2 sm:px-4 flex-shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Back</span>
            </Button>
            <div className="space-y-0.5 sm:space-y-1 min-w-0">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex-shrink-0">
                  <Building className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                </div>
                <span className="truncate">{buyerInfo.company_name}</span>
              </h1>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground flex items-center gap-1 sm:gap-2">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Buyer ID: {id} • {summary?.total || 0} communications</span>
                <span className="xs:hidden">ID: {id} • {summary?.total || 0}</span>
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={refreshData} 
            disabled={refreshing}
            className="hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm sm:text-base px-3 sm:px-4 flex-shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">Refresh</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2.5 sm:p-3 md:p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mt-0.5 sm:mt-1">{summary?.total || 0}</p>
              </div>
              <div className="p-1.5 sm:p-2 md:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2.5 sm:p-3 md:p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Sent</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 mt-0.5 sm:mt-1">{summary?.sent || 0}</p>
              </div>
              <div className="p-1.5 sm:p-2 md:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <Send className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2.5 sm:p-3 md:p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Replied</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-600 mt-0.5 sm:mt-1">{summary?.replied || 0}</p>
              </div>
              <div className="p-1.5 sm:p-2 md:p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
                <Reply className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2.5 sm:p-3 md:p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Interested</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-600 mt-0.5 sm:mt-1">{summary?.interested || 0}</p>
              </div>
              <div className="p-1.5 sm:p-2 md:p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
                <ThumbsUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-2.5 sm:p-3 md:p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Not Interested</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-600 mt-0.5 sm:mt-1">{summary?.not_interested || 0}</p>
              </div>
              <div className="p-1.5 sm:p-2 md:p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl">
                <ThumbsDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Buyer Information Card with gradient */}
        <Card className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/80 border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-4 sm:pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
              <div className="flex items-start gap-2 sm:gap-3 group">
                <div className="p-1.5 sm:p-2 md:p-2.5 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
                  <Building className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Company</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{buyerInfo.company_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 group">
                <div className="p-1.5 sm:p-2 md:p-2.5 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
                  <AtSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</p>
                  <a href={`mailto:${buyerInfo.email}`} className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors truncate block">
                    {buyerInfo.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 group">
                <div className="p-1.5 sm:p-2 md:p-2.5 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{buyerInfo.contact_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 group">
                <div className="p-1.5 sm:p-2 md:p-2.5 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
                  <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{buyerInfo.product_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 group">
                <div className="p-1.5 sm:p-2 md:p-2.5 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
                  <Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">HSN</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{buyerInfo.hsn_code || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 group">
                <div className="p-1.5 sm:p-2 md:p-2.5 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
                  <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Country</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{buyerInfo.country}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communications Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-blue-50/50 p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-md">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Communication History
                  </CardTitle>
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground hidden xs:block">All communications with this buyer</p>
                </div>
              </div>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 sm:pl-9 w-full sm:w-48 md:w-56 border-gray-200 focus:border-blue-400 rounded-xl bg-white/80 text-sm sm:text-base h-9 sm:h-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50/80 to-blue-50/80">
                    <TableHead className="font-semibold text-gray-700 w-8 sm:w-12 text-[10px] sm:text-xs">#</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-[10px] sm:text-xs whitespace-nowrap">Type</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-[10px] sm:text-xs whitespace-nowrap">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-[10px] sm:text-xs whitespace-nowrap">HSN</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-[10px] sm:text-xs whitespace-nowrap">Subject</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-[10px] sm:text-xs whitespace-nowrap hidden md:table-cell">Message</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-[10px] sm:text-xs whitespace-nowrap hidden lg:table-cell">Template</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-[10px] sm:text-xs whitespace-nowrap hidden sm:table-cell">Date</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-[10px] sm:text-xs text-center whitespace-nowrap">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommunications.length > 0 ? (
                    filteredCommunications.map((comm, index) => (
                      <TableRow 
                        key={comm.id} 
                        className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 cursor-pointer group"
                        onClick={() => viewMessage(comm)}
                      >
                        <TableCell className="font-medium text-gray-600 text-xs sm:text-sm">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <div className="p-1 bg-white rounded-lg shadow-sm">
                              {getTypeIcon(comm)}
                            </div>
                            <span className="text-[10px] sm:text-xs font-medium text-gray-600 truncate max-w-[40px] sm:max-w-none">
                              {comm.display_status}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(comm)}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-blue-50 text-blue-700 rounded-lg text-[8px] sm:text-xs font-medium whitespace-nowrap">
                            {comm.hsn_code || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[80px] sm:max-w-[150px]">
                          <p className="truncate font-medium text-gray-700 group-hover:text-blue-600 transition-colors text-xs sm:text-sm">
                            {comm.subject || 'No Subject'}
                          </p>
                        </TableCell>
                        <TableCell className="max-w-[150px] hidden md:table-cell">
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {getMessagePreview(comm.message)}
                          </p>
                        </TableCell>
                    <TableCell className="hidden lg:table-cell">
  {comm.template_used && (
    <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full text-[8px] sm:text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 max-w-[120px] break-words whitespace-normal">
      <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
      <span className="break-words">{comm.template_used}</span>
    </span>
  )}
</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-muted-foreground">
                            <Clock className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
                            <span className="hidden md:inline">{formatDate(comm.date)}</span>
                            <span className="md:hidden">{comm.date ? new Date(comm.date).toLocaleDateString() : '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-0.5 sm:gap-1.5 h-7 sm:h-8 md:h-9 px-1.5 sm:px-2 md:px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded-lg transition-colors text-[10px] sm:text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              viewMessage(comm);
                            }}
                          >
                            <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span className="hidden xs:inline">View</span>
                            <ChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 sm:py-10 md:py-12">
                        <div className="flex flex-col items-center gap-2 sm:gap-3">
                          <div className="p-3 sm:p-4 bg-gray-50 rounded-full">
                            <Mail className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground font-medium">No communications found</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground/70">Try adjusting your search</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Summary footer */}
            {filteredCommunications.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
                <p className="text-[10px] sm:text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filteredCommunications.length}</span> of {communications.length}
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                  <span className="flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500" />
                    <span className="hidden xs:inline">Sent:</span>
                    <span className="font-semibold text-gray-700">{summary?.sent || 0}</span>
                  </span>
                  <span className="flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Reply className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500" />
                    <span className="hidden xs:inline">Replied:</span>
                    <span className="font-semibold text-gray-700">{summary?.replied || 0}</span>
                  </span>
                  <span className="flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                    <ThumbsUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500" />
                    <span className="hidden xs:inline">Interested:</span>
                    <span className="font-semibold text-gray-700">{summary?.interested || 0}</span>
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Message Dialog */}
        <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 rounded-2xl border-0 shadow-2xl w-[95vw] sm:w-full">
            <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
              <DialogHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                  <div>
                    <DialogTitle className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-2 text-gray-800">
                      <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                        {selectedMessage && getTypeIcon(selectedMessage)}
                      </div>
                      Message Details
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1.5 text-xs sm:text-sm">
                      <Activity className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500" />
                      {selectedMessage?.display_status} communication
                    </DialogDescription>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {selectedMessage && getStatusBadge(selectedMessage)}
                  </div>
                </div>
              </DialogHeader>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground bg-gray-50 p-1.5 sm:p-2 rounded-lg">
                <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500" />
                {formatDate(selectedMessage?.date || null)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
                    <Send className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500" />
                    From
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-800 bg-blue-50/50 p-1.5 sm:p-2 rounded-lg border border-blue-100 break-all">
                    {selectedMessage?.from_email || '-'}
                  </p>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
                    <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500" />
                    To
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-800 bg-indigo-50/50 p-1.5 sm:p-2 rounded-lg border border-indigo-100 break-all">
                    {selectedMessage?.to_email || '-'}
                  </p>
                </div>
              </div>

              {selectedMessage?.subject && (
                <div className="space-y-1 sm:space-y-1.5">
                  <h4 className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                    <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500" />
                    Subject
                  </h4>
                  <p className="text-xs sm:text-sm font-medium text-gray-800 bg-gray-50 p-2 sm:p-3 rounded-xl border border-gray-100 break-words">
                    {selectedMessage.subject}
                  </p>
                </div>
              )}

              {selectedMessage?.message && (
                <div className="space-y-1 sm:space-y-1.5">
                  <h4 className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                    <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500" />
                    Message
                  </h4>
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 min-h-[80px] sm:min-h-[100px] max-h-[200px] sm:max-h-[300px] overflow-y-auto">
                    <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>
              )}

              {selectedMessage?.response && selectedMessage.display_status !== 'Sent' && (
                <div className={`p-2 sm:p-3 rounded-xl border ${
                  selectedMessage.response === 'interested' 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : selectedMessage.response === 'not_interested' 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                    <Activity className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500" />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 sm:pt-4 border-t border-gray-100">
             <div className="space-y-0.5 sm:space-y-1">
  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
    <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500" />
    Template
  </p>
  <p className="text-xs sm:text-sm font-medium text-gray-800 bg-blue-50/50 p-1.5 sm:p-2 rounded-lg border border-blue-100 break-words whitespace-normal">
    {selectedMessage?.template_used || '-'}
  </p>
</div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
                    <Package className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500" />
                    Product
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-800 bg-indigo-50/50 p-1.5 sm:p-2 rounded-lg border border-indigo-100 break-words">
                    {selectedMessage?.product_name || '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/50 flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setMessageDialogOpen(false)}
                className="hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm sm:text-base"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 