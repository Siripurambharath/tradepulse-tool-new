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
  ThumbsDown,
  AtSign,
  Phone
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
      const response = await axios.get(`http://localhost:5000/api/tracking/buyer/${id}`);
      
      if (response.data.success) {
        setCommunications(response.data.data);
        setBuyerInfo(response.data.buyer_info);
        setSummary(response.data.summary);
        console.log('Communications:', response.data.data);
      } else {
        setError('Tracking data not found');
      }
    } catch (error: any) {
      console.error('Error:', error);
      if (error.response?.status === 404) {
        setError('Buyer not found');
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
      comm.display_status?.toLowerCase().includes(q);
  });

  const getStatusBadge = (communication: TrackingCommunication) => {
    switch(communication.display_status) {
      case 'Sent':
        return <Badge className="bg-blue-100 text-blue-700">📧 Sent</Badge>;
      case 'Replied':
        return <Badge className="bg-green-100 text-green-700">💬 Replied</Badge>;
      case 'Interested':
        return <Badge className="bg-emerald-100 text-emerald-700">👍 Interested</Badge>;
      case 'Not Interested':
        return <Badge className="bg-red-100 text-red-700">👎 Not Interested</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTypeIcon = (communication: TrackingCommunication) => {
    switch(communication.display_status) {
      case 'Sent': return <Send className="h-4 w-4 text-blue-500" />;
      case 'Replied': return <Reply className="h-4 w-4 text-green-500" />;
      case 'Interested': return <ThumbsUp className="h-4 w-4 text-emerald-500" />;
      case 'Not Interested': return <ThumbsDown className="h-4 w-4 text-red-500" />;
      default: return <Mail className="h-4 w-4" />;
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
    setSelectedMessage(communication);
    setMessageDialogOpen(true);
  };

  const getMessagePreview = (message: string) => {
    if (!message) return 'No message content';
    return message.length > 100 ? message.substring(0, 100) + '...' : message;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading tracking details...</p>
        </div>
      </div>
    );
  }

  if (error || !buyerInfo) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-2">{error || "Buyer not found"}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => navigate('/tracking')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tracking
            </Button>
            <Button onClick={fetchTrackingDetails}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/tracking')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tracking
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building className="h-6 w-6 text-primary" />
              {buyerInfo.company_name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Buyer ID: {id} | Total Communications: {summary?.total || 0}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Buyer Information Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Company</p>
                <p className="text-sm font-medium">{buyerInfo.company_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AtSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Primary Email</p>
                <p className="text-sm font-medium text-primary">{buyerInfo.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Primary Contact</p>
                <p className="text-sm font-medium">{buyerInfo.contact_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Product</p>
                <p className="text-sm font-medium">{buyerInfo.product_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Country</p>
                <p className="text-sm font-medium">{buyerInfo.country}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Communications History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>Complete Communication History</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Message Preview</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-20">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommunications.length > 0 ? (
                  filteredCommunications.map((comm, index) => (
                    <TableRow 
                      key={comm.id} 
                      className="hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => viewMessage(comm)}
                    >
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getTypeIcon(comm)}
                          <span className="text-xs">{comm.display_status}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(comm)}</TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate font-medium">{comm.subject || 'No Subject'}</p>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm text-muted-foreground truncate">
                          {getMessagePreview(comm.message)}
                        </p>
                      </TableCell>
                      <TableCell>
                        {comm.template_used && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                            {comm.template_used}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(comm.date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 h-8 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewMessage(comm);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No communications found for this buyer
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Footer summary */}
          <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
            <p>Showing {filteredCommunications.length} of {communications.length} communications</p>
          </div>
        </CardContent>
      </Card>

      {/* View Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedMessage && getTypeIcon(selectedMessage)}
              Message Details
            </DialogTitle>
            <DialogDescription>
              {selectedMessage?.display_status} communication
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div className="flex gap-2">
                {selectedMessage && getStatusBadge(selectedMessage)}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(selectedMessage?.date || null)}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">From</p>
              <p className="text-sm">{selectedMessage?.from_email || '-'}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">To</p>
              <p className="text-sm">{selectedMessage?.to_email || '-'}</p>
            </div>

            {selectedMessage?.subject && (
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Subject</h4>
                <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                  {selectedMessage.subject}
                </p>
              </div>
            )}

            {selectedMessage?.message && (
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Message</h4>
                <div className="p-3 bg-muted/30 rounded-lg border">
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>
            )}

            {selectedMessage?.response && selectedMessage.display_status !== 'Sent' && (
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Response Status</h4>
                <div className={`p-3 rounded-lg ${
                  selectedMessage.response === 'interested' ? 'bg-emerald-50 border border-emerald-200' : 
                  selectedMessage.response === 'not_interested' ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                }`}>
                  <p className="text-sm font-medium">
                    {selectedMessage.response === 'interested' ? '✓ Interested' :
                     selectedMessage.response === 'not_interested' ? '✗ Not Interested' :
                     selectedMessage.response}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Template</p>
                <p className="text-sm">{selectedMessage?.template_used || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Product</p>
                <p className="text-sm">{selectedMessage?.product_name || '-'}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}