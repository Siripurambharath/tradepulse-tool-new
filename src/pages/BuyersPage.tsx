import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusBadge } from '@/components/StatusBadge';
import { EmailModal } from '@/components/EmailModal';
import { allCompanies } from '@/data/mockData';
import { Search, Mail, Filter } from 'lucide-react';

export default function BuyersPage() {
  const [query, setQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [emailOpen, setEmailOpen] = useState(false);

  const buyers = useMemo(() => allCompanies.filter(c => c.type === 'Buyer'), []);
  const countries = useMemo(() => [...new Set(buyers.map(c => c.country))].sort(), [buyers]);
  const products = useMemo(() => [...new Set(buyers.map(c => c.product))].sort(), [buyers]);

  const filtered = useMemo(() => {
    return buyers.filter(c => {
      const q = query.toLowerCase();
      const matchesQuery = !q || c.name.toLowerCase().includes(q) || c.product.toLowerCase().includes(q);
      const matchesCountry = countryFilter === 'all' || c.country === countryFilter;
      const matchesProduct = productFilter === 'all' || c.product === productFilter;
      return matchesQuery && matchesCountry && matchesProduct;
    });
  }, [query, countryFilter, productFilter, buyers]);

  const allSelected = filtered.length > 0 && filtered.every(c => selected.has(c.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(c => c.id)));
    }
  };

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const selectedBuyers = buyers.filter(c => selected.has(c.id));
  const emailRecipients = selectedBuyers.flatMap(c =>
    c.contacts.slice(0, 1).map(ct => ({ name: ct.name, email: ct.email, company: c.name }))
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-2xl font-bold text-foreground">International Buyers</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} buyers found</p>
        </div>
        {selected.size > 0 && (
          <Button onClick={() => setEmailOpen(true)} className="gap-2">
            <Mail className="h-4 w-4" /> Email {selected.size} Buyer(s)
          </Button>
        )}
      </div>

      <div className="flex gap-3 mb-4 mt-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search buyers..." value={query} onChange={e => setQuery(e.target.value)} className="pl-10 bg-card" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger className="w-40 bg-card"><SelectValue placeholder="All Products" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {products.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-40 bg-card"><SelectValue placeholder="All Countries" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="p-3 w-10">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </th>
              <th className="p-3 text-left font-medium text-foreground">Company</th>
              <th className="p-3 text-left font-medium text-foreground">Country</th>
              <th className="p-3 text-left font-medium text-foreground">Product</th>
              <th className="p-3 text-center font-medium text-foreground">Shipments</th>
              <th className="p-3 text-left font-medium text-foreground">Last Shipment</th>
              <th className="p-3 text-left font-medium text-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map(c => (
              <tr key={c.id} className="border-b hover:bg-muted/20 transition-colors">
                <td className="p-3">
                  <Checkbox checked={selected.has(c.id)} onCheckedChange={() => toggle(c.id)} />
                </td>
                <td className="p-3 font-medium text-foreground">{c.name}</td>
                <td className="p-3 text-muted-foreground">{c.country}</td>
                <td className="p-3 text-muted-foreground">{c.product}</td>
                <td className="p-3 text-center text-muted-foreground">{c.shipmentCount}</td>
                <td className="p-3 text-muted-foreground">{c.lastShipmentDate}</td>
                <td className="p-3"><StatusBadge status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EmailModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        recipients={emailRecipients}
        product={selectedBuyers[0]?.product || ''}
      />
    </div>
  );
}
