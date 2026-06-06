import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmailModal } from '@/components/EmailModal';
import { Search, Mail } from 'lucide-react';
import axios from 'axios';

export default function ContactsPage() {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selected, setSelected] = useState(new Set());
  const [emailOpen, setEmailOpen] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/replyhistory');
        if (response.data.success) {
          setReplies(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching replies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReplies();
  }, []);

  // Get unique roles from template_used
  const roles = useMemo(() => {
    const roleSet = new Set();
    replies.forEach(reply => {
      if (reply.template_used) roleSet.add(reply.template_used);
    });
    return [...roleSet].sort();
  }, [replies]);

  // Filter contacts based on search and role
  const filtered = useMemo(() => {
    return replies.filter(reply => {
      const q = query.toLowerCase();
      const matchesQuery = !q || 
        reply.contact_name?.toLowerCase().includes(q) || 
        reply.to_email?.toLowerCase().includes(q) || 
        reply.company_name?.toLowerCase().includes(q);
      const matchesRole = roleFilter === 'all' || reply.template_used === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [query, roleFilter, replies]);

  const toggleSelect = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(reply => reply.id)));
  };

  const getRecipients = () => filtered
    .filter(reply => selected.has(reply.id))
    .map(reply => ({ 
      name: reply.contact_name, 
      email: reply.to_email, 
      company: reply.company_name 
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading replies...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        {/* <h1 className="text-2xl font-bold text-foreground">Email Replies</h1> */}
          <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
        {/* <Button onClick={() => setEmailOpen(true)} disabled={selected.size === 0} className="gap-2">
          <Mail className="h-4 w-4" /> Send Email ({selected.size})
        </Button> */}
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search contacts..." 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            className="pl-10 bg-card" 
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48 bg-card">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{filtered.length} contacts found</p>

      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              {/* <th className="p-3 w-10">
                <Checkbox 
                  checked={selected.size === filtered.length && filtered.length > 0} 
                  onCheckedChange={selectAll} 
                />
              </th> */}
              <th className="p-3 text-left font-medium text-foreground">Name</th>
                <th className="p-3 text-left font-medium text-foreground">Product</th>
              <th className="p-3 text-left font-medium text-foreground">Company</th>
              {/* <th className="p-3 text-left font-medium text-foreground">Role</th>
              <th className="p-3 text-left font-medium text-foreground">Department</th> */}
              <th className="p-3 text-left font-medium text-foreground">Email</th>
              <th className="p-3 text-left font-medium text-foreground">Phone</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map(reply => (
              <tr key={reply.id} className="border-b hover:bg-muted/20 transition-colors">
                {/* <td className="p-3">
                  <Checkbox 
                    checked={selected.has(reply.id)} 
                    onCheckedChange={() => toggleSelect(reply.id)} 
                  />
                </td> */}
                <td className="p-3 font-medium text-foreground">
                  {reply.contact_name || ''}
                </td>
                <td className="p-3 text-muted-foreground">
                  {reply.product_name || ''}
                </td>
                <td className="p-3 text-muted-foreground">
                  {reply.company_name || ''}
                </td>
                {/* <td className="p-3 text-muted-foreground">
                  {reply.template_used || ''}
                </td>
                <td className="p-3 text-muted-foreground">
                  {reply.status || ''}
                </td> */}
                <td className="p-3 text-primary">
                  {reply.to_email || ''}
                </td>
                <td className="p-3 text-muted-foreground">
                  {reply.contact_number || ''}
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
      />
    </div>
  );
}