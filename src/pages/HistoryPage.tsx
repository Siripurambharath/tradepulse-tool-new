// import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Search, Clock, Users, TrendingUp, Calendar, Filter, ChevronRight, Eye, MessageSquare, Loader2, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { API_URL, ACTIVITY_URL } from '@/components/api';

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

// // Custom debounce hook for smooth search
// function useDebounce<T>(value: T, delay: number): T {
//   const [debouncedValue, setDebouncedValue] = useState<T>(value);

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [value, delay]);

//   return debouncedValue;
// }

// interface StatsData {
//   totalEntries: number;
//   totalCompanies: number;
//   totalReplied: number;
//   totalInterested: number;
//   totalNotInterested: number;
//   responseRate: number;
//   interestedRate: number;
// }

// interface PaginationData {
//   currentPage: number;
//   totalPages: number;
//   totalItems: number;
//   itemsPerPage: number;
// }

// export default function HistoryPage() {
//   const [history, setHistory] = useState<any[]>([]);
//   const [query, setQuery] = useState('');
//   const debouncedQuery = useDebounce(query, 300);
//   const [productFilter, setProductFilter] = useState('all');
//   const [isLoading, setIsLoading] = useState(true);
//   const [statsLoading, setStatsLoading] = useState(true);
//   const [page, setPage] = useState(0);
//   const [totalCount, setTotalCount] = useState(0);
//   const [pagination, setPagination] = useState<PaginationData | null>(null);
//   const [stats, setStats] = useState<StatsData>({
//     totalEntries: 0,
//     totalCompanies: 0,
//     totalReplied: 0,
//     totalInterested: 0,
//     totalNotInterested: 0,
//     responseRate: 0,
//     interestedRate: 0
//   });
//   const [products, setProducts] = useState<any[]>([]);
//   const navigate = useNavigate();
//   const perPage = 10;
  
//   // Ref for debounce
//   const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
//   const seller = JSON.parse(
//     localStorage.getItem("seller") || "{}"
//   );
//   const sellerId = seller.id;

//   // ✅ Function to log search with debounce
//   const logSearch = (searchValue: string) => {
//     if (!searchValue || searchValue.length < 2) return;
    
//     let actionId = 44; // Default: Product search
//     let searchType = 'Product';
    
//     createActivityLog(actionId, 11, `Searched by ${searchType}: ${searchValue}`, {
//       searchType: searchType,
//       searchValue: searchValue
//     });
//   };

//   // ✅ Handle search with debounce
//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setQuery(value);
//     setPage(0);
    
//     if (searchTimeoutRef.current) {
//       clearTimeout(searchTimeoutRef.current);
//     }
    
//     if (value && value.length >= 2) {
//       searchTimeoutRef.current = setTimeout(() => {
//         logSearch(value);
//       }, 500);
//     }
//   };

//   // ✅ Handle search on Enter key
//   const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current);
//       }
//       if (query && query.length >= 2) {
//         logSearch(query);
//       }
//     }
//   };

//   // ✅ Handle product filter change with activity log
//   const handleProductFilterChange = (value: string) => {
//     setPage(0);
//     setProductFilter(value);
    
//     // Action 47: Search TableDropdown Products
//     if (value !== 'all') {
//       createActivityLog(47, 11, `Selected product filter: ${value}`, {
//         filterType: 'product',
//         selectedValue: value
//       });
//     } else {
//       createActivityLog(47, 11, 'Cleared product filter', {
//         filterType: 'product',
//         selectedValue: 'all'
//       });
//     }
//   };

//   // Load products for dropdown
//   useEffect(() => {
//     if (sellerId) {
//       loadProducts();
//     }
//     return () => {
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current);
//       }
//     };
//   }, [sellerId]);

//   const loadProducts = async () => {
//     try {
//       const response = await fetch(`${API_URL}/history/products?seller_id=${sellerId}`);
//       const data = await response.json();
//       setProducts(data);
//     } catch (err) {
//       console.error('Error loading products:', err);
//     }
//   };

//   // Fetch stats
//   const fetchStats = async () => {
//     try {
//       setStatsLoading(true);
//       const response = await fetch(`${API_URL}/history/stats?seller_id=${sellerId}`);
//       const data = await response.json();
//       if (data.success) {
//         setStats(data.data);
//       }
//     } catch (err) {
//       console.error('Error fetching stats:', err);
//     } finally {
//       setStatsLoading(false);
//     }
//   };

//   // Fetch history with pagination
//   const fetchHistory = useCallback(async () => {
//     try {
//       const isInitialLoad = page === 0 && !debouncedQuery && productFilter === 'all';
//       if (isInitialLoad) {
//         setIsLoading(true);
//       }
      
//       const params = new URLSearchParams();
//       params.set('seller_id', sellerId);
//       params.set('page', String(page + 1));
//       params.set('limit', String(perPage));
//       if (debouncedQuery) params.set('search', debouncedQuery);
//       if (productFilter !== 'all') params.set('product', productFilter);
      
//       const response = await fetch(`${API_URL}/history?${params.toString()}`);
//       const data = await response.json();
      
//       if (data.success) {
//         setHistory(data.data || []);
//         setTotalCount(data.total || 0);
//         setPagination(data.pagination || null);
//       }
      
//       // Log activity
//       if (isInitialLoad) {
//         createActivityLog(37, 11, 'Viewed history page');
//       }
      
//       // Note: Search logging is now handled by handleSearchChange with debounce
//       // Filter logging is handled by handleProductFilterChange
      
//     } catch (err) {
//       console.error("History API Error:", err);
//       setHistory([]);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [debouncedQuery, productFilter, page, perPage, sellerId]);

//   useEffect(() => {
//     if (sellerId) {
//       fetchStats();
//       fetchHistory();
//     }
//   }, [sellerId]);

//   // Refetch when filters change
//   useEffect(() => {
//     if (sellerId) {
//       fetchHistory();
//     }
//   }, [page, debouncedQuery, productFilter, fetchHistory, sellerId]);

//   const handleCardClick = (entry: any) => {
//     createActivityLog(36, 11, `Navigated to history detail for: ${entry.product}`, {
//       history_id: entry.id,
//       product: entry.product,
//       companies_count: entry.companies?.length || 0,
//       date: entry.date
//     });
//     navigate(`/history/${entry.id}`);
//   };

//   const totalPages = pagination?.totalPages || Math.ceil(totalCount / perPage) || 1;

//   // Only show full page loading on initial load
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <div className="relative">
//           <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
//           <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">Loading history...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4 sm:space-y-6 md:space-y-8">
//       {/* Header Section */}
//       <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-6 md:p-8 border border-primary/10">
//         <div className="relative z-10">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
//             <div>
//               <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
//                 <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
//                 History
//               </h1>
//               <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
//                 Track your past activities and interactions
//               </p>
//             </div>
//             <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
//               <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-background/50 rounded-full backdrop-blur-sm">
//                 <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
//                 <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
//                   {new Date().toLocaleDateString('en-US', { 
//                     month: 'short', 
//                     day: 'numeric', 
//                     year: 'numeric' 
//                   })}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards - Show skeleton while loading */}
//       {statsLoading ? (
//         <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
//           {[1, 2, 3, 4].map((i) => (
//             <Card key={i} className="p-3 sm:p-4 md:p-6 border-0 shadow-sm animate-pulse">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <div className="h-2 w-14 sm:h-3 sm:w-20 bg-gray-200 rounded"></div>
//                   <div className="h-6 w-10 sm:h-7 sm:w-12 bg-gray-200 rounded mt-1 sm:mt-2"></div>
//                 </div>
//                 <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-200 rounded-xl"></div>
//               </div>
//             </Card>
//           ))}
//         </div>
//       ) : (
//         <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
//           <Card className="p-3 sm:p-4 md:p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-medium">Total History</p>
//                 <p className="text-lg sm:text-2xl md:text-3xl font-bold mt-0.5 sm:mt-1">{stats.totalEntries}</p>
//               </div>
//               <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
//                 <Clock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
//               </div>
//             </div>
//           </Card>

//           <Card className="p-3 sm:p-4 md:p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-medium">Companies</p>
//                 <p className="text-lg sm:text-2xl md:text-3xl font-bold mt-0.5 sm:mt-1">{stats.totalCompanies}</p>
//               </div>
//               <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
//                 <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-500" />
//               </div>
//             </div>
//           </Card>

//           <Card className="p-3 sm:p-4 md:p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-medium">Replied</p>
//                 <p className="text-lg sm:text-2xl md:text-3xl font-bold mt-0.5 sm:mt-1">{stats.totalReplied}</p>
//               </div>
//               <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
//                 <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-emerald-500" />
//               </div>
//             </div>
//           </Card>

//           <Card className="p-3 sm:p-4 md:p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-medium">Response Rate</p>
//                 <p className="text-lg sm:text-2xl md:text-3xl font-bold mt-0.5 sm:mt-1">{stats.responseRate}%</p>
//               </div>
//               <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
//                 <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-500" />
//               </div>
//             </div>
//           </Card>
//         </div>
//       )}

//       {/* Filters */}
//       <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
//         <div className="relative flex-1 min-w-[150px] sm:min-w-[200px]">
//           <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search by product..."
//             value={query}
//             onChange={handleSearchChange}
//             onKeyDown={handleSearchKeyDown}
//             className="pl-8 sm:pl-10 bg-card border-muted-foreground/20 focus:border-primary/50 transition-colors text-sm sm:text-base h-9 sm:h-10"
//           />
//         </div>

//         <Select value={productFilter} onValueChange={handleProductFilterChange}>
//           <SelectTrigger className="w-full sm:w-48 bg-card border-muted-foreground/20 focus:border-primary/50 transition-colors h-9 sm:h-10 text-sm sm:text-base">
//             <div className="flex items-center gap-1.5 sm:gap-2">
//               <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
//               <SelectValue placeholder="All Products" />
//             </div>
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">📦 All Products</SelectItem>
//             {products.map((p: any) => (
//               <SelectItem key={p.product} value={p.product}>
//                 {p.product}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Results count and pagination info */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
//         <div className="flex items-center gap-2 sm:gap-3">
//           <span className="text-xs sm:text-sm text-muted-foreground">
//             Showing <span className="font-semibold text-foreground">{history.length}</span> of{' '}
//             <span className="font-semibold text-foreground">{totalCount}</span> entries
//           </span>
//         </div>
//         <div className="flex items-center gap-1.5 sm:gap-2">
//           <Button 
//             variant="outline" 
//             size="sm" 
//             disabled={page === 0} 
//             onClick={() => setPage((p) => p - 1)}
//             className="hover:bg-primary/10 transition-colors h-8 sm:h-9 px-2.5 sm:px-3"
//           >
//             <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//           </Button>
//           <div className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 bg-card rounded-lg border text-xs sm:text-sm font-medium shadow-sm">
//             Page <span className="text-primary">{page + 1}</span> / {totalPages || 1}
//           </div>
//           <Button 
//             variant="outline" 
//             size="sm" 
//             disabled={page + 1 >= totalPages} 
//             onClick={() => setPage((p) => p + 1)}
//             className="hover:bg-primary/10 transition-colors h-8 sm:h-9 px-2.5 sm:px-3"
//           >
//             <ChevronRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//           </Button>
//         </div>
//       </div>

