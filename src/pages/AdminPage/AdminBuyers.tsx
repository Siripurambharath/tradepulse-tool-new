// src/pages/AdminBuyers.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  X,
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_URL } from '@/components/api';

const API_BASE = API_URL;
const PAGE_SIZE = 50;
// ---------- Types ----------
type ContactItem = { id?: number; contact_number: string };
type EmailItem = { id?: number; email: string };

type Buyer = {
  id: number;
  product: string | null;
  hsn_code: string | null;
  country: string | null;
  company_name: string | null;
  website: string | null;
  address: string | null;
  additional_details: string | null;
  suggested_keywords: string | null;
  hsn_descriptions: string | null;
  confidence_level: string | null;
  reason: string | null;
  classification_notes: string | null;
  manual_verification: string | null;
  buyer_date: string | null;
  contacts?: ContactItem[] | string | null;
  emails?: EmailItem[] | string | null;
};

// ---------- Helpers ----------
const toStr = (v: any): string => (v === null || v === undefined ? '' : String(v));

const renderContacts = (contacts: any): string => {
  if (!contacts) return '—';
  if (Array.isArray(contacts)) {
    return contacts.map((c) => c.contact_number || c).filter(Boolean).join(', ') || '—';
  }
  return String(contacts);
};

const renderEmails = (emails: any): string => {
  if (!emails) return '—';
  if (Array.isArray(emails)) {
    return emails.map((e) => e.email || e).filter(Boolean).join(', ') || '—';
  }
  return String(emails);
};

const normalizeContacts = (c: any): string[] => {
  if (!c) return [];
  if (Array.isArray(c)) return c.map((x) => x.contact_number || x).filter(Boolean);
  return String(c)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

const normalizeEmails = (e: any): string[] => {
  if (!e) return [];
  if (Array.isArray(e)) return e.map((x) => x.email || x).filter(Boolean);
  return String(e)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

const formatDate = (d: string | null) => {
  if (!d) return '—';

  const iso = String(d);
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, m, day] = match;
    return `${day}-${m}-${y}`; 
  }

  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
};

