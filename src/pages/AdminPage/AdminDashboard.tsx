// src/pages/AdminDashboard.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  Mail,
  Settings2,
  Building2,
  Filter,
  Sparkles,
  LayoutDashboard,
  PieChart as PieIcon,
  BarChart3,
  Loader2,
  Globe,
  Package,
  AlertCircle,
  X,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { API_URL } from '@/components/api';

// ---------- Types ----------
type MonthlyPoint = {
  month: string;
  buyers: number;
  users: number;
};

type SharePoint = {
  name: string;
  value: number;
};

type AnalyticsResponse = {
  success: boolean;
  totals: {
    total_buyers: number;
    avg_buyers_per_month: number;
  };
  monthly: MonthlyPoint[];
  product_share: SharePoint[];
  country_share: SharePoint[];
};

type UserStats = {
  total_users: number;
  email_sent_count: number;
  email_config_count: number;
};

type BuyerRow = {
  id: number;
  company_name: string | null;
  product: string | null;
  hsn_code: string | null;
  country: string | null;
  website?: string | null;
  contacts?: any;
  emails?: any;
};

// ---------- Palette ----------
const PIE_COLORS = ['#8EE147', '#6EC035', '#5AA82E', '#A3E86B', '#C7F0A0'];
const API_BASE = API_URL;

// ---------- Card accent wrapper ----------
const CardWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <Card
    className={`relative border border-white/10 shadow-xl overflow-hidden ${className}`}
    style={{ backgroundColor: '#0E223B' }}
  >
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8EE147] via-[#6EC035] to-[#5AA82E]" />
    {children}
  </Card>
);

// ---------- helpers ----------
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

