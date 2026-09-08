// import { useState, useEffect, useRef } from 'react';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { 
//   Search, Loader2, ChevronLeft, ChevronRight, Mail, X, 
//   ThumbsUp, ThumbsDown, Users, Building2, Globe, 
//   Package, Hash, Sparkles, Filter, ArrowUpDown,
//   Send, User, Briefcase, MapPin, AtSign, Phone, Lock, Unlock,
//   Copy, Check
// } from 'lucide-react';
// import EmailModal from '@/components/EmailModal';
// import { toast } from 'sonner';
// import { ACTIVITY_URL, API_URL } from '@/components/api';
// import { useEmailConfigCheck } from '@/hooks/Emailconfigcheck';
// import EmailConfigModal from '@/components/EmailcheckModal';

// const API = API_URL;

// interface Buyer {
//   buyer_id: number;
//   buyer_date: string;
//   product: string;
//   hsn_code: string;
//   country: string;
//   company_name: string;
//   website: string;
//   contacts: string;
//   emails: string;
//   phone_revealed: boolean;
//   email_revealed: boolean;
// }

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

// /* Buyer Detail Modal */
// function BuyerDetailModal({
//   buyer,
//   onClose,
// }: {
//   buyer: Buyer | null;
//   onClose: () => void;
// }) {
//   if (!buyer) return null;

//   const fields: { label: string; value: string; icon: React.ReactNode }[] = [
//     { label: 'Company Name', value: buyer.company_name, icon: <Building2 className="h-4 w-4" /> },
//     { label: 'Product', value: buyer.product, icon: <Package className="h-4 w-4" /> },
//     { label: 'HSN Code', value: buyer.hsn_code, icon: <Hash className="h-4 w-4" /> },
//     { label: 'Country', value: buyer.country, icon: <Globe className="h-4 w-4" /> },
//     { label: 'Website', value: buyer.website, icon: <Globe className="h-4 w-4" /> },
//     { label: 'Contacts', value: buyer.contacts, icon: <User className="h-4 w-4" /> },
//     { label: 'Emails', value: buyer.emails, icon: <AtSign className="h-4 w-4" /> },
//     {
//       label: 'Date',
//       value: buyer.buyer_date
//         ? new Date(buyer.buyer_date).toLocaleDateString('en-GB').replace(/\//g, '-')
//         : '',
//       icon: <Calendar className="h-4 w-4" />,
//     },
//   ];

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-2 sm:p-4"
//       onClick={onClose}
//     >
//       <div
//         className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-lg mx-2 sm:mx-4 overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-3 sm:py-5">
//           <div className="flex items-center justify-between">
//             <div>
//               <div className="flex items-center gap-2 text-blue-100 text-xs font-medium uppercase tracking-wider mb-1">
//                 <Hash className="h-3.5 w-3.5" />
//                 HSN Code
//               </div>
//               <h2 className="text-xl sm:text-2xl font-bold text-white">{buyer.hsn_code}</h2>
//             </div>
//             <button
//               onClick={onClose}
//               className="rounded-lg p-2 bg-white/10 hover:bg-white/20 transition-colors text-white"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>
//         </div>

//         <div className="p-4 sm:p-6 space-y-4">
//           {fields.map(({ label, value, icon }) =>
//             value ? (
//               <div key={label} className="flex items-start gap-3 group">
//                 <div className="mt-0.5 text-muted-foreground/60 group-hover:text-primary transition-colors">
//                   {icon}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-0.5">
//                     {label}
//                   </span>
//                   {label === 'Website' ? (
//                     <a
//                       href={value.startsWith('http') ? value : `https://${value}`}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="text-sm text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors break-all"
//                     >
//                       {value}
//                     </a>
//                   ) : (
//                     <span className="text-sm text-foreground break-all font-medium">
//                       {value}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             ) : null
//           )}
//         </div>

//         <div className="px-4 sm:px-6 py-4 bg-gray-50/50 border-t flex justify-end">
//           <Button 
//             variant="outline" 
//             size="sm" 
//             onClick={onClose}
//             className="hover:bg-gray-100 transition-colors"
//           >
//             Close
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// const Calendar = ({ className }: { className?: string }) => (
//   <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//   </svg>
// );

// function CopyButton({ value, type, buyerId, companyName }: { 
//   value: string; 
//   type: 'phone' | 'email';
//   buyerId?: number;
//   companyName?: string;
// }) {
//   const [copied, setCopied] = useState(false);

//   const handleCopy = async (e: React.MouseEvent) => {
//     e.stopPropagation();
//     try {
//       await navigator.clipboard.writeText(value);
//       setCopied(true);
      
//       const actionId = type === 'email' ? 48 : 49;
//       const actionName = type === 'email' ? 'Email' : 'Phone Number';
      
//       await createActivityLog(
//         actionId,
//         1,
//         `Copied ${actionName}: ${value}${companyName ? ` (${companyName})` : ''}`,
//         {
//           copyType: type,
//           copiedValue: value,
//           buyer_id: buyerId,
//           company_name: companyName
//         }
//       );
      
//       toast.success(`Copied to clipboard`);
//       setTimeout(() => setCopied(false), 1500);
//     } catch (err) {
//       console.error('Copy failed:', err);
//       toast.error('Failed to copy');
//     }
//   };

//   return (
//     <button
//       onClick={handleCopy}
//       className="shrink-0 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
//       title={`Copy ${type === 'email' ? 'email' : 'phone'}`}
//     >
//       {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
//     </button>
//   );
// }

// export default function SearchPage() {
//   const [rows, setRows] = useState<Buyer[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [query, setQuery] = useState('');
//   const [countries, setCountries] = useState<any[]>([]);
//   const [countryFilter, setCountryFilter] = useState('all');
//   const [productFilter, setProductFilter] = useState('all');
//   const [products, setProducts] = useState<any[]>([]);
//   const [page, setPage] = useState(0);
//   const [totalCount, setTotalCount] = useState(0);
//   const [selected, setSelected] = useState<Set<number>>(new Set());
//   const [emailOpen, setEmailOpen] = useState(false);
//   const [detailBuyer, setDetailBuyer] = useState<Buyer | null>(null);
//   const [submittingId, setSubmittingId] = useState<number | null>(null);
//   const [revealingId, setRevealingId] = useState<number | null>(null);
  
//   const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   const revealContact = async (buyerId: number, type: 'phone' | 'email') => {
//     setRevealingId(buyerId);
//     try {
//       const seller = JSON.parse(localStorage.getItem("seller") || "{}");
//       const res = await fetch(`${API}/buyers/${buyerId}/reveal-contact`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ seller_id: seller.id, reveal_type: type }),
//       });
//       const json = await res.json();

//       if (json.success) {
//         const buyer = rows.find(r => r.buyer_id === buyerId);
        
//         setRows((prev) =>
//           prev.map((r) =>
//             r.buyer_id === buyerId
//               ? {
//                   ...r,
//                   contacts: type === 'phone' ? json.data.contacts : r.contacts,
//                   emails: type === 'email' ? json.data.emails : r.emails,
//                   phone_revealed: type === 'phone' ? true : r.phone_revealed,
//                   email_revealed: type === 'email' ? true : r.email_revealed,
//                 }
//               : r
//           )
//         );

//         if (type === 'phone') {
//           await createActivityLog(40, 1, `Revealed phone for: ${buyer?.company_name}`, {
//             buyer_id: buyerId,
//             company_name: buyer?.company_name,
//             phone: json.data.contacts
//           });
//         } else {
//           await createActivityLog(41, 1, `Revealed email for: ${buyer?.company_name}`, {
//             buyer_id: buyerId,
//             company_name: buyer?.company_name,
//             email: json.data.emails
//           });
//         }

//         toast.success(`${type === 'phone' ? 'Phone' : 'Email'} revealed!`);
//       } else {
//         toast.error(json.message || `Failed to reveal ${type}`);
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error(`Failed to reveal ${type}`);
//     } finally {
//       setRevealingId(null);
//     }
//   };

//   const perPage = 50;
//   const { checkEmailConfig, modalOpen, modalMessage, setModalOpen } = useEmailConfigCheck();

//   useEffect(() => {
//     loadFilters();
//     createActivityLog(16, 1, 'Viewed search page');
//     return () => {
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current);
//       }
//     };
//   }, []);

//   const loadFilters = async () => {
//     try {
//       const [countryRes, productRes] = await Promise.all([
//         fetch(`${API}/filters/buyer-countries`),
//         fetch(`${API}/filters/products`),
//       ]);
//       setCountries(await countryRes.json());
//       setProducts(await productRes.json());
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [page, query, countryFilter, productFilter]);
  
//   const seller = JSON.parse(localStorage.getItem("seller") || "{}");

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const params = new URLSearchParams();
//       params.set("seller_id", seller.id);
//       params.set('limit', String(perPage));
//       params.set('offset', String(page * perPage));
//       if (query) params.set('search', query);
//       if (countryFilter !== 'all') params.set('country', countryFilter);
//       if (productFilter !== 'all') params.set('product', productFilter);
//       const res = await fetch(`${API}/buyers?${params.toString()}`);
//       const json = await res.json();
//       setRows(json.data || []);
//       setTotalCount(json.total || 0);
//     } catch (err) {
//       console.error(err);
//       toast.error('Failed to fetch buyers');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logSearch = (searchValue: string) => {
//     if (!searchValue || searchValue.length < 2) return;
    
//     let actionId = 42;
//     let searchType = 'HSN';
//     const lowerValue = searchValue.toLowerCase();
    
//     const companyMatch = rows.some(r => r.company_name?.toLowerCase().includes(lowerValue));
//     const productMatch = rows.some(r => r.product?.toLowerCase().includes(lowerValue));
//     const countryMatch = rows.some(r => r.country?.toLowerCase().includes(lowerValue));
    
//     if (companyMatch) {
//       actionId = 43;
//       searchType = 'Company';
//     } else if (productMatch) {
//       actionId = 44;
//       searchType = 'Product';
//     } else if (countryMatch) {
//       actionId = 45;
//       searchType = 'Country';
//     }
    
//     createActivityLog(actionId, 1, `Searched by ${searchType}: ${searchValue}`, {
//       searchType: searchType,
//       searchValue: searchValue
//     });
//   };

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

//   const handleCountryFilter = (value: string) => {
//     setPage(0);
//     setCountryFilter(value);
//     if (value !== 'all') {
//       createActivityLog(45, 1, `Filtered by country: ${value}`, {
//         filterType: 'country',
//         filterValue: value
//       });
//     }
//   };

//   const handleProductFilter = (value: string) => {
//     setPage(0);
//     setProductFilter(value);
//     if (value !== 'all') {
//       createActivityLog(44, 1, `Filtered by product: ${value}`, {
//         filterType: 'product',
//         filterValue: value
//       });
//     }
//   };

//   const handleCountryDropdown = (value: string) => {
//     createActivityLog(46, 1, `Selected country from dropdown: ${value}`, {
//       dropdownType: 'countries',
//       selectedValue: value
//     });
//   };

//   const handleProductDropdown = (value: string) => {
//     createActivityLog(47, 1, `Selected product from dropdown: ${value}`, {
//       dropdownType: 'products',
//       selectedValue: value
//     });
//   };

//   const toggleSelect = (buyerId: number) => {
//     setSelected((prev) => {
//       const next = new Set(prev);
//       if (next.has(buyerId)) next.delete(buyerId);
//       else next.add(buyerId);
//       return next;
//     });
//   };

//   const selectAll = () => {
//     if (selected.size === rows.length) {
//       setSelected(new Set());
//     } else {
//       setSelected(new Set(rows.map((r) => r.buyer_id)));
//     }
//   };

//   const storeResponse = async (buyer: Buyer, responseType: 'interested' | 'not_interested') => {
//     if (!buyer.email_revealed) {
//       toast.error('Please reveal email first.');
//       return;
//     }
//     if (!buyer.phone_revealed) {
//       toast.error('Please reveal phone first.');
//       return;
//     }
//     setSubmittingId(buyer.buyer_id);
     
//     try {
//       const firstEmail = buyer.emails?.split(',')[0]?.trim();
//       if (!firstEmail) {
//         toast.error('No email found');
//         return;
//       }

//       const seller = JSON.parse(localStorage.getItem("seller") || "{}");
//       const payload = {
//         email: firstEmail,
//         response: responseType,
//         companyName: buyer.company_name,
//         country: buyer.country,
//         contactName: buyer.contacts || buyer.company_name,
//         productName: buyer.product,
//         templateUsed: 'Manual Entry',
//         buyer_id: buyer.buyer_id,
//         seller_id: seller.id || null,
//         hsn_code: buyer.hsn_code || '' 
//       };

//       const response = await fetch(`${API}/api/store-response`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();

//       if (data.success) {
//         toast.success(`${responseType === 'interested' ? '✓ Interested' : '✗ Not Interested'} recorded!`);
        
//         const actionId = responseType === 'interested' ? 6 : 7;
//         await createActivityLog(actionId, 1, 
//           `${responseType === 'interested' ? 'Interested' : 'Not Interested'}: ${buyer.company_name}`,
//           {
//             buyer_id: buyer.buyer_id,
//             company_name: buyer.company_name,
//             email: buyer.emails,
//             product: buyer.product,
//             hsn_code: buyer.hsn_code,
//             response: responseType
//           }
//         );
//       } else {
//         toast.error(data.error || 'Failed to record response');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       toast.error('Failed to record response');
//     } finally {
//       setSubmittingId(null);
//     }
//   };

//   const getSelectedBuyers = () => rows.filter(r => selected.has(r.buyer_id));

//   const getUniqueProducts = () => {
//     const selectedBuyers = getSelectedBuyers();
//     return [...new Set(selectedBuyers.map(b => b.product).filter(Boolean))];
//   };

//   const getProductToSend = () => {
//     const uniqueProducts = getUniqueProducts();
//     if (uniqueProducts.length === 0 || uniqueProducts.length > 1) {
//       return "General Products";
//     }
//     return uniqueProducts[0];
//   };

//   const isMultipleProductsSelected = () => {
//     const selectedBuyers = getSelectedBuyers();
//     const uniqueProducts = [...new Set(selectedBuyers.map(b => b.product).filter(Boolean))];
//     return uniqueProducts.length > 1;
//   };

//   const getRecipients = () => {
//     return getSelectedBuyers()
//       .filter((r) => r.email_revealed)
//       .flatMap((r) =>
//         (r.emails || '')
//           .split(',')
//           .map((email) => ({
//             name: r.company_name,
//             company: r.company_name,
//             company_name: r.company_name,
//             email: email.trim(),
//             country: r.country,
//             product: r.product,
//             hsn_code: r.hsn_code || '',
//             buyer_id: r.buyer_id,
//             templateUsed: 'Welcome Template',
//             contacts: r.contacts,
//           }))
//           .filter((recipient) => recipient.email)
//       );
//   };

//   const getLockedSelectedCount = () => {
//     return getSelectedBuyers().filter((r) => !r.email_revealed).length;
//   };

//   const totalPages = Math.ceil(totalCount / perPage);
//   const selectedCount = selected.size;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 p-1.5 sm:p-4">
//       <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
//       <div className="max-w-full sm:max-w-7xl mx-auto px-0.5 sm:px-2">
//         {/* Header - Responsive */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-6">
//           <div className="space-y-0.5">
//             <h1 className="text-lg sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//               Search Buyers
//             </h1>
//             <p className="text-[10px] sm:text-sm text-muted-foreground flex items-center gap-1.5">
//               <Users className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
//               <span className="hidden sm:inline">Find and connect with potential buyers worldwide</span>
//               <span className="sm:hidden">Find buyers worldwide</span>
//             </p>
//           </div>
//           <Button 
//             onClick={async () => {
//               const selectedBuyers = getSelectedBuyers();
//               const lockedCount = selectedBuyers.filter((r) => !r.email_revealed).length;
//               const revealedCount = selectedBuyers.length - lockedCount;

//               if (revealedCount === 0) {
//                 toast.error(
//                   lockedCount === 1
//                     ? 'This buyer\'s email is locked. Reveal it first to send an email.'
//                     : 'All selected buyers have locked emails. Reveal at least one to send an email.'
//                 );
//                 return;
//               }

//               if (lockedCount > 0) {
//                 toast.warning(
//                   `${lockedCount} selected buyer${lockedCount > 1 ? 's have' : ' has'} a locked email and will be skipped.`
//                 );
//               }

//               const ok = await checkEmailConfig();
//               if (!ok) return;

//               setEmailOpen(true);
//               createActivityLog(6, 3, 'Opened email modal', { 
//                 selected_count: selected.size,
//                 revealed_count: revealedCount,
//                 locked_skipped: lockedCount,
//               });
//             }} 
//             disabled={selectedCount === 0} 
//             className="gap-1 sm:gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4"
//           >
//             <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//             <span>Send Email</span>
//             {selectedCount > 0 && (
//               <span className="bg-white/20 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold">
//                 {selectedCount}
//               </span>
//             )}
//           </Button>
//         </div>

//         {/* Search and Filters - Responsive */}
//         <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/50 p-1.5 sm:p-3 mb-2.5 sm:mb-5">
//           <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-3 items-stretch sm:items-center">
//             <div className="relative flex-1 min-w-[120px] sm:min-w-[200px]">
//               <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
//               <Input
//                 placeholder="Search HSN, Company, Product, Country..."
//                 value={query}
//                 onChange={handleSearchChange}
//                 onKeyDown={handleSearchKeyDown}
//                 className="pl-8 sm:pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg sm:rounded-xl bg-white/80 w-full h-8 sm:h-10 text-[11px] sm:text-sm"
//               />
//             </div>

//             <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
//               <div className="relative w-full sm:w-36 lg:w-44">
//                 <Select value={countryFilter} onValueChange={handleCountryFilter}>
//                   <SelectTrigger className="w-full border-gray-200 focus:border-blue-400 rounded-lg sm:rounded-xl bg-white/80 h-8 sm:h-10 text-[11px] sm:text-sm">
//                     <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-blue-500 shrink-0" />
//                     <SelectValue placeholder="Country" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">🌍 All Countries</SelectItem>
//                     {countries.map((c) => (
//                       <SelectItem 
//                         key={c.country} 
//                         value={c.country}
//                         onClick={() => handleCountryDropdown(c.country)}
//                       >
//                         {c.country}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="relative w-full sm:w-36 lg:w-44">
//                 <Select value={productFilter} onValueChange={handleProductFilter}>
//                   <SelectTrigger className="w-full border-gray-200 focus:border-blue-400 rounded-lg sm:rounded-xl bg-white/80 h-8 sm:h-10 text-[11px] sm:text-sm">
//                     <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-blue-500 shrink-0" />
//                     <SelectValue placeholder="Product" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">📦 All Products</SelectItem>
//                     {products.map((p) => (
//                       <SelectItem 
//                         key={p.product} 
//                         value={p.product}
//                         onClick={() => handleProductDropdown(p.product)}
//                       >
//                         {p.product}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Stats and Pagination - Responsive */}
//         <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-3 mb-2.5 sm:mb-4">
//           <div className="flex flex-wrap items-center gap-1 sm:gap-4 text-[10px] sm:text-sm">
//             <span className="text-muted-foreground">
//               Showing <span className="font-semibold text-foreground">{rows.length}</span> of{' '}
//               <span className="font-semibold text-foreground">{totalCount}</span> buyers
//             </span>
//             {selectedCount > 0 && (
//               <span className="inline-flex items-center gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 bg-blue-50 text-blue-700 rounded-full text-[9px] sm:text-xs font-medium border border-blue-200">
//                 <Checkbox checked className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
//                 {selectedCount} selected
//               </span>
//             )}
//           </div>
//           <div className="flex items-center gap-1 sm:gap-2">
//             <Button 
//               variant="outline" 
//               size="sm" 
//               disabled={page === 0} 
//               onClick={() => setPage((p) => p - 1)}
//               className="hover:bg-blue-50 hover:border-blue-300 transition-colors h-7 sm:h-9 px-1.5 sm:px-3"
//             >
//               <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//             </Button>
//             <div className="px-1.5 sm:px-4 py-1 bg-white rounded-lg border text-[10px] sm:text-sm font-medium shadow-sm whitespace-nowrap">
//               Page <span className="text-blue-600">{page + 1}</span> / {totalPages || 1}
//             </div>
//             <Button 
//               variant="outline" 
//               size="sm" 
//               disabled={page + 1 >= totalPages} 
//               onClick={() => setPage((p) => p + 1)}
//               className="hover:bg-blue-50 hover:border-blue-300 transition-colors h-7 sm:h-9 px-1.5 sm:px-3"
//             >
//               <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//             </Button>
//           </div>
//         </div>

