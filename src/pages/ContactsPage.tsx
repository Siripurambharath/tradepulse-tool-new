// import { useState, useMemo, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { EmailModal } from '@/components/EmailModal';
// import { Search, Mail, Eye } from 'lucide-react';
// import axios from 'axios';
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

// // Update interface to match backend response
// interface Contact {
//   buyer_id: number;
//   contact_name: string;
//   from_email: string;
//   to_email: string;
//   company_name: string;
//   country: string;
//   product_name: string;
//   template_used: string;
//   phone: string;
//   interaction_count: number;
//   status: string;
//   response: string | null;
//   last_interaction: string;
// }

// export default function ContactsPage() {
//   const navigate = useNavigate();
//   const [query, setQuery] = useState('');
//   const [roleFilter, setRoleFilter] = useState('all');
//   const [selected, setSelected] = useState(new Set<number>());
//   const [emailOpen, setEmailOpen] = useState(false);
//   const [contacts, setContacts] = useState<Contact[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchContacts();
//     // Log page view (action_id: 20 for Contacts Page View)
//     createActivityLog(19, 4, 'Viewed contacts page');
//   }, []);

// const fetchContacts = async () => {
//   try {
//     const seller = JSON.parse(
//   localStorage.getItem("seller")
// );
//     const sellerId = seller.id;

//     if (!sellerId) {
//       console.error('No sellerId found — user may not be logged in');
//       setLoading(false);
//       return;
//     }

//     const response = await axios.get(`${API_URL}/api/contacts?seller_id=${sellerId}`);
//     if (response.data.success) {
//       setContacts(response.data.data);
//       console.log('Fetched contacts:', response.data.data);
//     }
//   } catch (error) {
//     console.error('Error fetching contacts:', error);
//   } finally {
//     setLoading(false);
//   }
// };

//   // Get unique roles from template_used
//   const roles = useMemo(() => {
//     const roleSet = new Set<string>();
//     contacts.forEach(contact => {
//       if (contact.template_used) roleSet.add(contact.template_used);
//     });
//     return Array.from(roleSet).sort();
//   }, [contacts]);

//   // Filter contacts based on search and role
//   const filtered = useMemo(() => {
//     return contacts.filter(contact => {
//       const q = query.toLowerCase();
//       const matchesQuery = !q || 
//         contact.contact_name?.toLowerCase().includes(q) || 
//         contact.from_email?.toLowerCase().includes(q) || 
//         contact.company_name?.toLowerCase().includes(q) ||
//         contact.template_used?.toLowerCase().includes(q) ||
//         contact.product_name?.toLowerCase().includes(q);
      
//       const matchesRole = roleFilter === 'all' || contact.template_used === roleFilter;
//       return matchesQuery && matchesRole;
//     });
//   }, [query, roleFilter, contacts]);

//   // Log search activity when query changes
//   useEffect(() => {
//     if (query) {
//       createActivityLog(21, 4, `Searched contacts with text: ${query}`, {
//         searchQuery: query
//       });
//     }
//   }, [query]);

//   // Log filter activity when role filter changes
//   useEffect(() => {
//     if (roleFilter !== 'all') {
//       createActivityLog(22, 4, `Filtered contacts by template: ${roleFilter}`, {
//         template: roleFilter
//       });
//     }
//   }, [roleFilter]);

//   const toggleSelect = (buyerId: number) => {
//     const next = new Set(selected);
//     next.has(buyerId) ? next.delete(buyerId) : next.add(buyerId);
//     setSelected(next);
//   };

//   const selectAll = () => {
//     if (selected.size === filtered.length) setSelected(new Set());
//     else setSelected(new Set(filtered.map(contact => contact.buyer_id)));
//   };

//   const getSelectedContacts = () => {
//     return filtered.filter(contact => selected.has(contact.buyer_id));
//   };

