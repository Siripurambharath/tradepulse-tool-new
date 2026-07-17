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
  Loader2
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
  email: string; // Added email field
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
      email: e.email || e.from_email || '', // Use email field with fallback
      company: e.company_name,
      country: e.country,
      product: e.product_name,
      buyer_id: e.buyer_id,
    }];
  };

  const getStatusBadge = (status: string) => {
    if (!status) return <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-0">Pending</Badge>;
    if (status.toLowerCase() === 'sent') {
      return <Badge className="bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50">
        <CheckCircle className="h-3 w-3 mr-1" />
        Sent
      </Badge>;
    } else if (status.toLowerCase() === 'failed') {
      return <Badge className="bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200 hover:bg-red-50">
        <XCircle className="h-3 w-3 mr-1" />
        Failed
      </Badge>;
    }
    return <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-0">{status}</Badge>;
  };

  const getResponseBadge = (response: string | null) => {
    if (!response) return <Badge variant="secondary" className="bg-gray-100 text-gray-500 border-0">No Response</Badge>;
    if (response === 'interested') {
      return <Badge className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 hover:bg-blue-50">
        <TrendingUp className="h-3 w-3 mr-1" />
        Interested
      </Badge>;
    } else if (response === 'not_interested') {
      return <Badge className="bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200 hover:bg-red-50">
        <XCircle className="h-3 w-3 mr-1" />
        Not Interested
      </Badge>;
    }
    return <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-0">{response}</Badge>;
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-xl opacity-20 animate-pulse" />
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto relative" />
          </div>
          <p className="mt-6 text-sm font-medium text-muted-foreground animate-pulse">
            Loading contact details...
          </p>
        </div>
      </div>
    );
  }

  if (error || contact.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-full w-fit mx-auto mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Contact Not Found</h3>
          <p className="text-sm text-muted-foreground mb-2">{error || "No contact details available"}</p>
          <p className="text-xs text-muted-foreground/70 mb-6">Buyer ID: {id}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/contacts')} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={refreshData} className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const initialEmail = getInitialEmail();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 p-6">
      {/* Decorative gradient header */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/contacts')}
              className="hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                  <User className="h-6 w-6 text-white" />
                </div>
                {initialEmail?.company_name || 'Contact Details'}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Buyer ID: {id} • {totalCount} total interactions
              </p>
            </div>
          </div>
          <div className="flex gap-2">
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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sent</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.sent}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
                <Send className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Interested</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.interested}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Not Interested</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.not_interested}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information Summary Card */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/80 border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start gap-3 group">
                <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                  <Building className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Company</p>
                  <p className="text-sm font-semibold text-gray-800">{initialEmail?.company_name || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                  <AtSign className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</p>
                  <a href={`mailto:${initialEmail?.email || initialEmail?.from_email}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                    {initialEmail?.email || initialEmail?.from_email || '-'}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                  <Phone className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {initialEmail?.contact_name?.match(/^\+?\d+$/) ? initialEmail.contact_name : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</p>
                  <p className="text-sm font-semibold text-gray-800">{initialEmail?.product_name || '-'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Email History */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-md">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Email History
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">All email interactions with this contact</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
             
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    {stats.sent} sent
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                    {stats.interested} interested
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50/80 to-blue-50/80">
                    <TableHead className="font-semibold text-gray-700">#</TableHead>
                    <TableHead className="font-semibold text-gray-700">Type</TableHead>
                    <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Response</TableHead>
                    <TableHead className="font-semibold text-gray-700">Template</TableHead>
                    <TableHead className="font-semibold text-gray-700">Date</TableHead>
                    <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmails.length > 0 ? (
                    filteredEmails.map((record, index) => (
                      <TableRow 
                        key={record.id} 
                        className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 cursor-pointer group"
                        onClick={() => viewMessage(record)}
                      >
                        <TableCell className="font-medium text-gray-600">
                          {(page * perPage) + index + 1}
                        </TableCell>
                        <TableCell>
                          {index === 0 && page === 0 ? (
                            <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200">
                              <MailOpen className="h-3 w-3 mr-1" />
                              Initial
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200">
                              <Reply className="h-3 w-3 mr-1" />
                              Reply
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                            {record.subject || '-'}
                          </p>
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell>{getResponseBadge(record.response)}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200">
                            <Sparkles className="h-3 w-3" />
                            {record.template_used || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDate(record.reply_date || record.responded_at || record.sent_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 h-9 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded-lg transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              viewMessage(record);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
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
                          <p className="text-muted-foreground font-medium">No emails found</p>
                          <p className="text-sm text-muted-foreground/70">Try adjusting your search</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Summary footer with pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{contact.length}</span> of {totalCount} emails
              </p>
              <div className="flex items-center gap-3">
                <div className="flex gap-2 text-xs">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                    <MailOpen className="h-3.5 w-3.5 text-blue-500" />
                    Initial: <span className="font-semibold text-gray-700">1</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Reply className="h-3.5 w-3.5 text-purple-500" />
                    Replies: <span className="font-semibold text-gray-700">{totalCount - 1}</span>
                  </span>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={page === 0} 
                    onClick={() => setPage(p => p - 1)}
                    className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="px-3 py-1 bg-white rounded-lg border text-xs font-medium">
                    {page + 1} / {totalPages || 1}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={page + 1 >= totalPages} 
                    onClick={() => setPage(p => p + 1)}
                    className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
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

        {/* View Message Dialog */}
        <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 rounded-2xl border-0 shadow-2xl">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-800">
                      <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                        <Mail className="h-4 w-4 text-white" />
                      </div>
                      Email Details
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-1.5 text-sm">
                      <User className="h-3.5 w-3.5 text-blue-500" />
                      From: <span className="font-medium text-gray-700">{selectedMessage?.email || selectedMessage?.from_email || 'Unknown'}</span>
                    </DialogDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getStatusBadge(selectedMessage?.status || '')}
                    {getResponseBadge(selectedMessage?.response || null)}
                  </div>
                </div>
              </DialogHeader>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-gray-50 p-2 rounded-lg">
                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                {formatDate(selectedMessage?.reply_date || selectedMessage?.responded_at || selectedMessage?.sent_at)}
              </div>

              {selectedMessage?.subject && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-blue-500" />
                    Subject
                  </h4>
                  <p className="text-sm font-medium text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {selectedMessage.subject || '-'}
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                  Message
                </h4>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 min-h-[120px]">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                    {selectedMessage?.message || 'No message content'}
                  </p>
                </div>
              </div>

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
  );
}