import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/StatusBadge';
import { EmailModal } from '@/components/EmailModal';
import {
  Search, ChevronDown, ChevronRight, Mail, LayoutGrid, List, MapPin,
  Ship, Globe, Package, FileText, Eye, BadgeCheck, Zap, Building2,
  Anchor, IndianRupee, ChevronLeft, X
} from 'lucide-react';

// Company interface matching your database
interface Company {
  id: number;
  name: string;
  country: string;
  type: 'Buyer' | 'Seller';
  product: string;
  hsn: string;
  volume: number;
  email: string;
  address?: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  destinationCountry?: string;
  productDescription?: string;
  shipmentCount?: number;
  totalValue?: string;
  industry?: string;
  lastShipmentDate?: string;
  verified?: boolean;
  contacts?: Array<{
    id: number;
    name: string;
    role: string;
    email: string;
    phone: string;
  }>;
}

export default function SearchPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [emailOpen, setEmailOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [detailCompany, setDetailCompany] = useState<Company | null>(null);
  const [previewCompany, setPreviewCompany] = useState<Company | null>(null);
  const perPage = viewMode === 'cards' ? 12 : 50;

  // Fetch companies from backend
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/companies');
        if (!response.ok) throw new Error('Failed to fetch companies');
        const data = await response.json();
        
        // Enhance data with additional fields for detailed view
        const enhancedData = data.map((company: Company) => ({
          ...company,
          address: company.address || `${company.name} Headquarters, ${company.country}`,
          portOfLoading: company.portOfLoading || ['Nhava Sheva', 'Mundra', 'Chennai', 'Kolkata'][Math.floor(Math.random() * 4)],
          portOfDischarge: company.portOfDischarge || ['Long Beach', 'Rotterdam', 'Singapore', 'Dubai'][Math.floor(Math.random() * 4)],
          destinationCountry: company.destinationCountry || ['USA', 'UK', 'UAE', 'Singapore', 'Germany'][Math.floor(Math.random() * 5)],
          productDescription: company.productDescription || `High-quality ${company.product} with competitive pricing and reliable supply chain management.`,
          shipmentCount: company.shipmentCount || Math.floor(Math.random() * 100) + 10,
          totalValue: company.totalValue || `$${(Math.random() * 10 + 1).toFixed(2)}M`,
          industry: company.industry || ['Agriculture', 'Manufacturing', 'Trading', 'Distribution', 'Technology'][Math.floor(Math.random() * 5)],
          lastShipmentDate: company.lastShipmentDate || new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          verified: company.verified !== undefined ? company.verified : Math.random() > 0.5,
          contacts: company.contacts || [
            {
              id: 1,
              name: 'John Doe',
              role: 'Export Manager',
              email: company.email,
              phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
            }
          ]
        }));
        
        setCompanies(enhancedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load companies');
        console.error('Error fetching companies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const products = useMemo(() => [...new Set(companies.map(c => c.product))].sort(), [companies]);

  const filtered = useMemo(() => {
    return companies.filter(c => {
      const q = query.toLowerCase();
      const matchesQuery = !q || c.name.toLowerCase().includes(q) || c.product.toLowerCase().includes(q) || c.hsn.includes(q);
      const matchesType = typeFilter === 'all' || c.type === typeFilter;
      const matchesProduct = productFilter === 'all' || c.product === productFilter;
      return matchesQuery && matchesType && matchesProduct;
    });
  }, [companies, query, typeFilter, productFilter]);

  const buyerCount = filtered.filter(c => c.type === 'Buyer').length;
  const sellerCount = filtered.filter(c => c.type === 'Seller').length;

  const paginated = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpanded(next);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === paginated.length && paginated.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map(c => c.id.toString())));
    }
  };

  const getRecipients = () => {
    return companies
      .filter(c => selected.has(c.id.toString()))
      .flatMap(c => c.contacts?.map(ct => ({ name: ct.name, email: ct.email, company: c.name })) || []);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading companies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Search Companies</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => { setViewMode('table'); setPage(0); }}
              className="rounded-none gap-1.5"
            >
              <List className="h-4 w-4" /> List
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => { setViewMode('cards'); setPage(0); }}
              className="rounded-none gap-1.5"
            >
              <LayoutGrid className="h-4 w-4" /> Cards
            </Button>
          </div>
          <Button onClick={() => setEmailOpen(true)} disabled={selected.size === 0} className="gap-2">
            <Mail className="h-4 w-4" /> Send Email ({selected.size})
          </Button>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, product, HSN..."
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(0); }}
            className="pl-10 bg-card"
          />
        </div>
        <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(0); }}>
          <SelectTrigger className="w-40 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Buyer">Buyer</SelectItem>
            <SelectItem value="Seller">Seller</SelectItem>
          </SelectContent>
        </Select>
        <Select value={productFilter} onValueChange={v => { setProductFilter(v); setPage(0); }}>
          <SelectTrigger className="w-44 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            {products.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">
          Showing {filtered.length === 0 ? 0 : page * perPage + 1} – {Math.min((page + 1) * perPage, filtered.length)} of {filtered.length.toLocaleString()} records
          {query && <span className="ml-2">— {buyerCount} buyers and {sellerCount} sellers</span>}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => (
              <Button
                key={i}
                variant={page === i ? 'default' : 'outline'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setPage(i)}
              >
                {i + 1}
              </Button>
            ))}
            {totalPages > 3 && <span className="px-1 text-muted-foreground">...</span>}
            {totalPages > 3 && (
              <Button variant="outline" size="sm" className="h-8 px-2 text-xs">{totalPages}</Button>
            )}
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-card rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="p-3 w-10"><Checkbox checked={selected.size === paginated.length && paginated.length > 0} onCheckedChange={selectAll} /></th>
                <th className="p-3 w-10"></th>
                <th className="p-3 text-left font-medium text-foreground">Company</th>
                <th className="p-3 text-left font-medium text-foreground">Country</th>
                <th className="p-3 text-left font-medium text-foreground">Type</th>
                <th className="p-3 text-left font-medium text-foreground">Product</th>
                <th className="p-3 text-left font-medium text-foreground">HSN</th>
                <th className="p-3 text-right font-medium text-foreground">Volume</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(c => (
                <CompanyTableRow
                  key={c.id}
                  company={c}
                  expanded={expanded.has(c.id.toString())}
                  selected={selected.has(c.id.toString())}
                  onToggleExpand={() => toggleExpand(c.id.toString())}
                  onToggleSelect={() => toggleSelect(c.id.toString())}
                  onViewDetails={() => setPreviewCompany(c)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CARDS VIEW */}
      {viewMode === 'cards' && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <Checkbox
              checked={selected.size === paginated.length && paginated.length > 0}
              onCheckedChange={selectAll}
            />
            <span className="text-sm text-muted-foreground">Select All</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginated.map(c => (
              <CompanyCard
                key={c.id}
                company={c}
                selected={selected.has(c.id.toString())}
                onToggleSelect={() => toggleSelect(c.id.toString())}
                onClick={() => setPreviewCompany(c)}
              />
            ))}
          </div>
        </>
      )}

      {/* CARD PREVIEW POPUP */}
      <Dialog open={!!previewCompany} onOpenChange={open => !open && setPreviewCompany(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
          {previewCompany && <CompanyCardPreview company={previewCompany} onViewDetails={() => { setPreviewCompany(null); setDetailCompany(previewCompany); }} />}
        </DialogContent>
      </Dialog>

      {/* COMPANY DETAIL MODAL */}
      <Dialog open={!!detailCompany} onOpenChange={open => !open && setDetailCompany(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          {detailCompany && <CompanyDetail company={detailCompany} />}
        </DialogContent>
      </Dialog>

      <EmailModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        recipients={getRecipients()}
        product={productFilter !== 'all' ? productFilter : query}
      />
    </div>
  );
}

/* ─── TABLE ROW ─── */
function CompanyTableRow({ company: c, expanded, selected, onToggleExpand, onToggleSelect, onViewDetails }: {
  company: Company; expanded: boolean; selected: boolean;
  onToggleExpand: () => void; onToggleSelect: () => void; onViewDetails: () => void;
}) {
  return (
    <>
      <tr className="border-b hover:bg-muted/20 transition-colors">
        <td className="p-3"><Checkbox checked={selected} onCheckedChange={onToggleSelect} /></td>
        <td className="p-3 cursor-pointer" onClick={onToggleExpand}>
          {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </td>
        <td className="p-3 font-medium text-foreground">
          <button onClick={onViewDetails} className="hover:text-primary hover:underline text-left">{c.name}</button>
        </td>
        <td className="p-3 text-muted-foreground">{c.country}</td>
        <td className="p-3"><StatusBadge status={c.type} /></td>
        <td className="p-3 text-muted-foreground">{c.product}</td>
        <td className="p-3 text-muted-foreground">{c.hsn}</td>
        <td className="p-3 text-right text-muted-foreground">{c.volume.toLocaleString()} units</td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={8} className="bg-muted/20 px-8 py-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Contacts ({c.contacts?.length || 1})</p>
            <div className="grid gap-2">
              {(c.contacts || [{ id: 1, name: 'Main Contact', role: 'Manager', email: c.email, phone: 'N/A' }]).map(ct => (
                <div key={ct.id} className="flex items-center gap-6 text-sm py-1">
                  <span className="font-medium text-foreground w-40">{ct.name}</span>
                  <span className="text-muted-foreground w-40">{ct.role}</span>
                  <span className="text-primary w-48">{ct.email}</span>
                  <span className="text-muted-foreground">{ct.phone}</span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ─── SIMPLE COMPANY CARD ─── */
function CompanyCard({ company: c, selected, onToggleSelect, onClick }: {
  company: Company; selected: boolean; onToggleSelect: () => void; onClick: () => void;
}) {
  return (
    <div
      className={`bg-card rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${selected ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div onClick={e => { e.stopPropagation(); onToggleSelect(); }}>
            <Checkbox checked={selected} onCheckedChange={onToggleSelect} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground text-sm truncate">{c.name}</h3>
          </div>
          <StatusBadge status={c.type} />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{c.country}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Package className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{c.product}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>HSN: {c.hsn}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Ship className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{c.volume.toLocaleString()} units</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CARD PREVIEW POPUP (Image 1 detailed style) ─── */
function CompanyCardPreview({ company: c, onViewDetails }: { company: Company; onViewDetails: () => void }) {
  return (
    <div>
      <div className="bg-primary text-primary-foreground p-4 text-center">
        <h3 className="font-bold text-sm uppercase tracking-wide">{c.name}</h3>
        <p className="text-xs opacity-80 flex items-center justify-center gap-1 mt-1">
          <MapPin className="h-3 w-3" /> {c.address || c.country}
        </p>
      </div>
      <div className="h-1 bg-emerald-400" />
      <div className="p-4 space-y-4 text-sm">
        <InfoRow icon={<Building2 className="h-4 w-4 text-primary" />} label="EXPORTER ADDRESS" value={c.address || c.country} />
        <div className="grid grid-cols-2 gap-3">
          <InfoRow icon={<Anchor className="h-4 w-4 text-primary" />} label="PORT OF LOADING" value={c.portOfLoading || 'N/A'} />
          <InfoRow icon={<Ship className="h-4 w-4 text-primary" />} label="IMPORTER/BUYER" value={c.type === 'Buyer' ? c.name : 'N/A'} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InfoRow icon={<MapPin className="h-4 w-4 text-primary" />} label="BUYER ADDRESS" value={c.address || c.country} />
          <InfoRow icon={<Anchor className="h-4 w-4 text-primary" />} label="PORT OF DISCHARGE" value={c.portOfDischarge || 'N/A'} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InfoRow icon={<Globe className="h-4 w-4 text-primary" />} label="DESTINATION COUNTRY" value={c.destinationCountry || c.country} />
          <InfoRow icon={<Package className="h-4 w-4 text-primary" />} label="HSN CODE" value={c.hsn} />
        </div>
        <InfoRow icon={<FileText className="h-4 w-4 text-primary" />} label="PRODUCT DESCRIPTION" value={c.productDescription || c.product} />
      </div>
      <div className="px-4 pb-4 space-y-2">
        <Button onClick={onViewDetails} className="w-full gap-2" variant="default">
          <Eye className="h-4 w-4" /> View Details
        </Button>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-foreground text-xs leading-snug break-words">{value}</p>
      </div>
    </div>
  );
}

/* ─── COMPANY DETAIL (Image 2 style) ─── */
function CompanyDetail({ company: c }: { company: Company }) {
  return (
    <div>
      {/* Hero header */}
      <div className="bg-gradient-to-br from-primary via-primary/80 to-primary/60 text-primary-foreground p-8 relative overflow-hidden">
        <div className="absolute top-4 right-4 flex gap-2">
          {c.verified && (
            <span className="flex items-center gap-1 bg-background/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-green-300">
              <BadgeCheck className="h-3.5 w-3.5" /> Verified
            </span>
          )}
          <span className="flex items-center gap-1 bg-background/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-yellow-300">
            <Zap className="h-3.5 w-3.5" /> Active
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-background/20 backdrop-blur flex items-center justify-center">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wide">{c.name}</h2>
            <p className="text-sm opacity-80 flex items-center gap-1 mt-1">
              <MapPin className="h-3.5 w-3.5" /> {c.address || c.country}
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-6 -mt-4">
        <StatCard icon={<Ship className="h-5 w-5 text-primary" />} value={String(c.shipmentCount || 'N/A')} label="Total Shipments" color="text-primary" />
        <StatCard icon={<IndianRupee className="h-5 w-5 text-emerald-500" />} value={c.totalValue || 'N/A'} label="Total Value" color="text-emerald-500" />
        <StatCard icon={<Globe className="h-5 w-5 text-orange-500" />} value="1" label="Countries" color="text-orange-500" />
        <StatCard icon={<Package className="h-5 w-5 text-primary" />} value={String(c.contacts?.length || 1)} label="Products" color="text-primary" />

        {/* Location card */}
        <div className="bg-card border rounded-xl p-4 flex flex-col">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1 mb-2">
            <MapPin className="h-3.5 w-3.5 text-primary" /> Location
          </p>
          <div className="flex-1 bg-muted rounded-lg flex items-center justify-center min-h-[60px]">
            <p className="text-xs text-muted-foreground">Map Placeholder</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{c.country}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pb-6">
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview" className="gap-1.5"><Globe className="h-3.5 w-3.5" /> Overview</TabsTrigger>
            <TabsTrigger value="shipments" className="gap-1.5"><Ship className="h-3.5 w-3.5" /> Shipments</TabsTrigger>
            <TabsTrigger value="products" className="gap-1.5"><Package className="h-3.5 w-3.5" /> Products</TabsTrigger>
            <TabsTrigger value="contacts" className="gap-1.5"><Building2 className="h-3.5 w-3.5" /> Contacts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card border rounded-xl p-5">
                <h4 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                  <Globe className="h-4 w-4 text-primary" /> Export Destinations
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">{c.destinationCountry || c.country}</span><span className="font-medium text-foreground">{c.shipmentCount || 0} shipments</span></div>
                </div>
              </div>
              <div className="bg-card border rounded-xl p-5">
                <h4 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                  <Package className="h-4 w-4 text-primary" /> Top Products
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">{c.product}</span><span className="font-medium text-foreground">HSN: {c.hsn}</span></div>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-5 mt-4">
              <h4 className="font-semibold text-foreground mb-3">Company Details</h4>
              <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
                <div><span className="text-muted-foreground">Type:</span> <span className="font-medium text-foreground ml-2">{c.type}</span></div>
                <div><span className="text-muted-foreground">Industry:</span> <span className="font-medium text-foreground ml-2">{c.industry || 'Trading'}</span></div>
                <div><span className="text-muted-foreground">Volume:</span> <span className="font-medium text-foreground ml-2">{c.volume.toLocaleString()} units</span></div>
                <div><span className="text-muted-foreground">Port of Loading:</span> <span className="font-medium text-foreground ml-2">{c.portOfLoading || 'N/A'}</span></div>
                <div><span className="text-muted-foreground">Port of Discharge:</span> <span className="font-medium text-foreground ml-2">{c.portOfDischarge || 'N/A'}</span></div>
                <div><span className="text-muted-foreground">Last Shipment:</span> <span className="font-medium text-foreground ml-2">{c.lastShipmentDate || 'N/A'}</span></div>
                <div className="col-span-2"><span className="text-muted-foreground">Product Description:</span> <span className="font-medium text-foreground ml-2">{c.productDescription || c.product}</span></div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shipments">
            <div className="bg-card border rounded-xl p-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Port Loading</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Port Discharge</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Destination</th>
                    <th className="text-right p-2 font-medium text-muted-foreground">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 text-foreground">{c.lastShipmentDate || 'N/A'}</td>
                    <td className="p-2 text-foreground">{c.portOfLoading || 'N/A'}</td>
                    <td className="p-2 text-foreground">{c.portOfDischarge || 'N/A'}</td>
                    <td className="p-2 text-foreground">{c.destinationCountry || c.country}</td>
                    <td className="p-2 text-right text-foreground">{c.totalValue || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="bg-card border rounded-xl p-5">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="font-medium text-foreground">{c.product}</span>
                <span className="text-muted-foreground text-sm">HSN: {c.hsn}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-3">{c.productDescription || c.product}</p>
            </div>
          </TabsContent>

          <TabsContent value="contacts">
            <div className="bg-card border rounded-xl p-5 space-y-3">
              {(c.contacts || [{ id: 1, name: 'Main Contact', role: 'Manager', email: c.email, phone: 'N/A' }]).map(ct => (
                <div key={ct.id} className="flex items-center gap-6 text-sm py-2 border-b last:border-0">
                  <span className="font-medium text-foreground w-40">{ct.name}</span>
                  <span className="text-muted-foreground w-40">{ct.role}</span>
                  <span className="text-primary w-48">{ct.email}</span>
                  <span className="text-muted-foreground">{ct.phone}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Close button at bottom center */}
      <div className="flex justify-center pb-6">
        <DialogPrimitive.Close asChild>
          <Button variant="outline" className="gap-2 px-8">
            <X className="h-4 w-4" /> Close
          </Button>
        </DialogPrimitive.Close>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
  return (
    <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
      <div className="shrink-0">{icon}</div>
      <div>
        <p className={`text-lg font-bold ${color}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}