// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // Add this import
// import { Card, CardContent } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Search, RefreshCw, User, Mail, Shield, Users, RefreshCw as RefreshIcon } from 'lucide-react';
// import { AdminSidebar } from "@/components/AdminSidebar";
// import { Pagination } from './Pagination';
// import {API_URL} from "@/components/api"
// import './AdminUsers.css';

// interface User {
//   user_id: number;
//   id: string;
//   email: string;
//   role: string;
//   email_sent: number;
//   email_config: number;
// }

// const AdminUsers = () => {
//   const navigate = useNavigate(); // Add navigate hook
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [roleFilter, setRoleFilter] = useState('all');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(5);
//   const [itemsPerPageOptions] = useState([5, 10, 20, 50, 100]);

//   // Get unique roles for filter
//   const roles = [...new Set(users.map(user => user.role))].sort();

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`${API_URL}/users`);
//       const data = await response.json();
      
//       if (data.success) {
//         setUsers(data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle email click - navigate to tracking page with seller ID
//   const handleEmailClick = (userId: string) => {
//     // Navigate to tracking page with the user ID
//     navigate(`/admin/tracking/${userId}`);
//   };

//   // Filter users
//   const filteredUsers = users.filter(user => {
//     const matchesSearch = !searchQuery || 
//       user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
//     const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
//     return matchesSearch && matchesRole;
//   });

//   // Pagination
//   const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
//   const paginatedUsers = filteredUsers.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   // Reset to first page when filters change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchQuery, roleFilter, itemsPerPage]);

//   const getRoleBadge = (role: string) => {
//     const colors: Record<string, string> = {
//       'admin': 'bg-red-100 text-red-700 border border-red-200',
//       'seller': 'bg-blue-100 text-blue-700 border border-blue-200',
//       'user': 'bg-green-100 text-green-700 border border-green-200',
//     };
//     return (
//       <Badge className={`${colors[role] || 'bg-gray-100 text-gray-700 border border-gray-200'} font-medium hover:${colors[role] || 'bg-gray-100'}`}>
//         {role.charAt(0).toUpperCase() + role.slice(1)}
//       </Badge>
//     );
//   };

//   const getStatusBadge = (status: number, type: string) => {
//     const isEnabled = status === 1;
//     const label = type === 'sent' ? 'Email Sent' : 'Email Config';
//     return (
//       <Badge className={isEnabled ? 'bg-green-100 text-green-700 border border-green-200 font-medium' : 'bg-gray-100 text-gray-500 border border-gray-200 font-medium'}>
//         {isEnabled ? '✓' : '✗'} {label}
//       </Badge>
//     );
//   };

//   const handlePageChange = (page: number) => {
//     setCurrentPage(page);
//   };

//   const handleItemsPerPageChange = (items: number) => {
//     setItemsPerPage(items);
//     setCurrentPage(1);
//   };