//       {/* List */}
//       {history.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
//           <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-muted/20 flex items-center justify-center mb-3 sm:mb-4">
//             <Search className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 text-muted-foreground/40" />
//           </div>
//           <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">No history found</h3>
//           <p className="text-xs sm:text-sm text-muted-foreground max-w-sm px-4">
//             {query || productFilter !== 'all' 
//               ? "Try adjusting your filters or search terms"
//               : "Your history will appear here once you start interacting with companies"}
//           </p>
//         </div>
//       ) : (
//         <div className="grid gap-3 sm:gap-4">
//           {history.map((entry, index) => {
//             const date = new Date(entry.date);
//             const companies = entry.companies || [];
//             const replied = companies.filter((c: any) => c.status === 'Replied').length;
//             const opened = companies.filter((c: any) => c.status === 'Opened' || c.status === 'Replied').length;
//             const responseRate = companies.length > 0 ? Math.round((replied / companies.length) * 100) : 0;

//             return (
//               <div
//                 key={entry.id}
//                 className="group relative overflow-hidden rounded-xl bg-card border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] cursor-pointer"
//                 onClick={() => handleCardClick(entry)}
//               >
//                 <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
//                 <div className="relative p-3 sm:p-4 md:p-5">
//                   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
//                     <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0 w-full sm:w-auto">
//                       <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-300">
//                         <TrendingUp className="h-5 w-5 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 text-primary" />
//                       </div>

//                       <div className="min-w-0 flex-1">
//                         <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
//                           <h3 className="font-semibold text-foreground text-sm sm:text-base md:text-lg truncate max-w-[180px] sm:max-w-[280px] md:max-w-none">
//                             {entry.product}
//                           </h3>
//                           <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground bg-muted/30 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
//                             <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
//                             <span>{date.toLocaleDateString('en-US', { 
//                               month: 'short', 
//                               day: 'numeric', 
//                               year: 'numeric' 
//                             })}</span>
//                           </div>
//                         </div>
//                         <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">
//                           <span className="flex items-center gap-0.5 sm:gap-1">
//                             <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
//                             {companies.length} companies
//                           </span>
//                           {opened > 0 && (
//                             <span className="flex items-center gap-0.5 sm:gap-1">
//                               <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
//                               {opened} opened
//                             </span>
//                           )}
//                           {replied > 0 && (
//                             <span className="flex items-center gap-0.5 sm:gap-1">
//                               <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
//                               {replied} replied
//                             </span>
//                           )}
//                           {companies.length > 0 && (
//                             <span className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 bg-muted/30 rounded-full">
//                               <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
//                               {responseRate}%
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2 sm:gap-3 ml-auto flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
//                       {companies.length > 0 && (
//                         <div className="flex sm:hidden flex-col items-end gap-0.5 flex-1 max-w-[100px]">
//                           <div className="w-full h-1 bg-muted/30 rounded-full overflow-hidden">
//                             <div 
//                               className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-1000"
//                               style={{ width: `${responseRate}%` }}
//                             />
//                           </div>
//                           <span className="text-[10px] text-muted-foreground">
//                             {responseRate}% response
//                           </span>
//                         </div>
//                       )}
                      
//                       {companies.length > 0 && (
//                         <div className="hidden sm:flex flex-col items-end gap-1 min-w-[70px] md:min-w-[80px]">
//                           <div className="w-16 sm:w-20 md:w-24 h-1 sm:h-1.5 bg-muted/30 rounded-full overflow-hidden">
//                             <div 
//                               className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-1000"
//                               style={{ width: `${responseRate}%` }}
//                             />
//                           </div>
//                           <span className="text-[10px] sm:text-xs text-muted-foreground">
//                             Response rate
//                           </span>
//                         </div>
//                       )}
                      
//                       <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted/20 flex items-center justify-center group-hover:bg-primary/10 transition-colors flex-shrink-0">
//                         <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-primary transition-colors" />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* Bottom pagination */}
//       {history.length > 0 && (
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
//           <div className="text-xs sm:text-sm text-muted-foreground">
//             Showing {page * perPage + 1} - {Math.min((page + 1) * perPage, totalCount)} of {totalCount} entries
//           </div>
//           <div className="flex items-center gap-1.5 sm:gap-2">
//             <Button 
//               variant="outline" 
//               size="sm" 
//               disabled={page === 0} 
//               onClick={() => setPage((p) => p - 1)}
//               className="hover:bg-primary/10 transition-colors h-8 sm:h-9 px-2.5 sm:px-3"
//             >
//               <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//             </Button>
//             <div className="px-2 sm:px-3 py-1 bg-card rounded-lg border text-xs sm:text-sm font-medium">
//               {page + 1} / {totalPages || 1}
//             </div>
//             <Button 
//               variant="outline" 
//               size="sm" 
//               disabled={page + 1 >= totalPages} 
//               onClick={() => setPage((p) => p + 1)}
//               className="hover:bg-primary/10 transition-colors h-8 sm:h-9 px-2.5 sm:px-3"
//             >
//               <ChevronRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }





// import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { 
//   Search, Clock, Users, TrendingUp, Calendar, Filter, ChevronRight, 
//   Eye, MessageSquare, Loader2, ChevronLeft, ChevronRight as ChevronRightIcon,
//   Sparkles, Zap, Award, BarChart3, PieChart, Activity, Globe,
//   Star, Rocket, Crown, Gem, ArrowUpRight, Download, Share2,
//   Settings, Bell, User, Layers, Grid, List, SlidersHorizontal
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { API_URL, ACTIVITY_URL } from '@/components/api';
// import { motion, AnimatePresence } from 'framer-motion';

// // ============================================
// // ENHANCED COLOR SYSTEM
// // ============================================
// const COLORS = {
//   primary: {
//     light: '#818CF8',
//     DEFAULT: '#4F46E5',
//     dark: '#3730A3',
//   },
//   success: {
//     light: '#34D399',
//     DEFAULT: '#10B981',
//     dark: '#047857',
//   },
//   warning: {
//     light: '#FBBF24',
//     DEFAULT: '#F59E0B',
//     dark: '#B45309',
//   },
//   danger: {
//     light: '#F87171',
//     DEFAULT: '#EF4444',
//     dark: '#B91C1C',
//   },
//   purple: {
//     light: '#A78BFA',
//     DEFAULT: '#8B5CF6',
//     dark: '#6D28D9',
//   },
//   pink: {
//     light: '#F472B6',
//     DEFAULT: '#EC4899',
//     dark: '#BE185D',
//   },
// };

// const GRADIENTS = {
//   indigo: 'from-indigo-600 via-indigo-500 to-purple-500',
//   purple: 'from-purple-600 via-pink-500 to-rose-500',
//   green: 'from-emerald-600 via-green-500 to-teal-500',
//   blue: 'from-blue-600 via-cyan-500 to-sky-500',
//   orange: 'from-orange-600 via-amber-500 to-yellow-500',
//   pink: 'from-pink-600 via-rose-500 to-red-500',
// };

// // ============================================
// // ANIMATED BACKGROUND PARTICLES
// // ============================================
// const AnimatedBackground = () => {
//   const [particles] = useState(() => 
//     Array.from({ length: 20 }, (_, i) => ({
//       id: i,
//       x: Math.random() * 100,
//       y: Math.random() * 100,
//       size: Math.random() * 2 + 1,
//       duration: Math.random() * 15 + 10,
//       delay: Math.random() * 8,
//       opacity: Math.random() * 0.2 + 0.05,
//     }))
//   );

//   return (
//     <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
//       {particles.map((p) => (
//         <motion.div
//           key={p.id}
//           className="absolute rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10"
//           style={{
//             left: `${p.x}%`,
//             top: `${p.y}%`,
//             width: p.size,
//             height: p.size,
//           }}
//           animate={{
//             y: [0, -20, 0],
//             x: [0, 15, 0],
//             opacity: [p.opacity, p.opacity * 1.5, p.opacity],
//           }}
//           transition={{
//             duration: p.duration,
//             delay: p.delay,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//         />
//       ))}
//       <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" />
//       <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
//     </div>
//   );
// };

// // ============================================
// // STATS CARD WITH ADVANCED DESIGN
// // ============================================
// const StatsCard = ({ stat, index }: any) => {
//   const [isHovered, setIsHovered] = useState(false);
  
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: index * 0.05, duration: 0.5 }}
//       whileHover={{ scale: 1.02 }}
//       className="relative"
//     >
//       <Card 
//         className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50"
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//       >
//         {/* Animated gradient overlay */}
//         <motion.div
//           className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0`}
//           animate={{ opacity: isHovered ? 0.08 : 0 }}
//           transition={{ duration: 0.4 }}
//         />
        
//         {/* Glow effect */}
//         <motion.div
//           className="absolute -inset-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 blur-xl"
//           animate={{ opacity: isHovered ? 0.1 : 0 }}
//           transition={{ duration: 0.4 }}
//         />

//         <div className="relative p-3 sm:p-4 md:p-5">
//           <div className="flex items-start justify-between">
//             <div>
//               <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                 {stat.label}
//               </p>
//               <motion.p 
//                 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1"
//                 animate={{ scale: isHovered ? 1.05 : 1 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 {stat.value}
//               </motion.p>
//               {stat.sub && (
//                 <p className="text-[8px] sm:text-[10px] text-gray-400 mt-0.5">
//                   {stat.sub}
//                 </p>
//               )}
//             </div>
//             <motion.div 
//               className={`p-2 sm:p-2.5 rounded-xl ${stat.iconBg} shadow-lg`}
//               animate={{ 
//                 rotate: isHovered ? [0, -5, 5, 0] : 0,
//                 scale: isHovered ? 1.1 : 1,
//               }}
//               transition={{ duration: 0.4 }}
//             >
//               <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.iconColor}`} />
//             </motion.div>
//           </div>
          
//           {/* Decorative progress bar */}
//           {stat.progress !== undefined && (
//             <div className="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
//               <motion.div
//                 className={`h-full rounded-full bg-gradient-to-r ${stat.gradient}`}
//                 initial={{ width: 0 }}
//                 animate={{ width: `${stat.progress}%` }}
//                 transition={{ duration: 1, delay: 0.2 }}
//               />
//             </div>
//           )}
//         </div>
//       </Card>
//     </motion.div>
//   );
// };

// // ============================================
// // HISTORY CARD WITH ADVANCED DESIGN
// // ============================================
// const HistoryCard = ({ entry, onClick, index }: any) => {
//   const [isHovered, setIsHovered] = useState(false);
//   const date = new Date(entry.date);
//   const companies = entry.companies || [];
//   const replied = companies.filter((c: any) => c.status === 'Replied').length;
//   const opened = companies.filter((c: any) => c.status === 'Opened' || c.status === 'Replied').length;
//   const responseRate = companies.length > 0 ? Math.round((replied / companies.length) * 100) : 0;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: index * 0.03, duration: 0.4 }}
//       whileHover={{ scale: 1.01 }}
//       className="relative"
//     >
//       <Card 
//         className="relative overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer"
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//         onClick={() => onClick(entry)}
//       >
//         {/* Animated background gradient */}
//         <motion.div
//           className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 opacity-0"
//           animate={{ opacity: isHovered ? 1 : 0 }}
//           transition={{ duration: 0.4 }}
//         />
        
//         {/* Shine effect */}
//         <motion.div
//           className="absolute -inset-full top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
//           animate={{
//             left: isHovered ? '200%' : '-100%',
//           }}
//           transition={{ duration: 0.6 }}
//         />

//         <div className="relative p-3 sm:p-4 md:p-5">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
//             {/* Left section */}
//             <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
//               <motion.div 
//                 className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0"
//                 animate={{
//                   scale: isHovered ? 1.1 : 1,
//                   rotate: isHovered ? [0, -3, 3, 0] : 0,
//                 }}
//                 transition={{ duration: 0.4 }}
//               >
//                 <TrendingUp className="h-5 w-5 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 text-indigo-600 dark:text-indigo-400" />
//               </motion.div>