//   const getUniqueProducts = () => {
//     const selectedContacts = getSelectedContacts();
//     const uniqueProducts = [...new Set(selectedContacts.map(c => c.product_name).filter(Boolean))];
//     return uniqueProducts;
//   };

//   const getProductToSend = () => {
//     const uniqueProducts = getUniqueProducts();
//     if (uniqueProducts.length === 0 || uniqueProducts.length > 1) {
//       return "General Products";
//     }
//     return uniqueProducts[0];
//   };

//   const isMultipleProductsSelected = () => {
//     const selectedContacts = getSelectedContacts();
//     const uniqueProducts = [...new Set(selectedContacts.map(c => c.product_name).filter(Boolean))];
//     return uniqueProducts.length > 1;
//   };

//   const getRecipients = () => filtered
//     .filter(contact => selected.has(contact.buyer_id))
//     .map(contact => ({ 
//       name: contact.contact_name, 
//       email: contact.from_email, 
//       company: contact.company_name,
//       country: contact.country,
//       product: contact.product_name,
//       buyer_id: contact.buyer_id
//     }));

//   const getStatusBadge = (contact: Contact) => {
//     if (contact.status === 'sent') {
//       return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">✓ Sent</span>;
//     }
//     return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">Pending</span>;
//   };

//   const getResponseBadge = (contact: Contact) => {
//     if (contact.response === 'interested') {
//       return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">✅ Interested</span>;
//     }
//     return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">No Response</span>;
//   };

//   const viewContactDetails = (buyerId: number) => {
//     // Log view contact details (action_id: 23)
//     const contact = contacts.find(c => c.buyer_id === buyerId);
//     createActivityLog(10, 4, `Viewed contact details for: ${contact?.contact_name || buyerId}`, {
//       buyer_id: buyerId,
//       contact_name: contact?.contact_name,
//       company_name: contact?.company_name
//     });
//     navigate(`/contactsindetail/${buyerId}`);
//   };

//   const handleEmailModalOpen = () => {
//     // Log email modal open (action_id: 24)
//     createActivityLog(24, 4, 'Opened email modal from contacts page', {
//       selected_count: selected.size
//     });
//     setEmailOpen(true);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
//           <p className="mt-4 text-muted-foreground">Loading contacts...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto py-6">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
//           <p className="text-sm text-muted-foreground mt-1">
//             Manage and communicate with your contacts
//           </p>
//         </div>
//         <Button 
//           onClick={handleEmailModalOpen} 
//           disabled={selected.size === 0} 
//           className="gap-2"
//         >
//           <Mail className="h-4 w-4" /> 
//           Send Email ({selected.size})
//         </Button>
//       </div>

//       <div className="flex gap-3 mb-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input 
//             placeholder="Search by name, email, company, product, or template..." 
//             value={query} 
//             onChange={e => setQuery(e.target.value)} 
//             className="pl-10 bg-card" 
//           />
//         </div>
//         <Select value={roleFilter} onValueChange={setRoleFilter}>
//           <SelectTrigger className="w-48 bg-card">
//             <SelectValue placeholder="All Templates" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Templates</SelectItem>
//             {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
//           </SelectContent>
//         </Select>
//       </div>

//       <div className="flex justify-between items-center mb-3">
//         <p className="text-sm text-muted-foreground">{filtered.length} contacts found</p>
//         {selected.size > 0 && (
//           <p className="text-sm text-primary">{selected.size} selected</p>
//         )}
//       </div>

