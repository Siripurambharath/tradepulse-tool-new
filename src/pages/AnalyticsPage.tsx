// import { useState, useEffect, useMemo } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from 'recharts';
// import { Mail, MessageSquare, TrendingUp, ThumbsUp, ThumbsDown, Building, Users, Target, Activity, ArrowUp, ArrowDown, Clock } from 'lucide-react';
// import { ACTIVITY_URL, API_URL } from '@/components/api';

// // Enhanced color palette with gradients
// const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];
// const GRADIENT_COLORS = ['#818CF8', '#34D399', '#FBBF24', '#F87171', '#60A5FA', '#A78BFA'];

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

// // Custom Tooltip Component
// const CustomTooltip = ({ active, payload, label }: any) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 md:p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-xs sm:text-sm">
//         <p className="font-semibold text-gray-900 dark:text-gray-100">{label}</p>
//         {payload.map((item: any, index: number) => (
//           <p key={index} className="text-xs sm:text-sm" style={{ color: item.color }}>
//             {item.name}: {item.value.toLocaleString()}
//           </p>
//         ))}
//       </div>
//     );
//   }
//   return null;
// };

// // Stats Card Component with animations - REDUCED HEIGHT FOR MOBILE
// const StatsCard = ({ stat }: { stat: any }) => {
//   const [isHovered, setIsHovered] = useState(false);
  
//   return (
//     <Card 
//       className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 group"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
//       <CardContent className="p-2 sm:p-3 md:p-4 lg:p-5">
//         <div className="flex items-center justify-between mb-1 sm:mb-1.5 md:mb-2">
//           <div className={`p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl ${stat.iconBg} transition-all duration-300 group-hover:scale-110`}>
//             <stat.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 ${stat.iconColor}`} />
//           </div>
//           {stat.trend && (
//             <div className={`flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] md:text-xs font-medium ${stat.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
//               {stat.trend > 0 ? <ArrowUp className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" /> : <ArrowDown className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" />}
//               {Math.abs(stat.trend)}%
//             </div>
//           )}
//         </div>
//         <div>
//           <p className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
//           <p className="text-[8px] sm:text-[10px] md:text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-0 sm:mt-0.5">{stat.label}</p>
//         </div>
//         <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//       </CardContent>
//     </Card>
//   );
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

//   const totalSent = trackingData.sent;
//   const totalReplied = trackingData.replied;
//   const totalInterested = trackingData.interested;
//   const totalNotInterested = trackingData.not_interested;
//   const totalNotContacted = trackingData.not_contacted;
//   const totalCompanies = totalSent + totalNotContacted;
//   const emailSentNoResponse = totalSent - totalReplied;
//   const responseRate = totalSent ? Math.round((totalReplied / totalSent) * 100) : 0;
//   const interestRate = totalReplied ? Math.round((totalInterested / totalReplied) * 100) : 0;

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
//     { stage: 'Emails Sent', count: totalSent, fill: '#3B82F6' },
//     { stage: 'Replied', count: totalReplied, fill: '#8B5CF6' },
//     { stage: 'Interested', count: totalInterested, fill: '#10B981' },
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

//   // Enhanced stats with gradients and trends
//   const stats = [
//     { 
//       label: 'Emails Sent', 
//       value: totalSent, 
//       icon: Mail, 
//       gradient: 'from-indigo-500 to-purple-500',
//       iconBg: 'bg-indigo-50 dark:bg-indigo-900/20',
//       iconColor: 'text-indigo-600 dark:text-indigo-400',
//       trend: 8
//     },
//     { 
//       label: 'Response Rate', 
//       value: `${responseRate}%`, 
//       icon: TrendingUp, 
//       gradient: 'from-green-500 to-emerald-500',
//       iconBg: 'bg-green-50 dark:bg-green-900/20',
//       iconColor: 'text-green-600 dark:text-green-400',
//       trend: 5
//     },
//     { 
//       label: 'Interested', 
//       value: totalInterested, 
//       icon: ThumbsUp, 
//       gradient: 'from-emerald-500 to-teal-500',
//       iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
//       iconColor: 'text-emerald-600 dark:text-emerald-400',
//       trend: 15
//     },
//     { 
//       label: 'Not Interested', 
//       value: totalNotInterested, 
//       icon: ThumbsDown, 
//       gradient: 'from-red-500 to-pink-500',
//       iconBg: 'bg-red-50 dark:bg-red-900/20',
//       iconColor: 'text-red-600 dark:text-red-400',
//       trend: -3
//     },
//     { 
//       label: 'Interest Rate', 
//       value: `${interestRate}%`, 
//       icon: Target, 
//       gradient: 'from-purple-500 to-pink-500',
//       iconBg: 'bg-purple-50 dark:bg-purple-900/20',
//       iconColor: 'text-purple-600 dark:text-purple-400',
//       trend: 10
//     },
//   ];

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
//         <div className="flex justify-center items-center h-64">
//           <div className="relative">
//             <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-primary border-t-transparent"></div>
//             <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Loading Analytics...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
//         <div className="flex justify-center items-center h-64">
//           <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl border border-red-200 dark:border-red-800 max-w-sm mx-4">
//             <div className="text-red-500 text-sm sm:text-base md:text-lg font-semibold">⚠️ {error}</div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-2 sm:p-3 md:p-4 lg:p-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
//         <div>
//           <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
//             Analytics
//           </h1>
//           <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0 sm:mt-0.5">Track your outreach performance and engagement metrics</p>
//         </div>
//         <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 w-full sm:w-auto">
//           <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 text-[8px] sm:text-[10px] md:text-sm text-gray-500 dark:text-gray-400">
//             <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
//             <span className="hidden xs:inline">Last updated: {new Date().toLocaleDateString()}</span>
//             <span className="xs:hidden">{new Date().toLocaleDateString()}</span>
//           </div>
//           <div className="px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-0.5 md:py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-[8px] sm:text-[10px] md:text-xs font-medium flex items-center gap-0.5 sm:gap-1">
//             <Activity className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" />
//             <span className="hidden xs:inline">Live</span>
//             <span className="xs:hidden">●</span>
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards - REDUCED HEIGHT FOR MOBILE */}
//       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 mb-3 sm:mb-4 md:mb-6">
//         {stats.map((stat, index) => (
//           <StatsCard key={index} stat={stat} />
//         ))}
//       </div>