//               <div className="min-w-0 flex-1">
//                 <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
//                   <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base md:text-lg truncate max-w-[180px] sm:max-w-[280px] md:max-w-none">
//                     {entry.product}
//                   </h3>
//                   <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
//                     <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
//                     <span>{date.toLocaleDateString('en-US', { 
//                       month: 'short', 
//                       day: 'numeric', 
//                       year: 'numeric' 
//                     })}</span>
//                   </div>
//                 </div>
                
//                 <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 mt-1">
//                   <span className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
//                     <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
//                     <span className="font-medium text-gray-700 dark:text-gray-300">{companies.length}</span>
//                     <span className="hidden xs:inline">companies</span>
//                   </span>
                  
//                   {opened > 0 && (
//                     <span className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
//                       <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
//                       <span className="font-medium text-blue-600 dark:text-blue-400">{opened}</span>
//                       <span className="hidden xs:inline">opened</span>
//                     </span>
//                   )}
                  
//                   {replied > 0 && (
//                     <span className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
//                       <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
//                       <span className="font-medium text-emerald-600 dark:text-emerald-400">{replied}</span>
//                       <span className="hidden xs:inline">replied</span>
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Right section */}
//             <div className="flex items-center gap-3 ml-auto flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
//               {companies.length > 0 && (
//                 <div className="flex sm:hidden flex-col items-end gap-0.5 flex-1 max-w-[100px]">
//                   <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
//                     <motion.div 
//                       className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
//                       initial={{ width: 0 }}
//                       animate={{ width: `${responseRate}%` }}
//                       transition={{ duration: 1 }}
//                     />
//                   </div>
//                   <span className="text-[10px] text-gray-400">{responseRate}% response</span>
//                 </div>
//               )}
              
//               {companies.length > 0 && (
//                 <div className="hidden sm:flex flex-col items-end gap-1 min-w-[70px] md:min-w-[80px]">
//                   <div className="w-16 sm:w-20 md:w-24 h-1 sm:h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
//                     <motion.div 
//                       className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
//                       initial={{ width: 0 }}
//                       animate={{ width: `${responseRate}%` }}
//                       transition={{ duration: 1 }}
//                     />
//                   </div>
//                   <span className="text-[10px] sm:text-xs text-gray-400">Response rate</span>
//                 </div>
//               )}
              
//               <motion.div 
//                 className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
//                 animate={{
//                   scale: isHovered ? 1.1 : 1,
//                   backgroundColor: isHovered ? 'rgba(79, 70, 229, 0.1)' : undefined,
//                 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-primary transition-colors" />
//               </motion.div>
//             </div>
//           </div>
//         </div>
//       </Card>
//     </motion.div>
//   );
// };

// // ============================================
// // CUSTOM DEBOUNCE HOOK
// // ============================================
// function useDebounce<T>(value: T, delay: number): T {
//   const [debouncedValue, setDebouncedValue] = useState<T>(value);

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [value, delay]);

//   return debouncedValue;
// }

// // ============================================
// // ACTIVITY LOG HELPERS
// // ============================================
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

// // ============================================
// // MAIN COMPONENT
// // ============================================
// export default function HistoryPage() {
//   const [history, setHistory] = useState<any[]>([]);
//   const [query, setQuery] = useState('');
//   const debouncedQuery = useDebounce(query, 300);
//   const [productFilter, setProductFilter] = useState('all');
//   const [isLoading, setIsLoading] = useState(true);
//   const [statsLoading, setStatsLoading] = useState(true);
//   const [page, setPage] = useState(0);
//   const [totalCount, setTotalCount] = useState(0);
//   const [pagination, setPagination] = useState<any>(null);
//   const [stats, setStats] = useState({
//     totalEntries: 0,
//     totalCompanies: 0,
//     totalReplied: 0,
//     totalInterested: 0,
//     totalNotInterested: 0,
//     responseRate: 0,
//     interestedRate: 0
//   });
//   const [products, setProducts] = useState<any[]>([]);
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
//   const navigate = useNavigate();
//   const perPage = 10;
//   const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
//   const seller = JSON.parse(
//     localStorage.getItem("seller") || "{}"
//   );
//   const sellerId = seller.id;

//   // Log search with debounce
//   const logSearch = (searchValue: string) => {
//     if (!searchValue || searchValue.length < 2) return;
//     createActivityLog(44, 11, `Searched by Product: ${searchValue}`, {
//       searchType: 'Product',
//       searchValue: searchValue
//     });
//   };

//   // Handle search change
//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setQuery(value);
//     setPage(0);
    
//     if (searchTimeoutRef.current) {
//       clearTimeout(searchTimeoutRef.current);
//     }
    
//     if (value && value.length >= 2) {
//       searchTimeoutRef.current = setTimeout(() => {
//         logSearch(value);
//       }, 500);
//     }
//   };

//   // Handle search on Enter
//   const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current);
//       }
//       if (query && query.length >= 2) {
//         logSearch(query);
//       }
//     }
//   };

//   // Handle product filter change
//   const handleProductFilterChange = (value: string) => {
//     setPage(0);
//     setProductFilter(value);
    
//     if (value !== 'all') {
//       createActivityLog(47, 11, `Selected product filter: ${value}`, {
//         filterType: 'product',
//         selectedValue: value
//       });
//     } else {
//       createActivityLog(47, 11, 'Cleared product filter', {
//         filterType: 'product',
//         selectedValue: 'all'
//       });
//     }
//   };

//   // Load products
//   useEffect(() => {
//     if (sellerId) {
//       loadProducts();
//     }
//     return () => {
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current);
//       }
//     };
//   }, [sellerId]);

//   const loadProducts = async () => {
//     try {
//       const response = await fetch(`${API_URL}/history/products?seller_id=${sellerId}`);
//       const data = await response.json();
//       setProducts(data);
//     } catch (err) {
//       console.error('Error loading products:', err);
//     }
//   };

//   // Fetch stats
//   const fetchStats = async () => {
//     try {
//       setStatsLoading(true);
//       const response = await fetch(`${API_URL}/history/stats?seller_id=${sellerId}`);
//       const data = await response.json();
//       if (data.success) {
//         setStats(data.data);
//       }
//     } catch (err) {
//       console.error('Error fetching stats:', err);
//     } finally {
//       setStatsLoading(false);
//     }
//   };

//   // Fetch history
//   const fetchHistory = useCallback(async () => {
//     try {
//       const isInitialLoad = page === 0 && !debouncedQuery && productFilter === 'all';
//       if (isInitialLoad) {
//         setIsLoading(true);
//       }
      
//       const params = new URLSearchParams();
//       params.set('seller_id', sellerId);
//       params.set('page', String(page + 1));
//       params.set('limit', String(perPage));
//       if (debouncedQuery) params.set('search', debouncedQuery);
//       if (productFilter !== 'all') params.set('product', productFilter);
      
//       const response = await fetch(`${API_URL}/history?${params.toString()}`);
//       const data = await response.json();
      
//       if (data.success) {
//         setHistory(data.data || []);
//         setTotalCount(data.total || 0);
//         setPagination(data.pagination || null);
//       }
      
//       if (isInitialLoad) {
//         createActivityLog(37, 11, 'Viewed history page');
//       }
      
//     } catch (err) {
//       console.error("History API Error:", err);
//       setHistory([]);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [debouncedQuery, productFilter, page, perPage, sellerId]);

//   useEffect(() => {
//     if (sellerId) {
//       fetchStats();
//       fetchHistory();
//     }
//   }, [sellerId]);

//   useEffect(() => {
//     if (sellerId) {
//       fetchHistory();
//     }
//   }, [page, debouncedQuery, productFilter, fetchHistory, sellerId]);

//   const handleCardClick = (entry: any) => {
//     createActivityLog(36, 11, `Navigated to history detail for: ${entry.product}`, {
//       history_id: entry.id,
//       product: entry.product,
//       companies_count: entry.companies?.length || 0,
//       date: entry.date
//     });
//     navigate(`/history/${entry.id}`);
//   };

//   const totalPages = pagination?.totalPages || Math.ceil(totalCount / perPage) || 1;

//   // Stats configuration
//   const statsConfig = [
//     {
//       label: 'Total Entries',
//       value: stats.totalEntries,
//       icon: Clock,
//       gradient: GRADIENTS.indigo,
//       iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
//       iconColor: 'text-indigo-600 dark:text-indigo-400',
//       progress: Math.min((stats.totalEntries / 200) * 100, 100),
//       sub: `${stats.totalCompanies} companies tracked`
//     },
//     {
//       label: 'Response Rate',
//       value: `${stats.responseRate}%`,
//       icon: TrendingUp,
//       gradient: GRADIENTS.green,
//       iconBg: 'bg-green-100 dark:bg-green-900/30',
//       iconColor: 'text-green-600 dark:text-green-400',
//       progress: stats.responseRate,
//       sub: `${stats.totalReplied} total replies`
//     },
//     {
//       label: 'Replied',
//       value: stats.totalReplied,
//       icon: MessageSquare,
//       gradient: GRADIENTS.blue,
//       iconBg: 'bg-blue-100 dark:bg-blue-900/30',
//       iconColor: 'text-blue-600 dark:text-blue-400',
//       progress: Math.min((stats.totalReplied / 100) * 100, 100),
//       sub: `${stats.totalInterested} interested`
//     },
//     {
//       label: 'Interest Rate',
//       value: `${stats.interestedRate}%`,
//       icon: Award,
//       gradient: GRADIENTS.purple,
//       iconBg: 'bg-purple-100 dark:bg-purple-900/30',
//       iconColor: 'text-purple-600 dark:text-purple-400',
//       progress: stats.interestedRate,
//       sub: `${stats.totalInterested} interested companies`
//     }
//   ];

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/10 to-purple-50/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
//         <AnimatedBackground />
//         <div className="flex flex-col justify-center items-center h-screen gap-6">
//           <div className="relative">
//             <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-indigo-500 border-t-transparent"></div>
//             <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-transparent"></div>
//             <motion.div
//               className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500"
//               animate={{ rotate: 360 }}
//               transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
//             />
//           </div>
//           <div className="text-center">
//             <motion.p 
//               className="text-lg font-semibold text-gray-700 dark:text-gray-300"
//               animate={{ opacity: [0.5, 1, 0.5] }}
//               transition={{ duration: 2, repeat: Infinity }}
//             >
//               Loading History...
//             </motion.p>
//             <p className="text-sm text-gray-400 mt-1">Fetching your data</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/10 to-purple-50/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
//       <AnimatedBackground />
      
//       <div className="relative p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
//         {/* ============================================ */}
//         {/* HEADER WITH ANIMATION */}
//         {/* ============================================ */}
//         <motion.div 
//           className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 p-6 sm:p-8 md:p-10 mb-6 sm:mb-8 border border-indigo-500/10"
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           <div className="relative z-10">
//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//               <div className="flex items-center gap-4">
//                 <motion.div 
//                   className="p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-xl shadow-indigo-500/30"
//                   whileHover={{ rotate: 10, scale: 1.05 }}
//                 >
//                   <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
//                 </motion.div>
//                 <div>
//                   <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
//                     History
//                   </h1>
//                   <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
//                     <Sparkles className="h-3.5 w-3.5" />
//                     Track your past activities and interactions
//                   </p>
//                 </div>
//               </div>
              