//       <div className="bg-card rounded-lg border overflow-auto">
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="border-b bg-muted/30">
//               <th className="p-3 w-10">
//                 <Checkbox 
//                   checked={selected.size === filtered.length && filtered.length > 0} 
//                   onCheckedChange={selectAll} 
//                 />
//               </th>
//               <th className="p-3 text-left font-medium text-foreground">Company</th>
//               <th className="p-3 text-left font-medium text-foreground">Product</th>
//               <th className="p-3 text-left font-medium text-foreground">Template</th>
//               <th className="p-3 text-left font-medium text-foreground">Interactions</th>
//               <th className="p-3 text-left font-medium text-foreground">Status</th>
//               <th className="p-3 text-left font-medium text-foreground">Response</th>
//               <th className="p-3 text-left font-medium text-foreground">Email</th>
//               <th className="p-3 text-left font-medium text-foreground">Phone</th>
//               <th className="p-3 text-left font-medium text-foreground">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filtered.map(contact => (
//               <tr key={contact.buyer_id} className="border-b hover:bg-muted/20 transition-colors">
//                 <td className="p-3" onClick={(e) => e.stopPropagation()}>
//                   <Checkbox 
//                     checked={selected.has(contact.buyer_id)} 
//                     onCheckedChange={() => toggleSelect(contact.buyer_id)} 
//                   />
//                 </td>
//                 <td className="p-3">
//                   <span className="text-muted-foreground">{contact.company_name || '-'}</span>
//                 </td>
//                 <td className="p-3">
//                   <span className="text-muted-foreground">{contact.product_name || '-'}</span>
//                 </td>
//                 <td className="p-3">
//                   <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
//                     {contact.template_used || 'No Template'}
//                   </span>
//                 </td>
//                 <td className="p-3">
//                   <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
//                     {contact.interaction_count}
//                   </span>
//                 </td>
//                 <td className="p-3">
//                   {getStatusBadge(contact)}
//                 </td>
//                 <td className="p-3">
//                   {getResponseBadge(contact)}
//                 </td>
//                 <td className="p-3">
//                   <span className="text-xs text-primary break-all">{contact.from_email || '-'}</span>
//                 </td>
//                 <td className="p-3">
//                   <span className="text-xs text-muted-foreground">{contact.phone || '-'}</span>
//                 </td>
//                 <td className="p-3">
//                   <Button 
//                     variant="ghost" 
//                     size="sm" 
//                     className="gap-1 h-8 px-2"
//                     onClick={() => viewContactDetails(contact.buyer_id)}
//                   >
//                     <Eye className="h-3 w-3" />
//                     View 
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <EmailModal 
//         open={emailOpen} 
//         onClose={() => setEmailOpen(false)} 
//         recipients={getRecipients()}
//         product={getProductToSend()}
//         multipleProducts={isMultipleProductsSelected()}
//       />
//     </div>
//   );
// }





import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmailModal } from '@/components/EmailModal';
import { 
  Search, Mail, Eye, Users, Building2, Package, 
  MessageSquare, Phone, AtSign, Filter, Sparkles,
  TrendingUp, Clock, CheckCircle, XCircle, User,
  Calendar, ArrowUpRight, LayoutGrid, List, Send
} from 'lucide-react';
import axios from 'axios';

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

// Update interface to match backend response
interface Contact {
  buyer_id: number;
  contact_name: string;
  from_email: string;
  to_email: string;
  company_name: string;
  country: string;
  product_name: string;
  template_used: string;
  phone: string;
  interaction_count: number;
  status: string;
  response: string | null;
  last_interaction: string;
}

