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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-background border rounded-xl shadow-2xl w-full max-w-sm mx-2 sm:mx-4 p-4 sm:p-6" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-semibold">Email Setup Required</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
        
        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
          {message}
        </p>
        
        <div className="flex flex-row justify-end gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClose}
            className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4"
          >
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={() => navigate('/emailconfig')}
            className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go to Config
          </Button>
        </div>
      </div>
    </div>
  );
}