//               <div className="flex items-center gap-2">
//                 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 dark:bg-gray-800/50 rounded-full backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
//                   <Calendar className="h-3.5 w-3.5 text-gray-400" />
//                   <span className="text-xs text-gray-500">
//                     {new Date().toLocaleDateString('en-US', { 
//                       month: 'short', 
//                       day: 'numeric', 
//                       year: 'numeric' 
//                     })}
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100/80 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium backdrop-blur-sm border border-green-200/50 dark:border-green-800/50">
//                   <Zap className="h-3.5 w-3.5" />
//                   <span>Live</span>
//                   <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {/* Decorative elements */}
//           <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl" />
//           <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-500/5 to-indigo-500/5 rounded-full blur-3xl" />
//         </motion.div>

//         {/* ============================================ */}
//         {/* STATS CARDS */}
//         {/* ============================================ */}
//         {statsLoading ? (
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
//             {[1, 2, 3, 4].map((i) => (
//               <Card key={i} className="p-4 border-0 shadow-sm animate-pulse">
//                 <div className="h-2 w-16 bg-gray-200 rounded mb-2"></div>
//                 <div className="h-6 w-12 bg-gray-200 rounded"></div>
//               </Card>
//             ))}
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
//             {statsConfig.map((stat, index) => (
//               <StatsCard key={index} stat={stat} index={index} />
//             ))}
//           </div>
//         )}

//         {/* ============================================ */}
//         {/* FILTERS SECTION */}
//         {/* ============================================ */}
//         <motion.div 
//           className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//         >
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//             <Input
//               placeholder="Search by product..."
//               value={query}
//               onChange={handleSearchChange}
//               onKeyDown={handleSearchKeyDown}
//               className="pl-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 focus:border-indigo-500/50 transition-all rounded-xl h-11"
//             />
//           </div>

//           <Select value={productFilter} onValueChange={handleProductFilterChange}>
//             <SelectTrigger className="w-full sm:w-48 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 focus:border-indigo-500/50 transition-all rounded-xl h-11">
//               <div className="flex items-center gap-2">
//                 <Filter className="h-4 w-4 text-gray-400" />
//                 <SelectValue placeholder="All Products" />
//               </div>
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">📦 All Products</SelectItem>
//               {products.map((p: any) => (
//                 <SelectItem key={p.product} value={p.product}>
//                   {p.product}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           {/* View mode toggle */}
//           <div className="flex bg-white/50 dark:bg-gray-800/50 p-1 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50">
//             <button
//               onClick={() => setViewMode('list')}
//               className={`p-2 rounded-lg transition-all ${
//                 viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-gray-400 hover:text-gray-600'
//               }`}
//             >
//               <List className="h-4 w-4" />
//             </button>
//             <button
//               onClick={() => setViewMode('grid')}
//               className={`p-2 rounded-lg transition-all ${
//                 viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-gray-400 hover:text-gray-600'
//               }`}
//             >
//               <Grid className="h-4 w-4" />
//             </button>
//           </div>
//         </motion.div>

//         {/* ============================================ */}
//         {/* RESULTS COUNT & PAGINATION */}
//         {/* ============================================ */}
//         <motion.div 
//           className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.3 }}
//         >
//           <div className="flex items-center gap-3">
//             <span className="text-sm text-gray-500 dark:text-gray-400">
//               Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{history.length}</span> of{' '}
//               <span className="font-semibold text-gray-700 dark:text-gray-300">{totalCount}</span> entries
//             </span>
//             {query && (
//               <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
//                 Results for "{query}"
//               </span>
//             )}
//           </div>
//           <div className="flex items-center gap-2">
//             <Button 
//               variant="outline" 
//               size="sm" 
//               disabled={page === 0} 
//               onClick={() => setPage((p) => p - 1)}
//               className="hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all h-9 px-3"
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </Button>
//             <div className="px-3 py-1.5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 text-sm font-medium">
//               Page <span className="text-indigo-600 dark:text-indigo-400">{page + 1}</span> / {totalPages || 1}
//             </div>
//             <Button 
//               variant="outline" 
//               size="sm" 
//               disabled={page + 1 >= totalPages} 
//               onClick={() => setPage((p) => p + 1)}
//               className="hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all h-9 px-3"
//             >
//               <ChevronRightIcon className="h-4 w-4" />
//             </Button>
//           </div>
//         </motion.div>

//         {/* ============================================ */}
//         {/* HISTORY LIST */}
//         {/* ============================================ */}
//         <AnimatePresence mode="wait">
//           {history.length === 0 ? (
//             <motion.div 
//               className="flex flex-col items-center justify-center py-16 sm:py-20 text-center"
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.9 }}
//             >
//               <div className="relative">
//                 <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mb-4">
//                   <Search className="h-10 w-10 text-gray-300" />
//                 </div>
//                 <motion.div
//                   className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center"
//                   animate={{ scale: [1, 1.2, 1] }}
//                   transition={{ duration: 2, repeat: Infinity }}
//                 >
//                   <Sparkles className="h-3 w-3 text-indigo-400" />
//                 </motion.div>
//               </div>
//               <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
//                 No history found
//               </h3>
//               <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
//                 {query || productFilter !== 'all' 
//                   ? "Try adjusting your filters or search terms to find what you're looking for"
//                   : "Your history will appear here once you start interacting with companies"}
//               </p>
//               {(query || productFilter !== 'all') && (
//                 <button
//                   onClick={() => {
//                     setQuery('');
//                     setProductFilter('all');
//                     setPage(0);
//                   }}
//                   className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
//                 >
//                   Clear all filters
//                 </button>
//               )}
//             </motion.div>
//           ) : (
//             <motion.div 
//               className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-3 sm:gap-4`}
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ staggerChildren: 0.05 }}
//             >
//               {history.map((entry, index) => (
//                 <HistoryCard
//                   key={entry.id}
//                   entry={entry}
//                   onClick={handleCardClick}
//                   index={index}
//                 />
//               ))}
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* ============================================ */}
//         {/* BOTTOM PAGINATION */}
//         {/* ============================================ */}
//         {history.length > 0 && (
//           <motion.div 
//             className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 mt-4 border-t border-gray-200/50 dark:border-gray-700/50"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.4 }}
//           >
//             <div className="text-sm text-gray-500 dark:text-gray-400">
//               Showing {page * perPage + 1} - {Math.min((page + 1) * perPage, totalCount)} of {totalCount} entries
//             </div>
//             <div className="flex items-center gap-2">
//               <Button 
//                 variant="outline" 
//                 size="sm" 
//                 disabled={page === 0} 
//                 onClick={() => setPage((p) => p - 1)}
//                 className="hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all h-9 px-3"
//               >
//                 <ChevronLeft className="h-4 w-4" />
//               </Button>
//               <div className="px-3 py-1.5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 text-sm font-medium">
//                 {page + 1} / {totalPages || 1}
//               </div>
//               <Button 
//                 variant="outline" 
//                 size="sm" 
//                 disabled={page + 1 >= totalPages} 
//                 onClick={() => setPage((p) => p + 1)}
//                 className="hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all h-9 px-3"
//               >
//                 <ChevronRightIcon className="h-4 w-4" />
//               </Button>
//             </div>
//           </motion.div>
//         )}

//         {/* ============================================ */}
//         {/* FOOTER */}
//         {/* ============================================ */}
//         <motion.div 
//           className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8 pt-4 border-t border-gray-200/50 dark:border-gray-700/50"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.5 }}
//         >
//           <div className="flex items-center gap-2 text-xs text-gray-400">
//             <Clock className="h-3.5 w-3.5" />
//             Last updated: {new Date().toLocaleString()}
//             <span className="w-px h-4 bg-gray-300" />
//             <span>Auto-refresh every 60s</span>
//           </div>
//           <div className="flex items-center gap-3">
//             <button className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
//               <Download className="h-3.5 w-3.5" />
//               Export
//             </button>
//             <button className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
//               <Share2 className="h-3.5 w-3.5" />
//               Share
//             </button>
//             <div className="flex items-center gap-1.5 text-xs text-gray-400">
//               <span className="flex items-center gap-1.5">
//                 <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
//                 Live
//               </span>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// }




// import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { 
//   Search, Clock, Users, TrendingUp, Calendar, Filter, ChevronRight, 
//   Eye, MessageSquare, Loader2, ChevronLeft, ChevronRight as ChevronRightIcon,
//   Sparkles, Zap, Award, BarChart3, PieChart, Activity, Globe,
//   Star, Rocket, Crown, Gem, ArrowUpRight, Download, Share2,
//   Settings, Bell, User, Layers, Grid, List, SlidersHorizontal
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { API_URL, ACTIVITY_URL } from '@/components/api';
// import { motion, AnimatePresence } from 'framer-motion';

// // ============================================
// // ENHANCED COLOR SYSTEM - Updated with new colors
// // ============================================
// const COLORS = {
//   primary: {
//     light: '#8EE147',
//     DEFAULT: '#8EE147',
//     dark: '#6EC035',
//   },
//   success: {
//     light: '#8EE147',
//     DEFAULT: '#8EE147',
//     dark: '#6EC035',
//   },
//   warning: {
//     light: '#FBBF24',
//     DEFAULT: '#F59E0B',
//     dark: '#B45309',
//   },
//   danger: {
//     light: '#F87171',
//     DEFAULT: '#EF4444',
//     dark: '#B91C1C',
//   },
//   purple: {
//     light: '#A78BFA',
//     DEFAULT: '#8B5CF6',
//     dark: '#6D28D9',
//   },
//   pink: {
//     light: '#F472B6',
//     DEFAULT: '#EC4899',
//     dark: '#BE185D',
//   },
// };

// const GRADIENTS = {
//   green: 'from-[#8EE147] via-[#6EC035] to-[#5AA82E]',
//   dark: 'from-[#0E223B] via-[#1A3355] to-[#0E223B]',
//   purple: 'from-purple-600 via-pink-500 to-rose-500',
//   blue: 'from-blue-600 via-cyan-500 to-sky-500',
//   orange: 'from-orange-600 via-amber-500 to-yellow-500',
//   pink: 'from-pink-600 via-rose-500 to-red-500',
// };

// // ============================================
// // ANIMATED BACKGROUND PARTICLES - Updated with new colors
// // ============================================
// const AnimatedBackground = () => {
//   const [particles] = useState(() => 
//     Array.from({ length: 20 }, (_, i) => ({
//       id: i,
//       x: Math.random() * 100,
//       y: Math.random() * 100,
//       size: Math.random() * 2 + 1,
//       duration: Math.random() * 15 + 10,
//       delay: Math.random() * 8,
//       opacity: Math.random() * 0.2 + 0.05,
//     }))
//   );

//   return (
//     <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
//       {particles.map((p) => (
//         <motion.div
//           key={p.id}
//           className="absolute rounded-full bg-gradient-to-r from-[#8EE147]/10 to-[#6EC035]/10"
//           style={{
//             left: `${p.x}%`,
//             top: `${p.y}%`,
//             width: p.size,
//             height: p.size,
//           }}
//           animate={{
//             y: [0, -20, 0],
//             x: [0, 15, 0],
//             opacity: [p.opacity, p.opacity * 1.5, p.opacity],
//           }}
//           transition={{
//             duration: p.duration,
//             delay: p.delay,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//         />
//       ))}
//       <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#8EE147]/5 rounded-full blur-3xl animate-pulse" />
//       <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#6EC035]/5 rounded-full blur-3xl animate-pulse delay-1000" />
//     </div>
//   );
// };

