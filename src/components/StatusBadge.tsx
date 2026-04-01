import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  'Not Contacted': 'bg-muted text-muted-foreground',
  'Email Sent': 'bg-info/10 text-info border-info/20',
  'Opened': 'bg-warning/10 text-warning border-warning/20',
  'Replied': 'bg-primary/10 text-primary border-primary/20',
  'Interested': 'bg-success/10 text-success border-success/20',
  'Not Interested': 'bg-destructive/10 text-destructive border-destructive/20',
  'Buyer': 'bg-info/10 text-info border-info/20',
  'Seller': 'bg-success/10 text-success border-success/20',
  'Sent': 'bg-info/10 text-info border-info/20',
  'No Response': 'bg-muted text-muted-foreground',
  'Pending': 'bg-warning/10 text-warning border-warning/20',
  'draft': 'bg-muted text-muted-foreground',
  'active': 'bg-success/10 text-success border-success/20',
  'completed': 'bg-primary/10 text-primary border-primary/20',
  'paused': 'bg-warning/10 text-warning border-warning/20',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn('text-xs font-medium', statusColors[status] || 'bg-muted text-muted-foreground')}>
      {status}
    </Badge>
  );
}