//       {/* Charts Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-4 md:mb-6">
//         {/* Conversion Funnel with Area Chart */}
//         <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
//           <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 p-2 sm:p-3 md:p-4 lg:p-6">
//             <CardTitle className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-sm md:text-base text-gray-800 dark:text-gray-200">
//               <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-indigo-500" />
//               Conversion Funnel
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="p-2 sm:p-3 md:p-4 lg:p-6">
//             <ResponsiveContainer width="100%" height={200}>
//               <BarChart data={funnelData} layout="vertical">
//                 <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//                 <XAxis type="number" tick={{ fontSize: 10 }} />
//                 <YAxis dataKey="stage" type="category" tick={{ fontSize: 10 }} width={60} />
//                 <Tooltip content={<CustomTooltip />} />
//                 <Bar dataKey="count" radius={[0, 6, 6, 0]}>
//                   {funnelData.map((entry, i) => (
//                     <Cell key={i} fill={entry.fill} />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* Status Distribution Pie with Donut */}
//         <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
//           <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 p-2 sm:p-3 md:p-4 lg:p-6">
//             <CardTitle className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-sm md:text-base text-gray-800 dark:text-gray-200">
//               <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-purple-500" />
//               Status Distribution
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="p-2 sm:p-3 md:p-4 lg:p-6">
//             <ResponsiveContainer width="100%" height={200}>
//               <PieChart>
//                 <Pie
//                   data={statusData}
//                   cx="50%" cy="50%"
//                   innerRadius={40}
//                   outerRadius={65}
//                   dataKey="value"
//                   label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
//                   labelLine={false}
//                 >
//                   {statusData.map((_, i) => (
//                     <Cell key={i} fill={COLORS[i % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip content={<CustomTooltip />} />
//               </PieChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Weekly Outreach Trend with Area Chart */}
//       <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
//         <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 p-2 sm:p-3 md:p-4 lg:p-6">
//           <CardTitle className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-sm md:text-base text-gray-800 dark:text-gray-200">
//             <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-emerald-500" />
//             Weekly Outreach Performance
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="p-2 sm:p-3 md:p-4 lg:p-6">
//           <ResponsiveContainer width="100%" height={220}>
//             <AreaChart data={weeklyData.length ? weeklyData : [{ week: 'No Data', sent: 0, replied: 0, interested: 0, notInterested: 0 }]}>
//               <defs>
//                 <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
//                   <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
//                 </linearGradient>
//                 <linearGradient id="repliedGradient" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
//                   <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
//                 </linearGradient>
//                 <linearGradient id="interestedGradient" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
//                   <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
//                 </linearGradient>
//               </defs>
//               <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//               <XAxis dataKey="week" tick={{ fontSize: 10 }} />
//               <YAxis tick={{ fontSize: 10 }} />
//               <Tooltip content={<CustomTooltip />} />
//               <Legend wrapperStyle={{ fontSize: '10px' }} />
//               <Area type="monotone" dataKey="sent" stroke="#4F46E5" strokeWidth={2} fill="url(#sentGradient)" name="Sent" />
//               <Area type="monotone" dataKey="replied" stroke="#F59E0B" strokeWidth={2} fill="url(#repliedGradient)" name="Replied" />
//               <Area type="monotone" dataKey="interested" stroke="#10B981" strokeWidth={2} fill="url(#interestedGradient)" name="Interested" />
//               <Line type="monotone" dataKey="notInterested" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} name="Not Interested" />
//             </AreaChart>
//           </ResponsiveContainer>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }




// import { useState, useEffect, useMemo, useRef } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area, RadialBarChart, RadialBar, ComposedChart } from 'recharts';
// import { 
//   Mail, MessageSquare, TrendingUp, ThumbsUp, ThumbsDown, Building, 
//   Users, Target, Activity, ArrowUp, ArrowDown, Clock, Sparkles, 
//   Zap, BarChart3, PieChart as PieChartIcon, RefreshCw, 
//   Rocket, Crown, Award, Gem, Star, ChevronRight, 
//   Circle, Gauge, Layers, Globe, Filter, Download, 
//   Share2, Settings, Bell, User, Calendar, 
//   TrendingDown, AlertCircle, CheckCircle, XCircle,
//   Play, Pause, Maximize2, Minimize2
// } from 'lucide-react';
// import { ACTIVITY_URL, API_URL } from '@/components/api';
// import { motion, AnimatePresence } from 'framer-motion';

// // ============================================
// // ENHANCED COLOR SYSTEM
// // ============================================
// const COLORS = {
//   primary: {
//     light: '#818CF8',
//     DEFAULT: '#4F46E5',
//     dark: '#3730A3',
//   },
//   success: {
//     light: '#34D399',
//     DEFAULT: '#10B981',
//     dark: '#047857',
//   },
//   warning: {
//     light: '#FBBF24',
//     DEFAULT: '#F59E0B',
//     dark: '#B45309',
//   },
//   danger: {
//     light: '#F87171',
//     DEFAULT: '#EF4444',
//     dark: '#B91C1C',
//   },
//   purple: {
//     light: '#A78BFA',
//     DEFAULT: '#8B5CF6',
//     dark: '#6D28D9',
//   },
//   pink: {
//     light: '#F472B6',
//     DEFAULT: '#EC4899',
//     dark: '#BE185D',
//   },
// };

// const CHART_COLORS = [
//   '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
//   '#3B82F6', '#14B8A6', '#F97316', '#8B5CF6', '#06B6D4', '#D946EF'
// ];

// const GRADIENTS = {
//   indigo: 'from-indigo-600 via-indigo-500 to-purple-500',
//   purple: 'from-purple-600 via-pink-500 to-rose-500',
//   green: 'from-emerald-600 via-green-500 to-teal-500',
//   blue: 'from-blue-600 via-cyan-500 to-sky-500',
//   orange: 'from-orange-600 via-amber-500 to-yellow-500',
//   pink: 'from-pink-600 via-rose-500 to-red-500',
// };

// // ============================================
// // CUSTOM TOOLTIP COMPONENT
// // ============================================
// const CustomTooltip = ({ active, payload, label }: any) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 text-xs sm:text-sm transition-all duration-200">
//         <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5">{label}</p>
//         {payload.map((item: any, index: number) => (
//           <div key={index} className="flex items-center justify-between gap-4 py-0.5">
//             <div className="flex items-center gap-1.5">
//               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
//               <span className="text-gray-600 dark:text-gray-300">{item.name}</span>
//             </div>
//             <span className="font-medium text-gray-900 dark:text-gray-100">{item.value.toLocaleString()}</span>
//           </div>
//         ))}
//       </div>
//     );
//   }
//   return null;
// };

