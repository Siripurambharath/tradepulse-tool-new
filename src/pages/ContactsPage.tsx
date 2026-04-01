import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmailModal } from '@/components/EmailModal';
import { allCompanies } from '@/data/mockData';
import { Search, Mail } from 'lucide-react';

export default function ContactsPage() {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [emailOpen, setEmailOpen] = useState(false);

  const allContacts = useMemo(() => {
    return allCompanies.slice(0, 200).flatMap(c =>
      c.contacts.map(ct => ({ ...ct, companyName: c.name, product: c.product }))
    );
  }, []);

  const roles = useMemo(() => [...new Set(allContacts.map(c => c.role))].sort(), [allContacts]);

  const filtered = useMemo(() => {
    return allContacts.filter(ct => {
      const q = query.toLowerCase();
      const matchesQuery = !q || ct.name.toLowerCase().includes(q) || ct.email.toLowerCase().includes(q) || ct.companyName.toLowerCase().includes(q);
      const matchesRole = roleFilter === 'all' || ct.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [query, roleFilter, allContacts]);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(c => c.id)));
  };

  const getRecipients = () => filtered.filter(c => selected.has(c.id)).map(c => ({ name: c.name, email: c.email, company: c.companyName }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
        <Button onClick={() => setEmailOpen(true)} disabled={selected.size === 0} className="gap-2">
          <Mail className="h-4 w-4" /> Send Email ({selected.size})
        </Button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search contacts..." value={query} onChange={e => setQuery(e.target.value)} className="pl-10 bg-card" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48 bg-card"><SelectValue /></SelectTrigger>
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
              <th className="p-3 w-10"><Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={selectAll} /></th>
              <th className="p-3 text-left font-medium text-foreground">Name</th>
              <th className="p-3 text-left font-medium text-foreground">Company</th>
              <th className="p-3 text-left font-medium text-foreground">Role</th>
              <th className="p-3 text-left font-medium text-foreground">Department</th>
              <th className="p-3 text-left font-medium text-foreground">Email</th>
              <th className="p-3 text-left font-medium text-foreground">Phone</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map(ct => (
              <tr key={ct.id} className="border-b hover:bg-muted/20 transition-colors">
                <td className="p-3"><Checkbox checked={selected.has(ct.id)} onCheckedChange={() => toggleSelect(ct.id)} /></td>
                <td className="p-3 font-medium text-foreground">{ct.name}</td>
                <td className="p-3 text-muted-foreground">{ct.companyName}</td>
                <td className="p-3 text-muted-foreground">{ct.role}</td>
                <td className="p-3 text-muted-foreground">{ct.department}</td>
                <td className="p-3 text-primary">{ct.email}</td>
                <td className="p-3 text-muted-foreground">{ct.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EmailModal open={emailOpen} onClose={() => setEmailOpen(false)} recipients={getRecipients()} />
    </div>
  );
}
