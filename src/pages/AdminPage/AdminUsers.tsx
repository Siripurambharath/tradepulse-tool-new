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


// interface User {
//   user_id: number;
//   id: string;
//   email: string;
//   role: string;
//   email_sent: number;
//   email_config: number;
// }

// const Adminusers = () => {
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
//     navigate(`/usersindetail/${userId}`);
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
//       'admin': 'bg-red-100 text-red-700',
//       'seller': 'bg-blue-100 text-blue-700',
//       'user': 'bg-green-100 text-green-700',
//     };
//     return (
//       <Badge className={`${colors[role] || 'bg-gray-100 text-gray-700'} hover:${colors[role] || 'bg-gray-100'}`}>
//         {role.charAt(0).toUpperCase() + role.slice(1)}
//       </Badge>
//     );
//   };

//   const getStatusBadge = (status: number, type: string) => {
//     const isEnabled = status === 1;
//     const label = type === 'sent' ? 'Email Sent' : 'Email Config';
//     return (
//       <Badge className={isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
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
//       <div className="flex-1 overflow-auto p-6">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
//               <Users className="h-6 w-6 text-primary" />
//               Users
//             </h1>
//             <p className="text-sm text-muted-foreground mt-1">
//               Manage and view all registered users
//             </p>
//           </div>
//           <Button onClick={fetchUsers} disabled={loading} variant="outline">
//             <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
//             Refresh
//           </Button>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//           <Card>
//             <CardContent className="pt-4">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 rounded-lg bg-blue-100">
//                   <Users className="h-5 w-5 text-blue-600" />
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold">{users.length}</p>
//                   <p className="text-xs text-muted-foreground">Total Users</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="pt-4">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 rounded-lg bg-green-100">
//                   <Shield className="h-5 w-5 text-green-600" />
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
//                   <p className="text-xs text-muted-foreground">Admins</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="pt-4">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 rounded-lg bg-purple-100">
//                   <Mail className="h-5 w-5 text-purple-600" />
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold">{users.filter(u => u.email_sent === 1).length}</p>
//                   <p className="text-xs text-muted-foreground">Email Sent</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="pt-4">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 rounded-lg bg-amber-100">
//                   <RefreshIcon className="h-5 w-5 text-amber-600" />
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold">{users.filter(u => u.email_config === 1).length}</p>
//                   <p className="text-xs text-muted-foreground">Email Configured</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Filters */}
//         <Card className="mb-6">
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
//                 className="px-3 py-2 rounded-md border bg-background text-sm"
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
//         <Card>
//           <CardContent className="pt-6">
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="border-b bg-muted/30">
//                     <th className="p-3 text-left font-medium text-foreground">#</th>
//                     <th className="p-3 text-left font-medium text-foreground">User ID</th>
//                     <th className="p-3 text-left font-medium text-foreground">Email</th>
//                     <th className="p-3 text-left font-medium text-foreground">Role</th>
//                     <th className="p-3 text-center font-medium text-foreground">Email Sent</th>
//                     <th className="p-3 text-center font-medium text-foreground">Email Config</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {loading ? (
//                     <tr>
//                       <td colSpan={6} className="text-center py-8">
//                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
//                         <p className="mt-2 text-muted-foreground">Loading users...</p>
//                       </td>
//                     </tr>
//                   ) : paginatedUsers.length === 0 ? (
//                     <tr>
//                       <td colSpan={6} className="text-center py-8 text-muted-foreground">
//                         No users found
//                       </td>
//                     </tr>
//                   ) : (
//                     paginatedUsers.map((user, index) => (
//                       <tr key={user.user_id} className="border-b hover:bg-muted/20 transition-colors">
//                         <td className="p-3 font-medium">
//                           {(currentPage - 1) * itemsPerPage + index + 1}
//                         </td>
//                         <td className="p-3">
//                           <div className="flex items-center gap-2">
//                             <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
//                               <User className="h-3 w-3 text-primary" />
//                             </div>
//                             <span className="font-mono text-xs">{user.id}</span>
//                           </div>
//                         </td>
//                         <td className="p-3">
//                           {/* Make email clickable */}
//                           <button
//                             onClick={() => handleEmailClick(user.id)}
//                             className="text-primary hover:underline hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1 group"
//                           >
//                             <Mail className="h-3.5 w-3.5" />
//                             {user.email}
//                             <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
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