export default function ContactsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selected, setSelected] = useState(new Set<number>());
  const [emailOpen, setEmailOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  useEffect(() => {
    fetchContacts();
    createActivityLog(19, 4, 'Viewed contacts page');
  }, []);

  const fetchContacts = async () => {
    try {
      const seller = JSON.parse(localStorage.getItem("seller"));
      const sellerId = seller.id;

      if (!sellerId) {
        console.error('No sellerId found — user may not be logged in');
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/contacts?seller_id=${sellerId}`);
      if (response.data.success) {
        setContacts(response.data.data);
        console.log('Fetched contacts:', response.data.data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique roles from template_used
  const roles = useMemo(() => {
    const roleSet = new Set<string>();
    contacts.forEach(contact => {
      if (contact.template_used) roleSet.add(contact.template_used);
    });
    return Array.from(roleSet).sort();
  }, [contacts]);

  // Filter contacts based on search and role
  const filtered = useMemo(() => {
    return contacts.filter(contact => {
      const q = query.toLowerCase();
      const matchesQuery = !q || 
        contact.contact_name?.toLowerCase().includes(q) || 
        contact.from_email?.toLowerCase().includes(q) || 
        contact.company_name?.toLowerCase().includes(q) ||
        contact.template_used?.toLowerCase().includes(q) ||
        contact.product_name?.toLowerCase().includes(q);
      
      const matchesRole = roleFilter === 'all' || contact.template_used === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [query, roleFilter, contacts]);

  // Log search activity when query changes
  useEffect(() => {
    if (query) {
      createActivityLog(21, 4, `Searched contacts with text: ${query}`, {
        searchQuery: query
      });
    }
  }, [query]);

  // Log filter activity when role filter changes
  useEffect(() => {
    if (roleFilter !== 'all') {
      createActivityLog(22, 4, `Filtered contacts by template: ${roleFilter}`, {
        template: roleFilter
      });
    }
  }, [roleFilter]);

  const toggleSelect = (buyerId: number) => {
    const next = new Set(selected);
    next.has(buyerId) ? next.delete(buyerId) : next.add(buyerId);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(contact => contact.buyer_id)));
  };

  const getSelectedContacts = () => {
    return filtered.filter(contact => selected.has(contact.buyer_id));
  };

  const getUniqueProducts = () => {
    const selectedContacts = getSelectedContacts();
    const uniqueProducts = [...new Set(selectedContacts.map(c => c.product_name).filter(Boolean))];
    return uniqueProducts;
  };

  const getProductToSend = () => {
    const uniqueProducts = getUniqueProducts();
    if (uniqueProducts.length === 0 || uniqueProducts.length > 1) {
      return "General Products";
    }
    return uniqueProducts[0];
  };

  const isMultipleProductsSelected = () => {
    const selectedContacts = getSelectedContacts();
    const uniqueProducts = [...new Set(selectedContacts.map(c => c.product_name).filter(Boolean))];
    return uniqueProducts.length > 1;
  };

  const getRecipients = () => filtered
    .filter(contact => selected.has(contact.buyer_id))
    .map(contact => ({ 
      name: contact.contact_name, 
      email: contact.from_email, 
      company: contact.company_name,
      country: contact.country,
      product: contact.product_name,
      buyer_id: contact.buyer_id
    }));

  const getStatusBadge = (contact: Contact) => {
    if (contact.status === 'sent') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200">
          <CheckCircle className="h-3 w-3" />
          Sent
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border border-gray-200">
        <Clock className="h-3 w-3" />
        Pending
      </span>
    );
  };

  const getResponseBadge = (contact: Contact) => {
    if (contact.response === 'interested') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200">
          <TrendingUp className="h-3 w-3" />
          Interested
        </span>
      );
    }
    if (contact.response === 'not_interested') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200">
          <XCircle className="h-3 w-3" />
          Not Interested
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-50 to-slate-50 text-gray-500 border border-gray-200">
        <Clock className="h-3 w-3" />
        No Response
      </span>
    );
  };

  const viewContactDetails = (buyerId: number) => {
    const contact = contacts.find(c => c.buyer_id === buyerId);
    createActivityLog(10, 4, `Viewed contact details for: ${contact?.contact_name || buyerId}`, {
      buyer_id: buyerId,
      contact_name: contact?.contact_name,
      company_name: contact?.company_name
    });
    navigate(`/contactsindetail/${buyerId}`);
  };

  const handleEmailModalOpen = () => {
    createActivityLog(24, 4, 'Opened email modal from contacts page', {
      selected_count: selected.size
    });
    setEmailOpen(true);
  };

  // Stats
  const stats = useMemo(() => {
    const total = contacts.length;
    const interested = contacts.filter(c => c.response === 'interested').length;
    const notInterested = contacts.filter(c => c.response === 'not_interested').length;
    const pending = contacts.filter(c => c.response === null).length;
    return { total, interested, notInterested, pending };
  }, [contacts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-xl opacity-20 animate-pulse" />
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto relative" />
          </div>
          <p className="mt-6 text-sm font-medium text-muted-foreground animate-pulse">
            Loading contacts...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 p-6">
      {/* Decorative header gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              Contacts
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Manage and communicate with your contacts
            </p>
          </div>
          <Button 
            onClick={handleEmailModalOpen} 
            disabled={selected.size === 0} 
            className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            <span>Send Email</span>
            {selected.size > 0 && (
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                {selected.size}
              </span>
            )}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Contacts</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Interested</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.interested}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Not Interested</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.notInterested}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Response</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters with glassmorphism */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
              <Input 
                placeholder="Search by name, email, company, product..." 
                value={query} 
                onChange={e => setQuery(e.target.value)} 
                className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl bg-white/80"
              />
            </div>
            
            <div className="relative">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48 border-gray-200 focus:border-blue-400 rounded-xl bg-white/80">
                  <Filter className="h-4 w-4 mr-2 text-blue-500" />
                  <SelectValue placeholder="All Templates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📋 All Templates</SelectItem>
                  {roles.map(r => (
                    <SelectItem key={r} value={r}>
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-blue-500" />
                        {r}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* View toggle */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl ml-auto">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'table' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Table View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Grid View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span> contacts found
            </span>
            {selected.size > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                <Checkbox checked className="h-3 w-3" />
                {selected.size} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Table with modern design */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 border-b border-gray-200">
                  <th className="p-4 w-12">
                    <Checkbox 
                      checked={selected.size === filtered.length && filtered.length > 0} 
                      onCheckedChange={selectAll}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-500" />
                      Company
                    </div>
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-500" />
                      Product
                    </div>
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      Template
                    </div>
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      Interactions
                    </div>
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                    Status
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                    Response
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <AtSign className="h-4 w-4 text-blue-500" />
                      Email
                    </div>
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-500" />
                      Phone
                    </div>
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((contact, index) => (
                  <tr 
                    key={contact.buyer_id} 
                    className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 ${
                      selected.has(contact.buyer_id) ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selected.has(contact.buyer_id)} 
                        onCheckedChange={() => toggleSelect(contact.buyer_id)}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
                          {contact.company_name?.charAt(0) || 'C'}
                        </div>
                        <span className="font-medium text-gray-800">
                          {contact.company_name || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-600">{contact.product_name || '-'}</span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200">
                        <Sparkles className="h-3 w-3" />
                        {contact.template_used || 'No Template'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 font-bold text-sm">
                        {contact.interaction_count}
                      </span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(contact)}
                    </td>
                    <td className="p-4">
                      {getResponseBadge(contact)}
                    </td>
                    <td className="p-4">
                      <a href={`mailto:${contact.from_email}`} className="text-blue-600 hover:text-blue-800 hover:underline transition-colors text-xs">
                        {contact.from_email || '-'}
                      </a>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-500 text-xs">{contact.phone || '-'}</span>
                    </td>
                    <td className="p-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1.5 h-9 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded-lg transition-colors"
                        onClick={() => viewContactDetails(contact.buyer_id)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                        <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="p-4 bg-gray-50 rounded-full">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-muted-foreground font-medium">No contacts found</p>
              <p className="text-sm text-muted-foreground/70">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Bottom section */}
        {filtered.length > 0 && (
          <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
            <span>
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> contacts
            </span>
            <div className="flex items-center gap-4">
              <span className="text-xs">
                {selected.size > 0 && `${selected.size} selected`}
              </span>
            </div>
          </div>
        )}
      </div>

      <EmailModal 
        open={emailOpen} 
        onClose={() => setEmailOpen(false)} 
        recipients={getRecipients()}
        product={getProductToSend()}
        multipleProducts={isMultipleProductsSelected()}
      />
    </div>
  );
}