// // ============================================
// // STATS CARD WITH ADVANCED DESIGN - Updated with new colors
// // ============================================
// const StatsCard = ({ stat, index }: any) => {
//   const [isHovered, setIsHovered] = useState(false);
  
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: index * 0.05, duration: 0.5 }}
//       whileHover={{ scale: 1.02 }}
//       className="relative"
//     >
//       <Card 
//         className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-[#0E223B]/95 border border-white/10"
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//       >
//         {/* Animated gradient overlay */}
//         <motion.div
//           className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0`}
//           animate={{ opacity: isHovered ? 0.08 : 0 }}
//           transition={{ duration: 0.4 }}
//         />
        
//         {/* Glow effect */}
//         <motion.div
//           className="absolute -inset-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 blur-xl"
//           animate={{ opacity: isHovered ? 0.1 : 0 }}
//           transition={{ duration: 0.4 }}
//         />

//         <div className="relative p-3 sm:p-4 md:p-5">
//           <div className="flex items-start justify-between">
//             <div>
//               <p className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">
//                 {stat.label}
//               </p>
//               <motion.p 
//                 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mt-1"
//                 animate={{ scale: isHovered ? 1.05 : 1 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 {stat.value}
//               </motion.p>
//               {stat.sub && (
//                 <p className="text-[8px] sm:text-[10px] text-slate-500 mt-0.5">
//                   {stat.sub}
//                 </p>
//               )}
//             </div>
//             <motion.div 
//               className={`p-2 sm:p-2.5 rounded-xl ${stat.iconBg} shadow-lg border border-white/10`}
//               animate={{ 
//                 rotate: isHovered ? [0, -5, 5, 0] : 0,
//                 scale: isHovered ? 1.1 : 1,
//               }}
//               transition={{ duration: 0.4 }}
//             >
//               <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.iconColor}`} />
//             </motion.div>
//           </div>
          
//           {/* Decorative progress bar */}
//           {stat.progress !== undefined && (
//             <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
//               <motion.div
//                 className={`h-full rounded-full bg-gradient-to-r ${stat.gradient}`}
//                 initial={{ width: 0 }}
//                 animate={{ width: `${stat.progress}%` }}
//                 transition={{ duration: 1, delay: 0.2 }}
//               />
//             </div>
//           )}
//         </div>
//       </Card>
//     </motion.div>
//   );
// };

// // ============================================
// // HISTORY CARD WITH ADVANCED DESIGN - Updated with new colors
// // ============================================
// const HistoryCard = ({ entry, onClick, index }: any) => {
//   const [isHovered, setIsHovered] = useState(false);
//   const date = new Date(entry.date);
//   const companies = entry.companies || [];
//   const replied = companies.filter((c: any) => c.status === 'Replied').length;
//   const opened = companies.filter((c: any) => c.status === 'Opened' || c.status === 'Replied').length;
//   const responseRate = companies.length > 0 ? Math.round((replied / companies.length) * 100) : 0;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: index * 0.03, duration: 0.4 }}
//       whileHover={{ scale: 1.01 }}
//       className="relative"
//     >
//       <Card 
//         className="relative overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer bg-[#0E223B]/95 border border-white/10"
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//         onClick={() => onClick(entry)}
//       >
//         {/* Animated background gradient */}
//         <motion.div
//           className="absolute inset-0 bg-gradient-to-r from-[#8EE147]/10 to-[#6EC035]/10 opacity-0"
//           animate={{ opacity: isHovered ? 1 : 0 }}
//           transition={{ duration: 0.4 }}
//         />
        
//         {/* Shine effect */}
//         <motion.div
//           className="absolute -inset-full top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
//           animate={{
//             left: isHovered ? '200%' : '-100%',
//           }}
//           transition={{ duration: 0.6 }}
//         />

//         <div className="relative p-3 sm:p-4 md:p-5">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
//             {/* Left section */}
//             <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
//               <motion.div 
//                 className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-[#8EE147]/20 border border-[#8EE147]/30 flex items-center justify-center flex-shrink-0"
//                 animate={{
//                   scale: isHovered ? 1.1 : 1,
//                   rotate: isHovered ? [0, -3, 3, 0] : 0,
//                 }}
//                 transition={{ duration: 0.4 }}
//               >
//                 <TrendingUp className="h-5 w-5 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 text-[#8EE147]" />
//               </motion.div>

//               <div className="min-w-0 flex-1">
//                 <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
//                   <h3 className="font-semibold text-white text-sm sm:text-base md:text-lg truncate max-w-[180px] sm:max-w-[280px] md:max-w-none">
//                     {entry.product}
//                   </h3>
//                   <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 bg-white/5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-white/10">
//                     <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
//                     <span>{date.toLocaleDateString('en-US', { 
//                       month: 'short', 
//                       day: 'numeric', 
//                       year: 'numeric' 
//                     })}</span>
//                   </div>
//                 </div>
                
//                 <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 mt-1">
//                   <span className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm text-slate-400">
//                     <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
//                     <span className="font-medium text-white">{companies.length}</span>
//                     <span className="hidden xs:inline">companies</span>
//                   </span>
                  
//                   {opened > 0 && (
//                     <span className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm text-slate-400">
//                       <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
//                       <span className="font-medium text-[#8EE147]">{opened}</span>
//                       <span className="hidden xs:inline">opened</span>
//                     </span>
//                   )}
                  
//                   {replied > 0 && (
//                     <span className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm text-slate-400">
//                       <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
//                       <span className="font-medium text-[#8EE147]">{replied}</span>
//                       <span className="hidden xs:inline">replied</span>
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Right section */}
//             <div className="flex items-center gap-3 ml-auto flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
//               {companies.length > 0 && (
//                 <div className="flex sm:hidden flex-col items-end gap-0.5 flex-1 max-w-[100px]">
//                   <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
//                     <motion.div 
//                       className="h-full bg-gradient-to-r from-[#8EE147] to-[#6EC035] rounded-full"
//                       initial={{ width: 0 }}
//                       animate={{ width: `${responseRate}%` }}
//                       transition={{ duration: 1 }}
//                     />
//                   </div>
//                   <span className="text-[10px] text-slate-500">{responseRate}% response</span>
//                 </div>
//               )}
              
//               {companies.length > 0 && (
//                 <div className="hidden sm:flex flex-col items-end gap-1 min-w-[70px] md:min-w-[80px]">
//                   <div className="w-16 sm:w-20 md:w-24 h-1 sm:h-1.5 bg-white/10 rounded-full overflow-hidden">
//                     <motion.div 
//                       className="h-full bg-gradient-to-r from-[#8EE147] to-[#6EC035] rounded-full"
//                       initial={{ width: 0 }}
//                       animate={{ width: `${responseRate}%` }}
//                       transition={{ duration: 1 }}
//                     />
//                   </div>
//                   <span className="text-[10px] sm:text-xs text-slate-500">Response rate</span>
//                 </div>
//               )}
              
//               <motion.div 
//                 className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
//                 animate={{
//                   scale: isHovered ? 1.1 : 1,
//                   backgroundColor: isHovered ? 'rgba(142, 225, 71, 0.1)' : undefined,
//                 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 group-hover:text-primary transition-colors" />
//               </motion.div>
//             </div>
//           </div>
//         </div>
//       </Card>
//     </motion.div>
//   );
// };

// // ============================================
// // CUSTOM DEBOUNCE HOOK
// // ============================================
// function useDebounce<T>(value: T, delay: number): T {
//   const [debouncedValue, setDebouncedValue] = useState<T>(value);

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [value, delay]);

//   return debouncedValue;
// }

// // ============================================
// // ACTIVITY LOG HELPERS
// // ============================================
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

// // ============================================
// // MAIN COMPONENT
// // ============================================
// export default function HistoryPage() {
//   const [history, setHistory] = useState<any[]>([]);
//   const [query, setQuery] = useState('');
//   const debouncedQuery = useDebounce(query, 300);
//   const [productFilter, setProductFilter] = useState('all');
//   const [isLoading, setIsLoading] = useState(true);
//   const [statsLoading, setStatsLoading] = useState(true);
//   const [page, setPage] = useState(0);
//   const [totalCount, setTotalCount] = useState(0);
//   const [pagination, setPagination] = useState<any>(null);
//   const [stats, setStats] = useState({
//     totalEntries: 0,
//     totalCompanies: 0,
//     totalReplied: 0,
//     totalInterested: 0,
//     totalNotInterested: 0,
//     responseRate: 0,
//     interestedRate: 0
//   });
//   const [products, setProducts] = useState<any[]>([]);
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
//   const navigate = useNavigate();
//   const perPage = 10;
//   const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
//   const seller = JSON.parse(
//     localStorage.getItem("seller") || "{}"
//   );
//   const sellerId = seller.id;

//   // Log search with debounce
//   const logSearch = (searchValue: string) => {
//     if (!searchValue || searchValue.length < 2) return;
//     createActivityLog(44, 11, `Searched by Product: ${searchValue}`, {
//       searchType: 'Product',
//       searchValue: searchValue
//     });
//   };

//   // Handle search change
//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setQuery(value);
//     setPage(0);
    
//     if (searchTimeoutRef.current) {
//       clearTimeout(searchTimeoutRef.current);
//     }
    
//     if (value && value.length >= 2) {
//       searchTimeoutRef.current = setTimeout(() => {
//         logSearch(value);
//       }, 500);
//     }
//   };

//   // Handle search on Enter
//   const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current);
//       }
//       if (query && query.length >= 2) {
//         logSearch(query);
//       }
//     }
//   };

//   // Handle product filter change
//   const handleProductFilterChange = (value: string) => {
//     setPage(0);
//     setProductFilter(value);
    
//     if (value !== 'all') {
//       createActivityLog(47, 11, `Selected product filter: ${value}`, {
//         filterType: 'product',
//         selectedValue: value
//       });
//     } else {
//       createActivityLog(47, 11, 'Cleared product filter', {
//         filterType: 'product',
//         selectedValue: 'all'
//       });
//     }
//   };

//   // Load products
//   useEffect(() => {
//     if (sellerId) {
//       loadProducts();
//     }
//     return () => {
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current);
//       }
//     };
//   }, [sellerId]);

//   const loadProducts = async () => {
//     try {
//       const response = await fetch(`${API_URL}/history/products?seller_id=${sellerId}`);
//       const data = await response.json();
//       setProducts(data);
//     } catch (err) {
//       console.error('Error loading products:', err);
//     }
//   };

//   // Fetch stats
//   const fetchStats = async () => {
//     try {
//       setStatsLoading(true);
//       const response = await fetch(`${API_URL}/history/stats?seller_id=${sellerId}`);
//       const data = await response.json();
//       if (data.success) {
//         setStats(data.data);
//       }
//     } catch (err) {
//       console.error('Error fetching stats:', err);
//     } finally {
//       setStatsLoading(false);
//     }
//   };

//   // Fetch history
//   const fetchHistory = useCallback(async () => {
//     try {
//       const isInitialLoad = page === 0 && !debouncedQuery && productFilter === 'all';
//       if (isInitialLoad) {
//         setIsLoading(true);
//       }
      
//       const params = new URLSearchParams();
//       params.set('seller_id', sellerId);
//       params.set('page', String(page + 1));
//       params.set('limit', String(perPage));
//       if (debouncedQuery) params.set('search', debouncedQuery);
//       if (productFilter !== 'all') params.set('product', productFilter);
      
//       const response = await fetch(`${API_URL}/history?${params.toString()}`);
//       const data = await response.json();
      
//       if (data.success) {
//         setHistory(data.data || []);
//         setTotalCount(data.total || 0);
//         setPagination(data.pagination || null);
//       }
      
//       if (isInitialLoad) {
//         createActivityLog(37, 11, 'Viewed history page');
//       }
      
//     } catch (err) {
//       console.error("History API Error:", err);
//       setHistory([]);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [debouncedQuery, productFilter, page, perPage, sellerId]);

