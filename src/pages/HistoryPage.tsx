// import { useState, useMemo, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { StatusBadge } from '@/components/StatusBadge';
// import { Search, Clock, Users } from 'lucide-react';
// import {API_URL,ACTIVITY_URL } from '@/components/api';

// // Activity Log Helper Functions
// const getDeviceInfo = () => {
//   const userAgent = navigator.userAgent;
//   if (userAgent.includes('Chrome')) return 'Chrome';
//   if (userAgent.includes('Firefox')) return 'Firefox';
//   if (userAgent.includes('Safari')) return 'Safari';
//   if (userAgent.includes('Edge')) return 'Edge';
//   return 'Unknown Browser';
// };

// const getIPAddress = async () => {
//   try {
//     const response = await fetch('https://api.ipify.org?format=json');
//     const data = await response.json();
//     return data.ip;
//   } catch (error) {
//     console.error('Error fetching IP:', error);
//     return '127.0.0.1';
//   }
// };

// const createActivityLog = async (actionId: number, moduleId: number, description: string, additionalData?: any) => {
//   try {
//     const seller = JSON.parse(localStorage.getItem("seller") || "{}");
//     const ipAddress = await getIPAddress();
//     const device = getDeviceInfo();

//     const logData = {
//       userId: seller.id || 1,
//       userName: seller.name || seller.email || 'Unknown',
//       role: seller.role || 'seller',
//       action_id: actionId,
//       module_id: moduleId,
//       description: description,
//       ipAddress,
//       device,
//       status: 'SUCCESS',
//       ...additionalData
//     };

//     const response = await fetch(`${ACTIVITY_URL}/api/activity-log`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(logData),
//     });

//     const result = await response.json();
//     if (!result.success) {
//       console.error('Failed to create activity log:', result.message);
//     }
//     return result;
//   } catch (error) {
//     console.error('Error creating activity log:', error);
//     return null;
//   }
// };

// export default function HistoryPage() {
//   const [history, setHistory] = useState<any[]>([]);
//   const [query, setQuery] = useState('');
//   const [productFilter, setProductFilter] = useState('all');
//   const navigate = useNavigate();
  
//   const seller = JSON.parse(
//     localStorage.getItem("seller")
//   );
  
//   useEffect(() => {
//     const sellerId = seller.id;
    
//     // Log page view (action_id: 35, module_id: 11)
//     createActivityLog(37, 11, 'Viewed history page');
    
//    fetch(`${API_URL}/history?seller_id=${sellerId}`)
//   .then(async (res) => {
//     const data = await res.json();

//     console.log(
//       "%cHistory API Response",
//       "color: green; font-weight: bold;"
//     );
//     console.log(JSON.stringify(data, null, 2));

//     setHistory(data);
//   })
//   .catch(err => console.error("History API Error:", err));
      
//   }, []);

//   // Log search activity when query changes
//   useEffect(() => {
//     if (query) {
//       createActivityLog(35, 11, `Searched history with query: ${query}`, {
//         searchQuery: query
//       });
//     }
//   }, [query]);

//   const products = useMemo(() => {
//     return [...new Set(history.map(h => h.product))].sort();
//   }, [history]);

//   const filtered = useMemo(() => {
//     return history.filter(h => {
//       const matchesQuery =
//         !query || h.product.toLowerCase().includes(query.toLowerCase());
//       const matchesProduct =
//         productFilter === 'all' || h.product === productFilter;
//       return matchesQuery && matchesProduct;
//     });
//   }, [query, productFilter, history]);

//   const handleCardClick = (entry: any) => {
//     // Log card click navigation (action_id: 37, module_id: 11)
//     createActivityLog(36, 11, `Navigated to history detail for: ${entry.product}`, {
//       history_id: entry.id,
//       product: entry.product,
//       companies_count: entry.companies?.length || 0,
//       date: entry.date
//     });
//     navigate(`/history/${entry.id}`);
//   };

//   return (
//     <div>
//       <h1 className="text-2xl font-bold text-foreground mb-6">History</h1>

//       {/* 🔍 Filters */}
//       <div className="flex gap-3 mb-6">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Filter by product..."
//             value={query}
//             onChange={e => setQuery(e.target.value)}
//             className="pl-10 bg-card"
//           />
//         </div>

//         <Select value={productFilter} onValueChange={setProductFilter}>
//           <SelectTrigger className="w-44 bg-card">
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Products</SelectItem>
//             {products.map(p => (
//               <SelectItem key={p} value={p}>
//                 {p}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       {/* 📦 List */}
//       <div className="grid gap-3">
//         {filtered.map(entry => {
//           const date = new Date(entry.date);

//           const replied = (entry.companies || []).filter(
//             (c: any) => c.status === 'Replied'
//           ).length;

//           const opened = (entry.companies || []).filter(
//             (c: any) => c.status === 'Opened' || c.status === 'Replied'
//           ).length;

//           return (
//             <div
//               key={entry.id}
//               className="bg-card rounded-lg border p-4 cursor-pointer hover:border-primary/30 transition-colors"
//               onClick={() => handleCardClick(entry)}
//             >
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
//                     <Clock className="h-5 w-5 text-primary" />
//                   </div>

