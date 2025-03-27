
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from '@/components/ui';
import { RefreshCw } from 'lucide-react';

// Import refactored components
import UserManagementHeader from '@/components/admin/UserManagementHeader';
import UserSearch from '@/components/admin/UserSearch';
import UserManagementTable from '@/components/admin/UserManagementTable';
import EmptyUsersState from '@/components/admin/EmptyUsersState';
import AdminFooter from '@/components/admin/AdminFooter';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  role: string;
}

// Function to fetch all users (admin only)
const fetchUsers = async (): Promise<UserData[]> => {
  // This requires a Supabase function with admin rights
  // For simplicity, we're using a mock approach here, but in production
  // this should be done through a Supabase edge function
  
  const { data, error } = await supabase.from('profiles').select('*');
  
  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
  
  return (data || []) as UserData[];
};

// Function to update user role
const updateUserRole = async ({ userId, role }: { userId: string; role: string }): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

const UserManagement = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users with react-query and handle errors directly in the query
  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: isAdmin,
    retry: 1
  });

  // Handle query errors with useEffect
  useEffect(() => {
    if (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários. Verifique se você tem permissões de administrador.');
    }
  }, [error]);

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: updateUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Função do usuário atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating user role:', error);
      toast.error('Erro ao atualizar função do usuário. Tente novamente.');
    }
  });

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle role change
  const handleRoleChange = (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    if (window.confirm(`Tem certeza que deseja alterar a função para ${newRole}?`)) {
      updateRoleMutation.mutate({ userId, role: newRole });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <UserManagementHeader onRefresh={refetch} />
        
        <div className="flex items-center justify-between mb-6">
          <UserSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          
          <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-2">
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredUsers.length > 0 ? (
              <UserManagementTable 
                users={filteredUsers} 
                onRoleChange={handleRoleChange} 
                isUpdating={updateRoleMutation.isPending}
              />
            ) : (
              <EmptyUsersState />
            )}
          </CardContent>
        </Card>
      </main>
      
      <AdminFooter />
    </div>
  );
};

export default UserManagement;