//   useEffect(() => {
//     if (sellerId) {
//       fetchStats();
//       fetchHistory();
//     }
//   }, [sellerId]);

//   useEffect(() => {
//     if (sellerId) {
//       fetchHistory();
//     }
//   }, [page, debouncedQuery, productFilter, fetchHistory, sellerId]);

//   const handleCardClick = (entry: any) => {
//     createActivityLog(36, 11, `Navigated to history detail for: ${entry.product}`, {
//       history_id: entry.id,
//       product: entry.product,
//       companies_count: entry.companies?.length || 0,
//       date: entry.date
//     });
//     navigate(`/history/${entry.id}`);
//   };

//   const totalPages = pagination?.totalPages || Math.ceil(totalCount / perPage) || 1;

//   // Stats configuration - Updated with new colors
//   const statsConfig = [
//     {
//       label: 'Total Entries',
//       value: stats.totalEntries,
//       icon: Clock,
//       gradient: GRADIENTS.green,
//       iconBg: 'bg-[#8EE147]/20 border border-[#8EE147]/30',
//       iconColor: 'text-[#8EE147]',
//       progress: Math.min((stats.totalEntries / 200) * 100, 100),
//       sub: `${stats.totalCompanies} companies tracked`
//     },
//     {
//       label: 'Response Rate',
//       value: `${stats.responseRate}%`,
//       icon: TrendingUp,
//       gradient: GRADIENTS.green,
//       iconBg: 'bg-[#8EE147]/20 border border-[#8EE147]/30',
//       iconColor: 'text-[#8EE147]',
//       progress: stats.responseRate,
//       sub: `${stats.totalReplied} total replies`
//     },
//     {
//       label: 'Replied',
//       value: stats.totalReplied,
//       icon: MessageSquare,
//       gradient: GRADIENTS.blue,
//       iconBg: 'bg-blue-500/20 border border-blue-500/30',
//       iconColor: 'text-blue-400',
//       progress: Math.min((stats.totalReplied / 100) * 100, 100),
//       sub: `${stats.totalInterested} interested`
//     },
//     {
//       label: 'Interest Rate',
//       value: `${stats.interestedRate}%`,
//       icon: Award,
//       gradient: GRADIENTS.purple,
//       iconBg: 'bg-purple-500/20 border border-purple-500/30',
//       iconColor: 'text-purple-400',
//       progress: stats.interestedRate,
//       sub: `${stats.totalInterested} interested companies`
//     }
//   ];

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-[#0E223B]">
//         <AnimatedBackground />
//         <div className="flex flex-col justify-center items-center h-screen gap-6">
//           <div className="relative">
//             <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-[#8EE147] border-t-transparent"></div>
//             <div className="absolute inset-0 rounded-full border-4 border-[#8EE147]/20 border-t-transparent"></div>
//             <motion.div
//               className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#6EC035]"
//               animate={{ rotate: 360 }}
//               transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
//             />
//           </div>
//           <div className="text-center">
//             <motion.p 
//               className="text-lg font-semibold text-white"
//               animate={{ opacity: [0.5, 1, 0.5] }}
//               transition={{ duration: 2, repeat: Infinity }}
//             >
//               Loading History...
//             </motion.p>
//             <p className="text-sm text-slate-400 mt-1">Fetching your data</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#0E223B]">
//       <AnimatedBackground />
      
//       <div className="relative p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
//         {/* ============================================ */}
//         {/* HEADER WITH ANIMATION - Updated */}
//         {/* ============================================ */}
//         <motion.div 
//           className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0E223B] via-[#1A3355] to-[#0E223B] p-6 sm:p-8 md:p-10 mb-6 sm:mb-8 border border-white/10"
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           <div className="relative z-10">
//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//               <div className="flex items-center gap-4">
//                 <motion.div 
//                   className="p-3 rounded-2xl bg-gradient-to-r from-[#8EE147] to-[#6EC035] shadow-xl shadow-[#8EE147]/30"
//                   whileHover={{ rotate: 10, scale: 1.05 }}
//                 >
//                   <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-[#0E223B]" />
//                 </motion.div>
//                 <div>
//                   <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#8EE147] via-[#6EC035] to-[#5AA82E] bg-clip-text text-transparent">
//                     History
//                   </h1>
//                   <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-2">
//                     <Sparkles className="h-3.5 w-3.5 text-[#8EE147]" />
//                     Track your past activities and interactions
//                   </p>
//                 </div>
//               </div>
              
//               <div className="flex items-center gap-2">
//                 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0E223B]/80 rounded-full backdrop-blur-sm border border-white/10">
//                   <Calendar className="h-3.5 w-3.5 text-slate-400" />
//                   <span className="text-xs text-slate-400">
//                     {new Date().toLocaleDateString('en-US', { 
//                       month: 'short', 
//                       day: 'numeric', 
//                       year: 'numeric' 
//                     })}
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8EE147]/20 text-[#8EE147] rounded-full text-xs font-medium backdrop-blur-sm border border-[#8EE147]/30">
//                   <Zap className="h-3.5 w-3.5" />
//                   <span>Live</span>
//                   <span className="w-1.5 h-1.5 rounded-full bg-[#8EE147] animate-ping"></span>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {/* Decorative elements */}
//           <div className="absolute top-0 right-0 w-64 h-64 bg-[#8EE147]/5 rounded-full blur-3xl" />
//           <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#6EC035]/5 rounded-full blur-3xl" />
//         </motion.div>

//         {/* ============================================ */}
//         {/* STATS CARDS - Updated */}
//         {/* ============================================ */}
//         {statsLoading ? (
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
//             {[1, 2, 3, 4].map((i) => (
//               <Card key={i} className="p-4 border-0 shadow-sm animate-pulse bg-[#0E223B]/50 border border-white/10">
//                 <div className="h-2 w-16 bg-white/10 rounded mb-2"></div>
//                 <div className="h-6 w-12 bg-white/10 rounded"></div>
//               </Card>
//             ))}
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
//             {statsConfig.map((stat, index) => (
//               <StatsCard key={index} stat={stat} index={index} />
//             ))}
//           </div>
//         )}

//         {/* ============================================ */}
//         {/* FILTERS SECTION - Updated */}
//         {/* ============================================ */}
//         <motion.div 
//           className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//         >
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//             <Input
//               placeholder="Search by product..."
//               value={query}
//               onChange={handleSearchChange}
//               onKeyDown={handleSearchKeyDown}
//               className="pl-10 bg-[#0E223B]/80 border-white/10 focus:border-[#8EE147]/50 transition-all rounded-xl h-11 text-white placeholder:text-slate-500"
//             />
//           </div>

//           <Select value={productFilter} onValueChange={handleProductFilterChange}>
//             <SelectTrigger className="w-full sm:w-48 bg-[#0E223B]/80 border-white/10 focus:border-[#8EE147]/50 transition-all rounded-xl h-11 text-white">
//               <div className="flex items-center gap-2">
//                 <Filter className="h-4 w-4 text-slate-400" />
//                 <SelectValue placeholder="All Products" />
//               </div>
//             </SelectTrigger>
//             <SelectContent className="bg-[#0E223B] border-white/10 text-white">
//               <SelectItem value="all">📦 All Products</SelectItem>
//               {products.map((p: any) => (
//                 <SelectItem key={p.product} value={p.product} className="hover:bg-[#8EE147]/10 focus:bg-[#8EE147]/10">
//                   {p.product}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           {/* View mode toggle - Updated */}
//           <div className="flex bg-[#0E223B]/80 p-1 rounded-xl shadow-sm border border-white/10">
//             <button
//               onClick={() => setViewMode('list')}
//               className={`p-2 rounded-lg transition-all ${
//                 viewMode === 'list' ? 'bg-gradient-to-r from-[#8EE147] to-[#6EC035] text-[#0E223B] shadow-lg shadow-[#8EE147]/25' : 'text-slate-400 hover:text-white'
//               }`}
//             >
//               <List className="h-4 w-4" />
//             </button>
//             <button
//               onClick={() => setViewMode('grid')}
//               className={`p-2 rounded-lg transition-all ${
//                 viewMode === 'grid' ? 'bg-gradient-to-r from-[#8EE147] to-[#6EC035] text-[#0E223B] shadow-lg shadow-[#8EE147]/25' : 'text-slate-400 hover:text-white'
//               }`}
//             >
//               <Grid className="h-4 w-4" />
//             </button>
//           </div>
//         </motion.div>

//         {/* ============================================ */}
//         {/* RESULTS COUNT & PAGINATION - Updated */}
//         {/* ============================================ */}
//         <motion.div 
//           className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.3 }}
//         >
//           <div className="flex items-center gap-3">
//             <span className="text-sm text-slate-400">
//               Showing <span className="font-semibold text-white">{history.length}</span> of{' '}
//               <span className="font-semibold text-white">{totalCount}</span> entries
//             </span>
//             {query && (
//               <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-full border border-white/10">
//                 Results for "{query}"
//               </span>
//             )}
//           </div>
//           <div className="flex items-center gap-2">
//             <Button 
//               variant="outline" 
//               size="sm" 
//               disabled={page === 0} 
//               onClick={() => setPage((p) => p - 1)}
//               className="hover:bg-[#8EE147]/10 hover:border-[#8EE147]/30 transition-all h-9 px-3 text-white border-white/20"
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </Button>
//             <div className="px-3 py-1.5 bg-[#0E223B]/80 backdrop-blur-sm rounded-lg border border-white/10 text-sm font-medium text-white">
//               Page <span className="text-[#8EE147]">{page + 1}</span> / {totalPages || 1}
//             </div>
//             <Button 
//               variant="outline" 
//               size="sm" 
//               disabled={page + 1 >= totalPages} 
//               onClick={() => setPage((p) => p + 1)}
//               className="hover:bg-[#8EE147]/10 hover:border-[#8EE147]/30 transition-all h-9 px-3 text-white border-white/20"
//             >
//               <ChevronRightIcon className="h-4 w-4" />
//             </Button>
//           </div>
//         </motion.div>

//         {/* ============================================ */}
//         {/* HISTORY LIST - Updated */}
//         {/* ============================================ */}
//         <AnimatePresence mode="wait">
//           {history.length === 0 ? (
//             <motion.div 
//               className="flex flex-col items-center justify-center py-16 sm:py-20 text-center"
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.9 }}
//             >
//               <div className="relative">
//                 <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#8EE147]/10 border border-[#8EE147]/20 flex items-center justify-center mb-4">
//                   <Search className="h-10 w-10 text-slate-400" />
//                 </div>
//                 <motion.div
//                   className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#8EE147]/20 flex items-center justify-center"
//                   animate={{ scale: [1, 1.2, 1] }}
//                   transition={{ duration: 2, repeat: Infinity }}
//                 >
//                   <Sparkles className="h-3 w-3 text-[#8EE147]" />
//                 </motion.div>
//               </div>
//               <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
//                 No history found
//               </h3>
//               <p className="text-sm text-slate-400 max-w-sm">
//                 {query || productFilter !== 'all' 
//                   ? "Try adjusting your filters or search terms to find what you're looking for"
//                   : "Your history will appear here once you start interacting with companies"}
//               </p>
//               {(query || productFilter !== 'all') && (
//                 <button
//                   onClick={() => {
//                     setQuery('');
//                     setProductFilter('all');
//                     setPage(0);
//                   }}
//                   className="mt-4 text-sm text-[#8EE147] hover:text-[#6EC035] hover:underline"
//                 >
//                   Clear all filters
//                 </button>
//               )}
//             </motion.div>
//           ) : (
//             <motion.div 
//               className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-3 sm:gap-4`}
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ staggerChildren: 0.05 }}
//             >
//               {history.map((entry, index) => (
//                 <HistoryCard
//                   key={entry.id}
//                   entry={entry}
//                   onClick={handleCardClick}
//                   index={index}
//                 />
//               ))}
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* ============================================ */}
//         {/* BOTTOM PAGINATION - Updated */}
//         {/* ============================================ */}
//         {history.length > 0 && (
//           <motion.div 
//             className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 mt-4 border-t border-white/10"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.4 }}
//           >
//             <div className="text-sm text-slate-400">
//               Showing {page * perPage + 1} - {Math.min((page + 1) * perPage, totalCount)} of {totalCount} entries
//             </div>
//             <div className="flex items-center gap-2">
//               <Button 
//                 variant="outline" 
//                 size="sm" 
//                 disabled={page === 0} 
//                 onClick={() => setPage((p) => p - 1)}
//                 className="hover:bg-[#8EE147]/10 hover:border-[#8EE147]/30 transition-all h-9 px-3 text-white border-white/20"
//               >
//                 <ChevronLeft className="h-4 w-4" />
//               </Button>
//               <div className="px-3 py-1.5 bg-[#0E223B]/80 backdrop-blur-sm rounded-lg border border-white/10 text-sm font-medium text-white">
//                 {page + 1} / {totalPages || 1}
//               </div>
//               <Button 
//                 variant="outline" 
//                 size="sm" 
//                 disabled={page + 1 >= totalPages} 
//                 onClick={() => setPage((p) => p + 1)}
//                 className="hover:bg-[#8EE147]/10 hover:border-[#8EE147]/30 transition-all h-9 px-3 text-white border-white/20"
//               >
//                 <ChevronRightIcon className="h-4 w-4" />
//               </Button>
//             </div>
//           </motion.div>
//         )}

