import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, User, Mail, Shield, Users, RefreshCw as RefreshIcon } from 'lucide-react';
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

const Adminusers = () => {
  const navigate = useNavigate(); // Add navigate hook
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
    // Navigate to tracking page with the user ID
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
      'admin': 'bg-red-100 text-red-700 border border-red-200',
      'seller': 'bg-blue-100 text-blue-700 border border-blue-200',
      'user': 'bg-green-100 text-green-700 border border-green-200',
    };
    return (
      <Badge className={`${colors[role] || 'bg-gray-100 text-gray-700 border border-gray-200'} font-medium hover:${colors[role] || 'bg-gray-100'}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: number, type: string) => {
    const isEnabled = status === 1;
    const label = type === 'sent' ? 'Email Sent' : 'Email Config';
    return (
      <Badge className={isEnabled ? 'bg-green-100 text-green-700 border border-green-200 font-medium' : 'bg-gray-100 text-gray-500 border border-gray-200 font-medium'}>
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
    <div className="flex h-screen w-full">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-6 content-space">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Users
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and view all registered users
            </p>
          </div>
          <Button onClick={fetchUsers} disabled={loading} variant="outline" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-border/60 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-100 ring-1 ring-blue-200/60">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-tight">{users.length}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-100 ring-1 ring-red-200/60">
                  <Shield className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-tight">{users.filter(u => u.role === 'admin').length}</p>
                  <p className="text-xs text-muted-foreground">Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-100 ring-1 ring-purple-200/60">
                  <Mail className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-tight">{users.filter(u => u.email_sent === 1).length}</p>
                  <p className="text-xs text-muted-foreground">Email Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-300">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 ring-1 ring-amber-200/60">
                  <RefreshIcon className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-tight">{users.filter(u => u.email_config === 1).length}</p>
                  <p className="text-xs text-muted-foreground">Email Configured</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-border/60 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user ID or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-md border bg-background text-sm hover:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
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
        <Card className="border-border/60 shadow-sm">
          <CardContent className="pt-6">
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="p-3 text-left font-semibold text-foreground text-xs uppercase tracking-wide">#</th>
                    <th className="p-3 text-left font-semibold text-foreground text-xs uppercase tracking-wide">User ID</th>
                    <th className="p-3 text-left font-semibold text-foreground text-xs uppercase tracking-wide">Email</th>
                    <th className="p-3 text-left font-semibold text-foreground text-xs uppercase tracking-wide">Role</th>
                    <th className="p-3 text-center font-semibold text-foreground text-xs uppercase tracking-wide">Email Sent</th>
                    <th className="p-3 text-center font-semibold text-foreground text-xs uppercase tracking-wide">Email Config</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
                        <p className="mt-3 text-muted-foreground text-sm">Loading users...</p>
                      </td>
                    </tr>
                  ) : paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground text-sm">No users found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user, index) => (
                      <tr key={user.user_id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium text-muted-foreground">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/15">
                              <User className="h-3 w-3 text-primary" />
                            </div>
                            <span className="font-mono text-xs text-foreground">{user.id}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          {/* Make email clickable */}
                          <button
                            onClick={() => handleEmailClick(user.id)}
                            className="text-primary hover:underline hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1.5 group"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            {user.email}
                            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
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
  );
};

export default Adminusers;