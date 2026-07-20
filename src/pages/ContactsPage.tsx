import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmailModal } from '@/components/EmailModal';
import { 
  Search, Mail, Eye, Users, Building2, Package, 
  MessageSquare, Phone, AtSign, Filter, Sparkles,
  TrendingUp, Clock, CheckCircle, XCircle, User,
  Calendar, ArrowUpRight, LayoutGrid, List, Send,
  ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import axios from 'axios';
import { ACTIVITY_URL, API_URL } from '@/components/api';
const API = API_URL;

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

// Custom debounce hook for smooth search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Update interface to match backend response
interface Contact {
  buyer_id: number;
  contact_name: string;
  from_email: string;
  to_email: string;
  company_name: string;
  country: string;
  product_name: string;
  template_used: string;
  phone: string;
  interaction_count: number;
  status: string;
  email: string; 
  contact_number?: string;
  response: string | null;
  last_interaction: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface StatsData {
  total: number;
  interested: number;
  not_interested: number;
  pending: number;
}

export default function ContactsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [templateFilter, setTemplateFilter] = useState('all');
  const [selected, setSelected] = useState(new Set<number>());
  const [emailOpen, setEmailOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const perPage = 10;

  // Stats state
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    interested: 0,
    not_interested: 0,
    pending: 0
  });

  // Templates for dropdown
  const [templates, setTemplates] = useState<string[]>([]);

  const getSellerId = () => {
    try {
      const seller = JSON.parse(localStorage.getItem("seller") || "{}");
      return seller.id;
    } catch {
      return null;
    }
  };

  // Load templates for dropdown
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const sellerId = getSellerId();
      if (!sellerId) return;

      const response = await axios.get(`${API}/api/contacts/templates?seller_id=${sellerId}`);
      setTemplates(response.data.map((t: any) => t.template));
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  // Fetch stats separately
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const sellerId = getSellerId();

      if (!sellerId) {
        console.error('No sellerId found — user may not be logged in');
        setStatsLoading(false);
        return;
      }

      const response = await axios.get(`${API}/api/contacts/stats?seller_id=${sellerId}`);
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch contacts with pagination, search, and template filter
  const fetchContacts = useCallback(async (isSearch = false) => {
    try {
      // Only show loading spinner for initial load, not for search
      if (!isSearch) {
        setLoading(true);
      }
      
      const sellerId = getSellerId();

      if (!sellerId) {
        console.error('No sellerId found — user may not be logged in');
        if (!isSearch) setLoading(false);
        return;
      }

      // Build query params with pagination
      const params = new URLSearchParams();
      params.set('seller_id', sellerId);
      params.set('page', String(page + 1));
      params.set('limit', String(perPage));
      
      if (debouncedQuery) params.set('search', debouncedQuery);
      if (templateFilter !== 'all') params.set('template', templateFilter);

      const response = await axios.get(`${API}/api/contacts?${params.toString()}`);
      
      if (response.data.success) {
        const data = response.data.data || [];
        const total = response.data.total || 0;
        const paginationData = response.data.pagination || null;
        
        setContacts(data);
        setTotalCount(total);
        setPagination(paginationData);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      if (!isSearch) {
        setLoading(false);
      }
    }
  }, [debouncedQuery, templateFilter, page, perPage]);

  // Initial load
  useEffect(() => {
    fetchStats();
    fetchContacts(false);
    createActivityLog(19, 4, 'Viewed contacts page');
  }, []);

  // Fetch contacts when page, debounced query, or filter changes
  useEffect(() => {
    const isSearch = debouncedQuery.length > 0 || templateFilter !== 'all';
    fetchContacts(isSearch);
  }, [page, debouncedQuery, templateFilter, fetchContacts]);

  // Log search activity when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      createActivityLog(21, 4, `Searched contacts with text: ${debouncedQuery}`, {
        searchQuery: debouncedQuery
      });
    }
  }, [debouncedQuery]);

  // Log filter activity when template filter changes
  useEffect(() => {
    if (templateFilter !== 'all') {
      createActivityLog(22, 4, `Filtered contacts by template: ${templateFilter}`, {
        template: templateFilter
      });
    }
  }, [templateFilter]);

  const toggleSelect = (buyerId: number) => {
    const next = new Set(selected);
    next.has(buyerId) ? next.delete(buyerId) : next.add(buyerId);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === contacts.length) setSelected(new Set());
    else setSelected(new Set(contacts.map(contact => contact.buyer_id)));
  };

  const getSelectedContacts = () => {
    return contacts.filter(contact => selected.has(contact.buyer_id));
  };

  const getUniqueProducts = () => {
    const selectedContacts = getSelectedContacts();
    const uniqueProducts = [...new Set(selectedContacts.map(c => c.product_name).filter(Boolean))];
    return uniqueProducts;
  };

  const getProductToSend = () => {
    const uniqueProducts = getUniqueProducts();
    if (uniqueProducts.length === 0 || uniqueProducts.length > 1) {
      return "General Products";
    }
    return uniqueProducts[0];
  };

  const isMultipleProductsSelected = () => {
    const selectedContacts = getSelectedContacts();
    const uniqueProducts = [...new Set(selectedContacts.map(c => c.product_name).filter(Boolean))];
    return uniqueProducts.length > 1;
  };

  const getRecipients = () => contacts
    .filter(contact => selected.has(contact.buyer_id))
    .map(contact => ({ 
      name: contact.contact_name || contact.company_name || 'Unknown',
      email: contact.email,
      company: contact.company_name,
      country: contact.country,
      product: contact.product_name,
      buyer_id: contact.buyer_id,
      contacts: contact.phone || contact.contact_name || '',
      contact_number: contact.phone || contact.contact_name || '',
    }));

  const getStatusBadge = (contact: Contact) => {
    if (contact.status === 'sent') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200">
          <CheckCircle className="h-3 w-3" />
          Sent
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border border-gray-200">
        <Clock className="h-3 w-3" />
        Pending
      </span>
    );
  };

  const getResponseBadge = (contact: Contact) => {
    if (contact.response === 'interested') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200">
          <TrendingUp className="h-3 w-3" />
          Interested
        </span>
      );
    }
    if (contact.response === 'not_interested') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200">
          <XCircle className="h-3 w-3" />
          Not Interested
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-50 to-slate-50 text-gray-500 border border-gray-200">
        <Clock className="h-3 w-3" />
        Pending Response
      </span>
    );
  };

  const viewContactDetails = (buyerId: number) => {
    const contact = contacts.find(c => c.buyer_id === buyerId);
    createActivityLog(10, 4, `Viewed contact details for: ${contact?.contact_name || buyerId}`, {
      buyer_id: buyerId,
      contact_name: contact?.contact_name,
      company_name: contact?.company_name
    });
    navigate(`/contactsindetail/${buyerId}`);
  };

  const handleEmailModalOpen = () => {
    createActivityLog(24, 4, 'Opened email modal from contacts page', {
      selected_count: selected.size
    });
    setEmailOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setQuery(e.target.value);
  };

  const totalPages = pagination?.totalPages || Math.ceil(totalCount / perPage) || 1;

  // Only show full page loading on initial load
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-xl opacity-20 animate-pulse" />
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto relative" />
          </div>
          <p className="mt-6 text-sm font-medium text-muted-foreground animate-pulse">
            Loading contacts...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 p-6">
      {/* Decorative header gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              Contacts
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Manage and communicate with your contacts
            </p>
          </div>
          <Button 
            onClick={handleEmailModalOpen} 
            disabled={selected.size === 0} 
            className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            <span>Send Email</span>
            {selected.size > 0 && (
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                {selected.size}
              </span>
            )}
          </Button>
        </div>

        {/* Stats Cards - Show skeleton while loading */}
        {statsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-3 w-20 bg-gray-200 rounded"></div>
                    <div className="h-8 w-12 bg-gray-200 rounded mt-2"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Contacts</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Interested</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.interested}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Not Interested</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{stats.not_interested}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Response</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters with glassmorphism */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
              <Input 
                placeholder="Search by name, email, company, product..." 
                value={query} 
                onChange={handleSearchChange}
                className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl bg-white/80"
              />
            </div>
            
            <div className="relative">
              <Select value={templateFilter} onValueChange={(v) => { setPage(0); setTemplateFilter(v); }}>
                <SelectTrigger className="w-48 border-gray-200 focus:border-blue-400 rounded-xl bg-white/80">
                  <Filter className="h-4 w-4 mr-2 text-blue-500" />
                  <SelectValue placeholder="All Templates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📋 All Templates</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t} value={t}>
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-blue-500" />
                        {t}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* View toggle */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl ml-auto">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'table' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Table View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Grid View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results count and pagination info */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{contacts.length}</span> of{' '}
              <span className="font-semibold text-foreground">{totalCount}</span> contacts
            </span>
            {selected.size > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                <Checkbox checked className="h-3 w-3" />
                {selected.size} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === 0} 
              onClick={() => setPage(p => p - 1)}
              className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-4 py-1.5 bg-white rounded-lg border text-sm font-medium shadow-sm">
              Page <span className="text-blue-600">{page + 1}</span> / {totalPages || 1}
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

        {/* Table with modern design */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="p-4 bg-gray-50 rounded-full">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-muted-foreground font-medium">No contacts found</p>
              <p className="text-sm text-muted-foreground/70">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 border-b border-gray-200">
                    <th className="p-4 w-12">
                      <Checkbox 
                        checked={selected.size === contacts.length && contacts.length > 0} 
                        onCheckedChange={selectAll}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-500" />
                        Company
                      </div>
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-500" />
                        Product
                      </div>
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-blue-500" />
                        Template
                      </div>
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        Interactions
                      </div>
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Status
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Response
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <AtSign className="h-4 w-4 text-blue-500" />
                        Email
                      </div>
                    </th>
                    <th className="p-10 text-left font-semibold text-gray-700 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-500" />
                        Phone
                      </div>
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr 
                      key={contact.buyer_id} 
                      className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 ${
                        selected.has(contact.buyer_id) ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={selected.has(contact.buyer_id)} 
                          onCheckedChange={() => toggleSelect(contact.buyer_id)}
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
                            {contact.company_name?.charAt(0) || 'C'}
                          </div>
                          <span className="font-medium text-gray-800">
                            {contact.company_name || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-600">{contact.product_name || '-'}</span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200">
                          <Sparkles className="h-3 w-3" />
                          {contact.template_used || 'No Template'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 font-bold text-sm">
                          {contact.interaction_count}
                        </span>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(contact)}
                      </td>
                      <td className="p-4">
                        {getResponseBadge(contact)}
                      </td>
                      <td className="p-4">
                        <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-800 hover:underline transition-colors text-xs">
                          {contact.email || '-'}
                        </a>
                      </td>
                    <td className="p-4">
  {contact.contact_name && /[\d\-+() ]{7,}/.test(contact.contact_name) ? (
    <a 
      href={`tel:${contact.contact_name.replace(/\s/g, '')}`}
      className="text-blue-600 hover:text-blue-800 hover:underline transition-colors text-xs flex items-center gap-1.5 group"
    >
      <Phone className="h-3 w-3" />
      <span className="group-hover:underline">{contact.contact_name}</span>
    </a>
  ) : (
    <span className="text-gray-400 text-xs flex items-center gap-1">
      <Phone className="h-3 w-3" />
      Not available
    </span>
  )}
</td>
                      <td className="p-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-1.5 h-9 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded-lg transition-colors"
                          onClick={() => viewContactDetails(contact.buyer_id)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                          <ArrowUpRight className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bottom section with pagination */}
        {contacts.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {page * perPage + 1} - {Math.min((page + 1) * perPage, totalCount)} of {totalCount} contacts
            </div>
            <div className="flex items-center gap-2">
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
        )}
      </div>

      <EmailModal 
        open={emailOpen} 
        onClose={() => setEmailOpen(false)} 
        recipients={getRecipients()}
        product={getProductToSend()}
        multipleProducts={isMultipleProductsSelected()}
      />
    </div>
  );
}