//   return (
//     <div className="flex h-screen w-full">
//       <AdminSidebar />
//       <div className="flex-1 overflow-auto p-6 content-space">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
//               <Users className="h-6 w-6 text-primary" />
//               User Management
//             </h1>
//             <p className="text-sm text-muted-foreground mt-1">
//               Manage and view all registered users
//             </p>
//           </div>
//           <Button onClick={fetchUsers} disabled={loading} variant="outline" className="gap-2">
//             <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
//             Refresh
//           </Button>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//           <Card className="border-border/60 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300">
//             <CardContent className="pt-4 pb-4">
//               <div className="flex items-center gap-3">
//                 <div className="p-2.5 rounded-xl bg-blue-100 ring-1 ring-blue-200/60">
//                   <Users className="h-5 w-5 text-blue-600" />
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold text-foreground leading-tight">{users.length}</p>
//                   <p className="text-xs text-muted-foreground">Total Users</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//           <Card className="border-border/60 shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300">
//             <CardContent className="pt-4 pb-4">
//               <div className="flex items-center gap-3">
//                 <div className="p-2.5 rounded-xl bg-red-100 ring-1 ring-red-200/60">
//                   <Shield className="h-5 w-5 text-red-600" />
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold text-foreground leading-tight">{users.filter(u => u.role === 'admin').length}</p>
//                   <p className="text-xs text-muted-foreground">Admins</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//           <Card className="border-border/60 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300">
//             <CardContent className="pt-4 pb-4">
//               <div className="flex items-center gap-3">
//                 <div className="p-2.5 rounded-xl bg-purple-100 ring-1 ring-purple-200/60">
//                   <Mail className="h-5 w-5 text-purple-600" />
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold text-foreground leading-tight">{users.filter(u => u.email_sent === 1).length}</p>
//                   <p className="text-xs text-muted-foreground">Email Sent</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//           <Card className="border-border/60 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-300">
//             <CardContent className="pt-4 pb-4">
//               <div className="flex items-center gap-3">
//                 <div className="p-2.5 rounded-xl bg-amber-100 ring-1 ring-amber-200/60">
//                   <RefreshIcon className="h-5 w-5 text-amber-600" />
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold text-foreground leading-tight">{users.filter(u => u.email_config === 1).length}</p>
//                   <p className="text-xs text-muted-foreground">Email Configured</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Filters */}
//         <Card className="mb-6 border-border/60 shadow-sm">
//           <CardContent className="pt-6">
//             <div className="flex flex-wrap gap-3">
//               <div className="relative flex-1 min-w-[200px]">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   placeholder="Search by user ID or email..."
//                   value={searchQuery}
//                   onChange={e => setSearchQuery(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>
//               <select
//                 value={roleFilter}
//                 onChange={e => setRoleFilter(e.target.value)}
//                 className="px-3 py-2 rounded-md border bg-background text-sm hover:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
//               >
//                 <option value="all">All Roles</option>
//                 {roles.map(role => (
//                   <option key={role} value={role}>
//                     {role.charAt(0).toUpperCase() + role.slice(1)}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Table */}
//         <Card className="border-border/60 shadow-sm">
//           <CardContent className="pt-6">
//             <div className="overflow-x-auto rounded-lg border border-border/60">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="border-b bg-muted/40">
//                     <th className="p-3 text-left font-semibold text-foreground text-xs uppercase tracking-wide">#</th>
//                     <th className="p-3 text-left font-semibold text-foreground text-xs uppercase tracking-wide">User ID</th>
//                     <th className="p-3 text-left font-semibold text-foreground text-xs uppercase tracking-wide">Email</th>
//                     <th className="p-3 text-left font-semibold text-foreground text-xs uppercase tracking-wide">Role</th>
//                     <th className="p-3 text-center font-semibold text-foreground text-xs uppercase tracking-wide">Email Sent</th>
//                     <th className="p-3 text-center font-semibold text-foreground text-xs uppercase tracking-wide">Email Config</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {loading ? (
//                     <tr>
//                       <td colSpan={6} className="text-center py-10">
//                         <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
//                         <p className="mt-3 text-muted-foreground text-sm">Loading users...</p>
//                       </td>
//                     </tr>
//                   ) : paginatedUsers.length === 0 ? (
//                     <tr>
//                       <td colSpan={6} className="text-center py-10">
//                         <div className="flex flex-col items-center gap-2">
//                           <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
//                             <Users className="h-5 w-5 text-muted-foreground" />
//                           </div>
//                           <p className="text-muted-foreground text-sm">No users found</p>
//                         </div>
//                       </td>
//                     </tr>
//                   ) : (
//                     paginatedUsers.map((user, index) => (
//                       <tr key={user.user_id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
//                         <td className="p-3 font-medium text-muted-foreground">
//                           {(currentPage - 1) * itemsPerPage + index + 1}
//                         </td>
//                         <td className="p-3">
//                           <div className="flex items-center gap-2">
//                             <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/15">
//                               <User className="h-3 w-3 text-primary" />
//                             </div>
//                             <span className="font-mono text-xs text-foreground">{user.id}</span>
//                           </div>
//                         </td>
//                         <td className="p-3">
//                           {/* Make email clickable */}
//                           <button
//                             onClick={() => handleEmailClick(user.id)}
//                             className="text-primary hover:underline hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1.5 group"
//                           >
//                             <Mail className="h-3.5 w-3.5" />
//                             {user.email}
//                             <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
//                               (view tracking)
//                             </span>
//                           </button>
//                         </td>
//                         <td className="p-3">{getRoleBadge(user.role)}</td>
//                         <td className="p-3 text-center">
//                           {getStatusBadge(user.email_sent, 'sent')}
//                         </td>
//                         <td className="p-3 text-center">
//                           {getStatusBadge(user.email_config, 'config')}
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination Component */}
//             {filteredUsers.length > 0 && (
//               <Pagination
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 totalItems={filteredUsers.length}
//                 itemsPerPage={itemsPerPage}
//                 onPageChange={handlePageChange}
//                 onItemsPerPageChange={handleItemsPerPageChange}
//                 itemsPerPageOptions={itemsPerPageOptions}
//               />
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default AdminUsers;




