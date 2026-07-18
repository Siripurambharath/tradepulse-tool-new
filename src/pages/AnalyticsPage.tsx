// import { useState, useEffect, useMemo } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
// import { Mail, MessageSquare, TrendingUp, ThumbsUp, ThumbsDown, Building } from 'lucide-react';
// import { ACTIVITY_URL, API_URL } from '@/components/api';

// const COLORS = ['hsl(217,91%,60%)', 'hsl(142,71%,45%)', 'hsl(38,92%,50%)', 'hsl(0,84%,60%)', 'hsl(199,89%,48%)'];

// // Activity Log Helper Functions
// const getDeviceInfo = () => {
//   const userAgent = navigator.userAgent;
//   if (userAgent.includes('Chrome')) return 'Chrome';
//   if (userAgent.includes('Firefox')) return 'Firefox';
//   if (userAgent.includes('Safari')) return 'Safari';
//   if (userAgent.includes('Edge')) return 'Edge';
//   return 'Unknown Browser';
// };

// const getIPAddress = async () => {
//   try {
//     const response = await fetch('https://api.ipify.org?format=json');
//     const data = await response.json();
//     return data.ip;
//   } catch (error) {
//     console.error('Error fetching IP:', error);
//     return '127.0.0.1';
//   }
// };

// const createActivityLog = async (actionId: number, moduleId: number, description: string, additionalData?: any) => {
//   try {
//     const seller = JSON.parse(localStorage.getItem("seller") || "{}");
//     const ipAddress = await getIPAddress();
//     const device = getDeviceInfo();

//     const logData = {
//       userId: seller.id || 1,
//       userName: seller.name || seller.email || 'Unknown',
//       role: seller.role || 'seller',
//       action_id: actionId,
//       module_id: moduleId,
//       description: description,
//       ipAddress,
//       device,
//       status: 'SUCCESS',
//       ...additionalData
//     };

//     const response = await fetch(`${ACTIVITY_URL}/api/activity-log`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(logData),
//     });

//     const result = await response.json();
//     if (!result.success) {
//       console.error('Failed to create activity log:', result.message);
//     }
//     return result;
//   } catch (error) {
//     console.error('Error creating activity log:', error);
//     return null;
//   }
// };