//         {/* Table - Responsive with horizontal scroll on mobile */}
//         <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
//           {loading ? (
//             <div className="flex flex-col items-center justify-center h-48 sm:h-64 gap-3 sm:gap-4">
//               <div className="relative">
//                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-xl opacity-20 animate-pulse" />
//                 <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-blue-600 relative" />
//               </div>
//               <p className="text-xs sm:text-sm text-muted-foreground animate-pulse">Loading buyers...</p>
//             </div>
//           ) : rows.length === 0 ? (
//             <div className="flex flex-col items-center justify-center h-48 sm:h-64 gap-2 sm:gap-3 px-4">
//               <div className="p-3 sm:p-4 bg-gray-50 rounded-full">
//                 <Search className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
//               </div>
//               <p className="text-sm sm:text-base text-muted-foreground font-medium">No Buyers Found</p>
//               <p className="text-[10px] sm:text-sm text-muted-foreground/70 text-center">Try adjusting your filters or search terms</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-[10px] sm:text-sm min-w-[650px] sm:min-w-[800px]">
//                 <thead>
//                   <tr className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 border-b border-gray-200">
//                     <th className="p-1.5 sm:p-3 text-center w-8 sm:w-12">
//                       <Checkbox
//                         checked={selected.size === rows.length && rows.length > 0}
//                         onCheckedChange={selectAll}
//                         className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
//                       />
//                     </th>
//                     <th className="p-1.5 sm:p-3 text-left font-semibold text-gray-700 whitespace-nowrap">
//                       <div className="flex items-center gap-0.5 sm:gap-2">
//                         <Package className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 shrink-0" />
//                         <span className="text-[9px] sm:text-sm">Product</span>
//                       </div>
//                     </th>
//                     <th className="p-1.5 sm:p-3 text-left font-semibold text-gray-700 whitespace-nowrap">
//                       <div className="flex items-center gap-0.5 sm:gap-2">
//                         <Hash className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 shrink-0" />
//                         <span className="text-[9px] sm:text-sm">HSN</span>
//                       </div>
//                     </th>
//                     <th className="p-1.5 sm:p-3 text-left font-semibold text-gray-700 whitespace-nowrap">
//                       <div className="flex items-center gap-0.5 sm:gap-2">
//                         <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 shrink-0" />
//                         <span className="text-[9px] sm:text-sm">Country</span>
//                       </div>
//                     </th>
//                     <th className="p-1.5 sm:p-3 text-left font-semibold text-gray-700 whitespace-nowrap">
//                       <div className="flex items-center gap-0.5 sm:gap-2">
//                         <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 shrink-0" />
//                         <span className="hidden sm:inline text-[9px] sm:text-sm">Company</span>
//                         <span className="sm:hidden text-[9px]">Co.</span>
//                       </div>
//                     </th>
//                     <th className="p-1.5 sm:p-3 text-left font-semibold text-gray-700 whitespace-nowrap">
//                       <div className="flex items-center gap-0.5 sm:gap-2">
//                         <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 shrink-0" />
//                         <span className="text-[9px] sm:text-sm">Phone</span>
//                       </div>
//                     </th>
//                     <th className="p-1.5 sm:p-3 text-left font-semibold text-gray-700 whitespace-nowrap">
//                       <div className="flex items-center gap-0.5 sm:gap-2">
//                         <AtSign className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 shrink-0" />
//                         <span className="text-[9px] sm:text-sm">Email</span>
//                       </div>
//                     </th>
//                     <th className="p-1.5 sm:p-3 text-center font-semibold text-gray-700 whitespace-nowrap">
//                       <span className="text-[9px] sm:text-sm">Actions</span>
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {rows.map((r) => (
//                     <tr 
//                       key={r.buyer_id} 
//                       className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 ${
//                         selected.has(r.buyer_id) ? 'bg-blue-50/30' : ''
//                       }`}
//                     >
//                       <td className="p-1.5 sm:p-3 text-center">
//                         <Checkbox
//                           checked={selected.has(r.buyer_id)}
//                           onCheckedChange={() => toggleSelect(r.buyer_id)}
//                           className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
//                         />
//                       </td>
//                       <td className="p-1.5 sm:p-3 max-w-[60px] sm:max-w-[120px] truncate">
//                         <span className="font-medium text-gray-800 text-[9px] sm:text-sm" title={r.product}>
//                           {r.product}
//                         </span>
//                       </td>
//                       <td className="p-1.5 sm:p-3">
//                         <button
//                           className="inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2.5 py-0.5 sm:py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-[8px] sm:text-xs"
//                           onClick={() => {
//                             setDetailBuyer(r);
//                             createActivityLog(7, 3, `Viewed buyer details: ${r.company_name}`, {
//                               buyer_id: r.buyer_id,
//                               company_name: r.company_name,
//                               hsn_code: r.hsn_code
//                             });
//                           }}
//                         >
//                           <Hash className="h-2 w-2 sm:h-3 sm:w-3" />
//                           {r.hsn_code}
//                         </button>
//                       </td>
//                       <td className="p-1.5 sm:p-3">
//                         <span className="inline-flex items-center gap-1 px-1 sm:px-2.5 py-0.5 sm:py-1 bg-gray-50 rounded-lg text-[8px] sm:text-xs">
//                           {r.country}
//                         </span>
//                       </td>
//                       <td className="p-1.5 sm:p-3 max-w-[70px] sm:max-w-[150px] truncate font-medium text-gray-800 text-[9px] sm:text-sm" title={r.company_name}>
//                         {r.company_name}
//                       </td>
                      
//                       {/* Contacts cell */}
//                       <td className="p-1.5 sm:p-3 max-w-[70px] sm:max-w-[140px]">
//                         {r.phone_revealed ? (
//                           <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
//                             <span className="text-gray-600 text-[8px] sm:text-xs truncate min-w-0" title={r.contacts}>
//                               {r.contacts}
//                             </span>
//                             <CopyButton 
//                               value={r.contacts} 
//                               type="phone"
//                               buyerId={r.buyer_id}
//                               companyName={r.company_name}
//                             />
//                           </div>
//                         ) : (
//                           <button
//                             onClick={() => revealContact(r.buyer_id, "phone")}
//                             disabled={revealingId === r.buyer_id}
//                             className="inline-flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-xs text-gray-500 hover:text-blue-600 transition-colors whitespace-nowrap"
//                           >
//                             {revealingId === r.buyer_id ? (
//                               <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
//                             ) : (
//                               <>
//                                 <Lock className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
//                                 <span className="hidden sm:inline">Locked</span>
//                               </>
//                             )}
//                           </button>
//                         )}
//                       </td>

//                       {/* Emails cell */}
//                       <td className="p-1.5 sm:p-3 max-w-[80px] sm:max-w-[170px]">
//                         {r.email_revealed ? (
//                           <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
//                             <span className="text-blue-600 text-[8px] sm:text-xs truncate min-w-0" title={r.emails}>
//                               {r.emails}
//                             </span>
//                             <CopyButton 
//                               value={r.emails} 
//                               type="email"
//                               buyerId={r.buyer_id}
//                               companyName={r.company_name}
//                             />
//                           </div>
//                         ) : (
//                           <button
//                             onClick={() => revealContact(r.buyer_id, "email")}
//                             disabled={revealingId === r.buyer_id}
//                             className="inline-flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-xs text-gray-500 hover:text-blue-600 transition-colors whitespace-nowrap"
//                           >
//                             {revealingId === r.buyer_id ? (
//                               <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
//                             ) : (
//                               <>
//                                 <Lock className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
//                                 <span className="hidden sm:inline">Locked</span>
//                               </>
//                             )}
//                           </button>
//                         )}
//                       </td>

//                       <td className="p-1.5 sm:p-3">
//                         <div className="flex flex-col sm:flex-row gap-0.5 sm:gap-1.5">
//                           <Button
//                             size="sm"
//                             variant="ghost"
//                             className="h-5 sm:h-7 px-1 sm:px-2 gap-0.5 sm:gap-1 text-[8px] sm:text-xs bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 rounded-lg border border-green-200"
//                             onClick={() => storeResponse(r, 'interested')}
//                             disabled={submittingId === r.buyer_id}
//                           >
//                             {submittingId === r.buyer_id ? (
//                               <Loader2 className="h-2 w-2 sm:h-3 sm:w-3 animate-spin" />
//                             ) : (
//                               <ThumbsUp className="h-2 w-2 sm:h-3 sm:w-3" />
//                             )}
//                             <span className="text-[7px] sm:text-[10px]">Interested</span>
//                           </Button>
//                           <Button
//                             size="sm"
//                             variant="ghost"
//                             className="h-5 sm:h-7 px-1 sm:px-2 gap-0.5 sm:gap-1 text-[8px] sm:text-xs bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 rounded-lg border border-red-200"
//                             onClick={() => storeResponse(r, 'not_interested')}
//                             disabled={submittingId === r.buyer_id}
//                           >
//                             {submittingId === r.buyer_id ? (
//                               <Loader2 className="h-2 w-2 sm:h-3 sm:w-3 animate-spin" />
//                             ) : (
//                               <ThumbsDown className="h-2 w-2 sm:h-3 sm:w-3" />
//                             )}
//                             <span className="text-[7px] sm:text-[10px]">Not Interested</span>
//                           </Button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* Bottom Pagination - Responsive */}
//         {rows.length > 0 && (
//           <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 mt-2.5 sm:mt-4 text-[10px] sm:text-sm text-muted-foreground">
//             <span>
//               Showing {page * perPage + 1} - {Math.min((page + 1) * perPage, totalCount)} of {totalCount}
//             </span>
//             <div className="flex items-center gap-1.5 sm:gap-2">
//               <Button 
//                 variant="outline" 
//                 size="sm" 
//                 disabled={page === 0} 
//                 onClick={() => setPage((p) => p - 1)}
//                 className="h-7 sm:h-9 px-1.5 sm:px-3"
//               >
//                 <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//               </Button>
//               <div className="px-1.5 sm:px-3 py-1 bg-white rounded-lg border text-[10px] sm:text-xs font-medium">
//                 {page + 1} / {totalPages || 1}
//               </div>
//               <Button 
//                 variant="outline" 
//                 size="sm" 
//                 disabled={page + 1 >= totalPages} 
//                 onClick={() => setPage((p) => p + 1)}
//                 className="h-7 sm:h-9 px-1.5 sm:px-3"
//               >
//                 <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>

//       <BuyerDetailModal buyer={detailBuyer} onClose={() => setDetailBuyer(null)} />
      
//       <EmailModal
//         open={emailOpen}
//         recipients={getRecipients()}
//         product={getProductToSend()}
//         multipleProducts={isMultipleProductsSelected()}
//         onClose={() => setEmailOpen(false)}
//       />

//       <EmailConfigModal
//         open={modalOpen}
//         message={modalMessage}
//         onClose={() => setModalOpen(false)}
//       />
//     </div>
//   );
// }




// import { useState, useEffect, useRef } from 'react';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   Search, Loader2, ChevronLeft, ChevronRight, Mail, X,
//   ThumbsUp, ThumbsDown, Users, Building2, Globe,
//   Package, Hash, Filter, ArrowUpDown,
//   Send, User, MapPin, AtSign, Phone, Lock,
//   Copy, Check, Eye
// } from 'lucide-react';
// import EmailModal from '@/components/EmailModal';
// import { toast } from 'sonner';
// import { ACTIVITY_URL, API_URL } from '@/components/api';
// import { useEmailConfigCheck } from '@/hooks/Emailconfigcheck';
// import EmailConfigModal from '@/components/EmailcheckModal';

// const API = API_URL;

// interface Buyer {
//   buyer_id: number;
//   buyer_date: string;
//   product: string;
//   hsn_code: string;
//   country: string;
//   company_name: string;
//   website: string;
//   contacts: string;
//   emails: string;
//   phone_revealed: boolean;
//   email_revealed: boolean;
// }

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

// /* ---------- Small visual helpers (avatar + status pill) ---------- */

// // Deterministic "brand tile" color per company, so each row reads
// // like it has its own logo mark even without real artwork.
// const AVATAR_PALETTE = [
//   { bg: '#101828', fg: '#FFFFFF' }, // near-black
//   { bg: '#E1306C', fg: '#FFFFFF' }, // magenta
//   { bg: '#00A86B', fg: '#FFFFFF' }, // green
//   { bg: '#5A3FFF', fg: '#FFFFFF' }, // violet
//   { bg: '#1DB954', fg: '#FFFFFF' }, // spotify green
//   { bg: '#0B5FFF', fg: '#FFFFFF' }, // blue
//   { bg: '#F59E0B', fg: '#FFFFFF' }, // amber
//   { bg: '#0EA5A0', fg: '#FFFFFF' }, // teal
// ];

// function hashString(s: string) {
//   let h = 0;
//   for (let i = 0; i < s.length; i++) {
//     h = (h << 5) - h + s.charCodeAt(i);
//     h |= 0;
//   }
//   return Math.abs(h);
// }

// function CompanyAvatar({ name }: { name: string }) {
//   const safe = name || '?';
//   const palette = AVATAR_PALETTE[hashString(safe) % AVATAR_PALETTE.length];
//   const initial = safe.trim().charAt(0).toUpperCase();
//   return (
//     <div
//       className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl flex items-center justify-center font-semibold text-sm sm:text-base"
//       style={{ backgroundColor: palette.bg, color: palette.fg }}
//       aria-hidden
//     >
//       {initial}
//     </div>
//   );
// }

// type RevealState = 'full' | 'partial' | 'locked';

// function getRevealState(buyer: Buyer): RevealState {
//   if (buyer.email_revealed && buyer.phone_revealed) return 'full';
//   if (buyer.email_revealed || buyer.phone_revealed) return 'partial';
//   return 'locked';
// }

// const REVEAL_STYLES: Record<RevealState, { label: string; className: string }> = {
//   full: { label: 'Revealed', className: 'bg-emerald-50 text-emerald-700' },
//   partial: { label: 'Partial', className: 'bg-amber-50 text-amber-700' },
//   locked: { label: 'Locked', className: 'bg-slate-100 text-slate-500' },
// };

// function StatusPill({ state }: { state: RevealState }) {
//   const s = REVEAL_STYLES[state];
//   return (
//     <span className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium ${s.className}`}>
//       {s.label}
//     </span>
//   );
// }

// /* -------------------------------------------------------------- */

// /* Buyer Detail Modal */
// function BuyerDetailModal({
//   buyer,
//   onClose,
// }: {
//   buyer: Buyer | null;
//   onClose: () => void;
// }) {
//   if (!buyer) return null;

//   const fields: { label: string; value: string; icon: React.ReactNode }[] = [
//     { label: 'Company Name', value: buyer.company_name, icon: <Building2 className="h-4 w-4" /> },
//     { label: 'Product', value: buyer.product, icon: <Package className="h-4 w-4" /> },
//     { label: 'HSN Code', value: buyer.hsn_code, icon: <Hash className="h-4 w-4" /> },
//     { label: 'Country', value: buyer.country, icon: <Globe className="h-4 w-4" /> },
//     { label: 'Website', value: buyer.website, icon: <Globe className="h-4 w-4" /> },
//     { label: 'Contacts', value: buyer.contacts, icon: <User className="h-4 w-4" /> },
//     { label: 'Emails', value: buyer.emails, icon: <AtSign className="h-4 w-4" /> },
//     {
//       label: 'Date',
//       value: buyer.buyer_date
//         ? new Date(buyer.buyer_date).toLocaleDateString('en-GB').replace(/\//g, '-')
//         : '',
//       icon: <Calendar className="h-4 w-4" />,
//     },
//   ];

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-2 sm:p-4"
//       onClick={onClose}
//     >
//       <div
//         className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-2 sm:mx-4 overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="relative bg-slate-900 px-4 sm:px-6 py-4 sm:py-5">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <CompanyAvatar name={buyer.company_name} />
//               <div>
//                 <div className="text-slate-400 text-[10px] font-medium mb-0.5">
//                   HSN {buyer.hsn_code}
//                 </div>
//                 <h2 className="text-lg sm:text-xl font-semibold text-white">{buyer.company_name}</h2>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               className="rounded-lg p-2 bg-white/10 hover:bg-white/20 transition-colors text-white"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>
//         </div>

//         <div className="p-4 sm:p-6 space-y-4">
//           {fields.map(({ label, value, icon }) =>
//             value ? (
//               <div key={label} className="flex items-start gap-3 group">
//                 <div className="mt-0.5 text-slate-400 group-hover:text-slate-600 transition-colors">
//                   {icon}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <span className="text-xs font-medium text-slate-400 block mb-0.5">
//                     {label}
//                   </span>
//                   {label === 'Website' ? (
//                     <a
//                       href={value.startsWith('http') ? value : `https://${value}`}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="text-sm text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors break-all"
//                     >
//                       {value}
//                     </a>
//                   ) : (
//                     <span className="text-sm text-slate-800 break-all font-medium">
//                       {value}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             ) : null
//           )}
//         </div>

//         <div className="px-4 sm:px-6 py-4 bg-slate-50 border-t flex justify-end">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={onClose}
//             className="hover:bg-slate-100 transition-colors"
//           >
//             Close
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// const Calendar = ({ className }: { className?: string }) => (
//   <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//   </svg>
// );

// function CopyButton({ value, type, buyerId, companyName }: {
//   value: string;
//   type: 'phone' | 'email';
//   buyerId?: number;
//   companyName?: string;
// }) {
//   const [copied, setCopied] = useState(false);

//   const handleCopy = async (e: React.MouseEvent) => {
//     e.stopPropagation();
//     try {
//       await navigator.clipboard.writeText(value);
//       setCopied(true);

//       const actionId = type === 'email' ? 48 : 49;
//       const actionName = type === 'email' ? 'Email' : 'Phone Number';

//       await createActivityLog(
//         actionId,
//         1,
//         `Copied ${actionName}: ${value}${companyName ? ` (${companyName})` : ''}`,
//         {
//           copyType: type,
//           copiedValue: value,
//           buyer_id: buyerId,
//           company_name: companyName
//         }
//       );

//       toast.success(`Copied to clipboard`);
//       setTimeout(() => setCopied(false), 1500);
//     } catch (err) {
//       console.error('Copy failed:', err);
//       toast.error('Failed to copy');
//     }
//   };

//   return (
//     <button
//       onClick={handleCopy}
//       className="shrink-0 p-1 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-600 transition-colors"
//       title={`Copy ${type === 'email' ? 'email' : 'phone'}`}
//     >
//       {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
//     </button>
//   );
// }

// export default function SearchPage() {
//   const [rows, setRows] = useState<Buyer[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [query, setQuery] = useState('');
//   const [countries, setCountries] = useState<any[]>([]);
//   const [countryFilter, setCountryFilter] = useState('all');
//   const [productFilter, setProductFilter] = useState('all');
//   const [products, setProducts] = useState<any[]>([]);
//   const [page, setPage] = useState(0);
//   const [totalCount, setTotalCount] = useState(0);
//   const [selected, setSelected] = useState<Set<number>>(new Set());
//   const [emailOpen, setEmailOpen] = useState(false);
//   const [detailBuyer, setDetailBuyer] = useState<Buyer | null>(null);
//   const [submittingId, setSubmittingId] = useState<number | null>(null);
//   const [revealingId, setRevealingId] = useState<number | null>(null);

//   const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   const revealContact = async (buyerId: number, type: 'phone' | 'email') => {
//     setRevealingId(buyerId);
//     try {
//       const seller = JSON.parse(localStorage.getItem("seller") || "{}");
//       const res = await fetch(`${API}/buyers/${buyerId}/reveal-contact`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ seller_id: seller.id, reveal_type: type }),
//       });
//       const json = await res.json();

//       if (json.success) {
//         const buyer = rows.find(r => r.buyer_id === buyerId);

//         setRows((prev) =>
//           prev.map((r) =>
//             r.buyer_id === buyerId
//               ? {
//                   ...r,
//                   contacts: type === 'phone' ? json.data.contacts : r.contacts,
//                   emails: type === 'email' ? json.data.emails : r.emails,
//                   phone_revealed: type === 'phone' ? true : r.phone_revealed,
//                   email_revealed: type === 'email' ? true : r.email_revealed,
//                 }
//               : r
//           )
//         );

//         if (type === 'phone') {
//           await createActivityLog(40, 1, `Revealed phone for: ${buyer?.company_name}`, {
//             buyer_id: buyerId,
//             company_name: buyer?.company_name,
//             phone: json.data.contacts
//           });
//         } else {
//           await createActivityLog(41, 1, `Revealed email for: ${buyer?.company_name}`, {
//             buyer_id: buyerId,
//             company_name: buyer?.company_name,
//             email: json.data.emails
//           });
//         }

//         toast.success(`${type === 'phone' ? 'Phone' : 'Email'} revealed!`);
//       } else {
//         toast.error(json.message || `Failed to reveal ${type}`);
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error(`Failed to reveal ${type}`);
//     } finally {
//       setRevealingId(null);
//     }
//   };

//   const perPage = 50;
//   const { checkEmailConfig, modalOpen, modalMessage, setModalOpen } = useEmailConfigCheck();

//   useEffect(() => {
//     loadFilters();
//     createActivityLog(16, 1, 'Viewed search page');
//     return () => {
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current);
//       }
//     };
//   }, []);

//   const loadFilters = async () => {
//     try {
//       const [countryRes, productRes] = await Promise.all([
//         fetch(`${API}/filters/buyer-countries`),
//         fetch(`${API}/filters/products`),
//       ]);
//       setCountries(await countryRes.json());
//       setProducts(await productRes.json());
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [page, query, countryFilter, productFilter]);

//   const seller = JSON.parse(localStorage.getItem("seller") || "{}");

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const params = new URLSearchParams();
//       params.set("seller_id", seller.id);
//       params.set('limit', String(perPage));
//       params.set('offset', String(page * perPage));
//       if (query) params.set('search', query);
//       if (countryFilter !== 'all') params.set('country', countryFilter);
//       if (productFilter !== 'all') params.set('product', productFilter);
//       const res = await fetch(`${API}/buyers?${params.toString()}`);
//       const json = await res.json();
//       setRows(json.data || []);
//       setTotalCount(json.total || 0);
//     } catch (err) {
//       console.error(err);
//       toast.error('Failed to fetch buyers');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logSearch = (searchValue: string) => {
//     if (!searchValue || searchValue.length < 2) return;

//     let actionId = 42;
//     let searchType = 'HSN';
//     const lowerValue = searchValue.toLowerCase();

//     const companyMatch = rows.some(r => r.company_name?.toLowerCase().includes(lowerValue));
//     const productMatch = rows.some(r => r.product?.toLowerCase().includes(lowerValue));
//     const countryMatch = rows.some(r => r.country?.toLowerCase().includes(lowerValue));

//     if (companyMatch) {
//       actionId = 43;
//       searchType = 'Company';
//     } else if (productMatch) {
//       actionId = 44;
//       searchType = 'Product';
//     } else if (countryMatch) {
//       actionId = 45;
//       searchType = 'Country';
//     }

//     createActivityLog(actionId, 1, `Searched by ${searchType}: ${searchValue}`, {
//       searchType: searchType,
//       searchValue: searchValue
//     });
//   };

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

//   const handleCountryFilter = (value: string) => {
//     setPage(0);
//     setCountryFilter(value);
//     if (value !== 'all') {
//       createActivityLog(45, 1, `Filtered by country: ${value}`, {
//         filterType: 'country',
//         filterValue: value
//       });
//     }
//   };

//   const handleProductFilter = (value: string) => {
//     setPage(0);
//     setProductFilter(value);
//     if (value !== 'all') {
//       createActivityLog(44, 1, `Filtered by product: ${value}`, {
//         filterType: 'product',
//         filterValue: value
//       });
//     }
//   };

//   const handleCountryDropdown = (value: string) => {
//     createActivityLog(46, 1, `Selected country from dropdown: ${value}`, {
//       dropdownType: 'countries',
//       selectedValue: value
//     });
//   };

//   const handleProductDropdown = (value: string) => {
//     createActivityLog(47, 1, `Selected product from dropdown: ${value}`, {
//       dropdownType: 'products',
//       selectedValue: value
//     });
//   };

//   const toggleSelect = (buyerId: number) => {
//     setSelected((prev) => {
//       const next = new Set(prev);
//       if (next.has(buyerId)) next.delete(buyerId);
//       else next.add(buyerId);
//       return next;
//     });
//   };

//   const selectAll = () => {
//     if (selected.size === rows.length) {
//       setSelected(new Set());
//     } else {
//       setSelected(new Set(rows.map((r) => r.buyer_id)));
//     }
//   };

//   const storeResponse = async (buyer: Buyer, responseType: 'interested' | 'not_interested') => {
//     if (!buyer.email_revealed) {
//       toast.error('Please reveal email first.');
//       return;
//     }
//     if (!buyer.phone_revealed) {
//       toast.error('Please reveal phone first.');
//       return;
//     }
//     setSubmittingId(buyer.buyer_id);

//     try {
//       const firstEmail = buyer.emails?.split(',')[0]?.trim();
//       if (!firstEmail) {
//         toast.error('No email found');
//         return;
//       }

//       const seller = JSON.parse(localStorage.getItem("seller") || "{}");
//       const payload = {
//         email: firstEmail,
//         response: responseType,
//         companyName: buyer.company_name,
//         country: buyer.country,
//         contactName: buyer.contacts || buyer.company_name,
//         productName: buyer.product,
//         templateUsed: 'Manual Entry',
//         buyer_id: buyer.buyer_id,
//         seller_id: seller.id || null,
//         hsn_code: buyer.hsn_code || ''
//       };

//       const response = await fetch(`${API}/api/store-response`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();

//       if (data.success) {
//         toast.success(`${responseType === 'interested' ? '✓ Interested' : '✗ Not Interested'} recorded!`);

//         const actionId = responseType === 'interested' ? 6 : 7;
//         await createActivityLog(actionId, 1,
//           `${responseType === 'interested' ? 'Interested' : 'Not Interested'}: ${buyer.company_name}`,
//           {
//             buyer_id: buyer.buyer_id,
//             company_name: buyer.company_name,
//             email: buyer.emails,
//             product: buyer.product,
//             hsn_code: buyer.hsn_code,
//             response: responseType
//           }
//         );
//       } else {
//         toast.error(data.error || 'Failed to record response');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       toast.error('Failed to record response');
//     } finally {
//       setSubmittingId(null);
//     }
//   };

//   const getSelectedBuyers = () => rows.filter(r => selected.has(r.buyer_id));

//   const getUniqueProducts = () => {
//     const selectedBuyers = getSelectedBuyers();
//     return [...new Set(selectedBuyers.map(b => b.product).filter(Boolean))];
//   };

//   const getProductToSend = () => {
//     const uniqueProducts = getUniqueProducts();
//     if (uniqueProducts.length === 0 || uniqueProducts.length > 1) {
//       return "General Products";
//     }
//     return uniqueProducts[0];
//   };

//   const isMultipleProductsSelected = () => {
//     const selectedBuyers = getSelectedBuyers();
//     const uniqueProducts = [...new Set(selectedBuyers.map(b => b.product).filter(Boolean))];
//     return uniqueProducts.length > 1;
//   };

//   const getRecipients = () => {
//     return getSelectedBuyers()
//       .filter((r) => r.email_revealed)
//       .flatMap((r) =>
//         (r.emails || '')
//           .split(',')
//           .map((email) => ({
//             name: r.company_name,
//             company: r.company_name,
//             company_name: r.company_name,
//             email: email.trim(),
//             country: r.country,
//             product: r.product,
//             hsn_code: r.hsn_code || '',
//             buyer_id: r.buyer_id,
//             templateUsed: 'Welcome Template',
//             contacts: r.contacts,
//           }))
//           .filter((recipient) => recipient.email)
//       );
//   };

//   const getLockedSelectedCount = () => {
//     return getSelectedBuyers().filter((r) => !r.email_revealed).length;
//   };

//   const totalPages = Math.ceil(totalCount / perPage);
//   const selectedCount = selected.size;

//   return (
//     <div className="min-h-screen bg-[#F5F6F8] p-1.5 sm:p-6">
//       <div className="max-w-full sm:max-w-7xl mx-auto px-0.5 sm:px-2">
//         {/* Header - Responsive */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-6">
//           <div className="space-y-0.5">
//             <h1 className="text-lg sm:text-2xl font-semibold text-slate-900">
//               Search Buyers
//             </h1>
//             <p className="text-[10px] sm:text-sm text-slate-500 flex items-center gap-1.5">
//               <Users className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
//               <span className="hidden sm:inline">Find and connect with potential buyers worldwide</span>
//               <span className="sm:hidden">Find buyers worldwide</span>
//             </p>
//           </div>
//           <Button
//             onClick={async () => {
//               const selectedBuyers = getSelectedBuyers();
//               const lockedCount = selectedBuyers.filter((r) => !r.email_revealed).length;
//               const revealedCount = selectedBuyers.length - lockedCount;

//               if (revealedCount === 0) {
//                 toast.error(
//                   lockedCount === 1
//                     ? 'This buyer\'s email is locked. Reveal it first to send an email.'
//                     : 'All selected buyers have locked emails. Reveal at least one to send an email.'
//                 );
//                 return;
//               }

//               if (lockedCount > 0) {
//                 toast.warning(
//                   `${lockedCount} selected buyer${lockedCount > 1 ? 's have' : ' has'} a locked email and will be skipped.`
//                 );
//               }

//               const ok = await checkEmailConfig();
//               if (!ok) return;

//               setEmailOpen(true);
//               createActivityLog(6, 3, 'Opened email modal', {
//                 selected_count: selected.size,
//                 revealed_count: revealedCount,
//                 locked_skipped: lockedCount,
//               });
//             }}
//             disabled={selectedCount === 0}
//             className="gap-1 sm:gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4 rounded-xl"
//           >
//             <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//             <span>Send Email</span>
//             {selectedCount > 0 && (
//               <span className="bg-white/20 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold">
//                 {selectedCount}
//               </span>
//             )}
//           </Button>
//         </div>

//         {/* Search and Filters - Responsive */}
//         <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-1.5 sm:p-3 mb-2.5 sm:mb-5">
//           <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-3 items-stretch sm:items-center">
//             <div className="relative flex-1 min-w-[120px] sm:min-w-[200px]">
//               <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
//               <Input
//                 placeholder="Search HSN, Company, Product, Country..."
//                 value={query}
//                 onChange={handleSearchChange}
//                 onKeyDown={handleSearchKeyDown}
//                 className="pl-8 sm:pl-10 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 rounded-lg sm:rounded-xl bg-white w-full h-8 sm:h-10 text-[11px] sm:text-sm"
//               />
//             </div>

//             <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
//               <div className="relative w-full sm:w-36 lg:w-44">
//                 <Select value={countryFilter} onValueChange={handleCountryFilter}>
//                   <SelectTrigger className="w-full border-slate-200 focus:border-slate-400 rounded-lg sm:rounded-xl bg-white h-8 sm:h-10 text-[11px] sm:text-sm">
//                     <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-slate-400 shrink-0" />
//                     <SelectValue placeholder="Country" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Countries</SelectItem>
//                     {countries.map((c) => (
//                       <SelectItem
//                         key={c.country}
//                         value={c.country}
//                         onClick={() => handleCountryDropdown(c.country)}
//                       >
//                         {c.country}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="relative w-full sm:w-36 lg:w-44">
//                 <Select value={productFilter} onValueChange={handleProductFilter}>
//                   <SelectTrigger className="w-full border-slate-200 focus:border-slate-400 rounded-lg sm:rounded-xl bg-white h-8 sm:h-10 text-[11px] sm:text-sm">
//                     <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-slate-400 shrink-0" />
//                     <SelectValue placeholder="Product" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Products</SelectItem>
//                     {products.map((p) => (
//                       <SelectItem
//                         key={p.product}
//                         value={p.product}
//                         onClick={() => handleProductDropdown(p.product)}
//                       >
//                         {p.product}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Stats and Pagination - Responsive */}
//         <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-3 mb-2.5 sm:mb-4">
//           <div className="flex flex-wrap items-center gap-1 sm:gap-4 text-[10px] sm:text-sm">
//             <span className="text-slate-500">
//               Showing <span className="font-semibold text-slate-800">{rows.length}</span> of{' '}
//               <span className="font-semibold text-slate-800">{totalCount}</span> buyers
//             </span>
//             {selectedCount > 0 && (
//               <span className="inline-flex items-center gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 bg-slate-100 text-slate-700 rounded-full text-[9px] sm:text-xs font-medium">
//                 <Checkbox checked className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
//                 {selectedCount} selected
//               </span>
//             )}
//           </div>
//           <div className="flex items-center gap-1 sm:gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               disabled={page === 0}
//               onClick={() => setPage((p) => p - 1)}
//               className="hover:bg-slate-50 transition-colors h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg"
//             >
//               <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//             </Button>
//             <div className="px-1.5 sm:px-4 py-1 bg-white rounded-lg border border-slate-200 text-[10px] sm:text-sm font-medium whitespace-nowrap">
//               Page <span className="text-slate-900">{page + 1}</span> / {totalPages || 1}
//             </div>
//             <Button
//               variant="outline"
//               size="sm"
//               disabled={page + 1 >= totalPages}
//               onClick={() => setPage((p) => p + 1)}
//               className="hover:bg-slate-50 transition-colors h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg"
//             >
//               <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//             </Button>
//           </div>
//         </div>

//         {/* Row list - each buyer is its own rounded pill card */}
//         {loading ? (
//           <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center h-48 sm:h-64 gap-3 sm:gap-4">
//             <Loader2 className="h-9 w-9 sm:h-11 sm:w-11 animate-spin text-slate-400" />
//             <p className="text-xs sm:text-sm text-slate-400">Loading buyers...</p>
//           </div>
//         ) : rows.length === 0 ? (
//           <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center h-48 sm:h-64 gap-2 sm:gap-3 px-4">
//             <div className="p-3 sm:p-4 bg-slate-50 rounded-full">
//               <Search className="h-8 w-8 sm:h-10 sm:w-10 text-slate-300" />
//             </div>
//             <p className="text-sm sm:text-base text-slate-600 font-medium">No buyers found</p>
//             <p className="text-[10px] sm:text-sm text-slate-400 text-center">Try adjusting your filters or search terms</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <div className="min-w-[900px] flex flex-col gap-2 sm:gap-2.5">
//               {/* Column labels */}
//               <div className="grid grid-cols-[32px_1.6fr_0.8fr_1fr_1.2fr_0.9fr_0.9fr_0.9fr_1fr] items-center gap-2 sm:gap-3 px-3 sm:px-5 text-[10px] sm:text-xs font-medium text-slate-400">
//                 <Checkbox
//                   checked={selected.size === rows.length && rows.length > 0}
//                   onCheckedChange={selectAll}
//                   className="data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
//                 />
//                 <span>Buyer</span>
//                 <span>Country</span>
//                 <span>Contact</span>
//                 <span>Email</span>
//                 <span>Status</span>
//                 <span>Date</span>
//                 <span>HSN</span>
//                 <span className="text-right pr-2">Actions</span>
//               </div>

//               {rows.map((r) => {
//                 const state = getRevealState(r);
//                 return (
//                   <div
//                     key={r.buyer_id}
//                     className={`grid grid-cols-[32px_1.6fr_0.8fr_1fr_1.2fr_0.9fr_0.9fr_0.9fr_1fr] items-center gap-2 sm:gap-3 bg-white rounded-2xl shadow-sm border ${
//                       selected.has(r.buyer_id) ? 'border-slate-300' : 'border-slate-100'
//                     } px-3 sm:px-5 py-2.5 sm:py-3.5 hover:shadow-md transition-shadow`}
//                   >
//                     <Checkbox
//                       checked={selected.has(r.buyer_id)}
//                       onCheckedChange={() => toggleSelect(r.buyer_id)}
//                       className="data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
//                     />

//                     {/* Buyer: avatar + company + product */}
//                     <div className="flex items-center gap-2 sm:gap-3 min-w-0">
//                       <CompanyAvatar name={r.company_name} />
//                       <div className="min-w-0">
//                         <button
//                           onClick={() => {
//                             setDetailBuyer(r);
//                             createActivityLog(7, 3, `Viewed buyer details: ${r.company_name}`, {
//                               buyer_id: r.buyer_id,
//                               company_name: r.company_name,
//                               hsn_code: r.hsn_code
//                             });
//                           }}
//                           className="font-semibold text-slate-900 text-[11px] sm:text-sm truncate text-left hover:underline block"
//                           title={r.company_name}
//                         >
//                           {r.company_name}
//                         </button>
//                         <span className="text-[9px] sm:text-xs text-slate-400 truncate block" title={r.product}>
//                           {r.product}
//                         </span>
//                       </div>
//                     </div>

//                     {/* Country */}
//                     <span className="text-[10px] sm:text-sm text-slate-600 truncate" title={r.country}>
//                       {r.country}
//                     </span>

//                     {/* Contact */}
//                     <div className="min-w-0">
//                       {r.phone_revealed ? (
//                         <div className="flex items-center gap-1 min-w-0">
//                           <span className="text-slate-600 text-[10px] sm:text-sm truncate" title={r.contacts}>
//                             {r.contacts}
//                           </span>
//                           <CopyButton
//                             value={r.contacts}
//                             type="phone"
//                             buyerId={r.buyer_id}
//                             companyName={r.company_name}
//                           />
//                         </div>
//                       ) : (
//                         <button
//                           onClick={() => revealContact(r.buyer_id, "phone")}
//                           disabled={revealingId === r.buyer_id}
//                           className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 hover:text-slate-700 transition-colors whitespace-nowrap"
//                         >
//                           {revealingId === r.buyer_id ? (
//                             <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
//                           ) : (
//                             <>
//                               <Lock className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
//                               <span>Locked</span>
//                             </>
//                           )}
//                         </button>
//                       )}
//                     </div>

//                     {/* Email */}
//                     <div className="min-w-0">
//                       {r.email_revealed ? (
//                         <div className="flex items-center gap-1 min-w-0">
//                           <span className="text-slate-600 text-[10px] sm:text-sm truncate" title={r.emails}>
//                             {r.emails}
//                           </span>
//                           <CopyButton
//                             value={r.emails}
//                             type="email"
//                             buyerId={r.buyer_id}
//                             companyName={r.company_name}
//                           />
//                         </div>
//                       ) : (
//                         <button
//                           onClick={() => revealContact(r.buyer_id, "email")}
//                           disabled={revealingId === r.buyer_id}
//                           className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 hover:text-slate-700 transition-colors whitespace-nowrap"
//                         >
//                           {revealingId === r.buyer_id ? (
//                             <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
//                           ) : (
//                             <>
//                               <Lock className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
//                               <span>Locked</span>
//                             </>
//                           )}
//                         </button>
//                       )}
//                     </div>

//                     {/* Status pill */}
//                     <div>
//                       <StatusPill state={state} />
//                     </div>

//                     {/* Date */}
//                     <span className="text-[10px] sm:text-xs text-slate-400 whitespace-nowrap">
//                       {r.buyer_date
//                         ? new Date(r.buyer_date).toLocaleDateString('en-GB').replace(/\//g, '-')
//                         : '—'}
//                     </span>

//                     {/* HSN chip, styled like a balance/amount tag */}
//                     <div>
//                       <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[9px] sm:text-xs font-medium text-slate-700 whitespace-nowrap">
//                         <Hash className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-400" />
//                         {r.hsn_code}
//                       </span>
//                     </div>

//                     {/* Actions */}
//                     <div className="flex items-center justify-end gap-1 sm:gap-1.5">
//                       <button
//                         onClick={() => {
//                           setDetailBuyer(r);
//                           createActivityLog(7, 3, `Viewed buyer details: ${r.company_name}`, {
//                             buyer_id: r.buyer_id,
//                             company_name: r.company_name,
//                             hsn_code: r.hsn_code
//                           });
//                         }}
//                         title="View details"
//                         className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
//                       >
//                         <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//                       </button>
//                       <button
//                         onClick={() => storeResponse(r, 'interested')}
//                         disabled={submittingId === r.buyer_id}
//                         title="Mark interested"
//                         className="p-1.5 sm:p-2 rounded-lg hover:bg-emerald-50 text-emerald-500 hover:text-emerald-700 transition-colors disabled:opacity-40"
//                       >
//                         {submittingId === r.buyer_id ? (
//                           <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
//                         ) : (
//                           <ThumbsUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//                         )}
//                       </button>
//                       <button
//                         onClick={() => storeResponse(r, 'not_interested')}
//                         disabled={submittingId === r.buyer_id}
//                         title="Mark not interested"
//                         className="p-1.5 sm:p-2 rounded-lg hover:bg-rose-50 text-rose-400 hover:text-rose-600 transition-colors disabled:opacity-40"
//                       >
//                         {submittingId === r.buyer_id ? (
//                           <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
//                         ) : (
//                           <ThumbsDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* Bottom Pagination - Responsive */}
//         {rows.length > 0 && (
//           <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 mt-3 sm:mt-5 text-[10px] sm:text-sm text-slate-500">
//             <span>
//               Showing {page * perPage + 1} - {Math.min((page + 1) * perPage, totalCount)} of {totalCount}
//             </span>
//             <div className="flex items-center gap-1.5 sm:gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 disabled={page === 0}
//                 onClick={() => setPage((p) => p - 1)}
//                 className="h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg"
//               >
//                 <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//               </Button>
//               <div className="px-1.5 sm:px-3 py-1 bg-white rounded-lg border border-slate-200 text-[10px] sm:text-xs font-medium">
//                 {page + 1} / {totalPages || 1}
//               </div>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 disabled={page + 1 >= totalPages}
//                 onClick={() => setPage((p) => p + 1)}
//                 className="h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg"
//               >
//                 <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>

//       <BuyerDetailModal buyer={detailBuyer} onClose={() => setDetailBuyer(null)} />

//       <EmailModal
//         open={emailOpen}
//         recipients={getRecipients()}
//         product={getProductToSend()}
//         multipleProducts={isMultipleProductsSelected()}
//         onClose={() => setEmailOpen(false)}
//       />

//       <EmailConfigModal
//         open={modalOpen}
//         message={modalMessage}
//         onClose={() => setModalOpen(false)}
//       />
//     </div>
//   );
// }



// import { useState, useEffect, useRef } from 'react';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   Search, Loader2, ChevronLeft, ChevronRight, Mail, X,
//   ThumbsUp, ThumbsDown, Users, Building2, Globe,
//   Package, Hash, Filter, ArrowUpDown,
//   Send, User, MapPin, AtSign, Phone, Lock,
//   Copy, Check, Eye
// } from 'lucide-react';
// import EmailModal from '@/components/EmailModal';
// import { toast } from 'sonner';
// import { ACTIVITY_URL, API_URL } from '@/components/api';
// import { useEmailConfigCheck } from '@/hooks/Emailconfigcheck';
// import EmailConfigModal from '@/components/EmailcheckModal';

// const API = API_URL;

// interface Buyer {
//   buyer_id: number;
//   buyer_date: string;
//   product: string;
//   hsn_code: string;
//   country: string;
//   company_name: string;
//   website: string;
//   contacts: string;
//   emails: string;
//   phone_revealed: boolean;
//   email_revealed: boolean;
// }

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

// /* ---------- Small visual helpers (avatar + status pill) ---------- */

// const AVATAR_PALETTE = [
//   { bg: '#8EE147', fg: '#0E223B' }, // primary light on dark
//   { bg: '#0E223B', fg: '#FFFFFF' }, // primary dark on white
//   { bg: '#6EC035', fg: '#0E223B' }, // success dark
//   { bg: '#1A3355', fg: '#FFFFFF' }, // secondary dark
//   { bg: '#A8E86A', fg: '#0E223B' }, // success light
//   { bg: '#2A4A6B', fg: '#FFFFFF' }, // secondary medium
//   { bg: '#8EE147', fg: '#0E223B' }, // primary light
//   { bg: '#3A6080', fg: '#FFFFFF' }, // secondary light
// ];

// function hashString(s: string) {
//   let h = 0;
//   for (let i = 0; i < s.length; i++) {
//     h = (h << 5) - h + s.charCodeAt(i);
//     h |= 0;
//   }
//   return Math.abs(h);
// }

// function CompanyAvatar({ name }: { name: string }) {
//   const safe = name || '?';
//   const palette = AVATAR_PALETTE[hashString(safe) % AVATAR_PALETTE.length];
//   const initial = safe.trim().charAt(0).toUpperCase();
//   return (
//     <div
//       className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl flex items-center justify-center font-semibold text-sm sm:text-base"
//       style={{ backgroundColor: palette.bg, color: palette.fg }}
//       aria-hidden
//     >
//       {initial}
//     </div>
//   );
// }

// type RevealState = 'full' | 'partial' | 'locked';

// function getRevealState(buyer: Buyer): RevealState {
//   if (buyer.email_revealed && buyer.phone_revealed) return 'full';
//   if (buyer.email_revealed || buyer.phone_revealed) return 'partial';
//   return 'locked';
// }

// const REVEAL_STYLES: Record<RevealState, { label: string; className: string }> = {
//   full: { label: 'Revealed', className: 'bg-[#8EE147] text-[#0E223B]' },
//   partial: { label: 'Partial', className: 'bg-amber-50 text-amber-700' },
//   locked: { label: 'Locked', className: 'bg-slate-100 text-slate-500' },
// };

// function StatusPill({ state }: { state: RevealState }) {
//   const s = REVEAL_STYLES[state];
//   return (
//     <span className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium ${s.className}`}>
//       {s.label}
//     </span>
//   );
// }

// /* -------------------------------------------------------------- */

// /* Buyer Detail Modal */
// function BuyerDetailModal({
//   buyer,
//   onClose,
// }: {
//   buyer: Buyer | null;
//   onClose: () => void;
// }) {
//   if (!buyer) return null;

//   const fields: { label: string; value: string; icon: React.ReactNode }[] = [
//     { label: 'Company Name', value: buyer.company_name, icon: <Building2 className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     { label: 'Product', value: buyer.product, icon: <Package className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     { label: 'HSN Code', value: buyer.hsn_code, icon: <Hash className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     { label: 'Country', value: buyer.country, icon: <Globe className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     { label: 'Website', value: buyer.website, icon: <Globe className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     { label: 'Contacts', value: buyer.contacts, icon: <User className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     { label: 'Emails', value: buyer.emails, icon: <AtSign className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     {
//       label: 'Date',
//       value: buyer.buyer_date
//         ? new Date(buyer.buyer_date).toLocaleDateString('en-GB').replace(/\//g, '-')
//         : '',
//       icon: <Calendar className="h-4 w-4" style={{ color: '#8EE147' }} />,
//     },
//   ];

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-2 sm:p-4"
//       onClick={onClose}
//     >
//       <div
//         className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-2 sm:mx-4 overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="relative px-4 sm:px-6 py-4 sm:py-5" style={{ backgroundColor: '#0E223B' }}>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <CompanyAvatar name={buyer.company_name} />
//               <div>
//                 <div className="text-slate-400 text-[10px] font-medium mb-0.5">
//                   HSN {buyer.hsn_code}
//                 </div>
//                 <h2 className="text-lg sm:text-xl font-semibold text-white">{buyer.company_name}</h2>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               className="rounded-lg p-2 bg-white/10 hover:bg-white/20 transition-colors text-white"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>
//         </div>

//         <div className="p-4 sm:p-6 space-y-4">
//           {fields.map(({ label, value, icon }) =>
//             value ? (
//               <div key={label} className="flex items-start gap-3 group">
//                 <div className="mt-0.5 text-slate-400 group-hover:text-slate-600 transition-colors">
//                   {icon}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <span className="text-xs font-medium text-slate-400 block mb-0.5">
//                     {label}
//                   </span>
//                   {label === 'Website' ? (
//                     <a
//                       href={value.startsWith('http') ? value : `https://${value}`}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="text-sm text-[#8EE147] hover:text-[#6EC035] underline hover:no-underline transition-colors break-all"
//                     >
//                       {value}
//                     </a>
//                   ) : (
//                     <span className="text-sm text-slate-800 break-all font-medium">
//                       {value}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             ) : null
//           )}
//         </div>

//         <div className="px-4 sm:px-6 py-4 bg-slate-50 border-t flex justify-end">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={onClose}
//             className="hover:bg-slate-100 transition-colors"
//             style={{ borderColor: '#0E223B', color: '#0E223B' }}
//           >
//             Close
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// const Calendar = ({ className }: { className?: string }) => (
//   <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//   </svg>
// );

// function CopyButton({ value, type, buyerId, companyName }: {
//   value: string;
//   type: 'phone' | 'email';
//   buyerId?: number;
//   companyName?: string;
// }) {
//   const [copied, setCopied] = useState(false);

//   const handleCopy = async (e: React.MouseEvent) => {
//     e.stopPropagation();
//     try {
//       await navigator.clipboard.writeText(value);
//       setCopied(true);

//       const actionId = type === 'email' ? 48 : 49;
//       const actionName = type === 'email' ? 'Email' : 'Phone Number';

//       await createActivityLog(
//         actionId,
//         1,
//         `Copied ${actionName}: ${value}${companyName ? ` (${companyName})` : ''}`,
//         {
//           copyType: type,
//           copiedValue: value,
//           buyer_id: buyerId,
//           company_name: companyName
//         }
//       );

//       toast.success(`Copied to clipboard`);
//       setTimeout(() => setCopied(false), 1500);
//     } catch (err) {
//       console.error('Copy failed:', err);
//       toast.error('Failed to copy');
//     }
//   };

//   return (
//     <button
//       onClick={handleCopy}
//       className="shrink-0 p-1 rounded hover:bg-slate-100 transition-colors"
//       title={`Copy ${type === 'email' ? 'email' : 'phone'}`}
//     >
//       {copied ? 
//         <Check className="h-3.5 w-3.5" style={{ color: '#8EE147' }} /> : 
//         <Copy className="h-3.5 w-3.5" style={{ color: '#94A3B8' }} />
//       }
//     </button>
//   );
// }

// export default function SearchPage() {
//   const [rows, setRows] = useState<Buyer[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [query, setQuery] = useState('');
//   const [countries, setCountries] = useState<any[]>([]);
//   const [countryFilter, setCountryFilter] = useState('all');
//   const [productFilter, setProductFilter] = useState('all');
//   const [products, setProducts] = useState<any[]>([]);
//   const [page, setPage] = useState(0);
//   const [totalCount, setTotalCount] = useState(0);
//   const [selected, setSelected] = useState<Set<number>>(new Set());
//   const [emailOpen, setEmailOpen] = useState(false);
//   const [detailBuyer, setDetailBuyer] = useState<Buyer | null>(null);
//   const [submittingId, setSubmittingId] = useState<number | null>(null);
//   const [revealingId, setRevealingId] = useState<number | null>(null);

//   const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   const revealContact = async (buyerId: number, type: 'phone' | 'email') => {
//     setRevealingId(buyerId);
//     try {
//       const seller = JSON.parse(localStorage.getItem("seller") || "{}");
//       const res = await fetch(`${API}/buyers/${buyerId}/reveal-contact`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ seller_id: seller.id, reveal_type: type }),
//       });
//       const json = await res.json();

//       if (json.success) {
//         const buyer = rows.find(r => r.buyer_id === buyerId);

//         setRows((prev) =>
//           prev.map((r) =>
//             r.buyer_id === buyerId
//               ? {
//                   ...r,
//                   contacts: type === 'phone' ? json.data.contacts : r.contacts,
//                   emails: type === 'email' ? json.data.emails : r.emails,
//                   phone_revealed: type === 'phone' ? true : r.phone_revealed,
//                   email_revealed: type === 'email' ? true : r.email_revealed,
//                 }
//               : r
//           )
//         );

//         if (type === 'phone') {
//           await createActivityLog(40, 1, `Revealed phone for: ${buyer?.company_name}`, {
//             buyer_id: buyerId,
//             company_name: buyer?.company_name,
//             phone: json.data.contacts
//           });
//         } else {
//           await createActivityLog(41, 1, `Revealed email for: ${buyer?.company_name}`, {
//             buyer_id: buyerId,
//             company_name: buyer?.company_name,
//             email: json.data.emails
//           });
//         }

//         toast.success(`${type === 'phone' ? 'Phone' : 'Email'} revealed!`);
//       } else {
//         toast.error(json.message || `Failed to reveal ${type}`);
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error(`Failed to reveal ${type}`);
//     } finally {
//       setRevealingId(null);
//     }
//   };

//   const perPage = 50;
//   const { checkEmailConfig, modalOpen, modalMessage, setModalOpen } = useEmailConfigCheck();

//   useEffect(() => {
//     loadFilters();
//     createActivityLog(16, 1, 'Viewed search page');
//     return () => {
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current);
//       }
//     };
//   }, []);