// // ============================================
// // ANIMATED BACKGROUND PARTICLES
// // ============================================
// const AnimatedBackground = () => {
//   const [particles] = useState(() => 
//     Array.from({ length: 30 }, (_, i) => ({
//       id: i,
//       x: Math.random() * 100,
//       y: Math.random() * 100,
//       size: Math.random() * 3 + 1,
//       duration: Math.random() * 20 + 10,
//       delay: Math.random() * 10,
//       opacity: Math.random() * 0.3 + 0.1,
//     }))
//   );

//   return (
//     <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
//       {particles.map((p) => (
//         <motion.div
//           key={p.id}
//           className="absolute rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20"
//           style={{
//             left: `${p.x}%`,
//             top: `${p.y}%`,
//             width: p.size,
//             height: p.size,
//           }}
//           animate={{
//             y: [0, -30, 0],
//             x: [0, 20, 0],
//             opacity: [p.opacity, p.opacity * 1.5, p.opacity],
//           }}
//           transition={{
//             duration: p.duration,
//             delay: p.delay,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//         />
//       ))}
//       <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" />
//       <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500" />
//     </div>
//   );
// };

// // ============================================
// // ADVANCED STATS CARD WITH MICRO-INTERACTIONS
// // ============================================
// const AdvancedStatsCard = ({ stat, index }: any) => {
//   const [isHovered, setIsHovered] = useState(false);
//   const progressRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (progressRef.current) {
//       progressRef.current.style.width = `${stat.progress || 0}%`;
//     }
//   }, [stat.progress]);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: index * 0.05, duration: 0.6 }}
//       whileHover={{ scale: 1.02 }}
//       className="relative"
//     >
//       <Card 
//         className="relative overflow-hidden transition-all duration-500 border-0 shadow-2xl hover:shadow-3xl cursor-pointer"
//         style={{
//           background: `linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(249,250,251,0.9) 100%)`,
//         }}
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//       >
//         {/* Animated border glow */}
//         <motion.div
//           className="absolute inset-0 rounded-xl"
//           animate={{
//             boxShadow: isHovered 
//               ? `0 0 40px ${stat.color}40` 
//               : '0 0 0px transparent',
//           }}
//           transition={{ duration: 0.3 }}
//         />

//         {/* Gradient overlay */}
//         <motion.div
//           className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0`}
//           animate={{ opacity: isHovered ? 0.08 : 0 }}
//           transition={{ duration: 0.4 }}
//         />

//         {/* Shine effect */}
//         <motion.div
//           className="absolute -inset-full top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
//           animate={{
//             left: isHovered ? '200%' : '-100%',
//           }}
//           transition={{ duration: 0.8 }}
//         />

//         <CardContent className="relative p-4 sm:p-5">
//           <div className="flex items-start justify-between mb-3">
//             <motion.div
//               className={`p-2.5 rounded-xl shadow-lg`}
//               style={{
//                 background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`,
//               }}
//               animate={{
//                 rotate: isHovered ? [0, -5, 5, 0] : 0,
//               }}
//               transition={{ duration: 0.5 }}
//             >
//               <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
//             </motion.div>
            
//             <div className="flex items-center gap-2">
//               <motion.div
//                 animate={{
//                   scale: isHovered ? 1.1 : 1,
//                 }}
//                 className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
//                   stat.trend > 0 
//                     ? 'bg-green-100 text-green-700' 
//                     : 'bg-red-100 text-red-700'
//                 }`}
//               >
//                 {stat.trend > 0 ? (
//                   <ArrowUp className="h-3 w-3" />
//                 ) : (
//                   <ArrowDown className="h-3 w-3" />
//                 )}
//                 {Math.abs(stat.trend)}%
//               </motion.div>
              
//               <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
//                 <Settings className="h-3 w-3 text-gray-400" />
//               </button>
//             </div>
//           </div>

//           <div>
//             <motion.p
//               className="text-2xl sm:text-3xl font-bold text-gray-900"
//               animate={{
//                 scale: isHovered ? 1.05 : 1,
//               }}
//               transition={{ duration: 0.3 }}
//             >
//               {stat.value}
//             </motion.p>
//             <p className="text-xs sm:text-sm text-gray-500 mt-0.5 font-medium">
//               {stat.label}
//             </p>
            
//             {/* Progress bar */}
//             {stat.progress !== undefined && (
//               <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
//                 <motion.div
//                   ref={progressRef}
//                   className="h-full rounded-full"
//                   style={{ background: `linear-gradient(90deg, ${stat.color}, ${stat.color}80)` }}
//                   initial={{ width: 0 }}
//                   animate={{ width: `${stat.progress}%` }}
//                   transition={{ duration: 1, delay: 0.2 }}
//                 />
//               </div>
//             )}
//           </div>

//           {/* Decorative corner accent */}
//           <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
//             <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${stat.gradient} opacity-10 transform rotate-45 translate-y-8 translate-x-8`} />
//           </div>
//         </CardContent>
//       </Card>
//     </motion.div>
//   );
// };

// // ============================================
// // ADVANCED CHART CARD
// // ============================================
// const AdvancedChartCard = ({ children, title, icon, subtitle, action, className = '' }: any) => (
//   <motion.div
//     initial={{ opacity: 0, y: 30 }}
//     animate={{ opacity: 1, y: 0 }}
//     transition={{ duration: 0.6 }}
//     className="relative"
//   >
//     <Card className={`overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 ${className}`}>
//       {/* Glass effect overlay */}
//       <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-gray-800/50 pointer-events-none" />
      
//       <CardHeader className="relative border-b border-gray-100/50 dark:border-gray-700/50 p-4 sm:p-5">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
//               {icon}
//             </div>
//             <div>
//               <CardTitle className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">
//                 {title}
//               </CardTitle>
//               {subtitle && (
//                 <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>
//               )}
//             </div>
//           </div>
          
