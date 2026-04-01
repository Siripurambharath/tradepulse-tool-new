import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { EmailModal } from '@/components/EmailModal';
import { allCompanies, Company } from '@/data/mockData';
import { Search, ChevronDown, ChevronRight, Mail } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [emailOpen, setEmailOpen] = useState(false);
  const [page, setPage] = useState(0);
  const perPage = 50;

  const products = useMemo(() => [...new Set(allCompanies.map(c => c.product))].sort(), []);

  const filtered = useMemo(() => {
    return allCompanies.filter(c => {
      const q = query.toLowerCase();
      const matchesQuery = !q || c.name.toLowerCase().includes(q) || c.product.toLowerCase().includes(q) || c.hsn.includes(q);
      const matchesType = typeFilter === 'all' || c.type === typeFilter;
      const matchesProduct = productFilter === 'all' || c.product === productFilter;
      return matchesQuery && matchesType && matchesProduct;
    });
  }, [query, typeFilter, productFilter]);

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
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map(c => c.id)));
    }
  };

  const getRecipients = () => {
    return allCompanies
      .filter(c => selected.has(c.id))
      .flatMap(c => c.contacts.map(ct => ({ name: ct.name, email: ct.email, company: c.name })));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Search Companies</h1>
        <Button onClick={() => setEmailOpen(true)} disabled={selected.size === 0} className="gap-2">
          <Mail className="h-4 w-4" /> Send Email ({selected.size})
        </Button>
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

      <p className="text-sm text-muted-foreground mb-3">
        {filtered.length.toLocaleString()} companies found
        {query && <span className="ml-2">— {buyerCount} buyers and {sellerCount} sellers</span>}
      </p>

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
              <>
                <tr key={c.id} className="border-b hover:bg-muted/20 transition-colors">
                  <td className="p-3"><Checkbox checked={selected.has(c.id)} onCheckedChange={() => toggleSelect(c.id)} /></td>
                  <td className="p-3 cursor-pointer" onClick={() => toggleExpand(c.id)}>
                    {expanded.has(c.id) ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </td>
                  <td className="p-3 font-medium text-foreground">{c.name}</td>
                  <td className="p-3 text-muted-foreground">{c.country}</td>
                  <td className="p-3"><StatusBadge status={c.type} /></td>
                  <td className="p-3 text-muted-foreground">{c.product}</td>
                  <td className="p-3 text-muted-foreground">{c.hsn}</td>
                  <td className="p-3 text-right text-muted-foreground">{c.volume}</td>
                </tr>
                {expanded.has(c.id) && (
                  <tr key={`${c.id}-exp`}>
                    <td colSpan={8} className="bg-muted/20 px-8 py-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Contacts ({c.contacts.length})</p>
                      <div className="grid gap-2">
                        {c.contacts.map(ct => (
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
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <EmailModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        recipients={getRecipients()}
        product={productFilter !== 'all' ? productFilter : query}
      />
    </div>
  );
}
