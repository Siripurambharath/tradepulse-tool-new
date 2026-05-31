import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { ArrowLeft, Clock, Users, Eye, MessageSquare } from 'lucide-react';
import API_URL from '@/components/api';

export default function HistoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [history, setHistory] = useState<any[]>([]);

  // ✅ Fetch history
  useEffect(() => {
    fetch(`${API_URL}/history`)
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(err => console.error(err));
  }, []);

  const entry = history.find(h => h.id === id);

  if (!entry) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Entry not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/history')}
        >
          Back to History
        </Button>
      </div>
    );
  }

  const date = new Date(entry.date);

  const replied = (entry.companies || []).filter(
    (c: any) => c.status === 'Replied'
  ).length;

  const opened = (entry.companies || []).filter(
    (c: any) => c.status === 'Opened' || c.status === 'Replied'
  ).length;

  return (
    <div>
      <Button
        variant="ghost"
        className="gap-2 mb-4 text-muted-foreground"
        onClick={() => navigate('/history')}
      >
        <ArrowLeft className="h-4 w-4" /> Back to History
      </Button>

      {/* 📊 Summary */}
      <div className="bg-card rounded-lg border p-6 mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          {entry.product}
        </h1>

        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {date.toLocaleDateString()} at{' '}
          {date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>

        <div className="flex gap-6 mt-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {(entry.companies || []).length} companies
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium">{opened} opened</span>
          </div>

          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-success" />
            <span className="text-sm font-medium">{replied} replied</span>
          </div>
        </div>
      </div>

      {/* 📋 Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Contact</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Sent At</th>
              <th className="p-3 text-left">Template</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {(entry.companies || []).map((c: any, i: number) => (
              <tr key={i} className="border-b hover:bg-muted/20">
                <td className="p-3 font-medium">{c.companyName}</td>
                <td className="p-3 text-muted-foreground">
                  {c.contactName}
                </td>
                <td className="p-3 text-primary">{c.email}</td>
                <td className="p-3 text-muted-foreground">
                  {new Date(c.sentAt).toLocaleString()}
                </td>
                <td className="p-3 text-muted-foreground">
                  {c.templateUsed}
                </td>
                <td className="p-3">
                  <StatusBadge status={c.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}