//           <div className="flex items-center gap-1.5">
//             {action && (
//               <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
//                 <Filter className="h-4 w-4 text-gray-400" />
//               </button>
//             )}
//             <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
//               <Download className="h-4 w-4 text-gray-400" />
//             </button>
//             <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
//               <Share2 className="h-4 w-4 text-gray-400" />
//             </button>
//             <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
//             <div className="flex items-center gap-1">
//               <span className="text-[10px] text-gray-400">Live</span>
//               <span className="relative flex h-2 w-2">
//                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
//                 <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
//               </span>
//             </div>
//           </div>
//         </div>
//       </CardHeader>
      
//       <CardContent className="relative p-4 sm:p-5">
//         {children}
//       </CardContent>
//     </Card>
//   </motion.div>
// );

// // ============================================
// // ANIMATED METRIC RING
// // ============================================
// const MetricRing = ({ value, label, color, size = 80 }: any) => {
//   const circumference = 2 * Math.PI * 30;
//   const progress = (value / 100) * circumference;
  
//   return (
//     <motion.div 
//       className="flex flex-col items-center"
//       whileHover={{ scale: 1.05 }}
//       transition={{ duration: 0.3 }}
//     >
//       <div className="relative" style={{ width: size, height: size }}>
//         <svg className="transform -rotate-90" width={size} height={size}>
//           <circle
//             className="text-gray-200"
//             strokeWidth="6"
//             stroke="currentColor"
//             fill="transparent"
//             r="30"
//             cx={size/2}
//             cy={size/2}
//           />
//           <motion.circle
//             className="transition-all duration-1000"
//             strokeWidth="6"
//             stroke={color}
//             fill="transparent"
//             r="30"
//             cx={size/2}
//             cy={size/2}
//             strokeDasharray={circumference}
//             strokeDashoffset={circumference}
//             animate={{ strokeDashoffset: circumference - progress }}
//             transition={{ duration: 1.5, ease: "easeOut" }}
//             strokeLinecap="round"
//           />
//         </svg>
//         <div className="absolute inset-0 flex items-center justify-center">
//           <motion.span 
//             className="text-lg font-bold text-gray-900"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.5 }}
//           >
//             {value}%
//           </motion.span>
//         </div>
//       </div>
//       <p className="text-xs text-gray-500 mt-1.5 font-medium">{label}</p>
//     </motion.div>
//   );
// };

// // ============================================
// // MAIN DASHBOARD COMPONENT
// // ============================================
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
//   const [lastUpdated, setLastUpdated] = useState(new Date());
//   const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
//   const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

//   const getSellerId = () => {
//     const sellerStr = localStorage.getItem('seller');
//     if (!sellerStr) return null;
//     try {
//       const seller = JSON.parse(sellerStr);
//       return seller?.id;
//     } catch (e) {
//       return null;
//     }
//   };

//   const fetchData = async () => {
//     const sellerId = getSellerId();
//     if (!sellerId) {
//       setError('No seller found — please log in again');
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await fetch(`${API_URL}/api/tracking/counts?seller_id=${sellerId}`);
//       const data = await response.json();
//       if (data.success) {
//         setTrackingData(data.data);
//         setLastUpdated(new Date());
//       } else {
//         setError('Failed to load analytics data');
//       }
//     } catch (err) {
//       setError('Error loading analytics data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     // Activity log
//     const logActivity = async () => {
//       try {
//         const seller = JSON.parse(localStorage.getItem("seller") || "{}");
//         await fetch(`${ACTIVITY_URL}/api/activity-log`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             userId: seller.id || 1,
//             userName: seller.name || seller.email || 'Unknown',
//             role: seller.role || 'seller',
//             action_id: 34,
//             module_id: 9,
//             description: 'Viewed analytics dashboard',
//             status: 'SUCCESS'
//           })
//         });
//       } catch (e) {}
//     };
//     logActivity();
//     fetchData();

//     const interval = setInterval(fetchData, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   // ============================================
//   // DATA COMPUTATIONS
//   // ============================================
//   const totalSent = trackingData.sent;
//   const totalReplied = trackingData.replied;
//   const totalInterested = trackingData.interested;
//   const totalNotInterested = trackingData.not_interested;
//   const totalNotContacted = trackingData.not_contacted;
//   const emailSentNoResponse = totalSent - totalReplied;
//   const responseRate = totalSent ? Math.round((totalReplied / totalSent) * 100) : 0;
//   const interestRate = totalReplied ? Math.round((totalInterested / totalReplied) * 100) : 0;
//   const engagementRate = totalSent ? Math.round(((totalInterested + totalReplied) / totalSent) * 100) : 0;
//   const conversionRate = totalSent ? Math.round((totalInterested / totalSent) * 100) : 0;

//   // Status distribution
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
//     { stage: 'Emails Sent', count: totalSent, fill: '#4F46E5' },
//     { stage: 'Replied', count: totalReplied, fill: '#8B5CF6' },
//     { stage: 'Interested', count: totalInterested, fill: '#10B981' },
//   ];

//   // Weekly data for the chart
//   const weeklyData = useMemo(() => {
//     return [
//       { 
//         week: 'Current Week', 
//         sent: totalSent, 
//         replied: totalReplied, 
//         interested: totalInterested, 
//         notInterested: totalNotInterested 
//       }
//     ];
//   }, [trackingData]);

//   // Stats configuration
//   const stats = [
//     { 
//       label: 'Total Emails Sent', 
//       value: totalSent.toLocaleString(), 
//       icon: Mail, 
//       color: COLORS.primary.DEFAULT,
//       gradient: GRADIENTS.indigo,
//       trend: 12,
//       progress: Math.min((totalSent / 100) * 100, 100),
//     },
//     { 
//       label: 'Response Rate', 
//       value: `${responseRate}%`, 
//       icon: TrendingUp, 
//       color: COLORS.success.DEFAULT,
//       gradient: GRADIENTS.green,
//       trend: 8,
//       progress: responseRate,
//     },
//     { 
//       label: 'Interested', 
//       value: totalInterested.toLocaleString(), 
//       icon: ThumbsUp, 
//       color: COLORS.success.DEFAULT,
//       gradient: GRADIENTS.green,
//       trend: 18,
//       progress: Math.min((totalInterested / 50) * 100, 100),
//     },
//     { 
//       label: 'Not Interested', 
//       value: totalNotInterested.toLocaleString(), 
//       icon: ThumbsDown, 
//       color: COLORS.danger.DEFAULT,
//       gradient: GRADIENTS.pink,
//       trend: -5,
//       progress: Math.min((totalNotInterested / 30) * 100, 100),
//     },
//     { 
//       label: 'Engagement Rate', 
//       value: `${engagementRate}%`, 
//       icon: Target, 
//       color: COLORS.purple.DEFAULT,
//       gradient: GRADIENTS.purple,
//       trend: 10,
//       progress: engagementRate,
//     },
//   ];

