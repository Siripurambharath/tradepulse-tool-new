import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { allCompanies } from '@/data/mockData';
import { Search } from 'lucide-react';

export default function BuyersPage() {
  const [query, setQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');

  const buyers = useMemo(() => allCompanies.filter(c => c.type === 'Buyer'), []);
  const countries = useMemo(() => [...new Set(buyers.map(c => c.country))].sort(), [buyers]);

  const filtered = useMemo(() => {
    return buyers.filter(c => {
      const q = query.toLowerCase();
      const matchesQuery = !q || c.name.toLowerCase().includes(q) || c.product.toLowerCase().includes(q);
      const matchesCountry = countryFilter === 'all' || c.country === countryFilter;
      return matchesQuery && matchesCountry;
    });
  }, [query, countryFilter, buyers]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Buyers</h1>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search buyers..." value={query} onChange={e => setQuery(e.target.value)} className="pl-10 bg-card" />
        </div>
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="w-44 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{filtered.length} buyers found</p>

      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="p-3 text-left font-medium text-foreground">Company</th>
              <th className="p-3 text-left font-medium text-foreground">Country</th>
              <th className="p-3 text-left font-medium text-foreground">Product</th>
              <th className="p-3 text-right font-medium text-foreground">Shipments</th>
              <th className="p-3 text-left font-medium text-foreground">Last Shipment</th>
              <th className="p-3 text-left font-medium text-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map(c => (
              <tr key={c.id} className="border-b hover:bg-muted/20 transition-colors">
                <td className="p-3 font-medium text-foreground">{c.name}</td>
                <td className="p-3 text-muted-foreground">{c.country}</td>
                <td className="p-3 text-muted-foreground">{c.product}</td>
                <td className="p-3 text-right text-muted-foreground">{c.shipmentCount}</td>
                <td className="p-3 text-muted-foreground">{c.lastShipmentDate}</td>
                <td className="p-3"><StatusBadge status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
