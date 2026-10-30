import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area, RadialBarChart, RadialBar, ComposedChart } from 'recharts';
import { 
  Mail, MessageSquare, TrendingUp, ThumbsUp, ThumbsDown, Building, 
  Users, Target, Activity, ArrowUp, ArrowDown, Clock, Sparkles, 
  Zap, BarChart3, PieChart as PieChartIcon, RefreshCw, 
  Rocket, Crown, Award, Gem, Star, ChevronRight, 
  Circle, Gauge, Layers, Globe, Settings, Bell, User, Calendar, 
  TrendingDown, AlertCircle, CheckCircle, XCircle,
  Play, Pause, Maximize2, Minimize2
} from 'lucide-react';
import { ACTIVITY_URL, API_URL } from '@/components/api';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// ENHANCED COLOR SYSTEM
// ============================================
const COLORS = {
  primary: { light: '#8EE147', DEFAULT: '#8EE147', dark: '#6EC035' },
  success: { light: '#8EE147', DEFAULT: '#8EE147', dark: '#6EC035' },
  warning: { light: '#FBBF24', DEFAULT: '#F59E0B', dark: '#B45309' },
  danger: { light: '#F87171', DEFAULT: '#EF4444', dark: '#B91C1C' },
  purple: { light: '#A78BFA', DEFAULT: '#8B5CF6', dark: '#6D28D9' },
  pink: { light: '#F472B6', DEFAULT: '#EC4899', dark: '#BE185D' },
  dark: { light: '#1A3355', DEFAULT: '#0E223B', dark: '#0A1A2E' }
};

const CHART_COLORS = [
  '#8EE147', '#6EC035', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
  '#3B82F6', '#14B8A6', '#F97316', '#8B5CF6', '#06B6D4', '#D946EF'
];

const GRADIENTS = {
  green: 'from-[#8EE147] via-[#6EC035] to-[#5AA82E]',
  dark: 'from-[#0E223B] via-[#1A3355] to-[#0E223B]',
  purple: 'from-purple-600 via-pink-500 to-rose-500',
  blue: 'from-blue-600 via-cyan-500 to-sky-500',
  orange: 'from-orange-600 via-amber-500 to-yellow-500',
  pink: 'from-pink-600 via-rose-500 to-red-500',
};

