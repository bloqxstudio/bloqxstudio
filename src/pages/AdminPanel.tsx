
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { getComponents, deleteComponent, getCategories } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Component } from '@/lib/database.types';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge
} from '@/components/ui';
import { 
  PlusCircle, 
  Trash2, 
  Edit, 
  Filter, 
  EyeOff, 
  Eye, 
  RefreshCw,
  Users
} from 'lucide-react';

const AdminPanel = () => {
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

  // Fetch components
  const { data: components = [], isLoading, refetch } = useQuery({
    queryKey: ['components'],
    queryFn: getComponents,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  // Delete component mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteComponent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast.success('Componente excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting component:', error);
      toast.error('Erro ao excluir componente. Tente novamente.');
    },
  });

  // Handle delete component
  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este componente?')) {
      deleteMutation.mutate(id);
    }
  };

  // Filter components based on search term
  const filteredComponents = components.filter(component => 
    component.title.toLowerCase().includes(filter.toLowerCase()) ||
    component.description?.toLowerCase().includes(filter.toLowerCase()) ||
    component.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter">Painel de Administração</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie componentes, categorias e usuários.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button asChild className="hover-lift" size="sm">
              <Link to="/components/new">
                <PlusCircle className="h-4 w-4 mr-1" />
                Novo Componente
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/users">
                <Users className="h-4 w-4 mr-1" />
                Gerenciar Usuários
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative mb-8">
          <input
            type="search"
            placeholder="Buscar componentes por título, descrição ou categoria..."
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Componentes ({filteredComponents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredComponents.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Visibilidade</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComponents.map((component) => (
                      <TableRow key={component.id}>
                        <TableCell className="font-medium">{component.title}</TableCell>
                        <TableCell>
                          {categories.find(c => c.id === component.category)?.name || component.category}
                        </TableCell>
                        <TableCell>
                          {component.visibility === 'public' ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Eye className="h-3 w-3 mr-1" /> Público
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                              <EyeOff className="h-3 w-3 mr-1" /> Privado
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(component.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button asChild variant="ghost" size="sm">
                              <Link to={`/component/${component.id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Ver</span>
                              </Link>
                            </Button>
                            <Button asChild variant="ghost" size="sm">
                              <Link to={`/components/edit/${component.id}`}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Link>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(component.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Filter className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum componente encontrado</h3>
                <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                  Não encontramos componentes com os filtros aplicados. Tente outra busca ou crie um novo componente.
                </p>
                <Button asChild>
                  <Link to="/components/new">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Criar Componente
                  </Link>
                </Button>
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

export default AdminPanel;
