import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from 'recharts';
import { Mail, MessageSquare, TrendingUp, ThumbsUp, ThumbsDown, Building, Users, Target, Activity, ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { ACTIVITY_URL, API_URL } from '@/components/api';

// Enhanced color palette with gradients
const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];
const GRADIENT_COLORS = ['#818CF8', '#34D399', '#FBBF24', '#F87171', '#60A5FA', '#A78BFA'];

// Activity Log Helper Functions
const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown Browser';
};

const getIPAddress = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP:', error);
    return '127.0.0.1';
  }
};

const createActivityLog = async (actionId: number, moduleId: number, description: string, additionalData?: any) => {
  try {
    const seller = JSON.parse(localStorage.getItem("seller") || "{}");
    const ipAddress = await getIPAddress();
    const device = getDeviceInfo();

    const logData = {
      userId: seller.id || 1,
      userName: seller.name || seller.email || 'Unknown',
      role: seller.role || 'seller',
      action_id: actionId,
      module_id: moduleId,
      description: description,
      ipAddress,
      device,
      status: 'SUCCESS',
      ...additionalData
    };

    const response = await fetch(`${ACTIVITY_URL}/api/activity-log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    });

    const result = await response.json();
    if (!result.success) {
      console.error('Failed to create activity log:', result.message);
    }
    return result;
  } catch (error) {
    console.error('Error creating activity log:', error);
    return null;
  }
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 md:p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-xs sm:text-sm">
        <p className="font-semibold text-gray-900 dark:text-gray-100">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-xs sm:text-sm" style={{ color: item.color }}>
            {item.name}: {item.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Stats Card Component with animations - REDUCED HEIGHT FOR MOBILE
const StatsCard = ({ stat }: { stat: any }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Card 
      className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      <CardContent className="p-2 sm:p-3 md:p-4 lg:p-5">
        <div className="flex items-center justify-between mb-1 sm:mb-1.5 md:mb-2">
          <div className={`p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl ${stat.iconBg} transition-all duration-300 group-hover:scale-110`}>
            <stat.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 ${stat.iconColor}`} />
          </div>
          {stat.trend && (
            <div className={`flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] md:text-xs font-medium ${stat.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stat.trend > 0 ? <ArrowUp className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" /> : <ArrowDown className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" />}
              {Math.abs(stat.trend)}%
            </div>
          )}
        </div>
        <div>
          <p className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
          <p className="text-[8px] sm:text-[10px] md:text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-0 sm:mt-0.5">{stat.label}</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </CardContent>
    </Card>
  );
};

export default function AnalyticsPage() {
  const [trackingData, setTrackingData] = useState({
    sent: 0,
    replied: 0,
    interested: 0,
    not_interested: 0,
    not_contacted: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getSellerId = () => {
    const sellerStr = localStorage.getItem('seller');
    if (!sellerStr) return null;
    try {
      const seller = JSON.parse(sellerStr);
      return seller?.id;
    } catch (e) {
      console.error('Failed to parse seller from localStorage:', e);
      return null;
    }
  };

  useEffect(() => {
    const sellerId = getSellerId();

    if (!sellerId) {
      console.error('No seller found in localStorage');
      setError('No seller found — please log in again');
      setLoading(false);
      return;
    }

    createActivityLog(34, 9, 'Viewed analytics dashboard page');

    fetch(`${API_URL}/api/tracking/counts?seller_id=${sellerId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTrackingData(data.data);
        } else {
          setError('Failed to load analytics data');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching analytics data:', err);
        setError('Error loading analytics data');
        setLoading(false);
      });
  }, []);

  const totalSent = trackingData.sent;
  const totalReplied = trackingData.replied;
  const totalInterested = trackingData.interested;
  const totalNotInterested = trackingData.not_interested;
  const totalNotContacted = trackingData.not_contacted;
  const totalCompanies = totalSent + totalNotContacted;
  const emailSentNoResponse = totalSent - totalReplied;
  const responseRate = totalSent ? Math.round((totalReplied / totalSent) * 100) : 0;
  const interestRate = totalReplied ? Math.round((totalInterested / totalReplied) * 100) : 0;

  // Status distribution pie data
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

  // Funnel data
  const funnelData = [
    { stage: 'Emails Sent', count: totalSent, fill: '#3B82F6' },
    { stage: 'Replied', count: totalReplied, fill: '#8B5CF6' },
    { stage: 'Interested', count: totalInterested, fill: '#10B981' },
  ];

  const weeklyData = [
    { 
      week: 'Current Week', 
      sent: totalSent, 
      replied: totalReplied, 
      interested: totalInterested, 
      notInterested: totalNotInterested 
    }
  ];

  // Enhanced stats with gradients and trends
  const stats = [
    { 
      label: 'Emails Sent', 
      value: totalSent, 
      icon: Mail, 
      gradient: 'from-indigo-500 to-purple-500',
      iconBg: 'bg-indigo-50 dark:bg-indigo-900/20',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      trend: 8
    },
    { 
      label: 'Response Rate', 
      value: `${responseRate}%`, 
      icon: TrendingUp, 
      gradient: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      trend: 5
    },
    { 
      label: 'Interested', 
      value: totalInterested, 
      icon: ThumbsUp, 
      gradient: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      trend: 15
    },
    { 
      label: 'Not Interested', 
      value: totalNotInterested, 
      icon: ThumbsDown, 
      gradient: 'from-red-500 to-pink-500',
      iconBg: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      trend: -3
    },
    { 
      label: 'Interest Rate', 
      value: `${interestRate}%`, 
      icon: Target, 
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      trend: 10
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-primary border-t-transparent"></div>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Loading Analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl border border-red-200 dark:border-red-800 max-w-sm mx-4">
            <div className="text-red-500 text-sm sm:text-base md:text-lg font-semibold">⚠️ {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-2 sm:p-3 md:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0 sm:mt-0.5">Track your outreach performance and engagement metrics</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 text-[8px] sm:text-[10px] md:text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
            <span className="hidden xs:inline">Last updated: {new Date().toLocaleDateString()}</span>
            <span className="xs:hidden">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-0.5 md:py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-[8px] sm:text-[10px] md:text-xs font-medium flex items-center gap-0.5 sm:gap-1">
            <Activity className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" />
            <span className="hidden xs:inline">Live</span>
            <span className="xs:hidden">●</span>
          </div>
        </div>
      </div>

      {/* Stats Cards - REDUCED HEIGHT FOR MOBILE */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 mb-3 sm:mb-4 md:mb-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} stat={stat} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-4 md:mb-6">
        {/* Conversion Funnel with Area Chart */}
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 p-2 sm:p-3 md:p-4 lg:p-6">
            <CardTitle className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-sm md:text-base text-gray-800 dark:text-gray-200">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-indigo-500" />
              Conversion Funnel
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 md:p-4 lg:p-6">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 10 }} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {funnelData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution Pie with Donut */}
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 p-2 sm:p-3 md:p-4 lg:p-6">
            <CardTitle className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-sm md:text-base text-gray-800 dark:text-gray-200">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-purple-500" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 md:p-4 lg:p-6">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%" cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Outreach Trend with Area Chart */}
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 p-2 sm:p-3 md:p-4 lg:p-6">
          <CardTitle className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-sm md:text-base text-gray-800 dark:text-gray-200">
            <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-emerald-500" />
            Weekly Outreach Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 md:p-4 lg:p-6">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyData.length ? weeklyData : [{ week: 'No Data', sent: 0, replied: 0, interested: 0, notInterested: 0 }]}>
              <defs>
                <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="repliedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="interestedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Area type="monotone" dataKey="sent" stroke="#4F46E5" strokeWidth={2} fill="url(#sentGradient)" name="Sent" />
              <Area type="monotone" dataKey="replied" stroke="#F59E0B" strokeWidth={2} fill="url(#repliedGradient)" name="Replied" />
              <Area type="monotone" dataKey="interested" stroke="#10B981" strokeWidth={2} fill="url(#interestedGradient)" name="Interested" />
              <Line type="monotone" dataKey="notInterested" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} name="Not Interested" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}