//   const loadFilters = async () => {
//     try {
//       const [countryRes, productRes] = await Promise.all([
//         fetch(`${API}/filters/buyer-countries`),
//         fetch(`${API}/filters/products`),
//       ]);
//       setCountries(await countryRes.json());
//       setProducts(await productRes.json());
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [page, query, countryFilter, productFilter]);

//   const seller = JSON.parse(localStorage.getItem("seller") || "{}");

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const params = new URLSearchParams();
//       params.set("seller_id", seller.id);
//       params.set('limit', String(perPage));
//       params.set('offset', String(page * perPage));
//       if (query) params.set('search', query);
//       if (countryFilter !== 'all') params.set('country', countryFilter);
//       if (productFilter !== 'all') params.set('product', productFilter);
//       const res = await fetch(`${API}/buyers?${params.toString()}`);
//       const json = await res.json();
//       setRows(json.data || []);
//       setTotalCount(json.total || 0);
//     } catch (err) {
//       console.error(err);
//       toast.error('Failed to fetch buyers');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logSearch = (searchValue: string) => {
//     if (!searchValue || searchValue.length < 2) return;

//     let actionId = 42;
//     let searchType = 'HSN';
//     const lowerValue = searchValue.toLowerCase();

//     const companyMatch = rows.some(r => r.company_name?.toLowerCase().includes(lowerValue));
//     const productMatch = rows.some(r => r.product?.toLowerCase().includes(lowerValue));
//     const countryMatch = rows.some(r => r.country?.toLowerCase().includes(lowerValue));

//     if (companyMatch) {
//       actionId = 43;
//       searchType = 'Company';
//     } else if (productMatch) {
//       actionId = 44;
//       searchType = 'Product';
//     } else if (countryMatch) {
//       actionId = 45;
//       searchType = 'Country';
//     }

//     createActivityLog(actionId, 1, `Searched by ${searchType}: ${searchValue}`, {
//       searchType: searchType,
//       searchValue: searchValue
//     });
//   };

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

//   const handleCountryFilter = (value: string) => {
//     setPage(0);
//     setCountryFilter(value);
//     if (value !== 'all') {
//       createActivityLog(45, 1, `Filtered by country: ${value}`, {
//         filterType: 'country',
//         filterValue: value
//       });
//     }
//   };

//   const handleProductFilter = (value: string) => {
//     setPage(0);
//     setProductFilter(value);
//     if (value !== 'all') {
//       createActivityLog(44, 1, `Filtered by product: ${value}`, {
//         filterType: 'product',
//         filterValue: value
//       });
//     }
//   };

//   const handleCountryDropdown = (value: string) => {
//     createActivityLog(46, 1, `Selected country from dropdown: ${value}`, {
//       dropdownType: 'countries',
//       selectedValue: value
//     });
//   };

//   const handleProductDropdown = (value: string) => {
//     createActivityLog(47, 1, `Selected product from dropdown: ${value}`, {
//       dropdownType: 'products',
//       selectedValue: value
//     });
//   };

//   const toggleSelect = (buyerId: number) => {
//     setSelected((prev) => {
//       const next = new Set(prev);
//       if (next.has(buyerId)) next.delete(buyerId);
//       else next.add(buyerId);
//       return next;
//     });
//   };

//   const selectAll = () => {
//     if (selected.size === rows.length) {
//       setSelected(new Set());
//     } else {
//       setSelected(new Set(rows.map((r) => r.buyer_id)));
//     }
//   };

//   const storeResponse = async (buyer: Buyer, responseType: 'interested' | 'not_interested') => {
//     if (!buyer.email_revealed) {
//       toast.error('Please reveal email first.');
//       return;
//     }
//     if (!buyer.phone_revealed) {
//       toast.error('Please reveal phone first.');
//       return;
//     }
//     setSubmittingId(buyer.buyer_id);

//     try {
//       const firstEmail = buyer.emails?.split(',')[0]?.trim();
//       if (!firstEmail) {
//         toast.error('No email found');
//         return;
//       }

//       const seller = JSON.parse(localStorage.getItem("seller") || "{}");
//       const payload = {
//         email: firstEmail,
//         response: responseType,
//         companyName: buyer.company_name,
//         country: buyer.country,
//         contactName: buyer.contacts || buyer.company_name,
//         productName: buyer.product,
//         templateUsed: 'Manual Entry',
//         buyer_id: buyer.buyer_id,
//         seller_id: seller.id || null,
//         hsn_code: buyer.hsn_code || ''
//       };

//       const response = await fetch(`${API}/api/store-response`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();

//       if (data.success) {
//         toast.success(`${responseType === 'interested' ? '✓ Interested' : '✗ Not Interested'} recorded!`);

//         const actionId = responseType === 'interested' ? 6 : 7;
//         await createActivityLog(actionId, 1,
//           `${responseType === 'interested' ? 'Interested' : 'Not Interested'}: ${buyer.company_name}`,
//           {
//             buyer_id: buyer.buyer_id,
//             company_name: buyer.company_name,
//             email: buyer.emails,
//             product: buyer.product,
//             hsn_code: buyer.hsn_code,
//             response: responseType
//           }
//         );
//       } else {
//         toast.error(data.error || 'Failed to record response');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       toast.error('Failed to record response');
//     } finally {
//       setSubmittingId(null);
//     }
//   };

//   const getSelectedBuyers = () => rows.filter(r => selected.has(r.buyer_id));

//   const getUniqueProducts = () => {
//     const selectedBuyers = getSelectedBuyers();
//     return [...new Set(selectedBuyers.map(b => b.product).filter(Boolean))];
//   };

//   const getProductToSend = () => {
//     const uniqueProducts = getUniqueProducts();
//     if (uniqueProducts.length === 0 || uniqueProducts.length > 1) {
//       return "General Products";
//     }
//     return uniqueProducts[0];
//   };

//   const isMultipleProductsSelected = () => {
//     const selectedBuyers = getSelectedBuyers();
//     const uniqueProducts = [...new Set(selectedBuyers.map(b => b.product).filter(Boolean))];
//     return uniqueProducts.length > 1;
//   };

//   const getRecipients = () => {
//     return getSelectedBuyers()
//       .filter((r) => r.email_revealed)
//       .flatMap((r) =>
//         (r.emails || '')
//           .split(',')
//           .map((email) => ({
//             name: r.company_name,
//             company: r.company_name,
//             company_name: r.company_name,
//             email: email.trim(),
//             country: r.country,
//             product: r.product,
//             hsn_code: r.hsn_code || '',
//             buyer_id: r.buyer_id,
//             templateUsed: 'Welcome Template',
//             contacts: r.contacts,
//           }))
//           .filter((recipient) => recipient.email)
//       );
//   };

//   const getLockedSelectedCount = () => {
//     return getSelectedBuyers().filter((r) => !r.email_revealed).length;
//   };

//   const totalPages = Math.ceil(totalCount / perPage);
//   const selectedCount = selected.size;

//   return (
//     <div className="min-h-screen p-1.5 sm:p-6" style={{ backgroundColor: '#0E223B' }}>
//       <div className="max-w-full sm:max-w-7xl mx-auto px-0.5 sm:px-2">
//         {/* Header - Responsive */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-6">
//           <div className="space-y-0.5">
//             <h1 className="text-lg sm:text-2xl font-semibold text-white">
//               Search Buyers
//             </h1>
//             <p className="text-[10px] sm:text-sm text-slate-300 flex items-center gap-1.5">
//               <Users className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" style={{ color: '#8EE147' }} />
//               <span className="hidden sm:inline">Find and connect with potential buyers worldwide</span>
//               <span className="sm:hidden">Find buyers worldwide</span>
//             </p>
//           </div>
//           <Button
//             onClick={async () => {
//               const selectedBuyers = getSelectedBuyers();
//               const lockedCount = selectedBuyers.filter((r) => !r.email_revealed).length;
//               const revealedCount = selectedBuyers.length - lockedCount;

//               if (revealedCount === 0) {
//                 toast.error(
//                   lockedCount === 1
//                     ? 'This buyer\'s email is locked. Reveal it first to send an email.'
//                     : 'All selected buyers have locked emails. Reveal at least one to send an email.'
//                 );
//                 return;
//               }

//               if (lockedCount > 0) {
//                 toast.warning(
//                   `${lockedCount} selected buyer${lockedCount > 1 ? 's have' : ' has'} a locked email and will be skipped.`
//                 );
//               }

//               const ok = await checkEmailConfig();
//               if (!ok) return;

//               setEmailOpen(true);
//               createActivityLog(6, 3, 'Opened email modal', {
//                 selected_count: selected.size,
//                 revealed_count: revealedCount,
//                 locked_skipped: lockedCount,
//               });
//             }}
//             disabled={selectedCount === 0}
//             className="gap-1 sm:gap-2 text-[#0E223B] font-medium shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4 rounded-xl"
//             style={{ backgroundColor: '#8EE147' }}
//           >
//             <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//             <span>Send Email</span>
//             {selectedCount > 0 && (
//               <span className="bg-[#0E223B]/20 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold">
//                 {selectedCount}
//               </span>
//             )}
//           </Button>
//         </div>

//         {/* Search and Filters - Responsive */}
//         <div className="bg-white rounded-2xl shadow-sm p-1.5 sm:p-3 mb-2.5 sm:mb-5" style={{ borderColor: '#E2E8F0', borderWidth: '1px' }}>
//           <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-3 items-stretch sm:items-center">
//             <div className="relative flex-1 min-w-[120px] sm:min-w-[200px]">
//               <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: '#8EE147' }} />
//               <Input
//                 placeholder="Search HSN, Company, Product, Country..."
//                 value={query}
//                 onChange={handleSearchChange}
//                 onKeyDown={handleSearchKeyDown}
//                 className="pl-8 sm:pl-10 border-slate-200 focus:border-[#8EE147] focus:ring-[#8EE147]/20 rounded-lg sm:rounded-xl bg-white w-full h-8 sm:h-10 text-[11px] sm:text-sm"
//               />
//             </div>

//             <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
//               <div className="relative w-full sm:w-36 lg:w-44">
//                 <Select value={countryFilter} onValueChange={handleCountryFilter}>
//                   <SelectTrigger className="w-full border-slate-200 focus:border-[#8EE147] rounded-lg sm:rounded-xl bg-white h-8 sm:h-10 text-[11px] sm:text-sm">
//                     <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" style={{ color: '#8EE147' }} />
//                     <SelectValue placeholder="Country" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Countries</SelectItem>
//                     {countries.map((c) => (
//                       <SelectItem
//                         key={c.country}
//                         value={c.country}
//                         onClick={() => handleCountryDropdown(c.country)}
//                       >
//                         {c.country}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="relative w-full sm:w-36 lg:w-44">
//                 <Select value={productFilter} onValueChange={handleProductFilter}>
//                   <SelectTrigger className="w-full border-slate-200 focus:border-[#8EE147] rounded-lg sm:rounded-xl bg-white h-8 sm:h-10 text-[11px] sm:text-sm">
//                     <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" style={{ color: '#8EE147' }} />
//                     <SelectValue placeholder="Product" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Products</SelectItem>
//                     {products.map((p) => (
//                       <SelectItem
//                         key={p.product}
//                         value={p.product}
//                         onClick={() => handleProductDropdown(p.product)}
//                       >
//                         {p.product}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Stats and Pagination - Responsive */}
//         <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-3 mb-2.5 sm:mb-4">
//           <div className="flex flex-wrap items-center gap-1 sm:gap-4 text-[10px] sm:text-sm">
//             <span className="text-slate-300">
//               Showing <span className="font-semibold text-white">{rows.length}</span> of{' '}
//               <span className="font-semibold text-white">{totalCount}</span> buyers
//             </span>
//             {selectedCount > 0 && (
//               <span className="inline-flex items-center gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 bg-[#8EE147] text-[#0E223B] rounded-full text-[9px] sm:text-xs font-medium">
//                 <Checkbox checked className="h-2.5 w-2.5 sm:h-3 sm:w-3" style={{ backgroundColor: '#0E223B', borderColor: '#0E223B' }} />
//                 {selectedCount} selected
//               </span>
//             )}
//           </div>
//           <div className="flex items-center gap-1 sm:gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               disabled={page === 0}
//               onClick={() => setPage((p) => p - 1)}
//               className="hover:bg-white/10 transition-colors h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg text-white border-white/20"
//               style={{ borderColor: 'rgba(255,255,255,0.2)' }}
//             >
//               <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//             </Button>
//             <div className="px-1.5 sm:px-4 py-1 bg-white/10 rounded-lg border border-white/20 text-[10px] sm:text-sm font-medium whitespace-nowrap text-white">
//               Page <span className="text-white">{page + 1}</span> / {totalPages || 1}
//             </div>
//             <Button
//               variant="outline"
//               size="sm"
//               disabled={page + 1 >= totalPages}
//               onClick={() => setPage((p) => p + 1)}
//               className="hover:bg-white/10 transition-colors h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg text-white border-white/20"
//               style={{ borderColor: 'rgba(255,255,255,0.2)' }}
//             >
//               <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//             </Button>
//           </div>
//         </div>

