
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/features/auth';
import { getComponents, deleteComponent, getCategories } from '@/core/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Import refactored components
import AdminHeader from '@/components/admin/AdminHeader';
import ComponentsSearch from '@/components/admin/ComponentsSearch';
import ComponentsCard from '@/components/admin/ComponentsCard';
import AdminFooter from '@/components/admin/AdminFooter';

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
        <AdminHeader onRefresh={refetch} />
        <ComponentsSearch filter={filter} setFilter={setFilter} />
        <ComponentsCard 
          components={filteredComponents} 
          categories={categories} 
          isLoading={isLoading} 
          onDelete={handleDelete} 
        />
      </main>
      
      <AdminFooter />
    </div>
  );
};

export default AdminPanel;
