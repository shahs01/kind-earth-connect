
import { useEffect, useState } from "react";
import { useAdmin, UserRole } from "@/hooks/useAdmin";
import { User } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield, Ban, CheckCircle, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface UserWithRole extends User {
  role?: string;
  account_status?: string;
}

const AdminUsers = () => {
  const { loading, fetchUsers, fetchUserRoles, setUserRole, updateUserStatus } = useAdmin();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  useEffect(() => {
    loadData();
  }, [page]);
  
  const loadData = async () => {
    const fetchedUsers = await fetchUsers(page, pageSize);
    setUsers(fetchedUsers);
    
    const roles = await fetchUserRoles();
    const roleMap: Record<string, string> = {};
    roles.forEach(role => {
      roleMap[role.user_id] = role.role;
    });
    setUserRoles(roleMap);
  };
  
  const handleSetRole = async (userId: string, role: 'user' | 'admin') => {
    setUpdatingRole(userId);
    const success = await setUserRole(userId, role);
    
    if (success) {
      setUserRoles(prev => ({
        ...prev,
        [userId]: role
      }));
    }
    
    setUpdatingRole(null);
  };

  const handleSetStatus = async (userId: string, status: 'active' | 'banned' | 'suspended') => {
    setUpdatingStatus(userId);
    const success = await updateUserStatus(userId, status);
    
    if (success) {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, account_status: status } : user
      ));
    }
    
    setUpdatingStatus(null);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'banned':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <Ban className="h-3 w-3" />
          Banned
        </Badge>;
      case 'suspended':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Suspended
        </Badge>;
      default:
        return <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Active
        </Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-600" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && users.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name?.charAt(0) || '?'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p>{user.name}</p>
                            <p className="text-xs text-gray-500">@{user.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.location || 'Not specified'}</TableCell>
                      <TableCell>{getStatusBadge(user.account_status)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          userRoles[user.id] === 'admin' 
                            ? 'default' 
                            : 'outline'
                        }>
                          {userRoles[user.id] || 'user'}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(user.createdAt, 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              disabled={updatingRole === user.id || updatingStatus === user.id}
                            >
                              {(updatingRole === user.id || updatingStatus === user.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : null}
                              Manage
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleSetRole(user.id, 'user')}
                              className={userRoles[user.id] === 'user' ? 'bg-gray-100' : ''}
                            >
                              Set as User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSetRole(user.id, 'admin')}
                              className={userRoles[user.id] === 'admin' ? 'bg-gray-100' : ''}
                            >
                              Set as Admin
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Account Status</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleSetStatus(user.id, 'active')}
                              className={user.account_status === 'active' ? 'bg-gray-100' : ''}
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              Activate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSetStatus(user.id, 'suspended')}
                              className={user.account_status === 'suspended' ? 'bg-gray-100' : ''}
                            >
                              <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                              Suspend
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSetStatus(user.id, 'banned')}
                              className={user.account_status === 'banned' ? 'bg-gray-100' : ''}
                            >
                              <Ban className="h-4 w-4 mr-2 text-red-600" />
                              Ban
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={users.length < pageSize || loading}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUsers;