// ============================================
// CUSTOM TOOLTIP COMPONENT
// ============================================
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0E223B]/95 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-2xl border border-white/10 text-xs sm:text-sm transition-all duration-200">
        <p className="font-semibold text-white mb-1.5">{label}</p>
        {payload.map((item: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 py-0.5">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-300">{item.name}</span>
            </div>
            <span className="font-medium text-white">{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ============================================
// ANIMATED BACKGROUND PARTICLES
// ============================================
const AnimatedBackground = () => {
  const [particles] = useState(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.3 + 0.1,
    }))
  );

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-r from-[#8EE147]/20 to-[#6EC035]/20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], x: [0, 20, 0], opacity: [p.opacity, p.opacity * 1.5, p.opacity] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#8EE147]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#6EC035]/5 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8EE147]/5 rounded-full blur-3xl animate-pulse delay-500" />
    </div>
  );
};

// ============================================
// PLAIN STATS CARD - Simple, static display card (not clickable)
// ============================================
const AdvancedStatsCard = ({ stat, index }: any) => {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = `${stat.progress || 0}%`;
    }
  }, [stat.progress]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.6 }}
      className="relative"
    >
      <Card 
        className="relative overflow-hidden border-0 shadow-xl bg-[#0E223B]/90 border border-white/10"
        style={{
          background: 'linear-gradient(145deg, rgba(14,34,59,0.95) 0%, rgba(26,51,85,0.95) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <CardContent className="relative p-4 sm:p-5">
          {/* Icon + trend row */}
          <div className="flex items-start justify-between mb-3">
            <div
              className="p-2.5 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`,
                border: `1px solid ${stat.color}30`,
              }}
            >
              <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
            </div>

            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                stat.trend > 0
                  ? 'bg-[#8EE147]/20 text-[#8EE147]'
                  : 'bg-red-500/20 text-red-400'
              } border ${stat.trend > 0 ? 'border-[#8EE147]/30' : 'border-red-500/30'}`}
            >
              {stat.trend > 0 ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
              {Math.abs(stat.trend)}%
            </div>
          </div>

          {/* Value + label */}
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              {stat.value}
            </p>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-medium">
              {stat.label}
            </p>

            {/* Progress bar */}
            {stat.progress !== undefined && (
              <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  ref={progressRef}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${stat.color}, ${stat.color}80)` }}
                />
              </div>
            )}
          </div>

          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
            <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${stat.gradient} opacity-10 transform rotate-45 translate-y-8 translate-x-8`} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ============================================
// ADVANCED CHART CARD
// ============================================
const AdvancedChartCard = ({ children, title, icon, subtitle, action, className = '' }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="relative"
  >
    <Card className={`overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 backdrop-blur-sm bg-[#0E223B]/90 border border-white/10 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#8EE147]/5 to-transparent pointer-events-none" />
      <CardHeader className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#8EE147]/10 border border-[#8EE147]/20">
              {icon}
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-white">
                {title}
              </CardTitle>
              {subtitle && (
                <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative p-4 sm:p-5">
        {children}
      </CardContent>
    </Card>
  </motion.div>
);

// ============================================
// ANIMATED METRIC RING
// ============================================
const MetricRing = ({ value, label, color, size = 80 }: any) => {
  const circumference = 2 * Math.PI * 30;
  const progress = (value / 100) * circumference;
  
  return (
    <motion.div 
      className="flex flex-col items-center"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle className="text-white/10" strokeWidth="6" stroke="currentColor" fill="transparent" r="30" cx={size/2} cy={size/2} />
          <motion.circle
            className="transition-all duration-1000"
            strokeWidth="6"
            stroke={color}
            fill="transparent"
            r="30"
            cx={size/2}
            cy={size/2}
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span className="text-lg font-bold text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            {value}%
          </motion.span>
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-1.5 font-medium">{label}</p>
    </motion.div>
  );
};

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
export default function AnalyticsPage() {
  const [trackingData, setTrackingData] = useState({
    sent: 0, replied: 0, interested: 0, not_interested: 0, not_contacted: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

  const getSellerId = () => {
    const sellerStr = localStorage.getItem('seller');
    if (!sellerStr) return null;
    try {
      const seller = JSON.parse(sellerStr);
      return seller?.id;
    } catch (e) {
      return null;
    }
  };

  const fetchData = async () => {
    const sellerId = getSellerId();
    if (!sellerId) {
      setError('No seller found — please log in again');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/tracking/counts?seller_id=${sellerId}`);
      const data = await response.json();
      if (data.success) {
        setTrackingData(data.data);
        setLastUpdated(new Date());
      } else {
        setError('Failed to load analytics data');
      }
    } catch (err) {
      setError('Error loading analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const logActivity = async () => {
      try {
        const seller = JSON.parse(localStorage.getItem("seller") || "{}");
        await fetch(`${ACTIVITY_URL}/api/activity-log`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: seller.id || 1,
            userName: seller.name || seller.email || 'Unknown',
            role: seller.role || 'seller',
            action_id: 34,
            module_id: 9,
            description: 'Viewed analytics dashboard',
            status: 'SUCCESS'
          })
        });
      } catch (e) {}
    };
    logActivity();
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const totalSent = trackingData.sent;
  const totalReplied = trackingData.replied;
  const totalInterested = trackingData.interested;
  const totalNotInterested = trackingData.not_interested;
  const totalNotContacted = trackingData.not_contacted;
  const emailSentNoResponse = totalSent - totalReplied;
  const responseRate = totalSent ? Math.round((totalReplied / totalSent) * 100) : 0;
  const interestRate = totalReplied ? Math.round((totalInterested / totalReplied) * 100) : 0;
  const engagementRate = totalSent ? Math.round(((totalInterested + totalReplied) / totalSent) * 100) : 0;
  const conversionRate = totalSent ? Math.round((totalInterested / totalSent) * 100) : 0;

  const statusData = useMemo(() => {
    const counts = {
      'Not Contacted': totalNotContacted,
      'Email Sent': emailSentNoResponse,
      'Replied': totalReplied,
      'Interested': totalInterested,
      'Not Interested': totalNotInterested,
    };
    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [trackingData]);

  const funnelData = [
    { stage: 'Emails Sent', count: totalSent, fill: '#8EE147' },
    { stage: 'Replied', count: totalReplied, fill: '#6EC035' },
    { stage: 'Interested', count: totalInterested, fill: '#5AA82E' },
  ];

  const weeklyData = useMemo(() => {
    return [
      { week: 'Current Week', sent: totalSent, replied: totalReplied, interested: totalInterested, notInterested: totalNotInterested }
    ];
  }, [trackingData]);

  const stats = [
    { label: 'Total Emails Sent', value: totalSent.toLocaleString(), icon: Mail, color: COLORS.primary.DEFAULT, gradient: GRADIENTS.green, trend: 12, progress: Math.min((totalSent / 100) * 100, 100) },
    { label: 'Response Rate', value: `${responseRate}%`, icon: TrendingUp, color: COLORS.success.DEFAULT, gradient: GRADIENTS.green, trend: 8, progress: responseRate },
    { label: 'Interested', value: totalInterested.toLocaleString(), icon: ThumbsUp, color: COLORS.success.DEFAULT, gradient: GRADIENTS.green, trend: 18, progress: Math.min((totalInterested / 50) * 100, 100) },
    { label: 'Not Interested', value: totalNotInterested.toLocaleString(), icon: ThumbsDown, color: COLORS.danger.DEFAULT, gradient: GRADIENTS.pink, trend: -5, progress: Math.min((totalNotInterested / 30) * 100, 100) },
    { label: 'Engagement Rate', value: `${engagementRate}%`, icon: Target, color: COLORS.purple.DEFAULT, gradient: GRADIENTS.purple, trend: 10, progress: engagementRate },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E223B]">
        <AnimatedBackground />
        <div className="flex flex-col justify-center items-center h-screen gap-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-[#8EE147] border-t-transparent"></div>
            <div className="absolute inset-0 rounded-full border-4 border-[#8EE147]/20 border-t-transparent"></div>
            <motion.div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#6EC035]" animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
          </div>
          <div className="text-center">
            <motion.p className="text-lg font-semibold text-white" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
              Loading Analytics...
            </motion.p>
            <p className="text-sm text-slate-400 mt-1">Preparing your insights</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0E223B]">
        <AnimatedBackground />
        <div className="flex justify-center items-center h-screen">
          <motion.div className="bg-[#0E223B] backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/10 max-w-md mx-4 text-center" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-white mb-2">Oops! Something went wrong</h3>
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <motion.button onClick={fetchData} className="px-6 py-2.5 bg-gradient-to-r from-[#8EE147] to-[#6EC035] hover:from-[#7DD13A] hover:to-[#5AA82E] text-[#0E223B] rounded-xl text-sm font-medium shadow-lg shadow-[#8EE147]/25 transition-all" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              Try Again
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E223B]">
      <AnimatedBackground />

      <div className="relative p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        {/* HEADER */}
        <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4">
            <motion.div className="p-3 rounded-2xl bg-gradient-to-r from-[#8EE147] to-[#6EC035] shadow-xl shadow-[#8EE147]/30" whileHover={{ rotate: 10, scale: 1.05 }}>
              <Rocket className="h-6 w-6 text-[#0E223B]" />
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#8EE147] via-[#6EC035] to-[#5AA82E] bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#8EE147]" />
                Track and optimize your outreach performance
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex bg-[#0E223B]/80 p-1 rounded-xl shadow-sm border border-white/10">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-gradient-to-r from-[#8EE147] to-[#6EC035] text-[#0E223B] shadow-lg shadow-[#8EE147]/25' : 'text-slate-400'}`}>
                <Layers className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode('compact')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'compact' ? 'bg-gradient-to-r from-[#8EE147] to-[#6EC035] text-[#0E223B] shadow-lg shadow-[#8EE147]/25' : 'text-slate-400'}`}>
                <Gauge className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* METRIC RINGS */}
        <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="bg-[#0E223B]/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/10">
            <MetricRing value={responseRate} label="Response Rate" color="#8EE147" />
          </div>
          <div className="bg-[#0E223B]/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/10">
            <MetricRing value={interestRate} label="Interest Rate" color="#8EE147" />
          </div>
          <div className="bg-[#0E223B]/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/10">
            <MetricRing value={engagementRate} label="Engagement Rate" color="#8EE147" />
          </div>
          <div className="bg-[#0E223B]/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/10">
            <MetricRing value={conversionRate} label="Conversion Rate" color="#8EE147" />
          </div>
        </motion.div>

        {/* STATS CARDS GRID - plain, non-clickable */}
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-5' : 'grid-cols-2 md:grid-cols-3'} gap-3 sm:gap-4 mb-6`}>
          {stats.map((stat, index) => (
            <AdvancedStatsCard key={index} stat={stat} index={index} />
          ))}
        </div>

        {/* MAIN CHARTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <AdvancedChartCard title="Conversion Funnel" icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-[#8EE147]" />} subtitle="Email to interested conversion flow" action>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={funnelData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <defs>
                  <linearGradient id="funnelGrad1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#8EE147" /><stop offset="100%" stopColor="#6EC035" /></linearGradient>
                  <linearGradient id="funnelGrad2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#6EC035" /><stop offset="100%" stopColor="#5AA82E" /></linearGradient>
                  <linearGradient id="funnelGrad3" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#5AA82E" /><stop offset="100%" stopColor="#4A9025" /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" opacity={0.2} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: '#94A3B8' }} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={45}>
                  {funnelData.map((entry, i) => (<Cell key={i} fill={`url(#funnelGrad${i + 1})`} />))}
                </Bar>
                <Line type="monotone" dataKey="count" stroke="#8EE147" strokeWidth={2} dot={{ r: 5, fill: '#8EE147', strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </AdvancedChartCard>

          <AdvancedChartCard title="Status Distribution" icon={<PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#8EE147]" />} subtitle="Breakdown by response status" action>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <defs>
                  {CHART_COLORS.map((color, i) => (
                    <linearGradient key={i} id={`pieGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                      <stop offset="100%" stopColor={color} stopOpacity={1} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie data={statusData} cx="50%" cy="45%" innerRadius={55} outerRadius={85} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} animationDuration={1000} animationBegin={200}>
                  {statusData.map((_, i) => (<Cell key={i} fill={`url(#pieGrad${i % CHART_COLORS.length})`} />))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={40} formatter={(value) => (<span className="text-xs text-slate-300 font-medium">{value}</span>)} />
              </PieChart>
            </ResponsiveContainer>
          </AdvancedChartCard>
        </div>

        {/* WEEKLY PERFORMANCE */}
        <AdvancedChartCard title="Weekly Outreach Performance" icon={<Activity className="h-4 w-4 sm:h-5 sm:w-5 text-[#8EE147]" />} subtitle="Track trends and identify patterns" action className="md:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8EE147" stopOpacity={0.4}/><stop offset="95%" stopColor="#8EE147" stopOpacity={0}/></linearGradient>
                <linearGradient id="repliedGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/><stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/></linearGradient>
                <linearGradient id="interestedGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8EE147" stopOpacity={0.4}/><stop offset="95%" stopColor="#8EE147" stopOpacity={0}/></linearGradient>
                <linearGradient id="notInterestedGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/><stop offset="95%" stopColor="#EF4444" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" opacity={0.2} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={40} formatter={(value) => (<span className="text-xs text-slate-300 font-medium">{value}</span>)} />
              <Area type="monotone" dataKey="sent" stroke="#8EE147" strokeWidth={3} fill="url(#sentGradient)" name="📧 Sent" />
              <Area type="monotone" dataKey="replied" stroke="#F59E0B" strokeWidth={3} fill="url(#repliedGradient)" name="💬 Replied" />
              <Area type="monotone" dataKey="interested" stroke="#8EE147" strokeWidth={3} fill="url(#interestedGradient)" name="❤️ Interested" />
              <Area type="monotone" dataKey="notInterested" stroke="#EF4444" strokeWidth={3} fill="url(#notInterestedGradient)" name="👎 Not Interested" />
            </AreaChart>
          </ResponsiveContainer>
        </AdvancedChartCard>
      </div>
    </div>
  );
}