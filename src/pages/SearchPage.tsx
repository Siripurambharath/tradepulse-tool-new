import { useState, useEffect } from 'react';
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
import { Search, Loader2, ChevronLeft, ChevronRight, Mail, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import EmailModal from '@/components/EmailModal';
import { toast } from 'sonner';

const API = 'http://localhost:5000';

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
}

/* Buyer Detail Modal */
function BuyerDetailModal({
  buyer,
  onClose,
}: {
  buyer: Buyer | null;
  onClose: () => void;
}) {
  if (!buyer) return null;

  const fields: { label: string; value: string }[] = [
    { label: 'Company Name', value: buyer.company_name },
    { label: 'Product', value: buyer.product },
    { label: 'HSN Code', value: buyer.hsn_code },
    { label: 'Country', value: buyer.country },
    { label: 'Website', value: buyer.website },
    { label: 'Contacts', value: buyer.contacts },
    { label: 'Emails', value: buyer.emails },
    {
      label: 'Date',
      value: buyer.buyer_date
        ? new Date(buyer.buyer_date).toLocaleDateString('en-GB').replace(/\//g, '-')
        : '',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-background border rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/30">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
              HSN Code
            </p>
            <h2 className="text-lg font-bold">{buyer.hsn_code}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 gap-3">
          {fields.map(({ label, value }) =>
            value ? (
              <div key={label} className="flex gap-3">
                <span className="w-32 shrink-0 text-xs font-medium text-muted-foreground pt-0.5 uppercase tracking-wide">
                  {label}
                </span>
                {label === 'Website' ? (
                  <a
                    href={value.startsWith('http') ? value : `https://${value}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 underline break-all"
                  >
                    {value}
                  </a>
                ) : (
                  <span className="text-sm break-all">{value}</span>
                )}
              </div>
            ) : null
          )}
        </div>

        <div className="px-5 py-3 border-t bg-muted/20 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

/* Main Page */
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

  const perPage = 50;

  /* Load Filters */
  useEffect(() => {
    loadFilters();
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

  /* Fetch Data */
  useEffect(() => {
    fetchData();
  }, [page, query, countryFilter, productFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
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

  /* Select / Deselect */
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
  setSubmittingId(buyer.buyer_id);
  
  try {
    const firstEmail = buyer.emails?.split(',')[0]?.trim();
    
    if (!firstEmail) {
      toast.error('No email found for this buyer');
      return;
    }

    const payload = {
      email: firstEmail,
      response: responseType,
      companyName: buyer.company_name,
      country: buyer.country,
      contactName: buyer.contacts || buyer.company_name,
      productName: buyer.product,
      templateUsed: 'Manual Entry',
      buyer_id: buyer.buyer_id  // ✅ Add buyer_id
    };

    const response = await fetch(`${API}/api/store-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.success) {
      toast.success(`${responseType === 'interested' ? '✓ Interested' : '✗ Not Interested'} response recorded!`);
    } else {
      toast.error(data.error || 'Failed to record response');
    }
  } catch (error) {
    console.error('Error storing response:', error);
    toast.error('Failed to record response');
  } finally {
    setSubmittingId(null);
  }
};  

  const getSelectedBuyers = () => {
    return rows.filter(r => selected.has(r.buyer_id));
  };

  const getUniqueProducts = () => {
    const selectedBuyers = getSelectedBuyers();
    const uniqueProducts = [...new Set(selectedBuyers.map(b => b.product).filter(Boolean))];
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
  const selectedBuyers = getSelectedBuyers();
  const uniqueProducts = [...new Set(selectedBuyers.map(b => b.product).filter(Boolean))];
  return uniqueProducts.length > 1;
};
  const getRecipients = () => {
    return getSelectedBuyers().flatMap((r) =>
      (r.emails || '')
        .split(',')
        .map((email) => ({
          name: r.contacts || r.company_name,
          company: r.company_name,
          email: email.trim(),
          country: r.country,
          product: r.product,
            buyer_id: r.buyer_id,  
          templateUsed: 'Welcome Template',
        }))
        .filter((recipient) => recipient.email)
    );
  };

  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Search Buyers</h1>
        <Button onClick={() => setEmailOpen(true)} disabled={selected.size === 0} className="gap-2">
          <Mail className="h-4 w-4" />
          Send Email ({selected.size})
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap md:flex-nowrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search HSN Code, Company, Product, Country, ..."
            value={query}
            onChange={(e) => { setPage(0); setQuery(e.target.value); }}
            className="pl-10"
          />
        </div>

        <Select value={countryFilter} onValueChange={(v) => { setPage(0); setCountryFilter(v); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c.country} value={c.country}>{c.country}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={productFilter} onValueChange={(v) => { setPage(0); setProductFilter(v); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            {products.map((p) => (
              <SelectItem key={p.product} value={p.product}>{p.product}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pagination Info */}
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-muted-foreground">
          Showing {rows.length} of {totalCount}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="px-3 py-1 text-sm">Page {page + 1} / {totalPages || 1}</div>
          <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-muted-foreground">No Buyers found. Try adjusting your filters.</p>
          </div>
        ) : (
  <div className="overflow-x-auto">
  <table
    className="text-sm border-collapse"
    style={{ minWidth: '1050px', width: '100%', tableLayout: 'fixed' }}
  >
    <colgroup>
      <col style={{ width: '40px' }} />    {/* Checkbox */}
      <col style={{ width: '80px' }} />    {/* Product */}
      <col style={{ width: '100px' }} />   {/* HSN Code */}
      <col style={{ width: '100px' }} />   {/* Country */}
      <col style={{ width: '200px' }} />   {/* Company Name */}
      <col style={{ width: '150px' }} />   {/* Contacts */}
      <col style={{ width: '200px' }} />   {/* Emails */}
      <col style={{ width: '180px' }} />   {/* Actions */}
    </colgroup>

    <thead>
      <tr className="border-b bg-muted/30">
        <th className="p-3 text-center">
          <Checkbox
            checked={selected.size === rows.length && rows.length > 0}
            onCheckedChange={selectAll}
          />
        </th>
        <th className="p-3 text-left font-medium whitespace-nowrap">Product</th>
        <th className="p-3 text-left font-medium whitespace-nowrap">HSN Code</th>
        <th className="p-3 text-left font-medium whitespace-nowrap">Country</th>
        <th className="p-3 text-left font-medium whitespace-nowrap">Company Name</th>
        <th className="p-3 text-left font-medium whitespace-nowrap">Contacts</th>
        <th className="p-3 text-left font-medium whitespace-nowrap">Emails</th>
        <th className="p-3 text-left font-medium whitespace-nowrap">Actions</th>
      </tr>
    </thead>

    <tbody>
      {rows.map((r) => (
        <tr key={r.buyer_id} className="border-b hover:bg-muted/50">
          {/* Checkbox */}
          <td className="p-3 text-center">
            <Checkbox
              checked={selected.has(r.buyer_id)}
              onCheckedChange={() => toggleSelect(r.buyer_id)}
            />
          </td>

          {/* Product */}
          <td className="p-3 whitespace-nowrap overflow-hidden text-ellipsis" title={r.product}>
            {r.product}
          </td>

          {/* HSN Code */}
          <td className="p-3 whitespace-nowrap overflow-hidden text-ellipsis">
            <button
              className="text-blue-600 underline underline-offset-2 hover:text-blue-800 font-medium transition-colors"
              onClick={() => setDetailBuyer(r)}
              title={`View details for HSN ${r.hsn_code}`}
            >
              {r.hsn_code}
            </button>
          </td>

          {/* Country */}
          <td className="p-3 whitespace-nowrap overflow-hidden text-ellipsis" title={r.country}>
            {r.country}
          </td>

          {/* Company Name */}
          <td className="p-3 font-medium whitespace-nowrap overflow-hidden text-ellipsis" title={r.company_name}>
            {r.company_name}
          </td>

          {/* Contacts */}
          <td className="p-3 whitespace-nowrap overflow-hidden text-ellipsis" title={r.contacts}>
            {r.contacts}
          </td>

          {/* Emails */}
          <td className="p-3 whitespace-nowrap overflow-hidden text-ellipsis" title={r.emails}>
            {r.emails}
          </td>

          {/* Actions */}
          <td className="p-3 whitespace-nowrap">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1 bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
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
                variant="outline"
                className="gap-1 bg-red-50 hover:bg-red-100 border-red-300 text-red-700"
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

      {/* Modals */}
      <BuyerDetailModal buyer={detailBuyer} onClose={() => setDetailBuyer(null)} />
      
    <EmailModal
  open={emailOpen}
  recipients={getRecipients()}
  product={getProductToSend()}
  multipleProducts={isMultipleProductsSelected()}
  onClose={() => setEmailOpen(false)}
/>
    </div>
  );
}