//         {/* Row list - each buyer is its own rounded pill card */}
//         {loading ? (
//           <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col items-center justify-center h-48 sm:h-64 gap-3 sm:gap-4">
//             <Loader2 className="h-9 w-9 sm:h-11 sm:w-11 animate-spin" style={{ color: '#8EE147' }} />
//             <p className="text-xs sm:text-sm text-slate-400">Loading buyers...</p>
//           </div>
//         ) : rows.length === 0 ? (
//           <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col items-center justify-center h-48 sm:h-64 gap-2 sm:gap-3 px-4">
//             <div className="p-3 sm:p-4 bg-[#8EE147]/10 rounded-full">
//               <Search className="h-8 w-8 sm:h-10 sm:w-10" style={{ color: '#8EE147' }} />
//             </div>
//             <p className="text-sm sm:text-base font-medium text-white">No buyers found</p>
//             <p className="text-[10px] sm:text-sm text-slate-400 text-center">Try adjusting your filters or search terms</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <div className="min-w-[900px] flex flex-col gap-2 sm:gap-2.5">
//               {/* Column labels */}
//               <div className="grid grid-cols-[32px_1.6fr_0.8fr_1fr_1.2fr_0.9fr_0.9fr_0.9fr_1fr] items-center gap-2 sm:gap-3 px-3 sm:px-5 text-[10px] sm:text-xs font-medium text-slate-400">
//                 <Checkbox
//                   checked={selected.size === rows.length && rows.length > 0}
//                   onCheckedChange={selectAll}
//                   className="data-[state=checked]:bg-[#8EE147] data-[state=checked]:border-[#8EE147]"
//                 />
//                 <span>Buyer</span>
//                 <span>Country</span>
//                 <span>Contact</span>
//                 <span>Email</span>
//                 <span>Status</span>
//                 <span>Date</span>
//                 <span>HSN</span>
//                 <span className="text-right pr-2">Actions</span>
//               </div>

//               {rows.map((r) => {
//                 const state = getRevealState(r);
//                 return (
//                   <div
//                     key={r.buyer_id}
//                     className={`grid grid-cols-[32px_1.6fr_0.8fr_1fr_1.2fr_0.9fr_0.9fr_0.9fr_1fr] items-center gap-2 sm:gap-3 bg-white rounded-2xl shadow-sm px-3 sm:px-5 py-2.5 sm:py-3.5 hover:shadow-md transition-shadow ${
//                       selected.has(r.buyer_id) ? 'border-2' : 'border'
//                     }`}
//                     style={{
//                       borderColor: selected.has(r.buyer_id) ? '#8EE147' : '#E2E8F0',
//                       backgroundColor: selected.has(r.buyer_id) ? '#F0F9E6' : '#FFFFFF'
//                     }}
//                   >
//                     <Checkbox
//                       checked={selected.has(r.buyer_id)}
//                       onCheckedChange={() => toggleSelect(r.buyer_id)}
//                       className="data-[state=checked]:bg-[#8EE147] data-[state=checked]:border-[#8EE147]"
//                     />

//                     {/* Buyer: avatar + company + product */}
//                     <div className="flex items-center gap-2 sm:gap-3 min-w-0">
//                       <CompanyAvatar name={r.company_name} />
//                       <div className="min-w-0">
//                         <button
//                           onClick={() => {
//                             setDetailBuyer(r);
//                             createActivityLog(7, 3, `Viewed buyer details: ${r.company_name}`, {
//                               buyer_id: r.buyer_id,
//                               company_name: r.company_name,
//                               hsn_code: r.hsn_code
//                             });
//                           }}
//                           className="font-semibold text-left hover:underline block"
//                           style={{ color: '#0E223B' }}
//                           title={r.company_name}
//                         >
//                           {r.company_name}
//                         </button>
//                         <span className="text-[9px] sm:text-xs text-slate-400 truncate block" title={r.product}>
//                           {r.product}
//                         </span>
//                       </div>
//                     </div>

//                     {/* Country */}
//                     <span className="text-[10px] sm:text-sm text-slate-600 truncate" title={r.country}>
//                       {r.country}
//                     </span>

//                     {/* Contact */}
//                     <div className="min-w-0">
//                       {r.phone_revealed ? (
//                         <div className="flex items-center gap-1 min-w-0">
//                           <span className="text-slate-600 text-[10px] sm:text-sm truncate" title={r.contacts}>
//                             {r.contacts}
//                           </span>
//                           <CopyButton
//                             value={r.contacts}
//                             type="phone"
//                             buyerId={r.buyer_id}
//                             companyName={r.company_name}
//                           />
//                         </div>
//                       ) : (
//                         <button
//                           onClick={() => revealContact(r.buyer_id, "phone")}
//                           disabled={revealingId === r.buyer_id}
//                           className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 hover:text-slate-700 transition-colors whitespace-nowrap"
//                         >
//                           {revealingId === r.buyer_id ? (
//                             <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" style={{ color: '#8EE147' }} />
//                           ) : (
//                             <>
//                               <Lock className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" style={{ color: '#8EE147' }} />
//                               <span>Locked</span>
//                             </>
//                           )}
//                         </button>
//                       )}
//                     </div>

//                     {/* Email */}
//                     <div className="min-w-0">
//                       {r.email_revealed ? (
//                         <div className="flex items-center gap-1 min-w-0">
//                           <span className="text-slate-600 text-[10px] sm:text-sm truncate" title={r.emails}>
//                             {r.emails}
//                           </span>
//                           <CopyButton
//                             value={r.emails}
//                             type="email"
//                             buyerId={r.buyer_id}
//                             companyName={r.company_name}
//                           />
//                         </div>
//                       ) : (
//                         <button
//                           onClick={() => revealContact(r.buyer_id, "email")}
//                           disabled={revealingId === r.buyer_id}
//                           className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 hover:text-slate-700 transition-colors whitespace-nowrap"
//                         >
//                           {revealingId === r.buyer_id ? (
//                             <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" style={{ color: '#8EE147' }} />
//                           ) : (
//                             <>
//                               <Lock className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" style={{ color: '#8EE147' }} />
//                               <span>Locked</span>
//                             </>
//                           )}
//                         </button>
//                       )}
//                     </div>

//                     {/* Status pill */}
//                     <div>
//                       <StatusPill state={state} />
//                     </div>

//                     {/* Date */}
//                     <span className="text-[10px] sm:text-xs text-slate-400 whitespace-nowrap">
//                       {r.buyer_date
//                         ? new Date(r.buyer_date).toLocaleDateString('en-GB').replace(/\//g, '-')
//                         : '—'}
//                     </span>

//                     {/* HSN chip */}
//                     <div>
//                       <span 
//                         className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg border text-[9px] sm:text-xs font-medium whitespace-nowrap"
//                         style={{
//                           backgroundColor: '#F0F9E6',
//                           borderColor: '#8EE147',
//                           color: '#0E223B'
//                         }}
//                       >
//                         <Hash className="h-2.5 w-2.5 sm:h-3 sm:w-3" style={{ color: '#8EE147' }} />
//                         {r.hsn_code}
//                       </span>
//                     </div>

//                     {/* Actions */}
//                     <div className="flex items-center justify-end gap-1 sm:gap-1.5">
//                       <button
//                         onClick={() => {
//                           setDetailBuyer(r);
//                           createActivityLog(7, 3, `Viewed buyer details: ${r.company_name}`, {
//                             buyer_id: r.buyer_id,
//                             company_name: r.company_name,
//                             hsn_code: r.hsn_code
//                           });
//                         }}
//                         title="View details"
//                         className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 transition-colors"
//                         style={{ color: '#94A3B8' }}
//                       >
//                         <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//                       </button>
//                       <button
//                         onClick={() => storeResponse(r, 'interested')}
//                         disabled={submittingId === r.buyer_id}
//                         title="Mark interested"
//                         className="p-1.5 sm:p-2 rounded-lg hover:bg-[#F0F9E6] transition-colors disabled:opacity-40"
//                         style={{ color: '#8EE147' }}
//                       >
//                         {submittingId === r.buyer_id ? (
//                           <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
//                         ) : (
//                           <ThumbsUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//                         )}
//                       </button>
//                       <button
//                         onClick={() => storeResponse(r, 'not_interested')}
//                         disabled={submittingId === r.buyer_id}
//                         title="Mark not interested"
//                         className="p-1.5 sm:p-2 rounded-lg hover:bg-rose-50 text-rose-400 hover:text-rose-600 transition-colors disabled:opacity-40"
//                       >
//                         {submittingId === r.buyer_id ? (
//                           <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
//                         ) : (
//                           <ThumbsDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* Bottom Pagination - Responsive */}
//         {rows.length > 0 && (
//           <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 mt-3 sm:mt-5 text-[10px] sm:text-sm text-slate-400">
//             <span>
//               Showing {page * perPage + 1} - {Math.min((page + 1) * perPage, totalCount)} of {totalCount}
//             </span>
//             <div className="flex items-center gap-1.5 sm:gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 disabled={page === 0}
//                 onClick={() => setPage((p) => p - 1)}
//                 className="h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg text-white border-white/20 hover:bg-white/10"
//                 style={{ borderColor: 'rgba(255,255,255,0.2)' }}
//               >
//                 <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//               </Button>
//               <div className="px-1.5 sm:px-3 py-1 bg-white/10 rounded-lg border border-white/20 text-[10px] sm:text-xs font-medium text-white">
//                 {page + 1} / {totalPages || 1}
//               </div>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 disabled={page + 1 >= totalPages}
//                 onClick={() => setPage((p) => p + 1)}
//                 className="h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg text-white border-white/20 hover:bg-white/10"
//                 style={{ borderColor: 'rgba(255,255,255,0.2)' }}
//               >
//                 <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>

//       <BuyerDetailModal buyer={detailBuyer} onClose={() => setDetailBuyer(null)} />

//       <EmailModal
//         open={emailOpen}
//         recipients={getRecipients()}
//         product={getProductToSend()}
//         multipleProducts={isMultipleProductsSelected()}
//         onClose={() => setEmailOpen(false)}
//       />

//       <EmailConfigModal
//         open={modalOpen}
//         message={modalMessage}
//         onClose={() => setModalOpen(false)}
//       />
//     </div>
//   );
// }


// import { useState, useEffect, useRef } from 'react';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   Search, Loader2, ChevronLeft, ChevronRight, Mail, X,
//   ThumbsUp, ThumbsDown, Users, Building2, Globe,
//   Package, Hash, Filter, ArrowUpDown,
//   Send, User, MapPin, AtSign, Phone, Lock,
//   Copy, Check, Eye
// } from 'lucide-react';
// import EmailModal from '@/components/EmailModal';
// import { toast } from 'sonner';
// import { ACTIVITY_URL, API_URL } from '@/components/api';
// import { useEmailConfigCheck } from '@/hooks/Emailconfigcheck';
// import EmailConfigModal from '@/components/EmailcheckModal';

// const API = API_URL;

// interface Buyer {
//   buyer_id: number;
//   buyer_date: string;
//   product: string;
//   hsn_code: string;
//   country: string;
//   company_name: string;
//   website: string;
//   contacts: string;
//   emails: string;
//   phone_revealed: boolean;
//   email_revealed: boolean;
// }

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

// /* ---------- Small visual helpers (avatar + status pill) ---------- */

// const AVATAR_PALETTE = [
//   { bg: '#8EE147', fg: '#0E223B' },
//   { bg: '#0E223B', fg: '#FFFFFF' },
//   { bg: '#6EC035', fg: '#0E223B' },
//   { bg: '#1A3355', fg: '#FFFFFF' },
//   { bg: '#A8E86A', fg: '#0E223B' },
//   { bg: '#2A4A6B', fg: '#FFFFFF' },
//   { bg: '#8EE147', fg: '#0E223B' },
//   { bg: '#3A6080', fg: '#FFFFFF' },
// ];

// function hashString(s: string) {
//   let h = 0;
//   for (let i = 0; i < s.length; i++) {
//     h = (h << 5) - h + s.charCodeAt(i);
//     h |= 0;
//   }
//   return Math.abs(h);
// }

// function CompanyAvatar({ name }: { name: string }) {
//   const safe = name || '?';
//   const palette = AVATAR_PALETTE[hashString(safe) % AVATAR_PALETTE.length];
//   const initial = safe.trim().charAt(0).toUpperCase();
//   return (
//     <div
//       className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center font-semibold text-xs"
//       style={{ backgroundColor: palette.bg, color: palette.fg }}
//       aria-hidden
//     >
//       {initial}
//     </div>
//   );
// }

// type RevealState = 'full' | 'partial' | 'locked';

// function getRevealState(buyer: Buyer): RevealState {
//   if (buyer.email_revealed && buyer.phone_revealed) return 'full';
//   if (buyer.email_revealed || buyer.phone_revealed) return 'partial';
//   return 'locked';
// }

// const REVEAL_STYLES: Record<RevealState, { label: string; className: string }> = {
//   full: { label: 'Revealed', className: 'bg-[#8EE147] text-[#0E223B]' },
//   partial: { label: 'Partial', className: 'bg-amber-50 text-amber-700' },
//   locked: { label: 'Locked', className: 'bg-slate-100 text-slate-500' },
// };

// function StatusPill({ state }: { state: RevealState }) {
//   const s = REVEAL_STYLES[state];
//   return (
//     <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${s.className}`}>
//       {s.label}
//     </span>
//   );
// }

// /* -------------------------------------------------------------- */

// /* Buyer Detail Modal */
// function BuyerDetailModal({
//   buyer,
//   onClose,
// }: {
//   buyer: Buyer | null;
//   onClose: () => void;
// }) {
//   if (!buyer) return null;

//   const fields: { label: string; value: string; icon: React.ReactNode }[] = [
//     { label: 'Company Name', value: buyer.company_name, icon: <Building2 className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     { label: 'Product', value: buyer.product, icon: <Package className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     { label: 'HSN Code', value: buyer.hsn_code, icon: <Hash className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     { label: 'Country', value: buyer.country, icon: <Globe className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     { label: 'Website', value: buyer.website, icon: <Globe className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     { label: 'Contacts', value: buyer.contacts, icon: <User className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     { label: 'Emails', value: buyer.emails, icon: <AtSign className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     {
//       label: 'Date',
//       value: buyer.buyer_date
//         ? new Date(buyer.buyer_date).toLocaleDateString('en-GB').replace(/\//g, '-')
//         : '',
//       icon: <Calendar className="h-4 w-4" style={{ color: '#8EE147' }} />,
//     },
//   ];

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-2 sm:p-4"
//       onClick={onClose}
//     >
//       <div
//         className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-2 sm:mx-4 overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="relative px-4 sm:px-6 py-4 sm:py-5" style={{ backgroundColor: '#0E223B' }}>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <CompanyAvatar name={buyer.company_name} />
//               <div>
//                 <div className="text-slate-400 text-[10px] font-medium mb-0.5">
//                   HSN {buyer.hsn_code}
//                 </div>
//                 <h2 className="text-lg sm:text-xl font-semibold text-white">{buyer.company_name}</h2>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               className="rounded-lg p-2 bg-white/10 hover:bg-white/20 transition-colors text-white"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>
//         </div>

//         <div className="p-4 sm:p-6 space-y-4">
//           {fields.map(({ label, value, icon }) =>
//             value ? (
//               <div key={label} className="flex items-start gap-3 group">
//                 <div className="mt-0.5 text-slate-400 group-hover:text-slate-600 transition-colors">
//                   {icon}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <span className="text-xs font-medium text-slate-400 block mb-0.5">
//                     {label}
//                   </span>
//                   {label === 'Website' ? (
//                     <a
//                       href={value.startsWith('http') ? value : `https://${value}`}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="text-sm text-[#8EE147] hover:text-[#6EC035] underline hover:no-underline transition-colors break-all"
//                     >
//                       {value}
//                     </a>
//                   ) : (
//                     <span className="text-sm text-slate-800 break-all font-medium">
//                       {value}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             ) : null
//           )}
//         </div>

//         <div className="px-4 sm:px-6 py-4 bg-slate-50 border-t flex justify-end">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={onClose}
//             className="hover:bg-slate-100 transition-colors"
//             style={{ borderColor: '#0E223B', color: '#0E223B' }}
//           >
//             Close
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// const Calendar = ({ className }: { className?: string }) => (
//   <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//   </svg>
// );

// function CopyButton({ value, type, buyerId, companyName }: {
//   value: string;
//   type: 'phone' | 'email';
//   buyerId?: number;
//   companyName?: string;
// }) {
//   const [copied, setCopied] = useState(false);

//   const handleCopy = async (e: React.MouseEvent) => {
//     e.stopPropagation();
//     try {
//       await navigator.clipboard.writeText(value);
//       setCopied(true);

//       const actionId = type === 'email' ? 48 : 49;
//       const actionName = type === 'email' ? 'Email' : 'Phone Number';

//       await createActivityLog(
//         actionId,
//         1,
//         `Copied ${actionName}: ${value}${companyName ? ` (${companyName})` : ''}`,
//         {
//           copyType: type,
//           copiedValue: value,
//           buyer_id: buyerId,
//           company_name: companyName
//         }
//       );

//       toast.success(`Copied to clipboard`);
//       setTimeout(() => setCopied(false), 1500);
//     } catch (err) {
//       console.error('Copy failed:', err);
//       toast.error('Failed to copy');
//     }
//   };

//   return (
//     <button
//       onClick={handleCopy}
//       className="shrink-0 p-0.5 rounded hover:bg-slate-100 transition-colors"
//       title={`Copy ${type === 'email' ? 'email' : 'phone'}`}
//     >
//       {copied ? 
//         <Check className="h-3 w-3" style={{ color: '#8EE147' }} /> : 
//         <Copy className="h-3 w-3" style={{ color: '#94A3B8' }} />
//       }
//     </button>
//   );
// }

// export default function SearchPage() {
//   const [rows, setRows] = useState<Buyer[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [query, setQuery] = useState('');
//   const [countries, setCountries] = useState<any[]>([]);
//   const [countryFilter, setCountryFilter] = useState('all');
//   const [productFilter, setProductFilter] = useState('all');
//   const [products, setProducts] = useState<any[]>([]);
//   const [page, setPage] = useState(0);
//   const [totalCount, setTotalCount] = useState(0);
//   const [selected, setSelected] = useState<Set<number>>(new Set());
//   const [emailOpen, setEmailOpen] = useState(false);
//   const [detailBuyer, setDetailBuyer] = useState<Buyer | null>(null);
//   const [submittingId, setSubmittingId] = useState<number | null>(null);
//   const [revealingId, setRevealingId] = useState<number | null>(null);

//   const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   const revealContact = async (buyerId: number, type: 'phone' | 'email') => {
//     setRevealingId(buyerId);
//     try {
//       const seller = JSON.parse(localStorage.getItem("seller") || "{}");
//       const res = await fetch(`${API}/buyers/${buyerId}/reveal-contact`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ seller_id: seller.id, reveal_type: type }),
//       });
//       const json = await res.json();

//       if (json.success) {
//         const buyer = rows.find(r => r.buyer_id === buyerId);

//         setRows((prev) =>
//           prev.map((r) =>
//             r.buyer_id === buyerId
//               ? {
//                   ...r,
//                   contacts: type === 'phone' ? json.data.contacts : r.contacts,
//                   emails: type === 'email' ? json.data.emails : r.emails,
//                   phone_revealed: type === 'phone' ? true : r.phone_revealed,
//                   email_revealed: type === 'email' ? true : r.email_revealed,
//                 }
//               : r
//           )
//         );

//         if (type === 'phone') {
//           await createActivityLog(40, 1, `Revealed phone for: ${buyer?.company_name}`, {
//             buyer_id: buyerId,
//             company_name: buyer?.company_name,
//             phone: json.data.contacts
//           });
//         } else {
//           await createActivityLog(41, 1, `Revealed email for: ${buyer?.company_name}`, {
//             buyer_id: buyerId,
//             company_name: buyer?.company_name,
//             email: json.data.emails
//           });
//         }

//         toast.success(`${type === 'phone' ? 'Phone' : 'Email'} revealed!`);
//       } else {
//         toast.error(json.message || `Failed to reveal ${type}`);
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error(`Failed to reveal ${type}`);
//     } finally {
//       setRevealingId(null);
//     }
//   };

//   const perPage = 50;
//   const { checkEmailConfig, modalOpen, modalMessage, setModalOpen } = useEmailConfigCheck();

//   useEffect(() => {
//     loadFilters();
//     createActivityLog(16, 1, 'Viewed search page');
//     return () => {
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current);
//       }
//     };
//   }, []);

//   const loadFilters = async () => {
//     try {
//       const [countryRes, productRes] = await Promise.all([
//         fetch(`${API}/filters/buyer-countries`),
//         fetch(`${API}/filters/products`),
//       ]);
//       setCountries(await countryRes.json());
//       setProducts(await productRes.json());
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [page, query, countryFilter, productFilter]);

//   const seller = JSON.parse(localStorage.getItem("seller") || "{}");

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const params = new URLSearchParams();
//       params.set("seller_id", seller.id);
//       params.set('limit', String(perPage));
//       params.set('offset', String(page * perPage));
//       if (query) params.set('search', query);
//       if (countryFilter !== 'all') params.set('country', countryFilter);
//       if (productFilter !== 'all') params.set('product', productFilter);
//       const res = await fetch(`${API}/buyers?${params.toString()}`);
//       const json = await res.json();
//       setRows(json.data || []);
//       setTotalCount(json.total || 0);
//     } catch (err) {
//       console.error(err);
//       toast.error('Failed to fetch buyers');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logSearch = (searchValue: string) => {
//     if (!searchValue || searchValue.length < 2) return;

//     let actionId = 42;
//     let searchType = 'HSN';
//     const lowerValue = searchValue.toLowerCase();

//     const companyMatch = rows.some(r => r.company_name?.toLowerCase().includes(lowerValue));
//     const productMatch = rows.some(r => r.product?.toLowerCase().includes(lowerValue));
//     const countryMatch = rows.some(r => r.country?.toLowerCase().includes(lowerValue));

//     if (companyMatch) {
//       actionId = 43;
//       searchType = 'Company';
//     } else if (productMatch) {
//       actionId = 44;
//       searchType = 'Product';
//     } else if (countryMatch) {
//       actionId = 45;
//       searchType = 'Country';
//     }

//     createActivityLog(actionId, 1, `Searched by ${searchType}: ${searchValue}`, {
//       searchType: searchType,
//       searchValue: searchValue
//     });
//   };

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

//   const handleCountryFilter = (value: string) => {
//     setPage(0);
//     setCountryFilter(value);
//     if (value !== 'all') {
//       createActivityLog(45, 1, `Filtered by country: ${value}`, {
//         filterType: 'country',
//         filterValue: value
//       });
//     }
//   };

//   const handleProductFilter = (value: string) => {
//     setPage(0);
//     setProductFilter(value);
//     if (value !== 'all') {
//       createActivityLog(44, 1, `Filtered by product: ${value}`, {
//         filterType: 'product',
//         filterValue: value
//       });
//     }
//   };

//   const handleCountryDropdown = (value: string) => {
//     createActivityLog(46, 1, `Selected country from dropdown: ${value}`, {
//       dropdownType: 'countries',
//       selectedValue: value
//     });
//   };

//   const handleProductDropdown = (value: string) => {
//     createActivityLog(47, 1, `Selected product from dropdown: ${value}`, {
//       dropdownType: 'products',
//       selectedValue: value
//     });
//   };

//   const toggleSelect = (buyerId: number) => {
//     setSelected((prev) => {
//       const next = new Set(prev);
//       if (next.has(buyerId)) next.delete(buyerId);
//       else next.add(buyerId);
//       return next;
//     });
//   };

//   const selectAll = () => {
//     if (selected.size === rows.length) {
//       setSelected(new Set());
//     } else {
//       setSelected(new Set(rows.map((r) => r.buyer_id)));
//     }
//   };

//   const storeResponse = async (buyer: Buyer, responseType: 'interested' | 'not_interested') => {
//     if (!buyer.email_revealed) {
//       toast.error('Please reveal email first.');
//       return;
//     }
//     if (!buyer.phone_revealed) {
//       toast.error('Please reveal phone first.');
//       return;
//     }
//     setSubmittingId(buyer.buyer_id);

//     try {
//       const firstEmail = buyer.emails?.split(',')[0]?.trim();
//       if (!firstEmail) {
//         toast.error('No email found');
//         return;
//       }

//       const seller = JSON.parse(localStorage.getItem("seller") || "{}");
//       const payload = {
//         email: firstEmail,
//         response: responseType,
//         companyName: buyer.company_name,
//         country: buyer.country,
//         contactName: buyer.contacts || buyer.company_name,
//         productName: buyer.product,
//         templateUsed: 'Manual Entry',
//         buyer_id: buyer.buyer_id,
//         seller_id: seller.id || null,
//         hsn_code: buyer.hsn_code || ''
//       };

//       const response = await fetch(`${API}/api/store-response`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();

//       if (data.success) {
//         toast.success(`${responseType === 'interested' ? '✓ Interested' : '✗ Not Interested'} recorded!`);

//         const actionId = responseType === 'interested' ? 6 : 7;
//         await createActivityLog(actionId, 1,
//           `${responseType === 'interested' ? 'Interested' : 'Not Interested'}: ${buyer.company_name}`,
//           {
//             buyer_id: buyer.buyer_id,
//             company_name: buyer.company_name,
//             email: buyer.emails,
//             product: buyer.product,
//             hsn_code: buyer.hsn_code,
//             response: responseType
//           }
//         );
//       } else {
//         toast.error(data.error || 'Failed to record response');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       toast.error('Failed to record response');
//     } finally {
//       setSubmittingId(null);
//     }
//   };

//   const getSelectedBuyers = () => rows.filter(r => selected.has(r.buyer_id));

//   const getUniqueProducts = () => {
//     const selectedBuyers = getSelectedBuyers();
//     return [...new Set(selectedBuyers.map(b => b.product).filter(Boolean))];
//   };

//   const getProductToSend = () => {
//     const uniqueProducts = getUniqueProducts();
//     if (uniqueProducts.length === 0 || uniqueProducts.length > 1) {
//       return "General Products";
//     }
//     return uniqueProducts[0];
//   };

//   const isMultipleProductsSelected = () => {
//     const selectedBuyers = getSelectedBuyers();
//     const uniqueProducts = [...new Set(selectedBuyers.map(b => b.product).filter(Boolean))];
//     return uniqueProducts.length > 1;
//   };

//   const getRecipients = () => {
//     return getSelectedBuyers()
//       .filter((r) => r.email_revealed)
//       .flatMap((r) =>
//         (r.emails || '')
//           .split(',')
//           .map((email) => ({
//             name: r.company_name,
//             company: r.company_name,
//             company_name: r.company_name,
//             email: email.trim(),
//             country: r.country,
//             product: r.product,
//             hsn_code: r.hsn_code || '',
//             buyer_id: r.buyer_id,
//             templateUsed: 'Welcome Template',
//             contacts: r.contacts,
//           }))
//           .filter((recipient) => recipient.email)
//       );
//   };

//   const getLockedSelectedCount = () => {
//     return getSelectedBuyers().filter((r) => !r.email_revealed).length;
//   };

//   const totalPages = Math.ceil(totalCount / perPage);
//   const selectedCount = selected.size;

//   return (
//     <div className="min-h-screen p-1.5 sm:p-6" style={{ backgroundColor: '#0E223B' }}>
//       <div className="max-w-full sm:max-w-7xl mx-auto px-0.5 sm:px-2">
//         {/* Header - Responsive */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-6">
//           <div className="space-y-0.5">
//             <h1 className="text-lg sm:text-2xl font-semibold text-white">
//               Search Buyers
//             </h1>
//             <p className="text-[10px] sm:text-sm text-slate-300 flex items-center gap-1.5">
//               <Users className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" style={{ color: '#8EE147' }} />
//               <span className="hidden sm:inline">Find and connect with potential buyers worldwide</span>
//               <span className="sm:hidden">Find buyers worldwide</span>
//             </p>
//           </div>
//           <Button
//             onClick={async () => {
//               const selectedBuyers = getSelectedBuyers();
//               const lockedCount = selectedBuyers.filter((r) => !r.email_revealed).length;
//               const revealedCount = selectedBuyers.length - lockedCount;

//               if (revealedCount === 0) {
//                 toast.error(
//                   lockedCount === 1
//                     ? 'This buyer\'s email is locked. Reveal it first to send an email.'
//                     : 'All selected buyers have locked emails. Reveal at least one to send an email.'
//                 );
//                 return;
//               }

//               if (lockedCount > 0) {
//                 toast.warning(
//                   `${lockedCount} selected buyer${lockedCount > 1 ? 's have' : ' has'} a locked email and will be skipped.`
//                 );
//               }

