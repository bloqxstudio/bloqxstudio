
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

interface UserData {
  id: string;
  email: string;
  created_at: string;
  role: string;
}

interface UserManagementTableProps {
  users: UserData[];
  onRoleChange: (userId: string, currentRole: string) => void;
  isUpdating: boolean;
}

const UserManagementTable = ({ users, onRoleChange, isUpdating }: UserManagementTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Função</TableHead>
            <TableHead>Data de Criação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
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
                {new Date(user.created_at).toLocaleDateString('pt-BR')}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRoleChange(user.id, user.role)}
                  disabled={isUpdating}
                >
                  <UserCog className="h-4 w-4 mr-1" />
                  {user.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
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
