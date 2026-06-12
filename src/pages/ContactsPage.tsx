import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmailModal } from '@/components/EmailModal';
import { Search, Mail, Eye } from 'lucide-react';
import axios from 'axios';

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
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/replyhistory');
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
    navigate(`/contactsindetail/${buyerId}`);
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
        <Button onClick={() => setEmailOpen(true)} disabled={selected.size === 0} className="gap-2">
          <Mail className="h-4 w-4" /> Send Email ({selected.size})
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
              <th className="p-3 text-left font-medium text-foreground">Contact</th>
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
                  <div>
                    <p className="font-medium text-foreground">{contact.contact_name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">ID: {contact.buyer_id}</p>
                  </div>
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