// export default function AnalyticsPage() {
//   const [trackingData, setTrackingData] = useState({
//     sent: 0,
//     replied: 0,
//     interested: 0,
//     not_interested: 0,
//     not_contacted: 0
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const getSellerId = () => {
//     const sellerStr = localStorage.getItem('seller');
//     if (!sellerStr) return null;
//     try {
//       const seller = JSON.parse(sellerStr);
//       return seller?.id;
//     } catch (e) {
//       console.error('Failed to parse seller from localStorage:', e);
//       return null;
//     }
//   };

//   useEffect(() => {
//     const sellerId = getSellerId();

//     if (!sellerId) {
//       console.error('No seller found in localStorage');
//       setError('No seller found — please log in again');
//       setLoading(false);
//       return;
//     }

//     // Log page view (action_id: 34, module_id: 9)
//     createActivityLog(34, 9, 'Viewed analytics dashboard page');

//     fetch(`${API_URL}/api/tracking/counts?seller_id=${sellerId}`)
//       .then(res => res.json())
//       .then(data => {
//         if (data.success) {
//           setTrackingData(data.data);
//         } else {
//           setError('Failed to load analytics data');
//         }
//         setLoading(false);
//       })
//       .catch(err => {
//         console.error('Error fetching analytics data:', err);
//         setError('Error loading analytics data');
//         setLoading(false);
//       });
//   }, []);

//   // Calculate metrics from the API response
//   const totalSent = trackingData.sent;
//   const totalReplied = trackingData.replied;
//   const totalInterested = trackingData.interested;
//   const totalNotInterested = trackingData.not_interested;
//   const totalNotContacted = trackingData.not_contacted;
//   const totalCompanies = totalSent + totalNotContacted;
  
//   // Email Sent without response
//   const emailSentNoResponse = totalSent - totalReplied;

//   // Status distribution pie data
//   const statusData = useMemo(() => {
//     const counts = {
//       'Not Contacted': totalNotContacted,
//       'Email Sent': emailSentNoResponse,
//       'Replied': totalReplied,
//       'Interested': totalInterested,
//       'Not Interested': totalNotInterested,
//     };
//     return Object.entries(counts)
//       .filter(([_, value]) => value > 0)
//       .map(([name, value]) => ({ name, value }));
//   }, [trackingData]);

//   // Funnel data
//   const funnelData = [
//     { stage: 'Total Companies', count: totalCompanies },
//     { stage: 'Emails Sent', count: totalSent },
//     { stage: 'Replied', count: totalReplied },
//     { stage: 'Interested', count: totalInterested },
//   ];

//   const weeklyData = [
//     { 
//       week: 'Current Week', 
//       sent: totalSent, 
//       replied: totalReplied, 
//       interested: totalInterested, 
//       notInterested: totalNotInterested 
//     }
//   ];

//   // Stats cards - Removed Not Contacted
//   const stats = [
//     { label: 'Total Companies', value: totalCompanies, icon: Building, color: 'text-primary' },
//     { label: 'Emails Sent', value: totalSent, icon: Mail, color: 'text-primary' },
//     { label: 'Replied', value: totalReplied, icon: MessageSquare, color: 'text-green-500' },
//     { label: 'Response Rate', value: `${totalSent ? Math.round((totalReplied / totalSent) * 100) : 0}%`, icon: TrendingUp, color: 'text-warning' },
//     { label: 'Interested', value: totalInterested, icon: ThumbsUp, color: 'text-green-500' },
//     { label: 'Not Interested', value: totalNotInterested, icon: ThumbsDown, color: 'text-red-500' },
//   ];

//   if (loading) {
//     return (
//       <div>
//         <h1 className="text-2xl font-bold text-foreground mb-6">Analytics</h1>
//         <div className="flex justify-center items-center h-64">
//           <div className="text-muted-foreground">Loading analytics data...</div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div>
//         <h1 className="text-2xl font-bold text-foreground mb-6">Analytics</h1>
//         <div className="flex justify-center items-center h-64">
//           <div className="text-red-500">{error}</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <h1 className="text-2xl font-bold text-foreground mb-6">Analytics</h1>

//       {/* Stats Cards - One Row with 6 cards */}
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
//         {stats.map(s => (
//           <Card key={s.label} className="hover:shadow-md transition-shadow">
//             <CardContent className="p-4">
//               <div className="flex flex-col items-center text-center">
//                 <s.icon className={`h-5 w-5 mb-2 ${s.color}`} />
//                 <p className="text-xl font-bold text-foreground">{s.value}</p>
//                 <p className="text-xs text-muted-foreground whitespace-nowrap">{s.label}</p>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Charts */}
//       <div className="grid md:grid-cols-2 gap-6 mb-6">
//         {/* Conversion Funnel */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-base">Conversion Funnel</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={250}>
//               <BarChart data={funnelData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//                 <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
//                 <YAxis tick={{ fontSize: 12 }} />
//                 <Tooltip />
//                 <Bar dataKey="count" radius={[4, 4, 0, 0]}>
//                   {funnelData.map((entry, i) => (
//                     <Cell
//                       key={i}
//                       fill={
//                         entry.stage === 'Interested' ? 'hsl(142,71%,45%)' :
//                         entry.stage === 'Not Interested' ? 'hsl(0,84%,60%)' :
//                         'hsl(217,91%,60%)'
//                       }
//                     />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* Status Distribution Pie */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-base">Status Distribution</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={250}>
//               <PieChart>
//                 <Pie
//                   data={statusData}
//                   cx="50%" cy="50%"
//                   outerRadius={90}
//                   dataKey="value"
//                   label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                   labelLine={false}
//                 >
//                   {statusData.map((_, i) => (
//                     <Cell key={i} fill={COLORS[i % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Weekly Outreach Trend */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-base">Weekly Outreach Trend</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <ResponsiveContainer width="100%" height={250}>
//             <LineChart data={weeklyData.length ? weeklyData : [{ week: 'No Data', sent: 0, replied: 0, interested: 0, notInterested: 0 }]}>
//               <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//               <XAxis dataKey="week" tick={{ fontSize: 12 }} />
//               <YAxis tick={{ fontSize: 12 }} />
//               <Tooltip />
//               <Legend />
//               <Line type="monotone" dataKey="sent" stroke="hsl(217,91%,60%)" strokeWidth={2} name="Sent" />
//               <Line type="monotone" dataKey="replied" stroke="hsl(38,92%,50%)" strokeWidth={2} name="Replied" />
//               <Line type="monotone" dataKey="interested" stroke="hsl(142,71%,45%)" strokeWidth={2} name="Interested" />
//               <Line type="monotone" dataKey="notInterested" stroke="hsl(0,84%,60%)" strokeWidth={2} name="Not Interested" />
//             </LineChart>
//           </ResponsiveContainer>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }



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
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-gray-900 dark:text-gray-100">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: item.color }}>
            {item.name}: {item.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Stats Card Component with animations
const StatsCard = ({ stat }: { stat: any }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Card 
      className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-3 rounded-xl ${stat.iconBg} transition-all duration-300 group-hover:scale-110`}>
            <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
          </div>
          {stat.trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stat.trend > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {Math.abs(stat.trend)}%
            </div>
          )}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Loading Analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-red-200 dark:border-red-800">
            <div className="text-red-500 text-lg font-semibold">⚠️ {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            Analytics 
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track your outreach performance and engagement metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
          <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Live
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} stat={stat} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Conversion Funnel with Area Chart */}
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-800">
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              Conversion Funnel
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 12 }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
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
          <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800">
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <Users className="h-5 w-5 text-purple-500" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
        <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800">
          <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
            <Activity className="h-5 w-5 text-emerald-500" />
            Weekly Outreach Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
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
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="sent" stroke="#4F46E5" strokeWidth={3} fill="url(#sentGradient)" name="Sent" />
              <Area type="monotone" dataKey="replied" stroke="#F59E0B" strokeWidth={3} fill="url(#repliedGradient)" name="Replied" />
              <Area type="monotone" dataKey="interested" stroke="#10B981" strokeWidth={3} fill="url(#interestedGradient)" name="Interested" />
              <Line type="monotone" dataKey="notInterested" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} name="Not Interested" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}