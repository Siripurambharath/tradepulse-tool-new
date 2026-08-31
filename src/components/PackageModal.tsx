// PackageModal.tsx
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { API_URL } from './api';
import { Loader2, XCircle, Calendar, Phone, Mail, Package as PackageIcon, Users } from 'lucide-react';

interface PackageData {
  package_id: number | null;
  package_name: string | null;
  plan_expiry_date: string | null;
  is_expired: boolean;
  buyer_contact_limit: number | null;
  phone_used: number;
  email_used: number;
  phone_remaining: number | null;
  email_remaining: number | null;
}

interface PackageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PackageModal({ open, onOpenChange }: PackageModalProps) {
  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchPackageInfo();
    }
  }, [open]);

  const fetchPackageInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const seller = JSON.parse(localStorage.getItem("seller") || "{}");
      const sellerId = seller.id;

      if (!sellerId) {
        setError("Seller information not found");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/${sellerId}/package`);
      const data = await response.json();

      if (data.success) {
        setPackageData(data.data);
      } else {
        setError(data.message || "Failed to fetch package information");
      }
    } catch (err) {
      setError("An error occurred while fetching package information");
      console.error("Package fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = () => {
    if (!packageData) return null;
    if (packageData.is_expired) {
      return <Badge variant="destructive" className="ml-2">Expired</Badge>;
    }
    return <Badge className="ml-2 bg-green-500 hover:bg-green-600">Active</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader className="mb-2 sm:mb-4">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-2xl">
            <PackageIcon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" style={{ color: '#499A13' }} />
            <span className="truncate">Package Details</span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" style={{ color: '#499A13' }} />
          </div>
        ) : error ? (
          <div className="text-center py-6 sm:py-8 text-red-500">
            <XCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3" />
            <p className="text-sm sm:text-base px-2">{error}</p>
          </div>
        ) : packageData ? (
          <div className="space-y-4 sm:space-y-6 py-2">
            {/* Package Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-3 sm:pb-4 gap-2 sm:gap-0">
              <div className="w-full sm:w-auto">
                <h3 className="text-lg sm:text-2xl font-bold truncate" style={{ color: '#499A13' }}>
                  {packageData.package_name || 'No Package'}
                </h3>
                <div className="flex items-center mt-1">
                  <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">Status:</span>
                  {getStatusBadge()}
                </div>
              </div>
            </div>

            {/* Package Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Expiry Date */}
              <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-muted/30 rounded-lg">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" style={{ color: '#499A13' }} />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Expiry Date</p>
                  <p className="text-xs sm:text-sm font-medium break-words">
                    {formatDate(packageData.plan_expiry_date)}
                  </p>
                </div>
              </div>

              {/* Contact Limit - HIGHLIGHTED */}
              <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 border-[#499A13] bg-green-50 dark:bg-green-950/20 shadow-sm">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" style={{ color: '#499A13' }} />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Contact Limit</p>
                  <p className="text-lg sm:text-2xl font-bold truncate" style={{ color: '#499A13' }}>
                    {packageData.buyer_contact_limit === null 
                      ? '♾️ Unlimited' 
                      : packageData.buyer_contact_limit}
                  </p>
                </div>
              </div>
            </div>

            {/* Usage Section */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">Usage Overview</h4>
              
              {/* Phone Usage */}
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" style={{ color: '#499A13' }} />
                    <span className="text-xs sm:text-sm">Phone Contacts</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-3">
                    <span className="text-xs sm:text-sm font-medium">
                      {packageData.phone_used} used
                    </span>
                    {packageData.phone_remaining !== null && (
                      <Badge variant="secondary" className="text-[8px] sm:text-xs px-1.5 sm:px-2 py-0 h-4 sm:h-5">
                        {packageData.phone_remaining} left
                      </Badge>
                    )}
                  </div>
                </div>
                {packageData.buyer_contact_limit !== null && (
                  <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
                    <div
                      className="h-1.5 sm:h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((packageData.phone_used / packageData.buyer_contact_limit) * 100, 100)}%`,
                        backgroundColor: packageData.phone_used / packageData.buyer_contact_limit > 0.8 
                          ? '#ef4444' 
                          : '#499A13'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Email Usage */}
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" style={{ color: '#499A13' }} />
                    <span className="text-xs sm:text-sm">Email Contacts</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-3">
                    <span className="text-xs sm:text-sm font-medium">
                      {packageData.email_used} used
                    </span>
                    {packageData.email_remaining !== null && (
                      <Badge variant="secondary" className="text-[8px] sm:text-xs px-1.5 sm:px-2 py-0 h-4 sm:h-5">
                        {packageData.email_remaining} left
                      </Badge>
                    )}
                  </div>
                </div>
                {packageData.buyer_contact_limit !== null && (
                  <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
                    <div
                      className="h-1.5 sm:h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((packageData.email_used / packageData.buyer_contact_limit) * 100, 100)}%`,
                        backgroundColor: packageData.email_used / packageData.buyer_contact_limit > 0.8 
                          ? '#ef4444' 
                          : '#499A13'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm sm:text-base px-2">
            No package information available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}