//                   <div>
//                     <h3 className="font-semibold text-foreground">
//                       {entry.product}
//                     </h3>
//                     <p className="text-xs text-muted-foreground">
//                       {date.toLocaleDateString()} at{' '}
//                       {date.toLocaleTimeString([], {
//                         hour: '2-digit',
//                         minute: '2-digit',
//                       })}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-6 text-sm">
//                   <div className="flex items-center gap-1 text-muted-foreground">
//                     <Users className="h-4 w-4" />
//                     <span>{(entry.companies || []).length} companies</span>
//                   </div>

//                   {/* <div className="flex gap-2">
//                     <StatusBadge status={`${opened} Opened`} />
//                     <StatusBadge status={`${replied} Replied`} />
//                   </div> */}
//                 </div>
//               </div>
//             </div>
//           );
//         })}

//         {filtered.length === 0 && (
//           <p className="text-center text-muted-foreground py-12">
//             No history entries found
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }



import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { Search, Clock, Users, TrendingUp, Calendar, Filter, ChevronRight, Eye, MessageSquare, ExternalLink } from 'lucide-react';
import {API_URL,ACTIVITY_URL } from '@/components/api';

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

    const response = await fetch(`${ACTIVITY_URL}/api/activity-log`, {
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
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  const seller = JSON.parse(
    localStorage.getItem("seller") || "{}"
  );
  
  useEffect(() => {
    const sellerId = seller.id;
    
    // Log page view (action_id: 35, module_id: 11)
    createActivityLog(37, 11, 'Viewed history page');
    
    setIsLoading(true);
    fetch(`${API_URL}/history?seller_id=${sellerId}`)
      .then(async (res) => {
        const data = await res.json();
        console.log(
          "%cHistory API Response",
          "color: green; font-weight: bold;"
        );
        console.log(JSON.stringify(data, null, 2));
        setHistory(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("History API Error:", err);
        setIsLoading(false);
      });
      
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

  // Calculate statistics
  const stats = useMemo(() => {
    const totalEntries = history.length;
    const totalCompanies = history.reduce((acc, h) => acc + (h.companies?.length || 0), 0);
    const totalReplied = history.reduce((acc, h) => 
      acc + (h.companies?.filter((c: any) => c.status === 'Replied').length || 0), 0
    );
    return { totalEntries, totalCompanies, totalReplied };
  }, [history]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 border border-primary/10">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Clock className="h-8 w-8 text-primary" />
                 History
              </h1>
              <p className="text-muted-foreground mt-2">
                Track your past activities and interactions
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-full backdrop-blur-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-20 -mb-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="group relative overflow-hidden rounded-xl bg-card border p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total History</p>
              <p className="text-3xl font-bold mt-1">{stats.totalEntries}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Clock className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl bg-card border p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Companies Contacted</p>
              <p className="text-3xl font-bold mt-1">{stats.totalCompanies}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl bg-card border p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Replied</p>
              <p className="text-3xl font-bold mt-1">{stats.totalReplied}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <MessageSquare className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by product name..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-10 bg-card border-muted-foreground/20 focus:border-primary/50 transition-colors"
          />
        </div>

        <Select value={productFilter} onValueChange={setProductFilter}>
          <SelectTrigger className="w-full sm:w-56 bg-card border-muted-foreground/20 focus:border-primary/50 transition-colors">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <SelectValue />
            </div>
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
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center mb-4">
            <Search className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No history found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {query || productFilter !== 'all' 
              ? "Try adjusting your filters or search terms"
              : "Your history will appear here once you start interacting with companies"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((entry, index) => {
            const date = new Date(entry.date);
            const companies = entry.companies || [];
            const replied = companies.filter((c: any) => c.status === 'Replied').length;
            const opened = companies.filter((c: any) => c.status === 'Opened' || c.status === 'Replied').length;
            const responseRate = companies.length > 0 ? Math.round((replied / companies.length) * 100) : 0;

            return (
              <div
                key={entry.id}
                className="group relative overflow-hidden rounded-xl bg-card border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] cursor-pointer"
                onClick={() => handleCardClick(entry)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-300">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground text-lg truncate">
                            {entry.product}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">
                            <Calendar className="h-3 w-3" />
                            <span>{date.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {companies.length} companies
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {opened} opened
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {replied} replied
                          </span>
                          {companies.length > 0 && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-muted/30 rounded-full">
                              <TrendingUp className="h-3 w-3" />
                              {responseRate}% response
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-auto flex-shrink-0">
                      {/* Progress indicator */}
                      {companies.length > 0 && (
                        <div className="hidden sm:flex flex-col items-end gap-1">
                          <div className="w-24 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-1000"
                              style={{ width: `${responseRate}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Response rate
                          </span>
                        </div>
                      )}
                      
                      <div className="w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Results count */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4 mt-2">
          <span>Showing {filtered.length} of {history.length} entries</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Latest first
          </span>
        </div>
      )}
    </div>
  );
}