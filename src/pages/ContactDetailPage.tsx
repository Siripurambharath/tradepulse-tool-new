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
  MapPin,
  Package,
  Search,
  User,
  Calendar,
  AlertCircle,
  RefreshCw,
  Eye,
  Clock,
  MessageSquare
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

interface Reply {
  id: number;
  batch_id: string;
  buyer_id?: number;
  from_email: string;
  to_email: string;
  subject: string;
  message: string;
  product_name: string;
  reply_date: string;
  company_name: string;
  contact_name: string;
  country: string;
  status: string;
  template_used: string;
  response: string;
  responded_at: string;
  sent_at: string;
}

export default function ContactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // EmailModal state
  const [emailOpen, setEmailOpen] = useState(false);

  // Message view dialog
  const [selectedMessage, setSelectedMessage] = useState<Reply | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  // Fetch buyer details by ID
  const fetchBuyerDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/api/replyhistory/${id}`);
      
      if (response.data.success) {
        setContact(response.data.data);
        console.log('Fetched buyer details:', response.data.data);
      } else {
        setError(response.data.message || "Contact not found");
      }
    } catch (error: any) {
      console.error('Error fetching buyer details:', error);
      if (error.response?.status === 404) {
        setError("Contact not found");
      } else {
        setError("Error loading contact details");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBuyerDetails();
    }
  }, [id]);

  const refreshData = async () => {
    setRefreshing(true);
    await fetchBuyerDetails();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Contact data has been updated",
    });
  };

  // Filter emails based on search
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
      email: e.from_email,
      company: e.company_name,
      country: e.country,
      product: e.product_name,
      buyer_id: e.buyer_id,
    }];
  };

  const getStatusBadge = (status: string) => {
    if (!status) return <Badge variant="secondary">Pending</Badge>;
    if (status.toLowerCase() === 'sent') {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">✓ Sent</Badge>;
    } else if (status.toLowerCase() === 'failed') {
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">✗ Failed</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const getResponseBadge = (response: string) => {
    if (!response) return <Badge variant="secondary">No Response</Badge>;
    if (response === 'interested') {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">✅ Interested</Badge>;
    } else if (response === 'not_interested') {
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">❌ Not Interested</Badge>;
    }
    return <Badge variant="secondary">{response}</Badge>;
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

  const viewMessage = (record: Reply) => {
    setSelectedMessage(record);
    setMessageDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading contact details...</p>
        </div>
      </div>
    );
  }

  if (error || contact.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-2">{error || "Contact not found"}</p>
          <p className="text-sm text-muted-foreground mb-4">Buyer ID: {id}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => navigate('/contacts')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contacts
            </Button>
            <Button onClick={fetchBuyerDetails}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const initialEmail = getInitialEmail();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/contacts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contacts
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              {initialEmail?.contact_name || 'Contact Details'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Buyer ID: {id} | Total Interactions: {contact.length}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setEmailOpen(true)} className="gap-2">
            <Mail className="h-4 w-4" />
            Send Email
          </Button>
        </div>
      </div>

      {/* Contact Information Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Company</p>
                <p className="text-sm font-medium">{initialEmail?.company_name || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-primary">{initialEmail?.from_email || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">
                  {initialEmail?.contact_name?.match(/^\+?\d+$/) ? initialEmail.contact_name : '-'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Product</p>
                <p className="text-sm font-medium">{initialEmail?.product_name || '-'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Email History</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
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
                  <TableHead className="font-medium">#</TableHead>
                  <TableHead className="font-medium">Type</TableHead>
                  <TableHead className="font-medium">Subject</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Response</TableHead>
                  <TableHead className="font-medium">Template</TableHead>
                  <TableHead className="font-medium">Date</TableHead>
                  <TableHead className="font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmails.length > 0 ? (
                  filteredEmails.map((record, index) => (
                    <TableRow key={record.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        {index === 0 ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">Initial Email</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700">Reply</Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate">{record.subject || '-'}</p>
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{getResponseBadge(record.response)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                          {record.template_used || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(record.reply_date || record.responded_at || record.sent_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 h-8 px-2"
                          onClick={() => viewMessage(record)}
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
                      No emails found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary footer */}
          <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
            <p>Showing {filteredEmails.length} of {contact.length} emails</p>
            <div className="flex gap-4">
              <span>📧 Initial: 1</span>
              <span>💬 Replies: {contact.length - 1}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EmailModal — same component used in ContactsPage */}
      <EmailModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        recipients={getRecipient()}
        product={initialEmail?.product_name || ''}
        multipleProducts={false}
      />

      {/* View Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Details</DialogTitle>
            <DialogDescription>
              From: {selectedMessage?.from_email || 'Unknown'}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-2">
                {getStatusBadge(selectedMessage?.status || '')}
                {getResponseBadge(selectedMessage?.response || '')}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(selectedMessage?.reply_date || selectedMessage?.responded_at || selectedMessage?.sent_at || '')}
              </div>
            </div>

            {selectedMessage?.subject && (
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Subject</h4>
                <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                  {selectedMessage.subject}
                </p>
              </div>
            )}

            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground">Message</h4>
              <div className="p-3 bg-muted/30 rounded-lg border">
                <p className="text-sm whitespace-pre-wrap break-words">
                  {selectedMessage?.message || 'No message content'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Template Used</p>
                <p className="text-sm">{selectedMessage?.template_used || '-'}</p>
              </div>
              <div className="space-y-1">
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