import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmailModal } from '@/components/EmailModal';
import { Search, Mail, Eye } from 'lucide-react';
import axios from 'axios';
import { API_URL, ACTIVITY_URL } from '@/components/api';

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

  useEffect(() => {
    fetchContacts();
    // Log page view (action_id: 20 for Contacts Page View)
    createActivityLog(19, 4, 'Viewed contacts page');
  }, []);

const fetchContacts = async () => {
  try {
    const seller = JSON.parse(
  localStorage.getItem("seller")
);
    const sellerId = seller.id;

    if (!sellerId) {
      console.error('No sellerId found — user may not be logged in');
      setLoading(false);
      return;
    }

    const response = await axios.get(`${API_URL}/api/contacts?seller_id=${sellerId}`);
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
      return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">✓ Sent</span>;
    }
    return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">Pending</span>;
  };

  const getResponseBadge = (contact: Contact) => {
    if (contact.response === 'interested') {
      return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">✅ Interested</span>;
    }
    return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">No Response</span>;
  };

  const viewContactDetails = (buyerId: number) => {
    // Log view contact details (action_id: 23)
    const contact = contacts.find(c => c.buyer_id === buyerId);
    createActivityLog(10, 4, `Viewed contact details for: ${contact?.contact_name || buyerId}`, {
      buyer_id: buyerId,
      contact_name: contact?.contact_name,
      company_name: contact?.company_name
    });
    navigate(`/contactsindetail/${buyerId}`);
  };

  const handleEmailModalOpen = () => {
    // Log email modal open (action_id: 24)
    createActivityLog(24, 4, 'Opened email modal from contacts page', {
      selected_count: selected.size
    });
    setEmailOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and communicate with your contacts
          </p>
        </div>
        <Button 
          onClick={handleEmailModalOpen} 
          disabled={selected.size === 0} 
          className="gap-2"
        >
          <Mail className="h-4 w-4" /> 
          Send Email ({selected.size})
        </Button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, company, product, or template..." 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            className="pl-10 bg-card" 
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48 bg-card">
            <SelectValue placeholder="All Templates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Templates</SelectItem>
            {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-muted-foreground">{filtered.length} contacts found</p>
        {selected.size > 0 && (
          <p className="text-sm text-primary">{selected.size} selected</p>
        )}
      </div>

      <div className="bg-card rounded-lg border overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="p-3 w-10">
                <Checkbox 
                  checked={selected.size === filtered.length && filtered.length > 0} 
                  onCheckedChange={selectAll} 
                />
              </th>
              <th className="p-3 text-left font-medium text-foreground">Company</th>
              <th className="p-3 text-left font-medium text-foreground">Product</th>
              <th className="p-3 text-left font-medium text-foreground">Template</th>
              <th className="p-3 text-left font-medium text-foreground">Interactions</th>
              <th className="p-3 text-left font-medium text-foreground">Status</th>
              <th className="p-3 text-left font-medium text-foreground">Response</th>
              <th className="p-3 text-left font-medium text-foreground">Email</th>
              <th className="p-3 text-left font-medium text-foreground">Phone</th>
              <th className="p-3 text-left font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(contact => (
              <tr key={contact.buyer_id} className="border-b hover:bg-muted/20 transition-colors">
                <td className="p-3" onClick={(e) => e.stopPropagation()}>
                  <Checkbox 
                    checked={selected.has(contact.buyer_id)} 
                    onCheckedChange={() => toggleSelect(contact.buyer_id)} 
                  />
                </td>
                <td className="p-3">
                  <span className="text-muted-foreground">{contact.company_name || '-'}</span>
                </td>
                <td className="p-3">
                  <span className="text-muted-foreground">{contact.product_name || '-'}</span>
                </td>
                <td className="p-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                    {contact.template_used || 'No Template'}
                  </span>
                </td>
                <td className="p-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                    {contact.interaction_count}
                  </span>
                </td>
                <td className="p-3">
                  {getStatusBadge(contact)}
                </td>
                <td className="p-3">
                  {getResponseBadge(contact)}
                </td>
                <td className="p-3">
                  <span className="text-xs text-primary break-all">{contact.from_email || '-'}</span>
                </td>
                <td className="p-3">
                  <span className="text-xs text-muted-foreground">{contact.phone || '-'}</span>
                </td>
                <td className="p-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1 h-8 px-2"
                    onClick={() => viewContactDetails(contact.buyer_id)}
                  >
                    <Eye className="h-3 w-3" />
                    View 
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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