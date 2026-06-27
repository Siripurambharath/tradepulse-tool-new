import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { Search, Clock, Users } from 'lucide-react';
import API_URL from '@/components/api';

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

    const response = await fetch(`http://localhost:5001/api/activity-log`, {
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

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const navigate = useNavigate();
  
  const seller = JSON.parse(
    localStorage.getItem("seller")
  );
  
  useEffect(() => {
    const sellerId = seller.id;
    
    // Log page view (action_id: 35, module_id: 11)
    createActivityLog(37, 11, 'Viewed history page');
    
    fetch(`${API_URL}/history?seller_id=${sellerId}`)
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(err => console.error(err));
  }, []);

  // Log search activity when query changes
  useEffect(() => {
    if (query) {
      createActivityLog(35, 11, `Searched history with query: ${query}`, {
        searchQuery: query
      });
    }
  }, [query]);

  const products = useMemo(() => {
    return [...new Set(history.map(h => h.product))].sort();
  }, [history]);

  const filtered = useMemo(() => {
    return history.filter(h => {
      const matchesQuery =
        !query || h.product.toLowerCase().includes(query.toLowerCase());
      const matchesProduct =
        productFilter === 'all' || h.product === productFilter;
      return matchesQuery && matchesProduct;
    });
  }, [query, productFilter, history]);

  const handleCardClick = (entry: any) => {
    // Log card click navigation (action_id: 37, module_id: 11)
    createActivityLog(36, 11, `Navigated to history detail for: ${entry.product}`, {
      history_id: entry.id,
      product: entry.product,
      companies_count: entry.companies?.length || 0,
      date: entry.date
    });
    navigate(`/history/${entry.id}`);
  };

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
              onClick={() => handleCardClick(entry)}
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