//               const ok = await checkEmailConfig();
//               if (!ok) return;

//               setEmailOpen(true);
//               createActivityLog(6, 3, 'Opened email modal', {
//                 selected_count: selected.size,
//                 revealed_count: revealedCount,
//                 locked_skipped: lockedCount,
//               });
//             }}
//             disabled={selectedCount === 0}
//             className="gap-1 sm:gap-2 text-[#0E223B] font-medium shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4 rounded-xl"
//             style={{ backgroundColor: '#8EE147' }}
//           >
//             <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//             <span>Send Email</span>
//             {selectedCount > 0 && (
//               <span className="bg-[#0E223B]/20 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold">
//                 {selectedCount}
//               </span>
//             )}
//           </Button>
//         </div>

//         {/* Search and Filters - Responsive */}
//         <div className="bg-white rounded-2xl shadow-sm p-1.5 sm:p-3 mb-2.5 sm:mb-5" style={{ borderColor: '#E2E8F0', borderWidth: '1px' }}>
//           <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-3 items-stretch sm:items-center">
//             <div className="relative flex-1 min-w-[120px] sm:min-w-[200px]">
//               <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: '#8EE147' }} />
//               <Input
//                 placeholder="Search HSN, Company, Product, Country..."
//                 value={query}
//                 onChange={handleSearchChange}
//                 onKeyDown={handleSearchKeyDown}
//                 className="pl-8 sm:pl-10 border-slate-200 focus:border-[#8EE147] focus:ring-[#8EE147]/20 rounded-lg sm:rounded-xl bg-white w-full h-8 sm:h-10 text-[11px] sm:text-sm"
//               />
//             </div>

//             <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
//               <div className="relative w-full sm:w-36 lg:w-44">
//                 <Select value={countryFilter} onValueChange={handleCountryFilter}>
//                   <SelectTrigger className="w-full border-slate-200 focus:border-[#8EE147] rounded-lg sm:rounded-xl bg-white h-8 sm:h-10 text-[11px] sm:text-sm">
//                     <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" style={{ color: '#8EE147' }} />
//                     <SelectValue placeholder="Country" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Countries</SelectItem>
//                     {countries.map((c) => (
//                       <SelectItem
//                         key={c.country}
//                         value={c.country}
//                         onClick={() => handleCountryDropdown(c.country)}
//                       >
//                         {c.country}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="relative w-full sm:w-36 lg:w-44">
//                 <Select value={productFilter} onValueChange={handleProductFilter}>
//                   <SelectTrigger className="w-full border-slate-200 focus:border-[#8EE147] rounded-lg sm:rounded-xl bg-white h-8 sm:h-10 text-[11px] sm:text-sm">
//                     <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" style={{ color: '#8EE147' }} />
//                     <SelectValue placeholder="Product" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Products</SelectItem>
//                     {products.map((p) => (
//                       <SelectItem
//                         key={p.product}
//                         value={p.product}
//                         onClick={() => handleProductDropdown(p.product)}
//                       >
//                         {p.product}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Stats and Pagination - Responsive */}
//         <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-3 mb-2.5 sm:mb-4">
//           <div className="flex flex-wrap items-center gap-1 sm:gap-4 text-[10px] sm:text-sm">
//             <span className="text-slate-300">
//               Showing <span className="font-semibold text-white">{rows.length}</span> of{' '}
//               <span className="font-semibold text-white">{totalCount}</span> buyers
//             </span>
//             {selectedCount > 0 && (
//               <span className="inline-flex items-center gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 bg-[#8EE147] text-[#0E223B] rounded-full text-[9px] sm:text-xs font-medium">
//                 <Checkbox checked className="h-2.5 w-2.5 sm:h-3 sm:w-3" style={{ backgroundColor: '#0E223B', borderColor: '#0E223B' }} />
//                 {selectedCount} selected
//               </span>
//             )}
//           </div>
//           <div className="flex items-center gap-1 sm:gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               disabled={page === 0}
//               onClick={() => setPage((p) => p - 1)}
//               className="hover:bg-white/10 transition-colors h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg text-white border-white/20"
//               style={{ borderColor: 'rgba(255,255,255,0.2)' }}
//             >
//               <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//             </Button>
//             <div className="px-1.5 sm:px-4 py-1 bg-white/10 rounded-lg border border-white/20 text-[10px] sm:text-sm font-medium whitespace-nowrap text-white">
//               Page <span className="text-white">{page + 1}</span> / {totalPages || 1}
//             </div>
//             <Button
//               variant="outline"
//               size="sm"
//               disabled={page + 1 >= totalPages}
//               onClick={() => setPage((p) => p + 1)}
//               className="hover:bg-white/10 transition-colors h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg text-white border-white/20"
//               style={{ borderColor: 'rgba(255,255,255,0.2)' }}
//             >
//               <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//             </Button>
//           </div>
//         </div>

//         {/* Table View - Clean column-wise layout without overlap */}
//         {loading ? (
//           <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col items-center justify-center h-48 sm:h-64 gap-3 sm:gap-4">
//             <Loader2 className="h-9 w-9 sm:h-11 sm:w-11 animate-spin" style={{ color: '#8EE147' }} />
//             <p className="text-xs sm:text-sm text-slate-400">Loading buyers...</p>
//           </div>
//         ) : rows.length === 0 ? (
//           <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col items-center justify-center h-48 sm:h-64 gap-2 sm:gap-3 px-4">
//             <div className="p-3 sm:p-4 bg-[#8EE147]/10 rounded-full">
//               <Search className="h-8 w-8 sm:h-10 sm:w-10" style={{ color: '#8EE147' }} />
//             </div>
//             <p className="text-sm sm:text-base font-medium text-white">No buyers found</p>
//             <p className="text-[10px] sm:text-sm text-slate-400 text-center">Try adjusting your filters or search terms</p>
//           </div>
//         ) : (
//           <div className="bg-white rounded-xl overflow-hidden shadow-sm">
//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[1200px] border-collapse">
//                 {/* Table Header */}
//                 <thead>
//                   <tr className="border-b border-slate-200" style={{ backgroundColor: '#F8FAFC' }}>
//                     <th className="w-10 px-3 py-3 text-left">
//                       <Checkbox
//                         checked={selected.size === rows.length && rows.length > 0}
//                         onCheckedChange={selectAll}
//                         className="data-[state=checked]:bg-[#8EE147] data-[state=checked]:border-[#8EE147]"
//                       />
//                     </th>
//                     <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Buyer</th>
//                     <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Country</th>
//                     <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Contact</th>
//                     <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Email</th>
//                     <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600">Status</th>
//                     <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600">Date</th>
//                     <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600">HSN</th>
//                     <th className="px-3 py-3 text-right text-xs font-semibold text-slate-600">Actions</th>
//                   </tr>
//                 </thead>
//                 {/* Table Body */}
//                 <tbody>
//                   {rows.map((r) => {
//                     const state = getRevealState(r);
//                     return (
//                       <tr
//                         key={r.buyer_id}
//                         className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
//                           selected.has(r.buyer_id) ? 'bg-[#F0F9E6]' : ''
//                         }`}
//                       >
//                         {/* Checkbox */}
//                         <td className="w-10 px-3 py-2.5">
//                           <Checkbox
//                             checked={selected.has(r.buyer_id)}
//                             onCheckedChange={() => toggleSelect(r.buyer_id)}
//                             className="data-[state=checked]:bg-[#8EE147] data-[state=checked]:border-[#8EE147]"
//                           />
//                         </td>

//                         {/* Buyer - Company Name + Product */}
//                         <td className="px-3 py-2.5">
//                           <div className="flex items-center gap-2">
//                             <CompanyAvatar name={r.company_name} />
//                             <div>
//                               <button
//                                 onClick={() => {
//                                   setDetailBuyer(r);
//                                   createActivityLog(7, 3, `Viewed buyer details: ${r.company_name}`, {
//                                     buyer_id: r.buyer_id,
//                                     company_name: r.company_name,
//                                     hsn_code: r.hsn_code
//                                   });
//                                 }}
//                                 className="font-medium text-sm hover:underline text-left block truncate max-w-[180px]"
//                                 style={{ color: '#0E223B' }}
//                                 title={r.company_name}
//                               >
//                                 {r.company_name}
//                               </button>
//                               <div className="text-xs text-slate-400 truncate max-w-[180px]" title={r.product}>
//                                 {r.product}
//                               </div>
//                             </div>
//                           </div>
//                         </td>

//                         {/* Country */}
//                         <td className="px-3 py-2.5">
//                           <span className="text-sm text-slate-600 truncate block max-w-[100px]" title={r.country}>
//                             {r.country}
//                           </span>
//                         </td>

//                         {/* Contact */}
//                         <td className="px-3 py-2.5">
//                           {r.phone_revealed ? (
//                             <div className="flex items-center gap-1">
//                               <span className="text-sm text-slate-600 truncate max-w-[120px]" title={r.contacts}>
//                                 {r.contacts}
//                               </span>
//                               <CopyButton
//                                 value={r.contacts}
//                                 type="phone"
//                                 buyerId={r.buyer_id}
//                                 companyName={r.company_name}
//                               />
//                             </div>
//                           ) : (
//                             <button
//                               onClick={() => revealContact(r.buyer_id, "phone")}
//                               disabled={revealingId === r.buyer_id}
//                               className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors whitespace-nowrap"
//                             >
//                               {revealingId === r.buyer_id ? (
//                                 <Loader2 className="h-3 w-3 animate-spin" style={{ color: '#8EE147' }} />
//                               ) : (
//                                 <>
//                                   <Lock className="h-3 w-3" style={{ color: '#8EE147' }} />
//                                   <span>Locked</span>
//                                 </>
//                               )}
//                             </button>
//                           )}
//                         </td>

//                         {/* Email */}
//                         <td className="px-3 py-2.5">
//                           {r.email_revealed ? (
//                             <div className="flex items-center gap-1">
//                               <span className="text-sm text-slate-600 truncate max-w-[150px]" title={r.emails}>
//                                 {r.emails}
//                               </span>
//                               <CopyButton
//                                 value={r.emails}
//                                 type="email"
//                                 buyerId={r.buyer_id}
//                                 companyName={r.company_name}
//                               />
//                             </div>
//                           ) : (
//                             <button
//                               onClick={() => revealContact(r.buyer_id, "email")}
//                               disabled={revealingId === r.buyer_id}
//                               className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors whitespace-nowrap"
//                             >
//                               {revealingId === r.buyer_id ? (
//                                 <Loader2 className="h-3 w-3 animate-spin" style={{ color: '#8EE147' }} />
//                               ) : (
//                                 <>
//                                   <Lock className="h-3 w-3" style={{ color: '#8EE147' }} />
//                                   <span>Locked</span>
//                                 </>
//                               )}
//                             </button>
//                           )}
//                         </td>

//                         {/* Status */}
//                         <td className="px-3 py-2.5 text-center">
//                           <div className="flex justify-center">
//                             <StatusPill state={state} />
//                           </div>
//                         </td>

//                         {/* Date */}
//                         <td className="px-3 py-2.5 text-center">
//                           <span className="text-xs text-slate-400 whitespace-nowrap">
//                             {r.buyer_date
//                               ? new Date(r.buyer_date).toLocaleDateString('en-GB').replace(/\//g, '-')
//                               : '—'}
//                           </span>
//                         </td>

//                         {/* HSN */}
//                         <td className="px-3 py-2.5 text-center">
//                           <div className="flex justify-center">
//                             <span 
//                               className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs font-medium whitespace-nowrap"
//                               style={{
//                                 backgroundColor: '#F0F9E6',
//                                 borderColor: '#8EE147',
//                                 color: '#0E223B'
//                               }}
//                             >
//                               <Hash className="h-2.5 w-2.5" style={{ color: '#8EE147' }} />
//                               {r.hsn_code}
//                             </span>
//                           </div>
//                         </td>

//                         {/* Actions */}
//                         <td className="px-3 py-2.5 text-right">
//                           <div className="flex items-center justify-end gap-0.5">
//                             <button
//                               onClick={() => {
//                                 setDetailBuyer(r);
//                                 createActivityLog(7, 3, `Viewed buyer details: ${r.company_name}`, {
//                                   buyer_id: r.buyer_id,
//                                   company_name: r.company_name,
//                                   hsn_code: r.hsn_code
//                                 });
//                               }}
//                               title="View details"
//                               className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
//                               style={{ color: '#94A3B8' }}
//                             >
//                               <Eye className="h-3.5 w-3.5" />
//                             </button>
//                             <button
//                               onClick={() => storeResponse(r, 'interested')}
//                               disabled={submittingId === r.buyer_id}
//                               title="Mark interested"
//                               className="p-1.5 rounded-lg hover:bg-[#F0F9E6] transition-colors disabled:opacity-40"
//                               style={{ color: '#8EE147' }}
//                             >
//                               {submittingId === r.buyer_id ? (
//                                 <Loader2 className="h-3.5 w-3.5 animate-spin" />
//                               ) : (
//                                 <ThumbsUp className="h-3.5 w-3.5" />
//                               )}
//                             </button>
//                             <button
//                               onClick={() => storeResponse(r, 'not_interested')}
//                               disabled={submittingId === r.buyer_id}
//                               title="Mark not interested"
//                               className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-400 hover:text-rose-600 transition-colors disabled:opacity-40"
//                             >
//                               {submittingId === r.buyer_id ? (
//                                 <Loader2 className="h-3.5 w-3.5 animate-spin" />
//                               ) : (
//                                 <ThumbsDown className="h-3.5 w-3.5" />
//                               )}
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* Bottom Pagination - Responsive */}
//         {rows.length > 0 && (
//           <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 mt-3 sm:mt-5 text-[10px] sm:text-sm text-slate-400">
//             <span>
//               Showing {page * perPage + 1} - {Math.min((page + 1) * perPage, totalCount)} of {totalCount}
//             </span>
//             <div className="flex items-center gap-1.5 sm:gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 disabled={page === 0}
//                 onClick={() => setPage((p) => p - 1)}
//                 className="h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg text-white border-white/20 hover:bg-white/10"
//                 style={{ borderColor: 'rgba(255,255,255,0.2)' }}
//               >
//                 <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//               </Button>
//               <div className="px-1.5 sm:px-3 py-1 bg-white/10 rounded-lg border border-white/20 text-[10px] sm:text-xs font-medium text-white">
//                 {page + 1} / {totalPages || 1}
//               </div>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 disabled={page + 1 >= totalPages}
//                 onClick={() => setPage((p) => p + 1)}
//                 className="h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg text-white border-white/20 hover:bg-white/10"
//                 style={{ borderColor: 'rgba(255,255,255,0.2)' }}
//               >
//                 <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>

//       <BuyerDetailModal buyer={detailBuyer} onClose={() => setDetailBuyer(null)} />

//       <EmailModal
//         open={emailOpen}
//         recipients={getRecipients()}
//         product={getProductToSend()}
//         multipleProducts={isMultipleProductsSelected()}
//         onClose={() => setEmailOpen(false)}
//       />

//       <EmailConfigModal
//         open={modalOpen}
//         message={modalMessage}
//         onClose={() => setModalOpen(false)}
//       />
//     </div>
//   );
// }





// import { useState, useEffect, useRef } from 'react';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   Search, Loader2, ChevronLeft, ChevronRight, Mail, X,
//   ThumbsUp, ThumbsDown, Users, Building2, Globe,
//   Package, Hash, Filter, ArrowUpDown,
//   Send, User, MapPin, AtSign, Phone, Lock,
//   Copy, Check, Eye
// } from 'lucide-react';
// import EmailModal from '@/components/EmailModal';
// import { toast } from 'sonner';
// import { ACTIVITY_URL, API_URL } from '@/components/api';
// import { useEmailConfigCheck } from '@/hooks/Emailconfigcheck';
// import EmailConfigModal from '@/components/EmailcheckModal';

// const API = API_URL;

// interface Buyer {
//   buyer_id: number;
//   buyer_date: string;
//   product: string;
//   hsn_code: string;
//   country: string;
//   company_name: string;
//   website: string;
//   contacts: string;
//   emails: string;
//   phone_revealed: boolean;
//   email_revealed: boolean;
// }

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

// /* ---------- Small visual helpers (avatar + status pill) ---------- */

// const AVATAR_PALETTE = [
//   { bg: '#8EE147', fg: '#0E223B' },
//   { bg: '#0E223B', fg: '#FFFFFF' },
//   { bg: '#6EC035', fg: '#0E223B' },
//   { bg: '#1A3355', fg: '#FFFFFF' },
//   { bg: '#A8E86A', fg: '#0E223B' },
//   { bg: '#2A4A6B', fg: '#FFFFFF' },
//   { bg: '#8EE147', fg: '#0E223B' },
//   { bg: '#3A6080', fg: '#FFFFFF' },
// ];

// function hashString(s: string) {
//   let h = 0;
//   for (let i = 0; i < s.length; i++) {
//     h = (h << 5) - h + s.charCodeAt(i);
//     h |= 0;
//   }
//   return Math.abs(h);
// }

// function CompanyAvatar({ name }: { name: string }) {
//   const safe = name || '?';
//   const palette = AVATAR_PALETTE[hashString(safe) % AVATAR_PALETTE.length];
//   const initial = safe.trim().charAt(0).toUpperCase();
//   return (
//     <div
//       className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center font-semibold text-xs"
//       style={{ backgroundColor: palette.bg, color: palette.fg }}
//       aria-hidden
//     >
//       {initial}
//     </div>
//   );
// }

// type RevealState = 'full' | 'partial' | 'locked';

// function getRevealState(buyer: Buyer): RevealState {
//   if (buyer.email_revealed && buyer.phone_revealed) return 'full';
//   if (buyer.email_revealed || buyer.phone_revealed) return 'partial';
//   return 'locked';
// }

// const REVEAL_STYLES: Record<RevealState, { label: string; className: string }> = {
//   full: { label: 'Revealed', className: 'bg-[#8EE147] text-[#0E223B]' },
//   partial: { label: 'Partial', className: 'bg-amber-50 text-amber-700' },
//   locked: { label: 'Locked', className: 'bg-slate-100 text-slate-500' },
// };

// function StatusPill({ state }: { state: RevealState }) {
//   const s = REVEAL_STYLES[state];
//   return (
//     <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${s.className}`}>
//       {s.label}
//     </span>
//   );
// }

// /* -------------------------------------------------------------- */

// /* Buyer Detail Modal */
// function BuyerDetailModal({
//   buyer,
//   onClose,
// }: {
//   buyer: Buyer | null;
//   onClose: () => void;
// }) {
//   if (!buyer) return null;

//   const fields: { label: string; value: string; icon: React.ReactNode }[] = [
//     { label: 'Company Name', value: buyer.company_name, icon: <Building2 className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     { label: 'Product', value: buyer.product, icon: <Package className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     { label: 'HSN Code', value: buyer.hsn_code, icon: <Hash className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     { label: 'Country', value: buyer.country, icon: <Globe className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     { label: 'Website', value: buyer.website, icon: <Globe className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     { label: 'Contacts', value: buyer.contacts, icon: <User className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     { label: 'Emails', value: buyer.emails, icon: <AtSign className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     {
//       label: 'Date',
//       value: buyer.buyer_date
//         ? new Date(buyer.buyer_date).toLocaleDateString('en-GB').replace(/\//g, '-')
//         : '',
//       icon: <Calendar className="h-4 w-4" style={{ color: '#8EE147' }} />,
//     },
//   ];

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-2 sm:p-4"
//       onClick={onClose}
//     >
//       <div
//         className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-2 sm:mx-4 overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="relative px-4 sm:px-6 py-4 sm:py-5" style={{ backgroundColor: '#0E223B' }}>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <CompanyAvatar name={buyer.company_name} />
//               <div>
//                 <div className="text-slate-400 text-[10px] font-medium mb-0.5">
//                   HSN {buyer.hsn_code}
//                 </div>
//                 <h2 className="text-lg sm:text-xl font-semibold text-white">{buyer.company_name}</h2>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               className="rounded-lg p-2 bg-white/10 hover:bg-white/20 transition-colors text-white"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>
//         </div>

//         <div className="p-4 sm:p-6 space-y-4">
//           {fields.map(({ label, value, icon }) =>
//             value ? (
//               <div key={label} className="flex items-start gap-3 group">
//                 <div className="mt-0.5 text-slate-400 group-hover:text-slate-600 transition-colors">
//                   {icon}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <span className="text-xs font-medium text-slate-400 block mb-0.5">
//                     {label}
//                   </span>
//                   {label === 'Website' ? (
//                     <a
//                       href={value.startsWith('http') ? value : `https://${value}`}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="text-sm text-[#8EE147] hover:text-[#6EC035] underline hover:no-underline transition-colors break-all"
//                     >
//                       {value}
//                     </a>
//                   ) : (
//                     <span className="text-sm text-slate-800 break-all font-medium">
//                       {value}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             ) : null
//           )}
//         </div>

//         <div className="px-4 sm:px-6 py-4 bg-slate-50 border-t flex justify-end">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={onClose}
//             className="hover:bg-slate-100 transition-colors"
//             style={{ borderColor: '#0E223B', color: '#0E223B' }}
//           >
//             Close
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// const Calendar = ({ className }: { className?: string }) => (
//   <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//   </svg>
// );

// function CopyButton({ value, type, buyerId, companyName }: {
//   value: string;
//   type: 'phone' | 'email';
//   buyerId?: number;
//   companyName?: string;
// }) {
//   const [copied, setCopied] = useState(false);

//   const handleCopy = async (e: React.MouseEvent) => {
//     e.stopPropagation();
//     try {
//       await navigator.clipboard.writeText(value);
//       setCopied(true);

//       const actionId = type === 'email' ? 48 : 49;
//       const actionName = type === 'email' ? 'Email' : 'Phone Number';

//       await createActivityLog(
//         actionId,
//         1,
//         `Copied ${actionName}: ${value}${companyName ? ` (${companyName})` : ''}`,
//         {
//           copyType: type,
//           copiedValue: value,
//           buyer_id: buyerId,
//           company_name: companyName
//         }
//       );

//       toast.success(`Copied to clipboard`);
//       setTimeout(() => setCopied(false), 1500);
//     } catch (err) {
//       console.error('Copy failed:', err);
//       toast.error('Failed to copy');
//     }
//   };

//   return (
//     <button
//       onClick={handleCopy}
//       className="shrink-0 p-0.5 rounded hover:bg-slate-100 transition-colors"
//       title={`Copy ${type === 'email' ? 'email' : 'phone'}`}
//     >
//       {copied ? 
//         <Check className="h-3 w-3" style={{ color: '#8EE147' }} /> : 
//         <Copy className="h-3 w-3" style={{ color: '#94A3B8' }} />
//       }
//     </button>
//   );
// }

// export default function SearchPage() {
//   const [rows, setRows] = useState<Buyer[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [query, setQuery] = useState('');
//   const [countries, setCountries] = useState<any[]>([]);
//   const [countryFilter, setCountryFilter] = useState('all');
//   const [productFilter, setProductFilter] = useState('all');
//   const [products, setProducts] = useState<any[]>([]);
//   const [page, setPage] = useState(0);
//   const [totalCount, setTotalCount] = useState(0);
//   const [selected, setSelected] = useState<Set<number>>(new Set());
//   const [emailOpen, setEmailOpen] = useState(false);
//   const [detailBuyer, setDetailBuyer] = useState<Buyer | null>(null);
//   const [submittingId, setSubmittingId] = useState<number | null>(null);
//   const [revealingId, setRevealingId] = useState<number | null>(null);
//   const [isMobile, setIsMobile] = useState(false);

//   const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   // Check for mobile view to adjust layout for sidebar
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   const revealContact = async (buyerId: number, type: 'phone' | 'email') => {
//     setRevealingId(buyerId);
//     try {
//       const seller = JSON.parse(localStorage.getItem("seller") || "{}");
//       const res = await fetch(`${API}/buyers/${buyerId}/reveal-contact`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ seller_id: seller.id, reveal_type: type }),
//       });
//       const json = await res.json();

//       if (json.success) {
//         const buyer = rows.find(r => r.buyer_id === buyerId);

//         setRows((prev) =>
//           prev.map((r) =>
//             r.buyer_id === buyerId
//               ? {
//                   ...r,
//                   contacts: type === 'phone' ? json.data.contacts : r.contacts,
//                   emails: type === 'email' ? json.data.emails : r.emails,
//                   phone_revealed: type === 'phone' ? true : r.phone_revealed,
//                   email_revealed: type === 'email' ? true : r.email_revealed,
//                 }
//               : r
//           )
//         );

//         if (type === 'phone') {
//           await createActivityLog(40, 1, `Revealed phone for: ${buyer?.company_name}`, {
//             buyer_id: buyerId,
//             company_name: buyer?.company_name,
//             phone: json.data.contacts
//           });
//         } else {
//           await createActivityLog(41, 1, `Revealed email for: ${buyer?.company_name}`, {
//             buyer_id: buyerId,
//             company_name: buyer?.company_name,
//             email: json.data.emails
//           });
//         }

//         toast.success(`${type === 'phone' ? 'Phone' : 'Email'} revealed!`);
//       } else {
//         toast.error(json.message || `Failed to reveal ${type}`);
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error(`Failed to reveal ${type}`);
//     } finally {
//       setRevealingId(null);
//     }
//   };

//   const perPage = 50;
//   const { checkEmailConfig, modalOpen, modalMessage, setModalOpen } = useEmailConfigCheck();

//   useEffect(() => {
//     loadFilters();
//     createActivityLog(16, 1, 'Viewed search page');
//     return () => {
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current);
//       }
//     };
//   }, []);

//   const loadFilters = async () => {
//     try {
//       const [countryRes, productRes] = await Promise.all([
//         fetch(`${API}/filters/buyer-countries`),
//         fetch(`${API}/filters/products`),
//       ]);
//       setCountries(await countryRes.json());
//       setProducts(await productRes.json());
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [page, query, countryFilter, productFilter]);

//   const seller = JSON.parse(localStorage.getItem("seller") || "{}");

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const params = new URLSearchParams();
//       params.set("seller_id", seller.id);
//       params.set('limit', String(perPage));
//       params.set('offset', String(page * perPage));
//       if (query) params.set('search', query);
//       if (countryFilter !== 'all') params.set('country', countryFilter);
//       if (productFilter !== 'all') params.set('product', productFilter);
//       const res = await fetch(`${API}/buyers?${params.toString()}`);
//       const json = await res.json();
//       setRows(json.data || []);
//       setTotalCount(json.total || 0);
//     } catch (err) {
//       console.error(err);
//       toast.error('Failed to fetch buyers');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logSearch = (searchValue: string) => {
//     if (!searchValue || searchValue.length < 2) return;

//     let actionId = 42;
//     let searchType = 'HSN';
//     const lowerValue = searchValue.toLowerCase();

//     const companyMatch = rows.some(r => r.company_name?.toLowerCase().includes(lowerValue));
//     const productMatch = rows.some(r => r.product?.toLowerCase().includes(lowerValue));
//     const countryMatch = rows.some(r => r.country?.toLowerCase().includes(lowerValue));

//     if (companyMatch) {
//       actionId = 43;
//       searchType = 'Company';
//     } else if (productMatch) {
//       actionId = 44;
//       searchType = 'Product';
//     } else if (countryMatch) {
//       actionId = 45;
//       searchType = 'Country';
//     }

//     createActivityLog(actionId, 1, `Searched by ${searchType}: ${searchValue}`, {
//       searchType: searchType,
//       searchValue: searchValue
//     });
//   };

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

//   const handleCountryFilter = (value: string) => {
//     setPage(0);
//     setCountryFilter(value);
//     if (value !== 'all') {
//       createActivityLog(45, 1, `Filtered by country: ${value}`, {
//         filterType: 'country',
//         filterValue: value
//       });
//     }
//   };

//   const handleProductFilter = (value: string) => {
//     setPage(0);
//     setProductFilter(value);
//     if (value !== 'all') {
//       createActivityLog(44, 1, `Filtered by product: ${value}`, {
//         filterType: 'product',
//         filterValue: value
//       });
//     }
//   };

//   const handleCountryDropdown = (value: string) => {
//     createActivityLog(46, 1, `Selected country from dropdown: ${value}`, {
//       dropdownType: 'countries',
//       selectedValue: value
//     });
//   };

//   const handleProductDropdown = (value: string) => {
//     createActivityLog(47, 1, `Selected product from dropdown: ${value}`, {
//       dropdownType: 'products',
//       selectedValue: value
//     });
//   };

//   const toggleSelect = (buyerId: number) => {
//     setSelected((prev) => {
//       const next = new Set(prev);
//       if (next.has(buyerId)) next.delete(buyerId);
//       else next.add(buyerId);
//       return next;
//     });
//   };

