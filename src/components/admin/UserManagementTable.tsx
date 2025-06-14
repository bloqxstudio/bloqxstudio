
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  Button
} from '@/components/ui';
import { UserCog } from 'lucide-react';
import UserRoleBadge from './UserRoleBadge';
import { User } from '@/core/types';

interface UserManagementTableProps {
  users: User[];
  onRoleUpdate: (userId: string, newRole: 'admin' | 'user') => void;
  isUpdatingRole: boolean;
}

const UserManagementTable = ({ users, onRoleUpdate, isUpdatingRole }: UserManagementTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell>
                <UserRoleBadge role={user.role} />
              </TableCell>
              <TableCell>
                {new Date(user.created_at).toLocaleDateString('en-US')}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRoleUpdate(user.id, user.role === 'admin' ? 'user' : 'admin')}
                  disabled={isUpdatingRole}
                >
                  <UserCog className="h-4 w-4 mr-1" />
                  {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserManagementTable;
