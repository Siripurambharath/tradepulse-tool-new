import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, Loader2, ChevronLeft, ChevronRight, Mail, X, 
  ThumbsUp, ThumbsDown, Users, Building2, Globe, 
  Package, Hash, Sparkles, Filter, ArrowUpDown,
  Send, User, Briefcase, MapPin, AtSign, Phone, Lock, Unlock,
  Copy, Check
} from 'lucide-react';
import EmailModal from '@/components/EmailModal';
import { toast } from 'sonner';
import { ACTIVITY_URL, API_URL } from '@/components/api';
import { useEmailConfigCheck } from '@/hooks/Emailconfigcheck';
import EmailConfigModal from '@/components/EmailcheckModal';

const API = API_URL;

interface Buyer {
  buyer_id: number;
  buyer_date: string;
  product: string;
  hsn_code: string;
  country: string;
  company_name: string;
  website: string;
  contacts: string;
  emails: string;
  phone_revealed: boolean;
  email_revealed: boolean;
}

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

/* Buyer Detail Modal */
function BuyerDetailModal({
  buyer,
  onClose,
}: {
  buyer: Buyer | null;
  onClose: () => void;
}) {
  if (!buyer) return null;

  const fields: { label: string; value: string; icon: React.ReactNode }[] = [
    { label: 'Company Name', value: buyer.company_name, icon: <Building2 className="h-4 w-4" /> },
    { label: 'Product', value: buyer.product, icon: <Package className="h-4 w-4" /> },
    { label: 'HSN Code', value: buyer.hsn_code, icon: <Hash className="h-4 w-4" /> },
    { label: 'Country', value: buyer.country, icon: <Globe className="h-4 w-4" /> },
    { label: 'Website', value: buyer.website, icon: <Globe className="h-4 w-4" /> },
    { label: 'Contacts', value: buyer.contacts, icon: <User className="h-4 w-4" /> },
    { label: 'Emails', value: buyer.emails, icon: <AtSign className="h-4 w-4" /> },
    {
      label: 'Date',
      value: buyer.buyer_date
        ? new Date(buyer.buyer_date).toLocaleDateString('en-GB').replace(/\//g, '-')
        : '',
      icon: <Calendar className="h-4 w-4" />,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-100 text-xs font-medium uppercase tracking-wider mb-1">
                <Hash className="h-3.5 w-3.5" />
                HSN Code
              </div>
              <h2 className="text-2xl font-bold text-white">{buyer.hsn_code}</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {fields.map(({ label, value, icon }) =>
            value ? (
              <div key={label} className="flex items-start gap-3 group">
                <div className="mt-0.5 text-muted-foreground/60 group-hover:text-primary transition-colors">
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-0.5">
                    {label}
                  </span>
                  {label === 'Website' ? (
                    <a
                      href={value.startsWith('http') ? value : `https://${value}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors break-all"
                    >
                      {value}
                    </a>
                  ) : (
                    <span className="text-sm text-foreground break-all font-medium">
                      {value}
                    </span>
                  )}
                </div>
              </div>
            ) : null
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50/50 border-t flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClose}
            className="hover:bg-gray-100 transition-colors"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

const Calendar = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

// ✅ UPDATED CopyButton with Activity Logs
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
      
      // ✅ Log copy activity based on type
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
      
      toast.success(`Copied to clipboard`);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error('Failed to copy');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
      title={`Copy ${type === 'email' ? 'email' : 'phone'}`}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function SearchPage() {
  const [rows, setRows] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [countries, setCountries] = useState<any[]>([]);
  const [countryFilter, setCountryFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [emailOpen, setEmailOpen] = useState(false);
  const [detailBuyer, setDetailBuyer] = useState<Buyer | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [revealingId, setRevealingId] = useState<number | null>(null);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const revealContact = async (buyerId: number, type: 'phone' | 'email') => {
    setRevealingId(buyerId);
    try {
      const res = await fetch(`${API}/buyers/${buyerId}/reveal-contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seller_id: seller.id, reveal_type: type }),
      });
      const json = await res.json();

      if (json.success) {
        const buyer = rows.find(r => r.buyer_id === buyerId);
        
        setRows((prev) =>
          prev.map((r) =>
            r.buyer_id === buyerId
              ? {
                  ...r,
                  contacts: type === 'phone' ? json.data.contacts : r.contacts,
                  emails: type === 'email' ? json.data.emails : r.emails,
                  phone_revealed: type === 'phone' ? true : r.phone_revealed,
                  email_revealed: type === 'email' ? true : r.email_revealed,
                }
              : r
          )
        );

        if (type === 'phone') {
          await createActivityLog(40, 1, `Revealed phone for: ${buyer?.company_name}`, {
            buyer_id: buyerId,
            company_name: buyer?.company_name,
            phone: json.data.contacts
          });
        } else {
          await createActivityLog(41, 1, `Revealed email for: ${buyer?.company_name}`, {
            buyer_id: buyerId,
            company_name: buyer?.company_name,
            email: json.data.emails
          });
        }

        toast.success(`${type === 'phone' ? 'Phone' : 'Email'} revealed!`);
      } else {
        toast.error(json.message || `Failed to reveal ${type}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(`Failed to reveal ${type}`);
    } finally {
      setRevealingId(null);
    }
  };

  const perPage = 50;
  const { checkEmailConfig, modalOpen, modalMessage, setModalOpen } = useEmailConfigCheck();

  useEffect(() => {
    loadFilters();
    createActivityLog(16, 1, 'Viewed search page');
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const loadFilters = async () => {
    try {
      const [countryRes, productRes] = await Promise.all([
        fetch(`${API}/filters/buyer-countries`),
        fetch(`${API}/filters/products`),
      ]);
      setCountries(await countryRes.json());
      setProducts(await productRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, query, countryFilter, productFilter]);
  
  const seller = JSON.parse(localStorage.getItem("seller") || "{}");

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("seller_id", seller.id);
      params.set('limit', String(perPage));
      params.set('offset', String(page * perPage));
      if (query) params.set('search', query);
      if (countryFilter !== 'all') params.set('country', countryFilter);
      if (productFilter !== 'all') params.set('product', productFilter);
      const res = await fetch(`${API}/buyers?${params.toString()}`);
      const json = await res.json();
      setRows(json.data || []);
      setTotalCount(json.total || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch buyers');
    } finally {
      setLoading(false);
    }
  };

  const logSearch = (searchValue: string) => {
    if (!searchValue || searchValue.length < 2) return;
    
    let actionId = 42;
    let searchType = 'HSN';
    const lowerValue = searchValue.toLowerCase();
    
    const companyMatch = rows.some(r => r.company_name?.toLowerCase().includes(lowerValue));
    const productMatch = rows.some(r => r.product?.toLowerCase().includes(lowerValue));
    const countryMatch = rows.some(r => r.country?.toLowerCase().includes(lowerValue));
    
    if (companyMatch) {
      actionId = 43;
      searchType = 'Company';
    } else if (productMatch) {
      actionId = 44;
      searchType = 'Product';
    } else if (countryMatch) {
      actionId = 45;
      searchType = 'Country';
    }
    
    createActivityLog(actionId, 1, `Searched by ${searchType}: ${searchValue}`, {
      searchType: searchType,
      searchValue: searchValue
    });
  };

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

  const handleCountryFilter = (value: string) => {
    setPage(0);
    setCountryFilter(value);
    if (value !== 'all') {
      createActivityLog(45, 1, `Filtered by country: ${value}`, {
        filterType: 'country',
        filterValue: value
      });
    }
  };

  const handleProductFilter = (value: string) => {
    setPage(0);
    setProductFilter(value);
    if (value !== 'all') {
      createActivityLog(44, 1, `Filtered by product: ${value}`, {
        filterType: 'product',
        filterValue: value
      });
    }
  };

  const handleCountryDropdown = (value: string) => {
    createActivityLog(46, 1, `Selected country from dropdown: ${value}`, {
      dropdownType: 'countries',
      selectedValue: value
    });
  };

  const handleProductDropdown = (value: string) => {
    createActivityLog(47, 1, `Selected product from dropdown: ${value}`, {
      dropdownType: 'products',
      selectedValue: value
    });
  };

  const toggleSelect = (buyerId: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(buyerId)) next.delete(buyerId);
      else next.add(buyerId);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === rows.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map((r) => r.buyer_id)));
    }
  };

  const storeResponse = async (buyer: Buyer, responseType: 'interested' | 'not_interested') => {
    if (!buyer.email_revealed) {
      toast.error('Please reveal email first.');
      return;
    }
    if (!buyer.phone_revealed) {
      toast.error('Please reveal phone first.');
      return;
    }
    setSubmittingId(buyer.buyer_id);
     
    try {
      const firstEmail = buyer.emails?.split(',')[0]?.trim();
      if (!firstEmail) {
        toast.error('No email found');
        return;
      }

      const seller = JSON.parse(localStorage.getItem("seller") || "{}");
      const payload = {
        email: firstEmail,
        response: responseType,
        companyName: buyer.company_name,
        country: buyer.country,
        contactName: buyer.contacts || buyer.company_name,
        productName: buyer.product,
        templateUsed: 'Manual Entry',
        buyer_id: buyer.buyer_id,
        seller_id: seller.id || null,
        hsn_code: buyer.hsn_code || '' 
      };

      const response = await fetch(`${API}/api/store-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`${responseType === 'interested' ? '✓ Interested' : '✗ Not Interested'} recorded!`);
        
        const actionId = responseType === 'interested' ? 6 : 7;
        await createActivityLog(actionId, 1, 
          `${responseType === 'interested' ? 'Interested' : 'Not Interested'}: ${buyer.company_name}`,
          {
            buyer_id: buyer.buyer_id,
            company_name: buyer.company_name,
            email: buyer.emails,
            product: buyer.product,
            hsn_code: buyer.hsn_code,
            response: responseType
          }
        );
      } else {
        toast.error(data.error || 'Failed to record response');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to record response');
    } finally {
      setSubmittingId(null);
    }
  };

  const getSelectedBuyers = () => rows.filter(r => selected.has(r.buyer_id));

  const getUniqueProducts = () => {
    const selectedBuyers = getSelectedBuyers();
    return [...new Set(selectedBuyers.map(b => b.product).filter(Boolean))];
  };

  const getProductToSend = () => {
    const uniqueProducts = getUniqueProducts();
    if (uniqueProducts.length === 0 || uniqueProducts.length > 1) {
      return "General Products";
    }
    return uniqueProducts[0];
  };

  const isMultipleProductsSelected = () => {
    const selectedBuyers = getSelectedBuyers();
    const uniqueProducts = [...new Set(selectedBuyers.map(b => b.product).filter(Boolean))];
    return uniqueProducts.length > 1;
  };

  const getRecipients = () => {
    return getSelectedBuyers()
      .filter((r) => r.email_revealed)
      .flatMap((r) =>
        (r.emails || '')
          .split(',')
          .map((email) => ({
            name: r.company_name,
            company: r.company_name,
            company_name: r.company_name,
            email: email.trim(),
            country: r.country,
            product: r.product,
            hsn_code: r.hsn_code || '',
            buyer_id: r.buyer_id,
            templateUsed: 'Welcome Template',
            contacts: r.contacts,
          }))
          .filter((recipient) => recipient.email)
      );
  };

  const getLockedSelectedCount = () => {
    return getSelectedBuyers().filter((r) => !r.email_revealed).length;
  };

  const totalPages = Math.ceil(totalCount / perPage);
  const selectedCount = selected.size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 p-6">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Search Buyers
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Find and connect with potential buyers worldwide
            </p>
          </div>
          <Button 
            onClick={async () => {
              const selectedBuyers = getSelectedBuyers();
              const lockedCount = selectedBuyers.filter((r) => !r.email_revealed).length;
              const revealedCount = selectedBuyers.length - lockedCount;

              if (revealedCount === 0) {
                toast.error(
                  lockedCount === 1
                    ? 'This buyer\'s email is locked. Reveal it first to send an email.'
                    : 'All selected buyers have locked emails. Reveal at least one to send an email.'
                );
                return;
              }

              if (lockedCount > 0) {
                toast.warning(
                  `${lockedCount} selected buyer${lockedCount > 1 ? 's have' : ' has'} a locked email and will be skipped.`
                );
              }

              const ok = await checkEmailConfig();
              if (!ok) return;

              setEmailOpen(true);
              createActivityLog(6, 3, 'Opened email modal', { 
                selected_count: selected.size,
                revealed_count: revealedCount,
                locked_skipped: lockedCount,
              });
            }} 
            disabled={selectedCount === 0} 
            className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail className="h-4 w-4" />
            <span>Send Email</span>
            {selectedCount > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-semibold">
                {selectedCount}
              </span>
            )}
          </Button>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
              <Input
                placeholder="Search HSN, Company, Product, Country..."
                value={query}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl bg-white/80"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Select value={countryFilter} onValueChange={handleCountryFilter}>
                  <SelectTrigger className="w-44 border-gray-200 focus:border-blue-400 rounded-xl bg-white/80">
                    <Globe className="h-4 w-4 mr-2 text-blue-500" />
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🌍 All Countries</SelectItem>
                    {countries.map((c) => (
                      <SelectItem 
                        key={c.country} 
                        value={c.country}
                        onClick={() => handleCountryDropdown(c.country)}
                      >
                        {c.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <Select value={productFilter} onValueChange={handleProductFilter}>
                  <SelectTrigger className="w-44 border-gray-200 focus:border-blue-400 rounded-xl bg-white/80">
                    <Package className="h-4 w-4 mr-2 text-blue-500" />
                    <SelectValue placeholder="Product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">📦 All Products</SelectItem>
                    {products.map((p) => (
                      <SelectItem 
                        key={p.product} 
                        value={p.product}
                        onClick={() => handleProductDropdown(p.product)}
                      >
                        {p.product}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{rows.length}</span> of{' '}
              <span className="font-semibold text-foreground">{totalCount}</span> buyers
            </span>
            {selectedCount > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                <Checkbox checked className="h-3 w-3" />
                {selectedCount} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === 0} 
              onClick={() => setPage((p) => p - 1)}
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
              onClick={() => setPage((p) => p + 1)}
              className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-xl opacity-20 animate-pulse" />
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 relative" />
              </div>
              <p className="text-sm text-muted-foreground animate-pulse">Loading buyers...</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="p-4 bg-gray-50 rounded-full">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-muted-foreground font-medium">No Buyers Found</p>
              <p className="text-sm text-muted-foreground/70">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 border-b border-gray-200">
                    <th className="p-4 text-center w-12">
                      <Checkbox
                        checked={selected.size === rows.length && rows.length > 0}
                        onCheckedChange={selectAll}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-500" />
                        Product
                      </div>
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-blue-500" />
                        HSN Code
                      </div>
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        Country
                      </div>
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-500" />
                        Company
                      </div>
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" />
                        Contacts
                      </div>
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <AtSign className="h-4 w-4 text-blue-500" />
                        Emails
                      </div>
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr 
                      key={r.buyer_id} 
                      className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 ${
                        selected.has(r.buyer_id) ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        <Checkbox
                          checked={selected.has(r.buyer_id)}
                          onCheckedChange={() => toggleSelect(r.buyer_id)}
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                      </td>
                      <td className="p-4 max-w-[120px] truncate">
                        <span className="font-medium text-gray-800" title={r.product}>
                          {r.product}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-xs"
                          onClick={() => {
                            setDetailBuyer(r);
                            createActivityLog(7, 3, `Viewed buyer details: ${r.company_name}`, {
                              buyer_id: r.buyer_id,
                              company_name: r.company_name,
                              hsn_code: r.hsn_code
                            });
                          }}
                        >
                          <Hash className="h-3 w-3" />
                          {r.hsn_code}
                        </button>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg text-xs">
                          {r.country}
                        </span>
                      </td>
                      <td className="p-4 max-w-[150px] truncate font-medium text-gray-800" title={r.company_name}>
                        {r.company_name}
                      </td>
                      
                      {/* Contacts cell with CopyButton - logs action_id: 49 */}
                      <td className="p-4 max-w-[140px]">
                        {r.phone_revealed ? (
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="text-gray-600 text-xs truncate min-w-0" title={r.contacts}>
                              {r.contacts}
                            </span>
                            <CopyButton 
                              value={r.contacts} 
                              type="phone"
                              buyerId={r.buyer_id}
                              companyName={r.company_name}
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => revealContact(r.buyer_id, "phone")}
                            disabled={revealingId === r.buyer_id}
                            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors whitespace-nowrap"
                          >
                            {revealingId === r.buyer_id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <Lock className="h-3.5 w-3.5" />
                                <span>Locked</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>

                      {/* Emails cell with CopyButton - logs action_id: 48 */}
                      <td className="p-4 max-w-[170px]">
                        {r.email_revealed ? (
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="text-blue-600 text-xs truncate min-w-0" title={r.emails}>
                              {r.emails}
                            </span>
                            <CopyButton 
                              value={r.emails} 
                              type="email"
                              buyerId={r.buyer_id}
                              companyName={r.company_name}
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => revealContact(r.buyer_id, "email")}
                            disabled={revealingId === r.buyer_id}
                            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors whitespace-nowrap"
                          >
                            {revealingId === r.buyer_id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <Lock className="h-3.5 w-3.5" />
                                <span>Locked</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2.5 gap-1.5 text-xs bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 rounded-lg border border-green-200"
                            onClick={() => storeResponse(r, 'interested')}
                            disabled={submittingId === r.buyer_id}
                          >
                            {submittingId === r.buyer_id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <ThumbsUp className="h-3 w-3" />
                            )}
                            Interested
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2.5 gap-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 rounded-lg border border-red-200"
                            onClick={() => storeResponse(r, 'not_interested')}
                            disabled={submittingId === r.buyer_id}
                          >
                            {submittingId === r.buyer_id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <ThumbsDown className="h-3 w-3" />
                            )}
                            Not Interested
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {rows.length > 0 && (
          <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
            <span>
              Showing {page * perPage + 1} - {Math.min((page + 1) * perPage, totalCount)} of {totalCount}
            </span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === 0} 
                onClick={() => setPage((p) => p - 1)}
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
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <BuyerDetailModal buyer={detailBuyer} onClose={() => setDetailBuyer(null)} />
      
      <EmailModal
        open={emailOpen}
        recipients={getRecipients()}
        product={getProductToSend()}
        multipleProducts={isMultipleProductsSelected()}
        onClose={() => setEmailOpen(false)}
      />

      <EmailConfigModal
        open={modalOpen}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}