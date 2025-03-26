
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input
} from '@/components/ui';
import { ArrowLeft, Search, Shield, User, UserCog, RefreshCw } from 'lucide-react';

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
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para o Painel
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold tracking-tighter">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Administre usuários e funções
          </p>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
          </div>
          
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
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          {user.role === 'admin' ? (
                            <div className="flex items-center">
                              <Shield className="h-4 w-4 text-primary mr-2" />
                              <span className="font-medium">Administrador</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-muted-foreground mr-2" />
                              <span>Usuário</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRoleChange(user.id, user.role)}
                            disabled={updateRoleMutation.isPending}
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
            ) : (
              <div className="text-center py-8">
                <Search className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum usuário encontrado</h3>
                <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                  Não encontramos usuários com o termo de busca aplicado. Tente outro termo.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Bloqx Studio. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default UserManagement;