//   const selectAll = () => {
//     if (selected.size === rows.length) {
//       setSelected(new Set());
//     } else {
//       setSelected(new Set(rows.map((r) => r.buyer_id)));
//     }
//   };

//   const storeResponse = async (buyer: Buyer, responseType: 'interested' | 'not_interested') => {
//     if (!buyer.email_revealed) {
//       toast.error('Please reveal email first.');
//       return;
//     }
//     if (!buyer.phone_revealed) {
//       toast.error('Please reveal phone first.');
//       return;
//     }
//     setSubmittingId(buyer.buyer_id);

//     try {
//       const firstEmail = buyer.emails?.split(',')[0]?.trim();
//       if (!firstEmail) {
//         toast.error('No email found');
//         return;
//       }

//       const seller = JSON.parse(localStorage.getItem("seller") || "{}");
//       const payload = {
//         email: firstEmail,
//         response: responseType,
//         companyName: buyer.company_name,
//         country: buyer.country,
//         contactName: buyer.contacts || buyer.company_name,
//         productName: buyer.product,
//         templateUsed: 'Manual Entry',
//         buyer_id: buyer.buyer_id,
//         seller_id: seller.id || null,
//         hsn_code: buyer.hsn_code || ''
//       };

//       const response = await fetch(`${API}/api/store-response`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();

//       if (data.success) {
//         toast.success(`${responseType === 'interested' ? '✓ Interested' : '✗ Not Interested'} recorded!`);

//         const actionId = responseType === 'interested' ? 6 : 7;
//         await createActivityLog(actionId, 1,
//           `${responseType === 'interested' ? 'Interested' : 'Not Interested'}: ${buyer.company_name}`,
//           {
//             buyer_id: buyer.buyer_id,
//             company_name: buyer.company_name,
//             email: buyer.emails,
//             product: buyer.product,
//             hsn_code: buyer.hsn_code,
//             response: responseType
//           }
//         );
//       } else {
//         toast.error(data.error || 'Failed to record response');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       toast.error('Failed to record response');
//     } finally {
//       setSubmittingId(null);
//     }
//   };

//   const getSelectedBuyers = () => rows.filter(r => selected.has(r.buyer_id));

//   const getUniqueProducts = () => {
//     const selectedBuyers = getSelectedBuyers();
//     return [...new Set(selectedBuyers.map(b => b.product).filter(Boolean))];
//   };

//   const getProductToSend = () => {
//     const uniqueProducts = getUniqueProducts();
//     if (uniqueProducts.length === 0 || uniqueProducts.length > 1) {
//       return "General Products";
//     }
//     return uniqueProducts[0];
//   };

//   const isMultipleProductsSelected = () => {
//     const selectedBuyers = getSelectedBuyers();
//     const uniqueProducts = [...new Set(selectedBuyers.map(b => b.product).filter(Boolean))];
//     return uniqueProducts.length > 1;
//   };

//   const getRecipients = () => {
//     return getSelectedBuyers()
//       .filter((r) => r.email_revealed)
//       .flatMap((r) =>
//         (r.emails || '')
//           .split(',')
//           .map((email) => ({
//             name: r.company_name,
//             company: r.company_name,
//             company_name: r.company_name,
//             email: email.trim(),
//             country: r.country,
//             product: r.product,
//             hsn_code: r.hsn_code || '',
//             buyer_id: r.buyer_id,
//             templateUsed: 'Welcome Template',
//             contacts: r.contacts,
//           }))
//           .filter((recipient) => recipient.email)
//       );
//   };

//   const getLockedSelectedCount = () => {
//     return getSelectedBuyers().filter((r) => !r.email_revealed).length;
//   };

//   const totalPages = Math.ceil(totalCount / perPage);
//   const selectedCount = selected.size;

//   // Calculate main content padding based on sidebar state
//   // Desktop: sidebar is 255px expanded or 70px collapsed + 20px left margin
//   // Mobile: no sidebar padding needed
//   const getMainContentPadding = () => {
//     if (isMobile) {
//       return 'pl-2 pr-2';
//     }
//     // Desktop: leave space for sidebar (255px + 20px left margin + some extra)
//     return 'pl-[295px] pr-4';
//   };

//   return (
//     <div className={`min-h-screen p-1.5 sm:p-6 ${getMainContentPadding()}`} style={{ backgroundColor: '#0E223B' }}>
//       <div className="max-w-full sm:max-w-7xl mx-auto px-0.5 sm:px-2">
//         {/* Header - Responsive */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-6">
//           <div className="space-y-0.5">
//             <h1 className="text-lg sm:text-2xl font-semibold text-white">
//               Search Buyers
//             </h1>
//             <p className="text-[10px] sm:text-sm text-slate-300 flex items-center gap-1.5">
//               <Users className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" style={{ color: '#8EE147' }} />
//               <span className="hidden sm:inline">Find and connect with potential buyers worldwide</span>
//               <span className="sm:hidden">Find buyers worldwide</span>
//             </p>
//           </div>
//           <Button
//             onClick={async () => {
//               const selectedBuyers = getSelectedBuyers();
//               const lockedCount = selectedBuyers.filter((r) => !r.email_revealed).length;
//               const revealedCount = selectedBuyers.length - lockedCount;

//               if (revealedCount === 0) {
//                 toast.error(
//                   lockedCount === 1
//                     ? 'This buyer\'s email is locked. Reveal it first to send an email.'
//                     : 'All selected buyers have locked emails. Reveal at least one to send an email.'
//                 );
//                 return;
//               }

//               if (lockedCount > 0) {
//                 toast.warning(
//                   `${lockedCount} selected buyer${lockedCount > 1 ? 's have' : ' has'} a locked email and will be skipped.`
//                 );
//               }

//               const ok = await checkEmailConfig();
//               if (!ok) return;

//               setEmailOpen(true);
//               createActivityLog(6, 3, 'Opened email modal', {
//                 selected_count: selected.size,
//                 revealed_count: revealedCount,
//                 locked_skipped: lockedCount,
//               });
//             }}
//             disabled={selectedCount === 0}
//             className="gap-1 sm:gap-2 text-[#0E223B] font-medium shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4 rounded-xl"
//             style={{ backgroundColor: '#8EE147' }}
//           >
//             <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//             <span>Send Email</span>
//             {selectedCount > 0 && (
//               <span className="bg-[#0E223B]/20 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold">
//                 {selectedCount}
//               </span>
//             )}
//           </Button>
//         </div>

//         {/* Search and Filters - Responsive */}
//         <div className="bg-white rounded-2xl shadow-sm p-1.5 sm:p-3 mb-2.5 sm:mb-5" style={{ borderColor: '#E2E8F0', borderWidth: '1px' }}>
//           <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-3 items-stretch sm:items-center">
//             <div className="relative flex-1 min-w-[120px] sm:min-w-[200px]">
//               <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: '#8EE147' }} />
//               <Input
//                 placeholder="Search HSN, Company, Product, Country..."
//                 value={query}
//                 onChange={handleSearchChange}
//                 onKeyDown={handleSearchKeyDown}
//                 className="pl-8 sm:pl-10 border-slate-200 focus:border-[#8EE147] focus:ring-[#8EE147]/20 rounded-lg sm:rounded-xl bg-white w-full h-8 sm:h-10 text-[11px] sm:text-sm"
//               />
//             </div>

//             <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
//               <div className="relative w-full sm:w-36 lg:w-44">
//                 <Select value={countryFilter} onValueChange={handleCountryFilter}>
//                   <SelectTrigger className="w-full border-slate-200 focus:border-[#8EE147] rounded-lg sm:rounded-xl bg-white h-8 sm:h-10 text-[11px] sm:text-sm">
//                     <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" style={{ color: '#8EE147' }} />
//                     <SelectValue placeholder="Country" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Countries</SelectItem>
//                     {countries.map((c) => (
//                       <SelectItem
//                         key={c.country}
//                         value={c.country}
//                         onClick={() => handleCountryDropdown(c.country)}
//                       >
//                         {c.country}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="relative w-full sm:w-36 lg:w-44">
//                 <Select value={productFilter} onValueChange={handleProductFilter}>
//                   <SelectTrigger className="w-full border-slate-200 focus:border-[#8EE147] rounded-lg sm:rounded-xl bg-white h-8 sm:h-10 text-[11px] sm:text-sm">
//                     <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" style={{ color: '#8EE147' }} />
//                     <SelectValue placeholder="Product" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Products</SelectItem>
//                     {products.map((p) => (
//                       <SelectItem
//                         key={p.product}
//                         value={p.product}
//                         onClick={() => handleProductDropdown(p.product)}
//                       >
//                         {p.product}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Stats and Pagination - Responsive */}
//         <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-3 mb-2.5 sm:mb-4">
//           <div className="flex flex-wrap items-center gap-1 sm:gap-4 text-[10px] sm:text-sm">
//             <span className="text-slate-300">
//               Showing <span className="font-semibold text-white">{rows.length}</span> of{' '}
//               <span className="font-semibold text-white">{totalCount}</span> buyers
//             </span>
//             {selectedCount > 0 && (
//               <span className="inline-flex items-center gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 bg-[#8EE147] text-[#0E223B] rounded-full text-[9px] sm:text-xs font-medium">
//                 <Checkbox checked className="h-2.5 w-2.5 sm:h-3 sm:w-3" style={{ backgroundColor: '#0E223B', borderColor: '#0E223B' }} />
//                 {selectedCount} selected
//               </span>
//             )}
//           </div>
//           <div className="flex items-center gap-1 sm:gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               disabled={page === 0}
//               onClick={() => setPage((p) => p - 1)}
//               className="hover:bg-white/10 transition-colors h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg text-white border-white/20"
//               style={{ borderColor: 'rgba(255,255,255,0.2)' }}
//             >
//               <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//             </Button>
//             <div className="px-1.5 sm:px-4 py-1 bg-white/10 rounded-lg border border-white/20 text-[10px] sm:text-sm font-medium whitespace-nowrap text-white">
//               Page <span className="text-white">{page + 1}</span> / {totalPages || 1}
//             </div>
//             <Button
//               variant="outline"
//               size="sm"
//               disabled={page + 1 >= totalPages}
//               onClick={() => setPage((p) => p + 1)}
//               className="hover:bg-white/10 transition-colors h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg text-white border-white/20"
//               style={{ borderColor: 'rgba(255,255,255,0.2)' }}
//             >
//               <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//             </Button>
//           </div>
//         </div>

//         {/* Table View - Clean column-wise layout without overlap */}
//         {loading ? (
//           <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col items-center justify-center h-48 sm:h-64 gap-3 sm:gap-4">
//             <Loader2 className="h-9 w-9 sm:h-11 sm:w-11 animate-spin" style={{ color: '#8EE147' }} />
//             <p className="text-xs sm:text-sm text-slate-400">Loading buyers...</p>
//           </div>
//         ) : rows.length === 0 ? (
//           <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col items-center justify-center h-48 sm:h-64 gap-2 sm:gap-3 px-4">
//             <div className="p-3 sm:p-4 bg-[#8EE147]/10 rounded-full">
//               <Search className="h-8 w-8 sm:h-10 sm:w-10" style={{ color: '#8EE147' }} />
//             </div>
//             <p className="text-sm sm:text-base font-medium text-white">No buyers found</p>
//             <p className="text-[10px] sm:text-sm text-slate-400 text-center">Try adjusting your filters or search terms</p>
//           </div>
//         ) : (
//           <div className="bg-white rounded-xl overflow-hidden shadow-sm">
//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[1200px] border-collapse">
//                 {/* Table Header */}
//                 <thead>
//                   <tr className="border-b border-slate-200" style={{ backgroundColor: '#F8FAFC' }}>
//                     <th className="w-10 px-3 py-3 text-left">
//                       <Checkbox
//                         checked={selected.size === rows.length && rows.length > 0}
//                         onCheckedChange={selectAll}
//                         className="data-[state=checked]:bg-[#8EE147] data-[state=checked]:border-[#8EE147]"
//                       />
//                     </th>
//                     <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Buyer</th>
//                     <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Country</th>
//                     <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Contact</th>
//                     <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Email</th>
//                     <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600">Status</th>
//                     <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600">Date</th>
//                     <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600">HSN</th>
//                     <th className="px-3 py-3 text-right text-xs font-semibold text-slate-600">Actions</th>
//                   </tr>
//                 </thead>
//                 {/* Table Body */}
//                 <tbody>
//                   {rows.map((r) => {
//                     const state = getRevealState(r);
//                     return (
//                       <tr
//                         key={r.buyer_id}
//                         className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
//                           selected.has(r.buyer_id) ? 'bg-[#F0F9E6]' : ''
//                         }`}
//                       >
//                         {/* Checkbox */}
//                         <td className="w-10 px-3 py-2.5">
//                           <Checkbox
//                             checked={selected.has(r.buyer_id)}
//                             onCheckedChange={() => toggleSelect(r.buyer_id)}
//                             className="data-[state=checked]:bg-[#8EE147] data-[state=checked]:border-[#8EE147]"
//                           />
//                         </td>

//                         {/* Buyer - Company Name + Product */}
//                         <td className="px-3 py-2.5">
//                           <div className="flex items-center gap-2">
//                             <CompanyAvatar name={r.company_name} />
//                             <div>
//                               <button
//                                 onClick={() => {
//                                   setDetailBuyer(r);
//                                   createActivityLog(7, 3, `Viewed buyer details: ${r.company_name}`, {
//                                     buyer_id: r.buyer_id,
//                                     company_name: r.company_name,
//                                     hsn_code: r.hsn_code
//                                   });
//                                 }}
//                                 className="font-medium text-sm hover:underline text-left block truncate max-w-[180px]"
//                                 style={{ color: '#0E223B' }}
//                                 title={r.company_name}
//                               >
//                                 {r.company_name}
//                               </button>
//                               <div className="text-xs text-slate-400 truncate max-w-[180px]" title={r.product}>
//                                 {r.product}
//                               </div>
//                             </div>
//                           </div>
//                         </td>

//                         {/* Country */}
//                         <td className="px-3 py-2.5">
//                           <span className="text-sm text-slate-600 truncate block max-w-[100px]" title={r.country}>
//                             {r.country}
//                           </span>
//                         </td>

//                         {/* Contact */}
//                         <td className="px-3 py-2.5">
//                           {r.phone_revealed ? (
//                             <div className="flex items-center gap-1">
//                               <span className="text-sm text-slate-600 truncate max-w-[120px]" title={r.contacts}>
//                                 {r.contacts}
//                               </span>
//                               <CopyButton
//                                 value={r.contacts}
//                                 type="phone"
//                                 buyerId={r.buyer_id}
//                                 companyName={r.company_name}
//                               />
//                             </div>
//                           ) : (
//                             <button
//                               onClick={() => revealContact(r.buyer_id, "phone")}
//                               disabled={revealingId === r.buyer_id}
//                               className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors whitespace-nowrap"
//                             >
//                               {revealingId === r.buyer_id ? (
//                                 <Loader2 className="h-3 w-3 animate-spin" style={{ color: '#8EE147' }} />
//                               ) : (
//                                 <>
//                                   <Lock className="h-3 w-3" style={{ color: '#8EE147' }} />
//                                   <span>Locked</span>
//                                 </>
//                               )}
//                             </button>
//                           )}
//                         </td>

//                         {/* Email */}
//                         <td className="px-3 py-2.5">
//                           {r.email_revealed ? (
//                             <div className="flex items-center gap-1">
//                               <span className="text-sm text-slate-600 truncate max-w-[150px]" title={r.emails}>
//                                 {r.emails}
//                               </span>
//                               <CopyButton
//                                 value={r.emails}
//                                 type="email"
//                                 buyerId={r.buyer_id}
//                                 companyName={r.company_name}
//                               />
//                             </div>
//                           ) : (
//                             <button
//                               onClick={() => revealContact(r.buyer_id, "email")}
//                               disabled={revealingId === r.buyer_id}
//                               className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors whitespace-nowrap"
//                             >
//                               {revealingId === r.buyer_id ? (
//                                 <Loader2 className="h-3 w-3 animate-spin" style={{ color: '#8EE147' }} />
//                               ) : (
//                                 <>
//                                   <Lock className="h-3 w-3" style={{ color: '#8EE147' }} />
//                                   <span>Locked</span>
//                                 </>
//                               )}
//                             </button>
//                           )}
//                         </td>

//                         {/* Status */}
//                         <td className="px-3 py-2.5 text-center">
//                           <div className="flex justify-center">
//                             <StatusPill state={state} />
//                           </div>
//                         </td>

//                         {/* Date */}
//                         <td className="px-3 py-2.5 text-center">
//                           <span className="text-xs text-slate-400 whitespace-nowrap">
//                             {r.buyer_date
//                               ? new Date(r.buyer_date).toLocaleDateString('en-GB').replace(/\//g, '-')
//                               : '—'}
//                           </span>
//                         </td>

//                         {/* HSN */}
//                         <td className="px-3 py-2.5 text-center">
//                           <div className="flex justify-center">
//                             <span 
//                               className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs font-medium whitespace-nowrap"
//                               style={{
//                                 backgroundColor: '#F0F9E6',
//                                 borderColor: '#8EE147',
//                                 color: '#0E223B'
//                               }}
//                             >
//                               <Hash className="h-2.5 w-2.5" style={{ color: '#8EE147' }} />
//                               {r.hsn_code}
//                             </span>
//                           </div>
//                         </td>

//                         {/* Actions */}
//                         <td className="px-3 py-2.5 text-right">
//                           <div className="flex items-center justify-end gap-0.5">
//                             <button
//                               onClick={() => {
//                                 setDetailBuyer(r);
//                                 createActivityLog(7, 3, `Viewed buyer details: ${r.company_name}`, {
//                                   buyer_id: r.buyer_id,
//                                   company_name: r.company_name,
//                                   hsn_code: r.hsn_code
//                                 });
//                               }}
//                               title="View details"
//                               className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
//                               style={{ color: '#94A3B8' }}
//                             >
//                               <Eye className="h-3.5 w-3.5" />
//                             </button>
//                             <button
//                               onClick={() => storeResponse(r, 'interested')}
//                               disabled={submittingId === r.buyer_id}
//                               title="Mark interested"
//                               className="p-1.5 rounded-lg hover:bg-[#F0F9E6] transition-colors disabled:opacity-40"
//                               style={{ color: '#8EE147' }}
//                             >
//                               {submittingId === r.buyer_id ? (
//                                 <Loader2 className="h-3.5 w-3.5 animate-spin" />
//                               ) : (
//                                 <ThumbsUp className="h-3.5 w-3.5" />
//                               )}
//                             </button>
//                             <button
//                               onClick={() => storeResponse(r, 'not_interested')}
//                               disabled={submittingId === r.buyer_id}
//                               title="Mark not interested"
//                               className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-400 hover:text-rose-600 transition-colors disabled:opacity-40"
//                             >
//                               {submittingId === r.buyer_id ? (
//                                 <Loader2 className="h-3.5 w-3.5 animate-spin" />
//                               ) : (
//                                 <ThumbsDown className="h-3.5 w-3.5" />
//                               )}
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* Bottom Pagination - Responsive */}
//         {rows.length > 0 && (
//           <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 mt-3 sm:mt-5 text-[10px] sm:text-sm text-slate-400">
//             <span>
//               Showing {page * perPage + 1} - {Math.min((page + 1) * perPage, totalCount)} of {totalCount}
//             </span>
//             <div className="flex items-center gap-1.5 sm:gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 disabled={page === 0}
//                 onClick={() => setPage((p) => p - 1)}
//                 className="h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg text-white border-white/20 hover:bg-white/10"
//                 style={{ borderColor: 'rgba(255,255,255,0.2)' }}
//               >
//                 <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//               </Button>
//               <div className="px-1.5 sm:px-3 py-1 bg-white/10 rounded-lg border border-white/20 text-[10px] sm:text-xs font-medium text-white">
//                 {page + 1} / {totalPages || 1}
//               </div>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 disabled={page + 1 >= totalPages}
//                 onClick={() => setPage((p) => p + 1)}
//                 className="h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg text-white border-white/20 hover:bg-white/10"
//                 style={{ borderColor: 'rgba(255,255,255,0.2)' }}
//               >
//                 <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>

//       <BuyerDetailModal buyer={detailBuyer} onClose={() => setDetailBuyer(null)} />

//       <EmailModal
//         open={emailOpen}
//         recipients={getRecipients()}
//         product={getProductToSend()}
//         multipleProducts={isMultipleProductsSelected()}
//         onClose={() => setEmailOpen(false)}
//       />

//       <EmailConfigModal
//         open={modalOpen}
//         message={modalMessage}
//         onClose={() => setModalOpen(false)}
//       />
//     </div>
//   );
// }



// import { useState, useEffect, useRef } from 'react';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   Search, Loader2, ChevronLeft, ChevronRight, Mail, X,
//   ThumbsUp, ThumbsDown, Users, Building2, Globe,
//   Package, Hash, Filter, ArrowUpDown,
//   Send, User, MapPin, AtSign, Phone, Lock,
//   Copy, Check, Eye
// } from 'lucide-react';
// import EmailModal from '@/components/EmailModal';
// import { toast } from 'sonner';
// import { ACTIVITY_URL, API_URL } from '@/components/api';
// import { useEmailConfigCheck } from '@/hooks/Emailconfigcheck';
// import EmailConfigModal from '@/components/EmailcheckModal';

// const API = API_URL;

// interface Buyer {
//   buyer_id: number;
//   buyer_date: string;
//   product: string;
//   hsn_code: string;
//   country: string;
//   company_name: string;
//   website: string;
//   contacts: string;
//   emails: string;
//   phone_revealed: boolean;
//   email_revealed: boolean;
// }

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

// /* ---------- Small visual helpers (avatar + status pill) ---------- */

// const AVATAR_PALETTE = [
//   { bg: '#8EE147', fg: '#0E223B' },
//   { bg: '#0E223B', fg: '#FFFFFF' },
//   { bg: '#6EC035', fg: '#0E223B' },
//   { bg: '#1A3355', fg: '#FFFFFF' },
//   { bg: '#A8E86A', fg: '#0E223B' },
//   { bg: '#2A4A6B', fg: '#FFFFFF' },
//   { bg: '#8EE147', fg: '#0E223B' },
//   { bg: '#3A6080', fg: '#FFFFFF' },
// ];

// function hashString(s: string) {
//   let h = 0;
//   for (let i = 0; i < s.length; i++) {
//     h = (h << 5) - h + s.charCodeAt(i);
//     h |= 0;
//   }
//   return Math.abs(h);
// }

// function CompanyAvatar({ name }: { name: string }) {
//   const safe = name || '?';
//   const palette = AVATAR_PALETTE[hashString(safe) % AVATAR_PALETTE.length];
//   const initial = safe.trim().charAt(0).toUpperCase();
//   return (
//     <div
//       className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center font-semibold text-xs"
//       style={{ backgroundColor: palette.bg, color: palette.fg }}
//       aria-hidden
//     >
//       {initial}
//     </div>
//   );
// }

// type RevealState = 'full' | 'partial' | 'locked';

// function getRevealState(buyer: Buyer): RevealState {
//   if (buyer.email_revealed && buyer.phone_revealed) return 'full';
//   if (buyer.email_revealed || buyer.phone_revealed) return 'partial';
//   return 'locked';
// }

// const REVEAL_STYLES: Record<RevealState, { label: string; className: string }> = {
//   full: { label: 'Revealed', className: 'bg-[#8EE147] text-[#0E223B]' },
//   partial: { label: 'Partial', className: 'bg-amber-50 text-amber-700' },
//   locked: { label: 'Locked', className: 'bg-slate-100 text-slate-500' },
// };

// function StatusPill({ state }: { state: RevealState }) {
//   const s = REVEAL_STYLES[state];
//   return (
//     <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${s.className}`}>
//       {s.label}
//     </span>
//   );
// }

// /* -------------------------------------------------------------- */

// /* Buyer Detail Modal */
// function BuyerDetailModal({
//   buyer,
//   onClose,
// }: {
//   buyer: Buyer | null;
//   onClose: () => void;
// }) {
//   if (!buyer) return null;

//   const fields: { label: string; value: string; icon: React.ReactNode }[] = [
//     { label: 'Company Name', value: buyer.company_name, icon: <Building2 className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     { label: 'Product', value: buyer.product, icon: <Package className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     { label: 'HSN Code', value: buyer.hsn_code, icon: <Hash className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     { label: 'Country', value: buyer.country, icon: <Globe className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     { label: 'Website', value: buyer.website, icon: <Globe className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     { label: 'Contacts', value: buyer.contacts, icon: <User className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     { label: 'Emails', value: buyer.emails, icon: <AtSign className="h-4 w-4" style={{ color: '#8EE147' }} /> },
//     {
//       label: 'Date',
//       value: buyer.buyer_date
//         ? new Date(buyer.buyer_date).toLocaleDateString('en-GB').replace(/\//g, '-')
//         : '',
//       icon: <Calendar className="h-4 w-4" style={{ color: '#8EE147' }} />,
//     },
//   ];

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-2 sm:p-4"
//       onClick={onClose}
//     >
//       <div
//         className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-2 sm:mx-4 overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="relative px-4 sm:px-6 py-4 sm:py-5" style={{ backgroundColor: '#0E223B' }}>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <CompanyAvatar name={buyer.company_name} />
//               <div>
//                 <div className="text-slate-400 text-[10px] font-medium mb-0.5">
//                   HSN {buyer.hsn_code}
//                 </div>
//                 <h2 className="text-lg sm:text-xl font-semibold text-white">{buyer.company_name}</h2>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               className="rounded-lg p-2 bg-white/10 hover:bg-white/20 transition-colors text-white"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>
//         </div>

//         <div className="p-4 sm:p-6 space-y-4">
//           {fields.map(({ label, value, icon }) =>
//             value ? (
//               <div key={label} className="flex items-start gap-3 group">
//                 <div className="mt-0.5 text-slate-400 group-hover:text-slate-600 transition-colors">
//                   {icon}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <span className="text-xs font-medium text-slate-400 block mb-0.5">
//                     {label}
//                   </span>
//                   {label === 'Website' ? (
//                     <a
//                       href={value.startsWith('http') ? value : `https://${value}`}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="text-sm text-[#8EE147] hover:text-[#6EC035] underline hover:no-underline transition-colors break-all"
//                     >
//                       {value}
//                     </a>
//                   ) : (
//                     <span className="text-sm text-slate-800 break-all font-medium">
//                       {value}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             ) : null
//           )}
//         </div>

//         <div className="px-4 sm:px-6 py-4 bg-slate-50 border-t flex justify-end">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={onClose}
//             className="hover:bg-slate-100 transition-colors"
//             style={{ borderColor: '#0E223B', color: '#0E223B' }}
//           >
//             Close
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// const Calendar = ({ className }: { className?: string }) => (
//   <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//   </svg>
// );

// function CopyButton({ value, type, buyerId, companyName }: {
//   value: string;
//   type: 'phone' | 'email';
//   buyerId?: number;
//   companyName?: string;
// }) {
//   const [copied, setCopied] = useState(false);

//   const handleCopy = async (e: React.MouseEvent) => {
//     e.stopPropagation();
//     try {
//       await navigator.clipboard.writeText(value);
//       setCopied(true);

//       const actionId = type === 'email' ? 48 : 49;
//       const actionName = type === 'email' ? 'Email' : 'Phone Number';

//       await createActivityLog(
//         actionId,
//         1,
//         `Copied ${actionName}: ${value}${companyName ? ` (${companyName})` : ''}`,
//         {
//           copyType: type,
//           copiedValue: value,
//           buyer_id: buyerId,
//           company_name: companyName
//         }
//       );

//       toast.success(`Copied to clipboard`);
//       setTimeout(() => setCopied(false), 1500);
//     } catch (err) {
//       console.error('Copy failed:', err);
//       toast.error('Failed to copy');
//     }
//   };

//   return (
//     <button
//       onClick={handleCopy}
//       className="shrink-0 p-0.5 rounded hover:bg-slate-100 transition-colors"
//       title={`Copy ${type === 'email' ? 'email' : 'phone'}`}
//     >
//       {copied ? 
//         <Check className="h-3 w-3" style={{ color: '#8EE147' }} /> : 
//         <Copy className="h-3 w-3" style={{ color: '#94A3B8' }} />
//       }
//     </button>
//   );
// }

// export default function SearchPage() {
//   const [rows, setRows] = useState<Buyer[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [query, setQuery] = useState('');
//   const [countries, setCountries] = useState<any[]>([]);
//   const [countryFilter, setCountryFilter] = useState('all');
//   const [productFilter, setProductFilter] = useState('all');
//   const [products, setProducts] = useState<any[]>([]);
//   const [page, setPage] = useState(0);
//   const [totalCount, setTotalCount] = useState(0);
//   const [selected, setSelected] = useState<Set<number>>(new Set());
//   const [emailOpen, setEmailOpen] = useState(false);
//   const [detailBuyer, setDetailBuyer] = useState<Buyer | null>(null);
//   const [submittingId, setSubmittingId] = useState<number | null>(null);
//   const [revealingId, setRevealingId] = useState<number | null>(null);
//   const [isMobile, setIsMobile] = useState(false);

