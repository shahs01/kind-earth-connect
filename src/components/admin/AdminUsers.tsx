
import { useEffect, useState, useMemo } from "react";
import { useAdminUsers, useAdminUserRoles, useSetUserRole, useUpdateUserStatus } from "@/hooks/useAdmin";
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
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const { data: users = [], isLoading: isLoadingUsers } = useAdminUsers(page, pageSize);
  const { data: roles = [], isLoading: isLoadingRoles } = useAdminUserRoles();
  const { mutate: setUserRole, isPending: isUpdatingRole } = useSetUserRole();
  const { mutate: updateUserStatus, isPending: isUpdatingStatus } = useUpdateUserStatus();
  
  const userRoles = useMemo(() => {
    const roleMap: Record<string, string> = {};
    roles.forEach(role => {
      roleMap[role.user_id] = role.role;
    });
    return roleMap;
  }, [roles]);

  const handleSetRole = (userId: string, role: 'user' | 'admin') => {
    setUserRole({ userId, role });
  };

  const handleSetStatus = (userId: string, status: 'active' | 'banned' | 'suspended') => {
    updateUserStatus({ userId, status });
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
  
  const loading = isLoadingUsers || isLoadingRoles;

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
                  {users.map((user: UserWithRole) => (
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
                      <TableCell>{format(new Date(user.createdAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              disabled={isUpdatingRole || isUpdatingStatus}
                            >
                              {(isUpdatingRole || isUpdatingStatus) && (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              )}
                              Manage
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleSetRole(user.id, 'user')}
                              disabled={userRoles[user.id] === 'user' || !userRoles[user.id]}
                            >
                              Set as User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSetRole(user.id, 'admin')}
                              disabled={userRoles[user.id] === 'admin'}
                            >
                              Set as Admin
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Account Status</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleSetStatus(user.id, 'active')}
                              disabled={!user.account_status || user.account_status === 'active'}
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              Activate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSetStatus(user.id, 'suspended')}
                              disabled={user.account_status === 'suspended'}
                            >
                              <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                              Suspend
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSetStatus(user.id, 'banned')}
                              disabled={user.account_status === 'banned'}
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