//         {/* ============================================ */}
//         {/* FOOTER - Updated */}
//         {/* ============================================ */}
//         <motion.div 
//           className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8 pt-4 border-t border-white/10"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.5 }}
//         >
//           <div className="flex items-center gap-2 text-xs text-slate-400">
//             <Clock className="h-3.5 w-3.5" />
//             Last updated: {new Date().toLocaleString()}
//             <span className="w-px h-4 bg-white/10" />
//             <span>Auto-refresh every 60s</span>
//           </div>
//           <div className="flex items-center gap-3">
//             <button className="text-xs text-slate-400 hover:text-[#8EE147] flex items-center gap-1 transition-colors">
//               <Download className="h-3.5 w-3.5" />
//               Export
//             </button>
//             <button className="text-xs text-slate-400 hover:text-[#8EE147] flex items-center gap-1 transition-colors">
//               <Share2 className="h-3.5 w-3.5" />
//               Share
//             </button>
//             <div className="flex items-center gap-1.5 text-xs text-slate-400">
//               <span className="flex items-center gap-1.5">
//                 <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#8EE147] animate-pulse" />
//                 Live
//               </span>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// }







import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, Clock, Users, TrendingUp, Calendar, Filter, ChevronRight, 
  Eye, MessageSquare, Loader2, ChevronLeft, ChevronRight as ChevronRightIcon,
  Sparkles, Zap, Award, BarChart3, PieChart, Activity, Globe,
  Star, Rocket, Crown, Gem, ArrowUpRight, Download, Share2,
  Settings, Bell, User, Layers, Grid, List, SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { API_URL, ACTIVITY_URL } from '@/components/api';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// ENHANCED COLOR SYSTEM - Updated with new colors
// ============================================
const COLORS = {
  primary: {
    light: '#8EE147',
    DEFAULT: '#8EE147',
    dark: '#6EC035',
  },
  success: {
    light: '#8EE147',
    DEFAULT: '#8EE147',
    dark: '#6EC035',
  },
  warning: {
    light: '#FBBF24',
    DEFAULT: '#F59E0B',
    dark: '#B45309',
  },
  danger: {
    light: '#F87171',
    DEFAULT: '#EF4444',
    dark: '#B91C1C',
  },
  purple: {
    light: '#A78BFA',
    DEFAULT: '#8B5CF6',
    dark: '#6D28D9',
  },
  pink: {
    light: '#F472B6',
    DEFAULT: '#EC4899',
    dark: '#BE185D',
  },
};

const GRADIENTS = {
  green: 'from-[#8EE147] via-[#6EC035] to-[#5AA82E]',
  dark: 'from-[#0E223B] via-[#1A3355] to-[#0E223B]',
  purple: 'from-purple-600 via-pink-500 to-rose-500',
  blue: 'from-blue-600 via-cyan-500 to-sky-500',
  orange: 'from-orange-600 via-amber-500 to-yellow-500',
  pink: 'from-pink-600 via-rose-500 to-red-500',
};

// ============================================
// ANIMATED BACKGROUND PARTICLES - Updated with new colors
// ============================================
const AnimatedBackground = () => {
  const [particles] = useState(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 8,
      opacity: Math.random() * 0.2 + 0.05,
    }))
  );

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-r from-[#8EE147]/10 to-[#6EC035]/10"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 15, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#8EE147]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#6EC035]/5 rounded-full blur-3xl animate-pulse delay-1000" />
    </div>
  );
};