// export default Adminusers;




import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import './AdminUsers.css';
import { 
  Search, 
  RefreshCw, 
  User, 
  Mail, 
  Shield, 
  Users, 
  RefreshCw as RefreshIcon,
  Loader2
} from 'lucide-react';
import { AdminSidebar } from "@/components/AdminSidebar";
import { Pagination } from './Pagination';
import { API_URL } from "@/components/api";

interface User {
  user_id: number;
  id: string;
  email: string;
  role: string;
  email_sent: number;
  email_config: number;
}

const Adminusers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [itemsPerPageOptions] = useState([5, 10, 20, 50, 100]);

  // Get unique roles for filter
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

  // Handle email click - navigate to tracking page with seller ID
  const handleEmailClick = (userId: string) => {
    navigate(`/usersindetail/${userId}`);
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, itemsPerPage]);

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      'admin': 'bg-red-100 text-red-700',
      'seller': 'bg-blue-100 text-blue-700',
      'user': 'bg-green-100 text-green-700',
    };
    return (
      <Badge className={`${colors[role] || 'bg-gray-100 text-gray-700'} hover:${colors[role] || 'bg-gray-100'}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: number, type: string) => {
    const isEnabled = status === 1;
    const label = type === 'sent' ? 'Email Sent' : 'Email Config';
    return (
      <Badge className={isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
        {isEnabled ? '✓' : '✗'} {label}
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

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-gray-900">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto pt-0">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto content-space">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-2">
                  <Users className="h-7 w-7 text-primary" />
                  Users
                </h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Manage and view all registered users
                </p>
              </div>
              <Button 
                onClick={fetchUsers} 
                disabled={loading} 
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/80 dark:border-slate-700/80">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{users.length}</p>
                      <p className="text-xs text-muted-foreground">Total Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/80 dark:border-slate-700/80">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
                      <p className="text-xs text-muted-foreground">Admins</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/80 dark:border-slate-700/80">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{users.filter(u => u.email_sent === 1).length}</p>
                      <p className="text-xs text-muted-foreground">Email Sent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/80 dark:border-slate-700/80">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                      <RefreshIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{users.filter(u => u.email_config === 1).length}</p>
                      <p className="text-xs text-muted-foreground">Email Configured</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/80 dark:border-slate-700/80">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by user ID or email..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-md border bg-background text-sm"
                >
                  <option value="all">All Roles</option>
                  {roles.map(role => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/80 dark:border-slate-700/80">
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="p-3 text-left font-medium text-foreground">#</th>
                      <th className="p-3 text-left font-medium text-foreground">User ID</th>
                      <th className="p-3 text-left font-medium text-foreground">Email</th>
                      <th className="p-3 text-left font-medium text-foreground">Role</th>
                      <th className="p-3 text-center font-medium text-foreground">Email Sent</th>
                      <th className="p-3 text-center font-medium text-foreground">Email Config</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Loading users...</p>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-muted-foreground">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((user, index) => (
                        <tr key={user.user_id} className="border-b hover:bg-muted/20 transition-colors">
                          <td className="p-3 font-medium">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-3 w-3 text-primary" />
                              </div>
                              <span className="font-mono text-xs">{user.id}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => handleEmailClick(user.id)}
                              className="text-primary hover:underline hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1 group"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              {user.email}
                              <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                (view tracking)
                              </span>
                            </button>
                          </td>
                          <td className="p-3">{getRoleBadge(user.role)}</td>
                          <td className="p-3 text-center">
                            {getStatusBadge(user.email_sent, 'sent')}
                          </td>
                          <td className="p-3 text-center">
                            {getStatusBadge(user.email_config, 'config')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Component */}
              {filteredUsers.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredUsers.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  itemsPerPageOptions={itemsPerPageOptions}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Adminusers;