//   const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   // Check for mobile view to adjust layout for sidebar
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   const revealContact = async (buyerId: number, type: 'phone' | 'email') => {
//     setRevealingId(buyerId);
//     try {
//       const seller = JSON.parse(localStorage.getItem("seller") || "{}");
//       const res = await fetch(`${API}/buyers/${buyerId}/reveal-contact`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ seller_id: seller.id, reveal_type: type }),
//       });
//       const json = await res.json();

//       if (json.success) {
//         const buyer = rows.find(r => r.buyer_id === buyerId);

//         setRows((prev) =>
//           prev.map((r) =>
//             r.buyer_id === buyerId
//               ? {
//                   ...r,
//                   contacts: type === 'phone' ? json.data.contacts : r.contacts,
//                   emails: type === 'email' ? json.data.emails : r.emails,
//                   phone_revealed: type === 'phone' ? true : r.phone_revealed,
//                   email_revealed: type === 'email' ? true : r.email_revealed,
//                 }
//               : r
//           )
//         );

//         if (type === 'phone') {
//           await createActivityLog(40, 1, `Revealed phone for: ${buyer?.company_name}`, {
//             buyer_id: buyerId,
//             company_name: buyer?.company_name,
//             phone: json.data.contacts
//           });
//         } else {
//           await createActivityLog(41, 1, `Revealed email for: ${buyer?.company_name}`, {
//             buyer_id: buyerId,
//             company_name: buyer?.company_name,
//             email: json.data.emails
//           });
//         }

//         toast.success(`${type === 'phone' ? 'Phone' : 'Email'} revealed!`);
//       } else {
//         toast.error(json.message || `Failed to reveal ${type}`);
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error(`Failed to reveal ${type}`);
//     } finally {
//       setRevealingId(null);
//     }
//   };

//   const perPage = 50;
//   const { checkEmailConfig, modalOpen, modalMessage, setModalOpen } = useEmailConfigCheck();

//   useEffect(() => {
//     loadFilters();
//     createActivityLog(16, 1, 'Viewed search page');
//     return () => {
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current);
//       }
//     };
//   }, []);

//   const loadFilters = async () => {
//     try {
//       const [countryRes, productRes] = await Promise.all([
//         fetch(`${API}/filters/buyer-countries`),
//         fetch(`${API}/filters/products`),
//       ]);
//       setCountries(await countryRes.json());
//       setProducts(await productRes.json());
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [page, query, countryFilter, productFilter]);

//   const seller = JSON.parse(localStorage.getItem("seller") || "{}");

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const params = new URLSearchParams();
//       params.set("seller_id", seller.id);
//       params.set('limit', String(perPage));
//       params.set('offset', String(page * perPage));
//       if (query) params.set('search', query);
//       if (countryFilter !== 'all') params.set('country', countryFilter);
//       if (productFilter !== 'all') params.set('product', productFilter);
//       const res = await fetch(`${API}/buyers?${params.toString()}`);
//       const json = await res.json();
//       setRows(json.data || []);
//       setTotalCount(json.total || 0);
//     } catch (err) {
//       console.error(err);
//       toast.error('Failed to fetch buyers');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logSearch = (searchValue: string) => {
//     if (!searchValue || searchValue.length < 2) return;

//     let actionId = 42;
//     let searchType = 'HSN';
//     const lowerValue = searchValue.toLowerCase();

//     const companyMatch = rows.some(r => r.company_name?.toLowerCase().includes(lowerValue));
//     const productMatch = rows.some(r => r.product?.toLowerCase().includes(lowerValue));
//     const countryMatch = rows.some(r => r.country?.toLowerCase().includes(lowerValue));

//     if (companyMatch) {
//       actionId = 43;
//       searchType = 'Company';
//     } else if (productMatch) {
//       actionId = 44;
//       searchType = 'Product';
//     } else if (countryMatch) {
//       actionId = 45;
//       searchType = 'Country';
//     }

//     createActivityLog(actionId, 1, `Searched by ${searchType}: ${searchValue}`, {
//       searchType: searchType,
//       searchValue: searchValue
//     });
//   };

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

//   const handleCountryFilter = (value: string) => {
//     setPage(0);
//     setCountryFilter(value);
//     if (value !== 'all') {
//       createActivityLog(45, 1, `Filtered by country: ${value}`, {
//         filterType: 'country',
//         filterValue: value
//       });
//     }
//   };

//   const handleProductFilter = (value: string) => {
//     setPage(0);
//     setProductFilter(value);
//     if (value !== 'all') {
//       createActivityLog(44, 1, `Filtered by product: ${value}`, {
//         filterType: 'product',
//         filterValue: value
//       });
//     }
//   };

//   const handleCountryDropdown = (value: string) => {
//     createActivityLog(46, 1, `Selected country from dropdown: ${value}`, {
//       dropdownType: 'countries',
//       selectedValue: value
//     });
//   };

//   const handleProductDropdown = (value: string) => {
//     createActivityLog(47, 1, `Selected product from dropdown: ${value}`, {
//       dropdownType: 'products',
//       selectedValue: value
//     });
//   };

//   const toggleSelect = (buyerId: number) => {
//     setSelected((prev) => {
//       const next = new Set(prev);
//       if (next.has(buyerId)) next.delete(buyerId);
//       else next.add(buyerId);
//       return next;
//     });
//   };

//   const selectAll = () => {
//     if (selected.size === rows.length) {
//       setSelected(new Set());
//     } else {
//       setSelected(new Set(rows.map((r) => r.buyer_id)));
//     }
//   };

//   const storeResponse = async (buyer: Buyer, responseType: 'interested' | 'not_interested') => {
//     if (!buyer.email_revealed) {
//       toast.error('Please reveal email first.');
//       return;
//     }
//     if (!buyer.phone_revealed) {
//       toast.error('Please reveal phone first.');
//       return;
//     }
//     setSubmittingId(buyer.buyer_id);

//     try {
//       const firstEmail = buyer.emails?.split(',')[0]?.trim();
//       if (!firstEmail) {
//         toast.error('No email found');
//         return;
//       }

//       const seller = JSON.parse(localStorage.getItem("seller") || "{}");
//       const payload = {
//         email: firstEmail,
//         response: responseType,
//         companyName: buyer.company_name,
//         country: buyer.country,
//         contactName: buyer.contacts || buyer.company_name,
//         productName: buyer.product,
//         templateUsed: 'Manual Entry',
//         buyer_id: buyer.buyer_id,
//         seller_id: seller.id || null,
//         hsn_code: buyer.hsn_code || ''
//       };

//       const response = await fetch(`${API}/api/store-response`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();

//       if (data.success) {
//         toast.success(`${responseType === 'interested' ? '✓ Interested' : '✗ Not Interested'} recorded!`);

//         const actionId = responseType === 'interested' ? 6 : 7;
//         await createActivityLog(actionId, 1,
//           `${responseType === 'interested' ? 'Interested' : 'Not Interested'}: ${buyer.company_name}`,
//           {
//             buyer_id: buyer.buyer_id,
//             company_name: buyer.company_name,
//             email: buyer.emails,
//             product: buyer.product,
//             hsn_code: buyer.hsn_code,
//             response: responseType
//           }
//         );
//       } else {
//         toast.error(data.error || 'Failed to record response');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       toast.error('Failed to record response');
//     } finally {
//       setSubmittingId(null);
//     }
//   };

//   const getSelectedBuyers = () => rows.filter(r => selected.has(r.buyer_id));

//   const getUniqueProducts = () => {
//     const selectedBuyers = getSelectedBuyers();
//     return [...new Set(selectedBuyers.map(b => b.product).filter(Boolean))];
//   };

//   const getProductToSend = () => {
//     const uniqueProducts = getUniqueProducts();
//     if (uniqueProducts.length === 0 || uniqueProducts.length > 1) {
//       return "General Products";
//     }
//     return uniqueProducts[0];
//   };

//   const isMultipleProductsSelected = () => {
//     const selectedBuyers = getSelectedBuyers();
//     const uniqueProducts = [...new Set(selectedBuyers.map(b => b.product).filter(Boolean))];
//     return uniqueProducts.length > 1;
//   };

//   const getRecipients = () => {
//     return getSelectedBuyers()
//       .filter((r) => r.email_revealed)
//       .flatMap((r) =>
//         (r.emails || '')
//           .split(',')
//           .map((email) => ({
//             name: r.company_name,
//             company: r.company_name,
//             company_name: r.company_name,
//             email: email.trim(),
//             country: r.country,
//             product: r.product,
//             hsn_code: r.hsn_code || '',
//             buyer_id: r.buyer_id,
//             templateUsed: 'Welcome Template',
//             contacts: r.contacts,
//           }))
//           .filter((recipient) => recipient.email)
//       );
//   };

//   const getLockedSelectedCount = () => {
//     return getSelectedBuyers().filter((r) => !r.email_revealed).length;
//   };

//   const totalPages = Math.ceil(totalCount / perPage);
//   const selectedCount = selected.size;

//   // Calculate main content padding based on sidebar state
//   // Desktop: sidebar is 255px expanded or 70px collapsed + 20px left margin
//   // Mobile: no sidebar padding needed
//   const getMainContentPadding = () => {
//     if (isMobile) {
//       return 'pl-2 pr-2';
//     }
//     // Desktop: leave space for sidebar (255px + 20px left margin + some extra)
//     return 'pl-[295px] pr-4';
//   };

//   return (
//     <div className={`min-h-screen p-1.5 sm:p-6 ${getMainContentPadding()}`} style={{ backgroundColor: '#0E223B' }}>
//       <div className="max-w-full sm:max-w-7xl mx-auto px-0.5 sm:px-2">
//         {/* Header - Responsive */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-6">
//           <div className="space-y-0.5">
//             <h1 className="text-lg sm:text-2xl font-semibold text-white">
//               Search Buyers
//             </h1>
//             <p className="text-[10px] sm:text-sm text-slate-300 flex items-center gap-1.5">
//               <Users className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" style={{ color: '#8EE147' }} />
//               <span className="hidden sm:inline">Find and connect with potential buyers worldwide</span>
//               <span className="sm:hidden">Find buyers worldwide</span>
//             </p>
//           </div>
//           <Button
//             onClick={async () => {
//               const selectedBuyers = getSelectedBuyers();
//               const lockedCount = selectedBuyers.filter((r) => !r.email_revealed).length;
//               const revealedCount = selectedBuyers.length - lockedCount;

//               if (revealedCount === 0) {
//                 toast.error(
//                   lockedCount === 1
//                     ? 'This buyer\'s email is locked. Reveal it first to send an email.'
//                     : 'All selected buyers have locked emails. Reveal at least one to send an email.'
//                 );
//                 return;
//               }

//               if (lockedCount > 0) {
//                 toast.warning(
//                   `${lockedCount} selected buyer${lockedCount > 1 ? 's have' : ' has'} a locked email and will be skipped.`
//                 );
//               }

//               const ok = await checkEmailConfig();
//               if (!ok) return;

//               setEmailOpen(true);
//               createActivityLog(6, 3, 'Opened email modal', {
//                 selected_count: selected.size,
//                 revealed_count: revealedCount,
//                 locked_skipped: lockedCount,
//               });
//             }}
//             disabled={selectedCount === 0}
//             className="gap-1 sm:gap-2 text-[#0E223B] font-medium shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4 rounded-xl"
//             style={{ backgroundColor: '#8EE147' }}
//           >
//             <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//             <span>Send Email</span>
//             {selectedCount > 0 && (
//               <span className="bg-[#0E223B]/20 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold">
//                 {selectedCount}
//               </span>
//             )}
//           </Button>
//         </div>

//         {/* Search and Filters - Responsive */}
//         <div className="rounded-2xl shadow-sm p-1.5 sm:p-3 mb-2.5 sm:mb-5" style={{ backgroundColor: '#0E223B', borderColor: '#1A3355', borderWidth: '1px' }}>
//           <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-3 items-stretch sm:items-center">
//             <div className="relative flex-1 min-w-[120px] sm:min-w-[200px]">
//               <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: '#8EE147' }} />
//               <Input
//                 placeholder="Search HSN, Company, Product, Country..."
//                 value={query}
//                 onChange={handleSearchChange}
//                 onKeyDown={handleSearchKeyDown}
//                 className="pl-8 sm:pl-10 border-slate-700 focus:border-[#8EE147] focus:ring-[#8EE147]/20 rounded-lg sm:rounded-xl w-full h-8 sm:h-10 text-[11px] sm:text-sm text-white placeholder:text-slate-400"
//                 style={{ backgroundColor: '#1A3355', borderColor: '#2A4A6B' }}
//               />
//             </div>

//             <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
//               <div className="relative w-full sm:w-36 lg:w-44">
//                 <Select value={countryFilter} onValueChange={handleCountryFilter}>
//                   <SelectTrigger 
//                     className="w-full focus:border-[#8EE147] rounded-lg sm:rounded-xl h-8 sm:h-10 text-[11px] sm:text-sm text-white"
//                     style={{ backgroundColor: '#1A3355', borderColor: '#2A4A6B' }}
//                   >
//                     <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" style={{ color: '#8EE147' }} />
//                     <SelectValue placeholder="Country" />
//                   </SelectTrigger>
//                   <SelectContent style={{ backgroundColor: '#1A3355', borderColor: '#2A4A6B' }}>
//                     <SelectItem value="all" className="text-white hover:bg-[#2A4A6B]">All Countries</SelectItem>
//                     {countries.map((c) => (
//                       <SelectItem
//                         key={c.country}
//                         value={c.country}
//                         onClick={() => handleCountryDropdown(c.country)}
//                         className="text-white hover:bg-[#2A4A6B]"
//                       >
//                         {c.country}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="relative w-full sm:w-36 lg:w-44">
//                 <Select value={productFilter} onValueChange={handleProductFilter}>
//                   <SelectTrigger 
//                     className="w-full focus:border-[#8EE147] rounded-lg sm:rounded-xl h-8 sm:h-10 text-[11px] sm:text-sm text-white"
//                     style={{ backgroundColor: '#1A3355', borderColor: '#2A4A6B' }}
//                   >
//                     <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" style={{ color: '#8EE147' }} />
//                     <SelectValue placeholder="Product" />
//                   </SelectTrigger>
//                   <SelectContent style={{ backgroundColor: '#1A3355', borderColor: '#2A4A6B' }}>
//                     <SelectItem value="all" className="text-white hover:bg-[#2A4A6B]">All Products</SelectItem>
//                     {products.map((p) => (
//                       <SelectItem
//                         key={p.product}
//                         value={p.product}
//                         onClick={() => handleProductDropdown(p.product)}
//                         className="text-white hover:bg-[#2A4A6B]"
//                       >
//                         {p.product}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Stats and Pagination - Responsive */}
//         <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-3 mb-2.5 sm:mb-4">
//           <div className="flex flex-wrap items-center gap-1 sm:gap-4 text-[10px] sm:text-sm">
//             <span className="text-slate-300">
//               Showing <span className="font-semibold text-white">{rows.length}</span> of{' '}
//               <span className="font-semibold text-white">{totalCount}</span> buyers
//             </span>
//             {selectedCount > 0 && (
//               <span className="inline-flex items-center gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 bg-[#8EE147] text-[#0E223B] rounded-full text-[9px] sm:text-xs font-medium">
//                 <Checkbox checked className="h-2.5 w-2.5 sm:h-3 sm:w-3" style={{ backgroundColor: '#0E223B', borderColor: '#0E223B' }} />
//                 {selectedCount} selected
//               </span>
//             )}
//           </div>
//           <div className="flex items-center gap-1 sm:gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               disabled={page === 0}
//               onClick={() => setPage((p) => p - 1)}
//               className="hover:bg-white/10 transition-colors h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg text-white border-white/20"
//               style={{ borderColor: 'rgba(255,255,255,0.2)' }}
//             >
//               <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//             </Button>
//             <div className="px-1.5 sm:px-4 py-1 bg-white/10 rounded-lg border border-white/20 text-[10px] sm:text-sm font-medium whitespace-nowrap text-white">
//               Page <span className="text-white">{page + 1}</span> / {totalPages || 1}
//             </div>
//             <Button
//               variant="outline"
//               size="sm"
//               disabled={page + 1 >= totalPages}
//               onClick={() => setPage((p) => p + 1)}
//               className="hover:bg-white/10 transition-colors h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg text-white border-white/20"
//               style={{ borderColor: 'rgba(255,255,255,0.2)' }}
//             >
//               <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//             </Button>
//           </div>
//         </div>

//         {/* Table View - Clean column-wise layout without overlap */}
//         {loading ? (
//           <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col items-center justify-center h-48 sm:h-64 gap-3 sm:gap-4">
//             <Loader2 className="h-9 w-9 sm:h-11 sm:w-11 animate-spin" style={{ color: '#8EE147' }} />
//             <p className="text-xs sm:text-sm text-slate-400">Loading buyers...</p>
//           </div>
//         ) : rows.length === 0 ? (
//           <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col items-center justify-center h-48 sm:h-64 gap-2 sm:gap-3 px-4">
//             <div className="p-3 sm:p-4 bg-[#8EE147]/10 rounded-full">
//               <Search className="h-8 w-8 sm:h-10 sm:w-10" style={{ color: '#8EE147' }} />
//             </div>
//             <p className="text-sm sm:text-base font-medium text-white">No buyers found</p>
//             <p className="text-[10px] sm:text-sm text-slate-400 text-center">Try adjusting your filters or search terms</p>
//           </div>
//         ) : (
//           <div className="rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: '#0E223B' }}>
//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[1200px] border-collapse">
//                 {/* Table Header */}
//                 <thead>
//                   <tr className="border-b" style={{ backgroundColor: '#1A3355', borderColor: '#2A4A6B' }}>
//                     <th className="w-10 px-3 py-3 text-left">
//                       <Checkbox
//                         checked={selected.size === rows.length && rows.length > 0}
//                         onCheckedChange={selectAll}
//                         className="data-[state=checked]:bg-[#8EE147] data-[state=checked]:border-[#8EE147]"
//                       />
//                     </th>
//                     <th className="px-3 py-3 text-left text-xs font-semibold" style={{ color: '#94A3B8' }}>Buyer</th>
//                     <th className="px-3 py-3 text-left text-xs font-semibold" style={{ color: '#94A3B8' }}>Country</th>
//                     <th className="px-3 py-3 text-left text-xs font-semibold" style={{ color: '#94A3B8' }}>Contact</th>
//                     <th className="px-3 py-3 text-left text-xs font-semibold" style={{ color: '#94A3B8' }}>Email</th>
//                     <th className="px-3 py-3 text-center text-xs font-semibold" style={{ color: '#94A3B8' }}>Status</th>
//                     <th className="px-3 py-3 text-center text-xs font-semibold" style={{ color: '#94A3B8' }}>Date</th>
//                     <th className="px-3 py-3 text-center text-xs font-semibold" style={{ color: '#94A3B8' }}>HSN</th>
//                     <th className="px-3 py-3 text-right text-xs font-semibold" style={{ color: '#94A3B8' }}>Actions</th>
//                   </tr>
//                 </thead>
//                 {/* Table Body */}
//                 <tbody>
//                   {rows.map((r) => {
//                     const state = getRevealState(r);
//                     return (
//                       <tr
//                         key={r.buyer_id}
//                         className={`border-b transition-colors ${
//                           selected.has(r.buyer_id) ? 'bg-[#1A3355]' : 'hover:bg-[#1A3355]/50'
//                         }`}
//                         style={{ borderColor: '#1A3355' }}
//                       >
//                         {/* Checkbox */}
//                         <td className="w-10 px-3 py-2.5">
//                           <Checkbox
//                             checked={selected.has(r.buyer_id)}
//                             onCheckedChange={() => toggleSelect(r.buyer_id)}
//                             className="data-[state=checked]:bg-[#8EE147] data-[state=checked]:border-[#8EE147]"
//                           />
//                         </td>

//                         {/* Buyer - Company Name + Product */}
//                         <td className="px-3 py-2.5">
//                           <div className="flex items-center gap-2">
//                             <CompanyAvatar name={r.company_name} />
//                             <div>
//                               <button
//                                 onClick={() => {
//                                   setDetailBuyer(r);
//                                   createActivityLog(7, 3, `Viewed buyer details: ${r.company_name}`, {
//                                     buyer_id: r.buyer_id,
//                                     company_name: r.company_name,
//                                     hsn_code: r.hsn_code
//                                   });
//                                 }}
//                                 className="font-medium text-sm hover:underline text-left block truncate max-w-[180px] text-white"
//                                 title={r.company_name}
//                               >
//                                 {r.company_name}
//                               </button>
//                               <div className="text-xs text-slate-400 truncate max-w-[180px]" title={r.product}>
//                                 {r.product}
//                               </div>
//                             </div>
//                           </div>
//                         </td>

//                         {/* Country */}
//                         <td className="px-3 py-2.5">
//                           <span className="text-sm text-slate-300 truncate block max-w-[100px]" title={r.country}>
//                             {r.country}
//                           </span>
//                         </td>

//                         {/* Contact */}
//                         <td className="px-3 py-2.5">
//                           {r.phone_revealed ? (
//                             <div className="flex items-center gap-1">
//                               <span className="text-sm text-slate-300 truncate max-w-[120px]" title={r.contacts}>
//                                 {r.contacts}
//                               </span>
//                               <CopyButton
//                                 value={r.contacts}
//                                 type="phone"
//                                 buyerId={r.buyer_id}
//                                 companyName={r.company_name}
//                               />
//                             </div>
//                           ) : (
//                             <button
//                               onClick={() => revealContact(r.buyer_id, "phone")}
//                               disabled={revealingId === r.buyer_id}
//                               className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 transition-colors whitespace-nowrap"
//                             >
//                               {revealingId === r.buyer_id ? (
//                                 <Loader2 className="h-3 w-3 animate-spin" style={{ color: '#8EE147' }} />
//                               ) : (
//                                 <>
//                                   <Lock className="h-3 w-3" style={{ color: '#8EE147' }} />
//                                   <span>Locked</span>
//                                 </>
//                               )}
//                             </button>
//                           )}
//                         </td>

//                         {/* Email */}
//                         <td className="px-3 py-2.5">
//                           {r.email_revealed ? (
//                             <div className="flex items-center gap-1">
//                               <span className="text-sm text-slate-300 truncate max-w-[150px]" title={r.emails}>
//                                 {r.emails}
//                               </span>
//                               <CopyButton
//                                 value={r.emails}
//                                 type="email"
//                                 buyerId={r.buyer_id}
//                                 companyName={r.company_name}
//                               />
//                             </div>
//                           ) : (
//                             <button
//                               onClick={() => revealContact(r.buyer_id, "email")}
//                               disabled={revealingId === r.buyer_id}
//                               className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 transition-colors whitespace-nowrap"
//                             >
//                               {revealingId === r.buyer_id ? (
//                                 <Loader2 className="h-3 w-3 animate-spin" style={{ color: '#8EE147' }} />
//                               ) : (
//                                 <>
//                                   <Lock className="h-3 w-3" style={{ color: '#8EE147' }} />
//                                   <span>Locked</span>
//                                 </>
//                               )}
//                             </button>
//                           )}
//                         </td>

//                         {/* Status */}
//                         <td className="px-3 py-2.5 text-center">
//                           <div className="flex justify-center">
//                             <StatusPill state={state} />
//                           </div>
//                         </td>

//                         {/* Date */}
//                         <td className="px-3 py-2.5 text-center">
//                           <span className="text-xs text-slate-400 whitespace-nowrap">
//                             {r.buyer_date
//                               ? new Date(r.buyer_date).toLocaleDateString('en-GB').replace(/\//g, '-')
//                               : '—'}
//                           </span>
//                         </td>

//                         {/* HSN */}
//                         <td className="px-3 py-2.5 text-center">
//                           <div className="flex justify-center">
//                             <span 
//                               className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs font-medium whitespace-nowrap"
//                               style={{
//                                 backgroundColor: '#1A3355',
//                                 borderColor: '#2A4A6B',
//                                 color: '#94A3B8'
//                               }}
//                             >
//                               <Hash className="h-2.5 w-2.5" style={{ color: '#8EE147' }} />
//                               {r.hsn_code}
//                             </span>
//                           </div>
//                         </td>

//                         {/* Actions */}
//                         <td className="px-3 py-2.5 text-right">
//                           <div className="flex items-center justify-end gap-0.5">
//                             <button
//                               onClick={() => {
//                                 setDetailBuyer(r);
//                                 createActivityLog(7, 3, `Viewed buyer details: ${r.company_name}`, {
//                                   buyer_id: r.buyer_id,
//                                   company_name: r.company_name,
//                                   hsn_code: r.hsn_code
//                                 });
//                               }}
//                               title="View details"
//                               className="p-1.5 rounded-lg hover:bg-[#1A3355] transition-colors"
//                               style={{ color: '#64748B' }}
//                             >
//                               <Eye className="h-3.5 w-3.5" />
//                             </button>
//                             <button
//                               onClick={() => storeResponse(r, 'interested')}
//                               disabled={submittingId === r.buyer_id}
//                               title="Mark interested"
//                               className="p-1.5 rounded-lg hover:bg-[#1A3355] transition-colors disabled:opacity-40"
//                               style={{ color: '#8EE147' }}
//                             >
//                               {submittingId === r.buyer_id ? (
//                                 <Loader2 className="h-3.5 w-3.5 animate-spin" />
//                               ) : (
//                                 <ThumbsUp className="h-3.5 w-3.5" />
//                               )}
//                             </button>
//                             <button
//                               onClick={() => storeResponse(r, 'not_interested')}
//                               disabled={submittingId === r.buyer_id}
//                               title="Mark not interested"
//                               className="p-1.5 rounded-lg hover:bg-[#1A3355] text-rose-400 hover:text-rose-300 transition-colors disabled:opacity-40"
//                             >
//                               {submittingId === r.buyer_id ? (
//                                 <Loader2 className="h-3.5 w-3.5 animate-spin" />
//                               ) : (
//                                 <ThumbsDown className="h-3.5 w-3.5" />
//                               )}
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* Bottom Pagination - Responsive */}
//         {rows.length > 0 && (
//           <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 mt-3 sm:mt-5 text-[10px] sm:text-sm text-slate-400">
//             <span>
//               Showing {page * perPage + 1} - {Math.min((page + 1) * perPage, totalCount)} of {totalCount}
//             </span>
//             <div className="flex items-center gap-1.5 sm:gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 disabled={page === 0}
//                 onClick={() => setPage((p) => p - 1)}
//                 className="h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg text-white border-white/20 hover:bg-white/10"
//                 style={{ borderColor: 'rgba(255,255,255,0.2)' }}
//               >
//                 <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//               </Button>
//               <div className="px-1.5 sm:px-3 py-1 bg-white/10 rounded-lg border border-white/20 text-[10px] sm:text-xs font-medium text-white">
//                 {page + 1} / {totalPages || 1}
//               </div>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 disabled={page + 1 >= totalPages}
//                 onClick={() => setPage((p) => p + 1)}
//                 className="h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg text-white border-white/20 hover:bg-white/10"
//                 style={{ borderColor: 'rgba(255,255,255,0.2)' }}
//               >
//                 <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>

//       <BuyerDetailModal buyer={detailBuyer} onClose={() => setDetailBuyer(null)} />

//       <EmailModal
//         open={emailOpen}
//         recipients={getRecipients()}
//         product={getProductToSend()}
//         multipleProducts={isMultipleProductsSelected()}
//         onClose={() => setEmailOpen(false)}
//       />

//       <EmailConfigModal
//         open={modalOpen}
//         message={modalMessage}
//         onClose={() => setModalOpen(false)}
//       />
//     </div>
//   );
// }





import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search, Loader2, ChevronLeft, ChevronRight, Mail, X,
  ThumbsUp, ThumbsDown, Users, Building2, Globe,
  Package, Hash, Filter, ArrowUpDown,
  Send, User, MapPin, AtSign, Phone, Lock,
  Copy, Check, Eye
} from 'lucide-react';
import EmailModal from '@/components/EmailModal';
import { toast } from 'sonner';
import { ACTIVITY_URL, API_URL } from '@/components/api';
import { useEmailConfigCheck } from '@/hooks/Emailconfigcheck';
import EmailConfigModal from '@/components/EmailcheckModal';

const API = API_URL;

interface Buyer {
  buyer_id: number;
  buyer_date: string;
  product: string;
  hsn_code: string;
  country: string;
  company_name: string;
  website: string;
  contacts: string;
  emails: string;
  phone_revealed: boolean;
  email_revealed: boolean;
}

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

