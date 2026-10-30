
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
  ChevronLeft, ChevronRight, Loader2, Hash, Copy, Check
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

// Deterministic avatar palette - updated with new colors
const AVATAR_PALETTE = [
  { bg: '#0E223B', fg: '#FFFFFF' },
  { bg: '#8EE147', fg: '#0E223B' },
  { bg: '#1A3355', fg: '#FFFFFF' },
  { bg: '#6EC035', fg: '#FFFFFF' },
  { bg: '#2A4A6B', fg: '#FFFFFF' },
  { bg: '#A8E86A', fg: '#0E223B' },
  { bg: '#3A6080', fg: '#FFFFFF' },
  { bg: '#8EE147', fg: '#0E223B' },
];

function hashString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function CompanyAvatar({ name }: { name: string }) {
  const safe = name || '?';
  const palette = AVATAR_PALETTE[hashString(safe) % AVATAR_PALETTE.length];
  const initial = safe.trim().charAt(0).toUpperCase();
  return (
    <div
      className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl flex items-center justify-center font-semibold text-sm sm:text-base"
      style={{ backgroundColor: palette.bg, color: palette.fg }}
      aria-hidden
    >
      {initial}
    </div>
  );
}

// Copy button component - updated with new colors
function CopyButton({ value, type, buyerId, companyName }: {
  value: string;
  type: 'phone' | 'email';
  buyerId?: number;
  companyName?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);

      const actionId = type === 'email' ? 48 : 49;
      const actionName = type === 'email' ? 'Email' : 'Phone Number';

      await createActivityLog(
        actionId,
        1,
        `Copied ${actionName}: ${value}${companyName ? ` (${companyName})` : ''}`,
        {
          copyType: type,
          copiedValue: value,
          buyer_id: buyerId,
          company_name: companyName
        }
      );

      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 p-1 rounded hover:bg-[#1A3355] transition-colors"
      title={`Copy ${type === 'email' ? 'email' : 'phone'}`}
    >
      {copied ? 
        <Check className="h-3.5 w-3.5" style={{ color: '#8EE147' }} /> : 
        <Copy className="h-3.5 w-3.5" style={{ color: '#64748B' }} />
      }
    </button>
  );
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
  const [statsLoading, setStatsLoading] = useState(true);
  
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
  
  // Ref for debounce
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Function to log search with debounce
  const logSearch = (searchValue: string) => {
    if (!searchValue || searchValue.length < 2) return;
    
    let actionId = 42;
    let searchType = 'HSN';
    const lowerValue = searchValue.toLowerCase();
    
    const companyMatch = contacts.some(c => c.company_name?.toLowerCase().includes(lowerValue));
    const productMatch = contacts.some(c => c.product_name?.toLowerCase().includes(lowerValue));
    const emailMatch = contacts.some(c => c.email?.toLowerCase().includes(lowerValue));
    const hsnMatch = contacts.some(c => c.hsn_code?.toLowerCase().includes(lowerValue));
    
    if (companyMatch) {
      actionId = 43;
      searchType = 'Company';
    } else if (productMatch) {
      actionId = 44;
      searchType = 'Product';
    } else if (emailMatch) {
      actionId = 50;
      searchType = 'Email';
    } else if (hsnMatch) {
      actionId = 42;
      searchType = 'HSN';
    }
    
    createActivityLog(actionId, 4, `Searched by ${searchType}: ${searchValue}`, {
      searchType: searchType,
      searchValue: searchValue
    });
  };

  // Handle search with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setPage(0);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (value && value.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        logSearch(value);
      }, 500);
    }
  };

  // Handle search on Enter key
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (query && query.length >= 2) {
        logSearch(query);
      }
    }
  };

  // Fetch contacts with pagination, search, and template filter
  const fetchContacts = useCallback(async (isSearch = false) => {
    try {
      if (!isSearch) {
        setLoading(true);
      }
      
      const sellerId = getSellerId();

      if (!sellerId) {
        console.error('No sellerId found — user may not be logged in');
        if (!isSearch) setLoading(false);
        return;
      }

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
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Fetch contacts when page, debounced query, or filter changes
  useEffect(() => {
    const isSearch = debouncedQuery.length > 0 || templateFilter !== 'all';
    fetchContacts(isSearch);
  }, [page, debouncedQuery, templateFilter, fetchContacts]);

  // Log filter activity when template filter changes
  useEffect(() => {
    if (templateFilter !== 'all') {
      createActivityLog(22, 4, `Filtered contacts by template: ${templateFilter}`, {
        template: templateFilter
      });
    }
  }, [templateFilter]);

  // Handle template dropdown selection with activity log
  const handleTemplateFilterChange = (value: string) => {
    setPage(0);
    setTemplateFilter(value);
    if (value !== 'all') {
      createActivityLog(51, 4, `Selected template filter: ${value}`, {
        filterType: 'template',
        selectedValue: value
      });
    } else {
      createActivityLog(51, 4, 'Cleared template filter', {
        filterType: 'template',
        selectedValue: 'all'
      });
    }
  };

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
      hsn_code: contact.hsn_code || '', 
    }));

  const getStatusBadge = (contact: Contact) => {
    if (contact.status === 'sent') {
      return (
        <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium" style={{ backgroundColor: '#1A3355', color: '#8EE147' }}>
          <CheckCircle className="h-3 w-3 mr-1" style={{ color: '#8EE147' }} />
          Sent
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium" style={{ backgroundColor: '#1A3355', color: '#FBBF24' }}>
        <Clock className="h-3 w-3 mr-1" style={{ color: '#FBBF24' }} />
        Pending
      </span>
    );
  };

  const getResponseBadge = (contact: Contact) => {
    if (contact.response === 'interested') {
      return (
        <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium" style={{ backgroundColor: '#1A3355', color: '#8EE147' }}>
          <TrendingUp className="h-3 w-3 mr-1" style={{ color: '#8EE147' }} />
          Interested
        </span>
      );
    }
    if (contact.response === 'not_interested') {
      return (
        <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium" style={{ backgroundColor: '#1A3355', color: '#F87171' }}>
          <XCircle className="h-3 w-3 mr-1" style={{ color: '#F87171' }} />
          Not Interested
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium" style={{ backgroundColor: '#1A3355', color: '#94A3B8' }}>
        <Clock className="h-3 w-3 mr-1" style={{ color: '#94A3B8' }} />
        Pending
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

  const totalPages = pagination?.totalPages || Math.ceil(totalCount / perPage) || 1;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0E223B' }}>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col items-center justify-center h-48 sm:h-64 gap-3 sm:gap-4 px-8">
          <Loader2 className="h-9 w-9 sm:h-11 sm:w-11 animate-spin" style={{ color: '#8EE147' }} />
          <p className="text-xs sm:text-sm" style={{ color: '#94A3B8' }}>Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-1.5 sm:p-6" style={{ backgroundColor: '#0E223B' }}>
      <div className="max-w-full sm:max-w-7xl mx-auto px-0.5 sm:px-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-6">
          <div className="space-y-0.5">
            <h1 className="text-lg sm:text-2xl font-semibold text-white">
              Contacts
            </h1>
            <p className="text-[10px] sm:text-sm flex items-center gap-1.5" style={{ color: '#94A3B8' }}>
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" style={{ color: '#8EE147' }} />
              <span className="hidden sm:inline">Manage and communicate with your contacts</span>
              <span className="sm:hidden">Manage your contacts</span>
            </p>
          </div>
          <Button 
            onClick={handleEmailModalOpen} 
            disabled={selected.size === 0} 
            className="gap-1 sm:gap-2 text-[#0E223B] font-medium shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4 rounded-xl"
            style={{ backgroundColor: '#8EE147' }}
          >
            <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Send Email</span>
            {selected.size > 0 && (
              <span className="bg-[#0E223B]/20 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold">
                {selected.size}
              </span>
            )}
          </Button>
        </div>

        {/* Stats Cards - Updated with dark theme */}
        {statsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-2.5 sm:p-3 md:p-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-2 sm:h-3 w-14 sm:w-20 bg-white/10 rounded"></div>
                    <div className="h-6 sm:h-7 md:h-8 w-10 sm:w-12 bg-white/10 rounded mt-1 sm:mt-2"></div>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/10 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            {/* Total Card */}
            <div className="bg-gradient-to-br from-[#0E223B] to-[#1A3355] rounded-2xl shadow-lg border border-white/10 p-2.5 sm:p-3 md:p-4 relative overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02] duration-300">
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-[#8EE147]/10 rounded-full -mr-6 -mt-6"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-[#8EE147]/5 rounded-full -ml-4 -mb-4"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-[8px] sm:text-[10px] md:text-xs font-semibold text-[#8EE147] uppercase tracking-wider">Total</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-0.5 sm:mt-1">{stats.total}</p>
                </div>
                <div className="p-1.5 sm:p-2 md:p-3 bg-[#8EE147]/20 backdrop-blur-sm rounded-xl shadow-sm border border-[#8EE147]/30">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#8EE147' }} />
                </div>
              </div>
            </div>
            
            {/* Interested Card */}
            <div className="bg-gradient-to-br from-[#0E223B] to-[#1A3355] rounded-2xl shadow-lg border border-white/10 p-2.5 sm:p-3 md:p-4 relative overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02] duration-300">
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-[#8EE147]/10 rounded-full -mr-6 -mt-6"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-[#8EE147]/5 rounded-full -ml-4 -mb-4"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-[8px] sm:text-[10px] md:text-xs font-semibold text-[#8EE147] uppercase tracking-wider">Interested</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-0.5 sm:mt-1">{stats.interested}</p>
                </div>
                <div className="p-1.5 sm:p-2 md:p-3 bg-[#8EE147]/20 backdrop-blur-sm rounded-xl shadow-sm border border-[#8EE147]/30">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#8EE147' }} />
                </div>
              </div>
            </div>
            
            {/* Not Interested Card */}
            <div className="bg-gradient-to-br from-[#0E223B] to-[#1A3355] rounded-2xl shadow-lg border border-white/10 p-2.5 sm:p-3 md:p-4 relative overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02] duration-300">
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-rose-500/10 rounded-full -mr-6 -mt-6"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-rose-500/5 rounded-full -ml-4 -mb-4"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-[8px] sm:text-[10px] md:text-xs font-semibold text-rose-400 uppercase tracking-wider">Not Interested</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-0.5 sm:mt-1">{stats.not_interested}</p>
                </div>
                <div className="p-1.5 sm:p-2 md:p-3 bg-rose-500/20 backdrop-blur-sm rounded-xl shadow-sm border border-rose-500/30">
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-rose-400" />
                </div>
              </div>
            </div>
            
            {/* Pending Card */}
            <div className="bg-gradient-to-br from-[#0E223B] to-[#1A3355] rounded-2xl shadow-lg border border-white/10 p-2.5 sm:p-3 md:p-4 relative overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02] duration-300">
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-amber-500/10 rounded-full -mr-6 -mt-6"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-amber-500/5 rounded-full -ml-4 -mb-4"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-[8px] sm:text-[10px] md:text-xs font-semibold text-amber-400 uppercase tracking-wider">Pending</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-0.5 sm:mt-1">{stats.pending}</p>
                </div>
                <div className="p-1.5 sm:p-2 md:p-3 bg-amber-500/20 backdrop-blur-sm rounded-xl shadow-sm border border-amber-500/30">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters - Updated with dark theme */}
        <div className="rounded-2xl shadow-sm p-1.5 sm:p-3 mb-2.5 sm:mb-5" style={{ backgroundColor: '#0E223B', borderColor: '#1A3355', borderWidth: '1px' }}>
          <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-3 items-stretch sm:items-center">
            <div className="relative flex-1 min-w-[120px] sm:min-w-[200px]">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: '#8EE147' }} />
              <Input 
                placeholder="Search contacts..." 
                value={query} 
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                className="pl-8 sm:pl-10 border-slate-700 focus:border-[#8EE147] focus:ring-[#8EE147]/20 rounded-lg sm:rounded-xl w-full h-8 sm:h-10 text-[11px] sm:text-sm text-white placeholder:text-slate-400"
                style={{ backgroundColor: '#1A3355', borderColor: '#2A4A6B' }}
              />
            </div>
            
            <div className="relative w-full sm:w-36 lg:w-48">
              <Select value={templateFilter} onValueChange={handleTemplateFilterChange}>
                <SelectTrigger 
                  className="w-full focus:border-[#8EE147] rounded-lg sm:rounded-xl h-8 sm:h-10 text-[11px] sm:text-sm text-white"
                  style={{ backgroundColor: '#1A3355', borderColor: '#2A4A6B' }}
                >
                  <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" style={{ color: '#8EE147' }} />
                  <SelectValue placeholder="All Templates" />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#1A3355', borderColor: '#2A4A6B' }}>
                  <SelectItem value="all" className="text-white hover:bg-[#2A4A6B]">All Templates</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t} value={t} className="text-white hover:bg-[#2A4A6B]">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats and Pagination - Updated with navy blue buttons */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-3 mb-2.5 sm:mb-4">
          <div className="flex flex-wrap items-center gap-1 sm:gap-4 text-[10px] sm:text-sm">
            <span style={{ color: '#94A3B8' }}>
              Showing <span className="font-semibold text-white">{contacts.length}</span> of{' '}
              <span className="font-semibold text-white">{totalCount}</span> contacts
            </span>
{selected.size > 0 && (
  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#8EE147] text-[#0E223B] rounded-full text-[10px] font-semibold leading-none">
    <span className="flex items-center justify-center bg-[#0E223B] rounded-[3px] h-3.5 w-3.5 shrink-0">
      <Check className="h-2.5 w-2.5 text-[#8EE147] font-bold" strokeWidth={4} />
    </span>
    <span className="leading-none">{selected.size} selected</span>
  </span>
)}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === 0} 
              onClick={() => setPage(p => p - 1)}
              className="hover:bg-[#1A3355] transition-colors h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg"
              style={{ 
                borderColor: '#2A4A6B', 
                color: '#8EE147',
                backgroundColor: '#0E223B'
              }}
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: '#8EE147' }} />
            </Button>
            <div className="px-1.5 sm:px-4 py-1 bg-[#1A3355] rounded-lg border text-[10px] sm:text-sm font-medium whitespace-nowrap" style={{ borderColor: '#2A4A6B', color: '#94A3B8' }}>
              Page <span className="text-white">{page + 1}</span> / {totalPages || 1}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page + 1 >= totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="hover:bg-[#1A3355] transition-colors h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg"
              style={{ 
                borderColor: '#2A4A6B', 
                color: '#8EE147',
                backgroundColor: '#0E223B'
              }}
            >
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: '#8EE147' }} />
            </Button>
          </div>
        </div>

        {/* Contact List - Updated with dark theme */}
        {contacts.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col items-center justify-center h-48 sm:h-64 gap-2 sm:gap-3 px-4">
            <div className="p-3 sm:p-4 bg-[#8EE147]/10 rounded-full">
              <Search className="h-8 w-8 sm:h-10 sm:w-10" style={{ color: '#8EE147' }} />
            </div>
            <p className="text-sm sm:text-base font-medium text-white">No contacts found</p>
            <p className="text-[10px] sm:text-sm text-slate-400 text-center">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[900px] flex flex-col gap-2 sm:gap-2.5">
              {/* Column labels */}
              <div className="grid grid-cols-[32px_1.4fr_0.8fr_0.7fr_0.9fr_0.7fr_0.7fr_0.8fr_1.2fr_0.9fr] items-center gap-2 sm:gap-3 px-3 sm:px-5 text-[10px] sm:text-xs font-medium" style={{ color: '#94A3B8' }}>
 <div className="h-full w-full flex items-center justify-center">
  <Checkbox
    checked={selected.size === contacts.length && contacts.length > 0}
    onCheckedChange={selectAll}
    className="data-[state=checked]:bg-[#8EE147] data-[state=checked]:border-[#8EE147]"
  />
</div>        <span>Company</span>
                <span>Product</span>
                <span>HSN</span>
                <span>Template</span>
                <span>Interactions</span>
                <span>Status</span>
                <span>Response</span>
                <span>Email</span>
                <span className="text-right pr-2">Actions</span>
              </div>

              {contacts.map((contact) => (
                <div
                  key={contact.buyer_id}
                  className={`grid grid-cols-[32px_1.4fr_0.8fr_0.7fr_0.9fr_0.7fr_0.7fr_0.8fr_1.2fr_0.9fr] items-center gap-2 sm:gap-3 rounded-2xl shadow-sm px-3 sm:px-5 py-2.5 sm:py-3.5 transition-shadow ${
                    selected.has(contact.buyer_id) ? 'border-2' : 'border'
                  }`}
                  style={{
                    borderColor: selected.has(contact.buyer_id) ? '#8EE147' : '#1A3355',
                    backgroundColor: selected.has(contact.buyer_id) ? '#1A3355' : '#0E223B'
                  }}
                >
   <div className="h-full w-full flex items-center justify-center">
  <Checkbox
    checked={selected.has(contact.buyer_id)}
    onCheckedChange={() => toggleSelect(contact.buyer_id)}
    className="data-[state=checked]:bg-[#8EE147] data-[state=checked]:border-[#8EE147]"
  />
</div>

                  {/* Company: avatar + name */}
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <CompanyAvatar name={contact.company_name} />
                    <div className="min-w-0">
                      <button
                        onClick={() => viewContactDetails(contact.buyer_id)}
                        className="font-semibold text-left hover:underline block text-white"
                        title={contact.company_name}
                      >
                        {contact.company_name || '-'}
                      </button>
                    </div>
                  </div>

                  {/* Product */}
                  <span className="text-[10px] sm:text-sm text-slate-300 truncate" title={contact.product_name}>
                    {contact.product_name || '-'}
                  </span>

                  {/* HSN */}
                  <div>
                    <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg border text-[9px] sm:text-xs font-medium whitespace-nowrap" style={{
                      backgroundColor: '#1A3355',
                      borderColor: '#2A4A6B',
                      color: '#94A3B8'
                    }}>
                      <Hash className="h-2.5 w-2.5 sm:h-3 sm:w-3" style={{ color: '#8EE147' }} />
                      {contact.hsn_code || '-'}
                    </span>
                  </div>

                  {/* Template */}
                  <span className="text-[9px] sm:text-xs text-slate-400 truncate" title={contact.template_used}>
                    {contact.template_used || 'No Template'}
                  </span>

                  {/* Interactions */}
                  <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full font-bold text-[10px] sm:text-sm border" style={{
                    backgroundColor: '#1A3355',
                    borderColor: '#2A4A6B',
                    color: '#8EE147'
                  }}>
                    {contact.interaction_count}
                  </span>

                  {/* Status */}
                  <div>
                    {getStatusBadge(contact)}
                  </div>

                  {/* Response */}
                  <div>
                    {getResponseBadge(contact)}
                  </div>

                  {/* Email with copy */}
                  <div className="min-w-0">
                    {contact.email ? (
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-slate-300 text-[10px] sm:text-sm truncate" title={contact.email}>
                          {contact.email}
                        </span>
                        <CopyButton
                          value={contact.email}
                          type="email"
                          buyerId={contact.buyer_id}
                          companyName={contact.company_name}
                        />
                      </div>
                    ) : (
                      <span className="text-[10px] sm:text-xs text-slate-500">—</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1 sm:gap-1.5">
                    <button
                      onClick={() => viewContactDetails(contact.buyer_id)}
                      title="View details"
                      className="p-1.5 sm:p-2 rounded-lg hover:bg-[#1A3355] transition-colors"
                      style={{ color: '#64748B' }}
                    >
                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                    <button
                      onClick={() => {
                        const selectedContacts = new Set([contact.buyer_id]);
                        setSelected(selectedContacts);
                        handleEmailModalOpen();
                      }}
                      title="Send email"
                      className="p-1.5 sm:p-2 rounded-lg hover:bg-[#1A3355] transition-colors"
                      style={{ color: '#8EE147' }}
                    >
                      <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Pagination - Updated with navy blue buttons */}
        {contacts.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 mt-3 sm:mt-5 text-[10px] sm:text-sm" style={{ color: '#94A3B8' }}>
            <span>
              Showing {page * perPage + 1} - {Math.min((page + 1) * perPage, totalCount)} of {totalCount}
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === 0} 
                onClick={() => setPage(p => p - 1)}
                className="hover:bg-[#1A3355] transition-colors h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg"
                style={{ 
                  borderColor: '#2A4A6B', 
                  color: '#8EE147',
                  backgroundColor: '#0E223B'
                }}
              >
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: '#8EE147' }} />
              </Button>
              <div className="px-1.5 sm:px-3 py-1 bg-[#1A3355] rounded-lg border text-[10px] sm:text-xs font-medium" style={{ borderColor: '#2A4A6B', color: '#94A3B8' }}>
                {page + 1} / {totalPages || 1}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page + 1 >= totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="hover:bg-[#1A3355] transition-colors h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg"
                style={{ 
                  borderColor: '#2A4A6B', 
                  color: '#8EE147',
                  backgroundColor: '#0E223B'
                }}
              >
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: '#8EE147' }} />
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