//   // ============================================
//   // RENDER
//   // ============================================
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
//         <AnimatedBackground />
//         <div className="flex flex-col justify-center items-center h-screen gap-6">
//           <div className="relative">
//             <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-500 border-t-transparent"></div>
//             <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-transparent"></div>
//             <motion.div
//               className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500"
//               animate={{ rotate: 360 }}
//               transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
//             />
//           </div>
//           <div className="text-center">
//             <motion.p 
//               className="text-lg font-semibold text-gray-700 dark:text-gray-300"
//               animate={{ opacity: [0.5, 1, 0.5] }}
//               transition={{ duration: 2, repeat: Infinity }}
//             >
//               Loading Analytics...
//             </motion.p>
//             <p className="text-sm text-gray-400 mt-1">Preparing your insights</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
//         <AnimatedBackground />
//         <div className="flex justify-center items-center h-screen">
//           <motion.div 
//             className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-red-200 dark:border-red-800 max-w-md mx-4 text-center"
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//           >
//             <div className="text-6xl mb-4">🚀</div>
//             <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Oops! Something went wrong</h3>
//             <p className="text-red-500 text-sm mb-4">{error}</p>
//             <motion.button 
//               onClick={fetchData}
//               className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-500/25 transition-all"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               Try Again
//             </motion.button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/10 to-purple-50/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
//       <AnimatedBackground />

//       <div className="relative p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
//         {/* ============================================ */}
//         {/* HEADER WITH ADVANCED CONTROLS */}
//         {/* ============================================ */}
//         <motion.div 
//           className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           <div className="flex items-center gap-4">
//             <motion.div 
//               className="p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-xl shadow-indigo-500/30"
//               whileHover={{ rotate: 10, scale: 1.05 }}
//             >
//               <Rocket className="h-6 w-6 text-white" />
//             </motion.div>
//             <div>
//               <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
//                 Analytics Dashboard
//               </h1>
//               <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
//                 <Sparkles className="h-3.5 w-3.5" />
//                 Track and optimize your outreach performance
//               </p>
//             </div>
//           </div>

//           <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
//             {/* Time range selector */}
//             <div className="flex bg-white/50 dark:bg-gray-800/50 p-1 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50">
//               {['Week', 'Month', 'Year'].map((range) => (
//                 <button
//                   key={range}
//                   onClick={() => setTimeRange(range.toLowerCase() as any)}
//                   className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
//                     timeRange === range.toLowerCase()
//                       ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
//                       : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {range}
//                 </button>
//               ))}
//             </div>

//             {/* View mode toggle */}
//             <div className="flex bg-white/50 dark:bg-gray-800/50 p-1 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50">
//               <button
//                 onClick={() => setViewMode('grid')}
//                 className={`p-1.5 rounded-lg transition-all ${
//                   viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-gray-400'
//                 }`}
//               >
//                 <Layers className="h-4 w-4" />
//               </button>
//               <button
//                 onClick={() => setViewMode('compact')}
//                 className={`p-1.5 rounded-lg transition-all ${
//                   viewMode === 'compact' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-gray-400'
//                 }`}
//               >
//                 <Gauge className="h-4 w-4" />
//               </button>
//             </div>

//             {/* Quick actions */}
//             <button className="p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-colors">
//               <Bell className="h-4 w-4 text-gray-500" />
//             </button>
//             <button className="p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-colors">
//               <User className="h-4 w-4 text-gray-500" />
//             </button>
//           </div>
//         </motion.div>

//         {/* ============================================ */}
//         {/* METRIC RINGS ROW */}
//         {/* ============================================ */}
//         <motion.div 
//           className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//         >
//           <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
//             <MetricRing value={responseRate} label="Response Rate" color="#4F46E5" />
//           </div>
//           <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
//             <MetricRing value={interestRate} label="Interest Rate" color="#10B981" />
//           </div>
//           <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
//             <MetricRing value={engagementRate} label="Engagement Rate" color="#8B5CF6" />
//           </div>
//           <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
//             <MetricRing value={conversionRate} label="Conversion Rate" color="#F59E0B" />
//           </div>
//         </motion.div>

//         {/* ============================================ */}
//         {/* STATS CARDS GRID */}
//         {/* ============================================ */}
//         <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-5' : 'grid-cols-2 md:grid-cols-3'} gap-3 sm:gap-4 mb-6`}>
//           {stats.map((stat, index) => (
//             <AdvancedStatsCard key={index} stat={stat} index={index} />
//           ))}
//         </div>

//         {/* ============================================ */}
//         {/* MAIN CHARTS GRID */}
//         {/* ============================================ */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
//           {/* Conversion Funnel - Enhanced */}
//           <AdvancedChartCard 
//             title="Conversion Funnel" 
//             icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />}
//             subtitle="Email to interested conversion flow"
//             action
//           >
//             <ResponsiveContainer width="100%" height={260}>
//               <ComposedChart data={funnelData} layout="vertical" margin={{ left: 10, right: 10 }}>
//                 <defs>
//                   <linearGradient id="funnelGrad1" x1="0" y1="0" x2="1" y2="0">
//                     <stop offset="0%" stopColor="#4F46E5" />
//                     <stop offset="100%" stopColor="#818CF8" />
//                   </linearGradient>
//                   <linearGradient id="funnelGrad2" x1="0" y1="0" x2="1" y2="0">
//                     <stop offset="0%" stopColor="#8B5CF6" />
//                     <stop offset="100%" stopColor="#A78BFA" />
//                   </linearGradient>
//                   <linearGradient id="funnelGrad3" x1="0" y1="0" x2="1" y2="0">
//                     <stop offset="0%" stopColor="#10B981" />
//                     <stop offset="100%" stopColor="#34D399" />
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
//                 <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
//                 <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={90} />
//                 <Tooltip content={<CustomTooltip />} />
//                 <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={45}>
//                   {funnelData.map((entry, i) => (
//                     <Cell key={i} fill={`url(#funnelGrad${i + 1})`} />
//                   ))}
//                 </Bar>
//                 <Line 
//                   type="monotone" 
//                   dataKey="count" 
//                   stroke="#4F46E5" 
//                   strokeWidth={2}
//                   dot={{ r: 5, fill: '#4F46E5', strokeWidth: 2 }}
//                 />
//               </ComposedChart>
//             </ResponsiveContainer>
//           </AdvancedChartCard>

