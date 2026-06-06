import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { Search } from 'lucide-react';

export default function TrackingPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [allData, setAllData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const statuses = ['Not Contacted', 'Email Sent', 'Replied', 'Interested', 'Not Interested'];

  useEffect(() => {
    fetch('http://localhost:5000/api/tracking/all')
      .then(res => res.json())
      .then(data => {
        if (data.success) {

          // ✅ Helper: map DB response field → displayStatus
          const resolveStatus = (item: any) => {
            if (item.response === 'interested') return 'Interested';
            if (item.response === 'not_interested') return 'Not Interested';
            return 'Email Sent';
          };

          const combined = [
            // ✅ Sent emails — check response column to override status
            ...data.data.sent.map((item: any) => ({
              ...item,
              displayStatus: resolveStatus(item),
            })),

            // ✅ Replied
            ...data.data.replied.map((item: any) => ({
              ...item,
              displayStatus: item.response === 'interested'
                ? 'Interested'
                : item.response === 'not_interested'
                ? 'Not Interested'
                : 'Replied',
            })),

            // ✅ Not contacted
            ...data.data.notContacted.map((item: any) => ({
              ...item,
              displayStatus: 'Not Contacted',
              product_name: item.product,
            })),
          ];

          setAllData(combined);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return allData.filter(item => {
      const matchesQuery = !query ||
        item.company_name?.toLowerCase().includes(query.toLowerCase()) ||
        item.product_name?.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.displayStatus === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter, allData]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    statuses.forEach(s => counts[s] = 0);
    allData.forEach(item => {
      if (counts[item.displayStatus] !== undefined) {
        counts[item.displayStatus]++;
      }
    });
    return counts;
  }, [allData]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tracking</h1>

      {/* Status Cards */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
        {statuses.map(s => (
          <div
            key={s}
            className={`bg-white rounded-lg border p-3 text-center cursor-pointer transition-all
              ${statusFilter === s ? 'border-blue-500 ring-2 ring-blue-200' : 'hover:border-blue-400'}`}
            onClick={() => setStatusFilter(s === statusFilter ? 'all' : s)}
          >
            <p className="text-2xl font-bold">{statusCounts[s] || 0}</p>
            <p className="text-xs text-gray-500">{s}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search company or product..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Country</th>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Status</th>
              {/* <th className="p-3 text-left">Responded At</th>  
              <th className="p-3 text-right">Volume</th> */}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map((item, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{item.company_name || 'N/A'}</td>
                <td className="p-3 text-gray-600">{item.country || 'N/A'}</td>
                <td className="p-3 text-gray-600">{item.product_name || 'N/A'}</td>
                <td className="p-3"><StatusBadge status={item.displayStatus} /></td>
                {/* ✅ Show responded_at if available */}
                {/* <td className="p-3 text-gray-500 text-xs">
                  {item.responded_at
                    ? new Date(item.responded_at).toLocaleString()
                    : '—'}
                </td> */}
                {/* <td className="p-3 text-right text-gray-500">{item.volume || 'N/A'}</td> */}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-500">No results found</div>
        )}
      </div>
    </div>
  );
}