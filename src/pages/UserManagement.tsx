
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/features/auth';
import { getUsers, updateUserRole } from '@/core/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Import refactored components
import UserManagementHeader from '@/components/admin/UserManagementHeader';
import UserSearch from '@/components/admin/UserSearch';
import UserManagementTable from '@/components/admin/UserManagementTable';
import EmptyUsersState from '@/components/admin/EmptyUsersState';
import AdminFooter from '@/components/admin/AdminFooter';

const UserManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/components');
    }
  }, [isAdmin, navigate]);

  // Fetch users
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: !!isAdmin,
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => 
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Função do usuário atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating user role:', error);
      toast.error('Erro ao atualizar função do usuário. Tente novamente.');
    },
  });

  // Handle role update
  const handleRoleUpdate = (userId: string, newRole: string) => {
    if (window.confirm(`Tem certeza que deseja alterar a função deste usuário para ${newRole}?`)) {
      updateRoleMutation.mutate({ userId, role: newRole });
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(filter.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(filter.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <UserManagementHeader onRefresh={refetch} />
        <UserSearch filter={filter} setFilter={setFilter} />
        
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Usuários ({filteredUsers.length})
            </h3>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredUsers.length > 0 ? (
              <UserManagementTable 
                users={filteredUsers} 
                onRoleUpdate={handleRoleUpdate}
                isUpdatingRole={updateRoleMutation.isPending}
              />
            ) : (
              <EmptyUsersState />
            )}
          </div>
        </div>
      </main>
      
      <AdminFooter />
    </div>
  );
};

export default UserManagement;