//           {/* Status Distribution - Enhanced */}
//           <AdvancedChartCard 
//             title="Status Distribution" 
//             icon={<PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />}
//             subtitle="Breakdown by response status"
//             action
//           >
//             <ResponsiveContainer width="100%" height={260}>
//               <PieChart>
//                 <defs>
//                   {CHART_COLORS.map((color, i) => (
//                     <linearGradient key={i} id={`pieGrad${i}`} x1="0" y1="0" x2="1" y2="1">
//                       <stop offset="0%" stopColor={color} stopOpacity={0.8} />
//                       <stop offset="100%" stopColor={color} stopOpacity={1} />
//                     </linearGradient>
//                   ))}
//                 </defs>
//                 <Pie
//                   data={statusData}
//                   cx="50%" cy="45%"
//                   innerRadius={55}
//                   outerRadius={85}
//                   dataKey="value"
//                   label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
//                   labelLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
//                   animationDuration={1000}
//                   animationBegin={200}
//                 >
//                   {statusData.map((_, i) => (
//                     <Cell key={i} fill={`url(#pieGrad${i % CHART_COLORS.length})`} />
//                   ))}
//                 </Pie>
//                 <Tooltip content={<CustomTooltip />} />
//                 <Legend 
//                   verticalAlign="bottom" 
//                   height={40}
//                   formatter={(value) => (
//                     <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">{value}</span>
//                   )}
//                 />
//               </PieChart>
//             </ResponsiveContainer>
//           </AdvancedChartCard>
//         </div>

//         {/* ============================================ */}
//         {/* WEEKLY PERFORMANCE - FULL WIDTH */}
//         {/* ============================================ */}
//         <AdvancedChartCard 
//           title="Weekly Outreach Performance" 
//           icon={<Activity className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />}
//           subtitle="Track trends and identify patterns"
//           action
//           className="md:col-span-2"
//         >
//           <ResponsiveContainer width="100%" height={280}>
//             <AreaChart data={weeklyData}>
//               <defs>
//                 <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
//                   <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
//                 </linearGradient>
//                 <linearGradient id="repliedGradient" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
//                   <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
//                 </linearGradient>
//                 <linearGradient id="interestedGradient" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
//                   <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
//                 </linearGradient>
//                 <linearGradient id="notInterestedGradient" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
//                   <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
//                 </linearGradient>
//               </defs>
//               <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
//               <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
//               <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
//               <Tooltip content={<CustomTooltip />} />
//               <Legend 
//                 verticalAlign="top" 
//                 height={40}
//                 formatter={(value) => (
//                   <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">{value}</span>
//                 )}
//               />
//               <Area type="monotone" dataKey="sent" stroke="#4F46E5" strokeWidth={3} fill="url(#sentGradient)" name="📧 Sent" />
//               <Area type="monotone" dataKey="replied" stroke="#F59E0B" strokeWidth={3} fill="url(#repliedGradient)" name="💬 Replied" />
//               <Area type="monotone" dataKey="interested" stroke="#10B981" strokeWidth={3} fill="url(#interestedGradient)" name="❤️ Interested" />
//               <Area type="monotone" dataKey="notInterested" stroke="#EF4444" strokeWidth={3} fill="url(#notInterestedGradient)" name="👎 Not Interested" />
//             </AreaChart>
//           </ResponsiveContainer>
//         </AdvancedChartCard>

//         {/* ============================================ */}
//         {/* FOOTER */}
//         {/* ============================================ */}
//         <motion.div 
//           className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.5 }}
//         >
//           <div className="flex items-center gap-2 text-xs text-gray-400">
//             <Clock className="h-3.5 w-3.5" />
//             Last updated: {lastUpdated.toLocaleString()}
//             <span className="w-px h-4 bg-gray-300" />
//             <span>Auto-refresh every 60s</span>
//           </div>
//           <div className="flex items-center gap-3">
//             <button className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
//               <Download className="h-3.5 w-3.5" />
//               Export
//             </button>
//             <button className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
//               <Share2 className="h-3.5 w-3.5" />
//               Share
//             </button>
//             <div className="flex items-center gap-1.5 text-xs text-gray-400">
//               <span className="flex items-center gap-1.5">
//                 <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
//                 Live
//               </span>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// }




import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area, RadialBarChart, RadialBar, ComposedChart } from 'recharts';
import { 
  Mail, MessageSquare, TrendingUp, ThumbsUp, ThumbsDown, Building, 
  Users, Target, Activity, ArrowUp, ArrowDown, Clock, Sparkles, 
  Zap, BarChart3, PieChart as PieChartIcon, RefreshCw, 
  Rocket, Crown, Award, Gem, Star, ChevronRight, 
  Circle, Gauge, Layers, Globe, Filter, Download, 
  Share2, Settings, Bell, User, Calendar, 
  TrendingDown, AlertCircle, CheckCircle, XCircle,
  Play, Pause, Maximize2, Minimize2
} from 'lucide-react';
import { ACTIVITY_URL, API_URL } from '@/components/api';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// ENHANCED COLOR SYSTEM - Updated with new colors
// ============================================
const COLORS = {
  primary: {
    light: '#8EE147',
    DEFAULT: '#8EE147',
    dark: '#6EC035',
  },
  success: {
    light: '#8EE147',
    DEFAULT: '#8EE147',
    dark: '#6EC035',
  },
  warning: {
    light: '#FBBF24',
    DEFAULT: '#F59E0B',
    dark: '#B45309',
  },
  danger: {
    light: '#F87171',
    DEFAULT: '#EF4444',
    dark: '#B91C1C',
  },
  purple: {
    light: '#A78BFA',
    DEFAULT: '#8B5CF6',
    dark: '#6D28D9',
  },
  pink: {
    light: '#F472B6',
    DEFAULT: '#EC4899',
    dark: '#BE185D',
  },
  dark: {
    light: '#1A3355',
    DEFAULT: '#0E223B',
    dark: '#0A1A2E',
  }
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
// ANIMATED BACKGROUND PARTICLES - Updated with new colors
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
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#8EE147]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#6EC035]/5 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8EE147]/5 rounded-full blur-3xl animate-pulse delay-500" />
    </div>
  );
};

