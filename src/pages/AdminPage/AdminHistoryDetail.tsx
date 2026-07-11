import { AdminSidebar } from "@/components/AdminSidebar";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Building,
  Package,
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
  FileText,
  MessageSquare
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

interface Communication {
  id: number;
  buyer_id: number;
  batch_id: string;
  seller_id: number;
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
  seller_id: number;
}

interface Summary {
  total: number;
  sent: number;
  replied: number;
  interested: number;
  not_interested: number;
  last_activity: string | null;
}

export default function AdminHistoryDetail() {
  const navigate = useNavigate();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Communication | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  // Get the buyer_id from URL params
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchAdminHistoryDetail(id);
    }
  }, [id]);

  const fetchAdminHistoryDetail = async (buyerId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/admin/history/${buyerId}`);
      
      if (response.data.success) {
        setCommunications(response.data.data);
        setBuyerInfo(response.data.buyer_info);
        setSummary(response.data.summary);
        console.log('Admin history detail:', response.data);
      } else {
        setError(response.data.message || 'History not found');
      }
    } catch (error: any) {
      console.error('Error fetching history detail:', error);
      if (error.response?.status === 404) {
        setError('Record not found');
      } else {
        setError('Failed to load history details');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    if (id) {
      await fetchAdminHistoryDetail(id);
    }
    setRefreshing(false);
  };

  const getStatusBadge = (communication: Communication) => {
    const status = communication.display_status || communication.status;
    
    switch(status) {
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
      case 'Sent':
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">Sent</Badge>;
      default:
        return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
    }
  };

  const getTypeIcon = (communication: Communication) => {
    const status = communication.display_status || communication.status;
    
    switch(status) {
      case 'Replied, Interested':
      case 'Replied, Not Interested':
      case 'Replied':
        return <Reply className="h-4 w-4 text-blue-500" />;
      case 'Interested':
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'Not Interested':
        return <ThumbsDown className="h-4 w-4 text-red-500" />;
      case 'Sent':
        return <Send className="h-4 w-4 text-gray-500" />;
      default:
        return <Mail className="h-4 w-4" />;
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

  const viewMessage = (communication: Communication) => {
    setSelectedMessage(communication);
    setMessageDialogOpen(true);
  };

  const getMessagePreview = (message: string) => {
    if (!message) return 'No message content';
    return message.length > 150 ? message.substring(0, 150) + '...' : message;
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading history details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !buyerInfo) {
    return (
      <div className="flex h-screen">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-2">{error || "Record not found"}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => navigate('/admin/history')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to History
              </Button>
             
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-6 px-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/admin/history')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to History
              </Button>
              <div>
                
            
              </div>
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
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium text-primary">{buyerInfo.email || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Contact</p>
                    <p className="text-sm font-medium">{buyerInfo.contact_name || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Product</p>
                    <p className="text-sm font-medium">{buyerInfo.product_name || '-'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{summary?.total || 0}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{summary?.sent || 0}</p>
                  <p className="text-xs text-muted-foreground">Sent</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{summary?.replied || 0}</p>
                  <p className="text-xs text-muted-foreground">Replied</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{summary?.interested || 0}</p>
                  <p className="text-xs text-muted-foreground">Interested</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{summary?.not_interested || 0}</p>
                  <p className="text-xs text-muted-foreground">Not Interested</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Communications Table */}
          <Card>
            <CardContent className="pt-6">
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
                    {communications.length > 0 ? (
                      communications.map((comm, index) => (
                        <TableRow 
                          key={comm.id} 
                          className="hover:bg-muted/20 transition-colors cursor-pointer"
                          onClick={() => viewMessage(comm)}
                        >
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getTypeIcon(comm)}
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
                              {formatDate(comm.date || comm.sent_at)}
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
                  {selectedMessage?.display_status || selectedMessage?.status || 'Communication'} 
                  {selectedMessage?.seller_id && ` • Seller ID: ${selectedMessage.seller_id}`}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div className="flex gap-2">
                    {selectedMessage && getStatusBadge(selectedMessage)}
                    {selectedMessage?.batch_id && (
                      <Badge variant="outline" className="text-xs">
                        Batch: {selectedMessage.batch_id.substring(0, 8)}...
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(selectedMessage?.date || selectedMessage?.sent_at || null)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">From</p>
                    <p className="text-sm bg-muted/20 p-2 rounded">{selectedMessage?.from_email || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">To</p>
                    <p className="text-sm bg-muted/20 p-2 rounded">{selectedMessage?.to_email || '-'}</p>
                  </div>
                </div>

                {selectedMessage?.subject && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Subject
                    </h4>
                    <p className="text-sm bg-muted/30 p-3 rounded-lg border">
                      {selectedMessage.subject}
                    </p>
                  </div>
                )}

                {selectedMessage?.message && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </h4>
                    <div className="p-4 bg-muted/30 rounded-lg border max-h-60 overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>
                )}

                {selectedMessage?.response && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Response</h4>
                    <div className={`p-3 rounded-lg border ${
                      selectedMessage.response === 'interested' ? 'bg-green-50 border-green-200' : 
                      selectedMessage.response === 'not_interested' ? 'bg-red-50 border-red-200' : 'bg-gray-50'
                    }`}>
                      <p className="text-sm font-medium">
                        {selectedMessage.response === 'interested' ? '✅ Interested' :
                         selectedMessage.response === 'not_interested' ? '❌ Not Interested' :
                         selectedMessage.response}
                      </p>
                      {selectedMessage.responded_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Responded at: {formatDate(selectedMessage.responded_at)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Template</p>
                    <p className="text-sm">{selectedMessage?.template_used || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Product</p>
                    <p className="text-sm">{selectedMessage?.product_name || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Status</p>
                    <p className="text-sm">{selectedMessage?.status || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Batch ID</p>
                    <p className="text-sm truncate">{selectedMessage?.batch_id || '-'}</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}