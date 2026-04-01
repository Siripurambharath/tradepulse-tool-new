import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { useStore } from '@/data/store';
import { ArrowLeft, Clock, Users, Eye, MessageSquare } from 'lucide-react';

export default function HistoryDetailPage() {
  const { id } = useParams();
  const { history } = useStore();
  const navigate = useNavigate();
  const entry = history.find(h => h.id === id);

  if (!entry) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Entry not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/history')}>Back to History</Button>
      </div>
    );
  }

  const date = new Date(entry.date);
  const replied = entry.companies.filter(c => c.status === 'Replied').length;
  const opened = entry.companies.filter(c => c.status === 'Opened' || c.status === 'Replied').length;

  return (
    <div>
      <Button variant="ghost" className="gap-2 mb-4 text-muted-foreground" onClick={() => navigate('/history')}>
        <ArrowLeft className="h-4 w-4" /> Back to History
      </Button>

      <div className="bg-card rounded-lg border p-6 mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">{entry.product}</h1>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        <div className="flex gap-6 mt-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm text-foreground font-medium">{entry.companies.length} companies</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-warning" />
            <span className="text-sm text-foreground font-medium">{opened} opened</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-success" />
            <span className="text-sm text-foreground font-medium">{replied} replied</span>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="p-3 text-left font-medium text-foreground">Company</th>
              <th className="p-3 text-left font-medium text-foreground">Contact</th>
              <th className="p-3 text-left font-medium text-foreground">Email</th>
              <th className="p-3 text-left font-medium text-foreground">Sent At</th>
              <th className="p-3 text-left font-medium text-foreground">Template</th>
              <th className="p-3 text-left font-medium text-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {entry.companies.map((c, i) => (
              <tr key={i} className="border-b hover:bg-muted/20 transition-colors">
                <td className="p-3 font-medium text-foreground">{c.companyName}</td>
                <td className="p-3 text-muted-foreground">{c.contactName}</td>
                <td className="p-3 text-primary">{c.email}</td>
                <td className="p-3 text-muted-foreground">{new Date(c.sentAt).toLocaleString()}</td>
                <td className="p-3 text-muted-foreground">{c.templateUsed}</td>
                <td className="p-3"><StatusBadge status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