// ============================================
// ADVANCED STATS CARD WITH MICRO-INTERACTIONS - Updated with new colors
// ============================================
const AdvancedStatsCard = ({ stat, index }: any) => {
  const [isHovered, setIsHovered] = useState(false);
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
      whileHover={{ scale: 1.02 }}
      className="relative"
    >
      <Card 
        className="relative overflow-hidden transition-all duration-500 border-0 shadow-2xl hover:shadow-3xl cursor-pointer"
        style={{
          background: 'linear-gradient(145deg, rgba(14,34,59,0.95) 0%, rgba(26,51,85,0.95) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          animate={{
            boxShadow: isHovered 
              ? `0 0 40px ${stat.color}40` 
              : '0 0 0px transparent',
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Gradient overlay */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0`}
          animate={{ opacity: isHovered ? 0.08 : 0 }}
          transition={{ duration: 0.4 }}
        />

        {/* Shine effect */}
        <motion.div
          className="absolute -inset-full top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
          animate={{
            left: isHovered ? '200%' : '-100%',
          }}
          transition={{ duration: 0.8 }}
        />

        <CardContent className="relative p-4 sm:p-5">
          <div className="flex items-start justify-between mb-3">
            <motion.div
              className={`p-2.5 rounded-xl shadow-lg`}
              style={{
                background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`,
                border: `1px solid ${stat.color}30`,
              }}
              animate={{
                rotate: isHovered ? [0, -5, 5, 0] : 0,
              }}
              transition={{ duration: 0.5 }}
            >
              <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
            </motion.div>
            
            <div className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: isHovered ? 1.1 : 1,
                }}
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
              </motion.div>
              
              <button className="p-1 rounded-full hover:bg-white/10 transition-colors">
                <Settings className="h-3 w-3 text-slate-400" />
              </button>
            </div>
          </div>

          <div>
            <motion.p
              className="text-2xl sm:text-3xl font-bold text-white"
              animate={{
                scale: isHovered ? 1.05 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {stat.value}
            </motion.p>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-medium">
              {stat.label}
            </p>
            
            {/* Progress bar */}
            {stat.progress !== undefined && (
              <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  ref={progressRef}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${stat.color}, ${stat.color}80)` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.progress}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            )}
          </div>

          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
            <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${stat.gradient} opacity-10 transform rotate-45 translate-y-8 translate-x-8`} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ============================================
// ADVANCED CHART CARD - Updated with new colors
// ============================================
const AdvancedChartCard = ({ children, title, icon, subtitle, action, className = '' }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="relative"
  >
    <Card className={`overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 backdrop-blur-sm bg-[#0E223B]/90 border border-white/10 ${className}`}>
      {/* Glass effect overlay */}
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
          
          <div className="flex items-center gap-1.5">
            {action && (
              <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <Filter className="h-4 w-4 text-slate-400" />
              </button>
            )}
            <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <Download className="h-4 w-4 text-slate-400" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <Share2 className="h-4 w-4 text-slate-400" />
            </button>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400">Live</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8EE147] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8EE147]"></span>
              </span>
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
// ANIMATED METRIC RING - Updated with new colors
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
          <circle
            className="text-white/10"
            strokeWidth="6"
            stroke="currentColor"
            fill="transparent"
            r="30"
            cx={size/2}
            cy={size/2}
          />
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
          <motion.span 
            className="text-lg font-bold text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
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
    sent: 0,
    replied: 0,
    interested: 0,
    not_interested: 0,
    not_contacted: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

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
    // Activity log
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

  // ============================================
  // DATA COMPUTATIONS
  // ============================================
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

  // Status distribution
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
    { stage: 'Emails Sent', count: totalSent, fill: '#8EE147' },
    { stage: 'Replied', count: totalReplied, fill: '#6EC035' },
    { stage: 'Interested', count: totalInterested, fill: '#5AA82E' },
  ];

  // Weekly data for the chart
  const weeklyData = useMemo(() => {
    return [
      { 
        week: 'Current Week', 
        sent: totalSent, 
        replied: totalReplied, 
        interested: totalInterested, 
        notInterested: totalNotInterested 
      }
    ];
  }, [trackingData]);

  // Stats configuration - Updated with new colors
  const stats = [
    { 
      label: 'Total Emails Sent', 
      value: totalSent.toLocaleString(), 
      icon: Mail, 
      color: COLORS.primary.DEFAULT,
      gradient: GRADIENTS.green,
      trend: 12,
      progress: Math.min((totalSent / 100) * 100, 100),
    },
    { 
      label: 'Response Rate', 
      value: `${responseRate}%`, 
      icon: TrendingUp, 
      color: COLORS.success.DEFAULT,
      gradient: GRADIENTS.green,
      trend: 8,
      progress: responseRate,
    },
    { 
      label: 'Interested', 
      value: totalInterested.toLocaleString(), 
      icon: ThumbsUp, 
      color: COLORS.success.DEFAULT,
      gradient: GRADIENTS.green,
      trend: 18,
      progress: Math.min((totalInterested / 50) * 100, 100),
    },
    { 
      label: 'Not Interested', 
      value: totalNotInterested.toLocaleString(), 
      icon: ThumbsDown, 
      color: COLORS.danger.DEFAULT,
      gradient: GRADIENTS.pink,
      trend: -5,
      progress: Math.min((totalNotInterested / 30) * 100, 100),
    },
    { 
      label: 'Engagement Rate', 
      value: `${engagementRate}%`, 
      icon: Target, 
      color: COLORS.purple.DEFAULT,
      gradient: GRADIENTS.purple,
      trend: 10,
      progress: engagementRate,
    },
  ];

  // ============================================
  // RENDER
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E223B]">
        <AnimatedBackground />
        <div className="flex flex-col justify-center items-center h-screen gap-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-[#8EE147] border-t-transparent"></div>
            <div className="absolute inset-0 rounded-full border-4 border-[#8EE147]/20 border-t-transparent"></div>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#6EC035]"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <div className="text-center">
            <motion.p 
              className="text-lg font-semibold text-white"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
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
          <motion.div 
            className="bg-[#0E223B] backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/10 max-w-md mx-4 text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-white mb-2">Oops! Something went wrong</h3>
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <motion.button 
              onClick={fetchData}
              className="px-6 py-2.5 bg-gradient-to-r from-[#8EE147] to-[#6EC035] hover:from-[#7DD13A] hover:to-[#5AA82E] text-[#0E223B] rounded-xl text-sm font-medium shadow-lg shadow-[#8EE147]/25 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
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
        {/* ============================================ */}
        {/* HEADER WITH ADVANCED CONTROLS - Updated */}
        {/* ============================================ */}
        <motion.div 
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="p-3 rounded-2xl bg-gradient-to-r from-[#8EE147] to-[#6EC035] shadow-xl shadow-[#8EE147]/30"
              whileHover={{ rotate: 10, scale: 1.05 }}
            >
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
            {/* Time range selector */}
            <div className="flex bg-[#0E223B]/80 p-1 rounded-xl shadow-sm border border-white/10">
              {['Week', 'Month', 'Year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range.toLowerCase() as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    timeRange === range.toLowerCase()
                      ? 'bg-gradient-to-r from-[#8EE147] to-[#6EC035] text-[#0E223B] shadow-lg shadow-[#8EE147]/25'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* View mode toggle */}
            <div className="flex bg-[#0E223B]/80 p-1 rounded-xl shadow-sm border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-gradient-to-r from-[#8EE147] to-[#6EC035] text-[#0E223B] shadow-lg shadow-[#8EE147]/25' : 'text-slate-400'
                }`}
              >
                <Layers className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'compact' ? 'bg-gradient-to-r from-[#8EE147] to-[#6EC035] text-[#0E223B] shadow-lg shadow-[#8EE147]/25' : 'text-slate-400'
                }`}
              >
                <Gauge className="h-4 w-4" />
              </button>
            </div>

            {/* Quick actions */}
            <button className="p-2 rounded-xl bg-[#0E223B]/80 shadow-sm border border-white/10 hover:bg-[#1A3355] transition-colors">
              <Bell className="h-4 w-4 text-slate-400" />
            </button>
            <button className="p-2 rounded-xl bg-[#0E223B]/80 shadow-sm border border-white/10 hover:bg-[#1A3355] transition-colors">
              <User className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </motion.div>

        {/* ============================================ */}
        {/* METRIC RINGS ROW - Updated */}
        {/* ============================================ */}
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
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

        {/* ============================================ */}
        {/* STATS CARDS GRID - Updated */}
        {/* ============================================ */}
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-5' : 'grid-cols-2 md:grid-cols-3'} gap-3 sm:gap-4 mb-6`}>
          {stats.map((stat, index) => (
            <AdvancedStatsCard key={index} stat={stat} index={index} />
          ))}
        </div>

        {/* ============================================ */}
        {/* MAIN CHARTS GRID - Updated */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Conversion Funnel - Enhanced */}
          <AdvancedChartCard 
            title="Conversion Funnel" 
            icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-[#8EE147]" />}
            subtitle="Email to interested conversion flow"
            action
          >
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={funnelData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <defs>
                  <linearGradient id="funnelGrad1" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8EE147" />
                    <stop offset="100%" stopColor="#6EC035" />
                  </linearGradient>
                  <linearGradient id="funnelGrad2" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6EC035" />
                    <stop offset="100%" stopColor="#5AA82E" />
                  </linearGradient>
                  <linearGradient id="funnelGrad3" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#5AA82E" />
                    <stop offset="100%" stopColor="#4A9025" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" opacity={0.2} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: '#94A3B8' }} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={45}>
                  {funnelData.map((entry, i) => (
                    <Cell key={i} fill={`url(#funnelGrad${i + 1})`} />
                  ))}
                </Bar>
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8EE147" 
                  strokeWidth={2}
                  dot={{ r: 5, fill: '#8EE147', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </AdvancedChartCard>

          {/* Status Distribution - Enhanced */}
          <AdvancedChartCard 
            title="Status Distribution" 
            icon={<PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#8EE147]" />}
            subtitle="Breakdown by response status"
            action
          >
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
                <Pie
                  data={statusData}
                  cx="50%" cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                  animationDuration={1000}
                  animationBegin={200}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={`url(#pieGrad${i % CHART_COLORS.length})`} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={40}
                  formatter={(value) => (
                    <span className="text-xs text-slate-300 font-medium">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </AdvancedChartCard>
        </div>

        {/* ============================================ */}
        {/* WEEKLY PERFORMANCE - FULL WIDTH - Updated */}
        {/* ============================================ */}
        <AdvancedChartCard 
          title="Weekly Outreach Performance" 
          icon={<Activity className="h-4 w-4 sm:h-5 sm:w-5 text-[#8EE147]" />}
          subtitle="Track trends and identify patterns"
          action
          className="md:col-span-2"
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8EE147" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8EE147" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="repliedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="interestedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8EE147" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8EE147" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="notInterestedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" opacity={0.2} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={40}
                formatter={(value) => (
                  <span className="text-xs text-slate-300 font-medium">{value}</span>
                )}
              />
              <Area type="monotone" dataKey="sent" stroke="#8EE147" strokeWidth={3} fill="url(#sentGradient)" name="📧 Sent" />
              <Area type="monotone" dataKey="replied" stroke="#F59E0B" strokeWidth={3} fill="url(#repliedGradient)" name="💬 Replied" />
              <Area type="monotone" dataKey="interested" stroke="#8EE147" strokeWidth={3} fill="url(#interestedGradient)" name="❤️ Interested" />
              <Area type="monotone" dataKey="notInterested" stroke="#EF4444" strokeWidth={3} fill="url(#notInterestedGradient)" name="👎 Not Interested" />
            </AreaChart>
          </ResponsiveContainer>
        </AdvancedChartCard>

        {/* ============================================ */}
        {/* FOOTER - Updated */}
        {/* ============================================ */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            Last updated: {lastUpdated.toLocaleString()}
            <span className="w-px h-4 bg-white/10" />
            <span>Auto-refresh every 60s</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-xs text-slate-400 hover:text-[#8EE147] flex items-center gap-1 transition-colors">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button className="text-xs text-slate-400 hover:text-[#8EE147] flex items-center gap-1 transition-colors">
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#8EE147] animate-pulse" />
                Live
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}