/* ---------- Small visual helpers (avatar + status pill) ---------- */

const AVATAR_PALETTE = [
  { bg: '#8EE147', fg: '#0E223B' },
  { bg: '#0E223B', fg: '#FFFFFF' },
  { bg: '#6EC035', fg: '#0E223B' },
  { bg: '#1A3355', fg: '#FFFFFF' },
  { bg: '#A8E86A', fg: '#0E223B' },
  { bg: '#2A4A6B', fg: '#FFFFFF' },
  { bg: '#8EE147', fg: '#0E223B' },
  { bg: '#3A6080', fg: '#FFFFFF' },
];

function hashString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function CompanyAvatar({ name }: { name: string }) {
  const safe = name || '?';
  const palette = AVATAR_PALETTE[hashString(safe) % AVATAR_PALETTE.length];
  const initial = safe.trim().charAt(0).toUpperCase();
  return (
    <div
      className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center font-semibold text-xs"
      style={{ backgroundColor: palette.bg, color: palette.fg }}
      aria-hidden
    >
      {initial}
    </div>
  );
}

type RevealState = 'full' | 'partial' | 'locked';

function getRevealState(buyer: Buyer): RevealState {
  if (buyer.email_revealed && buyer.phone_revealed) return 'full';
  if (buyer.email_revealed || buyer.phone_revealed) return 'partial';
  return 'locked';
}

const REVEAL_STYLES: Record<RevealState, { label: string; className: string }> = {
  full: { label: 'Revealed', className: 'bg-[#8EE147] text-[#0E223B]' },
  partial: { label: 'Partial', className: 'bg-amber-50 text-amber-700' },
  locked: { label: 'Locked', className: 'bg-slate-100 text-slate-500' },
};

function StatusPill({ state }: { state: RevealState }) {
  const s = REVEAL_STYLES[state];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}

/* -------------------------------------------------------------- */

/* Buyer Detail Modal */
function BuyerDetailModal({
  buyer,
  onClose,
}: {
  buyer: Buyer | null;
  onClose: () => void;
}) {
  if (!buyer) return null;

  const fields: { label: string; value: string; icon: React.ReactNode }[] = [
    { label: 'Company Name', value: buyer.company_name, icon: <Building2 className="h-4 w-4" style={{ color: '#8EE147' }} /> },
    { label: 'Product', value: buyer.product, icon: <Package className="h-4 w-4" style={{ color: '#8EE147' }} /> },
    { label: 'HSN Code', value: buyer.hsn_code, icon: <Hash className="h-4 w-4" style={{ color: '#8EE147' }} /> },
    { label: 'Country', value: buyer.country, icon: <Globe className="h-4 w-4" style={{ color: '#8EE147' }} /> },
    { label: 'Website', value: buyer.website, icon: <Globe className="h-4 w-4" style={{ color: '#8EE147' }} /> },
    { label: 'Contacts', value: buyer.contacts, icon: <User className="h-4 w-4" style={{ color: '#8EE147' }} /> },
    { label: 'Emails', value: buyer.emails, icon: <AtSign className="h-4 w-4" style={{ color: '#8EE147' }} /> },
    {
      label: 'Date',
      value: buyer.buyer_date
        ? new Date(buyer.buyer_date).toLocaleDateString('en-GB').replace(/\//g, '-')
        : '',
      icon: <Calendar className="h-4 w-4" style={{ color: '#8EE147' }} />,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-2 sm:mx-4 overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative px-4 sm:px-6 py-4 sm:py-5" style={{ backgroundColor: '#0E223B' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CompanyAvatar name={buyer.company_name} />
              <div>
                <div className="text-slate-400 text-[10px] font-medium mb-0.5">
                  HSN {buyer.hsn_code}
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-white">{buyer.company_name}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {fields.map(({ label, value, icon }) =>
            value ? (
              <div key={label} className="flex items-start gap-3 group">
                <div className="mt-0.5 text-slate-400 group-hover:text-slate-600 transition-colors">
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">
                    {label}
                  </span>
                  {label === 'Website' ? (
                    <a
                      href={value.startsWith('http') ? value : `https://${value}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-[#8EE147] hover:text-[#6EC035] underline hover:no-underline transition-colors break-all"
                    >
                      {value}
                    </a>
                  ) : (
                    <span className="text-sm text-slate-800 break-all font-medium">
                      {value}
                    </span>
                  )}
                </div>
              </div>
            ) : null
          )}
        </div>

        <div className="px-4 sm:px-6 py-4 bg-slate-50 border-t flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="hover:bg-slate-100 transition-colors"
            style={{ borderColor: '#0E223B', color: '#0E223B' }}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

const Calendar = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

function CopyButton({ value, type, buyerId, companyName }: {
  value: string;
  type: 'phone' | 'email';
  buyerId?: number;
  companyName?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);

      const actionId = type === 'email' ? 48 : 49;
      const actionName = type === 'email' ? 'Email' : 'Phone Number';

      await createActivityLog(
        actionId,
        1,
        `Copied ${actionName}: ${value}${companyName ? ` (${companyName})` : ''}`,
        {
          copyType: type,
          copiedValue: value,
          buyer_id: buyerId,
          company_name: companyName
        }
      );

      toast.success(`Copied to clipboard`);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error('Failed to copy');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 p-0.5 rounded hover:bg-slate-100 transition-colors"
      title={`Copy ${type === 'email' ? 'email' : 'phone'}`}
    >
      {copied ? 
        <Check className="h-3 w-3" style={{ color: '#8EE147' }} /> : 
        <Copy className="h-3 w-3" style={{ color: '#94A3B8' }} />
      }
    </button>
  );
}

export default function SearchPage() {
  const [rows, setRows] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [countries, setCountries] = useState<any[]>([]);
  const [countryFilter, setCountryFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [emailOpen, setEmailOpen] = useState(false);
  const [detailBuyer, setDetailBuyer] = useState<Buyer | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [revealingId, setRevealingId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for mobile view to adjust layout for sidebar
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const revealContact = async (buyerId: number, type: 'phone' | 'email') => {
    setRevealingId(buyerId);
    try {
      const seller = JSON.parse(localStorage.getItem("seller") || "{}");
      const res = await fetch(`${API}/buyers/${buyerId}/reveal-contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seller_id: seller.id, reveal_type: type }),
      });
      const json = await res.json();

      if (json.success) {
        const buyer = rows.find(r => r.buyer_id === buyerId);

        setRows((prev) =>
          prev.map((r) =>
            r.buyer_id === buyerId
              ? {
                  ...r,
                  contacts: type === 'phone' ? json.data.contacts : r.contacts,
                  emails: type === 'email' ? json.data.emails : r.emails,
                  phone_revealed: type === 'phone' ? true : r.phone_revealed,
                  email_revealed: type === 'email' ? true : r.email_revealed,
                }
              : r
          )
        );

        if (type === 'phone') {
          await createActivityLog(40, 1, `Revealed phone for: ${buyer?.company_name}`, {
            buyer_id: buyerId,
            company_name: buyer?.company_name,
            phone: json.data.contacts
          });
        } else {
          await createActivityLog(41, 1, `Revealed email for: ${buyer?.company_name}`, {
            buyer_id: buyerId,
            company_name: buyer?.company_name,
            email: json.data.emails
          });
        }

        toast.success(`${type === 'phone' ? 'Phone' : 'Email'} revealed!`);
      } else {
        toast.error(json.message || `Failed to reveal ${type}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(`Failed to reveal ${type}`);
    } finally {
      setRevealingId(null);
    }
  };

  const perPage = 50;
  const { checkEmailConfig, modalOpen, modalMessage, setModalOpen } = useEmailConfigCheck();

  useEffect(() => {
    loadFilters();
    createActivityLog(16, 1, 'Viewed search page');
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const loadFilters = async () => {
    try {
      const [countryRes, productRes] = await Promise.all([
        fetch(`${API}/filters/buyer-countries`),
        fetch(`${API}/filters/products`),
      ]);
      setCountries(await countryRes.json());
      setProducts(await productRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, query, countryFilter, productFilter]);

  const seller = JSON.parse(localStorage.getItem("seller") || "{}");

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("seller_id", seller.id);
      params.set('limit', String(perPage));
      params.set('offset', String(page * perPage));
      if (query) params.set('search', query);
      if (countryFilter !== 'all') params.set('country', countryFilter);
      if (productFilter !== 'all') params.set('product', productFilter);
      const res = await fetch(`${API}/buyers?${params.toString()}`);
      const json = await res.json();
      setRows(json.data || []);
      setTotalCount(json.total || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch buyers');
    } finally {
      setLoading(false);
    }
  };

  const logSearch = (searchValue: string) => {
    if (!searchValue || searchValue.length < 2) return;

    let actionId = 42;
    let searchType = 'HSN';
    const lowerValue = searchValue.toLowerCase();

    const companyMatch = rows.some(r => r.company_name?.toLowerCase().includes(lowerValue));
    const productMatch = rows.some(r => r.product?.toLowerCase().includes(lowerValue));
    const countryMatch = rows.some(r => r.country?.toLowerCase().includes(lowerValue));

    if (companyMatch) {
      actionId = 43;
      searchType = 'Company';
    } else if (productMatch) {
      actionId = 44;
      searchType = 'Product';
    } else if (countryMatch) {
      actionId = 45;
      searchType = 'Country';
    }

    createActivityLog(actionId, 1, `Searched by ${searchType}: ${searchValue}`, {
      searchType: searchType,
      searchValue: searchValue
    });
  };

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

  const handleCountryFilter = (value: string) => {
    setPage(0);
    setCountryFilter(value);
    if (value !== 'all') {
      createActivityLog(45, 1, `Filtered by country: ${value}`, {
        filterType: 'country',
        filterValue: value
      });
    }
  };

  const handleProductFilter = (value: string) => {
    setPage(0);
    setProductFilter(value);
    if (value !== 'all') {
      createActivityLog(44, 1, `Filtered by product: ${value}`, {
        filterType: 'product',
        filterValue: value
      });
    }
  };

  const handleCountryDropdown = (value: string) => {
    createActivityLog(46, 1, `Selected country from dropdown: ${value}`, {
      dropdownType: 'countries',
      selectedValue: value
    });
  };

  const handleProductDropdown = (value: string) => {
    createActivityLog(47, 1, `Selected product from dropdown: ${value}`, {
      dropdownType: 'products',
      selectedValue: value
    });
  };

  const toggleSelect = (buyerId: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(buyerId)) next.delete(buyerId);
      else next.add(buyerId);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === rows.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map((r) => r.buyer_id)));
    }
  };

  const storeResponse = async (buyer: Buyer, responseType: 'interested' | 'not_interested') => {
    if (!buyer.email_revealed) {
      toast.error('Please reveal email first.');
      return;
    }
    if (!buyer.phone_revealed) {
      toast.error('Please reveal phone first.');
      return;
    }
    setSubmittingId(buyer.buyer_id);

    try {
      const firstEmail = buyer.emails?.split(',')[0]?.trim();
      if (!firstEmail) {
        toast.error('No email found');
        return;
      }

      const seller = JSON.parse(localStorage.getItem("seller") || "{}");
      const payload = {
        email: firstEmail,
        response: responseType,
        companyName: buyer.company_name,
        country: buyer.country,
        contactName: buyer.contacts || buyer.company_name,
        productName: buyer.product,
        templateUsed: 'Manual Entry',
        buyer_id: buyer.buyer_id,
        seller_id: seller.id || null,
        hsn_code: buyer.hsn_code || ''
      };

      const response = await fetch(`${API}/api/store-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`${responseType === 'interested' ? '✓ Interested' : '✗ Not Interested'} recorded!`);

        const actionId = responseType === 'interested' ? 6 : 7;
        await createActivityLog(actionId, 1,
          `${responseType === 'interested' ? 'Interested' : 'Not Interested'}: ${buyer.company_name}`,
          {
            buyer_id: buyer.buyer_id,
            company_name: buyer.company_name,
            email: buyer.emails,
            product: buyer.product,
            hsn_code: buyer.hsn_code,
            response: responseType
          }
        );
      } else {
        toast.error(data.error || 'Failed to record response');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to record response');
    } finally {
      setSubmittingId(null);
    }
  };

  const getSelectedBuyers = () => rows.filter(r => selected.has(r.buyer_id));

  const getUniqueProducts = () => {
    const selectedBuyers = getSelectedBuyers();
    return [...new Set(selectedBuyers.map(b => b.product).filter(Boolean))];
  };

  const getProductToSend = () => {
    const uniqueProducts = getUniqueProducts();
    if (uniqueProducts.length === 0 || uniqueProducts.length > 1) {
      return "General Products";
    }
    return uniqueProducts[0];
  };

  const isMultipleProductsSelected = () => {
    const selectedBuyers = getSelectedBuyers();
    const uniqueProducts = [...new Set(selectedBuyers.map(b => b.product).filter(Boolean))];
    return uniqueProducts.length > 1;
  };

  const getRecipients = () => {
    return getSelectedBuyers()
      .filter((r) => r.email_revealed)
      .flatMap((r) =>
        (r.emails || '')
          .split(',')
          .map((email) => ({
            name: r.company_name,
            company: r.company_name,
            company_name: r.company_name,
            email: email.trim(),
            country: r.country,
            product: r.product,
            hsn_code: r.hsn_code || '',
            buyer_id: r.buyer_id,
            templateUsed: 'Welcome Template',
            contacts: r.contacts,
          }))
          .filter((recipient) => recipient.email)
      );
  };

  const getLockedSelectedCount = () => {
    return getSelectedBuyers().filter((r) => !r.email_revealed).length;
  };

  const totalPages = Math.ceil(totalCount / perPage);
  const selectedCount = selected.size;

  // Calculate main content padding based on sidebar state
  // Desktop: sidebar is 255px expanded or 70px collapsed + 20px left margin
  // Mobile: no sidebar padding needed
  const getMainContentPadding = () => {
    if (isMobile) {
      return 'pl-2 pr-2';
    }
    // Desktop: leave space for sidebar (255px + 20px left margin + some extra)
    return 'pl-[295px] pr-4';
  };

  return (
    <div className={`min-h-screen p-1.5 sm:p-6 ${getMainContentPadding()}`} style={{ backgroundColor: '#0E223B' }}>
      <div className="max-w-full sm:max-w-7xl mx-auto px-0.5 sm:px-2">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-6">
          <div className="space-y-0.5">
            <h1 className="text-lg sm:text-2xl font-semibold text-white">
              Search Buyers
            </h1>
            <p className="text-[10px] sm:text-sm text-slate-300 flex items-center gap-1.5">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" style={{ color: '#8EE147' }} />
              <span className="hidden sm:inline">Find and connect with potential buyers worldwide</span>
              <span className="sm:hidden">Find buyers worldwide</span>
            </p>
          </div>
          <Button
            onClick={async () => {
              const selectedBuyers = getSelectedBuyers();
              const lockedCount = selectedBuyers.filter((r) => !r.email_revealed).length;
              const revealedCount = selectedBuyers.length - lockedCount;

              if (revealedCount === 0) {
                toast.error(
                  lockedCount === 1
                    ? 'This buyer\'s email is locked. Reveal it first to send an email.'
                    : 'All selected buyers have locked emails. Reveal at least one to send an email.'
                );
                return;
              }

              if (lockedCount > 0) {
                toast.warning(
                  `${lockedCount} selected buyer${lockedCount > 1 ? 's have' : ' has'} a locked email and will be skipped.`
                );
              }

              const ok = await checkEmailConfig();
              if (!ok) return;

              setEmailOpen(true);
              createActivityLog(6, 3, 'Opened email modal', {
                selected_count: selected.size,
                revealed_count: revealedCount,
                locked_skipped: lockedCount,
              });
            }}
            disabled={selectedCount === 0}
            className="gap-1 sm:gap-2 text-[#0E223B] font-medium shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4 rounded-xl"
            style={{ backgroundColor: '#8EE147' }}
          >
            <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Send Email</span>
            {selectedCount > 0 && (
              <span className="bg-[#0E223B]/20 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold">
                {selectedCount}
              </span>
            )}
          </Button>
        </div>

        {/* Search and Filters - Responsive */}
        <div className="rounded-2xl shadow-sm p-1.5 sm:p-3 mb-2.5 sm:mb-5" style={{ backgroundColor: '#0E223B', borderColor: '#1A3355', borderWidth: '1px' }}>
          <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-3 items-stretch sm:items-center">
            <div className="relative flex-1 min-w-[120px] sm:min-w-[200px]">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: '#8EE147' }} />
              <Input
                placeholder="Search HSN, Company, Product, Country..."
                value={query}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                className="pl-8 sm:pl-10 border-slate-700 focus:border-[#8EE147] focus:ring-[#8EE147]/20 rounded-lg sm:rounded-xl w-full h-8 sm:h-10 text-[11px] sm:text-sm text-white placeholder:text-slate-400"
                style={{ backgroundColor: '#1A3355', borderColor: '#2A4A6B' }}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
              <div className="relative w-full sm:w-36 lg:w-44">
                <Select value={countryFilter} onValueChange={handleCountryFilter}>
                  <SelectTrigger 
                    className="w-full focus:border-[#8EE147] rounded-lg sm:rounded-xl h-8 sm:h-10 text-[11px] sm:text-sm text-white"
                    style={{ backgroundColor: '#1A3355', borderColor: '#2A4A6B' }}
                  >
                    <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" style={{ color: '#8EE147' }} />
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: '#1A3355', borderColor: '#2A4A6B' }}>
                    <SelectItem value="all" className="text-white hover:bg-[#2A4A6B]">All Countries</SelectItem>
                    {countries.map((c) => (
                      <SelectItem
                        key={c.country}
                        value={c.country}
                        onClick={() => handleCountryDropdown(c.country)}
                        className="text-white hover:bg-[#2A4A6B]"
                      >
                        {c.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative w-full sm:w-36 lg:w-44">
                <Select value={productFilter} onValueChange={handleProductFilter}>
                  <SelectTrigger 
                    className="w-full focus:border-[#8EE147] rounded-lg sm:rounded-xl h-8 sm:h-10 text-[11px] sm:text-sm text-white"
                    style={{ backgroundColor: '#1A3355', borderColor: '#2A4A6B' }}
                  >
                    <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" style={{ color: '#8EE147' }} />
                    <SelectValue placeholder="Product" />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: '#1A3355', borderColor: '#2A4A6B' }}>
                    <SelectItem value="all" className="text-white hover:bg-[#2A4A6B]">All Products</SelectItem>
                    {products.map((p) => (
                      <SelectItem
                        key={p.product}
                        value={p.product}
                        onClick={() => handleProductDropdown(p.product)}
                        className="text-white hover:bg-[#2A4A6B]"
                      >
                        {p.product}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats and Pagination - Responsive */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-3 mb-2.5 sm:mb-4">
          <div className="flex flex-wrap items-center gap-1 sm:gap-4 text-[10px] sm:text-sm">
            <span className="text-slate-300">
              Showing <span className="font-semibold text-white">{rows.length}</span> of{' '}
              <span className="font-semibold text-white">{totalCount}</span> buyers
            </span>
            {selectedCount > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 bg-[#8EE147] text-[#0E223B] rounded-full text-[9px] sm:text-xs font-medium">
                <Checkbox checked className="h-2.5 w-2.5 sm:h-3 sm:w-3" style={{ backgroundColor: '#0E223B', borderColor: '#0E223B' }} />
                {selectedCount} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="hover:bg-[#1A3355] transition-colors h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg"
              style={{ 
                borderColor: '#2A4A6B', 
                color: '#8EE147',
                backgroundColor: '#0E223B'
              }}
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: '#8EE147' }} />
            </Button>
            <div className="px-1.5 sm:px-4 py-1 bg-[#1A3355] rounded-lg border text-[10px] sm:text-sm font-medium whitespace-nowrap" style={{ borderColor: '#2A4A6B', color: '#94A3B8' }}>
              Page <span className="text-white">{page + 1}</span> / {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="hover:bg-[#1A3355] transition-colors h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg"
              style={{ 
                borderColor: '#2A4A6B', 
                color: '#8EE147',
                backgroundColor: '#0E223B'
              }}
            >
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: '#8EE147' }} />
            </Button>
          </div>
        </div>

        {/* Table View - Clean column-wise layout without overlap */}
        {loading ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col items-center justify-center h-48 sm:h-64 gap-3 sm:gap-4">
            <Loader2 className="h-9 w-9 sm:h-11 sm:w-11 animate-spin" style={{ color: '#8EE147' }} />
            <p className="text-xs sm:text-sm text-slate-400">Loading buyers...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col items-center justify-center h-48 sm:h-64 gap-2 sm:gap-3 px-4">
            <div className="p-3 sm:p-4 bg-[#8EE147]/10 rounded-full">
              <Search className="h-8 w-8 sm:h-10 sm:w-10" style={{ color: '#8EE147' }} />
            </div>
            <p className="text-sm sm:text-base font-medium text-white">No buyers found</p>
            <p className="text-[10px] sm:text-sm text-slate-400 text-center">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: '#0E223B' }}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] border-collapse">
                {/* Table Header */}
                <thead>
                  <tr className="border-b" style={{ backgroundColor: '#1A3355', borderColor: '#2A4A6B' }}>
                    <th className="w-10 px-3 py-3 text-left">
                      <Checkbox
                        checked={selected.size === rows.length && rows.length > 0}
                        onCheckedChange={selectAll}
                        className="data-[state=checked]:bg-[#8EE147] data-[state=checked]:border-[#8EE147]"
                      />
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold" style={{ color: '#94A3B8' }}>Buyer</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold" style={{ color: '#94A3B8' }}>Country</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold" style={{ color: '#94A3B8' }}>Contact</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold" style={{ color: '#94A3B8' }}>Email</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold" style={{ color: '#94A3B8' }}>Status</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold" style={{ color: '#94A3B8' }}>Date</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold" style={{ color: '#94A3B8' }}>HSN</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold" style={{ color: '#94A3B8' }}>Actions</th>
                  </tr>
                </thead>
                {/* Table Body */}
                <tbody>
                  {rows.map((r) => {
                    const state = getRevealState(r);
                    return (
                      <tr
                        key={r.buyer_id}
                        className={`border-b transition-colors ${
                          selected.has(r.buyer_id) ? 'bg-[#1A3355]' : 'hover:bg-[#1A3355]/50'
                        }`}
                        style={{ borderColor: '#1A3355' }}
                      >
                        {/* Checkbox */}
                        <td className="w-10 px-3 py-2.5">
                          <Checkbox
                            checked={selected.has(r.buyer_id)}
                            onCheckedChange={() => toggleSelect(r.buyer_id)}
                            className="data-[state=checked]:bg-[#8EE147] data-[state=checked]:border-[#8EE147]"
                          />
                        </td>

                        {/* Buyer - Company Name + Product */}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <CompanyAvatar name={r.company_name} />
                            <div>
                              <button
                                onClick={() => {
                                  setDetailBuyer(r);
                                  createActivityLog(7, 3, `Viewed buyer details: ${r.company_name}`, {
                                    buyer_id: r.buyer_id,
                                    company_name: r.company_name,
                                    hsn_code: r.hsn_code
                                  });
                                }}
                                className="font-medium text-sm hover:underline text-left block truncate max-w-[180px] text-white"
                                title={r.company_name}
                              >
                                {r.company_name}
                              </button>
                              <div className="text-xs text-slate-400 truncate max-w-[180px]" title={r.product}>
                                {r.product}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Country */}
                        <td className="px-3 py-2.5">
                          <span className="text-sm text-slate-300 truncate block max-w-[100px]" title={r.country}>
                            {r.country}
                          </span>
                        </td>

                        {/* Contact */}
                        <td className="px-3 py-2.5">
                          {r.phone_revealed ? (
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-slate-300 truncate max-w-[120px]" title={r.contacts}>
                                {r.contacts}
                              </span>
                              <CopyButton
                                value={r.contacts}
                                type="phone"
                                buyerId={r.buyer_id}
                                companyName={r.company_name}
                              />
                            </div>
                          ) : (
                            <button
                              onClick={() => revealContact(r.buyer_id, "phone")}
                              disabled={revealingId === r.buyer_id}
                              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 transition-colors whitespace-nowrap"
                            >
                              {revealingId === r.buyer_id ? (
                                <Loader2 className="h-3 w-3 animate-spin" style={{ color: '#8EE147' }} />
                              ) : (
                                <>
                                  <Lock className="h-3 w-3" style={{ color: '#8EE147' }} />
                                  <span>Locked</span>
                                </>
                              )}
                            </button>
                          )}
                        </td>

                        {/* Email */}
                        <td className="px-3 py-2.5">
                          {r.email_revealed ? (
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-slate-300 truncate max-w-[150px]" title={r.emails}>
                                {r.emails}
                              </span>
                              <CopyButton
                                value={r.emails}
                                type="email"
                                buyerId={r.buyer_id}
                                companyName={r.company_name}
                              />
                            </div>
                          ) : (
                            <button
                              onClick={() => revealContact(r.buyer_id, "email")}
                              disabled={revealingId === r.buyer_id}
                              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 transition-colors whitespace-nowrap"
                            >
                              {revealingId === r.buyer_id ? (
                                <Loader2 className="h-3 w-3 animate-spin" style={{ color: '#8EE147' }} />
                              ) : (
                                <>
                                  <Lock className="h-3 w-3" style={{ color: '#8EE147' }} />
                                  <span>Locked</span>
                                </>
                              )}
                            </button>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-2.5 text-center">
                          <div className="flex justify-center">
                            <StatusPill state={state} />
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-3 py-2.5 text-center">
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {r.buyer_date
                              ? new Date(r.buyer_date).toLocaleDateString('en-GB').replace(/\//g, '-')
                              : '—'}
                          </span>
                        </td>

                        {/* HSN */}
                        <td className="px-3 py-2.5 text-center">
                          <div className="flex justify-center">
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs font-medium whitespace-nowrap"
                              style={{
                                backgroundColor: '#1A3355',
                                borderColor: '#2A4A6B',
                                color: '#94A3B8'
                              }}
                            >
                              <Hash className="h-2.5 w-2.5" style={{ color: '#8EE147' }} />
                              {r.hsn_code}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-0.5">
                            <button
                              onClick={() => {
                                setDetailBuyer(r);
                                createActivityLog(7, 3, `Viewed buyer details: ${r.company_name}`, {
                                  buyer_id: r.buyer_id,
                                  company_name: r.company_name,
                                  hsn_code: r.hsn_code
                                });
                              }}
                              title="View details"
                              className="p-1.5 rounded-lg hover:bg-[#1A3355] transition-colors"
                              style={{ color: '#64748B' }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => storeResponse(r, 'interested')}
                              disabled={submittingId === r.buyer_id}
                              title="Mark interested"
                              className="p-1.5 rounded-lg hover:bg-[#1A3355] transition-colors disabled:opacity-40"
                              style={{ color: '#8EE147' }}
                            >
                              {submittingId === r.buyer_id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <ThumbsUp className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => storeResponse(r, 'not_interested')}
                              disabled={submittingId === r.buyer_id}
                              title="Mark not interested"
                              className="p-1.5 rounded-lg hover:bg-[#1A3355] text-rose-400 hover:text-rose-300 transition-colors disabled:opacity-40"
                            >
                              {submittingId === r.buyer_id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <ThumbsDown className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bottom Pagination - Responsive */}
        {rows.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 mt-3 sm:mt-5 text-[10px] sm:text-sm text-slate-400">
            <span>
              Showing {page * perPage + 1} - {Math.min((page + 1) * perPage, totalCount)} of {totalCount}
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="hover:bg-[#1A3355] transition-colors h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg"
                style={{ 
                  borderColor: '#2A4A6B', 
                  color: '#8EE147',
                  backgroundColor: '#0E223B'
                }}
              >
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: '#8EE147' }} />
              </Button>
              <div className="px-1.5 sm:px-3 py-1 bg-[#1A3355] rounded-lg border text-[10px] sm:text-xs font-medium" style={{ borderColor: '#2A4A6B', color: '#94A3B8' }}>
                {page + 1} / {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="hover:bg-[#1A3355] transition-colors h-7 sm:h-9 px-1.5 sm:px-3 rounded-lg"
                style={{ 
                  borderColor: '#2A4A6B', 
                  color: '#8EE147',
                  backgroundColor: '#0E223B'
                }}
              >
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: '#8EE147' }} />
              </Button>
            </div>
          </div>
        )}
      </div>

      <BuyerDetailModal buyer={detailBuyer} onClose={() => setDetailBuyer(null)} />

      <EmailModal
        open={emailOpen}
        recipients={getRecipients()}
        product={getProductToSend()}
        multipleProducts={isMultipleProductsSelected()}
        onClose={() => setEmailOpen(false)}
      />

      <EmailConfigModal
        open={modalOpen}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}