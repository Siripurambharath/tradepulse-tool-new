import { AdminSidebar } from "@/components/AdminSidebar";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Eye, 
  Users, 
  Mail, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  AlertCircle, 
  RefreshCw,
  Download,
  Filter,
  Building2,
  Calendar,
  ArrowUpDown,
  Send,
  Reply,
  Clock,
  FileText
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '@/components/api';

interface HistoryRecord {
  id: number;
  seller_id: number;
  company_name: string;
  country: string;
  contact_name: string;
  email: string;
  from_email: string;
  to_email: string;
  subject: string;
  message: string;
  product_name: string;
  reply_date: string;
  sent_at: string;
  status: string;
  template_used: string;
  response: string;
  responded_at: string;
  batch_id: string;
  buyer_id: number;
  multiple_products: number;
  template_id: number;
  sent_at_formatted: string;
  reply_date_formatted: string;
  responded_at_formatted: string;
  display_status: string;
  has_reply: number;
  is_interested: number;
  is_not_interested: number;
}

interface Summary {
  total_records: number;
  total_sellers: number;
  total_batches: number;
  total_buyers: number;
  total_sent: number;
  total_replied: number;
  total_interested: number;
  total_not_interested: number;
}

export default function AdminHistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sellerFilter, setSellerFilter] = useState('all');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [sortBy, setSortBy] = useState('sent_at');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/admin/history`);
      
      if (response.data.success) {
        setHistory(response.data.data);
        setSummary(response.data.summary);
      } else {
        setError('Failed to load history data');
      }
    } catch (error: any) {
      console.error('Error fetching history:', error);
      setError(error.message || 'Error loading history data');
    } finally {
      setLoading(false);
    }
  };

  // Get unique sellers for filter
  const uniqueSellers = Array.from(new Set(history.map(item => item.seller_id)));

  // Filter and sort data
  const filteredData = history
    .filter(item => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.company_name?.toLowerCase().includes(query) ||
          item.country?.toLowerCase().includes(query) ||
          item.product_name?.toLowerCase().includes(query) ||
          item.email?.toLowerCase().includes(query) ||
          item.batch_id?.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter(item => {
      // Status filter
      if (statusFilter === 'all') return true;
      if (statusFilter === 'sent') return item.status === 'sent';
      if (statusFilter === 'replied') return item.has_reply === 1;
      if (statusFilter === 'interested') return item.is_interested === 1;
      if (statusFilter === 'not_interested') return item.is_not_interested === 1;
      return true;
    })
    .filter(item => {
      // Seller filter
      if (sellerFilter === 'all') return true;
      return item.seller_id === parseInt(sellerFilter);
    })
    .sort((a, b) => {
      // Sorting
      let compareA: any = a[sortBy as keyof HistoryRecord];
      let compareB: any = b[sortBy as keyof HistoryRecord];
      
      if (sortBy === 'sent_at' || sortBy === 'reply_date') {
        compareA = new Date(compareA).getTime();
        compareB = new Date(compareB).getTime();
      }
      
      if (sortOrder === 'asc') {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });

  const getStatusBadge = (item: HistoryRecord) => {
    const status = item.display_status || item.status;
    
    switch (status) {
      case 'Replied, Interested':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">Replied, Interested</Badge>;
      case 'Replied, Not Interested':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">Replied, Not Interested</Badge>;
      case 'Replied':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Replied</Badge>;
      case 'Interested':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Interested</Badge>;
      case 'Not Interested':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200">Not Interested</Badge>;
      case 'sent':
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">Sent</Badge>;
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

 const viewDetails = (record: HistoryRecord) => {
  navigate(`/admin/historydetail/${record.buyer_id}`);
};

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Get counts for different statuses
  const getStatusCounts = () => {
    return {
      total: history.length,
      sent: history.filter(item => item.status === 'sent').length,
      replied: history.filter(item => item.has_reply === 1).length,
      interested: history.filter(item => item.is_interested === 1).length,
      not_interested: history.filter(item => item.is_not_interested === 1).length,
    };
  };

  const counts = getStatusCounts();

  // Handle card click to filter
  const handleCardClick = (status: string) => {
    setStatusFilter(status);
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading history data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-2">{error}</p>
            <Button onClick={fetchHistory}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-6 px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Email History </h1>
           
          </div>

          {/* Summary Cards - Same as Tracking page */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick('all')}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <FileText className="h-6 w-6 text-gray-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{counts.total}</p>
                  <p className="text-xs text-muted-foreground">Total Records</p>
                </div>
              </CardContent>
            </Card>

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
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="interested">Interested</SelectItem>
                <SelectItem value="not_interested">Not Interested</SelectItem>
              </SelectContent>
            </Select>

        
          </div>

          {/* Data Table */}
          <div className="bg-card rounded-lg border overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/50">
                <tr className="border-b">
                  <th className="p-3 text-left cursor-pointer hover:bg-muted/30" onClick={() => handleSort('id')}>
                    <div className="flex items-center gap-1">
                      ID <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                 
                  <th className="p-3 text-left">Company</th>
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left cursor-pointer hover:bg-muted/30" onClick={() => handleSort('sent_at')}>
                    <div className="flex items-center gap-1">
                      Sent At <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-muted-foreground">{item.id}</td>
                   
                    <td className="p-3">
                      <div className="font-medium">{item.company_name}</div>
                      <div className="text-xs text-muted-foreground">{item.country}</div>
                    </td>
                    <td className="p-3">{item.product_name}</td>
                    <td className="p-3">
                      <div className="text-xs">{item.email}</div>
                      {item.from_email && (
                        <div className="text-xs text-muted-foreground">From: {item.from_email}</div>
                      )}
                    </td>
                    <td className="p-3 text-xs">
                      {formatDate(item.sent_at)}
                      {item.reply_date && (
                        <div className="text-xs text-muted-foreground">
                          Reply: {formatDate(item.reply_date)}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(item)}
                        {item.has_reply === 1 && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            Has Reply
                          </div>
                        )}
                        {item.is_interested === 1 && (
                          <div className="text-xs text-green-600 flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            Interested
                          </div>
                        )}
                        {item.is_not_interested === 1 && (
                          <div className="text-xs text-red-600 flex items-center gap-1">
                            <ThumbsDown className="h-3 w-3" />
                            Not Interested
                          </div>
                        )}
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
                    <td colSpan={8} className="text-center py-8 text-muted-foreground">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
            <div>
              Showing {filteredData.length} of {history.length} records
            </div>
            <div>
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}