// ============================================
// STATS CARD WITH ADVANCED DESIGN - Updated with new colors
// ============================================
const StatsCard = ({ stat, index }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="relative"
    >
      <Card 
        className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-[#0E223B]/95 border border-white/10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Animated gradient overlay */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0`}
          animate={{ opacity: isHovered ? 0.08 : 0 }}
          transition={{ duration: 0.4 }}
        />
        
        {/* Glow effect */}
        <motion.div
          className="absolute -inset-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 blur-xl"
          animate={{ opacity: isHovered ? 0.1 : 0 }}
          transition={{ duration: 0.4 }}
        />

        <div className="relative p-3 sm:p-4 md:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">
                {stat.label}
              </p>
              <motion.p 
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mt-1"
                animate={{ scale: isHovered ? 1.05 : 1 }}
                transition={{ duration: 0.3 }}
              >
                {stat.value}
              </motion.p>
              {stat.sub && (
                <p className="text-[8px] sm:text-[10px] text-slate-500 mt-0.5">
                  {stat.sub}
                </p>
              )}
            </div>
            <motion.div 
              className={`p-2 sm:p-2.5 rounded-xl ${stat.iconBg} shadow-lg border border-white/10`}
              animate={{ 
                rotate: isHovered ? [0, -5, 5, 0] : 0,
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ duration: 0.4 }}
            >
              <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.iconColor}`} />
            </motion.div>
          </div>
          
          {/* Decorative progress bar */}
          {stat.progress !== undefined && (
            <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${stat.gradient}`}
                initial={{ width: 0 }}
                animate={{ width: `${stat.progress}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

// ============================================
// HISTORY CARD WITH ADVANCED DESIGN - Updated with new colors
// ============================================
const HistoryCard = ({ entry, onClick, index }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const date = new Date(entry.date);
  const companies = entry.companies || [];
  const replied = companies.filter((c: any) => c.status === 'Replied').length;
  const opened = companies.filter((c: any) => c.status === 'Opened' || c.status === 'Replied').length;
  const responseRate = companies.length > 0 ? Math.round((replied / companies.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.4 }}
      whileHover={{ scale: 1.01 }}
      className="relative"
    >
      <Card 
        className="relative overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer bg-[#0E223B]/95 border border-white/10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onClick(entry)}
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#8EE147]/10 to-[#6EC035]/10 opacity-0"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />
        
        {/* Shine effect */}
        <motion.div
          className="absolute -inset-full top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
          animate={{
            left: isHovered ? '200%' : '-100%',
          }}
          transition={{ duration: 0.6 }}
        />

        <div className="relative p-3 sm:p-4 md:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Left section */}
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
              <motion.div 
                className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-[#8EE147]/20 border border-[#8EE147]/30 flex items-center justify-center flex-shrink-0"
                animate={{
                  scale: isHovered ? 1.1 : 1,
                  rotate: isHovered ? [0, -3, 3, 0] : 0,
                }}
                transition={{ duration: 0.4 }}
              >
                <TrendingUp className="h-5 w-5 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 text-[#8EE147]" />
              </motion.div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h3 className="font-semibold text-white text-sm sm:text-base md:text-lg truncate max-w-[180px] sm:max-w-[280px] md:max-w-none">
                    {entry.product}
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 bg-white/5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-white/10">
                    <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span>{date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 mt-1">
                  <span className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm text-slate-400">
                    <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="font-medium text-white">{companies.length}</span>
                    <span className="hidden xs:inline">companies</span>
                  </span>
                  
                  {opened > 0 && (
                    <span className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm text-slate-400">
                      <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span className="font-medium text-[#8EE147]">{opened}</span>
                      <span className="hidden xs:inline">opened</span>
                    </span>
                  )}
                  
                  {replied > 0 && (
                    <span className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm text-slate-400">
                      <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span className="font-medium text-[#8EE147]">{replied}</span>
                      <span className="hidden xs:inline">replied</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3 ml-auto flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
              {companies.length > 0 && (
                <div className="flex sm:hidden flex-col items-end gap-0.5 flex-1 max-w-[100px]">
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-[#8EE147] to-[#6EC035] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${responseRate}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">{responseRate}% response</span>
                </div>
              )}
              
              {companies.length > 0 && (
                <div className="hidden sm:flex flex-col items-end gap-1 min-w-[70px] md:min-w-[80px]">
                  <div className="w-16 sm:w-20 md:w-24 h-1 sm:h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-[#8EE147] to-[#6EC035] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${responseRate}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-500">Response rate</span>
                </div>
              )}
              
              <motion.div 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
                animate={{
                  scale: isHovered ? 1.1 : 1,
                  backgroundColor: isHovered ? 'rgba(142, 225, 71, 0.1)' : undefined,
                }}
                transition={{ duration: 0.3 }}
              >
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 group-hover:text-primary transition-colors" />
              </motion.div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// ============================================
// CUSTOM DEBOUNCE HOOK
// ============================================
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================
// ACTIVITY LOG HELPERS
// ============================================
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

// ============================================
// MAIN COMPONENT
// ============================================
export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [productFilter, setProductFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState<any>(null);
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalCompanies: 0,
    totalReplied: 0,
    totalInterested: 0,
    totalNotInterested: 0,
    responseRate: 0,
    interestedRate: 0
  });
  const [products, setProducts] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const navigate = useNavigate();
  const perPage = 10;
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const seller = JSON.parse(
    localStorage.getItem("seller") || "{}"
  );
  const sellerId = seller.id;

  // Log search with debounce
  const logSearch = (searchValue: string) => {
    if (!searchValue || searchValue.length < 2) return;
    createActivityLog(44, 11, `Searched by Product: ${searchValue}`, {
      searchType: 'Product',
      searchValue: searchValue
    });
  };

  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setPage(0);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (value && value.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        logSearch(value);
      }, 500);
    }
  };

  // Handle search on Enter
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (query && query.length >= 2) {
        logSearch(query);
      }
    }
  };

  // Handle product filter change
  const handleProductFilterChange = (value: string) => {
    setPage(0);
    setProductFilter(value);
    
    if (value !== 'all') {
      createActivityLog(47, 11, `Selected product filter: ${value}`, {
        filterType: 'product',
        selectedValue: value
      });
    } else {
      createActivityLog(47, 11, 'Cleared product filter', {
        filterType: 'product',
        selectedValue: 'all'
      });
    }
  };

  // Load products
  useEffect(() => {
    if (sellerId) {
      loadProducts();
    }
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [sellerId]);

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/history/products?seller_id=${sellerId}`);
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch(`${API_URL}/history/stats?seller_id=${sellerId}`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch history
  const fetchHistory = useCallback(async () => {
    try {
      const isInitialLoad = page === 0 && !debouncedQuery && productFilter === 'all';
      if (isInitialLoad) {
        setIsLoading(true);
      }
      
      const params = new URLSearchParams();
      params.set('seller_id', sellerId);
      params.set('page', String(page + 1));
      params.set('limit', String(perPage));
      if (debouncedQuery) params.set('search', debouncedQuery);
      if (productFilter !== 'all') params.set('product', productFilter);
      
      const response = await fetch(`${API_URL}/history?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setHistory(data.data || []);
        setTotalCount(data.total || 0);
        setPagination(data.pagination || null);
      }
      
      if (isInitialLoad) {
        createActivityLog(37, 11, 'Viewed history page');
      }
      
    } catch (err) {
      console.error("History API Error:", err);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, productFilter, page, perPage, sellerId]);

  useEffect(() => {
    if (sellerId) {
      fetchStats();
      fetchHistory();
    }
  }, [sellerId]);

  useEffect(() => {
    if (sellerId) {
      fetchHistory();
    }
  }, [page, debouncedQuery, productFilter, fetchHistory, sellerId]);

  const handleCardClick = (entry: any) => {
    createActivityLog(36, 11, `Navigated to history detail for: ${entry.product}`, {
      history_id: entry.id,
      product: entry.product,
      companies_count: entry.companies?.length || 0,
      date: entry.date
    });
    navigate(`/history/${entry.id}`);
  };

  const totalPages = pagination?.totalPages || Math.ceil(totalCount / perPage) || 1;

  // Stats configuration - Updated with new colors
  const statsConfig = [
    {
      label: 'Total Entries',
      value: stats.totalEntries,
      icon: Clock,
      gradient: GRADIENTS.green,
      iconBg: 'bg-[#8EE147]/20 border border-[#8EE147]/30',
      iconColor: 'text-[#8EE147]',
      progress: Math.min((stats.totalEntries / 200) * 100, 100),
      sub: `${stats.totalCompanies} companies tracked`
    },
    {
      label: 'Response Rate',
      value: `${stats.responseRate}%`,
      icon: TrendingUp,
      gradient: GRADIENTS.green,
      iconBg: 'bg-[#8EE147]/20 border border-[#8EE147]/30',
      iconColor: 'text-[#8EE147]',
      progress: stats.responseRate,
      sub: `${stats.totalReplied} total replies`
    },
    {
      label: 'Replied',
      value: stats.totalReplied,
      icon: MessageSquare,
      gradient: GRADIENTS.blue,
      iconBg: 'bg-blue-500/20 border border-blue-500/30',
      iconColor: 'text-blue-400',
      progress: Math.min((stats.totalReplied / 100) * 100, 100),
      sub: `${stats.totalInterested} interested`
    },
    {
      label: 'Interest Rate',
      value: `${stats.interestedRate}%`,
      icon: Award,
      gradient: GRADIENTS.purple,
      iconBg: 'bg-purple-500/20 border border-purple-500/30',
      iconColor: 'text-purple-400',
      progress: stats.interestedRate,
      sub: `${stats.totalInterested} interested companies`
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0E223B]">
        <AnimatedBackground />
        <div className="flex flex-col justify-center items-center h-screen gap-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-[#8EE147] border-t-transparent"></div>
            <div className="absolute inset-0 rounded-full border-4 border-[#8EE147]/20 border-t-transparent"></div>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#6EC035]"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <div className="text-center">
            <motion.p 
              className="text-lg font-semibold text-white"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Loading History...
            </motion.p>
            <p className="text-sm text-slate-400 mt-1">Fetching your data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E223B]">
      <AnimatedBackground />
      
      <div className="relative p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        {/* ============================================ */}
        {/* HEADER WITH ANIMATION - Updated */}
        {/* ============================================ */}
        <motion.div 
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0E223B] via-[#1A3355] to-[#0E223B] p-6 sm:p-8 md:p-10 mb-6 sm:mb-8 border border-white/10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="p-3 rounded-2xl bg-gradient-to-r from-[#8EE147] to-[#6EC035] shadow-xl shadow-[#8EE147]/30"
                  whileHover={{ rotate: 10, scale: 1.05 }}
                >
                  <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-[#0E223B]" />
                </motion.div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#8EE147] via-[#6EC035] to-[#5AA82E] bg-clip-text text-transparent">
                    History
                  </h1>
                  <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-[#8EE147]" />
                    Track your past activities and interactions
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0E223B]/80 rounded-full backdrop-blur-sm border border-white/10">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs text-slate-400">
                    {new Date().toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8EE147]/20 text-[#8EE147] rounded-full text-xs font-medium backdrop-blur-sm border border-[#8EE147]/30">
                  <Zap className="h-3.5 w-3.5" />
                  <span>Live</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8EE147] animate-ping"></span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#8EE147]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#6EC035]/5 rounded-full blur-3xl" />
        </motion.div>

        {/* ============================================ */}
        {/* STATS CARDS - Updated */}
        {/* ============================================ */}
        {statsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4 border-0 shadow-sm animate-pulse bg-[#0E223B]/50 border border-white/10">
                <div className="h-2 w-16 bg-white/10 rounded mb-2"></div>
                <div className="h-6 w-12 bg-white/10 rounded"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {statsConfig.map((stat, index) => (
              <StatsCard key={index} stat={stat} index={index} />
            ))}
          </div>
        )}

        {/* ============================================ */}
        {/* FILTERS SECTION - Updated */}
        {/* ============================================ */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by product..."
              value={query}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              className="pl-10 bg-[#0E223B]/80 border-white/10 focus:border-[#8EE147]/50 transition-all rounded-xl h-11 text-white placeholder:text-slate-500"
            />
          </div>

          <Select value={productFilter} onValueChange={handleProductFilterChange}>
            <SelectTrigger className="w-full sm:w-48 bg-[#0E223B]/80 border-white/10 focus:border-[#8EE147]/50 transition-all rounded-xl h-11 text-white">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <SelectValue placeholder="All Products" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-[#0E223B] border-white/10 text-white">
              <SelectItem value="all">📦 All Products</SelectItem>
              {products.map((p: any) => (
                <SelectItem key={p.product} value={p.product} className="hover:bg-[#8EE147]/10 focus:bg-[#8EE147]/10">
                  {p.product}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View mode toggle - Updated */}
          <div className="flex bg-[#0E223B]/80 p-1 rounded-xl shadow-sm border border-white/10">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-gradient-to-r from-[#8EE147] to-[#6EC035] text-[#0E223B] shadow-lg shadow-[#8EE147]/25' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-gradient-to-r from-[#8EE147] to-[#6EC035] text-[#0E223B] shadow-lg shadow-[#8EE147]/25' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        {/* ============================================ */}
        {/* RESULTS COUNT & PAGINATION - Updated with navy blue buttons */}
        {/* ============================================ */}
        <motion.div 
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">
              Showing <span className="font-semibold text-white">{history.length}</span> of{' '}
              <span className="font-semibold text-white">{totalCount}</span> entries
            </span>
            {query && (
              <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-full border border-white/10">
                Results for "{query}"
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === 0} 
              onClick={() => setPage((p) => p - 1)}
              className="hover:bg-[#1A3355] transition-all h-9 px-3 rounded-lg"
              style={{ 
                borderColor: '#2A4A6B', 
                color: '#8EE147',
                backgroundColor: '#0E223B'
              }}
            >
              <ChevronLeft className="h-4 w-4" style={{ color: '#8EE147' }} />
            </Button>
            <div className="px-3 py-1.5 bg-[#1A3355] backdrop-blur-sm rounded-lg border text-sm font-medium" style={{ borderColor: '#2A4A6B', color: '#94A3B8' }}>
              Page <span className="text-[#8EE147]">{page + 1}</span> / {totalPages || 1}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page + 1 >= totalPages} 
              onClick={() => setPage((p) => p + 1)}
              className="hover:bg-[#1A3355] transition-all h-9 px-3 rounded-lg"
              style={{ 
                borderColor: '#2A4A6B', 
                color: '#8EE147',
                backgroundColor: '#0E223B'
              }}
            >
              <ChevronRightIcon className="h-4 w-4" style={{ color: '#8EE147' }} />
            </Button>
          </div>
        </motion.div>

        {/* ============================================ */}
        {/* HISTORY LIST - Updated */}
        {/* ============================================ */}
        <AnimatePresence mode="wait">
          {history.length === 0 ? (
            <motion.div 
              className="flex flex-col items-center justify-center py-16 sm:py-20 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#8EE147]/10 border border-[#8EE147]/20 flex items-center justify-center mb-4">
                  <Search className="h-10 w-10 text-slate-400" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#8EE147]/20 flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="h-3 w-3 text-[#8EE147]" />
                </motion.div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                No history found
              </h3>
              <p className="text-sm text-slate-400 max-w-sm">
                {query || productFilter !== 'all' 
                  ? "Try adjusting your filters or search terms to find what you're looking for"
                  : "Your history will appear here once you start interacting with companies"}
              </p>
              {(query || productFilter !== 'all') && (
                <button
                  onClick={() => {
                    setQuery('');
                    setProductFilter('all');
                    setPage(0);
                  }}
                  className="mt-4 text-sm text-[#8EE147] hover:text-[#6EC035] hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div 
              className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-3 sm:gap-4`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
            >
              {history.map((entry, index) => (
                <HistoryCard
                  key={entry.id}
                  entry={entry}
                  onClick={handleCardClick}
                  index={index}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================ */}
        {/* BOTTOM PAGINATION - Updated with navy blue buttons */}
        {/* ============================================ */}
        {history.length > 0 && (
          <motion.div 
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 mt-4 border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-sm text-slate-400">
              Showing {page * perPage + 1} - {Math.min((page + 1) * perPage, totalCount)} of {totalCount} entries
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === 0} 
                onClick={() => setPage((p) => p - 1)}
                className="hover:bg-[#1A3355] transition-all h-9 px-3 rounded-lg"
                style={{ 
                  borderColor: '#2A4A6B', 
                  color: '#8EE147',
                  backgroundColor: '#0E223B'
                }}
              >
                <ChevronLeft className="h-4 w-4" style={{ color: '#8EE147' }} />
              </Button>
              <div className="px-3 py-1.5 bg-[#1A3355] backdrop-blur-sm rounded-lg border text-sm font-medium" style={{ borderColor: '#2A4A6B', color: '#94A3B8' }}>
                {page + 1} / {totalPages || 1}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page + 1 >= totalPages} 
                onClick={() => setPage((p) => p + 1)}
                className="hover:bg-[#1A3355] transition-all h-9 px-3 rounded-lg"
                style={{ 
                  borderColor: '#2A4A6B', 
                  color: '#8EE147',
                  backgroundColor: '#0E223B'
                }}
              >
                <ChevronRightIcon className="h-4 w-4" style={{ color: '#8EE147' }} />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ============================================ */}
        {/* FOOTER - Updated */}
        {/* ============================================ */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8 pt-4 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            Last updated: {new Date().toLocaleString()}
            <span className="w-px h-4 bg-white/10" />
            <span>Auto-refresh every 60s</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-xs text-slate-400 hover:text-[#8EE147] flex items-center gap-1 transition-colors">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button className="text-xs text-slate-400 hover:text-[#8EE147] flex items-center gap-1 transition-colors">
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#8EE147] animate-pulse" />
                Live
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}