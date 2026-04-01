import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { allCompanies } from '@/data/mockData';
import { Search } from 'lucide-react';

export default function TrackingPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const statuses = ['Not Contacted', 'Email Sent', 'Opened', 'Replied', 'Interested', 'Not Interested'];

  const filtered = useMemo(() => {
    return allCompanies.slice(0, 500).filter(c => {
      const q = query.toLowerCase();
      const matchesQuery = !q || c.name.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allCompanies.slice(0, 500).forEach(c => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return counts;
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Tracking</h1>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {statuses.map(s => (
          <div key={s} className="bg-card rounded-lg border p-3 text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setStatusFilter(s === statusFilter ? 'all' : s)}>
            <p className="text-2xl font-bold text-foreground">{statusCounts[s] || 0}</p>
            <p className="text-xs text-muted-foreground">{s}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={query} onChange={e => setQuery(e.target.value)} className="pl-10 bg-card" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="p-3 text-left font-medium text-foreground">Company</th>
              <th className="p-3 text-left font-medium text-foreground">Country</th>
              <th className="p-3 text-left font-medium text-foreground">Product</th>
              <th className="p-3 text-left font-medium text-foreground">Status</th>
              <th className="p-3 text-right font-medium text-foreground">Volume</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map(c => (
              <tr key={c.id} className="border-b hover:bg-muted/20 transition-colors">
                <td className="p-3 font-medium text-foreground">{c.name}</td>
                <td className="p-3 text-muted-foreground">{c.country}</td>
                <td className="p-3 text-muted-foreground">{c.product}</td>
                <td className="p-3"><StatusBadge status={c.status} /></td>
                <td className="p-3 text-right text-muted-foreground">{c.volume}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