import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, RefreshCw, User, Mail, Shield, Users, 
  RefreshCw as RefreshIcon, Filter, ChevronDown,
  TrendingUp, Award, Zap, Sparkles, Eye,
  CheckCircle, XCircle, UserCheck, UserPlus
} from 'lucide-react';
import { AdminSidebar } from "@/components/AdminSidebar";
import { Pagination } from './Pagination';
import {API_URL} from "@/components/api"
import './AdminUsers.css';

interface User {
  user_id: number;
  id: string;
  email: string;
  role: string;
  email_sent: number;
  email_config: number;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [itemsPerPageOptions] = useState([5, 10, 20, 50, 100]);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const roles = [...new Set(users.map(user => user.role))].sort();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/users`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailClick = (userId: string) => {
    navigate(`/admin/tracking/${userId}`);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, itemsPerPage]);

  const getRoleBadge = (role: string) => {
    const config: Record<string, { bg: string; text: string; border: string; icon: JSX.Element }> = {
      'admin': { 
        bg: 'bg-gradient-to-r from-rose-50 to-rose-100',
        text: 'text-rose-700',
        border: 'border-rose-200',
        icon: <Shield className="h-3 w-3" />
      },
      'seller': { 
        bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: <UserCheck className="h-3 w-3" />
      },
      'user': { 
        bg: 'bg-gradient-to-r from-emerald-50 to-emerald-100',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: <User className="h-3 w-3" />
      },
    };
    const style = config[role] || { 
      bg: 'bg-gradient-to-r from-gray-50 to-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-200',
      icon: <User className="h-3 w-3" />
    };
    return (
      <Badge className={`${style.bg} ${style.text} ${style.border} border font-medium px-3 py-1.5 gap-1.5 rounded-full shadow-sm hover:shadow-md transition-all duration-200`}>
        {style.icon}
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: number, type: string) => {
    const isEnabled = status === 1;
    const label = type === 'sent' ? 'Email Sent' : 'Email Config';
    return (
      <Badge className={`${
        isEnabled 
          ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200' 
          : 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-500 border-slate-200'
      } border font-medium px-3 py-1.5 gap-1.5 rounded-full shadow-sm hover:shadow-md transition-all duration-200`}>
        {isEnabled ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
        {label}
      </Badge>
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const StatCard = ({ icon: Icon, label, value, gradient, trend }: any) => (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-default bg-white/90 backdrop-blur-sm">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
            </div>
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs font-semibold">{trend}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-6 space-y-6 content-space">
        {/* Modern Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  User Management
                </h1>
                <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                  Manage and monitor all registered users
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
           
            <Button 
              onClick={fetchUsers} 
              disabled={loading} 
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg shadow-blue-500/30"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Premium Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            icon={Users} 
            label="Total Users" 
            value={users.length} 
            gradient="from-blue-500 to-blue-600"
            trend="+12%"
          />
          <StatCard 
            icon={Shield} 
            label="Admins" 
            value={users.filter(u => u.role === 'admin').length} 
            gradient="from-rose-500 to-rose-600"
          />
          <StatCard 
            icon={Mail} 
            label="Email Sent" 
            value={users.filter(u => u.email_sent === 1).length} 
            gradient="from-purple-500 to-purple-600"
            trend="+8%"
          />
          <StatCard 
            icon={RefreshIcon} 
            label="Email Configured" 
            value={users.filter(u => u.email_config === 1).length} 
            gradient="from-amber-500 to-amber-600"
          />
        </div>

        {/* Modern Filters */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by user ID or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 bg-slate-50/50"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="pl-9 pr-8 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-sm hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  {roles.map(role => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              <Button variant="ghost" className="text-slate-600 hover:text-blue-600 hover:bg-blue-50/50">
                <Award className="h-4 w-4 mr-2" />
                Advanced
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Premium Table */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden">
          <CardContent className="pt-0 p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/60">
                    <th className="p-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">#</th>
                    <th className="p-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">User ID</th>
                    <th className="p-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Email</th>
                    <th className="p-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Role</th>
                    <th className="p-4 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider">Email Sent</th>
                    <th className="p-4 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider">Email Config</th>
                   
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16">
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-pulse"></div>
                          </div>
                          <p className="text-slate-500 text-sm font-medium">Loading users...</p>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <Users className="h-8 w-8 text-slate-400" />
                          </div>
                          <p className="text-slate-600 text-sm font-medium">No users found</p>
                          <p className="text-xs text-slate-400">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user, index) => {
                      const isHovered = hoveredRow === user.user_id;
                      return (
                        <tr 
                          key={user.user_id} 
                          className="border-b last:border-b-0 hover:bg-gradient-to-r hover:from-blue-50/40 hover:to-transparent transition-all duration-300 group"
                          onMouseEnter={() => setHoveredRow(user.user_id)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          <td className="p-4 font-medium text-slate-400 text-xs">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center ring-2 ring-white shadow-sm group-hover:ring-blue-300 transition-all duration-300">
                                  <User className="h-4 w-4 text-blue-600" />
                                </div>
                                {isHovered && (
                                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white animate-pulse"></div>
                                )}
                              </div>
                              <span className="font-mono text-xs text-slate-700 font-medium">{user.id}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleEmailClick(user.id)}
                              className="text-blue-600 hover:text-blue-800 transition-all duration-200 flex items-center gap-2 group/email"
                            >
                              <Mail className="h-3.5 w-3.5 group-hover/email:scale-110 transition-transform duration-200" />
                              <span className="hover:underline underline-offset-2 font-medium">{user.email}</span>
                              <span className="text-[10px] text-slate-400 opacity-0 group-hover/email:opacity-100 transition-all duration-200 ml-1">
                                →
                              </span>
                            </button>
                          </td>
                          <td className="p-4">{getRoleBadge(user.role)}</td>
                          <td className="p-4 text-center">{getStatusBadge(user.email_sent, 'sent')}</td>
                          <td className="p-4 text-center">{getStatusBadge(user.email_config, 'config')}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 rounded-full hover:bg-blue-50/50 transition-all duration-200"
                              >
                                <Eye className="h-4 w-4 text-slate-400 hover:text-blue-600" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 rounded-full hover:bg-blue-50/50 transition-all duration-200"
                              >
                                <Edit className="h-4 w-4 text-slate-400 hover:text-blue-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Premium Pagination */}
            {filteredUsers.length > 0 && (
              <div className="border-t border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-blue-50/30">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredUsers.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  itemsPerPageOptions={itemsPerPageOptions}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-2">
          <div className="flex items-center gap-4">
            <span>Showing {filteredUsers.length} users</span>
            <span className="w-px h-4 bg-slate-200"></span>
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-blue-400" />
            <span>Live Dashboard</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add this if you don't have Edit icon imported
const Edit = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export default AdminUsers;