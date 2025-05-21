
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
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const AdminUsers = () => {
  const { loading, fetchUsers, fetchUserRoles, setUserRole } = useAdmin();
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
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
    await setUserRole(userId, role);
    
    // Update local state
    setUserRoles(prev => ({
      ...prev,
      [userId]: role
    }));
    
    setUpdatingRole(null);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
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
                    <TableHead>Created</TableHead>
                    <TableHead>Role</TableHead>
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
                      <TableCell>{format(user.createdAt, 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          userRoles[user.id] === 'admin' 
                            ? 'bg-thryvance-green/10 text-thryvance-green' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {userRoles[user.id] || 'user'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              disabled={updatingRole === user.id}
                            >
                              {updatingRole === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : null}
                              Change Role
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Set User Role</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleSetRole(user.id, 'user')}
                              className={userRoles[user.id] === 'user' ? 'bg-gray-100' : ''}
                            >
                              User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSetRole(user.id, 'admin')}
                              className={userRoles[user.id] === 'admin' ? 'bg-gray-100' : ''}
                            >
                              Admin
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
