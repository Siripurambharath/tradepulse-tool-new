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

  // Statuses based on your backend types
  const statuses = ['Not Contacted', 'Sent', 'Replied', 'Interested', 'Not Interested'];

  useEffect(() => {
    fetch('http://localhost:5000/api/tracking/all')
      .then(res => res.json())
      .then(data => {
        console.log('API Response:', data);
        if (data.success) {
          const combined: any[] = [];

          if (data.data.notContacted && data.data.notContacted.length > 0) {
            data.data.notContacted.forEach((item: any) => {
              combined.push({
                ...item,
                displayStatus: 'Not Contacted',
                company_name: item.company_name,
                country: item.country,
                product_name: item.product,
              });
            });
          }

          // 2. Add SENT items (emails sent)
          if (data.data.sent && data.data.sent.length > 0) {
            data.data.sent.forEach((item: any) => {
              combined.push({
                ...item,
                displayStatus: 'Sent',
                company_name: item.company_name,
                country: item.country,
                product_name: item.product_name,
              });
            });
          }

          // 3. Add REPLIED items
          if (data.data.replied && data.data.replied.length > 0) {
            data.data.replied.forEach((item: any) => {
              combined.push({
                ...item,
                displayStatus: 'Replied',
                company_name: item.company_name,
                country: item.country,
                product_name: item.product_name,
              });
            });
          }

          // 4. Add INTERESTED items
          if (data.data.interested && data.data.interested.length > 0) {
            data.data.interested.forEach((item: any) => {
              combined.push({
                ...item,
                displayStatus: 'Interested',
                company_name: item.company_name,
                country: item.country,
                product_name: item.product_name,
              });
            });
          }

          // 5. Add NOT INTERESTED items
          if (data.data.not_interested && data.data.not_interested.length > 0) {
            data.data.not_interested.forEach((item: any) => {
              combined.push({
                ...item,
                displayStatus: 'Not Interested',
                company_name: item.company_name,
                country: item.country,
                product_name: item.product_name,
              });
            });
          }

          console.log('Combined Data:', combined);
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
    const counts: Record<string, number> = {
      'Not Contacted': 0,
      'Sent': 0,
      'Replied': 0,
      'Interested': 0,
      'Not Interested': 0
    };
    
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

      {/* Status Cards - Based on your backend types */}
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
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.slice(0, 100).map((item, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{item.company_name || 'N/A'}</td>
                  <td className="p-3 text-gray-600">{item.country || 'N/A'}</td>
                  <td className="p-3 text-gray-600">{item.product_name || 'N/A'}</td>
                  <td className="p-3"><StatusBadge status={item.displayStatus} /></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}