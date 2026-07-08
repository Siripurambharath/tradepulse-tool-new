import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmailConfigModal({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message: string;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-background border rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Email Setup Required</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <p className="text-sm text-muted-foreground mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={() => navigate('/emailconfig')}>Go to Config</Button>
        </div>
      </div>
    </div>
  );
}