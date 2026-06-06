import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { Search, Clock, Users } from 'lucide-react';
import API_URL from '@/components/api';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const navigate = useNavigate();

  // ✅ Fetch history from backend
  useEffect(() => {
    fetch(`${API_URL}/history`)
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(err => console.error(err));
  }, []);

  // ✅ Products list
  const products = useMemo(() => {
    return [...new Set(history.map(h => h.product))].sort();
  }, [history]);

  // ✅ Filtering
  const filtered = useMemo(() => {
    return history.filter(h => {
      const matchesQuery =
        !query || h.product.toLowerCase().includes(query.toLowerCase());
      const matchesProduct =
        productFilter === 'all' || h.product === productFilter;
      return matchesQuery && matchesProduct;
    });
  }, [query, productFilter, history]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">History</h1>

      {/* 🔍 Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by product..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>

        <Select value={productFilter} onValueChange={setProductFilter}>
          <SelectTrigger className="w-44 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            {products.map(p => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 📦 List */}
      <div className="grid gap-3">
        {filtered.map(entry => {
          const date = new Date(entry.date);

          const replied = (entry.companies || []).filter(
            (c: any) => c.status === 'Replied'
          ).length;

          const opened = (entry.companies || []).filter(
            (c: any) => c.status === 'Opened' || c.status === 'Replied'
          ).length;

          return (
            <div
              key={entry.id}
              className="bg-card rounded-lg border p-4 cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => navigate(`/history/${entry.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground">
                      {entry.product}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {date.toLocaleDateString()} at{' '}
                      {date.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{(entry.companies || []).length} companies</span>
                  </div>

                  {/* <div className="flex gap-2">
                    <StatusBadge status={`${opened} Opened`} />
                    <StatusBadge status={`${replied} Replied`} />
                  </div> */}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            No history entries found
          </p>
        )}
      </div>
    </div>
  );
}