// ---------- Component ----------
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // ---- Filters ----
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  // ---- Data ----
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    total_users: 0,
    email_sent_count: 0,
    email_config_count: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ---- Latest buyers ----
  const [latestBuyers, setLatestBuyers] = useState<BuyerRow[]>([]);
  const [latestLoading, setLatestLoading] = useState<boolean>(true);

  // ---- Dropdown options ----
  const [products, setProducts] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);

  // ---------- filter options ----------
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [prodRes, ctryRes] = await Promise.all([
          fetch(`${API_BASE}/filters/products`),
          fetch(`${API_BASE}/filters/buyer-countries`),
        ]);
        const prodJson = await prodRes.json();
        const ctryJson = await ctryRes.json();

        setProducts(Array.isArray(prodJson) ? prodJson.map((p: any) => p.product) : []);
        setCountries(Array.isArray(ctryJson) ? ctryJson.map((c: any) => c.country) : []);
      } catch (err) {
        console.error('Failed to load filter options', err);
      }
    };
    fetchFilters();
  }, []);

  // ---------- user stats ----------
  const fetchUserStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/users/stats`);
      const json = await res.json();
      if (json.success) {
        setUserStats({
          total_users: json.total_users ?? 0,
          email_sent_count: json.email_sent_count ?? 0,
          email_config_count: json.email_config_count ?? 0,
        });
      }
    } catch (err) {
      console.error('Failed to load user stats', err);
    }
  }, []);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  // ---------- latest 5 buyers ----------
  useEffect(() => {
    const fetchLatestBuyers = async () => {
      setLatestLoading(true);
      try {
        const res = await fetch(`${API_BASE}/buyers/latest?limit=5`);   
             const json = await res.json();
        if (json.success) {
          setLatestBuyers(json.data || []);
        }
      } catch (err) {
        console.error('Failed to load latest buyers', err);
      } finally {
        setLatestLoading(false);
      }
    };
    fetchLatestBuyers();
  }, []);

  // ---------- analytics ----------
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('from', fromDate);
      if (toDate) params.append('to', toDate);
      if (productFilter && productFilter !== 'all') params.append('product', productFilter);
      if (countryFilter && countryFilter !== 'all') params.append('country', countryFilter);

      const res = await fetch(`${API_BASE}/dashboard/buyers-analytics?${params.toString()}`);
      const json = await res.json();

      if (!json.success) throw new Error(json.error || 'Failed to load analytics');

      const normalized: AnalyticsResponse = {
        ...json,
        totals: {
          total_buyers: json.totals?.total_buyers ?? 0,
          avg_buyers_per_month: json.totals?.avg_buyers_per_month ?? 0,
        },
        monthly: (json.monthly || []).map((m: any) => ({
          month: m.month,
          buyers: m.buyers ?? 0,
          users: m.users ?? 0,
        })),
      };

      setAnalytics(normalized);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, productFilter, countryFilter]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // ---------- clear filters ----------
  const handleClearFilters = () => {
    setFromDate('');
    setToDate('');
    setProductFilter('all');
    setCountryFilter('all');
  };

  const hasActiveFilters =
    !!fromDate || !!toDate || productFilter !== 'all' || countryFilter !== 'all';

  // ---------- stat cards ----------
  const statCards = useMemo(() => {
    return [
      {
        title: 'Total Users',
        value: userStats.total_users.toLocaleString(),
        icon: Users,
        onClick: () => navigate('/admin/users'),
      },
      {
        title: 'Email Sent',
        value: userStats.email_sent_count.toLocaleString(),
        icon: Mail,
        onClick: () => navigate('/admin/users'),
      },
      {
        title: 'Email Configured',
        value: userStats.email_config_count.toLocaleString(),
        icon: Settings2,
        onClick: () => navigate('/admin/users'),
      },
    ];
  }, [userStats, navigate]);

  // ---------- pie data ----------
  const productShare = useMemo(
    () =>
      (analytics?.product_share || []).map((p, i) => ({
        ...p,
        color: PIE_COLORS[i % PIE_COLORS.length],
      })),
    [analytics]
  );

  const countryShare = useMemo(
    () =>
      (analytics?.country_share || []).map((p, i) => ({
        ...p,
        color: PIE_COLORS[i % PIE_COLORS.length],
      })),
    [analytics]
  );

  // ---------- summary totals ----------
  const totalBuyers = useMemo(
    () => (analytics?.monthly || []).reduce((s, d) => s + (d.buyers || 0), 0),
    [analytics]
  );
  const totalUsersMonthly = useMemo(
    () => (analytics?.monthly || []).reduce((s, d) => s + (d.users || 0), 0),
    [analytics]
  );
  const avgBuyersPerMonth = useMemo(() => {
    const arr = analytics?.monthly || [];
    return arr.length ? Math.round(totalBuyers / arr.length) : 0;
  }, [analytics, totalBuyers]);

  const tooltipStyle = {
    backgroundColor: '#8EE147',
    border: '1px solid #6EC035',
    borderRadius: '12px',
    color: '#000000',
    fontSize: '12px',
    fontWeight: 600,
    padding: '8px 12px',
    boxShadow: '0 8px 24px rgba(142, 225, 71, 0.35)',
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6" style={{ backgroundColor: '#0E223B' }}>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8EE147] via-[#6EC035] to-[#5AA82E]" />

      <div className="max-w-7xl mx-auto">
        {/* ---------------- Header ---------------- */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-[#8EE147] to-[#6EC035] rounded-xl shadow-lg">
                <LayoutDashboard className="h-5 w-5 md:h-6 md:w-6 text-[#0E223B]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#8EE147] to-[#6EC035] bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-xs sm:text-sm flex items-center gap-2 mt-0.5" style={{ color: '#94A3B8' }}>
                  <Sparkles className="h-3.5 w-3.5 text-[#8EE147]" />
                  Buyer & user analytics overview
                </p>
              </div>
            </div>
          </div>

          {/* ---------- Filters ---------- */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs pl-2">
              <Filter className="h-3.5 w-3.5 text-[#8EE147]" />
              <span className="hidden sm:inline">Filters</span>
            </div>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-9 px-2 text-xs bg-[#0E223B] border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8EE147]/30"
              title="From date"
            />
            <span className="text-slate-500 text-xs">→</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-9 px-2 text-xs bg-[#0E223B] border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8EE147]/30"
              title="To date"
            />

            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-[160px] h-9 text-xs bg-[#0E223B] border-white/10 text-white rounded-xl focus:ring-[#8EE147]/30">
                <Package className="h-3.5 w-3.5 mr-2 text-[#8EE147]" />
                <SelectValue placeholder="Product" />
              </SelectTrigger>
              <SelectContent className="bg-[#0E223B] border-white/10 text-white max-h-[300px]">
                <SelectItem value="all">All Products</SelectItem>
                {products.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-[150px] h-9 text-xs bg-[#0E223B] border-white/10 text-white rounded-xl focus:ring-[#8EE147]/30">
                <Globe className="h-3.5 w-3.5 mr-2 text-[#8EE147]" />
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent className="bg-[#0E223B] border-white/10 text-white max-h-[300px]">
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
              className="h-9 px-3 text-xs rounded-xl text-slate-300 hover:bg-[#8EE147]/10 hover:text-[#8EE147] disabled:opacity-40 disabled:cursor-not-allowed"
              title="Clear filters"
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Clear
            </Button>
          </div>
        </div>

        {/* ---------------- Error ---------------- */}
        {error && (
          <CardWrapper className="mb-6">
            <CardContent className="p-4 sm:p-5 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="text-sm text-red-300">{error}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={fetchAnalytics}
                className="ml-auto text-[#8EE147] hover:bg-[#8EE147]/10"
              >
                Retry
              </Button>
            </CardContent>
          </CardWrapper>
        )}

        {/* ---------------- Clickable Stat Cards ---------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <button
                key={stat.title}
                onClick={stat.onClick}
                className="text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EE147]/40 rounded-xl transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <CardWrapper>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-5">
                    <CardTitle className="text-xs sm:text-sm font-medium text-slate-300">
                      {stat.title}
                    </CardTitle>
                    <div className="p-2 rounded-lg bg-[#8EE147]/10">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#8EE147]" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-5 pt-0">
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      {stat.value}
                    </div>
                  </CardContent>
                </CardWrapper>
              </button>
            );
          })}
        </div>

        {/* ---------------- Buyer summary cards ---------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-6">
          <CardWrapper>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-5">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-300">
                Buyer Companies
              </CardTitle>
              <div className="p-2 rounded-lg bg-[#8EE147]/10">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#8EE147]" />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-white">
                {loading ? '—' : (analytics?.totals.total_buyers ?? 0).toLocaleString()}
              </div>
            </CardContent>
          </CardWrapper>

          <CardWrapper>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-5">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-300">
                Avg. Buyers / Month
              </CardTitle>
              <div className="p-2 rounded-lg bg-[#8EE147]/10">
                <PieIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#8EE147]" />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-white">
                {loading ? '—' : (analytics?.totals.avg_buyers_per_month ?? 0).toLocaleString()}
              </div>
            </CardContent>
          </CardWrapper>

          <CardWrapper>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-5">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-300">
                Countries
              </CardTitle>
              <div className="p-2 rounded-lg bg-[#8EE147]/10">
                <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-[#8EE147]" />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-white">
                {loading ? '—' : countryShare.length}
              </div>
            </CardContent>
          </CardWrapper>
        </div>

        {/* ---------------- Charts Row ---------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 mb-6">
          <CardWrapper className="lg:col-span-2">
            <CardHeader className="p-4 sm:p-5 border-b border-white/10">
              <CardTitle className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-[#8EE147]" />
                Monthly Buyers & Users
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                {productFilter === 'all' ? 'All products' : productFilter} ·{' '}
                {countryFilter === 'all' ? 'All countries' : countryFilter}
                {fromDate || toDate
                  ? ` · ${fromDate || '…'} → ${toDate || '…'}`
                  : ' · All time'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              {loading ? (
                <div className="flex items-center justify-center h-[280px]">
                  <Loader2 className="h-8 w-8 animate-spin text-[#8EE147]" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={analytics?.monthly || []}
                    margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#94A3B8', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#94A3B8', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{ fill: 'rgba(142,225,71,0.06)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#94A3B8' }} />
                    <Bar dataKey="buyers" fill="#8EE147" radius={[6, 6, 0, 0]} name="Buyers" />
                    <Bar dataKey="users" fill="#5AA82E" radius={[6, 6, 0, 0]} name="Users" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </CardWrapper>

          <CardWrapper>
            <CardHeader className="p-4 sm:p-5 border-b border-white/10">
              <CardTitle className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                <PieIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#8EE147]" />
                Buyer Products
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Distribution by product
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 flex flex-col items-center">
              {loading ? (
                <div className="flex items-center justify-center h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-[#8EE147]" />
                </div>
              ) : productShare.length === 0 ? (
                <div className="flex items-center justify-center h-[200px] text-slate-500 text-sm">
                  No data
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={productShare}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {productShare.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="#0E223B"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="grid grid-cols-1 gap-y-2 mt-4 w-full">
                    {productShare.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2 text-xs">
                        <span
                          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-slate-300 truncate">{entry.name}</span>
                        <span className="text-slate-500 ml-auto">
                          {entry.value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </CardWrapper>
        </div>

        {/* ---------------- Country Share Row ---------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 mb-6">
          <CardWrapper className="lg:col-span-2">
            <CardHeader className="p-4 sm:p-5 border-b border-white/10">
              <CardTitle className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-[#8EE147]" />
                Top Countries
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Buyers by country
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              {loading ? (
                <div className="flex items-center justify-center h-[220px]">
                  <Loader2 className="h-8 w-8 animate-spin text-[#8EE147]" />
                </div>
              ) : countryShare.length === 0 ? (
                <div className="flex items-center justify-center h-[220px] text-slate-500 text-sm">
                  No data
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={countryShare}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      type="number"
                      tick={{ fill: '#94A3B8', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: '#94A3B8', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{ fill: 'rgba(142,225,71,0.06)' }}
                    />
                    <Bar dataKey="value" fill="#6EC035" radius={[0, 6, 6, 0]} name="Buyers" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </CardWrapper>

          <CardWrapper>
            <CardHeader className="p-4 sm:p-5 border-b border-white/10">
              <CardTitle className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#8EE147]" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div>
                <p className="text-xs text-slate-400">Total Buyers</p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {loading ? '—' : totalBuyers.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Total Users (Monthly)</p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {loading ? '—' : totalUsersMonthly.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Avg. Buyers / Month</p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {loading ? '—' : avgBuyersPerMonth.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </CardWrapper>
        </div>

        {/* ---------------- LATEST BUYERS TABLE ---------------- */}
        <CardWrapper>
          <CardHeader className="p-4 sm:p-5 border-b border-white/10 flex flex-row items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-[#8EE147]" />
                Latest Buyers
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-1">
                Most recent 5 buyer entries
              </CardDescription>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => navigate('/admin/buyers')}
              className="h-9 px-4 text-xs rounded-xl bg-[#8EE147] hover:bg-[#6EC035] text-[#0E223B] font-semibold"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            {latestLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-[#8EE147]" />
              </div>
            ) : latestBuyers.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-slate-500 text-sm">
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
                    {latestBuyers.map((b) => (
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
                        <td className="px-4 py-3 text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/admin/buyers?view=${b.id}`)}
                            className="h-8 px-2 text-[#8EE147] hover:bg-[#8EE147]/10"
                            title="View"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </CardWrapper>
      </div>
    </div>
  );
};

export default AdminDashboard;