// ---------- Modal Shell ----------
const Modal: React.FC<{
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}> = ({ title, onClose, children, wide }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className={`relative w-full ${wide ? 'max-w-3xl' : 'max-w-xl'} max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 shadow-2xl`}
      style={{ backgroundColor: '#0E223B' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8EE147] via-[#6EC035] to-[#5AA82E]" />
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="text-sm sm:text-base font-semibold text-white">{title}</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  </div>
);

// ---------- Field row ----------
const Field: React.FC<{ label: string; value: any; full?: boolean }> = ({
  label,
  value,
  full,
}) => (
  <div className={full ? 'sm:col-span-2' : ''}>
    <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">{label}</p>
    <p className="text-sm text-slate-200 break-words">{value || '—'}</p>
  </div>
);

// ---------- Input row ----------
const Input: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  full?: boolean;
}> = ({ label, value, onChange, type = 'text', full }) => (
  <div className={full ? 'sm:col-span-2' : ''}>
    <label className="text-[11px] uppercase tracking-wide text-slate-500 mb-1 block">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-9 px-3 text-sm bg-[#0E223B] border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8EE147]/30"
    />
  </div>
);

// ========================================================
// Component
// ========================================================
const AdminBuyers: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // modals
  const [viewBuyer, setViewBuyer] = useState<Buyer | null>(null);
  const [editBuyer, setEditBuyer] = useState<Buyer | null>(null);
  const [deleteBuyer, setDeleteBuyer] = useState<Buyer | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ---------- debounce search ----------
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchBuyers = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const params = new URLSearchParams();
    params.append('limit', String(PAGE_SIZE));
    params.append('offset', String((page - 1) * PAGE_SIZE));
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/buyersnew?${params.toString()}`);
    const json = await res.json();

    if (!json.success) throw new Error(json.error || 'Failed to load buyers');

    setBuyers(json.data || []);

    if (page === 1 && typeof json.total === 'number') {
      setTotal(json.total);
    } else if (typeof json.total === 'number' && json.total > 0) {
      setTotal(json.total);
    }
  } catch (err: any) {
    setError(err.message || 'Something went wrong');
  } finally {
    setLoading(false);
  }
}, [page, search]);

  useEffect(() => {
    fetchBuyers();
  }, [fetchBuyers]);

  // ---------- deep-link ?view=id ----------
  useEffect(() => {
    const viewId = searchParams.get('view');
    if (viewId) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE}/buyers/${viewId}`);
          const json = await res.json();
          if (json.success) setViewBuyer(json.data);
        } catch (err) {
          console.error(err);
        }
      })();
    }
  }, [searchParams]);

  const closeView = () => {
    setViewBuyer(null);
    if (searchParams.get('view')) {
      searchParams.delete('view');
      setSearchParams(searchParams, { replace: true });
    }
  };

  // ---------- VIEW ----------
  const handleView = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/buyers/${id}`);
      const json = await res.json();
      if (json.success) setViewBuyer(json.data);
      else alert(json.error || 'Failed to load buyer');
    } catch {
      alert('Failed to load buyer');
    }
  };

  // ---------- EDIT ----------
  const handleEdit = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/buyers/${id}`);
      const json = await res.json();
      if (json.success) setEditBuyer(json.data);
      else alert(json.error || 'Failed to load buyer');
    } catch {
      alert('Failed to load buyer');
    }
  };

  const handleSaveEdit = async () => {
    if (!editBuyer) return;
    setSaving(true);
    try {
      const payload = {
        product: editBuyer.product,
        hsn_code: editBuyer.hsn_code,
        country: editBuyer.country,
        company_name: editBuyer.company_name,
        website: editBuyer.website,
        address: editBuyer.address,
        additional_details: editBuyer.additional_details,
        suggested_keywords: editBuyer.suggested_keywords,
        hsn_descriptions: editBuyer.hsn_descriptions,
        confidence_level: editBuyer.confidence_level,
        reason: editBuyer.reason,
        classification_notes: editBuyer.classification_notes,
        manual_verification: editBuyer.manual_verification,
        buyer_date: editBuyer.buyer_date,
        contacts: normalizeContacts(editBuyer.contacts),
        emails: normalizeEmails(editBuyer.emails),
      };

      const res = await fetch(`${API_BASE}/buyers/${editBuyer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Update failed');

      setEditBuyer(null);
      fetchBuyers();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  // ---------- DELETE ----------
  const handleConfirmDelete = async () => {
    if (!deleteBuyer) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/buyers/${deleteBuyer.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Delete failed');

      setDeleteBuyer(null);
      fetchBuyers();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ---------- UI ----------
  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6"  style={{ backgroundColor: '#0E223B', marginTop: '20px' }}>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8EE147] via-[#6EC035] to-[#5AA82E]" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admindashboard')}
              className="text-slate-300 hover:text-[#8EE147] hover:bg-[#8EE147]/10"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#8EE147] to-[#6EC035] bg-clip-text text-transparent">
              All Buyers
            </h1>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8EE147]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search company, product, HSN, email, phone..."
              className="w-full h-10 pl-9 pr-3 text-sm bg-[#0E223B] border border-white/10 text-white rounded-xl placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#8EE147]/30"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <Card className="mb-4 border border-red-500/30" style={{ backgroundColor: '#0E223B' }}>
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="text-sm text-red-300">{error}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={fetchBuyers}
                className="ml-auto text-[#8EE147] hover:bg-[#8EE147]/10"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Table Card */}
        <Card
          className="relative border border-white/10 shadow-xl overflow-hidden"
          style={{ backgroundColor: '#0E223B' }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8EE147] via-[#6EC035] to-[#5AA82E]" />
          <CardHeader className="p-4 sm:p-5 border-b border-white/10">
            <CardTitle className="text-sm sm:text-base text-white">
              {loading ? 'Loading…' : `${total.toLocaleString()} buyers`}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-[#8EE147]" />
              </div>
            ) : buyers.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-slate-500 text-sm">
                No buyers found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-slate-400">
                      <th className="px-4 py-3 font-medium">Company</th>
                      <th className="px-4 py-3 font-medium">Product</th>
                      <th className="px-4 py-3 font-medium">HSN</th>
                      <th className="px-4 py-3 font-medium">Country</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Phone</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buyers.map((b) => (
                      <tr
                        key={b.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3 text-white font-medium truncate max-w-[200px]">
                          {b.company_name || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-300 truncate max-w-[160px]">
                          {b.product || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-400">{b.hsn_code || '—'}</td>
                        <td className="px-4 py-3 text-slate-300">{b.country || '—'}</td>
                        <td className="px-4 py-3 text-slate-400 truncate max-w-[200px]">
                          {renderEmails(b.emails)}
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {renderContacts(b.contacts)}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleView(b.id)}
                            className="h-8 px-2 text-[#8EE147] hover:bg-[#8EE147]/10"
                            title="View"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(b.id)}
                            className="h-8 px-2 text-blue-400 hover:bg-blue-400/10"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteBuyer(b)}
                            className="h-8 px-2 text-red-400 hover:bg-red-400/10"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>

          {/* Pagination */}
          {!loading && total > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-white/10">
              <span className="text-xs text-slate-400">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-2 text-slate-300 hover:bg-[#8EE147]/10 hover:text-[#8EE147] disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 px-2 text-slate-300 hover:bg-[#8EE147]/10 hover:text-[#8EE147] disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ================= VIEW MODAL ================= */}
      {viewBuyer && (
        <Modal onClose={closeView} title="Buyer Details" wide>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Field label="Company" value={viewBuyer.company_name} />
            <Field label="Product" value={viewBuyer.product} />
            <Field label="HSN Code" value={viewBuyer.hsn_code} />
            <Field label="Country" value={viewBuyer.country} />
            <Field label="Website" value={viewBuyer.website} />
            <Field label="Date" value={formatDate(viewBuyer.buyer_date)} />
            <Field label="Address" value={viewBuyer.address} full />
            <Field label="Additional Details" value={viewBuyer.additional_details} full />
            <Field label="Suggested Keywords" value={viewBuyer.suggested_keywords} full />
            <Field label="HSN Descriptions" value={viewBuyer.hsn_descriptions} full />
            <Field label="Confidence" value={viewBuyer.confidence_level} />
            <Field label="Manual Verification" value={viewBuyer.manual_verification} />
            <Field label="Reason" value={viewBuyer.reason} full />
            <Field label="Notes" value={viewBuyer.classification_notes} full />
            <Field label="Emails" value={renderEmails(viewBuyer.emails)} full />
            <Field label="Contacts" value={renderContacts(viewBuyer.contacts)} full />
          </div>
        </Modal>
      )}

      {/* ================= EDIT MODAL ================= */}
      {editBuyer && (
        <Modal onClose={() => setEditBuyer(null)} title={`Edit Buyer #${editBuyer.id}`} wide>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Company"
              value={toStr(editBuyer.company_name)}
              onChange={(v) => setEditBuyer({ ...editBuyer, company_name: v })}
            />
            <Input
              label="Product"
              value={toStr(editBuyer.product)}
              onChange={(v) => setEditBuyer({ ...editBuyer, product: v })}
            />
            <Input
              label="HSN Code"
              value={toStr(editBuyer.hsn_code)}
              onChange={(v) => setEditBuyer({ ...editBuyer, hsn_code: v })}
            />
            <Input
              label="Country"
              value={toStr(editBuyer.country)}
              onChange={(v) => setEditBuyer({ ...editBuyer, country: v })}
            />
            <Input
              label="Website"
              value={toStr(editBuyer.website)}
              onChange={(v) => setEditBuyer({ ...editBuyer, website: v })}
            />
            <Input
              label="Buyer Date"
              type="date"
              value={editBuyer.buyer_date ? editBuyer.buyer_date.slice(0, 10) : ''}
              onChange={(v) => setEditBuyer({ ...editBuyer, buyer_date: v })}
            />
            <Input
              label="Address"
              value={toStr(editBuyer.address)}
              onChange={(v) => setEditBuyer({ ...editBuyer, address: v })}
              full
            />
            <Input
              label="Additional Details"
              value={toStr(editBuyer.additional_details)}
              onChange={(v) => setEditBuyer({ ...editBuyer, additional_details: v })}
              full
            />
            <Input
              label="Suggested Keywords"
              value={toStr(editBuyer.suggested_keywords)}
              onChange={(v) => setEditBuyer({ ...editBuyer, suggested_keywords: v })}
              full
            />
            <Input
              label="HSN Descriptions"
              value={toStr(editBuyer.hsn_descriptions)}
              onChange={(v) => setEditBuyer({ ...editBuyer, hsn_descriptions: v })}
              full
            />
            <Input
              label="Confidence Level"
              value={toStr(editBuyer.confidence_level)}
              onChange={(v) => setEditBuyer({ ...editBuyer, confidence_level: v })}
            />
            <Input
              label="Manual Verification"
              value={toStr(editBuyer.manual_verification)}
              onChange={(v) => setEditBuyer({ ...editBuyer, manual_verification: v })}
            />
            <Input
              label="Reason"
              value={toStr(editBuyer.reason)}
              onChange={(v) => setEditBuyer({ ...editBuyer, reason: v })}
              full
            />
            <Input
              label="Classification Notes"
              value={toStr(editBuyer.classification_notes)}
              onChange={(v) => setEditBuyer({ ...editBuyer, classification_notes: v })}
              full
            />
            <Input
              label="Emails (comma separated)"
              value={normalizeEmails(editBuyer.emails).join(', ')}
              onChange={(v) =>
                setEditBuyer({
                  ...editBuyer,
                  emails: v
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((email) => ({ email })),
                })
              }
              full
            />
            <Input
              label="Contacts (comma separated)"
              value={normalizeContacts(editBuyer.contacts).join(', ')}
              onChange={(v) =>
                setEditBuyer({
                  ...editBuyer,
                  contacts: v
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((contact_number) => ({ contact_number })),
                })
              }
              full
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={() => setEditBuyer(null)}
              className="text-slate-300 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving}
              className="bg-[#8EE147] hover:bg-[#6EC035] text-[#0E223B] font-semibold"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </Modal>
      )}

      {/* ================= DELETE CONFIRM ================= */}
      {deleteBuyer && (
        <Modal onClose={() => setDeleteBuyer(null)} title="Delete Buyer?">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="text-sm text-slate-300">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-white">
                {deleteBuyer.company_name || `#${deleteBuyer.id}`}
              </span>
              ? This will also remove its contacts and emails. This action cannot be undone.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={() => setDeleteBuyer(null)}
              className="text-slate-300 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminBuyers;