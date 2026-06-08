import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import {
  ArrowLeft,
  Clock,
  Users,
  MessageSquare,
} from 'lucide-react';
import API_URL from '@/components/api';

export default function HistoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    fetch(`${API_URL}/history/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Entry not found');
        }
        return res.json();
      })
      .then((data) => {
        setEntry(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error || !entry) {
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
  const companies = entry.companies || [];
  const counts = entry.counts || { total: 0, replied: 0, interested: 0, notInterested: 0, emailSent: 0 };

  return (
    <div>
      <Button
        variant="ghost"
        className="gap-2 mb-4 text-muted-foreground"
        onClick={() => navigate('/history')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to History
      </Button>

      {/* Summary */}
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

        <div className="flex flex-wrap gap-6 mt-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {counts.total} companies
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-success" />
            <span className="text-sm font-medium">
              {counts.replied} replied
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-green-600">
              {counts.interested} Interested
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-red-600">
              {counts.notInterested} Not Interested
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-600">
              {counts.emailSent} Email Sent
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
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
              {companies.length > 0 ? (
                companies.map((c: any, i: number) => (
                  <tr key={i} className="border-b hover:bg-muted/20">
                    <td className="p-3 font-medium">{c.companyName}</td>
                    <td className="p-3 text-muted-foreground">{c.contactName}</td>
                    <td className="p-3 text-primary">{c.email}</td>
                    <td className="p-3 text-muted-foreground">
                      {c.sentAt ? new Date(c.sentAt).toLocaleString() : '-'}
                    </td>
                    <td className="p-3 text-muted-foreground">{c.templateUsed || '-'}</td>
                    <td className="p-3">
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-muted-foreground">
                    No companies found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}