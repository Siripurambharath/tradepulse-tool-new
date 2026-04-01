import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/StatusBadge';
import { EmailModal } from '@/components/EmailModal';
import { useStore, addCampaign, updateCampaign } from '@/data/store';
import { getTemplates } from '@/data/store';
import { allCompanies, Campaign } from '@/data/mockData';
import { Search, Plus, Play, Pause, Eye, Mail, Clock, Zap, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function CampaignsPage() {
  const { campaigns } = useStore();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailCampaign, setDetailCampaign] = useState<Campaign | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailCampaign, setEmailCampaign] = useState<Campaign | null>(null);

  // Create form state
  const [newName, setNewName] = useState('');
  const [newProduct, setNewProduct] = useState('');
  const [newTemplate, setNewTemplate] = useState('');
  const [newType, setNewType] = useState<'Instant' | 'Scheduled'>('Instant');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const templates = getTemplates();
  const products = useMemo(() => [...new Set(allCompanies.map(c => c.product))].sort(), []);

  const filtered = useMemo(() => {
    return campaigns.filter(c => {
      const matchesQuery = !query || c.name.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter, campaigns]);

  const handleCreate = () => {
    if (!newName || !newProduct) return;
    addCampaign({
      id: crypto.randomUUID(),
      name: newName,
      product: newProduct,
      status: 'draft',
      type: newType,
      scheduledDate: newType === 'Scheduled' && newDate ? new Date(`${newDate}T${newTime || '00:00'}`).toISOString() : '',
      createdAt: new Date().toISOString(),
      templateName: templates.find(t => t.id === newTemplate)?.name || templates[0]?.name || '',
      stats: { sent: 0, opened: 0, replied: 0 },
      contacts: allCompanies.filter(c => c.product === newProduct).slice(0, 10).flatMap(c =>
        c.contacts.slice(0, 1).map(ct => ({ name: ct.name, email: ct.email, company: c.name, status: 'Pending' }))
      ),
    });
    setCreateOpen(false);
    setNewName(''); setNewProduct(''); setNewTemplate(''); setNewDate(''); setNewTime('');
    toast.success('Campaign created');
  };

  const toggleStatus = (c: Campaign) => {
    if (c.status === 'active') updateCampaign(c.id, { status: 'paused' });
    else if (c.status === 'paused' || c.status === 'draft') updateCampaign(c.id, { status: 'active' });
  };

  const sendAll = (c: Campaign) => {
    setEmailCampaign(c);
    setEmailOpen(true);
  };

  const formatDate = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
          <p className="text-sm text-muted-foreground">{campaigns.length} campaigns</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> New Campaign
        </Button>
      </div>

      <div className="flex gap-3 mb-6 mt-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search campaigns..." value={query} onChange={e => setQuery(e.target.value)} className="pl-10 bg-card" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <Card key={c.id} className="hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground text-sm truncate">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">{c.product}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>

              <div className="flex items-center gap-2 mb-2">
                {c.type === 'Instant' ? (
                  <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    <Zap className="h-3 w-3" /> Instant
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">
                    <Calendar className="h-3 w-3" /> Scheduled
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Clock className="h-3 w-3" />
                {c.type === 'Scheduled' && c.scheduledDate
                  ? `Scheduled: ${formatDate(c.scheduledDate)}`
                  : `Created: ${formatDate(c.createdAt)}`}
              </div>
              <p className="text-xs text-muted-foreground mb-3">Template: {c.templateName}</p>

              <div className="grid grid-cols-3 gap-2 mb-3 py-2 border-t border-b">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{c.stats.sent}</p>
                  <p className="text-xs text-muted-foreground">Sent</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{c.stats.opened}</p>
                  <p className="text-xs text-muted-foreground">Opened</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{c.stats.replied}</p>
                  <p className="text-xs text-muted-foreground">Replied</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => toggleStatus(c)}
                >
                  {c.status === 'active' ? <><Pause className="h-3 w-3" /> Pause</> : <><Play className="h-3 w-3" /> Activate</>}
                </Button>
                <Button size="sm" className="flex-1 gap-1" onClick={() => sendAll(c)}>
                  <Mail className="h-3 w-3" /> Send All
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDetailCampaign(c)}>
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Campaign Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-card sm:max-w-[480px]">
          <DialogHeader><DialogTitle className="text-xl font-bold">Create Campaign</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <Input placeholder="Campaign name" value={newName} onChange={e => setNewName(e.target.value)} className="bg-background" />
            <Select value={newProduct} onValueChange={setNewProduct}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Select Product" /></SelectTrigger>
              <SelectContent>{products.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={newTemplate} onValueChange={setNewTemplate}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Select Template" /></SelectTrigger>
              <SelectContent>{templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Send Type</label>
              <div className="grid grid-cols-2 gap-0 border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setNewType('Instant')}
                  className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                    newType === 'Instant'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  <Zap className="h-4 w-4" /> Instant
                </button>
                <button
                  type="button"
                  onClick={() => setNewType('Scheduled')}
                  className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                    newType === 'Scheduled'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  <Calendar className="h-4 w-4" /> Scheduled
                </button>
              </div>
            </div>
            {newType === 'Scheduled' && (
              <div className="grid grid-cols-2 gap-3">
                <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="bg-background" />
                <Input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="bg-background" />
              </div>
            )}
            <Button onClick={handleCreate} className="w-full" size="lg">Create Campaign</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailCampaign} onOpenChange={() => setDetailCampaign(null)}>
        <DialogContent className="bg-card sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{detailCampaign?.name}</DialogTitle></DialogHeader>
          {detailCampaign && (
            <div>
              <div className="flex gap-4 mb-4 text-sm">
                <span className="text-muted-foreground">Product: <span className="text-foreground font-medium">{detailCampaign.product}</span></span>
                <StatusBadge status={detailCampaign.status} />
              </div>
              <div className="bg-card rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="p-2 text-left font-medium text-foreground">Name</th>
                      <th className="p-2 text-left font-medium text-foreground">Company</th>
                      <th className="p-2 text-left font-medium text-foreground">Email</th>
                      <th className="p-2 text-left font-medium text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailCampaign.contacts.map((ct, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-2 text-foreground">{ct.name}</td>
                        <td className="p-2 text-muted-foreground">{ct.company}</td>
                        <td className="p-2 text-primary">{ct.email}</td>
                        <td className="p-2"><StatusBadge status={ct.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {emailCampaign && (
        <EmailModal
          open={emailOpen}
          onClose={() => { setEmailOpen(false); setEmailCampaign(null); }}
          recipients={emailCampaign.contacts.map(c => ({ name: c.name, email: c.email, company: c.company }))}
          product={emailCampaign.product}
        />
      )}
    </div>
  );
}
