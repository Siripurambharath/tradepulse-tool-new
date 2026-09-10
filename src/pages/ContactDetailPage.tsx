import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Package,
  User,
  Calendar,
  AlertCircle,
  RefreshCw,
  Eye,
  Clock,
  MessageSquare,
  Send,
  TrendingUp,
  CheckCircle,
  XCircle,
  Sparkles,
  MailOpen,
  Reply,
  FileText,
  AtSign,
  Globe,
  Award,
  Activity,
  BarChart3,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Hash  
} from 'lucide-react';
import axios from 'axios';
import { EmailModal } from '@/components/EmailModal';
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

interface Reply {
  id: number;
  batch_id: string;
  buyer_id?: number;
  from_email: string | null;
  to_email: string | null;
  email: string;
  subject: string;
  message: string;
  product_name: string;
  reply_date: string | null;
  company_name: string;
  contact_name: string;
  country: string;
  status: string;
  template_used: string;
  response: string | null;
  responded_at: string | null;
  sent_at: string | null;
  hsn_code: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface StatsData {
  total: number;
  sent: number;
  interested: number;
  not_interested: number;
  pending: number;
}

export default function ContactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const perPage = 10;

  // Stats state
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    sent: 0,
    interested: 0,
    not_interested: 0,
    pending: 0
  });

  // EmailModal state
  const [emailOpen, setEmailOpen] = useState(false);

  // Message view dialog
  const [selectedMessage, setSelectedMessage] = useState<Reply | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  // Get seller ID
  const getSellerId = () => {
    try {
      const sellerData = localStorage.getItem('seller');
      if (sellerData) {
        const seller = JSON.parse(sellerData);
        return seller.id || '';
      }
    } catch (e) {
      console.error('Error parsing seller data:', e);
    }
    return '';
  };

  // Fetch stats separately
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const sellerId = getSellerId();

      if (!sellerId) {
        console.warn('No sellerId found in localStorage');
        setStatsLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/api/replyhistory/${id}/stats`, {
        params: { sellerId: sellerId }
      });
      
      if (response.data.success) {
        setStats(response.data.data);
        console.log('Stats fetched:', response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch contact details with pagination
  const fetchBuyerDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const sellerId = getSellerId();

      const response = await axios.get(`${API_URL}/api/replyhistory/${id}`, {
        params: { 
          sellerId: sellerId,
          page: page + 1,
          limit: perPage
        }
      });
      
      if (response.data.success) {
        setContact(response.data.data || []);
        setTotalCount(response.data.total || 0);
        setPagination(response.data.pagination || null);
        console.log('Fetched buyer details:', response.data.data);
        console.log('Pagination:', response.data.pagination);
        
        if (response.data.data && response.data.data.length > 0) {
          const firstContact = response.data.data[0];
          createActivityLog(23, 4, `Viewed contact detail page for: ${firstContact.contact_name || firstContact.company_name}`, {
            buyer_id: id,
            contact_name: firstContact.contact_name,
            company_name: firstContact.company_name,
            email: firstContact.email || firstContact.from_email,
            total_interactions: response.data.total
          });
        }
      } else {
        setError(response.data.message || "Contact not found");
      }
    } catch (error: any) {
      console.error('Error fetching buyer details:', error);
      if (error.response?.status === 404) {
        setError("No replies found for this buyer");
      } else if (error.response?.status === 400) {
        setError("Seller ID is required");
      } else {
        setError("Error loading contact details");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStats();
      fetchBuyerDetails();
    }
  }, [id, page]);
const refreshData = async () => {
  setRefreshing(true);
  await Promise.all([fetchStats(), fetchBuyerDetails()]);
  setRefreshing(false);
 toast({
  title: "Refreshed",
  description: "Contact data has been updated",
  className: `
    bg-[#0E223B]
    border border-[#8EE147]/30
    text-white
    [&>button]:!text-white
    [&>button]:!bg-transparent
    [&>button]:!border-0
    [&>button]:!outline-none
    [&>button]:!ring-0
    [&>button]:!shadow-none
    [&>button:hover]:!text-white
    [&>button:hover]:!bg-transparent
    [&>button:focus]:!text-white
    [&>button:focus]:!bg-transparent
    [&>button:focus]:!border-0
    [&>button:focus]:!outline-none
    [&>button:focus]:!ring-0
    [&>button:focus-visible]:!border-0
    [&>button:focus-visible]:!outline-none
    [&>button:focus-visible]:!ring-0
  `,
});
};

  // Filter emails based on search (client-side filtering on current page)
  const filteredEmails = contact.filter(record => {
    const q = searchQuery.toLowerCase();
    return !q ||
      record.subject?.toLowerCase().includes(q) ||
      record.message?.toLowerCase().includes(q) ||
      record.response?.toLowerCase().includes(q) ||
      record.status?.toLowerCase().includes(q) ||
      record.template_used?.toLowerCase().includes(q);
  });

  const getInitialEmail = () => {
    return contact[0] || null;
  };

  // Build recipient array for EmailModal
  const getRecipient = () => {
    const e = getInitialEmail();
    if (!e) return [];
    return [{
      name: e.contact_name,
      email: e.email || e.from_email || '',
      company: e.company_name,
      country: e.country,
      product: e.product_name,
      buyer_id: e.buyer_id,
    }];
  };

  const getStatusBadge = (status: string) => {
    if (!status) return <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-0 text-[10px] sm:text-xs">Pending</Badge>;
    if (status.toLowerCase() === 'sent') {
      return <Badge className="bg-[#8EE147]/20 text-[#0E223B] border border-[#8EE147]/30 hover:bg-[#8EE147]/20 text-[10px] sm:text-xs">
        <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" style={{ color: '#8EE147' }} />
        Sent
      </Badge>;
    } else if (status.toLowerCase() === 'failed') {
      return <Badge className="bg-red-500/20 text-red-700 border border-red-500/30 hover:bg-red-500/20 text-[10px] sm:text-xs">
        <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
        Failed
      </Badge>;
    }
    return <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-0 text-[10px] sm:text-xs">{status}</Badge>;
  };

  const getResponseBadge = (response: string | null) => {
    if (!response) return <Badge variant="secondary" className="bg-gray-100 text-gray-500 border-0 text-[10px] sm:text-xs">No Response</Badge>;
    if (response === 'interested') {
      return <Badge className="bg-[#8EE147]/20 text-[#0E223B] border border-[#8EE147]/30 hover:bg-[#8EE147]/20 text-[10px] sm:text-xs">
        <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" style={{ color: '#8EE147' }} />
        Interested
      </Badge>;
    } else if (response === 'not_interested') {
      return <Badge className="bg-red-500/20 text-red-700 border border-red-500/30 hover:bg-red-500/20 text-[10px] sm:text-xs">
        <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
        Not Interested
      </Badge>;
    }
    return <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-0 text-[10px] sm:text-xs">{response}</Badge>;
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

  const viewMessage = (record: Reply) => {
    createActivityLog(33, 4, `Viewed email message for contact: ${record.contact_name || record.company_name}`, {
      buyer_id: record.buyer_id,
      contact_name: record.contact_name,
      company_name: record.company_name,
      email_id: record.id,
      subject: record.subject
    });
    setSelectedMessage(record);
    setMessageDialogOpen(true);
  };

  const totalPages = pagination?.totalPages || Math.ceil(totalCount / perPage) || 1;

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0E223B' }}>
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-xl opacity-20 animate-pulse" style={{ background: 'linear-gradient(to right, #8EE147, #6EC035)' }} />
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 mx-auto relative" style={{ borderColor: '#8EE14720', borderTopColor: '#8EE147' }} />
          </div>
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm font-medium animate-pulse" style={{ color: '#94A3B8' }}>
            Loading contact details...
          </p>
        </div>
      </div>
    );
  }

  if (error || contact.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0E223B' }}>
        <div className="bg-[#0E223B] rounded-2xl shadow-xl border border-white/10 p-4 sm:p-6 md:p-8 max-w-md w-full text-center mx-4">
          <div className="p-3 sm:p-4 bg-red-500/10 rounded-full w-fit mx-auto mb-3 sm:mb-4">
            <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Contact Not Found</h3>
          <p className="text-xs sm:text-sm text-slate-400 mb-1 sm:mb-2">{error || "No contact details available"}</p>
          <p className="text-[10px] sm:text-xs text-slate-500 mb-4 sm:mb-6">Buyer ID: {id}</p>
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            <Button onClick={() => navigate('/contacts')} variant="outline" className="gap-2 text-sm sm:text-base text-white border-white/20 hover:bg-white/10">
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Back
            </Button>
            <Button onClick={refreshData} className="gap-2 bg-[#8EE147] text-[#0E223B] hover:bg-[#6EC035] text-sm sm:text-base">
              <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const initialEmail = getInitialEmail();

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6" style={{ backgroundColor: '#0E223B' }}>
      {/* Decorative gradient header */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8EE147] via-[#6EC035] to-[#5AA82E]" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/contacts')}
              className="hover:bg-[#8EE147]/10 hover:text-[#8EE147] transition-colors text-sm sm:text-base px-2 sm:px-4 flex-shrink-0 text-slate-300"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Back</span>
            </Button>
            <div className="space-y-0.5 sm:space-y-1 min-w-0">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#8EE147] to-[#6EC035] bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-[#8EE147] to-[#6EC035] rounded-xl flex-shrink-0">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#0E223B]" />
                </div>
                <span className="truncate">{initialEmail?.company_name || 'Contact Details'}</span>
              </h1>
              <p className="text-[10px] sm:text-xs md:text-sm flex items-center gap-1 sm:gap-2" style={{ color: '#94A3B8' }}>
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-[#8EE147]" />
                <span className="hidden xs:inline">Buyer ID: {id} • {totalCount} total interactions</span>
                <span className="xs:hidden">ID: {id} • {totalCount}</span>
              </p>
            </div>
          </div>
   <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
  <Button 
    variant="outline" 
    onClick={refreshData} 
    disabled={refreshing}
    className="border-2 border-[#8EE147] bg-transparent text-white hover:bg-transparent hover:text-white hover:border-[#8EE147] transition-all duration-200 text-sm sm:text-base px-2.5 sm:px-4 cursor-pointer"
  >
    <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${refreshing ? 'animate-spin' : ''}`} />
    <span className="hidden xs:inline">Refresh</span>
  </Button>
</div>
        </div>

        {/* Stats Cards - Dark Theme */}
     {/* Stats Cards - Dark Theme */}
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
  <div className="border border-white/10 shadow-lg rounded-2xl p-2.5 sm:p-3 md:p-4 hover:shadow-xl transition-all duration-200 hover:scale-[1.02]" style={{ backgroundColor: '#0E223B' }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-[#8EE147]/70 uppercase tracking-wider">Total</p>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-white mt-0.5 sm:mt-1">{stats.total}</p>
      </div>
      <div className="p-1.5 sm:p-2 md:p-3 bg-[#8EE147]/10 rounded-xl border border-[#8EE147]/20">
        <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
      </div>
    </div>
  </div>
  
  <div className="border border-white/10 shadow-lg rounded-2xl p-2.5 sm:p-3 md:p-4 hover:shadow-xl transition-all duration-200 hover:scale-[1.02]" style={{ backgroundColor: '#0E223B' }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-[#8EE147]/70 uppercase tracking-wider">Sent</p>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-white mt-0.5 sm:mt-1">{stats.sent}</p>
      </div>
      <div className="p-1.5 sm:p-2 md:p-3 bg-[#8EE147]/10 rounded-xl border border-[#8EE147]/20">
        <Send className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
      </div>
    </div>
  </div>
  
  <div className="border border-white/10 shadow-lg rounded-2xl p-2.5 sm:p-3 md:p-4 hover:shadow-xl transition-all duration-200 hover:scale-[1.02]" style={{ backgroundColor: '#0E223B' }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-[#8EE147]/70 uppercase tracking-wider">Interested</p>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-white mt-0.5 sm:mt-1">{stats.interested}</p>
      </div>
      <div className="p-1.5 sm:p-2 md:p-3 bg-[#8EE147]/10 rounded-xl border border-[#8EE147]/20">
        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
      </div>
    </div>
  </div>
  
  <div className="border border-white/10 shadow-lg rounded-2xl p-2.5 sm:p-3 md:p-4 hover:shadow-xl transition-all duration-200 hover:scale-[1.02]" style={{ backgroundColor: '#0E223B' }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-red-400/70 uppercase tracking-wider">Not Interested</p>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-white mt-0.5 sm:mt-1">{stats.not_interested}</p>
      </div>
      <div className="p-1.5 sm:p-2 md:p-3 bg-red-500/10 rounded-xl border border-red-500/20">
        <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
      </div>
    </div>
  </div>
  
  <div className="col-span-2 sm:col-span-1 border border-white/10 shadow-lg rounded-2xl p-2.5 sm:p-3 md:p-4 hover:shadow-xl transition-all duration-200 hover:scale-[1.02]" style={{ backgroundColor: '#0E223B' }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-amber-400/70 uppercase tracking-wider">Pending</p>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-white mt-0.5 sm:mt-1">{stats.pending}</p>
      </div>
      <div className="p-1.5 sm:p-2 md:p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
      </div>
    </div>
  </div>
</div>

        {/* Contact Information Summary Card - Dark Theme */}
        <Card className="mb-4 sm:mb-6 border border-white/10 shadow-lg" style={{ backgroundColor: '#0E223B' }}>
          <CardContent className="pt-4 sm:pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              <div className="flex items-start gap-2 sm:gap-3 group">
                <div className="p-1.5 sm:p-2 md:p-2.5 bg-[#8EE147]/10 rounded-xl shadow-sm border border-[#8EE147]/20 flex-shrink-0">
                  <Building className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#8EE147]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-[#8EE147]/70 uppercase tracking-wider">Company</p>
                  <p className="text-xs sm:text-sm font-semibold text-white truncate">{initialEmail?.company_name || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 group">
                <div className="p-1.5 sm:p-2 md:p-2.5 bg-[#8EE147]/10 rounded-xl shadow-sm border border-[#8EE147]/20 flex-shrink-0">
                  <AtSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#8EE147]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-[#8EE147]/70 uppercase tracking-wider">Email</p>
                  <a href={`mailto:${initialEmail?.email || initialEmail?.from_email}`} className="text-xs sm:text-sm font-semibold text-[#8EE147] hover:text-[#6EC035] hover:underline transition-colors truncate block">
                    {initialEmail?.email || initialEmail?.from_email || '-'}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 group">
                <div className="p-1.5 sm:p-2 md:p-2.5 bg-[#8EE147]/10 rounded-xl shadow-sm border border-[#8EE147]/20 flex-shrink-0">
                  <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#8EE147]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-[#8EE147]/70 uppercase tracking-wider">Phone</p>
                  {initialEmail?.contact_name && /[\d\-+() ]{7,}/.test(initialEmail.contact_name) ? (
                    <a 
                      href={`tel:${initialEmail.contact_name.replace(/\s/g, '')}`}
                      className="text-xs sm:text-sm font-semibold text-[#8EE147] hover:text-[#6EC035] hover:underline truncate block"
                    >
                      {initialEmail.contact_name}
                    </a>
                  ) : (
                    <p className="text-xs sm:text-sm font-semibold text-slate-500 truncate">Not available</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 group">
                <div className="p-1.5 sm:p-2 md:p-2.5 bg-[#8EE147]/10 rounded-xl shadow-sm border border-[#8EE147]/20 flex-shrink-0">
                  <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#8EE147]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-[#8EE147]/70 uppercase tracking-wider">Product</p>
                  <p className="text-xs sm:text-sm font-semibold text-white truncate">{initialEmail?.product_name || '-'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Email History - Dark Theme */}
        <Card className="border border-white/10 shadow-lg" style={{ backgroundColor: '#0E223B' }}>
          <CardHeader className="border-b border-white/10 bg-gradient-to-r from-[#8EE147]/5 to-[#6EC035]/5 p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-[#8EE147] to-[#6EC035] rounded-lg shadow-md">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-[#0E223B]" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-[#8EE147] to-[#6EC035] bg-clip-text text-transparent">
                    Email History
                  </CardTitle>
                  <p className="text-[10px] sm:text-xs md:text-sm text-slate-400 hidden xs:block">All email interactions with this contact</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                <span className="flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-white/5 rounded-lg shadow-sm border border-white/10 text-slate-300">
                  <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#8EE147]" />
                  <span className="hidden xs:inline">{stats.sent} sent</span>
                  <span className="xs:hidden">{stats.sent}</span>
                </span>
                <span className="flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-white/5 rounded-lg shadow-sm border border-white/10 text-slate-300">
                  <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#8EE147]" />
                  <span className="hidden xs:inline">{stats.interested} interested</span>
                  <span className="xs:hidden">{stats.interested}</span>
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-[#8EE147]/10 to-[#6EC035]/10 border-b border-white/10">
                    <TableHead className="font-semibold text-slate-300 text-[10px] sm:text-xs w-8 sm:w-12">#</TableHead>
                    <TableHead className="font-semibold text-slate-300 text-[10px] sm:text-xs whitespace-nowrap">Type</TableHead>
                    <TableHead className="font-semibold text-slate-300 text-[10px] sm:text-xs whitespace-nowrap">Subject</TableHead>
                    <TableHead className="font-semibold text-slate-300 text-[10px] sm:text-xs whitespace-nowrap">Status</TableHead>
                    <TableHead className="font-semibold text-slate-300 text-[10px] sm:text-xs whitespace-nowrap">Response</TableHead>
                    <TableHead className="font-semibold text-slate-300 text-[10px] sm:text-xs whitespace-nowrap">Template</TableHead>
                    <TableHead className="font-semibold text-slate-300 text-[10px] sm:text-xs whitespace-nowrap">Date</TableHead>
                    <TableHead className="font-semibold text-slate-300 text-[10px] sm:text-xs text-center whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmails.length > 0 ? (
                    filteredEmails.map((record, index) => (
                      <TableRow 
                        key={record.id} 
                        className="border-b border-white/5 hover:bg-[#8EE147]/5 transition-all duration-200 cursor-pointer group"
                        onClick={() => viewMessage(record)}
                      >
                        <TableCell className="font-medium text-slate-400 text-[10px] sm:text-sm">
                          {(page * perPage) + index + 1}
                        </TableCell>
                        <TableCell>
                          {index === 0 && page === 0 ? (
                            <Badge variant="outline" className="bg-[#8EE147]/10 text-[#8EE147] border-[#8EE147]/30 text-[10px] sm:text-xs whitespace-nowrap">
                              <MailOpen className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                              Initial
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-[10px] sm:text-xs whitespace-nowrap">
                              <Reply className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                              Reply
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[80px] sm:max-w-[150px]">
                          <p className="truncate font-medium text-slate-300 group-hover:text-[#8EE147] transition-colors text-[10px] sm:text-sm">
                            {record.subject || '-'}
                          </p>
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell>{getResponseBadge(record.response)}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full text-[8px] sm:text-xs font-medium bg-[#8EE147]/10 text-[#8EE147] border border-[#8EE147]/20 max-w-[80px] sm:max-w-[120px] truncate block">
                            <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />
                            {record.template_used || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-slate-400 whitespace-nowrap">
                            <Clock className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                            <span className="hidden sm:inline">{formatDate(record.reply_date || record.responded_at || record.sent_at)}</span>
                            <span className="sm:hidden">{record.reply_date ? new Date(record.reply_date).toLocaleDateString() : '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-0.5 sm:gap-1.5 h-7 sm:h-8 md:h-9 px-1.5 sm:px-2 md:px-3 bg-[#8EE147]/10 hover:bg-[#8EE147]/20 text-[#8EE147] hover:text-[#8EE147] rounded-lg transition-colors text-[10px] sm:text-xs whitespace-nowrap"
                            onClick={(e) => {
                              e.stopPropagation();
                              viewMessage(record);
                            }}
                          >
                            <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span className="hidden xs:inline">View</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 sm:py-10 md:py-12">
                        <div className="flex flex-col items-center gap-2 sm:gap-3">
                          <div className="p-3 sm:p-4 bg-white/5 rounded-full">
                            <Mail className="h-8 w-8 sm:h-10 sm:w-10 text-slate-500" />
                          </div>
                          <p className="text-xs sm:text-sm text-slate-400 font-medium">No emails found</p>
                          <p className="text-[10px] sm:text-xs text-slate-500">Try adjusting your search</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Summary footer with pagination - Dark Theme */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 border-t border-white/10 bg-gradient-to-r from-[#8EE147]/5 to-[#6EC035]/5">
              <p className="text-[10px] sm:text-sm text-slate-400">
                Showing <span className="font-semibold text-white">{contact.length}</span> of {totalCount} emails
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                  <span className="flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-white/5 rounded-lg shadow-sm border border-white/10 text-slate-300 whitespace-nowrap">
                    <MailOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#8EE147]" />
                    <span className="hidden xs:inline">Initial:</span>
                    <span className="font-semibold text-white">1</span>
                  </span>
                  <span className="flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-white/5 rounded-lg shadow-sm border border-white/10 text-slate-300 whitespace-nowrap">
                    <Reply className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-purple-400" />
                    <span className="hidden xs:inline">Replies:</span>
                    <span className="font-semibold text-white">{totalCount - 1}</span>
                  </span>
                </div>

                {/* Pagination Controls - Dark Theme */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={page === 0} 
                    onClick={() => setPage(p => p - 1)}
                    className="hover:bg-[#8EE147]/10 hover:border-[#8EE147]/30 transition-colors h-7 sm:h-8 md:h-9 px-2 sm:px-3 border border-white/20 bg-transparent text-white hover:text-[#8EE147] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 text-[#8EE147]" />
                  </Button>
                  <div className="px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] sm:text-xs font-medium text-white whitespace-nowrap">
                    {page + 1} / {totalPages || 1}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={page + 1 >= totalPages} 
                    onClick={() => setPage(p => p + 1)}
                    className="hover:bg-[#8EE147]/10 hover:border-[#8EE147]/30 transition-colors h-7 sm:h-8 md:h-9 px-2 sm:px-3 border border-white/20 bg-transparent text-white hover:text-[#8EE147] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-[#8EE147]" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EmailModal */}
        <EmailModal
          open={emailOpen}
          onClose={() => setEmailOpen(false)}
          recipients={getRecipient()}
          product={initialEmail?.product_name || ''}
          multipleProducts={false}
        />

        {/* View Message Dialog - Dark Theme */}
        <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
<DialogContent
  className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 rounded-2xl border border-white/10 shadow-2xl w-[95vw] sm:w-full bg-[#0E223B]
  [&>button]:!text-white
  [&>button]:!opacity-100
  [&>button]:!bg-transparent
  [&>button]:!border-0
  [&>button]:!outline-none
  [&>button]:!ring-0
  [&>button]:!shadow-none
  [&>button:hover]:!bg-transparent
  [&>button:hover]:!text-white
  [&>button:hover]:!border-0
  [&>button:focus]:!bg-transparent
  [&>button:focus]:!text-white
  [&>button:focus]:!border-0
  [&>button:focus]:!outline-none
  [&>button:focus]:!ring-0
  [&>button:focus-visible]:!border-0
  [&>button:focus-visible]:!outline-none
  [&>button:focus-visible]:!ring-0"
>       <div className="p-4 sm:p-6 border-b border-white/10 bg-gradient-to-r from-[#8EE147]/10 via-[#6EC035]/5 to-[#5AA82E]/5">
              <DialogHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                  <div>
                    <DialogTitle className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-2 text-white">
                      <div className="p-1 bg-gradient-to-r from-[#8EE147] to-[#6EC035] rounded-lg">
                        <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#0E223B]" />
                      </div>
                      Email Details
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1.5 text-xs sm:text-sm text-slate-400">
                      <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#8EE147]" />
                      From: <span className="font-medium text-white truncate max-w-[150px] sm:max-w-none">{selectedMessage?.email || selectedMessage?.from_email || 'Unknown'}</span>
                    </DialogDescription>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {getStatusBadge(selectedMessage?.status || '')}
                    {getResponseBadge(selectedMessage?.response || null)}
                  </div>
                </div>
              </DialogHeader>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-400 bg-white/5 p-1.5 sm:p-2 rounded-lg border border-white/5">
                <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#8EE147]" />
                {formatDate(selectedMessage?.reply_date || selectedMessage?.responded_at || selectedMessage?.sent_at)}
              </div>

              {selectedMessage?.subject && (
                <div className="space-y-1 sm:space-y-1.5">
                  <h4 className="text-[10px] sm:text-xs font-semibold text-[#8EE147]/70 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                    <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#8EE147]" />
                    Subject
                  </h4>
                  <p className="text-xs sm:text-sm font-medium text-white bg-white/5 p-2 sm:p-3 rounded-xl border border-white/10 break-words">
                    {selectedMessage.subject || '-'}
                  </p>
                </div>
              )}

              <div className="space-y-1 sm:space-y-1.5">
                <h4 className="text-[10px] sm:text-xs font-semibold text-[#8EE147]/70 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                  <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#8EE147]" />
                  Message
                </h4>
                <div className="p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 min-h-[100px] sm:min-h-[120px] max-h-[200px] sm:max-h-[300px] overflow-y-auto">
                  <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-wrap break-words leading-relaxed">
                    {selectedMessage?.message || 'No message content'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 sm:pt-4 border-t border-white/10">
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs font-medium text-[#8EE147]/70 uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
                    <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#8EE147]" />
                    Template
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-white bg-[#8EE147]/10 p-1.5 sm:p-2 rounded-lg border border-[#8EE147]/20 break-words whitespace-normal">
                    {selectedMessage?.template_used || '-'}
                  </p>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs font-medium text-[#8EE147]/70 uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
                    <Package className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#8EE147]" />
                    Product
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-white bg-[#8EE147]/10 p-1.5 sm:p-2 rounded-lg border border-[#8EE147]/20 break-words">
                    {selectedMessage?.product_name || '-'}
                  </p>
                </div>
              </div>
            </div>



              <div className="flex  sm:p-6  flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 pt-1">
              <Button 
  variant="outline" 
    onClick={() => setMessageDialogOpen(false)}
  className="bg-black text-white border-white/20  text-white hover:bg-white hover:text-[#0E223B] hover:border-white transition-all duration-200 bg-transparent h-8 sm:h-9 w-full sm:w-auto text-xs sm:text-sm"
>
  Cancel
</Button>
</div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}