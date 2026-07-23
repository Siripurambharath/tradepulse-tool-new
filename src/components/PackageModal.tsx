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
import { Loader2, CheckCircle2, XCircle, Calendar, Phone, Mail, Package as PackageIcon, Users } from 'lucide-react';

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

  // Calculate total usage percentage
  const getTotalUsagePercentage = () => {
    if (!packageData || packageData.buyer_contact_limit === null) return 0;
    const totalUsed = packageData.phone_used + packageData.email_used;
    return Math.min((totalUsed / packageData.buyer_contact_limit) * 100, 100);
  };

  const getTotalRemaining = () => {
    if (!packageData || packageData.buyer_contact_limit === null) return null;
    const totalUsed = packageData.phone_used + packageData.email_used;
    return Math.max(0, packageData.buyer_contact_limit - totalUsed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <PackageIcon className="h-6 w-6" style={{ color: '#499A13' }} />
            Package Details
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#499A13' }} />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <XCircle className="h-12 w-12 mx-auto mb-3" />
            <p>{error}</p>
          </div>
        ) : packageData ? (
          <div className="space-y-6 py-4">
            {/* Package Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-2xl font-bold" style={{ color: '#499A13' }}>
                  {packageData.package_name || 'No Package'}
                </h3>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  {getStatusBadge()}
                </div>
              </div>
            </div>

            {/* Package Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Expiry Date */}
              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <Calendar className="h-5 w-5 mt-0.5" style={{ color: '#499A13' }} />
                <div>
                  <p className="text-xs text-muted-foreground">Expiry Date</p>
                  <p className="font-medium">
                    {formatDate(packageData.plan_expiry_date)}
                  </p>
                </div>
              </div>

        {/* Contact Limit - HIGHLIGHTED */}
<div className="flex items-start gap-3 p-4 rounded-lg border-2 border-[#499A13] bg-green-50 dark:bg-green-950/20 shadow-sm">
  <Users className="h-5 w-5 mt-0.5" style={{ color: '#499A13' }} />
  <div className="flex-1">
    <p className="text-xs text-muted-foreground">Contact Limit</p>
    <p className="text-2xl font-bold" style={{ color: '#499A13' }}>
      {packageData.buyer_contact_limit === null 
        ? '♾️ Unlimited' 
        : packageData.buyer_contact_limit}
    </p>
    
  </div>
</div>
            </div>

            {/* Usage Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground">Usage Overview</h4>
              
              {/* Phone Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" style={{ color: '#499A13' }} />
                    <span className="text-sm">Phone Contacts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {packageData.phone_used} used
                    </span>
                    {packageData.phone_remaining !== null && (
                      <Badge variant="secondary" className="text-xs">
                        {packageData.phone_remaining} remaining
                      </Badge>
                    )}
                  </div>
                </div>
                {packageData.buyer_contact_limit !== null && (
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" style={{ color: '#499A13' }} />
                    <span className="text-sm">Email Contacts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {packageData.email_used} used
                    </span>
                    {packageData.email_remaining !== null && (
                      <Badge variant="secondary" className="text-xs">
                        {packageData.email_remaining} remaining
                      </Badge>
                    )}
                  </div>
                </div>
                {packageData.buyer_contact_limit !== null && (
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
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
          <div className="text-center py-8 text-muted-foreground">
            No package information available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}