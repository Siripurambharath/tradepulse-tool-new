import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import {
  ArrowLeft,
  Clock,
  Users,
  MessageSquare,
  Package,
  Mail,
  ThumbsUp,
  ThumbsDown,
  Send,
  Building2,
  User,
  AtSign,
  Calendar,
  FileText,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { API_URL } from '@/components/api';

interface Company {
  companyName: string;
  contactName: string;
  email: string;
  sentAt: string;
  response: string | null;
  respondedAt: string | null;
  status: string;
  templateUsed: string;
  subject: string;
  message: string | null;
  product: string;
  hasReply: boolean;
  isInterested: boolean;
  isNotInterested: boolean;
}

interface EntryData {
  id: string;
  product: string;
  multiple_products: number;
  date: string;
  companies: Company[];
  counts: {
    total: number;
    replied: number;
    interested: number;
    notInterested: number;
    emailSent: number;
  };
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function HistoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [entry, setEntry] = useState<EntryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const perPage = 10;

  const seller = JSON.parse(localStorage.getItem("seller") || "{}");
  const sellerId = seller.id;

  const fetchEntry = async () => {
    if (!id || !sellerId) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('seller_id', sellerId);
      params.set('page', String(page + 1));
      params.set('limit', String(perPage));

      const response = await fetch(`${API_URL}/history/${id}?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setEntry(data.data);
        setPagination(data.pagination || null);
      } else {
        setError(data.message || 'Entry not found');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load entry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntry();
  }, [id, page]);

  // Filter companies by search
  const filteredCompanies = entry?.companies?.filter((c) => {
    const q = searchQuery.toLowerCase();
    return !q ||
      c.companyName?.toLowerCase().includes(q) ||
      c.contactName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.product?.toLowerCase().includes(q) ||
      c.status?.toLowerCase().includes(q);
  }) || [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-muted-foreground animate-pulse">Loading details...</p>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-full p-6 mb-4">
          <Package className="h-12 w-12 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Entry Not Found</h3>
        <p className="text-muted-foreground mb-6">{error || "The history entry you're looking for doesn't exist."}</p>
        <Button
          variant="default"
          onClick={() => navigate('/history')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Button>
      </div>
    );
  }

  const date = new Date(entry.date);
  const companies = entry.companies || [];
  const counts = entry.counts || { total: 0, replied: 0, interested: 0, notInterested: 0, emailSent: 0 };
  const multipleProducts = entry.multiple_products || 0;

  const responseRate = counts.total > 0 ? Math.round((counts.replied / counts.total) * 100) : 0;
  const interestRate = counts.total > 0 ? Math.round((counts.interested / counts.total) * 100) : 0;

  const totalPages = pagination?.totalPages || Math.ceil((entry?.counts?.total || 0) / perPage) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="gap-2 mb-6 text-muted-foreground hover:text-foreground transition-colors group"
        onClick={() => navigate('/history')}
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to History
      </Button>

      {/* Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-6 mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-2xl"></div>
        
        <div className="relative">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  {entry.product}
                </h1>
                <div className="px-3 py-1 bg-primary/20 rounded-full text-xs font-semibold text-primary border border-primary/30">
                  <Sparkles className="h-3 w-3 inline mr-1" />
                  {pagination?.totalItems || counts.total} companies
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{date.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} at {date.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
                {multipleProducts > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                    <Package className="h-4 w-4 text-blue-500" />
                    <span className="text-blue-600 dark:text-blue-400 font-medium">{multipleProducts} products</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 hover:shadow-lg transition-all hover:scale-[1.02] border-0 shadow-sm bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{counts.total}</p>
                <p className="text-xs text-muted-foreground">Total Companies</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-all hover:scale-[1.02] border-0 shadow-sm bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Mail className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{counts.emailSent}</p>
                <p className="text-xs text-muted-foreground">Emails Sent</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-all hover:scale-[1.02] border-0 shadow-sm bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <MessageSquare className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{counts.replied}</p>
                <p className="text-xs text-muted-foreground">Replied ({responseRate}%)</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-all hover:scale-[1.02] border-0 shadow-sm bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{interestRate}%</p>
                <p className="text-xs text-muted-foreground">Interest Rate</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/30 rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-green-500/20 rounded-full flex items-center gap-2">
            <ThumbsUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">{counts.interested} Interested</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-red-500/20 rounded-full flex items-center gap-2">
            <ThumbsDown className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">{counts.notInterested} Not Interested</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-gray-500/20 rounded-full flex items-center gap-2">
            <Minus className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">{counts.total - counts.replied} No Response</span>
          </div>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Company Details
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {pagination?.totalItems || companies.length} companies
            </span>
          </h3>
          <div className="relative">
            <Input
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-48 border-gray-200 focus:border-primary rounded-lg bg-white/80 dark:bg-gray-800/80"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3 w-3" />
                    Company
                  </div>
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Package className="h-3 w-3" />
                    Product
                  </div>
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    Contact
                  </div>
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <AtSign className="h-3 w-3" />
                    Email
                  </div>
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Send className="h-3 w-3" />
                    Sent At
                  </div>
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    Template
                  </div>
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3 w-3" />
                    Response
                  </div>
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((c: Company, i: number) => (
                  <tr 
                    key={i} 
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="font-medium text-foreground flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-primary">
                          {c.companyName?.charAt(0) || 'C'}
                        </div>
                        {c.companyName}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{c.product || '-'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{c.contactName || '-'}</td>
                    <td className="p-4">
                      <a href={`mailto:${c.email}`} className="text-primary hover:underline">
                        {c.email}
                      </a>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {c.sentAt ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(c.sentAt).toLocaleString()}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-muted rounded text-xs">
                        {c.templateUsed || '-'}
                      </span>
                    </td>
                    <td className="p-4">
                      {c.respondedAt ? (
                        <div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(c.respondedAt).toLocaleString()}
                          </div>
                          {c.message && (
                            <p className="text-xs text-foreground mt-1 max-w-xs bg-muted/50 p-2 rounded-lg border border-border">
                              "{c.message}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">No response</span>
                      )}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <Building2 className="h-12 w-12 text-muted-foreground/20" />
                      <p>No companies found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-border bg-muted/30">
            <div className="text-sm text-muted-foreground">
              Showing {page * perPage + 1} - {Math.min((page + 1) * perPage, pagination.totalItems)} of {pagination.totalItems} companies
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === 0} 
                onClick={() => setPage(p => p - 1)}
                className="hover:bg-primary/10 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-3 py-1 bg-card rounded-lg border text-xs font-medium">
                {page + 1} / {pagination.totalPages || 1}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page + 1 >= (pagination?.totalPages || 1)} 
                onClick={() => setPage(p => p + 1)}
                className="hover:bg-primary/10 transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}